import { useAuthStore } from '../store/useAuthStore';
import { API_BASE_URL } from '../config/apiConfig';
import { handleDisabledAdminAccountSession, handleUnauthorizedAdminSession } from '../utils/handleUnauthorizedSession';
import { refreshSuperAdminAccessToken } from './superAdminTokenRefresh';

// ─── Refresh Token Logic ──────────────────────────────────────────────────────
// A single shared promise ensures that if multiple requests fail simultaneously
// due to an expired token, only ONE refresh call is fired. All callers
// then wait on the same promise and receive the new access token.
let refreshPromise = null;

const refreshRiderToken = async () => {
    if (refreshPromise) {
        return refreshPromise;
    }

    refreshPromise = (async () => {
        try {
            const { refreshToken, rider, setAuth, logout } = useAuthStore.getState();

            if (!refreshToken || !rider) {
                // Not a rider session — nothing to refresh
                throw new Error('No rider refresh token available');
            }

            const response = await fetch(`${API_BASE_URL}/rider/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ refreshToken }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                // Refresh failed — log the rider out
                logout();
                throw new Error(result?.message || 'Session expired. Please log in again.');
            }

            const newAccessToken = result.data?.accessToken;
            const newRefreshToken = result.data?.refreshToken || refreshToken;
            const updatedRider = result.data?.rider || rider;

            setAuth({
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
                rider: updatedRider,
            });

            return newAccessToken;
        } catch (err) {
            // Ensure logout happens on any unexpected error
            useAuthStore.getState().logout();
            throw err;
        } finally {
            // Always clear the lock so future refreshes can happen
            refreshPromise = null;
        }
    })();

    return refreshPromise;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const parseError = (result, status, response) => {
    let errorMessage = result.error?.message || result.message || 'Something went wrong';
    if (result.error?.details && Array.isArray(result.error.details) && result.error.details.length > 0) {
        errorMessage = result.error.details[0].message;
    }
    const error = new Error(errorMessage);
    error.status = status;
    error.statusCode = status;
    error.code = result.error?.code || result.code || null;
    error.responseReceived = true;
    const retryAfter = response?.headers?.get?.('Retry-After');
    const rateLimitReset = response?.headers?.get?.('RateLimit-Reset');
    if (retryAfter) error.retryAfter = retryAfter;
    if (rateLimitReset) error.rateLimitReset = rateLimitReset;
    return error;
};

const PUBLIC_SUPER_ADMIN_ENDPOINTS = new Set([
    '/superadmin/auth/login',
    '/superadmin/auth/verify-otp',
    '/superadmin/auth/resend-otp',
]);

const isPublicSuperAdminEndpoint = (endpoint) => PUBLIC_SUPER_ADMIN_ENDPOINTS.has(endpoint);

const isDisabledAdminResponse = (result) => {
    const code = result?.error?.code || result?.error?.errorCode || result?.code || '';
    if (/(ADMIN|ACCOUNT|SUPER.?ADMIN).*DISABLED|DISABLED.*(ADMIN|ACCOUNT|SUPER.?ADMIN)/i.test(String(code))) return true;
    const message = result?.error?.message || result?.message || '';
    return /\b(disabled|deactivated|inactive)\b/i.test(String(message)) && /\b(account|admin|super admin)\b/i.test(String(message));
};

const readJsonResponse = async (response) => {
    try {
        return await response.json();
    } catch {
        const error = new Error('The server returned an unreadable response.');
        error.status = response.status;
        error.statusCode = response.status;
        error.responseReceived = true;
        throw error;
    }
};

const sendFetch = async (...args) => {
    try {
        return await fetch(...args);
    } catch (error) {
        if (error && typeof error === 'object') error.transportError = true;
        throw error;
    }
};

// ─── Core Retry Wrapper ───────────────────────────────────────────────────────
// Refreshes expired Super Admin or rider access tokens and retries once.
const requestWithRetry = async (buildRequest, endpoint) => {
    // First attempt
    const firstAccessToken = useAuthStore.getState().accessToken;
    const { response: firstResponse, result: firstResult } = await buildRequest(firstAccessToken);

    if (firstResponse.ok) {
        return firstResult;
    }

    const authState = useAuthStore.getState();

    const isPublicSuperAdminRequest = isPublicSuperAdminEndpoint(endpoint);

    if (firstResponse.status === 403 && !isPublicSuperAdminRequest && authState.superAdmin && isDisabledAdminResponse(firstResult)) {
        handleDisabledAdminAccountSession();
        throw parseError(firstResult, firstResponse.status, firstResponse);
    }

    if (firstResponse.status === 401 && !isPublicSuperAdminRequest && authState.superAdmin && !endpoint.includes('/superadmin/auth/refresh')) {
        let newToken;
        try {
            newToken = await refreshSuperAdminAccessToken(firstAccessToken);
        } catch (error) {
            // Preserve the original HTTP response when auth refresh itself has a transport failure.
            if (error?.transportError) {
                error.status = firstResponse.status;
                error.statusCode = firstResponse.status;
            }
            throw error;
        }

        const { response: retryResponse, result: retryResult } = await buildRequest(newToken, true);
        if (retryResponse.ok) return retryResult;

        if (retryResponse.status === 403 && isDisabledAdminResponse(retryResult)) {
            handleDisabledAdminAccountSession();
            throw parseError(retryResult, retryResponse.status, retryResponse);
        }
        if (retryResponse.status === 401) handleUnauthorizedAdminSession(endpoint);
        throw parseError(retryResult, retryResponse.status, retryResponse);
    }

    // Refresh rider sessions independently when the rejected request belongs to a rider.
    if (firstResponse.status === 401 && !isPublicSuperAdminRequest && authState.rider) {
        const newToken = await refreshRiderToken();

        // Retry with the refreshed token
        const { response: retryResponse, result: retryResult } = await buildRequest(newToken, true);

        if (retryResponse.ok) {
            return retryResult;
        }

        throw parseError(retryResult, retryResponse.status, retryResponse);
    }

    throw parseError(firstResult, firstResponse.status, firstResponse);
};

// ─── API Methods ──────────────────────────────────────────────────────────────
const api = {
    post: async (endpoint, data, token, extraHeaders = {}) => {
        const buildRequest = async (activeToken, useActiveToken = false) => {
            const headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...extraHeaders,
            };
            // Prefer the explicitly-passed token, fall back to store token.
            // Login, email OTP verification, and verification resend are public.
            // A saved Super Admin session must not be attached to those calls.
            const authToken = isPublicSuperAdminEndpoint(endpoint) ? null : useActiveToken ? activeToken : token || activeToken;
            if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

            const response = await sendFetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers,
                body: JSON.stringify(data),
            });
            const result = await readJsonResponse(response);
            return { response, result };
        };

        return requestWithRetry(buildRequest, endpoint);
    },

    postForm: async (endpoint, formData, token, extraHeaders = {}) => {
        const buildRequest = async (activeToken, useActiveToken = false) => {
            const headers = {
                'Accept': 'application/json',
                ...extraHeaders,
            };
            const authToken = useActiveToken ? activeToken : token || activeToken;
            if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

            const response = await sendFetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers,
                body: formData,
            });
            const result = await readJsonResponse(response);
            return { response, result };
        };

        return requestWithRetry(buildRequest, endpoint);
    },

    get: async (endpoint, token, extraHeaders = {}) => {
        const buildRequest = async (activeToken, useActiveToken = false) => {
            const headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...extraHeaders,
            };
            const authToken = useActiveToken ? activeToken : token || activeToken;
            if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

            const superAdminGet = endpoint.startsWith('/superadmin/');
            const response = await sendFetch(`${API_BASE_URL}${endpoint}`, {
                method: 'GET',
                headers,
                // Staging has returned 304 with an empty body for authenticated
                // Super Admin reads, including the dashboard. The browser then
                // reused an older cached payload and the page treated that as
                // missing data. Always read a fresh JSON body.
                ...(superAdminGet ? { cache: 'no-store' } : {}),
            });
            const result = await readJsonResponse(response);
            return { response, result };
        };

        return requestWithRetry(buildRequest, endpoint);
    },

    patch: async (endpoint, data, token, extraHeaders = {}) => {
        const buildRequest = async (activeToken, useActiveToken = false) => {
            const headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...extraHeaders,
            };
            const authToken = useActiveToken ? activeToken : token || activeToken;
            if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

            const response = await sendFetch(`${API_BASE_URL}${endpoint}`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify(data),
            });
            const result = await readJsonResponse(response);
            return { response, result };
        };

        return requestWithRetry(buildRequest, endpoint);
    },

    delete: async (endpoint, data, token, extraHeaders = {}) => {
        const buildRequest = async (activeToken, useActiveToken = false) => {
            const headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...extraHeaders,
            };
            const authToken = useActiveToken ? activeToken : token || activeToken;
            if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

            const response = await sendFetch(`${API_BASE_URL}${endpoint}`, {
                method: 'DELETE',
                headers,
                body: data ? JSON.stringify(data) : undefined,
            });
            const result = await readJsonResponse(response);
            return { response, result };
        };

        return requestWithRetry(buildRequest, endpoint);
    },
};

export default api;
