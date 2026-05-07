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
    ArrowUpRight,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/api';
import { useAuthStore } from '../../store/useAuthStore';
import { toast } from 'sonner';
import RecordPayoutModal from './RecordPayoutModal';

const PaymentModal = ({ isOpen, onClose, vendor }) => {
    const token = useAuthStore((state) => state.accessToken);
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('all'); // all, paid, unpaid
    const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [snapshotData, setSnapshotData] = useState(null);

    // Fetch Vendor Overview
    const { data: overviewData, isLoading, error } = useQuery({
        queryKey: ['vendor-payment-overview', vendor?.vendorId, activeTab, page],
        queryFn: () => api.get(`/superadmin/payment/vendor/${vendor.vendorId}/overview?status=${activeTab}&page=${page}`, token),
        enabled: !!isOpen && !!vendor?.vendorId
    });

    // Create Snapshot Mutation
    const snapshotMutation = useMutation({
        mutationFn: () => api.post(`/superadmin/payment/vendor/${vendor.vendorId}/snapshot`, {}, token),
        onSuccess: (res) => {
            setSnapshotData(res.data);
            setIsRecordModalOpen(true);
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Failed to create payout snapshot');
        }
    });

    if (!isOpen || !vendor) return null;

    const vendorInfo = overviewData?.data?.vendor || {};
    const orders = overviewData?.data?.orders?.data || [];
    const stats = {
        paid: vendorInfo.totalPaidAmount || 0,
        pending: vendorInfo.amountToPay || 0
    };

    const handleMarkPaidClick = () => {
        if (stats.pending <= 0) {
            toast.error('No pending amount to pay');
            return;
        }
        snapshotMutation.mutate();
    };

    const handleConfirmPaid = () => {
        setIsRecordModalOpen(false);
        setSnapshotData(null);
        queryClient.invalidateQueries(['vendor-payment-overview']);
        queryClient.invalidateQueries(['payment-dashboard']);
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
                            <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 font-bold text-xs uppercase border border-zinc-200">
                                {vendorInfo.storeName?.substring(0, 2) || vendor.vendorStoreName?.substring(0, 2)}
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-zinc-900">{vendorInfo.storeName || vendor.vendorStoreName}</h2>
                                <p className="text-[10px] text-zinc-500 font-medium tracking-tight">Status: <span className="text-emerald-600 font-bold uppercase underline">Connected</span></p>
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
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6 relative">
                        {isLoading && (
                            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex items-center justify-center">
                                <Loader2 className="animate-spin text-emerald-600" size={32} />
                            </div>
                        )}

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-300 flex justify-between items-start group hover:bg-emerald-50 transition-colors">
                                <div>
                                    <p className="text-[9px] font-bold text-emerald-800 uppercase tracking-wider mb-2">Paid to Vendor</p>
                                    <h4 className="text-sm font-bold text-zinc-900 leading-none">₦{stats.paid.toLocaleString()}</h4>
                                    <p className="text-[9px] text-emerald-600 font-medium mt-2">All-time</p>
                                </div>
                                <div className="p-2 bg-emerald-800 rounded-xl text-white shadow-sm border border-white/40 group-hover:rotate-6 transition-all duration-300">
                                    <CheckCircle2 size={14} />
                                </div>
                            </div>
                            <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-300 flex justify-between items-start group hover:bg-amber-50 transition-colors">
                                <div>
                                    <p className="text-[9px] font-bold text-amber-800 uppercase tracking-wider mb-2">Pending to pay</p>
                                    <h4 className="text-sm font-bold text-zinc-900 leading-none">₦{stats.pending.toLocaleString()}</h4>
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
                                    <div className="p-2 bg-zinc-200 rounded-lg text-zinc-500">
                                        <Building2 size={16} />
                                    </div>
                                    <p className="text-[11px] font-bold text-zinc-800">
                                        {vendorInfo.bankName || 'N/A'} • {vendorInfo.accountName || 'N/A'} • {vendorInfo.accountNumber || 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Order List Header & Tabs */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex gap-1 bg-zinc-100 p-0.5 rounded-3xl">
                                    {['all', 'unpaid', 'paid'].map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => { setActiveTab(tab); setPage(1); }}
                                            className={`px-4 py-1.5 rounded-3xl text-[10px] font-bold transition-all uppercase tracking-tighter ${activeTab === tab
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
                            <div className="space-y-3 pb-20">
                                {orders.length === 0 ? (
                                    <div className="py-20 text-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest">No order records</div>
                                ) : (
                                    orders.map((order, idx) => (
                                        <div key={idx} className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100 space-y-4 hover:border-emerald-100 transition-colors group">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h5 className="text-[11px] font-bold text-zinc-900">{order.orderCode}</h5>
                                                    <p className="text-[10px] text-zinc-400 font-medium">
                                                        {new Date(order.paidAt || order.createdAt || Date.now()).toLocaleString()} • {order.customerName}
                                                    </p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-bold border uppercase tracking-tighter ${order.vendorPaymentStatus === 'PAID'
                                                        ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                                                        : 'bg-amber-50 text-amber-900 border-amber-200'
                                                    }`}>
                                                    {order.vendorPaymentStatus}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-tight">Amount to pay vendor</p>
                                                <h4 className="text-sm font-bold text-zinc-900">₦{order.amountToPay?.toLocaleString()}</h4>
                                            </div>
                                        </div>
                                    ))
                                )}
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
                                onClick={handleMarkPaidClick}
                                disabled={snapshotMutation.isLoading || stats.pending <= 0}
                                className="px-5 py-2.5 bg-emerald-800 text-white rounded-3xl text-[11px] font-medium hover:bg-emerald-900 transition-all shadow-md shadow-emerald-900/10 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {snapshotMutation.isLoading ? <Loader2 className="animate-spin" size={14} /> : 'Process Payout'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <RecordPayoutModal
                isOpen={isRecordModalOpen}
                onClose={() => setIsRecordModalOpen(false)}
                vendor={vendorInfo?.id ? vendorInfo : { id: vendor.vendorId, storeName: vendor.vendorStoreName }}
                amount={snapshotData?.amount || stats.pending}
                payoutBatchId={snapshotData?.payoutBatchId}
                onConfirm={handleConfirmPaid}
            />
        </>
    );
};

export default PaymentModal;
