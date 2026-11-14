import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from './Dashboard';
import api from '../../api/api';
import { formatCompactChartDate, lagosDateInputInstant } from '../../utils/formatters';

vi.mock('../../api/api', () => ({ default: { get: vi.fn() } }));
vi.mock('../../store/useAuthStore', () => ({ useAuthStore: () => ({ accessToken: 'admin-token' }) }));

const summary = {
    totalUsers: 2, totalCustomers: 2, verifiedCustomers: 1, unverifiedCustomers: 1,
    totalVendors: 3, totalRiders: 2, totalOrders: 4, ordersToday: 1,
    totalRevenueKobo: 220000, totalRevenue: 2200, platformCommissionKobo: 32000,
    grossPaidOrderValueKobo: 220000, grossPaidOrderValueNaira: 2200,
    customerOrderRefundsKobo: 25000, customerOrderRefundsNaira: 250,
    paidCancelledOrderCount: 1, paidCancelledOrderValueKobo: 50000, paidCancelledOrderValueNaira: 500,
    deliveryFeesOnPaidOrdersKobo: 32000, deliveryFeesOnPaidOrdersNaira: 320,
    platformFeesEarnedKobo: 12000, platformFeesEarnedNaira: 120,
    platformCommission: 320, pendingVendorWithdrawals: 2, pendingReferralWithdrawals: 1,
};

const dashboardResponse = (dataSummary = summary) => ({ data: {
    summary: dataSummary,
    orders: { data: [], pagination: { page: 1, limit: 20, total: 0 } },
    topVendors: { data: [], pagination: { page: 1, limit: 20, total: 0 } },
    topRiders: { data: [], pagination: { page: 1, limit: 20, total: 0 } },
    riderActivity: { online: 0, offline: 2, avgDeliveryTime: 0 },
} });

const renderDashboard = () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    return render(<QueryClientProvider client={queryClient}><Dashboard /></QueryClientProvider>);
};

beforeEach(() => {
    api.get.mockImplementation(async (path) => {
        if (path === '/superadmin/dashboard?page=1&limit=20') return dashboardResponse();
        if (path === '/superadmin/analytics') return { data: { revenueGraph: { data: [] }, ordersGraph: { data: [] } } };
        throw new Error(`Unexpected GET ${path}`);
    });
});

afterEach(() => cleanup());

describe('Super Admin dashboard', () => {
    it('formats chart dates with short month names and correct ordinal suffixes', () => {
        expect(formatCompactChartDate({ date: 2, month: 11, year: 2026 })).toBe('2nd Nov');
        expect(formatCompactChartDate({ day: 30, month: 11, year: 2026 })).toBe('30th Nov');
        expect(formatCompactChartDate('2026-11-03T08:18:00.000Z')).toMatch(/^3rd Nov$/);
        expect(formatCompactChartDate('2026-11-03')).toBe('3rd Nov');
        expect(formatCompactChartDate('2026-11-02T23:30:00.000Z')).toBe('3rd Nov');
        expect(lagosDateInputInstant('2026-10-29', 'start')).toBe('2026-10-28T23:00:00.000Z');
        expect(lagosDateInputInstant('2026-10-29', 'end')).toBe('2026-10-29T22:59:59.999Z');
    });

    it('loads the documented dashboard URL and maps all metrics and helper text from the API', async () => {
        renderDashboard();
        expect(await screen.findByText('Total Customers')).toBeTruthy();
        expect(api.get).toHaveBeenCalledWith('/superadmin/dashboard?page=1&limit=20', 'admin-token');
        const customerCard = screen.getByText('Total Customers').closest('.relative');
        await waitFor(() => expect(within(customerCard).getByText('2')).toBeTruthy());
        expect(screen.getByText('All registered customer accounts.')).toBeTruthy();
        expect(screen.getByText('Verified Customers')).toBeTruthy();
        expect(screen.getByText('Customers who verified their phone number.')).toBeTruthy();
        expect(screen.getByText('Unverified Customers')).toBeTruthy();
        expect(screen.getByText('Customers who have not verified their phone number.')).toBeTruthy();
        expect(screen.getByText('Total Vendors')).toBeTruthy();
        expect(screen.getByText('All registered vendor accounts.')).toBeTruthy();
        expect(screen.getByText('Total Riders')).toBeTruthy();
        expect(screen.getByText('All registered rider accounts.')).toBeTruthy();
        expect(screen.getByText('Paid Orders')).toBeTruthy();
        expect(screen.getByText('Orders with confirmed payment.')).toBeTruthy();
        expect(screen.getByText('Paid Orders Today')).toBeTruthy();
        expect(screen.getByText('Paid orders whose payment time is on the current Lagos calendar day.')).toBeTruthy();
        expect(screen.queryByText(/Africa\/Lagos/)).toBeNull();
        expect(screen.getAllByText('Gross paid order value').length).toBeGreaterThan(0);
        expect(screen.getByText('₦2,200.00')).toBeTruthy();
        expect(screen.getByText('Historical paid-order value, including delivery fees; may include orders later cancelled.')).toBeTruthy();
        expect(screen.getByText('Customer Wallet refunds')).toBeTruthy();
        expect(screen.getByText('Paid cancelled orders')).toBeTruthy();
        expect(screen.getByText('Delivery fees on paid orders')).toBeTruthy();
        expect(screen.getByText('Platform fees earned')).toBeTruthy();
        expect(screen.getByText('₦320.00')).toBeTruthy();
        expect(screen.getByText('Pending Vendor Withdrawals')).toBeTruthy();
        expect(screen.getByText('Vendor requests awaiting admin action.')).toBeTruthy();
        expect(screen.getByText('Pending Referral Withdrawals')).toBeTruthy();
        expect(screen.getByText('Referral requests awaiting review.')).toBeTruthy();
        expect(screen.queryByText('Vendor Payout')).toBeNull();
        expect(screen.queryByText('₦0.00')).toBeNull();
        expect(screen.getByText('Orders Overview')).toBeTruthy();
        expect(document.querySelector('a[href="/admin/vendors?filter=pending"]')).toBeTruthy();
        expect(document.querySelector('a[href="mailto:support@getyovo.app?subject=Super%20Admin%20support%20issue"]')).toBeTruthy();
        expect(screen.getByText('Top vendors')).toBeTruthy();
        expect(screen.getByText('Top Riders')).toBeTruthy();
        expect(screen.getByText('Riders Activity')).toBeTruthy();
        const vendorWithdrawalCard = screen.getByText('Pending Vendor Withdrawals').closest('.relative');
        const referralWithdrawalCard = screen.getByText('Pending Referral Withdrawals').closest('.relative');
        expect(within(vendorWithdrawalCard).getByText('2')).toBeTruthy();
        expect(within(referralWithdrawalCard).getByText('1')).toBeTruthy();
    });

    it('hides a lifetime gap that is longer than a real trip', async () => {
        api.get.mockImplementation(async (path) => {
            if (path === '/superadmin/dashboard?page=1&limit=20') {
                const response = dashboardResponse();
                response.data.riderActivity = { online: 1, offline: 1, avgDeliveryTime: '796.50524166666666665' };
                response.data.topRiders = { data: [{ id: 'rider-1', name: 'Staging Rider', deliveries: 2, avgTime: '796.51', status: 'ONLINE' }], pagination: { page: 1, limit: 20, total: 1 } };
                return response;
            }
            if (path === '/superadmin/analytics') return { data: { revenueGraph: { data: [] }, ordersGraph: { data: [] } } };
            throw new Error(`Unexpected GET ${path}`);
        });
        renderDashboard();
        expect(await screen.findByText('Total Customers')).toBeTruthy();
        expect(screen.queryByText(/796/)).toBeNull();
        expect(screen.getAllByText('—').length).toBeGreaterThan(0);
    });

    it('loads when Postgres returns average delivery time as a numeric string', async () => {
        api.get.mockImplementation(async (path) => {
            if (path === '/superadmin/dashboard?page=1&limit=20') {
                const response = dashboardResponse();
                response.data.riderActivity = { online: 1, offline: 1, avgDeliveryTime: '18.5', deliveryTimeSampleSize: 2 };
                return response;
            }
            if (path === '/superadmin/analytics') return { data: { revenueGraph: { data: [] }, ordersGraph: { data: [] } } };
            throw new Error(`Unexpected GET ${path}`);
        });
        renderDashboard();
        expect(await screen.findByText('18.50 mins')).toBeTruthy();
        expect(screen.getByText(/Trips over 3 hours are left out/)).toBeTruthy();
        expect(screen.queryByText(/missing rider activity metrics/i)).toBeNull();
    });

    it('renders one customer when totalCustomers is 1 even if legacy totalUsers is 0', async () => {
        api.get.mockImplementation(async (path) => {
            if (path === '/superadmin/dashboard?page=1&limit=20') return dashboardResponse({ ...summary, totalCustomers: 1, totalUsers: 0, verifiedCustomers: 0, unverifiedCustomers: 1 });
            if (path === '/superadmin/analytics') return { data: { revenueGraph: { data: [] }, ordersGraph: { data: [] } } };
            throw new Error(`Unexpected GET ${path}`);
        });
        renderDashboard();
        const customerLabel = await screen.findByText('Total Customers');
        const customerCard = customerLabel.closest('.relative');
        await waitFor(() => expect(within(customerCard).getByText('1')).toBeTruthy());
        expect(within(customerCard).queryByText('0')).toBeNull();
        const verifiedLabel = screen.getByText('Verified Customers');
        expect(within(verifiedLabel.closest('.relative')).getByText('0')).toBeTruthy();
    });

    it('keeps the orders overview compact, shortens month names, and links to the full Orders page', async () => {
        api.get.mockImplementation(async (path) => {
            if (path === '/superadmin/dashboard?page=1&limit=20') return { data: {
                ...dashboardResponse().data,
                orders: { data: [{ id: 'order-1', code: 'NS-J0090X', createdAt: '2026-11-03T08:18:00.000Z', riderAssignedAt: '2026-11-03T08:20:00.000Z', readyAt: '2026-11-03T08:25:00.000Z', outForDeliveryAt: '2026-11-03T08:30:00.000Z', deliveredAt: '2026-11-03T08:40:00.000Z', customerName: 'Test Receiver', customer: { id: 'customer-1' }, vendor: { id: 'vendor-1', storeName: 'Yovo Test Kitchen 839d' }, rider: null, status: 'RIDER_ACCEPTED', etaMin: 21, etaMax: 26 }], pagination: { page: 1, limit: 20, total: 1 } },
            } };
            if (path === '/superadmin/analytics') return { data: { revenueGraph: { data: [] }, ordersGraph: { data: [] } } };
            throw new Error(`Unexpected GET ${path}`);
        });
        renderDashboard();
        expect(await screen.findByText('NS-J0090X')).toBeTruthy();
        const acceptedStatus = screen.getByText('Rider accepted');
        expect(acceptedStatus.closest('td').className).toContain('whitespace-nowrap');
        expect(acceptedStatus.closest('td').className).not.toContain('truncate');
        expect(screen.getByText('3 Nov 2026')).toBeTruthy();
        expect(screen.getByText('21–26 min')).toBeTruthy();
        expect(screen.getByRole('link', { name: 'View all orders' }).getAttribute('href')).toBe('/admin/orders');
        const orderTable = screen.getByText('NS-J0090X').closest('table');
        expect(orderTable.className).toContain('table-fixed');
        expect(orderTable.closest('div').className).toContain('overflow-hidden');
    });

    it('loads the matching directory rider profile and opens the same full detail panel from Orders Overview', async () => {
        const user = userEvent.setup();
        const profile = { id: 'rider-1', name: 'Tomi Ade', phone: '+2348000000001', email: 'tomi@example.com', address: 'Awka', vehicleName: 'Motorcycle', vehiclePlate: 'AWK-123AB', joinedAt: '2026-10-02', status: 'ACTIVE', isSuspended: false };
        api.get.mockImplementation(async (path) => {
            if (path === '/superadmin/dashboard?page=1&limit=20') return { data: {
                ...dashboardResponse().data,
                orders: { data: [{ id: 'order-1', code: 'GY-ORDER1', createdAt: '2026-11-03T08:18:00.000Z', customerName: 'Customer', vendor: null, rider: { id: 'rider-1', name: 'Tomi Ade' }, status: 'RIDER_ACCEPTED' }], pagination: { page: 1, limit: 20, total: 1 } },
            } };
            if (path === '/superadmin/analytics') return { data: { revenueGraph: { data: [] }, ordersGraph: { data: [] } } };
            if (path === '/superadmin/riders/search?query=Tomi+Ade&page=1') return { data: { data: [profile], total: 1, page: 1, pageSize: 20 } };
            if (path === '/superadmin/riders/rider-1/overview?filter=all') return { data: { rider: profile, metrics: { totalKm: 10, completedOrders: 3, cancelledOrders: 0, avgKmPerOrder: 3.3 }, summary: { totalOrders: 3 } } };
            throw new Error(`Unexpected GET ${path}`);
        });
        renderDashboard();
        await user.click(await screen.findByRole('button', { name: 'Tomi Ade' }));
        expect((await screen.findAllByText('+2348000000001')).length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText('AWK-123AB')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Deliveries' })).toBeTruthy();
        expect(api.get).toHaveBeenCalledWith('/superadmin/riders/search?query=Tomi+Ade&page=1', 'admin-token');
        expect(api.get).toHaveBeenCalledWith('/superadmin/riders/rider-1/overview?filter=all', { accessToken: 'admin-token' });
        expect(screen.queryByRole('status')).toBeNull();
    });

    it('uses lifecycle timestamps from the selected dashboard row when the overview omits them', async () => {
        const user = userEvent.setup();
        api.get.mockImplementation(async (path) => {
            if (path === '/superadmin/dashboard?page=1&limit=20') return { data: {
                ...dashboardResponse().data,
                orders: { data: [{ id: 'order-1', code: 'NS-J0090X', createdAt: '2026-11-03T08:18:00.000Z', orderReceivedAt: '2026-11-03T08:18:30.000Z', preparingAt: '2026-11-03T08:19:00.000Z', riderAssignedAt: '2026-11-03T08:20:00.000Z', readyAt: '2026-11-03T08:25:00.000Z', outForDeliveryAt: '2026-11-03T08:30:00.000Z', deliveredAt: '2026-11-03T08:40:00.000Z', status: 'RIDER_ACCEPTED' }], pagination: { page: 1, limit: 20, total: 1 } },
            } };
            if (path === '/superadmin/analytics') return { data: { revenueGraph: { data: [] }, ordersGraph: { data: [] } } };
            if (path === '/superadmin/orders/order-1/overview') return { success: true, data: { order: { id: 'order-1', status: 'RIDER_ACCEPTED', items: [] } } };
            throw new Error(`Unexpected GET ${path}`);
        });
        renderDashboard();
        await user.click(await screen.findByRole('button', { name: 'Open details for NS-J0090X' }));
        expect(await screen.findByRole('dialog', { name: 'Order details' })).toBeTruthy();
        for (const label of ['Order received at', 'Preparing at', 'Accepted at', 'Ready at', 'Out for delivery at', 'Delivered at']) {
            expect(screen.getByText(label).parentElement.textContent).not.toContain('Not available');
        }
        expect(screen.getByText('Order received at').parentElement.textContent).toContain('9:18');
        expect(screen.getByText('Preparing at').parentElement.textContent).toContain('9:19');
        expect(screen.getByText('Accepted at').parentElement.textContent).toContain('9:20');
        expect(screen.getByText('Ready at').parentElement.textContent).toContain('9:25');
        expect(screen.getByText('Out for delivery at').parentElement.textContent).toContain('9:30');
        expect(screen.getByText('Delivered at').parentElement.textContent).toContain('9:40');
    });

    it('shows the vendor account as active when Top vendors only has store status OPEN', async () => {
        const user = userEvent.setup();
        api.get.mockImplementation(async (path) => {
            if (path === '/superadmin/dashboard?page=1&limit=20') return { data: {
                ...dashboardResponse().data,
                topVendors: { data: [{ id: 'vendor-1', name: 'Yovo Test Kitchen', totalOrders: 2, deliveredVendorSalesNaira: 4500, status: 'OPEN', isVerified: true, isSuspended: false }], pagination: { page: 1, limit: 20, total: 1 } },
            } };
            if (path === '/superadmin/analytics') return { data: { revenueGraph: { data: [] }, ordersGraph: { data: [] } } };
            if (path === '/superadmin/vendors/vendor-1/overview?filter=all') return { data: { storeName: 'Yovo Test Kitchen', ownerName: 'Staging Vendor', storeType: 'Restaurants', phone: '+2348000000000', email: 'vendor@example.com', address: 'Awka', isVerified: true, isSuspended: false, storeStatus: 'OPEN', metrics: { totalOrders: 2, deliveredOrders: 2, cancelledOrders: 0, paidOrders: 2, paidCancelledOrders: 0 } } };
            if (path === '/superadmin/vendor-wallets/vendor-1') return { data: { walletExists: false } };
            throw new Error(`Unexpected GET ${path}`);
        });
        renderDashboard();
        await user.click(await screen.findByRole('button', { name: 'View Yovo Test Kitchen' }));
        expect(await screen.findByText('Vendor details')).toBeTruthy();
        expect(screen.getByText('ACTIVE')).toBeTruthy();
        expect(screen.queryByText('UNKNOWN')).toBeNull();
        expect(screen.getByText('OPEN')).toBeTruthy();
    });

    it('keeps populated Top Vendors and Top Riders rows compact without horizontal scrolling', async () => {
        api.get.mockImplementation(async (path) => {
            if (path === '/superadmin/dashboard?page=1&limit=20') return { data: {
                ...dashboardResponse().data,
                topVendors: { data: [{ id: 'vendor-1', name: 'A Very Long Example Vendor Name', totalOrders: 12, deliveredVendorSalesNaira: 1200, revenue: 34500, status: 'ACTIVE' }] },
                topRiders: { data: [{ id: 'rider-1', name: 'A Very Long Example Rider Name', deliveries: 8, avgTime: 12.5, status: 'ACTIVE' }] },
            } };
            if (path === '/superadmin/analytics') return { data: { revenueGraph: { data: [] }, ordersGraph: { data: [] } } };
            throw new Error(`Unexpected GET ${path}`);
        });

        renderDashboard();

        const vendorName = await screen.findByText('A Very Long Example Vendor Name');
        const vendorTable = vendorName.closest('table');
        expect(vendorTable.className).toContain('table-fixed');
        expect(vendorTable.closest('div').className).toContain('overflow-hidden');
        expect(vendorTable.closest('div').className).not.toContain('overflow-x-auto');
        expect(within(vendorTable).getByText('Delivered sales')).toBeTruthy();
        expect(within(vendorTable).getByTitle('Delivered vendor sales: ₦1,200.00')).toBeTruthy();
        expect(within(vendorTable).queryByText('₦34,500.00')).toBeNull();

        const riderName = screen.getByText('A Very Long Example Rider Name');
        const riderTable = riderName.closest('table');
        expect(riderTable.className).toContain('table-fixed');
        expect(riderTable.closest('div').className).toContain('overflow-hidden');
        expect(riderTable.closest('div').className).not.toContain('overflow-x-auto');
        expect(within(riderTable).getByText('8')).toBeTruthy();
        expect(within(riderTable).getByText('12.50 mins')).toBeTruthy();
    });

    it('uses totalUsers when totalCustomers is absent and renders its actual zero value', async () => {
        api.get.mockImplementation(async (path) => {
            if (path === '/superadmin/dashboard?page=1&limit=20') return dashboardResponse({ ...summary, totalCustomers: undefined, totalUsers: 0 });
            if (path === '/superadmin/analytics') return { data: { revenueGraph: { data: [] }, ordersGraph: { data: [] } } };
            throw new Error(`Unexpected GET ${path}`);
        });
        renderDashboard();
        const customerLabel = await screen.findByText('Total Customers');
        const customerCard = customerLabel.closest('.relative');
        await waitFor(() => expect(within(customerCard).getByText('0')).toBeTruthy());
    });

    it('shows explicit financial metrics as unavailable instead of using legacy aliases', async () => {
        api.get.mockImplementation(async (path) => {
            if (path === '/superadmin/dashboard?page=1&limit=20') return dashboardResponse({ ...summary, grossPaidOrderValueKobo: undefined, grossPaidOrderValueNaira: undefined });
            if (path === '/superadmin/analytics') return { data: { revenueGraph: { data: [] }, ordersGraph: { data: [] } } };
            throw new Error(`Unexpected GET ${path}`);
        });
        renderDashboard();
        await screen.findAllByText('Gross paid order value');
        await waitFor(() => {
            const label = screen.getAllByText('Gross paid order value')[0];
            expect(label.parentElement.textContent).toContain('—');
            expect(label.parentElement.textContent).not.toContain('2,200.00');
        });
    });

    it('shows a retryable error instead of metric zeros when the dashboard request fails', async () => {
        let dashboardAttempts = 0;
        api.get.mockImplementation(async (path) => {
            if (path === '/superadmin/dashboard?page=1&limit=20') {
                dashboardAttempts += 1;
                if (dashboardAttempts === 1) {
                    const error = new Error('Failed to fetch dashboard');
                    error.status = 500;
                    throw error;
                }
                return dashboardResponse();
            }
            if (path === '/superadmin/analytics') return { data: { revenueGraph: { data: [] }, ordersGraph: { data: [] } } };
            throw new Error(`Unexpected GET ${path}`);
        });
        renderDashboard();
        expect(await screen.findByRole('alert')).toBeTruthy();
        expect(screen.getByText('Failed to fetch dashboard')).toBeTruthy();
        expect(screen.getByText(/getyovo-staging-api\.onrender\.com\/api\/v1\/superadmin\/dashboard.*HTTP 500/)).toBeTruthy();
        expect(screen.queryByText('Total Customers')).toBeNull();
        expect(screen.queryByText('0')).toBeNull();

        await userEvent.setup().click(screen.getByRole('button', { name: 'Retry' }));
        expect(await screen.findByText('Total Customers')).toBeTruthy();
        await waitFor(() => expect(api.get).toHaveBeenCalledWith('/superadmin/dashboard?page=1&limit=20', 'admin-token'));
    });

    it('shows a response-shape error when summary metrics are missing', async () => {
        api.get.mockImplementation(async (path) => {
            if (path === '/superadmin/dashboard?page=1&limit=20') return dashboardResponse({ totalUsers: 3 });
            if (path === '/superadmin/analytics') return { data: { revenueGraph: { data: [] }, ordersGraph: { data: [] } } };
            throw new Error(`Unexpected GET ${path}`);
        });
        renderDashboard();
        expect(await screen.findByText(/missing one or more summary metrics/)).toBeTruthy();
        expect(screen.queryByText('Total Customers')).toBeNull();
    });
});
