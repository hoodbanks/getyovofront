export const SUPER_ADMIN_VERIFY_EMAIL_KEY = 'getyovo.superadmin.verifyEmail';

export const rememberSuperAdminVerificationEmail = (email) => {
    const value = String(email ?? '').trim();
    if (!value) return;
    try {
        sessionStorage.setItem(SUPER_ADMIN_VERIFY_EMAIL_KEY, value);
    } catch {
        // The verification page can still accept a typed email.
    }
};

export const readSuperAdminVerificationEmail = () => {
    try {
        return sessionStorage.getItem(SUPER_ADMIN_VERIFY_EMAIL_KEY) || '';
    } catch {
        return '';
    }
};
