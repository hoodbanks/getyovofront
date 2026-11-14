import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Activity, ArrowRight, Award, Building2, CheckCircle2, ChevronLeft, Clock3, Eye, Gift, Loader2, Search, Trophy, Wallet, X } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '../../api/api';
import { useAuthStore } from '../../store/useAuthStore';
import { exportToCSV, formatShortDateTime } from '../../utils/formatters';
import { WalletCustomDateModal, WalletFilterDropdown } from '../../components/admin/wallet/WalletControls';
import CustomerModal from '../../components/admin/CustomerModal';

const PAGE_SIZE = 20;
const EXPORT_PAGE_SIZE = 50;

const rewardFilterOptions = [
    { value: 'all', label: 'All reward states' },
    { value: 'rewarded', label: 'Rewarded' },
    { value: 'no_reward_yet', label: 'No reward yet' },
];

const dateOptions = [
    { value: 'all_time', label: 'All time' },
    { value: 'last_7_days', label: 'Last 7 days' },
    { value: 'last_30_days', label: 'Last 30 days' },
    { value: 'this_month', label: 'This month' },
    { value: 'custom', label: 'Custom range' },
];

const cardConfig = [
    { key: 'totalReferralsGenerated', label: 'Total referrals generated', icon: Gift, tint: 'emerald', note: 'Referral relationships created' },
    { key: 'activeReferrers', label: 'Active referrers', icon: Activity, tint: 'blue', note: 'Customers who referred at least one person', leaderboard: true },
    { key: 'totalRewardsEarnedNaira', label: 'Total rewards earned', icon: Award, tint: 'purple', note: 'Lifetime referral rewards credited', currency: true },
    { key: 'pendingReferralWithdrawals', label: 'Pending withdrawals', icon: Clock3, tint: 'amber', note: 'Requests awaiting review', withdrawalList: true },
    { key: 'completedReferralWithdrawals', label: 'Completed withdrawals', icon: Wallet, tint: 'blue', note: 'Requests an admin marked complete. Not bank verification.' },
    { key: 'totalReferralWithdrawalsPaidNaira', label: 'Referral withdrawals recorded', icon: Award, tint: 'emerald', note: 'Referral Wallet amount recorded as paid. Separate from order payments and Customer Wallet activity.', currency: true },
];

const tintClasses = {
    emerald: 'border-emerald-300 bg-emerald-50/50',
    blue: 'border-blue-300 bg-blue-50/50',
    purple: 'border-purple-300 bg-purple-50/50',
    amber: 'border-amber-300 bg-amber-50/50',
};

const money = (amount) => {
    const value = typeof amount === 'number' ? amount : typeof amount === 'string' && amount.trim() !== '' ? Number(amount) : NaN;
    return Number.isFinite(value) ? `₦${value.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—';
};
const displayAccountStatus = (row) => row.accountStatus || (row.isSuspended ? 'SUSPENDED' : row.isPhoneVerified ? 'VERIFIED' : 'UNVERIFIED');
const displayRewardState = (state) => state === 'REWARDED' ? 'Rewarded' : 'No reward yet';

const buildActivityParams = ({ page, limit, filter, dateFilter, dates, query }) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit), filter, dateFilter });
    if (dateFilter === 'custom' && dates?.start && dates?.end) {
        params.set('from', dates.start);
        params.set('to', dates.end);
    }
    if (query?.trim()) params.set('query', query.trim());
    return params;
};

const getIdempotencyKey = () => {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
    return `ref-${Date.now()}-${Math.random().toString(16).slice(2, 14)}`;
};

const ReferralWithdrawalsPanel = ({ isOpen, onClose, pendingCount }) => {
    const token = useAuthStore((state) => state.accessToken);
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [selectedWithdrawalId, setSelectedWithdrawalId] = useState(null);
    const [reviewAction, setReviewAction] = useState(null);
    const [reviewValue, setReviewValue] = useState('');
    const [idempotencyKey, setIdempotencyKey] = useState('');
    const [transferMade, setTransferMade] = useState(false);

    const listQuery = useQuery({
        queryKey: ['referral-withdrawals', 'PENDING', page],
        queryFn: () => api.get(`/superadmin/referral-withdrawals?page=${page}&limit=${PAGE_SIZE}&status=PENDING`, token),
        enabled: Boolean(isOpen && !selectedWithdrawalId),
    });

    const detailQuery = useQuery({
        queryKey: ['referral-withdrawal-detail', selectedWithdrawalId],
        queryFn: () => api.get(`/superadmin/referral-withdrawals/${encodeURIComponent(selectedWithdrawalId)}`, token),
        enabled: Boolean(isOpen && selectedWithdrawalId),
        staleTime: 0,
    });

    useEffect(() => {
        if (!selectedWithdrawalId) return undefined;
        const withdrawalId = selectedWithdrawalId;
        return () => queryClient.removeQueries({ queryKey: ['referral-withdrawal-detail', withdrawalId], exact: true });
    }, [selectedWithdrawalId, queryClient]);

    const selectedWithdrawal = detailQuery.data?.data;
    const withdrawalRows = listQuery.data?.data?.data || [];
    const totalRows = listQuery.data?.data?.total || 0;
    const totalPages = Math.max(1, Math.ceil(totalRows / PAGE_SIZE));

    const clearDetail = () => {
        if (selectedWithdrawalId) queryClient.removeQueries({ queryKey: ['referral-withdrawal-detail', selectedWithdrawalId], exact: true });
        setSelectedWithdrawalId(null);
        setReviewAction(null);
        setReviewValue('');
        setIdempotencyKey('');
        setTransferMade(false);
    };

    const closePanel = () => {
        clearDetail();
        onClose();
    };

    const reviewMutation = useMutation({
        mutationFn: ({ withdrawalId, body }) => api.post(`/superadmin/referral-withdrawals/${encodeURIComponent(withdrawalId)}/status`, body, token),
        onSuccess: async (response, variables) => {
            const updated = response.data;
            queryClient.setQueryData(['referral-withdrawal-detail', variables.withdrawalId], (previous) => ({
                ...previous,
                data: { ...previous?.data, ...updated, accountNumber: previous?.data?.accountNumber },
            }));
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['referral-withdrawals'] }),
                queryClient.invalidateQueries({ queryKey: ['referral-activities'] }),
                queryClient.invalidateQueries({ queryKey: ['userReferrals', updated.userId] }),
            ]);
            setReviewAction(null);
            setReviewValue('');
            setIdempotencyKey('');
            setTransferMade(false);
            toast.success(response.message || 'Referral withdrawal updated');
        },
        onError: (error) => toast.error(error.message || 'Could not review referral withdrawal'),
    });

    const submitReview = () => {
        if (!selectedWithdrawal || !reviewAction) return;
        const value = reviewValue.trim();
        if (reviewAction === 'COMPLETED' && !transferMade) {
            toast('Confirm that the bank transfer has already been made.');
            return;
        }
        if (reviewAction !== 'COMPLETED' && value.length < 2) {
            toast('Enter a reason with at least 2 non-space characters.');
            return;
        }
        if (reviewAction === 'COMPLETED' && value && !/^[A-Za-z0-9-]{6,40}$/.test(value)) {
            toast('Reference must be 6–40 letters, numbers, or hyphens.');
            return;
        }

        const body = { status: reviewAction, idempotencyKey };
        if (reviewAction === 'COMPLETED') {
            if (value) body.bankTransferReference = value;
        } else {
            body.reason = value;
        }
        reviewMutation.mutate({ withdrawalId: selectedWithdrawal.id, body });
    };

    const startReview = (action) => {
        setReviewAction(action);
        setReviewValue('');
        setIdempotencyKey(getIdempotencyKey());
        setTransferMade(false);
    };

    if (!isOpen) return null;
    const listError = listQuery.error;
    const detailError = detailQuery.error;
    const detailPending = selectedWithdrawal?.status === 'PENDING';

    return createPortal(<div className="fixed inset-0 z-[120] h-[100dvh] w-screen overflow-hidden">
        <button type="button" aria-label="Close pending referral withdrawals" onClick={closePanel} className="absolute inset-0 bg-black/50" />
        <aside role="dialog" aria-modal="true" aria-labelledby="referral-withdrawal-title" className="absolute inset-y-0 right-0 flex h-full w-full max-w-lg flex-col bg-white shadow-2xl">
            <header className="flex shrink-0 items-center gap-3 border-b border-white/10 bg-[#0F172B] px-5 py-4 text-white sm:px-6">
                {selectedWithdrawalId && <button type="button" onClick={clearDetail} aria-label="Back to pending referral withdrawals" className="rounded-lg p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"><ChevronLeft size={19} /></button>}
                <div className="min-w-0 flex-1"><h2 id="referral-withdrawal-title" className="text-base font-bold text-white">{selectedWithdrawalId ? 'Withdrawal Request Details' : 'Pending Referral Withdrawals'}</h2><p className="mt-0.5 text-xs text-slate-300">{selectedWithdrawalId ? selectedWithdrawal?.reference || selectedWithdrawalId : `${pendingCount} requests awaiting review`}</p></div>
                {selectedWithdrawalId && selectedWithdrawal && <span className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${selectedWithdrawal.status === 'PENDING' ? 'bg-amber-300/15 text-amber-200' : 'bg-white/10 text-slate-200'}`}>{selectedWithdrawal.status}</span>}
                <button type="button" onClick={closePanel} aria-label="Close pending referral withdrawals" className="rounded-lg p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"><X size={19} /></button>
            </header>

            {selectedWithdrawalId ? detailQuery.isLoading ? <div className="flex flex-1 items-center justify-center"><Loader2 className="animate-spin text-emerald-700" /></div> : detailError ? <ErrorPanel error={detailError} retry={() => detailQuery.refetch()} /> : selectedWithdrawal ? <div className="flex min-h-0 flex-1 flex-col">
                <div className="flex-1 space-y-4 overflow-y-auto p-5 sm:p-6">
                    <section className="rounded-2xl border border-zinc-100 bg-zinc-50 p-5"><p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Withdrawal amount</p><p className="mt-2 text-2xl font-bold text-zinc-900">{money(selectedWithdrawal.amountNaira)}</p><p className="mt-1 text-[10px] text-zinc-500">From referral wallet · {selectedWithdrawal.currency || 'NGN'}</p></section>
                    <section className="rounded-2xl border border-zinc-100 p-5 shadow-sm"><h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-zinc-700">User and request</h3><dl className="grid grid-cols-2 gap-4"><Detail label="User" value={selectedWithdrawal.customerName} /><Detail label="Request ID" value={selectedWithdrawal.reference} /><Detail label="Request status" value={selectedWithdrawal.status} /><Detail label="Request time" value={formatShortDateTime(selectedWithdrawal.createdAt)} />{selectedWithdrawal.bankTransferReference && <Detail label="Transfer reference" value={selectedWithdrawal.bankTransferReference} />}</dl></section>
                    <section className="rounded-2xl border border-zinc-100 p-5 shadow-sm"><div className="mb-4 flex items-center gap-2 text-zinc-700"><Building2 size={15} /><h3 className="text-xs font-bold uppercase tracking-wider">Full bank details</h3></div><dl className="grid grid-cols-2 gap-4"><Detail label="Bank" value={selectedWithdrawal.bankName} /><Detail label="Account name" value={selectedWithdrawal.accountName} /><div className="col-span-2"><Detail label="Account number" value={selectedWithdrawal.accountNumber} mono /></div></dl></section>
                    {Array.isArray(selectedWithdrawal.events) && selectedWithdrawal.events.length > 0 && <section className="rounded-2xl border border-zinc-100 p-5"><h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-700">Review history</h3><div className="space-y-3">{selectedWithdrawal.events.map((event) => <div key={event.id} className="border-l-2 border-zinc-200 pl-3"><p className="text-xs font-semibold text-zinc-800">{event.priorStatus} → {event.newStatus}</p><p className="mt-1 text-[10px] text-zinc-500">{formatShortDateTime(event.createdAt)}{event.reason ? ` · ${event.reason}` : ''}{event.bankTransferReference ? ` · ${event.bankTransferReference}` : ''}</p></div>)}</div></section>}
                    <p className="text-[10px] leading-5 text-zinc-400">The payout is manual. Completing a request records that the transfer has already been made; it does not initiate a bank transfer.</p>
                </div>
                {detailPending && <footer className="shrink-0 border-t border-zinc-100 bg-white p-4 sm:px-6">
                    {reviewAction ? <ReviewForm action={reviewAction} value={reviewValue} setValue={(value) => { setReviewValue(value); setIdempotencyKey(getIdempotencyKey()); }} transferMade={transferMade} setTransferMade={setTransferMade} onCancel={() => { setReviewAction(null); setReviewValue(''); setIdempotencyKey(''); setTransferMade(false); }} onSubmit={submitReview} busy={reviewMutation.isPending} /> : <div className="grid grid-cols-3 gap-2"><button type="button" onClick={() => startReview('DECLINED')} className="rounded-xl border border-rose-200 bg-white px-3 py-3 text-xs font-bold text-rose-700 transition hover:bg-rose-50">Decline</button><button type="button" onClick={() => startReview('FAILED')} className="rounded-xl border border-amber-200 bg-white px-3 py-3 text-xs font-bold text-amber-700 transition hover:bg-amber-50">Mark failed</button><button type="button" onClick={() => startReview('COMPLETED')} className="rounded-xl bg-emerald-700 px-3 py-3 text-xs font-bold text-white transition hover:bg-emerald-800">Approve payout</button></div>}
                </footer>}
            </div> : <div role="alert" className="p-6 text-sm text-zinc-500">Withdrawal details are unavailable.</div> : <div className="flex-1 overflow-y-auto p-5 sm:p-6">
                <p className="mb-4 text-xs leading-5 text-zinc-500">Select a request to review its full bank details. Account numbers are masked in this list.</p>
                {listQuery.isLoading ? <div className="flex justify-center py-10"><Loader2 className="animate-spin text-emerald-700" /></div> : listError ? <ErrorPanel error={listError} retry={() => listQuery.refetch()} /> : withdrawalRows.length === 0 ? <p className="py-12 text-center text-sm text-zinc-500">No pending referral withdrawals.</p> : <div className="space-y-3">{withdrawalRows.map((request) => <button key={request.id} type="button" onClick={() => setSelectedWithdrawalId(request.id)} className="flex w-full items-center justify-between gap-4 rounded-xl border border-zinc-100 bg-white p-4 text-left transition hover:border-emerald-200 hover:bg-emerald-50/30">
                    <span className="flex min-w-0 items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700"><Wallet size={17} /></span><span className="min-w-0"><span className="block truncate text-sm font-bold text-zinc-900">{request.customerName}</span><span className="mt-1 block text-[10px] text-zinc-500">{request.reference} · {formatShortDateTime(request.createdAt)}</span><span className="mt-1 block text-[10px] text-zinc-500">{request.bankName} · ending {String(request.accountNumber || '').slice(-4)}</span></span></span>
                    <span className="shrink-0 text-right"><span className="block text-sm font-bold text-zinc-900">{money(request.amountNaira)}</span><span className="mt-1 inline-block rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-bold text-amber-700">{request.status}</span></span>
                </button>)}</div>}
                {totalPages > 1 && <PageControl page={page} pages={totalPages} onPage={setPage} />}
            </div>}
        </aside>
    </div>, document.body);
};

function ReviewForm({ action, value, setValue, transferMade, setTransferMade, onCancel, onSubmit, busy }) {
    const completed = action === 'COMPLETED';
    const label = completed ? 'Bank transfer reference (optional)' : 'Reason';
    return <div className="w-full space-y-3">
        <div><label htmlFor="referral-review-value" className="block text-xs font-bold text-zinc-700">{label}</label><input id="referral-review-value" value={value} onChange={(event) => setValue(event.target.value)} maxLength={completed ? 40 : 500} placeholder={completed ? 'Leave blank to let the API generate a reference' : 'Describe why the request is being rejected'} className="mt-2 w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm text-zinc-800 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10" /></div>
        {completed && <label className="flex items-start gap-2 text-[11px] leading-5 text-zinc-600"><input type="checkbox" checked={transferMade} onChange={(event) => setTransferMade(event.target.checked)} className="mt-1 accent-emerald-700" />I confirm the bank transfer has already been made manually.</label>}
        {!completed && <p className="text-[10px] text-zinc-500">The reason must contain at least two non-space characters.</p>}
        <div className="flex gap-3"><button type="button" onClick={onCancel} className="flex-1 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-xs font-bold text-zinc-600 hover:bg-zinc-50">Back</button><button type="button" disabled={busy || (completed && !transferMade) || (!completed && value.trim().length < 2)} onClick={onSubmit} className={`flex-1 rounded-xl px-4 py-3 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50 ${completed ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-rose-600 hover:bg-rose-700'}`}>{busy ? 'Saving…' : completed ? 'Confirm payout' : action === 'DECLINED' ? 'Confirm decline' : 'Confirm failure'}</button></div>
    </div>;
}

function Detail({ label, value, mono = false }) {
    return <div><dt className="text-[10px] font-bold uppercase text-zinc-400">{label}</dt><dd className={`mt-1 break-words text-sm font-semibold text-zinc-800 ${mono ? 'font-mono tracking-wider' : ''}`}>{value || 'Not available'}</dd></div>;
}

function ErrorPanel({ error, retry }) {
    return <div role="alert" className="py-10 text-center text-sm text-rose-600">{error.message || 'Could not load referral data.'}<button type="button" onClick={retry} className="ml-2 font-bold underline">Retry</button></div>;
}

function PageControl({ page, pages, onPage }) {
    return <div className="mt-4 flex items-center justify-between text-xs"><span>Page {page} of {pages}</span><div className="flex gap-2"><button type="button" disabled={page <= 1} onClick={() => onPage((current) => current - 1)} className="rounded-lg border px-3 py-1.5 disabled:opacity-40">Previous</button><button type="button" disabled={page >= pages} onClick={() => onPage((current) => current + 1)} className="rounded-lg border px-3 py-1.5 disabled:opacity-40">Next</button></div></div>;
}

const ReferralActivities = () => {
    const token = useAuthStore((state) => state.accessToken);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all_time');
    const [customDates, setCustomDates] = useState({ start: '', end: '' });
    const [draftDates, setDraftDates] = useState({ start: '', end: '' });
    const [isCustomDateOpen, setIsCustomDateOpen] = useState(false);
    const [previousDateFilter, setPreviousDateFilter] = useState('all_time');
    const [page, setPage] = useState(1);
    const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
    const [isReferralWithdrawalListOpen, setIsReferralWithdrawalListOpen] = useState(false);
    const [selectedReferrer, setSelectedReferrer] = useState(null);
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setDebouncedSearch(search.trim());
            setPage(1);
        }, 350);
        return () => window.clearTimeout(timer);
    }, [search]);

    const activityQuery = useQuery({
        queryKey: ['referral-activities', page, filter, dateFilter, customDates.start, customDates.end, debouncedSearch],
        queryFn: () => {
            const params = buildActivityParams({ page, limit: PAGE_SIZE, filter, dateFilter, dates: customDates, query: debouncedSearch });
            return api.get(`/superadmin/referral-activities?${params.toString()}`, token);
        },
        enabled: dateFilter !== 'custom' || Boolean(customDates.start && customDates.end),
        placeholderData: (previousData) => previousData,
    });

    const leaderboardQuery = useQuery({
        queryKey: ['referral-leaderboard'],
        queryFn: () => api.get('/superadmin/referral-activities/leaderboard', token),
        enabled: isLeaderboardOpen,
    });

    const responseData = activityQuery.data?.data || {};
    const summary = responseData.summary || {};
    const rows = responseData.data || [];
    const total = responseData.total || 0;
    const pageSize = responseData.limit || PAGE_SIZE;
    const pages = Math.max(1, Math.ceil(total / pageSize));

    const applyRewardFilter = (value) => { setFilter(value); setPage(1); };
    const applyDateFilter = (value) => {
        setPage(1);
        if (value === 'custom') {
            setPreviousDateFilter(dateFilter === 'custom' ? previousDateFilter : dateFilter);
            setDraftDates(customDates);
            setDateFilter('custom');
            setIsCustomDateOpen(true);
        } else {
            setDateFilter(value);
        }
    };

    const exportActivities = async () => {
        setIsExporting(true);
        try {
            const allRows = [];
            let exportTotal = 0;
            let exportPages = 1;
            for (let exportPage = 1; exportPage <= exportPages; exportPage += 1) {
                const params = buildActivityParams({ page: exportPage, limit: EXPORT_PAGE_SIZE, filter, dateFilter, dates: customDates, query: search });
                const response = await api.get(`/superadmin/referral-activities?${params.toString()}`, token);
                const result = response.data || {};
                exportTotal = result.total || 0;
                exportPages = Math.max(1, Math.ceil(exportTotal / (result.limit || EXPORT_PAGE_SIZE)));
                allRows.push(...(result.data || []));
            }
            if (!allRows.length) {
                toast('There are no referral activities to export.');
                return;
            }
            exportToCSV(allRows.map((row) => ({
                'Referral ID': row.referralId,
                'Referrer Name': row.referrerName,
                'Referred User': row.referredUserName,
                'Referral Code': row.referralCode,
                'Account Status': displayAccountStatus(row),
                'Reward State': displayRewardState(row.rewardState),
                'Reward Count': row.rewardCount,
                'Reward Earned (NGN)': row.rewardAmountNaira,
                'Created At': formatShortDateTime(row.createdAt),
                'Rewarded At': row.rewardedAt ? formatShortDateTime(row.rewardedAt) : '',
            })), 'referral-activities');
            toast.success(`Exported ${allRows.length} of ${exportTotal} matching referral activities.`);
        } catch (error) {
            toast.error(error.message || 'Could not export referral activities');
        } finally {
            setIsExporting(false);
        }
    };

    const openReferrer = (row) => {
        const [firstname = '', ...lastParts] = (row.referrerName || '').split(' ');
        setSelectedReferrer({ id: row.referrerUserId, firstname, lastname: lastParts.join(' '), referralCode: row.referralCode });
    };

    const cards = cardConfig.map((card) => {
        const metric = summary[card.key];
        return {
            ...card,
            value: metric == null ? '—' : card.currency ? money(metric) : Number(metric).toLocaleString('en-NG'),
        };
    });

    const resetDateAfterCancel = () => {
        setIsCustomDateOpen(false);
        if (!customDates.start || !customDates.end) setDateFilter(previousDateFilter);
    };

    const isTableEmpty = !activityQuery.isLoading && !activityQuery.error && rows.length === 0;
    const hasActiveFilters = Boolean(search.trim()) || filter !== 'all' || dateFilter !== 'all_time' || page > 1;
    const clearActivityFilters = () => {
        setSearch('');
        setDebouncedSearch('');
        setFilter('all');
        setDateFilter('all_time');
        setCustomDates({ start: '', end: '' });
        setPage(1);
    };

    return (
        <div className="mx-auto w-full max-w-[1600px] space-y-5 pb-10">
            <section className="rounded-2xl bg-white p-3 shadow-sm sm:p-4">
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
                    {cards.map(({ key, label, value, icon: Icon, tint, note, leaderboard: isLeaderboard, withdrawalList }) => {
                        const card = <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{label}</p>{activityQuery.isLoading && !activityQuery.data ? <div aria-label={`Loading ${label.toLowerCase()}`} className="mt-2 h-6 w-24 animate-pulse rounded bg-zinc-200" /> : <p className="mt-2 text-lg font-bold text-zinc-900">{value}</p>}<p className="mt-2 text-[10px] text-zinc-500">{note}</p>{(isLeaderboard || withdrawalList) && <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 underline underline-offset-2">{isLeaderboard ? 'View leaderboard' : 'View requests'}<ArrowRight size={13} /></span>}</div><div className="rounded-lg bg-white/80 p-2 text-emerald-800 shadow-sm"><Icon size={18} /></div></div>;
                        const style = `relative overflow-hidden rounded-xl border p-3 text-left transition hover:shadow-sm sm:p-3.5 ${tintClasses[tint]} ${withdrawalList ? 'w-full cursor-pointer hover:border-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500' : isLeaderboard ? 'cursor-pointer hover:border-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500' : ''}`;
                        if (withdrawalList) return <button key={key} type="button" onClick={() => setIsReferralWithdrawalListOpen(true)} aria-label={`View ${value} pending referral withdrawals`} className={style}>{card}</button>;
                        if (isLeaderboard) return <button key={key} type="button" onClick={() => setIsLeaderboardOpen(true)} aria-label="View referral leaderboard" className={`w-full ${style}`}>{card}</button>;
                        return <article key={key} className={style}>{card}</article>;
                    })}
                </div>
                {activityQuery.error && !activityQuery.data && <div className="mt-3"><ErrorPanel error={activityQuery.error} retry={() => activityQuery.refetch()} /></div>}
            </section>

            <section className="rounded-2xl bg-white p-3 shadow-sm sm:p-3.5">
                <div className="grid grid-cols-1 items-end gap-3 xl:grid-cols-[minmax(260px,1fr)_minmax(180px,220px)_minmax(160px,190px)_auto]">
                    <label className="relative block w-full min-w-0"><span className="sr-only">Search referral activity</span><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} maxLength={100} placeholder="Search referrer, user, or referral code" className="w-full rounded-3xl bg-zinc-100 py-3.5 pl-12 pr-5 text-sm outline-none transition focus:ring-2 focus:ring-emerald-500/15" /></label>
                    <WalletFilterDropdown fullWidth label="Reward status" selected={filter} options={rewardFilterOptions} onSelect={applyRewardFilter} />
                    <WalletFilterDropdown fullWidth label="Date filter" selected={dateFilter} options={dateOptions} onSelect={applyDateFilter} />
                    <button type="button" disabled={isExporting} onClick={exportActivities} className="min-h-10 rounded-xl bg-[#1C5E20] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#174D1A] disabled:opacity-60">{isExporting ? 'Exporting…' : 'Export filtered results'}</button>
                </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm">
                <div className="border-b border-zinc-100 p-5"><h2 className="text-base font-bold text-zinc-900">Referral Activities</h2><p className="mt-1 text-xs text-zinc-500">Referral rewards are credited to the referrer’s Referral Wallet after an eligible order.</p></div>
                {isTableEmpty ? <div className="flex min-h-[280px] flex-col items-center justify-center px-6 py-12 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800"><Gift size={25} strokeWidth={1.8} /></div>
                    <h3 className="mt-4 text-base font-bold text-zinc-900">{hasActiveFilters ? 'No matching referral activity' : 'No referral activity yet'}</h3>
                    <p className="mt-2 max-w-md text-sm leading-6 text-zinc-500">{hasActiveFilters ? 'No referrals match these search and filter settings. Adjust them or clear the filters to see all activity.' : 'When customers invite others, their referral relationships and reward progress will appear here.'}</p>
                    {hasActiveFilters && <button type="button" onClick={clearActivityFilters} className="mt-5 rounded-xl border border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50">Clear filters</button>}
                </div> : <div className="overflow-x-auto"><table className="w-full min-w-[1080px] text-left">
                    <thead className="border-b border-zinc-100 bg-zinc-50/80"><tr>{['Referrer', 'Referred User', 'Referral Code', 'Account Status', 'Reward Status', 'Date & Time', 'Reward Earned', 'Action'].map((heading) => <th key={heading} className={`whitespace-nowrap px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400 sm:px-4 ${heading === 'Action' ? 'text-right' : ''}`}>{heading}</th>)}</tr></thead>
                    <tbody className="divide-y divide-zinc-50">
                        {activityQuery.isLoading && !activityQuery.data ? <tr><td colSpan="8" className="py-14 text-center"><Loader2 className="mx-auto animate-spin text-emerald-700" /><p className="mt-2 text-xs text-zinc-500">Loading referral activities…</p></td></tr> : activityQuery.error ? <tr><td colSpan="8" className="px-5 py-8"><ErrorPanel error={activityQuery.error} retry={() => activityQuery.refetch()} /></td></tr> : rows.length ? rows.map((row) => <tr key={row.referralId} className="hover:bg-zinc-50/60">
                            <td className="whitespace-nowrap px-3 py-3 text-xs font-bold text-zinc-900 sm:px-4">{row.referrerName || '—'}</td>
                            <td className="whitespace-nowrap px-3 py-3 text-xs font-medium text-zinc-700 sm:px-4">{row.referredUserName || '—'}</td>
                            <td className="whitespace-nowrap px-3 py-3 text-xs font-medium text-zinc-600 sm:px-4">{row.referralCode || '—'}</td>
                            <td className="whitespace-nowrap px-3 py-3 sm:px-4"><StatusPill value={displayAccountStatus(row)} /></td>
                            <td className="whitespace-nowrap px-3 py-3 sm:px-4"><StatusPill value={displayRewardState(row.rewardState)} reward /></td>
                            <td className="whitespace-nowrap px-3 py-3 text-xs text-zinc-500 sm:px-4">{formatShortDateTime(row.createdAt)}</td>
                            <td className="whitespace-nowrap px-3 py-3 text-xs font-bold text-zinc-800 sm:px-4">{money(row.rewardAmountNaira)}</td>
                            <td className="whitespace-nowrap px-3 py-3 text-right sm:px-4"><button type="button" onClick={() => openReferrer(row)} title={`View ${row.referrerName || 'referrer'}’s referral activity`} aria-label={`View ${row.referrerName || 'referrer'}’s referral activity`} className="inline-flex items-center justify-center rounded-lg p-2 text-emerald-700 transition-colors hover:bg-emerald-50"><Eye size={16} /></button></td>
                        </tr>) : null}
                    </tbody>
                </table></div>}
                {!isTableEmpty && <div className="flex flex-col gap-3 border-t border-zinc-100 px-5 py-3 text-[10px] font-medium text-zinc-400 sm:flex-row sm:items-center sm:justify-between"><span>Showing {rows.length ? Math.min((page - 1) * pageSize + 1, total) : 0}–{Math.min(page * pageSize, total)} of {total} referral activities{activityQuery.isFetching && ' · Updating…'}</span>{pages > 1 && <PageControl page={page} pages={pages} onPage={setPage} />}</div>}
            </section>

            {isLeaderboardOpen && <LeaderboardPanel query={leaderboardQuery} onClose={() => setIsLeaderboardOpen(false)} />}
            <ReferralWithdrawalsPanel isOpen={isReferralWithdrawalListOpen} onClose={() => setIsReferralWithdrawalListOpen(false)} pendingCount={summary.pendingReferralWithdrawals || 0} />
            <CustomerModal key={selectedReferrer?.id || 'no-referral-customer'} isOpen={Boolean(selectedReferrer)} onClose={() => setSelectedReferrer(null)} customer={selectedReferrer} initialTab="Referral Activities" readOnly />
            <WalletCustomDateModal isOpen={isCustomDateOpen} dates={draftDates} onDatesChange={setDraftDates} onClose={resetDateAfterCancel} onApply={(selectedDates) => { setCustomDates(selectedDates); setDateFilter('custom'); setPage(1); setIsCustomDateOpen(false); }} />
        </div>
    );
};

function StatusPill({ value, reward = false }) {
    let color = 'border-zinc-200 bg-zinc-50 text-zinc-600';
    if (value === 'VERIFIED' || value === 'Rewarded') color = 'border-emerald-200 bg-emerald-50 text-emerald-700';
    else if (value === 'SUSPENDED' || value === 'Unverified' || value === 'No reward yet') color = value === 'SUSPENDED' ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-amber-200 bg-amber-50 text-amber-700';
    return <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold ${color}`}>{reward && value === 'Rewarded' && <CheckCircle2 size={11} />}{value}</span>;
}

function LeaderboardPanel({ query, onClose }) {
    const entries = query.data?.data?.data || [];
    return <div className="fixed inset-0 z-[120] overflow-hidden">
        <button type="button" aria-label="Close leaderboard" onClick={onClose} className="absolute inset-0 bg-black/50" />
        <aside role="dialog" aria-modal="true" aria-labelledby="referral-leaderboard-title" className="absolute inset-y-0 right-0 flex h-full w-full max-w-xl flex-col overflow-hidden bg-white shadow-2xl">
            <header className="flex shrink-0 items-center justify-between gap-4 border-b border-white/10 bg-[#0F172B] px-5 py-5 sm:px-6">
                <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-emerald-200/20 bg-emerald-400/10 text-emerald-300"><Trophy size={20} /></span>
                    <div className="min-w-0"><h2 id="referral-leaderboard-title" className="truncate text-base font-bold text-white">Referral Leaderboard</h2><p className="mt-1 text-xs text-slate-300">Ranked by successful referrals</p></div>
                </div>
                <button type="button" onClick={onClose} aria-label="Close leaderboard" className="shrink-0 rounded-lg p-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"><X size={19} /></button>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto bg-zinc-50/70 p-4 custom-scrollbar sm:p-5">
                {query.isLoading ? <div className="space-y-3" aria-label="Loading leaderboard"><div className="h-24 animate-pulse rounded-2xl border border-zinc-200 bg-white" /><div className="h-20 animate-pulse rounded-xl border border-zinc-200 bg-white" /><div className="h-20 animate-pulse rounded-xl border border-zinc-200 bg-white" /></div>
                    : query.error ? <div className="rounded-xl border border-zinc-200 bg-white p-4"><ErrorPanel error={query.error} retry={() => query.refetch()} /></div>
                        : entries.length === 0 ? <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-white px-6 text-center"><span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500"><Trophy size={23} /></span><h3 className="mt-4 text-sm font-bold text-zinc-900">No leaderboard entries yet</h3><p className="mt-1 max-w-xs text-xs leading-5 text-zinc-500">Referrers will appear here once they have successful referrals.</p></div>
                            : <div>
                                <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
                                    <div className="border-b border-zinc-100 px-4 py-3.5"><h3 className="text-sm font-bold text-zinc-900">Top referrers</h3><p className="mt-1 text-[11px] text-zinc-500">Successful referrals and rewards earned</p></div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full min-w-[520px] text-left">
                                            <thead className="bg-zinc-50/80"><tr>{['Rank', 'Referrer', 'Successful referrals', 'Rewards earned'].map((heading) => <th key={heading} className="whitespace-nowrap px-4 py-3 text-[9px] font-bold uppercase tracking-wide text-zinc-500 sm:px-5">{heading}</th>)}</tr></thead>
                                            <tbody className="divide-y divide-zinc-100">{entries.map((entry) => <tr key={entry.referrerUserId} className="transition-colors hover:bg-zinc-50/70">
                                                <td className="px-4 py-4 text-xs font-bold text-zinc-700 sm:px-5">{entry.rank}</td>
                                                <td className="px-4 py-4 text-xs font-semibold text-zinc-900 sm:px-5">{entry.referrerName || 'Unnamed referrer'}</td>
                                                <td className="px-4 py-4 text-xs text-zinc-700 sm:px-5">{entry.successfulReferrals}</td>
                                                <td className="whitespace-nowrap px-4 py-4 text-xs font-bold text-zinc-900 sm:px-5">{money(entry.totalRewardsEarnedNaira)}</td>
                                            </tr>)}</tbody>
                                        </table>
                                    </div>
                                </section>
                            </div>}
            </div>
        </aside>
    </div>;
}

export default ReferralActivities;
