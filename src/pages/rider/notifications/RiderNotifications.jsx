import React, { useState } from 'react';
import { 
    Bell, 
    Trash2, 
    Loader2, 
    AlertCircle, 
    CheckCircle2, 
    Clock, 
    ChevronRight,
    Search,
    Filter
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../api/api';
import { useAuthStore } from '../../../store/useAuthStore';
import RiderSimpleHeader from '../../../components/rider/RiderSimpleHeader';

const RiderNotifications = () => {
    const { accessToken } = useAuthStore();
    const queryClient = useQueryClient();
    const [unreadOnly, setUnreadOnly] = useState(false);

    // Fetch Notifications
    const { data: notificationsData, isLoading, error, refetch } = useQuery({
        queryKey: ['rider-notifications', unreadOnly],
        queryFn: () => api.get(`/notification?unreadOnly=${unreadOnly}`, accessToken, { role: 'RIDER' }),
        refetchInterval: 30000, // Poll every 30 seconds as requested
    });

    const notifications = notificationsData?.data?.data || [];

    // Mark as Read Mutation
    const readMutation = useMutation({
        mutationFn: (id) => api.patch(`/notification/${id}/read`, {}, accessToken, { role: 'RIDER' }),
        onSuccess: () => {
            queryClient.invalidateQueries(['rider-notifications']);
        }
    });

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/notification/${id}`, null, accessToken, { role: 'RIDER' }),
        onSuccess: () => {
            queryClient.invalidateQueries(['rider-notifications']);
        }
    });

    const handleMarkAsRead = (id, isRead) => {
        if (!id) return; // Safety check
        if (!isRead) {
            readMutation.mutate(id);
        }
    };

    const handleDelete = (e, id) => {
        e.stopPropagation();
        if (!id) return; // Safety check
        if (window.confirm('Delete this notification?')) {
            deleteMutation.mutate(id);
        }
    };

    return (
        <div className="min-h-screen bg-[#F9FAF7] flex flex-col font-sans">
            <RiderSimpleHeader title="Notifications" icon={Bell} />

            <div className="flex-1 px-4 py-6 space-y-4">
                {/* Filter Tabs */}
                <div className="flex gap-2 bg-white p-1 rounded-2xl border border-zinc-100 shadow-sm">
                    <button 
                        onClick={() => setUnreadOnly(false)}
                        className={`flex-1 py-2.5 text-[13px] font-bold rounded-xl transition-all ${!unreadOnly ? 'bg-[#1C5E20] text-white shadow-md' : 'text-zinc-500 hover:bg-zinc-50'}`}
                    >
                        All
                    </button>
                    <button 
                        onClick={() => setUnreadOnly(true)}
                        className={`flex-1 py-2.5 text-[13px] font-bold rounded-xl transition-all ${unreadOnly ? 'bg-[#1C5E20] text-white shadow-md' : 'text-zinc-500 hover:bg-zinc-50'}`}
                    >
                        Unread
                    </button>
                </div>

                {/* Notifications List */}
                <div className="space-y-3">
                    {isLoading ? (
                        <div className="py-20 flex flex-col items-center gap-3">
                            <Loader2 size={32} className="text-[#1C5E20] animate-spin" />
                            <p className="text-sm font-medium text-zinc-500">Fetching notifications...</p>
                        </div>
                    ) : error ? (
                        <div className="py-20 flex flex-col items-center gap-3 text-center px-6">
                            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500">
                                <AlertCircle size={32} />
                            </div>
                            <p className="text-sm font-bold text-zinc-900">Oops! Something went wrong</p>
                            <p className="text-[12px] text-zinc-500 font-medium">{error.message || 'Failed to load notifications'}</p>
                            <button onClick={() => refetch()} className="mt-2 px-6 py-2.5 bg-[#1C5E20] text-white text-[13px] font-bold rounded-xl active:scale-95 transition-all">Retry</button>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="py-24 flex flex-col items-center text-center px-10">
                            <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-300 mb-4">
                                <Bell size={40} />
                            </div>
                            <h3 className="text-lg font-bold text-zinc-900 mb-1">No notifications yet</h3>
                            <p className="text-[13px] text-zinc-500 font-medium">We'll alert you when there's an update on your orders or account.</p>
                        </div>
                    ) : (
                        notifications.map((notif) => {
                            const notificationId = notif.id || notif._id;
                            return (
                                <div 
                                    key={notificationId}
                                    onClick={() => handleMarkAsRead(notificationId, notif.read)}
                                className={`group relative bg-white p-5 rounded-[24px] border transition-all active:scale-[0.98] cursor-pointer ${notif.read ? 'border-zinc-100 opacity-80' : 'border-[#1C5E20]/20 bg-[#1C5E20]/5 shadow-sm ring-1 ring-[#1C5E20]/5'}`}
                            >
                                <div className="flex gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                                        notif.type === 'ORDER' ? 'bg-amber-100 text-amber-600' :
                                        notif.type === 'SYSTEM' ? 'bg-blue-100 text-blue-600' :
                                        'bg-[#1C5E20]/10 text-[#1C5E20]'
                                    }`}>
                                        {notif.type === 'ORDER' ? <Clock size={20} /> : <CheckCircle2 size={20} />}
                                    </div>

                                    <div className="flex-1 min-w-0 pr-8">
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <h4 className={`text-[14px] font-bold truncate ${notif.read ? 'text-zinc-700' : 'text-zinc-900'}`}>
                                                {notif.title}
                                            </h4>
                                            <span className="text-[10px] font-bold text-zinc-400 whitespace-nowrap">
                                                {new Date(notif.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                        <p className={`text-[12px] leading-relaxed line-clamp-2 ${notif.read ? 'text-zinc-400 font-medium' : 'text-zinc-600 font-bold'}`}>
                                            {notif.body}
                                        </p>
                                    </div>
                                </div>

                                {/* Action Buttons (revealed on group hover if applicable, or always accessible) */}
                                <div className="absolute top-5 right-5 flex flex-col gap-2">
                                    {!notif.read && <div className="w-2.5 h-2.5 bg-[#1C5E20] rounded-full self-end" />}
                                    <button 
                                        onClick={(e) => handleDelete(e, notificationId)}
                                        className="p-1.5 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer Info */}
                {!isLoading && notifications.length > 0 && (
                    <div className="py-4 text-center">
                        <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest flex items-center justify-center gap-2">
                            <span className="w-1 h-1 bg-zinc-400 rounded-full" />
                            End of notifications
                            <span className="w-1 h-1 bg-zinc-400 rounded-full" />
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RiderNotifications;
