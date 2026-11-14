import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, ChevronLeft, ChevronRight, Loader2, ScrollText, X } from 'lucide-react';
import api from '../../api/api';
import { WalletDatePicker, WalletFilterDropdown } from '../../components/admin/wallet/WalletControls';
import { useAuthStore } from '../../store/useAuthStore';
import { formatShortDateTime } from '../../utils/formatters';
import {
    AUDIT_ACTIONS,
    AUDIT_PAGE_SIZE,
    AUDIT_QUERY_MAX,
    AUDIT_TARGET_TYPES,
    actionLabel,
    actorLabel,
    auditFilterError,
    auditListPath,
    outcomeLabel,
    presentSnapshot,
    targetLabel,
} from './auditEventUtils';

const emptyFilters = {
    q: '',
    action: '',
    targetType: '',
    targetId: '',
    actorAdminId: '',
    from: '',
    to: '',
    limit: AUDIT_PAGE_SIZE,
};

const dateText = (value) => value ? formatShortDateTime(value) : 'Not available';
const readableSnapshotDate = (value) => {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T/.test(value)) return value;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : formatShortDateTime(date);
};

const auditTimes = Array.from({ length: 48 }, (_, index) => {
    const value = `${String(Math.floor(index / 2)).padStart(2, '0')}:${index % 2 ? '30' : '00'}`;
    return { value, label: value };
});

const AuditDateTimeFilter = ({ label, value, onChange, endOfDay = false }) => {
    const date = value ? value.slice(0, 10) : '';
    const selectedTime = value ? value.slice(11, 16) : '';
    const times = selectedTime && !auditTimes.some((option) => option.value === selectedTime)
        ? [{ value: selectedTime, label: selectedTime }, ...auditTimes]
        : auditTimes;

    return <div className="min-w-0"><div className="grid grid-cols-[minmax(0,1fr)_6.5rem] gap-2"><WalletDatePicker label={label} value={date} onChange={(nextDate) => onChange(nextDate ? `${nextDate}T${selectedTime || (endOfDay ? '23:59' : '00:00')}` : '')} />{date ? <WalletFilterDropdown label="Time" selected={selectedTime} options={times} onSelect={(time) => onChange(`${date}T${time}`)} fullWidth /> : <div><span className="mb-2 block text-xs font-semibold text-zinc-700">Time</span><div className="flex min-h-11 items-center rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-xs text-zinc-400">Pick a date</div></div>}</div></div>;
};

const errorText = (error, fallback) => {
    if (error?.status === 401) return 'Your Super Admin session has expired. Sign in again to continue.';
    if (error?.status === 403) return error.message || 'Your Super Admin account does not have permission to view the audit trail.';
    if (error?.status === 404) return error.message || 'This audit event could not be found.';
    if (error?.status === 429) {
        const guidance = [
            error.retryAfter ? `Retry-After ${error.retryAfter}` : '',
            error.rateLimitReset ? `RateLimit-Reset ${error.rateLimitReset}` : '',
        ].filter(Boolean);
        const message = error.message || 'Too many requests. Please wait and try again.';
        return guidance.length ? `${message} (${guidance.join('; ')}).` : message;
    }
    if (error?.transportError || !error?.status) return error?.message || 'Network error. Could not reach the server; please try again.';
    return error?.message || fallback;
};

const validPagination = (pagination) => Number.isInteger(pagination?.page)
    && Number.isInteger(pagination?.limit)
    && Number.isInteger(pagination?.total)
    && Number.isInteger(pagination?.totalPages);

const SNAPSHOT_LABELS = {
    kind: 'Item type', change: 'Change', isActive: 'Visibility', status: 'Status', title: 'Title', name: 'Name',
    audience: 'Audience', pushEnabled: 'Push notifications', priority: 'Priority', dismissible: 'Dismissible',
    summary: 'Summary', category: 'Category', reason: 'Reason', isVerified: 'Verified', isSuspended: 'Suspended',
    email: 'Email', phone: 'Phone', storeName: 'Store', productName: 'Product', vendorName: 'Vendor',
};
const TECHNICAL_SNAPSHOT_KEYS = new Set(['id', 'promotionid', 'placementid', 'productid', 'vendorid']);
const isSensitiveSnapshotKey = (key) => /password|otp|token|cookie|secret|authorization|credential|accountnumber|bankaccount|encrypted|rawbody|requestbody/i.test(String(key).replace(/[_\s-]/g, ''));
const snapshotLabel = (key) => SNAPSHOT_LABELS[key] || key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_-]/g, ' ').replace(/^./, (letter) => letter.toUpperCase());
const readableSnapshotText = (key, text) => {
    const normalized = key.toLowerCase();
    if (normalized === 'isactive' || normalized === 'issuspended' || normalized === 'isverified' || normalized === 'dismissible' || normalized === 'pushenabled') {
        if (text === 'true') return normalized === 'isactive' ? 'Visible' : 'Yes';
        if (text === 'false') return normalized === 'isactive' ? 'Hidden' : 'No';
    }
    return text;
};

const SnapshotValue = ({ value }) => {
    if (!value || value.kind === 'empty') return <span className="text-zinc-400">Not recorded</span>;
    if (value.kind === 'restricted') return <span className="font-semibold text-zinc-500">Restricted</span>;
    if (value.kind === 'text') return <span className="break-words">{value.text}</span>;
    if (value.kind === 'list') {
        if (!value.items.length) return <span className="text-zinc-400">Not recorded</span>;
        return <ul className="space-y-1">{value.items.map((item, index) => <li key={index}><SnapshotValue value={item} /></li>)}</ul>;
    }
    if (value.kind === 'object') {
        const visibleEntries = value.entries.filter((entry) => !TECHNICAL_SNAPSHOT_KEYS.has(entry.key.toLowerCase()));
        if (!visibleEntries.length) return <span className="text-zinc-400">Technical identifiers are available under Technical event details.</span>;
        return (
            <dl className="space-y-1">
                {visibleEntries.map((entry) => (
                    <div key={entry.key}>
                        <dt className="text-[10px] font-bold uppercase tracking-wide text-zinc-400">{snapshotLabel(entry.key)}</dt>
                        <dd className="text-zinc-800">{entry.value.kind === 'text' ? readableSnapshotText(entry.key, /(?:at|date|time)$/i.test(entry.key) ? readableSnapshotDate(entry.value.text) : entry.value.text) : <SnapshotValue value={entry.value} />}</dd>
                    </div>
                ))}
            </dl>
        );
    }
    return <span className="text-zinc-400">Not recorded</span>;
};

const snapshotObject = (value) => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
const snapshotValue = (value, key) => Object.entries(snapshotObject(value)).find(([entryKey]) => entryKey.toLowerCase() === key.toLowerCase())?.[1];
const promotionIdForEvent = (event) => {
    if (event?.targetType === 'promotion') return event.targetId;
    if (event?.targetType !== 'promotion_placement') return null;
    return snapshotValue(event.after, 'promotionId') || snapshotValue(event.before, 'promotionId') || null;
};
const snapshotChangeSummary = (event) => {
    const before = snapshotObject(event?.before);
    const after = snapshotObject(event?.after);
    const keys = [...new Set([...Object.keys(before), ...Object.keys(after)])].filter((key) => !TECHNICAL_SNAPSHOT_KEYS.has(key.toLowerCase()) && !isSensitiveSnapshotKey(key));
    const summaries = keys.map((key) => {
        const oldValue = before[key];
        const newValue = after[key];
        const renderValue = (value) => value === undefined ? 'Not recorded' : typeof value === 'boolean' ? readableSnapshotText(key, String(value)) : value == null ? 'Not recorded' : typeof value === 'object' ? '' : /(?:at|date|time)$/i.test(key) ? readableSnapshotDate(String(value)) : String(value);
        const oldText = renderValue(oldValue);
        const newText = renderValue(newValue);
        if (!oldText && !newText) return null;
        if (oldValue !== undefined && newValue !== undefined && oldText !== newText) return `${snapshotLabel(key)}: ${oldText} → ${newText}`;
        return `${snapshotLabel(key)}: ${newText || oldText}`;
    }).filter(Boolean);
    return summaries;
};
const humanizeValue = (value) => value == null || value === '' ? 'Not recorded' : String(value).replaceAll('_', ' ').toLocaleLowerCase().replace(/\b\p{L}/gu, (letter) => letter.toLocaleUpperCase());
const AuditDetailField = ({ label, children, className = '' }) => <div className={className}><dt className="text-[10px] font-bold uppercase tracking-wide text-zinc-400">{label}</dt><dd className="mt-1 break-words text-sm font-medium text-zinc-800">{children || 'Not recorded'}</dd></div>;

const AuditDetail = ({ event, promotion }) => {
    const before = snapshotObject(event.before);
    const after = snapshotObject(event.after);
    const audience = snapshotValue(after, 'audience') ?? snapshotValue(before, 'audience');
    const status = snapshotValue(after, 'status') ?? snapshotValue(before, 'status');
    const pushEnabled = snapshotValue(after, 'pushEnabled');
    const hasBefore = Object.keys(before).length > 0;
    const hasAfter = Object.keys(after).length > 0;
    const changedFields = snapshotChangeSummary(event);
    const placementId = event.targetType === 'promotion_placement' ? event.targetId : null;
    const placement = promotion?.placements?.find((entry) => entry.id === placementId);
    const targetName = event.targetType === 'promotion_placement'
        ? placement?.product?.name || promotion?.title
        : event.targetType === 'promotion' ? promotion?.title : null;
    return <div className="space-y-5">
        <section className="rounded-2xl border border-[#202b43] bg-[#0F172B] p-4 shadow-sm sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">{targetLabel(event.targetType)}</p><h3 className="mt-1 text-lg font-bold text-white">{actionLabel(event.action)}</h3></div><span className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-200">{outcomeLabel(event.outcome)}</span></div>
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4">
                <AuditDetailField className="[&>dt]:text-slate-300 [&>dd]:text-white" label="Audience">{humanizeValue(audience)}</AuditDetailField>
                <AuditDetailField className="[&>dt]:text-slate-300 [&>dd]:text-white" label="Campaign status">{humanizeValue(status)}</AuditDetailField>
                <AuditDetailField className="[&>dt]:text-slate-300 [&>dd]:text-white" label="Actor">{actorLabel(event)}</AuditDetailField>
                <AuditDetailField className="[&>dt]:text-slate-300 [&>dd]:text-white" label="Occurred">{dateText(event.occurredAt)}</AuditDetailField>
                {pushEnabled !== undefined && <AuditDetailField className="[&>dt]:text-slate-300 [&>dd]:text-white" label="Push enabled">{pushEnabled ? 'Yes' : 'No'}</AuditDetailField>}
                <AuditDetailField className="[&>dt]:text-slate-300 [&>dd]:text-white" label={targetName ? (event.targetType === 'promotion_placement' && placement?.product?.name ? 'Product changed' : 'Promotion') : 'Target ID'}>{targetName ? targetName : <span className="break-all font-mono text-xs">{event.targetId || 'Not recorded'}</span>}</AuditDetailField>
            </dl>
        </section>

        {event.reason && <section className="rounded-xl border border-zinc-200 p-4"><p className="text-[10px] font-bold uppercase tracking-wide text-zinc-400">Reason</p><p className="mt-1 whitespace-pre-wrap text-sm text-zinc-700">{event.reason}</p></section>}

        {(hasBefore || hasAfter) && <section>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-zinc-500">Recorded changes</h3>
            {targetName && <p className="mb-2 text-xs text-zinc-600">{event.targetType === 'promotion_placement' && placement?.product?.name ? <>Product <span className="font-semibold text-zinc-900">{placement.product.name}</span> in promotion <span className="font-semibold text-zinc-900">{promotion?.title || 'Promotion'}</span></> : <>Promotion <span className="font-semibold text-zinc-900">{targetName}</span></>}</p>}
            {changedFields.length > 0 && <div className="mb-3 rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3"><p className="text-[10px] font-bold uppercase tracking-wide text-emerald-800">What changed</p><ul className="mt-1 space-y-1 text-sm font-medium text-zinc-800">{changedFields.map((change) => <li key={change}>{change}</li>)}</ul></div>}
            <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-zinc-200 bg-white p-3"><h4 className="text-[10px] font-bold uppercase tracking-wide text-zinc-400">Before</h4><div className="mt-2 max-h-56 overflow-y-auto text-xs">{hasBefore ? <SnapshotValue value={presentSnapshot(event.before)} /> : <span className="text-zinc-400">No previous state recorded</span>}</div></div>
                <div className="rounded-xl border border-zinc-200 bg-white p-3"><h4 className="text-[10px] font-bold uppercase tracking-wide text-zinc-400">After</h4><div className="mt-2 max-h-56 overflow-y-auto text-xs">{hasAfter ? <SnapshotValue value={presentSnapshot(event.after)} /> : <span className="text-zinc-400">No resulting state recorded</span>}</div></div>
            </div>
        </section>}

        <details className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
            <summary className="cursor-pointer text-xs font-semibold text-zinc-700">Technical event details</summary>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                <AuditDetailField label="Event ID"><span className="font-mono text-[11px]">{event.id}</span></AuditDetailField>
                <AuditDetailField label="Target ID"><span className="break-all font-mono text-[11px]">{event.targetId || 'Not recorded'}</span></AuditDetailField>
                <AuditDetailField label="Actor type">{humanizeValue(event.actorKind)}</AuditDetailField>
                <AuditDetailField label="Action code"><span className="font-mono text-[11px]">{event.action || 'Not recorded'}</span></AuditDetailField>
                <AuditDetailField label="Source event"><span className="font-mono text-[11px]">{event.sourceEventType || event.sourceEventId ? `${event.sourceEventType || 'Type not recorded'} · ${event.sourceEventId || 'ID not recorded'}` : 'Not recorded'}</span></AuditDetailField>
                <AuditDetailField label="Request ID"><span className="break-all font-mono text-[11px]">{event.requestId || 'Not recorded'}</span></AuditDetailField>
                <AuditDetailField label="Idempotency key"><span className="break-all font-mono text-[11px]">{event.idempotencyKey || 'Not recorded'}</span></AuditDetailField>
            </dl>
        </details>
    </div>;
};

const Pagination = ({ pagination, page, setPage }) => pagination?.total > 0 && (
    <footer className="flex flex-col gap-2 border-t border-zinc-100 px-4 py-3 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
        <span>Showing {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}</span>
        <div className="flex items-center gap-2">
            <button type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)} className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft size={14} />Previous</button>
            <span>Page {pagination.page} of {pagination.totalPages}</span>
            <button type="button" disabled={page >= pagination.totalPages} onClick={() => setPage((current) => current + 1)} className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-40">Next<ChevronRight size={14} /></button>
        </div>
    </footer>
);

const AuditEvents = () => {
    const token = useAuthStore((state) => state.accessToken);
    const [filters, setFilters] = useState(emptyFilters);
    const [debouncedQ, setDebouncedQ] = useState('');
    const [page, setPage] = useState(1);
    const [selectedId, setSelectedId] = useState(null);

    useEffect(() => {
        const timer = window.setTimeout(() => setDebouncedQ(filters.q.trim().slice(0, AUDIT_QUERY_MAX)), 250);
        return () => window.clearTimeout(timer);
    }, [filters.q]);

    const queryFilters = { ...filters, q: debouncedQ };
    const filterError = auditFilterError(queryFilters);
    const listQuery = useQuery({
        queryKey: ['super-admin-audit-events', page, queryFilters],
        queryFn: () => api.get(auditListPath(queryFilters, page), token),
        enabled: Boolean(token) && !filterError,
        retry: false,
    });
    const detailQuery = useQuery({
        queryKey: ['super-admin-audit-event', selectedId],
        queryFn: () => api.get(`/superadmin/audit-events/${encodeURIComponent(selectedId)}`, token),
        enabled: Boolean(token && selectedId),
        retry: false,
    });

    const updateFilter = (key, value) => {
        setFilters((current) => ({ ...current, [key]: value }));
        setPage(1);
    };

    const filtersActive = Boolean(filters.q || filters.action || filters.targetType || filters.targetId || filters.actorAdminId || filters.from || filters.to || Number(filters.limit) !== AUDIT_PAGE_SIZE);
    const payload = listQuery.data?.data;
    const events = payload?.events;
    const pagination = payload?.pagination;
    const validList = Array.isArray(events) && validPagination(pagination);
    const detailPayload = detailQuery.data?.data;
    const detailEvent = detailPayload?.event;
    const validDetail = detailEvent && typeof detailEvent.id === 'string';
    const promotionLookupId = promotionIdForEvent(detailEvent);
    const promotionQuery = useQuery({
        queryKey: ['audit-promotion-lookup', promotionLookupId],
        queryFn: () => api.get(`/superadmin/promotions/${encodeURIComponent(promotionLookupId)}`, token),
        enabled: Boolean(token && promotionLookupId && selectedId),
        retry: false,
    });
    const linkedPromotion = promotionQuery.data?.data?.promotion;

    return (
        <div className="mx-auto w-full max-w-[1600px] space-y-5 pb-10">
            <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="mb-4 flex items-center justify-between gap-3"><div><h2 className="text-sm font-bold text-zinc-900">Search and filters</h2><p className="mt-1 text-[11px] text-zinc-500">Filter recorded Super Admin actions.</p></div>{filtersActive && <button type="button" onClick={() => { setFilters(emptyFilters); setDebouncedQ(''); setPage(1); }} className="rounded-lg border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50">Reset filters</button>}</div>
                <label className="block text-xs font-semibold text-zinc-700">Search events
                    <input type="search" value={filters.q} maxLength={AUDIT_QUERY_MAX} onChange={(event) => updateFilter('q', event.target.value.slice(0, AUDIT_QUERY_MAX))} placeholder="Search by ID, action, reason, or reference" className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-xs font-normal outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-600/10" />
                </label>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_8rem]">
                    <WalletFilterDropdown label="Action" selected={filters.action} options={[{ value: '', label: 'All actions' }, ...AUDIT_ACTIONS.map((action) => ({ value: action, label: actionLabel(action) }))]} onSelect={(value) => updateFilter('action', value)} fullWidth />
                    <WalletFilterDropdown label="Target type" selected={filters.targetType} options={[{ value: '', label: 'All target types' }, ...AUDIT_TARGET_TYPES.map((type) => ({ value: type, label: targetLabel(type) }))]} onSelect={(value) => updateFilter('targetType', value)} fullWidth />
                    <WalletFilterDropdown label="Rows" selected={filters.limit} options={[20, 50, 100].map((size) => ({ value: size, label: String(size) }))} onSelect={(value) => updateFilter('limit', Number(value))} fullWidth />
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <label className="block text-xs font-semibold text-zinc-700">Target ID<input value={filters.targetId} maxLength={128} onChange={(event) => updateFilter('targetId', event.target.value)} placeholder="Filter by target" className="mt-1.5 w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-xs font-normal outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10" /></label>
                    <label className="block text-xs font-semibold text-zinc-700">Actor ID<input value={filters.actorAdminId} maxLength={64} onChange={(event) => updateFilter('actorAdminId', event.target.value)} placeholder="Filter by actor" className="mt-1.5 w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-xs font-normal outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10" /></label>
                </div>
                <div className="mt-3 grid gap-3 lg:grid-cols-2">
                    <AuditDateTimeFilter label="From" value={filters.from} onChange={(value) => updateFilter('from', value)} />
                    <AuditDateTimeFilter label="To" value={filters.to} onChange={(value) => updateFilter('to', value)} endOfDay />
                </div>
                <p className="mt-3 text-[11px] leading-4 text-zinc-500">Search covers event and target IDs, action, reason, source reference, and idempotency key. Results follow server order.</p>
                {filterError && <p role="alert" className="mt-3 rounded-xl bg-rose-50 p-3 text-xs text-rose-800">{filterError}</p>}
            </section>

            <section className="overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm">
                {!token ? <div role="alert" className="m-4 rounded-xl bg-rose-50 p-4 text-sm text-rose-800">Your Super Admin session is unavailable. Sign in again to continue.</div>
                    : filterError ? <div className="px-5 py-16 text-center text-xs text-zinc-500">Fix the filters before loading audit events.</div>
                        : listQuery.isLoading ? <div className="flex items-center justify-center gap-2 py-16 text-xs text-zinc-500"><Loader2 size={17} className="animate-spin text-emerald-700" />Loading audit events…</div>
                            : listQuery.isError ? <div role="alert" className="m-4 flex items-start gap-3 rounded-xl bg-rose-50 p-4 text-sm text-rose-800"><AlertCircle size={17} className="mt-0.5 shrink-0" /><div><p>{errorText(listQuery.error, 'The audit trail could not be loaded.')}</p><button type="button" onClick={() => listQuery.refetch()} className="mt-2 font-bold underline">Retry</button></div></div>
                                : !validList ? <div role="alert" className="m-4 rounded-xl bg-rose-50 p-4 text-sm text-rose-800">The audit events response did not match the documented format.</div>
                                    : events.length === 0 ? <div className="px-5 py-16 text-center"><ScrollText size={28} className="mx-auto text-zinc-300" /><h3 className="mt-3 text-sm font-bold text-zinc-800">{filtersActive ? 'No matching audit events' : 'No audit events yet'}</h3><p className="mt-1 text-xs text-zinc-500">{filtersActive ? 'Try adjusting your filters.' : 'Recorded Super Admin actions will appear here.'}</p></div>
                                        : <div className="overflow-x-auto"><table className="w-full min-w-[880px] text-left"><thead className="border-b border-zinc-100 bg-zinc-50"><tr>{['Timestamp', 'Actor', 'Action', 'Target / change', 'Outcome', ''].map((heading) => <th key={heading || 'action'} className="px-3 py-3 text-[10px] font-bold uppercase tracking-wide text-zinc-400">{heading}</th>)}</tr></thead><tbody className="divide-y divide-zinc-100">{events.map((event) => { const changes = snapshotChangeSummary(event); const target = event.targetType === 'promotion_placement' ? changes.find((change) => change.startsWith('Visibility:')) || changes.find((change) => change.startsWith('Change:')) : null; return <tr key={event.id} className="hover:bg-zinc-50/70"><td className="whitespace-nowrap px-3 py-3 text-xs text-zinc-600">{dateText(event.occurredAt)}</td><td className="px-3 py-3 text-xs font-semibold text-zinc-800">{actorLabel(event)}</td><td className="px-3 py-3 text-xs text-zinc-800"><span className="font-semibold">{actionLabel(event.action)}</span><span className="mt-0.5 block font-mono text-[10px] text-zinc-400">{event.action || 'Action not recorded'}</span></td><td className="px-3 py-3 text-xs text-zinc-700"><span className="font-medium">{targetLabel(event.targetType)}</span>{target && <span className="mt-0.5 block font-semibold text-zinc-900">{target}</span>}<span className="mt-0.5 block break-all font-mono text-[10px] text-zinc-400">Reference: {event.targetId || 'Not recorded'}</span></td><td className="px-3 py-3 text-xs font-semibold text-emerald-800">{outcomeLabel(event.outcome)}</td><td className="px-3 py-3 text-right"><button type="button" onClick={() => setSelectedId(event.id)} className="rounded-lg border px-2 py-1.5 text-[10px] font-semibold text-zinc-700 hover:bg-zinc-50">View</button></td></tr>; })}</tbody></table></div>}
                {validList && <Pagination pagination={pagination} page={page} setPage={setPage} />}
            </section>

            {selectedId && <div className="fixed inset-0 z-[110] flex justify-end bg-zinc-950/45 backdrop-blur-[2px]" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedId(null); }}><aside role="dialog" aria-modal="true" aria-labelledby="audit-detail-title" className="flex h-full w-full max-w-2xl flex-col bg-zinc-50 shadow-2xl"><header className="flex items-start justify-between border-b border-white/10 bg-[#0F172B] px-5 py-4"><div><p className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">Audit event</p><h2 id="audit-detail-title" className="mt-1 text-lg font-bold text-white">{validDetail ? actionLabel(detailEvent.action) : 'Event details'}</h2><p className="mt-1 text-xs text-slate-300">Review who performed this action and what changed.</p></div><button type="button" aria-label="Close audit event" onClick={() => setSelectedId(null)} className="rounded-lg p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"><X size={18} /></button></header><div className="flex-1 overflow-y-auto p-5">{detailQuery.isLoading ? <div className="flex justify-center py-12"><Loader2 className="animate-spin text-emerald-700" /></div> : detailQuery.isError ? <div role="alert" className="rounded-xl bg-rose-50 p-3 text-xs text-rose-800"><p>{errorText(detailQuery.error, 'This audit event could not be loaded.')}</p><button type="button" onClick={() => detailQuery.refetch()} className="mt-2 font-bold underline">Retry</button></div> : !validDetail ? <div role="alert" className="rounded-xl bg-rose-50 p-3 text-xs text-rose-800">The audit event response did not match the documented format.</div> : <AuditDetail event={detailEvent} promotion={linkedPromotion} />}</div></aside></div>}
        </div>
    );
};

export default AuditEvents;
