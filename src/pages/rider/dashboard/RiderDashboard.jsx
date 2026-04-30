import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Loader2, AlertCircle } from 'lucide-react';
import offline from '../../../assets/images/offline.png';
import RiderHeader from '../../../components/rider/RiderHeader';
import api from '../../../api/api';
import { useAuthStore } from '../../../store/useAuthStore';
import { useRiderStore } from '../../../store/useRiderStore';

const RiderDashboard = () => {
    const navigate = useNavigate();
    const token = useAuthStore((state) => state.accessToken);

    // Persisted global rider state
    const isOnline = useRiderStore((state) => state.isOnline);
    const setOnline = useRiderStore((state) => state.setOnline);
    const activeOrdersCount = useRiderStore((state) => state.activeOrdersCount);
    const deliveredOrdersCount = useRiderStore((state) => state.deliveredOrdersCount);
    const setCounts = useRiderStore((state) => state.setCounts);

    const [isToggling, setIsToggling] = useState(false);

    // Filter state — client-side only (API rejects UUIDs >20 chars)
    const [filter, setFilter] = useState('All');
    const [shopTypes, setShopTypes] = useState([]);

    const [showAcceptModal, setShowAcceptModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isAccepting, setIsAccepting] = useState(false);

    // All orders fetched from API; displayed list is filtered client-side
    const [allOrders, setAllOrders] = useState([]);
    const [meta, setMeta] = useState(null);
    const [page, setPage] = useState(1);
    const [isLoadingOrders, setIsLoadingOrders] = useState(false);

    const [toast, setToast] = useState(null);

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 4000);
    };

    // Fetch order counts
    const fetchCounts = useCallback(async () => {
        try {
            const res = await api.get('/rider/orders/counts', token);
            if (res?.data) setCounts(res.data);
        } catch (_) {}
    }, [token, setCounts]);

    useEffect(() => {
        fetchCounts();
    }, [fetchCounts]);

    // Fetch available orders — NO shopTypeId param (API rejects UUIDs >20 chars)
    const fetchAvailableOrders = useCallback(async () => {
        if (!isOnline) return;
        setIsLoadingOrders(true);
        try {
            const params = new URLSearchParams({ page });
            const res = await api.get(`/rider/orders/available?${params.toString()}`, token);
            if (res?.data) {
                const orders = res.data.data || [];
                setAllOrders(orders);
                setMeta(res.data.meta || null);

                // Build shop type pills from fresh data (first page only)
                if (page === 1) {
                    const seen = new Map();
                    orders.forEach(o => {
                        if (o.shopType && !seen.has(o.shopType)) {
                            seen.set(o.shopType, o.shopType);
                        }
                    });
                    setShopTypes([...seen.keys()]);
                }
            }
        } catch (err) {
            showToast(err.message || 'Failed to fetch orders');
        } finally {
            setIsLoadingOrders(false);
        }
    }, [isOnline, page, token]);

    useEffect(() => {
        fetchAvailableOrders();
    }, [fetchAvailableOrders]);

    // Client-side filter
    const displayedOrders = filter === 'All'
        ? allOrders
        : allOrders.filter(o => o.shopType === filter);

    const handleToggleStatus = async () => {
        if (isToggling) return;
        setIsToggling(true);
        const newStatus = isOnline ? 'inActive' : 'Active';
        try {
            await api.patch('/rider/status', { status: newStatus }, token);
            setOnline(!isOnline);
            if (isOnline) {
                // Going offline — clear orders
                setAllOrders([]);
                setMeta(null);
                setFilter('All');
                setShopTypes([]);
            } else {
                setPage(1);
            }
        } catch (err) {
            showToast(err.message || 'Could not update status');
        } finally {
            setIsToggling(false);
        }
    };

    const handleAcceptOrder = async () => {
        if (!selectedOrder || isAccepting) return;
        setIsAccepting(true);
        try {
            await api.post(`/rider/orders/${selectedOrder.orderId}/accept`, {}, token);
            setShowAcceptModal(false);
            await fetchCounts();
            navigate(`/rider/app/active-order/${selectedOrder.orderId}`);
        } catch (err) {
            setShowAcceptModal(false);
            showToast(err.message || 'Could not accept order');
        } finally {
            setIsAccepting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F9FCF9] flex flex-col font-sans">
            <RiderHeader
                activeTab="Available"
                activeCount={activeOrdersCount}
                historyCount={deliveredOrdersCount}
            />

            <div className="flex-1 px-4 py-6 overflow-y-auto">
                {/* Availability Toggle */}
                <div className="bg-white rounded-[24px] p-5 shadow-sm mb-6 flex items-center justify-between border border-zinc-100">
                    <div>
                        <h3 className="text-[15px] font-bold text-zinc-900 mb-0.5">Availability</h3>
                        <p className="text-[12px] text-zinc-600 font-medium">
                            {isOnline ? "You're online. Receiving orders." : 'Go online to start receiving orders.'}
                        </p>
                    </div>
                    <button
                        onClick={handleToggleStatus}
                        disabled={isToggling}
                        className={`w-15 h-9 rounded-full relative transition-colors duration-300 ${isOnline ? 'bg-[#1C5E20]' : 'bg-zinc-400'} ${isToggling ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                        {isToggling ? (
                            <Loader2 size={16} className="absolute inset-0 m-auto text-white animate-spin" />
                        ) : (
                            <div className={`absolute top-1 w-7 h-7 rounded-full bg-white shadow-sm transition-all duration-300 ${isOnline ? 'translate-x-7' : 'translate-x-1'}`} />
                        )}
                    </button>
                </div>

                {/* Shop Type Filter Pills — shown only when online & there's data */}
                {isOnline && shopTypes.length > 0 && (
                    <div className="flex gap-2.5 mb-8 overflow-x-auto no-scrollbar py-1">
                        {['All', ...shopTypes].map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilter(cat)}
                                className={`px-6 py-3 rounded-full text-[14px] font-bold whitespace-nowrap shrink-0 transition-colors ${filter === cat
                                    ? 'bg-[#1C5E20] text-white shadow-md'
                                    : 'bg-[#F1F4F1] text-zinc-500 hover:bg-zinc-200'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                )}

                {/* Content */}
                {!isOnline ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center px-10">
                        <div className="w-24 h-24 bg-zinc-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                            <img src={offline} alt="Offline" />
                        </div>
                        <h2 className="text-[17px] font-bold text-zinc-600 mb-2">You're offline.</h2>
                        <p className="text-[14px] text-zinc-400 font-medium leading-relaxed">
                            Turn on availability to receive jobs.
                        </p>
                    </div>
                ) : isLoadingOrders ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 size={32} className="text-[#1C5E20] animate-spin mb-3" />
                        <p className="text-[13px] font-medium text-zinc-400">Fetching available orders...</p>
                    </div>
                ) : displayedOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center px-10">
                        <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
                            <span className="text-2xl">📦</span>
                        </div>
                        <h2 className="text-[15px] font-bold text-zinc-500 mb-1">
                            {filter === 'All' ? 'No orders available' : `No ${filter} orders`}
                        </h2>
                        <p className="text-[13px] text-zinc-400 font-medium">Check back shortly for new pickups.</p>
                    </div>
                ) : (
                    <div className="space-y-4 pb-12">
                        {displayedOrders.map((order) => (
                            <div key={order.orderId} className="bg-white rounded-xl p-6 border border-zinc-100 shadow-sm">
                                <p className="text-[11px] font-bold text-zinc-400 mb-1">{order.orderId}</p>
                                <p className="text-[13px] font-semibold text-zinc-800">{order.shopType}</p>
                                <h3 className="text-[20px] font-bold text-[#1C5E20] leading-tight mt-1 mb-1">{order.vendorStoreName}</h3>
                                <p className="text-[14px] text-zinc-500 font-medium mb-1">{order.storeAddress}</p>
                                <p className="text-[13px] font-medium text-zinc-400 mb-1">
                                    Items: <span className="text-zinc-600">{order.itemsString}</span>
                                </p>
                                <p className="text-[13px] font-medium text-zinc-400 mb-6">
                                    Drop-off: <span className="text-zinc-600">{order.deliveryAddress}</span>
                                </p>

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => navigate(`/rider/app/order/details/${order.orderId}`)}
                                        className="flex-1 bg-[#F1F4F1] text-[#1C5E20] font-medium py-4 rounded-xl text-[14px] transition-colors hover:bg-zinc-200 active:scale-[0.98]"
                                    >
                                        View order
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedOrder(order);
                                            setShowAcceptModal(true);
                                        }}
                                        className="flex-1 bg-[#1C5E20] text-white font-medium py-4 rounded-xl text-[14px] transition-all hover:bg-[#144416] shadow-md shadow-[#1C5E20]/20 active:scale-[0.98]"
                                    >
                                        Accept pick up
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* Pagination */}
                        {meta && meta.totalPages > 1 && (
                            <div className="flex items-center justify-between pt-2 pb-4">
                                <button
                                    disabled={page === 1}
                                    onClick={() => { setPage(p => p - 1); setFilter('All'); }}
                                    className="px-5 py-2.5 rounded-full bg-white border border-zinc-200 text-[13px] font-bold text-zinc-600 disabled:opacity-40 shadow-sm"
                                >
                                    ← Prev
                                </button>
                                <span className="text-[12px] text-zinc-400 font-medium">
                                    Page {meta.page} of {meta.totalPages}
                                </span>
                                <button
                                    disabled={!meta.hasNextPage}
                                    onClick={() => { setPage(p => p + 1); setFilter('All'); }}
                                    className="px-5 py-2.5 rounded-full bg-white border border-zinc-200 text-[13px] font-bold text-zinc-600 disabled:opacity-40 shadow-sm"
                                >
                                    Next →
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Toast */}
            {toast && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] w-[90%] max-w-sm animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3 shadow-lg">
                        <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white shrink-0">
                            <AlertCircle size={16} />
                        </div>
                        <p className="text-[13px] font-bold text-red-900 flex-1">{toast}</p>
                    </div>
                </div>
            )}

            {/* Accept Pickup Modal */}
            {showAcceptModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-8">
                    <div className="bg-white w-full max-w-xs rounded-[40px] p-8 text-center shadow-2xl relative animate-in fade-in zoom-in duration-300">
                        <h2 className="text-[20px] font-medium text-[#1C5E20] mb-2">Accept Pickup</h2>
                        <p className="text-sm text-zinc-500 mb-2 font-medium px-4 leading-relaxed">
                            Accepting means you're available for this order.
                        </p>
                        {selectedOrder && (
                            <p className="text-[13px] font-bold text-zinc-700 mb-8 px-2">
                                {selectedOrder.vendorStoreName} — {selectedOrder.itemsString}
                            </p>
                        )}

                        <div className="space-y-6">
                            <button
                                onClick={handleAcceptOrder}
                                disabled={isAccepting}
                                className="w-full bg-[#1C5E20] text-white font-bold py-4 rounded-xl transition-all active:scale-[0.98] text-[15px] disabled:opacity-60 flex items-center justify-center gap-2"
                            >
                                {isAccepting ? <><Loader2 size={18} className="animate-spin" /> Accepting...</> : 'Yes, Accept'}
                            </button>
                            <button
                                onClick={() => setShowAcceptModal(false)}
                                className="flex items-center justify-center gap-1 text-red-500 font-bold mx-auto text-[14px]"
                            >
                                <X size={16} />
                                No
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RiderDashboard;
