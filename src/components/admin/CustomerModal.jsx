import React, { useState, useRef, useEffect } from 'react';
import {
    X,
    ChevronDown,
    AlertCircle,
    CheckCircle2,
    AlertTriangle,
    Loader2
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '../../api/api';
import { useAuthStore } from '../../store/useAuthStore';

const ConfirmationModal = ({ isOpen, onClose, type, customer, onConfirm }) => {
    const [reason, setReason] = useState('');
    const [otherReason, setOtherReason] = useState('');
    const [showReasons, setShowReasons] = useState(false);
    const dropdownRef = useRef(null);

    const reasons = [
        'Policy violation',
        'Fraudulent activity',
        'Repeated cancellations',
        'Abuse or misconduct',
        'Suspicious behavior',
        'Other'
    ];
    
    const isReasonValid = reason && (reason !== 'Other' || otherReason.trim() !== '');

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowReasons(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!isOpen) return null;

    const isActivate = type === 'activate';
    const isDelete = type === 'delete';

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-fade-in" onClick={onClose} />
            <div className="relative bg-white rounded-[2rem] w-full max-w-sm overflow-hidden shadow-2xl animate-fade-in transition-all duration-300">
                <div className="p-6 flex flex-col items-center text-center">
                    <div className="flex justify-between w-full mb-4">
                        <span className="text-sm font-bold text-zinc-900 capitalize">{type} account</span>
                        <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {isActivate ? (
                        <>
                            <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mb-6">
                                <CheckCircle2 size={40} className="text-emerald-600" />
                            </div>
                            <h3 className="text-xl font-bold text-zinc-900 mb-2">Confirm Account Activation</h3>
                            <p className="text-xs text-zinc-400 font-medium leading-relaxed mb-8 px-4">
                                Activating this account will allow the customer to log in and use all available features.
                            </p>
                        </>
                    ) : (
                        <>
                            <div className="w-24 h-24 flex items-center justify-center mb-4">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-rose-400 opacity-20 blur-xl rounded-full"></div>
                                    <AlertTriangle size={60} className={isDelete ? "text-rose-500 relative z-10" : "text-amber-400 relative z-10"} fill="currentColor" />
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-1">
                                        <span className="text-white font-bold text-xl">!</span>
                                    </div>
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-zinc-900 mb-2">
                                {isDelete ? 'Delete User Account' : 'Suspend User Account'}
                            </h3>
                            <p className="text-xs text-zinc-500 font-bold text-center mb-6 max-w-[200px]">
                                {isDelete 
                                    ? 'This action is PERMANENT and will remove all user data from the system.' 
                                    : 'This will temporarily make this account inactive and restrict access to the platform.'}
                            </p>

                            {!isDelete && (
                                <div className="w-full text-left space-y-4 mb-8">
                                    <div>
                                        <label className="text-xs font-bold text-zinc-900 mb-2 block tracking-tight">Suspension Reason *</label>
                                        <div className="relative" ref={dropdownRef}>
                                            <button
                                                onClick={() => setShowReasons(!showReasons)}
                                                className="w-full flex items-center justify-between px-4 py-4 bg-white border border-zinc-100 rounded-2xl text-xs font-medium text-zinc-400 hover:bg-zinc-50 transition-all"
                                            >
                                                <span>{reason || 'Reasons'}</span>
                                                <ChevronDown size={18} className={`transition-transform duration-300 ${showReasons ? 'rotate-180' : ''}`} />
                                            </button>

                                            {showReasons && (
                                                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-zinc-100 rounded-2xl shadow-xl z-20 overflow-y-auto max-h-48 py-1 custom-scrollbar">
                                                    {reasons.map((r) => (
                                                        <button
                                                            key={r}
                                                            onClick={() => { setReason(r); setShowReasons(false); }}
                                                            className="w-full text-left px-4 py-3 text-xs font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
                                                        >
                                                            {r}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {reason === 'Other' && (
                                        <textarea
                                            placeholder="Give reasons if you select others..."
                                            className="w-full px-4 py-4 bg-white border border-zinc-100 rounded-2xl text-xs font-medium text-zinc-700 focus:ring-1 focus:ring-rose-500/20 outline-none h-32 resize-none transition-all"
                                            value={otherReason}
                                            onChange={(e) => setOtherReason(e.target.value)}
                                        />
                                    )}
                                </div>
                            )}
                        </>
                    )}

                    <div className="flex w-full gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-4 bg-zinc-50 text-zinc-900 text-sm font-bold rounded-3xl hover:bg-zinc-100 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={!isActivate && !isDelete && !isReasonValid}
                            onClick={() => { onConfirm({ reason, otherReason }); onClose(); }}
                            className={`flex-1 py-4 text-white text-sm font-bold rounded-3xl transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${isActivate
                                    ? 'bg-emerald-800 hover:bg-emerald-900 shadow-emerald-900/10'
                                    : 'bg-rose-600 hover:bg-rose-700 shadow-rose-900/10'
                                }`}
                        >
                            {isActivate ? 'Activate' : (isDelete ? 'Delete' : 'Suspend')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CustomerModal = ({ isOpen, onClose, customer }) => {
    const token = useAuthStore((state) => state.accessToken);
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('Overview');
    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmType, setConfirmType] = useState(''); // 'activate', 'suspend', or 'delete'
    const [filter, setFilter] = useState('last7days');

    // Fetch Overview
    const { data: overviewData, isLoading: isOverviewLoading } = useQuery({
        queryKey: ['userOverview', customer?.id, filter],
        queryFn: () => api.get(`/superadmin/users/${customer?.id}/overview?filter=${filter}`, token),
        enabled: !!customer?.id && isOpen && activeTab === 'Overview'
    });

    // Fetch Orders
    const { data: ordersData, isLoading: isOrdersLoading } = useQuery({
        queryKey: ['userOrders', customer?.id, filter],
        queryFn: () => api.get(`/superadmin/users/${customer?.id}/orders?filter=${filter}&page=1`, token),
        enabled: !!customer?.id && isOpen && activeTab === 'Orders'
    });

    // Mutations
    const suspensionMutation = useMutation({
        mutationFn: (data) => api.patch(`/superadmin/users/${customer?.id}/suspension`, data, token),
        onSuccess: (res) => {
            queryClient.invalidateQueries(['userOverview', customer?.id]);
            queryClient.invalidateQueries(['users']);
            setShowConfirm(false);
            toast.success(res.message || 'Suspension status updated');
        },
        onError: (err) => {
            toast.error(err.message || 'Failed to update suspension');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: () => api.delete('/superadmin/users', { userId: customer?.id }, token),
        onSuccess: (res) => {
            queryClient.invalidateQueries(['users']);
            toast.success(res.message || 'User deleted successfully');
            onClose();
        },
        onError: (err) => {
            toast.error(err.message || 'Failed to delete user');
        }
    });

    if (!isOpen) return null;

    const overview = overviewData?.data || {};
    const orders = ordersData?.data?.orders || [];

    const handleActionClick = () => {
        setConfirmType(customer?.isSuspended ? 'activate' : 'suspend');
        setShowConfirm(true);
    };

    const handleDeleteClick = () => {
        setConfirmType('delete');
        setShowConfirm(true);
    };

    const handleConfirm = (data) => {
        if (confirmType === 'delete') {
            deleteMutation.mutate();
        } else {
            suspensionMutation.mutate({
                suspend: confirmType === 'suspend',
                reason: data?.reason === 'Other' ? data?.otherReason : data?.reason
            });
        }
    };

    return (
        <>
            <div className="fixed inset-0 z-50 overflow-hidden">
                {/* Backdrop */}
                <div
                    className={`absolute inset-0 bg-black/50 animate-fade-in`}
                    onClick={onClose}
                />

                {/* Drawer */}
                <div className={`absolute inset-y-0 right-0 max-w-lg w-full bg-white shadow-2xl animate-slide-in`}>
                    <div className="h-full flex flex-col">
                        {/* Header */}
                        <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 font-bold text-sm">
                                    {(customer?.firstname?.[0] || '') + (customer?.lastname?.[0] || '')}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-zinc-900 leading-tight">{customer?.firstname} {customer?.lastname}</h2>
                                    <h5 className="text-xs font-medium text-zinc-500 leading-tight">{customer?.id}</h5>
                                    <div className="mt-1">
                                        <span className={`px-3 py-0.5 rounded-full text-[10px] font-bold border capitalize ${!overview.isSuspended
                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                            : 'bg-rose-50 text-rose-600 border-rose-100'
                                            }`}>
                                            {overview.isSuspended ? 'Inactive' : 'Active'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-400 hover:text-zinc-600"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {/* Contact Info */}
                            <div className="p-6 space-y-4">
                                <div className="bg-zinc-100 rounded-2xl p-5 border border-zinc-100 space-y-4">
                                    <div>
                                        <label className="text-sm font-bold text-zinc-900 tracking-wider block mb-1">Phone</label>
                                        <p className="text-xs font-medium text-zinc-400">{overview.phone || customer?.phonenumber || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-zinc-900 tracking-wider block mb-1">Email</label>
                                        <p className="text-xs font-medium text-zinc-400">{overview.email || customer?.email || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-zinc-900 tracking-wider block mb-1">Address</label>
                                        <p className="text-xs font-medium text-zinc-400">{overview.address || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="px-4 flex items-center justify-between gap-4 mb-6">
                                <div className="flex p-1.5 flex-1">
                                    {['Overview', 'Orders'].map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`flex-1 py-2.5 text-xs font-medium rounded-3xl transition-all ${activeTab === tab
                                                ? 'bg-emerald-800 text-white shadow-sm'
                                                : 'text-zinc-500 rounded-3xl bg-zinc-100 mx-2 hover:text-zinc-700'
                                                }`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>
                                <div className="relative">
                                    <select
                                        value={filter}
                                        onChange={(e) => setFilter(e.target.value)}
                                        className="appearance-none flex items-center gap-2 px-4 py-2.5 bg-zinc-100 rounded-2xl text-[10px] font-bold text-zinc-500 uppercase tracking-wider outline-none"
                                    >
                                        <option value="last7days">Last 7 Days</option>
                                        <option value="last30days">Last 30 Days</option>
                                        <option value="thisMonth">This Month</option>
                                        <option value="lastMonth">Last Month</option>
                                        <option value="all">All Time</option>
                                    </select>
                                </div>
                            </div>

                            {activeTab === 'Overview' ? (
                                <div className="px-6 space-y-6">
                                    {isOverviewLoading ? (
                                        <div className="flex justify-center py-10">
                                            <Loader2 className="text-emerald-600 animate-spin" size={32} />
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-4">
                                            {[
                                                { label: 'Total Orders', value: overview.totalOrders || 0 },
                                                { label: 'Delivered', value: overview.deliveredOrders || 0 },
                                                { label: 'Cancelled', value: overview.cancelledOrders || 0 },
                                                { label: 'Total Spent', value: `₦${(overview.totalSpent || 0).toLocaleString()}` },
                                            ].map((stat, i) => (
                                                <div key={i} className="bg-zinc-100 border border-zinc-100 p-5 rounded-2xl hover:bg-white hover:shadow-md transition-all group">
                                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 group-hover:text-zinc-500">{stat.label}</p>
                                                    <p className="text-xl font-bold text-zinc-900">{stat.value}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* DetailsSection */}
                                    <div className="bg-white border border-zinc-100 rounded-2xl p-6 shadow-sm">
                                        <h3 className="text-sm font-bold text-zinc-900 mb-4">Details</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Joined</label>
                                                <p className="text-sm font-bold text-zinc-800">
                                                    {overview.joinedAt ? `${overview.joinedAt.date}/${overview.joinedAt.month}/${overview.joinedAt.year}` : 'N/A'}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Last Seen</label>
                                                <p className="text-sm font-bold text-zinc-800">
                                                    {overview.lastSeenAt ? `${overview.lastSeenAt.date}/${overview.lastSeenAt.month}/${overview.lastSeenAt.year}` : 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {overview.isSuspended && (
                                        <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-5 flex items-start gap-3">
                                            <AlertCircle className="text-rose-500 shrink-0" size={18} />
                                            <div>
                                                <p className="text-sm font-bold text-rose-900">User Account Inactive</p>
                                                <p className="text-[11px] text-rose-600 font-medium leading-relaxed mt-1">
                                                    {overview.suspensionReason || 'This account is currently inactive and cannot perform any transactions on the platform.'}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="px-6 space-y-6">
                                    {isOrdersLoading ? (
                                        <div className="flex justify-center py-10">
                                            <Loader2 className="text-emerald-600 animate-spin" size={32} />
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {orders.length === 0 ? (
                                                <p className="text-center py-10 text-zinc-500 font-medium text-xs">No orders found.</p>
                                            ) : (
                                                orders.map((order, i) => (
                                                    <div key={i} className="group relative flex items-center justify-between p-4 bg-zinc-100 border border-zinc-100 rounded-2xl hover:bg-white hover:shadow-md transition-all">
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex items-center justify-between gap-2">
                                                                <span className="text-sm font-bold text-zinc-900">{order.code}</span>
                                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${order.status === 'CANCELLED' ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'
                                                                    }`}>
                                                                    {order.status}
                                                                </span>
                                                            </div>
                                                            <p className="text-[10px] font-medium text-zinc-400">
                                                                {order.date ? `${order.date.date}/${order.date.month}/${order.date.year}` : ''} • {order.vendorStore}
                                                            </p>
                                                            <div className="mt-2 text-[10px] font-bold text-zinc-400 flex justify-between items-center gap-1.5 uppercase tracking-wider">
                                                                Amount <span className="text-zinc-900">₦{(order.amount || 0).toLocaleString()}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 border-t border-zinc-100 flex items-center gap-3">
                            <button
                                onClick={handleDeleteClick}
                                disabled={deleteMutation.isPending}
                                className="flex-1 py-3 text-xs font-bold text-emerald-800 border-2 border-emerald-800/20 rounded-3xl hover:bg-emerald-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {deleteMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : 'Delete account'}
                            </button>
                            <button
                                onClick={handleActionClick}
                                disabled={suspensionMutation.isPending}
                                className={`flex-1 py-3 text-xs font-bold text-white rounded-3xl transition-all shadow-md shadow-emerald-900/10 flex items-center justify-center gap-2 disabled:opacity-50 ${overview.isSuspended ? 'bg-emerald-800' : 'bg-emerald-900 hover:bg-emerald-950'
                                    }`}>
                                {suspensionMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : (overview.isSuspended ? 'Activate account' : 'Suspend account')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation Modals */}
            <ConfirmationModal
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                type={confirmType}
                customer={customer}
                onConfirm={handleConfirm}
            />
        </>
    );
};

export default CustomerModal;
