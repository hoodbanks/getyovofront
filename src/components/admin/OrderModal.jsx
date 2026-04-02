import React from 'react';
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
    Search
} from 'lucide-react';

const OrderModal = ({ isOpen, onClose, order }) => {
    if (!isOpen || !order) return null;

    // Mock data for order details based on design
    const orderDetails = {
        vendorName: "Roban Mart",
        vendorType: "Grocery Store",
        vendorContact: "+234 70 000 0000",
        items: [
            { name: "Zero coke", qty: 1, price: 950 },
            { name: "Cheese Balls", qty: 2, price: 600 }
        ],
        subtotal: 1550,
        total: 3100,
        customerName: "Jane Smith",
        customerPhone: "+2347045892156",
        deliveryAddress: "Temp site, Unizik",
        riderName: "Mike Mike",
        riderStatus: "On Delivery",
        riderPhone: "+2347045892156",
        placedTime: "Feb 23, 2024, 3:45 PM",
        paymentMethod: "Bank Transfer",
        timeline: [
            { status: "Order Placed", time: "01:08 pm", completed: true },
            { status: "Order received", time: "01:10 pm", completed: true },
            { status: "Rider accepted offer", time: "01:15 pm", completed: false },
            { status: "Out for delivery", time: "-", completed: false },
            { status: "Order arrived", time: "-", completed: false }
        ]
    };

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
                <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4">
                    {/* Top Order Summary Card */}
                    <div className="bg-white p-5 rounded-2xl border border-zinc-100 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-full text-[9px] font-bold">
                                {order.status || 'In Transit'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-zinc-900">Order ID: {order.id}</h3>
                                <p className="text-[10px] text-zinc-400 font-medium">Placed on: {order.time || orderDetails.placedTime}</p>
                            </div>
                            <div className="text-right">
                                <h3 className="text-sm font-bold text-zinc-900">₦{orderDetails.total.toLocaleString()}</h3>
                                <p className="text-[10px] text-zinc-400 font-medium">Paid ({orderDetails.paymentMethod})</p>
                            </div>
                        </div>
                    </div>

                    {/* Order Details (Vendor) */}
                    <div className="bg-white p-5 rounded-2xl border border-zinc-100 space-y-4">
                        <h4 className="text-[11px] font-bold text-zinc-900 border-b border-zinc-50 pb-2">Order Details</h4>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 font-bold text-xs uppercase">
                                {orderDetails.vendorName.substring(0, 2)}
                            </div>
                            <div>
                                <h5 className="text-[12px] font-bold text-zinc-900">{orderDetails.vendorName}</h5>
                                <p className="text-[10px] text-zinc-500 font-medium">Store Type: <span className="text-zinc-900">{orderDetails.vendorType}</span></p>
                                <p className="text-[10px] text-zinc-500 font-medium tracking-tight">Contact: <span className="text-zinc-900">{orderDetails.vendorContact}</span></p>
                            </div>
                        </div>

                        {/* Items Sub-section */}
                        <div className="bg-zinc-50/50 rounded-xl p-4 space-y-3">
                            <h5 className="text-[11px] font-bold text-zinc-900">{orderDetails.vendorName}</h5>
                            <div className="space-y-2">
                                {orderDetails.items.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between text-[11px]">
                                        <div className="flex items-center gap-2">
                                            <span className="text-zinc-400 font-bold">{item.qty}x</span>
                                            <span className="text-zinc-700 font-medium">{item.name}</span>
                                        </div>
                                        <span className="text-zinc-900 font-bold">₦{item.price}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
                                <span className="text-[11px] font-bold text-zinc-900">Subtotal:</span>
                                <span className="text-[11px] font-bold text-zinc-900">₦{orderDetails.subtotal}</span>
                            </div>
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
                                <h5 className="text-[12px] font-bold text-zinc-900">{orderDetails.customerName}</h5>
                                <p className="text-[10px] text-zinc-500 font-medium mt-1">Phone: <span className="text-zinc-900">{orderDetails.customerPhone}</span></p>
                                <p className="text-[10px] text-zinc-500 font-medium mt-0.5">Delivery address: <span className="text-zinc-900">{orderDetails.deliveryAddress}</span></p>
                            </div>
                        </div>
                    </div>

                    {/* Rider Details */}
                    <div className="bg-white p-5 rounded-2xl border border-zinc-100 space-y-3">
                        <h4 className="text-[11px] font-bold text-zinc-900">Rider Details</h4>
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-col shrink-0">
                                <span className="text-[10px] font-bold text-blue-600">JS</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] text-zinc-500 font-medium">Assigned Rider: <span className="text-zinc-900 font-bold">{orderDetails.riderName}</span></p>
                                <p className="text-[10px] text-zinc-500 font-medium mt-0.5">Status: <span className="text-zinc-900 font-bold">{orderDetails.riderStatus}</span></p>
                                <p className="text-[10px] text-zinc-500 font-medium mt-0.5">Contact: <span className="text-zinc-900 font-bold">{orderDetails.riderPhone}</span></p>
                            </div>
                        </div>
                    </div>

                    {/* Timeline & Activity */}
                    <div className="bg-white p-5 rounded-2xl border border-zinc-100 space-y-4">
                        <h4 className="text-[11px] font-bold text-zinc-900">Timeline & Activity</h4>
                        <div className="flex gap-5">
                            <div className="flex-1 space-y-4">
                                {orderDetails.timeline.map((step, i) => (
                                    <div key={i} className="flex gap-3 items-start relative pb-4 last:pb-0">
                                        {/* Timeline Line */}
                                        {i !== orderDetails.timeline.length - 1 && (
                                            <div className={`absolute left-[7px] top-[14px] w-[2px] h-full ${step.completed ? 'bg-emerald-500' : 'bg-zinc-100'}`} />
                                        )}

                                        {/* Connector Circle */}
                                        <div className={`relative z-10 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center shrink-0 mt-0.5 ${step.completed ? 'border-emerald-500' : 'border-zinc-200'
                                            }`}>
                                            {step.completed && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                                        </div>

                                        <div className="flex-1">
                                            <p className={`text-[10px] font-bold ${step.completed ? 'text-zinc-900' : 'text-zinc-400'}`}>
                                                {step.status}
                                            </p>
                                            {step.time !== "-" && (
                                                <p className="text-[9px] text-zinc-400 font-medium">{step.time}</p>
                                            )}
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
                </div>
            </div>
        </div>
    );
};

export default OrderModal;
