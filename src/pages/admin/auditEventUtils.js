export const AUDIT_PAGE_SIZE = 20;
export const AUDIT_QUERY_MAX = 100;

export const AUDIT_ACTIONS = [
    'announcement.created',
    'announcement.updated',
    'announcement.published',
    'announcement.deactivated',
    'superadmin.account.created',
    'superadmin.account.enabled',
    'superadmin.account.disabled',
    'superadmin.account.password_changed',
    'superadmin.account.password_reset_completed',
    'vendor.created',
    'vendor.suspended',
    'vendor.unsuspended',
    'vendor.verified',
    'vendor.unverified',
    'vendor.deleted',
    'vendor.payout_profile.revealed',
    'customer.suspended',
    'customer.unsuspended',
    'customer.deleted',
    'rider.created',
    'rider.suspended',
    'rider.unsuspended',
    'rider.deleted',
    'vendor_withdrawal.status_changed',
    'vendor_withdrawal.payout_account.revealed',
    'referral_withdrawal.status_changed',
    'referral_withdrawal.payout_account.revealed',
    'late_payment.resolved',
    'wallet_topup_reconciliation.resolved',
    'payment_method.updated',
    'referral_program.updated',
    'app_setting.updated',
    'promotion.created',
    'promotion.updated',
    'promotion.status_changed',
    'promotion.deleted',
    'promotion_placement.changed',
];

export const AUDIT_TARGET_TYPES = [
    'superadmin',
    'vendor',
    'user',
    'rider',
    'vendor_withdrawal',
    'referral_withdrawal',
    'late_payment_case',
    'wallet_topup_reconciliation',
    'payment_method',
    'referral_program',
    'app_setting',
    'promotion',
    'promotion_placement',
    'announcement',
];

const ACTION_LABELS = {
    'announcement.created': 'Announcement created',
    'announcement.updated': 'Announcement updated',
    'announcement.published': 'Announcement published',
    'announcement.deactivated': 'Announcement deactivated',
    'superadmin.account.created': 'Super Admin account created',
    'superadmin.account.enabled': 'Super Admin account enabled',
    'superadmin.account.disabled': 'Super Admin account disabled',
    'superadmin.account.password_changed': 'Super Admin password changed',
    'superadmin.account.password_reset_completed': 'Super Admin password reset completed',
    'vendor.created': 'Vendor created',
    'vendor.suspended': 'Vendor suspended',
    'vendor.unsuspended': 'Vendor unsuspended',
    'vendor.verified': 'Vendor verified',
    'vendor.unverified': 'Vendor unverified',
    'vendor.deleted': 'Vendor deleted',
    'vendor.payout_profile.revealed': 'Vendor payout profile revealed',
    'customer.suspended': 'Customer suspended',
    'customer.unsuspended': 'Customer unsuspended',
    'customer.deleted': 'Customer deleted',
    'rider.created': 'Rider created',
    'rider.suspended': 'Rider suspended',
    'rider.unsuspended': 'Rider unsuspended',
    'rider.deleted': 'Rider deleted',
    'vendor_withdrawal.status_changed': 'Vendor withdrawal status changed',
    'vendor_withdrawal.payout_account.revealed': 'Vendor withdrawal payout account revealed',
    'referral_withdrawal.status_changed': 'Referral withdrawal status changed',
    'referral_withdrawal.payout_account.revealed': 'Referral withdrawal payout account revealed',
    'late_payment.resolved': 'Late payment resolved',
    'wallet_topup_reconciliation.resolved': 'Wallet top-up reconciliation resolved',
    'payment_method.updated': 'Payment method updated',
    'referral_program.updated': 'Referral program updated',
    'app_setting.updated': 'App setting updated',
    'promotion.created': 'Promotion created',
    'promotion.updated': 'Promotion updated',
    'promotion.status_changed': 'Promotion status changed',
    'promotion.deleted': 'Promotion deleted',
    'promotion_placement.changed': 'Promotion placement changed',
};

const TARGET_LABELS = {
    superadmin: 'Super Admin',
    vendor: 'Vendor',
    user: 'Customer',
    rider: 'Rider',
    vendor_withdrawal: 'Vendor withdrawal',
    referral_withdrawal: 'Referral withdrawal',
    late_payment_case: 'Late payment case',
    wallet_topup_reconciliation: 'Wallet top-up reconciliation',
    payment_method: 'Payment method',
    referral_program: 'Referral program',
    app_setting: 'App setting',
    promotion: 'Promotion',
    promotion_placement: 'Promotion placement',
    announcement: 'Announcement',
};

const SENSITIVE_KEY = /password|otp|token|cookie|secret|authorization|credential|accountnumber|bankaccount|encrypted|rawbody|requestbody/;

export const actionLabel = (action) => ACTION_LABELS[action] || (action ? String(action).replace(/[._]/g, ' ') : 'Action not recorded');

export const targetLabel = (targetType) => TARGET_LABELS[targetType] || targetType || 'Target not recorded';

export const outcomeLabel = (outcome) => outcome === 'SUCCESS' ? 'Success' : (outcome || 'Outcome not recorded');

const capitalizeName = (value) => String(value || '').trim().replace(/\b\p{L}/gu, (letter) => letter.toLocaleUpperCase());

export const actorLabel = (event) => {
    const actor = event?.actor;
    if (actor && typeof actor === 'object') {
        const name = `${actor.firstname || ''} ${actor.lastname || ''}`.trim();
        return capitalizeName(name) || actor.username || actor.email || actor.id || 'Administrator';
    }
    if (event?.actorKind === 'BOOTSTRAP') return 'Bootstrap setup';
    if (event?.actorKind === 'RESET_TOKEN') return 'Password reset';
    if (event?.actorKind === 'SYSTEM') return 'System';
    if (event?.actorKind === 'AUTHENTICATED_ADMIN') {
        return event.actorAdminId ? `Administrator unavailable (${event.actorAdminId})` : 'Administrator unavailable';
    }
    if (event?.actorKind) return String(event.actorKind);
    return 'Actor not recorded';
};

export const toAuditInstant = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString();
};

export const auditFilterError = (filters) => {
    const q = String(filters.q || '').trim();
    if (q.length > AUDIT_QUERY_MAX) return 'Search must be at most 100 characters.';
    if (String(filters.actorAdminId || '').trim().length > 64) return 'Actor id must be at most 64 characters.';
    if (String(filters.targetType || '').trim().length > 64) return 'Target type must be at most 64 characters.';
    if (String(filters.targetId || '').trim().length > 128) return 'Target id must be at most 128 characters.';
    if (filters.action && !AUDIT_ACTIONS.includes(filters.action)) return 'Choose a documented action.';
    const from = filters.from ? new Date(filters.from) : null;
    const to = filters.to ? new Date(filters.to) : null;
    if (filters.from && (!from || Number.isNaN(from.getTime()))) return 'From must be a valid date and time.';
    if (filters.to && (!to || Number.isNaN(to.getTime()))) return 'To must be a valid date and time.';
    if (from && to && from > to) return '`from` must be less than or equal to `to`.';
    const limit = Number(filters.limit || AUDIT_PAGE_SIZE);
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) return 'Limit must be from 1 to 100.';
    return '';
};

export const auditListPath = (filters, page = 1) => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    const limit = Number(filters.limit || AUDIT_PAGE_SIZE);
    params.set('limit', String(Math.min(100, Math.max(1, limit))));
    const from = toAuditInstant(filters.from);
    const to = toAuditInstant(filters.to);
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    const actorAdminId = String(filters.actorAdminId || '').trim();
    const targetType = String(filters.targetType || '').trim();
    const targetId = String(filters.targetId || '').trim();
    const q = String(filters.q || '').trim().slice(0, AUDIT_QUERY_MAX);
    if (actorAdminId) params.set('actorAdminId', actorAdminId);
    if (filters.action) params.set('action', filters.action);
    if (targetType) params.set('targetType', targetType);
    if (targetId) params.set('targetId', targetId);
    if (q) params.set('q', q);
    return `/superadmin/audit-events?${params.toString()}`;
};

const sensitiveKey = (key) => {
    const normalized = String(key || '').replace(/[_\s-]/g, '').toLowerCase();
    if (normalized === 'accountlast4') return false;
    return SENSITIVE_KEY.test(normalized);
};

export const presentSnapshot = (value, key = '', depth = 0) => {
    if (sensitiveKey(key)) return { kind: 'restricted' };
    if (value === null || value === undefined) return { kind: 'empty' };
    if (depth > 4) return { kind: 'text', text: 'Nested value omitted' };
    if (Array.isArray(value)) {
        return { kind: 'list', items: value.map((item, index) => presentSnapshot(item, String(index), depth + 1)) };
    }
    if (typeof value === 'object') {
        return {
            kind: 'object',
            entries: Object.entries(value).map(([entryKey, entryValue]) => ({
                key: entryKey,
                value: presentSnapshot(entryValue, entryKey, depth + 1),
            })),
        };
    }
    if (typeof value === 'string' && value.split('.').length === 3 && value.length > 40) return { kind: 'restricted' };
    return { kind: 'text', text: String(value) };
};
