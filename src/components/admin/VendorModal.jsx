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
import { getVendorAccountStatus } from '../../utils/vendorAccountStatus';
import { formatName, formatDate, getInitials } from '../../utils/formatters';

const ConfirmationModal = ({ isOpen, onClose, type, onConfirm }) => {
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

    const isActivate = type === 'activate' || type === 'approve' || type === 'restore';
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
                            <h3 className="text-xl font-bold text-zinc-900 mb-2">{type === 'approve' ? 'Approve vendor account?' : 'Restore vendor account?'}</h3>
                            <p className="text-xs text-zinc-400 font-medium leading-relaxed mb-8 px-4">
                                {type === 'approve'
                                    ? 'This approves the vendor account. It does not open the store or change its store status.'
                                    : 'This removes the suspension. Store availability remains controlled by its store status.'}
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
                            {isActivate ? (type === 'approve' ? 'Approve vendor' : 'Restore account') : (isDelete ? 'Delete' : 'Suspend')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FilterDropdown = ({ selected, onSelect, options = ['all', 'today', 'yesterday', 'last7days', 'last30days'] }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const labels = {
        'all': 'All Time',
        'today': 'Today',
        'yesterday': 'Yesterday',
        'last7days': 'Last 7 Days',
        'last30days': 'Last 30 Days'
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
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 rounded-xl text-[10px] font-bold text-zinc-500 group hover:bg-zinc-200 transition-all outline-none"
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
                            className={`w-full text-left px-4 py-2 text-[10px] font-medium transition-colors ${selected === opt ? 'bg-zinc-50 text-emerald-600 font-bold' : 'text-zinc-600 hover:bg-zinc-50'
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

const formatVendorMoney = (naira, kobo) => {
    const value = Number.isFinite(naira) ? naira : Number.isFinite(kobo) ? kobo / 100 : null;
    return value === null ? '—' : `₦${value.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
const formatVendorCount = (value) => Number.isFinite(value) ? value.toLocaleString() : '—';
const VendorModal = ({ isOpen, onClose, vendor }) => {
    const token = useAuthStore((state) => state.accessToken);
    const queryClient = useQueryClient();
    const vendorId = vendor?.vendorId || vendor?.id;
    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmType, setConfirmType] = useState(''); // 'activate', 'suspend', 'approve', 'delete'
    const [filter, setFilter] = useState('all');

    // Fetch Overview
    const { data: overviewData, isLoading: isOverviewLoading, isError: isOverviewError, error: overviewError, refetch: refetchOverview } = useQuery({
        queryKey: ['vendorOverview', vendorId, filter],
        queryFn: () => api.get(`/superadmin/vendors/${encodeURIComponent(vendorId)}/overview?filter=${filter}`, token),
        enabled: Boolean(vendorId && isOpen)
    });
    const { data: walletData, isLoading: isWalletLoading, isError: isWalletError, error: walletError, refetch: refetchWallet } = useQuery({
        queryKey: ['vendor-wallet-detail', vendorId],
        queryFn: () => api.get(`/superadmin/vendor-wallets/${encodeURIComponent(vendorId)}`, token),
        enabled: Boolean(vendorId && isOpen),
    });

    // Mutations
    const suspensionMutation = useMutation({
        mutationFn: (data) => api.patch(`/superadmin/vendors/${encodeURIComponent(vendorId)}/suspension`, data, token),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['vendorOverview', vendorId] });
            queryClient.invalidateQueries(['vendors']);
            setShowConfirm(false);
            toast.success(res.message || 'Suspension status updated');
        },
        onError: (err) => {
            toast.error(err.message || 'Failed to update suspension');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: () => api.delete('/superadmin/vendors', { vendorId }, token),
        onSuccess: (res) => {
            queryClient.invalidateQueries(['vendors']);
            toast.success(res.message || 'Vendor deleted successfully');
            onClose();
        },
        onError: (err) => {
            toast.error(err.message || 'Failed to delete vendor');
        }
    });

    const verifyMutation = useMutation({
        mutationFn: (isVerified) => api.patch(`/superadmin/vendors/${encodeURIComponent(vendorId)}/verify`, { isVerified }, token),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['vendorOverview', vendorId] });
            queryClient.invalidateQueries(['vendors']);
            toast.success(res.message || 'Verification status updated');
        },
        onError: (err) => {
            toast.error(err.message || 'Failed to update verification');
        }
    });

    if (!isOpen) return null;

    const overview = overviewData?.data || {};
    const wallet = walletData?.data;
    const rawAccountStatus = String(overview.accountStatus || vendor?.accountStatus || overview.status || vendor?.status || '').trim().toUpperCase();
    const accountStatus = ['ACTIVE', 'INACTIVE', 'PENDING', 'SUSPENDED'].includes(rawAccountStatus) ? rawAccountStatus : '';
    const vendorStatus = getVendorAccountStatus({
        ...vendor,
        ...overview,
        status: accountStatus,
        isVerified: overview.isVerified ?? vendor?.isVerified,
        isSuspended: overview.isSuspended ?? vendor?.isSuspended,
    });
    const storeStatus = String(overview.storeStatus || overview.store?.status || vendor?.storeStatus || vendor?.store?.status || '').toUpperCase();
    const storeStatusTone = storeStatus === 'OPEN'
        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
        : storeStatus === 'CLOSED'
            ? 'border-rose-200 bg-rose-50 text-rose-700'
            : 'border-zinc-200 bg-zinc-50 text-zinc-500';
    const isPendingVendor = vendorStatus === 'PENDING';
    const isSuspendedVendor = vendorStatus === 'SUSPENDED';

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

    return (
        <>
            <div className="fixed inset-0 z-50 overflow-hidden">
                <div className={`absolute inset-0 bg-black/50 animate-fade-in`} onClick={onClose} />
                <div className="absolute inset-y-0 right-0 w-full max-w-xl animate-slide-in bg-white shadow-2xl">
                    <div className="h-full flex flex-col">
                        {/* Header */}
                        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-white/10 bg-[#0F172B] px-5 py-5 sm:px-6">
                            <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-emerald-200/20 bg-emerald-400/10 text-sm font-bold text-emerald-300">
                                    {overview.logo ? <img src={overview.logo} alt="Store logo" className="w-full h-full object-cover" /> : getInitials(overview.storeName || vendor?.storeName || 'Store')}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">Vendor profile</p>
                                    <h2 className="mt-1 truncate text-base font-bold text-white">{formatName(overview.storeName || vendor?.storeName || 'Store')}</h2>
                                    <p className="mt-1 truncate text-xs text-slate-300">{vendorId}</p>
                                </div>
                            </div>
                            <button type="button" aria-label="Close vendor details" onClick={onClose} className="shrink-0 rounded-lg p-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto bg-zinc-50/70 p-4 custom-scrollbar sm:p-5">
                            <section className="space-y-3">
                                <div className="flex items-center justify-between gap-4">
                                    <div><h3 className="text-sm font-bold text-zinc-900">Order metrics</h3><p className="text-[10px] text-zinc-500">All-order counts follow the selected date filter; paid counts are all-time.</p></div>
                                    <FilterDropdown selected={filter} onSelect={setFilter} />
                                </div>
                                {isOverviewLoading ? <div className="flex justify-center rounded-2xl bg-zinc-50 py-8"><Loader2 className="animate-spin text-emerald-600" size={26}/></div> : isOverviewError ? <div role="alert" className="rounded-xl bg-rose-50 p-4 text-xs text-rose-700">{overviewError?.message || 'Could not load vendor overview.'}<button type="button" onClick={() => refetchOverview()} className="ml-2 font-bold underline">Retry</button></div> : <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{[
                                    ['All orders', overview.metrics?.totalOrders], ['Delivered', overview.metrics?.deliveredOrders], ['All cancelled', overview.metrics?.cancelledOrders],
                                    ['Paid orders · All time', overview.metrics?.paidOrders], ['Paid cancelled · All time', overview.metrics?.paidCancelledOrders]
                                ].map(([label, value]) => <div key={label} className="rounded-xl border border-zinc-200 bg-white p-3.5"><p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">{label}</p><p className="mt-1.5 text-base font-bold text-zinc-900">{formatVendorCount(value)}</p></div>)}
                                </div>}
                            </section>

                            <section className="space-y-3">
                                <div><h3 className="text-sm font-bold text-zinc-900">Vendor Wallet</h3><p className="text-[10px] text-zinc-500">Lifetime wallet measures, separate from the order date filter. Completed withdrawals are manual transfers recorded by an admin, not independently verified.</p></div>
                                {isWalletLoading ? <div className="flex justify-center rounded-2xl bg-zinc-50 py-8"><Loader2 className="animate-spin text-emerald-600" size={26}/></div> : isWalletError ? <div role="alert" className="rounded-xl bg-rose-50 p-4 text-xs text-rose-700">{walletError?.message || 'Could not load Vendor Wallet metrics.'}<button type="button" onClick={() => refetchWallet()} className="ml-2 font-bold underline">Retry</button></div> : !wallet || typeof wallet !== 'object' ? <div role="alert" className="rounded-xl bg-rose-50 p-4 text-xs text-rose-700">Unexpected response from GET /superadmin/vendor-wallets/{vendorId}.</div> : wallet.walletExists === false ? <div className="rounded-xl bg-zinc-50 p-4 text-xs text-zinc-600">No Vendor Wallet record exists for this vendor.</div> : <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{[
                                    ['Available wallet balance', formatVendorMoney(wallet.balanceNaira, wallet.balanceKobo)],
                                    ['Gross order credits', formatVendorMoney(wallet.totalOrderCreditsNaira, wallet.totalOrderCreditsKobo)],
                                    ['Earnings reversed', formatVendorMoney(wallet.totalReversalsNaira, wallet.totalReversalsKobo)],
                                    ['Net order earnings', formatVendorMoney(wallet.netOrderEarningsNaira, wallet.netOrderEarningsKobo)],
                                    ['Completed withdrawals · manual transfers recorded', formatVendorMoney(wallet.totalWithdrawalsPaidNaira, wallet.totalWithdrawalsPaidKobo)],
                                    ['Reserved for withdrawals', formatVendorMoney(wallet.reservedWithdrawalAmountNaira, wallet.reservedWithdrawalAmountKobo)],
                                    ['Pending withdrawals', typeof wallet.pendingWithdrawalCount === 'number' ? wallet.pendingWithdrawalCount.toLocaleString() : '—'],
                                ].map(([label, value]) => <div key={label} className="rounded-xl border border-zinc-200 bg-white p-3.5"><p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">{label}</p><p className="mt-1.5 text-base font-bold text-zinc-900">{value}</p></div>)}</div>}
                            </section>

                            {/* Details Section */}
                            <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
                                <div className="flex items-center justify-between gap-3 border-b border-zinc-100 px-4 py-3.5">
                                    <div><h3 className="text-sm font-bold text-zinc-900">Vendor details</h3><p className="mt-0.5 text-[11px] text-zinc-500">Store and account information</p></div>
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold border ${vendorStatus === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : vendorStatus === 'SUSPENDED' ? 'bg-rose-50 text-rose-700 border-rose-100' : vendorStatus === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-zinc-100 text-zinc-700 border-zinc-200'}`}>
                                        {vendorStatus}
                                    </span>
                                </div>
                                {overview.isVerified === true && <div className="border-b border-zinc-100 px-4 py-2"><span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700"><CheckCircle2 size={12}/>Approved vendor</span></div>}
                                <div className="grid grid-cols-1 gap-2 p-3 sm:grid-cols-2">
                                    <div className="min-w-0 rounded-lg bg-zinc-50 px-3 py-2.5">
                                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Store owner</label>
                                        <p className="text-sm font-bold text-zinc-800">{formatName(overview.ownerName || vendor?.ownerName || 'N/A')}</p>
                                    </div>
                                    <div className="min-w-0 rounded-lg bg-zinc-50 px-3 py-2.5">
                                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Store Type</label>
                                        <p className="text-sm font-bold text-zinc-800">{overview.storeType || 'N/A'}</p>
                                    </div>
                                    <div className="min-w-0 rounded-lg bg-zinc-50 px-3 py-2.5">
                                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Store status</label>
                                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${storeStatusTone}`}><span className={`h-1.5 w-1.5 rounded-full ${storeStatus === 'OPEN' ? 'bg-emerald-500' : storeStatus === 'CLOSED' ? 'bg-rose-500' : 'bg-zinc-400'}`} />{storeStatus || 'Not provided'}</span>
                                    </div>
                                    <div className="min-w-0 rounded-lg bg-zinc-50 px-3 py-2.5">
                                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Phone</label>
                                        <p className="text-sm font-bold text-zinc-800">{overview.phone || vendor?.phonenumber || 'N/A'}</p>
                                    </div>
                                    <div className="min-w-0 rounded-lg bg-zinc-50 px-3 py-2.5">
                                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Email</label>
                                        <p className="text-sm font-bold text-zinc-800 lowercase break-all pr-2">{overview.email || vendor?.email || 'N/A'}</p>
                                    </div>
                                    <div className="min-w-0 rounded-lg bg-zinc-50 px-3 py-2.5 sm:col-span-2">
                                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Address</label>
                                        <p className="text-sm font-bold text-zinc-800">{overview.address || vendor?.address || 'N/A'}</p>
                                    </div>
                                    <div className="min-w-0 rounded-lg bg-zinc-50 px-3 py-2.5 sm:col-span-2">
                                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Date Joined</label>
                                        <p className="text-sm font-bold text-zinc-800">
                                            {formatDate(overview.joinedAt || vendor?.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            </section>

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

                            {isPendingVendor && (
                                <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-5 flex items-start gap-3">
                                    <AlertCircle className="text-amber-500 shrink-0" size={18} />
                                    <div>
                                        <p className="text-sm font-bold text-amber-900">Vendor account pending approval.</p>
                                        <p className="text-[11px] text-amber-600 font-medium leading-relaxed mt-1">
                                            Approve this account after the store profile is complete. Approval marks the account Active. It does not open the store.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="shrink-0 border-t border-zinc-200 bg-white px-5 py-4 sm:px-6">
                            <div className="flex items-center gap-3 w-full">
                                <button 
                                    onClick={() => handleActionClick('delete')}
                                    disabled={deleteMutation.isPending}
                                    className="flex-1 rounded-xl border border-rose-200 bg-white py-3 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-50 disabled:opacity-50"
                                >
                                    {deleteMutation.isPending ? <Loader2 className="animate-spin mx-auto" size={16} /> : 'Delete account'}
                                </button>
                                <button
                                    onClick={() => handleActionClick(isSuspendedVendor ? 'restore' : 'suspend')}
                                    disabled={suspensionMutation.isPending}
                                    className={`flex-1 rounded-xl py-3 text-xs font-semibold text-white transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 ${isSuspendedVendor ? 'bg-emerald-800 hover:bg-emerald-900' : 'bg-rose-600 hover:bg-rose-700'
                                        }`}>
                                    {suspensionMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : (isSuspendedVendor ? 'Restore account' : 'Suspend account')}
                                </button>
                            </div>
                            
                            {isPendingVendor && (
                                <button
                                    onClick={() => verifyMutation.mutate(true)}
                                    disabled={verifyMutation.isPending}
                                    className="mt-3 w-full rounded-xl border border-blue-200 bg-white py-3 text-xs font-bold text-blue-700 transition-colors hover:bg-blue-50 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {verifyMutation.isPending ? (
                                        <Loader2 className="animate-spin" size={16} />
                                    ) : (
                                        <>
                                            <CheckCircle2 size={16} />
                                            Approve vendor
                                        </>
                                    )}
                                </button>
                            )}
                            {isPendingVendor && <p className="text-center text-[10px] text-zinc-500">This marks the account Active. The store stays Closed until the vendor opens it.</p>}
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
