export const validatePromotionTitle = (value) => {
    const length = value.trim().length;
    return length < 1 || length > 40 ? 'Title must be between 1 and 40 characters.' : '';
};

export const getPromotionError = (error, fallback = 'Could not load data.') => {
    if (error?.status === 401) return 'Your admin session has expired. Please sign in again.';
    if (error?.status === 404) return 'The requested data could not be found.';
    if (error?.status === 409) return error.message || 'This conflicts with an existing promotion or placement.';
    if (error?.status === 429) return 'Too many requests. Please try again shortly.';
    if (error?.status === 503) return 'This data is temporarily unavailable.';
    return error?.message || fallback;
};
