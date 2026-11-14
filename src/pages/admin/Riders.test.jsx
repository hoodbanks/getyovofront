import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Riders from './Riders';
import RiderModal from '../../components/admin/RiderModal';
import CreateRiderModal from '../../components/admin/CreateRiderModal';
import api from '../../api/api';

vi.mock('../../api/api', () => ({ default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() } }));
vi.mock('../../store/useAuthStore', () => ({ useAuthStore: (selector) => selector({ accessToken: 'admin-token' }) }));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const rider = {
    id: 'rider_1', name: 'Tomi Ade', email: null, phone: '+2348000000001', vehicleName: null,
    vehiclePlate: null, address: null, isActive: true, isSuspended: false, isVerified: true,
    deliveriesDone: 15, status: 'ON_DELIVERY', joinedAt: { day: 2, month: 11, year: 2026 },
};

const ridersResponse = {
    success: true,
    data: {
        summary: { total: 12, active: 7, inactive: 2, suspended: 1, onDelivery: 2 },
        riders: { data: [rider], total: 1, page: 1, pageSize: 20 },
    },
};

const orderPoolResponse = {
    success: true,
    data: {
        data: [{
            orderId: 'order_1', code: 'GY-EXAMPLE', customerName: 'Kai Example', customerPhone: '+2348000000002',
            vendorId: null, vendorStoreName: 'Example Store', pickupAddress: '1 Market Road, Awka',
            deliveryAddress: '2 Example Close, Awka', deliveryLatitude: null, deliveryLongitude: null,
            shopType: { id: 'restaurant', name: 'Restaurant' }, totalAmountKobo: 327000, totalAmountNaira: 3270,
            deliveryFeeKobo: 80000, paidAt: null, readyAt: '2026-11-02T08:30:00.000Z',
        }],
        total: 1, page: 1, pageSize: 20,
    },
};

const overviewResponse = {
    success: true,
    data: {
        rider: { name: 'Tomi Ade', phone: '+2348000000001', email: null, address: null, vehicleName: null, vehiclePlate: null, joinedAt: { day: 2, month: 11, year: 2026 } },
        metrics: { totalKm: 42, completedOrders: 15, cancelledOrders: 1, avgKmPerOrder: 2.8 },
        summary: { totalOrders: 17, deliveredOrders: 15, cancelledOrders: 1 },
    },
};

const deliveriesResponse = {
    success: true,
    data: {
        orders: [{ code: 'GY-EXAMPLE', deliveredAt: { date: 2, month: 11, year: 2026, time: '10:30:00' }, vendorStore: 'Example Store', pickup: '1 Market Road, Awka', dropoff: '2 Example Close, Awka', distanceKm: 2.8, status: 'DELIVERED' }],
        total: 41, page: 1, pageSize: 20,
    },
};

const renderWithClient = (node) => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    return render(<QueryClientProvider client={queryClient}>{node}</QueryClientProvider>);
};

beforeEach(() => {
    api.get.mockImplementation(async (path) => {
        if (path.startsWith('/superadmin/riders/order-pool?')) return orderPoolResponse;
        if (path.startsWith('/superadmin/riders/search?')) return { success: true, data: { data: [rider], total: 1, page: 1, pageSize: 20 } };
        if (path.startsWith('/superadmin/riders?')) return ridersResponse;
        if (path === '/shop-types/get-all') return { success: true, data: [{ id: 'restaurant', name: 'Restaurant' }] };
        if (path.startsWith('/superadmin/riders/rider_1/overview?')) return overviewResponse;
        if (path.startsWith('/superadmin/riders/rider_1/deliveries?')) return deliveriesResponse;
        throw new Error(`Unexpected GET ${path}`);
    });
});

afterEach(() => cleanup());

describe('Super Admin Rider screens', () => {
    it('loads dashboard and directory data using fixed-page API parameters, with truthful Rider status', async () => {
        renderWithClient(<Riders />);

        expect(await screen.findByText('Tomi Ade')).toBeTruthy();
        expect(screen.getAllByText('Out for Delivery')).toHaveLength(2);
        expect(screen.getByText('12')).toBeTruthy();
        expect(api.get).toHaveBeenCalledWith('/superadmin/riders?filter=all&sortBy=date_newest&page=1', 'admin-token');
        expect(api.get).not.toHaveBeenCalledWith(expect.stringContaining('limit='), 'admin-token');
    });

    it('uses the dedicated server-side search route and displays nullable legacy fields as Not provided', async () => {
        const user = userEvent.setup();
        renderWithClient(<Riders />);

        await screen.findByText('Tomi Ade');
        await user.type(screen.getByPlaceholderText('Search name, email, phone, or plate'), 'Tomi');
        await waitFor(() => expect(api.get).toHaveBeenCalledWith('/superadmin/riders/search?query=Tomi&page=1', 'admin-token'));
        await waitFor(() => expect(screen.getAllByText('Not provided').length).toBeGreaterThanOrEqual(2));
    });

    it('loads a read-only Super Admin order pool with exact fields, pagination shape, and no assign action', async () => {
        const user = userEvent.setup();
        renderWithClient(<Riders />);

        await screen.findByText('Tomi Ade');
        await user.click(screen.getByRole('button', { name: 'Order Pool' }));
        expect(await screen.findByText('GY-EXAMPLE')).toBeTruthy();
        expect(screen.getByText(/2 Example Close, Awka/)).toBeTruthy();
        expect(screen.getByText(/3,270/)).toBeTruthy();
        expect(screen.getByText(/read-only/i)).toBeTruthy();
        expect(screen.queryByRole('button', { name: /assign rider/i })).toBeNull();
        expect(api.get).toHaveBeenCalledWith('/superadmin/riders/order-pool?page=1', 'admin-token');
        expect(api.get).not.toHaveBeenCalledWith(expect.stringContaining('/rider/orders/available'), expect.anything());
        expect(api.get).not.toHaveBeenCalledWith(expect.stringContaining('limit='), 'admin-token');
    });

    it('shows backend errors instead of presenting a failed request as an empty directory', async () => {
        api.get.mockRejectedValue(new Error('Rider columns are unavailable'));
        renderWithClient(<Riders />);

        expect(await screen.findByText('Rider columns are unavailable')).toBeTruthy();
        expect(screen.queryByText('No riders found.')).toBeNull();
        expect(screen.getAllByRole('button', { name: 'Retry' }).length).toBeGreaterThan(0);
    });

    it('loads profile metrics and delivered history, keeps null legacy fields explicit, and sends date filters to both routes', async () => {
        const user = userEvent.setup();
        renderWithClient(<RiderModal isOpen rider={rider} onClose={vi.fn()} />);

        expect(await screen.findByText('Orders assigned')).toBeTruthy();
        expect(screen.getAllByText('Not provided').length).toBeGreaterThanOrEqual(4);
        expect(api.get).toHaveBeenCalledWith('/superadmin/riders/rider_1/overview?filter=all', 'admin-token');

        await user.click(screen.getByRole('button', { name: 'All time' }));
        await user.click(screen.getByRole('button', { name: 'Today' }));
        await waitFor(() => expect(api.get).toHaveBeenCalledWith('/superadmin/riders/rider_1/overview?filter=today', 'admin-token'));
        await user.click(screen.getByRole('button', { name: 'Deliveries' }));
        expect(await screen.findByText('GY-EXAMPLE')).toBeTruthy();
        expect(screen.getByText('DELIVERED')).toBeTruthy();
        expect(api.get).toHaveBeenCalledWith('/superadmin/riders/rider_1/deliveries?filter=today&page=1', 'admin-token');
        expect(screen.getByText('Page 1 of 3')).toBeTruthy();
        await user.click(screen.getByRole('button', { name: 'Next' }));
        await waitFor(() => expect(api.get).toHaveBeenCalledWith('/superadmin/riders/rider_1/deliveries?filter=today&page=2', 'admin-token'));
    });

    it('submits inclusive custom dates to overview and deliveries without native date inputs', async () => {
        const user = userEvent.setup();
        renderWithClient(<RiderModal isOpen rider={rider} onClose={vi.fn()} />);

        await screen.findByText('Orders assigned');
        await user.click(screen.getByRole('button', { name: 'All time' }));
        await user.click(screen.getByRole('button', { name: 'Custom dates' }));
        const dateDialog = screen.getByRole('dialog', { name: 'Custom Date' });
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const from = `${year}-${month}-01`;
        const to = `${year}-${month}-10`;

        await user.click(within(dateDialog).getByRole('button', { name: 'Choose start date *' }));
        await user.click(within(dateDialog).getByRole('button', { name: '1', exact: true }));
        await user.click(within(dateDialog).getByRole('button', { name: 'Choose end date *' }));
        await user.click(within(dateDialog).getByRole('button', { name: '10', exact: true }));
        await user.click(within(dateDialog).getByRole('button', { name: 'Apply' }));

        await waitFor(() => expect(api.get).toHaveBeenCalledWith(`/superadmin/riders/rider_1/overview?filter=custom&from=${from}&to=${to}`, 'admin-token'));
        expect(document.querySelector('input[type="date"]')).toBeNull();
        await user.click(screen.getByRole('button', { name: 'Deliveries' }));
        await waitFor(() => expect(api.get).toHaveBeenCalledWith(`/superadmin/riders/rider_1/deliveries?filter=custom&page=1&from=${from}&to=${to}`, 'admin-token'));
    });

    it('keeps accepted, out-for-delivery, and delivered states distinct', async () => {
        const user = userEvent.setup();
        renderWithClient(<RiderModal isOpen rider={{ ...rider, status: 'RIDER_ACCEPTED' }} onClose={vi.fn()} />);

        expect(await screen.findByText('Accepted')).toBeTruthy();
        expect(screen.queryByText('Out for Delivery')).toBeNull();
        await user.click(screen.getByRole('button', { name: 'Deliveries' }));
        expect(await screen.findByText('DELIVERED')).toBeTruthy();
        expect(screen.queryByText('RIDER_ACCEPTED')).toBeNull();
    });

    it('requires confirmation for suspend/delete and uses the documented Super Admin mutations', async () => {
        const user = userEvent.setup();
        api.patch.mockResolvedValue({ success: true, message: 'Rider suspended' });
        api.delete.mockResolvedValue({ success: true, message: 'Rider deleted' });
        renderWithClient(<RiderModal isOpen rider={rider} onClose={vi.fn()} />);

        await screen.findByRole('heading', { name: 'Tomi Ade' });
        await user.click(screen.getAllByRole('button', { name: 'Suspend', exact: true }).at(-1));
        expect(screen.getByText('Suspend Rider Account')).toBeTruthy();
        await user.click(screen.getAllByRole('button', { name: 'Suspend', exact: true }).at(-1));
        await waitFor(() => expect(api.patch).toHaveBeenCalledWith('/superadmin/riders/rider_1/suspension', { suspend: true }, 'admin-token'));

        await user.click(screen.getByRole('button', { name: 'Delete account' }));
        expect(screen.getByText(/Historical orders will remain/)).toBeTruthy();
        await user.click(screen.getByRole('button', { name: 'Delete', exact: true }));
        await waitFor(() => expect(api.delete).toHaveBeenCalledWith('/superadmin/riders', { riderId: 'rider_1' }, 'admin-token'));
    });

    it('restores a suspended Rider without setting them online or verified', async () => {
        const user = userEvent.setup();
        api.patch.mockResolvedValue({ success: true, message: 'Rider restored' });
        renderWithClient(<RiderModal isOpen rider={{ ...rider, status: 'SUSPENDED', isSuspended: true, isActive: false, isVerified: false }} onClose={vi.fn()} />);

        await screen.findByRole('heading', { name: 'Tomi Ade' });
        await user.click(screen.getByRole('button', { name: 'Restore' }));
        expect(screen.getByText(/does not verify the Rider or put them online/i)).toBeTruthy();
        await user.click(screen.getAllByRole('button', { name: 'Restore', exact: true }).at(-1));
        await waitFor(() => expect(api.patch).toHaveBeenCalledWith('/superadmin/riders/rider_1/suspension', { suspend: false }, 'admin-token'));
    });

    it('validates and submits the required Rider registration fields without marking the new account active', async () => {
        const user = userEvent.setup();
        api.post.mockResolvedValue({ success: true, message: 'Rider created', data: { id: 'rider_new', isActive: false, isVerified: false } });
        renderWithClient(<CreateRiderModal isOpen onClose={vi.fn()} />);

        await user.type(screen.getByPlaceholderText('e.g John'), 'Ada Rider');
        await user.type(screen.getByPlaceholderText('e.g. 08012345678'), '08012345678');
        await user.type(screen.getByPlaceholderText('e.g. john@example.com'), 'ada@example.com');
        await user.type(screen.getByPlaceholderText('e.g. 12 Admiralty Way, Lekki, Lagos'), 'Awka, Anambra State');
        await user.type(screen.getByPlaceholderText('e.g Toyota Corolla'), 'Motorcycle');
        await user.type(screen.getByPlaceholderText('e.g ABC-123XY'), 'AWK-123AB');
        await user.click(screen.getByRole('button', { name: 'Create Rider' }));

        await waitFor(() => expect(api.post).toHaveBeenCalledWith('/superadmin/riders/register', {
            name: 'Ada Rider', phonenumber: '08012345678', email: 'ada@example.com', address: 'Awka, Anambra State', vehicleName: 'Motorcycle', vehiclePlate: 'AWK-123AB',
        }, 'admin-token'));
        expect(await screen.findByText(/pending verification and offline/i)).toBeTruthy();
    });

    it('shows a validation message and makes no registration request for an invalid phone number', async () => {
        const user = userEvent.setup();
        renderWithClient(<CreateRiderModal isOpen onClose={vi.fn()} />);

        await user.type(screen.getByPlaceholderText('e.g John'), 'Ada Rider');
        await user.type(screen.getByPlaceholderText('e.g. 08012345678'), '123');
        await user.click(screen.getByRole('button', { name: 'Create Rider' }));

        expect(await screen.findByText(/Enter a Nigerian phone number/i)).toBeTruthy();
        expect(api.post).not.toHaveBeenCalled();
    });
});
