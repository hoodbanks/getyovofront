import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import logo from '../../assets/images/GetYovo-Logo-yellow.png';
import { useRiderStore } from '../../store/useRiderStore';
import { useAuthStore } from '../../store/useAuthStore';

const RiderHeader = ({ activeTab, activeCount = 0, historyCount = 0 }) => {
    const navigate = useNavigate();
    const isOnline = useRiderStore((state) => state.isOnline);
    const rider = useAuthStore((state) => state.rider);

    const getInitials = (name) => {
        if (!name) return 'R';
        const parts = name.trim().split(/\s+/);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return parts[0].substring(0, 2).toUpperCase();
    };

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

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/rider/app/notifications')}
                        aria-label="Notifications"
                        className="w-11 h-11 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-all text-white"
                    >
                        <Bell size={22} />
                    </button>

                    <button
                        onClick={() => navigate('/rider/app/profile')}
                        className="relative outline-none"
                    >
                        <div className="w-11 h-11 rounded-full bg-[#FFD100] border-2 border-white/20 overflow-hidden shadow-md flex items-center justify-center">
                            <span className="text-[#103D2E] font-bold text-[15px] tracking-wide">
                                {getInitials(rider?.name || 'Rider')}
                            </span>
                        </div>
                        {/* Online indicator — reflects real store state */}
                        <div className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-[#1C5E20] rounded-full transition-colors duration-300 ${isOnline ? 'bg-green-400' : 'bg-zinc-400'}`} />
                    </button>
                </div>
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
