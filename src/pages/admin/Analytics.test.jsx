import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Analytics from './Analytics';
import api from '../../api/api';

vi.mock('../../api/api', () => ({ default: { get: vi.fn() } }));
vi.mock('../../store/useAuthStore', () => ({ useAuthStore: (selector) => selector({ accessToken: 'admin-token' }) }));

const renderAnalytics = () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    return render(<QueryClientProvider client={client}><Analytics /></QueryClientProvider>);
};

afterEach(() => cleanup());

describe('Super Admin financial analytics', () => {
    it('uses explicit metrics and keeps financial measures distinct', async () => {
        api.get.mockResolvedValue({ data: {
            summary: {
                ordersToday: 2,
                grossPaidOrderValueKobo: 650000,
                customerOrderRefundsKobo: 50000,
                platformFeesEarnedKobo: 24000,
                deliveryFeesOnPaidOrdersKobo: 42000,
                paidCancelledOrderValueKobo: 100000,
                totalRevenue: 999999,
                platformCommission: 999999,
                vendorPayout: 999999,
            },
            revenueGraph: { data: [{ day: '2026-11-02T00:00:00.000Z', total: 6500 }] },
            ordersGraph: { data: [] },
            payoutGraph: { data: [] },
            revenueSplit: { data: {
                grossPaidOrderValueKobo: 650000,
                customerOrderRefundsKobo: 50000,
                paidCancelledOrderCount: 1,
                paidCancelledOrderValueKobo: 100000,
                deliveryFeesOnPaidOrdersKobo: 42000,
                platformFeesEarnedKobo: 24000,
            } },
        } });

        renderAnalytics();
        expect((await screen.findAllByText('Gross paid order value')).length).toBeGreaterThan(0);
        expect(screen.getAllByText('Customer Wallet refunds').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Platform fees earned').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Delivery fees on paid orders').length).toBeGreaterThan(0);
        expect(screen.getByText('Legacy Vendor payout estimate')).toBeTruthy();
        expect(screen.getByText('Financial metrics')).toBeTruthy();
        expect(screen.getByText(/paid order value and delivery fees use paid date/)).toBeTruthy();
        expect(screen.queryByText('Revenue Generated')).toBeNull();
        expect(screen.queryByText('Platform Commission')).toBeNull();
        expect(screen.queryByText('Vendor Payout')).toBeNull();
        expect(screen.getByText('Paid cancelled order value')).toBeTruthy();
        expect(screen.getAllByText('₦1,000.00').length).toBeGreaterThan(0);
        expect(screen.getByText('Original value of paid cancelled orders')).toBeTruthy();
        expect(screen.getByText(/These amounts stay separate/)).toBeTruthy();
    });

    it('does not substitute legacy totals when explicit metrics are missing', async () => {
        api.get.mockResolvedValue({ data: { summary: { ordersToday: 0, totalRevenue: 1234, platformCommission: 50, vendorPayout: 900 }, revenueGraph: { data: [] }, ordersGraph: { data: [] }, payoutGraph: { data: [] }, revenueSplit: { data: { totalRevenue: 1234, platformCommission: 50, vendorPayout: 900 } } } });
        renderAnalytics();
        const grossValueCard = (await screen.findAllByText('Gross paid order value'))[0].closest('.relative');
        expect(grossValueCard.textContent).toContain('Not available');
        expect(screen.queryByText('₦1,234.00')).toBeNull();
    });
});
