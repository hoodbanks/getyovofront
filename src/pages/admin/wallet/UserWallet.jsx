import { useEffect, useState } from 'react';
import { Activity, ArrowDownLeft, ArrowRight, CircleAlert, Eye, Loader2, Search, Wallet, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '../../../api/api';
import { useAuthStore } from '../../../store/useAuthStore';
import { exportToCSV, formatShortDateTime } from '../../../utils/formatters';
import { WalletCustomDateModal, WalletFilterDropdown } from '../../../components/admin/wallet/WalletControls';
import UserWalletTransactionDetailsPanel from '../../../components/admin/wallet/UserWalletTransactionDetailsPanel';
import { buildUserWalletParams, dateFilterForApi, formatNaira, signedNairaAmount, transactionStatusLabel, transactionTypeLabel, USER_WALLET_EXPORT_LIMIT, USER_WALLET_PAGE_SIZE, userWalletDateOptions, userWalletStatusOptions, userWalletTypeOptions } from './userWalletUtils';

const summaryCards = [
    { key: 'totalBalanceKobo', nairaKey: 'totalBalanceNaira', label: 'Total User Wallet Balance', icon: Wallet, tint: 'emerald', detail: 'Across all user spending wallets', link: true },
    { key: 'totalTopUpsKobo', nairaKey: 'totalTopUpsNaira', label: 'Total Top-Ups', icon: ArrowDownLeft, tint: 'blue', detail: 'User wallet funding' },
    { key: 'transactionsToday', label: 'Wallet Activity Today', icon: Activity, tint: 'purple', detail: 'Top-ups, payments, refunds & attempts', count: true, explanation: 'Counts spending-wallet activity since Lagos midnight: top-ups, order payments, refunds, and non-settled top-up attempts, including failed or abandoned Paystack observations. Successful top-ups count once.' },
    { key: 'failedTransactions', label: 'Failed Payments', icon: CircleAlert, tint: 'rose', detail: 'Latest Paystack check reported failed', count: true },
    { key: 'abandonedTransactions', label: 'Not Completed', icon: CircleAlert, tint: 'rose', detail: 'Paystack reports the payment wasn’t completed', count: true, explanation: 'This is a provider observation, not proof that the customer cancelled.' },
];

const tintClasses = {
    emerald: 'border-emerald-300 bg-emerald-50/60 text-emerald-900',
    blue: 'border-blue-300 bg-blue-50/60 text-blue-900',
    purple: 'border-purple-300 bg-purple-50/60 text-purple-900',
    rose: 'border-rose-300 bg-rose-50/60 text-rose-900',
};

const SummaryCard = ({ card, value, loading }) => {
    const Icon = card.icon;
    const displayValue = card.count ? (value == null ? '—' : Number(value).toLocaleString('en-NG')) : value == null || (value.naira == null && value.kobo == null) ? '—' : formatNaira(card.nairaKey ? value.naira : null, value.kobo);
    const content = <div className={`relative flex min-h-[104px] items-start justify-between gap-3 overflow-hidden rounded-xl border p-4 transition ${tintClasses[card.tint]} ${card.link ? 'hover:-translate-y-0.5 hover:shadow-md' : ''}`}>
        <div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{card.label}</p>{loading ? <div className="mt-3 h-5 w-28 animate-pulse rounded bg-zinc-200" /> : <p className="mt-2 text-base font-bold text-zinc-900">{displayValue}</p>}<p className="mt-2 text-[10px] text-zinc-500" title={card.explanation}>{card.detail}</p>{card.link && <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 underline underline-offset-2">View balances <ArrowRight size={12} /></span>}</div>
        <div className={`shrink-0 rounded-xl p-2 text-white ${card.tint === 'emerald' ? 'bg-emerald-900' : card.tint === 'blue' ? 'bg-blue-900' : card.tint === 'purple' ? 'bg-purple-900' : 'bg-rose-900'}`}><Icon size={18} /></div>
    </div>;
    return card.link ? <Link to="/admin/wallet/user/balances" aria-label="View user wallet balances" className="block rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600">{content}</Link> : content;
};

const StatusBadge = ({ value }) => {
    const status = transactionStatusLabel(value);
    const classes = status === 'Successful' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : status === 'Pending' ? 'border-amber-200 bg-amber-50 text-amber-700' : status === 'Failed' ? 'border-rose-200 bg-rose-50 text-rose-700' : status === 'Not completed' ? 'border-orange-200 bg-orange-50 text-orange-800' : 'border-orange-200 bg-orange-50 text-orange-800';
    return <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold ${classes}`}>{status}</span>;
};

const ErrorPanel = ({ message, onRetry }) => <div role="alert" className="px-5 py-12 text-center"><p className="text-sm font-semibold text-rose-700">{message || 'Could not load user wallet data.'}</p><button type="button" onClick={onRetry} className="mt-3 rounded-lg border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50">Try again</button></div>;

const UserWallet = () => {
    const token = useAuthStore((state) => state.accessToken);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [type, setType] = useState('all');
    const [status, setStatus] = useState('all');
    const [dateFilter, setDateFilter] = useState('all_time');
    const [customDates, setCustomDates] = useState({ start: '', end: '' });
    const [draftDates, setDraftDates] = useState({ start: '', end: '' });
    const [previousDateFilter, setPreviousDateFilter] = useState('all_time');
    const [isDateModalOpen, setIsDateModalOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [isExporting, setIsExporting] = useState(false);
    const [selectedTransactionId, setSelectedTransactionId] = useState(null);

    useEffect(() => {
        const timer = window.setTimeout(() => { setDebouncedSearch(search.trim()); setPage(1); }, 350);
        return () => window.clearTimeout(timer);
    }, [search]);

    const summaryQuery = useQuery({ queryKey: ['user-wallet-summary'], queryFn: () => api.get('/superadmin/user-wallet/summary', token) });
    const transactionsQuery = useQuery({
        queryKey: ['user-wallet-transactions', page, debouncedSearch, type, status, dateFilter, customDates.start, customDates.end],
        queryFn: () => {
            const params = buildUserWalletParams({ page, limit: USER_WALLET_PAGE_SIZE, query: debouncedSearch, type, status, dateFilter, dates: customDates });
            return api.get(`/superadmin/user-wallet/transactions?${params.toString()}`, token);
        },
        enabled: dateFilter !== 'custom' || Boolean(customDates.start && customDates.end),
        placeholderData: (previousData) => previousData,
    });

    const summary = summaryQuery.data?.data || {};
    const transactionPage = transactionsQuery.data?.data || {};
    const transactions = transactionPage.data || [];
    const total = transactionPage.total || 0;
    const pageSize = transactionPage.pageSize || USER_WALLET_PAGE_SIZE;
    const pages = Math.max(1, Math.ceil(total / pageSize));
    const metricValues = {
        totalBalanceKobo: { kobo: summary.totalBalanceKobo, naira: summary.totalBalanceNaira },
        totalTopUpsKobo: { kobo: summary.totalTopUpsKobo, naira: summary.totalTopUpsNaira },
        transactionsToday: summary.transactionsToday,
        failedTransactions: summary.failedTransactions,
        abandonedTransactions: summary.abandonedTransactions,
    };

    const updateFilter = (setter) => (value) => { setter(value); setPage(1); };
    const onDateFilter = (value) => {
        if (value === 'custom') {
            setPreviousDateFilter(dateFilter);
            setDraftDates(customDates);
            setIsDateModalOpen(true);
            return;
        }
        setDateFilter(dateFilterForApi(value));
        setPage(1);
    };
    const closeDateModal = () => {
        setIsDateModalOpen(false);
        if (!customDates.start || !customDates.end) setDateFilter(previousDateFilter);
    };

    const exportTransactions = async () => {
        if (dateFilter === 'custom' && (!customDates.start || !customDates.end)) return;
        setIsExporting(true);
        try {
            const allRows = [];
            let exportTotal = 0;
            let exportPages = 1;
            for (let exportPage = 1; exportPage <= exportPages; exportPage += 1) {
                const params = buildUserWalletParams({ page: exportPage, limit: USER_WALLET_EXPORT_LIMIT, query: debouncedSearch, type, status, dateFilter, dates: customDates });
                const response = await api.get(`/superadmin/user-wallet/transactions?${params.toString()}`, token);
                const data = response.data || {};
                exportTotal = data.total || 0;
                exportPages = Math.max(1, Math.ceil(exportTotal / (data.pageSize || USER_WALLET_EXPORT_LIMIT)));
                allRows.push(...(data.data || []));
            }
            if (!allRows.length) { toast('There are no wallet transactions matching these filters.'); return; }
            exportToCSV(allRows.map((row) => ({ 'Transaction ID': row.transactionId, 'User ID': row.userId, Customer: row.customerName, Type: transactionTypeLabel(row.type), Amount: signedNairaAmount(row), Status: transactionStatusLabel(row.status), 'Date and Time': formatShortDateTime(row.createdAt), Reference: row.relatedReference || '' })), 'user-wallet-transactions');
            toast.success(`Exported ${allRows.length} matching user wallet transactions.`);
        } catch (error) {
            toast.error(error.message || 'Could not export wallet transactions.');
        } finally { setIsExporting(false); }
    };

    const clearFilters = () => { setSearch(''); setDebouncedSearch(''); setType('all'); setStatus('all'); setDateFilter('all_time'); setCustomDates({ start: '', end: '' }); setPage(1); };

    return <div className="mx-auto w-full max-w-[1600px] space-y-6 pb-10">
        <section className="rounded-2xl bg-white py-5"><div className="grid grid-cols-1 gap-3 rounded-xl p-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-4">{summaryCards.map((card) => <SummaryCard key={card.key} card={card} value={metricValues[card.key]} loading={summaryQuery.isLoading} />)}</div>{summaryQuery.error && <ErrorPanel message={summaryQuery.error.message} onRetry={() => summaryQuery.refetch()} />}</section>

        <section className="flex flex-col gap-3 rounded-2xl border border-amber-100 bg-amber-50/70 p-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-sm font-bold text-zinc-900">Payment reconciliation</h2><p className="mt-1 text-xs text-zinc-600">Review payments held for verification separately from failed or not-completed Paystack observations.</p></div><Link to="/admin/wallet/user/reconciliation" className="inline-flex shrink-0 items-center gap-2 self-start rounded-lg border border-amber-200 bg-white px-4 py-2.5 text-xs font-bold text-amber-900 underline underline-offset-2 hover:bg-amber-100 sm:self-auto">Open reconciliation <ArrowRight size={14} /></Link></section>

        <section className="flex flex-col items-stretch justify-between gap-4 rounded-2xl bg-white p-4 shadow-sm lg:flex-row lg:items-center">
            <label className="relative block w-full flex-1 lg:max-w-md"><span className="sr-only">Search user or transaction ID</span><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} maxLength={100} placeholder="Search user or transaction ID" className="w-full rounded-3xl bg-zinc-100 py-4 pl-12 pr-6 text-sm font-medium outline-none placeholder:text-zinc-500 focus:ring-2 focus:ring-emerald-500/10" /></label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:flex lg:flex-wrap lg:items-end">
                <WalletFilterDropdown label="Type" selected={type} options={userWalletTypeOptions} onSelect={updateFilter(setType)} />
                <WalletFilterDropdown label="Status" selected={status} options={userWalletStatusOptions} onSelect={updateFilter(setStatus)} />
                <WalletFilterDropdown label="Date Filter" selected={dateFilter} options={userWalletDateOptions} onSelect={onDateFilter} />
                {(search || type !== 'all' || status !== 'all' || dateFilter !== 'all_time') && <button type="button" onClick={clearFilters} className="flex min-h-10 items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 text-xs font-bold text-white hover:bg-zinc-800"><X size={14} /> Reset</button>}
            </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-zinc-100 p-5 sm:flex-row sm:items-center sm:justify-between"><div><h1 className="text-base font-bold text-zinc-900">User Wallet Transactions</h1><p className="mt-1 text-xs text-zinc-500">Customer spending-wallet top-ups, order payments, and refunds. No withdrawals or referral activity.</p></div><button type="button" onClick={exportTransactions} disabled={isExporting || transactionsQuery.isLoading} className="rounded-xl bg-[#1C5E20] px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#174D1A] disabled:cursor-wait disabled:opacity-60">{isExporting ? 'Exporting…' : 'Export filtered results'}</button></div>
            <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left"><thead className="border-b border-zinc-100 bg-zinc-50/80"><tr>{['Transaction ID', 'User Name', 'Type', 'Amount', 'Status', 'Date & Time', 'Action'].map((heading) => <th key={heading} className={`whitespace-nowrap px-4 py-4 text-[10px] font-bold uppercase tracking-wider text-zinc-400 sm:px-5 ${heading === 'Action' ? 'text-right' : ''}`}>{heading}</th>)}</tr></thead>
                <tbody className="divide-y divide-zinc-50">{transactionsQuery.isLoading && !transactionsQuery.data ? <tr><td colSpan="7" className="px-5 py-16 text-center"><Loader2 className="mx-auto animate-spin text-emerald-700" /><p className="mt-2 text-xs text-zinc-500">Loading wallet transactions…</p></td></tr> : transactionsQuery.error ? <tr><td colSpan="7"><ErrorPanel message={transactionsQuery.error.message} onRetry={() => transactionsQuery.refetch()} /></td></tr> : transactions.length ? transactions.map((transaction) => <tr key={transaction.transactionId} className="transition-colors hover:bg-zinc-50/60">
                    <td className="whitespace-nowrap px-4 py-4 text-xs font-semibold text-zinc-700 sm:px-5">{transaction.transactionId}</td><td className="whitespace-nowrap px-4 py-4 text-xs font-bold text-zinc-900 sm:px-5">{transaction.customerName || transaction.userId}</td>
                    <td className="whitespace-nowrap px-4 py-4 sm:px-5"><span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${transaction.type === 'ORDER_PAYMENT' ? 'border-rose-100 bg-rose-50 text-rose-700' : transaction.type === 'REFUND' ? 'border-purple-100 bg-purple-50 text-purple-700' : 'border-emerald-100 bg-emerald-50 text-emerald-700'}`}>{transactionTypeLabel(transaction.type)}</span></td>
                    <td className={`whitespace-nowrap px-4 py-4 text-xs font-bold sm:px-5 ${Number(transaction.amountKobo ?? transaction.amountNaira ?? 0) < 0 ? 'text-rose-600' : 'text-zinc-800'}`}>{signedNairaAmount(transaction)}</td><td className="px-4 py-4 sm:px-5"><StatusBadge value={transaction.status} />{(transaction.providerStatus || transaction.providerStatusCheckedAt) && <p className="mt-1 max-w-[150px] whitespace-normal break-words text-[9px] leading-3 text-zinc-500" title="Latest provider observation; not proof of customer cancellation"><span className="block">Paystack observed {transaction.providerStatus ? transactionStatusLabel(String(transaction.providerStatus).toUpperCase()) : 'status unavailable'}</span>{transaction.providerStatusCheckedAt && <span className="mt-0.5 block">Checked {formatShortDateTime(transaction.providerStatusCheckedAt)}</span>}</p>}</td>
                    <td className="whitespace-nowrap px-4 py-4 text-xs font-medium text-zinc-500 sm:px-5">{formatShortDateTime(transaction.createdAt)}</td><td className="whitespace-nowrap px-4 py-4 text-right sm:px-5"><button type="button" onClick={() => setSelectedTransactionId(transaction.transactionId)} aria-label={`View transaction ${transaction.transactionId}`} title="View transaction details" className="inline-flex items-center justify-center rounded-lg p-2 text-emerald-700 transition-colors hover:bg-emerald-50"><Eye size={16} /></button></td>
                </tr>) : <tr><td colSpan="7" className="px-5 py-16 text-center"><Wallet className="mx-auto text-zinc-300" size={26} /><p className="mt-3 text-sm font-semibold text-zinc-700">No user wallet transactions found</p><p className="mt-1 text-xs text-zinc-500">Try changing the search or filters.</p></td></tr>}</tbody>
            </table></div>
            <footer className="flex flex-col gap-3 border-t border-zinc-100 px-5 py-3 text-[10px] font-medium text-zinc-400 sm:flex-row sm:items-center sm:justify-between"><span>{transactionsQuery.isFetching && transactionsQuery.data ? 'Updating… · ' : ''}Showing {transactions.length ? Math.min((page - 1) * pageSize + 1, total) : 0}–{Math.min(page * pageSize, total)} of {total} user wallet transactions</span>{pages > 1 && <div className="flex items-center justify-between gap-3 sm:justify-end"><span>Page {page} of {pages}</span><button type="button" aria-label="Previous page" disabled={page <= 1} onClick={() => setPage((current) => current - 1)} className="rounded-lg border border-zinc-200 px-3 py-1.5 disabled:opacity-40">Previous</button><button type="button" aria-label="Next page" disabled={page >= pages} onClick={() => setPage((current) => current + 1)} className="rounded-lg border border-zinc-200 px-3 py-1.5 disabled:opacity-40">Next</button></div>}</footer>
        </section>
        <WalletCustomDateModal isOpen={isDateModalOpen} dates={draftDates} onDatesChange={setDraftDates} onClose={closeDateModal} onApply={(dates) => { setCustomDates(dates); setDateFilter('custom'); setPage(1); setIsDateModalOpen(false); }} />
        {selectedTransactionId && <UserWalletTransactionDetailsPanel key={selectedTransactionId} transactionId={selectedTransactionId} onClose={() => setSelectedTransactionId(null)} />}
    </div>;
};

export default UserWallet;
