import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RiderChangePassword from './RiderChangePassword';

vi.mock('../../../../api/api', () => ({
    default: { post: vi.fn() },
}));

vi.mock('../../../../store/useAuthStore', () => ({
    useAuthStore: (selector) => {
        const state = { accessToken: 'rider-token' };
        return typeof selector === 'function' ? selector(state) : state;
    },
}));

describe('signed-in rider password change', () => {
    afterEach(() => cleanup());

    it('asks for the current password and does not offer forgot password', () => {
        render(<MemoryRouter><RiderChangePassword /></MemoryRouter>);
        expect(screen.getByPlaceholderText('Current password')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Change Password' })).toBeTruthy();
        expect(screen.queryByRole('button', { name: /forgot password/i })).toBeNull();
    });
});
