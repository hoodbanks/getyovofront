import { describe, expect, it } from 'vitest';
import {
    FINANCIAL_ACTIVITY_EVENT_TYPES,
    SUMMARY_METRICS,
    activityAmountTone,
    activityStatusTone,
    buildFinancialActivityParams,
    buildFinancialActivitySummaryParams,
    eventTypeLabel,
    formatActivityAmount,
    formatKobo,
    readSummaryMetric,
} from './financialActivityUtils';

const row = (overrides) => ({
    activityId: 'ORDER:1',
    source: 'ORDER',
    sourceId: '1',
    domain: 'ORDER_PAYMENT',
    eventType: 'ORDER_PAID',
    status: 'SUCCESSFUL',
    isBalanceMovement: false,
    currency: 'NGN',
    amountKobo: 450000,
    deltaKobo: null,
    direction: 'NONE',
    occurredAt: '2026-10-29T10:00:00.000Z',
    relatedReference: null,
    orderId: null,
    orderCode: null,
    paymentMethodCode: null,
    userId: null,
    vendorId: null,
    actorLabel: null,
    ...overrides,
});

describe('financial activity amounts and query contract', () => {
    it('colors incoming and outgoing wallet movements consistently', () => {
        expect(activityAmountTone(row({ isBalanceMovement: true, deltaKobo: 5000, direction: 'IN' }))).toBe('text-emerald-700');
        expect(activityAmountTone(row({ isBalanceMovement: true, deltaKobo: -5000, direction: 'OUT' }))).toBe('text-rose-700');
        expect(activityAmountTone(row({ eventType: 'ORDER_PAID' }))).toBe('text-zinc-900');
    });

    it('uses matching status colors for successful, pending, and failed activity', () => {
        expect(activityStatusTone('SUCCESSFUL')).toContain('emerald');
        expect(activityStatusTone('PENDING')).toContain('amber');
        expect(activityStatusTone('FAILED')).toContain('rose');
    });

    it('keeps paid-order totals unsigned and uses delta only for balance movements', () => {
        expect(formatActivityAmount(row({ paymentMethodCode: 'WALLET' }))).toEqual({
            text: '₦4,500.00',
            caption: 'Paid order total · WALLET',
        });
        expect(formatActivityAmount(row({
            eventType: 'CUSTOMER_ORDER_DEBIT',
            isBalanceMovement: true,
            amountKobo: 999999,
            deltaKobo: -200000,
            direction: 'OUT',
        }))).toEqual({ text: '−₦2,000.00', caption: 'Balance movement' });
        expect(formatActivityAmount(row({
            isBalanceMovement: true,
            amountKobo: 100,
            deltaKobo: null,
            direction: 'IN',
        })).text).toBe('—');
    });

    it('formats every supported event without turning null money into zero', () => {
        const amounts = {
            ORDER_PAID: { isBalanceMovement: false, amountKobo: 450000, deltaKobo: null, direction: 'NONE', paymentMethodCode: 'PAYSTACK' },
            CUSTOMER_TOP_UP: { isBalanceMovement: true, amountKobo: 100000, deltaKobo: 100000, direction: 'IN' },
            CUSTOMER_ORDER_DEBIT: { isBalanceMovement: true, amountKobo: 200000, deltaKobo: -200000, direction: 'OUT' },
            CUSTOMER_REFUND: { isBalanceMovement: true, amountKobo: 300000, deltaKobo: 300000, direction: 'IN' },
            CUSTOMER_TOP_UP_ATTEMPT: { isBalanceMovement: false, amountKobo: 400000, deltaKobo: null, direction: 'NONE' },
            CUSTOMER_TOP_UP_RECONCILIATION: { isBalanceMovement: false, amountKobo: 500000, deltaKobo: null, direction: 'NONE' },
            VENDOR_ORDER_CREDIT: { isBalanceMovement: true, amountKobo: 600000, deltaKobo: 600000, direction: 'IN' },
            VENDOR_EARNINGS_REVERSAL: { isBalanceMovement: true, amountKobo: 700000, deltaKobo: -700000, direction: 'OUT' },
            VENDOR_WITHDRAWAL: { isBalanceMovement: true, amountKobo: 800000, deltaKobo: -800000, direction: 'OUT' },
            REFERRAL_REWARD: { isBalanceMovement: true, amountKobo: 900000, deltaKobo: 900000, direction: 'IN' },
            REFERRAL_WITHDRAWAL: { isBalanceMovement: true, amountKobo: 1000000, deltaKobo: -1000000, direction: 'OUT' },
        };
        FINANCIAL_ACTIVITY_EVENT_TYPES.filter((eventType) => eventType !== 'ALL').forEach((eventType) => {
            expect(eventTypeLabel(eventType)).not.toBe(eventType);
            const display = formatActivityAmount(row({ eventType, ...amounts[eventType] }));
            expect(display.text).not.toBe('₦0.00');
            expect(display.text).not.toBe('—');
        });
        expect(formatActivityAmount(row({ amountKobo: null, deltaKobo: null })).text).toBe('—');
        expect(formatKobo(null)).toBeNull();
    });

    it('reads summary metrics independently and leaves missing fields blank', () => {
        const summary = {
            paidOrderVolumeKobo: 125000000,
            paidOrderCount: 320,
            customerTopUpsSucceededKobo: 0,
            customerTopUpsSucceededCount: 0,
        };
        expect(readSummaryMetric(summary, SUMMARY_METRICS[0])).toEqual({ amountKobo: 125000000, count: 320 });
        expect(readSummaryMetric(summary, SUMMARY_METRICS[1])).toEqual({ amountKobo: 0, count: 0 });
        expect(readSummaryMetric(summary, SUMMARY_METRICS[2])).toEqual({ amountKobo: null, count: null });
        expect(readSummaryMetric(null, SUMMARY_METRICS[0])).toEqual({ amountKobo: null, count: null });
    });

    it('sends server filters, caps the page size, and adds custom Lagos dates only when both are present', () => {
        const params = buildFinancialActivityParams({
            page: 2,
            limit: 80,
            query: '  ada  ',
            domain: 'CUSTOMER_WALLET',
            eventType: 'CUSTOMER_ORDER_DEBIT',
            status: 'SUCCESSFUL',
            dateFilter: 'custom',
            from: '2026-10-01',
            to: '2026-10-31',
        });
        expect(params.toString()).toBe('page=2&limit=50&domain=CUSTOMER_WALLET&eventType=CUSTOMER_ORDER_DEBIT&status=SUCCESSFUL&dateFilter=custom&query=ada&from=2026-10-01&to=2026-10-31');
        expect(buildFinancialActivityParams({ query: '   ' }).has('query')).toBe(false);
        expect(buildFinancialActivitySummaryParams({ dateFilter: 'today' }).toString()).toBe('dateFilter=today');
        expect(buildFinancialActivitySummaryParams({ dateFilter: 'custom', from: '2026-10-01', to: '2026-10-02' }).toString()).toBe('dateFilter=custom&from=2026-10-01&to=2026-10-02');
    });
});
