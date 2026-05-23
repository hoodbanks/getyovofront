import React, { useState } from 'react';
import {
    Search,
    ChevronDown,
    History,
    Calendar,
    ChevronRight,
    ChevronLeft,
    Loader2,
    AlertCircle,
    Download,
    Eye,
    X
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/api';
import { useAuthStore } from '../../store/useAuthStore';
import { formatDate, formatName, exportToCSV } from '../../utils/formatters';
import TransactionModal from '../../components/admin/TransactionModal';

const StatCard = ({ label, value, subLabel, icon: Icon, color, bg, borderColor, cardBg, dotColor }) => (
    <div className={`relative overflow-hidden p-6 rounded-2xl ${cardBg} border ${borderColor} shadow-sm transition-all hover:shadow-md group flex-1 min-w-[280px]`}>
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{ backgroundImage: `radial-gradient(${dotColor} 1px, transparent 1px)`, backgroundSize: '4px 4px' }}></div>
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

const Transactions = () => {
    const token = useAuthStore((state) => state.accessToken);
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data: transData, isLoading, error, refetch } = useQuery({
        queryKey: ['transactions', page],
        queryFn: () => api.get(`/superadmin/transchistory?page=${page}&limit=20`, token),
    });

    const transactions = transData?.data?.data || [];
    const pagination = transData?.data?.pagination || { page: 1, limit: 20, total: 0 };
    const totalPages = Math.ceil(pagination.total / pagination.limit) || 1;

    const handleViewDetails = (transaction) => {
        setSelectedTransaction(transaction);
        setIsModalOpen(true);
    };

    const handleExport = () => {
        if (!transactions.length) return;
        
        const exportData = transactions.map(tx => ({
            'Customer Name': tx.customerName,
            'Total Amount (₦)': tx.totalAmount,
            'Paid At': tx.paidAt,
            'Vendor Store': tx.vendor?.storeName,
            'Vendor ID': tx.vendor?.id,
            'Items': tx.items?.map(i => `${i.productName} (${i.quantity})`).join(' | ')
        }));

        exportToCSV(exportData, 'getyovo_transactions');
    };

    const filteredTransactions = transactions.filter(t => {
        const matchesSearch = !searchQuery || 
            t.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.vendor?.storeName?.toLowerCase().includes(searchQuery.toLowerCase());
        
        let matchesDate = true;
        if (t.paidAt) {
            const txDate = new Date(t.paidAt);
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

        return matchesSearch && matchesDate;
    });

    const totalRevenue = filteredTransactions.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
            <div className='bg-white py-6 rounded-2xl'>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
                    <StatCard
                        label="Total Transactions"
                        value={pagination.total?.toLocaleString() || '0'}
                        subLabel="Successful paid orders"
                        icon={History}
                        color="text-white"
                        bg="bg-indigo-900"
                        cardBg="bg-indigo-100/20"
                        borderColor="border-indigo-500"
                        dotColor="#6366f1"
                    />
                    <StatCard
                        label="Page Volume"
                        value={`₦${totalRevenue.toLocaleString()}`}
                        subLabel="Volume on current page"
                        icon={Calendar}
                        color="text-white"
                        bg="bg-emerald-900"
                        cardBg="bg-emerald-100/20"
                        borderColor="border-emerald-500"
                        dotColor="#10b981"
                    />
                </div>

                {/* Search & Filters Row */}
                <div className="px-4 flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
                    {/* Search Bar */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by customer or vendor..."
                            className="w-full pl-14 pr-6 py-4 bg-zinc-100 border-none rounded-3xl text-sm focus:ring-2 focus:ring-emerald-500/10 placeholder:text-zinc-500 outline-none transition-all font-medium"
                        />
                    </div>

                    {/* Date Filters & Reset Button */}
                    <div className="flex flex-wrap items-center gap-3">
                        {/* From Date */}
                        <div className="relative flex items-center bg-zinc-100 rounded-3xl px-4 py-3.5 focus-within:ring-2 focus-within:ring-emerald-500/10 transition-all">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase mr-2 select-none">From</span>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="bg-transparent border-none text-xs font-bold text-zinc-700 focus:ring-0 p-0 outline-none cursor-pointer [color-scheme:light]"
                            />
                            <Calendar className="text-zinc-400 ml-2" size={14} />
                        </div>

                        {/* To Date */}
                        <div className="relative flex items-center bg-zinc-100 rounded-3xl px-4 py-3.5 focus-within:ring-2 focus-within:ring-emerald-500/10 transition-all">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase mr-2 select-none">To</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
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
                                }}
                                className="flex items-center gap-2 px-5 py-3.5 bg-zinc-900 text-white rounded-3xl text-[10px] font-bold hover:bg-zinc-800 transition-all hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest group shadow-sm cursor-pointer"
                            >
                                <X size={14} className="group-hover:rotate-90 transition-transform duration-300" />
                                Reset
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Transactions Table Section */}
            <div className="bg-white rounded-[2rem] border border-zinc-200 overflow-hidden shadow-sm">
                <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-zinc-100 gap-4">
                    <div>
                        <h3 className="text-sm md:text-base font-bold text-zinc-900">Transaction History</h3>
                        <p className="text-[10px] text-zinc-500 font-medium tracking-tight">Real-time log of all successfully processed payments</p>
                    </div>
                    <button 
                        onClick={handleExport}
                        disabled={!transactions.length}
                        className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-xl text-[10px] font-bold hover:bg-zinc-800 transition-all uppercase tracking-widest disabled:opacity-50"
                    >
                        <Download size={14} />
                        Export History
                    </button>
                </div>

                <div className="divide-y divide-zinc-100 min-h-[400px] relative">
                    {isLoading ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[1px] z-10">
                            <div className="flex flex-col items-center gap-2">
                                <Loader2 className="text-emerald-600 animate-spin" size={32} />
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Loading History...</p>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <AlertCircle size={32} className="text-rose-500" />
                            <p className="text-sm font-bold text-rose-500 uppercase tracking-tight">Failed to load transactions</p>
                            <button onClick={() => refetch()} className="text-[10px] font-bold text-zinc-500 underline uppercase">Retry</button>
                        </div>
                    ) : filteredTransactions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">No transactions found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-zinc-50/50">
                                        <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Customer</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Vendor</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Items</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Amount</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Date & Time</th>
                                        <th className="px-6 py-4 text-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100">
                                    {filteredTransactions.map((tx, idx) => (
                                        <tr key={idx} className="hover:bg-zinc-50/50 transition-colors group">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-500 font-bold text-[10px] uppercase">
                                                        {tx.customerName?.substring(0, 2)}
                                                    </div>
                                                    <span className="text-[13px] font-bold text-zinc-900 tracking-tight">{formatName(tx.customerName)}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col">
                                                    <span className="text-[12px] font-bold text-zinc-700">{formatName(tx.vendor?.storeName)}</span>
                                                    <span className="text-[9px] text-zinc-400 font-medium">ID: {tx.vendor?.id}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[11px] font-bold text-zinc-600">{tx.items?.length} Items</span>
                                                    <span className="text-[9px] text-zinc-400 font-medium truncate max-w-[150px]">
                                                        {tx.items?.map(i => i.productName).join(', ')}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="text-[13px] font-extrabold text-emerald-700 tracking-tight">₦{tx.totalAmount?.toLocaleString()}</span>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span className="text-[12px] font-bold text-zinc-700">{formatDate(tx.paidAt)}</span>
                                                    <span className="text-[10px] text-zinc-400 font-medium">
                                                        {new Date(tx.paidAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex justify-center">
                                                    <button 
                                                        onClick={() => handleViewDetails(tx)}
                                                        className="p-2 bg-indigo-50 text-indigo-500 rounded-lg hover:bg-indigo-500 hover:text-white transition-all shadow-sm"
                                                    >
                                                        <Eye size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
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
                                className="flex items-center gap-1 px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-[11px] font-bold text-zinc-500 hover:bg-zinc-50 disabled:opacity-50 transition-colors"
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
                                                    ? 'bg-emerald-600 text-white shadow-sm border-emerald-600' 
                                                    : 'bg-white text-zinc-500 hover:bg-zinc-50 border border-zinc-200'
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
                                className="flex items-center gap-1 px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-[11px] font-bold text-zinc-500 hover:bg-zinc-50 disabled:opacity-50 transition-colors"
                            >
                                Next <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <TransactionModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                transaction={selectedTransaction}
            />
        </div>
    );
};

export default Transactions;
