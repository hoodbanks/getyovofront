import React, { useState, useRef, useEffect, useMemo } from 'react';
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
    PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../../api/api';
import { useAuthStore } from '../../store/useAuthStore';

const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
};

const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0
    }).format(value);
};

// Initial mock data removed - replaced with state managed by React Query

const StatCard = ({ label, value, icon: Icon, color, dotColor }) => (
    <div className="relative overflow-hidden p-6 rounded-2xl bg-white border border-zinc-100 shadow-sm transition-all hover:shadow-md group flex-1 min-w-[240px]">
        {/* Grain effect */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{ backgroundImage: `radial-gradient(${dotColor} 1px, transparent 1px)`, backgroundSize: '4px 4px' }}></div>

        <div className="relative z-10 flex justify-between items-start">
            <div className="space-y-4">
                <p className="text-[11px] font-medium text-zinc-500">{label}</p>
                <h3 className="text-xl font-bold text-zinc-900 leading-tight">{value}</h3>
            </div>
            <div className={`p-1 rounded-xl ${color} bg-opacity-10 text-white shadow-sm transition-all duration-300 group-hover:scale-110`}>
                <div className={`p-1 rounded-lg ${color}`}>
                    <Icon size={18} />
                </div>
            </div>
        </div>
    </div>
);

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
        queryFn: () => api.get(`/superadmin/analytics/graph?type=orders&filter=${mapFilter(ordersFilter)}${ordersFilter === 'Custom' ? `&customStart=${customDates.start}&customEnd=${customDates.end}` : ''}`, token),
        enabled: !!token && ordersFilter !== 'Last 7 days', // Default is in initial dashboard
    });

    const payoutQuery = useQuery({
        queryKey: ['analyticsGraph', 'vendorPayout', payoutFilter, customDates],
        queryFn: () => api.get(`/superadmin/analytics/graph?type=vendorPayout&filter=${mapFilter(payoutFilter)}${payoutFilter === 'Custom' ? `&customStart=${customDates.start}&customEnd=${customDates.end}` : ''}`, token),
        enabled: !!token && payoutFilter !== 'Last 7 days',
    });

    const revenueQuery = useQuery({
        queryKey: ['analyticsGraph', 'revenue', revenueFilter, customDates],
        queryFn: () => api.get(`/superadmin/analytics/graph?type=revenue&filter=${mapFilter(revenueFilter)}${revenueFilter === 'Custom' ? `&customStart=${customDates.start}&customEnd=${customDates.end}` : ''}`, token),
        enabled: !!token && revenueFilter !== 'Last 7 days',
    });

    const splitQuery = useQuery({
        queryKey: ['analyticsGraph', 'revenueSplit', splitFilter, customDates],
        queryFn: () => api.get(`/superadmin/analytics/graph?type=revenueSplit&filter=${mapFilter(splitFilter)}${splitFilter === 'Custom' ? `&customStart=${customDates.start}&customEnd=${customDates.end}` : ''}`, token),
        enabled: !!token && splitFilter !== 'Last 7 days',
    });

    // Data Preparation
    const stats = dashboard?.data?.summary || { ordersToday: 0, totalRevenue: 0, platformCommission: 0, vendorPayout: 0 };
    
    const ordersData = (ordersFilter === 'Last 7 days' ? dashboard?.data?.ordersGraph?.data : ordersQuery.data?.data?.data) || [];
    const formattedOrders = ordersData.map(d => ({ name: formatDate(d.day), orders: d.total }));

    const payoutData = (payoutFilter === 'Last 7 days' ? dashboard?.data?.payoutGraph?.data : payoutQuery.data?.data?.data) || [];
    const formattedPayout = payoutData.map(d => ({ name: formatDate(d.day), payout: d.total }));

    const revenueData = (revenueFilter === 'Last 7 days' ? dashboard?.data?.revenueGraph?.data : revenueQuery.data?.data?.data) || [];
    const formattedRevenue = revenueData.map(d => ({ name: formatDate(d.day), revenue: d.total }));

    const splitData = (splitFilter === 'Last 7 days' ? dashboard?.data?.revenueSplit?.data : splitQuery.data?.data) || {
        totalRevenue: 0, platformCommission: 0, vendorPayout: 0, platformCommissionPercent: 0, vendorPayoutPercent: 0
    };

    const formattedPieData = [
        { name: 'Vendor Payout', value: splitData.vendorPayoutPercent, amount: splitData.vendorPayout, color: '#00B074' },
        { name: 'Platform Commission', value: splitData.platformCommissionPercent, amount: splitData.platformCommission, color: '#880055' },
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
        <div className="space-y-6 w-full mx-auto pb-10">
            {/* Stats Grid */}
            <div className="flex flex-wrap gap-4">
                <StatCard label="Orders Today" value={stats.ordersToday?.toLocaleString()} icon={ShoppingBag} color="bg-[#880055]" dotColor="#880055" />
                <StatCard label="Revenue Generated" value={formatCurrency(stats.totalRevenue)} icon={Banknote} color="bg-[#00B074]" dotColor="#00B074" />
                <StatCard label="Platform Commission" value={formatCurrency(stats.platformCommission)} icon={Percent} color="bg-[#880055]" dotColor="#880055" />
                <StatCard label="Vendor Payout" value={formatCurrency(stats.vendorPayout)} icon={Wallet} color="bg-[#FF4D00]" dotColor="#FF4D00" />
            </div>

            {/* Custom Range Picker Modal/Overlay (Simple version) */}
            {(ordersFilter === 'Custom' || payoutFilter === 'Custom' || revenueFilter === 'Custom' || splitFilter === 'Custom') && (
                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex flex-wrap items-center gap-4 animate-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-2">
                        <Calendar size={18} className="text-emerald-600" />
                        <span className="text-xs font-bold text-emerald-900">Custom Date Range:</span>
                    </div>
                    <input 
                        type="date" 
                        value={customDates.start}
                        onChange={(e) => setCustomDates(prev => ({ ...prev, start: e.target.value }))}
                        className="bg-white border border-emerald-200 rounded-lg px-3 py-1.5 text-xs text-zinc-900 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                    />
                    <span className="text-zinc-400 text-xs">to</span>
                    <input 
                        type="date" 
                        value={customDates.end}
                        onChange={(e) => setCustomDates(prev => ({ ...prev, end: e.target.value }))}
                        className="bg-white border border-emerald-200 rounded-lg px-3 py-1.5 text-xs text-zinc-900 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                    />
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
                        <ResponsiveContainer width="100%" height="100%">
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
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Vendor Payout */}
                <div className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <h3 className="text-sm font-bold text-zinc-900">Vendor Payout</h3>
                            {payoutQuery.isFetching && <Loader2 size={14} className="text-emerald-500 animate-spin" />}
                        </div>
                        <FilterDropdown selected={payoutFilter} onSelect={setPayoutFilter} />
                    </div>
                    <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
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
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue over time */}
                <div className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <h3 className="text-sm font-bold text-zinc-900">Revenue over time</h3>
                            {revenueQuery.isFetching && <Loader2 size={14} className="text-emerald-500 animate-spin" />}
                        </div>
                        <FilterDropdown selected={revenueFilter} onSelect={setRevenueFilter} />
                    </div>
                    <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
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
                                    dataKey="revenue"
                                    stroke="#00B074"
                                    strokeWidth={1.5}
                                    dot={{ fill: '#00B074', r: 4, strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Revenue split */}
                <div className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <h3 className="text-sm font-bold text-zinc-900">Revenue split</h3>
                            {splitQuery.isFetching && <Loader2 size={14} className="text-emerald-500 animate-spin" />}
                        </div>
                        <FilterDropdown selected={splitFilter} onSelect={setSplitFilter} />
                    </div>
                    <div className="h-[280px] w-full flex items-center gap-8">
                        <div className="flex-1 h-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={formattedPieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={0}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {formattedPieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => `${value}%`} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none w-full px-4">
                                <p className="text-[8px] font-bold text-zinc-400 uppercase leading-none tracking-tight">Total Revenue</p>
                                <p className="text-[11px] font-bold text-zinc-900 mt-2 truncate">{formatCurrency(splitData.totalRevenue)}</p>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="w-[45%] space-y-4">
                            {formattedPieData.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                                    <div className="flex-1 flex items-center justify-between gap-2 overflow-hidden">
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-bold text-zinc-600 leading-tight truncate">{item.name}</p>
                                            <p className="text-[9px] font-medium text-zinc-400 truncate">{formatCurrency(item.amount)} / {item.value}%</p>
                                        </div>
                                        <span className="text-[10px] font-bold text-zinc-900 shrink-0">{item.value}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
