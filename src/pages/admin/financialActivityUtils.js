/**
 * Super Admin Financial Activity contract.
 * Source: BACKEND/docs/api/SUPERADMIN_FINANCIAL_ACTIVITY.md and the OpenAPI schemas.
 * Amounts are integer kobo. NGN = kobo / 100.
 *
 * @typedef {'ORDER_PAYMENT' | 'CUSTOMER_WALLET' | 'VENDOR_WALLET' | 'REFERRAL'} FinancialActivityDomain
 * @typedef {'ORDER_PAID' | 'CUSTOMER_TOP_UP' | 'CUSTOMER_ORDER_DEBIT' | 'CUSTOMER_REFUND' | 'CUSTOMER_TOP_UP_ATTEMPT' | 'CUSTOMER_TOP_UP_RECONCILIATION' | 'VENDOR_ORDER_CREDIT' | 'VENDOR_EARNINGS_REVERSAL' | 'VENDOR_WITHDRAWAL' | 'REFERRAL_REWARD' | 'REFERRAL_WITHDRAWAL'} FinancialActivityEventType
 * @typedef {'IN' | 'OUT' | 'NONE'} FinancialActivityDirection
 * @typedef {'PAYSTACK' | 'WALLET' | 'PAY_FOR_ME' | null} PaymentMethodCode
 *
 * @typedef {Object} FinancialActivityRow
 * @property {string} activityId
 * @property {string} source
 * @property {string} sourceId
 * @property {FinancialActivityDomain} domain
 * @property {FinancialActivityEventType} eventType
 * @property {string} status
 * @property {boolean} isBalanceMovement
 * @property {'NGN'} currency
 * @property {number} amountKobo
 * @property {number | null} deltaKobo
 * @property {FinancialActivityDirection} direction
 * @property {string} occurredAt
 * @property {string | null} relatedReference
 * @property {string | null} orderId
 * @property {string | null} orderCode
 * @property {PaymentMethodCode} paymentMethodCode
 * @property {string | null} userId
 * @property {string | null} vendorId
 * @property {string | null} actorLabel
 *
 * @typedef {Object} FinancialActivityListData
 * @property {FinancialActivityRow[]} data
 * @property {number} total
 * @property {number} page
 * @property {number} pageSize
 * @property {{ isAccountingLedger: false, referralWalletLedger: 'absent', notes: string[] }} limitations
 *
 * @typedef {Object} FinancialActivitySummary
 * @property {'NGN'} currency
 * @property {string} dateFilter
 * @property {string | null} from
 * @property {string | null} to
 * @property {number} paidOrderVolumeKobo
 * @property {number} paidOrderCount
 * @property {number} customerTopUpsSucceededKobo
 * @property {number} customerTopUpsSucceededCount
 * @property {number} vendorWithdrawalsCompletedKobo
 * @property {number} vendorWithdrawalsCompletedCount
 * @property {number} referralWithdrawalsCompletedKobo
 * @property {number} referralWithdrawalsCompletedCount
 * @property {Record<string, string>} definitions
 */

export const FINANCIAL_ACTIVITY_PAGE_SIZE = 20;
export const FINANCIAL_ACTIVITY_MAX_LIMIT = 50;

export const FINANCIAL_ACTIVITY_DOMAINS = ['ALL', 'ORDER_PAYMENT', 'CUSTOMER_WALLET', 'VENDOR_WALLET', 'REFERRAL'];

export const FINANCIAL_ACTIVITY_EVENT_TYPES = [
    'ALL',
    'ORDER_PAID',
    'CUSTOMER_TOP_UP',
    'CUSTOMER_ORDER_DEBIT',
    'CUSTOMER_REFUND',
    'CUSTOMER_TOP_UP_ATTEMPT',
    'CUSTOMER_TOP_UP_RECONCILIATION',
    'VENDOR_ORDER_CREDIT',
    'VENDOR_EARNINGS_REVERSAL',
    'VENDOR_WITHDRAWAL',
    'REFERRAL_REWARD',
    'REFERRAL_WITHDRAWAL',
];

export const FINANCIAL_ACTIVITY_STATUSES = [
    'ALL',
    'SUCCESSFUL',
    'PENDING',
    'PROCESSING',
    'FAILED',
    'DECLINED',
    'EXPIRED',
    'RECONCILIATION_REQUIRED',
    'REVIEW_REQUIRED',
    'REFUNDED',
    'CREDITED',
    'COMPLETED',
];

export const FINANCIAL_ACTIVITY_DATE_FILTERS = [
    'all_time',
    'today',
    'yesterday',
    'last_7_days',
    'last_30_days',
    'this_month',
    'last_month',
    'custom',
];

const domainLabels = {
    ALL: 'All domains',
    ORDER_PAYMENT: 'Order payment',
    CUSTOMER_WALLET: 'Customer wallet',
    VENDOR_WALLET: 'Vendor wallet',
    REFERRAL: 'Referral',
};

const eventLabels = {
    ALL: 'All events',
    ORDER_PAID: 'Paid order',
    CUSTOMER_TOP_UP: 'Customer top-up',
    CUSTOMER_ORDER_DEBIT: 'Customer order debit',
    CUSTOMER_REFUND: 'Customer refund',
    CUSTOMER_TOP_UP_ATTEMPT: 'Top-up attempt',
    CUSTOMER_TOP_UP_RECONCILIATION: 'Top-up reconciliation',
    VENDOR_ORDER_CREDIT: 'Vendor order credit',
    VENDOR_EARNINGS_REVERSAL: 'Vendor earnings reversal',
    VENDOR_WITHDRAWAL: 'Vendor withdrawal',
    REFERRAL_REWARD: 'Referral reward',
    REFERRAL_WITHDRAWAL: 'Referral withdrawal',
};

const statusLabels = {
    ALL: 'All statuses',
    SUCCESSFUL: 'Successful',
    PENDING: 'Pending',
    PROCESSING: 'Processing',
    FAILED: 'Failed',
    DECLINED: 'Declined',
    EXPIRED: 'Expired',
    RECONCILIATION_REQUIRED: 'Reconciliation required',
    REVIEW_REQUIRED: 'Review required',
    REFUNDED: 'Refunded',
    CREDITED: 'Credited',
    COMPLETED: 'Completed',
};

const dateLabels = {
    all_time: 'All time',
    today: 'Today',
    yesterday: 'Yesterday',
    last_7_days: 'Last 7 days',
    last_30_days: 'Last 30 days',
    this_month: 'This month',
    last_month: 'Last month',
    custom: 'Custom range',
};

export const financialActivityDomainOptions = FINANCIAL_ACTIVITY_DOMAINS.map((value) => ({ value, label: domainLabels[value] }));
export const financialActivityEventOptions = FINANCIAL_ACTIVITY_EVENT_TYPES.map((value) => ({ value, label: eventLabels[value] }));
export const financialActivityStatusOptions = FINANCIAL_ACTIVITY_STATUSES.map((value) => ({ value, label: statusLabels[value] }));
export const financialActivityDateOptions = FINANCIAL_ACTIVITY_DATE_FILTERS.map((value) => ({ value, label: dateLabels[value] }));

export const SUMMARY_METRICS = [
    {
        id: 'paid-orders',
        koboKey: 'paidOrderVolumeKobo',
        countKey: 'paidOrderCount',
        label: 'Paid order volume',
        detail: 'PAID orders with paidAt in the selected window, including orders with no vendor and currently cancelled paid orders. This is gross paid volume, not a Customer Wallet refund and not net revenue.',
    },
    {
        id: 'customer-topups',
        koboKey: 'customerTopUpsSucceededKobo',
        countKey: 'customerTopUpsSucceededCount',
        label: 'Customer top-ups succeeded',
        detail: 'Customer wallet credits whose idempotency key starts with wallet-topup:, by ledger createdAt.',
    },
    {
        id: 'vendor-withdrawals',
        koboKey: 'vendorWithdrawalsCompletedKobo',
        countKey: 'vendorWithdrawalsCompletedCount',
        label: 'Vendor withdrawals completed',
        detail: 'Withdrawals still completed whose earliest COMPLETED status event is in the selected window. Completion means an admin recorded a manual bank transfer.',
    },
    {
        id: 'referral-withdrawals',
        koboKey: 'referralWithdrawalsCompletedKobo',
        countKey: 'referralWithdrawalsCompletedCount',
        label: 'Referral withdrawals completed',
        detail: 'Referral withdrawals whose earliest COMPLETED status event is in the selected window. Completion means an admin recorded a manual bank transfer.',
    },
];

const finiteNumber = (value) => typeof value === 'number' && Number.isFinite(value);

export const domainLabel = (value) => domainLabels[value] || value || '—';
export const eventTypeLabel = (value) => eventLabels[value] || value || '—';
export const statusLabel = (value) => statusLabels[value] || value || '—';
export const activityStatusTone = (value) => {
    if (['SUCCESSFUL', 'COMPLETED', 'CREDITED'].includes(value)) return 'bg-emerald-50 text-emerald-700';
    if (['PENDING', 'PROCESSING', 'REVIEW_REQUIRED', 'RECONCILIATION_REQUIRED'].includes(value)) return 'bg-amber-50 text-amber-700';
    if (['FAILED', 'DECLINED', 'EXPIRED'].includes(value)) return 'bg-rose-50 text-rose-700';
    if (value === 'REFUNDED') return 'bg-violet-50 text-violet-700';
    return 'bg-zinc-100 text-zinc-700';
};

export const formatKobo = (kobo) => {
    if (!finiteNumber(kobo)) return null;
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 2 }).format(kobo / 100);
};

export const displayText = (value) => value == null || value === '' ? '—' : String(value);

/**
 * Balance rows use deltaKobo and direction. Other rows use amountKobo as the source amount.
 * A missing amount stays blank rather than becoming zero.
 */
export const formatActivityAmount = (row) => {
    if (!row) return { text: '—', caption: null };
    if (row.isBalanceMovement) {
        if (!finiteNumber(row.deltaKobo)) return { text: '—', caption: 'Balance movement' };
        const formatted = formatKobo(Math.abs(row.deltaKobo));
        const outgoing = row.direction === 'OUT' || row.deltaKobo < 0;
        const incoming = row.direction === 'IN' || row.deltaKobo > 0;
        return {
            text: outgoing ? `−${formatted}` : incoming ? `+${formatted}` : formatted,
            caption: 'Balance movement',
        };
    }
    if (!finiteNumber(row.amountKobo)) {
        return { text: '—', caption: row.eventType === 'ORDER_PAID' ? 'Paid order total' : 'Source amount' };
    }
    const method = row.paymentMethodCode ? ` · ${row.paymentMethodCode}` : '';
    return {
        text: formatKobo(Math.abs(row.amountKobo)),
        caption: row.eventType === 'ORDER_PAID' ? `Paid order total${method}` : `Source amount${method}`,
    };
};

export const activityAmountTone = (row) => {
    if (!row?.isBalanceMovement) return 'text-zinc-900';
    const outgoing = row.direction === 'OUT' || (finiteNumber(row.deltaKobo) && row.deltaKobo < 0);
    const incoming = row.direction === 'IN' || (finiteNumber(row.deltaKobo) && row.deltaKobo > 0);
    if (outgoing) return 'text-rose-700';
    if (incoming) return 'text-emerald-700';
    return 'text-zinc-900';
};

export const readSummaryMetric = (summary, metric) => {
    if (!summary || typeof summary !== 'object') return { amountKobo: null, count: null };
    const amountKobo = summary[metric.koboKey];
    const count = summary[metric.countKey];
    return {
        amountKobo: finiteNumber(amountKobo) ? amountKobo : null,
        count: finiteNumber(count) ? count : null,
    };
};

const appendDateRange = (params, dateFilter, from, to) => {
    if (dateFilter === 'custom' && from && to) {
        params.set('from', from);
        params.set('to', to);
    }
};

export const buildFinancialActivityParams = ({
    page = 1,
    limit = FINANCIAL_ACTIVITY_PAGE_SIZE,
    query,
    domain = 'ALL',
    eventType = 'ALL',
    status = 'ALL',
    dateFilter = 'all_time',
    from,
    to,
} = {}) => {
    const params = new URLSearchParams({
        page: String(page),
        limit: String(Math.min(Math.max(limit, 1), FINANCIAL_ACTIVITY_MAX_LIMIT)),
        domain,
        eventType,
        status,
        dateFilter,
    });
    const normalizedQuery = query?.trim();
    if (normalizedQuery) params.set('query', normalizedQuery);
    appendDateRange(params, dateFilter, from, to);
    return params;
};

export const buildFinancialActivitySummaryParams = ({ dateFilter = 'all_time', from, to } = {}) => {
    const params = new URLSearchParams({ dateFilter });
    appendDateRange(params, dateFilter, from, to);
    return params;
};

export const isFinancialActivityList = (payload) => Boolean(
    payload
    && Array.isArray(payload.data)
    && finiteNumber(payload.total)
    && finiteNumber(payload.page)
    && finiteNumber(payload.pageSize),
);
