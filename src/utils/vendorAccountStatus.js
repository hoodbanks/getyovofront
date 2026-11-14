const ACCOUNT_STATUSES = new Set(['ACTIVE', 'INACTIVE', 'PENDING', 'SUSPENDED']);

export const getVendorAccountStatus = (record = {}) => {
    const status = String(record.status || '').trim().toUpperCase();
    const accountStatus = String(record.accountStatus || '').trim().toUpperCase();

    if (record.isSuspended === true || status === 'SUSPENDED' || accountStatus === 'SUSPENDED') return 'SUSPENDED';
    if (ACCOUNT_STATUSES.has(accountStatus)) return accountStatus;
    if (typeof record.isActive === 'boolean') return record.isActive ? 'ACTIVE' : 'INACTIVE';
    if (record.isVerified === false || status === 'PENDING') return 'PENDING';
    if (record.isVerified === true || status === 'ACTIVE') return 'ACTIVE';
    if (status === 'INACTIVE') return 'INACTIVE';

    return 'UNKNOWN';
};
