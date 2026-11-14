import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import App from '../../../App';
import VerifyEmail from './VerifyEmail';
import api from '../../../api/api';

vi.mock('../../../firebase', () => ({ messaging: null, getToken: vi.fn(), onMessage: vi.fn() }));
vi.mock('../../../api/api', () => ({ default: { post: vi.fn(), get: vi.fn(), patch: vi.fn() } }));

const renderVerification = (entry = '/admin/verify-email') => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    return render(
        <QueryClientProvider client={client}>
            <MemoryRouter initialEntries={[entry]}>
                <Routes>
                    <Route path="/admin/verify-email" element={<VerifyEmail />} />
                    <Route path="/admin/login" element={<h1>Admin login</h1>} />
                    <Route path="/admin/forgot-password" element={<h1>Reset password</h1>} />
                </Routes>
            </MemoryRouter>
        </QueryClientProvider>,
    );
};

const failure = (message, status, extra = {}) => Object.assign(new Error(message), { status, ...extra });

describe('Super Admin email verification', () => {
    afterEach(() => {
        cleanup();
        sessionStorage.clear();
        vi.clearAllMocks();
    });

    it('renders the verification flow instead of password reset', async () => {
        const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
        render(
            <QueryClientProvider client={client}>
                <MemoryRouter initialEntries={['/admin/verify-email']}>
                    <App />
                </MemoryRouter>
            </QueryClientProvider>,
        );
        expect(await screen.findByRole('heading', { name: 'Verify Super Admin email' })).toBeTruthy();
        expect(screen.queryByRole('button', { name: 'Send Reset Code' })).toBeNull();
        expect(screen.queryByRole('heading', { name: 'Reset password' })).toBeNull();
    });

    it('keeps a routed email without reading a password or code from the address', async () => {
        sessionStorage.setItem('getyovo.superadmin.verifyEmail', 'stored@example.com');
        renderVerification({ pathname: '/admin/verify-email', state: { email: 'kai@example.com' } });
        expect(screen.getByLabelText('Email').value).toBe('kai@example.com');
        expect(window.location.search).not.toContain('otp');
    });

    it('submits a six-digit code with leading zeroes and sends the user to login without a session', async () => {
        api.post.mockResolvedValueOnce({
            success: true,
            message: 'Email verified successfully! You can now log in.',
            data: { accessToken: 'hidden-access-token', refreshToken: 'hidden-refresh-token' },
        });
        const user = userEvent.setup();
        renderVerification({ pathname: '/admin/verify-email', state: { email: 'kai@example.com' } });
        await user.type(screen.getByLabelText('Six-digit code'), '012345');
        await user.click(screen.getByRole('button', { name: 'Verify email' }));
        expect(await screen.findByRole('heading', { name: 'Email verified' })).toBeTruthy();
        expect(screen.getByRole('status').textContent).toContain('Email verified successfully! You can now log in.');
        expect(api.post).toHaveBeenCalledWith('/superadmin/auth/verify-otp', { email: 'kai@example.com', otp: '012345' });
        expect(screen.queryByText('hidden-access-token')).toBeNull();
        expect(screen.queryByText('hidden-refresh-token')).toBeNull();
        await user.click(screen.getByRole('link', { name: 'Go to login' }));
        expect(await screen.findByRole('heading', { name: 'Admin login' })).toBeTruthy();
    });

    it('shows invalid, expired, already verified, and unknown email responses separately', async () => {
        const user = userEvent.setup();
        renderVerification({ pathname: '/admin/verify-email', state: { email: 'kai@example.com' } });
        const code = screen.getByLabelText('Six-digit code');
        const cases = [
            ['111111', failure('Invalid OTP code.', 400), 'Invalid code'],
            ['222222', failure('OTP expired. Please request a new one.', 400), 'Code expired'],
            ['333333', failure('Account already verified.', 400), 'Email already verified'],
            ['444444', failure('Super Admin not found.', 404), 'Unknown email'],
        ];
        for (const [otp, error, title] of cases) {
            api.post.mockRejectedValueOnce(error);
            await user.clear(code);
            await user.type(code, otp);
            await user.click(screen.getByRole('button', { name: 'Verify email' }));
            const alert = (await screen.findByText(error.message)).closest('[role="alert"]');
            expect(alert.textContent).toContain(title);
            expect(alert.textContent).toContain(error.message);
            if (title === 'Email already verified') expect(screen.getByRole('link', { name: 'Go to login' })).toBeTruthy();
        }
    });

    it('shows a resend wait from the server and allows another attempt', async () => {
        api.post
            .mockRejectedValueOnce(failure('Please try again in 10 minutes', 429, { retryAfter: '60' }))
            .mockResolvedValueOnce({
                success: true,
                message: 'A new OTP has been sent to kai@example.com. Please verify your email.',
                data: { otpCode: '012345', password: 'hidden-password', isPhoneVerified: false },
            });
        const user = userEvent.setup();
        renderVerification({ pathname: '/admin/verify-email', state: { email: 'kai@example.com' } });
        await user.click(screen.getByRole('button', { name: 'Resend code' }));
        const alert = await screen.findByRole('alert');
        expect(alert.textContent).toContain('Please wait');
        expect(alert.textContent).toContain('Please try again in 10 minutes');
        expect(alert.textContent).toContain('Retry-After 60');
        expect(screen.getByRole('button', { name: 'Resend code' }).disabled).toBe(false);
        await user.click(screen.getByRole('button', { name: 'Resend code' }));
        expect((await screen.findByRole('status')).textContent).toContain('A new OTP has been sent to kai@example.com');
        expect(api.post).toHaveBeenNthCalledWith(2, '/superadmin/auth/resend-otp', { email: 'kai@example.com' });
        expect(screen.queryByText('012345')).toBeNull();
        expect(screen.queryByText('hidden-password')).toBeNull();
        expect(screen.queryByText(/phone verification/i)).toBeNull();
    });

    it('shows a network failure separately from an API response', async () => {
        api.post.mockRejectedValueOnce(Object.assign(new Error('Failed to fetch'), { transportError: true }));
        const user = userEvent.setup();
        renderVerification({ pathname: '/admin/verify-email', state: { email: 'kai@example.com' } });
        await user.type(screen.getByLabelText('Six-digit code'), '012345');
        await user.click(screen.getByRole('button', { name: 'Verify email' }));
        const alert = await screen.findByRole('alert');
        expect(alert.textContent).toContain('Network problem');
        expect(alert.textContent).toContain('Failed to fetch');
    });
});
