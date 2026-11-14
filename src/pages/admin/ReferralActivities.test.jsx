import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ReferralActivities from './ReferralActivities';
import api from '../../api/api';

vi.mock('../../api/api', () => ({ default: { get: vi.fn(), post: vi.fn() } }));
vi.mock('../../store/useAuthStore', () => ({ useAuthStore: (selector) => selector({ accessToken: 'admin-token' }) }));
vi.mock('sonner', () => ({ toast: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() }), default: vi.fn() }));

const row = {
    referralId: 'referral_example', referrerUserId: 'user_referrer', referrerName: 'Ada Okeke',
    referredUserId: 'user_referred', referredUserName: 'Kai Example', referralCode: 'CODE-A',
    accountStatus: 'VERIFIED', isPhoneVerified: true, isSuspended: false, rewardState: 'REWARDED',
    rewardCount: 1, rewardAmountKobo: 50000, rewardAmountNaira: 500,
    createdAt: '2026-10-21T09:00:00.000Z', rewardedAt: '2026-10-22T09:00:00.000Z',
};

const activitiesResponse = {
    data: {
        summary: {
            totalReferralsGenerated: 2, activeReferrers: 1, totalRewardsEarnedKobo: 50000,
            totalRewardsEarnedNaira: 500, pendingReferralWithdrawals: 1,
            completedReferralWithdrawals: 1, totalReferralWithdrawalsPaidKobo: 100000,
            totalReferralWithdrawalsPaidNaira: 1000,
        },
        page: 1, limit: 20, total: 1, data: [row],
    },
};

const withdrawal = {
    id: 'withdrawal_id', reference: 'RWD-example', bankTransferReference: null,
    userId: 'user_referrer', customerName: 'Ada Okeke', amountKobo: 1250000,
    amountNaira: 12500, currency: 'NGN', status: 'PENDING', bankName: 'Example Bank',
    accountName: 'Ada Okeke', accountNumber: '******4821',
    createdAt: '2026-11-01T12:36:00.000Z', updatedAt: '2026-11-01T12:36:00.000Z',
};

const renderPage = () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    return render(<QueryClientProvider client={queryClient}><ReferralActivities /></QueryClientProvider>);
};

beforeEach(() => {
    api.get.mockImplementation(async (path) => {
        if (path.startsWith('/superadmin/referral-activities?')) return activitiesResponse;
        if (path === '/superadmin/referral-activities/leaderboard') return { data: { data: [{ rank: 1, referrerUserId: 'user_referrer', referrerName: 'Ada Okeke', successfulReferrals: 2, totalRewardsEarnedKobo: 50000, totalRewardsEarnedNaira: 500 }] } };
        if (path === '/superadmin/referral-withdrawals?page=1&limit=20&status=PENDING') return { data: { page: 1, limit: 20, total: 1, data: [withdrawal] } };
        if (path === '/superadmin/referral-withdrawals/withdrawal_id') return { data: { ...withdrawal, accountNumber: '0123456789', events: [] } };
        if (path === '/superadmin/users/user_referrer/referrals?page=1') return { data: { totalReferrals: 1, rank: 1, referralCode: 'CODE-A', totalRewardsEarnedKobo: 50000, totalRewardsEarnedNaira: 500, referralWalletBalanceKobo: 25000, referrals: { data: [], total: 0, page: 1, pageSize: 20 } } };
        if (path === '/superadmin/users/user_referrer/overview') return { data: { name: 'Ada Okeke', phone: '+2348012345678', email: 'ada@example.com', address: 'Udeke Street', addressDetails: { label: 'Home', street: 'Udeke Street', city: 'Awka', state: 'Anambra', formattedAddress: 'Zik Avenue, Awka', isDefault: true }, isSuspended: false, isPhoneVerified: true, referralCode: 'CODE-A' } };
        throw new Error(`Unexpected GET ${path}`);
    });
});

afterEach(() => cleanup());

describe('Super Admin referral wallet activities', () => {
    it('loads real summary and activity rows with distinct account and reward states', async () => {
        renderPage();
        expect(await screen.findByText('Ada Okeke')).toBeTruthy();
        expect(screen.getByText('Kai Example')).toBeTruthy();
        expect(screen.getByText('VERIFIED')).toBeTruthy();
        expect(screen.getByText('Rewarded')).toBeTruthy();
        expect(screen.getByText('Total referrals generated')).toBeTruthy();
        expect(screen.getByText('₦1,000.00')).toBeTruthy();
        expect(screen.getByText('Referral withdrawals recorded')).toBeTruthy();
        expect(api.get).toHaveBeenCalledWith('/superadmin/referral-activities?page=1&limit=20&filter=all&dateFilter=all_time', 'admin-token');
    });

    it('debounces search, sends documented reward/date filters, and resets the page', async () => {
        const user = userEvent.setup();
        renderPage();
        await screen.findByText('Kai Example');
        await user.click(screen.getByRole('button', { name: 'All reward states' }));
        await user.click(screen.getByRole('button', { name: 'No reward yet' }));
        await user.click(screen.getByRole('button', { name: 'All time' }));
        await user.click(screen.getByRole('button', { name: 'Last 7 days' }));
        await user.type(screen.getByPlaceholderText('Search referrer, user, or referral code'), 'Ada');
        await waitFor(
            () => expect(api.get).toHaveBeenCalledWith('/superadmin/referral-activities?page=1&limit=20&filter=no_reward_yet&dateFilter=last_7_days&query=Ada', 'admin-token'),
            { timeout: 2000 },
        );
    });

    it('opens the leaderboard and loads the API ranking', async () => {
        const user = userEvent.setup();
        renderPage();
        await screen.findByText('Ada Okeke');
        await user.click(screen.getByRole('button', { name: 'View referral leaderboard' }));
        const dialog = await screen.findByRole('dialog', { name: 'Referral Leaderboard' });
        expect(within(dialog).getByRole('columnheader', { name: 'Successful referrals' })).toBeTruthy();
        expect(within(dialog).getByText('Ada Okeke')).toBeTruthy();
        expect(api.get).toHaveBeenCalledWith('/superadmin/referral-activities/leaderboard', 'admin-token');
    });

    it('uses the row referrerUserId for the customer activity panel', async () => {
        const user = userEvent.setup();
        renderPage();
        await screen.findByText('Kai Example');
        await user.click(screen.getByRole('button', { name: 'View Ada Okeke’s referral activity' }));
        expect(await screen.findByText('Referral wallet balance')).toBeTruthy();
        const dialog = screen.getByRole('dialog', { name: 'Customer details' });
        await user.click(within(dialog).getByRole('button', { name: 'Overview' }));
        expect(await within(dialog).findByText('+2348012345678')).toBeTruthy();
        expect(within(dialog).getByText('ada@example.com')).toBeTruthy();
        expect(within(dialog).getByText('Verified')).toBeTruthy();
        expect(within(dialog).queryByText('Unverified')).toBeNull();
        expect(within(dialog).getByText('user_referrer')).toBeTruthy();
        expect(api.get).toHaveBeenCalledWith('/superadmin/users/user_referrer/referrals?page=1', 'admin-token');
        expect(api.get).toHaveBeenCalledWith('/superadmin/users/user_referrer/overview', 'admin-token');
    });

    it('loads masked withdrawal rows and reveals the full bank account only after opening details', async () => {
        const user = userEvent.setup();
        renderPage();
        await screen.findByText('Kai Example');
        await user.click(screen.getByRole('button', { name: 'View 1 pending referral withdrawals' }));
        expect(api.get).toHaveBeenCalledWith('/superadmin/referral-withdrawals?page=1&limit=20&status=PENDING', 'admin-token');
        const drawer = await screen.findByRole('dialog', { name: 'Pending Referral Withdrawals' });
        expect(within(drawer).getByText(/ending 4821/)).toBeTruthy();
        expect(within(drawer).queryByText('0123456789')).toBeNull();

        await user.click(within(drawer).getByRole('button', { name: /Ada Okeke.*RWD-example/s }));
        expect(await screen.findByText('0123456789')).toBeTruthy();
        expect(api.get).toHaveBeenCalledWith('/superadmin/referral-withdrawals/withdrawal_id', 'admin-token');
    });

    it('approves only after manual transfer confirmation and posts an idempotency key', async () => {
        const user = userEvent.setup();
        renderPage();
        await screen.findByText('Kai Example');
        await user.click(screen.getByRole('button', { name: 'View 1 pending referral withdrawals' }));
        const drawer = await screen.findByRole('dialog', { name: 'Pending Referral Withdrawals' });
        await user.click(within(drawer).getByRole('button', { name: /Ada Okeke.*RWD-example/s }));
        await screen.findByText('0123456789');
        await user.click(screen.getByRole('button', { name: 'Approve payout' }));
        expect(screen.getByLabelText('Bank transfer reference (optional)')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Confirm payout' }).disabled).toBe(true);
        await user.click(screen.getByLabelText(/I confirm the bank transfer has already been made/));
        api.post.mockResolvedValueOnce({ message: 'Referral withdrawal updated', data: { ...withdrawal, status: 'COMPLETED', bankTransferReference: 'BT0123456789', accountNumber: '******6789' } });
        await user.click(screen.getByRole('button', { name: 'Confirm payout' }));

        await waitFor(() => expect(api.post).toHaveBeenCalledWith('/superadmin/referral-withdrawals/withdrawal_id/status', expect.objectContaining({ status: 'COMPLETED', idempotencyKey: expect.any(String) }), 'admin-token'));
        const [, body] = api.post.mock.calls[0];
        expect(body.idempotencyKey.length).toBeGreaterThanOrEqual(8);
        expect(body.bankTransferReference).toBeUndefined();
        expect((await screen.findAllByText('COMPLETED')).length).toBeGreaterThan(0);
    });

    it('validates decline reason and sends the decline status payload', async () => {
        const user = userEvent.setup();
        renderPage();
        await screen.findByText('Kai Example');
        await user.click(screen.getByRole('button', { name: 'View 1 pending referral withdrawals' }));
        const drawer = await screen.findByRole('dialog', { name: 'Pending Referral Withdrawals' });
        await user.click(within(drawer).getByRole('button', { name: /Ada Okeke.*RWD-example/s }));
        await screen.findByText('0123456789');
        await user.click(screen.getByRole('button', { name: 'Decline' }));
        expect(screen.getByRole('button', { name: 'Confirm decline' }).disabled).toBe(true);
        await user.type(screen.getByLabelText('Reason'), 'Name mismatch');
        api.post.mockResolvedValueOnce({ message: 'Referral withdrawal updated', data: { ...withdrawal, status: 'DECLINED' } });
        await user.click(screen.getByRole('button', { name: 'Confirm decline' }));
        await waitFor(() => expect(api.post).toHaveBeenCalledWith('/superadmin/referral-withdrawals/withdrawal_id/status', expect.objectContaining({ status: 'DECLINED', reason: 'Name mismatch', idempotencyKey: expect.any(String) }), 'admin-token'));
    });

    it('shows an empty-state when the API returns no referral rows', async () => {
        api.get.mockImplementation(async (path) => {
            if (path.startsWith('/superadmin/referral-activities?')) return { data: { summary: {}, page: 1, limit: 20, total: 0, data: [] } };
            throw new Error(`Unexpected GET ${path}`);
        });
        renderPage();
        expect(await screen.findByRole('heading', { name: 'No referral activity yet' })).toBeTruthy();
        expect(screen.queryByRole('columnheader')).toBeNull();
        expect(screen.getByText(/When customers invite others/)).toBeTruthy();
    });
});
