import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, Gift, Loader2, RefreshCw, Save } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../api/api';
import { useAuthStore } from '../../store/useAuthStore';

const ENDPOINT = '/superadmin/referral-program';
const MAX_REWARD_KOBO = 100000000;

const koboToNairaInput = (kobo) => (Number(kobo) / 100).toFixed(2);

const parseNairaToKobo = (value) => {
    const normalized = value.trim();
    if (!/^\d+(?:\.\d{0,2})?$/.test(normalized)) return null;

    const [nairaPart, koboPart = ''] = normalized.split('.');
    const kobo = Number(nairaPart) * 100 + Number(koboPart.padEnd(2, '0'));
    return Number.isSafeInteger(kobo) ? kobo : null;
};

const AmountField = ({ id, label, description, value, error, disabled, onChange }) => (
    <div className="flex h-full flex-col rounded-xl border border-zinc-100 bg-zinc-50 p-4">
        <label htmlFor={id} className="block text-sm font-bold text-zinc-900">{label}</label>
        <p className="mt-1 min-h-10 text-xs leading-5 text-zinc-500">{description}</p>
        <div className={`mt-3 flex items-center rounded-xl border bg-white px-3 transition focus-within:ring-2 ${error ? 'border-rose-300 focus-within:ring-rose-100' : 'border-zinc-200 focus-within:border-emerald-500 focus-within:ring-emerald-100'}`}>
            <span className="mr-2 text-sm font-semibold text-zinc-500">₦</span>
            <input
                id={id}
                type="number"
                min="0"
                max="1000000"
                step="0.01"
                inputMode="decimal"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                disabled={disabled}
                aria-invalid={Boolean(error)}
                aria-describedby={`${id}-help ${id}-error`}
                className="w-full min-w-0 bg-transparent py-3 text-sm font-semibold text-zinc-900 outline-none disabled:cursor-not-allowed disabled:text-zinc-400"
            />
            <span id={`${id}-help`} className="whitespace-nowrap text-[10px] text-zinc-400">Naira</span>
        </div>
        {error && <p id={`${id}-error`} className="mt-2 text-xs font-medium text-rose-600">{error}</p>}
    </div>
);

const ReferralProgramForm = ({ config, token }) => {
    const queryClient = useQueryClient();
    const [enabled, setEnabled] = useState(Boolean(config.enabled));
    const [firstOrderNaira, setFirstOrderNaira] = useState(koboToNairaInput(config.firstOrderRewardKobo));
    const [laterOrderNaira, setLaterOrderNaira] = useState(koboToNairaInput(config.laterOrderRewardKobo));
    const [fieldErrors, setFieldErrors] = useState({});

    const saveMutation = useMutation({
        mutationFn: (payload) => api.patch(ENDPOINT, payload, token),
        onSuccess: (savedResponse, payload) => {
            queryClient.setQueryData(['admin-referral-program'], (current) => ({
                ...current,
                ...savedResponse,
                data: {
                    ...current?.data,
                    ...payload,
                    ...savedResponse?.data,
                    configSource: savedResponse?.data?.configSource || 'STORED',
                },
            }));
            toast.success(savedResponse?.message || 'Referral program settings saved.');
        },
        onError: (saveError) => {
            toast.error(saveError.message || 'Could not save referral program settings.');
        },
    });

    const validateAmount = (value, label) => {
        if (!value.trim()) return `${label} is required.`;
        const kobo = parseNairaToKobo(value);
        if (kobo === null) return 'Enter a valid amount with no more than two decimal places.';
        if (kobo < 0 || kobo > MAX_REWARD_KOBO) return 'Amount must be between ₦0.00 and ₦1,000,000.00.';
        return '';
    };

    const handleSave = (event) => {
        event.preventDefault();
        const errors = {
            firstOrder: validateAmount(firstOrderNaira, 'First eligible order reward'),
            laterOrder: validateAmount(laterOrderNaira, 'Later eligible order reward'),
        };
        setFieldErrors(errors);
        if (errors.firstOrder || errors.laterOrder) return;

        saveMutation.mutate({
            enabled,
            firstOrderRewardKobo: parseNairaToKobo(firstOrderNaira),
            laterOrderRewardKobo: parseNairaToKobo(laterOrderNaira),
        });
    };

    const sourceIsFallback = config.configSource === 'MISSING_ROW';

    return (
        <form onSubmit={handleSave} className="space-y-5">
            <div className="flex flex-col gap-4 rounded-xl border border-zinc-100 bg-zinc-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                    <span className="rounded-xl bg-emerald-50 p-2.5 text-emerald-800"><Gift size={19} /></span>
                    <div>
                        <h2 className="text-sm font-bold text-zinc-900">Referral rewards</h2>
                        <p className="mt-1 max-w-xl text-xs leading-5 text-zinc-500">Set the referral reward credited after a referred user completes an eligible order. Saving these settings does not create or reverse a reward.</p>
                    </div>
                </div>
                <span className={`w-fit whitespace-nowrap rounded-full border px-3 py-1.5 text-[10px] font-bold ${sourceIsFallback ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}>
                    {sourceIsFallback ? 'Application fallback · not saved' : 'Saved configuration'}
                </span>
            </div>

            {sourceIsFallback && (
                <div className="rounded-xl border border-amber-100 bg-amber-50/60 px-4 py-3 text-xs leading-5 text-amber-900">
                    No configuration row has been saved. These are the application’s effective fallback settings; they are not a database seed. Save to store a configuration row.
                </div>
            )}

            {saveMutation.isError && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-800">{saveMutation.error?.message || 'The referral program settings could not be saved. Please try again.'}</div>}

            <div className="flex items-center justify-between gap-4 rounded-xl border border-zinc-100 p-4">
                <div>
                    <p className="text-sm font-bold text-zinc-900">Referral program status</p>
                    <p className="mt-1 text-xs text-zinc-500">When disabled, future eligible referral rewards are turned off.</p>
                </div>
                <button
                    type="button"
                    role="switch"
                    aria-checked={enabled}
                    onClick={() => setEnabled((current) => !current)}
                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${enabled ? 'bg-emerald-600' : 'bg-zinc-300'}`}
                >
                    <span className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-sm ring-1 ring-black/5 transition-transform duration-200 ease-in-out ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <AmountField
                    id="first-order-reward"
                    label="First eligible order reward"
                    description="Reward credited to the referrer after their referred user completes their first eligible order."
                    value={firstOrderNaira}
                    error={fieldErrors.firstOrder}
                    disabled={saveMutation.isPending}
                    onChange={(value) => { setFirstOrderNaira(value); setFieldErrors((current) => ({ ...current, firstOrder: '' })); }}
                />
                <AmountField
                    id="later-order-reward"
                    label="Later eligible order reward"
                    description="Reward credited for each later eligible order completed by the referred user."
                    value={laterOrderNaira}
                    error={fieldErrors.laterOrder}
                    disabled={saveMutation.isPending}
                    onChange={(value) => { setLaterOrderNaira(value); setFieldErrors((current) => ({ ...current, laterOrder: '' })); }}
                />
            </div>

            <div className="flex flex-col gap-3 rounded-xl bg-zinc-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[11px] leading-5 text-zinc-500">Amounts are shown in Naira and sent to the API as whole-number kobo (₦1 = 100 kobo). Maximum: ₦1,000,000.00 per reward.</p>
                <button type="submit" disabled={saveMutation.isPending} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#1C5E20] px-5 py-3 text-xs font-bold text-white transition hover:bg-[#174D1A] disabled:cursor-not-allowed disabled:opacity-60">
                    {saveMutation.isPending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                    {saveMutation.isPending ? 'Saving…' : 'Save changes'}
                </button>
            </div>
        </form>
    );
};

const ReferralProgramSettings = () => {
    const token = useAuthStore((state) => state.accessToken);
    const {
        data: response,
        isLoading,
        isError,
        error,
        refetch,
        isFetching,
    } = useQuery({
        queryKey: ['admin-referral-program'],
        queryFn: () => api.get(ENDPOINT, token),
    });

    const config = response?.data;

    if (isLoading) {
        return (
            <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-center">
                <Loader2 className="animate-spin text-emerald-700" size={28} />
                <p className="text-sm font-medium text-zinc-500">Loading referral program settings…</p>
            </div>
        );
    }

    if (isError || !config) {
        return (
            <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-center">
                <AlertCircle className="text-rose-500" size={28} />
                <div>
                    <h3 className="text-sm font-bold text-zinc-900">Couldn’t load referral program settings</h3>
                    <p className="mt-1 max-w-md text-xs leading-5 text-zinc-500">{error?.message || 'The server did not return referral program settings.'}</p>
                </div>
                <button type="button" onClick={() => refetch()} disabled={isFetching} className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-zinc-800 disabled:opacity-60">
                    {isFetching ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />} Retry
                </button>
            </div>
        );
    }

    return <ReferralProgramForm key={`${config.configSource}-${config.firstOrderRewardKobo}-${config.laterOrderRewardKobo}-${config.enabled}`} config={config} token={token} />;
};

export default ReferralProgramSettings;
