import { useEffect, useState } from 'react';
import { Eye, Loader2, Search, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/api';
import { useAuthStore } from '../../store/useAuthStore';
import { formatShortDateTime } from '../../utils/formatters';
import { WalletCustomDateModal, WalletFilterDropdown } from '../../components/admin/wallet/WalletControls';
import FinancialActivityDetailsPanel from '../../components/admin/FinancialActivityDetailsPanel';
import {
    FINANCIAL_ACTIVITY_PAGE_SIZE,
    SUMMARY_METRICS,
    activityAmountTone,
    activityStatusTone,
    buildFinancialActivityParams,
    buildFinancialActivitySummaryParams,
    displayText,
    domainLabel,
    eventTypeLabel,
    financialActivityDateOptions,
    financialActivityDomainOptions,
    financialActivityEventOptions,
    financialActivityStatusOptions,
    formatActivityAmount,
    formatKobo,
    isFinancialActivityList,
    readSummaryMetric,
    statusLabel,
} from './financialActivityUtils';

const SummaryCard = ({ metric, summary, loading }) => {
    const value = readSummaryMetric(summary, metric);
    return (
        <article className="rounded-xl border border-zinc-200 bg-white p-4">
            <h2 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{metric.label}</h2>
            {loading ? <div className="mt-3 h-6 w-28 animate-pulse rounded bg-zinc-200" /> : <p className="mt-2 text-lg font-bold text-zinc-900">{value.amountKobo == null ? '—' : formatKobo(value.amountKobo)}</p>}
            <p className="mt-1 text-xs font-semibold text-zinc-700">{loading ? '' : value.count == null ? '— records' : `${value.count.toLocaleString('en-NG')} records`}</p>
            <p className="mt-2 text-[10px] leading-4 text-zinc-500">{metric.detail}</p>
        </article>
    );
};

const ErrorPanel = ({ message, onRetry }) => (
    <div role="alert" className="px-5 py-12 text-center">
        <p className="text-sm font-semibold text-rose-700">{message || 'Could not load financial activity.'}</p>
        <button type="button" onClick={onRetry} className="mt-3 rounded-lg border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50">Retry</button>
    </div>
);

const Transactions = () => {
    const token = useAuthStore((state) => state.accessToken);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [domain, setDomain] = useState('ALL');
    const [eventType, setEventType] = useState('ALL');
    const [status, setStatus] = useState('ALL');
    const [dateFilter, setDateFilter] = useState('all_time');
    const [customDates, setCustomDates] = useState({ start: '', end: '' });
    const [draftDates, setDraftDates] = useState({ start: '', end: '' });
    const [previousDateFilter, setPreviousDateFilter] = useState('all_time');
    const [isDateModalOpen, setIsDateModalOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [selectedActivityId, setSelectedActivityId] = useState(null);

    useEffect(() => {
        const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 350);
        return () => window.clearTimeout(timer);
    }, [search]);

    const datesReady = dateFilter !== 'custom' || Boolean(customDates.start && customDates.end);
    const listParams = buildFinancialActivityParams({
        page,
        limit: FINANCIAL_ACTIVITY_PAGE_SIZE,
        query: debouncedSearch,
        domain,
        eventType,
        status,
        dateFilter,
        from: customDates.start,
        to: customDates.end,
    });
    const summaryParams = buildFinancialActivitySummaryParams({
        dateFilter,
        from: customDates.start,
        to: customDates.end,
    });

    const summaryQuery = useQuery({
        queryKey: ['financial-activity-summary', dateFilter, customDates.start, customDates.end],
        queryFn: () => api.get(`/superadmin/financial-activity/summary?${summaryParams.toString()}`, token),
        enabled: datesReady,
    });
    const listQuery = useQuery({
        queryKey: ['financial-activity', page, debouncedSearch, domain, eventType, status, dateFilter, customDates.start, customDates.end],
        queryFn: async () => {
            const response = await api.get(`/superadmin/financial-activity?${listParams.toString()}`, token);
            if (!isFinancialActivityList(response?.data)) {
                throw new Error('Financial activity response is incomplete.');
            }
            return response;
        },
        enabled: datesReady,
        placeholderData: (previous) => previous,
    });

    const summary = summaryQuery.data?.data;
    const pageData = listQuery.data?.data;
    const rows = pageData?.data || [];
    const total = pageData?.total;
    const pageSize = pageData?.pageSize || FINANCIAL_ACTIVITY_PAGE_SIZE;
    const pages = total == null ? null : Math.max(1, Math.ceil(total / pageSize));
    const rangeStart = rows.length && total != null ? (page - 1) * pageSize + 1 : 0;
    const rangeEnd = total == null ? rows.length : Math.min(page * pageSize, total);

    const updateFilter = (setter) => (value) => {
        setter(value);
        setPage(1);
    };
    const onDateFilter = (value) => {
        if (value === 'custom') {
            setPreviousDateFilter(dateFilter);
            setDraftDates(customDates);
            setIsDateModalOpen(true);
            return;
        }
        setDateFilter(value);
        setPage(1);
    };
    const closeDateModal = () => {
        setIsDateModalOpen(false);
        if (!customDates.start || !customDates.end) setDateFilter(previousDateFilter);
    };
    const clearFilters = () => {
        setSearch('');
        setDebouncedSearch('');
        setDomain('ALL');
        setEventType('ALL');
        setStatus('ALL');
        setDateFilter('all_time');
        setCustomDates({ start: '', end: '' });
        setPage(1);
    };
    const filtersActive = Boolean(search || domain !== 'ALL' || eventType !== 'ALL' || status !== 'ALL' || dateFilter !== 'all_time');

    return (
        <div className="mx-auto w-full max-w-[1600px] space-y-6 pb-10">
            <section className="rounded-2xl bg-white p-4">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                    {SUMMARY_METRICS.map((metric) => (
                        <SummaryCard key={metric.id} metric={metric} summary={summaryQuery.error ? null : summary} loading={summaryQuery.isLoading} />
                    ))}
                </div>
                <p className="mt-3 text-[11px] leading-5 text-zinc-500">These totals stay separate. The same order can create more than one financial effect, so they are not added into one volume.</p>
                {summaryQuery.error && <ErrorPanel message={summaryQuery.error.message} onRetry={() => summaryQuery.refetch()} />}
            </section>

            <section className="space-y-3 rounded-2xl bg-white p-4">
                <label className="relative block w-full min-w-0">
                    <span className="sr-only">Search financial activity</span>
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                    <input
                        type="search"
                        value={search}
                        onChange={(event) => {
                            setSearch(event.target.value);
                            setPage(1);
                        }}
                        maxLength={100}
                        placeholder="Search activity, order, user, or vendor"
                        className="w-full rounded-3xl bg-zinc-100 py-3.5 pl-12 pr-5 text-sm font-medium outline-none placeholder:text-zinc-500 focus:ring-2 focus:ring-emerald-500/10"
                    />
                </label>
                <div className="flex items-end gap-3">
                    <div className="grid min-w-0 flex-1 grid-cols-4 gap-3">
                        <WalletFilterDropdown fullWidth label="Domain" selected={domain} options={financialActivityDomainOptions} onSelect={updateFilter(setDomain)} />
                        <WalletFilterDropdown fullWidth label="Event" selected={eventType} options={financialActivityEventOptions} onSelect={updateFilter(setEventType)} />
                        <WalletFilterDropdown fullWidth label="Status" selected={status} options={financialActivityStatusOptions} onSelect={updateFilter(setStatus)} />
                        <WalletFilterDropdown fullWidth label="Date" selected={dateFilter} options={financialActivityDateOptions} onSelect={onDateFilter} />
                    </div>
                    {filtersActive && <button type="button" onClick={clearFilters} className="flex h-[42px] shrink-0 items-center justify-center gap-2 self-end rounded-xl bg-zinc-900 px-4 text-xs font-bold text-white hover:bg-zinc-800"><X size={14} /> Reset</button>}
                </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-zinc-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-base font-bold text-zinc-900">Financial activity</h1>
                        <p className="mt-1 max-w-3xl text-xs leading-5 text-zinc-500">Operational feed of paid orders, wallet movements, withdrawals, and referral activity. This is not an accounting ledger, and a paid order is not the same event as a customer wallet debit.</p>
                        {pageData?.limitations?.notes?.[0] && <p className="mt-2 text-[11px] leading-5 text-zinc-500">{pageData.limitations.notes[0]}</p>}
                    </div>
                    <button type="button" disabled title="There is no server export for this feed." className="cursor-not-allowed rounded-xl bg-zinc-200 px-4 py-2.5 text-xs font-bold text-zinc-500">Export unavailable</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[980px] text-left">
                        <thead className="border-b border-zinc-100 bg-zinc-50/80">
                            <tr>
                                {['Activity', 'Domain', 'Event', 'Actor', 'Amount', 'Status', 'Occurred', 'Action'].map((heading) => (
                                    <th key={heading} className={`whitespace-nowrap px-4 py-4 text-[10px] font-bold uppercase tracking-wider text-zinc-400 ${heading === 'Action' ? 'text-right' : ''}`}>{heading}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50">
                            {listQuery.isLoading && !listQuery.data ? (
                                <tr><td colSpan="8" className="px-5 py-16 text-center"><Loader2 className="mx-auto animate-spin text-emerald-700" /><p className="mt-2 text-xs text-zinc-500">Loading financial activity…</p></td></tr>
                            ) : listQuery.error ? (
                                <tr><td colSpan="8"><ErrorPanel message={listQuery.error.message} onRetry={() => listQuery.refetch()} /></td></tr>
                            ) : rows.length ? rows.map((row) => {
                                const amount = formatActivityAmount(row);
                                return (
                                    <tr key={row.activityId} className="hover:bg-zinc-50/70">
                                        <td className="px-4 py-4 text-xs font-semibold text-zinc-800">
                                            <span className="block">{displayText(row.orderCode ? `Order ${row.orderCode}` : row.actorLabel || eventTypeLabel(row.eventType))}</span>
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-4 text-xs text-zinc-700">{domainLabel(row.domain)}</td>
                                        <td className="whitespace-nowrap px-4 py-4 text-xs font-semibold text-zinc-800">{eventTypeLabel(row.eventType)}</td>
                                        <td className="px-4 py-4 text-xs text-zinc-700">
                                            <span className="block font-semibold text-zinc-900">{displayText(row.actorLabel)}</span>
                                        </td>
                                        <td className={`whitespace-nowrap px-4 py-4 text-xs font-bold ${activityAmountTone(row)}`}>
                                            <span className="block">{amount.text}</span>
                                            {amount.caption && <span className="mt-1 block text-[10px] font-medium text-zinc-400">{amount.caption}</span>}
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-4 text-xs"><span className={`inline-flex rounded-full px-2.5 py-1 font-semibold ${activityStatusTone(row.status)}`}>{statusLabel(row.status)}</span></td>
                                        <td className="whitespace-nowrap px-4 py-4 text-xs text-zinc-500">{row.occurredAt ? formatShortDateTime(row.occurredAt) : '—'}</td>
                                        <td className="px-4 py-4 text-right">
                                            <button type="button" onClick={() => setSelectedActivityId(row.activityId)} aria-label={`View ${eventTypeLabel(row.eventType)}${row.orderCode ? ` for order ${row.orderCode}` : ''}`} className="inline-flex rounded-lg p-2 text-emerald-700 hover:bg-emerald-50"><Eye size={16} /></button>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan="8" className="px-5 py-16 text-center">
                                        <p className="text-sm font-semibold text-zinc-700">No financial activity found</p>
                                        <p className="mt-1 text-xs text-zinc-500">This filter returned no activity.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <footer className="flex flex-col gap-3 border-t border-zinc-100 px-5 py-3 text-[10px] font-medium text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
                    <span>{listQuery.isFetching && listQuery.data ? 'Updating… · ' : ''}{total == null ? 'Activity count unavailable' : `Showing ${rangeStart}–${rangeEnd} of ${total}`}</span>
                    {pages > 1 && (
                        <div className="flex items-center gap-3">
                            <span>Page {page} of {pages}</span>
                            <button type="button" aria-label="Previous page" disabled={page <= 1} onClick={() => setPage((current) => current - 1)} className="rounded-lg border border-zinc-200 px-3 py-1.5 disabled:opacity-40">Previous</button>
                            <button type="button" aria-label="Next page" disabled={page >= pages} onClick={() => setPage((current) => current + 1)} className="rounded-lg border border-zinc-200 px-3 py-1.5 disabled:opacity-40">Next</button>
                        </div>
                    )}
                </footer>
            </section>
            <WalletCustomDateModal isOpen={isDateModalOpen} dates={draftDates} onDatesChange={setDraftDates} onClose={closeDateModal} onApply={(dates) => { setCustomDates(dates); setDateFilter('custom'); setPage(1); setIsDateModalOpen(false); }} />
            {selectedActivityId && <FinancialActivityDetailsPanel key={selectedActivityId} activityId={selectedActivityId} onClose={() => setSelectedActivityId(null)} />}
        </div>
    );
};

export default Transactions;
