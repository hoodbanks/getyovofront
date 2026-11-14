import { describe, expect, it } from 'vitest';
import { normalizeSuperAdminPhone, superAdminCreateError } from './superAdminAccountValidation';

const valid = {
    firstname: 'Kai',
    lastname: 'Example',
    phonenumber: '08012345678',
    username: 'kai_admin',
    email: 'kai@example.com',
    password: 'ValidPass1!',
    passwordConfirmation: 'ValidPass1!',
};

describe('Super Admin account creation rules', () => {
    it('accepts the backend phone prefixes and strips spaces and hyphens', () => {
        expect(superAdminCreateError(valid)).toBe('');
        expect(superAdminCreateError({ ...valid, phonenumber: '+2348012345678' })).toBe('');
        expect(superAdminCreateError({ ...valid, phonenumber: '2348012345678' })).toBe('');
        expect(normalizeSuperAdminPhone('0801 234-5678')).toBe('08012345678');
        expect(superAdminCreateError({ ...valid, phonenumber: '0801 234-5678' })).toBe('');
    });

    it('rejects names, usernames, emails, and passwords that miss the schema', () => {
        expect(superAdminCreateError({ ...valid, firstname: 'K' })).toContain('First name');
        expect(superAdminCreateError({ ...valid, lastname: 'E' })).toContain('Last name');
        expect(superAdminCreateError({ ...valid, phonenumber: '12345' })).toContain('Phone number');
        expect(superAdminCreateError({ ...valid, username: 'ka' })).toBe('');
        expect(superAdminCreateError({ ...valid, username: 'k' })).toContain('Username');
        expect(superAdminCreateError({ ...valid, username: 'a'.repeat(31) })).toContain('Username');
        expect(superAdminCreateError({ ...valid, username: 'kai admin' })).toContain('underscores');
        expect(superAdminCreateError({ ...valid, email: 'not-an-email' })).toContain('valid email');
        expect(superAdminCreateError({ ...valid, email: `${'a'.repeat(250)}@example.com` })).toContain('255');
        expect(superAdminCreateError({ ...valid, password: 'short1!', passwordConfirmation: 'short1!' })).toContain('8 characters');
        expect(superAdminCreateError({ ...valid, password: 'validpass1!', passwordConfirmation: 'validpass1!' })).toContain('uppercase');
        expect(superAdminCreateError({ ...valid, password: 'VALIDPASS1!', passwordConfirmation: 'VALIDPASS1!' })).toContain('lowercase');
        expect(superAdminCreateError({ ...valid, password: 'ValidPass!', passwordConfirmation: 'ValidPass!' })).toContain('number');
        expect(superAdminCreateError({ ...valid, password: 'ValidPass1', passwordConfirmation: 'ValidPass1' })).toContain('special character');
        expect(superAdminCreateError({ ...valid, passwordConfirmation: 'ValidPass2!' })).toContain('must match');
    });
});