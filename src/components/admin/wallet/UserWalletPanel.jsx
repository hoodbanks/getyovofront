import { useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2, UserRound, Wallet, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../api/api';
import { useAuthStore } from '../../../store/useAuthStore';
import { formatShortDateTime } from '../../../utils/formatters';
import { WalletCustomDateModal, WalletFilterDropdown } from './WalletControls';
import { buildUserWalletParams, formatNaira, signedNairaAmount, transactionStatusLabel, transactionTypeLabel, USER_WALLET_PAGE_SIZE, userWalletDateOptions, userWalletStatusOptions, userWalletTypeOptions } from '../../../pages/admin/wallet/userWalletUtils';

const statusClasses = { Successful: 'bg-emerald-50 text-emerald-700', Pending: 'bg-amber-50 text-amber-700', Expired: 'bg-orange-50 text-orange-700', 'Reconciliation required': 'bg-rose-50 text-rose-700' };
const Metric = ({ label, value, primary = false }) => <div className={`min-w-0 rounded-xl border p-4 ${primary ? 'border-emerald-200 bg-emerald-50/70' : 'border-zinc-200 bg-zinc-50/70'}`}><p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">{label}</p><p className="mt-2 truncate text-lg font-bold text-zinc-900">{value}</p></div>;

const UserWalletPanel = ({ userId, initialName, onClose }) => {
    const token = useAuthStore((state) => state.accessToken);
    const [page, setPage] = useState(1);
    const [type, setType] = useState('all');
    const [status, setStatus] = useState('all');
    const [dateFilter, setDateFilter] = useState('all_time');
    const [dates, setDates] = useState({ start: '', end: '' });
    const [draftDates, setDraftDates] = useState({ start: '', end: '' });
    const [previousDateFilter, setPreviousDateFilter] = useState('all_time');
    const [isDateModalOpen, setIsDateModalOpen] = useState(false);

    const walletQuery = useQuery({ queryKey: ['user-wallet-detail', userId], queryFn: () => api.get(`/superadmin/users/${encodeURIComponent(userId)}/wallet`, token), enabled: Boolean(userId) });
    const transactionsQuery = useQuery({
        queryKey: ['user-wallet-customer-transactions', userId, page, type, status, dateFilter, dates.start, dates.end],
        queryFn: () => {
            const params = buildUserWalletParams({ page, limit: USER_WALLET_PAGE_SIZE, type, status, dateFilter, dates, includeQuery: false });
            return api.get(`/superadmin/users/${encodeURIComponent(userId)}/wallet/transactions?${params.toString()}`, token);
        },
        enabled: Boolean(userId) && (dateFilter !== 'custom' || Boolean(dates.start && dates.end)),
        placeholderData: (previousData) => previousData,
    });

    if (!userId) return null;
    const wallet = walletQuery.data?.data || {};
    const result = transactionsQuery.data?.data || {};
    const rows = result.data || [];
    const total = result.total || 0;
    const pageSize = result.pageSize || USER_WALLET_PAGE_SIZE;
    const pages = Math.max(1, Math.ceil(total / pageSize));
    const metrics = [
        { label: 'Wallet balance', value: formatNaira(wallet.balanceNaira, wallet.balanceKobo), primary: true },
        { label: 'Total top-ups', value: formatNaira(wallet.totalTopUpsNaira, wallet.totalTopUpsKobo) },
        { label: 'Total spending', value: formatNaira(wallet.totalSpendingNaira, wallet.totalSpendingKobo) },
        { label: 'Total refunds', value: formatNaira(wallet.totalRefundsNaira, wallet.totalRefundsKobo) },
    ];
    const updateFilter = (setter) => (value) => { setter(value); setPage(1); };
    const setDate = (value) => {
        if (value === 'custom') { setPreviousDateFilter(dateFilter); setDraftDates(dates); setIsDateModalOpen(true); return; }
        setDateFilter(value); setPage(1);
    };

    return <>
        <div className="fixed inset-0 z-[110] overflow-hidden"><button type="button" aria-label="Close user wallet details" onClick={onClose} className="absolute inset-0 h-full w-full bg-black/50" />
            <aside role="dialog" aria-modal="true" aria-labelledby="user-wallet-title" className="absolute inset-y-0 right-0 flex h-full w-full max-w-xl flex-col bg-white shadow-2xl">
                <header className="flex shrink-0 items-center justify-between border-b border-white/10 bg-[#0F172B] p-5 text-white sm:p-6"><div className="flex min-w-0 items-center gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-300"><UserRound size={20} /></div><div className="min-w-0"><h2 id="user-wallet-title" className="truncate text-base font-bold text-white">{wallet.name || initialName || 'Customer Wallet'}</h2><p className="truncate text-xs font-medium text-slate-300">Spending wallet · User ID {userId}</p></div></div><button type="button" onClick={onClose} aria-label="Close user wallet details" className="rounded-xl p-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"><X size={20} /></button></header>
                <div className="flex-1 space-y-5 overflow-y-auto p-5 custom-scrollbar sm:p-6">
                    {walletQuery.isLoading ? <div className="space-y-3" aria-label="Loading wallet details">{[0, 1].map((item) => <div key={item} className="h-20 animate-pulse rounded-xl bg-zinc-100" />)}</div> : walletQuery.error ? <div role="alert" className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700"><p>{walletQuery.error.message || 'Could not load this customer wallet.'}</p><button type="button" onClick={() => walletQuery.refetch()} className="mt-2 font-bold underline">Retry</button></div> : <section><h3 className="mb-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500">Wallet metrics</h3><div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{metrics.map((metric) => <Metric key={metric.label} {...metric} />)}</div><div className="mt-3 rounded-xl bg-zinc-50 px-3 py-2 text-[10px] text-zinc-500"><p>{wallet.email || 'Email not available'}</p><p className="mt-1">{wallet.phonenumber || 'Phone not available'}</p></div></section>}

                    <section><div className="mb-3"><h3 className="text-sm font-bold text-zinc-900">Wallet transactions</h3><p className="mt-1 text-[10px] text-zinc-500">Customer spending-wallet activity only. No referral or vendor wallet transactions.</p></div>
                        <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-3"><WalletFilterDropdown label="Type" selected={type} options={userWalletTypeOptions} onSelect={updateFilter(setType)} /><WalletFilterDropdown label="Status" selected={status} options={userWalletStatusOptions} onSelect={updateFilter(setStatus)} /><WalletFilterDropdown label="Date filter" selected={dateFilter} options={userWalletDateOptions} onSelect={setDate} /></div>
                        {transactionsQuery.isLoading && !transactionsQuery.data ? <div className="py-10 text-center"><Loader2 className="mx-auto animate-spin text-emerald-700" /><p className="mt-2 text-xs text-zinc-500">Loading wallet history…</p></div> : transactionsQuery.error ? <div role="alert" className="rounded-xl bg-rose-50 p-4 text-xs text-rose-700">{transactionsQuery.error.message || 'Could not load wallet history.'}<button type="button" onClick={() => transactionsQuery.refetch()} className="ml-2 font-bold underline">Retry</button></div> : rows.length ? <div className="divide-y divide-zinc-100 rounded-2xl border border-zinc-100">{rows.map((row) => { const label = transactionStatusLabel(row.status); return <div key={row.transactionId} className="flex items-center justify-between gap-3 px-4 py-3.5"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="text-xs font-bold text-zinc-800">{transactionTypeLabel(row.type)}</p><span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${statusClasses[label] || 'bg-zinc-100 text-zinc-600'}`}>{label}</span></div><p className="mt-1 truncate text-[10px] text-zinc-400">{row.transactionId} · {formatShortDateTime(row.createdAt)}</p></div><p className={`whitespace-nowrap text-xs font-bold ${Number(row.amountKobo ?? row.amountNaira ?? 0) < 0 ? 'text-rose-600' : 'text-emerald-700'}`}>{signedNairaAmount(row)}</p></div>; })}</div> : <p className="rounded-xl bg-zinc-50 px-4 py-8 text-center text-xs text-zinc-500">No wallet transactions match these filters.</p>}
                        {total > pageSize && <div className="mt-3 flex items-center justify-between text-[10px] text-zinc-500"><span>Page {page} of {pages}</span><div className="flex gap-2"><button type="button" aria-label="Previous wallet history page" disabled={page <= 1} onClick={() => setPage((current) => current - 1)} className="rounded-lg border p-2 disabled:opacity-40"><ChevronLeft size={14} /></button><button type="button" aria-label="Next wallet history page" disabled={page >= pages} onClick={() => setPage((current) => current + 1)} className="rounded-lg border p-2 disabled:opacity-40"><ChevronRight size={14} /></button></div></div>}
                    </section>
                </div>
            </aside>
        </div>
        <WalletCustomDateModal isOpen={isDateModalOpen} dates={draftDates} onDatesChange={setDraftDates} onClose={() => { setIsDateModalOpen(false); if (!dates.start || !dates.end) setDateFilter(previousDateFilter); }} onApply={(selectedDates) => { setDates(selectedDates); setDateFilter('custom'); setPage(1); setIsDateModalOpen(false); }} />
    </>;
};

export default UserWalletPanel;
