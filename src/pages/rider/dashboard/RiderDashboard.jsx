import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Navigation, Bike, ChevronRight, X } from 'lucide-react';
import offline from '../../../assets/images/offline.png';
import RiderHeader from '../../../components/rider/RiderHeader';

const RiderDashboard = () => {
    const navigate = useNavigate();
    const [isOnline, setIsOnline] = useState(false);
    const [filter, setFilter] = useState('All');
    const [showAcceptModal, setShowAcceptModal] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);

    const orders = [
        {
            id: '#01-A',
            store: 'Restaurant',
            name: 'Candles',
            address: '18 Ogui Rd, Enugu',
            items: '2x Jollof Rice, 1x Grilled Chicken'
        },
        {
            id: '#01-B',
            store: 'Restaurant',
            name: 'Candles',
            address: '18 Ogui Rd, Enugu',
            items: '2x Jollof Rice, 1x Grilled Chicken'
        }
    ];

    return (
        <div className="min-h-screen bg-[#F9FCF9] flex flex-col font-sans">
            <RiderHeader activeTab="Available" activeCount={1} historyCount={5} />

            <div className="flex-1 px-4 py-6 overflow-y-auto">
                {/* Availability Toggle */}
                <div className="bg-white rounded-[24px] p-5 shadow-sm mb-6 flex items-center justify-between border border-zinc-100">
                    <div>
                        <h3 className="text-[15px] font-bold text-zinc-900 mb-0.5">Availability</h3>
                        <p className="text-[12px] text-zinc-600 font-medium">
                            Go online to start receiving orders.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsOnline(!isOnline)}
                        className={`w-15 h-9 rounded-full relative transition-colors duration-300 ${isOnline ? 'bg-[#1C5E20]' : 'bg-zinc-400'}`}
                    >
                        <div className={`absolute top-1 w-7 h-7 rounded-full bg-white shadow-sm transition-all duration-300 ${isOnline ? 'translate-x-7' : 'translate-x-1'}`}></div>
                    </button>
                </div>

                {/* Filters */}
                <div className="flex gap-2.5 mb-8 overflow-x-auto no-scrollbar py-1">
                    {['All', 'Restaurant', 'Shops', 'Pharmacy'].map(cat => (
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

                {/* Orders / Offline State */}
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
                ) : (
                    <div className="space-y-4 pb-12">
                        {orders.map((order, i) => (
                            <div key={i} className="bg-white rounded-xl p-6 border border-zinc-100 shadow-sm">
                                <p className="text-[11px] font-bold text-zinc-400 mb-1">{order.id}</p>
                                <p className="text-[13px] font-semibold text-zinc-800">{order.store}</p>
                                <h3 className="text-[20px] font-bold text-[#1C5E20] leading-tight mt-1 mb-1">{order.name}</h3>
                                <p className="text-[14px] text-zinc-500 font-medium mb-1">{order.address}</p>
                                <p className="text-[13px] font-medium text-zinc-400 mb-6">
                                    Items: <span className="text-zinc-600">{order.items}</span>
                                </p>

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => navigate('/rider/app/order/details')}
                                        className="flex-1 bg-[#F1F4F1] text-[#1C5E20] font-medium py-4 rounded-xl text-[14px] transition-colors hover:bg-zinc-200 active:scale-[0.98]"
                                    >
                                        View order
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedOrderId(order.id);
                                            setShowAcceptModal(true);
                                        }}
                                        className="flex-1 bg-[#1C5E20] text-white font-medium py-4 rounded-xl text-[14px] transition-all hover:bg-[#144416] shadow-md shadow-[#1C5E20]/20 active:scale-[0.98]"
                                    >
                                        Accept pick up
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Accept Pickup Modal */}
            {showAcceptModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-8">
                    <div className="bg-white w-full max-w-xs rounded-[40px] p-8 text-center shadow-2xl relative animate-in fade-in zoom-in duration-300">
                        <h2 className="text-[20px] font-medium text-[#1C5E20] mb-2">Accept Pickup</h2>
                        <p className="text-sm text-zinc-500 mb-8 font-medium px-4 leading-relaxed">
                            Accepting means you're available for this order.
                        </p>

                        <div className="space-y-6">
                            <button
                                onClick={() => {
                                    setShowAcceptModal(false);
                                    navigate('/rider/app/active-order');
                                }}
                                className="w-full bg-[#1C5E20] text-white font-bold py-4 rounded-xl transition-all active:scale-[0.98] text-[15px]"
                            >
                                Yes
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
