import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import VendorModal from './VendorModal';
import api from '../../api/api';
import { toast } from 'sonner';

vi.mock('../../api/api', () => ({ default: { get: vi.fn(), patch: vi.fn(), delete: vi.fn() } }));
vi.mock('../../store/useAuthStore', () => ({ useAuthStore: (selector) => selector({ accessToken: 'admin-token' }) }));
vi.mock('sonner', () => ({ toast: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() }), default: vi.fn() }));

afterEach(() => cleanup());

describe('Vendor approval conflict handling', () => {
    it('shows the backend 409 message and does not mark an incomplete vendor approved', async () => {
        const user = userEvent.setup();
        const vendor = { id: 'vendor-pending', storeName: 'Incomplete Store', ownerName: 'Ada Vendor', isVerified: false, status: 'PENDING' };
        api.get.mockImplementation(async (path) => {
            if (path === '/superadmin/vendors/vendor-pending/overview?filter=all') return { success: true, data: { ...vendor, metrics: { totalOrders: 0, deliveredOrders: 0, cancelledOrders: 0 } } };
            if (path === '/superadmin/vendor-wallets/vendor-pending') return { success: true, data: { vendorId: 'vendor-pending', walletExists: false, balanceNaira: 0 } };
            throw new Error(`Unexpected GET ${path}`);
        });
        const conflict = new Error('Complete the store profile before approving this vendor.');
        conflict.status = 409;
        api.patch.mockRejectedValueOnce(conflict);
        const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });

        render(<QueryClientProvider client={client}><VendorModal isOpen vendor={vendor} onClose={vi.fn()} /></QueryClientProvider>);
        await user.click(await screen.findByRole('button', { name: 'Approve vendor' }));

        await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Complete the store profile before approving this vendor.'));
        expect(screen.getByRole('button', { name: 'Approve vendor' })).toBeTruthy();
        expect(api.patch).toHaveBeenCalledWith('/superadmin/vendors/vendor-pending/verify', { isVerified: true }, 'admin-token');
    });
});

describe('Vendor paid-order overview metrics', () => {
    const renderVendor = () => {
        const vendor = { id: 'vendor-paid', storeName: 'Paid Metrics Store', ownerName: 'Ada Vendor', isVerified: true, status: 'ACTIVE', storeStatus: 'OPEN' };
        const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
        return render(<QueryClientProvider client={client}><VendorModal isOpen vendor={vendor} onClose={vi.fn()} /></QueryClientProvider>);
    };

    it('shows separate all-order and all-time paid metrics from vendor data.metrics', async () => {
        api.get.mockImplementation(async (path) => {
            if (path.startsWith('/superadmin/vendors/vendor-paid/overview?filter=')) return { success: true, data: { metrics: { totalOrders: 8, cancelledOrders: 3, deliveredOrders: 2, paidOrders: 5, paidCancelledOrders: 1 } } };
            if (path === '/superadmin/vendor-wallets/vendor-paid') return { success: true, data: { walletExists: false } };
            throw new Error(`Unexpected GET ${path}`);
        });
        const user = userEvent.setup();
        renderVendor();
        expect(await screen.findByText('All orders')).toBeTruthy();
        expect(screen.getByText('All cancelled')).toBeTruthy();
        expect(screen.getByText('Paid orders · All time')).toBeTruthy();
        expect(screen.getByText('Paid cancelled · All time')).toBeTruthy();
        expect(screen.getByText('All-order counts follow the selected date filter; paid counts are all-time.')).toBeTruthy();
        expect(screen.getByText('All orders').parentElement.textContent).toContain('8');
        const openStoreBadge = screen.getByText('OPEN');
        expect(openStoreBadge.className).toContain('text-emerald-800');
        expect(screen.getByText('All cancelled').parentElement.textContent).toContain('3');
        expect(screen.getByText('Paid orders · All time').parentElement.textContent).toContain('5');
        expect(screen.getByText('Paid cancelled · All time').parentElement.textContent).toContain('1');
        await user.click(screen.getByRole('button', { name: 'All Time' }));
        await user.click(screen.getByRole('button', { name: 'Last 7 Days' }));
        await waitFor(() => expect(api.get).toHaveBeenCalledWith('/superadmin/vendors/vendor-paid/overview?filter=last7days', 'admin-token'));
        expect(screen.getByText('Paid orders · All time').parentElement.textContent).toContain('5');
    });

    it('shows unavailable for missing paid metrics and supports overview error retry', async () => {
        let fail = true;
        api.get.mockImplementation(async (path) => {
            if (path === '/superadmin/vendors/vendor-paid/overview?filter=all') {
                if (fail) throw new Error('Vendor overview unavailable');
                return { success: true, data: { metrics: { totalOrders: 8, cancelledOrders: 3 } } };
            }
            if (path === '/superadmin/vendor-wallets/vendor-paid') return { success: true, data: { walletExists: false } };
            throw new Error(`Unexpected GET ${path}`);
        });
        const user = userEvent.setup();
        renderVendor();
        expect((await screen.findByRole('alert')).textContent).toContain('Vendor overview unavailable');
        fail = false;
        await user.click(screen.getByRole('button', { name: 'Retry' }));
        expect(await screen.findByText('Paid orders · All time')).toBeTruthy();
        expect(screen.getByText('Paid orders · All time').parentElement.textContent).toContain('—');
        expect(screen.getByText('Paid cancelled · All time').parentElement.textContent).toContain('—');
        expect(screen.getByText('All orders').parentElement.textContent).toContain('8');
    });

    it('uses explicit Vendor Wallet measures without relabeling estimated totals as payouts', async () => {
        api.get.mockImplementation(async (path) => {
            if (path.startsWith('/superadmin/vendors/vendor-paid/overview?filter=')) return { success: true, data: { metrics: { totalOrders: 1, cancelledOrders: 0 } } };
            if (path === '/superadmin/vendor-wallets/vendor-paid') return { success: true, data: { walletExists: true, balanceKobo: 125000, balanceNaira: 1250, totalOrderCreditsKobo: 650000, totalOrderCreditsNaira: 6500, totalReversalsKobo: 425000, totalReversalsNaira: 4250, netOrderEarningsKobo: 225000, netOrderEarningsNaira: 2250, totalWithdrawalsPaidKobo: 100000, totalWithdrawalsPaidNaira: 1000, reservedWithdrawalAmountKobo: 0, reservedWithdrawalAmountNaira: 0, pendingWithdrawalCount: 0 } };
            throw new Error(`Unexpected GET ${path}`);
        });
        renderVendor();
        expect(await screen.findByText('Available wallet balance')).toBeTruthy();
        expect(screen.getByText('Gross order credits').parentElement.textContent).toContain('6,500.00');
        expect(screen.getByText('Earnings reversed').parentElement.textContent).toContain('4,250.00');
        expect(screen.getByText('Net order earnings').parentElement.textContent).toContain('2,250.00');
        expect(screen.getByText(/Completed withdrawals · manual transfers recorded/).parentElement.textContent).toContain('1,000.00');
        expect(screen.queryByText(/Total Payout/i)).toBeNull();
    });
});
