import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Orders from './Orders';
import api from '../../api/api';

vi.mock('../../api/api', () => ({ default: { get: vi.fn() } }));
vi.mock('../../store/useAuthStore', () => ({ useAuthStore: (selector) => selector({ accessToken: 'admin-token' }) }));

const rowReceived = {
    id: 'order-received', orderCode: 'GY-REC', customerName: 'Kai Example', customerPhone: '+2348000000001',
    vendorStoreName: 'Example Store', riderName: null, status: 'RECEIVED', paymentStatus: 'PAID',
    orderTime: '2026-11-02T08:00:00.000Z', etaOrDelivered: null, distanceKm: 2, totalAmount: 3270,
};
const rowInTransit = { ...rowReceived, id: 'order-transit', orderCode: 'GY-TRANSIT', status: 'OUT_FOR_DELIVERY', riderName: 'Tomi Ade' };
const summary = { totalOrders: 1, pendingOrders: 1, inTransitOrders: 1, deliveredToday: 0, cancelledOrders: 0 };
let response;

const renderPage = () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    return render(<QueryClientProvider client={client}><Orders /></QueryClientProvider>);
};

beforeEach(() => {
    response = { success: true, data: { summary, orders: { data: [rowReceived, rowInTransit], total: 2, page: 1, pageSize: 20 }, latestOrders: [] } };
    api.get.mockImplementation(async (path) => {
        if (path.startsWith('/superadmin/orders?')) return response;
        if (path === '/superadmin/orders/order-received/overview') return { success: true, data: { order: { ...rowReceived, orderCode: undefined, orderTime: undefined, distanceKm: undefined, totalAmount: undefined, deliveryAddress: null, items: [] } } };
        throw new Error(`Unexpected GET ${path}`);
    });
});

afterEach(() => cleanup());

describe('Super Admin Orders screen', () => {
    it('uses the documented main list route, displays paid RECEIVED and OUT_FOR_DELIVERY data without deriving statuses', async () => {
        renderPage();
        expect(await screen.findByText('GY-REC')).toBeTruthy();
        expect(screen.getByText('RECEIVED')).toBeTruthy();
        expect(screen.getByText('OUT FOR DELIVERY')).toBeTruthy();
        expect(screen.getByText('Paid Orders')).toBeTruthy();
        expect(within(screen.getByText('In Transit').closest('.relative')).getByText('1')).toBeTruthy();
        expect(api.get).toHaveBeenCalledWith('/superadmin/orders?page=1&filter=all&sortBy=all', 'admin-token');
        expect(api.get.mock.calls[0][0]).not.toContain('limit=');
    });

    it('sends pending as the documented server-side order-state filter', async () => {
        const user = userEvent.setup();
        renderPage();
        await screen.findByText('GY-REC');
        await user.click(screen.getByRole('button', { name: 'All Status' }));
        await user.click(screen.getByRole('button', { name: 'Pending' }));
        await waitFor(() => expect(api.get).toHaveBeenCalledWith('/superadmin/orders?page=1&filter=all&sortBy=pending', 'admin-token'));
    });

    it('uses data.orders pagination and ignores the compatibility latestOrders array', async () => {
        response = { success: true, data: { summary, orders: { data: [rowReceived], total: 41, page: 1, pageSize: 20 }, latestOrders: [{ ...rowReceived, orderCode: 'LEGACY-ONLY' }] } };
        const user = userEvent.setup();
        renderPage();
        expect(await screen.findByText('GY-REC')).toBeTruthy();
        expect(screen.queryByRole('columnheader', { name: 'ETA / Delivered' })).toBeNull();
        expect(screen.queryByText('LEGACY-ONLY')).toBeNull();
        await user.click(screen.getByRole('button', { name: /Next/ }));
        await waitFor(() => expect(api.get).toHaveBeenCalledWith('/superadmin/orders?page=2&filter=all&sortBy=all', 'admin-token'));
    });

    it('shows a successful empty paginated result as an empty state', async () => {
        response = { success: true, data: { summary: { ...summary, totalOrders: 0, pendingOrders: 0, inTransitOrders: 0 }, orders: { data: [], total: 0, page: 1, pageSize: 20 } } };
        renderPage();
        expect(await screen.findByText('No orders found')).toBeTruthy();
        expect(screen.queryByText('Failed to load orders')).toBeNull();
    });

    it('keeps paid summary counts server-owned and does not count an unpaid PENDING checkout row', async () => {
        response = { success: true, data: {
            summary: { ...summary, totalOrders: 1, pendingOrders: 1 },
            orders: { data: [rowReceived], total: 1, page: 1, pageSize: 20 },
            latestOrders: [{ ...rowReceived, id: 'unpaid', orderCode: 'UNPAID-CHECKOUT', status: 'PENDING', paymentStatus: 'PENDING' }],
        } };
        renderPage();
        const paidCard = await screen.findByText('Paid Orders');
        await waitFor(() => expect(within(paidCard.closest('.relative')).getByText('1')).toBeTruthy());
        expect(screen.queryByText('UNPAID-CHECKOUT')).toBeNull();
    });

    it('sends custom inclusive date values with the main list request', async () => {
        const user = userEvent.setup();
        renderPage();
        await screen.findByText('GY-REC');
        await user.click(screen.getByRole('button', { name: 'All Time' }));
        await user.click(screen.getByRole('button', { name: 'Custom range' }));
        expect(await screen.findByRole('dialog', { name: 'Custom Date' })).toBeTruthy();
        expect(document.querySelector('input[type="date"]')).toBeNull();
        await user.click(screen.getByRole('button', { name: 'Choose start date *' }));
        await user.click(screen.getByRole('button', { name: '1', exact: true }));
        await user.click(screen.getByRole('button', { name: 'Choose end date *' }));
        await user.click(screen.getByRole('button', { name: '2', exact: true }));
        await user.click(screen.getByRole('button', { name: 'Apply' }));
        await waitFor(() => {
            const requestPath = api.get.mock.calls.map(([path]) => path).find((path) => path.includes('filter=custom'));
            expect(requestPath).toBeTruthy();
            const params = new URLSearchParams(requestPath.split('?')[1]);
            expect(params.get('from')).toMatch(/^\d{4}-\d{2}-01$/);
            expect(params.get('to')).toMatch(/^\d{4}-\d{2}-02$/);
        });
    });

    it('loads the order overview and renders nullable Rider and ETA fields as not available', async () => {
        const user = userEvent.setup();
        renderPage();
        await screen.findByText('GY-REC');
        await user.click(screen.getByRole('button', { name: 'Open details for GY-REC' }));
        expect(await screen.findByRole('dialog', { name: 'Order details' })).toBeTruthy();
        expect(await screen.findByText('Payment status')).toBeTruthy();
        expect(screen.getAllByText('GY-REC').length).toBeGreaterThanOrEqual(2);
        expect(screen.getByText('2 km')).toBeTruthy();
        expect(screen.getAllByText('₦3,270.00').length).toBeGreaterThanOrEqual(2);
        expect(screen.queryByText('Africa/Lagos')).toBeNull();
        expect(screen.getAllByText('Not available').length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText('Note for rider').parentElement.textContent).toContain('Not available');
        expect(screen.queryByText('Cancel reason')).toBeNull();
        expect(api.get).toHaveBeenCalledWith('/superadmin/orders/order-received/overview', 'admin-token');
    });

    it('shows the vendor cancel reason and the rider note on order details', async () => {
        api.get.mockImplementation(async (path) => {
            if (path.startsWith('/superadmin/orders?')) return response;
            if (path === '/superadmin/orders/order-received/overview') return { success: true, data: { order: {
                ...rowReceived,
                status: 'CANCELLED',
                riderInstruction: 'Call when you arrive. Gate code 2241',
                cancellationReason: { code: 'OUT_OF_STOCK', label: 'Out of stock', note: 'The jollof sold out' },
                items: [],
            } } };
            throw new Error(`Unexpected GET ${path}`);
        });
        const user = userEvent.setup();
        renderPage();
        await screen.findByText('GY-REC');
        await user.click(screen.getByRole('button', { name: 'Open details for GY-REC' }));
        expect(await screen.findByText('Cancel reason')).toBeTruthy();
        expect(screen.getByText('Cancel reason').parentElement.textContent).toContain('Out of stock');
        expect(screen.getByText('Cancel note').parentElement.textContent).toContain('The jollof sold out');
        expect(screen.getByText('Note for rider').parentElement.textContent).toContain('Call when you arrive. Gate code 2241');
    });

    it('uses overview legacy aliases for code, time, and Naira total while preserving a null distance', async () => {
        api.get.mockImplementation(async (path) => {
            if (path.startsWith('/superadmin/orders?')) return response;
            if (path === '/superadmin/orders/order-received/overview') return { success: true, data: { order: {
                ...rowReceived, orderCode: null, code: 'LEGACY-CODE', orderTime: null,
                placedAt: '2026-11-02T08:00:00.000Z', totalAmount: null, totalAmountPaid: 4321,
                distanceKm: null, items: [],
            } } };
            throw new Error(`Unexpected GET ${path}`);
        });
        const user = userEvent.setup();
        renderPage();
        await screen.findByText('GY-REC');
        await user.click(screen.getByRole('button', { name: 'Open details for GY-REC' }));
        expect((await screen.findAllByText('LEGACY-CODE')).length).toBeGreaterThanOrEqual(2);
        expect(screen.getByText('Order time').parentElement.textContent).toContain('9:00');
        expect(screen.getByText('₦4,321.00')).toBeTruthy();
        expect(screen.getByText('Distance').parentElement.textContent).toContain('Not available');
    });
});
