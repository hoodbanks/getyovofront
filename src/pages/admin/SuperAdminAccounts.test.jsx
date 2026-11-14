import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import SuperAdminAccounts from './SuperAdminAccounts';
import VerifyEmail from './auth/VerifyEmail';
import api from '../../api/api';

const VALID_PASSWORD = 'ValidPass1!';

vi.mock('../../api/api', () => ({ default: { get: vi.fn(), post: vi.fn(), patch: vi.fn() } }));
vi.mock('../../store/useAuthStore', () => ({ useAuthStore: (selector) => selector({ accessToken: 'admin-token', superAdmin: { id: 'admin_current', email: 'current@example.com' } }) }));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const account = (overrides = {}) => ({
    id: 'admin_1', firstname: 'Ada', lastname: 'Okonkwo', username: 'ada_admin', email: 'ada@example.com', phonenumber: '+2348012345678',
    isActive: true, isEmailVerified: true, isPhoneVerified: false, createdAt: '2026-10-20T11:00:00.000Z', lastLogin: null, ...overrides,
});
const list = (admins = [account()], page = 1, total = admins.length) => ({ success: true, data: { admins, pagination: { page, limit: 20, total, totalPages: Math.max(1, Math.ceil(total / 20)) } } });
const renderPage = () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    return render(<QueryClientProvider client={client}><MemoryRouter initialEntries={['/admin/accounts']}><Routes>
        <Route path="/admin/accounts" element={<SuperAdminAccounts />} />
        <Route path="/admin/verify-email" element={<VerifyEmail />} />
    </Routes></MemoryRouter></QueryClientProvider>);
};

beforeEach(() => {
    api.get.mockImplementation(async (path) => {
        if (path.startsWith('/superadmin/auth/accounts/') && path.includes('/status-events?')) return { success: true, data: { events: [{ id: 'event_1', createdAt: '2026-11-01T09:00:00.000Z', actor: 'Current Admin', target: 'Ada Okonkwo', action: 'DISABLED', reason: 'Account review' }], pagination: { page: 1, limit: 20, total: 1, totalPages: 1 } } };
        const params = new URLSearchParams(path.split('?')[1]);
        return params.get('search') ? list([account()], Number(params.get('page'))) : list();
    });
    api.post.mockResolvedValue({ success: true, data: { email: 'new@example.com', otp: 'secret-otp', password: 'secret-password' } });
    api.patch.mockResolvedValue({ success: true, data: { id: 'admin_1', isActive: false } });
});
afterEach(() => {
    cleanup();
    sessionStorage.clear();
});

describe('Super Admin Accounts page', () => {
    it('lists account fields and explicitly shows verification and missing last login', async () => {
        renderPage();
        expect(await screen.findByText('Ada Okonkwo')).toBeTruthy();
        expect(screen.queryByText('ada_admin')).toBeNull();
        expect(screen.getByText('Verified')).toBeTruthy();
        expect(screen.getAllByText('Not available').length).toBeGreaterThan(0);
        expect(api.get).toHaveBeenCalledWith('/superadmin/auth/accounts?page=1&limit=20', 'admin-token');
    });

    it('shows an empty state for a successful empty response', async () => {
        api.get.mockResolvedValueOnce(list([], 1, 0));
        renderPage();
        expect(await screen.findByText('No Super Admin accounts found')).toBeTruthy();
        expect(screen.queryByRole('alert')).toBeNull();
    });

    it('keeps enabled status separate from pending email verification and ignores legacy isVerified', async () => {
        api.get.mockResolvedValueOnce(list([account({ isActive: true, isEmailVerified: false, isVerified: false })]));
        renderPage();
        expect(await screen.findByText('Enabled')).toBeTruthy();
        expect(screen.getByText('Pending email verification')).toBeTruthy();
        expect(screen.queryByText('Disabled')).toBeNull();
    });

    it('sends server-side search and paginates using response metadata', async () => {
        api.get.mockImplementation(async (path) => {
            const params = new URLSearchParams(path.split('?')[1]);
            const page = Number(params.get('page'));
            return list([account({ id: `admin_${page}`, firstname: `Page ${page}` })], page, 21);
        });
        const user = userEvent.setup();
        renderPage();
        expect(await screen.findByText('Page 1 Okonkwo')).toBeTruthy();
        await user.click(screen.getByRole('button', { name: /next/i }));
        expect(await screen.findByText('Page 2 Okonkwo')).toBeTruthy();
        expect(api.get).toHaveBeenCalledWith('/superadmin/auth/accounts?page=2&limit=20', 'admin-token');
        await user.type(screen.getByPlaceholderText('Search name, username, email, or phone'), 'Ada');
        await waitFor(() => expect(api.get).toHaveBeenCalledWith('/superadmin/auth/accounts?page=1&limit=20&search=Ada', 'admin-token'));
    });

    it('validates required fields and password confirmation without submitting', async () => {
        const user = userEvent.setup();
        renderPage();
        await screen.findByText('Ada Okonkwo');
        await user.click(screen.getByRole('button', { name: 'Add Super Admin' }));
        const dialog = screen.getByRole('dialog');
        await user.type(within(dialog).getByLabelText(/First name/), 'Kai');
        await user.type(within(dialog).getByLabelText(/Last name/), 'Example');
        await user.type(within(dialog).getByLabelText(/Phone number/), '+2348000000000');
        await user.type(within(dialog).getByLabelText(/Username/), 'kai_admin');
        await user.type(within(dialog).getByLabelText(/^Email/), 'kai@example.com');
        await user.type(within(dialog).getByLabelText(/^Password/), VALID_PASSWORD);
        await user.type(within(dialog).getByLabelText(/Confirm password/), 'ValidPass2!');
        await user.click(within(dialog).getByRole('button', { name: 'Create account' }));
        expect((await within(dialog).findByRole('alert')).textContent).toContain('Password and password confirmation must match.');
        expect(api.post).not.toHaveBeenCalled();
    });

    it('creates using the authenticated endpoint, clears secrets, and reports email verification', async () => {
        const user = userEvent.setup();
        renderPage();
        await screen.findByText('Ada Okonkwo');
        await user.click(screen.getByRole('button', { name: 'Add Super Admin' }));
        const dialog = screen.getByRole('dialog');
        await user.type(within(dialog).getByLabelText(/First name/), 'Kai');
        await user.type(within(dialog).getByLabelText(/Last name/), 'Example');
        await user.type(within(dialog).getByLabelText(/Phone number/), '+2348000000000');
        await user.type(within(dialog).getByLabelText(/Username/), 'kai_admin');
        await user.type(within(dialog).getByLabelText(/^Email/), 'kai@example.com');
        await user.type(within(dialog).getByLabelText(/^Password/), VALID_PASSWORD);
        await user.type(within(dialog).getByLabelText(/Confirm password/), VALID_PASSWORD);
        await user.click(within(dialog).getByRole('button', { name: 'Create account' }));
        expect((await screen.findByRole('status')).textContent).toContain('an email OTP was sent');
        expect(api.post).toHaveBeenCalledWith('/superadmin/auth/register', {
            firstname: 'Kai', lastname: 'Example', phonenumber: '+2348000000000', username: 'kai_admin', email: 'kai@example.com', password: VALID_PASSWORD, passwordConfirmation: VALID_PASSWORD,
        }, 'admin-token');
        expect(screen.queryByText('secret-otp')).toBeNull();
        expect(screen.queryByText('secret-password')).toBeNull();
        await waitFor(() => expect(api.get).toHaveBeenCalledTimes(2));
    });

    it('shows a clear expired-session state when listing is unauthorized', async () => {
        api.get.mockRejectedValueOnce(Object.assign(new Error('Unauthorized'), { status: 401 }));
        renderPage();
        expect((await screen.findByRole('alert')).textContent).toContain('Your Super Admin session has expired');
        expect(screen.queryByText('No Super Admin accounts found')).toBeNull();
    });

    it('confirms status changes with a reason, sends the documented patch, and refreshes the list', async () => {
        const user = userEvent.setup();
        renderPage();
        await screen.findByText('Ada Okonkwo');
        await user.click(screen.getByRole('button', { name: 'Disable' }));
        const dialog = screen.getByRole('dialog', { name: /confirm disable/i });
        expect(dialog.textContent).toContain('Ada Okonkwo');
        const reason = within(dialog).getByLabelText(/Reason/);
        await user.type(reason, 'Account review');
        await user.click(within(dialog).getByRole('button', { name: 'Confirm disable' }));
        await waitFor(() => expect(api.patch).toHaveBeenCalledWith('/superadmin/auth/accounts/admin_1/status', { isActive: false, reason: 'Account review' }, 'admin-token'));
        await waitFor(() => expect(api.get).toHaveBeenCalledTimes(2));
    });

    it('keeps the existing state and shows the backend guard message when status change is rejected', async () => {
        api.patch.mockRejectedValueOnce(Object.assign(new Error('Cannot disable the last active, email-verified Super Admin.'), { status: 409 }));
        const user = userEvent.setup();
        renderPage();
        await screen.findByText('Ada Okonkwo');
        await user.click(screen.getByRole('button', { name: 'Disable' }));
        const dialog = screen.getByRole('dialog', { name: /confirm disable/i });
        await user.type(within(dialog).getByLabelText(/Reason/), 'Account review');
        await user.click(within(dialog).getByRole('button', { name: 'Confirm disable' }));
        expect((await within(dialog).findByRole('alert')).textContent).toContain('Cannot disable the last active');
        expect(screen.getByText('Enabled')).toBeTruthy();
    });

    it('does not offer a status action for the signed-in admin', async () => {
        api.get.mockResolvedValueOnce(list([account({ id: 'admin_current', email: 'current@example.com' })]));
        renderPage();
        await screen.findByText('Ada Okonkwo');
        expect(screen.getByText('(You)')).toBeTruthy();
        expect(screen.queryByRole('button', { name: 'Disable' })).toBeNull();
    });

    it('shows paginated status history and the deployment coverage note', async () => {
        const user = userEvent.setup();
        renderPage();
        await screen.findByText('Ada Okonkwo');
        await user.click(screen.getByRole('button', { name: 'View status history for Ada Okonkwo' }));
        const dialog = screen.getByRole('dialog');
        expect(await within(dialog).findByText('Current Admin')).toBeTruthy();
        expect(within(dialog).getByText('Account review')).toBeTruthy();
        expect(dialog.textContent).toContain('History starts with this feature deployment');
        expect(api.get).toHaveBeenCalledWith('/superadmin/auth/accounts/admin_1/status-events?page=1&limit=20', 'admin-token');
    });

    it('shows server validation errors from account creation', async () => {
        api.post.mockRejectedValueOnce(Object.assign(new Error('Username already exists'), { status: 400 }));
        const user = userEvent.setup();
        renderPage();
        await screen.findByText('Ada Okonkwo');
        await user.click(screen.getByRole('button', { name: 'Add Super Admin' }));
        const dialog = screen.getByRole('dialog');
        for (const [name, value] of [['firstname', 'Kai'], ['lastname', 'Example'], ['phonenumber', '+2348000000000'], ['username', 'kai_admin'], ['email', 'kai@example.com'], ['password', VALID_PASSWORD], ['passwordConfirmation', VALID_PASSWORD]]) {
            await user.type(dialog.querySelector(`input[name="${name}"]`), value);
        }
        await user.click(within(dialog).getByRole('button', { name: 'Create account' }));
        expect((await within(dialog).findByRole('alert')).textContent).toContain('Username already exists');
    });

    it('rejects a password that does not meet the backend rules before submitting', async () => {
        const user = userEvent.setup();
        renderPage();
        await screen.findByText('Ada Okonkwo');
        await user.click(screen.getByRole('button', { name: 'Add Super Admin' }));
        const dialog = screen.getByRole('dialog');
        for (const [name, value] of [['firstname', 'Kai'], ['lastname', 'Example'], ['phonenumber', '+2348000000000'], ['username', 'kai_admin'], ['email', 'kai@example.com'], ['password', 'validpass1!'], ['passwordConfirmation', 'validpass1!']]) {
            await user.type(dialog.querySelector(`input[name="${name}"]`), value);
        }
        await user.click(within(dialog).getByRole('button', { name: 'Create account' }));
        expect((await within(dialog).findByRole('alert')).textContent).toContain('uppercase');
        expect(api.post).not.toHaveBeenCalled();
    });

    it('strips spaces and hyphens from a local phone number before submitting', async () => {
        const user = userEvent.setup();
        renderPage();
        await screen.findByText('Ada Okonkwo');
        await user.click(screen.getByRole('button', { name: 'Add Super Admin' }));
        const dialog = screen.getByRole('dialog');
        for (const [name, value] of [['firstname', 'Kai'], ['lastname', 'Example'], ['phonenumber', '0801 234-5678'], ['username', 'kai_admin'], ['email', 'kai@example.com'], ['password', VALID_PASSWORD], ['passwordConfirmation', VALID_PASSWORD]]) {
            await user.type(dialog.querySelector(`input[name="${name}"]`), value);
        }
        await user.click(within(dialog).getByRole('button', { name: 'Create account' }));
        await waitFor(() => expect(api.post).toHaveBeenCalledWith('/superadmin/auth/register', expect.objectContaining({ phonenumber: '08012345678' }), 'admin-token'));
    });

    it('opens email verification for the address just created without putting the password in the address', async () => {
        const user = userEvent.setup();
        renderPage();
        await screen.findByText('Ada Okonkwo');
        await user.click(screen.getByRole('button', { name: 'Add Super Admin' }));
        const dialog = screen.getByRole('dialog');
        for (const [name, value] of [['firstname', 'Kai'], ['lastname', 'Example'], ['phonenumber', '+2348000000000'], ['username', 'kai_admin'], ['email', 'kai@example.com'], ['password', VALID_PASSWORD], ['passwordConfirmation', VALID_PASSWORD]]) {
            await user.type(dialog.querySelector(`input[name="${name}"]`), value);
        }
        await user.click(within(dialog).getByRole('button', { name: 'Create account' }));
        const verifyLink = await screen.findByRole('link', { name: 'Verify this email' });
        expect(verifyLink.getAttribute('href')).toBe('/admin/verify-email');
        expect(verifyLink.getAttribute('href')).not.toContain(VALID_PASSWORD);
        await user.click(verifyLink);
        expect(await screen.findByRole('heading', { name: 'Verify Super Admin email' })).toBeTruthy();
        expect(screen.getByLabelText('Email').value).toBe('kai@example.com');
        expect(sessionStorage.getItem('getyovo.superadmin.verifyEmail')).toBe('kai@example.com');
        expect(sessionStorage.getItem('getyovo.superadmin.verifyEmail')).not.toContain(VALID_PASSWORD);
    });

    it('does not send a search longer than 100 characters', async () => {
        const user = userEvent.setup();
        renderPage();
        await screen.findByText('Ada Okonkwo');
        const input = screen.getByPlaceholderText('Search name, username, email, or phone');
        await user.click(input);
        await user.paste('x'.repeat(120));
        expect(input.value).toBe('x'.repeat(100));
        await waitFor(() => expect(api.get).toHaveBeenCalledWith(`/superadmin/auth/accounts?page=1&limit=20&search=${'x'.repeat(100)}`, 'admin-token'));
    });
});
