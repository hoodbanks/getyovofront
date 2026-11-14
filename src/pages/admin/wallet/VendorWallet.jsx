import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, ArrowDownLeft, BellRing, Clock3, Eye, Search, Wallet, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../../store/useAuthStore';
import api from '../../../api/api';
import { formatShortDateTime } from '../../../utils/formatters';
import { WalletCustomDateModal, WalletFilterDropdown } from '../../../components/admin/wallet/WalletControls';
import { VendorActivityDetailsPanel, VendorNotificationRecoveryPanel, VendorWithdrawalsPanel } from './VendorWalletPanels';
import { apiMessage, formatVendorNaira, vendorDateFilters, vendorWalletQuery } from './vendorWalletApi';

const filters = {
    type: [{ value: 'all', label: 'All types' }, { value: 'order_credit', label: 'Order credit' }, { value: 'withdrawal', label: 'Withdrawal' }, { value: 'earnings_reversal', label: 'Earnings reversal' }],
    status: [{ value: 'all', label: 'All statuses' }, { value: 'successful', label: 'Successful' }, { value: 'pending', label: 'Pending' }, { value: 'processing', label: 'Processing' }, { value: 'failed', label: 'Failed' }, { value: 'declined', label: 'Declined' }],
};
const cardMeta = [
    { key: 'totalAvailableBalanceKobo', nairaKey: 'totalAvailableBalanceNaira', label: 'Available wallet balance', icon: Wallet, color: 'emerald', money: true, note: 'Current balance across vendor wallets' },
    { key: 'totalOrderCreditsKobo', nairaKey: 'totalOrderCreditsNaira', label: 'Gross order credits', icon: ArrowDownLeft, color: 'blue', money: true, note: 'Lifetime order credits before reversals' },
    { key: 'totalReversalsKobo', nairaKey: 'totalReversalsNaira', label: 'Earnings reversed', icon: X, color: 'rose', money: true, note: 'Reversal amount shown as a positive magnitude' },
    { key: 'netOrderEarningsKobo', nairaKey: 'netOrderEarningsNaira', label: 'Net order earnings', icon: ArrowDownLeft, color: 'emerald', money: true, note: 'Gross order credits less earnings reversals' },
    { key: 'totalWithdrawalsPaidKobo', nairaKey: 'totalWithdrawalsPaidNaira', label: 'Completed withdrawals', icon: ArrowDownLeft, color: 'blue', money: true, note: 'Manual transfers recorded by an admin; not independently verified' },
    { key: 'reservedWithdrawalAmountKobo', nairaKey: 'reservedWithdrawalAmountNaira', label: 'Reserved for withdrawals', icon: Clock3, color: 'amber', money: true, note: 'Funds reserved for withdrawal requests' },
    { key: 'pendingWithdrawalCount', label: 'Pending withdrawals', icon: Clock3, color: 'amber', note: 'Requests awaiting review', openPending: true },
    { key: 'declinedWithdrawalCount', label: 'Declined withdrawals', icon: X, color: 'slate', note: 'Requests with DECLINED status' },
];
const cardTone = { emerald: 'border-emerald-300 bg-emerald-50/60 text-emerald-900', blue: 'border-blue-300 bg-blue-50/60 text-blue-900', amber: 'border-amber-300 bg-amber-50/60 text-amber-900', purple: 'border-purple-300 bg-purple-50/60 text-purple-900', rose: 'border-rose-300 bg-rose-50/60 text-rose-900', slate: 'border-slate-300 bg-slate-50 text-slate-900' };
const isVendorSummary = (value) => value && typeof value === 'object' && !Array.isArray(value) && value.currency === 'NGN' && Number.isFinite(value.pendingWithdrawalCount) && Number.isFinite(value.declinedWithdrawalCount);

const VendorWallet = () => {
    const token = useAuthStore((state) => state.accessToken);
    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [type, setType] = useState('all');
    const [status, setStatus] = useState('all');
    const [dateFilter, setDateFilter] = useState('all_time');
    const [customDates, setCustomDates] = useState({ start: '', end: '' });
    const [draftDates, setDraftDates] = useState({ start: '', end: '' });
    const [customDateOpen, setCustomDateOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [pendingOpen, setPendingOpen] = useState(false);
    const [reviewWithdrawalId, setReviewWithdrawalId] = useState(null);
    const [noticesOpen, setNoticesOpen] = useState(false);
    const [selectedTransactionId, setSelectedTransactionId] = useState(null);
    useEffect(() => { const timer = window.setTimeout(() => { setDebouncedQuery(query.trim()); setPage(1); }, 300); return () => window.clearTimeout(timer); }, [query]);
    useEffect(() => {
        const openReview = (event) => {
            if (!event.detail) return;
            setSelectedTransactionId(null);
            setReviewWithdrawalId(event.detail);
            setPendingOpen(true);
        };
        window.addEventListener('vendor-wallet-open-withdrawal', openReview);
        return () => window.removeEventListener('vendor-wallet-open-withdrawal', openReview);
    }, []);
    const summaryQuery = useQuery({ queryKey: ['vendor-wallet-summary'], queryFn: () => api.get('/superadmin/vendor-wallet/summary', token) });
    const transactionParams = vendorWalletQuery({ page, limit: 20, query: debouncedQuery, type, status, dateFilter, from: customDates.start, to: customDates.end });
    const activityQuery = useQuery({ queryKey: ['vendor-wallet-transactions', page, debouncedQuery, type, status, dateFilter, customDates], queryFn: () => api.get(`/superadmin/vendor-wallet/transactions?${transactionParams}`, token), enabled: dateFilter !== 'custom' || Boolean(customDates.start && customDates.end), placeholderData: (previous) => previous });
    // The documented response envelope is { success, message, data }, with the
    // summary fields directly inside data (not an additional `summary` object).
    const summary = summaryQuery.data?.data;
    const activityData = activityQuery.data?.data;
    const rows = activityData?.data;
    const total = activityData?.total;
    const totalPages = Math.max(1, Math.ceil((Number(total) || 0) / 20));
    const chooseDate = (value) => { if (value === 'custom') { setDraftDates(customDates); setCustomDateOpen(true); return; } setDateFilter(value); setPage(1); };
    const updateFilter = (setter) => (value) => { setter(value); setPage(1); };

    return <div className="mx-auto w-full max-w-[1600px] space-y-5 pb-10">
        <section className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3"><p className="text-xs font-semibold text-zinc-600">Vendor Wallet dashboard</p><Link to="/admin/wallet/vendor/vendors" className="text-xs font-bold text-emerald-800 underline underline-offset-4">Browse vendor wallets →</Link></div><p className="mb-4 text-[11px] leading-5 text-zinc-500">Keep these measures separate. Gross order credits minus earnings reversed is net order earnings. A completed withdrawal and the available balance are uses of that wallet, not extra earnings. Completion means an admin recorded a manual transfer.</p>
            {summaryQuery.isLoading ? <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{cardMeta.map((card) => <div key={card.key} className="h-28 animate-pulse rounded-xl bg-zinc-100" />)}</div> : summaryQuery.isError ? <div role="alert" className="rounded-xl bg-rose-50 p-4 text-sm text-rose-800">{apiMessage(summaryQuery.error, 'Could not load Vendor Wallet summary.')} <button type="button" onClick={() => summaryQuery.refetch()} className="ml-2 font-bold underline">Retry</button></div> : !isVendorSummary(summary) ? <div role="alert" className="rounded-xl bg-rose-50 p-4 text-sm text-rose-800">Unexpected response from GET /superadmin/vendor-wallet/summary; expected the documented NGN metrics directly under response.data.</div> : <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{cardMeta.map((card) => { const Icon = card.icon; const raw = summary[card.key]; const value = card.money ? formatVendorNaira(raw, summary[card.nairaKey]) : raw; const cardBody = <div><div className="flex items-start justify-between gap-3"><div className="min-w-0 flex-1"><span className="block text-[10px] font-bold uppercase tracking-wider opacity-70">{card.label}</span><span className="mt-1 block text-lg font-bold">{value === undefined || value === null ? '—' : value}</span></div><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/80"><Icon size={18}/></span></div><span className="mt-1 block w-full text-[10px] leading-4 opacity-70">{card.note}</span></div>; return card.openPending ? <button key={card.key} type="button" onClick={() => setPendingOpen(true)} className={`cursor-pointer rounded-xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md ${cardTone[card.color]}`}>{cardBody}</button> : <div key={card.key} className={`rounded-xl border p-4 ${cardTone[card.color]}`}>{cardBody}</div>; })}</div>}
        </section>

        <section className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm lg:flex-row lg:items-end lg:justify-between"><label className="relative block w-full lg:max-w-md"><Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search vendor, transaction, or reference" className="w-full rounded-3xl bg-zinc-100 py-3.5 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-emerald-600/20"/></label><div className="grid grid-cols-1 gap-2 sm:grid-cols-3"><WalletFilterDropdown label="Type" selected={type} options={filters.type} onSelect={updateFilter(setType)}/><WalletFilterDropdown label="Status" selected={status} options={filters.status} onSelect={updateFilter(setStatus)}/><WalletFilterDropdown label="Date" selected={dateFilter} options={vendorDateFilters} onSelect={chooseDate}/></div></section>

        <section className="overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm"><header className="flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-center sm:justify-between"><div><h1 className="text-base font-bold text-zinc-900">Vendor Wallet Activity</h1><p className="mt-1 text-xs text-zinc-500">Each withdrawal request appears once; ledger reserve/consume/release events are in its details.</p></div><div className="flex flex-wrap gap-4"><button type="button" onClick={() => setPendingOpen(true)} className="cursor-pointer text-left text-xs font-bold text-emerald-800 underline underline-offset-4">View pending withdrawals</button><button type="button" onClick={() => setNoticesOpen(true)} className="inline-flex cursor-pointer items-center gap-1 text-left text-xs font-bold text-emerald-800 underline underline-offset-4"><BellRing size={14}/>Notification recovery</button></div></header>
            {activityQuery.isLoading ? <div className="space-y-3 p-5">{Array.from({ length: 5 }, (_, index) => <div key={index} className="h-12 animate-pulse rounded-lg bg-zinc-100"/>)}</div> : activityQuery.isError ? <div className="p-5"><div role="alert" className="rounded-xl bg-rose-50 p-4 text-sm text-rose-800">{apiMessage(activityQuery.error, 'Could not load vendor wallet activity.')} <button type="button" onClick={() => activityQuery.refetch()} className="ml-2 font-bold underline">Retry</button></div></div> : !Array.isArray(rows) || typeof total !== 'number' ? <div role="alert" className="m-5 rounded-xl bg-rose-50 p-4 text-sm text-rose-800">Unexpected activity response; expected data.data rows and data.total from the documented endpoint.</div> : rows.length === 0 ? <div className="px-5 py-14 text-center"><Activity className="mx-auto text-zinc-300" size={28}/><h2 className="mt-3 text-sm font-bold text-zinc-800">No vendor wallet activity</h2><p className="mt-1 text-xs text-zinc-500">There are no activities for these search and filter settings.</p></div> : <div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left"><thead className="bg-zinc-50"><tr>{['Activity reference', 'Vendor', 'Type', 'Amount', 'Status', 'Date & time', ''].map((heading) => <th key={heading} className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400">{heading}</th>)}</tr></thead><tbody className="divide-y divide-zinc-100">{rows.map((row) => { const type = String(row.type || '').toLowerCase(); const amount = Number.isFinite(row.amountKobo) ? row.amountKobo : row.amountNaira; const incoming = Number.isFinite(amount) && amount > 0; const outgoing = Number.isFinite(amount) && amount < 0; const typeTone = type.includes('withdrawal') ? 'bg-violet-50 text-violet-700' : type.includes('reversal') ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'; const absoluteKobo = Number.isFinite(row.amountKobo) ? Math.abs(row.amountKobo) : undefined; const absoluteNaira = !Number.isFinite(row.amountKobo) && Number.isFinite(row.amountNaira) ? Math.abs(row.amountNaira) : undefined; return <tr key={row.transactionId} onClick={() => setSelectedTransactionId(row.transactionId)} className="cursor-pointer hover:bg-zinc-50"><td className="max-w-[250px] px-4 py-3 text-[11px] font-semibold leading-4">{row.transactionId}</td><td className="px-4 py-3"><p className="text-xs font-bold">{row.storeName || row.vendorName || 'Vendor'}</p><p className="mt-1 text-[10px] text-zinc-500">{row.ownerName || ''}</p></td><td className="px-4 py-3 text-xs"><span className={`inline-flex max-w-[130px] rounded-full px-2 py-1 text-[9px] font-bold capitalize leading-3 ${typeTone}`}>{type === 'earnings_reversal' ? 'Earnings reversal' : type.replaceAll('_', ' ') || 'Other'}</span></td><td className={`whitespace-nowrap px-4 py-3 text-[11px] font-bold ${incoming ? 'text-emerald-700' : outgoing ? 'text-rose-700' : 'text-zinc-700'}`}>{incoming ? '+' : outgoing ? '-' : ''}{formatVendorNaira(absoluteKobo, absoluteNaira)}</td><td className="whitespace-nowrap px-4 py-3 text-[11px] font-bold text-zinc-700">{row.status}</td><td className="whitespace-nowrap px-4 py-3 text-[11px] font-semibold text-zinc-600">{row.createdAt ? formatShortDateTime(row.createdAt) : '—'}</td><td className="px-4 py-3 text-right"><Eye size={16} className="inline text-emerald-700"/></td></tr>; })}</tbody></table></div>}
            {activityQuery.isSuccess && Array.isArray(rows) && typeof total === 'number' && <footer className="flex items-center justify-between border-t px-5 py-3 text-xs text-zinc-500"><span>{total ? `Showing ${(page - 1) * 20 + 1}–${Math.min(page * 20, total)} of ${total}` : 'No activities'}</span><div className="flex gap-2"><button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-lg border px-3 py-1.5 disabled:opacity-40">Previous</button><span className="px-2 py-2">Page {page} of {totalPages}</span><button type="button" disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="rounded-lg border px-3 py-1.5 disabled:opacity-40">Next</button></div></footer>}
        </section>
        <WalletCustomDateModal isOpen={customDateOpen} dates={draftDates} onDatesChange={setDraftDates} onClose={() => { setCustomDateOpen(false); setDateFilter('all_time'); }} onApply={(dates) => { setCustomDates(dates); setDateFilter('custom'); setPage(1); setCustomDateOpen(false); }}/>
        <VendorWithdrawalsPanel key={reviewWithdrawalId || 'pending'} isOpen={pendingOpen} initialWithdrawalId={reviewWithdrawalId} onClose={() => { setPendingOpen(false); setReviewWithdrawalId(null); }}/>
        <VendorNotificationRecoveryPanel isOpen={noticesOpen} onClose={() => setNoticesOpen(false)}/>
        <VendorActivityDetailsPanel transactionId={selectedTransactionId} onClose={() => setSelectedTransactionId(null)}/>
    </div>;
};

export default VendorWallet;
