import { useAuthStore } from '../store/useAuthStore';

let adminRedirectStarted = false;

export const handleUnauthorizedAdminSession = (requestUrl = '') => {
    if (requestUrl.includes('/superadmin/auth/login')) return false;

    const { superAdmin, logout } = useAuthStore.getState();
    if (!superAdmin) return false;

    logout();

    if (typeof window !== 'undefined' && !adminRedirectStarted) {
        adminRedirectStarted = true;
        window.location.replace('/admin/login');
    }

    return true;
};

export const handleDisabledAdminAccountSession = () => {
    const { superAdmin, logout } = useAuthStore.getState();
    if (!superAdmin) return false;

    logout();
    if (typeof window !== 'undefined' && !adminRedirectStarted) {
        adminRedirectStarted = true;
        window.location.replace('/admin/login?reason=disabled');
    }
    return true;
};
