import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation, X } from 'lucide-react';
import RiderHeader from '../../../components/rider/RiderHeader';

const OrderDetails = () => {
    const navigate = useNavigate();
    const [showAcceptModal, setShowAcceptModal] = useState(false);

    const orderData = {
        id: '#01-A',
        store: 'Restaurant',
        name: 'Candles',
        address: '18 Ogui Rd, Enugu',
        items: '2x Jollof Rice, 1x Grilled Chicken',
        customer: 'Ada',
        customerPhone: '+234 80 511 2579 2',
        dropOff: '36 Bisalla Rd, Enugu'
    };

    return (
        <div className="min-h-screen bg-[#F9FAF7] flex flex-col font-sans">
            <RiderHeader activeTab="Available" activeCount={1} historyCount={0} />

            {/* Content Area */}
            <div className="flex-1 px-4 py-6 space-y-4">
                {/* Main Order Card */}
                <div className="bg-white rounded-[24px] p-6 border border-zinc-100 shadow-sm">
                    <div className="mb-6">
                        <p className="text-[11px] font-bold text-zinc-400 mb-1">{orderData.id}</p>
                        <p className="text-[13px] font-semibold text-zinc-800">{orderData.store}</p>
                        <h3 className="text-[20px] font-bold text-[#1C5E20] leading-tight mt-1 mb-1">{orderData.name}</h3>
                        <p className="text-[14px] text-zinc-500 font-medium mb-1">{orderData.address}</p>
                        <p className="text-[13px] font-medium text-zinc-400">
                            Items: <span className="text-[#1C5E20]">{orderData.items}</span>
                        </p>
                    </div>

                    <button className="w-full bg-[#F1F4F1] text-[#1C5E20] font-bold py-4 rounded-xl text-[14px] transition-colors hover:bg-zinc-200 mb-8">
                        Open store in map
                    </button>

                    {/* Logistics Info Section */}
                    <div className="space-y-4">
                        <div className="bg-[#F8F9F8] rounded-[16px] p-5">
                            <h4 className="text-[12px] font-bold text-zinc-400 mb-1">Customer</h4>
                            <p className="text-[15px] font-bold text-zinc-800">{orderData.customer}</p>
                            <p className="text-[14px] text-zinc-500 font-medium">{orderData.customerPhone}</p>
                        </div>

                        <div className="bg-[#F8F9F8] rounded-[16px] p-5">
                            <h4 className="text-[12px] font-bold text-zinc-400 mb-1">Drop-off</h4>
                            <p className="text-[15px] font-bold text-zinc-800">{orderData.dropOff}</p>
                            <button className="flex items-center gap-1.5 text-[#1C5E20] font-bold text-[13px] mt-2 underline">
                                <Navigation size={14} className="fill-current" />
                                Navigate to Drop-off
                            </button>
                        </div>

                        <button
                            onClick={() => setShowAcceptModal(true)}
                            className="w-full bg-[#1C5E20] text-white font-bold py-4.5 rounded-xl text-[15px] transition-all hover:bg-[#144416] shadow-md shadow-[#1C5E20]/20 mt-2"
                        >
                            Accept pick up
                        </button>
                    </div>
                </div>
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

export default OrderDetails;
