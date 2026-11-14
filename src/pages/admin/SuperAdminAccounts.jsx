import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, ChevronLeft, ChevronRight, Loader2, Plus, Search, ShieldCheck, X, History, Power, PowerOff } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../api/api';
import { useAuthStore } from '../../store/useAuthStore';
import { formatShortDateTime } from '../../utils/formatters';
import { normalizeSuperAdminPhone, SUPER_ADMIN_SEARCH_MAX, superAdminCreateError } from '../../utils/superAdminAccountValidation';
import { rememberSuperAdminVerificationEmail } from './auth/verifyEmailSession';

const PAGE_SIZE = 20;
const emptyForm = { firstname: '', lastname: '', phonenumber: '', username: '', email: '', password: '', passwordConfirmation: '' };
const dateText = (value) => value ? formatShortDateTime(value) : 'Not available';

const errorText = (error, context = 'manage Super Admin accounts') => {
    if (error?.status === 401) return 'Your Super Admin session has expired. Sign in again to continue.';
    if (error?.status === 403) return error.message || `Your Super Admin account does not have permission to ${context}.`;
    if (error?.status === 404) return error.message || 'This Super Admin account could not be found.';
    if (error?.status === 429) return error.message || 'Too many requests. Please wait a moment and try again.';
    if (error?.transportError || !error?.status) return error?.message || 'Network error. Could not reach the server; please try again.';
    return error?.message || 'The request could not be completed. Please try again.';
};

const adminName = (admin) => `${admin?.firstname || ''} ${admin?.lastname || ''}`.trim() || 'Name not available';
const entityText = (entity) => {
    if (typeof entity === 'string' && entity.trim()) return entity;
    if (!entity || typeof entity !== 'object') return 'Not available';
    const name = entity.name || entity.fullName || `${entity.firstname || ''} ${entity.lastname || ''}`.trim();
    return name || entity.email || entity.id || 'Not available';
};

const Pagination = ({ pagination, page, setPage }) => pagination?.total > 0 && (
    <footer className="flex flex-col gap-2 border-t border-zinc-100 px-4 py-3 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
        <span>Showing {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}</span>
        <div className="flex items-center gap-2">
            <button type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)} className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft size={14}/>Previous</button>
            <span>Page {pagination.page} of {pagination.totalPages}</span>
            <button type="button" disabled={page >= pagination.totalPages} onClick={() => setPage((current) => current + 1)} className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-40">Next<ChevronRight size={14}/></button>
        </div>
    </footer>
);

const SuperAdminAccounts = () => {
    const token = useAuthStore((state) => state.accessToken);
    const currentAdmin = useAuthStore((state) => state.superAdmin);
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(1);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [formError, setFormError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [verificationEmail, setVerificationEmail] = useState('');
    const [statusAction, setStatusAction] = useState(null);
    const [statusReason, setStatusReason] = useState('');
    const [statusError, setStatusError] = useState('');
    const [historyAdmin, setHistoryAdmin] = useState(null);
    const [historyPage, setHistoryPage] = useState(1);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setDebouncedSearch(search.trim());
            setPage(1);
        }, 250);
        return () => window.clearTimeout(timer);
    }, [search]);

    const listQuery = useQuery({
        queryKey: ['super-admin-accounts', page, debouncedSearch],
        queryFn: () => {
            const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
            if (debouncedSearch) params.set('search', debouncedSearch.slice(0, SUPER_ADMIN_SEARCH_MAX));
            return api.get(`/superadmin/auth/accounts?${params.toString()}`, token);
        },
        enabled: Boolean(token),
        retry: false,
        placeholderData: (previous) => previous,
    });

    const createMutation = useMutation({
        mutationFn: async (body) => {
            await api.post('/superadmin/auth/register', body, token);
            // Discard the create payload so OTPs or credentials cannot remain in mutation state.
            return { created: true };
        },
        retry: false,
        onSuccess: async (_result, variables) => {
            const createdEmail = variables.email.trim();
            rememberSuperAdminVerificationEmail(createdEmail);
            setVerificationEmail(createdEmail);
            setIsCreateOpen(false);
            setForm(emptyForm);
            setFormError('');
            setPage(1);
            setSearch('');
            setDebouncedSearch('');
            const message = 'Super Admin account created and enabled. Email verification is pending; an email OTP was sent, and the new account must verify before login.';
            setSuccessMessage(message);
            toast.success('Account created. Email verification is required before login.');
            await queryClient.invalidateQueries({ queryKey: ['super-admin-accounts'] });
        },
        onError: (error) => setFormError(errorText(error, 'create Super Admin accounts')),
    });

    const statusMutation = useMutation({
        mutationFn: ({ adminId, isActive, reason }) => api.patch(`/superadmin/auth/accounts/${encodeURIComponent(adminId)}/status`, { isActive, reason }, token),
        retry: false,
        onSuccess: async (_response, variables) => {
            const verb = variables.isActive ? 'enabled' : 'disabled';
            setStatusAction(null);
            setStatusReason('');
            setStatusError('');
            toast.success(`${variables.targetName} ${verb}.`);
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['super-admin-accounts'] }),
                queryClient.invalidateQueries({ queryKey: ['super-admin-account-status-events', variables.adminId] }),
            ]);
        },
        onError: (error) => setStatusError(errorText(error, 'change this account status')),
    });

    const historyQuery = useQuery({
        queryKey: ['super-admin-account-status-events', historyAdmin?.id, historyPage],
        queryFn: () => api.get(`/superadmin/auth/accounts/${encodeURIComponent(historyAdmin.id)}/status-events?page=${historyPage}&limit=${PAGE_SIZE}`, token),
        enabled: Boolean(token && historyAdmin?.id),
        retry: false,
    });

    const payload = listQuery.data?.data;
    const admins = payload?.admins;
    const pagination = payload?.pagination;
    const validResponse = Array.isArray(admins)
        && Number.isInteger(pagination?.page)
        && Number.isInteger(pagination?.limit)
        && Number.isInteger(pagination?.total)
        && Number.isInteger(pagination?.totalPages);
    const historyData = historyQuery.data?.data;
    const events = historyData?.events;
    const historyPagination = historyData?.pagination;
    const validHistory = Array.isArray(events)
        && Number.isInteger(historyPagination?.page)
        && Number.isInteger(historyPagination?.limit)
        && Number.isInteger(historyPagination?.total)
        && Number.isInteger(historyPagination?.totalPages);

    const submitCreate = (event) => {
        event.preventDefault();
        setFormError('');
        const validationError = superAdminCreateError(form);
        if (validationError) return setFormError(validationError);
        createMutation.mutate({
            firstname: form.firstname.trim(),
            lastname: form.lastname.trim(),
            phonenumber: normalizeSuperAdminPhone(form.phonenumber),
            username: form.username.trim(),
            email: form.email.trim(),
            password: form.password,
            passwordConfirmation: form.passwordConfirmation,
        });
    };

    const submitStatus = (event) => {
        event.preventDefault();
        const normalizedReason = statusReason.trim();
        if (normalizedReason.length < 3 || normalizedReason.length > 500) {
            setStatusError('Reason must be between 3 and 500 characters.');
            return;
        }
        statusMutation.mutate({ adminId: statusAction.admin.id, isActive: statusAction.isActive, reason: normalizedReason, targetName: adminName(statusAction.admin) });
    };

    return (
        <div className="mx-auto w-full max-w-[1600px] space-y-5 pb-10">
            <section className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-base font-bold text-zinc-900">Super Admin Account Management</h1>
                    <p className="mt-1 max-w-2xl text-xs leading-5 text-zinc-500">Review account and verification states, enable or disable other accounts, and inspect recorded status history. The list does not determine whether an account is authorized.</p>
                </div>
                <button type="button" onClick={() => { setFormError(''); setIsCreateOpen(true); }} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-800 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-900"><Plus size={15} /> Add Super Admin</button>
            </section>

            {successMessage && <div role="status" className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs leading-5 text-emerald-800"><ShieldCheck size={16} className="mt-0.5 shrink-0" /><div className="flex-1"><p>{successMessage}</p>{verificationEmail && <Link to="/admin/verify-email" state={{ email: verificationEmail }} className="mt-1 inline-flex font-bold underline">Verify this email</Link>}</div><button type="button" className="ml-auto text-emerald-700" aria-label="Dismiss success message" onClick={() => setSuccessMessage('')}><X size={15}/></button></div>}

            <section className="overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-zinc-100 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div><h2 className="text-sm font-bold text-zinc-900">Account directory</h2><p className="mt-1 text-xs text-zinc-500">Enabled status is separate from email verification.</p></div>
                    <label className="relative block w-full sm:max-w-sm"><span className="sr-only">Search Super Admin accounts</span><Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"/><input type="search" value={search} maxLength={SUPER_ADMIN_SEARCH_MAX} onChange={(event) => setSearch(event.target.value.slice(0, SUPER_ADMIN_SEARCH_MAX))} placeholder="Search name, username, email, or phone" className="w-full rounded-xl bg-zinc-100 py-2.5 pl-10 pr-3 text-xs outline-none focus:ring-2 focus:ring-emerald-600/15"/></label>
                </div>

                {!token ? <div role="alert" className="m-4 rounded-xl bg-rose-50 p-4 text-sm text-rose-800">Your Super Admin session is unavailable. Sign in again to continue.</div>
                    : listQuery.isLoading ? <div className="flex items-center justify-center gap-2 py-16 text-xs text-zinc-500"><Loader2 size={17} className="animate-spin text-emerald-700"/>Loading Super Admin accounts…</div>
                        : listQuery.isError ? <div className="m-4 flex items-start gap-3 rounded-xl bg-rose-50 p-4 text-sm text-rose-800" role="alert"><AlertCircle size={17} className="mt-0.5 shrink-0"/><div className="flex-1"><p>{errorText(listQuery.error)}</p><button type="button" onClick={() => listQuery.refetch()} className="mt-2 font-bold underline">Retry</button></div></div>
                            : !validResponse ? <div role="alert" className="m-4 rounded-xl bg-rose-50 p-4 text-sm text-rose-800">The Super Admin accounts response did not match the documented format.</div>
                                : admins.length === 0 ? <div className="px-5 py-16 text-center"><ShieldCheck size={28} className="mx-auto text-zinc-300"/><h3 className="mt-3 text-sm font-bold text-zinc-800">{debouncedSearch ? 'No matching accounts' : 'No Super Admin accounts found'}</h3><p className="mt-1 text-xs text-zinc-500">{debouncedSearch ? 'Try a different search.' : 'Accounts will appear here when available.'}</p></div>
                                    : <div className="overflow-x-auto"><table className="w-full min-w-[960px] text-left"><thead className="border-b border-zinc-100 bg-zinc-50"><tr>{['Name', 'Email', 'Phone', 'Account status', 'Email verification', 'Created', 'Last login', ''].map((heading, index) => <th key={`${heading}-${index}`} className="whitespace-nowrap px-3 py-3 text-[10px] font-bold uppercase tracking-wide text-zinc-400">{heading}</th>)}</tr></thead><tbody className="divide-y divide-zinc-100">{admins.map((admin) => {
                                        const isSelf = Boolean((currentAdmin?.id && admin.id === currentAdmin.id)
                                            || (currentAdmin?.email && admin.email?.toLowerCase() === currentAdmin.email.toLowerCase()));
                                        const activeKnown = typeof admin.isActive === 'boolean';
                                        return <tr key={admin.id} className="hover:bg-zinc-50/70">
                                            <td className="px-3 py-3 text-xs font-semibold text-zinc-800">{adminName(admin)}{isSelf && <span className="ml-1 text-[10px] font-normal text-zinc-400">(You)</span>}</td>
                                            <td className="px-3 py-3 text-xs text-zinc-700">{admin.email || 'Not available'}</td>
                                            <td className="px-3 py-3 text-xs text-zinc-700">{admin.phonenumber || 'Not available'}</td>
                                            <td className="px-3 py-3"><span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${admin.isActive === true ? 'bg-emerald-50 text-emerald-700' : admin.isActive === false ? 'bg-zinc-100 text-zinc-700' : 'bg-amber-50 text-amber-700'}`}>{admin.isActive === true ? 'Enabled' : admin.isActive === false ? 'Disabled' : 'Not available'}</span></td>
                                            <td className="px-3 py-3"><span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${admin.isEmailVerified === true ? 'bg-emerald-50 text-emerald-700' : admin.isEmailVerified === false ? 'bg-amber-50 text-amber-700' : 'bg-zinc-100 text-zinc-600'}`}>{admin.isEmailVerified === true ? 'Verified' : admin.isEmailVerified === false ? 'Pending email verification' : 'Not available'}</span></td>
                                            <td className="whitespace-nowrap px-3 py-3 text-xs text-zinc-600">{dateText(admin.createdAt)}</td>
                                            <td className="whitespace-nowrap px-3 py-3 text-xs text-zinc-600">{dateText(admin.lastLogin)}</td>
                                            <td className="px-3 py-3"><div className="flex items-center justify-end gap-1">
                                                <button type="button" onClick={() => { setHistoryAdmin(admin); setHistoryPage(1); }} aria-label={`View status history for ${adminName(admin)}`} className="inline-flex items-center gap-1 rounded-lg border px-2 py-1.5 text-[10px] font-semibold text-zinc-700 hover:bg-zinc-50"><History size={13}/>History</button>
                                                {isSelf ? <span className="px-2 text-[10px] text-zinc-400">Current account</span> : activeKnown && <button type="button" disabled={statusMutation.isPending} onClick={() => { setStatusError(''); setStatusReason(''); setStatusAction({ admin, isActive: !admin.isActive }); }} className={`inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-semibold disabled:opacity-50 ${admin.isActive ? 'border border-rose-200 text-rose-700 hover:bg-rose-50' : 'border border-emerald-200 text-emerald-700 hover:bg-emerald-50'}`}>{admin.isActive ? <><PowerOff size={13}/>Disable</> : <><Power size={13}/>Enable</>}</button>}
                                            </div></td>
                                        </tr>;
                                    })}</tbody></table></div>}

                {validResponse && <Pagination pagination={pagination} page={page} setPage={setPage}/>}
            </section>

            {isCreateOpen && <div className="fixed inset-0 z-[100] flex justify-end bg-black/45" onMouseDown={(event) => { if (event.target === event.currentTarget && !createMutation.isPending) setIsCreateOpen(false); }}><section role="dialog" aria-modal="true" aria-labelledby="add-super-admin-title" className="flex h-full w-full max-w-xl flex-col bg-white shadow-2xl"><header className="flex items-center justify-between border-b p-5"><div><h2 id="add-super-admin-title" className="text-lg font-bold text-zinc-900">Add Super Admin</h2><p className="mt-1 text-xs text-zinc-500">The new account will be enabled but must verify its email before logging in.</p></div><button type="button" aria-label="Close" disabled={createMutation.isPending} onClick={() => setIsCreateOpen(false)} className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 disabled:opacity-50"><X size={18}/></button></header><form onSubmit={submitCreate} className="flex min-h-0 flex-1 flex-col"><div className="flex-1 space-y-4 overflow-y-auto p-5"><div className="grid gap-4 sm:grid-cols-2">{[['firstname', 'First name', 'text'], ['lastname', 'Last name', 'text'], ['phonenumber', 'Phone number', 'tel'], ['username', 'Username', 'text'], ['email', 'Email', 'email'], ['password', 'Password', 'password'], ['passwordConfirmation', 'Confirm password', 'password']].map(([name, label, type]) => <label key={name} className={`block ${name === 'email' || name.startsWith('password') ? 'sm:col-span-2' : ''}`}><span className="mb-1.5 block text-xs font-semibold text-zinc-700">{label} <span className="text-rose-600">*</span></span><input name={name} type={type} value={form[name]} onChange={(event) => { const { value } = event.target; setForm((current) => ({ ...current, [name]: value })); setFormError(''); }} autoComplete={name === 'passwordConfirmation' || name === 'password' ? 'new-password' : name} className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10"/></label>)}</div><p className="text-xs leading-5 text-zinc-500">An email verification OTP is sent to the new account. No OTP or password is displayed from the response. Password needs at least 8 characters with uppercase, lowercase, a number, and a special character. Phone numbers use 0, 234, or +234 followed by 10 digits.</p>{formError && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-xs leading-5 text-rose-800">{formError}</p>}</div><footer className="flex gap-3 border-t p-5"><button type="button" disabled={createMutation.isPending} onClick={() => setIsCreateOpen(false)} className="flex-1 rounded-xl bg-zinc-100 px-4 py-3 text-sm font-semibold text-zinc-700 disabled:opacity-50">Cancel</button><button type="submit" disabled={createMutation.isPending} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-800 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-900 disabled:cursor-wait disabled:opacity-60">{createMutation.isPending && <Loader2 size={16} className="animate-spin"/>}{createMutation.isPending ? 'Creating…' : 'Create account'}</button></footer></form></section></div>}

            {statusAction && <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/45 p-4"><section role="dialog" aria-modal="true" aria-labelledby="status-confirm-title" className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl"><header className="flex items-start justify-between gap-3"><div><h2 id="status-confirm-title" className="text-base font-bold text-zinc-900">Confirm {statusAction.isActive ? 'enable' : 'disable'}</h2><p className="mt-1 text-sm text-zinc-600">{statusAction.isActive ? 'Enable' : 'Disable'} account for <strong>{adminName(statusAction.admin)}</strong> ({statusAction.admin.email || 'email not available'})?</p></div><button type="button" aria-label="Close" disabled={statusMutation.isPending} onClick={() => setStatusAction(null)} className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100"><X size={18}/></button></header><form onSubmit={submitStatus} className="mt-4 space-y-3"><label className="block text-xs font-semibold text-zinc-700">Reason <span className="text-rose-600">*</span><textarea value={statusReason} onChange={(event) => { setStatusReason(event.target.value); setStatusError(''); }} minLength={3} maxLength={500} rows={3} placeholder="Enter a reason (3–500 characters)" className="mt-1.5 w-full resize-y rounded-xl border border-zinc-200 p-3 text-sm font-normal outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10"/><span className="mt-1 block text-right text-[10px] font-normal text-zinc-400">{statusReason.length}/500</span></label>{!statusAction.isActive && <p className="rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-800">Disabling invalidates this account’s sessions. If re-enabled later, the account holder must log in again.</p>}{statusError && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-xs leading-5 text-rose-800">{statusError}</p>}<footer className="flex gap-2 pt-1"><button type="button" disabled={statusMutation.isPending} onClick={() => setStatusAction(null)} className="flex-1 rounded-xl border px-3 py-2.5 text-sm font-semibold text-zinc-700 disabled:opacity-50">Cancel</button><button type="submit" disabled={statusMutation.isPending || statusReason.trim().length < 3 || statusReason.trim().length > 500} className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-white disabled:cursor-wait disabled:opacity-50 ${statusAction.isActive ? 'bg-emerald-800 hover:bg-emerald-900' : 'bg-rose-700 hover:bg-rose-800'}`}>{statusMutation.isPending && <Loader2 size={15} className="animate-spin"/>}{statusMutation.isPending ? 'Saving…' : `Confirm ${statusAction.isActive ? 'enable' : 'disable'}`}</button></footer></form></section></div>}

            {historyAdmin && <div className="fixed inset-0 z-[105] flex justify-end bg-black/45" onMouseDown={(event) => { if (event.target === event.currentTarget) setHistoryAdmin(null); }}><section role="dialog" aria-modal="true" aria-labelledby="status-history-title" className="flex h-full w-full max-w-xl flex-col bg-white shadow-2xl"><header className="flex items-center justify-between border-b px-4 py-3"><div><p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Account status history</p><h2 id="status-history-title" className="mt-1 text-sm font-bold text-zinc-900">{adminName(historyAdmin)}</h2><p className="mt-1 text-[11px] leading-4 text-zinc-500">History starts with this feature deployment. Older status changes may not be included.</p></div><button type="button" aria-label="Close status history" onClick={() => setHistoryAdmin(null)} className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100"><X size={18}/></button></header>
                <div className="flex-1 overflow-y-auto p-4">{historyQuery.isLoading ? <div className="flex justify-center py-12"><Loader2 className="animate-spin text-emerald-700"/></div> : historyQuery.isError ? <div role="alert" className="rounded-xl bg-rose-50 p-3 text-xs text-rose-800"><p>{errorText(historyQuery.error, 'view status history')}</p><button type="button" onClick={() => historyQuery.refetch()} className="mt-2 font-bold underline">Retry</button></div> : !validHistory ? <div role="alert" className="rounded-xl bg-rose-50 p-3 text-xs text-rose-800">Status history response did not match the documented format.</div> : events.length === 0 ? <div className="py-12 text-center"><History size={24} className="mx-auto text-zinc-300"/><h3 className="mt-2 text-sm font-bold text-zinc-800">No recorded status history</h3><p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-zinc-500">This history begins when status tracking was deployed. An empty history does not show whether changes happened earlier.</p></div> : <div className="space-y-2">{events.map((entry, index) => <article key={entry.id || `${entry.action}-${index}`} className="rounded-xl border border-zinc-100 px-3 py-2.5"><div className="flex flex-wrap items-center justify-between gap-2"><span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${entry.action === 'ENABLED' ? 'bg-emerald-50 text-emerald-700' : entry.action === 'DISABLED' ? 'bg-rose-50 text-rose-700' : 'bg-zinc-100 text-zinc-700'}`}>{entry.action || 'Action not available'}</span><time className="text-[11px] font-medium text-zinc-500">{dateText(entry.createdAt || entry.timestamp)}</time></div><dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2 text-xs"><div><dt className="text-[9px] font-bold uppercase text-zinc-400">Actor</dt><dd className="mt-0.5 break-words font-semibold text-zinc-800">{entityText(entry.actor)}</dd></div><div><dt className="text-[9px] font-bold uppercase text-zinc-400">Target</dt><dd className="mt-0.5 break-words font-semibold text-zinc-800">{entityText(entry.target)}</dd></div><div className="col-span-2"><dt className="text-[9px] font-bold uppercase text-zinc-400">Reason</dt><dd className="mt-0.5 whitespace-pre-wrap break-words text-zinc-700">{entry.reason || 'Not provided'}</dd></div></dl></article>)}</div>}</div>
                {validHistory && <Pagination pagination={historyPagination} page={historyPage} setPage={setHistoryPage}/>}
            </section></div>}
        </div>
    );
};

export default SuperAdminAccounts;
