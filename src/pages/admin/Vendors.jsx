import React, { useState } from 'react';
import {
    Search,
    ChevronDown,
    MoreHorizontal,
    Eye,
    Store,
    Clock,
    CheckCircle,
    AlertTriangle,
    Plus,
    Loader2,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/api';
import { useAuthStore } from '../../store/useAuthStore';
import VendorModal from '../../components/admin/VendorModal';
import CreateVendorModal from '../../components/admin/CreateVendorModal';

const StatCard = ({ label, value, subLabel, icon: Icon, color, bg, borderColor, cardBg, dotColor }) => (
    <div className={`relative overflow-hidden p-4 pb-6 rounded-xl ${cardBg} border ${borderColor} shadow-sm transition-all hover:shadow-md group flex-1 min-w-[180px]`}>
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

const Vendors = () => {
    const token = useAuthStore((state) => state.accessToken);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    
    // UI State
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [selectedSort, setSelectedSort] = useState('date_newest');
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);

    // Labels
    const filterLabels = {
        'all': 'All',
        'active': 'Active',
        'pending': 'Pending',
        'suspended': 'Suspended'
    };

    const sortLabels = {
        'name_asc': 'A-Z',
        'name_desc': 'Z-A',
        'date_newest': 'Newest',
        'date_oldest': 'Oldest'
    };

    // Fetch Vendors
    const { data: vendorsData, isLoading, error, refetch } = useQuery({
        queryKey: ['vendors', selectedFilter, selectedSort, page, searchQuery],
        queryFn: async () => {
            if (searchQuery) {
                return await api.get(`/superadmin/vendors/search?query=${searchQuery}&page=${page}`, token);
            }
            return await api.get(`/superadmin/vendors?filter=${selectedFilter}&sortBy=${selectedSort}&page=${page}`, token);
        },
        keepPreviousData: true
    });

    const summary = vendorsData?.data?.summary || { totalVendors: 0, pendingVendors: 0, activeVendors: 0, suspendedVendors: 0 };
    const vendors = vendorsData?.data?.data || [];
    const totalPages = Math.ceil((vendorsData?.data?.total || 0) / (vendorsData?.data?.pageSize || 20)) || 1;

    const openDetailModal = (vendor) => {
        setSelectedVendor(vendor);
        setIsDetailModalOpen(true);
    };

    return (
        <div className="space-y-6 w-full mx-auto">
            <div className='bg-white py-5 rounded-2xl'>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl">
                    <StatCard
                        label="Total Vendors"
                        value={summary.totalVendors?.toLocaleString()}
                        subLabel="Approved + Suspended"
                        icon={Store}
                        color="text-white"
                        bg="bg-emerald-900"
                        cardBg="bg-emerald-100/20"
                        borderColor="border-emerald-500"
                        dotColor="#10b981"
                    />
                    <StatCard
                        label="Pending Vendors"
                        value={summary.pendingVendors?.toLocaleString()}
                        subLabel="Awaiting approval"
                        icon={Clock}
                        color="text-white"
                        bg="bg-blue-900"
                        cardBg="bg-blue-100/20"
                        borderColor="border-blue-500"
                        dotColor="#3b82f6"
                    />
                    <StatCard
                        label="Approved Vendors"
                        value={summary.activeVendors?.toLocaleString()}
                        subLabel="Active Vendors"
                        icon={CheckCircle}
                        color="text-white"
                        bg="bg-purple-900"
                        cardBg="bg-purple-100/20"
                        borderColor="border-purple-500"
                        dotColor="#a855f7"
                    />
                    <StatCard
                        label="Suspended"
                        value={summary.suspendedVendors?.toLocaleString()}
                        subLabel="Inactive Vendors"
                        icon={AlertTriangle}
                        color="text-white"
                        bg="bg-amber-900"
                        cardBg="bg-amber-100/20"
                        borderColor="border-amber-500"
                        dotColor="#f59e0b"
                    />
                </div>

                {/* Search & Filter Section */}
                <div className="relative max-w-md p-4">
                    <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                        placeholder="Search name, phone, email"
                        className="w-full pl-12 pr-6 py-4 bg-zinc-100 border-none rounded-3xl text-sm focus:ring-2 focus:ring-emerald-500/10 placeholder:text-zinc-500 outline-none transition-all"
                    />
                </div>

            </div>

            {/* Table Section */}
            <div className="bg-white rounded-[1.5rem] border border-zinc-200 overflow-hidden shadow-sm">
                <div className="p-4 flex items-center justify-between border-b border-zinc-100">
                    <div>
                        <h3 className="text-base font-medium text-zinc-900">Vendors</h3>
                        <p className="text-[10px] text-zinc-500 font-medium">All vendor operations in one place.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <button
                                onClick={() => setShowSortDropdown(!showSortDropdown)}
                                className="flex items-center gap-1.5 px-3 py-2 bg-zinc-50 rounded-xl text-[9px] font-bold text-zinc-500 hover:bg-zinc-100 transition-colors uppercase tracking-tight"
                            >
                                {sortLabels[selectedSort]} <ChevronDown size={14} className={`transition-transform duration-300 ${showSortDropdown ? 'rotate-180' : ''}`} />
                            </button>
                            {showSortDropdown && (
                                <div className="absolute right-0 mt-2 w-48 bg-white border border-zinc-100 rounded-2xl shadow-xl z-50 overflow-hidden py-1 animate-in fade-in zoom-in duration-200">
                                    {Object.entries(sortLabels).map(([value, label]) => (
                                        <button
                                            key={value}
                                            onClick={() => { setSelectedSort(value); setShowSortDropdown(false); setPage(1); }}
                                            className={`w-full text-left px-4 py-3 text-[11px] font-bold transition-colors ${selectedSort === value ? 'text-emerald-600 bg-emerald-50' : 'text-zinc-700 hover:bg-zinc-50'}`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="relative">
                            <button
                                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                                className="flex items-center gap-1.5 px-3 py-2 bg-zinc-50 rounded-xl text-[9px] font-bold text-zinc-500 hover:bg-zinc-100 transition-colors uppercase tracking-tight"
                            >
                                {filterLabels[selectedFilter]} <ChevronDown size={14} className={`transition-transform duration-300 ${showFilterDropdown ? 'rotate-180' : ''}`} />
                            </button>
                            {showFilterDropdown && (
                                <div className="absolute right-0 mt-2 w-48 bg-white border border-zinc-100 rounded-2xl shadow-xl z-50 overflow-hidden py-1 animate-in fade-in zoom-in duration-200">
                                    {Object.entries(filterLabels).map(([value, label]) => (
                                        <button
                                            key={value}
                                            onClick={() => { setSelectedFilter(value); setShowFilterDropdown(false); setPage(1); }}
                                            className={`w-full text-left px-4 py-3 text-[11px] font-bold transition-colors ${selectedFilter === value ? 'text-emerald-600 bg-emerald-50' : 'text-zinc-700 hover:bg-zinc-50'}`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-800 rounded-3xl text-[10px] font-bold text-white hover:bg-emerald-900 transition-all shadow-md shadow-emerald-900/10"
                        >
                            Create Vendor
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-zinc-50/50 border-b border-zinc-100">
                                <th className="px-3 py-3.5 text-left text-[12px] font-bold text-zinc-400 uppercase tracking-wider">Store</th>
                                <th className="px-3 py-3.5 text-left text-[12px] font-bold text-zinc-400 uppercase tracking-wider">Vendor</th>
                                <th className="px-3 py-3.5 text-left text-[12px] font-bold text-zinc-400 uppercase tracking-wider">Phone</th>
                                <th className="px-3 py-3.5 text-left text-[12px] font-bold text-zinc-400 uppercase tracking-wider">Email</th>
                                <th className="px-3 py-3.5 text-left text-[12px] font-bold text-zinc-400 uppercase tracking-wider">Address</th>
                                <th className="px-3 py-3.5 text-left text-[12px] font-bold text-zinc-400 uppercase tracking-wider">Joined</th>
                                <th className="px-3 py-3.5 text-left text-[12px] font-bold text-zinc-400 uppercase tracking-wider">Orders</th>
                                <th className="px-3 py-3.5 text-left text-[12px] font-bold text-zinc-400 uppercase tracking-wider">Status</th>
                                <th className="px-3 py-3.5 text-center text-[12px] font-bold text-zinc-400 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="9" className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 size={32} className="text-emerald-600 animate-spin" />
                                            <p className="text-sm font-medium text-zinc-500">Loading vendors...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan="9" className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <AlertCircle size={32} className="text-rose-500" />
                                            <p className="text-sm font-medium text-rose-500">{error.message || 'Failed to load vendors'}</p>
                                            <button onClick={() => refetch()} className="mt-2 px-4 py-2 bg-zinc-900 text-white text-xs font-bold rounded-lg hover:bg-zinc-800 transition-colors">Retry</button>
                                        </div>
                                    </td>
                                </tr>
                            ) : vendors.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="py-20 text-center text-zinc-500 font-medium text-sm">No vendors found.</td>
                                </tr>
                            ) : (
                                vendors.map((vendor) => (
                                    <tr key={vendor.id} className="hover:bg-zinc-50/50 transition-colors group">
                                        <td className="px-3 py-3.5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center text-[8px] font-bold text-zinc-500 overflow-hidden shrink-0">
                                                    {vendor.storeName?.[0] || 'V'}
                                                </div>
                                                <span className="text-[12px] font-bold text-zinc-900 max-w-[80px]">{vendor.storeName}</span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-3.5 text-[12px] font-medium text-zinc-500 truncate max-w-[80px]">{vendor.ownerName}</td>
                                        <td className="px-3 py-3.5 text-[12px] font-medium text-zinc-500 whitespace-nowrap">{vendor.phonenumber}</td>
                                        <td className="px-3 py-3.5 text-[12px] font-medium text-zinc-500 truncate max-w-[100px] lowercase">{vendor.email}</td>
                                        <td className="px-3 py-3.5 text-[12px] font-medium text-zinc-500 max-w-[120px] truncate">{vendor.address}</td>
                                        <td className="px-3 py-3.5 text-[12px] font-medium text-zinc-500 whitespace-nowrap">{new Date(vendor.createdAt).toLocaleDateString()}</td>
                                        <td className="px-3 py-3.5 text-[12px] font-bold text-zinc-900">{vendor.totalOrders}</td>
                                        <td className="px-3 py-3.5">
                                            <span className={`px-2 py-0.5 rounded-full text-[12px] font-bold border capitalize ${vendor.status === 'ACTIVE'
                                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                : vendor.status === 'SUSPENDED'
                                                    ? 'bg-rose-50 text-rose-600 border-rose-100'
                                                    : 'bg-amber-50 text-amber-600 border-amber-100'
                                                }`}>
                                                {vendor.status?.toLowerCase()}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3.5">
                                            <div className="flex justify-center">
                                                <button
                                                    onClick={() => openDetailModal(vendor)}
                                                    className="p-1.5 bg-indigo-50 text-indigo-500 rounded-lg hover:bg-indigo-500 hover:text-white transition-all"
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
                )}
            </div>

            <VendorModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                vendor={selectedVendor}
            />

            <CreateVendorModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
        </div>
    );
};

export default Vendors;
