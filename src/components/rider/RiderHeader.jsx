import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import logo from '../../assets/images/GetYovo-Logo1.png';

const RiderHeader = ({ activeTab, activeCount = 1, historyCount = 0 }) => {
    const navigate = useNavigate();

    const tabs = [
        { label: 'Available', key: 'Available', path: '/rider/app/dashboard' },
        { label: `Active (${activeCount})`, key: 'Active', path: '/rider/app/active-order' },
        { label: `History (${historyCount})`, key: 'History', path: '/rider/app/history' }
    ];

    return (
        <div className="bg-[#1C5E20] pt-6 pb-6 px-4 shadow-sm">
            <div className="flex items-center justify-between gap-3 mb-8">
                <button onClick={() => navigate('/rider/app/dashboard')} className="outline-none">
                    <img src={logo} alt="GetYovo" className="h-16 object-contain" />
                </button>

                <div className="relative flex-1">
                    <input
                        type="text"
                        placeholder="Enter new address"
                        className="w-full bg-[#F3F4F6] rounded-xl py-3.5 px-4 pr-10 text-[13px] font-medium text-zinc-800 placeholder:text-zinc-600 focus:outline-none shadow-sm"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                        <MapPin className="text-red-500 fill-red-500" size={14} />
                    </div>
                </div>

                <button
                    onClick={() => navigate('/rider/app/profile')}
                    className="relative outline-none"
                >
                    <div className="w-11 h-11 rounded-full bg-[#FFD100] border-2 border-white/20 overflow-hidden shadow-md">
                        <img
                            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=60"
                            className="w-full h-full object-cover"
                            alt="Profile"
                        />
                    </div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#1C5E20] rounded-full"></div>
                </button>
            </div>

            <div className="flex gap-2.5">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => navigate(tab.path)}
                        className={`flex-1 py-3 rounded-full text-[14px] font-medium transition-all ${activeTab === tab.key
                            ? 'bg-[#F3F4F6] text-[#1C5E20] shadow-md'
                            : 'bg-white/20 text-white/90'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default RiderHeader;
