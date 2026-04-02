import React, { useState } from 'react';
import {
    X,
    Wallet,
    Clock,
    CheckCircle2,
    Search,
    ChevronDown,
    Building2,
    Calendar,
    ArrowUpRight
} from 'lucide-react';
import RecordPayoutModal from './RecordPayoutModal';

const PaymentModal = ({ isOpen, onClose, vendor }) => {
    const [activeTab, setActiveTab] = useState('Unpaid');
    const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);

    if (!isOpen || !vendor) return null;

    const orders = [
        { id: 'GY-276025', date: '21 Jan, 2026 1:45 PM', customer: 'Ifeoma', amount: 15404, status: 'Unpaid' },
        { id: 'GY-276026', date: '21 Jan, 2026 1:45 PM', customer: 'Ifeoma', amount: 15404, status: 'Unpaid' },
        { id: 'GY-276027', date: '21 Jan, 2026 1:45 PM', customer: 'Ifeoma', amount: 15404, status: 'Paid' },
        { id: 'GY-276028', date: '21 Jan, 2026 1:45 PM', customer: 'Ifeoma', amount: 15404, status: 'Unpaid' },
    ];

    const stats = {
        paid: "1,000,000",
        pending: "72,766"
    };

    const handleConfirmPaid = () => {
        setIsRecordModalOpen(false);
        // In a real app, update status here
    };

    return (
        <>
            <div className="fixed inset-0 z-[100] flex justify-end">
                <div
                    className={`absolute inset-0 bg-black/50 transition-opacity duration-300 animate-fade-in`}
                    onClick={onClose}
                />

                <div className={`relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-slide-in overflow-hidden`}>
                    {/* Header */}
                    <div className="p-4 bg-white border-b border-zinc-100 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 font-bold text-xs uppercase">
                                {vendor.initials || vendor.name?.substring(0, 2)}
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-zinc-900">{vendor.name}</h2>
                                <p className="text-[10px] text-zinc-500 font-medium">Amount to pay now: <span className="text-zinc-900 font-bold">₦{stats.pending}</span></p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1.5 hover:bg-zinc-100 rounded-lg transition-colors text-zinc-400"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-300 flex justify-between items-start group hover:bg-emerald-50 transition-colors">
                                <div>
                                    <p className="text-[9px] font-bold text-emerald-800 uppercase tracking-wider mb-2">Paid to Vendor</p>
                                    <h4 className="text-sm font-bold text-zinc-900 leading-none">{stats.paid} NGN</h4>
                                    <p className="text-[9px] text-emerald-600 font-medium mt-2">All-time</p>
                                </div>
                                <div className="p-2 bg-emerald-800 rounded-xl text-white shadow-sm border border-white/40 group-hover:rotate-6 transition-all duration-300">
                                    <CheckCircle2 size={14} />
                                </div>
                            </div>
                            <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-300 flex justify-between items-start group hover:bg-amber-50 transition-colors">
                                <div>
                                    <p className="text-[9px] font-bold text-amber-800 uppercase tracking-wider mb-2">Pending to pay</p>
                                    <h4 className="text-sm font-bold text-zinc-900 leading-none">{stats.pending} NGN</h4>
                                    <p className="text-[9px] text-amber-600 font-medium mt-2">Delivered orders</p>
                                </div>
                                <div className="p-2 bg-amber-700 rounded-xl text-white shadow-sm border border-white/40 group-hover:rotate-6 transition-all duration-300">
                                    <Wallet size={14} />
                                </div>
                            </div>
                        </div>

                        {/* Bank Details */}
                        <div className="space-y-3">
                            <h3 className="text-[11px] font-bold text-zinc-900 uppercase tracking-tight">Bank details</h3>
                            <div className="p-4 bg-zinc-100 rounded-2xl border border-zinc-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-zinc-100 rounded-lg text-zinc-500">
                                        <Building2 size={16} />
                                    </div>
                                    <p className="text-[11px] font-bold text-zinc-800">Zenith Bank • PharmaPlus • 0345678912</p>
                                </div>
                            </div>
                        </div>

                        {/* Order List Header & Tabs */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex gap-1 bg-zinc-100 p-0.5 rounded-3xl">
                                    {['All', 'Unpaid', 'Paid'].map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`px-4 py-1.5 rounded-3xl text-[10px] font-bold transition-all ${activeTab === tab
                                                    ? 'bg-emerald-800 text-white shadow-md'
                                                    : 'text-zinc-500 hover:text-zinc-700'
                                                }`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>
                                <div className="relative">
                                    <select className="appearance-none bg-white border border-zinc-200 rounded-xl px-3 py-1.5 pr-8 text-[10px] font-bold text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 cursor-pointer">
                                        <option>Last 7 Days</option>
                                        <option>Last 30 Days</option>
                                    </select>
                                    <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Orders */}
                            <div className="space-y-3">
                                {orders.filter(o => activeTab === 'All' || o.status === activeTab).map((order, idx) => (
                                    <div key={idx} className="bg-zinc-100 p-4 rounded-2xl border border-zinc-100 space-y-4 hover:border-emerald-100 transition-colors group">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h5 className="text-[11px] font-bold text-zinc-900">{order.id}</h5>
                                                <p className="text-[10px] text-zinc-400 font-medium">{order.date} • {order.customer}</p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-bold border ${order.status === 'Paid'
                                                    ? 'bg-emerald-50 text-emerald-900 border-emerald-900'
                                                    : 'bg-amber-50 text-amber-900 border-amber-900'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-tight">Amount to pay vendor</p>
                                            <h4 className="text-sm font-bold text-zinc-900">₦{order.amount.toLocaleString()}</h4>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-5 border-t border-zinc-100 bg-white shrink-0 mt-auto">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex-1">
                                <p className="text-[10px] font-medium text-zinc-400">Manual payout</p>
                                <p className="text-[11px] font-bold text-zinc-900 leading-tight">Record reference/proof so your accounting is real.</p>
                            </div>
                            <button
                                onClick={() => setIsRecordModalOpen(true)}
                                className="px-5 py-2.5 bg-emerald-800 text-white rounded-3xl text-[11px] font-medium hover:bg-emerald-900 transition-all shadow-md shadow-emerald-900/10 shrink-0"
                            >
                                Mark vendor Paid
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <RecordPayoutModal
                isOpen={isRecordModalOpen}
                onClose={() => setIsRecordModalOpen(false)}
                vendor={vendor}
                amount={stats.pending}
                onConfirm={handleConfirmPaid}
            />
        </>
    );
};

export default PaymentModal;
