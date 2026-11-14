import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
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
    X,
    Calendar
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/api';
import { useAuthStore } from '../../store/useAuthStore';
import { formatName, formatShortDate, getInitials } from '../../utils/formatters';
import VendorModal from '../../components/admin/VendorModal';
import CreateVendorModal from '../../components/admin/CreateVendorModal';
import { WalletCustomDateModal } from '../../components/admin/wallet/WalletControls';
import { getVendorAccountStatus } from '../../utils/vendorAccountStatus';


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

const Vendors = () => {
    const token = useAuthStore((state) => state.accessToken);
    const [searchParams] = useSearchParams();
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    
    // UI State
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [selectedSort, setSelectedSort] = useState('date_newest');
    const [selectedFilter, setSelectedFilter] = useState(() => ['all', 'active', 'pending', 'suspended'].includes(searchParams.get('filter')) ? searchParams.get('filter') : 'all');
    const [searchQuery, setSearchQuery] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [draftDates, setDraftDates] = useState({ start: '', end: '' });
    const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);
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
                return await api.get(`/superadmin/vendors/search?query=${searchQuery}&page=${page}&limit=20`, token);
            }
            return await api.get(`/superadmin/vendors?filter=${selectedFilter}&sortBy=${selectedSort}&page=${page}&limit=20`, token);
        },
        placeholderData: (previousData) => previousData
    });

    const { data: summaryResponse, isLoading: isSummaryLoading, isError: isSummaryError, error: summaryError, refetch: refetchSummary } = useQuery({
        queryKey: ['vendors-platform-summary'],
        queryFn: () => api.get('/superadmin/vendors?filter=all&sortBy=date_newest&page=1&limit=1', token),
    });
    const summary = summaryResponse?.data?.summary;
    const allVendors = vendorsData?.data?.data || [];
    
    // Apply client-side date filtering
    const vendors = allVendors.filter(vendor => {
        let matchesDate = true;
        if (vendor.createdAt) {
            const txDate = new Date(vendor.createdAt);
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

    const totalItems = vendorsData?.data?.total || (Array.isArray(vendorsData?.data) ? vendorsData.data.length : 0);
    const totalPages = vendorsData?.data?.totalPages || Math.ceil(totalItems / (vendorsData?.data?.pageSize || 20)) || 1;

    const openDetailModal = (vendor) => {
        setSelectedVendor(vendor);
        setIsDetailModalOpen(true);
    };

    return (
        <div className="space-y-6 w-full max-w-[1600px] mx-auto pb-10">
            <div className='bg-white py-5 rounded-2xl'>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 md:gap-4 p-4 rounded-xl">
                    <StatCard
                        label="Total Vendors"
                        value={isSummaryLoading ? '…' : (typeof summary?.totalVendors === 'number' ? summary.totalVendors.toLocaleString() : '—')}
                        subLabel="All vendor accounts"
                        icon={Store}
                        color="text-white"
                        bg="bg-emerald-900"
                        cardBg="bg-emerald-100/20"
                        borderColor="border-emerald-500"
                        dotColor="#10b981"
                    />
                    <StatCard
                        label="Pending Vendors"
                        value={isSummaryLoading ? '…' : (typeof summary?.pendingVendors === 'number' ? summary.pendingVendors.toLocaleString() : '—')}
                        subLabel="Not yet approved"
                        icon={Clock}
                        color="text-white"
                        bg="bg-blue-900"
                        cardBg="bg-blue-100/20"
                        borderColor="border-blue-500"
                        dotColor="#3b82f6"
                    />
                    <StatCard
                        label="Approved Vendors"
                        value={isSummaryLoading ? '…' : (typeof summary?.approvedVendors === 'number' ? summary.approvedVendors.toLocaleString() : '—')}
                        subLabel="Approved, store open or closed"
                        icon={CheckCircle}
                        color="text-white"
                        bg="bg-purple-900"
                        cardBg="bg-purple-100/20"
                        borderColor="border-purple-500"
                        dotColor="#a855f7"
                    />
                    <StatCard
                        label="Suspended"
                        value={isSummaryLoading ? '…' : (typeof summary?.suspendedVendors === 'number' ? summary.suspendedVendors.toLocaleString() : '—')}
                        subLabel="Suspended vendor accounts"
                        icon={AlertTriangle}
                        color="text-white"
                        bg="bg-amber-900"
                        cardBg="bg-amber-100/20"
                        borderColor="border-amber-500"
                        dotColor="#f59e0b"
                    />
                </div>

                {isSummaryError && <div role="alert" className="mx-4 mb-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-700">{summaryError?.message || 'Could not load vendor summary.'}<button type="button" onClick={() => refetchSummary()} className="ml-2 font-bold underline">Retry</button></div>}

            </div>

            {/* Search & Filters Row */}
            <div className="rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm">
                <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
                    {/* Search Bar */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                            placeholder="Search name, phone, email"
                            className="w-full pl-12 pr-6 py-4 bg-zinc-100 border-none rounded-3xl text-sm focus:ring-2 focus:ring-emerald-500/10 placeholder:text-zinc-500 outline-none transition-all font-medium"
                        />
                    </div>

                    {/* Date Filters & Reset Button */}
                    <div className="flex flex-wrap items-center gap-3">
                        <button type="button" onClick={() => { setDraftDates({ start: startDate, end: endDate }); setIsDateRangeOpen(true); }} className="flex items-center gap-2 rounded-3xl bg-zinc-100 px-4 py-3 text-xs font-semibold text-zinc-600 hover:bg-zinc-200" aria-label="Choose vendor date range">
                            <span className="text-[10px] font-bold uppercase text-zinc-400">Date range</span>
                            <span>{startDate && endDate ? `${startDate} – ${endDate}` : 'From – To'}</span>
                            <Calendar className="text-zinc-400" size={15}/>
                        </button>

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
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-[1.5rem] border border-zinc-200 overflow-hidden shadow-sm">
                <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-zinc-100 gap-4">
                    <div>
                        <h3 className="text-sm md:text-base font-medium text-zinc-900">Vendors</h3>
                        <p className="text-[10px] text-zinc-500 font-medium">All vendor operations in one place.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                        <div className="relative">
                            <button
                                onClick={() => setShowSortDropdown(!showSortDropdown)}
                                className="flex items-center gap-1.5 px-3 py-2.5 md:py-2 bg-zinc-50 rounded-xl text-[9px] font-bold text-zinc-500 hover:bg-zinc-100 transition-colors uppercase tracking-tight"
                            >
                                {sortLabels[selectedSort]} <ChevronDown size={14} className={`transition-transform duration-300 ${showSortDropdown ? 'rotate-180' : ''}`} />
                            </button>
                            {showSortDropdown && (
                                <div className="absolute right-0 mt-2 w-25 bg-white border border-zinc-100 rounded-2xl shadow-xl z-50 overflow-hidden py-1 animate-in fade-in zoom-in duration-200">
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
                                className="flex items-center gap-1.5 px-3 py-2.5 md:py-2 bg-zinc-50 rounded-xl text-[9px] font-bold text-zinc-500 hover:bg-zinc-100 transition-colors uppercase tracking-tight"
                            >
                                {filterLabels[selectedFilter]} <ChevronDown size={14} className={`transition-transform duration-300 ${showFilterDropdown ? 'rotate-180' : ''}`} />
                            </button>
                            {showFilterDropdown && (
                                <div className="absolute right-0 mt-2 w-25 bg-white border border-zinc-100 rounded-2xl shadow-xl z-50 overflow-hidden py-1 animate-in fade-in zoom-in duration-200">
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
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 md:py-2 bg-emerald-800 rounded-3xl text-[10px] font-bold text-white hover:bg-emerald-900 transition-all shadow-md shadow-emerald-900/10 whitespace-nowrap"
                        >
                            Create Vendor
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1100px] table-fixed">
                        <thead>
                            <tr className="bg-zinc-50/50 border-b border-zinc-100">
                                <th className="w-[16%] px-2.5 py-3 text-left text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Store</th>
                                <th className="w-[14%] px-2.5 py-3 text-left text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Vendor</th>
                                <th className="w-[17%] px-2.5 py-3 text-left text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Phone</th>
                                <th className="w-[19%] px-2.5 py-3 text-left text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Address</th>
                                <th className="w-[13%] px-2.5 py-3 text-left text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Joined</th>
                                <th className="w-[7%] px-2.5 py-3 text-left text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Orders</th>
                                <th className="w-[9%] px-2.5 py-3 text-left text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Status</th>
                                <th className="w-[5%] px-2.5 py-3 text-center text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="8" className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 size={32} className="text-emerald-600 animate-spin" />
                                            <p className="text-sm font-medium text-zinc-500">Loading vendors...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan="8" className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <AlertCircle size={32} className="text-rose-500" />
                                            <p className="text-sm font-medium text-rose-500">{error.message || 'Failed to load vendors'}</p>
                                            <button onClick={() => refetch()} className="mt-2 px-4 py-2 bg-zinc-900 text-white text-xs font-bold rounded-lg hover:bg-zinc-800 transition-colors">Retry</button>
                                        </div>
                                    </td>
                                </tr>
                            ) : vendors.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="py-20 text-center text-zinc-500 font-medium text-sm">No vendors found.</td>
                                </tr>
                            ) : (
                                vendors.map((vendor) => {
                                    const status = getVendorAccountStatus(vendor);
                                    const statusClass = status === 'ACTIVE'
                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                        : status === 'SUSPENDED'
                                            ? 'bg-rose-50 text-rose-600 border-rose-100'
                                            : status === 'PENDING'
                                                ? 'bg-amber-50 text-amber-600 border-amber-100'
                                                : 'bg-zinc-100 text-zinc-600 border-zinc-200';
                                    return (
                                    <tr key={vendor.vendorId || vendor.id} className="hover:bg-zinc-50/50 transition-colors group">
                                        <td className="px-2.5 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center text-[8px] font-bold text-zinc-500 overflow-hidden shrink-0">
                                                    {getInitials(vendor.storeName)}
                                                </div>
                                                <span title={formatName(vendor.storeName)} className="max-w-[130px] truncate text-[12px] font-semibold text-zinc-900">{formatName(vendor.storeName)}</span>
                                            </div>
                                        </td>
                                        <td title={formatName(vendor.ownerName)} className="max-w-0 truncate px-2.5 py-3 text-[12px] font-normal text-zinc-600">{formatName(vendor.ownerName)}</td>
                                        <td className="px-2.5 py-3 text-[11px] font-normal text-zinc-600 whitespace-nowrap">{vendor.phonenumber}</td>
                                        <td title={vendor.address || ''} className="max-w-0 truncate px-2.5 py-3 text-[11px] font-normal text-zinc-600">{vendor.address}</td>
                                        <td className="px-2.5 py-3 text-[11px] font-normal text-zinc-600 whitespace-nowrap">{formatShortDate(vendor.createdAt)}</td>
                                        <td className="px-2.5 py-3 text-[12px] font-semibold text-zinc-800">{vendor.totalOrders}</td>
                                        <td className="px-2.5 py-3">
                                            <span className={`px-2 py-0.5 rounded-full text-[12px] font-bold border capitalize ${statusClass}`}>
                                                {status.toLowerCase()}
                                            </span>
                                        </td>
                                        <td className="px-2.5 py-3">
                                            <div className="flex justify-center">
                                                <button
                                                    onClick={() => openDetailModal(vendor)}
                                                    aria-label={`View details for ${vendor.storeName || vendor.ownerName || 'vendor'}`}
                                                    className="p-1.5 bg-indigo-50 text-indigo-500 rounded-lg hover:bg-indigo-500 hover:text-white transition-all"
                                                >
                                                    <Eye size={12} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ); })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
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
            <WalletCustomDateModal
                isOpen={isDateRangeOpen}
                dates={draftDates}
                onDatesChange={setDraftDates}
                onClose={() => setIsDateRangeOpen(false)}
                onApply={(dates) => { setStartDate(dates.start); setEndDate(dates.end); setPage(1); setIsDateRangeOpen(false); }}
            />
        </div>
    );
};

export default Vendors;
