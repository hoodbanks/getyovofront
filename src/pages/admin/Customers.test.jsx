import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Customers from './Customers';
import api from '../../api/api';

vi.mock('../../api/api', () => ({ default: { get: vi.fn(), patch: vi.fn(), delete: vi.fn() } }));
vi.mock('../../store/useAuthStore', () => ({ useAuthStore: (selector) => selector({ accessToken: 'admin-token' }) }));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const customer = {
    id: 'user_ada', firstname: 'Ada', lastname: 'Okonkwo', email: 'ada@example.com',
    phonenumber: '+2348012345678', createdAt: '2026-10-20T11:00:00.000Z',
    isSuspended: false, isPhoneVerified: true, status: 'VERIFIED',
};

const listResponse = {
    data: {
        summary: { totalUsers: 4, activeUsers: 3, suspendedUsers: 1, newThisWeek: 1, totalCustomers: 4, verifiedCustomers: 2, unverifiedCustomers: 2, suspendedCustomers: 1 },
        users: { data: [customer], total: 1, page: 1, pageSize: 20 },
    },
};

const renderPage = () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    return render(<QueryClientProvider client={queryClient}><Customers /></QueryClientProvider>);
};

beforeEach(() => {
    api.get.mockImplementation(async (path) => {
        if (path.startsWith('/superadmin/users?') || path.startsWith('/superadmin/users/search?')) return listResponse;
        if (path === '/superadmin/users/user_ada/overview') return { data: { name: 'Ada Okonkwo', phone: customer.phonenumber, email: customer.email, address: 'Legacy street', addressDetails: { id: 'address-1', userId: 'user_ada', label: 'Home', street: 'Udeke Street', city: 'Awka', state: 'Anambra', formattedAddress: 'Zik Avenue, Awka, Anambra, Nigeria', isDefault: true }, isSuspended: false, isPhoneVerified: true, joinedAt: { date: 20, month: 10, year: 2026 }, lastSeenAt: null, lastLogin: null, lastOrderAt: null, totalOrders: 3, deliveredOrders: 1, cancelledOrders: 1, paidOrders: 2, paidCancelledOrders: 0, totalSpent: 30, totalSpentKobo: 3000, customerOrderRefunds: 15, customerOrderRefundsKobo: 1500, walletBalanceKobo: 150000, totalReferrals: 2, referralCode: 'ADA2026' } };
        if (path === '/superadmin/users/user_ada/orders?page=1&filter=last7days') return { data: { orders: [{ id: 'order_1', code: 'GY1234', vendorStore: 'Solid Foods', date: { date: 28, month: 10, year: 2026 }, status: 'CANCELLED', paymentStatus: 'PENDING', amount: 30, totalAmountKobo: 3000 }], total: 1, page: 1, pageSize: 20 } };
        if (path === '/superadmin/users/user_ada/referrals?page=1') return { data: { totalReferrals: 2, rank: 4, referralCode: 'ADA2026', totalRewardsEarnedKobo: 50000, totalRewardsEarnedNaira: 500, referralWalletBalanceKobo: 50000, referrals: { data: [{ referralId: 'ref_1', referredUserId: 'user_kai', firstname: 'Kai', lastname: 'Example', phonenumber: '+2348011111111', isPhoneVerified: true, isSuspended: false, status: 'VERIFIED', referredAt: '2026-10-21T09:00:00.000Z', rewardState: 'NO_REWARD_YET', rewardCount: 0, rewardAmountKobo: 0, rewardAmountNaira: 0 }], total: 1, page: 1, pageSize: 20 } } };
        if (path === '/superadmin/referral-activities/leaderboard') return { data: { data: [] } };
        throw new Error(`Unexpected GET ${path}`);
    });
});

afterEach(() => cleanup());

describe('Super Admin customers', () => {
    it('shows loading, API summary, six metrics, and phone verification status', async () => {
        let resolveList;
        api.get.mockReturnValueOnce(new Promise((resolve) => { resolveList = resolve; }));
        renderPage();
        expect(screen.getByText('Loading customers...')).toBeTruthy();
        resolveList(listResponse);

        expect(await screen.findByText('Ada Okonkwo')).toBeTruthy();
        expect(screen.getByText('Verified')).toBeTruthy();
        expect(screen.getByText('Active Accounts')).toBeTruthy();
        expect(screen.getByText('Unverified Customers')).toBeTruthy();
        expect(api.get).toHaveBeenCalledWith('/superadmin/users?filter=all&sortBy=date_newest&page=1', 'admin-token');
        expect(api.get).not.toHaveBeenCalledWith(expect.stringContaining('limit='), 'admin-token');
    });

    it('uses the verified filter and the dedicated search endpoint with query parameters', async () => {
        const user = userEvent.setup();
        renderPage();
        await screen.findByText('Ada Okonkwo');
        await user.click(screen.getByRole('button', { name: /all customers/i }));
        await user.click(screen.getByRole('button', { name: 'Verified customers' }));
        await waitFor(() => expect(api.get).toHaveBeenCalledWith('/superadmin/users?filter=verified&sortBy=date_newest&page=1', 'admin-token'));

        await user.type(screen.getByPlaceholderText('Search name, phone, email'), 'ada@example.com');
        await waitFor(() => expect(api.get).toHaveBeenCalledWith('/superadmin/users/search?query=ada%40example.com&page=1', 'admin-token'));
    });

    it('loads live overview, orders, and referral wallet data without invented transaction history', async () => {
        const user = userEvent.setup();
        renderPage();
        await screen.findByText('Ada Okonkwo');
        await user.click(screen.getByRole('button', { name: 'View Ada Okonkwo' }));

        expect(await screen.findByText('Spending Wallet Balance')).toBeTruthy();
        expect(screen.getByText('All orders').parentElement.textContent).toContain('3');
        expect(screen.getByText('All cancelled').parentElement.textContent).toContain('1');
        expect(screen.getByText('Paid orders').parentElement.textContent).toContain('2');
        expect(screen.getByText('Paid cancelled').parentElement.textContent).toContain('0');
        expect(screen.getByText('Customer Wallet refunds').parentElement.textContent).toContain('15.00');
        expect(screen.getByText(/Total Spent · excludes currently cancelled paid orders/)).toBeTruthy();
        expect(screen.getByText(/include unpaid or failed checkouts/)).toBeTruthy();
        expect(screen.getByText('₦1,500.00')).toBeTruthy();
        expect(screen.getByText('No order yet')).toBeTruthy();
        await waitFor(() => expect(screen.getByText('Referral code').parentElement.textContent).toContain('ADA2026'));
        expect(screen.getByText('This code belongs to this customer. People who join with it are attributed to them.')).toBeTruthy();
        expect(screen.getByText('Home · Default')).toBeTruthy();
        expect(screen.getByText('Udeke Street, Awka, Anambra')).toBeTruthy();
        expect(screen.getByText('Zik Avenue, Awka, Anambra, Nigeria')).toBeTruthy();
        expect(api.get).toHaveBeenCalledWith('/superadmin/users/user_ada/overview', 'admin-token');

        await user.click(screen.getByRole('button', { name: 'Orders' }));
        expect(await screen.findByText('GY1234')).toBeTruthy();
        expect(api.get).toHaveBeenCalledWith('/superadmin/users/user_ada/orders?page=1&filter=last7days', 'admin-token');

        await user.click(screen.getByRole('button', { name: 'Referral Activities' }));
        expect(await screen.findByText('Referral wallet balance')).toBeTruthy();
        expect(screen.getAllByText('₦500.00')).toHaveLength(2);
        expect(screen.getByText('Kai Example')).toBeTruthy();
        expect(screen.getByText('No reward yet')).toBeTruthy();
        expect(await screen.findByText('Successful referrals')).toBeTruthy();
        expect(screen.getByText('Successful referrals').parentElement.textContent).toContain('0');
        expect(screen.getByText('Leaderboard rank').parentElement.textContent).toContain('—');
        expect(screen.queryByText('Transactions')).toBeNull();
    });

    it('lists each referral reward and the withdrawal that explains the wallet balance', async () => {
        api.get.mockImplementation(async (path) => {
            if (path.startsWith('/superadmin/users?') || path.startsWith('/superadmin/users/search?')) return listResponse;
            if (path === '/superadmin/users/user_ada/overview') return { data: { name: 'Ada Okonkwo', phone: customer.phonenumber, email: customer.email, isSuspended: false, isPhoneVerified: true, joinedAt: { date: 20, month: 10, year: 2026 }, totalOrders: 1, deliveredOrders: 1, cancelledOrders: 0, paidOrders: 1, paidCancelledOrders: 0, totalSpent: 20, totalSpentKobo: 2000, customerOrderRefunds: 0, customerOrderRefundsKobo: 0, walletBalanceKobo: 0, totalReferrals: 1, referralCode: 'ADA2026' } };
            if (path === '/superadmin/users/user_ada/referrals?page=1') return { data: { totalReferrals: 1, rank: 1, referralCode: 'ADA2026', totalRewardsEarnedKobo: 230000, totalRewardsEarnedNaira: 2300, referralWalletBalanceKobo: 130000, referralWithdrawnKobo: 100000, referralWithdrawnNaira: 1000, walletActivity: [{ id: 'withdrawal-1', kind: 'WITHDRAWAL', effect: 'DEBIT', amountKobo: 100000, amountNaira: 1000, status: 'COMPLETED', createdAt: '2026-11-06T06:32:00.000Z', referredName: null, orderCode: null }, { id: 'reward-later', kind: 'REWARD', effect: 'CREDIT', amountKobo: 200000, amountNaira: 2000, status: 'CREDITED', createdAt: '2026-11-06T06:31:00.000Z', referredName: 'Kai Example', orderCode: 'TU-IM408U' }, { id: 'reward-first', kind: 'REWARD', effect: 'CREDIT', amountKobo: 30000, amountNaira: 300, status: 'CREDITED', createdAt: '2026-11-04T09:21:00.000Z', referredName: 'Kai Example', orderCode: 'NS-JO090X' }], referrals: { data: [{ referralId: 'ref_1', referredUserId: 'user_kai', firstname: 'Kai', lastname: 'Example', phonenumber: '+2348011111111', isPhoneVerified: true, isSuspended: false, status: 'VERIFIED', referredAt: '2026-10-21T09:00:00.000Z', rewardState: 'REWARDED', rewardCount: 2, rewardAmountKobo: 230000, rewardAmountNaira: 2300, rewards: [{ id: 'reward-later', amountKobo: 200000, amountNaira: 2000, createdAt: '2026-11-06T06:31:00.000Z', orderCode: 'TU-IM408U' }, { id: 'reward-first', amountKobo: 30000, amountNaira: 300, createdAt: '2026-11-04T09:21:00.000Z', orderCode: 'NS-JO090X' }] }], total: 1, page: 1, pageSize: 20 } } };
            if (path === '/superadmin/referral-activities/leaderboard') return { data: { data: [{ referrerUserId: 'user_ada', successfulReferrals: 1, rank: 1 }] } };
            throw new Error(`Unexpected GET ${path}`);
        });
        const user = userEvent.setup();
        renderPage();
        await screen.findByText('Ada Okonkwo');
        await user.click(screen.getByRole('button', { name: 'View Ada Okonkwo' }));
        await user.click(await screen.findByRole('button', { name: 'Referral Activities' }));
        expect(await screen.findByText('₦2,300.00 credited − ₦1,000.00 withdrawn = ₦1,300.00')).toBeTruthy();
        expect(screen.getByText('Wallet activity')).toBeTruthy();
        expect(screen.getAllByText('Kai Example').length).toBeGreaterThanOrEqual(2);
        expect(screen.getByText('+₦2,000.00')).toBeTruthy();
        expect(screen.getByText('+₦300.00')).toBeTruthy();
        expect(screen.getByText('−₦1,000.00')).toBeTruthy();
        expect(screen.getAllByText(/TU-IM408U/).length).toBeGreaterThanOrEqual(1);
    });

    it('reveals long wallet activity and referred users in steps', async () => {
        const walletActivity = Array.from({ length: 9 }, (_, index) => ({
            id: `move-${index}`, kind: 'REWARD', effect: 'CREDIT', amountKobo: (index + 1) * 10000, amountNaira: (index + 1) * 100,
            status: 'CREDITED', createdAt: '2026-11-06T06:31:00.000Z', referredName: 'Kai Example', orderCode: `ORDER-${index}`,
        }));
        const rewards = Array.from({ length: 4 }, (_, index) => ({
            id: `line-${index}`, amountKobo: 10000, amountNaira: 100, createdAt: '2026-11-06T06:31:00.000Z', orderCode: `LINE-${index}`,
        }));
        api.get.mockImplementation(async (path) => {
            if (path.startsWith('/superadmin/users?') || path.startsWith('/superadmin/users/search?')) return listResponse;
            if (path === '/superadmin/users/user_ada/overview') return { data: { name: 'Ada Okonkwo', isSuspended: false, isPhoneVerified: true, totalOrders: 0, deliveredOrders: 0, cancelledOrders: 0, paidOrders: 0, paidCancelledOrders: 0, totalSpent: 0, totalSpentKobo: 0, customerOrderRefunds: 0, customerOrderRefundsKobo: 0, walletBalanceKobo: 0, totalReferrals: 1, referralCode: 'ADA2026' } };
            if (path === '/superadmin/users/user_ada/referrals?page=1') return { data: { totalReferrals: 1, rank: 1, referralCode: 'ADA2026', totalRewardsEarnedKobo: 90000, totalRewardsEarnedNaira: 900, referralWalletBalanceKobo: 90000, referralWithdrawnKobo: 0, walletActivity, referrals: { data: [{ referralId: 'ref_1', referredUserId: 'user_kai', firstname: 'Kai', lastname: 'Example', phonenumber: '+2348011111111', isPhoneVerified: true, isSuspended: false, status: 'VERIFIED', referredAt: '2026-10-21T09:00:00.000Z', rewardState: 'REWARDED', rewardCount: 4, rewardAmountKobo: 40000, rewardAmountNaira: 400, rewards }], total: 1, page: 1, pageSize: 20 } } };
            if (path === '/superadmin/referral-activities/leaderboard') return { data: { data: [] } };
            throw new Error(`Unexpected GET ${path}`);
        });
        const user = userEvent.setup();
        renderPage();
        await screen.findByText('Ada Okonkwo');
        await user.click(screen.getByRole('button', { name: 'View Ada Okonkwo' }));
        await user.click(await screen.findByRole('button', { name: 'Referral Activities' }));
        expect(await screen.findByText('Showing 3 of 9')).toBeTruthy();
        expect(screen.queryByText(/ORDER-8/)).toBeNull();
        expect(screen.queryByText(/LINE-3/)).toBeNull();
        await user.click(screen.getByRole('button', { name: 'View more wallet activity' }));
        expect(screen.queryByText(/ORDER-8/)).toBeNull();
        await user.click(screen.getByRole('button', { name: 'View more wallet activity' }));
        expect(screen.getByText(/ORDER-8/)).toBeTruthy();
        await user.click(screen.getByRole('button', { name: 'View less wallet activity' }));
        expect(screen.queryByText(/ORDER-8/)).toBeNull();
        await user.click(screen.getByRole('button', { name: 'View more referred users' }));
        expect(screen.getByText(/LINE-3/)).toBeTruthy();
        await user.click(screen.getByRole('button', { name: 'View less referred users' }));
        expect(screen.queryByText(/LINE-3/)).toBeNull();
    });

    it('shows unavailable paid metrics when the customer overview comes from an older backend', async () => {
        const originalGet = api.get.getMockImplementation();
        api.get.mockImplementation(async (path, token) => {
            if (path === '/superadmin/users/user_ada/overview') {
                const response = await originalGet(path, token);
                const legacyData = { ...response.data };
                delete legacyData.paidOrders;
                delete legacyData.paidCancelledOrders;
                return { ...response, data: legacyData };
            }
            return originalGet(path, token);
        });
        const user = userEvent.setup();
        renderPage();
        await screen.findByText('Ada Okonkwo');
        await user.click(screen.getByRole('button', { name: 'View Ada Okonkwo' }));
        expect(await screen.findByText('Paid orders')).toBeTruthy();
        expect(screen.getByText('Paid orders').parentElement.textContent).toContain('—');
        expect(screen.getByText('Paid cancelled').parentElement.textContent).toContain('—');
        expect(screen.getByText('All orders').parentElement.textContent).toContain('3');
        expect(screen.getByText('All cancelled').parentElement.textContent).toContain('1');
    });

    it('shows an overview error and retry without replacing metrics with zeroes', async () => {
        const originalGet = api.get.getMockImplementation();
        let shouldFail = true;
        api.get.mockImplementation(async (path, token) => {
            if (path === '/superadmin/users/user_ada/overview' && shouldFail) throw new Error('Customer overview unavailable');
            return originalGet(path, token);
        });
        const user = userEvent.setup();
        renderPage();
        await screen.findByText('Ada Okonkwo');
        await user.click(screen.getByRole('button', { name: 'View Ada Okonkwo' }));
        expect((await screen.findByRole('alert')).textContent).toContain('Customer overview unavailable');
        shouldFail = false;
        await user.click(screen.getByRole('button', { name: 'Retry' }));
        expect(await screen.findByText('Paid orders')).toBeTruthy();
        expect(screen.getByText('Paid orders').parentElement.textContent).toContain('2');
    });

    it('uses the app calendar and custom dropdown rather than native date or select controls', async () => {
        const user = userEvent.setup();
        renderPage();
        await screen.findByText('Ada Okonkwo');
        await user.click(screen.getByRole('button', { name: 'View Ada Okonkwo' }));
        await screen.findByText('Details');
        await user.click(screen.getByRole('button', { name: 'Orders' }));
        await user.click(screen.getByRole('button', { name: 'Last 7 days' }));
        await user.click(screen.getByRole('button', { name: 'Custom range' }));

        expect(await screen.findByRole('dialog', { name: 'Custom Date' })).toBeTruthy();
        expect(document.querySelector('select')).toBeNull();
        expect(document.querySelector('input[type="date"]')).toBeNull();
        expect(screen.getByRole('button', { name: 'Choose start date *' })).toBeTruthy();
        await user.click(screen.getByRole('button', { name: 'Close custom date' }));
    });

    it('requires confirmation before suspending and sends the optional reason', async () => {
        const user = userEvent.setup();
        renderPage();
        await screen.findByText('Ada Okonkwo');
        await user.click(screen.getByRole('button', { name: 'View Ada Okonkwo' }));
        await screen.findByText('Details');
        await user.click(screen.getByRole('button', { name: 'Suspend account' }));
        const dialog = screen.getByRole('dialog', { name: 'Suspend customer account?' });
        await user.type(within(dialog).getByPlaceholderText('Enter a suspension reason'), 'Policy violation');
        api.patch.mockResolvedValueOnce({ message: 'User suspension updated' });
        await user.click(within(dialog).getByRole('button', { name: 'Suspend account' }));
        await waitFor(() => expect(api.patch).toHaveBeenCalledWith('/superadmin/users/user_ada/suspension', { suspend: true, reason: 'Policy violation' }, 'admin-token'));
    });

    it('requires explicit confirmation before calling the destructive delete endpoint', async () => {
        const user = userEvent.setup();
        renderPage();
        await screen.findByText('Ada Okonkwo');
        await user.click(screen.getByRole('button', { name: 'View Ada Okonkwo' }));
        await screen.findByText('Details');
        await user.click(screen.getByRole('button', { name: 'Delete account' }));
        const dialog = screen.getByRole('dialog', { name: 'Delete customer account?' });
        expect(api.delete).not.toHaveBeenCalled();
        api.delete.mockResolvedValueOnce({ message: 'User Deleted Successfully' });
        await user.click(within(dialog).getByRole('button', { name: 'Delete account' }));
        await waitFor(() => expect(api.delete).toHaveBeenCalledWith('/superadmin/users', { userId: 'user_ada' }, 'admin-token'));
    });

    it('shows a customer photo when one exists and initials when it does not', async () => {
        customer.photoUrl = 'https://cdn.example/ada.jpg';
        renderPage();
        const photo = await screen.findByRole('img', { name: 'Ada Okonkwo' });
        expect(photo.getAttribute('src')).toBe('https://cdn.example/ada.jpg');
        delete customer.photoUrl;
    });

    it('surfaces list API failures and offers a retry path', async () => {
        api.get.mockRejectedValue(new Error('Customer service unavailable'));
        renderPage();
        expect(await screen.findByText('Customer service unavailable')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Retry' })).toBeTruthy();
    });
});
