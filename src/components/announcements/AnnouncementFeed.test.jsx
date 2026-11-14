import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnnouncementFeed } from './AnnouncementFeed';
import { AnnouncementDetailView } from './AnnouncementView';
import api from '../../api/api';

vi.mock('../../api/api', () => ({ default: { get: vi.fn(), post: vi.fn() } }));

const card = {
    id: 'announcement1',
    title: 'Weekend offer',
    summary: 'See this weekend’s offer',
    audience: 'CUSTOMERS',
    category: 'PROMOTION',
    image: { url: 'https://cdn.example/flyer.png', altText: 'Weekend flyer', width: 800, height: 400 },
    body: { version: 1, blocks: [{ type: 'paragraph', spans: [{ text: 'Hello', bold: true }] }] },
    cta: { label: 'Open store', destination: 'STORE', params: { vendorId: 'vendor_1' } },
    dismissible: true,
};

const renderFeed = () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    return render(<QueryClientProvider client={client}><AnnouncementFeed token="user-token" role="USER" /></QueryClientProvider>);
};

afterEach(() => cleanup());

describe('announcement feed', () => {
    it('reads the active array from data, opens detail, and dismisses once', async () => {
        api.get.mockImplementation(async (path, _token, headers) => {
            expect(headers.role).toBe('USER');
            if (path === '/announcements/active') return { success: true, message: 'Active announcements fetched', data: [card] };
            if (path === '/announcements/announcement1') return { data: card };
            throw new Error(path);
        });
        api.post.mockResolvedValue({ data: { id: 'announcement1', dismissedAt: '2026-11-04T11:00:00.000Z', duplicate: false } });
        const user = userEvent.setup();
        renderFeed();
        expect(await screen.findByText('Weekend offer')).toBeTruthy();
        expect(screen.getByRole('img', { name: 'Weekend flyer' })).toBeTruthy();
        await user.click(screen.getByRole('button', { name: /weekend offer/i }));
        expect(await screen.findByRole('dialog', { name: 'Announcement detail' })).toBeTruthy();
        await user.click(screen.getByRole('button', { name: 'Dismiss' }));
        await waitFor(() => expect(api.post).toHaveBeenCalledWith('/announcements/announcement1/dismiss', {}, 'user-token', { role: 'USER' }));
    });

    it('shows the unavailable message when detail is 404 and hides an unknown destination', async () => {
        api.get.mockImplementation(async (path) => {
            if (path === '/announcements/active') return { data: [{ ...card, cta: { label: 'Secret', destination: 'NOT_A_SCREEN' } }] };
            const error = new Error('This announcement is no longer available.');
            error.status = 404;
            throw error;
        });
        const user = userEvent.setup();
        renderFeed();
        expect(await screen.findByText('Weekend offer')).toBeTruthy();
        expect(screen.queryByText('Secret')).toBeNull();
        await user.click(screen.getByRole('button', { name: /weekend offer/i }));
        expect(await screen.findByText('This announcement is no longer available.')).toBeTruthy();
    });

    it('renders text-only and image-only detail without HTML', () => {
        const { rerender } = render(<AnnouncementDetailView announcement={{ title: 'Text', summary: 'Only text', body: { version: 1, blocks: [{ type: 'bulleted_list', items: [{ spans: [{ text: '<b>nope</b>' }] }] }] } }} />);
        expect(screen.getByText('<b>nope</b>')).toBeTruthy();
        expect(document.querySelector('b')).toBeNull();
        rerender(<AnnouncementDetailView announcement={{ title: 'Image', summary: 'Only image', image: { url: 'https://cdn.example/a.png', altText: 'Flyer alt', width: 1600, height: 900 }, body: null }} />);
        const image = screen.getByRole('img', { name: 'Flyer alt' });
        expect(image.getAttribute('width')).toBe('1600');
    });
});
