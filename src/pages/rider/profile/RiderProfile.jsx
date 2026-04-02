import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, LogOut, X, User, RotateCcw } from 'lucide-react';
import RiderSimpleHeader from '../../../components/rider/RiderSimpleHeader';

const RiderProfile = () => {
    const navigate = useNavigate();
    const [isOnline, setIsOnline] = useState(true);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const userData = {
        name: 'Glenn Dickson',
        email: 'glenndick@email.com',
        phone: '08064582587'
    };

    return (
        <div className="min-h-screen bg-[#F9FAF7] flex flex-col font-sans">
            {/* Header */}
            <RiderSimpleHeader title="Profile" icon={User} />

            <div className="flex-1 px-5 py-8 overflow-y-auto pb-32">
                {/* User Info Section */}
                <div className="flex items-center gap-4 mb-10 ml-1">
                    <div className="w-20 h-20 bg-[#F3E5D8] rounded-full p-2 relative shadow-sm">
                        <img
                            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=60"
                            className="w-full h-full rounded-full object-cover grayscale-[0.2]"
                            alt="Profile"
                        />
                        <div className="absolute bottom-1 right-1 w-4 h-4 bg-[#1C5E20] border-2 border-white rounded-full"></div>
                    </div>
                    <div>
                        <h2 className="text-[19px] font-bold text-[#103D2E] leading-tight">{userData.name}</h2>
                        <p className="text-[14px] text-zinc-500 font-medium">{userData.email}</p>
                    </div>
                </div>

                {/* Info Card */}
                <div className="bg-white rounded-[16px] p-6 border border-zinc-100 shadow-sm space-y-5 mb-5">
                    <div>
                        <label className="text-[15px] font-bold text-[#103D2E] block mb-1">Full Name</label>
                        <p className="text-[14px] text-zinc-500 font-medium">{userData.name}</p>
                    </div>

                    <div>
                        <label className="text-[15px] font-bold text-[#103D2E] block mb-1">Email</label>
                        <p className="text-[14px] text-zinc-500 font-medium">{userData.email}</p>
                    </div>

                    <div>
                        <label className="text-[15px] font-bold text-[#103D2E] block mb-1">Mobile number</label>
                        <p className="text-[14px] text-zinc-500 font-medium">{userData.phone}</p>
                    </div>
                </div>

                {/* Password Card */}
                <button
                    onClick={() => navigate('/rider/app/profile/reset/change-password')}
                    className="w-full bg-white rounded-[16px] p-6 border border-zinc-100 shadow-sm flex items-center justify-between mb-5 hover:bg-zinc-50 transition-colors"
                >
                    <div className="text-left">
                        <p className="text-[15px] font-bold text-[#103D2E]">Password</p>
                        <p className="text-[14px] text-zinc-500 font-medium">Reset your password</p>
                    </div>
                    <ChevronRight className="text-zinc-400" size={24} />
                </button>

                {/* Availability Card */}
                <div className="bg-white rounded-[16px] p-6 border border-zinc-100 shadow-sm flex items-center justify-between mb-10">
                    <div className="text-left">
                        <p className="text-[15px] font-bold text-[#103D2E]">Availability</p>
                        <p className="text-[14px] text-zinc-500 font-medium">Go online to start receiving orders.</p>
                    </div>
                    <button
                        onClick={() => setIsOnline(!isOnline)}
                        className={`w-14 h-7 rounded-full relative transition-all duration-300 ${isOnline ? 'bg-[#103D2E]' : 'bg-zinc-200'}`}
                    >
                        <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300 ${isOnline ? 'right-1' : 'left-1'}`}></div>
                    </button>
                </div>

                {/* Logout Button */}
                <button
                    onClick={() => setShowLogoutModal(true)}
                    className="w-full flex items-center justify-center gap-2 border border-[#BE1E2D] text-[#BE1E2D] font-bold py-4.5 rounded-[12px] bg-transparent transition-all active:scale-[0.98] text-[16px]"
                >
                    <RotateCcw size={20} className="rotate-180" />
                    Log Out
                </button>
            </div>

            {/* Logout Modal */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-8">
                    <div className="bg-white w-full max-w-[300px] rounded-[32px] p-8 text-center shadow-2xl relative animate-in fade-in zoom-in duration-300">
                        <h2 className="text-[20px] font-bold text-zinc-900 mb-2">Log Out</h2>
                        <p className="text-[14px] text-zinc-500 mb-8 font-medium px-4 leading-relaxed">
                            Are you sure you want to log out of this app?
                        </p>

                        <div className="space-y-6">
                            <button
                                onClick={() => navigate('/rider/welcome')}
                                className="w-full bg-[#1C5E20] text-white font-bold py-4 rounded-xl transition-all active:scale-[0.98] text-[15px] shadow-lg shadow-[#103D2E]/20"
                            >
                                Log Out
                            </button>
                            <button
                                onClick={() => setShowLogoutModal(false)}
                                className="flex items-center justify-center gap-1 text-[#BE1E2D] font-bold mx-auto text-[14px]"
                            >
                                <X size={18} />
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RiderProfile;
