import React, { useState, useRef, useEffect } from 'react';
import {
    X,
    ChevronDown,
    AlertCircle,
    CheckCircle2,
    AlertTriangle,
    Copy,
    Check,
    Loader2
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '../../api/api';
import { useAuthStore } from '../../store/useAuthStore';

const ConfirmationModal = ({ isOpen, onClose, type, vendor, onConfirm }) => {
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

    const isActivate = type === 'activate' || type === 'approve';
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
                            <h3 className="text-xl font-bold text-zinc-900 mb-2">Confirm Account {type === 'approve' ? 'Approval' : 'Activation'}</h3>
                            <p className="text-xs text-zinc-400 font-medium leading-relaxed mb-8 px-4">
                                {type === 'approve'
                                    ? 'Approving this vendor will allow them to start receiving orders on the platform.'
                                    : 'Activating this account will allow the vendor to log in and use all available features.'}
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
                                {isDelete ? 'Delete Vendor Account' : 'Suspend Vendor Account'}
                            </h3>
                            <p className="text-xs text-zinc-500 font-bold text-center mb-6 max-w-[200px]">
                                {isDelete 
                                    ? 'This action is PERMANENT and will remove all vendor data from the system.' 
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
                                                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-zinc-100 rounded-2xl shadow-xl z-20 overflow-y-auto max-h-72 py-1 custom-scrollbar">
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
                            onClick={() => { onConfirm({ reason, otherReason }); onClose(); }}
                            disabled={!isActivate && !isDelete && !isReasonValid}
                            className={`flex-1 py-4 text-white text-sm font-bold rounded-3xl transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${isActivate
                                    ? 'bg-emerald-800 hover:bg-emerald-900 shadow-emerald-900/10'
                                    : 'bg-rose-600 hover:bg-rose-700 shadow-rose-900/10'
                                }`}
                        >
                            {isActivate ? (type === 'approve' ? 'Approve' : 'Activate') : (isDelete ? 'Delete' : 'Suspend')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const VendorModal = ({ isOpen, onClose, vendor }) => {
    const token = useAuthStore((state) => state.accessToken);
    const queryClient = useQueryClient();
    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmType, setConfirmType] = useState(''); // 'activate', 'suspend', 'approve', 'delete'
    const [copied, setCopied] = useState(false);
    const [filter, setFilter] = useState('all');

    // Fetch Overview
    const { data: overviewData, isLoading: isOverviewLoading } = useQuery({
        queryKey: ['vendorOverview', vendor?.id, filter],
        queryFn: () => api.get(`/superadmin/vendors/${vendor?.id}/overview?filter=${filter}`, token),
        enabled: !!vendor?.id && isOpen
    });

    // Mutations
    const suspensionMutation = useMutation({
        mutationFn: (data) => api.patch(`/superadmin/vendors/${vendor?.id}/suspension`, data, token),
        onSuccess: (res) => {
            queryClient.invalidateQueries(['vendorOverview', vendor?.id]);
            queryClient.invalidateQueries(['vendors']);
            setShowConfirm(false);
            toast.success(res.message || 'Suspension status updated');
        },
        onError: (err) => {
            toast.error(err.message || 'Failed to update suspension');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: () => api.delete('/superadmin/vendors', { vendorId: vendor?.id }, token),
        onSuccess: (res) => {
            queryClient.invalidateQueries(['vendors']);
            toast.success(res.message || 'Vendor deleted successfully');
            onClose();
        },
        onError: (err) => {
            toast.error(err.message || 'Failed to delete vendor');
        }
    });

    if (!isOpen) return null;

    const overview = overviewData?.data || {};

    const handleActionClick = (type) => {
        setConfirmType(type);
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

    const copyToClipboard = (text) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <>
            <div className="fixed inset-0 z-50 overflow-hidden">
                <div className={`absolute inset-0 bg-black/50 animate-fade-in`} onClick={onClose} />
                <div className={`absolute inset-y-0 right-0 max-w-lg w-full bg-white shadow-2xl animate-slide-in`}>
                    <div className="h-full flex flex-col">
                        {/* Header */}
                        <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 font-bold text-sm overflow-hidden">
                                    {overview.logo ? <img src={overview.logo} alt="Store logo" className="w-full h-full object-cover" /> : (vendor?.storeName?.[0] || 'V')}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-zinc-900">{overview.storeName || vendor?.storeName || 'Store'}</h2>
                                    <p className="text-xs text-zinc-400 font-medium tracking-wide uppercase">{vendor?.id}</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-400 hover:text-zinc-600">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                            {/* Stats Grid */}
                            <div className="flex items-center justify-between gap-4">
                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Metrics</label>
                                <select 
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    className="text-[10px] font-bold text-zinc-500 bg-zinc-100 px-3 py-1.5 rounded-xl border-none outline-none"
                                >
                                    <option value="all">All Time</option>
                                    <option value="today">Today</option>
                                    <option value="yesterday">Yesterday</option>
                                    <option value="last7days">Last 7 Days</option>
                                    <option value="last30days">Last 30 Days</option>
                                </select>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                {isOverviewLoading ? (
                                    <div className="col-span-2 flex justify-center py-10">
                                        <Loader2 className="text-emerald-600 animate-spin" size={32} />
                                    </div>
                                ) : (
                                    [
                                        { label: 'Total Orders', value: overview.metrics?.totalOrders || 0 },
                                        { label: 'Delivered', value: overview.metrics?.deliveredOrders || 0 },
                                        { label: 'Cancelled', value: overview.metrics?.cancelledOrders || 0 },
                                        { label: 'Total Payout', value: `₦${(overview.metrics?.totalPayout || 0).toLocaleString()}` },
                                    ].map((stat, i) => (
                                        <div key={i} className="bg-zinc-100 border border-zinc-100 p-5 rounded-2xl hover:bg-white hover:shadow-md transition-all group">
                                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 group-hover:text-zinc-500">{stat.label}</p>
                                            <p className="text-xl font-bold text-zinc-900">{stat.value}</p>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Details Section */}
                            <div className="bg-white border border-zinc-100 rounded-2xl p-6 shadow-sm">
                                <h3 className="text-sm font-bold text-zinc-900 mb-4">Details</h3>
                                <div className="mb-6">
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold border capitalize ${!overview.isSuspended && overview.status !== 'PENDING'
                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                            : overview.isSuspended
                                                ? 'bg-rose-50 text-rose-600 border-rose-100'
                                                : 'bg-amber-50 text-amber-600 border-amber-100'
                                        }`}>
                                        {overview.isSuspended ? 'Inactive' : (overview.status || vendor?.status || 'Active')}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-y-6">
                                    <div>
                                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Store owner</label>
                                        <p className="text-sm font-bold text-zinc-800">{overview.ownerName || vendor?.ownerName || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Store Type</label>
                                        <p className="text-sm font-bold text-zinc-800">{overview.storeType || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Phone</label>
                                        <p className="text-sm font-bold text-zinc-800">{overview.phone || vendor?.phonenumber || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Email</label>
                                        <p className="text-sm font-bold text-zinc-800 lowercase break-all pr-2">{overview.email || vendor?.email || 'N/A'}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Address</label>
                                        <p className="text-sm font-bold text-zinc-800">{overview.address || vendor?.address || 'N/A'}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Date Joined</label>
                                        <p className="text-sm font-bold text-zinc-800">
                                            {overview.joinedAt ? `${overview.joinedAt.date}/${overview.joinedAt.month}/${overview.joinedAt.year}` : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Payout Account */}
                            <div className="bg-white border border-zinc-100 rounded-2xl p-6 shadow-sm">
                                <h3 className="text-sm font-bold text-zinc-900 mb-4">Payout Account</h3>
                                <div className="space-y-4">
                                    <div className="bg-zinc-100 rounded-2xl p-4 flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-bold text-zinc-600">{overview.bank?.accountName || 'N/A'}</p>
                                            <p className="text-xs font-medium text-zinc-400 mt-0.5">{overview.bank?.bankName || 'N/A'}</p>
                                            <div className="flex items-center gap-3 mt-4">
                                                <span className="text-sm font-medium text-zinc-400 tracking-widest">{overview.bank?.accountNumber || 'N/A'}</span>
                                                <button
                                                    onClick={() => copyToClipboard(overview.bank?.accountNumber)}
                                                    className="p-1.5 bg-white rounded-lg border border-zinc-200 text-zinc-400 hover:text-zinc-600 transition-colors"
                                                >
                                                    {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Contextual Alerts */}
                            {vendor?.status === 'Suspended' && (
                                <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-5 flex items-start gap-3">
                                    <AlertTriangle className="text-amber-500 shrink-0" size={18} />
                                    <div>
                                        <p className="text-sm font-bold text-amber-900">Vendor Account Inactive</p>
                                        <p className="text-[11px] text-amber-600 font-medium leading-relaxed mt-1">
                                            The store is currently unavailable and cannot accept new orders until reinstated by an administrator.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {vendor?.status === 'Pending' && (
                                <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-5 flex items-start gap-3">
                                    <AlertCircle className="text-amber-500 shrink-0" size={18} />
                                    <div>
                                        <p className="text-sm font-bold text-amber-900">Vendor account pending approval.</p>
                                        <p className="text-[11px] text-amber-600 font-medium leading-relaxed mt-1">
                                            Vendor account pending approval. Store access is restricted until approved by administrator.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 border-t border-zinc-100 flex items-center gap-3">
                            <button 
                                onClick={() => handleActionClick('delete')}
                                disabled={deleteMutation.isPending}
                                className="flex-1 py-3 text-xs font-bold text-emerald-800 border-2 border-emerald-800/20 rounded-3xl hover:bg-emerald-50 transition-all disabled:opacity-50"
                            >
                                {deleteMutation.isPending ? <Loader2 className="animate-spin mx-auto" size={16} /> : 'Delete account'}
                            </button>
                            {overview.status === 'PENDING' ? (
                                <button
                                    onClick={() => handleActionClick('approve')}
                                    disabled={suspensionMutation.isPending}
                                    className="flex-1 py-3 text-xs font-bold text-white rounded-3xl bg-emerald-800 hover:bg-emerald-900 transition-all shadow-md shadow-emerald-900/10 disabled:opacity-50"
                                >
                                    {suspensionMutation.isPending ? <Loader2 className="animate-spin mx-auto" size={16} /> : 'Approve account'}
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleActionClick(overview.isSuspended ? 'activate' : 'suspend')}
                                    disabled={suspensionMutation.isPending}
                                    className={`flex-1 py-3 text-xs font-bold text-white rounded-3xl transition-all shadow-md shadow-emerald-900/10 flex items-center justify-center gap-2 disabled:opacity-50 ${overview.isSuspended ? 'bg-emerald-800 hover:bg-emerald-900' : 'bg-emerald-900 hover:bg-black'
                                        }`}>
                                    {suspensionMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : (overview.isSuspended ? 'Activate account' : 'Suspend account')}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmationModal
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                type={confirmType}
                vendor={vendor}
                onConfirm={handleConfirm}
            />
        </>
    );
};

export default VendorModal;
