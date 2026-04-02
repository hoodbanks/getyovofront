import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag, Bike, RotateCcw, PhoneCall, ChevronRight } from 'lucide-react';

const Cart = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('My Cart');

    // MOCK DATA
    const [cartItems, setCartItems] = useState([
        { id: 1, name: 'Jollof Rice', addons: 'Chickenx1, Plantainx2', price: 4000, quantity: 2 },
        { id: 2, name: 'Egusi Soup', addons: 'Extra meatx2, Fishx1, Pomo', price: 27000, quantity: 1 }
    ]);
    const cartHasItems = cartItems.length > 0;
    const ongoingOrders = [
        { id: 'OY31122654', store: 'Roban Mart', eta: '13 - 23 min', status: 1, code: '003498' } // status 0-3
    ];
    const historyOrders = [
        { id: 'OY31122654', date: 'Oct 12 - 2:03 PM', store: 'Roban Mart', items: 'Jollof Rice • Extra Meat x 1', total: 27000, fee: 2000, status: 'Delivered' }
    ];

    const updateQuantity = (id, delta) => {
        setCartItems(cartItems.map(item => {
            if (item.id === id) {
                return { ...item, quantity: Math.max(1, item.quantity + delta) };
            }
            return item;
        }));
    };

    const removeCartItem = (id) => {
        setCartItems(cartItems.filter(item => item.id !== id));
    };

    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const deliveryFee = 1500;
    const total = subtotal + deliveryFee;

    return (
        <div className="min-h-screen w-full bg-[#f9f9f9] flex flex-col pb-24">
            {/* Header & Tabs */}
            <div className="bg-white pt-10 pb-4 px-4 shadow-sm rounded-b-3xl shrink-0 sticky top-0 z-30">
                <div className="flex justify-center items-center mb-6">
                    <h1 className="text-[17px] font-bold text-[#1C5E20] flex items-center gap-2">
                        <ShoppingBag size={18} /> Cart
                    </h1>
                </div>

                <div className="flex bg-zinc-100 rounded-full p-1">
                    {['My Cart', 'Ongoing', 'History'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-2.5 rounded-full text-[13px] font-bold transition-all ${activeTab === tab ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-4 py-6">

                {/* MY CART TAB */}
                {activeTab === 'My Cart' && (
                    cartHasItems ? (
                        <div className="animate-fade-in">
                            <div className="bg-white rounded-3xl p-5 shadow-sm border border-zinc-100 mb-6">
                                <div className="flex justify-between items-start mb-6 border-b border-zinc-100 pb-4">
                                    <div>
                                        <h3 className="font-bold text-[#002f1a] text-[15px] mb-1">Roban Mart</h3>
                                        <p className="text-[12px] text-zinc-400 font-medium">Distance: 3.6 km</p>
                                    </div>
                                    <button
                                        onClick={() => setCartItems([])}
                                        className="text-red-400 hover:text-red-500 p-2 bg-red-50 rounded-full transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    {cartItems.map(item => (
                                        <div key={item.id} className="flex justify-between items-start gap-3">
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-[#002f1a] text-[14px] leading-tight mb-1 truncate">{item.name}</h4>
                                                <p className="text-[12px] text-zinc-500 leading-snug mb-2 pr-2">{item.addons}</p>
                                                <button onClick={() => removeCartItem(item.id)} className="text-[11px] font-bold text-red-500">Remove</button>
                                            </div>

                                            <div className="flex flex-col items-end gap-3 shrink-0">
                                                <div className="flex items-center gap-3 bg-zinc-50 rounded-full px-1.5 py-1.5 border border-zinc-200/60">
                                                    <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center bg-white rounded-full text-zinc-500 shadow-sm border border-zinc-200/50">
                                                        <Minus size={12} strokeWidth={3} />
                                                    </button>
                                                    <span className="text-[13px] font-bold w-3 text-center text-zinc-800">{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 flex items-center justify-center bg-[#1C5E20] rounded-full text-white shadow-sm">
                                                        <Plus size={12} strokeWidth={3} />
                                                    </button>
                                                </div>
                                                <span className="font-bold text-zinc-900 text-[14px]">₦{item.price.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 pt-5 border-t border-zinc-100 space-y-3">
                                    <div className="flex justify-between items-center text-[13px] font-bold">
                                        <span className="text-zinc-500">Subtotal:</span>
                                        <span className="text-zinc-900">₦{subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[13px] font-bold">
                                        <span className="text-zinc-500">Delivery Fee:</span>
                                        <span className="text-zinc-900">₦{deliveryFee.toLocaleString()}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => navigate('/customer/checkout')}
                                    className="w-full mt-6 bg-[#1C5E20] hover:bg-[#134015] text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-[#1C5E20]/20 flex justify-between items-center px-6"
                                >
                                    <span>₦{total.toLocaleString()}</span>
                                    <span className="flex items-center gap-1">Proceed to pay <ChevronRight size={18} /></span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full pt-16 opacity-80">
                            <div className="w-32 h-32 bg-red-50 rounded-full flex items-center justify-center mb-6 relative">
                                <ShoppingBag size={48} className="text-red-300" />
                                <div className="absolute top-4 right-4 bg-red-400 rounded-full p-1 border-2 border-white text-white">
                                    <Trash2 size={16} />
                                </div>
                            </div>
                            <p className="text-sm font-medium text-zinc-500">Oops! Looks like you forgot to add something</p>
                        </div>
                    )
                )}

                {/* ONGOING TAB */}
                {activeTab === 'Ongoing' && (
                    ongoingOrders.length > 0 ? (
                        <div className="animate-fade-in space-y-4">
                            {ongoingOrders.map((order, index) => (
                                <div key={index} className="bg-white rounded-3xl p-5 shadow-sm border border-zinc-100">
                                    <div className="mb-5 pb-4 border-b border-zinc-100">
                                        <h3 className="font-bold text-[#002f1a] text-[15px] mb-1">{order.store}</h3>
                                        <p className="text-[12px] text-zinc-400 font-bold">ETA: {order.eta} • Paid ₦33,700</p>
                                    </div>

                                    {/* Timeline Tracker */}
                                    <div className="relative pl-3 space-y-5 mb-8">
                                        {/* Vertical track line */}
                                        <div className="absolute left-[17px] top-2 bottom-4 w-[2px] bg-zinc-100"></div>
                                        {/* Active Tracker Line segment */}
                                        <div className="absolute left-[17px] top-2 bottom-4 w-[2px] bg-[#1C5E20]" style={{ height: `${Math.min(100, (order.status / 3) * 100)}%` }}></div>

                                        {[
                                            'Order received',
                                            'Preparing your order',
                                            'Rider accepted offer',
                                            'Out for delivery',
                                            'Order arrived'
                                        ].map((step, stepIdx) => (
                                            <div key={stepIdx} className="flex justify-between items-center relative z-10 w-full pr-2">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-3 h-3 rounded-full flex-shrink-0 border-[3px] ${stepIdx <= order.status ? 'bg-[#1C5E20] border-green-100' : 'bg-zinc-300 border-white'}`}></div>
                                                    <span className={`text-[13px] font-bold ${stepIdx <= order.status ? 'text-zinc-900' : 'text-zinc-400'}`}>{step}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Rider details block */}
                                    <div className="space-y-4">
                                        <p className="text-[12px] font-bold text-zinc-400">Rider phone number</p>
                                        <div className="flex gap-2">
                                            <div className="flex-1 bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 flex items-center justify-between">
                                                <span className="text-[14px] font-bold text-zinc-900">08034518990</span>
                                            </div>
                                            <button className="bg-[#1C5E20] px-6 text-white text-[13px] font-bold rounded-xl shadow-sm">Call</button>
                                        </div>
                                    </div>

                                    <div className="space-y-2 mt-4">
                                        <p className="text-[12px] font-bold text-zinc-400">Delivery code</p>
                                        <div className="bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 text-center">
                                            <span className="text-[16px] tracking-widest font-bold text-zinc-900">{order.code}</span>
                                        </div>
                                        <p className="text-[10px] text-zinc-400 font-medium text-center">Show this code to your rider to confirm delivery.</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full pt-16 opacity-80">
                            <div className="w-32 h-32 bg-orange-50 rounded-full flex items-center justify-center mb-6">
                                <Bike size={48} className="text-orange-300" />
                            </div>
                            <p className="text-sm font-medium text-zinc-500">Oops! Looks like you have no ongoing orders</p>
                        </div>
                    )
                )}

                {/* HISTORY TAB */}
                {activeTab === 'History' && (
                    historyOrders.length > 0 ? (
                        <div className="animate-fade-in space-y-4">
                            <div className="relative mb-5">
                                <input type="text" placeholder="Search orders" className="w-full bg-white border border-zinc-200 rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-[#1C5E20]" />
                                <button className="absolute right-1 top-1 bottom-1 bg-[#1C5E20] text-white px-4 rounded-lg text-xs font-bold">Search</button>
                            </div>

                            {historyOrders.map((order, index) => (
                                <div key={index} className="bg-white rounded-3xl p-5 shadow-sm border border-zinc-100">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="text-[12px] font-bold text-zinc-900">{order.id}</p>
                                            <p className="text-[11px] text-zinc-400 font-medium">{order.date}</p>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[14px] font-bold text-[#1C5E20]">₦{order.total.toLocaleString()}</span>
                                            <span className="px-2 py-0.5 bg-green-50 text-[#1C5E20] text-[10px] font-bold rounded mt-1">Delivered</span>
                                        </div>
                                    </div>

                                    <div className="py-3 border-y border-zinc-100/60 my-3">
                                        <h4 className="text-[13px] font-bold text-zinc-800 mb-1">{order.store}</h4>
                                        <p className="text-[11px] text-zinc-500">{order.items}</p>
                                    </div>

                                    <div className="flex gap-2">
                                        <button className="flex-1 bg-[#1C5E20] hover:bg-[#134015] text-white py-2.5 rounded-lg text-[12px] font-bold transition-colors shadow-sm shadow-[#1C5E20]/20 text-center flex items-center justify-center gap-1.5">
                                            <RotateCcw size={14} /> Reorder
                                        </button>
                                        <div className="flex-1 bg-zinc-50 text-zinc-600 py-2.5 rounded-lg text-[12px] font-bold border border-zinc-100 text-center flex flex-col justify-center">
                                            Delivery fee: ₦{order.fee.toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full pt-16 opacity-80">
                            <div className="w-32 h-32 bg-zinc-100 rounded-full flex items-center justify-center mb-6">
                                <History size={48} className="text-zinc-300" />
                            </div>
                            <p className="text-sm font-medium text-zinc-500">We are still waiting for your first order</p>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default Cart;
