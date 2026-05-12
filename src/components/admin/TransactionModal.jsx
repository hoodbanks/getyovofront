import React from 'react';
import {
    X,
    ShoppingBag,
    User,
    Store,
    Clock,
    CheckCircle2,
    Calendar,
    DollarSign,
    Package
} from 'lucide-react';
import { formatDate, formatName } from '../../utils/formatters';

const TransactionModal = ({ isOpen, onClose, transaction }) => {
    if (!isOpen || !transaction) return null;

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
                onClick={onClose}
            />

            <div className="relative w-full max-w-lg bg-zinc-50 h-full shadow-2xl flex flex-col animate-slide-in overflow-hidden">
                {/* Header */}
                <div className="p-5 bg-white border-b border-zinc-100 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                            <CheckCircle2 size={20} />
                        </div>
                        <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-tight">Transaction Details</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-zinc-100 rounded-xl transition-colors text-zinc-400"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                    {/* Status Summary Card */}
                    <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[10px] font-bold uppercase tracking-widest">
                                Payment Successful
                            </span>
                            <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-tighter">
                                {new Date(transaction.paidAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                        </div>
                        <div className="flex items-end justify-between pt-2">
                            <div>
                                <p className="text-[11px] font-bold text-zinc-400 uppercase mb-1">Total Amount Paid</p>
                                <h3 className="text-2xl font-black text-zinc-900 tracking-tight">
                                    ₦{transaction.totalAmount?.toLocaleString()}
                                </h3>
                            </div>
                            <div className="text-right">
                                <p className="text-[11px] font-bold text-zinc-400 uppercase mb-1">Transaction Date</p>
                                <p className="text-[13px] font-bold text-zinc-700">{formatDate(transaction.paidAt)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Entities Grid */}
                    <div className="grid grid-cols-1 gap-4">
                        {/* Customer Card */}
                        <div className="bg-white p-5 rounded-3xl border border-zinc-100 shadow-sm space-y-4">
                            <div className="flex items-center gap-2 text-zinc-400 border-b border-zinc-50 pb-2">
                                <User size={14} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Customer Information</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black text-sm uppercase">
                                    {transaction.customerName?.substring(0, 2)}
                                </div>
                                <div>
                                    <h5 className="text-[14px] font-bold text-zinc-900">{formatName(transaction.customerName)}</h5>
                                    <p className="text-[11px] text-zinc-500 font-medium tracking-tight">System User Account</p>
                                </div>
                            </div>
                        </div>

                        {/* Vendor Card */}
                        <div className="bg-white p-5 rounded-3xl border border-zinc-100 shadow-sm space-y-4">
                            <div className="flex items-center gap-2 text-zinc-400 border-b border-zinc-50 pb-2">
                                <Store size={14} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Vendor Information</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-black text-sm uppercase">
                                    {transaction.vendor?.storeName?.substring(0, 2)}
                                </div>
                                <div>
                                    <h5 className="text-[14px] font-bold text-zinc-900">{formatName(transaction.vendor?.storeName)}</h5>
                                    <p className="text-[11px] text-zinc-500 font-medium tracking-tight">Store ID: <span className="text-zinc-900 font-bold">{transaction.vendor?.id}</span></p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Items Section */}
                    <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-zinc-50 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-zinc-400">
                                <Package size={14} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Purchased Items</span>
                            </div>
                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">{transaction.items?.length} TOTAL</span>
                        </div>
                        <div className="divide-y divide-zinc-50">
                            {transaction.items?.map((item, i) => (
                                <div key={i} className="p-5 flex items-center justify-between hover:bg-zinc-50/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-400 text-[10px] font-bold">
                                            {item.quantity}x
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[13px] font-bold text-zinc-800 tracking-tight">{item.productName}</span>
                                            <span className="text-[10px] text-zinc-400 font-medium">Unit Price: ₦{item.price?.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[13px] font-black text-zinc-900">₦{(item.price * item.quantity).toLocaleString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-5 bg-zinc-900 text-white flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">Total Transaction Value</span>
                            <span className="text-lg font-black tracking-tight">₦{transaction.totalAmount?.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="p-5 bg-white border-t border-zinc-100 shrink-0">
                    <button
                        onClick={onClose}
                        className="w-full py-4 bg-zinc-100 text-zinc-600 font-bold rounded-2xl hover:bg-zinc-200 transition-all text-xs uppercase tracking-widest shadow-sm"
                    >
                        Close Detail View
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TransactionModal;
