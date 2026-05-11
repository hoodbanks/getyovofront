import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Navigation, Copy, X, AlertCircle, Loader2 } from 'lucide-react';
import RiderHeader from '../../../components/rider/RiderHeader';
import success from '../../../assets/images/account-verified-icon.png';
import api from '../../../api/api';
import { useAuthStore } from '../../../store/useAuthStore';
import { useRiderStore } from '../../../store/useRiderStore';

const capitalize = (str) => {
    if (!str) return '';
    return str.split(/\s+/).map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
};

const ActiveOrder = () => {
    const navigate = useNavigate();
    const { orderId } = useParams();
    const token = useAuthStore((state) => state.accessToken);
    const activeOrdersCount = useRiderStore((state) => state.activeOrdersCount);
    const deliveredOrdersCount = useRiderStore((state) => state.deliveredOrdersCount);

    const [orderData, setOrderData] = useState(null);
    const [activeOrdersList, setActiveOrdersList] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const [showCodeModal, setShowCodeModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [deliveryCode, setDeliveryCode] = useState('');
    const [isConfirming, setIsConfirming] = useState(false);
    
    const [activeMapUrl, setActiveMapUrl] = useState('');
    const [mapType, setMapType] = useState('');
    const [isMapLoading, setIsMapLoading] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            setIsLoading(true);
            try {
                if (orderId) {
                    const res = await api.get(`/rider/orders/${orderId}`, token);
                    if (res?.data) setOrderData(res.data);
                } else {
                    const res = await api.get('/rider/orders/active', token);
                    if (res?.data?.data) {
                        setActiveOrdersList(res.data.data);
                    } else {
                        setActiveOrdersList([]);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch active order:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrder();
    }, [orderId, token]);

    const handleConfirmDelivery = async () => {
        const currentOrderId = orderId || orderData?.orderId;
        if (!deliveryCode || isConfirming || !currentOrderId) return;
        setIsConfirming(true);
        setShowError(false);
        try {
            await api.post(`/rider/orders/${currentOrderId}/confirm`, { deliveryCode }, token);
            setShowCodeModal(false);
            setShowSuccessModal(true);
        } catch (err) {
            setErrorMessage(err.message || 'Incorrect delivery code. Please try again.');
            setShowError(true);
            setTimeout(() => setShowError(false), 4000);
        } finally {
            setIsConfirming(false);
        }
    };

    const handleCopyCode = () => {
        if (orderData?.vendorCode) {
            navigator.clipboard.writeText(orderData.vendorCode).catch(() => {});
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
            <RiderHeader activeTab="Active" activeCount={activeOrdersCount} historyCount={deliveredOrdersCount} />

            <div className="flex-1 px-4 py-8 overflow-y-auto pb-32">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <Loader2 size={32} className="text-[#1C5E20] animate-spin mb-3" />
                        <p className="text-[13px] font-medium text-zinc-400">Loading...</p>
                    </div>
                ) : !orderId ? (
                    activeOrdersList && activeOrdersList.length > 0 ? (
                        <div className="space-y-4">
                            {activeOrdersList.map(order => (
                                <div key={order.orderId} className="bg-white rounded-xl p-6 border border-zinc-100 shadow-sm">
                                    <p className="text-[11px] font-bold text-zinc-400 mb-1">{order.orderId}</p>
                                    <p className="text-[13px] font-semibold text-zinc-800">{capitalize(order.shopType || 'Order')}</p>
                                    <h3 className="text-[20px] font-bold text-[#1C5E20] leading-tight mt-1 mb-1">{capitalize(order.vendorStoreName)}</h3>
                                    <p className="text-[14px] text-zinc-500 font-medium mb-1">{order.storeAddress}</p>
                                    <p className="text-[13px] font-medium text-zinc-400 mb-6">
                                        Drop-off: <span className="text-zinc-600">{order.deliveryAddress}</span>
                                    </p>
                                    <button
                                        onClick={() => navigate(`/rider/app/active-order/${order.orderId}`)}
                                        className="w-full bg-[#1C5E20] text-white font-medium py-4 rounded-xl text-[14px] transition-all hover:bg-[#144416] shadow-md shadow-[#1C5E20]/20 active:scale-[0.98]"
                                    >
                                        View active order
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-32 text-center px-10">
                            <p className="text-[15px] font-bold text-zinc-500 mb-2">No active orders</p>
                            <p className="text-[13px] text-zinc-400">You don't have any orders currently in progress.</p>
                            <button
                                onClick={() => navigate('/rider/app/dashboard')}
                                className="text-[#1C5E20] font-bold text-[13px] underline mt-4"
                            >
                                Back to dashboard
                            </button>
                        </div>
                    )
                ) : !orderData ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center px-10">
                        <p className="text-[15px] font-bold text-zinc-500 mb-2">Order not found</p>
                        <button
                            onClick={() => navigate('/rider/app/active-order')}
                            className="text-[#1C5E20] font-bold text-[13px] underline mt-2"
                        >
                            Back to active orders
                        </button>
                    </div>
                ) : (
                    /* Main Active Order Card */
                    <div className="bg-white rounded-[24px] p-6 shadow-sm border border-zinc-100 flex flex-col">
                        <div className="mb-6">
                            <p className="text-[11px] font-bold text-zinc-400 mb-1">{orderData.orderId}</p>
                            <p className="text-[12px] font-bold text-zinc-900">{capitalize(orderData.shopType || 'Order')}</p>
                            <h2 className="text-[24px] font-bold text-[#103D2E] leading-tight mt-1 mb-1">{capitalize(orderData.vendorStoreName)}</h2>
                            <p className="text-[14px] text-zinc-500 font-medium mb-1">{orderData.storeAddress}</p>
                            <p className="text-[13px] font-medium text-zinc-400 mb-6">
                                Items: <span className="text-[#1C5E20]">{orderData.itemsString}</span>
                            </p>

                            {/* Vendor Order Code */}
                            {orderData.vendorCode && (
                                <div className="bg-[#FFF9E5] rounded-[16px] p-5 mb-6 border border-[#FFD100]/20">
                                    <div className="flex justify-between items-center mb-1">
                                        <p className="text-[12px] font-bold text-zinc-400">Vendor Order Code</p>
                                        <button
                                            onClick={handleCopyCode}
                                            className="flex items-center gap-1.5 text-[#A1792B] font-bold text-[12px] bg-[#FEF4E3] px-3 py-2 rounded-lg"
                                        >
                                            <Copy size={16} />
                                            Copy
                                        </button>
                                    </div>
                                    <p className="text-[18px] font-bold text-zinc-900 mb-4">{orderData.vendorCode}</p>

                                    <p className="text-[12px] font-bold text-zinc-400 mb-1">Items to pick:</p>
                                    <p className="text-[13px] font-medium text-[#1C5E20]">{orderData.itemsString}</p>
                                </div>
                            )}

                            <button 
                                onClick={handleNavigateToStore}
                                disabled={isMapLoading}
                                className="w-full bg-[#F1F4F1] text-[#1C5E20] font-bold py-4 rounded-xl flex items-center justify-center gap-2 text-[14px] mb-4 disabled:opacity-70"
                            >
                                {isMapLoading && mapType === 'store' ? <Loader2 size={16} className="animate-spin" /> : null}
                                Navigate to store
                            </button>

                            {mapType === 'store' && activeMapUrl && (
                                <div className="mb-8 overflow-hidden rounded-xl border border-zinc-200">
                                    <iframe title="Store Map" width="100%" height="300" src={activeMapUrl} style={{ border: 0 }} allowFullScreen="" loading="lazy"></iframe>
                                </div>
                            )}
                        </div>

                        {/* Logistics Section */}
                        <div className="space-y-4">
                            <div className="bg-[#F8F9F8] rounded-[16px] p-5">
                                <label className="text-[11px] font-bold text-zinc-400 block mb-1">Customer</label>
                                <p className="text-[15px] font-bold text-zinc-900 mb-0.5">{capitalize(orderData.customerName)}</p>
                                <p className="text-[14px] text-zinc-500 font-medium">{orderData.customerPhone}</p>
                            </div>

                            <div className="bg-[#F8F9F8] rounded-[16px] p-5">
                                <label className="text-[11px] font-bold text-zinc-400 block mb-1">Drop-off</label>
                                <p className="text-[15px] font-bold text-zinc-900 mb-1">{orderData.deliveryAddress}</p>
                                <button 
                                    onClick={handleNavigateToDropoff}
                                    disabled={isMapLoading}
                                    className="flex items-center gap-1.5 text-[#1C5E20] font-bold text-[13px] underline mt-1 disabled:opacity-70"
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

                            <button
                                onClick={() => setShowCodeModal(true)}
                                className="w-full bg-[#1C5E20] text-white font-bold py-4 rounded-xl shadow-lg shadow-[#1C5E20]/20 text-[15px] mt-2 transition-all hover:bg-[#144416]"
                            >
                                Enter delivery code
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Error Toast */}
            {showError && (
                <div className="fixed top-32 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3 shadow-lg">
                        <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white shrink-0">
                            <AlertCircle size={18} />
                        </div>
                        <div className="flex-1">
                            <p className="text-[13px] font-bold text-red-900">Incorrect Delivery Code</p>
                            <p className="text-[11px] text-red-700 font-medium">{errorMessage}</p>
                        </div>
                        <button onClick={() => setShowError(false)} className="text-red-400 hover:text-red-600">
                            <X size={18} />
                        </button>
                    </div>
                </div>
            )}

            {/* Delivery Code Modal */}
            {showCodeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-8">
                    <div className="bg-white w-full max-w-sm rounded-xl p-6 text-center shadow-2xl relative animate-in fade-in zoom-in duration-300">
                        <h2 className="text-md font-bold text-[#1C5E20] mb-2">
                            Enter Delivery Code — {capitalize(orderData?.vendorStoreName)}
                        </h2>
                        <p className="text-[13px] text-zinc-500 mb-4 font-medium px-4 leading-relaxed text-left">
                            Ask the customer for their code to confirm delivery.
                        </p>

                        <div className="mb-6">
                            <input
                                type="text"
                                placeholder="e.g. AE-YTR778"
                                value={deliveryCode}
                                onChange={(e) => setDeliveryCode(e.target.value)}
                                className="w-full bg-zinc-100 border-none rounded-2xl px-6 py-5 text-[15px] font-bold text-zinc-900 placeholder:text-zinc-300 focus:ring-2 focus:ring-[#1C5E20] outline-none"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => { setShowCodeModal(false); setDeliveryCode(''); }}
                                className="flex-1 bg-zinc-100 text-zinc-800 font-bold py-3 rounded-xl text-[14px]"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDelivery}
                                disabled={!deliveryCode || isConfirming}
                                className="flex-1 bg-[#1C5E20] text-white font-bold py-3 rounded-xl text-[14px] disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isConfirming ? <><Loader2 size={16} className="animate-spin" /> Confirming...</> : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-8">
                    <div className="bg-white w-full max-w-xs rounded-[40px] p-8 text-center shadow-2xl relative animate-in fade-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <img src={success} alt="Delivery success" />
                        </div>
                        <h2 className="text-[20px] font-bold text-[#103D2E] mb-2 leading-tight">Delivery confirmed</h2>
                        <p className="text-[13px] text-zinc-500 mb-8 font-medium px-4 leading-relaxed">
                            You have successfully confirmed the receiver's delivery code.
                        </p>

                        <button
                            onClick={() => {
                                setShowSuccessModal(false);
                                navigate('/rider/app/dashboard');
                            }}
                            className="w-full bg-[#1C5E20] text-white font-bold py-4 rounded-xl shadow-lg shadow-[#1C5E20]/20 text-[15px]"
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ActiveOrder;
