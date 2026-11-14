import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import App from '../../App';
import AuditEvents from './AuditEvents';
import api from '../../api/api';

vi.mock('../../firebase', () => ({ messaging: null, getToken: vi.fn(), onMessage: vi.fn() }));
vi.mock('../../api/api', () => ({ default: { get: vi.fn(), post: vi.fn() } }));
vi.mock('../../store/useAuthStore', () => ({
    useAuthStore: (selector) => {
        const state = {
            accessToken: 'admin-token',
            isAuthenticated: true,
            logout: vi.fn(),
            superAdmin: { id: 'admin_current', firstname: 'Ada', lastname: 'Okonkwo', email: 'ada@example.com' },
        };
        return typeof selector === 'function' ? selector(state) : state;
    },
}));
vi.mock('../../store/useStore', () => ({
    useStore: () => ({
        isSidebarCollapsed: false,
        toggleSidebar: vi.fn(),
        toggleMobileMenu: vi.fn(),
        isMobileMenuOpen: false,
        setMobileMenuOpen: vi.fn(),
    }),
}));

const coverageNote = 'Central audit coverage begins at migration 051 deploy. Domain event tables remain authoritative for money workflows. This is not a complete historical audit log.';
const adminEvent = {
    id: 'audit_admin',
    occurredAt: '2026-11-04T12:00:00.000Z',
    actorKind: 'AUTHENTICATED_ADMIN',
    actorAdminId: 'admin_1',
    actor: { id: 'admin_1', firstname: 'Ada', lastname: 'Okonkwo', username: 'ada_okonkwo', email: 'ada@example.com' },
    action: 'vendor.suspended',
    targetType: 'vendor',
    targetId: 'vendor_1',
    outcome: 'SUCCESS',
    reason: 'Policy violation',
    before: { isSuspended: false },
    after: { isSuspended: true, accountLast4: '6789', otpCode: 'secret-otp' },
    requestId: 'request_1',
    sourceEventType: 'VendorSuspension',
    sourceEventId: 'source_1',
    idempotencyKey: 'idem_1',
};
const bootstrapEvent = {
    ...adminEvent,
    id: 'audit_bootstrap',
    occurredAt: '2026-11-03T12:00:00.000Z',
    actorKind: 'BOOTSTRAP',
    actorAdminId: null,
    actor: null,
    action: 'superadmin.account.created',
    targetType: 'superadmin',
    targetId: 'admin_1',
    reason: null,
    before: null,
    after: null,
    requestId: null,
    sourceEventType: null,
    sourceEventId: null,
    idempotencyKey: null,
};
const announcementEvent = {
    ...adminEvent,
    id: 'audit_announcement',
    actor: { id: 'admin_2', firstname: 'cypher', lastname: 'cypher' },
    action: 'announcement.published',
    targetType: 'announcement',
    targetId: 'announcement_1',
    before: null,
    after: { status: 'PUBLISHED', audience: 'CUSTOMERS', publishedAt: '2026-11-04T16:44:03.816Z', pushEnabled: false },
};
const placementEvent = {
    ...adminEvent,
    id: 'audit_placement',
    action: 'promotion_placement.changed',
    targetType: 'promotion_placement',
    targetId: 'placement_1',
    before: { kind: 'product', change: 'status', isActive: false, placementId: 'placement_1', promotionId: 'promotion_1' },
    after: { kind: 'product', change: 'status', isActive: true, placementId: 'placement_1', promotionId: 'promotion_1' },
};
const list = (events = [adminEvent, bootstrapEvent], page = 1, total = events.length) => ({
    success: true,
    message: 'Super Admin audit events fetched successfully',
    data: { coverageNote, events, pagination: { page, limit: 20, total, totalPages: Math.max(1, Math.ceil(total / 20)) } },
});

const renderPage = (ui = <AuditEvents />) => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    return render(<QueryClientProvider client={client}><MemoryRouter initialEntries={['/admin/audit']}>{ui}</MemoryRouter></QueryClientProvider>);
};

beforeEach(() => {
    api.get.mockImplementation(async (path) => {
        if (path.startsWith('/superadmin/audit-events/')) {
            const id = decodeURIComponent(path.split('/').pop());
            const event = id === bootstrapEvent.id ? bootstrapEvent : adminEvent;
            return { success: true, data: { coverageNote, event } };
        }
        if (path === '/superadmin/promotions/promotion_1') return { success: true, data: { promotion: { id: 'promotion_1', title: 'Weekend Specials', placements: [{ id: 'placement_1', product: { name: 'Jollof Rice' } }] } } };
        const params = new URLSearchParams(path.split('?')[1]);
        return list(undefined, Number(params.get('page') || 1), 21);
    });
});
afterEach(() => cleanup());

describe('Super Admin audit trail', () => {
    it('adds the page to the Platform navigation and admin route', async () => {
        renderPage(<App />);
        expect(await screen.findByRole('link', { name: 'Audit trail' })).toBeTruthy();
        expect(screen.getAllByRole('heading', { name: 'Audit trail' }).length).toBeGreaterThan(0);
        expect(screen.getByText('Review recorded Super Admin actions and inspect event details.')).toBeTruthy();
        expect(screen.queryByRole('button', { name: /export/i })).toBeNull();
        expect(screen.queryByLabelText(/outcome|status/i)).toBeNull();
    });

    it('requests the documented list and keeps the returned order', async () => {
        renderPage();
        expect(await screen.findByText('Ada Okonkwo')).toBeTruthy();
        const rows = screen.getAllByRole('row').map((row) => row.textContent);
        expect(rows[1]).toContain('Vendor suspended');
        expect(rows[2]).toContain('Bootstrap setup');
        expect(api.get).toHaveBeenCalledWith('/superadmin/audit-events?page=1&limit=20', 'admin-token');
        expect(screen.queryByText('Coverage')).toBeNull();
        expect(screen.queryByText(/migration 051/i)).toBeNull();
    });

    it('keeps filters when paging and returns to page 1 when a filter changes', async () => {
        const user = userEvent.setup();
        renderPage();
        await screen.findByText('Ada Okonkwo');
        await user.click(screen.getByRole('button', { name: 'All actions' }));
        await user.click(screen.getByRole('button', { name: 'Vendor suspended' }));
        await waitFor(() => expect(api.get).toHaveBeenCalledWith('/superadmin/audit-events?page=1&limit=20&action=vendor.suspended', 'admin-token'));
        await user.click(screen.getByRole('button', { name: /next/i }));
        await waitFor(() => expect(api.get).toHaveBeenCalledWith('/superadmin/audit-events?page=2&limit=20&action=vendor.suspended', 'admin-token'));
        await user.click(screen.getByRole('button', { name: 'Reset filters' }));
        await waitFor(() => expect(api.get).toHaveBeenCalledWith('/superadmin/audit-events?page=1&limit=20', 'admin-token'));
    });

    it('uses custom date controls and does not request an invalid date range', async () => {
        const user = userEvent.setup();
        renderPage();
        await screen.findByText('Ada Okonkwo');
        expect(screen.queryByDisplayValue(/2026/)).toBeNull();
        await user.click(screen.getByRole('button', { name: 'Choose from' }));
        await user.click(screen.getByRole('button', { name: '5', exact: true }));
        await user.click(screen.getByRole('button', { name: 'Choose to' }));
        await user.click(screen.getByRole('button', { name: '1', exact: true }));
        expect(await screen.findByText(/from` must be less than or equal to `to/)).toBeTruthy();
        const sentReversedRange = api.get.mock.calls.some(([path]) => {
            const params = new URLSearchParams(String(path).split('?')[1]);
            const from = params.get('from');
            const to = params.get('to');
            return Boolean(from && to && new Date(from) > new Date(to));
        });
        expect(sentReversedRange).toBe(false);
    });

    it('loads detail for the selected event, including a null actor and absent snapshots', async () => {
        const user = userEvent.setup();
        renderPage();
        await screen.findByText('Bootstrap setup');
        await user.click(screen.getAllByRole('button', { name: 'View' })[1]);
        expect(await screen.findByText('audit_bootstrap')).toBeTruthy();
        expect(api.get).toHaveBeenCalledWith('/superadmin/audit-events/audit_bootstrap', 'admin-token');
        const dialog = screen.getByRole('dialog');
        expect(dialog.textContent).toContain('Bootstrap setup');
        expect(dialog.textContent).toContain('superadmin.account.created');
        expect(dialog.textContent).toContain('Not recorded');
        expect(dialog.textContent).not.toContain('idem_1');
    });

    it('shows source identifiers and restricts secrets in the selected snapshot', async () => {
        const user = userEvent.setup();
        renderPage();
        await screen.findByText('Ada Okonkwo');
        await user.click(screen.getAllByRole('button', { name: 'View' })[0]);
        const dialog = await screen.findByRole('dialog');
        expect(await screen.findByText('VendorSuspension · source_1')).toBeTruthy();
        expect(dialog.textContent).toContain('request_1');
        expect(dialog.textContent).toContain('idem_1');
        expect(dialog.textContent).toContain('audit_admin');
        expect(dialog.textContent).toContain('6789');
        expect(dialog.textContent).toContain('Restricted');
        expect(dialog.textContent).not.toContain('secret-otp');
    });

    it('formats actor names and clearly shows announcement audience without migration wording', async () => {
        api.get.mockImplementation(async (path) => {
            if (path === '/superadmin/audit-events?page=1&limit=20') return list([announcementEvent], 1, 1);
            if (path === '/superadmin/audit-events/audit_announcement') return { success: true, data: { coverageNote, event: announcementEvent } };
            throw new Error(`Unexpected GET ${path}`);
        });
        const user = userEvent.setup();
        renderPage();
        expect(await screen.findByText('Cypher Cypher')).toBeTruthy();
        expect(screen.getByText('Announcement')).toBeTruthy();
        await user.click(screen.getByRole('button', { name: 'View' }));
        const dialog = await screen.findByRole('dialog');
        expect(dialog.textContent).toContain('Customers');
        expect(dialog.textContent).toContain('Cypher Cypher');
        expect(dialog.textContent).toContain('Nov 4, 2026');
        expect(dialog.textContent).not.toContain('2026-11-04T16:44:03.816Z');
        expect(dialog.textContent).not.toMatch(/migration/i);
        expect(within(dialog).getAllByRole('heading', { name: 'After' })).toHaveLength(1);
        expect(within(dialog).getAllByRole('heading', { name: 'Before' })).toHaveLength(1);
    });

    it('shows the promotion and product names with a readable visibility change', async () => {
        api.get.mockImplementation(async (path) => {
            if (path === '/superadmin/audit-events?page=1&limit=20') return list([placementEvent], 1, 1);
            if (path === '/superadmin/audit-events/audit_placement') return { success: true, data: { coverageNote, event: placementEvent } };
            if (path === '/superadmin/promotions/promotion_1') return { success: true, data: { promotion: { id: 'promotion_1', title: 'Weekend Specials', placements: [{ id: 'placement_1', product: { name: 'Jollof Rice' } }] } } };
            throw new Error(`Unexpected GET ${path}`);
        });
        const user = userEvent.setup();
        renderPage();
        expect(await screen.findByText(/Visibility: Hidden/)).toBeTruthy();
        await user.click(screen.getByRole('button', { name: 'View' }));
        const dialog = await screen.findByRole('dialog');
        expect(await within(dialog).findByText('Weekend Specials')).toBeTruthy();
        expect(dialog.textContent).toContain('Jollof Rice');
        expect(dialog.textContent).toContain('Visibility: Hidden');
        expect(dialog.textContent).toContain('Visible');
        expect(dialog.textContent).toContain('placement_1');
    });

    it('shows an empty result, a format error, and API failures separately', async () => {
        api.get.mockResolvedValueOnce(list([], 1, 0));
        const { unmount } = renderPage();
        expect(await screen.findByText('No audit events yet')).toBeTruthy();
        unmount();

        api.get.mockResolvedValueOnce({ success: true, data: { events: [] } });
        const second = renderPage();
        expect(await screen.findByText(/did not match the documented format/)).toBeTruthy();
        second.unmount();

        api.get.mockRejectedValueOnce(Object.assign(new Error('Unauthorized'), { status: 401 }));
        const third = renderPage();
        expect((await screen.findByRole('alert')).textContent).toContain('session has expired');
        third.unmount();

        api.get.mockRejectedValueOnce(Object.assign(new Error('Please wait 60 seconds'), { status: 429, retryAfter: '60' }));
        renderPage();
        expect((await screen.findByRole('alert')).textContent).toContain('Please wait 60 seconds');
        expect(screen.getByRole('alert').textContent).toContain('Retry-After 60');
        expect(screen.getByRole('button', { name: 'Retry' })).toBeTruthy();
    });

    it('shows a not-found detail without changing the list', async () => {
        api.get.mockImplementation(async (path) => {
            if (path.startsWith('/superadmin/audit-events/')) {
                throw Object.assign(new Error('Audit event not found.'), { status: 404 });
            }
            return list([adminEvent], 1, 1);
        });
        const user = userEvent.setup();
        renderPage();
        await screen.findByText('Ada Okonkwo');
        await user.click(screen.getByRole('button', { name: 'View' }));
        const dialog = await screen.findByRole('dialog');
        expect((await screen.findByText('Audit event not found.')).closest('[role="alert"]')).toBeTruthy();
        expect(dialog.textContent).toContain('Audit event not found.');
        expect(screen.getByText('Ada Okonkwo')).toBeTruthy();
    });
});
