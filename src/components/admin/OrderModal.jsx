import {
    X,
    ShoppingBag,
    User,
    Bike,
    Clock,
    CheckCircle2,
    MapPin,
    Phone,
    ChevronRight,
    Search,
    Loader2
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/api';
import { useAuthStore } from '../../store/useAuthStore';
import { formatName, formatDate, getInitials } from '../../utils/formatters';

const OrderModal = ({ isOpen, onClose, order }) => {
    const token = useAuthStore((state) => state.accessToken);

    const orderId = order?.id || order?._id || order?.orderId;
    const { data: detailData, isLoading, error } = useQuery({
        queryKey: ['order-detail', orderId],
        queryFn: () => api.get(`/superadmin/orders/${orderId}/overview`, token),
        enabled: !!isOpen && !!orderId
    });

    if (!isOpen || !order) return null;

    const orderDetails = detailData?.data?.order || detailData?.data || {};
    const items = orderDetails.itemsStructured || orderDetails.items || [];
    
    // Timeline Logic
    const currentStatus = (orderDetails.status || order?.status || '').toUpperCase().replace(/\s+/g, '_');
    
    const statusSequence = ['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'];
    const currentIdx = statusSequence.indexOf(currentStatus);

    const isPreparing = currentIdx >= statusSequence.indexOf('ACCEPTED');
    const isReady = currentIdx >= statusSequence.indexOf('READY');
    const isOut = currentIdx >= statusSequence.indexOf('PICKED_UP');
    const isDelivered = currentIdx >= statusSequence.indexOf('DELIVERED');

    const timeline = [
        { 
            status: "Preparing", 
            time: orderDetails.acceptedAt ? new Date(orderDetails.acceptedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (isPreparing ? 'Done' : '-'), 
            completed: isPreparing 
        },
        { 
            status: "Ready", 
            time: orderDetails.readyAt ? new Date(orderDetails.readyAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (isReady ? 'Done' : '-'), 
            completed: isReady 
        },
        { 
            status: "Out for delivery", 
            time: (orderDetails.outForDeliveryAt || orderDetails.pickedUpAt) ? new Date(orderDetails.outForDeliveryAt || orderDetails.pickedUpAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (isOut ? 'Done' : '-'), 
            completed: isOut 
        },
        { 
            status: "Delivered", 
            time: (orderDetails.deliveredAt || orderDetails.etaOrDelivered) ? formatDate(orderDetails.deliveredAt || orderDetails.etaOrDelivered) : (isDelivered ? 'Done' : '-'), 
            completed: isDelivered 
        }
    ];

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            <div
                className={`absolute inset-0 bg-black/50 transition-opacity duration-300 animate-fade-in`}
                onClick={onClose}
            />

            <div className={`relative w-full max-w-lg bg-zinc-50 h-full shadow-2xl flex flex-col animate-slide-in overflow-hidden`}>
                {/* Header */}
                <div className="p-4 bg-white border-b border-zinc-100 flex items-center justify-between shrink-0">
                    <h2 className="text-sm font-bold text-zinc-900">Order Details</h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-zinc-100 rounded-lg transition-colors text-zinc-400"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4 relative">
                    {isLoading ? (
                        <div className="flex-1 flex items-center justify-center py-24">
                            <Loader2 className="text-emerald-600 animate-spin" size={32} />
                        </div>
                    ) : (
                    <>
                    {/* Top Order Summary Card */}
                    <div className="bg-white p-5 rounded-2xl border border-zinc-100 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-tight border ${
                                (orderDetails.status || order?.status) === 'DELIVERED' 
                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                    : 'bg-blue-50 text-blue-600 border-blue-100'
                            }`}>
                                {(orderDetails.status || order?.status)?.replace(/_/g, ' ') || 'Processing'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                             <div>
                                <h3 className="text-sm font-bold text-zinc-900 uppercase">Order: {orderDetails.orderCode || orderDetails.code || order.orderCode || order.code}</h3>
                                <p className="text-[10px] text-zinc-400 font-medium">Placed on: {formatDate(orderDetails.orderTime || orderDetails.placedAt || order.orderTime || order.placedAt)}</p>
                            </div>
                            <div className="text-right">
                                <h3 className="text-sm font-bold text-zinc-900">₦{(orderDetails.totalAmount || orderDetails.totalAmountPaid || order.totalAmount || 0).toLocaleString()}</h3>
                                <p className="text-[10px] text-zinc-400 font-medium">{orderDetails.paymentStatus || order.paymentStatus} ({orderDetails.shopType || order.shopType || 'Order'})</p>
                            </div>
                        </div>
                    </div>

                    {/* Order Details (Vendor) */}
                    <div className="bg-white p-5 rounded-2xl border border-zinc-100 space-y-4">
                        <h4 className="text-[11px] font-bold text-zinc-900 border-b border-zinc-50 pb-2">Vendor Information</h4>
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 font-bold text-xs uppercase border border-zinc-200">
                                {getInitials(orderDetails.vendorStoreName || order.vendorStoreName || 'Vendor')}
                            </div>
                            <div>
                                <h5 className="text-[12px] font-bold text-zinc-900">{formatName(orderDetails.vendorStoreName || order.vendorStoreName)}</h5>
                                <p className="text-[10px] text-zinc-500 font-medium truncate max-w-[150px]">Contact: <span className="text-zinc-900">{orderDetails.vendorPhone || order.vendorPhone || 'N/A'}</span></p>
                            </div>
                        </div>

                        {/* Items Sub-section */}
                        <div className="bg-zinc-50/50 rounded-xl p-4 space-y-3">
                            <h5 className="text-[11px] font-bold text-zinc-900 uppercase tracking-widest">Ordered Items</h5>
                            <div className="space-y-2">
                                {items.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between text-[11px]">
                                        <div className="flex items-center gap-2">
                                            <span className="text-zinc-400 font-bold">{item.quantity}x</span>
                                            <span className="text-zinc-700 font-medium">{item.productName}</span>
                                        </div>
                                        <span className="text-zinc-900 font-bold">₦{item.total?.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
                                 <span className="text-[11px] font-bold text-zinc-900 uppercase">Subtotal</span>
                                <span className="text-[11px] font-bold text-zinc-900">₦{(orderDetails.itemsSubtotal || 0).toLocaleString()}</span>
                            </div>
                            {orderDetails.deliveryFee > 0 && (
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold text-zinc-500 uppercase">Delivery Fee</span>
                                    <span className="text-[11px] font-bold text-zinc-500">₦{orderDetails.deliveryFee.toLocaleString()}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Customer Information */}
                    <div className="bg-white p-5 rounded-2xl border border-zinc-100 space-y-3">
                        <h4 className="text-[11px] font-bold text-zinc-900">Customer Information</h4>
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden shrink-0">
                                <User size={20} className="text-orange-600" />
                            </div>
                             <div>
                                <h5 className="text-[12px] font-bold text-zinc-900">{formatName(orderDetails.customerName || order.customerName)}</h5>
                                <p className="text-[10px] text-zinc-500 font-medium mt-1">Phone: <span className="text-zinc-900">{orderDetails.customerPhone || order.customerPhone}</span></p>
                                <p className="text-[10px] text-zinc-500 font-medium mt-0.5">Delivery address: <span className="text-zinc-900">{orderDetails.deliveryAddress || orderDetails.address || order.deliveryAddress || order.address || 'N/A'}</span></p>
                            </div>
                        </div>
                    </div>

                    {/* Rider Details */}
                    <div className="bg-white p-5 rounded-2xl border border-zinc-100 space-y-3">
                        <h4 className="text-[11px] font-bold text-zinc-900">Rider Details</h4>
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-col shrink-0 border border-blue-200">
                                <Bike size={18} className="text-blue-600" />
                            </div>
                             <div className="flex-1">
                                <p className="text-[10px] text-zinc-500 font-medium">Assigned Rider: <span className="text-zinc-900 font-bold">{orderDetails.riderName || order.riderName ? formatName(orderDetails.riderName || order.riderName) : 'Not Assigned'}</span></p>
                                <p className="text-[10px] text-zinc-500 font-medium mt-0.5">Contact: <span className="text-zinc-900 font-bold">{orderDetails.riderPhone || 'N/A'}</span></p>
                            </div>
                        </div>
                    </div>

                    {/* Timeline & Activity */}
                    <div className="bg-white p-5 rounded-2xl border border-zinc-100 space-y-4">
                        <h4 className="text-[11px] font-bold text-zinc-900">Timeline & Activity</h4>
                        <div className="flex gap-5">
                            <div className="flex-1 space-y-4">
                                {timeline.map((step, i) => (
                                    <div key={i} className="flex gap-3 items-start relative pb-4 last:pb-0">
                                        {/* Timeline Line */}
                                        {i !== timeline.length - 1 && (
                                            <div className={`absolute left-[7px] top-[14px] w-[2px] h-full ${step.completed ? 'bg-emerald-500' : 'bg-zinc-100'}`} />
                                        )}
                                        {/* Connector Circle */}
                                        <div className={`relative z-10 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center shrink-0 mt-0.5 ${step.completed ? 'border-emerald-500' : 'border-zinc-200'
                                            }`}>
                                            {step.completed && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className={`text-[10px] font-bold lowercase first-letter:uppercase ${step.completed ? 'text-zinc-900' : 'text-zinc-400'}`}>
                                                {step.status}
                                            </p>
                                            <p className="text-[9px] text-zinc-400 font-medium lowercase tracking-tighter">{step.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Map Placeholder */}
                            <div className="w-40 h-40 bg-zinc-100 rounded-xl overflow-hidden relative border border-zinc-200 shrink-0">
                                <img
                                    src="/artifacts/order_delivery_map_placeholder.png"
                                    className="w-full h-full object-cover opacity-80"
                                    alt="Delivery Route"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.parentElement.innerHTML = '<div class="w-full h-full flex flex-col items-center justify-center p-4 text-center"><div class="w-8 h-8 rounded-full bg-rose-500 border-2 border-white shadow-md absolute top-1/4 left-1/4 animate-bounce"></div><div class="w-8 h-8 rounded-full bg-blue-500 border-2 border-white shadow-md absolute bottom-1/4 right-1/4 animate-pulse"></div><div class="w-full h-2 bg-zinc-200 rounded-full mt-2 overflow-hidden"><div class="w-1/2 h-full bg-emerald-500"></div></div><p class="text-[8px] font-bold text-zinc-400 mt-2 uppercase tracking-tight">Route Map</p></div>';
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                    </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderModal;
