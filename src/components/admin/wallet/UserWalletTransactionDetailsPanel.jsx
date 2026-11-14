import { Loader2, RefreshCw, UserRound, WalletCards, X } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '../../../api/api';
import { useAuthStore } from '../../../store/useAuthStore';
import { formatShortDateTime } from '../../../utils/formatters';
import { canRefreshTopUpStatus, formatNaira, signedNairaAmount, transactionStatusLabel, transactionTypeLabel } from '../../../pages/admin/wallet/userWalletUtils';

const Detail = ({ label, value }) => <div className="min-w-0 rounded-lg bg-zinc-50 px-3 py-2.5"><p className="text-[9px] font-semibold uppercase tracking-wide text-zinc-500">{label}</p><p className="mt-1 break-words text-xs font-semibold text-zinc-900">{value || 'Not available'}</p></div>;

const UserWalletTransactionDetailsPanel = ({ transactionId, onClose }) => {
    const token = useAuthStore((state) => state.accessToken);
    const queryClient = useQueryClient();
    const query = useQuery({
        queryKey: ['user-wallet-transaction-detail', transactionId],
        queryFn: () => api.get(`/superadmin/user-wallet/transactions/${encodeURIComponent(transactionId)}`, token),
        enabled: Boolean(transactionId),
    });
    const refreshStatus = useMutation({
        mutationFn: () => api.post(`/superadmin/user-wallet/transactions/${encodeURIComponent(transactionId)}/refresh`, {}, token),
        onSuccess: async () => {
            toast.success('Payment status refreshed.');
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['user-wallet-transaction-detail', transactionId] }),
                queryClient.invalidateQueries({ queryKey: ['user-wallet-summary'] }),
                queryClient.invalidateQueries({ queryKey: ['user-wallet-transactions'] }),
            ]);
        },
        onError: (error) => toast.error(error.message || 'Could not refresh payment status.'),
    });
    const transaction = query.data?.data;
    const normalizedStatus = String(transaction?.status || '').toUpperCase();
    const statusTone = ['SUCCEEDED', 'SUCCESSFUL'].includes(normalizedStatus)
        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
        : ['FAILED', 'ABANDONED', 'EXPIRED'].includes(normalizedStatus)
            ? 'border-rose-200 bg-rose-50 text-rose-800'
            : 'border-amber-200 bg-amber-50 text-amber-800';

    return <div className="fixed inset-0 z-[120] overflow-hidden"><button type="button" aria-label="Close transaction details" onClick={onClose} className="absolute inset-0 h-full w-full bg-black/50" />
        <aside role="dialog" aria-modal="true" aria-labelledby="user-wallet-transaction-title" className="absolute inset-y-0 right-0 flex h-full w-full max-w-xl flex-col bg-white shadow-2xl">
            <header className="flex shrink-0 items-center justify-between gap-4 border-b border-white/10 bg-[#0F172B] px-5 py-5 text-white sm:px-6"><div className="flex min-w-0 items-center gap-3"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-300"><WalletCards size={21} /></div><div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">Spending wallet transaction</p><h2 id="user-wallet-transaction-title" className="mt-1 truncate text-base font-bold text-white">Transaction details</h2><p className="mt-1 truncate text-xs text-slate-300">{transaction?.customerName || transactionId}</p></div></div><button type="button" onClick={onClose} aria-label="Close transaction details" className="shrink-0 rounded-lg p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"><X size={20} /></button></header>
            <div className="flex-1 overflow-y-auto bg-zinc-50/70 p-4 custom-scrollbar sm:p-5">{query.isLoading ? <div className="flex min-h-64 flex-col items-center justify-center text-center"><Loader2 className="animate-spin text-emerald-700" /><p className="mt-3 text-sm font-semibold text-zinc-800">Loading transaction details…</p><p className="mt-1 text-xs text-zinc-500">Fetching the wallet transaction record.</p></div> : query.error ? <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"><p>{query.error.message || 'Could not load transaction details.'}</p><button type="button" onClick={() => query.refetch()} className="mt-3 font-bold underline">Retry</button></div> : transaction ? <div className="space-y-4">
                <section className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Transaction amount</p><p className={`mt-2 text-2xl font-bold ${Number(transaction?.amountKobo || 0) < 0 ? 'text-rose-700' : 'text-zinc-900'}`}>{signedNairaAmount(transaction)}</p></div><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800"><WalletCards size={18} /></span></div><div className="mt-4 flex flex-wrap items-center gap-2"><span className="rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[10px] font-semibold text-zinc-700">{transactionTypeLabel(transaction.type)}</span><span className={`rounded-lg border px-2.5 py-1 text-[10px] font-semibold ${statusTone}`}>{transactionStatusLabel(transaction.status)}</span></div></section>
                <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white"><h3 className="flex items-center gap-2 border-b border-zinc-100 px-4 py-3.5 text-sm font-bold text-zinc-900"><UserRound size={16} className="text-emerald-800" />Customer</h3><div className="grid grid-cols-1 gap-2 p-3 sm:grid-cols-2"><Detail label="Name" value={transaction.customerName} /><Detail label="User ID" value={transaction.userId} /><Detail label="Email" value={transaction.email} /><Detail label="Phone" value={transaction.phonenumber} /></div></section>
                <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
                    <h3 className="border-b border-zinc-100 px-4 py-3.5 text-sm font-bold text-zinc-900">Transaction record</h3>
                    <div className="grid grid-cols-1 gap-2 p-3 sm:grid-cols-2">
                        <Detail label="Transaction ID" value={transaction.transactionId} />
                        <Detail label="Created" value={formatShortDateTime(transaction.createdAt)} />
                        <Detail label="Updated" value={transaction.updatedAt ? formatShortDateTime(transaction.updatedAt) : 'Not available'} />
                        <Detail label="Balance after" value={transaction.balanceAfterKobo == null ? 'Not available' : formatNaira(null, transaction.balanceAfterKobo)} />
                        <Detail label="Related reference" value={transaction.relatedReference} />
                        <Detail label="Order ID" value={transaction.orderId} />
                        <Detail label="Order status" value={transaction.orderStatus} />
                    </div>
                    {transaction.transactionId?.startsWith('TOPUP:') && <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                        <h4 className="text-[10px] font-bold uppercase tracking-wide text-blue-900">Top-up lifecycle and provider observation</h4>
                        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Detail label="Wallet top-up status" value={transaction.topUpStatus} />
                            <Detail label="Latest Paystack observation" value={transaction.providerStatus ? transactionStatusLabel(String(transaction.providerStatus).toUpperCase()) : 'Not checked yet'} />
                            <Detail label="Provider status checked" value={transaction.providerStatusCheckedAt ? formatShortDateTime(transaction.providerStatusCheckedAt) : 'Not available'} />
                            <Detail label="Reconciliation status" value={transaction.reconciliationStatus} />
                        </div>
                        {['FAILED', 'ABANDONED'].includes(String(transaction.providerStatus || '').toUpperCase()) && <p className="mt-3 text-xs leading-5 text-blue-900">This is Paystack’s latest observed status. It does not by itself settle the top-up or change the wallet balance.</p>}
                        {canRefreshTopUpStatus(transaction) && <button type="button" onClick={() => refreshStatus.mutate()} disabled={refreshStatus.isPending} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#1C5E20] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#174D1A] disabled:cursor-wait disabled:opacity-60"><RefreshCw size={14} className={refreshStatus.isPending ? 'animate-spin' : ''} />{refreshStatus.isPending ? 'Refreshing status…' : 'Refresh payment status'}</button>}
                        {refreshStatus.isError && <p role="alert" className="mt-3 text-xs text-rose-700">{refreshStatus.error.message || 'Could not refresh payment status.'}</p>}
                    </div>}
                    {transaction.reconciliationReason && <div className="mt-4 rounded-lg bg-amber-50 p-3"><Detail label="Reconciliation reason" value={transaction.reconciliationReason} /></div>}
                </section>
            </div> : <div className="rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600">Transaction details are unavailable.</div>}</div>
        </aside>
    </div>;
};

export default UserWalletTransactionDetailsPanel;
