import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import UserWallet from './UserWallet';
import UserWalletBalances from './UserWalletBalances';
import UserWalletReconciliation from './UserWalletReconciliation';
import api from '../../../api/api';

vi.mock('../../../api/api', () => ({ default: { get: vi.fn(), post: vi.fn() } }));
vi.mock('../../../store/useAuthStore', () => ({ useAuthStore: (selector) => selector({ accessToken: 'admin-token' }) }));
vi.mock('sonner', () => ({ toast: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() }), default: vi.fn() }));

const transaction = {
    transactionId: 'LEDGER:ledger-1', userId: 'user-1', customerName: 'Ada Okonkwo', type: 'TOP_UP', status: 'SUCCEEDED',
    amountKobo: 500000, amountNaira: 5000, createdAt: '2026-11-02T07:38:00.000Z', relatedReference: 'PAY-EXAMPLE',
};
const debit = { transactionId: 'LEDGER:ledger-debit', userId: 'user-2', customerName: 'Sam Okafor', type: 'ORDER_PAYMENT', status: 'SUCCEEDED', amountKobo: -1850000, amountNaira: -18500, createdAt: '2026-11-02T06:38:00.000Z', relatedReference: 'ORDER-1' };
const summary = { totalBalanceKobo: 21850000, totalBalanceNaira: 218500, totalTopUpsKobo: 36000000, totalTopUpsNaira: 360000, transactionsToday: 5, failedTransactions: 1, abandonedTransactions: 2 };
const renderRoutes = (initial = '/admin/wallet/user') => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    return render(<QueryClientProvider client={client}><MemoryRouter initialEntries={[initial]}><Routes>
        <Route path="/admin/wallet/user" element={<UserWallet />} />
        <Route path="/admin/wallet/user/balances" element={<UserWalletBalances />} />
        <Route path="/admin/wallet/user/reconciliation" element={<UserWalletReconciliation />} />
    </Routes></MemoryRouter></QueryClientProvider>);
};

beforeEach(() => {
    api.get.mockImplementation(async (path) => {
        if (path === '/superadmin/user-wallet/summary') return { data: summary };
        if (path.startsWith('/superadmin/user-wallet/transactions?')) {
            const params = new URLSearchParams(path.split('?')[1]);
            if (params.get('query') === 'ada') return { data: { data: [transaction], total: 1, page: Number(params.get('page')), pageSize: 20 } };
            if (params.get('status') === 'abandoned') return { data: { data: [{ ...transaction, transactionId: 'TOPUP:top-1', status: 'PENDING', providerStatus: 'abandoned', providerStatusCheckedAt: '2026-11-02T08:00:00.000Z' }], total: 1, page: 1, pageSize: 20 } };
            if (params.get('page') === '2') return { data: { data: [{ ...transaction, transactionId: 'TOPUP:top-2', status: 'PENDING', type: 'TOP_UP' }], total: 21, page: 2, pageSize: 20 } };
            return { data: { data: [transaction, debit], total: 21, page: Number(params.get('page')), pageSize: 20 } };
        }
        if (path === '/superadmin/user-wallet/transactions/LEDGER%3Aledger-1') return { data: { ...transaction, email: 'ada@example.com', phonenumber: '+2348012345678', balanceAfterKobo: 850000, updatedAt: null, orderId: null, orderStatus: null, topUpStatus: 'SUCCEEDED', reconciliationStatus: null, reconciliationReason: null } };
        if (path === '/superadmin/user-wallet/transactions/TOPUP%3Atop-1') return { data: { ...transaction, transactionId: 'TOPUP:top-1', status: 'PENDING', topUpStatus: 'PENDING', providerStatus: 'abandoned', providerStatusCheckedAt: '2026-11-02T08:00:00.000Z', reconciliationStatus: null } };
        if (path.startsWith('/superadmin/user-wallets?')) {
            const params = new URLSearchParams(path.split('?')[1]);
            return { data: { data: [{ userId: 'user-1', name: 'Ada Okonkwo', email: 'ada@example.com', phonenumber: '+2348012345678', balanceKobo: 850000, balanceNaira: 8500, totalTopUpsKobo: 1500000, totalTopUpsNaira: 15000 }], total: 21, page: Number(params.get('page')), pageSize: 20 } };
        }
        if (path === '/superadmin/users/user-1/wallet') return { data: { userId: 'user-1', name: 'Ada Okonkwo', balanceKobo: 850000, balanceNaira: 8500, totalTopUpsKobo: 1500000, totalTopUpsNaira: 15000, totalSpendingKobo: 650000, totalSpendingNaira: 6500, totalRefundsKobo: 0, totalRefundsNaira: 0 } };
        if (path.startsWith('/superadmin/users/user-1/wallet/transactions?')) return { data: { data: [transaction], total: 1, page: 1, pageSize: 20 } };
        throw new Error(`Unexpected GET ${path}`);
    });
    api.post.mockResolvedValue({ success: true, data: {} });
});

afterEach(() => cleanup());

describe('Super Admin user wallet screens', () => {
    it('loads API summary and shows distinct failed and not-completed provider counts', async () => {
        renderRoutes();
        expect(await screen.findByText('₦218,500.00')).toBeTruthy();
        expect(screen.getByText('Wallet Activity Today')).toBeTruthy();
        expect(screen.getByText('Top-ups, payments, refunds & attempts').getAttribute('title')).toContain('order payments, refunds');
        expect(screen.getByText('Failed Payments')).toBeTruthy();
        expect(screen.getByText('Latest Paystack check reported failed')).toBeTruthy();
        expect(screen.getByText('Not Completed')).toBeTruthy();
        expect(screen.getByText('Paystack reports the payment wasn’t completed')).toBeTruthy();
        expect(api.get).toHaveBeenCalledWith('/superadmin/user-wallet/summary', 'admin-token');
    });

    it('loads server transaction rows with signed amounts and SUCCEEDED status mapped to Successful', async () => {
        renderRoutes();
        expect(await screen.findByText('Ada Okonkwo')).toBeTruthy();
        expect(screen.getAllByText('Successful').length).toBe(2);
        expect(screen.getByText('+₦5,000.00')).toBeTruthy();
        expect(screen.getByText('−₦18,500.00')).toBeTruthy();
        expect(screen.getByText('Debit')).toBeTruthy();
        expect(api.get).toHaveBeenCalledWith('/superadmin/user-wallet/transactions?page=1&limit=20&type=all&status=all&dateFilter=all_time', 'admin-token');
    });

    it('sends Credit and Pending as server filters and debounces trimmed search', async () => {
        const user = userEvent.setup();
        renderRoutes();
        await screen.findByText('Ada Okonkwo');
        await user.click(screen.getByRole('button', { name: 'All types' }));
        await user.click(screen.getByRole('button', { name: 'Credit' }));
        await user.click(screen.getByRole('button', { name: 'All statuses' }));
        await user.click(screen.getByRole('button', { name: 'Pending' }));
        await user.click(screen.getByRole('button', { name: 'Credit' }));
        await user.click(screen.getByRole('button', { name: 'Debit' }));
        await waitFor(() => expect(api.get).toHaveBeenCalledWith(expect.stringContaining('type=debit&status=pending'), 'admin-token'));
        await user.click(screen.getByRole('button', { name: 'Debit' }));
        await user.click(screen.getByRole('button', { name: 'Refund' }));
        await waitFor(() => expect(api.get).toHaveBeenCalledWith(expect.stringContaining('type=refund&status=pending'), 'admin-token'));
        await user.click(screen.getByRole('button', { name: 'Refund' }));
        await user.click(screen.getByRole('button', { name: 'Credit' }));
        await user.type(screen.getByPlaceholderText('Search user or transaction ID'), '  ada  ');
        await waitFor(() => expect(api.get).toHaveBeenCalledWith(expect.stringContaining('type=credit&status=pending'), 'admin-token'));
        await waitFor(() => expect(api.get).toHaveBeenCalledWith(expect.stringContaining('query=ada'), 'admin-token'));
    });

    it('supports failed and abandoned filters and labels provider status as an observation', async () => {
        const user = userEvent.setup();
        renderRoutes();
        await screen.findByText('Ada Okonkwo');
        await user.click(screen.getByRole('button', { name: 'All statuses' }));
        await user.click(screen.getByRole('button', { name: 'Failed' }));
        await waitFor(() => expect(api.get).toHaveBeenCalledWith(expect.stringContaining('status=failed'), 'admin-token'));
        await user.click(screen.getByRole('button', { name: 'Failed' }));
        await user.click(screen.getByRole('button', { name: 'Not completed' }));
        expect(await screen.findByText(/Paystack observed Not completed/)).toBeTruthy();
        expect(screen.getByText(/Paystack observed Not completed/).closest('p').getAttribute('title')).toContain('not proof of customer cancellation');
        expect(screen.getByText(/Paystack observed Not completed/).closest('p').className).toContain('whitespace-normal');
        expect(screen.getByText(/Paystack observed Not completed/).closest('td').className).not.toContain('whitespace-nowrap');
        expect(screen.getByText(/Checked/)).toBeTruthy();
        await waitFor(() => expect(api.get).toHaveBeenCalledWith(expect.stringContaining('status=abandoned'), 'admin-token'));
    });

    it('requests server-side pagination and fetches transaction details from the eye action', async () => {
        const user = userEvent.setup();
        const originalGet = api.get.getMockImplementation();
        let resolveTransactionDetails;
        api.get.mockImplementation((path, token) => path === '/superadmin/user-wallet/transactions/LEDGER%3Aledger-1'
            ? new Promise((resolve) => { resolveTransactionDetails = resolve; })
            : originalGet(path, token));
        renderRoutes();
        await screen.findByText('Ada Okonkwo');
        await user.click(screen.getByRole('button', { name: 'Next page' }));
        await waitFor(() => expect(api.get).toHaveBeenCalledWith(expect.stringContaining('page=2'), 'admin-token'));
        await screen.findByText('Pending');
        await user.click(screen.getByRole('button', { name: 'Previous page' }));
        await screen.findByText('+₦5,000.00');
        await user.click(screen.getByRole('button', { name: 'View transaction LEDGER:ledger-1' }));
        expect(await screen.findByRole('dialog', { name: 'Transaction details' })).toBeTruthy();
        expect(await screen.findByText('Loading transaction details…')).toBeTruthy();
        resolveTransactionDetails({ data: { ...transaction, email: 'ada@example.com', phonenumber: '+2348012345678', balanceAfterKobo: 850000, updatedAt: null, orderId: null, orderStatus: null, topUpStatus: 'SUCCEEDED', reconciliationStatus: null, reconciliationReason: null } });
        expect(await screen.findByText('ada@example.com')).toBeTruthy();
        expect(api.get).toHaveBeenCalledWith('/superadmin/user-wallet/transactions/LEDGER%3Aledger-1', 'admin-token');
    });

    it('shows provider and wallet lifecycle separately and refreshes only unresolved TOPUP rows', async () => {
        const user = userEvent.setup();
        renderRoutes();
        await screen.findByText('Ada Okonkwo');
        await user.click(screen.getByRole('button', { name: 'All statuses' }));
        await user.click(screen.getByRole('button', { name: 'Not completed' }));
        await screen.findByText('TOPUP:top-1');
        await user.click(screen.getByRole('button', { name: 'View transaction TOPUP:top-1' }));
        expect(await screen.findByText('Top-up lifecycle and provider observation')).toBeTruthy();
        expect(screen.getByText('Wallet top-up status')).toBeTruthy();
        expect(screen.getByText('Latest Paystack observation')).toBeTruthy();
        await user.click(screen.getByRole('button', { name: 'Refresh payment status' }));
        await waitFor(() => expect(api.post).toHaveBeenCalledWith('/superadmin/user-wallet/transactions/TOPUP%3Atop-1/refresh', {}, 'admin-token'));
    });

    it('keeps payment reconciliation separate and sends the CREDITED resolution contract', async () => {
        api.get.mockImplementation(async (path) => {
            if (path === '/superadmin/wallet-top-ups/reconciliation?page=1&status=REVIEW_REQUIRED') return { data: { data: [{ id: 'case-1', topUpId: 'top-1', paymentReference: 'PAY-REF-1', amountKobo: 500000, currency: 'NGN', reason: 'EXPIRED', status: 'REVIEW_REQUIRED', detectedAt: '2026-11-02T08:00:00.000Z', topUp: { id: 'top-1', userId: 'user-1', amountKobo: 500000, currency: 'NGN', status: 'RECONCILIATION_REQUIRED', paymentReference: 'PAY-REF-1' } }], meta: { page: 1, pageSize: 25, total: 1, totalPages: 1 } } };
            throw new Error(`Unexpected GET ${path}`);
        });
        const user = userEvent.setup();
        renderRoutes('/admin/wallet/user/reconciliation');
        expect(await screen.findByText('Payment Reconciliation')).toBeTruthy();
        expect(api.get).toHaveBeenCalledWith('/superadmin/wallet-top-ups/reconciliation?page=1&status=REVIEW_REQUIRED', 'admin-token');
        expect(await screen.findByText('user-1')).toBeTruthy();
        await user.click(screen.getByRole('button', { name: 'Review' }));
        await user.type(screen.getByLabelText(/Resolution note/), 'Verified payment in provider dashboard');
        await user.click(screen.getByRole('button', { name: 'Save resolution' }));
        await waitFor(() => expect(api.post).toHaveBeenCalledWith('/superadmin/wallet-top-ups/reconciliation/case-1/resolve', { resolution: 'CREDITED', note: 'Verified payment in provider dashboard' }, 'admin-token'));
        await screen.findByText('user-1');
        await user.click(screen.getByRole('button', { name: 'Review' }));
        await user.click(screen.getByRole('button', { name: 'Refund already processed' }));
        await user.type(screen.getByLabelText(/Resolution note/), 'Refund confirmed in Paystack');
        await user.type(screen.getByLabelText('Numeric Paystack refund reference'), '123456');
        await user.click(screen.getByRole('button', { name: 'Save resolution' }));
        await waitFor(() => expect(api.post).toHaveBeenLastCalledWith('/superadmin/wallet-top-ups/reconciliation/case-1/resolve', { resolution: 'REFUNDED', note: 'Refund confirmed in Paystack', providerRefundReference: '123456' }, 'admin-token'));
    });

    it('loads the paginated balance page, searches server-side, then opens wallet metrics and history', async () => {
        const user = userEvent.setup();
        renderRoutes('/admin/wallet/user/balances');
        expect(await screen.findByText('₦8,500.00')).toBeTruthy();
        expect(api.get).toHaveBeenCalledWith('/superadmin/user-wallets?page=1&limit=20', 'admin-token');
        await user.type(screen.getByPlaceholderText('Search customer or user ID'), ' ada ');
        await waitFor(() => expect(api.get).toHaveBeenCalledWith('/superadmin/user-wallets?page=1&limit=20&query=ada', 'admin-token'));
        await user.click(screen.getByRole('button', { name: 'Next page' }));
        await waitFor(() => expect(api.get).toHaveBeenCalledWith('/superadmin/user-wallets?page=2&limit=20&query=ada', 'admin-token'));
        await user.click(screen.getByRole('button', { name: 'Previous page' }));
        await user.click(screen.getByRole('button', { name: "View Ada Okonkwo's wallet" }));
        expect(await screen.findByRole('dialog', { name: 'Ada Okonkwo' })).toBeTruthy();
        expect(await screen.findByText('Wallet metrics')).toBeTruthy();
        expect(screen.getByText('Wallet balance')).toBeTruthy();
        expect(screen.getAllByText('Total top-ups').length).toBeGreaterThan(1);
        expect(screen.getByText('Total spending')).toBeTruthy();
        expect(await screen.findByText('Total refunds')).toBeTruthy();
        expect(api.get).toHaveBeenCalledWith('/superadmin/users/user-1/wallet', 'admin-token');
        expect(api.get).toHaveBeenCalledWith(expect.stringContaining('/superadmin/users/user-1/wallet/transactions?page=1'), 'admin-token');
    });

    it('renders explicit empty and error states', async () => {
        api.get.mockImplementation(async (path) => {
            if (path === '/superadmin/user-wallet/summary') return { data: summary };
            if (path.startsWith('/superadmin/user-wallet/transactions?')) return { data: { data: [], total: 0, page: 1, pageSize: 20 } };
            throw new Error('API unavailable');
        });
        renderRoutes();
        expect(await screen.findByText('No user wallet transactions found')).toBeTruthy();
        cleanup();
        api.get.mockRejectedValue(new Error('Wallet service unavailable'));
        renderRoutes('/admin/wallet/user/balances');
        expect(await screen.findByText('Wallet service unavailable')).toBeTruthy();
    });
});
