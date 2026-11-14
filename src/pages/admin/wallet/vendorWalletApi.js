export const VENDOR_WALLET_PAGE_SIZE = 20;
export const VENDOR_WALLET_PAGE_LIMIT = 50;

export const vendorDateFilters = [
    { value: 'all_time', label: 'All time' },
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last_7_days', label: 'Last 7 days' },
    { value: 'last_30_days', label: 'Last 30 days' },
    { value: 'this_month', label: 'This month' },
    { value: 'last_month', label: 'Last month' },
    { value: 'custom', label: 'Custom range' },
];

export const vendorWalletQuery = ({ page = 1, limit = VENDOR_WALLET_PAGE_SIZE, query, type = 'all', status = 'all', dateFilter = 'all_time', from, to, vendorId }) => {
    const params = new URLSearchParams({ page: String(page), limit: String(Math.min(limit, VENDOR_WALLET_PAGE_LIMIT)), type, status, dateFilter });
    if (query?.trim()) params.set('query', query.trim());
    if (vendorId) params.set('vendorId', vendorId);
    if (dateFilter === 'custom' && from && to) {
        params.set('from', from);
        params.set('to', to);
    }
    return params.toString();
};

export const formatVendorNaira = (kobo, naira) => {
    const amount = Number.isFinite(naira) ? naira : Number.isFinite(kobo) ? kobo / 100 : null;
    return amount === null ? '—' : `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const idempotencyKey = () => globalThis.crypto?.randomUUID?.() || `vendor-${Date.now()}-${Math.random().toString(16).slice(2, 14)}`;

export const apiMessage = (error, fallback) => {
    const message = error?.message;
    const safeMessage = typeof message === 'string' && !/\d{8,}/.test(message) && !/\b(bank|account holder|account number)\b/i.test(message) ? message : null;
    if (error?.status === 401) return 'Your Super Admin session expired. Sign in again to continue.';
    if (error?.status === 403) return 'Your Super Admin account does not have permission to perform this action.';
    if (error?.status === 404) return 'The requested vendor or withdrawal could not be found.';
    if (error?.status === 409) return safeMessage || 'This request conflicts with the latest withdrawal status. Refresh and try again.';
    if (error?.status === 429) return 'Too many requests. Wait a moment and retry.';
    return safeMessage || fallback;
};
