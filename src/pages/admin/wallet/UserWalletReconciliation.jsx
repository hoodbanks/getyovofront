import { useState } from 'react';
import { ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight, Loader2, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '../../../api/api';
import { useAuthStore } from '../../../store/useAuthStore';
import { formatShortDateTime } from '../../../utils/formatters';
import { WalletFilterDropdown } from '../../../components/admin/wallet/WalletControls';
import { formatNaira } from './userWalletUtils';

const statusOptions = [
    { value: 'REVIEW_REQUIRED', label: 'Review required' },
    { value: 'REFUNDED', label: 'Refunded' },
    { value: 'CREDITED', label: 'Credited' },
];
const creditEligibleReasons = new Set(['EXPIRED', 'WALLET_LIMIT', 'PROOF_INCOMPLETE']);

const UserWalletReconciliation = () => {
    const token = useAuthStore((state) => state.accessToken);
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState('REVIEW_REQUIRED');
    const [reviewCase, setReviewCase] = useState(null);
    const [resolution, setResolution] = useState('CREDITED');
    const [note, setNote] = useState('');
    const [providerRefundReference, setProviderRefundReference] = useState('');

    const query = useQuery({
        queryKey: ['user-wallet-topup-reconciliation', page, status],
        queryFn: () => {
            const params = new URLSearchParams({ page: String(page) });
            if (status) params.set('status', status);
            return api.get(`/superadmin/wallet-top-ups/reconciliation?${params.toString()}`, token);
        },
    });

    const resolve = useMutation({
        mutationFn: ({ caseId, body }) => api.post(`/superadmin/wallet-top-ups/reconciliation/${encodeURIComponent(caseId)}/resolve`, body, token),
        onSuccess: async () => {
            toast.success('Reconciliation case resolved.');
            setReviewCase(null);
            setNote('');
            setProviderRefundReference('');
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['user-wallet-topup-reconciliation'] }),
                queryClient.invalidateQueries({ queryKey: ['user-wallet-summary'] }),
                queryClient.invalidateQueries({ queryKey: ['user-wallet-transactions'] }),
            ]);
        },
        onError: (error) => toast.error(error.message || 'Could not resolve reconciliation case.'),
    });

    const payload = query.data?.data;
    const rows = payload?.data;
    const meta = payload?.meta;
    const responseShapeError = !query.isLoading && !query.error && (!Array.isArray(rows) || !meta || ['page', 'pageSize', 'total', 'totalPages'].some((field) => typeof meta[field] !== 'number'));
    const total = meta?.total ?? 0;
    const totalPages = meta?.totalPages ?? 1;

    const openReview = (item) => {
        setReviewCase(item);
        setResolution('CREDITED');
        setNote('');
        setProviderRefundReference('');
    };

    const submitResolution = () => {
        const trimmedNote = note.trim();
        const trimmedReference = providerRefundReference.trim();
        if (trimmedNote.length < 8 || trimmedNote.length > 500) return toast.error('The note must be 8–500 characters after trimming.');
        if (resolution === 'REFUNDED' && !/^\d+$/.test(trimmedReference)) return toast.error('Enter the numeric Paystack refund reference for the refund already processed.');
        if (resolution === 'CREDITED' && !creditEligibleReasons.has(String(reviewCase?.reason || '').toUpperCase())) {
            return toast.error('This reason is not eligible for credit.');
        }
        if (!reviewCase?.id) return toast.error('This reconciliation case is missing its case ID.');

        resolve.mutate({
            caseId: reviewCase.id,
            body: {
                resolution,
                note: trimmedNote,
                ...(resolution === 'REFUNDED' ? { providerRefundReference: trimmedReference } : {}),
            },
        });
    };

    return <div className="mx-auto w-full max-w-[1600px] space-y-5 pb-10">
        <Link to="/admin/wallet/user" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-800 hover:text-emerald-950"><ArrowLeft size={16} /> Back to User Wallet</Link>
        <section className="overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm">
            <header className="flex flex-col gap-4 border-b border-zinc-100 p-5 lg:flex-row lg:items-center lg:justify-between sm:p-6">
                <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Customer spending wallet</p>
                    <h1 className="mt-1 text-lg font-bold text-zinc-900">Payment Reconciliation</h1>
                    <p className="mt-1 text-sm text-zinc-500">Resolve only payments the backend has placed in review. Failed or abandoned Paystack observations are handled separately.</p>
                </div>
                <div className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-end gap-3 lg:w-auto lg:grid-cols-[12rem_auto]">
                    <WalletFilterDropdown label="Case status" selected={status} options={[{ value: '', label: 'All cases' }, ...statusOptions]} onSelect={(value) => { setStatus(value); setPage(1); }} fullWidth />
                    <button type="button" onClick={() => query.refetch()} disabled={query.isFetching} className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-zinc-200 px-4 py-2.5 text-xs font-bold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"><RefreshCw size={14} className={query.isFetching ? 'animate-spin' : ''} /> Refresh list</button>
                </div>
            </header>
            <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px] text-left">
                    <thead className="border-b border-zinc-100 bg-zinc-50/80"><tr>{['Customer ID', 'Case / top-up', 'Payment reference', 'Amount', 'Reason / status', 'Detected', 'Action'].map((heading) => <th key={heading} className={`whitespace-nowrap px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-zinc-400 ${heading === 'Action' ? 'text-center' : ''}`}>{heading}</th>)}</tr></thead>
                    <tbody className="divide-y divide-zinc-50">
                        {query.isLoading ? <tr><td colSpan="7" className="px-5 py-16 text-center"><Loader2 className="mx-auto animate-spin text-emerald-700" /><p className="mt-2 text-xs text-zinc-500">Loading reconciliation cases…</p></td></tr>
                            : query.error ? <tr><td colSpan="7" className="px-5 py-14 text-center"><p role="alert" className="text-sm text-rose-700">{query.error.message}</p><button type="button" onClick={() => query.refetch()} className="mt-3 rounded-lg border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700">Try again</button></td></tr>
                                : responseShapeError ? <tr><td colSpan="7" className="px-5 py-14 text-center"><p role="alert" className="text-sm text-rose-700">The reconciliation response is missing its expected data or pagination metadata.</p></td></tr>
                                    : rows.length ? rows.map((item) => <tr key={item.id} className="hover:bg-zinc-50/60">
                                        <td className="px-5 py-4 text-xs font-semibold text-zinc-700">{item.topUp?.userId || 'Not available'}</td>
                                        <td className="px-5 py-4 text-xs text-zinc-700">{item.id}<p className="mt-1 text-[10px] text-zinc-400">Top-up {item.topUpId}</p></td>
                                        <td className="px-5 py-4 text-xs text-zinc-700">{item.paymentReference || 'Not available'}</td>
                                        <td className="px-5 py-4 text-sm font-semibold text-zinc-800">{formatNaira(null, item.amountKobo)}<p className="mt-1 text-[10px] text-zinc-400">{item.currency}</p></td>
                                        <td className="px-5 py-4 text-xs text-zinc-600">{item.reason}<p className="mt-1 text-[10px] font-semibold text-amber-800">{item.status}</p></td>
                                        <td className="whitespace-nowrap px-5 py-4 text-xs text-zinc-500">{item.detectedAt ? formatShortDateTime(item.detectedAt) : 'Not available'}</td>
                                        <td className="whitespace-nowrap px-5 py-4 text-center">{item.status === 'REVIEW_REQUIRED' && <button type="button" onClick={() => openReview(item)} className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-amber-50 px-3 py-2 text-xs font-bold text-amber-900 hover:bg-amber-100"><CheckCircle2 size={14} /> Review</button>}</td>
                                    </tr>) : <tr><td colSpan="7" className="px-6 py-16 text-center"><CheckCircle2 className="mx-auto text-emerald-600" size={28} /><p className="mt-3 text-sm font-semibold text-zinc-800">No payment cases found</p><p className="mt-1 text-xs text-zinc-500">Failed or abandoned provider observations are not reconciliation cases.</p></td></tr>}
                    </tbody>
                </table>
            </div>
            <footer className="flex items-center justify-between border-t border-zinc-100 px-5 py-3 text-[10px] text-zinc-500"><span>{rows ? `${rows.length} cases · ${total} total` : 'Payment cases'}</span>{totalPages > 1 && <div className="flex items-center gap-2"><span>Page {meta.page} of {totalPages}</span><button type="button" aria-label="Previous page" disabled={meta.page <= 1} onClick={() => setPage((current) => current - 1)} className="rounded-lg border border-zinc-200 p-2 disabled:opacity-40"><ChevronLeft size={14} /></button><button type="button" aria-label="Next page" disabled={meta.page >= totalPages} onClick={() => setPage((current) => current + 1)} className="rounded-lg border border-zinc-200 p-2 disabled:opacity-40"><ChevronRight size={14} /></button></div>}</footer>
        </section>
        {reviewCase && <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/50 p-4" onMouseDown={(event) => event.target === event.currentTarget && setReviewCase(null)}>
            <section role="dialog" aria-modal="true" aria-labelledby="wallet-reconciliation-review-title" className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
                <header className="border-b border-zinc-100 p-5"><h2 id="wallet-reconciliation-review-title" className="text-base font-bold text-zinc-900">Resolve payment review</h2><p className="mt-1 text-xs text-zinc-500">Customer {reviewCase.topUp?.userId} · Case {reviewCase.id}</p></header>
                <div className="space-y-4 p-5">
                    <div className="grid grid-cols-1 gap-2">
                        <button type="button" aria-pressed={resolution === 'CREDITED'} disabled={!creditEligibleReasons.has(String(reviewCase.reason || '').toUpperCase())} onClick={() => setResolution('CREDITED')} className={`w-full whitespace-nowrap rounded-lg border px-3 py-2.5 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-40 ${resolution === 'CREDITED' ? 'border-emerald-700 bg-emerald-50 text-emerald-900' : 'border-zinc-200 text-zinc-600'}`}>Credit after verification</button>
                        <button type="button" aria-pressed={resolution === 'REFUNDED'} onClick={() => setResolution('REFUNDED')} className={`w-full whitespace-nowrap rounded-lg border px-3 py-2.5 text-xs font-bold ${resolution === 'REFUNDED' ? 'border-emerald-700 bg-emerald-50 text-emerald-900' : 'border-zinc-200 text-zinc-600'}`}>Refund already processed</button>
                    </div>
                    {!creditEligibleReasons.has(String(reviewCase.reason || '').toUpperCase()) && <p className="rounded-lg bg-rose-50 p-3 text-xs text-rose-800">Reason {reviewCase.reason} is not eligible for credit. The backend will re-verify the exact NGN amount before crediting.</p>}
                    <label className="block text-xs font-semibold text-zinc-700">Resolution note (8–500 characters)<textarea value={note} onChange={(event) => setNote(event.target.value)} maxLength={500} rows={3} className="mt-2 w-full rounded-xl border border-zinc-200 p-3 text-sm outline-none focus:border-emerald-600" /></label>
                    {resolution === 'REFUNDED' && <><label className="block text-xs font-semibold text-zinc-700">Numeric Paystack refund reference<input inputMode="numeric" value={providerRefundReference} onChange={(event) => setProviderRefundReference(event.target.value)} className="mt-2 w-full rounded-xl border border-zinc-200 p-3 text-sm outline-none focus:border-emerald-600" /></label><p className="rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-900">Only confirm this after processing the refund in Paystack. This screen does not initiate refunds.</p></>}
                    <div className="flex justify-end gap-2"><button type="button" onClick={() => setReviewCase(null)} className="rounded-lg border border-zinc-200 px-4 py-2.5 text-xs font-bold text-zinc-600">Cancel</button><button type="button" onClick={submitResolution} disabled={resolve.isPending || (resolution === 'CREDITED' && !creditEligibleReasons.has(String(reviewCase.reason || '').toUpperCase()))} className="rounded-lg bg-[#1C5E20] px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50">{resolve.isPending ? 'Saving…' : 'Save resolution'}</button></div>
                </div>
            </section>
        </div>}
    </div>;
};

export default UserWalletReconciliation;
