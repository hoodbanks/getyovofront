import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Building2, ChevronLeft, Loader2, RotateCw, Search, Wallet, X } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '../../../api/api';
import { useAuthStore } from '../../../store/useAuthStore';
import { formatShortDateTime } from '../../../utils/formatters';
import { WalletCustomDateModal, WalletFilterDropdown } from '../../../components/admin/wallet/WalletControls';
import { apiMessage, formatVendorNaira, idempotencyKey, vendorDateFilters } from './vendorWalletApi';

const getData = (response) => response?.data;
const Detail = ({ label, value, mono = false }) => <div className="min-w-0 rounded-lg bg-zinc-50 px-3 py-2.5"><dt className="text-[9px] font-semibold uppercase tracking-wide text-zinc-500">{label}</dt><dd className={`mt-1 break-words text-xs font-semibold text-zinc-900 ${mono ? 'font-mono tracking-wide' : ''}`}>{value ?? 'Not provided'}</dd></div>;
const ErrorMessage = ({ error, retry }) => <div role="alert" className="rounded-xl bg-rose-50 p-4 text-sm text-rose-800">{apiMessage(error, 'Could not load vendor wallet data.')} <button type="button" onClick={retry} className="ml-2 font-bold underline">Retry</button></div>;
const PageControl = ({ page, total, limit, onPage }) => <div className="flex items-center justify-between border-t border-zinc-100 px-5 py-3 text-xs text-zinc-500"><span>Page {page} · {total} requests</span><div className="flex gap-2"><button type="button" disabled={page <= 1} onClick={() => onPage(page - 1)} className="rounded-lg border px-3 py-1.5 disabled:opacity-40">Previous</button><button type="button" disabled={page * limit >= total} onClick={() => onPage(page + 1)} className="rounded-lg border px-3 py-1.5 disabled:opacity-40">Next</button></div></div>;

const Section = ({ title, children }) => <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white"><h3 className="border-b border-zinc-100 px-4 py-3.5 text-sm font-bold text-zinc-900">{title}</h3><div className="p-3">{children}</div></section>;
const DetailsGrid = ({ children }) => <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">{children}</dl>;
const EventList = ({ title, events, review = false }) => <Section title={title}>{events.length ? <div className="space-y-3">{events.map((event) => <div key={event.id} className="rounded-lg bg-zinc-50 p-3"><p className="text-xs font-bold">{review ? `${event.priorStatus || '—'} → ${event.newStatus || '—'}` : event.type}</p><p className="mt-1 text-[11px] text-zinc-500">{event.createdAt ? formatShortDateTime(event.createdAt) : 'Time not provided'}{event.reason ? ` · ${event.reason}` : ''}</p>{!review && <p className="mt-2 text-[11px] text-zinc-600">Amount {formatVendorNaira(event.amountKobo)} · Change {formatVendorNaira(event.deltaKobo)} · Balance after {formatVendorNaira(event.balanceAfterKobo)}</p>}{review && event.bankTransferReference && <p className="mt-1 text-[11px] text-zinc-600">Transfer reference: {event.bankTransferReference}</p>}</div>)}</div> : <p className="text-xs text-zinc-500">No {review ? 'review' : 'ledger'} events recorded.</p>}</Section>;

export const VendorActivityDetailsPanel = ({ transactionId, onClose }) => {
    const token = useAuthStore((state) => state.accessToken);
    const client = useQueryClient();
    const query = useQuery({ queryKey: ['vendor-wallet-transaction-detail', transactionId], queryFn: () => api.get(`/superadmin/vendor-wallet/transactions/${encodeURIComponent(transactionId)}`, token), enabled: Boolean(transactionId) });
    useEffect(() => { if (!transactionId) return undefined; const currentId = transactionId; return () => client.removeQueries({ queryKey: ['vendor-wallet-transaction-detail', currentId], exact: true }); }, [transactionId, client]);
    if (!transactionId) return null;
    const transaction = getData(query.data);
    const valid = transaction && transaction.transactionId === transactionId && Array.isArray(transaction.ledgerEvents) && Array.isArray(transaction.reviewEvents);
    const isWithdrawal = transaction?.type === 'WITHDRAWAL' || transaction?.withdrawalId;
    return createPortal(
        <div className="fixed inset-0 z-[120] h-[100dvh] w-screen overflow-hidden">
            <button type="button" aria-label="Close vendor activity details" onClick={onClose} className="absolute inset-0 bg-black/50" />
            <aside role="dialog" aria-modal="true" aria-labelledby="vendor-activity-heading" className="absolute inset-y-0 right-0 flex h-full w-full max-w-xl flex-col bg-white shadow-2xl">
                <header className="flex shrink-0 items-center justify-between gap-4 border-b border-white/10 bg-[#0F172B] px-5 py-5 sm:px-6">
                    <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-emerald-200/20 bg-emerald-400/10 text-emerald-300"><Wallet size={21} /></span>
                        <div className="min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">Vendor wallet activity</p>
                            <h2 id="vendor-activity-heading" className="mt-1 truncate text-base font-bold text-white">Activity details</h2>
                            <p className="mt-1 truncate text-xs text-slate-300">{transaction?.storeName || transactionId}</p>
                        </div>
                    </div>
                    <button type="button" aria-label="Close vendor activity details" onClick={onClose} className="shrink-0 rounded-lg p-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"><X size={19} /></button>
                </header>
                <div className="flex-1 overflow-y-auto bg-zinc-50/70 p-4 sm:p-5">
                    {query.isLoading ? <div className="flex min-h-64 flex-col items-center justify-center text-center"><Loader2 className="animate-spin text-emerald-700" /><p className="mt-3 text-sm font-semibold text-zinc-800">Loading activity details…</p></div>
                        : query.isError ? <ErrorMessage error={query.error} retry={() => query.refetch()} />
                            : !valid ? <div role="alert" className="rounded-xl bg-rose-50 p-4 text-sm text-rose-800">Unexpected response from GET /superadmin/vendor-wallet/transactions/{'{transactionId}'}; expected the documented detail fields and ledgerEvents/reviewEvents arrays.</div>
                                : <div className="space-y-4">
                                    <section className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-5">
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div><p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">Activity amount</p><p className={`mt-2 text-2xl font-bold ${Number(transaction.amountKobo) < 0 ? 'text-rose-700' : 'text-zinc-900'}`}>{formatVendorNaira(transaction.amountKobo, transaction.amountNaira)} <span className="text-sm font-semibold text-zinc-500">{transaction.currency || 'NGN'}</span></p></div>
                                            <div className="flex flex-wrap gap-2"><span className="rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[10px] font-semibold text-zinc-700">{transaction.type}</span><span className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-800">{transaction.status}</span></div>
                                        </div>
                                    </section>
                                    <Section title="Activity"><DetailsGrid><Detail label="Transaction ID" value={transaction.transactionId} mono /><Detail label="Type" value={transaction.type} /><Detail label="Status" value={transaction.status} /><Detail label="Amount" value={`${formatVendorNaira(transaction.amountKobo, transaction.amountNaira)} ${transaction.currency || 'NGN'}`} /><Detail label="Store" value={transaction.storeName} /><Detail label="Vendor / owner" value={transaction.ownerName} /><Detail label="Email" value={transaction.email} /><Detail label="Phone" value={transaction.phonenumber} /><Detail label="Date" value={transaction.createdAt ? formatShortDateTime(transaction.createdAt) : null} /><Detail label="Related reference" value={transaction.relatedReference} /><Detail label="Balance change" value={formatVendorNaira(transaction.deltaKobo)} /><Detail label="Balance after" value={formatVendorNaira(transaction.balanceAfterKobo)} /><Detail label="Reason" value={transaction.reason} /></DetailsGrid></Section>
                                    {(transaction.orderId || transaction.orderCode || transaction.orderStatus) && <Section title="Related order"><DetailsGrid><Detail label="Order ID" value={transaction.orderId} /><Detail label="Order code" value={transaction.orderCode} /><Detail label="Order status" value={transaction.orderStatus} /></DetailsGrid></Section>}
                                    {isWithdrawal && <Section title="Withdrawal summary"><DetailsGrid><Detail label="Withdrawal reference" value={transaction.withdrawalReference} /><Detail label="Withdrawal status" value={transaction.withdrawalStatus} /><Detail label="Bank" value={transaction.bankName} /><Detail label="Account name" value={transaction.accountName} /><Detail label="Account number (masked)" value={transaction.accountNumber} mono /><Detail label="Bank transfer reference" value={transaction.bankTransferReference} /></DetailsGrid><p className="mt-3 text-xs leading-5 text-zinc-500">Bank details here are masked. Open the audited withdrawal review to view the full account number.</p>{transaction.payoutDetailPath && <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('vendor-wallet-open-withdrawal', { detail: transaction.withdrawalId }))} className="mt-3 cursor-pointer text-xs font-bold text-emerald-800 underline underline-offset-4">Open withdrawal review</button>}</Section>}
                                    <EventList title="Ledger events" events={transaction.ledgerEvents} />
                                    <EventList title="Review history" events={transaction.reviewEvents} review />
                                </div>}
                </div>
            </aside>
        </div>,
        document.body,
    );
};

export const VendorNotificationRecoveryPanel = ({ isOpen, onClose }) => {
    const token = useAuthStore((state) => state.accessToken);
    const client = useQueryClient();
    const [kind, setKind] = useState('email');
    const [page, setPage] = useState(1);
    const endpoint = kind === 'email' ? '/superadmin/withdrawals/notices' : '/superadmin/withdrawals/status-notices';
    const queryKey = ['vendor-notification-recovery', kind, page];
    const query = useQuery({ queryKey, queryFn: () => api.get(`${endpoint}?page=${page}&limit=20`, token), enabled: isOpen });
    const result = query.data?.data;
    const rows = result?.data;
    const validRows = Array.isArray(rows) && rows.every((row) => kind === 'email'
        ? typeof row.withdrawalId === 'string' && typeof row.withdrawalReference === 'string' && typeof row.status === 'string' && typeof row.attempts === 'number' && typeof row.exhausted === 'boolean'
        : typeof row.id === 'string' && typeof row.withdrawalReference === 'string' && typeof row.status === 'string' && typeof row.channel === 'string' && typeof row.attempts === 'number');
    const valid = validRows && typeof result?.total === 'number';
    const mutation = useMutation({ mutationFn: (row) => {
        const id = kind === 'email' ? row.withdrawalId : row.id;
        const path = kind === 'email' ? `/superadmin/withdrawals/notices/${encodeURIComponent(id)}/requeue` : `/superadmin/withdrawals/status-notices/${encodeURIComponent(id)}/requeue`;
        return api.post(path, undefined, token);
    }, onSuccess: async (response) => { toast.success(response?.message || 'Notification queued for retry.'); await client.invalidateQueries({ queryKey: ['vendor-notification-recovery'] }); }, onError: (error) => toast.error(apiMessage(error, 'Could not queue this notification.')) });
    if (!isOpen) return null;
    return createPortal(<div className="fixed inset-0 z-[120] h-[100dvh] w-screen overflow-hidden"><button type="button" aria-label="Close notification recovery" onClick={onClose} className="absolute inset-0 bg-black/50"/><aside role="dialog" aria-modal="true" aria-labelledby="notification-recovery-heading" className="absolute inset-y-0 right-0 flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl"><header className="flex items-center justify-between border-b border-white/10 bg-[#0F172B] p-5 text-white"><div><p className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">Vendor wallets</p><h2 id="notification-recovery-heading" className="mt-1 text-base font-bold text-white">Notification delivery recovery</h2><p className="mt-1 text-xs text-slate-300">Requeue retries delivery through the background worker; it does not change a withdrawal or move money.</p></div><button type="button" aria-label="Close notification recovery" onClick={onClose} className="rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white"><X size={19}/></button></header><div className="flex gap-2 border-b p-4"><button type="button" onClick={() => { setKind('email'); setPage(1); }} className={`rounded-full px-4 py-2 text-xs font-bold ${kind === 'email' ? 'bg-emerald-800 text-white' : 'bg-zinc-100 text-zinc-600'}`}>Admin email notices</button><button type="button" onClick={() => { setKind('status'); setPage(1); }} className={`rounded-full px-4 py-2 text-xs font-bold ${kind === 'status' ? 'bg-emerald-800 text-white' : 'bg-zinc-100 text-zinc-600'}`}>Vendor status notices</button></div><div className="min-h-0 flex-1 overflow-y-auto p-5">{query.isLoading ? <div className="flex justify-center py-12"><Loader2 className="animate-spin text-emerald-700"/></div> : query.isError ? <ErrorMessage error={query.error} retry={() => query.refetch()}/> : !valid ? <div role="alert" className="rounded-xl bg-rose-50 p-4 text-sm text-rose-800">Unexpected response from GET {endpoint}?page={page}&limit=20; expected data.data rows and data.total.</div> : rows.length === 0 ? <div className="py-14 text-center"><RotateCw className="mx-auto text-zinc-300"/><h3 className="mt-3 text-sm font-bold">No exhausted notices</h3><p className="mt-1 text-xs text-zinc-500">There are no notification deliveries awaiting recovery.</p></div> : <div className="space-y-3">{rows.map((row) => <article key={kind === 'email' ? row.withdrawalId : row.id} className="rounded-xl border border-zinc-200 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-sm font-bold">{row.storeName || 'Store not provided'}</h3><p className="mt-1 text-xs text-zinc-500">{row.withdrawalReference}</p></div><button type="button" disabled={mutation.isPending} onClick={() => mutation.mutate(row)} className="inline-flex items-center gap-2 rounded-lg bg-emerald-800 px-3 py-2 text-xs font-bold text-white disabled:opacity-50"><RotateCw size={14}/>Requeue</button></div><div className="mt-3 grid grid-cols-2 gap-3 text-xs"><Detail label="Withdrawal amount" value={`${formatVendorNaira(row.amountKobo, row.amountNaira)} ${row.currency || 'NGN'}`}/>{kind === 'email' ? <Detail label="Email delivery status" value={row.status}/> : <Detail label="Withdrawal event status" value={row.status}/>}<Detail label="Delivery attempts" value={String(row.attempts)}/><Detail label="Last delivery error" value={row.lastError}/><Detail label={kind === 'email' ? 'Next retry' : 'Last updated'} value={kind === 'email' ? (row.nextAttemptAt ? formatShortDateTime(row.nextAttemptAt) : null) : (row.updatedAt ? formatShortDateTime(row.updatedAt) : null)}/>{kind === 'status' && <Detail label="Channel" value={row.channel}/>}</div><p className="mt-3 text-[10px] text-zinc-500">Requeue only schedules notification delivery; withdrawal status remains unchanged.</p></article>)}</div>}</div>{valid && <PageControl page={page} total={result.total} limit={20} onPage={setPage}/>}</aside></div>, document.body);
};

export const VendorWithdrawalsPanel = ({ isOpen, onClose, initialWithdrawalId = null }) => {
    const token = useAuthStore((state) => state.accessToken);
    const client = useQueryClient();
    const [page, setPage] = useState(1);
    const [queryText, setQueryText] = useState('');
    const [selectedId, setSelectedId] = useState(initialWithdrawalId);
    const [action, setAction] = useState('');
    const [actionValue, setActionValue] = useState('');
    const [manualTransferConfirmed, setManualTransferConfirmed] = useState(false);
    const [key, setKey] = useState('');
    const recoveryStatusRef = useRef(null);
    const [dateFilter, setDateFilter] = useState('all_time');
    const [customDates, setCustomDates] = useState({ start: '', end: '' });
    const [draftDates, setDraftDates] = useState({ start: '', end: '' });
    const [customDateOpen, setCustomDateOpen] = useState(false);
    const listParams = new URLSearchParams({ page: String(page), limit: '20', status: 'PENDING' });
    if (dateFilter !== 'all_time') listParams.set('dateFilter', dateFilter);
    if (queryText.trim()) listParams.set('query', queryText.trim());
    if (dateFilter === 'custom' && customDates.start && customDates.end) { listParams.set('from', customDates.start); listParams.set('to', customDates.end); }
    const listQuery = useQuery({ queryKey: ['vendor-withdrawals', page, queryText, dateFilter, customDates], queryFn: () => api.get(`/superadmin/withdrawals?${listParams}`, token), enabled: Boolean(isOpen && !selectedId && (dateFilter !== 'custom' || (customDates.start && customDates.end))) });
    const detailQuery = useQuery({ queryKey: ['vendor-withdrawal-detail', selectedId], queryFn: () => api.get(`/superadmin/withdrawals/${encodeURIComponent(selectedId)}`, token), enabled: Boolean(isOpen && selectedId) });
    useEffect(() => { if (!selectedId) return undefined; const currentId = selectedId; return () => client.removeQueries({ queryKey: ['vendor-withdrawal-detail', currentId], exact: true }); }, [selectedId, client]);
    const refreshRelatedData = async () => Promise.all([
        client.invalidateQueries({ queryKey: ['vendor-withdrawals'] }),
        client.invalidateQueries({ queryKey: ['vendor-wallet-summary'] }),
        client.invalidateQueries({ queryKey: ['vendor-wallets'] }),
        client.invalidateQueries({ queryKey: ['vendor-wallet'] }),
        client.invalidateQueries({ queryKey: ['vendor-wallet-transactions'] }),
    ]);
    const clearAction = () => { setAction(''); setActionValue(''); setKey(''); setManualTransferConfirmed(false); };
    const retryWithdrawalStatus = async () => {
        const refreshed = await detailQuery.refetch();
        const current = refreshed.data?.data;
        if (refreshed.error || current?.id !== selectedId) {
            toast.error('Withdrawal result is unconfirmed. Retry checking its current status before taking another action.');
            return;
        }
        if (recoveryStatusRef.current && current.status === recoveryStatusRef.current) {
            recoveryStatusRef.current = null;
            toast.success(`Withdrawal status confirmed as ${current.status}.`);
            clearAction();
            await refreshRelatedData();
            return;
        }
        if (recoveryStatusRef.current) {
            toast.error(`Withdrawal update could not be confirmed. Current status: ${current.status || 'Not available'}. No status change was retried.`);
            recoveryStatusRef.current = null;
        }
    };
    const mutation = useMutation({
        mutationFn: ({ id, body }) => api.post(`/superadmin/withdrawals/${encodeURIComponent(id)}/status`, body, token),
        onSuccess: async (result) => {
            recoveryStatusRef.current = null;
            toast.success(result?.message || 'Withdrawal request updated');
            clearAction();
            await Promise.all([refreshRelatedData(), detailQuery.refetch()]);
        },
        onError: async (error, variables) => {
            const isTransportFailure = error?.transportError === true && error?.status == null && error?.responseReceived !== true;
            if (isTransportFailure) {
                recoveryStatusRef.current = variables?.body?.status || null;
                const refreshed = await detailQuery.refetch();
                const current = refreshed.data?.data;
                if (!refreshed.error && current?.id === selectedId && current.status === variables?.body?.status) {
                    recoveryStatusRef.current = null;
                    toast.success(`Withdrawal status confirmed as ${current.status}.`);
                    clearAction();
                    await refreshRelatedData();
                    return;
                }
                if (!refreshed.error && current?.id === selectedId) {
                    recoveryStatusRef.current = null;
                    toast.error(`Withdrawal update could not be confirmed. Current status: ${current.status || 'Not available'}. No status change was retried.`);
                    return;
                }
                toast.error('Withdrawal result is unconfirmed. Use Retry to check its current status; the action was not resubmitted.');
                return;
            }

            recoveryStatusRef.current = null;
            toast.error(apiMessage(error, 'Could not update withdrawal.'));
            await detailQuery.refetch();
        },
    });
    const result = listQuery.data?.data;
    const rows = result?.data;
    const selected = detailQuery.data?.data;
    const beginAction = (status) => { setAction(status); setActionValue(''); setKey(idempotencyKey()); setManualTransferConfirmed(false); };
    const submit = () => {
        if (!selected || selected.status !== 'PENDING' || mutation.isPending) return;
        const body = { status: action, idempotencyKey: key };
        if (action === 'COMPLETED') {
            if (!manualTransferConfirmed) return toast('Confirm the manual bank transfer has already been made.');
            if (actionValue.trim()) body.bankTransferReference = actionValue.trim();
        } else if (action === 'DECLINED' || action === 'FAILED') {
            if (actionValue.trim().length < 2) return toast('Enter a reason with at least two non-space characters.');
            body.reason = actionValue.trim();
        }
        mutation.mutate({ id: selected.id, body });
    };
    const closePanel = () => { setSelectedId(null); setAction(''); setActionValue(''); setKey(''); setManualTransferConfirmed(false); onClose(); };
    if (!isOpen) return null;
    return createPortal(<div className="fixed inset-0 z-[120] h-[100dvh] w-screen overflow-hidden"><button type="button" aria-label="Close pending vendor withdrawals" onClick={closePanel} className="absolute inset-0 bg-black/50"/><aside role="dialog" aria-modal="true" className="absolute inset-y-0 right-0 flex h-full w-full max-w-xl flex-col bg-white shadow-2xl">
        <header className="flex shrink-0 items-center gap-3 border-b border-white/10 bg-[#0F172B] p-5 text-white">{selectedId && <button type="button" aria-label="Back to pending vendor withdrawals" onClick={() => setSelectedId(null)} className="rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white"><ChevronLeft size={18}/></button>}<div className="min-w-0 flex-1"><p className="text-[10px] font-bold uppercase text-emerald-300">Vendor wallets</p><h2 className="text-base font-bold text-white">{selectedId ? 'Withdrawal review' : 'Pending withdrawals'}</h2></div><button type="button" aria-label="Close pending vendor withdrawals" onClick={closePanel} className="rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white"><X size={19}/></button></header>
        {selectedId ? <div className="flex min-h-0 flex-1 flex-col">{detailQuery.isLoading ? <div className="flex flex-1 items-center justify-center"><Loader2 className="animate-spin text-emerald-700"/></div> : detailQuery.isError ? <div className="p-5"><ErrorMessage error={detailQuery.error} retry={retryWithdrawalStatus}/></div> : selected ? <><div className="flex-1 space-y-4 overflow-y-auto p-5"><div className="rounded-xl bg-zinc-50 p-4"><p className="text-[10px] font-bold uppercase text-zinc-500">Withdrawal amount</p><p className="mt-2 text-2xl font-bold">{formatVendorNaira(selected.amountKobo, selected.amountNaira)} {selected.currency || 'NGN'}</p></div><section className="rounded-xl border p-4"><h3 className="mb-3 text-xs font-bold uppercase">Store and request</h3><dl className="grid grid-cols-2 gap-4"><Detail label="Store" value={selected.storeName}/><Detail label="Vendor / owner" value={selected.vendorName || selected.ownerName}/><Detail label="Address" value={selected.storeAddress}/><Detail label="Reference" value={selected.reference}/><Detail label="Status" value={selected.status}/><Detail label="Requested" value={selected.createdAt ? formatShortDateTime(selected.createdAt) : null}/></dl></section><section className="rounded-xl border p-4"><div className="mb-3 flex items-center gap-2 text-zinc-700"><Building2 size={15}/><h3 className="text-xs font-bold uppercase">Full bank details</h3></div><dl className="grid grid-cols-2 gap-4"><Detail label="Bank" value={selected.bankName}/><Detail label="Account name" value={selected.accountName}/><div className="col-span-2"><Detail label="Account number" value={selected.accountNumber} mono/></div></dl></section><p className="text-xs leading-5 text-zinc-500">Completing a request records your report that a manual transfer has already happened. This action does not initiate or verify a bank transfer.</p>{selected.events && <section className="rounded-xl border p-4"><h3 className="mb-3 text-xs font-bold uppercase">Review history</h3>{Array.isArray(selected.events) && selected.events.map((event) => <p key={event.id} className="border-l-2 py-1 pl-3 text-xs">{event.priorStatus} → {event.newStatus} · {formatShortDateTime(event.createdAt)}{event.reason ? ` · ${event.reason}` : ''}</p>)}</section>}</div>{selected.status === 'PENDING' && <footer className="shrink-0 border-t p-4">{action ? <div className="space-y-3"><label className="block text-xs font-semibold">{action === 'COMPLETED' ? 'Actual bank transfer reference (optional)' : 'Reason'}<input value={actionValue} onChange={(event) => setActionValue(event.target.value)} className="mt-2 w-full rounded-xl border p-3 text-sm"/></label>{action === 'COMPLETED' && <label className="flex items-start gap-2 text-xs"><input type="checkbox" checked={manualTransferConfirmed} onChange={(e) => setManualTransferConfirmed(e.target.checked)}/>I confirm the transfer has already been made manually.</label>}<div className="flex gap-3"><button type="button" onClick={() => setAction('')} className="flex-1 rounded-xl border p-3 text-xs font-bold">Cancel</button><button type="button" disabled={mutation.isPending} onClick={submit} className="flex-1 rounded-xl bg-emerald-800 p-3 text-xs font-bold text-white disabled:opacity-50">{mutation.isPending ? 'Saving…' : `Confirm ${action.toLowerCase()}`}</button></div></div> : <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{['PROCESSING', 'DECLINED', 'FAILED', 'COMPLETED'].map((status) => <button type="button" key={status} onClick={() => beginAction(status)} className={`rounded-xl border px-2 py-3 text-xs font-bold ${status === 'COMPLETED' ? 'border-emerald-700 bg-emerald-800 text-white' : 'border-zinc-200 text-zinc-700'}`}>{status}</button>)}</div>}</footer>}</> : <p className="p-5 text-sm text-zinc-500">Withdrawal details were not returned.</p>}</div> : <div className="min-h-0 flex-1 overflow-y-auto p-5"><div className="mb-4 flex flex-col gap-3 sm:flex-row"><input value={queryText} onChange={(event) => { setQueryText(event.target.value); setPage(1); }} placeholder="Search vendor or reference" className="min-w-0 flex-1 rounded-xl bg-zinc-100 px-4 py-3 text-sm"/><WalletFilterDropdown label="Date" selected={dateFilter} options={vendorDateFilters} onSelect={(value) => { if (value === 'custom') { setDraftDates(customDates); setCustomDateOpen(true); return; } setDateFilter(value); setPage(1); }}/></div>{dateFilter === 'custom' && !(customDates.start && customDates.end) ? <p className="py-8 text-center text-sm text-zinc-500">Choose both dates to load requests.</p> : listQuery.isLoading ? <div className="flex justify-center py-12"><Loader2 className="animate-spin text-emerald-700"/></div> : listQuery.isError ? <ErrorMessage error={listQuery.error} retry={() => listQuery.refetch()}/> : !Array.isArray(rows) ? <div role="alert" className="rounded-xl bg-rose-50 p-4 text-sm text-rose-800">Unexpected withdrawal-list response; expected data.data rows from the documented API.</div> : rows.length === 0 ? <p className="py-12 text-center text-sm text-zinc-500">No pending vendor withdrawals.</p> : <div className="space-y-3">{rows.map((request) => <button type="button" key={request.id} onClick={() => setSelectedId(request.id)} className="flex w-full items-center justify-between gap-4 rounded-xl border p-4 text-left hover:border-emerald-300"><span className="min-w-0"><span className="block truncate text-sm font-bold">{request.storeName || 'Store not provided'}</span><span className="mt-1 block text-xs font-semibold">{request.vendorName || request.ownerName || 'Vendor not provided'}</span><span className="mt-1 block text-xs text-zinc-500">{request.storeAddress || 'Not provided'}</span><span className="mt-1 block text-[10px] text-zinc-500">{request.reference} · {request.createdAt ? formatShortDateTime(request.createdAt) : 'Time not provided'}</span><span className="mt-1 block text-[10px] text-zinc-500">{request.bankName} · {request.maskedAccountNumber}</span></span><span className="shrink-0 text-right"><span className="block text-sm font-bold">{formatVendorNaira(request.amountKobo, request.amountNaira)} {request.currency || 'NGN'}</span><span className="mt-1 inline-block rounded-full bg-amber-50 px-2 py-1 text-[9px] font-bold text-amber-800">PENDING</span></span></button>)}</div>}{dateFilter === 'custom' && customDates.start && customDates.end && <PageControl page={page} total={result?.total || 0} limit={20} onPage={setPage}/>}</div>}
        <WalletCustomDateModal isOpen={customDateOpen} dates={draftDates} onDatesChange={setDraftDates} onClose={() => setCustomDateOpen(false)} onApply={(selection) => { setCustomDates(selection); setDateFilter('custom'); setPage(1); setCustomDateOpen(false); }}/>
    </aside></div>, document.body);
};

