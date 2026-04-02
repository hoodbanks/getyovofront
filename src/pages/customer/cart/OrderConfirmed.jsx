import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bike } from 'lucide-react';

const OrderConfirmed = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen w-full bg-[#f9f9f9] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto relative relative">

            <div className="flex-1 flex flex-col items-center justify-center w-full">
                {/* Illustration Placeholder */}
                <div className="w-48 h-48 bg-green-50 rounded-full flex items-center justify-center mb-10 relative">
                    <Bike size={64} className="text-[#1C5E20] relative z-10" />
                    {/* Decorative background circle */}
                    <div className="absolute inset-0 bg-green-100 rounded-full transform scale-75 -translate-y-4 -translate-x-2"></div>
                </div>

                <h1 className="text-2xl font-bold text-[#1C5E20] mb-3">Order Confirmed</h1>

                <p className="text-[14px] text-zinc-500 font-medium leading-relaxed px-4">
                    We're preparing your order. Sit back and relax while we bring it to you.
                </p>
            </div>

            <div className="w-full pt-8 pb-4">
                <button
                    onClick={() => navigate('/customer/app/cart')} // Typically routes to 'Ongoing' tab 
                    className="w-full bg-[#1C5E20] hover:bg-[#134015] text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-[#1C5E20]/20"
                >
                    Track Order
                </button>
            </div>
        </div>
    );
};

export default OrderConfirmed;
