import React, { useState, useRef, useEffect } from 'react';
import {
    Search,
    ChevronDown,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Search as SearchIcon,
    Wallet,
    ShoppingBag,
    Percent,
    Banknote,
    Loader2,
    AlertCircle
} from 'lucide-react';
import {
    AreaChart, Area,
    BarChart, Bar,
    LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/api';
import { useAuthStore } from '../../store/useAuthStore';
import { formatLagosMonthDay, lagosDateInputInstant } from '../../utils/formatters';
import { WalletDatePicker } from '../../components/admin/wallet/WalletControls';

const customRangeQuery = (filter, dates) => {
    if (filter !== 'Custom' || !dates.start || !dates.end) return '';
    const start = encodeURIComponent(lagosDateInputInstant(dates.start, 'start'));
    const end = encodeURIComponent(lagosDateInputInstant(dates.end, 'end'));
    return `&customStart=${start}&customEnd=${end}`;
};

const formatCurrency = (value) => Number.isFinite(value)
    ? new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
    : 'Not available';
const explicitMoney = (data, nairaKey, koboKey) => Number.isFinite(data?.[nairaKey]) ? data[nairaKey] : Number.isFinite(data?.[koboKey]) ? data[koboKey] / 100 : undefined;

// Initial mock data removed - replaced with state managed by React Query

const StatCard = ({ label, value, icon: Icon, color, dotColor }) => (
    <div className="relative min-w-0 overflow-hidden rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm transition-all hover:shadow-md group">
        {/* Grain effect */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{ backgroundImage: `radial-gradient(${dotColor} 1px, transparent 1px)`, backgroundSize: '4px 4px' }}></div>

        <div className="relative z-10">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-medium text-zinc-500">{label}</p>
                    <h3 className="mt-2 text-lg font-bold leading-tight text-zinc-900">{value}</h3>
                </div>
                <div className={`shrink-0 rounded-xl p-1 ${color} bg-opacity-10 text-white shadow-sm transition-all duration-300 group-hover:scale-110`}>
                    <div className={`rounded-lg p-1 ${color}`}>
                        <Icon size={18} />
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const GraphState = ({ error, retry, empty }) => error ? (
    <div role="alert" className="flex h-full flex-col items-center justify-center gap-2 rounded-xl bg-rose-50 p-4 text-center text-xs text-rose-700">
        <p>{error.message || 'Could not load this graph.'}</p>
        <button type="button" onClick={retry} className="font-bold underline">Retry</button>
    </div>
) : empty ? <div className="flex h-full items-center justify-center text-xs text-zinc-500">No chart data available.</div> : null;

const FilterDropdown = ({ selected, onSelect, options = ['Today', 'Yesterday', 'Last 7 days', 'Last 30 days', 'This month', 'Last month', 'Custom'] }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-zinc-200 rounded-xl text-[10px] font-bold text-zinc-900 group hover:border-zinc-300 transition-all shadow-sm"
            >
                {selected}
                <ChevronDown size={14} className={`text-zinc-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-zinc-100 rounded-2xl shadow-xl z-50 py-2 animate-in fade-in zoom-in-95 duration-200">
                    {options.map((opt) => (
                        <button
                            key={opt}
                            onClick={() => {
                                onSelect(opt);
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-[10px] font-medium transition-colors ${selected === opt ? 'bg-zinc-50 text-emerald-600 font-bold' : 'text-zinc-600 hover:bg-zinc-50'
                                }`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const Analytics = () => {
    const token = useAuthStore((state) => state.accessToken);

    // Filters for each chart
    const [ordersFilter, setOrdersFilter] = useState('Last 7 days');
    const [payoutFilter, setPayoutFilter] = useState('Last 7 days');
    const [revenueFilter, setRevenueFilter] = useState('Last 7 days');
    const [splitFilter, setSplitFilter] = useState('Last 7 days');

    // Custom Date states
    const [customDates, setCustomDates] = useState({ start: '', end: '' });

    // API filter mapper
    const mapFilter = (f) => {
        const mapping = {
            'Today': 'today',
            'Yesterday': 'yesterday',
            'Last 7 days': 'last7days',
            'Last 30 days': 'last30days',
            'This month': 'thisMonth',
            'Last month': 'lastMonth',
            'Custom': 'custom'
        };
        return mapping[f] || 'last7days';
    };

    // Initial Dashboard Fetch
    const { data: dashboard, isLoading, error, refetch } = useQuery({
        queryKey: ['analyticsDashboard'],
        queryFn: () => api.get('/superadmin/analytics', token),
    });

    // Individual Graph Queries
    const ordersQuery = useQuery({
        queryKey: ['analyticsGraph', 'orders', ordersFilter, customDates],
        queryFn: () => api.get(`/superadmin/analytics/graph?type=orders&filter=${mapFilter(ordersFilter)}${customRangeQuery(ordersFilter, customDates)}`, token),
        enabled: !!token && ordersFilter !== 'Last 7 days' && (ordersFilter !== 'Custom' || Boolean(customDates.start && customDates.end)),
    });

    const payoutQuery = useQuery({
        queryKey: ['analyticsGraph', 'vendorPayout', payoutFilter, customDates],
        queryFn: () => api.get(`/superadmin/analytics/graph?type=vendorPayout&filter=${mapFilter(payoutFilter)}${customRangeQuery(payoutFilter, customDates)}`, token),
        enabled: !!token && payoutFilter !== 'Last 7 days' && (payoutFilter !== 'Custom' || Boolean(customDates.start && customDates.end)),
    });

    const revenueQuery = useQuery({
        queryKey: ['analyticsGraph', 'revenue', revenueFilter, customDates],
        queryFn: () => api.get(`/superadmin/analytics/graph?type=revenue&filter=${mapFilter(revenueFilter)}${customRangeQuery(revenueFilter, customDates)}`, token),
        enabled: !!token && revenueFilter !== 'Last 7 days' && (revenueFilter !== 'Custom' || Boolean(customDates.start && customDates.end)),
    });

    const splitQuery = useQuery({
        queryKey: ['analyticsGraph', 'revenueSplit', splitFilter, customDates],
        queryFn: () => api.get(`/superadmin/analytics/graph?type=revenueSplit&filter=${mapFilter(splitFilter)}${customRangeQuery(splitFilter, customDates)}`, token),
        enabled: !!token && splitFilter !== 'Last 7 days' && (splitFilter !== 'Custom' || Boolean(customDates.start && customDates.end)),
    });

    // Data Preparation
    const stats = dashboard?.data?.summary || {};
    
    const ordersData = (ordersFilter === 'Last 7 days' ? dashboard?.data?.ordersGraph?.data : ordersQuery.data?.data?.data) || [];
    const formattedOrders = ordersData.map(d => ({ name: formatLagosMonthDay(d.day), orders: d.total }));

    const payoutData = (payoutFilter === 'Last 7 days' ? dashboard?.data?.payoutGraph?.data : payoutQuery.data?.data?.data) || [];
    const formattedPayout = payoutData.map(d => ({ name: formatLagosMonthDay(d.day), payout: d.total }));

    const revenueData = (revenueFilter === 'Last 7 days' ? dashboard?.data?.revenueGraph?.data : revenueQuery.data?.data?.data) || [];
    const formattedRevenue = revenueData.map(d => ({ name: formatLagosMonthDay(d.day), grossPaidOrderValue: d.total }));

    // Try both shapes: { data: {...} } and the object directly
    const rawSplit = splitFilter === 'Last 7 days'
        ? (dashboard?.data?.revenueSplit?.data ?? dashboard?.data?.revenueSplit)
        : (splitQuery.data?.data?.data ?? splitQuery.data?.data);
    const splitData = rawSplit || {};
    const splitMetrics = [
        ['Gross paid order value', explicitMoney(splitData, 'grossPaidOrderValueNaira', 'grossPaidOrderValueKobo')],
        ['Customer Wallet refunds', explicitMoney(splitData, 'customerOrderRefundsNaira', 'customerOrderRefundsKobo')],
        ['Paid cancelled orders', splitData.paidCancelledOrderCount],
        ['Original value of paid cancelled orders', explicitMoney(splitData, 'paidCancelledOrderValueNaira', 'paidCancelledOrderValueKobo')],
        ['Delivery fees on paid orders', explicitMoney(splitData, 'deliveryFeesOnPaidOrdersNaira', 'deliveryFeesOnPaidOrdersKobo')],
        ['Platform fees earned', explicitMoney(splitData, 'platformFeesEarnedNaira', 'platformFeesEarnedKobo')],
    ];

    if (isLoading) {
        return (
            <div className="h-[60vh] w-full flex flex-col items-center justify-center gap-4">
                <Loader2 size={40} className="text-emerald-600 animate-spin" />
                <p className="text-zinc-500 font-medium animate-pulse">Loading analytics dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-[60vh] w-full flex flex-col items-center justify-center gap-4">
                <div className="p-4 bg-rose-50 rounded-full text-rose-500">
                    <AlertCircle size={40} />
                </div>
                <div className="text-center">
                    <p className="text-zinc-900 font-bold text-lg">Failed to load analytics</p>
                    <p className="text-zinc-500 text-sm mt-1">{error.message || 'Something went wrong while fetching data.'}</p>
                </div>
                <button 
                    onClick={() => refetch()}
                    className="mt-4 px-6 py-2 bg-zinc-900 border border-zinc-200 text-zinc-100 rounded-xl text-sm font-bold hover:bg-zinc-800 transition-colors"
                >
                    Retry Loading
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                <StatCard label="Orders Today" value={Number.isFinite(stats.ordersToday) ? stats.ordersToday.toLocaleString('en-NG') : 'Not available'} icon={ShoppingBag} color="bg-[#880055]" dotColor="#880055" />
                <StatCard label="Gross paid order value" value={formatCurrency(explicitMoney(stats, 'grossPaidOrderValueNaira', 'grossPaidOrderValueKobo'))} icon={Banknote} color="bg-[#00B074]" dotColor="#00B074" />
                <StatCard label="Customer Wallet refunds" value={formatCurrency(explicitMoney(stats, 'customerOrderRefundsNaira', 'customerOrderRefundsKobo'))} icon={Wallet} color="bg-[#880055]" dotColor="#880055" />
                <StatCard label="Paid cancelled order value" value={formatCurrency(explicitMoney(stats, 'paidCancelledOrderValueNaira', 'paidCancelledOrderValueKobo'))} icon={Banknote} color="bg-[#FF4D00]" dotColor="#FF4D00" />
                <StatCard label="Platform fees earned" value={formatCurrency(explicitMoney(stats, 'platformFeesEarnedNaira', 'platformFeesEarnedKobo'))} icon={Percent} color="bg-[#880055]" dotColor="#880055" />
                <StatCard label="Delivery fees on paid orders" value={formatCurrency(explicitMoney(stats, 'deliveryFeesOnPaidOrdersNaira', 'deliveryFeesOnPaidOrdersKobo'))} icon={Banknote} color="bg-[#FF4D00]" dotColor="#FF4D00" />
            </div>
            <p className="text-[11px] leading-5 text-zinc-500">These amounts stay separate. Gross paid order value includes delivery fees and currently cancelled paid orders. Paid cancelled order value is the original order amount, not the Customer Wallet refund.</p>

            {/* Custom Range Picker Modal/Overlay (Simple version) */}
            {(ordersFilter === 'Custom' || payoutFilter === 'Custom' || revenueFilter === 'Custom' || splitFilter === 'Custom') && (
                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex flex-wrap items-center gap-4 animate-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-2">
                        <Calendar size={18} className="text-emerald-600" />
                        <span className="text-xs font-bold text-emerald-900">Choose date range:</span>
                    </div>
                    <WalletDatePicker label="From" value={customDates.start} onChange={(value) => setCustomDates((prev) => ({ ...prev, start: value }))} />
                    <span className="hidden text-zinc-400 text-xs sm:inline">to</span>
                    <WalletDatePicker label="To" value={customDates.end} onChange={(value) => setCustomDates((prev) => ({ ...prev, end: value }))} />
                </div>
            )}

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Orders over time */}
                <div className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <h3 className="text-sm font-bold text-zinc-900">Orders over time</h3>
                            {ordersQuery.isFetching && <Loader2 size={14} className="text-emerald-500 animate-spin" />}
                        </div>
                        <FilterDropdown selected={ordersFilter} onSelect={setOrdersFilter} />
                    </div>
                    <div className="h-[280px] w-full">
                        <GraphState error={ordersFilter === 'Last 7 days' ? null : ordersQuery.error} retry={() => ordersQuery.refetch()} empty={!ordersQuery.error && formattedOrders.length === 0} />
                        {(ordersFilter === 'Last 7 days' || !ordersQuery.error) && formattedOrders.length > 0 && <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={formattedOrders} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#880055" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#880055" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F4F4F5" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#A1A1AA' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#A1A1AA' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ stroke: '#880055', strokeWidth: 1, strokeDasharray: '4 4' }}
                                />
                                <Area type="monotone" dataKey="orders" stroke="#880055" strokeWidth={2} fillOpacity={1} fill="url(#colorOrders)" />
                            </AreaChart>
                        </ResponsiveContainer>}
                    </div>
                </div>

                {/* Legacy estimate: not a recorded Vendor transfer */}
                <div className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div><h3 className="text-sm font-bold text-zinc-900">Legacy Vendor payout estimate</h3><p className="mt-1 text-[10px] text-zinc-500">Estimate only; actual recorded transfers are Completed withdrawals in Vendor Wallet.</p></div>
                            {payoutQuery.isFetching && <Loader2 size={14} className="text-emerald-500 animate-spin" />}
                        </div>
                        <FilterDropdown selected={payoutFilter} onSelect={setPayoutFilter} />
                    </div>
                    <div className="h-[280px] w-full">
                        <GraphState error={payoutFilter === 'Last 7 days' ? null : payoutQuery.error} retry={() => payoutQuery.refetch()} empty={!payoutQuery.error && formattedPayout.length === 0} />
                        {(payoutFilter === 'Last 7 days' || !payoutQuery.error) && formattedPayout.length > 0 && <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={formattedPayout} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F4F4F5" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#A1A1AA' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#A1A1AA' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value) => formatCurrency(value)}
                                />
                                <Bar dataKey="payout" fill="#FF4D00" radius={[4, 4, 0, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>}
                    </div>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue over time */}
                <div className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div><h3 className="text-sm font-bold text-zinc-900">Gross paid order value over time</h3><p className="mt-1 text-[10px] text-zinc-500">Grouped by payment date.</p></div>
                            {revenueQuery.isFetching && <Loader2 size={14} className="text-emerald-500 animate-spin" />}
                        </div>
                        <FilterDropdown selected={revenueFilter} onSelect={setRevenueFilter} />
                    </div>
                    <div className="h-[280px] w-full">
                        <GraphState error={revenueFilter === 'Last 7 days' ? null : revenueQuery.error} retry={() => revenueQuery.refetch()} empty={!revenueQuery.error && formattedRevenue.length === 0} />
                        {(revenueFilter === 'Last 7 days' || !revenueQuery.error) && formattedRevenue.length > 0 && <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={formattedRevenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F4F4F5" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#A1A1AA' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#A1A1AA' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value) => formatCurrency(value)}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="grossPaidOrderValue"
                                    stroke="#00B074"
                                    strokeWidth={1.5}
                                    dot={{ fill: '#00B074', r: 4, strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>}
                    </div>
                </div>

                {/* Revenue split */}
                <div className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div><h3 className="text-sm font-bold text-zinc-900">Financial metrics</h3><p className="mt-1 max-w-xl text-[10px] leading-4 text-zinc-500">Date basis: paid order value and delivery fees use paid date; platform fees use delivered date; Customer Wallet refunds use ledger date. These are distinct measures and are not additive.</p></div>
                            {splitQuery.isFetching && <Loader2 size={14} className="text-emerald-500 animate-spin" />}
                        </div>
                        <FilterDropdown selected={splitFilter} onSelect={setSplitFilter} />
                    </div>
                    {splitFilter !== 'Last 7 days' && splitQuery.error ? <GraphState error={splitQuery.error} retry={() => splitQuery.refetch()} /> : <div className="grid w-full grid-cols-1 gap-2 px-2 sm:grid-cols-2 lg:grid-cols-3">
                        {splitMetrics.map(([label, value]) => <div key={label} className="rounded-xl border border-zinc-100 bg-zinc-50 p-3"><p className="text-[9px] font-bold uppercase leading-4 text-zinc-500">{label}</p><p className="mt-1 text-sm font-bold text-zinc-900">{label === 'Paid cancelled orders' ? (Number.isFinite(value) ? value.toLocaleString('en-NG') : 'Not available') : formatCurrency(value)}</p></div>)}
                    </div>}
                </div>
            </div>
        </div>
    );
};

export default Analytics;
