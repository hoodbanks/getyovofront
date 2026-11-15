import React from 'react';
import {
    Users,
    Store,
    Bike,
    ShoppingBag,
    DollarSign,
    ChevronRight,
    ChevronLeft,
    Briefcase,
    Wallet,
    BadgeCheck,
    UserRoundX,
    Clock3,
    Eye,
    ArrowRight,
    Loader2,
    X,
    AlertTriangle
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
import { API_BASE_URL } from '../../config/apiConfig';
import { useAuthStore } from '../../store/useAuthStore';
import OrderModal from '../../components/admin/OrderModal';
import VendorModal from '../../components/admin/VendorModal';
import RiderModal from '../../components/admin/RiderModal';
import CustomerModal from '../../components/admin/CustomerModal';
import CreateVendorModal from '../../components/admin/CreateVendorModal';
import CreateRiderModal from '../../components/admin/CreateRiderModal';
import { formatName, formatDate, formatCompactChartDate, capitalizeFirst } from '../../utils/formatters';

const formatCompactOrderDate = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? formatDate(value) : new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
};

const StatCard = ({ label, value, description, icon: Icon, color, iconBg, gradient, isLoading }) => (
    <div className="relative overflow-hidden bg-white p-4 rounded-3xl border border-zinc-200/50 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 group">
        {/* Glow Effect Background */}
        <div className={`absolute -top-10 -right-10 w-40 h-40 ${gradient} opacity-8 blur-[20px] rounded-full transition-all duration-500 group-hover:scale-125 group-hover:opacity-15`} />

        <div className="relative z-10">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-medium text-zinc-500 mb-1">{label}</p>
                    {isLoading ? <div aria-label={`Loading ${label}`} className="mt-2 h-6 w-24 animate-pulse rounded bg-zinc-200" /> : <h3 className="text-lg font-medium text-zinc-900">{value}</h3>}
                </div>
                {/* Icon Container with backdrop-blur */}
                <div className={`relative shrink-0 p-2 rounded-xl ${iconBg} shadow-sm backdrop-blur-md border border-white/20 group-hover:rotate-6 transition-all duration-300`}>
                    <Icon size={18} className={color} />
                </div>
            </div>
            <p className="mt-2 w-full text-[10px] leading-4 text-zinc-500">{description}</p>
        </div>
    </div>
);

const StatusBadge = ({ status }) => {
    const styles = {
        Pending: 'bg-orange-50 text-orange-600 border-orange-100',
        'Picked up': 'bg-blue-50 text-blue-600 border-blue-100',
        Cancelled: 'bg-rose-50 text-rose-600 border-rose-100',
        Accepted: 'bg-indigo-50 text-indigo-600 border-indigo-100',
        'Rider accepted': 'bg-indigo-50 text-indigo-600 border-indigo-100',
        Ready: 'bg-amber-50 text-amber-700 border-amber-100',
        'Out for delivery': 'bg-blue-50 text-blue-600 border-blue-100',
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

const orderStatusLabel = (status) => {
    const labels = {
        RIDER_ACCEPTED: 'Rider accepted',
        ACCEPTED: 'Accepted',
        READY: 'Ready',
        OUT_FOR_DELIVERY: 'Out for delivery',
        DELIVERED: 'Delivered',
        CANCELLED: 'Cancelled',
        PENDING: 'Pending',
        RECEIVED: 'Received',
    };
    const key = String(status || 'Unknown').toUpperCase();
    return labels[key] || key.toLowerCase().replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const formatCount = (value) => value == null ? '—' : Number(value).toLocaleString('en-NG');
const formatCurrency = (value) => Number.isFinite(value) ? new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value) : '—';
const explicitMoney = (summary, nairaKey, koboKey) => Number.isFinite(summary?.[nairaKey]) ? summary[nairaKey] : Number.isFinite(summary?.[koboKey]) ? summary[koboKey] / 100 : undefined;
const finiteMetric = (value) => {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim() !== '') {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) return parsed;
    }
    return null;
};

const validateDashboardResponse = (response) => {
    const data = response?.data;
    const summary = data?.summary;
    if (!summary || typeof summary !== 'object' || !Array.isArray(data?.orders?.data) || !Array.isArray(data?.topVendors?.data) || !Array.isArray(data?.topRiders?.data) || !data?.riderActivity || typeof data.riderActivity !== 'object') {
        throw new Error('Dashboard response is incomplete. Please retry or contact support if the issue continues.');
    }
    const metricValues = [
        summary.totalCustomers ?? summary.totalUsers,
        summary.verifiedCustomers,
        summary.unverifiedCustomers,
        summary.totalVendors,
        summary.totalRiders,
        summary.totalOrders,
        summary.ordersToday,
        summary.pendingVendorWithdrawals,
        summary.pendingReferralWithdrawals,
    ];
    if (metricValues.some((value) => typeof value !== 'number' || !Number.isFinite(value))) {
        throw new Error('Dashboard response is missing one or more summary metrics. Please retry or contact support.');
    }
    const online = finiteMetric(data.riderActivity.online);
    const offline = finiteMetric(data.riderActivity.offline);
    const rawAverage = finiteMetric(data.riderActivity.avgDeliveryTime);
    if (online == null || offline == null) {
        throw new Error('Dashboard response is missing rider activity metrics. Please retry or contact support.');
    }
    const avgDeliveryTime = rawAverage != null && rawAverage > 0 && rawAverage <= 180 ? rawAverage : null;
    data.riderActivity = { ...data.riderActivity, online, offline, avgDeliveryTime };
    return response;
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
    const [riderProfileLoading, setRiderProfileLoading] = React.useState(false);
    const [riderProfileError, setRiderProfileError] = React.useState('');
    const [selectedCustomer, setSelectedCustomer] = React.useState(null);
    const [isCreateVendorOpen, setIsCreateVendorOpen] = React.useState(false);
    const [isCreateRiderOpen, setIsCreateRiderOpen] = React.useState(false);
    
    // Pagination State for Dashboard Tables
    const [orderPage, setOrderPage] = React.useState(1);
    const [vendorPage, setVendorPage] = React.useState(1);
    const [riderPage, setRiderPage] = React.useState(1);

    const ITEMS_PER_PAGE = 5;

    const { data: adminData, isLoading, error: dashboardError, refetch: refetchDashboard } = useQuery({
        queryKey: ['adminDashboard'],
        queryFn: async () => validateDashboardResponse(await api.get('/superadmin/dashboard?page=1&limit=20', accessToken)),
    });

    const dashboard = adminData?.data || {
        summary: {},
        orders: { data: [] },
        topVendors: { data: [] },
        topRiders: { data: [] },
        riderActivity: {}
    };

    const openRiderFromOrder = async (order) => {
        const orderRider = order?.rider;
        if (!orderRider) return;
        setSelectedRider(orderRider);
        setRiderProfileLoading(true);
        setRiderProfileError('');
        const riderName = orderRider.name || [orderRider.firstname, orderRider.lastname].filter(Boolean).join(' ');
        const riderId = order?.riderId || order?.rider_id || orderRider.id || orderRider._id || orderRider.riderId || orderRider.uid;
        try {
            if (!riderName) throw new Error('This order does not include a rider name to look up the full profile.');
            const params = new URLSearchParams({ query: riderName, page: '1' });
            const response = await api.get(`/superadmin/riders/search?${params}`, accessToken);
            const matches = response?.data?.data;
            if (!Array.isArray(matches)) throw new Error('The Rider search response was not in the expected format.');
            const byId = riderId ? matches.find((item) => [item.id, item._id, item.riderId, item.uid].includes(riderId)) : null;
            const exactNameMatches = matches.filter((item) => String(item.name || '').trim().toLocaleLowerCase() === riderName.trim().toLocaleLowerCase());
            const riderProfile = byId || (exactNameMatches.length === 1 ? exactNameMatches[0] : null);
            if (!riderProfile) throw new Error('Could not safely match this order to one Rider profile. Open the Rider page to find the correct account.');
            setSelectedRider(riderProfile);
        } catch (error) {
            setRiderProfileError(error.message || 'Could not load the full Rider profile.');
        } finally {
            setRiderProfileLoading(false);
        }
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



    // Sync modal states with fresh dashboard data when it updates
    React.useEffect(() => {
        if (adminData?.data) {
            const getEntityId = (entity) => entity?.id || entity?._id || entity?.riderId || entity?.vendorId || entity?.orderId || entity?.uid;

            // Sync selected rider if it exists in dashboard data
            if (selectedRider) {
                const rId = getEntityId(selectedRider);
                // Check topRiders
                const freshRider = adminData.data.topRiders?.data?.find(r => getEntityId(r) === rId);
                if (freshRider) {
                    setSelectedRider(freshRider);
                } else {
                    // Check riders in recent orders
                    const orderWithRider = adminData.data.orders?.data?.find(o => o.rider && getEntityId(o.rider) === rId);
                    if (orderWithRider) setSelectedRider(orderWithRider.rider);
                }
            }

            // Sync selected vendor
            if (selectedVendor) {
                const vId = getEntityId(selectedVendor);
                const freshVendor = adminData.data.topVendors?.data?.find(v => getEntityId(v) === vId);
                if (freshVendor) {
                    setSelectedVendor(freshVendor);
                } else {
                    const orderWithVendor = adminData.data.orders?.data?.find(o => o.vendor && getEntityId(o.vendor) === vId);
                    if (orderWithVendor) setSelectedVendor(orderWithVendor.vendor);
                }
            }

            // Sync selected order
            if (selectedOrder) {
                const oId = getEntityId(selectedOrder);
                const freshOrder = adminData.data.orders?.data?.find(o => getEntityId(o) === oId);
                if (freshOrder) setSelectedOrder(freshOrder);
            }
        }
    }, [adminData]);

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
            name: formatCompactChartDate(d.day),
            [view]: d.total
        }));
    };

    const chartData = getChartData();
    const summary = dashboard.summary;
    const summaryCards = [
        { label: 'Total Customers', value: formatCount(summary.totalCustomers ?? summary.totalUsers), description: 'All registered customer accounts.', icon: Users, color: 'text-white', iconBg: 'bg-emerald-900', gradient: 'bg-emerald-500' },
        { label: 'Verified Customers', value: formatCount(summary.verifiedCustomers), description: 'Customers who verified their phone number.', icon: BadgeCheck, color: 'text-white', iconBg: 'bg-teal-900', gradient: 'bg-teal-500' },
        { label: 'Unverified Customers', value: formatCount(summary.unverifiedCustomers), description: 'Customers who have not verified their phone number.', icon: UserRoundX, color: 'text-white', iconBg: 'bg-amber-900', gradient: 'bg-amber-500' },
        { label: 'Total Vendors', value: formatCount(summary.totalVendors), description: 'All registered vendor accounts.', icon: Store, color: 'text-white', iconBg: 'bg-blue-900', gradient: 'bg-blue-500' },
        { label: 'Total Riders', value: formatCount(summary.totalRiders), description: 'All registered rider accounts.', icon: Bike, color: 'text-white', iconBg: 'bg-purple-900', gradient: 'bg-purple-500' },
        { label: 'Paid Orders', value: formatCount(summary.totalOrders), description: 'Orders with confirmed payment.', icon: ShoppingBag, color: 'text-white', iconBg: 'bg-orange-900', gradient: 'bg-orange-500' },
        { label: 'Paid Orders Today', value: formatCount(summary.ordersToday), description: 'Paid orders whose payment time is on the current Lagos calendar day.', icon: ShoppingBag, color: 'text-white', iconBg: 'bg-rose-900', gradient: 'bg-rose-500' },
        { label: 'Gross paid order value', value: formatCurrency(explicitMoney(summary, 'grossPaidOrderValueNaira', 'grossPaidOrderValueKobo')), description: 'Historical paid-order value, including delivery fees; may include orders later cancelled.', icon: DollarSign, color: 'text-white', iconBg: 'bg-indigo-900', gradient: 'bg-indigo-500' },
        { label: 'Customer Wallet refunds', value: formatCurrency(explicitMoney(summary, 'customerOrderRefundsNaira', 'customerOrderRefundsKobo')), description: 'Order-related credits to customer spending Wallets; not Paystack refunds.', icon: Wallet, color: 'text-white', iconBg: 'bg-purple-900', gradient: 'bg-purple-500' },
        { label: 'Paid cancelled orders', value: formatCount(summary.paidCancelledOrderCount), description: `Current paid cancellations · original order value ${formatCurrency(explicitMoney(summary, 'paidCancelledOrderValueNaira', 'paidCancelledOrderValueKobo'))}; not refund total.`, icon: X, color: 'text-white', iconBg: 'bg-rose-900', gradient: 'bg-rose-500' },
        { label: 'Delivery fees on paid orders', value: formatCurrency(explicitMoney(summary, 'deliveryFeesOnPaidOrdersNaira', 'deliveryFeesOnPaidOrdersKobo')), description: 'Delivery fees attached to paid orders; not earned platform revenue.', icon: Briefcase, color: 'text-white', iconBg: 'bg-blue-900', gradient: 'bg-blue-500' },
        { label: 'Platform fees earned', value: formatCurrency(explicitMoney(summary, 'platformFeesEarnedNaira', 'platformFeesEarnedKobo')), description: 'Fees earned only on paid orders currently delivered.', icon: Briefcase, color: 'text-white', iconBg: 'bg-indigo-900', gradient: 'bg-indigo-500' },
        { label: 'Pending Vendor Withdrawals', value: formatCount(summary.pendingVendorWithdrawals), description: 'Vendor requests awaiting admin action.', icon: Clock3, color: 'text-white', iconBg: 'bg-amber-900', gradient: 'bg-amber-500' },
        { label: 'Pending Referral Withdrawals', value: formatCount(summary.pendingReferralWithdrawals), description: 'Referral requests awaiting review.', icon: Clock3, color: 'text-white', iconBg: 'bg-pink-900', gradient: 'bg-pink-500' },
    ];

    if (dashboardError) {
        const dashboardEndpoint = `${API_BASE_URL}/superadmin/dashboard?page=1&limit=20`;
        const responseStatus = dashboardError.status || dashboardError.statusCode;
        return <div className="mx-auto flex min-h-[420px] max-w-2xl items-center justify-center p-6">
            <section role="alert" className="w-full rounded-3xl border border-rose-100 bg-white p-8 text-center shadow-sm">
                <AlertTriangle className="mx-auto text-rose-600" size={30} />
                <h1 className="mt-4 text-lg font-bold text-zinc-900">Dashboard data couldn’t load</h1>
                <p className="mt-2 text-sm text-zinc-500">{dashboardError.message || 'Please check your connection and try again.'}</p>
                <p className="mt-3 break-all text-xs text-zinc-400">Request: {dashboardEndpoint}{responseStatus ? ` · HTTP ${responseStatus}` : ''}</p>
                <button type="button" onClick={() => refetchDashboard()} className="mt-5 rounded-xl bg-[#1C5E20] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#174D1A]">Retry</button>
            </section>
        </div>;
    }

    return (
        <div className="space-y-8 max-w-[1600px] mx-auto">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {summaryCards.map((card) => <StatCard key={card.label} {...card} isLoading={isLoading} />)}
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-5">
                {/* Table - Orders Overview */}
                <div className="min-w-0 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm lg:col-span-2">
                    <div className="flex flex-col items-start justify-between gap-2 border-b border-zinc-100 px-4 py-3 sm:flex-row sm:items-center">
                        <div>
                            <h3 className="text-sm font-semibold text-zinc-900">Orders Overview</h3>
                            <p className="text-[10px] text-zinc-500">Recent order activity.</p>
                        </div>
                        <a href="/admin/orders" className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-2 text-[10px] font-semibold text-emerald-800 hover:bg-emerald-50">View all orders <ArrowRight size={13} /></a>
                    </div>
                    <div className="min-w-0 overflow-x-auto">
                        <table className="w-full min-w-[900px] table-fixed text-left">
                            <colgroup><col className="w-[12%]"/><col className="w-[12%]"/><col className="w-[15%]"/><col className="w-[16%]"/><col className="w-[10%]"/><col className="w-[18%]"/><col className="w-[10%]"/><col className="w-[7%]"/></colgroup>
                            <thead>
                                <tr className="bg-zinc-100 border-b border-zinc-100">
                                    <th className="whitespace-nowrap px-2.5 py-3 text-[9px] uppercase font-bold text-zinc-500">Order</th>
                                    <th className="whitespace-nowrap px-2.5 py-3 text-[9px] uppercase font-bold text-zinc-500">Time</th>
                                    <th className="whitespace-nowrap px-2.5 py-3 text-[9px] uppercase font-bold text-zinc-500">Customer</th>
                                    <th className="whitespace-nowrap px-2.5 py-3 text-[9px] uppercase font-bold text-zinc-500">Vendor</th>
                                    <th className="whitespace-nowrap px-2.5 py-3 text-[9px] uppercase font-bold text-zinc-500">Rider</th>
                                    <th className="whitespace-nowrap px-2.5 py-3 text-[9px] uppercase font-bold text-zinc-500">Status</th>
                                    <th className="whitespace-nowrap px-2.5 py-3 text-[9px] uppercase font-bold text-zinc-500">ETA</th>
                                    <th className="px-1 py-3 text-center text-[9px] uppercase font-bold text-zinc-500">View</th>
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
                                    dashboard.orders.data.slice((orderPage - 1) * ITEMS_PER_PAGE, orderPage * ITEMS_PER_PAGE).map((row, i) => (
                                        <tr key={i} className="hover:bg-zinc-50/50 transition-colors group">
                                            <td className="truncate px-2.5 py-3 text-[10px] font-bold text-zinc-700" title={row.code}>{row.code}</td>
                                            <td className="whitespace-nowrap px-2.5 py-3 text-[10px] text-zinc-500">{formatCompactOrderDate(row.createdAt)}</td>
                                            <td className="truncate px-2.5 py-3 text-[10px] text-zinc-600">
                                                <button 
                                                    onClick={() => setSelectedCustomer(row.customer)}
                                                    className="block max-w-full truncate text-left font-semibold transition-colors hover:text-emerald-600 hover:underline"
                                                    title={formatName(row.customerName)}
                                                >
                                                    {formatName(row.customerName)}
                                                </button>
                                            </td>
                                            <td className="truncate px-2.5 py-3 text-[10px] text-zinc-600">
                                                <button 
                                                    onClick={() => setSelectedVendor(row.vendor)}
                                                    className="block max-w-full truncate text-left font-semibold transition-colors hover:text-emerald-600 hover:underline"
                                                    title={formatName(row.vendor?.storeName)}
                                                >
                                                    {formatName(row.vendor?.storeName)}
                                                </button>
                                            </td>
                                            <td className="truncate px-2.5 py-3 text-[10px] text-zinc-600">
                                                {row.rider ? (
                                                    <button 
                                                        onClick={() => openRiderFromOrder(row)}
                                                        className="block max-w-full truncate text-left font-semibold transition-colors hover:text-emerald-600 hover:underline"
                                                        title={formatName(row.rider.name)}
                                                    >
                                                        {formatName(row.rider.name)}
                                                    </button>
                                                ) : '---'}
                                            </td>
                                            <td className="whitespace-nowrap px-2 py-3"><StatusBadge status={orderStatusLabel(row.status)} /></td>
                                            <td className="whitespace-nowrap px-2.5 py-3 text-[10px] text-zinc-500">{Number.isFinite(row.etaMin) && Number.isFinite(row.etaMax) ? `${row.etaMin}–${row.etaMax} min` : '—'}</td>
                                            <td className="px-1 py-3">
                                                <div className="flex justify-center">
                                                    <button 
                                                        onClick={() => setSelectedOrder(row)}
                                                        aria-label={`Open details for ${row.code || 'order'}`}
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
                    {/* Pagination for Orders */}
                    {dashboard.orders.data.length > ITEMS_PER_PAGE && (
                        <div className="px-6 py-4 bg-zinc-50/50 border-t border-zinc-100 flex items-center justify-between gap-4">
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                Page {orderPage} of {Math.ceil(dashboard.orders.data.length / ITEMS_PER_PAGE)}
                            </p>
                            <div className="flex items-center gap-2">
                                <button 
                                    disabled={orderPage === 1}
                                    onClick={() => setOrderPage(p => Math.max(1, p - 1))}
                                    className="p-1.5 bg-white border border-zinc-200 rounded-lg text-zinc-500 hover:bg-zinc-50 disabled:opacity-30 transition-colors"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button 
                                    disabled={orderPage * ITEMS_PER_PAGE >= dashboard.orders.data.length}
                                    onClick={() => setOrderPage(p => p + 1)}
                                    className="p-1.5 bg-white border border-zinc-200 rounded-lg text-zinc-500 hover:bg-zinc-50 disabled:opacity-30 transition-colors"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Revenue Chart */}
                <div className="min-w-0 overflow-hidden bg-white rounded-3xl border border-zinc-200 p-3 sm:p-4 shadow-sm flex flex-col min-h-[450px] lg:h-full relative">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 relative z-[10]">
                        <div className="flex bg-zinc-100 p-1 rounded-xl">
                            <button
                                onClick={() => setView('revenue')}
                                className={`px-4 py-1.5 text-xs rounded-lg transition-all duration-300 ${view === 'revenue' ? 'bg-[#1C5B2B] text-white shadow-md' : 'text-zinc-500'}`}
                            >
                                Gross paid order value
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

                    <div className="flex-1 h-full w-full min-h-0">
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
                                    formatter={(value) => view === 'revenue' ? formatCurrency(value) : value?.toLocaleString()}
                                />
                                <Bar
                                    dataKey={view}
                                    radius={[8, 8, 0, 0]}
                                    barSize={14}
                                    animationDuration={1000}
                                    fill={view === 'revenue' ? "url(#revenueGradient)" : "url(#ordersGradient)"}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-5">
                {/* Top Vendors Table */}
                <div className="min-w-0 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm lg:col-span-2">
                    <div className="border-b border-zinc-100 px-4 py-3">
                        <h3 className="text-sm font-semibold text-zinc-900">Top vendors</h3>
                        <p className="text-[10px] text-zinc-500">Ranked from paid, delivered orders. Delivered sales exclude delivery fees and are not wallet earnings or completed withdrawals.</p>
                    </div>
                    <div className="min-w-0 overflow-hidden">
                        <table className="w-full table-fixed text-left">
                            <colgroup><col className="w-[35%]"/><col className="w-[15%]"/><col className="w-[22%]"/><col className="w-[18%]"/><col className="w-[10%]"/></colgroup>
                            <thead>
                                <tr className="bg-zinc-50 border-b border-zinc-100">
                                    <th className="whitespace-nowrap px-3 py-3 text-[9px] uppercase font-bold text-zinc-500">Name</th>
                                    <th className="whitespace-nowrap px-2 py-3 text-center text-[9px] uppercase font-bold text-zinc-500">Orders</th>
                                    <th className="whitespace-nowrap px-3 py-3 text-[9px] uppercase font-bold text-zinc-500">Delivered sales</th>
                                    <th className="whitespace-nowrap px-2 py-3 text-center text-[9px] uppercase font-bold text-zinc-500">Status</th>
                                    <th className="px-1 py-3 text-center text-[9px] uppercase font-bold text-zinc-500">View</th>
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
                                    dashboard.topVendors.data.slice((vendorPage - 1) * ITEMS_PER_PAGE, vendorPage * ITEMS_PER_PAGE).map((row, i) => {
                                        const deliveredSales = explicitMoney(row, 'deliveredVendorSalesNaira', 'deliveredVendorSalesKobo');
                                        const sales = Number.isFinite(deliveredSales) ? deliveredSales : Number.isFinite(row.revenue) ? row.revenue : undefined;
                                        const salesTitle = Number.isFinite(sales)
                                            ? `${Number.isFinite(deliveredSales) ? 'Delivered vendor sales' : 'Delivered vendor sales, from the compatibility alias'}: ${formatCurrency(sales)}`
                                            : 'Delivered sales unavailable';
                                        return (
                                        <tr key={i} className="hover:bg-zinc-50/50 transition-colors">
                                            <td className="truncate px-3 py-3 text-[10px] font-semibold text-zinc-700" title={formatName(row.name)}>{formatName(row.name)}</td>
                                            <td className="whitespace-nowrap px-2 py-3 text-center text-[10px] font-medium text-zinc-600">{Number.isFinite(row.totalOrders) ? row.totalOrders.toLocaleString() : '—'}</td>
                                            <td className="truncate whitespace-nowrap px-3 py-3 text-[10px] font-semibold text-zinc-700" title={salesTitle}>{formatCurrency(sales)}</td>
                                            <td className="truncate px-2 py-3 text-center"><StatusBadge status={capitalizeFirst(row.status)} /></td>
                                            <td className="px-1 py-3">
                                                <div className="flex justify-center">
                                                    <button 
                                                        type="button"
                                                        aria-label={`View ${formatName(row.name)}`}
                                                        onClick={() => setSelectedVendor(row)}
                                                        className="p-2 bg-indigo-50 text-indigo-500 rounded-lg hover:bg-indigo-500 hover:text-white transition-all shadow-sm"
                                                    >
                                                        <Eye size={12} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination for Vendors */}
                    {dashboard.topVendors.data.length > ITEMS_PER_PAGE && (
                        <div className="px-6 py-4 bg-zinc-50/50 border-t border-zinc-100 flex items-center justify-between gap-4">
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                Page {vendorPage} of {Math.ceil(dashboard.topVendors.data.length / ITEMS_PER_PAGE)}
                            </p>
                            <div className="flex items-center gap-2">
                                <button 
                                    disabled={vendorPage === 1}
                                    onClick={() => setVendorPage(p => Math.max(1, p - 1))}
                                    className="p-1.5 bg-white border border-zinc-200 rounded-lg text-zinc-500 hover:bg-zinc-50 disabled:opacity-30 transition-colors"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button 
                                    disabled={vendorPage * ITEMS_PER_PAGE >= dashboard.topVendors.data.length}
                                    onClick={() => setVendorPage(p => p + 1)}
                                    className="p-1.5 bg-white border border-zinc-200 rounded-lg text-zinc-500 hover:bg-zinc-50 disabled:opacity-30 transition-colors"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
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
                            <span className="text-sm font-bold text-zinc-900">{dashboard.riderActivity.avgDeliveryTime == null ? '—' : `${Number(dashboard.riderActivity.avgDeliveryTime).toFixed(2)} mins`}</span>
                        </div>
                        <p className="text-[10px] leading-4 text-zinc-400">Pickup to delivery for the latest 100 trips in 30 days. Trips over 3 hours are left out.</p>
                    </div>
                </div>
            </div>


            <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-5">
                {/* Top Riders Table */}
                <div className="min-w-0 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm lg:col-span-2">
                    <div className="border-b border-zinc-100 px-4 py-3">
                        <h3 className="text-sm font-semibold text-zinc-900">Top Riders</h3>
                        <p className="text-[10px] text-zinc-500">Best performing riders by deliveries</p>
                    </div>
                    <div className="min-w-0 overflow-hidden">
                        <table className="w-full table-fixed text-left">
                            <colgroup><col className="w-[36%]"/><col className="w-[16%]"/><col className="w-[19%]"/><col className="w-[19%]"/><col className="w-[10%]"/></colgroup>
                            <thead>
                                <tr className="bg-zinc-50 border-b border-zinc-100">
                                    <th className="whitespace-nowrap px-3 py-3 text-[9px] uppercase font-bold text-zinc-500">Name</th>
                                    <th className="whitespace-nowrap px-2 py-3 text-center text-[9px] uppercase font-bold text-zinc-500">Delivered</th>
                                    <th className="whitespace-nowrap px-2 py-3 text-center text-[9px] uppercase font-bold text-zinc-500">Avg. Time</th>
                                    <th className="whitespace-nowrap px-2 py-3 text-center text-[9px] uppercase font-bold text-zinc-500">Status</th>
                                    <th className="px-1 py-3 text-center text-[9px] uppercase font-bold text-zinc-500">View</th>
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
                                    dashboard.topRiders.data.slice((riderPage - 1) * ITEMS_PER_PAGE, riderPage * ITEMS_PER_PAGE).map((row, i) => (
                                        <tr key={i} className="hover:bg-zinc-50/50 transition-colors">
                                            <td className="truncate px-3 py-3 text-[10px] font-semibold text-zinc-700" title={formatName(row.name)}>{formatName(row.name)}</td>
                                            <td className="whitespace-nowrap px-2 py-3 text-center text-[10px] font-medium text-zinc-600">{Number.isFinite(row.deliveries) ? row.deliveries.toLocaleString() : '-'}</td>
                                            <td className="whitespace-nowrap px-2 py-3 text-center text-[10px] font-medium text-zinc-600">{(() => { const minutes = Number(row.avgTime); return row.avgTime !== null && row.avgTime !== '' && Number.isFinite(minutes) && minutes > 0 && minutes <= 180 ? `${minutes.toFixed(2)} mins` : '-'; })()}</td>
                                            <td className="truncate px-2 py-3 text-center">
                                                <StatusBadge 
                                                    status={
                                                        (row.isSuspended ?? (row.status?.toUpperCase() === 'SUSPENDED')) ? 'Suspended' : (row.status?.toUpperCase() === 'PENDING' ? 'Pending' : 'Active')
                                                    } 
                                                />
                                            </td>
                                            <td className="px-1 py-3">
                                                <div className="flex justify-center gap-2">
                                                    <button 
                                                        onClick={() => setSelectedRider(row)}
                                                        className="p-2 bg-indigo-50 text-indigo-500 rounded-lg hover:bg-indigo-500 hover:text-white transition-all shadow-sm"
                                                        title="View Details"
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
                    {/* Pagination for Riders */}
                    {dashboard.topRiders.data.length > ITEMS_PER_PAGE && (
                        <div className="px-6 py-4 bg-zinc-50/50 border-t border-zinc-100 flex items-center justify-between gap-4">
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                Page {riderPage} of {Math.ceil(dashboard.topRiders.data.length / ITEMS_PER_PAGE)}
                            </p>
                            <div className="flex items-center gap-2">
                                <button 
                                    disabled={riderPage === 1}
                                    onClick={() => setRiderPage(p => Math.max(1, p - 1))}
                                    className="p-1.5 bg-white border border-zinc-200 rounded-lg text-zinc-500 hover:bg-zinc-50 disabled:opacity-30 transition-colors"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button 
                                    disabled={riderPage * ITEMS_PER_PAGE >= dashboard.topRiders.data.length}
                                    onClick={() => setRiderPage(p => p + 1)}
                                    className="p-1.5 bg-white border border-zinc-200 rounded-lg text-zinc-500 hover:bg-zinc-50 disabled:opacity-30 transition-colors"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>


                {/* Quick Actions Panel */}
                <div className="bg-white rounded-3xl border border-zinc-200 p-4 shadow-sm">
                    <h3 className="text-sm font-medium text-zinc-900 mb-1">Quick Action</h3>
                    <p className="text-xs text-zinc-500 mb-8 border-b border-zinc-200 pb-4">Activity stats for all riders</p>

                    <div className="space-y-2">
                        {[
                            { title: 'Create Vendor', desc: 'Add a new vendor to the platform', action: () => setIsCreateVendorOpen(true) },
                            { title: 'Add Rider', desc: 'Register a rider and assign availability', action: () => setIsCreateRiderOpen(true) },
                            { title: 'Approve vendors', desc: 'Review pending vendor accounts', href: '/admin/vendors?filter=pending' },
                            { title: 'Resolve support issues', desc: 'Contact support about customer or vendor complaints', href: 'mailto:support@getyovo.app?subject=Super%20Admin%20support%20issue' },
                        ].map((action) => {
                            const ActionElement = action.href ? 'a' : 'button';
                            return <ActionElement
                                key={action.title}
                                {...(action.href ? { href: action.href } : { type: 'button', onClick: action.action })}
                                className="w-full flex items-center justify-between px-2 py-2 bg-white hover:bg-zinc-50 rounded-2xl border border-transparent hover:border-zinc-200 transition-all group text-left"
                            >
                                <div>
                                    <h4 className="text-sm font-medium text-zinc-800 group-hover:text-indigo-600 transition-colors uppercase pr-4">{action.title}</h4>
                                    <p className="text-[10px] text-zinc-400 font-medium">{action.desc}</p>
                                </div>
                                <ChevronRight size={18} className="text-zinc-300 group-hover:text-indigo-500 transition-all group-hover:translate-x-1" />
                            </ActionElement>;
                        })}
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
                onClose={() => { setSelectedRider(null); setRiderProfileError(''); setRiderProfileLoading(false); }}
                rider={selectedRider} 
                profileLoading={riderProfileLoading}
                profileError={riderProfileError}
            />

            <CustomerModal 
                isOpen={!!selectedCustomer} 
                onClose={() => setSelectedCustomer(null)} 
                customer={selectedCustomer} 
            />

            <CreateVendorModal
                isOpen={isCreateVendorOpen}
                onClose={() => setIsCreateVendorOpen(false)}
            />

            <CreateRiderModal
                isOpen={isCreateRiderOpen}
                onClose={() => setIsCreateRiderOpen(false)}
            />
        </div >
    );
};

export default Dashboard;
