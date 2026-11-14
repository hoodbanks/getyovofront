import { useQuery } from '@tanstack/react-query';
import { CircleDollarSign, Loader2, UserRound, X } from 'lucide-react';
import api from '../../api/api';
import { useAuthStore } from '../../store/useAuthStore';
import { formatShortDateTime } from '../../utils/formatters';
import { activityAmountTone, activityStatusTone, displayText, eventTypeLabel, formatActivityAmount, formatKobo, statusLabel } from '../../pages/admin/financialActivityUtils';

const Detail = ({ label, value, mono = false }) => (
    <div className="min-w-0 rounded-lg bg-zinc-50 px-3 py-2.5">
        <p className="text-[9px] font-semibold uppercase tracking-wide text-zinc-500">{label}</p>
        <p className={`mt-1 break-words text-xs font-semibold text-zinc-900 ${mono ? 'font-mono' : ''}`}>{displayText(value)}</p>
    </div>
);

const personName = (profile) => profile?.name || [profile?.firstname, profile?.lastname].filter(Boolean).join(' ') || null;
const lookupOrderId = (activity) => {
    if (activity?.orderId) return activity.orderId;
    // Refund ledger references are written as wallet-refund:<orderId>.
    if (activity?.eventType === 'CUSTOMER_REFUND' && activity.relatedReference?.startsWith('wallet-refund:')) {
        return activity.relatedReference.slice('wallet-refund:'.length) || null;
    }
    return null;
};

const FinancialActivityDetailsPanel = ({ activityId, onClose }) => {
    const token = useAuthStore((state) => state.accessToken);
    const query = useQuery({
        queryKey: ['financial-activity-detail', activityId],
        queryFn: () => api.get(`/superadmin/financial-activity/${encodeURIComponent(activityId)}`, token),
        enabled: Boolean(activityId),
        retry: false,
    });
    const activity = query.data?.data;
    const amount = formatActivityAmount(activity);
    const isReferral = activity?.domain === 'REFERRAL';
    const relatedOrderId = lookupOrderId(activity);

    const orderQuery = useQuery({
        queryKey: ['financial-activity-order', relatedOrderId],
        queryFn: () => api.get(`/superadmin/orders/${encodeURIComponent(relatedOrderId)}/overview`, token),
        enabled: Boolean(token && relatedOrderId),
        retry: false,
    });
    const userQuery = useQuery({
        queryKey: ['financial-activity-user', activity?.userId],
        queryFn: () => api.get(`/superadmin/users/${encodeURIComponent(activity.userId)}/overview`, token),
        enabled: Boolean(token && activity?.userId),
        retry: false,
    });
    const relatedVendorId = activity?.vendorId || orderQuery.data?.data?.order?.vendorId;
    const vendorQuery = useQuery({
        queryKey: ['financial-activity-vendor', relatedVendorId],
        queryFn: () => api.get(`/superadmin/vendors/${encodeURIComponent(relatedVendorId)}/overview?filter=all`, token),
        enabled: Boolean(token && relatedVendorId),
        retry: false,
    });
    const walletLedgerQuery = useQuery({
        queryKey: ['financial-activity-wallet-ledger', activity?.source, activity?.sourceId],
        queryFn: () => {
            const walletPath = activity.source === 'CUSTOMER_LEDGER' ? 'user-wallet' : 'vendor-wallet';
            return api.get(`/superadmin/${walletPath}/transactions/${encodeURIComponent(`LEDGER:${activity.sourceId}`)}`, token);
        },
        enabled: Boolean(token && activity?.isBalanceMovement && activity?.sourceId && ['CUSTOMER_LEDGER', 'VENDOR_LEDGER'].includes(activity.source)),
        retry: false,
    });

    const order = orderQuery.data?.data?.order;
    const customer = userQuery.data?.data;
    const vendor = vendorQuery.data?.data;
    const vendorName = vendor?.ownerName || order?.vendorName || activity?.vendorName;
    const storeName = order?.vendorStoreName || order?.storeName || vendor?.storeName || activity?.storeName;
    const customerDisplayName = personName(customer) || order?.customerName || activity?.actorLabel || activity?.customerName;
    const customerPhone = customer?.phone || customer?.phonenumber || order?.customerPhone;
    const walletLedger = walletLedgerQuery.data?.data;
    const balanceAfterKobo = walletLedger?.balanceAfterKobo ?? activity?.balanceAfterKobo;
    const showBalanceAfter = Boolean(activity?.isBalanceMovement && !isReferral);
    const unavailable = query.error?.status === 404;

    return (
        <div className="fixed inset-0 z-[120] overflow-hidden">
            <button type="button" aria-label="Close financial activity details" onClick={onClose} className="absolute inset-0 h-full w-full bg-black/50" />
            <aside role="dialog" aria-modal="true" aria-labelledby="financial-activity-detail-title" className="absolute inset-y-0 right-0 flex h-full w-full max-w-xl flex-col overflow-hidden bg-white shadow-2xl">
                <header className="flex shrink-0 items-center justify-between gap-4 border-b border-white/10 bg-[#0F172B] px-5 py-5 sm:px-6">
                    <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-emerald-200/20 bg-emerald-400/10 text-emerald-300"><CircleDollarSign size={21} /></span>
                        <div className="min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">Financial activity</p>
                            <h2 id="financial-activity-detail-title" className="mt-1 truncate text-base font-bold text-white">{activity ? eventTypeLabel(activity.eventType) : 'Activity details'}</h2>
                            <p className="mt-1 truncate text-xs text-slate-300">{activity?.orderCode ? `Order ${activity.orderCode}` : [activity?.actorLabel, statusLabel(activity?.status)].filter(Boolean).join(' · ') || 'Transaction record'}</p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} aria-label="Close activity details" className="shrink-0 rounded-lg p-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"><X size={20} /></button>
                </header>
                <div className="min-h-0 flex-1 overflow-y-auto bg-zinc-50/70 p-4 custom-scrollbar sm:p-5">
                    {query.isLoading ? <div className="flex min-h-64 flex-col items-center justify-center text-center"><Loader2 className="animate-spin text-emerald-700" /><p className="mt-3 text-sm font-semibold text-zinc-800">Loading activity details...</p></div>
                        : unavailable ? <div role="alert" className="rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-700">This activity is unavailable.</div>
                            : query.error ? <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"><p>{query.error.message || 'Could not load this activity.'}</p><button type="button" onClick={() => query.refetch()} className="mt-3 font-bold underline">Retry</button></div>
                                : activity && <div className="space-y-4">
                                    <section className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-5">
                                        <div className="flex items-start justify-between gap-3">
                                            <div><p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">{amount.caption || 'Amount'}</p><p className={`mt-2 text-2xl font-bold ${activityAmountTone(activity)}`}>{amount.text}</p></div>
                                            <span className={`rounded-full px-3 py-1 text-[10px] font-semibold ${activityStatusTone(activity.status)}`}>{statusLabel(activity.status)}</span>
                                        </div>
                                        <span className="mt-3 inline-flex rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[10px] font-semibold text-zinc-700">{eventTypeLabel(activity.eventType)}</span>
                                    </section>

                                    {(customerDisplayName || activity.userId || customer?.email || customerPhone) && <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
                                        <h3 className="flex items-center gap-2 border-b border-zinc-100 px-4 py-3.5 text-sm font-bold text-zinc-900"><UserRound size={16} className="text-emerald-800" />Customer</h3>
                                        <div className="grid grid-cols-1 gap-2 p-3 sm:grid-cols-2"><Detail label="Name" value={customerDisplayName} /><Detail label="Phone" value={customerPhone} /><Detail label="Email" value={customer?.email || order?.customerEmail} /></div>
                                    </section>}

                                    <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
                                        <h3 className="border-b border-zinc-100 px-4 py-3.5 text-sm font-bold text-zinc-900">Order and payment</h3>
                                        <div className="grid grid-cols-1 gap-2 p-3 sm:grid-cols-2">
                                            <Detail label="Order code" value={order?.orderCode || order?.code || activity.orderCode} />
                                            <Detail label="Order status" value={order?.status || activity.orderStatus} />
                                            <Detail label="Payment method" value={activity.paymentMethodCode} />
                                            <Detail label="Occurred" value={activity.occurredAt ? formatShortDateTime(activity.occurredAt) : null} />
                                            <Detail label="Vendor" value={vendorName || (activity.vendorId ? 'Vendor details unavailable' : null)} />
                                            <Detail label="Store" value={storeName || (activity.vendorId ? 'Store details unavailable' : null)} />
                                        </div>
                                    </section>

                                    {showBalanceAfter && <section className="rounded-xl border border-zinc-200 bg-white p-4"><div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Balance after this movement</p><p className="mt-1 text-lg font-bold text-zinc-900">{balanceAfterKobo == null ? 'Not available' : formatKobo(balanceAfterKobo)}</p></div>{walletLedgerQuery.isFetching && <Loader2 size={16} className="animate-spin text-emerald-700" />}</div>{walletLedgerQuery.isError && <p className="mt-2 text-[10px] text-amber-700">Could not load the related wallet ledger record.</p>}</section>}

                                    {Array.isArray(activity.ledgerEvents) && activity.ledgerEvents.length > 0 && <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white"><h3 className="border-b border-zinc-100 px-4 py-3.5 text-sm font-bold text-zinc-900">Related wallet events</h3><ul className="divide-y divide-zinc-100">{activity.ledgerEvents.map((event) => <li key={event.id} className="flex items-center justify-between gap-3 px-4 py-3 text-xs"><div><p className="font-semibold text-zinc-800">{eventTypeLabel(event.type) || event.type}</p><p className="mt-1 text-[10px] text-zinc-500">{event.createdAt ? formatShortDateTime(event.createdAt) : 'Time unavailable'}</p></div><span className="font-semibold text-zinc-900">{formatKobo(event.deltaKobo) || '—'}</span></li>)}</ul></section>}

                                    {isReferral && <section className="rounded-xl border border-zinc-200 bg-white p-4"><p className="text-xs text-zinc-600">Referral Wallet has no ledger balance history.</p></section>}

                                    <details className="rounded-xl border border-zinc-200 bg-white px-4 py-3">
                                        <summary className="cursor-pointer text-xs font-semibold text-zinc-700">Technical references</summary>
                                        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                                            <Detail label="Activity ID" value={activity.activityId || activityId} mono />
                                            <Detail label="Order ID" value={relatedOrderId || activity.orderId} mono />
                                            <Detail label="Customer ID" value={activity.userId} mono />
                                            <Detail label="Vendor ID" value={activity.vendorId} mono />
                                            <Detail label="Reference" value={activity.relatedReference} mono />
                                            <Detail label="Actor" value={activity.actorLabel} />
                                            <Detail label="Account" value={activity.accountLast4 ? `Ending ${activity.accountLast4}` : null} />
                                            <Detail label="Transfer reference" value={activity.bankTransferReference} mono />
                                        </div>
                                    </details>
                                </div>}
                </div>
            </aside>
        </div>
    );
};

export default FinancialActivityDetailsPanel;
