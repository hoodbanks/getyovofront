import { describe, expect, it } from 'vitest';
import { getPaymentMethodErrorMessage, PAYMENT_METHOD_CODES, validatePaymentMethod } from './paymentMethodSettings.js';

const validMethod = {
    code: 'WALLET',
    enabled: true,
    sortOrder: '2',
    displayName: 'Wallet',
    description: 'Pay from the customer spending wallet.',
};

describe('payment method settings', () => {
    it('accepts valid method settings and sort-order boundaries', () => {
        expect(validatePaymentMethod(validMethod)).toEqual({});
        expect(validatePaymentMethod({ ...validMethod, sortOrder: '0' })).toEqual({});
        expect(validatePaymentMethod({ ...validMethod, sortOrder: '100' })).toEqual({});
    });

    it('validates required name length, description limit, and whole-number order', () => {
        const errors = validatePaymentMethod({
            ...validMethod,
            displayName: ' W ',
            description: 'x'.repeat(201),
            sortOrder: '1.5',
        });

        expect(errors.displayName).toBeTruthy();
        expect(errors.description).toBeTruthy();
        expect(errors.sortOrder).toBeTruthy();
    });

    it('only allows known method codes', () => {
        expect([...PAYMENT_METHOD_CODES].sort()).toEqual(['PAYSTACK', 'PAY_FOR_ME', 'WALLET']);
    });

    it('maps authentication, validation, and unavailable errors', () => {
        expect(getPaymentMethodErrorMessage({ status: 401 })).toMatch(/session/i);
        expect(getPaymentMethodErrorMessage({ status: 400, message: 'Invalid name' })).toBe('Invalid name');
        expect(getPaymentMethodErrorMessage({ status: 503 })).toMatch(/temporarily unavailable/i);
    });
});
