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

const ConfirmationModal = ({ isOpen, onClose, type, rider, onConfirm }) => {
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

    const isActivate = type === 'activate' || type === 'unsuspend';
    const isDelete = type === 'delete';

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-fade-in" onClick={onClose} />
            <div className="relative bg-white rounded-[2rem] w-full max-w-sm overflow-hidden shadow-2xl animate-fade-in transition-all duration-300">
                <div className="p-6 flex flex-col items-center text-center">
                    <div className="flex justify-between w-full mb-4">
                        <span className="text-sm font-bold text-zinc-900 capitalize">{isActivate ? 'Activate' : type} account</span>
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
                                This will allow the rider to access the platform and start receiving orders again.
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
                                    ? 'This action is PERMANENT and will remove all rider data from the system.' 
                                    : 'This will temporarily make this account inactive and restrict access to the platform.'}
                            </p>

                            {!isDelete && (
                                <div className="w-full text-left space-y-4 mb-8">
                                    <div>
                                        <label className="text-xs font-bold text-zinc-900 mb-2 block tracking-tight">Suspension Reason *</label>
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
                            disabled={!isActivate && !isDelete && !isReasonValid}
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

const FilterDropdown = ({ selected, onSelect, options = ['today', 'last7days', 'last30days', 'thisMonth', 'lastMonth'] }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const labels = {
        'today': 'Today',
        'last7days': 'Last 7 Days',
        'last30days': 'Last 30 Days',
        'thisMonth': 'This Month',
        'lastMonth': 'Last Month'
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

const RiderModal = ({ isOpen, onClose, rider, variant = 'full' }) => {
    const isDashboard = variant === 'dashboard';
    const token = useAuthStore((state) => state.accessToken);
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('overview');
    const [filter, setFilter] = useState('last7days');
    const [page, setPage] = useState(1);
    
    // Custom Confirmation Modal State
    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmType, setConfirmType] = useState(''); // 'suspend', 'activate', 'delete'

    // Robust ID detection: check top-level, nested, and common variants
    const riderData = rider?.rider || rider;
    const riderId = riderData?.id || riderData?._id || riderData?.riderId || riderData?.uid || riderData?.rider_id || rider?.id || rider?._id;

    // Fetch Overview Data
    const { data: overviewData, isLoading: isLoadingOverview } = useQuery({
        queryKey: ['rider-overview', riderId, filter],
        queryFn: () => api.get(`/superadmin/riders/${riderId}/overview?filter=${filter}`, token),
        enabled: !!isOpen && !!riderId && activeTab === 'overview'
    });

    // Fetch Deliveries Data
    const { data: deliveriesData, isLoading: isLoadingDeliveries } = useQuery({
        queryKey: ['rider-deliveries', riderId, page],
        queryFn: () => api.get(`/superadmin/riders/${riderId}/deliveries?page=${page}`, token),
        enabled: !!isOpen && !!riderId && activeTab === 'deliveries'
    });

    // Suspension Mutation
    const suspensionMutation = useMutation({
        mutationFn: (data) => api.patch(`/superadmin/riders/${riderId}/suspension`, data, token),
        onSuccess: (res) => {
            toast.success(res.message || 'Rider status updated');
            queryClient.invalidateQueries({ queryKey: ['riders'] });
            queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
            queryClient.invalidateQueries({ queryKey: ['rider-overview', riderId] });
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Failed to update suspension');
        }
    });

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: () => api.delete('/superadmin/riders', { riderId: riderId }, token),
        onSuccess: (res) => {
            toast.success(res.message || 'Rider deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['riders'] });
            queryClient.invalidateQueries({ queryKey: ['adminDashboard'] });
            onClose();
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Failed to delete rider');
        }
    });

    if (!isOpen || !rider) return null;

    const overview = overviewData?.data || {};
    const metrics = overview.metrics || { totalKm: 0, completedOrders: 0, cancelledOrders: 0, avgKmPerOrder: 0 };
    const summary = overview.summary || { totalOrders: 0, deliveredOrders: 0, cancelledOrders: 0 };
    const riderInfo = overview.rider || rider;
    
    // Derive suspension status with proper fallbacks
    const derivedStatus = (overview.status || riderInfo.status || rider.status || '').toUpperCase();
    const isSuspended = overview.isSuspended ?? riderInfo.isSuspended ?? rider.isSuspended ?? (derivedStatus === 'SUSPENDED');
    const isPending = derivedStatus === 'PENDING';
    
    const deliveries = deliveriesData?.data?.orders || [];

    const handleActionClick = (type) => {
        setConfirmType(type);
        setShowConfirm(true);
    };

    const handleConfirmAction = (data) => {
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
        <div className="fixed inset-0 z-[100] flex justify-end">
            <div
                className={`absolute inset-0 bg-black/50 transition-opacity duration-300 animate-fade-in`}
                onClick={onClose}
            />

            <div className={`relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-slide-in overflow-hidden`}>
                {/* Header */}
                <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-white shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">
                            {getInitials(riderInfo.name)}
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-zinc-900">{formatName(riderInfo.name)}</h2>
                            <p className="text-[10px] text-zinc-500 font-medium tracking-tight uppercase">{riderId?.substring(0, 8)}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-zinc-100 rounded-lg transition-colors text-zinc-400"
                    >
                        <X size={18} />
                    </button>
                </div>

                {!isDashboard && (
                    <div className="px-4 py-2 border-b border-zinc-100 flex items-center justify-between shrink-0">
                        <div className="flex gap-1 bg-zinc-100 p-0.5 rounded-3xl">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`px-6 py-2 rounded-3xl text-[11px] font-bold transition-all ${activeTab === 'overview'
                                        ? 'bg-emerald-800 text-white shadow-md'
                                        : 'text-zinc-500 hover:text-zinc-700'
                                    }`}
                            >
                                Overview
                            </button>
                            <button
                                onClick={() => setActiveTab('deliveries')}
                                className={`px-6 py-2 rounded-3xl text-[11px] font-bold transition-all ${activeTab === 'deliveries'
                                        ? 'bg-emerald-800 text-white shadow-md'
                                        : 'text-zinc-500 hover:text-zinc-700'
                                    }`}
                            >
                                Deliveries
                            </button>
                        </div>
                        <FilterDropdown 
                            selected={filter} 
                            onSelect={setFilter} 
                        />
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
                    {activeTab === 'overview' ? (
                        <>
                             {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-3 relative">
                                {isLoadingOverview && (
                                    <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center backdrop-blur-[1px]">
                                        <Loader2 className="animate-spin text-emerald-600" size={24} />
                                    </div>
                                )}
                                <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Total KM</p>
                                    <h4 className="text-base font-bold text-zinc-900">{Number(metrics.totalKm || 0).toFixed(2)} km</h4>
                                </div>
                                <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Completed Orders</p>
                                    <h4 className="text-base font-bold text-zinc-900">{metrics.completedOrders || 0}</h4>
                                </div>
                                <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1 text-rose-500">Cancelled</p>
                                    <h4 className="text-base font-bold text-zinc-900">{metrics.cancelledOrders || 0}</h4>
                                </div>
                                <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Avg KM / Order</p>
                                    <h4 className="text-base font-bold text-zinc-900">{Number(metrics.avgKmPerOrder || 0).toFixed(2)} km</h4>
                                </div>
                            </div>

                            {/* Rider Details */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs font-bold text-zinc-900 flex items-center gap-2">
                                        Details
                                    </h3>
                                    <span className={`px-3 py-1 rounded-full text-[9px] font-bold border uppercase tracking-tighter ${
                                        isSuspended 
                                            ? 'bg-rose-50 text-rose-600 border-rose-100' 
                                            : (isPending ? 'bg-zinc-100 text-zinc-500 border-zinc-200' : 'bg-emerald-50 text-emerald-600 border-emerald-100')
                                    }`}>
                                        {isSuspended ? 'Suspended' : (isPending ? 'Pending' : 'Active')}
                                    </span>
                                </div>

                                 <div className="grid grid-cols-2 gap-y-5 relative">
                                    {isLoadingOverview && (
                                        <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center backdrop-blur-[1px]">
                                            <Loader2 className="animate-spin text-emerald-600" size={24} />
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Rider Name</p>
                                        <p className="text-[11px] font-bold text-zinc-800">{formatName(riderInfo.name)}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Vehicle Name</p>
                                        <p className="text-[11px] font-bold text-zinc-800">{capitalizeFirst(riderInfo.vehicleName || 'N/A')}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Phone</p>
                                        <p className="text-[11px] font-bold text-zinc-800">{riderInfo.phone}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Vehicle Plate</p>
                                        <p className="text-[11px] font-bold text-zinc-800">{formatPlate(riderInfo.vehiclePlate || 'N/A')}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Email</p>
                                        <p className="text-[11px] font-bold text-zinc-800 lowercase">{riderInfo.email}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Address</p>
                                        <p className="text-[11px] font-bold text-zinc-800">{riderInfo.address || 'N/A'}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Date Joined</p>
                                        <p className="text-[11px] font-bold text-zinc-800">
                                            {formatDate(riderInfo.joinedAt || riderInfo.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                         <div className="space-y-6 relative">
                            {isLoadingDeliveries && (
                                <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center backdrop-blur-[1px]">
                                    <Loader2 className="animate-spin text-emerald-600" size={32} />
                                </div>
                            )}
                            {deliveries.length === 0 ? (
                                <div className="py-20 text-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest">No delivery records found</div>
                            ) : (
                                <div className="space-y-4">
                                    {deliveries.map((delivery, i) => (
                                        <div key={i} className="p-4 bg-zinc-50/50 rounded-2xl border border-zinc-100 hover:border-emerald-100 transition-colors group">
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <h5 className="text-[11px] font-bold text-zinc-900">{delivery.code}</h5>
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
                                            <div className="space-y-2">
                                                <div className="flex gap-2 text-[9px]">
                                                    <div className="p-1 h-fit bg-emerald-100 rounded text-emerald-600 uppercase font-bold text-[7px] shrink-0">Pickup</div>
                                                    <p className="font-bold text-zinc-700">{delivery.pickup}</p>
                                                </div>
                                                <div className="flex gap-2 text-[9px]">
                                                    <div className="p-1 h-fit bg-indigo-100 rounded text-indigo-600 uppercase font-bold text-[7px] shrink-0">Dropoff</div>
                                                    <p className="font-bold text-zinc-700">{delivery.dropoff}</p>
                                                </div>
                                            </div>
                                            <div className="mt-3 text-right">
                                                <span className="text-[11px] font-bold text-zinc-900">{Number(delivery.distanceKm || 0).toFixed(2)} km</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    )}
                </div>

                {/* Footer Actions */}
                {!isDashboard && (
                    <div className="p-5 border-t border-zinc-100 bg-zinc-50/50 shrink-0">
                        <div className="grid grid-cols-2 gap-3">
                            <button 
                                onClick={() => handleActionClick('delete')}
                                disabled={deleteMutation.isPending}
                                className="px-6 py-3 bg-white border border-rose-600 text-rose-600 rounded-2xl text-[11px] font-bold hover:bg-rose-50 transition-all flex items-center justify-center gap-2"
                            >
                                {deleteMutation.isPending ? <Loader2 className="animate-spin" size={14} /> : <><Trash2 size={14} /> Delete account</>}
                            </button>
                            <button 
                                onClick={() => handleActionClick(isSuspended ? 'activate' : 'suspend')}
                                disabled={suspensionMutation.isPending}
                                className={`px-6 py-3 rounded-2xl text-[11px] font-bold transition-all shadow-md flex items-center justify-center gap-2 ${
                                    isSuspended 
                                        ? 'bg-emerald-800 text-white hover:bg-emerald-900 shadow-emerald-900/10' 
                                        : 'bg-rose-600 text-white hover:bg-rose-700 shadow-rose-900/10'
                                }`}
                            >
                                {suspensionMutation.isPending ? (
                                    <Loader2 className="animate-spin" size={14} />
                                ) : (
                                    <>
                                        {isSuspended ? <ShieldAlert size={14} /> : <AlertTriangle size={14} />}
                                        {isSuspended ? 'Activate' : 'Suspend'}
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
        </div>
    );
};

export default RiderModal;
