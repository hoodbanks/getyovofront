import { API_BASE_URL } from '../config/apiConfig';
import { useAuthStore } from '../store/useAuthStore';
import { handleUnauthorizedAdminSession } from '../utils/handleUnauthorizedSession';

let refreshPromise = null;

const makeRefreshError = (result, status) => {
    const message = result?.error?.message || result?.message || 'Could not refresh the admin session.';
    const error = new Error(message);
    error.status = status;
    error.statusCode = status;
    return error;
};

export const refreshSuperAdminAccessToken = async (rejectedAccessToken) => {
    const authState = useAuthStore.getState();

    // Another request may already have refreshed the token while this 401 was in flight.
    if (rejectedAccessToken && authState.accessToken && authState.accessToken !== rejectedAccessToken) {
        return authState.accessToken;
    }

    if (refreshPromise) return refreshPromise;

    refreshPromise = (async () => {
        const { refreshToken, superAdmin, logout } = useAuthStore.getState();
        if (!refreshToken || !superAdmin) {
            const handled = handleUnauthorizedAdminSession('/superadmin/auth/refresh');
            if (!handled) logout();
            throw makeRefreshError({ message: 'Your admin session has expired. Please sign in again.' }, 401);
        }

        let response;
        try {
            response = await fetch(`${API_BASE_URL}/superadmin/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({ refreshToken }),
            });
        } catch (error) {
            if (error && typeof error === 'object') error.transportError = true;
            throw error;
        }
        const result = await response.json().catch(() => ({}));

        if (response.status === 401) {
            handleUnauthorizedAdminSession('/superadmin/auth/refresh');
            throw makeRefreshError(result, response.status);
        }

        if (!response.ok || !result?.success) {
            throw makeRefreshError(result, response.status);
        }

        const newAccessToken = result.data?.accessToken;
        if (!newAccessToken) {
            const handled = handleUnauthorizedAdminSession('/superadmin/auth/refresh');
            if (!handled) logout();
            throw makeRefreshError({ message: 'The server returned an invalid session. Please sign in again.' }, 401);
        }

        // The backend does not rotate refresh tokens; preserve the existing session and refresh token.
        useAuthStore.getState().setAccessToken(newAccessToken);
        return newAccessToken;
    })();

    try {
        return await refreshPromise;
    } finally {
        refreshPromise = null;
    }
};
