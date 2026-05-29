import { useAuthStore } from '../store/useAuthStore';

const BASE_URL = 'https://api.getyovo.app/api/v1';

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

            const response = await fetch(`${BASE_URL}/rider/auth/refresh`, {
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
const parseError = (result, status) => {
    let errorMessage = result.error?.message || result.message || 'Something went wrong';
    if (result.error?.details && Array.isArray(result.error.details) && result.error.details.length > 0) {
        errorMessage = result.error.details[0].message;
    }
    const error = new Error(errorMessage);
    error.status = status;
    error.statusCode = status;
    return error;
};

// ─── Core Retry Wrapper ───────────────────────────────────────────────────────
// Executes a fetch call. If it returns 401 AND a rider refresh token exists,
// it attempts a token refresh and retries the request exactly once.
const requestWithRetry = async (buildRequest) => {
    // First attempt
    const { response: firstResponse, result: firstResult } = await buildRequest(
        useAuthStore.getState().accessToken
    );

    if (firstResponse.ok) {
        return firstResult;
    }

    // Only auto-refresh on 401 and only when a rider session exists
    if (firstResponse.status === 401 && useAuthStore.getState().rider) {
        try {
            const newToken = await refreshRiderToken();

            // Retry with the refreshed token
            const { response: retryResponse, result: retryResult } = await buildRequest(newToken);

            if (retryResponse.ok) {
                return retryResult;
            }

            throw parseError(retryResult, retryResponse.status);
        } catch (refreshError) {
            // If refresh itself failed, surface that error
            throw refreshError;
        }
    }

    throw parseError(firstResult, firstResponse.status);
};

// ─── API Methods ──────────────────────────────────────────────────────────────
const api = {
    post: async (endpoint, data, token, extraHeaders = {}) => {
        const buildRequest = async (activeToken) => {
            const headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...extraHeaders,
            };
            // Prefer the explicitly-passed token, fall back to store token
            const authToken = token || activeToken;
            if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

            const response = await fetch(`${BASE_URL}${endpoint}`, {
                method: 'POST',
                headers,
                body: JSON.stringify(data),
            });
            const result = await response.json();
            return { response, result };
        };

        return requestWithRetry(buildRequest);
    },

    postForm: async (endpoint, formData, token, extraHeaders = {}) => {
        const buildRequest = async (activeToken) => {
            const headers = {
                'Accept': 'application/json',
                ...extraHeaders,
            };
            const authToken = token || activeToken;
            if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

            const response = await fetch(`${BASE_URL}${endpoint}`, {
                method: 'POST',
                headers,
                body: formData,
            });
            const result = await response.json();
            return { response, result };
        };

        return requestWithRetry(buildRequest);
    },

    get: async (endpoint, token, extraHeaders = {}) => {
        const buildRequest = async (activeToken) => {
            const headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...extraHeaders,
            };
            const authToken = token || activeToken;
            if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

            const response = await fetch(`${BASE_URL}${endpoint}`, {
                method: 'GET',
                headers,
            });
            const result = await response.json();
            return { response, result };
        };

        return requestWithRetry(buildRequest);
    },

    patch: async (endpoint, data, token, extraHeaders = {}) => {
        const buildRequest = async (activeToken) => {
            const headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...extraHeaders,
            };
            const authToken = token || activeToken;
            if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

            const response = await fetch(`${BASE_URL}${endpoint}`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify(data),
            });
            const result = await response.json();
            return { response, result };
        };

        return requestWithRetry(buildRequest);
    },

    delete: async (endpoint, data, token, extraHeaders = {}) => {
        const buildRequest = async (activeToken) => {
            const headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...extraHeaders,
            };
            const authToken = token || activeToken;
            if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

            const response = await fetch(`${BASE_URL}${endpoint}`, {
                method: 'DELETE',
                headers,
                body: data ? JSON.stringify(data) : undefined,
            });
            const result = await response.json();
            return { response, result };
        };

        return requestWithRetry(buildRequest);
    },
};

export default api;
