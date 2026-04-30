import React, { useState } from 'react';
import {
    Search,
    ChevronDown,
    Eye,
    ShoppingBag,
    Clock,
    Truck,
    CheckCircle2,
    Download,
    Filter
} from 'lucide-react';
import OrderModal from '../../components/admin/OrderModal';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/api';
import { useAuthStore } from '../../store/useAuthStore';
import { Loader2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

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
    const [sortBy, setSortBy] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);

    // Fetch Orders Data
    const { data: dashboardData, isLoading, error, refetch } = useQuery({
        queryKey: ['order-dashboard', filter, sortBy, page, searchQuery],
        queryFn: async () => {
            if (searchQuery) {
                return await api.get(`/superadmin/orders/search?query=${searchQuery}&page=${page}`, token);
            }
            return await api.get(`/superadmin/orders?filter=${filter}&sortBy=${sortBy}&page=${page}`, token);
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
    
    const orders = dashboardData?.data?.latestOrders || dashboardData?.data?.data || [];
    const totalPages = dashboardData?.data?.totalPages || (dashboardData?.data?.total ? Math.ceil(dashboardData?.data?.total / 20) : 1);

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
                        <div className="relative flex-1 sm:flex-initial">
                            <select 
                                value={sortBy}
                                onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                                className="w-full appearance-none bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2.5 md:py-2 pr-10 text-[10px] font-bold text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 cursor-pointer"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="in_transit">In Transit</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                        </div>
                        <div className="relative flex-1 sm:flex-initial">
                            <select 
                                value={filter}
                                onChange={(e) => { setFilter(e.target.value); setPage(1); }}
                                className="w-full appearance-none bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2.5 md:py-2 pr-10 text-[10px] font-bold text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 cursor-pointer"
                            >
                                <option value="all">All Time</option>
                                <option value="today">Today</option>
                                <option value="yesterday">Yesterday</option>
                                <option value="last7days">Last 7 Days</option>
                                <option value="last30days">Last 30 Days</option>
                                <option value="thisMonth">This Month</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                        </div>
                        <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 md:py-2 bg-emerald-800 rounded-3xl text-[10px] font-bold text-white hover:bg-emerald-900 transition-all shadow-md shadow-emerald-900/10 whitespace-nowrap">
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
                                        <td className="px-3 py-3.5 text-[10px] font-bold text-zinc-900 truncate max-w-[120px]">{order.customerName}</td>
                                        <td className="px-3 py-3.5 text-[10px] font-medium text-zinc-600 truncate max-w-[120px]">{order.vendorStoreName}</td>
                                        <td className="px-3 py-3.5 text-[10px] font-medium text-zinc-600">{order.riderName || 'Not Assigned'}</td>
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
                                            {new Date(order.orderTime || order.placedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="px-3 py-3.5 text-[10px] font-bold text-zinc-900 whitespace-nowrap">
                                            {order.status === 'DELIVERED' 
                                                ? new Date(order.etaOrDelivered || order.deliveredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                : (order.etaOrDelivered || 'Calculating...')}
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
                    <div className="px-4 py-3 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between">
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Page {page} of {totalPages}</p>
                        <div className="flex items-center gap-1">
                            <button 
                                disabled={page === 1}
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                className="p-2 hover:bg-zinc-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft size={16} className="text-zinc-500" />
                            </button>
                            <button 
                                disabled={page === totalPages}
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                className="p-2 hover:bg-zinc-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <ChevronRight size={16} className="text-zinc-500" />
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
