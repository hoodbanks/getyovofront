import axios from 'axios';

import { useAuthStore } from '../store/useAuthStore';
import { API_BASE_URL } from '../config/apiConfig';
import { handleUnauthorizedAdminSession } from '../utils/handleUnauthorizedSession';
import { refreshSuperAdminAccessToken } from './superAdminTokenRefresh';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().accessToken;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        config._accessTokenUsed = token;
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            const config = error.config;
            const requestUrl = config?.url || '';
            const { superAdmin } = useAuthStore.getState();

            if (superAdmin && config && !config._adminRefreshRetry && !requestUrl.includes('/superadmin/auth/login') && !requestUrl.includes('/superadmin/auth/refresh')) {
                config._adminRefreshRetry = true;
                try {
                    const newAccessToken = await refreshSuperAdminAccessToken(config._accessTokenUsed);
                    config.headers = config.headers || {};
                    config.headers.Authorization = `Bearer ${newAccessToken}`;
                    return api.request(config);
                } catch (refreshError) {
                    return Promise.reject(refreshError);
                }
            }

            if (superAdmin && config?._adminRefreshRetry) {
                handleUnauthorizedAdminSession(requestUrl);
            } else if (!superAdmin) {
                handleUnauthorizedAdminSession(requestUrl);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
