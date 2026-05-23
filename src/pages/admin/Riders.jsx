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
    ChevronRight,
    ChevronLeft,
    X,
    Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import RiderModal from '../../components/admin/RiderModal';
import CreateRiderModal from '../../components/admin/CreateRiderModal';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/api';
import { useAuthStore } from '../../store/useAuthStore';
import { formatName, capitalizeFirst, formatPlate, getInitials, exportToCSV, formatDate } from '../../utils/formatters';

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
                    <p className="text-[9px] font-medium text-zinc-400 mt-2">{subLabel}</p>
                </div>
            </div>
            <div className={`p-2 rounded-xl ${bg} ${color} shadow-sm border border-white/40 group-hover:rotate-6 transition-all duration-300`}>
                <Icon size={18} />
            </div>
        </div>
    </div>
);

const FilterDropdown = ({ selected, onSelect, options, labels }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const dropdownRef = React.useRef(null);

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative flex-1 sm:flex-none" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-zinc-50 border border-transparent rounded-xl text-[9px] font-bold text-zinc-500 hover:bg-zinc-100 transition-all uppercase tracking-tight"
            >
                {labels[selected] || selected}
                <ChevronDown size={12} className={`text-zinc-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
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
                            className={`w-full text-left px-4 py-2 text-[9px] font-bold uppercase transition-colors ${selected === opt ? 'bg-zinc-50 text-emerald-600' : 'text-zinc-600 hover:bg-zinc-50'
                                }`}
                        >
                            {labels[opt] || opt}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

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
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('date_newest');

    // Fetch Riders List
    const { data: ridersData, isLoading: isLoadingRiders, error: ridersError, refetch: refetchRiders } = useQuery({
        queryKey: ['riders', page, searchQuery, filter, sortBy],
        queryFn: async () => {
            if (searchQuery) {
                return await api.get(`/superadmin/riders/search?query=${searchQuery}&page=${page}&limit=20`, token);
            }
            return await api.get(`/superadmin/riders?page=${page}&limit=20&filter=${filter}&sortBy=${sortBy}`, token);
        },
        placeholderData: (previousData) => previousData
    });



    // Fetch Available Orders (Monitoring View)
    const { data: availableOrdersData, isLoading: isLoadingOrders } = useQuery({
        queryKey: ['available-orders', ordersPage],
        queryFn: () => api.get(`/rider/orders/available?page=${ordersPage}&limit=20`, token), // Assuming admin can view or it's bridged
        enabled: activeTab === 'available_orders'
    });

    const allRiders = ridersData?.data?.riders?.data || ridersData?.data?.data || (Array.isArray(ridersData?.data) ? ridersData.data : []);
    
    // Apply client-side date filtering
    const riders = allRiders.filter(r => {
        let matchesDate = true;
        const riderDate = r.createdAt || r.joinedAt;
        if (riderDate) {
            const txDate = new Date(riderDate);
            if (startDate) {
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                if (txDate < start) matchesDate = false;
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                if (txDate > end) matchesDate = false;
            }
        } else if (startDate || endDate) {
            matchesDate = false;
        }
        return matchesDate;
    });

    const lastSummaryRef = React.useRef({
        total: 0,
        active: 0,
        inactive: 0,
        suspended: 0,
        onDelivery: 0
    });

    if (ridersData?.data?.summary) {
        lastSummaryRef.current = ridersData.data.summary;
    }

    const summary = ridersData?.data?.summary || lastSummaryRef.current;
    const totalItems = ridersData?.data?.riders?.total || ridersData?.data?.total || (Array.isArray(ridersData?.data) ? ridersData.data.length : 0);
    const totalPages = ridersData?.data?.riders?.totalPages || ridersData?.data?.totalPages || Math.ceil(totalItems / 20) || 1;

    const openDetailModal = (rider) => {
        setSelectedRider(rider);
        setIsDetailModalOpen(true);
    };

    // Sync selected rider with fresh data when riders list updates
    React.useEffect(() => {
        if (selectedRider && riders.length > 0) {
            const rId = selectedRider.id || selectedRider._id || selectedRider.riderId || selectedRider.uid;
            const freshRider = riders.find(r => (r.id === rId || r._id === rId || r.riderId === rId));
            if (freshRider) setSelectedRider(freshRider);
        }
    }, [riders]);

    return (
        <div className="space-y-6 max-w-[440px] md:max-w-[1600px] mx-auto pb-10">
            <div className='bg-white py-5 rounded-2xl'>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 md:gap-4 p-4 rounded-xl">
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
                <div className="px-4 flex flex-col sm:flex-row items-center justify-between mt-4 gap-4">
                    <div className="flex gap-1 bg-zinc-100 p-1 rounded-2xl w-full sm:w-auto">
                        <button
                            onClick={() => setActiveTab('riders')}
                            className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-[11px] font-bold transition-all ${activeTab === 'riders' ? 'bg-white text-emerald-800 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                        >
                            All Riders
                        </button>
                        <button
                            onClick={() => setActiveTab('available_orders')}
                            className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-[11px] font-bold transition-all ${activeTab === 'available_orders' ? 'bg-white text-emerald-800 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                        >
                            Order Pool
                        </button>
                    </div>

                    <div className="relative w-full sm:max-w-md sm:ml-4">
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

                {/* Date Filters Row */}
                {activeTab === 'riders' && (
                    <div className="px-4 mt-3 flex flex-wrap items-center justify-end gap-3">
                        {/* From Date */}
                        <div className="relative flex items-center bg-zinc-100 rounded-3xl px-4 py-3 focus-within:ring-2 focus-within:ring-emerald-500/10 transition-all">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase mr-2 select-none">From</span>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                                className="bg-transparent border-none text-xs font-bold text-zinc-700 focus:ring-0 p-0 outline-none cursor-pointer [color-scheme:light]"
                            />
                            <Calendar className="text-zinc-400 ml-2" size={14} />
                        </div>

                        {/* To Date */}
                        <div className="relative flex items-center bg-zinc-100 rounded-3xl px-4 py-3 focus-within:ring-2 focus-within:ring-emerald-500/10 transition-all">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase mr-2 select-none">To</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                                className="bg-transparent border-none text-xs font-bold text-zinc-700 focus:ring-0 p-0 outline-none cursor-pointer [color-scheme:light]"
                            />
                            <Calendar className="text-zinc-400 ml-2" size={14} />
                        </div>

                        {/* Reset Button */}
                        {(searchQuery || startDate || endDate) && (
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setStartDate('');
                                    setEndDate('');
                                    setPage(1);
                                }}
                                className="flex items-center gap-2 px-5 py-3 bg-zinc-900 text-white rounded-3xl text-[10px] font-bold hover:bg-zinc-800 transition-all hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest group shadow-sm cursor-pointer"
                            >
                                <X size={14} className="group-hover:rotate-90 transition-transform duration-300" />
                                Reset
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-[1.5rem] border border-zinc-200 overflow-hidden shadow-sm">
                <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-zinc-100 gap-4">
                    <div>
                        <h3 className="text-sm md:text-base font-medium text-zinc-900">Riders</h3>
                        <p className="text-[10px] text-zinc-500 font-medium">All rider operations in one place.</p>
                    </div>
                     <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                        <FilterDropdown 
                            selected={sortBy}
                            onSelect={setSortBy}
                            options={['date_newest', 'date_oldest', 'name_asc', 'name_desc']}
                            labels={{
                                'date_newest': 'Newest First',
                                'date_oldest': 'Oldest First',
                                'name_asc': 'Name (A-Z)',
                                'name_desc': 'Name (Z-A)'
                            }}
                        />
                        <FilterDropdown 
                            selected={filter}
                            onSelect={setFilter}
                            options={['all', 'active', 'inactive', 'suspended', 'pending', 'on_delivery']}
                            labels={{
                                'all': 'All Status',
                                'active': 'Active',
                                'inactive': 'Inactive',
                                'suspended': 'Suspended',
                                'pending': 'Pending',
                                'on_delivery': 'On Delivery'
                            }}
                        />
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 md:py-2 bg-emerald-800 rounded-3xl text-[10px] font-bold text-white hover:bg-emerald-900 transition-all shadow-md shadow-emerald-900/10 whitespace-nowrap"
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
                                                        {getInitials(rider.name)}
                                                    </div>
                                                    <span className="text-[12px] font-bold text-zinc-900">{formatName(rider.name)}</span>
                                                </div>
                                            </td>
                                            <td className="px-3 py-3.5 text-[12px] font-medium text-zinc-600 truncate max-w-[100px]">{capitalizeFirst(rider.vehicleName)}</td>
                                            <td className="px-3 py-3.5 text-[12px] font-bold text-zinc-500 whitespace-nowrap">{formatPlate(rider.vehiclePlate)}</td>
                                            <td className="px-3 py-3.5 text-[12px] font-medium text-zinc-500 whitespace-nowrap">{rider.phone}</td>
                                            <td className="px-3 py-3.5 text-[12px] font-extrabold text-zinc-900 text-center">{rider.deliveriesDone || 0}</td>
                                            <td className="px-3 py-3.5 text-[12px] font-medium text-zinc-400 truncate max-w-[120px] lowercase">{rider.email}</td>
                                            <td className="px-3 py-3.5">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap uppercase tracking-tighter ${
                                                    (rider.isSuspended ?? (rider.status?.toUpperCase() === 'SUSPENDED')) 
                                                        ? 'bg-rose-50 text-rose-600 border-rose-100' 
                                                        : (rider.status === 'PENDING' ? 'bg-zinc-100 text-zinc-500 border-zinc-200' : 'bg-emerald-50 text-emerald-600 border-emerald-100')
                                                }`}>
                                                    {(rider.isSuspended ?? (rider.status?.toUpperCase() === 'SUSPENDED')) ? 'Suspended' : (rider.status === 'PENDING' ? 'Pending' : 'Active')}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3.5">
                                                <div className="flex justify-center gap-2">
                                                    <button 
                                                        onClick={() => openDetailModal(rider)}
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
                        <div className="p-4 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-4">
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
                    )
                ) : (
                    availableOrdersData?.data?.meta?.totalPages > 1 && (
                        <div className="p-4 border-t border-zinc-100 flex items-center justify-between">
                            <p className="text-[10px] text-zinc-500 font-medium">Page {ordersPage} of {availableOrdersData.data.meta.totalPages}</p>
                            <div className="flex items-center gap-2">
                                <button
                                    disabled={ordersPage === 1}
                                    onClick={() => setOrdersPage(p => Math.max(1, p - 1))}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-zinc-50 rounded-lg text-[11px] font-bold text-zinc-500 hover:bg-zinc-100 disabled:opacity-50 transition-colors"
                                >
                                    <ChevronLeft size={14} /> Previous
                                </button>

                                <div className="hidden sm:flex items-center gap-1 mx-2">
                                    {Array.from({ length: availableOrdersData.data.meta.totalPages }, (_, i) => i + 1).reduce((acc, p) => {
                                        if (p === 1 || p === availableOrdersData.data.meta.totalPages || Math.abs(p - ordersPage) <= 1) {
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
                                                onClick={() => setOrdersPage(p)}
                                                className={`min-w-[28px] h-7 px-2 flex items-center justify-center rounded-lg text-[11px] font-bold transition-colors ${
                                                    ordersPage === p 
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
                                    disabled={ordersPage === availableOrdersData.data.meta.totalPages}
                                    onClick={() => setOrdersPage(p => Math.min(availableOrdersData.data.meta.totalPages, p + 1))}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-zinc-50 rounded-lg text-[11px] font-bold text-zinc-500 hover:bg-zinc-100 disabled:opacity-50 transition-colors"
                                >
                                    Next <ChevronRight size={14} />
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
