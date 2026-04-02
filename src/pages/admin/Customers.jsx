import React, { useState } from 'react';
import {
    Search,
    ChevronDown,
    ChevronRight,
    ChevronLeft,
    MoreHorizontal,
    Eye,
    Users,
    UserPlus,
    UserRoundX,
    UserCheck
} from 'lucide-react';
import CustomerModal from '../../components/admin/CustomerModal';

const StatCard = ({ label, value, icon: Icon, color, bg, borderColor, cardBg, dotColor }) => (
    <div className={`relative overflow-hidden p-4 pb-6 rounded-xl ${cardBg} border ${borderColor} shadow-sm transition-all hover:shadow-md group flex-1 min-w-[180px]`}>
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
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [sortView, setSortView] = useState('main'); // 'main', 'name', 'date'
    const [selectedSort, setSelectedSort] = useState('None');
    const [selectedFilter, setSelectedFilter] = useState('All customers');

    const customers = [
        { id: 1, name: 'Courtney Henry', phone: '(205) 555-0100', email: 'nathan.roberts@example.com', joined: 'May 6, 2012', status: 'Active', initials: 'CH' },
        { id: 2, name: 'Annette Black', phone: '(239) 555-0108', email: 'sara.cruz@example.com', joined: 'December 2, 2018', status: 'Suspended', initials: 'AB' },
        { id: 3, name: 'Brooklyn Simmons', phone: '(303) 555-0105', email: 'deanna.curtis@example.com', joined: 'May 31, 2015', status: 'Suspended', initials: 'BS' },
        { id: 4, name: 'Dianne Russell', phone: '(808) 555-0111', email: 'alma.lawson@example.com', joined: 'October 24, 2018', status: 'Active', initials: 'DR' },
        { id: 5, name: 'Floyd Miles', phone: '(252) 555-0126', email: 'tanya.hill@example.com', joined: 'September 9, 2013', status: 'Active', initials: 'FM' },
    ];

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
        <div className="space-y-6 w-full mx-auto">
            <div className='bg-white py-5 rounded-2xl'>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl">
                    <StatCard
                        label="Total Customers"
                        value="1,000,000"
                        icon={Users}
                        color="text-white"
                        bg="bg-emerald-900"
                        cardBg="bg-emerald-100/20"
                        borderColor="border-emerald-500"
                        dotColor="#10b981"
                    />
                    <StatCard
                        label="Active Customers"
                        value="1,000,000"
                        icon={UserCheck}
                        color="text-white"
                        bg="bg-blue-900"
                        cardBg="bg-blue-100/20"
                        borderColor="border-blue-500"
                        dotColor="#3b82f6"
                    />
                    <StatCard
                        label="Deleted Accounts"
                        value="1,000,000"
                        icon={UserRoundX}
                        color="text-white"
                        bg="bg-purple-900"
                        cardBg="bg-purple-100/20"
                        borderColor="border-purple-500"
                        dotColor="#a855f7"
                    />
                    <StatCard
                        label="New this week"
                        value="1,000,000"
                        icon={UserPlus}
                        color="text-white"
                        bg="bg-amber-900"
                        cardBg="bg-amber-100/20"
                        borderColor="border-amber-500"
                        dotColor="#f59e0b"
                    />
                </div>

                {/* Search Section */}
                <div className="relative max-w-md p-4">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                    <input
                        type="text"
                        placeholder="Search name, phone, email"
                        className="w-full pl-12 pr-6 py-4 bg-zinc-100 border-none rounded-3xl text-sm focus:ring-2 focus:ring-emerald-500/10 placeholder:text-zinc-500 outline-none transition-all"
                    />
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-[1.5rem] border border-zinc-200 overflow-hidden shadow-sm">
                <div className="p-4 flex items-center justify-between border-b border-zinc-100 relative">
                    <div>
                        <h3 className="text-base font-medium text-zinc-900">Active customers</h3>
                        <p className="text-[10px] text-zinc-500 font-medium">Customers active within the system</p>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Sort Dropdown */}
                        <div className="relative">
                            <button
                                onClick={toggleSort}
                                className="flex items-center gap-8 px-5 py-2.5 bg-zinc-100 rounded-xl text-[10px] font-bold text-zinc-500 hover:bg-zinc-200 transition-colors uppercase tracking-tight"
                            >
                                Sort by <ChevronDown size={14} className={`transition-transform duration-300 ${showSortDropdown ? 'rotate-180' : ''}`} />
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
                                                    {['A-Z', 'Z-A'].map(opt => (
                                                        <button
                                                            key={opt}
                                                            onClick={() => { setSelectedSort(opt); setShowSortDropdown(false); }}
                                                            className="w-full text-left px-5 py-4 text-[15px] font-bold text-[#1E293B] hover:bg-zinc-50 transition-colors"
                                                        >
                                                            {opt}
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
                                                    {['Newest to oldest', 'Oldest to newest'].map(opt => (
                                                        <button
                                                            key={opt}
                                                            onClick={() => { setSelectedSort(opt); setShowSortDropdown(false); }}
                                                            className="w-full text-left px-5 py-4 text-[15px] font-bold text-[#1E293B] hover:bg-zinc-50 transition-colors"
                                                        >
                                                            {opt}
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
                                className="flex items-center gap-8 px-5 py-2.5 bg-zinc-100 rounded-xl text-[10px] font-bold text-zinc-500 hover:bg-zinc-200 transition-colors uppercase tracking-tight"
                            >
                                Filters <ChevronDown size={14} className={`transition-transform duration-300 ${showFilterDropdown ? 'rotate-180' : ''}`} />
                            </button>

                            {showFilterDropdown && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowFilterDropdown(false)} />
                                    <div className="absolute right-0 mt-2 w-64 bg-white border border-zinc-100 rounded-[24px] shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in duration-200">
                                        <div className="px-5 py-4 bg-[#F8FAFC] border-b border-zinc-50">
                                            <span className="text-[13px] font-semibold text-[#64748B]">Filters</span>
                                        </div>
                                        <div className="py-2">
                                            {['All customers', 'Active customer', 'Suspended customer'].map(opt => (
                                                <button
                                                    key={opt}
                                                    onClick={() => { setSelectedFilter(opt); setShowFilterDropdown(false); }}
                                                    className={`w-full text-left px-5 py-4 text-[15px] font-bold transition-colors ${selectedFilter === opt ? 'text-[#1C5B2B]' : 'text-[#1E293B] hover:bg-zinc-50'}`}
                                                >
                                                    {opt}
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
                            {customers.map((cust) => (
                                <tr key={cust.id} className="hover:bg-zinc-50/50 transition-colors group">
                                    <td className="px-3 py-3.5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center text-[8px] font-bold text-zinc-500 shrink-0">
                                                {cust.initials}
                                            </div>
                                            <span className="text-[12px] font-bold text-zinc-700 max-w-[80px]">{cust.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-3 py-3.5 text-[12px] font-medium text-zinc-500 whitespace-nowrap">{cust.phone}</td>
                                    <td className="px-3 py-3.5 text-[12px] font-medium text-zinc-500 truncate max-w-[100px]">{cust.email}</td>
                                    <td className="px-3 py-3.5 text-[12px] font-medium text-zinc-500 whitespace-nowrap">{cust.joined}</td>
                                    <td className="px-3 py-3.5">
                                        <span className={`px-2 py-0.5 rounded-full text-[12px] font-bold border ${cust.status === 'Active'
                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                            : 'bg-amber-50 text-amber-600 border-amber-100'
                                            }`}>
                                            {cust.status}
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
                            ))}
                        </tbody>
                    </table>
                </div>
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
