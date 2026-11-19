import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PushNotifications from './PushNotifications';
import api from '../../api/api';

vi.mock('../../api/api', () => ({ default: { get: vi.fn(), post: vi.fn() } }));
vi.mock('../../store/useAuthStore', () => ({ useAuthStore: (selector) => selector({ accessToken: 'admin-token' }) }));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const renderPage = () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    return render(<QueryClientProvider client={client}><PushNotifications /></QueryClientProvider>);
};

describe('Super Admin one-off Notifications', () => {
    beforeEach(() => api.post.mockResolvedValue({ success: true, message: 'Sent' }));
    afterEach(() => cleanup());

    it('shows a dedicated in-page notification form without a duplicate Broadcast composer', async () => {
        renderPage();
        expect(await screen.findByRole('heading', { name: 'New notification' })).toBeTruthy();
        expect(screen.queryByText('New broadcast')).toBeNull();
        expect(screen.queryByRole('button', { name: /prepare an announcement/i })).toBeNull();
        expect(screen.getByLabelText('Notification title')).toBeTruthy();
        expect(screen.getByLabelText('Message')).toBeTruthy();
    });

    it('sends the existing one-off Notification action through its unchanged endpoint', async () => {
        const user = userEvent.setup();
        renderPage();
        await user.click(screen.getByRole('button', { name: /vendors/i }));
        await user.type(screen.getByLabelText('Notification title'), 'Service update');
        await user.type(screen.getByLabelText('Message'), 'Scheduled maintenance tonight.');
        await user.click(screen.getByRole('button', { name: /send notification/i }));
        expect(await screen.findByText('Notification request accepted')).toBeTruthy();
        expect(api.post).toHaveBeenCalledWith('/notification/broadcast', {
            audience: 'ALL_VENDORS', title: 'Service update', body: 'Scheduled maintenance tonight.', type: 'PROMO',
        }, 'admin-token');
    });

    it('sends the Customers choice as the customer audience the API accepts', async () => {
        const user = userEvent.setup();
        renderPage();
        expect(screen.queryByRole('button', { name: /all users/i })).toBeNull();
        await user.click(screen.getByRole('button', { name: /customers/i }));
        await user.type(screen.getByLabelText('Notification title'), 'Customer update');
        await user.type(screen.getByLabelText('Message'), 'A message for customers.');
        expect(screen.getByRole('button', { name: /send notification/i }).disabled).toBe(false);
        await user.click(screen.getByRole('button', { name: /send notification/i }));
        await screen.findByText('Notification request accepted');
        expect(api.post).toHaveBeenLastCalledWith('/notification/broadcast', {
            audience: 'ALL_USERS', title: 'Customer update', body: 'A message for customers.', type: 'PROMO',
        }, 'admin-token');
    });

    it('fills the account id from a customer search result and sends to that person', async () => {
        const user = userEvent.setup();
        api.get.mockImplementation(async (path) => {
            if (path.startsWith('/superadmin/users/search?')) {
                return { data: { users: { data: [{ id: 'user_ada', firstname: 'Ada', lastname: 'Okonkwo', phonenumber: '+2348012345678', email: 'ada@example.com' }] } } };
            }
            if (path === '/superadmin/users/user_ada/overview') return { data: { name: 'Ada Okonkwo' } };
            return { data: { users: { data: [] } } };
        });
        renderPage();
        await user.click(screen.getByRole('button', { name: /one person/i }));
        expect(screen.getByRole('button', { name: /send notification/i }).disabled).toBe(true);
        await user.type(screen.getByLabelText('Find recipient'), 'Ada');
        await user.click(await screen.findByRole('option', { name: /Ada Okonkwo/ }));
        expect(screen.getByLabelText('Account ID').value).toBe('user_ada');
        expect(screen.getByText('Recipient: Ada Okonkwo')).toBeTruthy();
        await user.type(screen.getByLabelText('Notification title'), 'Hello');
        await user.type(screen.getByLabelText('Message'), 'A note for Ada.');
        expect(screen.getByRole('button', { name: /send notification/i }).disabled).toBe(false);
        await user.click(screen.getByRole('button', { name: /send notification/i }));
        await screen.findByText('Notification request accepted');
        expect(api.post).toHaveBeenCalledWith('/notification/broadcast', {
            audience: 'SINGLE', targetRole: 'USER', actorId: 'user_ada', title: 'Hello', body: 'A note for Ada.', type: 'PROMO',
        }, 'admin-token');
    });

    it('uses a styled category menu instead of a native select', async () => {
        const user = userEvent.setup();
        renderPage();
        expect(document.querySelector('select')).toBeNull();
        await user.click(screen.getByRole('button', { name: 'Category' }));
        await user.click(screen.getByRole('option', { name: /security/i }));
        expect(screen.getByRole('button', { name: 'Category' }).textContent).toContain('Security');
        expect(screen.queryByRole('listbox')).toBeNull();
    });
});
