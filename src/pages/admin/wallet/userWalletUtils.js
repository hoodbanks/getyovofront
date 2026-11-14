export const USER_WALLET_PAGE_SIZE = 20;
export const USER_WALLET_EXPORT_LIMIT = 50;

export const userWalletTypeOptions = [
    { value: 'all', label: 'All types' },
    { value: 'credit', label: 'Credit' },
    { value: 'debit', label: 'Debit' },
    { value: 'refund', label: 'Refund' },
];

export const userWalletStatusOptions = [
    { value: 'all', label: 'All statuses' },
    { value: 'successful', label: 'Successful' },
    { value: 'pending', label: 'Pending' },
    { value: 'failed', label: 'Failed' },
    { value: 'abandoned', label: 'Not completed' },
    { value: 'expired', label: 'Expired' },
    { value: 'reconciliation_required', label: 'Reconciliation required' },
];

export const userWalletDateOptions = [
    { value: 'all_time', label: 'All time' },
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last_7_days', label: 'Last 7 days' },
    { value: 'last_30_days', label: 'Last 30 days' },
    { value: 'this_month', label: 'This month' },
    { value: 'last_month', label: 'Last month' },
    { value: 'custom', label: 'Custom range' },
];

export const buildUserWalletParams = ({ page = 1, limit = USER_WALLET_PAGE_SIZE, query, type = 'all', status = 'all', dateFilter = 'all_time', dates = {}, includeQuery = true } = {}) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit), type, status, dateFilter });
    const normalizedQuery = query?.trim();
    if (includeQuery && normalizedQuery) params.set('query', normalizedQuery);
    if (dateFilter === 'custom' && dates.start && dates.end) {
        params.set('from', dates.start);
        params.set('to', dates.end);
    }
    return params;
};

export const dateFilterForApi = (value) => value === 'all' ? 'all_time' : value;

export const formatNaira = (naira, kobo) => {
    const value = naira != null ? Number(naira) : Number(kobo || 0) / 100;
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 2 }).format(value);
};

export const transactionTypeLabel = (type) => ({ TOP_UP: 'Credit', ORDER_PAYMENT: 'Debit', REFUND: 'Refund' }[type] || type || '—');

export const transactionStatusLabel = (status) => ({ SUCCEEDED: 'Successful', SUCCESSFUL: 'Successful', PENDING: 'Pending', FAILED: 'Failed', ABANDONED: 'Not completed', EXPIRED: 'Expired', RECONCILIATION_REQUIRED: 'Reconciliation required' }[status] || status || '—');

export const canRefreshTopUpStatus = (transaction) => {
    const transactionId = transaction?.transactionId || '';
    const lifecycleStatus = String(transaction?.topUpStatus || '').toUpperCase();
    const reconciliationStatus = String(transaction?.reconciliationStatus || '').toUpperCase();
    return transactionId.startsWith('TOPUP:')
        && lifecycleStatus !== 'SUCCEEDED'
        && lifecycleStatus !== 'SUCCESSFUL'
        && lifecycleStatus !== 'RECONCILIATION_REQUIRED'
        && !['REVIEW_REQUIRED', 'RECONCILIATION_REQUIRED', 'HELD'].includes(reconciliationStatus);
};

export const signedNairaAmount = (transaction) => {
    const amount = transaction.amountNaira != null ? Number(transaction.amountNaira) : Number(transaction.amountKobo || 0) / 100;
    return `${amount < 0 ? '−' : '+'}${formatNaira(Math.abs(amount), Math.abs(Number(transaction.amountKobo || 0)))}`;
};
