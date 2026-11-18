import React, { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AlertCircle, Bell, Bike, Check, CheckCircle2, ChevronDown, Loader2, Store, Users, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../api/api';
import { useAuthStore } from '../../store/useAuthStore';

const audiences = [
    { id: 'SINGLE', label: 'One person', description: 'Send to a specific account', icon: UserRound },
    { id: 'ALL_USERS', label: 'All users', description: 'Send to all users', icon: Users },
    { id: 'ALL_CUSTOMERS', label: 'Customers', description: 'Customer accounts only', icon: Users },
    { id: 'ALL_VENDORS', label: 'Vendors', description: 'Vendor accounts only', icon: Store },
    { id: 'ALL_RIDERS', label: 'Riders', description: 'Rider accounts only', icon: Bike },
];

const categories = [
    { id: 'PROMO', label: 'Promotion', color: 'bg-emerald-500' },
    { id: 'SYSTEM', label: 'System update', color: 'bg-blue-500' },
    { id: 'SECURITY', label: 'Security', color: 'bg-rose-500' },
    { id: 'PAYMENT', label: 'Payment', color: 'bg-amber-500' },
    { id: 'ORDER', label: 'Order information', color: 'bg-zinc-500' },
];

const fieldClass = 'mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-3 text-sm text-zinc-800 outline-none transition placeholder:text-zinc-400 focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10';

const recipientRows = (role, body) => {
    const data = body?.data;
    if (role === 'USER') return data?.users?.data || data?.data || [];
    if (role === 'VENDOR') return data?.data || data?.vendors?.data || [];
    return data?.data || data?.riders?.data || [];
};

const recipientOption = (role, row) => {
    if (role === 'VENDOR') {
        return {
            id: row.vendorId || row.id,
            name: row.storeName || row.ownerName || 'Vendor',
            phone: row.phonenumber || row.phone || '',
            email: row.email || '',
        };
    }
    if (role === 'RIDER') {
        return {
            id: row.id,
            name: row.name || 'Rider',
            phone: row.phone || row.phonenumber || '',
            email: row.email || '',
        };
    }
    return {
        id: row.id,
        name: `${row.firstname || ''} ${row.lastname || ''}`.trim() || row.name || 'Customer',
        phone: row.phonenumber || row.phone || '',
        email: row.email || '',
    };
};

const overviewName = (role, account) => {
    if (!account) return '';
    if (role === 'VENDOR') return account.storeName || account.ownerName || '';
    if (role === 'RIDER') return account.name || account.rider?.name || '';
    return `${account.firstname || ''} ${account.lastname || ''}`.trim() || account.name || '';
};

const recipientListPath = (role, query) => {
    const search = query.trim();
    if (role === 'VENDOR') {
        return search
            ? `/superadmin/vendors/search?${new URLSearchParams({ query: search, page: '1', limit: '20' })}`
            : '/superadmin/vendors?filter=all&sortBy=date_newest&page=1&limit=20';
    }
    if (role === 'RIDER') {
        return search
            ? `/superadmin/riders/search?${new URLSearchParams({ query: search, page: '1' })}`
            : '/superadmin/riders?filter=all&sortBy=date_newest&page=1';
    }
    return search
        ? `/superadmin/users/search?${new URLSearchParams({ query: search, page: '1' })}`
        : '/superadmin/users?filter=all&sortBy=date_newest&page=1';
};

const PushNotifications = () => {
    const token = useAuthStore((state) => state.accessToken);
    const [audience, setAudience] = useState('ALL_USERS');
    const [targetRole, setTargetRole] = useState('USER');
    const [actorId, setActorId] = useState('');
    const [recipientQuery, setRecipientQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [recipientOpen, setRecipientOpen] = useState(false);
    const [selectedRecipient, setSelectedRecipient] = useState(null);
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [type, setType] = useState('PROMO');
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(recipientQuery), 250);
        return () => clearTimeout(timer);
    }, [recipientQuery]);

    const sendMutation = useMutation({
        mutationFn: (data) => api.post('/notification/broadcast', data, token),
        onSuccess: (response) => {
            setShowSuccess(true);
            setTitle('');
            setBody('');
            setActorId('');
            setRecipientQuery('');
            setSelectedRecipient(null);
            toast.success(response?.message || 'Notification sent.');
        },
    });

    const { data: accountData, isFetching: isVerifying, error: verifyError } = useQuery({
        queryKey: ['verifyNotificationTarget', targetRole, actorId],
        queryFn: () => {
            const id = encodeURIComponent(actorId.trim());
            const endpoint = targetRole === 'USER'
                ? `/superadmin/users/${id}/overview`
                : targetRole === 'VENDOR'
                    ? `/superadmin/vendors/${id}/overview?filter=all`
                    : `/superadmin/riders/${id}/overview?filter=all`;
            return api.get(endpoint, token);
        },
        enabled: Boolean(actorId.trim() && actorId.trim().length > 5 && audience === 'SINGLE'),
        retry: false,
    });

    const { data: recipientData, isFetching: isSearching, error: searchError } = useQuery({
        queryKey: ['notificationRecipients', targetRole, debouncedQuery],
        queryFn: () => api.get(recipientListPath(targetRole, debouncedQuery), token),
        enabled: audience === 'SINGLE',
        retry: false,
    });

    const account = accountData?.data;
    const verifiedName = overviewName(targetRole, account);
    const chosenName = selectedRecipient?.id === actorId.trim() ? selectedRecipient.name : '';
    const accountName = chosenName || verifiedName;
    const recipients = recipientRows(targetRole, recipientData).map((row) => recipientOption(targetRole, row)).filter((row) => row.id);

    const chooseRecipient = (option) => {
        setSelectedRecipient(option);
        setActorId(option.id);
        setRecipientQuery(option.name);
        setRecipientOpen(false);
        setShowSuccess(false);
    };

    const changeRole = (role) => {
        setTargetRole(role);
        setActorId('');
        setRecipientQuery('');
        setSelectedRecipient(null);
        setShowSuccess(false);
    };

    const sendNotification = (event) => {
        event.preventDefault();
        if (!title.trim() || !body.trim() || (audience === 'SINGLE' && !accountName)) return;
        const payload = { audience, title: title.trim(), body: body.trim(), type };
        if (audience === 'SINGLE') {
            payload.targetRole = targetRole;
            payload.actorId = actorId.trim();
        }
        sendMutation.mutate(payload);
    };

    return (
        <div className="w-full space-y-5 pb-10">
            <form onSubmit={sendNotification} className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
                <header className="border-b border-zinc-100 px-5 py-4 sm:px-6">
                    <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800"><Bell size={19} /></span>
                        <div><h2 className="text-base font-bold text-zinc-900">New notification</h2><p className="mt-0.5 text-xs text-zinc-500">Send a one-off update to an account or supported audience.</p></div>
                    </div>
                </header>

                <div className="space-y-6 p-5 sm:p-6">
                    {showSuccess && <div role="status" className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5">
                        <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-700" />
                        <div className="min-w-0 flex-1"><p className="text-sm font-semibold text-emerald-900">Notification request accepted</p><p className="mt-0.5 text-xs leading-5 text-emerald-800">The notification service accepted the request. This does not confirm that it appeared on a device.</p></div>
                        <button type="button" onClick={() => { setShowSuccess(false); sendMutation.reset(); }} className="shrink-0 text-xs font-semibold text-emerald-900 underline underline-offset-2">Send another</button>
                    </div>}

                    <fieldset>
                        <legend className="text-sm font-semibold text-zinc-900">Target audience</legend>
                        <p className="mt-1 text-xs text-zinc-500">Choose who should receive this one-off notification.</p>
                        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                            {audiences.map(({ id, label, description, icon: Icon }) => {
                                const selected = audience === id;
                                return <button key={id} type="button" aria-pressed={selected} onClick={() => { setAudience(id); setShowSuccess(false); }} className={`flex min-h-[68px] items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition focus:outline-none focus:ring-2 focus:ring-emerald-700/20 ${selected ? 'border-emerald-600 bg-emerald-50/70' : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'}`}>
                                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${selected ? 'bg-emerald-700 text-white' : 'bg-zinc-100 text-zinc-500'}`}><Icon size={17} /></span>
                                    <span className="min-w-0 flex-1"><span className={`block text-xs font-semibold ${selected ? 'text-emerald-900' : 'text-zinc-800'}`}>{label}</span><span className="mt-0.5 block text-[10px] leading-4 text-zinc-500">{description}</span></span>
                                    {selected && <Check size={16} className="shrink-0 text-emerald-700" />}
                                </button>;
                            })}
                        </div>
                    </fieldset>

                    {audience === 'SINGLE' && <section className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-4">
                        <div><h3 className="text-xs font-semibold text-zinc-900">Recipient</h3><p className="mt-1 text-[11px] text-zinc-500">Search by name, phone, or email. The account ID fills in when you choose someone.</p></div>
                        <div className="mt-3 flex max-w-sm rounded-lg bg-zinc-100 p-1">{['USER', 'VENDOR', 'RIDER'].map((role) => <button key={role} type="button" onClick={() => changeRole(role)} className={`flex-1 rounded-md py-2 text-[11px] font-semibold transition ${targetRole === role ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-800'}`}>{role === 'USER' ? 'Customer' : role[0] + role.slice(1).toLowerCase()}</button>)}</div>
                        <div className="relative mt-3 max-w-lg">
                            <label htmlFor="recipient-search" className="text-xs font-semibold text-zinc-700">Find account</label>
                            <input id="recipient-search" aria-label="Find recipient" value={recipientQuery} onFocus={() => setRecipientOpen(true)} onChange={(event) => { setRecipientQuery(event.target.value); setRecipientOpen(true); setShowSuccess(false); }} placeholder="Search name, phone, or email" className={fieldClass} />
                            {recipientOpen && <div role="listbox" aria-label="Matching accounts" className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-zinc-200 bg-white p-1 shadow-xl">
                                {isSearching && <p className="px-3 py-2 text-xs text-zinc-500">Looking up accounts…</p>}
                                {searchError && <p role="alert" className="px-3 py-2 text-xs text-rose-700">Could not load accounts.</p>}
                                {!isSearching && !searchError && recipients.length === 0 && <p className="px-3 py-2 text-xs text-zinc-500">No accounts match that search.</p>}
                                {recipients.map((option) => <button key={option.id} type="button" role="option" aria-selected={actorId === option.id} onClick={() => chooseRecipient(option)} className="flex w-full flex-col rounded-lg px-3 py-2 text-left hover:bg-emerald-50">
                                    <span className="text-sm font-semibold text-zinc-900">{option.name}</span>
                                    <span className="text-[11px] text-zinc-500">{[option.phone, option.email, option.id].filter(Boolean).join(' · ')}</span>
                                </button>)}
                            </div>}
                        </div>
                        <div className="mt-3 max-w-lg">
                            <label htmlFor="account-id" className="text-xs font-semibold text-zinc-700">Account ID</label>
                            <div className="relative"><input id="account-id" aria-label="Account ID" value={actorId} onChange={(event) => { setActorId(event.target.value); setSelectedRecipient(null); setShowSuccess(false); }} placeholder="Filled when you choose an account" className={`${fieldClass} pr-10`} />{isVerifying && <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-emerald-700" />}</div>
                            {accountName && <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-800"><CheckCircle2 size={14} />Recipient: {accountName}</p>}
                            {verifyError && actorId.length > 5 && !chosenName && <p role="alert" className="mt-2 text-xs text-rose-700">Could not verify this account ID. Check the ID and try again.</p>}
                        </div>
                    </section>}

                    <section className="grid gap-5 border-t border-zinc-100 pt-5 md:grid-cols-2">
                        <div>
                            <label id="notification-category-label" className="text-sm font-semibold text-zinc-900">Category</label>
                            <div className="relative mt-2">
                                <button type="button" aria-labelledby="notification-category-label" aria-haspopup="listbox" aria-expanded={isCategoryOpen} onClick={() => setIsCategoryOpen((open) => !open)} onKeyDown={(event) => { if (event.key === 'Escape') setIsCategoryOpen(false); }} className="flex w-full items-center justify-between rounded-xl border border-zinc-200 bg-white px-3.5 py-3 text-left text-sm text-zinc-800 outline-none transition hover:border-zinc-300 focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10">
                                    <span className="flex items-center gap-2"><i className={`h-2 w-2 rounded-full ${categories.find((category) => category.id === type)?.color}`} />{categories.find((category) => category.id === type)?.label || 'Choose category'}</span><ChevronDown size={16} className={`text-zinc-500 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {isCategoryOpen && <div role="listbox" aria-labelledby="notification-category-label" className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-zinc-200 bg-white p-1 shadow-xl">{categories.map((category) => <button key={category.id} type="button" role="option" aria-selected={type === category.id} onClick={() => { setType(category.id); setIsCategoryOpen(false); }} className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs transition ${type === category.id ? 'bg-emerald-50 font-semibold text-emerald-900' : 'text-zinc-700 hover:bg-zinc-50'}`}><i className={`h-2 w-2 rounded-full ${category.color}`} />{category.label}{type === category.id && <Check size={14} className="ml-auto text-emerald-700" />}</button>)}</div>}
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div><label htmlFor="notification-title" className="text-sm font-semibold text-zinc-900">Notification title</label><input id="notification-title" required maxLength={120} value={title} onChange={(event) => { setTitle(event.target.value); setShowSuccess(false); }} placeholder="A clear, concise title" className={fieldClass} /></div>
                            <div><label htmlFor="notification-body" className="text-sm font-semibold text-zinc-900">Message</label><textarea id="notification-body" required rows={6} maxLength={2000} value={body} onChange={(event) => { setBody(event.target.value); setShowSuccess(false); }} placeholder="Write the message you want to send…" className={`${fieldClass} resize-y leading-5`} /></div>
                        </div>
                    </section>

                    {sendMutation.isError && <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800"><AlertCircle size={16} className="mt-0.5 shrink-0" /><p>{sendMutation.error?.response?.data?.message || sendMutation.error?.message || 'Could not send the notification. Please try again.'}</p></div>}
                </div>

                <footer className="flex flex-col gap-3 border-t border-zinc-100 bg-zinc-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <p className="text-[11px] leading-4 text-zinc-500">This is a one-off message sent through the Notification service.</p>
                    <button type="submit" disabled={!title.trim() || !body.trim() || (audience === 'SINGLE' && !accountName) || sendMutation.isPending} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-48">
                        {sendMutation.isPending ? <><Loader2 size={16} className="animate-spin" />Sending…</> : <>Send notification <Bell size={15} /> </>}
                    </button>
                </footer>
            </form>
        </div>
    );
};

export default PushNotifications;
