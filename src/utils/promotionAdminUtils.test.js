import { describe, expect, it } from 'vitest';
import { getPromotionError, validatePromotionTitle } from './promotionAdminUtils.js';

describe('promotion admin helpers', () => {
    it('trims titles and enforces the 1–40 character limit', () => {
        expect(validatePromotionTitle('  Featured  ')).toBe('');
        expect(validatePromotionTitle('   ')).toMatch(/1 and 40/);
        expect(validatePromotionTitle('x'.repeat(41))).toMatch(/1 and 40/);
    });

    it('returns status-specific messages for common API errors', () => {
        expect(getPromotionError({ status: 401 })).toMatch(/session/i);
        expect(getPromotionError({ status: 404 })).toMatch(/could not be found/i);
        expect(getPromotionError({ status: 409, message: 'Already exists' })).toMatch(/Already exists/);
        expect(getPromotionError({ status: 429 })).toMatch(/too many requests/i);
    });
});
