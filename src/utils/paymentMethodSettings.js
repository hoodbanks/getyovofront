export const PAYMENT_METHOD_CODES = new Set(['PAYSTACK', 'WALLET', 'PAY_FOR_ME']);

export const validatePaymentMethod = (method) => {
    const errors = {};
    const name = method.displayName.trim();
    const order = method.sortOrder === '' ? NaN : Number(method.sortOrder);

    if (typeof method.enabled !== 'boolean') errors.enabled = 'Choose whether this method is enabled.';
    if (name.length < 2 || name.length > 40) errors.displayName = 'Name must be between 2 and 40 characters.';
    if (method.description.length > 200) errors.description = 'Description must be 200 characters or fewer.';
    if (!Number.isInteger(order) || order < 0 || order > 100) errors.sortOrder = 'Sort order must be a whole number from 0 to 100.';

    return errors;
};

export const getPaymentMethodErrorMessage = (error) => {
    if (error?.status === 401) return 'Your admin session is no longer valid. Please sign in again.';
    if (error?.status === 400) return error.message || 'The payment method details were rejected. Check the fields and try again.';
    if (error?.status === 503) return 'Payment method settings are temporarily unavailable. Please try again shortly.';
    return error?.message || 'Something went wrong while saving payment method settings.';
};
