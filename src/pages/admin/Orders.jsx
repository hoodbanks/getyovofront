import React, { useState, useRef, useEffect } from 'react';
import {
    Search,
    ChevronDown,
    Eye,
    ShoppingBag,
    Clock,
    Truck,
    CheckCircle2,
    Download
} from 'lucide-react';
import OrderModal from '../../components/admin/OrderModal';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/api';
import { useAuthStore } from '../../store/useAuthStore';
import { formatName, formatDate, formatDateTime, exportToCSV } from '../../utils/formatters';
import { Loader2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

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

const Orders = () => {
    const token = useAuthStore((state) => state.accessToken);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filter, setFilter] = useState('all');
    const [status, setStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);

    // Fetch Orders Data
    const { data: dashboardData, isLoading, error, refetch } = useQuery({
        queryKey: ['order-dashboard', filter, page, searchQuery],
        queryFn: async () => {
            if (searchQuery) {
                return await api.get(`/superadmin/orders/search?query=${searchQuery}&page=${page}&limit=20`, token);
            }
            return await api.get(`/superadmin/orders?filter=${filter}&page=${page}&limit=20`, token);
        },
        keepPreviousData: true
    });

    const summary = dashboardData?.data?.summary || {
        totalOrders: 0,
        pendingOrders: 0,
        inTransitOrders: 0,
        deliveredToday: 0,
        cancelledOrders: 0
    };

    const allOrders = dashboardData?.data?.latestOrders || dashboardData?.data?.data || [];

    // Apply client-side status filtering
    const orders = status === 'all'
        ? allOrders
        : allOrders.filter(o => o.status?.toUpperCase() === status.toUpperCase().replace(/ /g, '_'));

    const totalItems = dashboardData?.data?.total || summary.totalOrders || orders.length || 0;
    const totalPages = dashboardData?.data?.totalPages || (totalItems ? Math.ceil(totalItems / 20) : 1);

    const handleExport = () => {
        const exportData = orders.map(o => ({
            'Order Code': o.orderCode || o.code,
            'Customer': o.customerName,
            'Vendor': o.vendorStoreName,
            'Rider': o.riderName || 'Not Assigned',
            'Status': o.status,
            'Amount (NGN)': o.totalAmount,
            'Order Time': formatDateTime(o.orderTime || o.placedAt || o.createdAt),
            'ETA / Delivered': formatDateTime(o.etaOrDelivered || o.deliveredAt)
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
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 md:gap-4 p-4 rounded-xl">
                    <StatCard
                        label="Total Orders"
                        value={summary.totalOrders?.toLocaleString()}
                        subLabel="All-time"
                        icon={ShoppingBag}
                        color="text-white"
                        bg="bg-emerald-900"
                        cardBg="bg-emerald-100/20"
                        borderColor="border-emerald-500"
                        dotColor="#10b981"
                    />
                    <StatCard
                        label="Pending Orders"
                        value={summary.pendingOrders?.toLocaleString()}
                        subLabel="Awaiting action"
                        icon={Clock}
                        color="text-white"
                        bg="bg-blue-900"
                        cardBg="bg-blue-100/20"
                        borderColor="border-blue-500"
                        dotColor="#3b82f6"
                    />
                    <StatCard
                        label="In Transit"
                        value={summary.inTransitOrders?.toLocaleString()}
                        subLabel="On the way"
                        icon={Truck}
                        color="text-white"
                        bg="bg-purple-900"
                        cardBg="bg-purple-100/20"
                        borderColor="border-purple-500"
                        dotColor="#a855f7"
                    />
                    <StatCard
                        label="Delivered Today"
                        value={summary.deliveredToday?.toLocaleString()}
                        subLabel="Completed"
                        icon={CheckCircle2}
                        color="text-white"
                        bg="bg-amber-900"
                        cardBg="bg-amber-100/20"
                        borderColor="border-amber-500"
                        dotColor="#f59e0b"
                    />
                </div>

                {/* Search Bar Section */}
                <div className="px-4">
                    <div className="relative w-full sm:max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                            placeholder="Search code, store, product..."
                            className="w-full pl-12 pr-6 py-4 bg-zinc-100 border-none rounded-3xl text-sm focus:ring-2 focus:ring-emerald-500/10 placeholder:text-zinc-500 outline-none transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-[1.5rem] border border-zinc-200 overflow-hidden shadow-sm">
                <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-zinc-100 gap-4">
                    <div>
                        <h3 className="text-sm md:text-base font-medium text-zinc-900">Orders</h3>
                        <p className="text-[10px] text-zinc-500 font-medium">All Order operations in one place.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                        <FilterDropdown
                            selected={status}
                            onSelect={(val) => { setStatus(val); setPage(1); }}
                            label="All Status"
                            options={[
                                { value: 'all', label: 'All Status' },
                                { value: 'preparing', label: 'Preparing' },
                                { value: 'ready', label: 'Ready' },
                                { value: 'out_for_delivery', label: 'Out for Delivery' },
                                { value: 'delivered', label: 'Delivered' },
                                { value: 'cancelled', label: 'Cancelled' },
                            ]}
                        />
                        <FilterDropdown
                            selected={filter}
                            onSelect={(val) => { setFilter(val); setPage(1); }}
                            label="All Time"
                            options={[
                                { value: 'all', label: 'All Time' },
                                { value: 'today', label: 'Today' },
                                { value: 'yesterday', label: 'Yesterday' },
                                { value: 'last7days', label: 'Last 7 Days' },
                                { value: 'last30days', label: 'Last 30 Days' },
                                { value: 'thisMonth', label: 'This Month' },
                            ]}
                        />
                        <button 
                            onClick={handleExport}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 md:py-2 bg-emerald-800 rounded-3xl text-[10px] font-bold text-white hover:bg-emerald-900 transition-all shadow-md shadow-emerald-900/10 whitespace-nowrap"
                        >
                            <Download size={14} />
                            Export CSV
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-zinc-50/50 border-b border-zinc-100">
                                <th className="px-3 py-3.5 text-left text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Order ID</th>
                                <th className="px-3 py-3.5 text-left text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Customer Name</th>
                                <th className="px-3 py-3.5 text-left text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Vendor</th>
                                <th className="px-3 py-3.5 text-left text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Rider</th>
                                <th className="px-3 py-3.5 text-left text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Status</th>
                                <th className="px-3 py-3.5 text-left text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Order Time</th>
                                <th className="px-3 py-3.5 text-left text-[9px] font-bold text-zinc-400 uppercase tracking-wider">ETA/Delivered</th>
                                <th className="px-3 py-3.5 text-center text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Action</th>
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
                                            <p className="text-sm font-bold text-rose-500">Failed to load orders</p>
                                            <button onClick={() => refetch()} className="text-[10px] font-bold text-zinc-500 underline uppercase mt-2">Try again</button>
                                        </div>
                                    </td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="py-20 text-center text-xs font-bold text-zinc-400 uppercase tracking-widest">No orders found</td>
                                </tr>
                            ) : (
                                orders.map((order, idx) => (
                                    <tr key={idx} className="hover:bg-zinc-50/50 transition-colors group">
                                        <td className="px-3 py-3.5 text-[10px] font-bold text-zinc-800 uppercase">{order.orderCode || order.code}</td>
                                        <td className="px-3 py-3.5 text-[10px] font-bold text-zinc-900 truncate max-w-[120px]">{formatName(order.customerName)}</td>
                                        <td className="px-3 py-3.5 text-[10px] font-medium text-zinc-600 truncate max-w-[120px]">{formatName(order.vendorStoreName)}</td>
                                        <td className="px-3 py-3.5 text-[10px] font-medium text-zinc-600">{order.riderName ? formatName(order.riderName) : 'Not Assigned'}</td>
                                        <td className="px-3 py-3.5">
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border whitespace-nowrap uppercase tracking-tighter ${
                                                order.status === 'DELIVERED'
                                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                    : order.status === 'CANCELLED'
                                                        ? 'bg-rose-50 text-rose-600 border-rose-100'
                                                        : order.status === 'OUT_FOR_DELIVERY' || order.status === 'IN_TRANSIT'
                                                            ? 'bg-blue-50 text-blue-600 border-blue-100'
                                                            : 'bg-amber-50 text-amber-600 border-amber-100'
                                                }`}>
                                                {order.status?.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3.5 text-[10px] font-medium text-zinc-400 whitespace-nowrap">
                                            {formatDateTime(order.orderTime || order.placedAt || order.createdAt)}
                                        </td>
                                        <td className="px-3 py-3.5 text-[10px] font-bold text-zinc-900 whitespace-nowrap">
                                            {formatDateTime(order.etaOrDelivered || order.deliveredAt)}
                                        </td>
                                        <td className="px-3 py-3.5">
                                            <div className="flex justify-center">
                                                <button
                                                    onClick={() => openModal(order)}
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
                </div>
                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-4 py-3 bg-zinc-50 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                            Showing {Math.min((page - 1) * 20 + 1, totalItems)} to {Math.min(page * 20, totalItems)} of {totalItems} items
                        </p>
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
                    </div>
                )}
            </div>

            <OrderModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                order={selectedOrder}
            />
        </div>
    );
};

export default Orders;
