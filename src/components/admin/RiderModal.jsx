import React, { useState, useRef, useEffect } from 'react';
import {
    X,
    Bike,
    Calendar,
    Phone,
    Mail,
    MapPin,
    Clock,
    CheckCircle2,
    AlertTriangle,
    Navigation,
    ShoppingBag,
    History,
    ChevronRight,
    Search,
    Loader2,
    Trash2,
    ShieldAlert,
    ChevronDown
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/api';
import { useAuthStore } from '../../store/useAuthStore';
import { toast } from 'sonner';
import { formatName, capitalizeFirst, formatPlate, formatDate, getInitials } from '../../utils/formatters';
import { WalletCustomDateModal } from './wallet/WalletControls';

const ConfirmationModal = ({ isOpen, onClose, type, onConfirm }) => {
    const [reason, setReason] = useState('');
    const [otherReason, setOtherReason] = useState('');
    const [showReasons, setShowReasons] = useState(false);
    const dropdownRef = useRef(null);

    const reasons = [
        'Policy violation',
        'Misconduct on delivery',
        'Late deliveries/No-shows',
        'App manipulation',
        'Customer complaints',
        'Other'
    ];

    const isReasonValid = reason !== 'Other' || otherReason.trim().length > 0;

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

    const isRestore = type === 'restore';
    const isDelete = type === 'delete';

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-fade-in" onClick={onClose} />
            <div className="relative bg-white rounded-[2rem] w-full max-w-sm overflow-hidden shadow-2xl animate-fade-in transition-all duration-300">
                <div className="p-6 flex flex-col items-center text-center">
                    <div className="flex justify-between w-full mb-4">
                        <span className="text-sm font-bold text-zinc-900 capitalize">{isRestore ? 'Restore' : type} account</span>
                        <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {isRestore ? (
                        <>
                            <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mb-6">
                                <CheckCircle2 size={40} className="text-emerald-600" />
                            </div>
                            <h3 className="text-xl font-bold text-zinc-900 mb-2">Restore Rider Account</h3>
                            <p className="text-xs text-zinc-400 font-medium leading-relaxed mb-8 px-4">
                                This removes the suspension. It does not verify the Rider or put them online.
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
                                {isDelete ? 'Delete Rider Account' : 'Suspend Rider Account'}
                            </h3>
                            <p className="text-xs text-zinc-500 font-bold text-center mb-6 max-w-[200px]">
                                {isDelete
                                    ? 'Rider access and sessions will be deleted and assigned orders unassigned. Historical orders will remain.'
                                    : 'This suspends the Rider and invalidates active sessions. Existing order statuses are not changed.'}
                            </p>

                            {!isDelete && (
                                <div className="w-full text-left space-y-4 mb-8">
                                    <div>
                                            <label className="text-xs font-bold text-zinc-900 mb-2 block tracking-tight">Suspension reason (optional)</label>
                                        <div className="relative" ref={dropdownRef}>
                                            <button
                                                type="button"
                                                onClick={() => setShowReasons(!showReasons)}
                                                className="w-full flex items-center justify-between px-4 py-4 bg-white border border-zinc-100 rounded-2xl text-xs font-medium text-zinc-400 hover:bg-zinc-50 transition-all"
                                            >
                                                <span>{reason || 'Select Reason'}</span>
                                                <ChevronDown size={18} className={`transition-transform duration-300 ${showReasons ? 'rotate-180' : ''}`} />
                                            </button>

                                            {showReasons && (
                                                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-zinc-100 rounded-2xl shadow-xl z-20 overflow-y-auto max-h-48 py-1 custom-scrollbar">
                                                    {reasons.map((r) => (
                                                        <button
                                                            key={r}
                                                            type="button"
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
                                            placeholder="Provide details for other reason..."
                                            className="w-full px-4 py-4 bg-white border border-zinc-100 rounded-2xl text-xs font-medium text-zinc-700 focus:ring-1 focus:ring-rose-500/20 outline-none h-24 resize-none transition-all"
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
                            disabled={!isRestore && !isDelete && !isReasonValid}
                            className={`flex-1 py-4 text-white text-sm font-bold rounded-3xl transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${isRestore
                                    ? 'bg-emerald-800 hover:bg-emerald-900 shadow-emerald-900/10'
                                    : 'bg-rose-600 hover:bg-rose-700 shadow-rose-900/10'
                            }`}
                        >
                            {isRestore ? 'Restore' : (isDelete ? 'Delete' : 'Suspend')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FilterDropdown = ({ selected, onSelect, options = ['today', 'last7days', 'last30days', 'thisMonth', 'lastMonth'] }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const labels = {
        'all': 'All time',
        'today': 'Today',
        'yesterday': 'Yesterday',
        'last7days': 'Last 7 Days',
        'last30days': 'Last 30 Days',
        'thisMonth': 'This Month',
        'lastMonth': 'Last Month',
        'custom': 'Custom dates',
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
                className="flex items-center gap-2 px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-xl text-[10px] font-bold text-zinc-600 group hover:bg-zinc-100 transition-all outline-none"
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

const RiderModal = ({ isOpen, onClose, rider, variant = 'full', profileLoading = false, profileError = '' }) => {
    const isDashboard = variant === 'dashboard';
    const token = useAuthStore((state) => state.accessToken);
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('overview');
    const [filter, setFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [customDates, setCustomDates] = useState({ start: '', end: '' });
    const [draftCustomDates, setDraftCustomDates] = useState({ start: '', end: '' });
    const [isCustomDateOpen, setIsCustomDateOpen] = useState(false);
    
    // Custom Confirmation Modal State
    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmType, setConfirmType] = useState(''); // 'suspend', 'restore', 'delete'

    // Robust ID detection: check top-level, nested, and common variants
    const riderData = rider?.rider || rider;
    const riderId = riderData?.id || riderData?._id || riderData?.riderId || riderData?.uid || riderData?.rider_id || rider?.id || rider?._id;

    // Fetch Overview Data
    const overviewParams = new URLSearchParams({ filter });
    if (filter === 'custom' && customDates.start && customDates.end) {
        overviewParams.set('from', customDates.start);
        overviewParams.set('to', customDates.end);
    }
    const overviewQuery = useQuery({
        queryKey: ['rider-overview', riderId, filter, customDates.start, customDates.end],
        queryFn: () => api.get(`/superadmin/riders/${riderId}/overview?${overviewParams}`, token),
        enabled: !!isOpen && !!riderId && activeTab === 'overview'
    });

    // Fetch Deliveries Data
    const deliveriesParams = new URLSearchParams({ filter, page: String(page) });
    if (filter === 'custom' && customDates.start && customDates.end) {
        deliveriesParams.set('from', customDates.start);
        deliveriesParams.set('to', customDates.end);
    }
    const deliveriesQuery = useQuery({
        queryKey: ['rider-deliveries', riderId, filter, page, customDates.start, customDates.end],
        queryFn: () => api.get(`/superadmin/riders/${riderId}/deliveries?${deliveriesParams}`, token),
        enabled: !!isOpen && !!riderId && activeTab === 'deliveries'
    });
    const overviewData = overviewQuery.data;
    const deliveriesData = deliveriesQuery.data;
    const isLoadingOverview = overviewQuery.isLoading;
    const isLoadingDeliveries = deliveriesQuery.isLoading;
    const dateFilterOptions = ['all', 'today', 'yesterday', 'last7days', 'last30days', 'thisMonth', 'lastMonth', 'custom'];

    // Suspension Mutation
    const suspensionMutation = useMutation({
        mutationFn: (data) => api.patch(`/superadmin/riders/${riderId}/suspension`, data, token),
        onSuccess: (res) => {
            toast.success(res.message || 'Rider status updated');
            queryClient.invalidateQueries({ queryKey: ['riders'] });
            queryClient.invalidateQueries({ queryKey: ['riders-search'] });
            queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
            queryClient.invalidateQueries({ queryKey: ['rider-overview', riderId] });
        },
        onError: (err) => toast.error(err.message || 'Failed to update Rider suspension status.'),
    });

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: () => api.delete('/superadmin/riders', { riderId: riderId }, token),
        onSuccess: (res) => {
            toast.success(res.message || 'Rider deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['riders'] });
            queryClient.invalidateQueries({ queryKey: ['riders-search'] });
            queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
            queryClient.invalidateQueries({ queryKey: ['rider-order-pool'] });
            onClose();
        },
        onError: (err) => toast.error(err.message || 'Failed to delete Rider.'),
    });

    if (!isOpen || !rider) return null;

    const overview = overviewData?.data;
    const metrics = overview?.metrics;
    const profileSummary = overview?.summary;
    const overviewShapeValid = Boolean(overview?.rider && overview?.metrics && overview?.summary);
    const riderInfo = overview?.rider || rider;
    
    // Derive suspension status with proper fallbacks
    const derivedStatus = (riderInfo.status || rider.status || '').toUpperCase();
    const isSuspended = overview?.isSuspended ?? riderInfo.isSuspended ?? rider.isSuspended ?? (derivedStatus === 'SUSPENDED');
    const isPending = derivedStatus === 'PENDING';
    const riderStatusLabel = isSuspended ? 'Suspended' : ({
        PENDING: 'Pending', ACTIVE: 'Active', INACTIVE: 'Inactive', ON_DELIVERY: 'Out for Delivery', RIDER_ACCEPTED: 'Accepted',
    }[derivedStatus] || 'Not provided');
    
    const deliveries = deliveriesData?.data?.orders;
    const deliveriesShapeValid = Array.isArray(deliveries)
        && Number.isFinite(deliveriesData?.data?.total)
        && Number.isFinite(deliveriesData?.data?.pageSize);

    const handleDateFilter = (value) => {
        if (value === 'custom') {
            setDraftCustomDates(customDates);
            setIsCustomDateOpen(true);
            return;
        }
        setFilter(value);
        setPage(1);
    };

    const handleActionClick = (type) => {
        setConfirmType(type);
        setShowConfirm(true);
    };

    const handleConfirmAction = (data) => {
        if (confirmType === 'delete') {
            deleteMutation.mutate();
        } else {
            const reason = data?.reason === 'Other' ? data?.otherReason?.trim() : data?.reason?.trim();
            suspensionMutation.mutate(confirmType === 'suspend'
                ? { suspend: true, ...(reason ? { reason } : {}) }
                : { suspend: false });
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            <div
                className={`absolute inset-0 bg-black/50 transition-opacity duration-300 animate-fade-in`}
                onClick={onClose}
            />

            <div className="relative flex h-full w-full max-w-xl animate-slide-in flex-col overflow-hidden bg-white shadow-2xl">
                {/* Header */}
                <div className="flex shrink-0 items-center justify-between gap-4 border-b border-white/10 bg-[#0F172B] px-5 py-5 sm:px-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-emerald-200/20 bg-emerald-400/10 text-sm font-bold text-emerald-300">
                            {getInitials(riderInfo.name)}
                        </div>
                        <div className="min-w-0">
                            <h2 className="truncate text-base font-bold text-white">{riderInfo.name ? formatName(riderInfo.name) : 'Rider profile'}</h2>
                            <p className="mt-1 truncate text-xs text-slate-300">{riderInfo.phone || riderInfo.phonenumber || riderId?.substring(0, 12) || 'Rider details'}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="Close rider details"
                        className="shrink-0 rounded-lg p-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                    >
                        <X size={18} />
                    </button>
                </div>

                {!isDashboard && (
                    <div className="flex shrink-0 items-center justify-between gap-3 border-b border-zinc-200 bg-white px-5 py-3 sm:px-6">
                        <div className="inline-flex gap-1 rounded-xl bg-zinc-100 p-1">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all ${activeTab === 'overview'
                                        ? 'bg-white text-emerald-900 shadow-sm'
                                        : 'text-zinc-500 hover:text-zinc-800'
                                    }`}
                            >
                                Overview
                            </button>
                            <button
                                onClick={() => setActiveTab('deliveries')}
                                className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all ${activeTab === 'deliveries'
                                        ? 'bg-white text-emerald-900 shadow-sm'
                                        : 'text-zinc-500 hover:text-zinc-800'
                                    }`}
                            >
                                Deliveries
                            </button>
                        </div>
                        <FilterDropdown 
                            selected={filter} 
                            onSelect={handleDateFilter}
                            options={dateFilterOptions}
                        />
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 space-y-5 overflow-y-auto bg-zinc-50/70 p-4 custom-scrollbar sm:p-5">
                    {profileLoading ? (
                        <div role="status" className="flex min-h-64 flex-col items-center justify-center text-center">
                            <Loader2 className="animate-spin text-emerald-700" size={28} />
                            <p className="mt-3 text-sm font-semibold text-zinc-800">Loading rider profile</p>
                            <p className="mt-1 max-w-xs text-xs leading-5 text-zinc-500">Getting the full Rider record used by the Rider directory.</p>
                        </div>
                    ) : (
                    <>
                    {profileError && <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900">{profileError} Some profile information may be unavailable here.</div>}
                    {activeTab === 'overview' ? (
                        <>
                            {(overviewQuery.isError || (!isLoadingOverview && !overviewShapeValid)) && (
                                <div role="alert" className="flex items-start justify-between gap-3 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-xs text-rose-700">
                                    <span>{overviewQuery.error?.message || 'Unexpected Rider overview response. Please retry.'}</span>
                                    <button type="button" onClick={() => overviewQuery.refetch()} className="shrink-0 font-bold underline">Retry</button>
                                </div>
                            )}
                             {/* Stats Grid */}
                            <div className="relative grid grid-cols-2 gap-3 sm:grid-cols-3">
                                {isLoadingOverview && (
                                    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/75 backdrop-blur-[1px]">
                                        <Loader2 className="animate-spin text-emerald-600" size={24} />
                                    </div>
                                )}
                                <div className="rounded-xl border border-zinc-200 bg-white p-3.5">
                                    <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-800"><ShoppingBag size={15} /></div>
                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Orders assigned</p>
                                    <h4 className="mt-1 text-lg font-bold text-zinc-900">{Number.isFinite(profileSummary?.totalOrders) ? profileSummary.totalOrders : '—'}</h4>
                                </div>
                                <div className="rounded-xl border border-zinc-200 bg-white p-3.5">
                                    <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-800"><CheckCircle2 size={15} /></div>
                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Delivered orders</p>
                                    <h4 className="mt-1 text-lg font-bold text-zinc-900">{Number.isFinite(metrics?.completedOrders) ? metrics.completedOrders : '—'}</h4>
                                </div>
                                <div className="rounded-xl border border-zinc-200 bg-white p-3.5">
                                    <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-700"><X size={15} /></div>
                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Cancelled orders</p>
                                    <h4 className="mt-1 text-lg font-bold text-zinc-900">{Number.isFinite(metrics?.cancelledOrders) ? metrics.cancelledOrders : '—'}</h4>
                                </div>
                                <div className="rounded-xl border border-zinc-200 bg-white p-3.5">
                                    <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-700"><Navigation size={15} /></div>
                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Distance completed</p>
                                    <h4 className="mt-1 text-lg font-bold text-zinc-900">{Number.isFinite(metrics?.totalKm) ? `${metrics.totalKm.toFixed(2)} km` : '—'}</h4>
                                </div>
                                <div className="rounded-xl border border-zinc-200 bg-white p-3.5">
                                    <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700"><Bike size={15} /></div>
                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Average per delivery</p>
                                    <h4 className="mt-1 text-lg font-bold text-zinc-900">{Number.isFinite(metrics?.avgKmPerOrder) ? `${metrics.avgKmPerOrder.toFixed(2)} km` : '—'}</h4>
                                </div>
                            </div>

                            {/* Rider Details */}
                            <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
                                <div className="flex items-center justify-between gap-3 border-b border-zinc-100 px-4 py-3.5">
                                    <div><h3 className="text-sm font-bold text-zinc-900">Rider details</h3><p className="mt-0.5 text-[11px] text-zinc-500">Profile and vehicle information</p></div>
                                    <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${isSuspended ? 'bg-rose-50 text-rose-700 border-rose-200' : isPending ? 'bg-zinc-100 text-zinc-600 border-zinc-200' : derivedStatus === 'INACTIVE' ? 'bg-amber-50 text-amber-800 border-amber-200' : derivedStatus === 'ON_DELIVERY' ? 'bg-blue-50 text-blue-800 border-blue-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'}`}>
                                        {riderStatusLabel}
                                    </span>
                                </div>

                                 <div className="relative grid grid-cols-1 gap-2 p-3 sm:grid-cols-2">
                                    {isLoadingOverview && (
                                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/75 backdrop-blur-[1px]">
                                            <Loader2 className="animate-spin text-emerald-600" size={24} />
                                        </div>
                                    )}
                                    {[
                                        ['Rider name', riderInfo.name ? formatName(riderInfo.name) : 'Not provided'],
                                        ['Phone', riderInfo.phone || riderInfo.phonenumber || 'Not provided'],
                                        ['Email', riderInfo.email || 'Not provided'],
                                        ['Vehicle', riderInfo.vehicleName ? capitalizeFirst(riderInfo.vehicleName) : 'Not provided'],
                                        ['Vehicle plate', riderInfo.vehiclePlate ? formatPlate(riderInfo.vehiclePlate) : 'Not provided'],
                                        ['Address', riderInfo.address || 'Not provided'],
                                        ['Date joined', formatDate(riderInfo.joinedAt || riderInfo.createdAt)],
                                    ].map(([label, value]) => <div key={label} className="min-w-0 rounded-lg bg-zinc-50 px-3 py-2.5">
                                        <p className="text-[9px] font-semibold uppercase tracking-wide text-zinc-500">{label}</p>
                                        <p className={`mt-1 break-words text-xs font-semibold text-zinc-900 ${label === 'Email' ? 'lowercase' : ''}`}>{value}</p>
                                    </div>)}
                                </div>
                            </section>
                        </>
                    ) : (
                         <div className="relative">
                            {isLoadingDeliveries ? (
                                <div className="py-16 text-center"><Loader2 className="mx-auto animate-spin text-emerald-600" size={28} /><p className="mt-2 text-xs text-zinc-500">Loading deliveries…</p></div>
                            ) : deliveriesQuery.isError || !deliveriesShapeValid ? (
                                <div role="alert" className="py-14 text-center">
                                    <p className="mb-3 text-sm text-rose-600">{deliveriesQuery.error?.message || 'Unexpected deliveries response. Please retry.'}</p>
                                    <button type="button" onClick={() => deliveriesQuery.refetch()} className="rounded-lg bg-emerald-800 px-4 py-2 text-xs font-semibold text-white">Retry</button>
                                </div>
                            ) : deliveries.length === 0 ? (
                                <div className="py-20 text-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest">No delivery records found</div>
                            ) : (
                                <div className="space-y-2">
                                    {deliveries.map((delivery, i) => (
                                        <div key={delivery.id || delivery.orderId || delivery.code || i} className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-1 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 transition-colors hover:bg-zinc-50/70">
                                            <div className="col-span-2 flex items-center justify-between gap-3">
                                                <div>
                                                    <h5 className="text-[11px] font-bold text-zinc-900">{delivery.code || 'N/A'}</h5>
                                                    <p className="text-[9px] text-zinc-500 font-medium">
                                                        {formatDate(delivery.deliveredAt || delivery.createdAt)} • {formatName(delivery.vendorStore)}
                                                    </p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-[8px] font-bold border uppercase tracking-tighter ${delivery.status === 'DELIVERED'
                                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                        : 'bg-rose-50 text-rose-600 border-rose-100'
                                                    }`}>
                                                    {delivery.status}
                                                </span>
                                            </div>
                                            <div className="col-span-2 space-y-1">
                                                <div className="flex gap-2 text-[9px]">
                                                    <div className="p-1 h-fit bg-emerald-100 rounded text-emerald-600 uppercase font-bold text-[7px] shrink-0">Pickup</div>
                                                    <p className="line-clamp-1 font-medium text-zinc-700">{delivery.pickup}</p>
                                                </div>
                                                <div className="flex gap-2 text-[9px]">
                                                    <div className="p-1 h-fit bg-indigo-100 rounded text-indigo-600 uppercase font-bold text-[7px] shrink-0">Dropoff</div>
                                                    <p className="line-clamp-1 font-medium text-zinc-700">{delivery.dropoff}</p>
                                                </div>
                                            </div>
                                            <div className="col-span-2 mt-0 text-right">
                                                <span className="text-[11px] font-bold text-zinc-900">{Number(delivery.distanceKm || 0).toFixed(2)} km</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {deliveriesShapeValid && deliveriesData.data.total > 20 && (
                                <div className="flex items-center justify-between border-t border-zinc-100 pt-4">
                                    <span className="text-[10px] text-zinc-500">Page {page} of {Math.ceil(deliveriesData.data.total / deliveriesData.data.pageSize)}</span>
                                    <div className="flex gap-2">
                                        <button type="button" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="rounded-lg bg-zinc-100 px-3 py-2 text-[10px] font-semibold text-zinc-600 disabled:opacity-50">Previous</button>
                                        <button type="button" disabled={page >= Math.ceil(deliveriesData.data.total / deliveriesData.data.pageSize)} onClick={() => setPage((value) => value + 1)} className="rounded-lg bg-zinc-100 px-3 py-2 text-[10px] font-semibold text-zinc-600 disabled:opacity-50">Next</button>
                                    </div>
                                </div>
                            )}
                        </div>

                    )}
                    </>
                    )}
                </div>

                {/* Footer Actions */}
                {!isDashboard && (
                    <div className="shrink-0 border-t border-zinc-200 bg-white px-4 py-4 sm:px-5">
                        <div className="grid grid-cols-2 gap-3">
                            <button 
                                onClick={() => handleActionClick('delete')}
                                disabled={deleteMutation.isPending}
                                className="flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-3 text-xs font-semibold text-rose-700 transition-colors hover:border-rose-300 hover:bg-rose-50 disabled:opacity-50"
                            >
                                {deleteMutation.isPending ? <Loader2 className="animate-spin" size={14} /> : <><Trash2 size={14} /> Delete account</>}
                            </button>
                            <button 
                                onClick={() => handleActionClick(isSuspended ? 'restore' : 'suspend')}
                                disabled={suspensionMutation.isPending}
                                className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-semibold transition-colors disabled:opacity-50 ${
                                    isSuspended 
                                        ? 'bg-emerald-800 text-white hover:bg-emerald-900'
                                        : 'bg-rose-600 text-white hover:bg-rose-700'
                                }`}
                            >
                                {suspensionMutation.isPending ? (
                                    <Loader2 className="animate-spin" size={14} />
                                ) : (
                                    <>
                                        {isSuspended ? <ShieldAlert size={14} /> : <AlertTriangle size={14} />}
                                        {isSuspended ? 'Restore' : 'Suspend'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <ConfirmationModal
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                type={confirmType}
                rider={rider}
                onConfirm={handleConfirmAction}
            />
            <WalletCustomDateModal
                isOpen={isCustomDateOpen}
                dates={draftCustomDates}
                onDatesChange={setDraftCustomDates}
                onClose={() => setIsCustomDateOpen(false)}
                onApply={(dates) => {
                    setCustomDates(dates);
                    setFilter('custom');
                    setPage(1);
                    setIsCustomDateOpen(false);
                }}
            />
        </div>
    );
};

export default RiderModal;
