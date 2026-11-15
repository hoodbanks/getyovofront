import React, { useState, useRef, useEffect } from 'react';
import {
    Search,
    ChevronDown,
    Eye,
    ShoppingBag,
    Clock,
    Truck,
    CheckCircle2,
    XCircle,
    Download,
    X,
    Calendar
} from 'lucide-react';
import OrderModal from '../../components/admin/OrderModal';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/api';
import { useAuthStore } from '../../store/useAuthStore';
import { formatName, exportToCSV } from '../../utils/formatters';
import { Loader2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { WalletCustomDateModal } from '../../components/admin/wallet/WalletControls';

const FilterDropdown = ({ selected, onSelect, options, label }) => {
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

    const displayLabel = options.find(o => o.value === selected)?.label || label;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-zinc-200 rounded-xl text-[10px] font-bold text-zinc-900 hover:border-zinc-300 transition-all shadow-sm whitespace-nowrap"
            >
                {displayLabel}
                <ChevronDown size={14} className={`text-zinc-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white border border-zinc-100 rounded-2xl shadow-xl z-50 py-2 animate-in fade-in zoom-in-95 duration-200">
                    {options.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => {
                                onSelect(opt.value);
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-[10px] font-medium transition-colors ${
                                selected === opt.value
                                    ? 'bg-zinc-50 text-emerald-600 font-bold'
                                    : 'text-zinc-600 hover:bg-zinc-50'
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const StatCard = ({ label, value, subLabel, icon: Icon, color, bg, borderColor, cardBg, dotColor }) => (
    <div className={`relative overflow-hidden p-4 pb-6 rounded-xl ${cardBg} border ${borderColor} shadow-sm transition-all hover:shadow-md group flex-1 min-w-0`}>
        {/* Grain/Texture Effect using Radial Gradients */}
        <div className={`absolute inset-0 opacity-[0.03] pointer-events-none`}
            style={{ backgroundImage: `radial-gradient(${dotColor} 1px, transparent 1px)`, backgroundSize: '4px 4px' }}></div>

        {/* Glow Effect Background */}
        <div className={`absolute -top-10 -right-10 w-40 h-40 ${bg} opacity-10 blur-[30px] rounded-full transition-all duration-500 group-hover:scale-125 group-hover:opacity-20`} />

        <div className="relative z-10 flex justify-between items-start">
            <div>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">{label}</p>
                <div className="flex flex-col">
                    <h3 className="text-sm font-bold text-zinc-900 leading-tight">{value}</h3>
                    <p className="text-[10px] font-medium text-zinc-400 mt-2">{subLabel}</p>
                </div>
            </div>
            <div className={`p-2 rounded-xl ${bg} ${color} shadow-sm border border-white/40 group-hover:rotate-6 transition-all duration-300`}>
                <Icon size={18} />
            </div>
        </div>
    </div>
);

const formatDateRangeLabel = (start, end) => {
    if (!start || !end) return 'Filter by date range';
    const formatDate = (value) => new Date(`${value}T00:00:00`).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
    return `${formatDate(start)} to ${formatDate(end)}`;
};

const formatLagosDateTime = (value) => {
    if (!value) return 'Not available';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Not available';
    return new Intl.DateTimeFormat('en-NG', {
        timeZone: 'Africa/Lagos', day: 'numeric', month: 'short', year: 'numeric',
        hour: 'numeric', minute: '2-digit',
    }).format(date);
};
const formatNaira = (value) => typeof value === 'number' && Number.isFinite(value)
    ? new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 2 }).format(value)
    : 'Not available';

const cardCount = (value, isLoading) => isLoading ? '…' : Number.isFinite(value) ? value.toLocaleString() : '—';

const Orders = () => {
    const [isMobileLayout, setIsMobileLayout] = useState(() => window.innerWidth < 768);
    const token = useAuthStore((state) => state.accessToken);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [draftDates, setDraftDates] = useState({ start: '', end: '' });
    const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
    const [page, setPage] = useState(1);

    useEffect(() => {
        const updateLayout = () => setIsMobileLayout(window.innerWidth < 768);
        window.addEventListener('resize', updateLayout);
        return () => window.removeEventListener('resize', updateLayout);
    }, []);

    const trimmedQuery = searchQuery.trim();
    const ordersQuery = useQuery({
        queryKey: ['order-dashboard', page, filter, sortBy, trimmedQuery, startDate, endDate],
        queryFn: () => {
            const params = new URLSearchParams({ page: String(page), filter, sortBy });
            if (trimmedQuery) params.set('query', trimmedQuery);
            if (filter === 'custom' && startDate && endDate) {
                params.set('from', startDate);
                params.set('to', endDate);
            }
            return api.get(`/superadmin/orders?${params.toString()}`, token);
        },
        placeholderData: (previousData) => previousData,
    });
    const dashboardData = ordersQuery.data;
    const summary = dashboardData?.data?.summary;
    const ordersPage = dashboardData?.data?.orders;
    const orders = ordersPage?.data;
    const ordersShapeValid = Boolean(summary && ordersPage && Array.isArray(orders)
        && Number.isFinite(ordersPage.total) && Number.isFinite(ordersPage.page)
        && Number.isFinite(ordersPage.pageSize));
    const isLoading = ordersQuery.isLoading;
    const error = ordersQuery.error || (dashboardData && !ordersShapeValid ? new Error('Unexpected orders response shape.') : null);
    const refetch = ordersQuery.refetch;
    const totalItems = ordersShapeValid ? ordersPage.total : 0;
    const totalPages = ordersShapeValid ? Math.max(1, Math.ceil(ordersPage.total / ordersPage.pageSize)) : 1;

    const handleExport = () => {
        const exportData = (orders || []).map(o => ({
            'Order Code': o.orderCode || o.code,
            'Customer': o.customerName,
            'Vendor': o.vendorStoreName,
            'Rider': o.riderName || 'Not Assigned',
            'Status': o.status,
            'Amount (NGN)': o.totalAmount,
            'Order Time': formatLagosDateTime(o.orderTime),
            'ETA / Delivered': formatLagosDateTime(o.etaOrDelivered)
        }));
        exportToCSV(exportData, 'Orders');
    };

    const openModal = (order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6 max-w-[440px] md:max-w-[1600px] mx-auto pb-10">
            <div className='bg-white py-5 rounded-2xl'>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 gap-3 rounded-xl p-4 md:grid-cols-2 md:gap-4 xl:grid-cols-3">
                    <StatCard
                        label="Paid Orders"
                        value={cardCount(summary?.totalOrders, isLoading)}
                        subLabel="Paid orders only"
                        icon={ShoppingBag}
                        color="text-white"
                        bg="bg-emerald-900"
                        cardBg="bg-emerald-100/20"
                        borderColor="border-emerald-500"
                        dotColor="#10b981"
                    />
                    <StatCard
                        label="Pending Orders"
                        value={cardCount(summary?.pendingOrders, isLoading)}
                        subLabel="Paid; awaiting Vendor action"
                        icon={Clock}
                        color="text-white"
                        bg="bg-blue-900"
                        cardBg="bg-blue-100/20"
                        borderColor="border-blue-500"
                        dotColor="#3b82f6"
                    />
                    <StatCard
                        label="In Transit"
                        value={cardCount(summary?.inTransitOrders, isLoading)}
                        subLabel="Out for Delivery"
                        icon={Truck}
                        color="text-white"
                        bg="bg-purple-900"
                        cardBg="bg-purple-100/20"
                        borderColor="border-purple-500"
                        dotColor="#a855f7"
                    />
                    <StatCard
                        label="Delivered Today"
                        value={cardCount(summary?.deliveredToday, isLoading)}
                        subLabel="Completed today"
                        icon={CheckCircle2}
                        color="text-white"
                        bg="bg-amber-900"
                        cardBg="bg-amber-100/20"
                        borderColor="border-amber-500"
                        dotColor="#f59e0b"
                    />
                    <StatCard
                        label="Cancelled Orders"
                        value={cardCount(summary?.cancelledOrders, isLoading)}
                        subLabel="Count of paid vendor orders currently cancelled. Not a refund amount."
                        icon={XCircle}
                        color="text-white"
                        bg="bg-rose-900"
                        cardBg="bg-rose-100/20"
                        borderColor="border-rose-500"
                        dotColor="#f43f5e"
                    />
                </div>
                <p className="px-4 pb-4 text-[11px] leading-5 text-zinc-500">This page counts paid orders that have a vendor. The order total is the original order amount. Customer Wallet refunds are a separate ledger credit and are not shown or subtracted here.</p>
            </div>

            {/* Search and date filter are separate from the summary cards. */}
            <div className="rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    {/* Search Bar */}
                    <div className="relative w-full min-w-0 lg:max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                        <input
                            type="text"
                            maxLength={50}
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                            placeholder="Search code, store, product..."
                            className="w-full rounded-2xl border border-transparent bg-zinc-100 py-3 pl-11 pr-4 text-sm outline-none transition-colors placeholder:text-zinc-500 focus:border-emerald-700/20 focus:bg-white focus:ring-2 focus:ring-emerald-700/10"
                        />
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => { setDraftDates({ start: startDate, end: endDate }); setIsDateFilterOpen(true); }}
                            className="flex min-h-11 items-center gap-2 rounded-xl border border-zinc-100 bg-zinc-50 px-4 text-[11px] font-semibold text-zinc-600 transition-colors hover:bg-zinc-100"
                        >
                            <Calendar size={15} className="text-zinc-500" />
                            {formatDateRangeLabel(startDate, endDate)}
                        </button>

                        {/* Reset Button */}
                                {(searchQuery || startDate || endDate) && (
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setStartDate('');
                                    setEndDate('');
                                    setFilter('all');
                                    setSortBy('all');
                                    setPage(1);
                                }}
                                className="flex min-h-11 items-center gap-2 rounded-xl bg-zinc-900 px-4 text-[10px] font-bold uppercase tracking-widest text-white shadow-sm transition-all hover:bg-zinc-800"
                            >
                                <X size={14} className="group-hover:rotate-90 transition-transform duration-300" />
                                Reset
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-[1.5rem] border border-zinc-200 overflow-hidden shadow-sm">
                <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-zinc-100 gap-4">
                    <div>
                        <h3 className="text-sm md:text-base font-medium text-zinc-900">Orders</h3>
                        <p className="text-[10px] text-zinc-500 font-medium">Paid vendor orders. Cancelled rows keep their original order amount.</p>
                    </div>
                    <div className="grid w-full grid-cols-2 items-center gap-2 sm:flex sm:w-auto sm:flex-wrap sm:justify-end">
                        <FilterDropdown
                            selected={sortBy}
                            onSelect={(val) => { setSortBy(val); setPage(1); }}
                            label="All Status"
                            options={[
                                { value: 'all', label: 'All Status' },
                                { value: 'pending', label: 'Pending' },
                                { value: 'in_transit', label: 'Out for Delivery' },
                                { value: 'delivered', label: 'Delivered' },
                                { value: 'cancelled', label: 'Cancelled' },
                            ]}
                        />
                        <FilterDropdown
                            selected={filter}
                            label="All Time"
                            options={[
                                { value: 'all', label: 'All Time' },
                                { value: 'today', label: 'Today' },
                                { value: 'yesterday', label: 'Yesterday' },
                                { value: 'last7days', label: 'Last 7 Days' },
                                { value: 'last30days', label: 'Last 30 Days' },
                                { value: 'thisMonth', label: 'This Month' },
                                { value: 'lastMonth', label: 'Last Month' },
                                { value: 'custom', label: 'Custom range' },
                            ]}
                            onSelect={(val) => {
                                if (val === 'custom') {
                                    setDraftDates({ start: startDate, end: endDate });
                                    setIsDateFilterOpen(true);
                                    return;
                                }
                                setFilter(val);
                                setStartDate('');
                                setEndDate('');
                                setPage(1);
                            }}
                        />
                        <button 
                            onClick={handleExport}
                            className="col-span-2 flex items-center justify-center gap-2 px-4 py-2.5 sm:col-span-1 sm:flex-none md:py-2 bg-emerald-800 rounded-3xl text-[10px] font-bold text-white hover:bg-emerald-900 transition-all shadow-md shadow-emerald-900/10 whitespace-nowrap"
                        >
                            <Download size={14} />
                            Export this page
                        </button>
                    </div>
                </div>

                {!isMobileLayout && <div className="w-full overflow-x-auto">
                    <table className="mx-auto w-full max-w-[1200px] table-fixed">
                        <colgroup>
                            <col className="w-[10%]" /><col className="w-[15%]" /><col className="w-[15%]" />
                            <col className="w-[12%]" /><col className="w-[11%]" /><col className="w-[15%]" />
                            <col className="w-[12%]" /><col className="w-[10%]" />
                        </colgroup>
                        <thead>
                            <tr className="bg-zinc-50/50 border-b border-zinc-100">
                                <th className="truncate px-1.5 py-3 text-left text-[9px] font-bold text-zinc-400 uppercase tracking-wide">Order ID</th>
                                <th className="truncate px-1.5 py-3 text-left text-[9px] font-bold text-zinc-400 uppercase tracking-wide">Customer</th>
                                <th className="truncate px-1.5 py-3 text-left text-[9px] font-bold text-zinc-400 uppercase tracking-wide">Vendor</th>
                                <th className="truncate px-1.5 py-3 text-left text-[9px] font-bold text-zinc-400 uppercase tracking-wide">Rider</th>
                                <th className="truncate px-1.5 py-3 text-left text-[9px] font-bold text-zinc-400 uppercase tracking-wide">Status</th>
                                <th className="truncate px-1.5 py-3 text-left text-[9px] font-bold text-zinc-400 uppercase tracking-wide">Order Time</th>
                                <th className="truncate px-1.5 py-3 text-center text-[9px] font-bold text-zinc-400 uppercase tracking-wide" title="Original order amount in naira. Not a Customer Wallet refund.">Order total</th>
                                <th className="truncate px-1.5 py-3 text-center text-[9px] font-bold text-zinc-400 uppercase tracking-wide">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="8" className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 size={32} className="text-emerald-600 animate-spin" />
                                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Loading orders...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan="8" className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <AlertCircle size={32} className="text-rose-500" />
                                            <p className="text-sm font-bold text-rose-600" role="alert">{error.message || 'Orders could not be loaded.'}</p>
                                            <button onClick={() => refetch()} className="text-[10px] font-bold text-zinc-500 underline uppercase mt-2">Try again</button>
                                        </div>
                                    </td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="py-20 text-center text-xs font-bold text-zinc-400 uppercase tracking-widest">No orders found</td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-zinc-50/50 transition-colors group">
                                        <td className="truncate px-1.5 py-3 text-[10px] font-bold uppercase text-zinc-800" title={order.orderCode}>{order.orderCode}</td>
                                        <td className="truncate px-1.5 py-3 text-[10px] font-semibold text-zinc-900" title={order.customerName}>{formatName(order.customerName)}</td>
                                        <td className="truncate px-1.5 py-3 text-[10px] font-medium text-zinc-600" title={order.vendorStoreName}>{formatName(order.vendorStoreName)}</td>
                                        <td className="truncate px-1.5 py-3 text-[10px] font-medium text-zinc-600" title={order.riderName || 'Not available'}>{order.riderName ? formatName(order.riderName) : 'Not available'}</td>
                                        <td className="px-1.5 py-3">
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border whitespace-nowrap uppercase tracking-tighter ${
                                                order.status === 'DELIVERED'
                                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                    : order.status === 'CANCELLED'
                                                        ? 'bg-rose-50 text-rose-600 border-rose-100'
                                                        : order.status === 'OUT_FOR_DELIVERY'
                                                            ? 'bg-blue-50 text-blue-600 border-blue-100'
                                                            : 'bg-amber-50 text-amber-600 border-amber-100'
                                                }`}>
                                                {order.status?.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-1.5 py-3 text-[10px] font-medium text-zinc-500">
                                            {formatLagosDateTime(order.orderTime)}
                                        </td>
                                        <td className="whitespace-nowrap px-1.5 py-3 text-center text-[10px] font-semibold tabular-nums text-zinc-800">{formatNaira(order.totalAmount)}</td>
                                        <td className="px-1.5 py-3">
                                            <div className="flex justify-center">
                                                <button
                                                    onClick={() => openModal(order)}
                                                    aria-label={`Open details for ${order.orderCode || order.code || 'order'}`}
                                                    className="p-1.5 bg-indigo-50 text-indigo-500 rounded-lg hover:bg-indigo-500 hover:text-white transition-all shadow-sm"
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
                </div>}
                {isMobileLayout && <div className="divide-y divide-zinc-100">
                    {isLoading ? (
                        <div className="flex flex-col items-center gap-3 py-14"><Loader2 size={28} className="animate-spin text-emerald-600" /><p className="text-xs font-semibold text-zinc-500">Loading orders…</p></div>
                    ) : error ? (
                        <div className="px-5 py-10 text-center"><p className="text-sm font-semibold text-rose-600" role="alert">{error.message || 'Orders could not be loaded.'}</p><button onClick={() => refetch()} className="mt-3 text-xs font-bold text-zinc-600 underline">Try again</button></div>
                    ) : orders.length === 0 ? (
                        <p className="px-5 py-12 text-center text-sm text-zinc-500">No orders found</p>
                    ) : orders.map((order) => (
                        <article key={order.id} className="space-y-3 px-4 py-4">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0"><p className="truncate text-sm font-bold text-zinc-900">{order.orderCode || 'Order'}</p><p className="mt-0.5 text-[11px] text-zinc-500">{formatLagosDateTime(order.orderTime)}</p></div>
                                <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase ${order.status === 'DELIVERED' ? 'border-emerald-100 bg-emerald-50 text-emerald-700' : order.status === 'CANCELLED' ? 'border-rose-100 bg-rose-50 text-rose-700' : order.status === 'OUT_FOR_DELIVERY' ? 'border-blue-100 bg-blue-50 text-blue-700' : 'border-amber-100 bg-amber-50 text-amber-700'}`}>{order.status?.replace(/_/g, ' ') || 'Unknown'}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-x-3 gap-y-2 rounded-xl bg-zinc-50 p-3">
                                <div className="min-w-0"><p className="text-[9px] font-bold uppercase tracking-wide text-zinc-400">Customer</p><p className="mt-0.5 truncate text-xs font-semibold text-zinc-800">{formatName(order.customerName)}</p></div>
                                <div className="min-w-0"><p className="text-[9px] font-bold uppercase tracking-wide text-zinc-400">Vendor</p><p className="mt-0.5 truncate text-xs font-semibold text-zinc-800">{formatName(order.vendorStoreName)}</p></div>
                                <div className="min-w-0"><p className="text-[9px] font-bold uppercase tracking-wide text-zinc-400">Rider</p><p className="mt-0.5 truncate text-xs font-semibold text-zinc-800">{order.riderName ? formatName(order.riderName) : 'Not assigned'}</p></div>
                                <div className="min-w-0"><p className="text-[9px] font-bold uppercase tracking-wide text-zinc-400">Order total</p><p className="mt-0.5 truncate text-xs font-bold tabular-nums text-zinc-900">{formatNaira(order.totalAmount)}</p></div>
                            </div>
                            <button onClick={() => openModal(order)} aria-label={`Open details for ${order.orderCode || order.code || 'order'}`} className="flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50 text-xs font-bold text-indigo-700 transition hover:bg-indigo-100"><Eye size={14} /> View order details</button>
                        </article>
                    ))}
                </div>}
                {/* Pagination */}
                {!isLoading && !error && ordersShapeValid && (
                    <div className="px-4 py-3 bg-zinc-50 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                            Showing {totalItems === 0 ? 0 : Math.min((ordersPage.page - 1) * ordersPage.pageSize + 1, totalItems)} to {Math.min(ordersPage.page * ordersPage.pageSize, totalItems)} of {totalItems} orders
                        </p>
                        {totalPages > 1 && (
                        <div className="flex items-center gap-2">
                            <button 
                                disabled={page === 1}
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                className="flex items-center gap-1 px-3 py-1.5 bg-zinc-50 rounded-lg text-[11px] font-bold text-zinc-500 hover:bg-zinc-100 disabled:opacity-50 transition-colors"
                            >
                                <ChevronLeft size={14} /> Previous
                            </button>

                            <div className="hidden sm:flex items-center gap-1 mx-2">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).reduce((acc, p) => {
                                    if (p === 1 || p === totalPages || Math.abs(p - page) <= 1) {
                                        acc.push(p);
                                    } else if (acc[acc.length - 1] !== '...') {
                                        acc.push('...');
                                    }
                                    return acc;
                                }, []).map((p, index) => (
                                    p === '...' ? (
                                        <span key={`dots-${index}`} className="text-zinc-400 text-[11px] px-1">...</span>
                                    ) : (
                                        <button
                                            key={p}
                                            onClick={() => setPage(p)}
                                            className={`min-w-[28px] h-7 px-2 flex items-center justify-center rounded-lg text-[11px] font-bold transition-colors ${
                                                page === p 
                                                    ? 'bg-emerald-600 text-white shadow-sm' 
                                                    : 'text-zinc-500 hover:bg-zinc-100'
                                            }`}
                                        >
                                            {p}
                                        </button>
                                    )
                                ))}
                            </div>

                            <button 
                                disabled={page === totalPages}
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                className="flex items-center gap-1 px-3 py-1.5 bg-zinc-50 rounded-lg text-[11px] font-bold text-zinc-500 hover:bg-zinc-100 disabled:opacity-50 transition-colors"
                            >
                                Next <ChevronRight size={14} />
                            </button>
                        </div>
                        )}
                    </div>
                )}
            </div>

            <OrderModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                order={selectedOrder}
            />
            <WalletCustomDateModal
                isOpen={isDateFilterOpen}
                dates={draftDates}
                onDatesChange={setDraftDates}
                onClose={() => setIsDateFilterOpen(false)}
                onApply={(dates) => {
                    setStartDate(dates.start);
                    setEndDate(dates.end);
                    setFilter('custom');
                    setPage(1);
                    setIsDateFilterOpen(false);
                }}
            />
        </div>
    );
};

export default Orders;
