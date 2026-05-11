import React, { useState, useEffect } from 'react';
import {
    Search,
    ChevronDown,
    Wallet,
    ShoppingBag,
    CheckCircle2,
    Building2,
    Calendar,
    ChevronRight,
    ChevronLeft,
    Loader2,
    AlertCircle,
    Search as SearchIcon
} from 'lucide-react';
import PaymentModal from '../../components/admin/PaymentModal';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/api';
import { useAuthStore } from '../../store/useAuthStore';

const StatCard = ({ label, value, subLabel, icon: Icon, color, bg, borderColor, cardBg, dotColor }) => (
    <div className={`relative overflow-hidden p-6 rounded-2xl ${cardBg} border ${borderColor} shadow-sm transition-all hover:shadow-md group flex-1 min-w-[280px]`}>
        {/* Grain/Texture Effect */}
        <div className={`absolute inset-0 opacity-[0.03] pointer-events-none`}
            style={{ backgroundImage: `radial-gradient(${dotColor} 1px, transparent 1px)`, backgroundSize: '4px 4px' }}></div>

        {/* Glow Effect */}
        <div className={`absolute -top-10 -right-10 w-48 h-48 ${bg} opacity-10 blur-[40px] rounded-full transition-all duration-500 group-hover:scale-125 group-hover:opacity-20`} />

        <div className="relative z-10 flex justify-between items-start">
            <div>
                <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-3">{label}</p>
                <div className="space-y-1">
                    <h3 className="text-lg font-bold text-zinc-900 leading-tight">{value}</h3>
                    <p className="text-[11px] font-medium text-zinc-400 mt-3">{subLabel}</p>
                </div>
            </div>
            <div className={`p-3 rounded-2xl ${bg} ${color} shadow-sm border border-white/40 group-hover:rotate-6 transition-all duration-300`}>
                <Icon size={20} />
            </div>
        </div>
    </div>
);

const FilterDropdown = ({ selected, onSelect, options = ['all', 'today', 'yesterday', 'last7days', 'last30days', 'thisMonth', 'lastMonth'] }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = React.useRef(null);

    const labels = {
        'all': 'All Time',
        'today': 'Today',
        'yesterday': 'Yesterday',
        'last7days': 'Last 7 Days',
        'last30days': 'Last 30 Days',
        'thisMonth': 'This Month',
        'lastMonth': 'Last Month'
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative w-full sm:w-auto" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between gap-2 px-4 py-2 bg-zinc-50 border border-zinc-100 rounded-xl text-[11px] font-bold text-zinc-600 group hover:bg-zinc-100 transition-all outline-none"
            >
                {labels[selected] || selected}
                <ChevronDown size={14} className={`text-zinc-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
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
                            className={`w-full text-left px-4 py-2 text-[11px] font-bold transition-colors ${selected === opt ? 'bg-zinc-50 text-emerald-600' : 'text-zinc-600 hover:bg-zinc-50'
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

const Payments = () => {
    const token = useAuthStore((state) => state.accessToken);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);

    // Fetch Payment Dashboard
    const { data: dashboardData, isLoading, error, refetch } = useQuery({
        queryKey: ['payment-dashboard', filter, page, searchQuery],
        queryFn: async () => {
                 return await api.get(`/superadmin/payment?filter=${filter}&page=${page}&limit=20`, token);
        },
        keepPreviousData: true
    });

    const summary = dashboardData?.data?.summary || {
        totalOrders: 0,
        totalAmountToPay: 0,
        totalPaidAmount: 0
    };

    const vendors = dashboardData?.data?.vendors?.data || [];
    const totalPages = dashboardData?.data?.vendors?.pagination?.totalPages || 1;

    const handleVendorClick = (vendor) => {
        setSelectedVendor(vendor);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
            <div className='bg-white py-6 rounded-2xl'>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
                    <StatCard
                        label="Pending to Pay Vendors"
                        value={`₦${summary.totalAmountToPay?.toLocaleString()}`}
                        subLabel="Delivered orders only"
                        icon={Wallet}
                        color="text-white"
                        bg="bg-amber-900"
                        cardBg="bg-amber-100/20"
                        borderColor="border-amber-500"
                        dotColor="#f59e0b"
                    />
                    <StatCard
                        label="Total Paid Amount"
                        value={`₦${summary.totalPaidAmount?.toLocaleString()}`}
                        subLabel="Paid within selected range"
                        icon={ShoppingBag}
                        color="text-white"
                        bg="bg-emerald-900"
                        cardBg="bg-emerald-100/20"
                        borderColor="border-emerald-500"
                        dotColor="#10b981"
                    />
                </div>

                {/* Search Bar Section */}
                <div className="px-4">
                    <div className="relative max-w-md">
                        <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Filter by vendor name..."
                            className="w-full pl-14 pr-6 py-4 bg-zinc-100 border-none rounded-3xl text-sm focus:ring-2 focus:ring-emerald-500/10 placeholder:text-zinc-500 outline-none transition-all font-medium"
                        />
                    </div>
                </div>
            </div>

            {/* Vendor List Section */}
            <div className="bg-white rounded-[2rem] border border-zinc-200 overflow-hidden shadow-sm">
                <div className="p-4 md:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-zinc-100 gap-4">
                    <div>
                        <h3 className="text-sm md:text-base font-bold text-zinc-900">Payments</h3>
                        <p className="text-[10px] text-zinc-500 font-medium tracking-tight">Click a vendor row to see all orders + amount to pay</p>
                    </div>
                     <FilterDropdown 
                        selected={filter} 
                        onSelect={(val) => { setFilter(val); setPage(1); }} 
                    />
                </div>

                <div className="divide-y divide-zinc-100 min-h-[400px] relative">
                    {isLoading ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[1px] z-10">
                            <div className="flex flex-col items-center gap-2">
                                <Loader2 className="text-emerald-600 animate-spin" size={32} />
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Fetching Payments...</p>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <AlertCircle size={32} className="text-rose-500" />
                            <p className="text-sm font-bold text-rose-500 uppercase tracking-tight">Failed to load payments</p>
                            <button onClick={() => refetch()} className="text-[10px] font-bold text-zinc-500 underline uppercase">Retry</button>
                        </div>
                    ) : vendors.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20">
                          <p className="text-xs font-bold text-zinc-400 uppercase">No payment records found</p>
                      </div>
                    ) : (
                        vendors
                        .filter(v => v.vendorStoreName?.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((vendor, idx) => (
                            <button
                                key={vendor.vendorId || idx}
                                onClick={() => handleVendorClick(vendor)}
                                className="w-full p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-zinc-50 transition-all text-left group border-none outline-none gap-4"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-500 font-bold text-sm uppercase group-hover:scale-105 transition-transform overflow-hidden">
                                        {vendor.vendorStoreName?.substring(0, 2)}
                                    </div>
                                    <div className="space-y-1.5">
                                        <h4 className="text-[13px] font-bold text-zinc-900">{vendor.vendorStoreName}</h4>
                                        <div className="flex items-center gap-2">
                                            <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[9px] font-bold">
                                                Unpaid: {vendor.unpaidDeliveriesCount || 0}
                                            </span>
                                            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[9px] font-bold">
                                                Paid: {vendor.paidDeliveriesCount || 0}
                                            </span>
                                            {vendor.lastPaidAt && (
                                                <span className="text-[10px] text-zinc-400 font-medium ml-2">
                                                    Last: {new Date(vendor.lastPaidAt).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right flex items-center gap-4">
                                    <div>
                                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">Amount to pay</p>
                                        <h3 className="text-base font-bold text-zinc-900 leading-tight">₦{(vendor.amountToPay || 0).toLocaleString()}</h3>
                                    </div>
                                    <ChevronRight size={18} className="text-zinc-300 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </button>
                        ))
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between">
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Page {page} of {totalPages}</p>
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

            <PaymentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                vendor={selectedVendor}
            />
        </div>
    );
};

export default Payments;
