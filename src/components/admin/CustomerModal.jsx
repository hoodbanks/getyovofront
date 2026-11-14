import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react';
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '../../api/api';
import { useAuthStore } from '../../store/useAuthStore';
import { formatDate, formatName } from '../../utils/formatters';
import { CustomerAvatar } from './CustomerAvatar';
import { WalletCustomDateModal, WalletFilterDropdown } from './wallet/WalletControls';

const orderFilters = [
    { value: 'all', label: 'All time' }, { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' }, { value: 'last7days', label: 'Last 7 days' },
    { value: 'last30days', label: 'Last 30 days' }, { value: 'thisMonth', label: 'This month' },
    { value: 'lastMonth', label: 'Last month' }, { value: 'custom', label: 'Custom range' },
];

const naira = (amount) => Number.isFinite(amount) ? `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'Not available';
const overviewMoney = (nairaValue, koboValue) => Number.isFinite(nairaValue) ? naira(nairaValue) : Number.isFinite(koboValue) ? naira(koboValue / 100) : 'Not available';
const displayCount = (value) => Number.isFinite(value) ? value.toLocaleString() : '—';
const dateOrFallback = (date, fallback = 'Not available') => date ? formatDate(date) : fallback;
const LIST_PREVIEW = 3;
const LIST_STEP = 5;

function ConfirmAction({ type, busy, onClose, onConfirm }) {
    const [reason, setReason] = useState('');
    const isDelete = type === 'delete';
    const isRestore = type === 'restore';
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="presentation">
            <button type="button" aria-label="Close confirmation" className="absolute inset-0 bg-black/50" onClick={onClose} />
            <section role="dialog" aria-modal="true" aria-labelledby="customer-confirm-title" className="relative w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
                <div className="flex items-center justify-between">
                    <h3 id="customer-confirm-title" className="text-base font-bold text-zinc-900">{isDelete ? 'Delete customer account?' : isRestore ? 'Restore customer account?' : 'Suspend customer account?'}</h3>
                    <button type="button" aria-label="Close" onClick={onClose} className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100"><X size={18} /></button>
                </div>
                <p className="mt-3 text-sm leading-6 text-zinc-500">{isDelete ? 'This permanently deletes the customer account. The request may be rejected if account safeguards prevent deletion.' : isRestore ? 'The customer will be able to access their account again.' : 'Suspending this customer restricts their access. Provide a reason if one is required.'}</p>
                {!isDelete && !isRestore && <label className="mt-4 block text-xs font-semibold text-zinc-600">Reason (optional)<textarea value={reason} onChange={(event) => setReason(event.target.value)} maxLength={500} rows={3} className="mt-2 w-full rounded-xl border border-zinc-200 p-3 text-sm outline-none focus:border-emerald-600" placeholder="Enter a suspension reason" /></label>}
                <div className="mt-5 flex justify-end gap-2">
                    <button type="button" onClick={onClose} className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-600">Cancel</button>
                    <button type="button" disabled={busy} onClick={() => onConfirm(reason)} className={`rounded-xl px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50 ${isDelete ? 'bg-rose-600' : 'bg-emerald-800'}`}>{busy ? 'Please wait…' : isDelete ? 'Delete account' : isRestore ? 'Restore account' : 'Suspend account'}</button>
                </div>
            </section>
        </div>
    );
}

const CustomerModal = ({ isOpen, onClose, customer, initialTab = 'Overview', readOnly = false }) => {
    const token = useAuthStore((state) => state.accessToken);
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState(initialTab);
    const [orderFilter, setOrderFilter] = useState('last7days');
    const [lastOrderFilter, setLastOrderFilter] = useState('last7days');
    const [ordersPage, setOrdersPage] = useState(1);
    const [referralPages, setReferralPages] = useState(1);
    const [walletVisible, setWalletVisible] = useState(LIST_PREVIEW);
    const [referredVisible, setReferredVisible] = useState(LIST_PREVIEW);
    const [dates, setDates] = useState({ start: '', end: '' });
    const [draftDates, setDraftDates] = useState({ start: '', end: '' });
    const [isCustomDateOpen, setIsCustomDateOpen] = useState(false);
    const [confirmType, setConfirmType] = useState(null);

    const overviewQuery = useQuery({
        queryKey: ['userOverview', customer?.id],
        queryFn: () => api.get(`/superadmin/users/${encodeURIComponent(customer.id)}/overview`, token),
        enabled: Boolean(isOpen && customer?.id),
    });

    const ordersQuery = useQuery({
        queryKey: ['userOrders', customer?.id, orderFilter, ordersPage, dates.from, dates.to],
        queryFn: () => {
            const params = new URLSearchParams({ page: String(ordersPage), filter: orderFilter });
            if (orderFilter === 'custom') {
                params.set('from', dates.start);
                params.set('to', dates.end);
            }
            return api.get(`/superadmin/users/${encodeURIComponent(customer.id)}/orders?${params.toString()}`, token);
        },
        enabled: Boolean(isOpen && customer?.id && activeTab === 'Orders' && (orderFilter !== 'custom' || (dates.start && dates.end))),
    });

    const referralsQuery = useQuery({
        queryKey: ['userReferrals', customer?.id, 1],
        queryFn: () => api.get(`/superadmin/users/${encodeURIComponent(customer.id)}/referrals?page=1`, token),
        enabled: Boolean(isOpen && customer?.id && ['Overview', 'Referral Activities'].includes(activeTab)),
    });
    const moreReferralQueries = useQueries({
        queries: Array.from({ length: Math.max(0, referralPages - 1) }, (_, index) => ({
            queryKey: ['userReferrals', customer?.id, index + 2],
            queryFn: () => api.get(`/superadmin/users/${encodeURIComponent(customer.id)}/referrals?page=${index + 2}`, token),
            enabled: Boolean(isOpen && customer?.id && activeTab === 'Referral Activities'),
        })),
    });

    useEffect(() => {
        setReferralPages(1);
        setWalletVisible(LIST_PREVIEW);
        setReferredVisible(LIST_PREVIEW);
    }, [customer?.id]);

    const leaderboardQuery = useQuery({
        queryKey: ['referral-leaderboard'],
        queryFn: () => api.get('/superadmin/referral-activities/leaderboard', token),
        enabled: Boolean(isOpen && customer?.id && activeTab === 'Referral Activities'),
        retry: false,
    });

    const suspensionMutation = useMutation({
        mutationFn: (body) => api.patch(`/superadmin/users/${encodeURIComponent(customer.id)}/suspension`, body, token),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['userOverview', customer.id] });
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setConfirmType(null);
            toast.success(response.message || 'Customer status updated');
        },
        onError: (error) => toast.error(error.message || 'Could not update customer status'),
    });

    const deleteMutation = useMutation({
        mutationFn: () => api.delete('/superadmin/users', { userId: customer.id }, token),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success(response.message || 'Customer deleted');
            setConfirmType(null);
            onClose();
        },
        onError: (error) => toast.error(error.message || 'Could not delete customer'),
    });

    if (!isOpen || !customer) return null;
    const overview = overviewQuery.data?.data || {};
    const addressDetails = overview.addressDetails;
    const ordersData = ordersQuery.data?.data || {};
    const orders = ordersData.orders || [];
    const referralData = referralsQuery.data?.data || {};
    const referralsPageData = referralData.referrals || {};
    const referrals = [
        ...(referralsPageData.data || []),
        ...moreReferralQueries.flatMap((query) => query.data?.data?.referrals?.data || []),
    ];
    const walletActivity = Array.isArray(referralData.walletActivity) ? referralData.walletActivity : [];
    const visibleWalletActivity = walletActivity.slice(0, walletVisible);
    const referredRows = referrals.flatMap((referral) => referredRewardModels(referral));
    const visibleReferredRows = referredRows.slice(0, referredVisible);
    const referredTotal = Number(referralsPageData.total || referrals.length);
    const moreReferralsLoading = moreReferralQueries.some((query) => query.isLoading || query.isFetching);
    const moreReferredRows = referredVisible < referredRows.length || referrals.length < referredTotal;
    const walletExplained = Number.isFinite(Number(referralData.referralWithdrawnKobo))
        && Number(referralData.totalRewardsEarnedKobo || 0) - Number(referralData.referralWithdrawnKobo) === Number(referralData.referralWalletBalanceKobo || 0)
        && walletActivity.length > 0;
    const leaderboardEntries = leaderboardQuery.data?.data?.data;
    const leaderboardEntry = Array.isArray(leaderboardEntries)
        ? leaderboardEntries.find((entry) => entry.referrerUserId === customer.id)
        : null;
    const ordersTotalPages = Math.max(1, Math.ceil((ordersData.total || 0) / (ordersData.pageSize || 20)));
    const isSuspended = overview.isSuspended ?? customer.isSuspended ?? customer.status === 'SUSPENDED';
    const verified = overview.isPhoneVerified ?? customer.isPhoneVerified;
    const hasKnownStatus = overviewQuery.isSuccess || customer.isPhoneVerified != null || customer.isSuspended != null || Boolean(customer.status);
    const profilePending = !hasKnownStatus && !overviewQuery.isError;
    const statusLabel = profilePending ? 'Loading' : !hasKnownStatus ? 'Status unavailable' : isSuspended ? 'Suspended' : verified ? 'Verified' : 'Unverified';
    const contactText = (value, fallback) => profilePending ? 'Loading...' : value || fallback;
    const referralCode = overview.referralCode ?? customer.referralCode ?? referralData.referralCode ?? null;

    const confirm = (reason) => {
        if (confirmType === 'delete') deleteMutation.mutate();
        else suspensionMutation.mutate(confirmType === 'restore' ? { suspend: false } : { suspend: true, ...(reason.trim() ? { reason: reason.trim() } : {}) });
    };

    return (
        <>
            <div className="fixed inset-0 z-50 overflow-hidden">
                <button type="button" aria-label="Close customer details" className="absolute inset-0 h-full w-full bg-black/50" onClick={onClose} />
                <aside role="dialog" aria-modal="true" aria-label="Customer details" className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col overflow-hidden bg-white shadow-2xl">
                    <header className="flex shrink-0 items-center justify-between gap-4 border-b border-white/10 bg-[#0F172B] px-5 py-5 sm:px-6">
                        <div className="flex min-w-0 items-center gap-3">
                            <CustomerAvatar name={overview.name || `${customer.firstname || ''} ${customer.lastname || ''}`} photoUrl={overview.photoUrl ?? customer.photoUrl} className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-emerald-200/20 bg-emerald-400/10 text-sm font-bold text-emerald-300" />
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">Customer profile</p>
                                <h2 className="mt-1 truncate text-base font-bold text-white">{formatName(overview.name || `${customer.firstname || ''} ${customer.lastname || ''}`)}</h2>
                                <p className="mt-1 truncate text-xs text-slate-300">{customer.id}</p>
                            </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                            <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${profilePending || !hasKnownStatus ? 'border-white/15 bg-white/5 text-slate-300' : isSuspended ? 'border-rose-300/30 bg-rose-400/10 text-rose-200' : verified ? 'border-emerald-300/30 bg-emerald-400/10 text-emerald-200' : 'border-amber-300/30 bg-amber-400/10 text-amber-200'}`}>{statusLabel}</span>
                            <button type="button" aria-label="Close customer details" onClick={onClose} className="rounded-lg p-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"><X size={20} /></button>
                        </div>
                    </header>

                    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-zinc-50/70 custom-scrollbar">
                        <div className="sticky top-0 z-10 flex shrink-0 items-center justify-between gap-3 border-b border-zinc-200 bg-white px-5 py-3 sm:px-6">
                            <nav aria-label="Customer information" className="inline-flex max-w-full gap-1 overflow-x-auto rounded-xl bg-zinc-100 p-1">
                                {['Overview', 'Orders', 'Referral Activities'].map((tab) => <button type="button" key={tab} onClick={() => setActiveTab(tab)} className={`shrink-0 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${activeTab === tab ? 'bg-white text-emerald-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-800'}`}>{tab}</button>)}
                            </nav>
                            {activeTab === 'Orders' && <div className="w-36 shrink-0"><WalletFilterDropdown label="Order date filter" selected={orderFilter} options={orderFilters} onSelect={(value) => { setOrdersPage(1); if (value === 'custom') { setOrderFilter('custom'); setDraftDates(dates); setIsCustomDateOpen(true); } else { setOrderFilter(value); setLastOrderFilter(value); } }} /></div>}
                        </div>

                        {activeTab === 'Overview' && <div className="space-y-5 p-4 sm:p-5">
                            {overviewQuery.isLoading ? <div className="flex justify-center py-10"><Loader2 className="animate-spin text-emerald-600" /></div> : overviewQuery.error ? <ErrorMessage error={overviewQuery.error} retry={() => overviewQuery.refetch()} /> : <>
                                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                                    <p className="col-span-full text-[10px] text-zinc-500">All-time counts. All orders and All cancelled include unpaid or failed checkouts; paid counts match the Super Admin Orders scope. Paid cancelled is a count, not a refund. Total spent excludes currently cancelled paid orders, and Customer Wallet refunds are the amount actually credited.</p>
                                    {[
                                        ['All orders', overview.totalOrders], ['Delivered', overview.deliveredOrders], ['All cancelled', overview.cancelledOrders],
                                        ['Paid orders', overview.paidOrders], ['Paid cancelled', overview.paidCancelledOrders],
                                        ['Total Spent · excludes currently cancelled paid orders', overviewMoney(overview.totalSpent, overview.totalSpentKobo)], ['Customer Wallet refunds', overviewMoney(overview.customerOrderRefunds, overview.customerOrderRefundsKobo)], ['Spending Wallet Balance', overviewMoney(undefined, overview.walletBalanceKobo)], ['Total Referrals', overview.totalReferrals],
                                    ].map(([label, value]) => <button type="button" key={label} onClick={label === 'Total Referrals' ? () => setActiveTab('Referral Activities') : undefined} className={`min-h-20 rounded-xl border border-zinc-200 bg-white p-3.5 text-left ${label === 'Total Referrals' ? 'transition-colors hover:border-emerald-200' : 'cursor-default'}`}><span className="block text-[10px] font-semibold uppercase tracking-wide text-zinc-500">{label}</span><span className="mt-2 block text-base font-bold text-zinc-900">{['All orders', 'Delivered', 'All cancelled', 'Paid orders', 'Paid cancelled', 'Total Referrals'].includes(label) ? displayCount(value) : value}</span>{label === 'Total Referrals' && <span className="mt-1 block text-[9px] font-semibold text-emerald-800 underline">View referral activity</span>}</button>)}
                                </div>
                                <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
                                    <div className="border-b border-zinc-100 px-4 py-3.5"><h3 className="text-sm font-bold text-zinc-900">Details</h3><p className="mt-0.5 text-[11px] text-zinc-500">Contact, referral, and account activity</p></div>
                                    {referralsQuery.isLoading && !referralCode && <p className="mt-2 text-[10px] text-zinc-400">Loading referral code...</p>}
                                    {referralsQuery.error && !referralCode && <p className="mt-2 text-[10px] text-amber-700">Referral code could not be loaded.</p>}
                                    <div className="grid grid-cols-1 gap-2 p-3 sm:grid-cols-2">
                                        <Detail label="Phone" value={contactText(overview.phone || customer.phonenumber, 'Not available')} />
                                        <Detail label="Email" value={contactText(overview.email || customer.email, 'Not available')} />
                                        <Detail label="Referral code" value={referralCode || 'Not available'} />
                                        <p className="text-[10px] text-zinc-400 sm:col-span-2">This code belongs to this customer. People who join with it are attributed to them.</p>
                                        <Detail label="Joined" value={dateOrFallback(overview.joinedAt || customer.createdAt)} />
                                        <Detail label="Last seen" value={dateOrFallback(overview.lastSeenAt)} />
                                        <Detail label="Last login" value={dateOrFallback(overview.lastLogin)} />
                                        <Detail label="Last order" value={dateOrFallback(overview.lastOrderAt, 'No order yet')} />
                                        <div className="min-w-0 rounded-lg bg-zinc-50 px-3 py-2.5 sm:col-span-2"><p className="text-[9px] font-semibold uppercase tracking-wide text-zinc-500">Address</p>{profilePending ? <p className="mt-1 text-xs font-semibold text-zinc-900">Loading...</p> : addressDetails ? <div className="mt-1 space-y-1 text-xs font-semibold text-zinc-900"><p>{addressDetails.label || 'Saved address'}{addressDetails.isDefault ? ' · Default' : ''}</p><p>{[addressDetails.street, addressDetails.city, addressDetails.state].filter(Boolean).join(', ') || 'Address details not provided'}</p>{addressDetails.formattedAddress && <p>{addressDetails.formattedAddress}</p>}</div> : <p className="mt-1 break-words text-xs font-semibold text-zinc-900">{overview.address || 'Not provided'}</p>}</div>
                                    </div>
                                </section>
                                {isSuspended && <div className="flex gap-3 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-xs text-rose-800"><AlertCircle size={16} className="shrink-0" /><div><p className="font-bold">Customer account suspended</p><p className="mt-1">{overview.suspensionReason || 'No suspension reason provided.'}</p></div></div>}
                            </>}
                        </div>}

                        {activeTab === 'Orders' && <div className="space-y-3 p-4 sm:p-5">
                            {orderFilter === 'custom' && (!dates.start || !dates.end) ? <p className="py-8 text-center text-xs text-zinc-500">Choose both dates to load orders.</p> : ordersQuery.isLoading ? <div className="flex justify-center py-10"><Loader2 className="animate-spin text-emerald-600" /></div> : ordersQuery.error ? <ErrorMessage error={ordersQuery.error} retry={() => ordersQuery.refetch()} /> : orders.length === 0 ? <p className="py-10 text-center text-xs font-medium text-zinc-500">No orders found.</p> : orders.map((order) => <article key={order.id} className="rounded-xl border border-zinc-100 bg-zinc-50 p-3.5"><div className="flex items-start justify-between gap-3"><div><h3 className="text-sm font-bold text-zinc-900">{order.code || 'Order'}</h3><p className="mt-1 text-[10px] text-zinc-500">{formatName(order.vendorStore)} · {formatDate(order.date)}{order.time ? ` · ${order.time}` : ''}</p></div><span className={`rounded-full px-2 py-1 text-[9px] font-bold ${order.status === 'CANCELLED' ? 'bg-rose-50 text-rose-700' : order.paymentStatus === 'PAID' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{order.status} · {order.paymentStatus}</span></div><p className="mt-3 text-xs font-semibold text-zinc-500">Order amount <span className="float-right text-zinc-900">{naira(order.amount)}</span></p>{order.status === 'CANCELLED' && <p className="mt-1 text-[10px] text-zinc-500">Original order amount. This is not the Customer Wallet refund.</p>}</article>)}
                            {ordersTotalPages > 1 && <PageControl page={ordersPage} pages={ordersTotalPages} onPage={setOrdersPage} />}
                        </div>}

                        {activeTab === 'Referral Activities' && <div className="space-y-4 p-4 sm:p-5">
                            {referralsQuery.isLoading ? <div className="flex justify-center py-10"><Loader2 className="animate-spin text-emerald-600" /></div> : referralsQuery.error ? <ErrorMessage error={referralsQuery.error} retry={() => referralsQuery.refetch()} /> : <>
                                <section className="rounded-xl border border-zinc-200 bg-white p-3.5"><p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Referral wallet balance</p><p className="mt-1 text-xl font-bold text-zinc-900">{naira(Number(referralData.referralWalletBalanceKobo || 0) / 100)}</p><p className="mt-1 text-[10px] text-zinc-500">Available referral earnings; separate from the spending wallet.</p>{walletExplained && <p className="mt-2 text-[10px] font-semibold text-zinc-700">{naira(Number(referralData.totalRewardsEarnedKobo || 0) / 100)} credited − {naira(Number(referralData.referralWithdrawnKobo || 0) / 100)} withdrawn = {naira(Number(referralData.referralWalletBalanceKobo || 0) / 100)}</p>}</section>
                                {walletActivity.length > 0 && <section><h3 className="text-sm font-bold text-zinc-900">Wallet activity</h3><p className="mt-1 text-[10px] text-zinc-400">Each reward added to this Referral Wallet, and each withdrawal taken from it.</p><div className="mt-3 rounded-xl border border-zinc-100 bg-white px-3">{visibleWalletActivity.map((movement) => <WalletMovement key={`${movement.kind}-${movement.id}`} movement={movement} />)}</div><ListToggle label="wallet activity" shown={visibleWalletActivity.length} total={walletActivity.length} onMore={() => setWalletVisible((count) => count + LIST_STEP)} onLess={() => setWalletVisible(LIST_PREVIEW)} /></section>}
                                <div className="grid grid-cols-2 gap-2.5"><Metric label="Total referrals" value={referralData.totalReferrals ?? 0} /><Metric label="Successful referrals" value={leaderboardQuery.isLoading ? 'Loading...' : leaderboardQuery.isError ? 'Unavailable' : leaderboardEntry?.successfulReferrals ?? 0} /><Metric label="Leaderboard rank" value={leaderboardQuery.isLoading ? 'Loading...' : leaderboardQuery.isError ? 'Unavailable' : leaderboardEntry?.rank ?? '—'} /><Metric label="Rewards earned" value={naira(referralData.totalRewardsEarnedNaira ?? Number(referralData.totalRewardsEarnedKobo || 0) / 100)} /></div>
                                <section><h3 className="text-sm font-bold text-zinc-900">Referred users</h3>
                                    {referrals.length === 0 ? <p className="py-8 text-center text-xs text-zinc-500">No referred users found.</p> : <div className="mt-3 overflow-x-auto rounded-xl border border-zinc-100"><table className="w-full min-w-[540px] text-left"><thead className="bg-zinc-50"><tr>{['Referred user', 'Account status', 'Reward status', 'Reward', 'Date'].map((heading) => <th key={heading} className="px-2.5 py-2.5 text-[9px] font-bold uppercase tracking-wide text-zinc-400">{heading}</th>)}</tr></thead><tbody className="divide-y divide-zinc-100">{visibleReferredRows.map((row) => <ReferralRow key={row.key} referral={row.referral} reward={row.reward} />)}</tbody></table></div>}
                                    <ListToggle label="referred users" shown={visibleReferredRows.length} total={referrals.length < referredTotal ? null : referredRows.length} onMore={() => { if (referredVisible >= referredRows.length && referrals.length < referredTotal) setReferralPages((pages) => pages + 1); setReferredVisible((count) => count + LIST_STEP); }} onLess={() => setReferredVisible(LIST_PREVIEW)} busy={moreReferralsLoading} canMore={moreReferredRows} />
                                </section>
                            </>}
                        </div>}
                    </div>

                    {!readOnly && <footer className="flex shrink-0 gap-3 border-t border-zinc-200 bg-white px-4 py-4 sm:px-5"><button type="button" onClick={() => setConfirmType('delete')} disabled={deleteMutation.isPending} className="flex-1 rounded-xl border border-rose-200 bg-white py-3 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-50 disabled:opacity-50">{deleteMutation.isPending ? 'Deleting...' : 'Delete account'}</button><button type="button" onClick={() => setConfirmType(isSuspended ? 'restore' : 'suspend')} disabled={suspensionMutation.isPending} className={`flex-1 rounded-xl py-3 text-xs font-semibold text-white transition-colors disabled:opacity-50 ${isSuspended ? 'bg-emerald-800 hover:bg-emerald-900' : 'bg-rose-600 hover:bg-rose-700'}`}>{suspensionMutation.isPending ? 'Please wait...' : isSuspended ? 'Restore account' : 'Suspend account'}</button></footer>}
                </aside>
            </div>
            {confirmType && <ConfirmAction type={confirmType} busy={suspensionMutation.isPending || deleteMutation.isPending} onClose={() => setConfirmType(null)} onConfirm={confirm} />}
            <WalletCustomDateModal isOpen={isCustomDateOpen} dates={draftDates} onDatesChange={setDraftDates} onClose={() => { setIsCustomDateOpen(false); if (!dates.start || !dates.end) setOrderFilter(lastOrderFilter); }} onApply={(selectedDates) => { setDates(selectedDates); setIsCustomDateOpen(false); }} />
        </>
    );
};

function Detail({ label, value }) { return <div className="min-w-0 rounded-lg bg-zinc-50 px-3 py-2.5"><p className="text-[9px] font-semibold uppercase tracking-wide text-zinc-500">{label}</p><p className="mt-1 break-words text-xs font-semibold text-zinc-900">{value}</p></div>; }
function Metric({ label, value }) { return <div className="rounded-xl border border-zinc-200 bg-white p-3.5"><p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">{label}</p><p className="mt-1 text-base font-bold text-zinc-900">{value}</p></div>; }
function ErrorMessage({ error, retry }) { return <div role="alert" className="py-8 text-center text-xs text-rose-600">{error.message || 'Unable to load customer data.'}<button type="button" onClick={retry} className="ml-2 font-bold underline">Retry</button></div>; }
function PageControl({ page, pages, onPage }) { return <div className="flex items-center justify-between text-xs"><span>Page {page} of {pages}</span><div className="flex gap-2"><button type="button" disabled={page <= 1} onClick={() => onPage((current) => current - 1)} className="rounded-lg border px-3 py-1 disabled:opacity-40">Previous</button><button type="button" disabled={page >= pages} onClick={() => onPage((current) => current + 1)} className="rounded-lg border px-3 py-1 disabled:opacity-40">Next</button></div></div>; }
function referredRewardModels(referral) {
    const rewards = Array.isArray(referral.rewards) ? referral.rewards : [];
    if (rewards.length === 0) return [{ key: referral.referralId, referral, reward: null }];
    return rewards.map((reward) => ({ key: reward.id, referral, reward }));
}

function ListToggle({ label, shown, total, onMore, onLess, busy = false, canMore }) {
    const more = canMore ?? (Number.isFinite(total) && shown < total);
    const less = shown > LIST_PREVIEW;
    if (!more && !less) return null;
    const countLabel = Number.isFinite(total) ? `Showing ${Math.min(shown, total)} of ${total}` : `Showing ${shown}`;
    return (
        <div className="mt-2 flex items-center justify-between gap-3">
            <p className="text-[10px] text-zinc-400">{countLabel}</p>
            <div className="flex gap-3">
                {less && <button type="button" aria-label={`View less ${label}`} onClick={onLess} className="text-[11px] font-semibold text-zinc-500 underline">View less</button>}
                {more && <button type="button" aria-label={`View more ${label}`} onClick={onMore} disabled={busy} className="text-[11px] font-semibold text-emerald-800 underline disabled:opacity-50">{busy ? 'Loading...' : 'View more'}</button>}
            </div>
        </div>
    );
}

function WalletMovement({ movement }) {
    const credit = movement.effect === 'CREDIT';
    const returned = movement.effect === 'RETURNED';
    const amount = naira(movement.amountNaira ?? Number(movement.amountKobo || 0) / 100);
    const who = movement.referredName ? formatName(movement.referredName) : '';
    const status = movement.kind === 'WITHDRAWAL' ? String(movement.status || '').toLowerCase() : '';
    return (
        <div className="flex items-start justify-between gap-3 border-b border-zinc-100 py-2.5 last:border-0">
            <div>
                <p className="text-xs font-semibold text-zinc-800">{movement.kind === 'REWARD' ? 'Reward' : returned ? 'Withdrawal returned' : 'Withdrawal'}{who ? ` · ${who}` : ''}</p>
                <p className="mt-1 text-[10px] text-zinc-500">{formatDate(movement.createdAt)}{movement.orderCode ? ` · ${movement.orderCode}` : ''}{status ? ` · ${status}` : ''}</p>
            </div>
            <p className={`text-xs font-bold ${credit ? 'text-emerald-700' : returned ? 'text-zinc-500' : 'text-rose-700'}`}>{credit ? '+' : returned ? '' : '−'}{amount}</p>
        </div>
    );
}

function ReferralRow({ referral, reward }) {
    const suspended = referral.isSuspended || referral.status === 'SUSPENDED';
    const accountStatus = suspended ? 'Suspended' : referral.isPhoneVerified === true ? 'Verified' : 'Unverified';
    const rewarded = referral.rewardState === 'REWARDED';
    return <tr><td className="px-2.5 py-2.5"><p className="text-xs font-semibold text-zinc-800">{formatName(`${referral.firstname || ''} ${referral.lastname || ''}`)}</p><p className="mt-1 text-[9px] text-zinc-400">{referral.phonenumber || 'Phone unavailable'}</p></td><td className="px-2.5 py-2.5"><span className={`rounded-full px-2 py-1 text-[9px] font-bold ${suspended ? 'bg-rose-50 text-rose-700' : referral.isPhoneVerified ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{accountStatus}</span></td><td className="px-2.5 py-2.5"><span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[9px] font-bold ${rewarded ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-600'}`}>{rewarded && <CheckCircle2 size={10} />}{rewarded ? 'Rewarded' : 'No reward yet'}</span></td><td className="whitespace-nowrap px-2.5 py-2.5 text-xs font-bold text-zinc-800">{naira(reward ? (reward.amountNaira ?? Number(reward.amountKobo || 0) / 100) : (referral.rewardAmountNaira ?? Number(referral.rewardAmountKobo || 0) / 100))}</td><td className="whitespace-nowrap px-2.5 py-2.5 text-[10px] text-zinc-500">{formatDate(reward ? reward.createdAt : referral.referredAt)}{reward?.orderCode ? ` · ${reward.orderCode}` : ''}</td></tr>;
}

export default CustomerModal;
