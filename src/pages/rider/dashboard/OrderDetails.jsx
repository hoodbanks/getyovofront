import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Navigation, X, Loader2, AlertCircle } from 'lucide-react';
import RiderHeader from '../../../components/rider/RiderHeader';
import api from '../../../api/api';
import { useAuthStore } from '../../../store/useAuthStore';
import { useRiderStore } from '../../../store/useRiderStore';

const capitalize = (str) => {
    if (!str) return '';
    return str.split(/\s+/).map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
};

const OrderDetails = () => {
    const navigate = useNavigate();
    const { orderId } = useParams();
    const token = useAuthStore((state) => state.accessToken);
    const activeOrdersCount = useRiderStore((state) => state.activeOrdersCount);
    const deliveredOrdersCount = useRiderStore((state) => state.deliveredOrdersCount);

    const [orderData, setOrderData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showAcceptModal, setShowAcceptModal] = useState(false);
    const [isAccepting, setIsAccepting] = useState(false);
    const [toast, setToast] = useState(null);
    
    const [activeMapUrl, setActiveMapUrl] = useState('');
    const [mapType, setMapType] = useState('');
    const [isMapLoading, setIsMapLoading] = useState(false);

    const showToast = (message, type = 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    useEffect(() => {
        const fetchOrderDetails = async () => {
            if (!orderId) {
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            try {
                const res = await api.get(`/rider/orders/${orderId}`, token);
                if (res?.data) setOrderData(res.data);
            } catch (err) {
                showToast(err.message || 'Failed to load order details');
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrderDetails();
    }, [orderId, token]);

    const handleAcceptOrder = async () => {
        if (!orderId || isAccepting) return;
        setIsAccepting(true);
        try {
            await api.post(`/rider/orders/${orderId}/accept`, {}, token);
            setShowAcceptModal(false);
            navigate(`/rider/app/active-order/${orderId}`);
        } catch (err) {
            setShowAcceptModal(false);
            showToast(err.message || 'Could not accept order');
        } finally {
            setIsAccepting(false);
        }
    };

    const handleNavigateToStore = () => {
        setIsMapLoading(true);
        setMapType('store');
        navigator.geolocation.getCurrentPosition((position) => {
            const riderLat = position.coords.latitude;
            const riderLng = position.coords.longitude;
            const vendorLat = orderData.vendorLatitude;
            const vendorLng = orderData.vendorLongitude;
            const storeAddress = orderData.storeAddress;

            if (vendorLat && vendorLng) {
                setActiveMapUrl(`https://maps.google.com/maps?saddr=${riderLat},${riderLng}&daddr=${vendorLat},${vendorLng}&output=embed`);
            } else {
                setActiveMapUrl(`https://maps.google.com/maps?saddr=${riderLat},${riderLng}&daddr=${encodeURIComponent(storeAddress)}&output=embed`);
            }
            setIsMapLoading(false);
        }, () => setIsMapLoading(false));
    };

    const handleNavigateToDropoff = () => {
        setIsMapLoading(true);
        setMapType('dropoff');
        navigator.geolocation.getCurrentPosition((position) => {
            const riderLat = position.coords.latitude;
            const riderLng = position.coords.longitude;
            const deliveryLat = orderData.deliveryLatitude;
            const deliveryLng = orderData.deliveryLongitude;
            const deliveryAddress = orderData.deliveryAddress;

            if (deliveryLat && deliveryLng) {
                setActiveMapUrl(`https://maps.google.com/maps?saddr=${riderLat},${riderLng}&daddr=${deliveryLat},${deliveryLng}&output=embed`);
            } else {
                setActiveMapUrl(`https://maps.google.com/maps?saddr=${riderLat},${riderLng}&daddr=${encodeURIComponent(deliveryAddress)}&output=embed`);
            }
            setIsMapLoading(false);
        }, () => setIsMapLoading(false));
    };

    return (
        <div className="min-h-screen bg-[#F9FAF7] flex flex-col font-sans">
            <RiderHeader activeTab="Available" activeCount={activeOrdersCount} historyCount={deliveredOrdersCount} />

            {/* Toast */}
            {toast && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] w-[90%] max-w-sm animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3 shadow-lg">
                        <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white shrink-0">
                            <AlertCircle size={16} />
                        </div>
                        <p className="text-[13px] font-bold text-red-900 flex-1">{toast.message}</p>
                    </div>
                </div>
            )}

            {/* Content Area */}
            <div className="flex-1 px-4 py-6 space-y-4">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <Loader2 size={32} className="text-[#1C5E20] animate-spin mb-3" />
                        <p className="text-[13px] font-medium text-zinc-400">Loading order details...</p>
                    </div>
                ) : !orderData ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center px-10">
                        <p className="text-[15px] font-bold text-zinc-500 mb-2">Order not found</p>
                        <button
                            onClick={() => navigate(-1)}
                            className="text-[#1C5E20] font-bold text-[13px] underline mt-2"
                        >
                            Go back
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Main Order Card */}
                        <div className="bg-white rounded-[24px] p-6 border border-zinc-100 shadow-sm">
                            <div className="mb-6">
                                <p className="text-[11px] font-bold text-zinc-400 mb-1">{orderData.orderId}</p>
                                <p className="text-[13px] font-semibold text-zinc-800">{capitalize(orderData.shopType || 'Order')}</p>
                                <h3 className="text-[20px] font-bold text-[#1C5E20] leading-tight mt-1 mb-1">{capitalize(orderData.vendorStoreName)}</h3>
                                <p className="text-[14px] text-zinc-500 font-medium mb-1">{orderData.storeAddress}</p>
                                <p className="text-[13px] font-medium text-zinc-400">
                                    Items: <span className="text-[#1C5E20]">{orderData.itemsString}</span>
                                </p>
                            </div>

                            <button 
                                onClick={handleNavigateToStore}
                                disabled={isMapLoading}
                                className="w-full bg-[#F1F4F1] text-[#1C5E20] font-bold py-4 rounded-xl flex items-center justify-center gap-2 text-[14px] transition-colors hover:bg-zinc-200 mb-4 disabled:opacity-70"
                            >
                                {isMapLoading && mapType === 'store' ? <Loader2 size={16} className="animate-spin" /> : null}
                                Open store in map
                            </button>

                            {mapType === 'store' && activeMapUrl && (
                                <div className="mb-8 overflow-hidden rounded-xl border border-zinc-200">
                                    <iframe title="Store Map" width="100%" height="300" src={activeMapUrl} style={{ border: 0 }} allowFullScreen="" loading="lazy"></iframe>
                                </div>
                            )}

                            {/* Logistics Info Section */}
                            <div className="space-y-4">
                                <div className="bg-[#F8F9F8] rounded-[16px] p-5">
                                    <h4 className="text-[12px] font-bold text-zinc-400 mb-1">Customer</h4>
                                    <p className="text-[15px] font-bold text-zinc-800">{capitalize(orderData.customerName)}</p>
                                    <p className="text-[14px] text-zinc-500 font-medium">{orderData.customerPhone}</p>
                                </div>

                                <div className="bg-[#F8F9F8] rounded-[16px] p-5">
                                    <h4 className="text-[12px] font-bold text-zinc-400 mb-1">Drop-off</h4>
                                    <p className="text-[15px] font-bold text-zinc-800">{orderData.deliveryAddress}</p>
                                    <button 
                                        onClick={handleNavigateToDropoff}
                                        disabled={isMapLoading}
                                        className="flex items-center gap-1.5 text-[#1C5E20] font-bold text-[13px] mt-2 underline disabled:opacity-70"
                                    >
                                        {isMapLoading && mapType === 'dropoff' ? (
                                            <Loader2 size={14} className="animate-spin" />
                                        ) : (
                                            <Navigation size={14} className="fill-current" />
                                        )}
                                        Navigate to Drop-off
                                    </button>
                                    
                                    {mapType === 'dropoff' && activeMapUrl && (
                                        <div className="mt-4 overflow-hidden rounded-xl border border-zinc-200">
                                            <iframe title="Dropoff Map" width="100%" height="300" src={activeMapUrl} style={{ border: 0 }} allowFullScreen="" loading="lazy"></iframe>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-[#F8F9F8] rounded-[16px] p-5">
                                    <h4 className="text-[12px] font-bold text-zinc-400 mb-1">Order Total</h4>
                                    <p className="text-[18px] font-bold text-zinc-900">₦{orderData.totalAmount?.toLocaleString()}</p>
                                </div>

                                <button
                                    onClick={() => setShowAcceptModal(true)}
                                    className="w-full bg-[#1C5E20] text-white font-bold py-4 rounded-xl text-[15px] transition-all hover:bg-[#144416] shadow-md shadow-[#1C5E20]/20 mt-2"
                                >
                                    Accept pick up
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Accept Pickup Modal */}
            {showAcceptModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-8">
                    <div className="bg-white w-full max-w-xs rounded-[40px] p-8 text-center shadow-2xl relative animate-in fade-in zoom-in duration-300">
                        <h2 className="text-[20px] font-medium text-[#1C5E20] mb-2">Accept Pickup</h2>
                        <p className="text-sm text-zinc-500 mb-8 font-medium px-4 leading-relaxed">
                            Accepting means you're available for this order.
                        </p>

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

export default OrderDetails;
