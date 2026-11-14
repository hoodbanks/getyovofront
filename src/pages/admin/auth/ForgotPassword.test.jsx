import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ForgotPassword from './ForgotPassword';

const { auth } = vi.hoisted(() => ({ auth: { logout: vi.fn() } }));
vi.mock('../../../store/useAuthStore', () => ({ useAuthStore: { getState: () => auth } }));

const response = (body, status = 200, retryAfter = null) => ({
    ok: status >= 200 && status < 300,
    status,
    headers: { get: (name) => name.toLowerCase() === 'retry-after' ? retryAfter : null },
    json: async () => body,
});

const renderPage = () => render(<MemoryRouter initialEntries={['/admin/forgot-password']}><Routes>
    <Route path="/admin/forgot-password" element={<ForgotPassword/>}/>
    <Route path="/admin/login" element={<div>Admin login screen</div>}/>
</Routes></MemoryRouter>);

beforeEach(() => {
    auth.logout.mockClear();
    globalThis.fetch = vi.fn()
        .mockResolvedValueOnce(response({ success: true, data: { challengeId: 'challenge-123', expiresInSeconds: 600, resendAvailableInSeconds: 60 } }))
        .mockResolvedValueOnce(response({ success: true, data: { resetToken: 'one-time-secret', expiresInSeconds: 600 } }))
        .mockResolvedValueOnce(response({ success: true, data: null }));
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe('Super Admin password recovery', () => {
    it('requests a challenge, preserves leading zeroes, submits the reset token only in the password body, then clears auth', async () => {
        const user = userEvent.setup();
        renderPage();

        await user.type(screen.getByLabelText('Email'), ' ADMIN@EXAMPLE.COM ');
        await user.click(screen.getByRole('button', { name: 'Send Reset Code' }));
        expect(await screen.findByText(/reset code sent to admin@example.com/i)).toBeTruthy();
        expect(globalThis.fetch.mock.calls[0][0]).toContain('/superadmin/auth/forgot-password-otp');
        expect(JSON.parse(globalThis.fetch.mock.calls[0][1].body)).toEqual({ email: 'admin@example.com' });
        expect(globalThis.fetch.mock.calls[0][1].headers.Authorization).toBeUndefined();

        fireEvent.change(screen.getByLabelText('Six-digit code'), { target: { value: '002301' } });
        await user.click(screen.getByRole('button', { name: 'Verify Code' }));
        await screen.findByLabelText('New password');
        expect(JSON.parse(globalThis.fetch.mock.calls[1][1].body)).toEqual({ email: 'admin@example.com', challengeId: 'challenge-123', otp: '002301' });
        expect(window.location.pathname).toBe('/');
        expect(localStorage.getItem('resetToken')).toBeNull();

        await user.type(screen.getByLabelText('New password'), 'NewPassword2!');
        await user.type(screen.getByLabelText('Confirm new password'), 'NewPassword2!');
        await user.click(screen.getByRole('button', { name: 'Set New Password' }));
        await screen.findByText('Admin login screen');
        const resetCall = globalThis.fetch.mock.calls[2];
        expect(resetCall[0]).toContain('/superadmin/auth/set-password');
        expect(JSON.parse(resetCall[1].body)).toEqual({ email: 'admin@example.com', resetToken: 'one-time-secret', newPassword: 'NewPassword2!', confirmPassword: 'NewPassword2!' });
        expect(resetCall[1].headers.Authorization).toBeUndefined();
        expect(auth.logout).toHaveBeenCalledOnce();
    });

    it('uses Retry-After to disable another request after a rate limit', async () => {
        globalThis.fetch.mockReset().mockResolvedValue(response({ success: false, message: 'Too many requests' }, 429, '120'));
        const user = userEvent.setup();
        renderPage();
        await user.type(screen.getByLabelText('Email'), 'admin@example.com');
        await user.click(screen.getByRole('button', { name: 'Send Reset Code' }));
        expect((await screen.findByRole('alert')).textContent).toContain('Too many attempts');
        await waitFor(() => expect(screen.getByRole('button', { name: /Try again in 120s/ }).disabled).toBe(true));
    });

    it('resends through the same endpoint using the normalized email after the cooldown', async () => {
        globalThis.fetch.mockReset()
            .mockResolvedValueOnce(response({ success: true, data: { challengeId: 'challenge-456', expiresInSeconds: 600, resendAvailableInSeconds: 1 } }))
            .mockResolvedValueOnce(response({ success: true, data: { challengeId: 'challenge-456', expiresInSeconds: 600, resendAvailableInSeconds: 60 } }));
        const user = userEvent.setup();
        renderPage();
        await user.type(screen.getByLabelText('Email'), 'ADMIN@example.com');
        await user.click(screen.getByRole('button', { name: 'Send Reset Code' }));
        const resend = await screen.findByRole('button', { name: /Resend code in/ });
        expect(resend.disabled).toBe(true);
        await waitFor(() => expect(screen.getByRole('button', { name: 'Resend code' }).disabled).toBe(false), { timeout: 2500 });
        await user.click(screen.getByRole('button', { name: 'Resend code' }));
        expect(globalThis.fetch).toHaveBeenCalledTimes(2);
        expect(globalThis.fetch.mock.calls[1][0]).toContain('/superadmin/auth/forgot-password-otp');
        expect(JSON.parse(globalThis.fetch.mock.calls[1][1].body)).toEqual({ email: 'admin@example.com' });
    });
});
