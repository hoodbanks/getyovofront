import React, { useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { Bell, X } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import useFCM from '../../hooks/useFCM';

const RiderLayout = () => {
    const accessToken = useAuthStore((state) => state.accessToken);
    const [foregroundNotif, setForegroundNotif] = useState(null);

    // Handle in-app (foreground) push notifications as a banner toast
    const handleForegroundMessage = useCallback((payload) => {
        const title = payload.notification?.title || 'GetYovo';
        const body = payload.notification?.body || '';
        setForegroundNotif({ title, body });
        // Auto-dismiss after 6 seconds
        setTimeout(() => setForegroundNotif(null), 6000);
    }, []);

    // Init FCM for this rider session
    useFCM(accessToken, handleForegroundMessage);

    return (
        <div className="min-h-screen bg-[#f9f9f9] flex flex-col max-w-md mx-auto relative pb-24">
            {/* Foreground push notification banner */}
            {foregroundNotif && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[300] w-[92%] max-w-sm animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="bg-[#103D2E] text-white rounded-2xl p-4 flex items-start gap-3 shadow-2xl shadow-black/30">
                        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                            <Bell size={16} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-bold text-white leading-tight">{foregroundNotif.title}</p>
                            {foregroundNotif.body && (
                                <p className="text-[12px] text-white/75 font-medium mt-0.5 leading-snug">{foregroundNotif.body}</p>
                            )}
                        </div>
                        <button
                            onClick={() => setForegroundNotif(null)}
                            className="text-white/60 hover:text-white shrink-0 mt-0.5"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>
            )}

            <div className="flex-1 overflow-y-auto">
                <Outlet />
            </div>
        </div>
    );
};

export default RiderLayout;
