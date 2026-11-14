import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PushNotifications from './PushNotifications';
import api from '../../api/axios';

vi.mock('../../api/axios', () => ({ default: { get: vi.fn(), post: vi.fn() } }));
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
        });
    });

    it('sends to All users and Customers through the existing notification audience values', async () => {
        const user = userEvent.setup();
        renderPage();
        expect(screen.getByRole('button', { name: /all users/i })).toBeTruthy();
        expect(screen.getByRole('button', { name: /customers/i })).toBeTruthy();
        await user.type(screen.getByLabelText('Notification title'), 'Platform update');
        await user.type(screen.getByLabelText('Message'), 'A message for all users.');
        expect(screen.getByRole('button', { name: /send notification/i }).disabled).toBe(false);
        await user.click(screen.getByRole('button', { name: /send notification/i }));
        await screen.findByText('Notification request accepted');
        expect(api.post).toHaveBeenLastCalledWith('/notification/broadcast', {
            audience: 'ALL_USERS', title: 'Platform update', body: 'A message for all users.', type: 'PROMO',
        });

        await user.click(screen.getByRole('button', { name: 'Send another' }));
        await user.click(screen.getByRole('button', { name: /customers/i }));
        await user.type(screen.getByLabelText('Notification title'), 'Customer update');
        await user.type(screen.getByLabelText('Message'), 'A message for customers.');
        await user.click(screen.getByRole('button', { name: /send notification/i }));
        await waitFor(() => expect(api.post).toHaveBeenLastCalledWith('/notification/broadcast', {
            audience: 'ALL_CUSTOMERS', title: 'Customer update', body: 'A message for customers.', type: 'PROMO',
        }));
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
