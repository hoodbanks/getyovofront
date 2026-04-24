import React from 'react';
import {
    Users,
    Store,
    Bike,
    ShoppingBag,
    ArrowUpRight,
    ArrowDownRight,
    DollarSign,
    Search,
    ChevronRight,
    Briefcase,
    Wallet,
    Eye,
    Loader2,
    X
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/api';
import { useAuthStore } from '../../store/useAuthStore';
import OrderModal from '../../components/admin/OrderModal';
import VendorModal from '../../components/admin/VendorModal';
import RiderModal from '../../components/admin/RiderModal';
import CustomerModal from '../../components/admin/CustomerModal';

const data = [
    { name: 'Sun', value: 4000 },
    { name: 'Mon', value: 10000 },
    { name: 'Tue', value: 12000 },
    { name: 'Wed', value: 8000 },
    { name: 'Thu', value: 15000 },
    { name: 'Fri', value: 9000 },
    { name: 'Sat', value: 6000 },
];

const StatCard = ({ label, value, icon: Icon, color, trend, iconBg, gradient }) => (
    <div className="relative overflow-hidden bg-white p-6 rounded-3xl border border-zinc-200/50 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 group">
        {/* Glow Effect Background */}
        <div className={`absolute -top-10 -right-10 w-40 h-40 ${gradient} opacity-8 blur-[20px] rounded-full transition-all duration-500 group-hover:scale-125 group-hover:opacity-15`} />

        <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-[11px] font-medium text-zinc-500 mb-1">{label}</p>
                    <h3 className="text-xl font-medium text-zinc-900">{value}</h3>
                </div>
                {/* Icon Container with backdrop-blur */}
                <div className={`relative p-2 rounded-xl ${iconBg} shadow-sm backdrop-blur-md border border-white/20 group-hover:rotate-6 transition-all duration-300`}>
                    <Icon size={18} className={color} />
                </div>
            </div>
            {/* <div className="flex items-center gap-1.5">
                <div className={`flex items-center font-medium text-xs ${trend > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {Math.abs(trend)}%
                </div>
                <span className="text-xs text-zinc-400 font-medium">vs last month</span>
            </div> */}
        </div>
    </div>
);

const StatusBadge = ({ status }) => {
    const styles = {
        Pending: 'bg-orange-50 text-orange-600 border-orange-100',
        'Picked up': 'bg-blue-50 text-blue-600 border-blue-100',
        Cancelled: 'bg-rose-50 text-rose-600 border-rose-100',
        Accepted: 'bg-indigo-50 text-indigo-600 border-indigo-100',
        Delivered: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        Inactive: 'bg-zinc-100 text-zinc-600 border-zinc-200',
        Suspended: 'bg-rose-50 text-rose-600 border-rose-100',
        Active: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        Offline: 'bg-zinc-100 text-zinc-600 border-zinc-200',
        Online: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    };

    return (
        <span className={`px-2.5 py-1 rounded-3xl text-[10px] font-medium border ${styles[status]}`}>
            {status}
        </span>
    );
};

const Dashboard = () => {
    const { accessToken } = useAuthStore();
    const [view, setView] = React.useState('revenue');
    const [showTimeDropdown, setShowTimeDropdown] = React.useState(false);
    const [selectedTime, setSelectedTime] = React.useState('Last 7 days');

    // Modal States
    const [selectedOrder, setSelectedOrder] = React.useState(null);
    const [selectedVendor, setSelectedVendor] = React.useState(null);
    const [selectedRider, setSelectedRider] = React.useState(null);
    const [selectedCustomer, setSelectedCustomer] = React.useState(null);

    const { data: adminData, isLoading, error } = useQuery({
        queryKey: ['adminDashboard'],
        queryFn: () => api.get('/superadmin/dashboard', accessToken)
    });

    const dashboard = adminData?.data || {
        summary: {},
        orders: { data: [] },
        topVendors: { data: [] },
        topRiders: { data: [] },
        riderActivity: {}
    };

    const timeOptions = [
        'Today',
        'Yesterday',
        'Last 7 days',
        'Last 30 days',
        'This month',
        'Last month'
    ];

    const mapFilter = (f) => {
        const mapping = {
            'Today': 'today',
            'Yesterday': 'yesterday',
            'Last 7 days': 'last7days',
            'Last 30 days': 'last30days',
            'This month': 'thisMonth',
            'Last month': 'lastMonth'
        };
        return mapping[f] || 'last7days';
    };

    // Analytics Dashboard Query (for summary and default graphs)
    const { data: analyticsDashboard } = useQuery({
        queryKey: ['analyticsDashboard'],
        queryFn: () => api.get('/superadmin/analytics', accessToken),
    });

    // Dynamic Graph Queries based on filter
    const dynamicGraphQuery = useQuery({
        queryKey: ['analyticsGraph', view, selectedTime],
        queryFn: () => api.get(`/superadmin/analytics/graph?type=${view}&filter=${mapFilter(selectedTime)}`, accessToken),
        enabled: !!accessToken && selectedTime !== 'Last 7 days'
    });

    // Handle initial vs filtered data
    const getChartData = () => {
        const isDefault = selectedTime === 'Last 7 days';
        let rawData = [];

        if (isDefault) {
            rawData = view === 'revenue' 
                ? analyticsDashboard?.data?.revenueGraph?.data 
                : analyticsDashboard?.data?.ordersGraph?.data;
        } else {
            rawData = dynamicGraphQuery.data?.data?.data;
        }

        if (!rawData) return [];

        return rawData.map(d => ({
            name: new Date(d.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            [view]: d.total
        }));
    };

    const chartData = getChartData();

    return (
        <div className="space-y-8 max-w-[1600px] mx-auto">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="Total Users"
                    value={dashboard.summary.totalUsers?.toLocaleString() || '0'}
                    icon={Users}
                    color="text-white"
                    iconBg="bg-emerald-900"
                    gradient="bg-emerald-500"
                    trend={12}
                />
                <StatCard
                    label="Total Vendors"
                    value={dashboard.summary.totalVendors?.toLocaleString() || '0'}
                    icon={Store}
                    color="text-white"
                    iconBg="bg-blue-900"
                    gradient="bg-blue-500"
                    trend={8}
                />
                <StatCard
                    label="Total Riders"
                    value={dashboard.summary.totalRiders?.toLocaleString() || '0'}
                    icon={Bike}
                    color="text-white"
                    iconBg="bg-purple-900"
                    gradient="bg-purple-500"
                    trend={-2}
                />
                <StatCard
                    label="Total Orders"
                    value={dashboard.summary.totalOrders?.toLocaleString() || '0'}
                    icon={ShoppingBag}
                    color="text-white"
                    iconBg="bg-orange-900"
                    gradient="bg-orange-500"
                    trend={24}
                />
                <StatCard
                    label="Orders Today"
                    value={dashboard.summary.ordersToday?.toLocaleString() || '0'}
                    icon={ShoppingBag}
                    color="text-white"
                    iconBg="bg-rose-900"
                    gradient="bg-rose-500"
                    trend={18}
                />
                <StatCard
                    label="Revenue Generated"
                    value={`₦${dashboard.summary.totalRevenue?.toLocaleString() || '0'}`}
                    icon={DollarSign}
                    color="text-white"
                    iconBg="bg-indigo-900"
                    gradient="bg-indigo-500"
                    trend={32}
                />
                <StatCard
                    label="Platform Commission"
                    value={`₦${dashboard.summary.platformCommission?.toLocaleString() || '0'}`}
                    icon={Briefcase}
                    color="text-white"
                    iconBg="bg-indigo-900"
                    gradient="bg-indigo-500"
                    trend={15}
                />
                <StatCard
                    label="Vendor Payout"
                    value={`₦${dashboard.summary.vendorPayout?.toLocaleString() || '0'}`}
                    icon={Wallet}
                    color="text-white"
                    iconBg="bg-orange-900"
                    gradient="bg-orange-500"
                    trend={10}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Table - Orders Overview */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm">
                    <div className="p-6 flex items-center justify-between border-b border-zinc-100">
                        <div>
                            <h3 className="text-sm font-medium text-zinc-900">Orders Overview</h3>
                            <p className="text-xs text-zinc-500">All order activity in one view.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search"
                                    className="pl-9 pr-4 py-3 w-50 bg-zinc-100 border-transparent rounded-3xl text-xs focus:bg-white focus:ring-1 focus:ring-indigo-500/20 outline-none"
                                />
                            </div>
                            <button className="px-4 py-3 bg-green-900 text-white text-xs font-medium rounded-3xl hover:bg-zinc-800 transition-colors">
                                Open Orders
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-zinc-100 border-b border-zinc-100">
                                    <th className="px-6 py-4 text-[10px] uppercase font-bold text-zinc-500">Order</th>
                                    <th className="px-6 py-4 text-[10px] uppercase font-bold text-zinc-500">Time</th>
                                    <th className="px-6 py-4 text-[10px] uppercase font-bold text-zinc-500">Customer</th>
                                    <th className="px-6 py-4 text-[10px] uppercase font-bold text-zinc-500">Vendor</th>
                                    <th className="px-6 py-4 text-[10px] uppercase font-bold text-zinc-500">Rider</th>
                                    <th className="px-6 py-4 text-[10px] uppercase font-bold text-zinc-500">Status</th>
                                    <th className="px-6 py-4 text-[10px] uppercase font-bold text-zinc-500">ETA</th>
                                    <th className="px-6 py-4 text-[10px] uppercase font-bold text-zinc-500 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="8" className="py-20 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <Loader2 className="animate-spin text-emerald-600" size={32} />
                                                <p className="text-xs text-zinc-500 font-medium">Loading orders...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : dashboard.orders.data.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="py-20 text-center text-xs text-zinc-400 font-medium italic">No recent orders found.</td>
                                    </tr>
                                ) : (
                                    dashboard.orders.data.map((row, i) => (
                                        <tr key={i} className="hover:bg-zinc-50/50 transition-colors group">
                                            <td className="px-6 py-4 text-[11px] font-bold text-zinc-600">{row.code}</td>
                                            <td className="px-6 py-4 text-[11px] text-zinc-500">{new Date(row.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                            <td className="px-6 py-4 text-[11px] text-zinc-500">
                                                <button 
                                                    onClick={() => setSelectedCustomer(row.customer)}
                                                    className="hover:text-emerald-600 hover:underline font-bold text-left transition-colors"
                                                >
                                                    {row.customerName}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-[11px] text-zinc-500">
                                                <button 
                                                    onClick={() => setSelectedVendor(row.vendor)}
                                                    className="hover:text-emerald-600 hover:underline font-bold text-left transition-colors"
                                                >
                                                    {row.vendor?.storeName}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-[11px] text-zinc-500">
                                                {row.rider ? (
                                                    <button 
                                                        onClick={() => setSelectedRider(row.rider)}
                                                        className="hover:text-emerald-600 hover:underline font-bold text-left transition-colors"
                                                    >
                                                        {row.rider.name}
                                                    </button>
                                                ) : '---'}
                                            </td>
                                            <td className="px-6 py-4"><StatusBadge status={row.status.charAt(0).toUpperCase() + row.status.slice(1).toLowerCase()} /></td>
                                            <td className="px-6 py-4 text-[11px] text-zinc-400">{row.etaMin}-{row.etaMax} mins</td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center">
                                                    <button 
                                                        onClick={() => setSelectedOrder(row)}
                                                        className="p-2 bg-indigo-50 text-indigo-500 rounded-lg hover:bg-indigo-500 hover:text-white transition-all shadow-sm"
                                                    >
                                                        <Eye size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Revenue Chart */}
                <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-sm flex flex-col h-full relative">
                    <div className="flex items-center justify-between gap-2 mb-8 relative z-[60]">
                        <div className="flex bg-zinc-100 p-1 rounded-xl">
                            <button
                                onClick={() => setView('revenue')}
                                className={`px-4 py-1.5 text-xs rounded-lg transition-all duration-300 ${view === 'revenue' ? 'bg-[#1C5B2B] text-white shadow-md' : 'text-zinc-500'}`}
                            >
                                Revenue
                            </button>
                            <button
                                onClick={() => setView('orders')}
                                className={`px-4 py-1.5 text-xs rounded-lg transition-all duration-300 ${view === 'orders' ? 'bg-[#2E6FB6] text-white shadow-md' : 'text-zinc-500'}`}
                            >
                                Orders
                            </button>
                        </div>

                        {/* Custom Time Select */}
                        <div className="relative">
                            <button
                                onClick={() => setShowTimeDropdown(!showTimeDropdown)}
                                className="flex items-center gap-2 bg-[#F1F5F9] py-2.5 px-3 border-none text-[11px] text-zinc-600 font-bold rounded-full outline-none transition-all hover:bg-zinc-200"
                            >
                                <span className="flex items-center gap-2">
                                    {dynamicGraphQuery.isFetching && <Loader2 size={12} className="animate-spin text-emerald-600" />}
                                    {selectedTime}
                                </span>
                                <svg className={`w-4 h-4 transition-transform duration-300 ${showTimeDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {showTimeDropdown && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowTimeDropdown(false)} />
                                    <div className="absolute right-0 mt-2 w-48 bg-white border border-zinc-100 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in duration-200">
                                        {timeOptions.map((option) => (
                                            <button
                                                key={option}
                                                onClick={() => {
                                                    setSelectedTime(option);
                                                    setShowTimeDropdown(false);
                                                }}
                                                className={`w-full text-left px-5 py-2.5 text-[13px] font-medium transition-colors ${selectedTime === option ? 'text-[#1C5B2B] bg-emerald-50' : 'text-zinc-600 hover:bg-zinc-50'}`}
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 h-[320px] w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#1C5B2B" stopOpacity={0.8} />
                                        <stop offset="100%" stopColor="#4ADE80" stopOpacity={1} />
                                    </linearGradient>
                                    <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#2E6FB6" stopOpacity={0.8} />
                                        <stop offset="100%" stopColor="#60A5FA" stopOpacity={1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="0" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fontWeight: 500, fill: '#94a3b8' }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fontWeight: 500, fill: '#94a3b8' }}
                                    tickFormatter={(val) => val >= 1000 ? `${val / 1000}k` : val}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(241, 245, 249, 0.4)' }}
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                    labelStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#1f2937' }}
                                    itemStyle={{ fontSize: '11px', fontWeight: '600' }}
                                    formatter={(value) => view === 'revenue' ? `₦${value?.toLocaleString()}` : value?.toLocaleString()}
                                />
                                <Bar
                                    dataKey={view}
                                    radius={[8, 8, 0, 0]}
                                    barSize={32}
                                    animationDuration={1000}
                                    fill={view === 'revenue' ? "url(#revenueGradient)" : "url(#ordersGradient)"}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Top Vendors Table */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-zinc-100">
                        <h3 className="text-sm font-medium text-zinc-900">Top vendors</h3>
                        <p className="text-xs text-zinc-500">Highest performing vendors by orders</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-zinc-50 border-b border-zinc-100">
                                    <th className="px-6 py-4 text-[10px] uppercase font-bold text-zinc-500">Name</th>
                                    <th className="px-6 py-4 text-[10px] uppercase font-bold text-zinc-500 text-center">Orders</th>
                                    <th className="px-6 py-4 text-[10px] uppercase font-bold text-zinc-500">Revenue (NGN)</th>
                                    <th className="px-6 py-4 text-[10px] uppercase font-bold text-zinc-500 text-center">Status</th>
                                    <th className="px-6 py-4 text-[10px] uppercase font-bold text-zinc-500 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="5" className="py-10 text-center text-xs text-zinc-400">Loading...</td>
                                    </tr>
                                ) : dashboard.topVendors.data.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="py-10 text-center text-xs text-zinc-400">No data available</td>
                                    </tr>
                                ) : (
                                    dashboard.topVendors.data.map((row, i) => (
                                        <tr key={i} className="hover:bg-zinc-50/50 transition-colors">
                                            <td className="px-6 py-4 text-[11px] font-bold text-zinc-600">{row.name}</td>
                                            <td className="px-6 py-4 text-[11px] text-zinc-500 text-center font-medium">{row.totalOrders}</td>
                                            <td className="px-6 py-4 text-[11px] text-zinc-500 font-bold">₦{row.revenue?.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-center"><StatusBadge status={row.status.charAt(0).toUpperCase() + row.status.slice(1).toLowerCase()} /></td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center">
                                                    <button 
                                                        onClick={() => setSelectedVendor(row)}
                                                        className="p-2 bg-indigo-50 text-indigo-500 rounded-lg hover:bg-indigo-500 hover:text-white transition-all shadow-sm"
                                                    >
                                                        <Eye size={12} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Riders Activity Panel */}
                <div className="bg-white rounded-3xl border border-zinc-200 p-4 shadow-sm">
                    <h3 className="text-sm font-medium text-zinc-900 mb-1">Riders Activity</h3>
                    <p className="text-xs text-zinc-500 mb-4 pb-4 border-b border-zinc-300">Activity stats for all riders</p>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 bg-emerald-800 text-white rounded-lg shadow-sm shadow-emerald-200">
                                    <Bike size={18} />
                                </div>
                                <span className="text-sm font-medium text-zinc-700">Online Riders</span>
                            </div>
                            <span className="text-sm font-bold text-emerald-500">{dashboard.riderActivity.online || 0}</span>
                        </div>

                        <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 bg-rose-800 text-white rounded-lg shadow-sm shadow-rose-200">
                                    <Bike size={18} />
                                </div>
                                <span className="text-sm font-medium text-zinc-700">Offline Riders</span>
                            </div>
                            <span className="text-sm font-bold text-zinc-900">{dashboard.riderActivity.offline || 0}</span>
                        </div>

                        <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 bg-orange-800 text-white rounded-lg shadow-sm shadow-orange-200">
                                    <Bike size={18} />
                                </div>
                                <span className="text-sm font-medium text-zinc-700">Avg. Delivery Time</span>
                            </div>
                            <span className="text-sm font-bold text-zinc-900">{dashboard.riderActivity.avgDeliveryTime || 0} mins</span>
                        </div>
                    </div>
                </div>
            </div>


            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Top Riders Table */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-zinc-100">
                        <h3 className="text-sm font-medium text-zinc-900">Top Riders</h3>
                        <p className="text-xs text-zinc-500">Best performing riders by deliveries</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-zinc-50 border-b border-zinc-100">
                                    <th className="px-6 py-4 text-[10px] uppercase font-bold text-zinc-500">Name</th>
                                    <th className="px-6 py-4 text-[10px] uppercase font-bold text-zinc-500 text-center">Delivered</th>
                                    <th className="px-6 py-4 text-[10px] uppercase font-bold text-zinc-500 text-center">Avg. Time</th>
                                    <th className="px-6 py-4 text-[10px] uppercase font-bold text-zinc-500 text-center">Status</th>
                                    <th className="px-6 py-4 text-[10px] uppercase font-bold text-zinc-500 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="5" className="py-10 text-center text-xs text-zinc-400">Loading...</td>
                                    </tr>
                                ) : dashboard.topRiders.data.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="py-10 text-center text-xs text-zinc-400">No data available</td>
                                    </tr>
                                ) : (
                                    dashboard.topRiders.data.map((row, i) => (
                                        <tr key={i} className="hover:bg-zinc-50/50 transition-colors">
                                            <td className="px-6 py-4 text-[11px] font-bold text-zinc-600">{row.name}</td>
                                            <td className="px-6 py-4 text-[11px] text-zinc-500 text-center font-medium">{row.deliveries}</td>
                                            <td className="px-6 py-4 text-[11px] text-zinc-500 text-center font-medium">{row.avgTime} mins</td>
                                            <td className="px-6 py-4 text-center"><StatusBadge status={row.status.charAt(0).toUpperCase() + row.status.slice(1).toLowerCase()} /></td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center">
                                                    <button 
                                                        onClick={() => setSelectedRider(row)}
                                                        className="p-2 bg-indigo-50 text-indigo-500 rounded-lg hover:bg-indigo-500 hover:text-white transition-all shadow-sm"
                                                    >
                                                        <Eye size={12} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>


                {/* Quick Actions Panel */}
                <div className="bg-white rounded-3xl border border-zinc-200 p-4 shadow-sm">
                    <h3 className="text-sm font-medium text-zinc-900 mb-1">Quick Action</h3>
                    <p className="text-xs text-zinc-500 mb-8 border-b border-zinc-200 pb-4">Activity stats for all riders</p>

                    <div className="space-y-2">
                        {[
                            { title: 'Create Vendor', desc: 'Add a new vendor to the platform' },
                            { title: 'Add Rider', desc: 'Register a rider and assign availability' },
                            { title: 'Approve vendors', desc: 'Review and activate pending vendors' },
                            { title: 'Resolve support issues', desc: 'Handle and close customer or vendor complaints' },
                        ].map((action, i) => (
                            <button key={i} className="w-full flex items-center justify-between px-2 py-2 bg-white hover:bg-zinc-50 rounded-2xl border border-transparent hover:border-zinc-200 transition-all group text-left">
                                <div>
                                    <h4 className="text-sm font-medium text-zinc-800 group-hover:text-indigo-600 transition-colors uppercase pr-4">{action.title}</h4>
                                    <p className="text-[10px] text-zinc-400 font-medium">{action.desc}</p>
                                </div>
                                <ChevronRight size={18} className="text-zinc-300 group-hover:text-indigo-500 transition-all group-hover:translate-x-1" />
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Modals */}
            <OrderModal 
                isOpen={!!selectedOrder} 
                onClose={() => setSelectedOrder(null)} 
                order={selectedOrder} 
            />

            <VendorModal 
                isOpen={!!selectedVendor} 
                onClose={() => setSelectedVendor(null)} 
                vendor={selectedVendor} 
            />

            <RiderModal 
                isOpen={!!selectedRider} 
                onClose={() => setSelectedRider(null)} 
                rider={selectedRider} 
            />

            <CustomerModal 
                isOpen={!!selectedCustomer} 
                onClose={() => setSelectedCustomer(null)} 
                customer={selectedCustomer} 
            />
        </div >
    );
};

export default Dashboard;
