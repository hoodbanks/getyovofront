import { describe, expect, it } from 'vitest';
import { getVendorAccountStatus } from './vendorAccountStatus';

describe('getVendorAccountStatus', () => {
    it('keeps account status active when the store is closed', () => {
        expect(getVendorAccountStatus({ isVerified: true, isSuspended: false, storeStatus: 'CLOSED' })).toBe('ACTIVE');
    });

    it('keeps a verified account active when a dashboard row only has store status OPEN', () => {
        expect(getVendorAccountStatus({ status: 'OPEN', isVerified: true, isSuspended: false, storeStatus: 'OPEN' })).toBe('ACTIVE');
    });

    it('does not treat an open store as an active unverified account', () => {
        expect(getVendorAccountStatus({ isVerified: false, storeStatus: 'OPEN' })).toBe('PENDING');
    });

    it('does not let a closed-store inactive label override an approved account', () => {
        expect(getVendorAccountStatus({ status: 'INACTIVE', isVerified: true, isSuspended: false, storeStatus: 'CLOSED' })).toBe('ACTIVE');
    });

    it('uses explicit account status and suspension state', () => {
        expect(getVendorAccountStatus({ accountStatus: 'INACTIVE', isVerified: true })).toBe('INACTIVE');
        expect(getVendorAccountStatus({ isSuspended: true, accountStatus: 'ACTIVE' })).toBe('SUSPENDED');
    });
});
