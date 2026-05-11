import React, { useState, useEffect, useRef } from 'react';
import {
    Search,
    ChevronDown,
    ChevronRight,
    ChevronLeft,
    Eye,
    Users,
    UserPlus,
    UserRoundX,
    UserCheck,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/api';
import { useAuthStore } from '../../store/useAuthStore';
import { formatName, formatDate, getInitials } from '../../utils/formatters';
import CustomerModal from '../../components/admin/CustomerModal';

const StatCard = ({ label, value, icon: Icon, color, bg, borderColor, cardBg, dotColor }) => (
    <div className={`relative overflow-hidden p-4 pb-6 rounded-xl ${cardBg} border ${borderColor} shadow-sm transition-all hover:shadow-md group flex-1 min-w-0`}>
        {/* Grain/Texture Effect using Radial Gradients */}
        <div className={`absolute inset-0 opacity-[0.03] pointer-events-none`}
            style={{ backgroundImage: `radial-gradient(${dotColor} 1px, transparent 1px)`, backgroundSize: '4px 4px' }}></div>

        {/* Glow Effect Background */}
        <div className={`absolute -top-10 -right-10 w-40 h-40 ${bg} opacity-10 blur-[30px] rounded-full transition-all duration-500 group-hover:scale-125 group-hover:opacity-20`} />

        <div className="relative z-10 flex justify-between items-start">
            <div>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">{label}</p>
                <h3 className="text-sm font-bold text-zinc-900 leading-none">{value}</h3>
            </div>
            <div className={`p-2 rounded-xl ${bg} ${color} shadow-sm border border-white/40 group-hover:rotate-6 transition-all duration-300`}>
                <Icon size={18} />
            </div>
        </div>
    </div>
);

const Customers = () => {
    const token = useAuthStore((state) => state.accessToken);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [sortView, setSortView] = useState('main'); // 'main', 'name', 'date'
    const [selectedSort, setSelectedSort] = useState('date_newest');
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);

    // Filter labels map
    const filterLabels = {
        'all': 'All customers',
        'active': 'Active customer',
        'suspended': 'Suspended customer'
    };

    // Sort labels map
    const sortLabels = {
        'name_asc': 'A-Z',
        'name_desc': 'Z-A',
        'date_newest': 'Newest to oldest',
        'date_oldest': 'Oldest to newest'
    };

    // Fetch Users
    const { data: usersData, isLoading, error, refetch } = useQuery({
        queryKey: ['users', selectedFilter, selectedSort, page, searchQuery],
        queryFn: async () => {
            if (searchQuery) {
                return await api.get(`/superadmin/users/search?query=${searchQuery}&page=${page}&limit=20`, token);
            }
            return await api.get(`/superadmin/users?filter=${selectedFilter}&sortBy=${selectedSort}&page=${page}&limit=20`, token);
        },
        keepPreviousData: true
    });

    const lastSummaryRef = useRef({ totalUsers: 0, activeUsers: 0, suspendedUsers: 0, newThisWeek: 0 });

    if (usersData?.data?.summary) {
        lastSummaryRef.current = usersData.data.summary;
    }

    const summary = usersData?.data?.summary || lastSummaryRef.current;
    const customers = usersData?.data?.users?.data || usersData?.data?.data || [];
    const totalItems = usersData?.data?.users?.total || usersData?.data?.total || 0;
    const totalPages = usersData?.data?.users?.totalPages || Math.ceil(totalItems / 20) || 1;


    const openModal = (customer) => {
        setSelectedCustomer(customer);
        setIsModalOpen(true);
    };

    const toggleSort = () => {
        setShowSortDropdown(!showSortDropdown);
        setShowFilterDropdown(false);
        setSortView('main');
    };

    const toggleFilter = () => {
        setShowFilterDropdown(!showFilterDropdown);
        setShowSortDropdown(false);
    };

    return (
        <div className="space-y-6 w-full max-w-[1600px] mx-auto pb-10">
            <div className='bg-white py-5 rounded-2xl'>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 md:gap-4 p-4 rounded-xl">
                    <StatCard
                        label="Total Customers"
                        value={summary.totalUsers?.toLocaleString()}
                        icon={Users}
                        color="text-white"
                        bg="bg-emerald-900"
                        cardBg="bg-emerald-100/20"
                        borderColor="border-emerald-500"
                        dotColor="#10b981"
                    />
                    <StatCard
                        label="Active Customers"
                        value={summary.activeUsers?.toLocaleString()}
                        icon={UserCheck}
                        color="text-white"
                        bg="bg-blue-900"
                        cardBg="bg-blue-100/20"
                        borderColor="border-blue-500"
                        dotColor="#3b82f6"
                    />
                    <StatCard
                        label="Suspended Accounts"
                        value={summary.suspendedUsers?.toLocaleString()}
                        icon={UserRoundX}
                        color="text-white"
                        bg="bg-purple-900"
                        cardBg="bg-purple-100/20"
                        borderColor="border-purple-500"
                        dotColor="#a855f7"
                    />
                    <StatCard
                        label="New this week"
                        value={summary.newThisWeek?.toLocaleString()}
                        icon={UserPlus}
                        color="text-white"
                        bg="bg-amber-900"
                        cardBg="bg-amber-100/20"
                        borderColor="border-amber-500"
                        dotColor="#f59e0b"
                    />
                </div>

                {/* Search Section */}
                <div className="relative w-full sm:max-w-md p-4">
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
                <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-zinc-100 relative gap-4">
                    <div>
                        <h3 className="text-sm md:text-base font-medium text-zinc-900">Active customers</h3>
                        <p className="text-[10px] text-zinc-500 font-medium">Customers active within the system</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                        {/* Sort Dropdown */}
                        <div className="relative">
                            <button
                                onClick={toggleSort}
                                className="flex items-center gap-2 md:gap-8 px-4 md:px-5 py-2.5 bg-zinc-100 rounded-xl text-[9px] md:text-[10px] font-bold text-zinc-500 hover:bg-zinc-200 transition-colors uppercase tracking-tight"
                            >
                                {sortLabels[selectedSort] || 'Sort by'} <ChevronDown size={14} className={`transition-transform duration-300 ${showSortDropdown ? 'rotate-180' : ''}`} />
                            </button>

                            {showSortDropdown && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowSortDropdown(false)} />
                                    <div className="absolute right-0 mt-2 w-64 bg-white border border-zinc-100 rounded-[24px] shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in duration-200">
                                        {sortView === 'main' && (
                                            <>
                                                <div className="px-5 py-4 bg-[#F8FAFC] border-b border-zinc-50">
                                                    <span className="text-[13px] font-semibold text-[#64748B]">Sort by</span>
                                                </div>
                                                <div className="py-2">
                                                    <button
                                                        onClick={() => setSortView('name')}
                                                        className="w-full flex items-center justify-between px-5 py-4 text-[15px] font-bold text-[#1E293B] hover:bg-zinc-50 transition-colors"
                                                    >
                                                        Customer name
                                                        <ChevronRight size={18} className="text-[#64748B]" />
                                                    </button>
                                                    <button
                                                        onClick={() => setSortView('date')}
                                                        className="w-full flex items-center justify-between px-5 py-4 text-[15px] font-bold text-[#1E293B] hover:bg-zinc-50 transition-colors"
                                                    >
                                                        Date Joined
                                                        <ChevronRight size={18} className="text-[#64748B]" />
                                                    </button>
                                                </div>
                                            </>
                                        )}

                                        {sortView === 'name' && (
                                            <>
                                                <div className="px-5 py-4 bg-[#F8FAFC] border-b border-zinc-50 flex items-center gap-2">
                                                    <button onClick={() => setSortView('main')} className="p-1 hover:bg-zinc-200 rounded-full transition-colors">
                                                        <ChevronLeft size={16} className="text-[#64748B]" />
                                                    </button>
                                                    <span className="text-[13px] font-semibold text-[#64748B]">Customer name</span>
                                                </div>
                                                <div className="py-2">
                                                    {[
                                                        { label: 'A-Z', value: 'name_asc' },
                                                        { label: 'Z-A', value: 'name_desc' }
                                                    ].map(opt => (
                                                        <button
                                                            key={opt.value}
                                                            onClick={() => { setSelectedSort(opt.value); setShowSortDropdown(false); setPage(1); }}
                                                            className="w-full text-left px-5 py-4 text-[15px] font-bold text-[#1E293B] hover:bg-zinc-50 transition-colors"
                                                        >
                                                            {opt.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </>
                                        )}

                                        {sortView === 'date' && (
                                            <>
                                                <div className="px-5 py-4 bg-[#F8FAFC] border-b border-zinc-50 flex items-center gap-2">
                                                    <button onClick={() => setSortView('main')} className="p-1 hover:bg-zinc-200 rounded-full transition-colors">
                                                        <ChevronLeft size={16} className="text-[#64748B]" />
                                                    </button>
                                                    <span className="text-[13px] font-semibold text-[#64748B]">Date Joined</span>
                                                </div>
                                                <div className="py-2">
                                                    {[
                                                        { label: 'Newest to oldest', value: 'date_newest' },
                                                        { label: 'Oldest to newest', value: 'date_oldest' }
                                                    ].map(opt => (
                                                        <button
                                                            key={opt.value}
                                                            onClick={() => { setSelectedSort(opt.value); setShowSortDropdown(false); setPage(1); }}
                                                            className="w-full text-left px-5 py-4 text-[15px] font-bold text-[#1E293B] hover:bg-zinc-50 transition-colors"
                                                        >
                                                            {opt.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Filter Dropdown */}
                        <div className="relative">
                            <button
                                onClick={toggleFilter}
                                className="flex items-center gap-2 md:gap-8 px-4 md:px-5 py-2.5 bg-zinc-100 rounded-xl text-[9px] md:text-[10px] font-bold text-zinc-500 hover:bg-zinc-200 transition-colors uppercase tracking-tight"
                            >
                                {filterLabels[selectedFilter]} <ChevronDown size={14} className={`transition-transform duration-300 ${showFilterDropdown ? 'rotate-180' : ''}`} />
                            </button>

                            {showFilterDropdown && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowFilterDropdown(false)} />
                                    <div className="absolute right-0 mt-2 w-64 bg-white border border-zinc-100 rounded-[24px] shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in duration-200">
                                        <div className="px-5 py-4 bg-[#F8FAFC] border-b border-zinc-50">
                                            <span className="text-[13px] font-semibold text-[#64748B]">Filters</span>
                                        </div>
                                        <div className="py-2">
                                            {[
                                                { label: 'All customers', value: 'all' },
                                                { label: 'Active customer', value: 'active' },
                                                { label: 'Suspended customer', value: 'suspended' }
                                            ].map(opt => (
                                                <button
                                                    key={opt.value}
                                                    onClick={() => { setSelectedFilter(opt.value); setShowFilterDropdown(false); setPage(1); }}
                                                    className={`w-full text-left px-5 py-4 text-[15px] font-bold transition-colors ${selectedFilter === opt.value ? 'text-[#1C5B2B]' : 'text-[#1E293B] hover:bg-zinc-50'}`}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-zinc-50/50 border-b border-zinc-100">
                                <th className="px-3 py-3.5 text-left text-[12px] font-bold text-zinc-400 uppercase tracking-wider">Customer</th>
                                <th className="px-3 py-3.5 text-left text-[12px] font-bold text-zinc-400 uppercase tracking-wider">Phone</th>
                                <th className="px-3 py-3.5 text-left text-[12px] font-bold text-zinc-400 uppercase tracking-wider">Email</th>
                                <th className="px-3 py-3.5 text-left text-[12px] font-bold text-zinc-400 uppercase tracking-wider">Joined</th>
                                <th className="px-3 py-3.5 text-left text-[12px] font-bold text-zinc-400 uppercase tracking-wider">Status</th>
                                <th className="px-3 py-3.5 text-center text-[12px] font-bold text-zinc-400 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="6" className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 size={32} className="text-emerald-600 animate-spin" />
                                            <p className="text-sm font-medium text-zinc-500">Loading customers...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan="6" className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <AlertCircle size={32} className="text-rose-500" />
                                            <p className="text-sm font-medium text-rose-500">{error.message || 'Failed to load customers'}</p>
                                            <button onClick={() => refetch()} className="mt-2 px-4 py-2 bg-zinc-900 text-white text-xs font-bold rounded-lg hover:bg-zinc-800 transition-colors">Retry</button>
                                        </div>
                                    </td>
                                </tr>
                            ) : customers.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-20 text-center text-zinc-500 font-medium text-sm">No customers found.</td>
                                </tr>
                            ) : (
                                customers.map((cust) => (
                                    <tr key={cust.id} className="hover:bg-zinc-50/50 transition-colors group">
                                        <td className="px-3 py-3.5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center text-[8px] font-bold text-zinc-500 shrink-0">
                                                    {getInitials(`${cust.firstname || ''} ${cust.lastname || ''}`)}
                                                </div>
                                                <span className="text-[12px] font-bold text-zinc-700 max-w-[80px]">{formatName(`${cust.firstname || ''} ${cust.lastname || ''}`)}</span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-3.5 text-[12px] font-medium text-zinc-500 whitespace-nowrap">{cust.phonenumber}</td>
                                        <td className="px-3 py-3.5 text-[12px] font-medium text-zinc-500 truncate max-w-[100px]">{cust.email}</td>
                                        <td className="px-3 py-3.5 text-[12px] font-medium text-zinc-500 whitespace-nowrap">{formatDate(cust.createdAt)}</td>
                                        <td className="px-3 py-3.5">
                                            <span className={`px-2 py-0.5 rounded-full text-[12px] font-bold border ${!cust.isSuspended
                                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                : 'bg-rose-50 text-rose-600 border-rose-100'
                                                }`}>
                                                {!cust.isSuspended ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3.5">
                                            <div className="flex justify-center">
                                                <button
                                                    onClick={() => openModal(cust)}
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

            <CustomerModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                customer={selectedCustomer}
            />
        </div>
    );
};

export default Customers;
