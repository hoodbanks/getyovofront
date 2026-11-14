import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import Vendors from './Vendors';
import api from '../../api/api';

vi.mock('../../api/api', () => ({ default: { get: vi.fn(), patch: vi.fn(), delete: vi.fn() } }));
vi.mock('../../store/useAuthStore', () => ({ useAuthStore: (selector) => selector({ accessToken: 'admin-token' }) }));
vi.mock('sonner', () => ({ toast: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() }), default: vi.fn() }));

const approvedClosedVendor = { id: 'vendor-1', storeName: 'Closed Store', ownerName: 'Ada Vendor', email: 'ada@example.com', phonenumber: '+2348000000000', address: 'Street', createdAt: '2026-10-20T11:00:00.000Z', totalOrders: 2, isVerified: true, isSuspended: false, storeStatus: 'CLOSED' };
const summary = { totalVendors: 5, approvedVendors: 3, activeVendors: 2, pendingVendors: 1, suspendedVendors: 1 };
const wallet = { vendorId: 'vendor-1', walletExists: true, balanceNaira: 12000, totalWithdrawalsPaidNaira: 3000, completedWithdrawalCount: 2, reservedWithdrawalAmountNaira: 500, pendingWithdrawalCount: 1, processingWithdrawalCount: 1, totalOrderCreditsNaira: 18000, totalReversalsNaira: 1000 };

const renderPage = (initialEntry = '/admin/vendors') => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    return render(<QueryClientProvider client={client}><MemoryRouter initialEntries={[initialEntry]}><Vendors/></MemoryRouter></QueryClientProvider>);
};

beforeEach(() => {
    api.get.mockImplementation(async (path) => {
        if (path === '/superadmin/vendors?filter=all&sortBy=date_newest&page=1&limit=20') return { data: { summary, data: [approvedClosedVendor], total: 1, page: 1, pageSize: 20 } };
        if (path === '/superadmin/vendors?filter=pending&sortBy=date_newest&page=1&limit=20') return { data: { summary, data: [approvedClosedVendor], total: 1, page: 1, pageSize: 20 } };
        if (path === '/superadmin/vendors?filter=all&sortBy=date_newest&page=1&limit=1') return { data: { summary, data: [], total: 5, page: 1, pageSize: 1 } };
        if (path === '/superadmin/vendors/vendor-1/overview?filter=all') return { data: { storeName: 'Closed Store', ownerName: 'Ada Vendor', isVerified: true, isSuspended: false, status: 'INACTIVE', storeStatus: 'CLOSED', metrics: { totalOrders: 2, deliveredOrders: 1, cancelledOrders: 0 } } };
        if (path === '/superadmin/vendor-wallets/vendor-1') return { data: wallet };
        throw new Error(`Unexpected GET ${path}`);
    });
});

afterEach(() => cleanup());

describe('Super Admin Vendors screen', () => {
    it('opens directly on pending vendors when linked from the dashboard', async () => {
        renderPage('/admin/vendors?filter=pending');
        await screen.findByText('Closed Store');
        expect(api.get).toHaveBeenCalledWith('/superadmin/vendors?filter=pending&sortBy=date_newest&page=1&limit=20', 'admin-token');
    });

    it('shows account status independently from a closed store status', async () => {
        renderPage();
        await screen.findByText('Closed Store');
        expect(screen.getByText('Approved Vendors').parentElement.textContent).toContain('3');
        expect(screen.queryByText('Active Vendors')).toBeNull();
        expect(screen.getByText('active')).toBeTruthy();
        expect(screen.getByText('Oct 20, 2026')).toBeTruthy();
        expect(api.get).toHaveBeenCalledWith('/superadmin/vendors?filter=all&sortBy=date_newest&page=1&limit=1', 'admin-token');
    });

    it('uses vendorId to load wallet metrics separately from date-filtered order metrics', async () => {
        const user = userEvent.setup();
        renderPage();
        await screen.findByText('Closed Store');
        await user.click(screen.getByRole('button', { name: 'View details for Closed Store' }));
        expect(await screen.findByText('Vendor Wallet')).toBeTruthy();
        expect(screen.getByText('Store status').parentElement.textContent).toContain('CLOSED');
        expect(screen.getByText('active')).toBeTruthy();
        expect(screen.getByText('ada@example.com')).toBeTruthy();
        expect(screen.getByText('₦12,000.00')).toBeTruthy();
        expect(screen.getByText('Completed withdrawals · manual transfers recorded')).toBeTruthy();
        expect(screen.getByText(/Lifetime wallet measures/)).toBeTruthy();
        expect(screen.queryByText('Payout Account')).toBeNull();
        expect(screen.queryByText('Earnings reversals')).toBeNull();
        expect(screen.queryByText('Processing withdrawals')).toBeNull();
        expect(screen.queryByText('Total Payout')).toBeNull();
        expect(api.get).toHaveBeenCalledWith('/superadmin/vendors/vendor-1/overview?filter=all', 'admin-token');
        expect(api.get).toHaveBeenCalledWith('/superadmin/vendor-wallets/vendor-1', 'admin-token');
    });

    it('keeps email out of the table and shows the remaining vendor columns without an email column', async () => {
        renderPage();
        await screen.findByText('Closed Store');
        expect(screen.queryByRole('columnheader', { name: 'Email' })).toBeNull();
        expect(screen.getByRole('columnheader', { name: 'Address' })).toBeTruthy();
        expect(screen.queryByText('ada@example.com')).toBeNull();
    });

    it('uses the custom calendar modal instead of native date inputs', async () => {
        const user = userEvent.setup();
        renderPage();
        await screen.findByText('Closed Store');
        await user.click(screen.getByRole('button', { name: 'Choose vendor date range' }));
        expect(await screen.findByRole('dialog', { name: 'Custom Date' })).toBeTruthy();
        expect(document.querySelector('input[type="date"]')).toBeNull();
        expect(document.querySelector('select')).toBeNull();
    });

    it('does not render zero summary values when the summary request fails', async () => {
        api.get.mockImplementation(async (path) => {
            if (path.includes('page=1&limit=1')) throw new Error('Vendor summary unavailable');
            if (path.includes('/overview?')) return { data: {} };
            if (path.includes('/vendor-wallets/')) return { data: wallet };
            return { data: { data: [approvedClosedVendor], total: 1, page: 1, pageSize: 20 } };
        });
        renderPage();
        expect(await screen.findByText('Vendor summary unavailable')).toBeTruthy();
        expect(screen.queryByText('Approved Vendors').parentElement.textContent).toContain('—');
    });
});
