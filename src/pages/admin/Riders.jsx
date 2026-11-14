import React, { useMemo, useState } from 'react';
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
} from 'lucide-react';
import RiderModal from '../../components/admin/RiderModal';
import CreateRiderModal from '../../components/admin/CreateRiderModal';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/api';
import { useAuthStore } from '../../store/useAuthStore';
import { formatName, capitalizeFirst, formatPlate, getInitials, formatShortDateTime } from '../../utils/formatters';

const pageErrorMessage = (error) => error?.message || 'Unable to load Rider data. Please try again.';
const displayField = (value) => typeof value === 'string' && value.trim() ? value : 'Not provided';
const riderStatusLabel = (rider) => {
    if (rider.status === 'ON_DELIVERY') return 'Out for Delivery';
    if (rider.status === 'RIDER_ACCEPTED') return 'Accepted';
    if (rider.status === 'SUSPENDED') return 'Suspended';
    if (rider.status === 'PENDING') return 'Pending';
    if (rider.status === 'INACTIVE') return 'Inactive';
    if (rider.status === 'ACTIVE') return 'Active';
    return 'Not provided';
};
const riderStatusClass = (status) => ({
    SUSPENDED: 'bg-rose-50 text-rose-600 border-rose-100',
    PENDING: 'bg-zinc-100 text-zinc-600 border-zinc-200',
    INACTIVE: 'bg-amber-50 text-amber-700 border-amber-100',
    ON_DELIVERY: 'bg-blue-50 text-blue-700 border-blue-100',
    ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-100',
}[status] || 'bg-zinc-50 text-zinc-500 border-zinc-100');
const moneyFromKobo = (kobo) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 2 }).format(Number(kobo || 0) / 100);
const summaryCount = (value) => Number.isFinite(value) ? value.toLocaleString() : '—';

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

const FilterDropdown = ({ selected, onSelect, options, labels, openUp = false }) => {
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
        <div className={`relative flex-1 sm:flex-none ${isOpen ? 'z-30' : ''}`} ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-zinc-50 border border-transparent rounded-xl text-[9px] font-bold text-zinc-500 hover:bg-zinc-100 transition-all uppercase tracking-tight"
            >
                {labels[selected] || selected}
                <ChevronDown size={12} className={`text-zinc-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className={`absolute right-0 w-40 bg-white border border-zinc-100 rounded-2xl shadow-xl z-50 py-2 animate-in fade-in zoom-in-95 duration-200 ${openUp ? 'bottom-full mb-2' : 'top-full mt-2'}`}>
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
    const [selectedRider, setSelectedRider] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('riders'); // 'riders' or 'available_orders'
    const [page, setPage] = useState(1);
    const [ordersPage, setOrdersPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [orderSearch, setOrderSearch] = useState('');
    const [debouncedOrderSearch, setDebouncedOrderSearch] = useState('');
    const [shopTypeId, setShopTypeId] = useState('');
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('date_newest');

    React.useEffect(() => {
        const timeout = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 300);
        return () => clearTimeout(timeout);
    }, [searchQuery]);

    React.useEffect(() => {
        const timeout = setTimeout(() => setDebouncedOrderSearch(orderSearch.trim()), 300);
        return () => clearTimeout(timeout);
    }, [orderSearch]);

    const riderListQuery = useQuery({
        queryKey: ['riders', page, filter, sortBy],
        queryFn: () => api.get(`/superadmin/riders?${new URLSearchParams({ filter, sortBy, page: String(page) })}`, token),
        enabled: activeTab === 'riders',
        placeholderData: (previousData) => previousData,
    });

    const riderSearchQuery = useQuery({
        queryKey: ['riders-search', page, debouncedSearch],
        queryFn: () => api.get(`/superadmin/riders/search?${new URLSearchParams({ query: debouncedSearch, page: String(page) })}`, token),
        enabled: activeTab === 'riders' && Boolean(debouncedSearch),
        placeholderData: (previousData) => previousData,
    });

    // Fetch Available Orders (Monitoring View)
    const orderPoolQuery = useQuery({
        queryKey: ['rider-order-pool', ordersPage, debouncedOrderSearch, shopTypeId],
        queryFn: () => {
            const params = new URLSearchParams({ page: String(ordersPage) });
            if (debouncedOrderSearch) params.set('query', debouncedOrderSearch);
            if (shopTypeId) params.set('shopTypeId', shopTypeId);
            return api.get(`/superadmin/riders/order-pool?${params}`, token);
        },
        enabled: activeTab === 'available_orders',
        placeholderData: (previousData) => previousData,
    });
    const shopTypesQuery = useQuery({
        queryKey: ['rider-order-pool-shop-types'],
        queryFn: () => api.get('/shop-types/get-all', token),
        enabled: activeTab === 'available_orders',
    });

    const ridersData = debouncedSearch ? riderSearchQuery.data : riderListQuery.data;
    const ridersError = debouncedSearch ? riderSearchQuery.error : riderListQuery.error;
    const isLoadingRiders = debouncedSearch ? riderSearchQuery.isLoading : riderListQuery.isLoading;
    const riders = useMemo(() => (debouncedSearch ? ridersData?.data?.data : ridersData?.data?.riders?.data) || [], [debouncedSearch, ridersData]);
    const ridersShapeValid = debouncedSearch
        ? Array.isArray(ridersData?.data?.data) && Number.isFinite(ridersData?.data?.total) && Number.isFinite(ridersData?.data?.pageSize)
        : Array.isArray(ridersData?.data?.riders?.data)
            && Number.isFinite(ridersData?.data?.riders?.total)
            && Number.isFinite(ridersData?.data?.riders?.pageSize)
            && riderListQuery.data?.data?.summary
            && typeof riderListQuery.data.data.summary === 'object';
    const ridersRefetch = debouncedSearch ? riderSearchQuery.refetch : riderListQuery.refetch;
    const summary = riderListQuery.data?.data?.summary && typeof riderListQuery.data.data.summary === 'object' ? riderListQuery.data.data.summary : null;
    const totalItems = debouncedSearch ? ridersData?.data?.total : ridersData?.data?.riders?.total;
    const totalPages = Math.max(1, Math.ceil((totalItems || 0) / 20));
    const availableOrdersData = orderPoolQuery.data;
    const availableOrders = availableOrdersData?.data?.data;
    const orderPoolShapeValid = Array.isArray(availableOrders)
        && Number.isFinite(availableOrdersData?.data?.total)
        && Number.isFinite(availableOrdersData?.data?.pageSize)
        && availableOrders.every((order) => typeof order?.orderId === 'string' && Number.isFinite(order.totalAmountKobo));
    const orderPoolTotal = availableOrdersData?.data?.total;
    const orderPoolPages = Math.max(1, Math.ceil((orderPoolTotal || 0) / 20));
    const shopTypes = Array.isArray(shopTypesQuery.data?.data) ? shopTypesQuery.data.data : [];
    const shopTypesShapeInvalid = Boolean(shopTypesQuery.data && !Array.isArray(shopTypesQuery.data.data));

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
    }, [riders, selectedRider]);

    return (
        <div className="space-y-6 max-w-[440px] md:max-w-[1600px] mx-auto pb-10">
            <div className='bg-white py-5 rounded-2xl'>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 md:gap-4 p-4 rounded-xl">
                    <StatCard
                        label="Total Riders"
                        value={summaryCount(summary?.total)}
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
                        value={summaryCount(summary?.active)}
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
                        value={summaryCount(summary?.suspended)}
                        subLabel="Violations/Blocked"
                        icon={UserX}
                        color="text-white"
                        bg="bg-rose-900"
                        cardBg="bg-rose-100/20"
                        borderColor="border-rose-500"
                        dotColor="#f43f5e"
                    />
                    <StatCard
                        label="Out for Delivery"
                        value={summaryCount(summary?.onDelivery)}
                        subLabel="Currently in transit"
                        icon={Navigation}
                        color="text-white"
                        bg="bg-amber-900"
                        cardBg="bg-amber-100/20"
                        borderColor="border-amber-500"
                        dotColor="#f59e0b"
                    />
                </div>
                {riderListQuery.isError && (
                    <div role="alert" className="mx-4 mt-2 flex items-center justify-between gap-3 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-xs text-rose-700">
                        <span>Rider summary could not load: {pageErrorMessage(riderListQuery.error)}</span>
                        <button type="button" onClick={() => riderListQuery.refetch()} className="shrink-0 font-bold underline">Retry</button>
                    </div>
                )}

                {/* Tabs & Search */}
                <div className="px-4 mt-4 grid grid-cols-1 gap-3 lg:grid-cols-[auto_minmax(240px,1fr)_auto] lg:items-center">
                    <div className="flex gap-1 bg-zinc-100 p-1 rounded-2xl w-full sm:w-auto">
                        <button
                            onClick={() => { setActiveTab('riders'); setPage(1); }}
                            className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-[11px] font-bold transition-all ${activeTab === 'riders' ? 'bg-white text-emerald-800 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                        >
                            All Riders
                        </button>
                        <button
                            onClick={() => { setActiveTab('available_orders'); setOrdersPage(1); }}
                            className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-[11px] font-bold transition-all ${activeTab === 'available_orders' ? 'bg-white text-emerald-800 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                        >
                            Order Pool
                        </button>
                    </div>

                    <div className="relative w-full min-w-0">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                        <input
                            type="text"
                            maxLength={activeTab === 'riders' ? 50 : 100}
                            value={activeTab === 'riders' ? searchQuery : orderSearch}
                            onChange={(e) => {
                                if (activeTab === 'riders') { setSearchQuery(e.target.value); setPage(1); }
                                else { setOrderSearch(e.target.value); setOrdersPage(1); }
                            }}
                            placeholder={activeTab === 'riders' ? 'Search name, email, phone, or plate' : 'Search order, customer, or store'}
                            className="w-full rounded-2xl border border-transparent bg-zinc-100 py-3 pl-11 pr-4 text-sm outline-none transition-colors placeholder:text-zinc-500 focus:border-emerald-700/20 focus:bg-white focus:ring-2 focus:ring-emerald-700/10"
                        />
                    </div>
                    {((activeTab === 'riders' && searchQuery) || (activeTab === 'available_orders' && orderSearch)) && (
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={() => {
                                    if (activeTab === 'riders') { setSearchQuery(''); setPage(1); }
                                    else { setOrderSearch(''); setOrdersPage(1); }
                                }}
                                className="flex min-h-11 items-center gap-1.5 rounded-2xl px-3 text-[11px] font-semibold text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800"
                            >
                                <X size={14} /> Clear
                            </button>
                        </div>
                    )}
                </div>
                {activeTab === 'available_orders' && (shopTypesQuery.isError || shopTypesShapeInvalid) && (
                    <div role="alert" className="mx-4 mb-3 flex items-center justify-between gap-3 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs text-amber-800">
                        <span>Shop-type filter options could not load: {pageErrorMessage(shopTypesQuery.error || new Error('Unexpected shop-type response.'))}</span>
                        <button type="button" onClick={() => shopTypesQuery.refetch()} className="shrink-0 font-bold underline">Retry</button>
                    </div>
                )}
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-[1.5rem] border border-zinc-200 overflow-hidden shadow-sm">
                <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-zinc-100 gap-4">
                    <div>
                        <h3 className="text-sm md:text-base font-medium text-zinc-900">{activeTab === 'riders' ? 'Riders' : 'Available order pool'}</h3>
                        <p className="text-[10px] text-zinc-500 font-medium">{activeTab === 'riders' ? 'All rider operations in one place.' : 'Paid, ready orders waiting for a Rider. This view is read-only.'}</p>
                    </div>
                     <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                        {activeTab === 'riders' && <>
                        <FilterDropdown 
                            selected={sortBy}
                            onSelect={(value) => { setSortBy(value); setPage(1); }}
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
                            onSelect={(value) => { setFilter(value); setPage(1); }}
                            options={['all', 'active', 'inactive', 'suspended', 'pending', 'on_delivery']}
                            labels={{
                                'all': 'All Status',
                                'active': 'Active',
                                'inactive': 'Inactive',
                                'suspended': 'Suspended',
                                'pending': 'Pending',
                                'on_delivery': 'Out for Delivery'
                            }}
                        />
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 md:py-2 bg-emerald-800 rounded-3xl text-[10px] font-bold text-white hover:bg-emerald-900 transition-all shadow-md shadow-emerald-900/10 whitespace-nowrap"
                        >
                            Create Rider
                        </button>
                        </>}
                        {activeTab === 'available_orders' && (
                            <FilterDropdown
                                selected={shopTypeId || 'all'}
                                onSelect={(value) => { setShopTypeId(value === 'all' ? '' : value); setOrdersPage(1); }}
                                options={['all', ...shopTypes.map((shopType) => shopType.id)]}
                                labels={{ all: 'All shop types', ...Object.fromEntries(shopTypes.map((shopType) => [shopType.id, shopType.name])) }}
                                openUp
                            />
                        )}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {activeTab === 'riders' ? (
                        <table className="w-full">
                            <thead>
                                <tr className="bg-zinc-50/50 border-b border-zinc-100">
                                    <th className="whitespace-nowrap px-3 py-3 text-left text-[10px] font-semibold tracking-wide text-zinc-400 uppercase">Rider Name</th>
                                    <th className="whitespace-nowrap px-3 py-3 text-left text-[10px] font-semibold tracking-wide text-zinc-400 uppercase">Vehicle</th>
                                    <th className="whitespace-nowrap px-3 py-3 text-left text-[10px] font-semibold tracking-wide text-zinc-400 uppercase">Plate</th>
                                    <th className="whitespace-nowrap px-3 py-3 text-left text-[10px] font-semibold tracking-wide text-zinc-400 uppercase">Phone</th>
                                    <th className="whitespace-nowrap px-3 py-3 text-left text-[10px] font-semibold tracking-wide text-zinc-400 uppercase">Deliveries</th>
                                    <th className="whitespace-nowrap px-3 py-3 text-left text-[10px] font-semibold tracking-wide text-zinc-400 uppercase">Email</th>
                                    <th className="whitespace-nowrap px-3 py-3 text-left text-[10px] font-semibold tracking-wide text-zinc-400 uppercase">Status</th>
                                    <th className="whitespace-nowrap px-3 py-3 text-center text-[10px] font-semibold tracking-wide text-zinc-400 uppercase">Action</th>
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
                                ) : ridersError || !ridersShapeValid ? (
                                    <tr>
                                        <td colSpan="8" className="py-16 text-center">
                                            <p role="alert" className="mb-3 text-sm text-rose-600">{pageErrorMessage(ridersError || new Error('Unexpected Rider response shape.'))}</p>
                                            <button type="button" onClick={() => ridersRefetch()} className="rounded-lg bg-emerald-800 px-4 py-2 text-xs font-semibold text-white">Retry</button>
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
                                                    <span className="text-[12px] font-semibold text-zinc-900">{rider.name ? formatName(rider.name) : 'Not provided'}</span>
                                                </div>
                                            </td>
                                            <td className="max-w-[120px] truncate px-3 py-3 text-[11px] font-medium text-zinc-600">{displayField(rider.vehicleName) === 'Not provided' ? 'Not provided' : capitalizeFirst(rider.vehicleName)}</td>
                                            <td className="whitespace-nowrap px-3 py-3 text-[11px] font-medium text-zinc-500">{displayField(rider.vehiclePlate) === 'Not provided' ? 'Not provided' : formatPlate(rider.vehiclePlate)}</td>
                                            <td className="whitespace-nowrap px-3 py-3 text-[11px] font-medium text-zinc-500">{displayField(rider.phone)}</td>
                                            <td className="px-3 py-3 text-center text-[11px] font-semibold text-zinc-800">{Number.isFinite(rider.deliveriesDone) ? rider.deliveriesDone : '—'}</td>
                                            <td className="max-w-[150px] truncate px-3 py-3 text-[11px] font-medium lowercase text-zinc-500">{displayField(rider.email)}</td>
                                            <td className="px-3 py-3.5">
                                                <span className={`rounded-full border px-2 py-1 text-[9px] font-semibold whitespace-nowrap ${riderStatusClass(rider.status)}`}>
                                                    {riderStatusLabel(rider)}
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
                        <table className="w-full min-w-[900px]">
                            <thead>
                                <tr className="bg-zinc-50/50 border-b border-zinc-100">
                                    <th className="px-3 py-3 text-left text-[10px] font-semibold tracking-wide text-zinc-400 uppercase">Order</th>
                                    <th className="px-3 py-3 text-left text-[10px] font-semibold tracking-wide text-zinc-400 uppercase">Store</th>
                                    <th className="px-3 py-3 text-left text-[10px] font-semibold tracking-wide text-zinc-400 uppercase">Customer</th>
                                    <th className="px-3 py-3 text-left text-[10px] font-semibold tracking-wide text-zinc-400 uppercase">Pickup & drop-off</th>
                                    <th className="px-3 py-3 text-left text-[10px] font-semibold tracking-wide text-zinc-400 uppercase">Total</th>
                                    <th className="px-3 py-3 text-left text-[10px] font-semibold tracking-wide text-zinc-400 uppercase">Ready at</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {orderPoolQuery.isLoading ? (
                                    <tr>
                                        <td colSpan="6" className="py-20 text-center">
                                            <Loader2 size={32} className="text-emerald-600 animate-spin mx-auto mb-2" />
                                            <p className="text-xs font-medium text-zinc-500">Loading order pool…</p>
                                        </td>
                                    </tr>
                                ) : orderPoolQuery.isError || !orderPoolShapeValid ? (
                                    <tr><td colSpan="6" className="py-16 text-center"><p role="alert" className="mb-3 text-sm text-rose-600">{pageErrorMessage(orderPoolQuery.error || new Error('Unexpected order-pool response shape.'))}</p><button type="button" onClick={() => orderPoolQuery.refetch()} className="rounded-lg bg-emerald-800 px-4 py-2 text-xs font-semibold text-white">Retry</button></td></tr>
                                ) : availableOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-20 text-center text-zinc-500 text-sm font-medium">No available orders at the moment.</td>
                                    </tr>
                                ) : (
                                    availableOrders.map((order) => (
                                        <tr key={order.orderId} className="hover:bg-zinc-50/50 transition-colors">
                                            <td className="whitespace-nowrap px-3 py-3"><span className="text-[11px] font-semibold text-zinc-800">{order.code || 'N/A'}</span><p className="mt-0.5 text-[10px] text-zinc-400">{order.shopType?.name || 'Not provided'}</p></td>
                                            <td className="px-3 py-3"><span className="text-[11px] font-medium text-zinc-800">{displayField(order.vendorStoreName)}</span></td>
                                            <td className="px-3 py-3"><span className="text-[11px] font-medium text-zinc-800">{displayField(order.customerName)}</span><p className="mt-0.5 text-[10px] text-zinc-500">{displayField(order.customerPhone)}</p></td>
                                            <td className="px-3 py-3"><p className="max-w-[240px] truncate text-[10px] text-zinc-600">From: {displayField(order.pickupAddress)}</p><p className="mt-1 max-w-[240px] truncate text-[10px] text-zinc-600">To: {displayField(order.deliveryAddress)}</p></td>
                                            <td className="whitespace-nowrap px-3 py-3 text-[11px] font-semibold text-emerald-800">{moneyFromKobo(order.totalAmountKobo)}</td>
                                            <td className="whitespace-nowrap px-3 py-3 text-[10px] text-zinc-500">{order.readyAt ? formatShortDateTime(order.readyAt) : 'Not provided'}</td>
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
                    orderPoolPages > 1 && (
                        <div className="p-4 border-t border-zinc-100 flex items-center justify-between">
                            <p className="text-[10px] text-zinc-500 font-medium">Page {ordersPage} of {orderPoolPages} · {orderPoolTotal} orders</p>
                            <div className="flex items-center gap-2">
                                <button
                                    disabled={ordersPage === 1}
                                    onClick={() => setOrdersPage(p => Math.max(1, p - 1))}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-zinc-50 rounded-lg text-[11px] font-bold text-zinc-500 hover:bg-zinc-100 disabled:opacity-50 transition-colors"
                                >
                                    <ChevronLeft size={14} /> Previous
                                </button>

                                <div className="hidden sm:flex items-center gap-1 mx-2">
                                    {Array.from({ length: orderPoolPages }, (_, i) => i + 1).reduce((acc, p) => {
                                        if (p === 1 || p === orderPoolPages || Math.abs(p - ordersPage) <= 1) {
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
                                    disabled={ordersPage === orderPoolPages}
                                    onClick={() => setOrdersPage(p => Math.min(orderPoolPages, p + 1))}
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
