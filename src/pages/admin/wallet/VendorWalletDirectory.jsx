import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Building2, Eye, Loader2, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../api/api';
import { useAuthStore } from '../../../store/useAuthStore';
import { formatShortDateTime } from '../../../utils/formatters';
import { WalletCustomDateModal, WalletFilterDropdown } from '../../../components/admin/wallet/WalletControls';
import { VendorActivityDetailsPanel } from './VendorWalletPanels';
import { apiMessage, formatVendorNaira, vendorDateFilters, vendorWalletQuery } from './vendorWalletApi';

const PAGE_SIZE = 20;
const storeStatusText = (value) => value === 'OPEN' || value === 'CLOSED' ? value : 'Not provided';
const ErrorState = ({ error, retry }) => <div role="alert" className="rounded-xl bg-rose-50 p-4 text-sm text-rose-800">{apiMessage(error, 'Could not load Vendor Wallet data.')} <button type="button" onClick={retry} className="ml-2 font-bold underline">Retry</button></div>;

export const VendorWalletDirectory = () => {
    const token = useAuthStore((state) => state.accessToken);
    const [query, setQuery] = useState('');
    const [page, setPage] = useState(1);
    const listQuery = useQuery({ queryKey: ['vendor-wallets', page, query], queryFn: () => { const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) }); if (query.trim()) params.set('query', query.trim()); return api.get(`/superadmin/vendor-wallets?${params}`, token); }, placeholderData: (old) => old });
    const payload = listQuery.data?.data;
    const vendors = payload?.data;
    const total = payload?.total;

    return <div className="mx-auto w-full max-w-[1600px] pb-10">
        <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <header className="flex flex-col gap-4 border-b border-zinc-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div><Link to="/admin/wallet/vendor" className="mb-3 inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 underline underline-offset-4"><ArrowLeft size={13}/>Vendor Wallet dashboard</Link><h1 className="text-base font-bold text-zinc-900">Vendor Wallets</h1><p className="mt-1 text-xs text-zinc-500">Browse vendor identities, addresses, wallet records, and available balances.</p></div>
                <label className="relative block w-full sm:max-w-sm"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"/><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search vendors" className="w-full rounded-xl bg-zinc-100 py-3 pl-10 pr-4 text-sm text-zinc-800 outline-none focus:ring-2 focus:ring-emerald-600/20"/></label>
            </header>
            {listQuery.isLoading ? <div className="flex justify-center py-16"><Loader2 className="animate-spin text-emerald-700"/></div> : listQuery.isError ? <div className="p-5"><ErrorState error={listQuery.error} retry={() => listQuery.refetch()}/></div> : !Array.isArray(vendors) || typeof total !== 'number' ? <p role="alert" className="m-5 rounded-xl bg-rose-50 p-4 text-sm text-rose-800">Unexpected vendor list response; expected data.data and data.total.</p> : vendors.length === 0 ? <div className="px-5 py-16 text-center"><Building2 className="mx-auto text-zinc-300"/><h2 className="mt-3 text-sm font-bold text-zinc-800">No vendors found</h2><p className="mt-1 text-xs text-zinc-500">Try a different search.</p></div> : <div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left"><thead className="border-b border-zinc-100 bg-zinc-50"><tr>{['Store / vendor', 'Address', 'Store status', 'Wallet', 'Available balance', ''].map((heading) => <th key={heading} className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-zinc-500">{heading}</th>)}</tr></thead><tbody className="divide-y divide-zinc-100">{vendors.map((vendor) => { const storeStatus = storeStatusText(vendor.storeStatus); const statusTone = storeStatus === 'OPEN' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : storeStatus === 'CLOSED' ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-zinc-200 bg-zinc-50 text-zinc-500'; return <tr key={vendor.vendorId} className="transition-colors hover:bg-zinc-50"><td className="px-5 py-4"><p className="text-sm font-semibold text-zinc-800">{vendor.storeName || 'Store name not provided'}</p><p className="mt-1 text-xs text-zinc-500">{vendor.ownerName || vendor.vendorName || 'Vendor name not provided'}</p></td><td className="px-5 py-4 text-xs text-zinc-600">{vendor.storeAddress || 'Not provided'}</td><td className="px-5 py-4"><span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold ${statusTone}`}>{storeStatus}</span></td><td className="px-5 py-4 text-xs text-zinc-600">{vendor.walletExists ? 'Wallet exists' : 'No wallet record'}</td><td className="px-5 py-4 text-sm font-semibold text-zinc-800">{vendor.walletExists ? formatVendorNaira(vendor.balanceKobo, vendor.balanceNaira) : '—'}</td><td className="px-5 py-4 text-right"><Link to={`/admin/wallet/vendor/vendors/${encodeURIComponent(vendor.vendorId)}`} className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 underline underline-offset-4">Open wallet <Eye size={13}/></Link></td></tr>; })}</tbody></table></div>}
            {typeof total === 'number' && total > 0 && <footer className="flex items-center justify-between border-t border-zinc-100 px-5 py-3 text-xs text-zinc-500"><span>{total} matching vendors</span><div className="flex items-center gap-2"><button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-lg border border-zinc-200 px-3 py-1.5 text-zinc-600 disabled:opacity-40">Previous</button><span>Page {page}</span><button type="button" disabled={page * PAGE_SIZE >= total} onClick={() => setPage(page + 1)} className="rounded-lg border border-zinc-200 px-3 py-1.5 text-zinc-600 disabled:opacity-40">Next</button></div></footer>}
        </section>
    </div>;
};

export const VendorWalletProfile = () => {
    const { vendorId: encodedId } = useParams();
    const vendorId = decodeURIComponent(encodedId || '');
    const token = useAuthStore((state) => state.accessToken);
    const [page, setPage] = useState(1);
    const [type, setType] = useState('all');
    const [status, setStatus] = useState('all');
    const [dateFilter, setDateFilter] = useState('all_time');
    const [dates, setDates] = useState({ start: '', end: '' });
    const [draftDates, setDraftDates] = useState({ start: '', end: '' });
    const [customDateOpen, setCustomDateOpen] = useState(false);
    const [transactionId, setTransactionId] = useState(null);
    const walletQuery = useQuery({ queryKey: ['vendor-wallet', vendorId], queryFn: () => api.get(`/superadmin/vendor-wallets/${encodeURIComponent(vendorId)}`, token), enabled: Boolean(vendorId) });
    const params = vendorWalletQuery({ page, limit: PAGE_SIZE, vendorId, type, status, dateFilter, from: dates.start, to: dates.end });
    const activityQuery = useQuery({ queryKey: ['vendor-wallet-transactions', vendorId, page, type, status, dateFilter, dates], queryFn: () => api.get(`/superadmin/vendor-wallet/transactions?${params}`, token), enabled: Boolean(vendorId) && (dateFilter !== 'custom' || Boolean(dates.start && dates.end)), placeholderData: (old) => old });
    const wallet = walletQuery.data?.data;
    const activity = activityQuery.data?.data;
    const rows = activity?.data;
    const total = activity?.total;
    const metricCards = [
        ['Available wallet balance', wallet?.balanceKobo, wallet?.balanceNaira, 'border-emerald-300 bg-emerald-50/70'],
        ['Gross order credits', wallet?.totalOrderCreditsKobo, wallet?.totalOrderCreditsNaira, 'border-blue-300 bg-blue-50/60'],
        ['Earnings reversed', wallet?.totalReversalsKobo, wallet?.totalReversalsNaira, 'border-rose-300 bg-rose-50/60'],
        ['Net order earnings', wallet?.netOrderEarningsKobo, wallet?.netOrderEarningsNaira, 'border-purple-300 bg-purple-50/60'],
        ['Completed withdrawals', wallet?.totalWithdrawalsPaidKobo, wallet?.totalWithdrawalsPaidNaira, 'border-cyan-300 bg-cyan-50/60'],
        ['Reserved for withdrawals', wallet?.reservedWithdrawalAmountKobo, wallet?.reservedWithdrawalAmountNaira, 'border-amber-300 bg-amber-50/60'],
    ];
    const setFilter = (setter) => (value) => { setter(value); setPage(1); };

    return <div className="mx-auto w-full max-w-[1600px] space-y-5 pb-10 text-zinc-800">
        <Link to="/admin/wallet/vendor/vendors" className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-800 underline underline-offset-4"><ArrowLeft size={14}/>All vendor wallets</Link>
        {walletQuery.isLoading ? <div className="h-48 animate-pulse rounded-2xl bg-white"/> : walletQuery.isError ? <ErrorState error={walletQuery.error} retry={() => walletQuery.refetch()}/> : !wallet ? <p role="alert" className="rounded-xl bg-rose-50 p-4 text-sm text-rose-800">Unexpected vendor wallet response; expected data to contain vendor and wallet details.</p> : <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start gap-3"><span className="rounded-xl bg-emerald-50 p-3 text-emerald-800"><Building2 size={20}/></span><div className="min-w-0"><h1 className="text-lg font-bold text-zinc-900">{wallet.storeName || 'Store name not provided'}</h1><p className="mt-0.5 text-sm font-medium text-zinc-700">{wallet.ownerName || wallet.vendorName || 'Vendor name not provided'}</p><p className="mt-1 text-xs text-zinc-500">{wallet.storeAddress || 'Address not provided'}</p><p className="mt-1 text-xs text-zinc-600"><span className="font-semibold text-zinc-500">Store status</span> {storeStatusText(wallet.storeStatus)}</p></div></div>
            {wallet.walletExists ? <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">{metricCards.map(([label, kobo, naira, tone]) => <div key={label} className={`min-w-0 rounded-xl border p-4 ${tone}`}><p className="text-[10px] font-bold uppercase tracking-wide text-zinc-600">{label}</p><p className="mt-2 text-lg font-bold text-zinc-900">{formatVendorNaira(kobo, naira)}</p></div>)}</div> : <div className="mt-5 rounded-xl bg-zinc-50 p-5"><p className="font-semibold text-zinc-900">No Vendor Wallet record</p><p className="mt-1 text-xs text-zinc-600">This vendor has no wallet row. A wallet has not been created by this view.</p></div>}
        </section>}
        <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <header className="flex flex-col gap-4 border-b border-zinc-100 p-5 lg:flex-row lg:items-end lg:justify-between"><div><h2 className="text-base font-bold text-zinc-900">Vendor wallet activity</h2><p className="mt-1 text-xs text-zinc-500">Withdrawal requests appear once; open an activity for its ledger lifecycle details.</p></div><div className="grid gap-2 sm:grid-cols-3"><WalletFilterDropdown label="Type" selected={type} options={[{ value: 'all', label: 'All types' }, { value: 'order_credit', label: 'Order credit' }, { value: 'withdrawal', label: 'Withdrawal' }, { value: 'earnings_reversal', label: 'Earnings reversal' }]} onSelect={setFilter(setType)}/><WalletFilterDropdown label="Status" selected={status} options={[{ value: 'all', label: 'All statuses' }, { value: 'successful', label: 'Successful' }, { value: 'pending', label: 'Pending' }, { value: 'processing', label: 'Processing' }, { value: 'failed', label: 'Failed' }, { value: 'declined', label: 'Declined' }]} onSelect={setFilter(setStatus)}/><WalletFilterDropdown label="Date" selected={dateFilter} options={vendorDateFilters} onSelect={(value) => { if (value === 'custom') { setDraftDates(dates); setCustomDateOpen(true); return; } setDateFilter(value); setPage(1); }}/></div></header>
            {activityQuery.isLoading ? <div className="p-5"><Loader2 className="mx-auto animate-spin text-emerald-700"/></div> : activityQuery.isError ? <div className="p-5"><ErrorState error={activityQuery.error} retry={() => activityQuery.refetch()}/></div> : !Array.isArray(rows) || typeof total !== 'number' ? <p role="alert" className="m-5 rounded-xl bg-rose-50 p-4 text-sm text-rose-800">Unexpected activity response; expected data.data and data.total.</p> : rows.length === 0 ? <p className="py-12 text-center text-sm text-zinc-500">No vendor wallet activity matches these filters.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead className="border-b border-zinc-100 bg-zinc-50/80"><tr>{['Activity', 'Date & time', 'Amount', 'Status'].map((heading) => <th key={heading} className="whitespace-nowrap px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500">{heading}</th>)}</tr></thead><tbody className="divide-y divide-zinc-100">{rows.map((row) => {
                const amount = Number.isFinite(row.amountKobo) ? row.amountKobo : Number(row.amountNaira || 0);
                const rowStatus = String(row.status || '').toUpperCase();
                const statusTone = ['SUCCESSFUL', 'COMPLETED'].includes(rowStatus) ? 'bg-emerald-50 text-emerald-700' : ['FAILED', 'DECLINED', 'CANCELLED'].includes(rowStatus) ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-800';
                const displayedAmount = formatVendorNaira(Number.isFinite(row.amountKobo) ? Math.abs(row.amountKobo) : undefined, Number.isFinite(row.amountKobo) ? undefined : Math.abs(Number(row.amountNaira || 0)));
                const activityLabel = row.type === 'earnings_reversal' ? 'Earnings reversal' : row.type?.replaceAll('_', ' ');
                return <tr key={row.transactionId} role="button" tabIndex={0} aria-label={`View ${activityLabel} activity`} onClick={() => setTransactionId(row.transactionId)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setTransactionId(row.transactionId); } }} className="cursor-pointer transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-700"><td className="px-5 py-4"><p className="text-xs font-bold capitalize text-zinc-800">{activityLabel}</p><p className="mt-1 max-w-[320px] truncate text-[10px] text-zinc-500" title={row.transactionId}>{row.transactionId}</p></td><td className="whitespace-nowrap px-5 py-4 text-xs text-zinc-600">{row.createdAt ? formatShortDateTime(row.createdAt) : '—'}</td><td className={`whitespace-nowrap px-5 py-4 text-sm font-bold ${amount < 0 ? 'text-rose-700' : amount > 0 ? 'text-emerald-700' : 'text-zinc-700'}`}>{amount > 0 ? '+' : amount < 0 ? '−' : ''}{displayedAmount}</td><td className="px-5 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusTone}`}>{row.status}</span></td></tr>;
            })}</tbody></table></div>}
            {typeof total === 'number' && total > PAGE_SIZE && <footer className="flex items-center justify-between border-t border-zinc-100 p-4 text-xs text-zinc-500"><span>{total} activities</span><div className="flex gap-2"><button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-lg border border-zinc-200 px-3 py-1.5 text-zinc-600 disabled:opacity-40">Previous</button><span className="px-2 py-2">Page {page}</span><button type="button" disabled={page * PAGE_SIZE >= total} onClick={() => setPage(page + 1)} className="rounded-lg border border-zinc-200 px-3 py-1.5 text-zinc-600 disabled:opacity-40">Next</button></div></footer>}
        </section>
        <WalletCustomDateModal isOpen={customDateOpen} dates={draftDates} onDatesChange={setDraftDates} onClose={() => setCustomDateOpen(false)} onApply={(selection) => { setDates(selection); setDateFilter('custom'); setPage(1); setCustomDateOpen(false); }}/>
        <VendorActivityDetailsPanel transactionId={transactionId} onClose={() => setTransactionId(null)}/>
    </div>;
};
