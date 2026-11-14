export const SUPER_ADMIN_SEARCH_MAX = 100;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const normalizeSuperAdminPhone = (value) => String(value ?? '').replace(/[\s-]/g, '');

export const superAdminCreateError = (form) => {
    const firstname = form.firstname.trim();
    const lastname = form.lastname.trim();
    const username = form.username.trim();
    const email = form.email.trim();
    const phone = normalizeSuperAdminPhone(form.phonenumber);

    if (firstname.length < 2) return 'First name must be at least 2 characters.';
    if (lastname.length < 2) return 'Last name must be at least 2 characters.';
    if (!/^(?:0\d{10}|\+234\d{10}|234\d{10})$/.test(phone)) {
        return 'Phone number must start with 0, 234, or +234 and contain 10 digits after the prefix.';
    }
    if (username.length < 2 || username.length > 30) return 'Username must be 2 to 30 characters.';
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return 'Username can only contain letters, numbers, and underscores.';
    if (!EMAIL_PATTERN.test(email)) return 'Enter a valid email address.';
    if (email.length > 255) return 'Email must be at most 255 characters.';
    if (form.password.length < 8) return 'Password must have at least 8 characters.';
    if (!/[A-Z]/.test(form.password)) return 'Password must contain at least one uppercase letter.';
    if (!/[a-z]/.test(form.password)) return 'Password must contain at least one lowercase letter.';
    if (!/[0-9]/.test(form.password)) return 'Password must contain at least one number.';
    if (!/[^A-Za-z0-9]/.test(form.password)) return 'Password must contain at least one special character.';
    if (form.password !== form.passwordConfirmation) return 'Password and password confirmation must match.';
    return '';
};
