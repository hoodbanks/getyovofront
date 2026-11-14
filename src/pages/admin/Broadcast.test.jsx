import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Broadcast from './Broadcast';
import api from '../../api/api';

vi.mock('../../api/api', () => ({ default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), postForm: vi.fn() } }));
vi.mock('../../store/useAuthStore', () => ({ useAuthStore: (selector) => selector({ accessToken: 'admin-token' }) }));

const draft = {
    id: 'announcement1',
    title: 'Weekend offer',
    summary: 'See this weekend’s offer',
    audience: 'CUSTOMERS',
    category: 'PROMOTION',
    status: 'DRAFT',
    body: { version: 1, blocks: [{ type: 'paragraph', spans: [{ text: 'Hello' }] }] },
    image: null,
    cta: null,
    priority: 0,
    dismissible: true,
    pushEnabled: false,
    pushPreview: null,
    recipientCount: 0,
    publishedAt: null,
    endsAt: null,
};

const renderPage = () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    return render(<QueryClientProvider client={client}><Broadcast /></QueryClientProvider>);
};

const fillBasics = async (user) => {
    await user.type(screen.getByLabelText('Title'), 'Weekend offer');
    await user.type(screen.getByLabelText('Summary'), 'See this weekend’s offer');
    await user.click(screen.getByRole('button', { name: 'Add paragraph' }));
    await user.type(screen.getByLabelText('Block text 1'), 'Hello');
};

beforeEach(() => {
    api.get.mockImplementation(async (path) => {
        if (path.startsWith('/superadmin/announcements?')) return { data: { page: 1, limit: 20, total: 0, data: [] } };
        if (path === '/superadmin/announcements/announcement1') return { data: { ...draft, pushCounts: { pending: 2, attempting: 0, accepted: 3, failed: 1, exhausted: 1, noToken: 4, cancelled: 5 }, note: 'accepted = provider accepted at least one send for that account (not device delivery).' } };
        throw new Error(`Unexpected GET ${path}`);
    });
    api.post.mockImplementation(async (path) => {
        if (path === '/superadmin/announcements') return { data: draft };
        if (path === '/superadmin/announcements/announcement1/publish') return { data: { id: 'announcement1', status: 'PUBLISHED', recipientCount: 0, pushQueued: false, pushEnabled: false, duplicate: false, note: 'pushQueued is not device delivery. recipientCount is the publish-time push snapshot, not a live audience size.' } };
        if (path === '/superadmin/announcements/announcement1/deactivate') return { data: { id: 'announcement1', status: 'DEACTIVATED', duplicate: false } };
        throw new Error(`Unexpected POST ${path}`);
    });
    api.patch.mockResolvedValue({ data: draft });
});

afterEach(() => cleanup());

describe('Super Admin broadcast', () => {
    it('saves a text-only draft and does not call the notification broadcast endpoint', async () => {
        const user = userEvent.setup();
        renderPage();
        await screen.findByText('No announcements yet.');
        expect(document.querySelector('select')).toBeNull();
        await fillBasics(user);
        await user.click(screen.getByRole('button', { name: 'Save draft' }));
        await waitFor(() => expect(api.post).toHaveBeenCalledWith('/superadmin/announcements', expect.objectContaining({
            title: 'Weekend offer',
            audience: 'CUSTOMERS',
            body: { version: 1, blocks: [{ type: 'paragraph', spans: [{ text: 'Hello' }] }] },
        }), 'admin-token'));
        const body = api.post.mock.calls[0][1];
        expect(body.imageAssetId).toBeUndefined();
        expect(JSON.stringify(api.post.mock.calls)).not.toContain('/notification/broadcast');
        expect(JSON.stringify(body)).not.toContain('ALL_USERS');
    });

    it('uploads a flyer and saves an image-only draft with the returned asset id', async () => {
        api.postForm.mockResolvedValue({ data: { id: 'asset_01abcd', url: 'https://cdn.example/flyer.png', width: 800, height: 400, format: 'png', bytes: 1200 } });
        const user = userEvent.setup();
        renderPage();
        await user.type(screen.getByLabelText('Title'), 'Flyer only');
        await user.type(screen.getByLabelText('Summary'), 'Image announcement');
        await user.upload(screen.getByLabelText('Flyer image'), new File(['png'], 'flyer.png', { type: 'image/png' }));
        expect(await screen.findByText(/asset_01abcd/)).toBeTruthy();
        await user.type(screen.getByLabelText('Image alt text'), 'Weekend flyer');
        await user.click(screen.getByRole('button', { name: 'Save draft' }));
        await waitFor(() => expect(api.post).toHaveBeenCalledWith('/superadmin/announcements', expect.objectContaining({
            imageAssetId: 'asset_01abcd',
            imageAltText: 'Weekend flyer',
        }), 'admin-token'));
        expect(api.post.mock.calls.find((call) => call[0] === '/superadmin/announcements')[1].body).toBeUndefined();
        expect(api.postForm).toHaveBeenCalledWith('/superadmin/announcements/assets', expect.any(FormData), 'admin-token');
        expect(api.postForm.mock.calls[0][1].get('image')).toBeTruthy();
    });

    it('blocks a customers-and-vendors call to action and sends a store CTA for customers', async () => {
        const user = userEvent.setup();
        renderPage();
        await fillBasics(user);
        await user.click(screen.getByRole('button', { name: 'Audience' }));
        await user.click(screen.getByRole('option', { name: 'Customers and vendors' }));
        expect(screen.getByText(/not supported when the audience is customers and vendors/i)).toBeTruthy();
        await user.click(screen.getByRole('button', { name: 'Audience' }));
        await user.click(screen.getByRole('option', { name: 'Customers' }));
        await user.click(screen.getByLabelText('Add a call to action'));
        await user.type(screen.getByLabelText('Call to action label'), 'Open store');
        await user.click(screen.getByRole('button', { name: 'Call to action destination' }));
        await user.click(screen.getByRole('option', { name: 'Store' }));
        await user.click(screen.getByRole('button', { name: 'Save draft' }));
        expect((await screen.findByRole('alert')).textContent).toMatch(/vendor id/i);
        expect(api.post).not.toHaveBeenCalled();
        await user.type(screen.getByLabelText('Vendor id'), 'vendor_1');
        await user.click(screen.getByRole('button', { name: 'Save draft' }));
        await waitFor(() => expect(api.post).toHaveBeenCalledWith('/superadmin/announcements', expect.objectContaining({
            cta: { label: 'Open store', destination: 'STORE', params: { vendorId: 'vendor_1' } },
        }), 'admin-token'));
    });

    it('reuses the idempotency key when publish fails and shows a zero-recipient result', async () => {
        let attempts = 0;
        api.post.mockImplementation(async (path, _body, _token, headers) => {
            if (path === '/superadmin/announcements') return { data: draft };
            if (path.endsWith('/publish')) {
                attempts += 1;
                if (attempts === 1) throw new Error('Network error');
                expect(headers['Idempotency-Key'].length).toBeGreaterThanOrEqual(8);
                return { data: { status: 'PUBLISHED', recipientCount: 0, pushQueued: false, note: 'pushQueued is not device delivery. recipientCount is the publish-time push snapshot, not a live audience size.' } };
            }
            throw new Error(path);
        });
        const user = userEvent.setup();
        renderPage();
        await fillBasics(user);
        await user.click(screen.getByRole('button', { name: 'Publish' }));
        expect((await screen.findByRole('alert')).textContent).toContain('Network error');
        const firstKey = api.post.mock.calls.find((call) => String(call[0]).endsWith('/publish'))[3]['Idempotency-Key'];
        await user.click(screen.getByRole('button', { name: 'Publish' }));
        expect(await screen.findByText(/No push work was queued/)).toBeTruthy();
        expect(screen.getByText(/zero-recipient campaign does not queue a push/i)).toBeTruthy();
        const secondKey = api.post.mock.calls.filter((call) => String(call[0]).endsWith('/publish'))[1][3]['Idempotency-Key'];
        expect(secondKey).toBe(firstKey);
        expect(screen.queryByRole('term', { name: 'Delivered' })).toBeNull();
    });

    it('disables publish while the request is in flight', async () => {
        let release;
        api.post.mockImplementation((path) => {
            if (path === '/superadmin/announcements') return Promise.resolve({ data: draft });
            return new Promise((resolve) => { release = () => resolve({ data: { status: 'PUBLISHED', recipientCount: 2, pushQueued: true } }); });
        });
        const user = userEvent.setup();
        renderPage();
        await fillBasics(user);
        await user.click(screen.getByRole('button', { name: 'Publish' }));
        const publishing = await screen.findByRole('button', { name: 'Publishing...' });
        expect(publishing.disabled).toBe(true);
        release();
        expect(await screen.findByText(/Push work was queued/)).toBeTruthy();
    });

    it('shows push counts without a delivered claim and deactivates a published campaign', async () => {
        api.get.mockImplementation(async (path) => {
            if (path.startsWith('/superadmin/announcements?')) {
                return { data: { page: 1, limit: 20, total: 1, data: [{ ...draft, status: 'PUBLISHED', recipientCount: 4, publishedAt: '2026-11-04T10:00:00.000Z' }] } };
            }
            return { data: { ...draft, status: 'PUBLISHED', audience: 'CUSTOMERS', recipientCount: 4, pushCounts: { pending: 1, attempting: 1, accepted: 1, failed: 1, exhausted: 1, noToken: 1, cancelled: 1 }, note: 'accepted = provider accepted at least one send for that account (not device delivery).' } };
        });
        const user = userEvent.setup();
        renderPage();
        await user.click(await screen.findByRole('button', { name: 'View' }));
        expect(await screen.findByText('Accepted by provider')).toBeTruthy();
        expect(screen.getByText('Exhausted')).toBeTruthy();
        expect(screen.getByText('No token')).toBeTruthy();
        expect(screen.getByText(/This send was stopped before the delivery service took it/)).toBeTruthy();
        expect(screen.getByText(/does not mean the person saw it/)).toBeTruthy();
        expect(screen.queryByText(/pushCounts\.accepted/)).toBeNull();
        expect(screen.queryByRole('term', { name: 'Delivered' })).toBeNull();
        await user.click(screen.getByRole('button', { name: 'Deactivate' }));
        await waitFor(() => expect(api.post).toHaveBeenCalledWith('/superadmin/announcements/announcement1/deactivate', {}, 'admin-token'));
    });

    it('keeps an empty history distinct from a failed list', async () => {
        renderPage();
        expect(await screen.findByText('No announcements yet.')).toBeTruthy();
        cleanup();
        api.get.mockRejectedValue(new Error('Too many requests, please try again later.'));
        renderPage();
        expect((await screen.findByRole('alert')).textContent).toContain('Too many requests, please try again later.');
        expect(screen.queryByText('No announcements yet.')).toBeNull();
    });
});
