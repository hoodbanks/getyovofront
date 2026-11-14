import { useEffect, useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Eye, Loader2, Search, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../../api/api';
import { useAuthStore } from '../../../store/useAuthStore';
import UserWalletPanel from '../../../components/admin/wallet/UserWalletPanel';
import { formatNaira, USER_WALLET_PAGE_SIZE } from './userWalletUtils';

const UserWalletBalances = () => {
    const token = useAuthStore((state) => state.accessToken);
    const [search, setSearch] = useState('');
    const [query, setQuery] = useState('');
    const [page, setPage] = useState(1);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        const timer = window.setTimeout(() => { setQuery(search.trim()); setPage(1); }, 350);
        return () => window.clearTimeout(timer);
    }, [search]);

    const balancesQuery = useQuery({
        queryKey: ['user-wallet-balances', page, query],
        queryFn: () => {
            const params = new URLSearchParams({ page: String(page), limit: String(USER_WALLET_PAGE_SIZE) });
            if (query) params.set('query', query);
            return api.get(`/superadmin/user-wallets?${params.toString()}`, token);
        },
        placeholderData: (previousData) => previousData,
    });
    const result = balancesQuery.data?.data || {};
    const rows = result.data || [];
    const total = result.total || 0;
    const pageSize = result.pageSize || USER_WALLET_PAGE_SIZE;
    const pages = Math.max(1, Math.ceil(total / pageSize));

    return <div className="mx-auto w-full max-w-[1600px] space-y-5 pb-10">
        <Link to="/admin/wallet/user" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-800 hover:text-emerald-950"><ArrowLeft size={16} /> Back to User Wallet</Link>
        <section className="overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm">
            <header className="flex flex-col gap-4 border-b border-zinc-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"><div><p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Spending wallets</p><h1 className="mt-1 text-lg font-bold text-zinc-900">User Wallet Balances</h1><p className="mt-1 text-sm text-zinc-500">Search customers and open an individual wallet to review its balance and activity.</p></div><span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[10px] font-semibold text-emerald-800">{total.toLocaleString()} customers</span></header>
            <div className="border-b border-zinc-100 p-4 sm:p-5"><label className="relative block w-full sm:max-w-md"><span className="sr-only">Search customers or user ID</span><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} maxLength={100} placeholder="Search customer or user ID" className="w-full rounded-xl bg-zinc-100 py-3 pl-10 pr-4 text-sm outline-none transition focus:ring-2 focus:ring-emerald-500/20" /></label></div>
            <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead className="border-b border-zinc-100 bg-zinc-50/80"><tr>{['Customer', 'User ID', 'Current balance', 'Total top-ups', 'Action'].map((heading) => <th key={heading} className={`whitespace-nowrap px-4 py-4 text-[10px] font-bold uppercase tracking-wider text-zinc-400 sm:px-6 ${heading === 'Action' ? 'text-right' : ''}`}>{heading}</th>)}</tr></thead>
                <tbody className="divide-y divide-zinc-50">{balancesQuery.isLoading && !balancesQuery.data ? <tr><td colSpan="5" className="px-5 py-16 text-center"><Loader2 className="mx-auto animate-spin text-emerald-700" /><p className="mt-2 text-xs text-zinc-500">Loading user wallet balances…</p></td></tr> : balancesQuery.error ? <tr><td colSpan="5" className="px-6 py-12 text-center" role="alert"><p className="text-sm font-semibold text-rose-700">{balancesQuery.error.message || 'Could not load user wallet balances.'}</p><button type="button" onClick={() => balancesQuery.refetch()} className="mt-3 rounded-lg border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50">Try again</button></td></tr> : rows.length ? rows.map((wallet) => <tr key={wallet.userId} className="transition-colors hover:bg-zinc-50/60">
                    <td className="whitespace-nowrap px-4 py-4 text-sm font-bold text-zinc-900 sm:px-6">{wallet.name || [wallet.firstname, wallet.lastname].filter(Boolean).join(' ') || wallet.userId}</td><td className="whitespace-nowrap px-4 py-4 text-xs font-medium text-zinc-500 sm:px-6">{wallet.userId}</td><td className="whitespace-nowrap px-4 py-4 text-sm font-bold text-zinc-900 sm:px-6">{formatNaira(wallet.balanceNaira, wallet.balanceKobo)}</td><td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-zinc-700 sm:px-6">{formatNaira(wallet.totalTopUpsNaira, wallet.totalTopUpsKobo)}</td><td className="whitespace-nowrap px-4 py-4 text-right sm:px-6"><button type="button" onClick={() => setSelectedUser({ userId: wallet.userId, customerName: wallet.name || [wallet.firstname, wallet.lastname].filter(Boolean).join(' ') })} aria-label={`View ${wallet.name || wallet.userId}'s wallet`} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-50"><Eye size={15} /> View wallet</button></td>
                </tr>) : <tr><td colSpan="5" className="px-6 py-16 text-center"><Wallet className="mx-auto text-zinc-300" size={26} /><p className="mt-3 text-sm font-semibold text-zinc-800">No customer wallets found</p><p className="mt-1 text-xs text-zinc-500">{query ? 'Try another name, email, phone, or user ID.' : 'Customers with a spending wallet will appear here.'}</p></td></tr>}</tbody>
            </table></div>
            <footer className="flex flex-col gap-3 border-t border-zinc-100 px-4 py-3 text-[10px] font-medium text-zinc-400 sm:flex-row sm:items-center sm:justify-between sm:px-6"><span>{balancesQuery.isFetching && balancesQuery.data ? 'Updating… · ' : ''}Showing {rows.length ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, total)} of {total} user wallets</span>{pages > 1 && <div className="flex items-center justify-between gap-3 sm:justify-end"><span>Page {page} of {pages}</span><button type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)} aria-label="Previous page" className="rounded-lg border border-zinc-200 p-2 text-zinc-700 disabled:opacity-40"><ChevronLeft size={15} /></button><button type="button" disabled={page >= pages} onClick={() => setPage((current) => current + 1)} aria-label="Next page" className="rounded-lg border border-zinc-200 p-2 text-zinc-700 disabled:opacity-40"><ChevronRight size={15} /></button></div>}</footer>
        </section>
        {selectedUser && <UserWalletPanel key={selectedUser.userId} userId={selectedUser.userId} initialName={selectedUser.customerName} onClose={() => setSelectedUser(null)} />}
    </div>;
};

export default UserWalletBalances;
