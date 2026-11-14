import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import VendorWallet from './VendorWallet';
import { VendorWalletDirectory, VendorWalletProfile } from './VendorWalletDirectory';
import api from '../../../api/api';
import { toast } from 'sonner';

vi.mock('../../../api/api', () => ({ default: { get: vi.fn(), post: vi.fn() } }));
vi.mock('../../../store/useAuthStore', () => ({ useAuthStore: (selector) => selector({ accessToken: 'admin-token' }) }));
vi.mock('sonner', () => ({ toast: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() }), default: vi.fn() }));

const summary = { currency: 'NGN', totalAvailableBalanceKobo: 150000, totalAvailableBalanceNaira: 1500, totalOrderCreditsKobo: 200000, totalOrderCreditsNaira: 2000, totalReversalsKobo: 10000, totalReversalsNaira: 100, netOrderEarningsKobo: 190000, netOrderEarningsNaira: 1900, completedWithdrawalCount: 1, totalWithdrawalsPaidKobo: 50000, totalWithdrawalsPaidNaira: 500, pendingWithdrawalCount: 1, processingWithdrawalCount: 1, declinedWithdrawalCount: 2, failedWithdrawalCount: 1, reservedWithdrawalAmountKobo: 25000, reservedWithdrawalAmountNaira: 250, walletActivityToday: 7, ledgerActivityToday: 7 };
const activity = { transactionId: 'LEDGER:ledger-1', vendorId: 'vendor-1', storeName: 'Ada Foods', ownerName: 'Ada Okeke', type: 'order_credit', amountKobo: 120000, status: 'successful', createdAt: '2026-11-02T08:00:00.000Z' };
const vendor = { vendorId: 'vendor-1', storeName: 'Ada Foods', ownerName: 'Ada Okeke', storeAddress: '12 Example Road', storeStatus: 'OPEN', isVerified: false, isSuspended: true, walletExists: true, balanceKobo: 150000 };
const renderAt = (initial = '/admin/wallet/vendor') => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    return render(<QueryClientProvider client={client}><MemoryRouter initialEntries={[initial]}><Routes>
        <Route path="/admin/wallet/vendor" element={<VendorWallet/>}/>
        <Route path="/admin/wallet/vendor/vendors" element={<VendorWalletDirectory/>}/>
        <Route path="/admin/wallet/vendor/vendors/:vendorId" element={<VendorWalletProfile/>}/>
    </Routes></MemoryRouter></QueryClientProvider>);
};

const withdrawalRequest = { id: 'withdrawal-1', reference: 'VWD-1001', vendorId: 'vendor-1', storeName: 'Ada Foods', vendorName: 'Ada Okeke', storeAddress: '12 Example Road', amountKobo: 300000, currency: 'NGN', status: 'PENDING', bankName: 'Example Bank', maskedAccountNumber: '******7890', createdAt: '2026-11-02T09:00:00.000Z' };
const configureWithdrawalReview = (statuses = ['PENDING']) => {
    let detailFetches = 0;
    api.get.mockImplementation(async (path) => {
        if (path === '/superadmin/vendor-wallet/summary') return { data: summary };
        if (path.startsWith('/superadmin/vendor-wallet/transactions?')) return { data: { data: [activity], total: 1, page: 1, limit: 20 } };
        if (path === '/superadmin/withdrawals?page=1&limit=20&status=PENDING') return { data: { data: [withdrawalRequest], total: 1, page: 1, limit: 20 } };
        if (path === '/superadmin/withdrawals/withdrawal-1') {
            const status = statuses[Math.min(detailFetches, statuses.length - 1)];
            detailFetches += 1;
            if (status instanceof Error) throw status;
            return { data: { ...withdrawalRequest, status, accountNumber: '01234567890', accountName: 'Ada Okeke', events: [] } };
        }
        throw new Error(`Unexpected GET ${path}`);
    });
    return () => detailFetches;
};

beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockImplementation(async (path) => {
        if (path === '/superadmin/vendor-wallet/summary') return { data: summary };
        if (path.startsWith('/superadmin/vendor-wallet/transactions?')) return { data: { data: [activity], total: 1, page: 1, limit: 20 } };
        if (path === '/superadmin/vendor-wallet/transactions/LEDGER%3Aledger-1') return { data: { ...activity, type: 'ORDER_CREDIT', amountNaira: 1200, orderId: 'order-1', orderCode: 'ORD-1', orderStatus: 'PAID', deltaKobo: 120000, balanceAfterKobo: 150000, reason: 'Paid order', ledgerEvents: [{ id: 'ledger-1', type: 'ORDER_CREDIT', amountKobo: 120000, deltaKobo: 120000, balanceAfterKobo: 150000, reason: 'Paid order', createdAt: '2026-11-02T08:00:00.000Z' }], reviewEvents: [], withdrawalId: null, withdrawalReference: null, withdrawalStatus: null, bankName: null, accountName: null, accountNumber: null, bankTransferReference: null, payoutDetailPath: null } };
        if (path === '/superadmin/vendor-wallets?page=1&limit=20') return { data: { data: [vendor], total: 1, page: 1, limit: 20 } };
        if (path === '/superadmin/vendor-wallets/vendor-1') return { data: vendor };
        if (path.startsWith('/superadmin/withdrawals?')) return { data: { data: [], total: 0, page: 1, limit: 20 } };
        if (path === '/superadmin/withdrawals/notices?page=1&limit=20') return { data: { page: 1, limit: 20, total: 1, data: [{ withdrawalId: 'wd-1', withdrawalReference: 'WD-1001', storeName: 'Ada Foods', amountKobo: 250000, currency: 'NGN', status: 'FAILED', attempts: 5, lastError: 'Mailbox unavailable', nextAttemptAt: '2026-11-02T10:00:00.000Z', exhausted: true }] } };
        if (path === '/superadmin/withdrawals/status-notices?page=1&limit=20') return { data: { page: 1, limit: 20, total: 1, data: [{ id: 'notice-1', withdrawalReference: 'WD-1002', storeName: 'Bola Store', status: 'DECLINED', channel: 'EMAIL', amountNaira: 2500, attempts: 5, lastError: 'Provider timeout', updatedAt: '2026-11-02T10:00:00.000Z' }] } };
        throw new Error(`Unexpected GET ${path}`);
    });
    api.post.mockResolvedValue({ success: true, data: {} });
});
afterEach(() => cleanup());

describe('Super Admin Vendor Wallet API screens', () => {
    it('loads dashboard metrics and platform activity using the shared authenticated API', async () => {
        renderAt();
        expect(await screen.findByText('₦1,500.00')).toBeTruthy();
        expect(screen.getByText('₦2,000.00')).toBeTruthy();
        expect(screen.queryByText('Ledger events today')).toBeNull();
        expect(screen.queryByText('Processing withdrawals')).toBeNull();
        expect(screen.getByText('Ada Foods')).toBeTruthy();
        expect(screen.getByText('Gross order credits')).toBeTruthy();
        expect(screen.getByText('Earnings reversed')).toBeTruthy();
        expect(screen.getByText('Net order earnings')).toBeTruthy();
        expect(screen.getByText('Completed withdrawals')).toBeTruthy();
        expect(screen.getByText('Reserved for withdrawals')).toBeTruthy();
        expect(screen.getByText('₦1,900.00')).toBeTruthy();
        expect(screen.getByText('₦100.00')).toBeTruthy();
        expect(screen.getByText('Reversal amount shown as a positive magnitude')).toBeTruthy();
        expect(screen.getByText('Manual transfers recorded by an admin; not independently verified')).toBeTruthy();
        expect(api.get).toHaveBeenCalledWith('/superadmin/vendor-wallet/summary', 'admin-token');
        expect(api.get).toHaveBeenCalledWith('/superadmin/vendor-wallet/transactions?page=1&limit=20&type=all&status=all&dateFilter=all_time', 'admin-token');
    });

    it('uses distinct activity-type colors and colors incoming and outgoing amounts differently', async () => {
        api.get.mockImplementation(async (path) => {
            if (path === '/superadmin/vendor-wallet/summary') return { data: summary };
            if (path.startsWith('/superadmin/vendor-wallet/transactions?')) return { data: { data: [
                { ...activity, transactionId: 'LEDGER:credit', type: 'ORDER_CREDIT', amountKobo: 120000 },
                { ...activity, transactionId: 'WITHDRAWAL:debit', type: 'WITHDRAWAL', amountKobo: -500000 },
                { ...activity, transactionId: 'LEDGER:reversal', type: 'EARNINGS_REVERSAL', amountKobo: -20000 },
            ], total: 3, page: 1, limit: 20 } };
            throw new Error(`Unexpected GET ${path}`);
        });
        renderAt();
        const creditType = await screen.findByText('order credit');
        const withdrawalType = screen.getByText('withdrawal');
        const reversalType = screen.getByText('Earnings reversal');
        expect(creditType.className).toContain('bg-emerald-50');
        expect(withdrawalType.className).toContain('bg-violet-50');
        expect(reversalType.className).toContain('bg-amber-50');
        expect(screen.getByText('+₦1,200.00').className).toContain('text-emerald-700');
        expect(screen.getByText('-₦5,000.00').className).toContain('text-rose-700');
    });

    it('opens the pending drawer and shows an empty state from the API', async () => {
        const user = userEvent.setup();
        renderAt();
        await user.click(await screen.findByRole('button', { name: /Pending withdrawals/ }));
        expect(await screen.findByText('No pending vendor withdrawals.')).toBeTruthy();
        expect(api.get).toHaveBeenCalledWith('/superadmin/withdrawals?page=1&limit=20&status=PENDING', 'admin-token');
    });

    it('keeps bank data masked in the pending list and reviews a request with its real detail data', async () => {
        const user = userEvent.setup();
        const request = { id: 'withdrawal-1', reference: 'VWD-1001', vendorId: 'vendor-1', storeName: 'Ada Foods', vendorName: 'Ada Okeke', storeAddress: '12 Example Road', amountKobo: 300000, currency: 'NGN', status: 'PENDING', bankName: 'Example Bank', maskedAccountNumber: '******7890', createdAt: '2026-11-02T09:00:00.000Z' };
        api.get.mockImplementation(async (path) => {
            if (path === '/superadmin/vendor-wallet/summary') return { data: summary };
            if (path.startsWith('/superadmin/vendor-wallet/transactions?')) return { data: { data: [activity], total: 1, page: 1, limit: 20 } };
            if (path === '/superadmin/withdrawals?page=1&limit=20&status=PENDING') return { data: { data: [request], total: 1, page: 1, limit: 20 } };
            if (path === '/superadmin/withdrawals/withdrawal-1') return { data: { ...request, accountNumber: '01234567890', accountName: 'Ada Okeke', events: [] } };
            throw new Error(`Unexpected GET ${path}`);
        });
        renderAt();
        await user.click(await screen.findByRole('button', { name: /Pending withdrawals/ }));
        expect((await screen.findAllByText('Ada Foods')).length).toBeGreaterThan(1);
        expect(screen.getByRole('button', { name: /VWD-1001/ }).textContent).toContain('******7890');
        expect(screen.queryByText('01234567890')).toBeNull();
        await user.click(screen.getByRole('button', { name: /VWD-1001/ }));
        expect(await screen.findByText('01234567890')).toBeTruthy();
        await user.click(screen.getByRole('button', { name: 'DECLINED' }));
        await user.type(screen.getByLabelText('Reason'), 'Bank account name mismatch');
        await user.click(screen.getByRole('button', { name: 'Confirm declined' }));
        await waitFor(() => expect(api.post).toHaveBeenCalledWith('/superadmin/withdrawals/withdrawal-1/status', expect.objectContaining({ status: 'DECLINED', reason: 'Bank account name mismatch', idempotencyKey: expect.any(String) }), 'admin-token'));
    });

    it('posts a completed status once, keeps one idempotency key, and refreshes the final detail', async () => {
        const user = userEvent.setup();
        const detailFetches = configureWithdrawalReview(['PENDING', 'COMPLETED']);
        api.post.mockResolvedValueOnce({ success: true, message: 'Withdrawal marked completed.', data: {} });
        renderAt();
        await user.click(await screen.findByRole('button', { name: /Pending withdrawals/ }));
        await user.click(await screen.findByRole('button', { name: /VWD-1001/ }));
        await user.click(await screen.findByRole('button', { name: 'COMPLETED' }));
        await user.click(screen.getByRole('checkbox'));
        await user.click(screen.getByRole('button', { name: 'Confirm completed' }));
        expect(await screen.findByText('COMPLETED')).toBeTruthy();
        expect(api.post).toHaveBeenCalledTimes(1);
        expect(api.post).toHaveBeenCalledWith('/superadmin/withdrawals/withdrawal-1/status', expect.objectContaining({ status: 'COMPLETED', idempotencyKey: expect.any(String) }), 'admin-token');
        expect(detailFetches()).toBeGreaterThanOrEqual(2);
    });

    it('shows the backend HTTP error without retrying the withdrawal action', async () => {
        const user = userEvent.setup();
        configureWithdrawalReview();
        const conflict = new Error('Withdrawal is already completed.');
        conflict.status = 409;
        api.post.mockRejectedValueOnce(conflict);
        renderAt();
        await user.click(await screen.findByRole('button', { name: /Pending withdrawals/ }));
        await user.click(await screen.findByRole('button', { name: /VWD-1001/ }));
        await user.click(await screen.findByRole('button', { name: 'PROCESSING' }));
        await user.click(screen.getByRole('button', { name: 'Confirm processing' }));
        await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Withdrawal is already completed.'));
        expect(api.post).toHaveBeenCalledTimes(1);
    });

    it('recovers a transport failure as success when the refreshed status matches the requested action', async () => {
        const user = userEvent.setup();
        const detailFetches = configureWithdrawalReview(['PENDING', 'PROCESSING']);
        const transportError = new TypeError('Failed to fetch');
        transportError.transportError = true;
        api.post.mockRejectedValueOnce(transportError);
        renderAt();
        await user.click(await screen.findByRole('button', { name: /Pending withdrawals/ }));
        await user.click(await screen.findByRole('button', { name: /VWD-1001/ }));
        await user.click(await screen.findByRole('button', { name: 'PROCESSING' }));
        await user.click(screen.getByRole('button', { name: 'Confirm processing' }));
        await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Withdrawal status confirmed as PROCESSING.'));
        expect(screen.getByText('PROCESSING')).toBeTruthy();
        expect(screen.queryByRole('button', { name: 'Confirm processing' })).toBeNull();
        expect(api.post).toHaveBeenCalledTimes(1);
        expect(detailFetches()).toBeGreaterThanOrEqual(2);
        expect(toast.error).not.toHaveBeenCalled();
        await user.click(screen.getByRole('button', { name: 'Back to pending vendor withdrawals' }));
        await waitFor(() => expect(api.get.mock.calls.filter(([path]) => path === '/superadmin/withdrawals?page=1&limit=20&status=PENDING')).toHaveLength(2));
        expect(api.get.mock.calls.filter(([path]) => path === '/superadmin/vendor-wallet/summary')).toHaveLength(2);
    });

    it('shows the actual different status after a transport failure without claiming success', async () => {
        const user = userEvent.setup();
        configureWithdrawalReview(['PENDING', 'COMPLETED']);
        const transportError = new TypeError('Failed to fetch');
        transportError.transportError = true;
        api.post.mockRejectedValueOnce(transportError);
        renderAt();
        await user.click(await screen.findByRole('button', { name: /Pending withdrawals/ }));
        await user.click(await screen.findByRole('button', { name: /VWD-1001/ }));
        await user.click(await screen.findByRole('button', { name: 'PROCESSING' }));
        await user.click(screen.getByRole('button', { name: 'Confirm processing' }));
        await waitFor(() => expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Current status: COMPLETED')));
        expect(screen.getByText('COMPLETED')).toBeTruthy();
        expect(toast.success).not.toHaveBeenCalled();
        expect(api.post).toHaveBeenCalledTimes(1);
    });

    it('keeps the key after the detail check fails and offers Retry without resubmitting', async () => {
        const user = userEvent.setup();
        configureWithdrawalReview(['PENDING', new Error('Details unavailable'), 'PENDING']);
        const transportError = new TypeError('Failed to fetch');
        transportError.transportError = true;
        api.post.mockRejectedValueOnce(transportError);
        renderAt();
        await user.click(await screen.findByRole('button', { name: /Pending withdrawals/ }));
        await user.click(await screen.findByRole('button', { name: /VWD-1001/ }));
        await user.click(await screen.findByRole('button', { name: 'PROCESSING' }));
        await user.click(screen.getByRole('button', { name: 'Confirm processing' }));
        await waitFor(() => expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('result is unconfirmed')));
        expect(api.post).toHaveBeenCalledTimes(1);
        const firstKey = api.post.mock.calls[0][1].idempotencyKey;
        expect(screen.getByRole('button', { name: 'Retry' })).toBeTruthy();
        await user.click(screen.getByRole('button', { name: 'Retry' }));
        expect(await screen.findByRole('button', { name: 'Confirm processing' })).toBeTruthy();
        expect(api.post).toHaveBeenCalledTimes(1);
        await user.click(screen.getByRole('button', { name: 'Confirm processing' }));
        await waitFor(() => expect(api.post).toHaveBeenCalledTimes(2));
        expect(api.post.mock.calls[1][1].idempotencyKey).toBe(firstKey);
    });

    it('does not recover an HTTP 409 as success even when detail shows the requested status', async () => {
        const user = userEvent.setup();
        configureWithdrawalReview(['PENDING', 'PROCESSING']);
        const conflict = new Error('Withdrawal status conflict.');
        conflict.status = 409;
        api.post.mockRejectedValueOnce(conflict);
        renderAt();
        await user.click(await screen.findByRole('button', { name: /Pending withdrawals/ }));
        await user.click(await screen.findByRole('button', { name: /VWD-1001/ }));
        await user.click(await screen.findByRole('button', { name: 'PROCESSING' }));
        await user.click(screen.getByRole('button', { name: 'Confirm processing' }));
        await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Withdrawal status conflict.'));
        expect(await screen.findByText('PROCESSING')).toBeTruthy();
        expect(toast.success).not.toHaveBeenCalled();
        expect(api.post).toHaveBeenCalledTimes(1);
    });

    it('disables the confirmation button during an in-flight status request', async () => {
        const user = userEvent.setup();
        configureWithdrawalReview(['PENDING', 'COMPLETED']);
        let finishRequest;
        api.post.mockReturnValueOnce(new Promise((resolve) => { finishRequest = resolve; }));
        renderAt();
        await user.click(await screen.findByRole('button', { name: /Pending withdrawals/ }));
        await user.click(await screen.findByRole('button', { name: /VWD-1001/ }));
        await user.click(await screen.findByRole('button', { name: 'PROCESSING' }));
        const confirm = screen.getByRole('button', { name: 'Confirm processing' });
        await user.click(confirm);
        expect(confirm.disabled).toBe(true);
        await user.click(confirm);
        expect(api.post).toHaveBeenCalledTimes(1);
        finishRequest({ success: true, message: 'Updated.', data: {} });
        await waitFor(() => expect(api.post).toHaveBeenCalledTimes(1));
    });

    it('renders summary request failures instead of displaying fabricated zero values', async () => {
        api.get.mockRejectedValue(new Error('Summary unavailable'));
        renderAt();
        await waitFor(() => expect(screen.getAllByRole('alert').some((alert) => alert.textContent.includes('Summary unavailable'))).toBe(true));
        expect(screen.queryByText('₦0.00')).toBeNull();
    });

    it('loads a server-searchable vendor directory and uses vendorId for its detail page', async () => {
        renderAt('/admin/wallet/vendor/vendors');
        expect(await screen.findByText('12 Example Road')).toBeTruthy();
        expect(screen.getByText('Store status')).toBeTruthy();
        expect(screen.getByText('OPEN')).toBeTruthy();
        expect(screen.queryByText('Account status')).toBeNull();
        expect(api.get).toHaveBeenCalledWith('/superadmin/vendor-wallets?page=1&limit=20', 'admin-token');
        cleanup();
        renderAt('/admin/wallet/vendor/vendors/vendor-1');
        expect(await screen.findByText('Ada Foods')).toBeTruthy();
        expect(screen.getByText('Store status')).toBeTruthy();
        expect(screen.getByText('OPEN')).toBeTruthy();
        expect(api.get).toHaveBeenCalledWith('/superadmin/vendor-wallets/vendor-1', 'admin-token');
        expect(api.get).toHaveBeenCalledWith('/superadmin/vendor-wallet/transactions?page=1&limit=20&type=all&status=all&dateFilter=all_time&vendorId=vendor-1', 'admin-token');
    });

    it('shows distinct per-vendor accounting measures and leaves missing fields unavailable', async () => {
        renderAt('/admin/wallet/vendor/vendors/vendor-1');
        expect(await screen.findByText('Available wallet balance')).toBeTruthy();
        expect(screen.getByRole('columnheader', { name: 'Activity' })).toBeTruthy();
        expect(screen.getByRole('columnheader', { name: 'Date & time' })).toBeTruthy();
        expect(screen.getByRole('columnheader', { name: 'Amount' })).toBeTruthy();
        expect(screen.getByRole('columnheader', { name: 'Status' })).toBeTruthy();
        expect(screen.getByText(/Nov 2, 2026/)).toBeTruthy();
        expect(screen.getByText('Gross order credits')).toBeTruthy();
        expect(screen.getByText('Earnings reversed')).toBeTruthy();
        expect(screen.getByText('Net order earnings')).toBeTruthy();
        expect(screen.getByText('Reserved for withdrawals')).toBeTruthy();
        expect(screen.getByText('Completed withdrawals')).toBeTruthy();
        expect(screen.getAllByText('—').length).toBeGreaterThan(0);
    });

    it('opens activity details using the exact namespaced transaction ID', async () => {
        const user = userEvent.setup();
        renderAt();
        await user.click(await screen.findByText('LEDGER:ledger-1'));
        expect(await screen.findByText('Activity details')).toBeTruthy();
        await waitFor(() => expect(api.get).toHaveBeenCalledWith('/superadmin/vendor-wallet/transactions/LEDGER%3Aledger-1', 'admin-token'));
        expect((await screen.findAllByText('ORDER_CREDIT')).length).toBeGreaterThan(1);
        expect(screen.getByText('ORD-1')).toBeTruthy();
        expect(screen.getByText('Ledger events')).toBeTruthy();
    });

    it('loads admin email notice recovery and requeues by withdrawal ID without a body', async () => {
        const user = userEvent.setup();
        renderAt();
        await user.click(await screen.findByRole('button', { name: /Notification recovery/ }));
        expect(await screen.findByText('WD-1001')).toBeTruthy();
        expect(screen.getByText('Email delivery status')).toBeTruthy();
        expect(screen.getByText('FAILED')).toBeTruthy();
        await user.click(screen.getByRole('button', { name: 'Requeue' }));
        await waitFor(() => expect(api.post).toHaveBeenCalledWith('/superadmin/withdrawals/notices/wd-1/requeue', undefined, 'admin-token'));
    });

    it('loads status notices separately and requeues using notice ID, not withdrawal reference', async () => {
        const user = userEvent.setup();
        renderAt();
        await user.click(await screen.findByRole('button', { name: /Notification recovery/ }));
        await user.click(screen.getByRole('button', { name: 'Vendor status notices' }));
        expect(await screen.findByText('WD-1002')).toBeTruthy();
        expect(screen.getByText('Withdrawal event status')).toBeTruthy();
        expect(screen.getByText('DECLINED')).toBeTruthy();
        await user.click(screen.getByRole('button', { name: 'Requeue' }));
        await waitFor(() => expect(api.post).toHaveBeenCalledWith('/superadmin/withdrawals/status-notices/notice-1/requeue', undefined, 'admin-token'));
    });

    it('keeps activity bank details masked and opens the audited withdrawal detail only on request', async () => {
        const user = userEvent.setup();
        const withdrawalDetail = { ...activity, transactionId: 'WITHDRAWAL:wd-1', type: 'WITHDRAWAL', amountKobo: -500000, amountNaira: -5000, withdrawalId: 'wd-1', withdrawalReference: 'WD-1', withdrawalStatus: 'PENDING', bankName: 'Example Bank', accountName: 'Ada Okeke', accountNumber: '******7890', bankTransferReference: null, ledgerEvents: [{ id: 'reserve-1', type: 'RESERVE', amountKobo: -500000, deltaKobo: -500000, balanceAfterKobo: 0, reason: 'Withdrawal reserved', createdAt: '2026-11-02T08:00:00.000Z' }], reviewEvents: [], payoutDetailPath: '/superadmin/withdrawals/wd-1' };
        api.get.mockImplementation(async (path) => {
            if (path === '/superadmin/vendor-wallet/summary') return { data: summary };
            if (path.startsWith('/superadmin/vendor-wallet/transactions?')) return { data: { data: [{ ...activity, transactionId: 'WITHDRAWAL:wd-1', type: 'WITHDRAWAL' }], total: 1, page: 1, pageSize: 20 } };
            if (path === '/superadmin/vendor-wallet/transactions/WITHDRAWAL%3Awd-1') return { data: withdrawalDetail };
            if (path === '/superadmin/withdrawals/wd-1') return { data: { id: 'wd-1', reference: 'WD-1', vendorId: 'vendor-1', storeName: 'Ada Foods', ownerName: 'Ada Okeke', amountKobo: 500000, currency: 'NGN', status: 'PENDING', bankName: 'Example Bank', accountName: 'Ada Okeke', accountNumber: '0123456789', events: [] } };
            if (path.startsWith('/superadmin/withdrawals?')) return { data: { data: [], total: 0, page: 1, limit: 20 } };
            throw new Error(`Unexpected GET ${path}`);
        });
        renderAt();
        await user.click(await screen.findByText('WITHDRAWAL:wd-1'));
        expect(await screen.findByText('******7890')).toBeTruthy();
        expect(screen.queryByText('0123456789')).toBeNull();
        await user.click(screen.getByRole('button', { name: 'Open withdrawal review' }));
        expect(await screen.findByText('0123456789')).toBeTruthy();
        expect(api.get).toHaveBeenCalledWith('/superadmin/withdrawals/wd-1', 'admin-token');
    });
});
