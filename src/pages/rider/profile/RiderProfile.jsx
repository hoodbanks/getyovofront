import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, LogOut, X, User, RotateCcw, Loader2, AlertCircle } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import RiderSimpleHeader from '../../../components/rider/RiderSimpleHeader';
import { useAuthStore } from '../../../store/useAuthStore';
import { useRiderStore } from '../../../store/useRiderStore';
import api from '../../../api/api';

const capitalize = (str) => {
    if (!str) return '';
    return str.split(/\s+/).map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
};

const RiderProfile = () => {
    const navigate = useNavigate();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isToggling, setIsToggling] = useState(false);
    const [toast, setToast] = useState(null);

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 4000);
    };

    const { rider, accessToken, logout: clearAuth } = useAuthStore();

    // Shared persisted rider state
    const isOnline = useRiderStore((state) => state.isOnline);
    const setOnline = useRiderStore((state) => state.setOnline);

    const logoutMutation = useMutation({
        mutationFn: () => api.post('/rider/auth/logout', {}, accessToken),
        onSuccess: () => {
            clearAuth();
            setOnline(false); // reset online status on logout
            navigate('/rider/welcome');
        },
        onError: (err) => {
            console.error('Logout failed:', err);
            clearAuth();
            setOnline(false);
            navigate('/rider/login');
        }
    });

    const handleLogout = () => {
        logoutMutation.mutate();
    };

    const handleToggleStatus = async () => {
        if (isToggling) return;
        setIsToggling(true);
        const newStatus = isOnline ? 'inActive' : 'Active';
        try {
            await api.patch('/rider/status', { status: newStatus }, accessToken);
            setOnline(!isOnline);
        } catch (err) {
            console.error('Status toggle failed:', err);
            showToast(err.message || 'Could not update status');
        } finally {
            setIsToggling(false);
        }
    };

    const userData = {
        name: rider?.name || 'Rider',
        email: rider?.email || 'N/A',
        phone: rider?.phonenumber || 'N/A'
    };

    const getInitials = (name) => {
        if (!name) return 'R';
        const parts = name.trim().split(/\s+/);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return parts[0].substring(0, 2).toUpperCase();
    };

    return (
        <div className="min-h-screen bg-[#F9FAF7] flex flex-col font-sans">
            {/* Header */}
            <RiderSimpleHeader title="Profile" icon={User} />

            {/* Toast */}
            {toast && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] w-[90%] max-w-sm animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3 shadow-lg">
                        <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white shrink-0">
                            <AlertCircle size={16} />
                        </div>
                        <p className="text-[13px] font-bold text-red-900 flex-1">{toast}</p>
                    </div>
                </div>
            )}

            <div className="flex-1 px-5 py-8 overflow-y-auto pb-32">
                {/* User Info Section */}
                <div className="flex items-center gap-4 mb-10 ml-1">
                    <div className="w-20 h-20 bg-[#F3E5D8] rounded-full p-1 relative shadow-sm">
                        <div className="w-full h-full rounded-full bg-[#1C5E20] flex items-center justify-center text-white text-2xl font-bold tracking-wider">
                            {getInitials(userData.name)}
                        </div>
                        <div className="absolute bottom-1 right-1 w-4 h-4 border-2 border-white rounded-full transition-colors duration-300"
                             style={{ backgroundColor: isOnline ? '#4ade80' : '#a1a1aa' }}
                        />
                    </div>
                    <div>
                        <h2 className="text-[19px] font-bold text-[#103D2E] leading-tight">{capitalize(userData.name)}</h2>
                        <p className="text-[14px] text-zinc-500 font-medium">{userData.email}</p>
                    </div>
                </div>

                {/* Info Card */}
                <div className="bg-white rounded-[16px] p-6 border border-zinc-100 shadow-sm space-y-5 mb-5">
                    <div>
                        <label className="text-[15px] font-bold text-[#103D2E] block mb-1">Full Name</label>
                        <p className="text-[14px] text-zinc-500 font-medium">{capitalize(userData.name)}</p>
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
                        onClick={handleToggleStatus}
                        disabled={isToggling}
                        className={`w-14 h-7 rounded-full relative transition-all duration-300 ${isOnline ? 'bg-[#103D2E]' : 'bg-zinc-200'} ${isToggling ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                        {isToggling ? (
                            <Loader2 size={14} className="absolute inset-0 m-auto text-white animate-spin" />
                        ) : (
                            <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300 ${isOnline ? 'right-1' : 'left-1'}`} />
                        )}
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
                                onClick={handleLogout}
                                disabled={logoutMutation.isPending}
                                className="w-full bg-[#1C5E20] text-white font-bold py-4 rounded-xl transition-all active:scale-[0.98] text-[15px] shadow-lg shadow-[#103D2E]/20 flex items-center justify-center gap-2"
                            >
                                {logoutMutation.isPending ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Logging Out...
                                    </>
                                ) : (
                                    'Log Out'
                                )}
                            </button>
                            <button
                                onClick={() => setShowLogoutModal(false)}
                                disabled={logoutMutation.isPending}
                                className="flex items-center justify-center gap-1 text-[#BE1E2D] font-bold mx-auto text-[14px] disabled:opacity-50"
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
