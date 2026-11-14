import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, CreditCard, Loader2, RefreshCw, Save } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../api/api';
import { useAuthStore } from '../../store/useAuthStore';
import { getPaymentMethodErrorMessage, PAYMENT_METHOD_CODES, validatePaymentMethod } from '../../utils/paymentMethodSettings';

const ENDPOINT = '/superadmin/payment-methods';

const PaymentMethodCard = ({ method, token }) => {
    const queryClient = useQueryClient();
    const [enabled, setEnabled] = useState(Boolean(method.enabled));
    const [displayName, setDisplayName] = useState(method.displayName ?? '');
    const [description, setDescription] = useState(method.description ?? '');
    const [sortOrder, setSortOrder] = useState(String(method.sortOrder ?? ''));
    const [errors, setErrors] = useState({});

    const saveMutation = useMutation({
        mutationFn: (payload) => api.patch(`${ENDPOINT}/${method.code}`, payload, token),
        onSuccess: (response, payload) => {
            const savedMethod = response?.data ?? { ...payload, code: method.code };
            queryClient.setQueryData(['admin-payment-methods'], (current) => ({
                ...current,
                data: (current?.data ?? []).map((item) => item.code === method.code ? savedMethod : item),
            }));
            setEnabled(Boolean(savedMethod.enabled));
            setDisplayName(savedMethod.displayName ?? '');
            setDescription(savedMethod.description ?? '');
            setSortOrder(String(savedMethod.sortOrder ?? ''));
            setErrors({});
            toast.success(response?.message || `${savedMethod.displayName} settings saved.`);
        },
        onError: (error) => toast.error(getPaymentMethodErrorMessage(error)),
    });

    const handleSave = (event) => {
        event.preventDefault();
        if (!PAYMENT_METHOD_CODES.has(method.code)) return;

        const draft = { enabled, sortOrder, displayName, description };
        const nextErrors = validatePaymentMethod(draft);
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length) return;

        saveMutation.mutate({
            enabled,
            sortOrder: Number(sortOrder),
            displayName: displayName.trim(),
            description,
        });
    };

    const busy = saveMutation.isPending;
    const fieldClass = 'mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-zinc-50 disabled:text-zinc-400';

    return (
        <form onSubmit={handleSave} className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-100 bg-zinc-50/70 px-4 py-4 md:px-5">
                <div className="flex min-w-0 items-center gap-3">
                    <span className="rounded-xl bg-emerald-50 p-2.5 text-emerald-800"><CreditCard size={19} /></span>
                    <div className="min-w-0">
                        <h3 className="truncate text-sm font-bold text-zinc-900">{method.displayName}</h3>
                        <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">{method.code.replaceAll('_', ' ')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2.5">
                        <span className={`text-xs font-semibold ${enabled ? 'text-emerald-700' : 'text-zinc-500'}`}>{enabled ? 'Enabled' : 'Disabled'}</span>
                        <button
                            type="button"
                            role="switch"
                            aria-label={`Enable ${method.displayName}`}
                            aria-checked={enabled}
                            disabled={busy}
                            onClick={() => setEnabled((current) => !current)}
                            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${enabled ? 'bg-emerald-600' : 'bg-zinc-300'}`}
                        >
                            <span className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-sm ring-1 ring-black/5 transition-transform duration-200 ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                    </div>
                    <button type="submit" disabled={busy} className="inline-flex min-w-24 items-center justify-center gap-2 rounded-xl bg-[#1C5E20] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#174D1A] disabled:cursor-not-allowed disabled:opacity-60">
                        {busy ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        {busy ? 'Saving…' : 'Save changes'}
                    </button>
                </div>
            </div>

            <div className="grid gap-x-4 gap-y-4 p-4 md:grid-cols-[minmax(0,1fr)_120px] md:p-5">
                <div>
                    <label htmlFor={`${method.code}-name`} className="text-xs font-semibold text-zinc-600">Display name</label>
                    <input id={`${method.code}-name`} value={displayName} maxLength={40} disabled={busy} onChange={(event) => { setDisplayName(event.target.value); setErrors((current) => ({ ...current, displayName: '' })); }} className={`${fieldClass} ${errors.displayName ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100' : ''}`} aria-invalid={Boolean(errors.displayName)} />
                    {errors.displayName && <p className="mt-1 text-[10px] text-rose-600">{errors.displayName}</p>}
                </div>

                <div>
                    <label htmlFor={`${method.code}-order`} className="text-xs font-semibold text-zinc-600">Display order</label>
                    <input id={`${method.code}-order`} type="number" min="0" max="100" step="1" inputMode="numeric" value={sortOrder} disabled={busy} onChange={(event) => { setSortOrder(event.target.value); setErrors((current) => ({ ...current, sortOrder: '' })); }} className={`${fieldClass} ${errors.sortOrder ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100' : ''}`} aria-invalid={Boolean(errors.sortOrder)} />
                    {errors.sortOrder && <p className="mt-1 text-[10px] text-rose-600">{errors.sortOrder}</p>}
                </div>

                <div className="md:col-span-2">
                    <div className="mb-1 flex items-center justify-between gap-3">
                        <label htmlFor={`${method.code}-description`} className="text-xs font-semibold text-zinc-600">Description</label>
                        <span className="text-[10px] tabular-nums text-zinc-400">{description.length}/200</span>
                    </div>
                    <textarea id={`${method.code}-description`} value={description} maxLength={200} rows={2} disabled={busy} onChange={(event) => { setDescription(event.target.value); setErrors((current) => ({ ...current, description: '' })); }} className={`${fieldClass} resize-y leading-5 ${errors.description ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100' : ''}`} aria-invalid={Boolean(errors.description)} />
                    {errors.description && <p className="mt-1 text-[10px] text-rose-600">{errors.description}</p>}
                </div>
                {saveMutation.isError && <div role="alert" className="md:col-span-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-800">{getPaymentMethodErrorMessage(saveMutation.error)}</div>}
            </div>
        </form>
    );
};

const PaymentMethodsSettings = () => {
    const token = useAuthStore((state) => state.accessToken);
    const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
        queryKey: ['admin-payment-methods'],
        queryFn: () => api.get(ENDPOINT, token),
    });

    if (isLoading) {
        return <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-center"><Loader2 className="animate-spin text-emerald-700" size={28} /><p className="text-sm font-medium text-zinc-500">Loading payment methods…</p></div>;
    }

    if (isError) {
        return (
            <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-center">
                <AlertCircle className="text-rose-500" size={28} />
                <div>
                    <h3 className="text-sm font-bold text-zinc-900">Couldn’t load payment methods</h3>
                    <p className="mt-1 max-w-md text-xs leading-5 text-zinc-500">{getPaymentMethodErrorMessage(error)}</p>
                </div>
                <button type="button" onClick={() => refetch()} disabled={isFetching} className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-zinc-800 disabled:opacity-60">{isFetching ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />} Retry</button>
            </div>
        );
    }

    const methods = Array.isArray(data?.data) ? data.data : [];

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <h2 className="text-base font-bold text-zinc-900">Payment methods</h2>
                <p className="text-xs leading-5 text-zinc-500">Configure customer checkout methods. No provider secrets are managed here.</p>
            </div>
            {!methods.length ? (
                <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-5 py-12 text-center">
                    <CreditCard size={24} className="mx-auto text-zinc-400" />
                    <p className="mt-3 text-sm font-semibold text-zinc-700">No payment methods returned</p>
                    <p className="mt-1 text-xs text-zinc-500">The payment method configuration is currently empty.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {[...methods].sort((first, second) => first.sortOrder - second.sortOrder).map((method) => (
                        <PaymentMethodCard key={method.code} method={method} token={token} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default PaymentMethodsSettings;
