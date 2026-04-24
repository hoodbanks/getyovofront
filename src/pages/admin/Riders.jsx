import React, { useState } from 'react';
import {
    Search,
    ChevronDown,
    Eye,
    Bike,
    Activity,
    UserX,
    Navigation,
    Plus,
    Loader2,
    ChevronLeft,
    ChevronRight,
    AlertCircle
} from 'lucide-react';
import RiderModal from '../../components/admin/RiderModal';
import CreateRiderModal from '../../components/admin/CreateRiderModal';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/api';
import { useAuthStore } from '../../store/useAuthStore';

const StatCard = ({ label, value, subLabel, icon: Icon, color, bg, borderColor, cardBg, dotColor }) => (
    <div className={`relative overflow-hidden p-4 pb-6 rounded-xl ${cardBg} border ${borderColor} shadow-sm transition-all hover:shadow-md group flex-1 min-w-[200px]`}>
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
                    <p className="text-[9px] font-medium text-zinc-400 mt-2">{subLabel}</p>
                </div>
            </div>
            <div className={`p-2 rounded-xl ${bg} ${color} shadow-sm border border-white/40 group-hover:rotate-6 transition-all duration-300`}>
                <Icon size={18} />
            </div>
        </div>
    </div>
);

const Riders = () => {
    const token = useAuthStore((state) => state.accessToken);
    const queryClient = useQueryClient();
    const [selectedRider, setSelectedRider] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('riders'); // 'riders' or 'available_orders'
    const [page, setPage] = useState(1);
    const [ordersPage, setOrdersPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('date_newest');

    // Fetch Riders List
    const { data: ridersData, isLoading: isLoadingRiders, error: ridersError, refetch: refetchRiders } = useQuery({
        queryKey: ['riders', page, searchQuery, filter, sortBy],
        queryFn: async () => {
            if (searchQuery) {
                return await api.get(`/superadmin/riders/search?query=${searchQuery}&page=${page}`, token);
            }
            return await api.get(`/superadmin/riders?page=${page}&filter=${filter}&sortBy=${sortBy}`, token);
        },
        placeholderData: (previousData) => previousData
    });

    // Fetch Available Orders (Monitoring View)
    const { data: availableOrdersData, isLoading: isLoadingOrders } = useQuery({
        queryKey: ['available-orders', ordersPage],
        queryFn: () => api.get(`/rider/orders/available?page=${ordersPage}`, token), // Assuming admin can view or it's bridged
        enabled: activeTab === 'available_orders'
    });

    const riders = ridersData?.data?.riders?.data || [];
    const summary = ridersData?.data?.summary || {
        total: 0,
        active: 0,
        inactive: 0,
        suspended: 0,
        onDelivery: 0
    };
    const totalPages = ridersData?.data?.riders?.totalPages || 1;

    const openDetailModal = (rider) => {
        setSelectedRider(rider);
        setIsDetailModalOpen(true);
    };

    return (
        <div className="space-y-6 w-full mx-auto">
            <div className='bg-white py-5 rounded-2xl'>
                {/* Stats Grid */}
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl">
                    <StatCard
                        label="Total Riders"
                        value={summary.total?.toLocaleString() || '0'}
                        subLabel="Registered system-wide"
                        icon={Bike}
                        color="text-white"
                        bg="bg-emerald-900"
                        cardBg="bg-emerald-100/20"
                        borderColor="border-emerald-500"
                        dotColor="#10b981"
                    />
                    <StatCard
                        label="Active Riders"
                        value={summary.active?.toLocaleString() || '0'}
                        subLabel="On-duty & verified"
                        icon={Activity}
                        color="text-white"
                        bg="bg-blue-900"
                        cardBg="bg-blue-100/20"
                        borderColor="border-blue-500"
                        dotColor="#3b82f6"
                    />
                    <StatCard
                        label="Suspended"
                        value={summary.suspended?.toLocaleString() || '0'}
                        subLabel="Violations/Blocked"
                        icon={UserX}
                        color="text-white"
                        bg="bg-rose-900"
                        cardBg="bg-rose-100/20"
                        borderColor="border-rose-500"
                        dotColor="#f43f5e"
                    />
                    <StatCard
                        label="On Delivery"
                        value={summary.onDelivery?.toLocaleString() || '0'}
                        subLabel="Currently in transit"
                        icon={Navigation}
                        color="text-white"
                        bg="bg-amber-900"
                        cardBg="bg-amber-100/20"
                        borderColor="border-amber-500"
                        dotColor="#f59e0b"
                    />
                </div>

                {/* Tabs & Search */}
                <div className="px-4 flex items-center justify-between mt-4">
                    <div className="flex gap-1 bg-zinc-100 p-1 rounded-2xl">
                        <button
                            onClick={() => setActiveTab('riders')}
                            className={`px-6 py-2.5 rounded-xl text-[11px] font-bold transition-all ${activeTab === 'riders' ? 'bg-white text-emerald-800 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                        >
                            All Riders
                        </button>
                        <button
                            onClick={() => setActiveTab('available_orders')}
                            className={`px-6 py-2.5 rounded-xl text-[11px] font-bold transition-all ${activeTab === 'available_orders' ? 'bg-white text-emerald-800 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                        >
                            Order Pool
                        </button>
                    </div>

                    <div className="relative max-w-md w-full ml-4">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                            placeholder="Search name, phone, email"
                            className="w-full pl-12 pr-6 py-4 bg-zinc-100 border-none rounded-3xl text-sm focus:ring-2 focus:ring-emerald-500/10 placeholder:text-zinc-500 outline-none transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-[1.5rem] border border-zinc-200 overflow-hidden shadow-sm">
                <div className="p-4 flex items-center justify-between border-b border-zinc-100">
                    <div>
                        <h3 className="text-base font-medium text-zinc-900">Riders</h3>
                        <p className="text-[10px] text-zinc-500 font-medium">All rider operations in one place.</p>
                    </div>
                     <div className="flex items-center gap-2">
                        <select 
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="appearance-none px-3 py-2 bg-zinc-50 rounded-xl text-[9px] font-bold text-zinc-500 hover:bg-zinc-100 transition-colors uppercase tracking-tight outline-none border-none cursor-pointer"
                        >
                            <option value="date_newest">Newest First</option>
                            <option value="date_oldest">Oldest First</option>
                            <option value="name_asc">Name (A-Z)</option>
                            <option value="name_desc">Name (Z-A)</option>
                        </select>
                        <select 
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="appearance-none px-3 py-2 bg-zinc-50 rounded-xl text-[9px] font-bold text-zinc-500 hover:bg-zinc-100 transition-colors uppercase tracking-tight outline-none border-none cursor-pointer"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="suspended">Suspended</option>
                            <option value="pending">Pending</option>
                            <option value="on_delivery">On Delivery</option>
                        </select>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-800 rounded-3xl text-[10px] font-bold text-white hover:bg-emerald-900 transition-all shadow-md shadow-emerald-900/10"
                        >
                            Create Rider
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {activeTab === 'riders' ? (
                        <table className="w-full">
                            <thead>
                                <tr className="bg-zinc-50/50 border-b border-zinc-100">
                                    <th className="px-3 py-3.5 text-left text-[12px] font-bold text-zinc-400 uppercase tracking-wider">Rider Name</th>
                                    <th className="px-3 py-3.5 text-left text-[12px] font-bold text-zinc-400 uppercase tracking-wider">Vehicle</th>
                                    <th className="px-3 py-3.5 text-left text-[12px] font-bold text-zinc-400 uppercase tracking-wider">Plate</th>
                                    <th className="px-3 py-3.5 text-left text-[12px] font-bold text-zinc-400 uppercase tracking-wider">Phone</th>
                                    <th className="px-3 py-3.5 text-left text-[12px] font-bold text-zinc-400 uppercase tracking-wider">Deliveries</th>
                                    <th className="px-3 py-3.5 text-left text-[12px] font-bold text-zinc-400 uppercase tracking-wider">Email</th>
                                    <th className="px-3 py-3.5 text-left text-[12px] font-bold text-zinc-400 uppercase tracking-wider">Status</th>
                                    <th className="px-3 py-3.5 text-center text-[12px] font-bold text-zinc-400 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {isLoadingRiders ? (
                                    <tr>
                                        <td colSpan="8" className="py-20 text-center">
                                            <Loader2 size={32} className="text-emerald-600 animate-spin mx-auto mb-2" />
                                            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Fetching Riders...</p>
                                        </td>
                                    </tr>
                                ) : riders.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="py-20 text-center text-zinc-500 text-sm font-medium">No riders found.</td>
                                    </tr>
                                ) : (
                                    riders.map((rider) => (
                                        <tr key={rider.id} className="hover:bg-zinc-50/50 transition-colors group">
                                            <td className="px-3 py-3.5">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-[10px] font-bold text-zinc-500 overflow-hidden shrink-0 border border-zinc-200">
                                                        {rider.name?.split(' ').map(n => n[0]).join('') || 'R'}
                                                    </div>
                                                    <span className="text-[12px] font-bold text-zinc-900">{rider.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-3 py-3.5 text-[12px] font-medium text-zinc-600 truncate max-w-[100px]">{rider.vehicleName}</td>
                                            <td className="px-3 py-3.5 text-[12px] font-bold text-zinc-500 whitespace-nowrap">{rider.vehiclePlate}</td>
                                            <td className="px-3 py-3.5 text-[12px] font-medium text-zinc-500 whitespace-nowrap">{rider.phone}</td>
                                            <td className="px-3 py-3.5 text-[12px] font-extrabold text-zinc-900 text-center">{rider.totalDeliveries || 0}</td>
                                            <td className="px-3 py-3.5 text-[12px] font-medium text-zinc-400 truncate max-w-[120px] lowercase">{rider.email}</td>
                                            <td className="px-3 py-3.5">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap uppercase tracking-tighter ${
                                                    rider.isActive 
                                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                                        : 'bg-zinc-100 text-zinc-500 border-zinc-200'
                                                }`}>
                                                    {rider.isActive ? 'Online' : 'Offline'}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3.5">
                                                <div className="flex justify-center">
                                                    <button
                                                        onClick={() => openDetailModal(rider)}
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
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="bg-zinc-50/50 border-b border-zinc-100">
                                    <th className="px-3 py-3.5 text-left text-[11px] font-bold text-zinc-400 uppercase">Vendor</th>
                                    <th className="px-3 py-3.5 text-left text-[11px] font-bold text-zinc-400 uppercase">Type</th>
                                    <th className="px-3 py-3.5 text-left text-[11px] font-bold text-zinc-400 uppercase">Items</th>
                                    <th className="px-3 py-3.5 text-left text-[11px] font-bold text-zinc-400 uppercase">Customer</th>
                                    <th className="px-3 py-3.5 text-left text-[11px] font-bold text-zinc-400 uppercase">Amount</th>
                                    <th className="px-3 py-3.5 text-left text-[11px] font-bold text-zinc-400 uppercase">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {isLoadingOrders ? (
                                    <tr>
                                        <td colSpan="6" className="py-20 text-center">
                                            <Loader2 size={32} className="text-emerald-600 animate-spin mx-auto mb-2" />
                                            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Scanning Orders...</p>
                                        </td>
                                    </tr>
                                ) : availableOrdersData?.data?.data?.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-20 text-center text-zinc-500 text-sm font-medium">No available orders at the moment.</td>
                                    </tr>
                                ) : (
                                    availableOrdersData?.data?.data?.map((order) => (
                                        <tr key={order.orderId} className="hover:bg-zinc-50/50 transition-colors">
                                            <td className="px-3 py-4">
                                                <span className="text-[12px] font-bold text-zinc-900">{order.vendorStoreName}</span>
                                                <p className="text-[9px] text-zinc-400 truncate max-w-[120px]">{order.storeAddress}</p>
                                            </td>
                                            <td className="px-3 py-4">
                                                <span className="px-2 py-0.5 bg-zinc-100 rounded-md text-[9px] font-bold text-zinc-600 uppercase tracking-tighter border border-zinc-200">
                                                    {order.shopType}
                                                </span>
                                            </td>
                                            <td className="px-3 py-4 text-[11px] font-medium text-zinc-600">{order.itemsString}</td>
                                            <td className="px-3 py-4">
                                                <span className="text-[12px] font-bold text-zinc-900">{order.customerName}</span>
                                                <p className="text-[9px] text-zinc-400">{order.customerPhone}</p>
                                            </td>
                                            <td className="px-3 py-4 text-[12px] font-extrabold text-emerald-700 whitespace-nowrap">₦{order.totalAmount?.toLocaleString()}</td>
                                            <td className="px-3 py-4 text-[11px] font-medium text-zinc-400 whitespace-nowrap">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination */}
                {activeTab === 'riders' ? (
                    totalPages > 1 && (
                        <div className="p-4 border-t border-zinc-100 flex items-center justify-between">
                            <p className="text-[10px] text-zinc-500 font-medium">Page {page} of {totalPages}</p>
                            <div className="flex items-center gap-2">
                                <button
                                    disabled={page === 1}
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    className="p-2 bg-zinc-50 rounded-lg text-zinc-400 hover:text-zinc-600 disabled:opacity-50 transition-colors"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button
                                    disabled={page === totalPages}
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    className="p-2 bg-zinc-50 rounded-lg text-zinc-400 hover:text-zinc-600 disabled:opacity-50 transition-colors"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )
                ) : (
                    availableOrdersData?.data?.meta?.totalPages > 1 && (
                        <div className="p-4 border-t border-zinc-100 flex items-center justify-between">
                            <p className="text-[10px] text-zinc-500 font-medium">Page {ordersPage} of {availableOrdersData.data.meta.totalPages}</p>
                            <div className="flex items-center gap-2">
                                <button
                                    disabled={ordersPage === 1}
                                    onClick={() => setOrdersPage(p => Math.max(1, p - 1))}
                                    className="p-2 bg-zinc-50 rounded-lg text-zinc-400 hover:text-zinc-600 disabled:opacity-50 transition-colors"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button
                                    disabled={ordersPage === availableOrdersData.data.meta.totalPages}
                                    onClick={() => setOrdersPage(p => Math.min(availableOrdersData.data.meta.totalPages, p + 1))}
                                    className="p-2 bg-zinc-50 rounded-lg text-zinc-400 hover:text-zinc-600 disabled:opacity-50 transition-colors"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )
                )}
            </div>

            <RiderModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                rider={selectedRider}
            />

            <CreateRiderModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
        </div>
    );
};

export default Riders;
