import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Transactions from './Transactions';
import api from '../../api/api';

vi.mock('../../api/api', () => ({ default: { get: vi.fn() } }));
vi.mock('../../store/useAuthStore', () => ({ useAuthStore: (selector) => selector({ accessToken: 'admin-token' }) }));
vi.mock('sonner', () => ({ toast: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() }) }));

const limitations = {
    isAccountingLedger: false,
    referralWalletLedger: 'absent',
    notes: ['This feed normalizes heterogeneous operational records. It is not a double-entry accounting ledger.'],
};

const summary = {
    currency: 'NGN',
    dateFilter: 'all_time',
    from: null,
    to: null,
    paidOrderVolumeKobo: 125000000,
    paidOrderVolumeNaira: 1250000,
    paidOrderCount: 320,
    customerTopUpsSucceededKobo: 48000000,
    customerTopUpsSucceededNaira: 480000,
    customerTopUpsSucceededCount: 90,
    vendorWithdrawalsCompletedKobo: 61000000,
    vendorWithdrawalsCompletedNaira: 610000,
    vendorWithdrawalsCompletedCount: 40,
    referralWithdrawalsCompletedKobo: 2500000,
    referralWithdrawalsCompletedNaira: 25000,
    referralWithdrawalsCompletedCount: 8,
    definitions: {},
};

const activity = (overrides) => ({
    activityId: 'ORDER:order_1',
    source: 'ORDER',
    sourceId: 'order_1',
    domain: 'ORDER_PAYMENT',
    eventType: 'ORDER_PAID',
    status: 'SUCCESSFUL',
    isBalanceMovement: false,
    currency: 'NGN',
    amountKobo: 450000,
    deltaKobo: null,
    direction: 'NONE',
    occurredAt: '2026-10-29T10:00:00.000Z',
    relatedReference: 'PAY_abc',
    orderId: 'order_1',
    orderCode: 'GY-1001',
    paymentMethodCode: 'WALLET',
    userId: 'user_1',
    vendorId: null,
    actorLabel: null,
    ...overrides,
});

const rows = [
    activity({}),
    activity({ activityId: 'CUSTOMER_LEDGER:topup_1', source: 'CUSTOMER_LEDGER', sourceId: 'topup_1', domain: 'CUSTOMER_WALLET', eventType: 'CUSTOMER_TOP_UP', isBalanceMovement: true, amountKobo: 100000, deltaKobo: 100000, direction: 'IN', paymentMethodCode: null, orderCode: null, actorLabel: 'Ada Okeke', vendorId: null }),
    activity({ activityId: 'CUSTOMER_LEDGER:debit_1', source: 'CUSTOMER_LEDGER', sourceId: 'debit_1', domain: 'CUSTOMER_WALLET', eventType: 'CUSTOMER_ORDER_DEBIT', isBalanceMovement: true, amountKobo: 200000, deltaKobo: -200000, direction: 'OUT', paymentMethodCode: null, orderCode: 'GY-1001', actorLabel: 'Ada Okeke' }),
    activity({ activityId: 'CUSTOMER_LEDGER:refund_1', source: 'CUSTOMER_LEDGER', sourceId: 'refund_1', domain: 'CUSTOMER_WALLET', eventType: 'CUSTOMER_REFUND', status: 'REFUNDED', isBalanceMovement: true, amountKobo: 300000, deltaKobo: 300000, direction: 'IN', paymentMethodCode: null, orderCode: null, actorLabel: 'Ada Okeke' }),
    activity({ activityId: 'CUSTOMER_TOPUP:attempt_1', source: 'CUSTOMER_TOPUP', sourceId: 'attempt_1', domain: 'CUSTOMER_WALLET', eventType: 'CUSTOMER_TOP_UP_ATTEMPT', status: 'PENDING', isBalanceMovement: false, amountKobo: 400000, deltaKobo: null, direction: 'NONE', paymentMethodCode: null, orderCode: null, actorLabel: 'Ada Okeke' }),
    activity({ activityId: 'CUSTOMER_RECONCILIATION:recon_1', source: 'CUSTOMER_RECONCILIATION', sourceId: 'recon_1', domain: 'CUSTOMER_WALLET', eventType: 'CUSTOMER_TOP_UP_RECONCILIATION', status: 'REVIEW_REQUIRED', isBalanceMovement: false, amountKobo: 500000, deltaKobo: null, direction: 'NONE', paymentMethodCode: null, orderCode: null, actorLabel: 'Ada Okeke' }),
    activity({ activityId: 'VENDOR_LEDGER:credit_1', source: 'VENDOR_LEDGER', sourceId: 'credit_1', domain: 'VENDOR_WALLET', eventType: 'VENDOR_ORDER_CREDIT', isBalanceMovement: true, amountKobo: 600000, deltaKobo: 600000, direction: 'IN', paymentMethodCode: null, orderCode: null, actorLabel: 'Solid Foods', vendorId: 'vendor_1' }),
    activity({ activityId: 'VENDOR_LEDGER:reversal_1', source: 'VENDOR_LEDGER', sourceId: 'reversal_1', domain: 'VENDOR_WALLET', eventType: 'VENDOR_EARNINGS_REVERSAL', isBalanceMovement: true, amountKobo: 700000, deltaKobo: -700000, direction: 'OUT', paymentMethodCode: null, orderCode: null, actorLabel: 'Solid Foods', vendorId: 'vendor_1' }),
    activity({ activityId: 'VENDOR_WITHDRAWAL:wd_1', source: 'VENDOR_WITHDRAWAL', sourceId: 'wd_1', domain: 'VENDOR_WALLET', eventType: 'VENDOR_WITHDRAWAL', status: 'COMPLETED', isBalanceMovement: true, amountKobo: 800000, deltaKobo: -800000, direction: 'OUT', paymentMethodCode: null, orderCode: null, relatedReference: 'WD-1', actorLabel: 'Solid Foods', vendorId: 'vendor_1' }),
    activity({ activityId: 'REFERRAL_REWARD:reward_1', source: 'REFERRAL_REWARD', sourceId: 'reward_1', domain: 'REFERRAL', eventType: 'REFERRAL_REWARD', status: 'CREDITED', isBalanceMovement: true, amountKobo: 900000, deltaKobo: 900000, direction: 'IN', paymentMethodCode: null, orderCode: null, actorLabel: 'Chidi Ade' }),
    activity({ activityId: 'REFERRAL_WITHDRAWAL:rwd_1', source: 'REFERRAL_WITHDRAWAL', sourceId: 'rwd_1', domain: 'REFERRAL', eventType: 'REFERRAL_WITHDRAWAL', status: 'COMPLETED', isBalanceMovement: true, amountKobo: 1000000, deltaKobo: -1000000, direction: 'OUT', paymentMethodCode: null, orderCode: null, actorLabel: 'Chidi Ade' }),
];

const listResponse = (data = rows, extra = {}) => ({ data: { data, total: extra.total ?? data.length, page: extra.page ?? 1, pageSize: 20, limitations } });

const renderPage = () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    return render(<QueryClientProvider client={client}><Transactions /></QueryClientProvider>);
};

beforeEach(() => {
    api.get.mockImplementation(async (path) => {
        if (path.startsWith('/superadmin/financial-activity/summary')) return { data: summary };
        if (path.startsWith('/superadmin/financial-activity?')) {
            const params = new URLSearchParams(path.split('?')[1]);
            if (params.get('page') === '2') return listResponse([activity({ activityId: 'ORDER:order_2', orderCode: 'GY-2002', actorLabel: 'Page Two' })], { total: 21, page: 2 });
            if (params.get('domain') === 'REFERRAL') return listResponse([]);
            if (params.get('query') === 'ada') return listResponse([rows[1]]);
            return listResponse(rows, { total: 21 });
        }
        if (path === '/superadmin/financial-activity/ORDER%3Aorder_1') {
            return { data: { ...rows[0], orderStatus: 'DELIVERED', storeName: null, balanceAfterKobo: null, note: 'ORDER_PAID records the paid order total. It is not a wallet/account balance movement.', accountLast4: null, bankName: 'Should Not Render Bank', accountNumber: '0123456789' } };
        }
        if (path === '/superadmin/financial-activity/CUSTOMER_LEDGER%3Arefund_1') return { data: { ...rows[3], orderId: null, relatedReference: 'wallet-refund:order_1', balanceAfterKobo: null } };
        if (path === '/superadmin/user-wallet/transactions/LEDGER%3Arefund_1') return { data: { transactionId: 'LEDGER:refund_1', balanceAfterKobo: 505000 } };
        if (path === '/superadmin/orders/order_1/overview') return { data: { order: { orderCode: 'GY-1001', status: 'CANCELLED', vendorId: 'vendor_1', vendorStoreName: 'Solid Foods', customerName: 'Ada Okeke', customerPhone: '+2348012345678' } } };
        if (path === '/superadmin/users/user_1/overview') return { data: { name: 'Ada Okeke', phone: '+2348012345678', email: 'ada@example.com' } };
        if (path === '/superadmin/vendors/vendor_1/overview?filter=all') return { data: { ownerName: 'Solid Foods Owner', storeName: 'Solid Foods', phone: '+2348099999999', email: 'solid@example.com' } };
        if (path === '/superadmin/financial-activity/VENDOR_WITHDRAWAL%3Awd_1') {
            return { data: { ...rows[8], accountLast4: '6789', bankName: 'Zenith Bank', accountName: 'Solid Foods Limited', accountNumber: '0123456789', bankTransferReference: 'TRF-19', ledgerEvents: [{ id: 'reserve_1', type: 'RESERVE', amountKobo: 800000, deltaKobo: -800000, createdAt: '2026-10-29T11:00:00.000Z' }] } };
        }
        if (path === '/superadmin/financial-activity/REFERRAL_REWARD%3Areward_1') {
            return { data: { ...rows[9], balanceAfterKobo: 99900, historyGap: 'Referral Wallet has no append-only ledger.' } };
        }
        throw new Error(`Unexpected GET ${path}`);
    });
});

afterEach(() => cleanup());

describe('Super Admin financial activity', () => {
    it('loads separate summary metrics and every activity event from the server', async () => {
        renderPage();
        expect(await screen.findByText('₦1,250,000.00')).toBeTruthy();
        expect(screen.getByRole('heading', { name: 'Paid order volume' })).toBeTruthy();
        expect(screen.getByRole('heading', { name: 'Customer top-ups succeeded' })).toBeTruthy();
        expect(screen.getByRole('heading', { name: 'Vendor withdrawals completed' })).toBeTruthy();
        expect(screen.getByRole('heading', { name: 'Referral withdrawals completed' })).toBeTruthy();
        expect(screen.getByText('320 records')).toBeTruthy();
        expect(screen.getByText(/including orders with no vendor/)).toBeTruthy();
        expect(screen.getByText(/not added into one volume/)).toBeTruthy();
        expect(screen.queryByText(/all accounting/i)).toBeNull();
        expect(screen.queryByText('₦2,341,000.00')).toBeNull();
        expect(screen.getByText('Paid order')).toBeTruthy();
        expect(screen.getByText('Customer top-up')).toBeTruthy();
        expect(screen.getByText('Customer order debit')).toBeTruthy();
        expect(screen.getByText('Customer refund')).toBeTruthy();
        expect(screen.getByText('Top-up attempt')).toBeTruthy();
        expect(screen.getByText('Top-up reconciliation')).toBeTruthy();
        expect(screen.getByText('Vendor order credit')).toBeTruthy();
        expect(screen.getByText('Vendor earnings reversal')).toBeTruthy();
        expect(screen.getByText('Vendor withdrawal')).toBeTruthy();
        expect(screen.getByText('Referral reward')).toBeTruthy();
        expect(screen.getByText('Referral withdrawal')).toBeTruthy();
        const paidOrder = screen.getByRole('button', { name: 'View Paid order for order GY-1001' }).closest('tr');
        expect(within(paidOrder).getByText('₦4,500.00')).toBeTruthy();
        expect(within(paidOrder).getByText('Paid order total · WALLET')).toBeTruthy();
        expect(within(paidOrder).queryByText('No vendor')).toBeNull();
        expect(within(paidOrder).getByText('—')).toBeTruthy();
        expect(within(paidOrder).queryByText('+₦4,500.00')).toBeNull();
        expect(within(screen.getByRole('button', { name: 'View Customer order debit for order GY-1001' }).closest('tr')).getByText('−₦2,000.00')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Export unavailable' }).disabled).toBe(true);
        expect(api.get).toHaveBeenCalledWith('/superadmin/financial-activity/summary?dateFilter=all_time', 'admin-token');
        expect(api.get).toHaveBeenCalledWith('/superadmin/financial-activity?page=1&limit=20&domain=ALL&eventType=ALL&status=ALL&dateFilter=all_time', 'admin-token');
        expect(api.get.mock.calls.some(([path]) => String(path).includes('transchistory'))).toBe(false);
    });

    it('shows an empty result without inventing amounts', async () => {
        const user = userEvent.setup();
        renderPage();
        await screen.findAllByText('Order GY-1001');
        await user.click(screen.getByRole('button', { name: 'All domains' }));
        await user.click(screen.getByRole('button', { name: 'Referral' }));
        expect(await screen.findByText('No financial activity found')).toBeTruthy();
        expect(screen.getByText('₦1,250,000.00')).toBeTruthy();
        expect(screen.queryByText('₦0.00')).toBeNull();
        await waitFor(() => expect(api.get).toHaveBeenCalledWith(expect.stringContaining('domain=REFERRAL'), 'admin-token'));
    });

    it('shows a loading state before the list arrives', async () => {
        let resolveList;
        const original = api.get.getMockImplementation();
        api.get.mockImplementation((path, token) => (
            path.startsWith('/superadmin/financial-activity?')
                ? new Promise((resolve) => { resolveList = () => resolve(listResponse(rows, { total: 21 })); })
                : original(path, token)
        ));
        renderPage();
        expect(await screen.findByText('Loading financial activity…')).toBeTruthy();
        expect(screen.queryByText('No financial activity found')).toBeNull();
        expect(screen.queryByText('₦0.00')).toBeNull();
        resolveList();
        expect(await screen.findAllByText('Order GY-1001')).not.toHaveLength(0);
    });

    it('shows a retryable list error and does not replace a missing summary field with zero', async () => {
        const user = userEvent.setup();
        let listAttempts = 0;
        api.get.mockImplementation(async (path) => {
            if (path.startsWith('/superadmin/financial-activity/summary')) {
                const incomplete = { ...summary };
                delete incomplete.paidOrderVolumeKobo;
                delete incomplete.paidOrderCount;
                return { data: incomplete };
            }
            if (path.startsWith('/superadmin/financial-activity?')) {
                listAttempts += 1;
                if (listAttempts === 1) {
                    const error = new Error('Financial activity failed');
                    error.status = 500;
                    throw error;
                }
                return listResponse(rows, { total: 21 });
            }
            throw new Error(`Unexpected GET ${path}`);
        });
        renderPage();
        expect(await screen.findByRole('alert')).toBeTruthy();
        expect(screen.getByText('Financial activity failed')).toBeTruthy();
        const paidOrders = screen.getByRole('heading', { name: 'Paid order volume' }).closest('article');
        expect(within(paidOrders).getByText('—')).toBeTruthy();
        expect(within(paidOrders).queryByText('₦0.00')).toBeNull();
        expect(screen.getByText('₦480,000.00')).toBeTruthy();
        await user.click(screen.getByRole('button', { name: 'Retry' }));
        expect(await screen.findAllByText('Order GY-1001')).not.toHaveLength(0);
    });

    it('requests the next page and changed filters from the server', async () => {
        const user = userEvent.setup();
        renderPage();
        await screen.findAllByText('Order GY-1001');
        await user.click(screen.getByRole('button', { name: 'Next page' }));
        expect(await screen.findByText('Page Two')).toBeTruthy();
        await waitFor(() => expect(api.get).toHaveBeenCalledWith(expect.stringContaining('page=2'), 'admin-token'));
        expect(screen.queryByRole('button', { name: 'Reset' })).toBeNull();
        await user.click(screen.getByRole('button', { name: 'All events' }));
        await user.click(screen.getByRole('button', { name: 'Customer order debit' }));
        await user.click(screen.getByRole('button', { name: 'All statuses' }));
        await user.click(screen.getByRole('button', { name: 'Successful' }));
        await user.click(screen.getByRole('button', { name: 'All time' }));
        await user.click(screen.getByRole('button', { name: 'Today' }));
        await waitFor(() => expect(api.get).toHaveBeenCalledWith(expect.stringContaining('page=1&limit=20&domain=ALL&eventType=CUSTOMER_ORDER_DEBIT&status=SUCCESSFUL&dateFilter=today'), 'admin-token'));
        await waitFor(() => expect(api.get).toHaveBeenCalledWith('/superadmin/financial-activity/summary?dateFilter=today', 'admin-token'));
        await user.type(screen.getByPlaceholderText('Search activity, order, user, or vendor'), '  ada  ');
        await waitFor(() => expect(api.get).toHaveBeenCalledWith(expect.stringContaining('query=ada'), 'admin-token'));
        const reset = screen.getByRole('button', { name: 'Reset' });
        expect(reset.parentElement.className).toContain('flex');
        expect(reset.parentElement.querySelectorAll(':scope > .grid > *')).toHaveLength(4);
        await user.click(reset);
        await waitFor(() => expect(api.get).toHaveBeenCalledWith(expect.stringContaining('page=1&limit=20&domain=ALL&eventType=ALL&status=ALL&dateFilter=all_time'), 'admin-token'));
        expect(screen.queryByRole('button', { name: 'Reset' })).toBeNull();
    });

    it('loads source detail on demand and hides full bank details', async () => {
        const user = userEvent.setup();
        renderPage();
        await screen.findAllByText('Order GY-1001');
        expect(api.get.mock.calls.some(([path]) => String(path).includes('ORDER%3Aorder_1'))).toBe(false);
        await user.click(screen.getByRole('button', { name: 'View Paid order for order GY-1001' }));
        expect(await screen.findAllByText('GY-1001')).not.toHaveLength(0);
        expect(screen.getAllByText('Ada Okeke').length).toBeGreaterThan(0);
        expect(screen.getByText('ada@example.com')).toBeTruthy();
        expect(screen.getByText('Solid Foods Owner')).toBeTruthy();
        expect(screen.queryByText('Balance after this movement')).toBeNull();
        expect(screen.queryByText('0123456789')).toBeNull();
        expect(screen.queryByText('Should Not Render Bank')).toBeNull();
        await user.click(screen.getByRole('button', { name: 'Close activity details' }));
        await user.click(screen.getByRole('button', { name: 'View Vendor withdrawal' }));
        expect(await screen.findByText('Ending 6789')).toBeTruthy();
        expect(screen.getByText('RESERVE')).toBeTruthy();
        expect(screen.getByText('Related wallet events')).toBeTruthy();
        expect(screen.queryByText('0123456789')).toBeNull();
        expect(screen.queryByText('Zenith Bank')).toBeNull();
        expect(screen.queryByText('Solid Foods Limited')).toBeNull();
        await user.click(screen.getByRole('button', { name: 'Close activity details' }));
        await user.click(screen.getByRole('button', { name: 'View Referral reward' }));
        expect(await screen.findByText(/Referral Wallet has no ledger balance history/)).toBeTruthy();
        expect(screen.queryByText('₦999.00')).toBeNull();
    });

    it('follows a refund reference to its order and loads the recorded wallet balance after', async () => {
        const user = userEvent.setup();
        renderPage();
        await screen.findAllByText('Order GY-1001');
        await user.click(screen.getByRole('button', { name: 'View Customer refund' }));
        expect(await screen.findAllByText('GY-1001')).not.toHaveLength(0);
        expect(screen.getByText('CANCELLED')).toBeTruthy();
        expect(screen.getByText('Balance after this movement').parentElement.textContent).toContain('₦5,050.00');
        expect(api.get).toHaveBeenCalledWith('/superadmin/orders/order_1/overview', 'admin-token');
        expect(api.get).toHaveBeenCalledWith('/superadmin/user-wallet/transactions/LEDGER%3Arefund_1', 'admin-token');
    });

    it('treats a missing activity as unavailable', async () => {
        const user = userEvent.setup();
        api.get.mockImplementation(async (path) => {
            if (path.startsWith('/superadmin/financial-activity/summary')) return { data: summary };
            if (path.startsWith('/superadmin/financial-activity?')) return listResponse([rows[0]], { total: 1 });
            const error = new Error('Not found');
            error.status = 404;
            throw error;
        });
        renderPage();
        await user.click(await screen.findByRole('button', { name: 'View Paid order for order GY-1001' }));
        expect(await screen.findByText('This activity is unavailable.')).toBeTruthy();
    });
});
