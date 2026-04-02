import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Bell, CheckCircle2, MapPin, X } from 'lucide-react';
import notificationBell from '../../../assets/images/no-notification-bell.png';

const Notifications = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([
        { id: 1, text: 'Get 50% discount shopping from Roban in 24hrs', time: '2 hours ago', type: 'promo' },
        { id: 2, text: 'Rider has arrived at your pickup location', time: '4 hours ago', type: 'rider' },
        { id: 3, text: 'Vendor has accepted your order', time: '6 hours ago', type: 'order' },
    ]);

    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [notificationToDelete, setNotificationToDelete] = useState(null);

    const getIcon = (type) => {
        switch (type) {
            case 'promo': return <div className="p-2 bg-green-50 rounded-full text-[#1C5E20]"><Bell size={18} /></div>;
            case 'rider': return <div className="p-2 bg-blue-50 rounded-full text-blue-500"><MapPin size={18} /></div>;
            case 'order': return <div className="p-2 bg-green-50 rounded-full text-[#1C5E20]"><CheckCircle2 size={18} /></div>;
            default: return <div className="p-2 bg-zinc-50 rounded-full text-zinc-500"><Bell size={18} /></div>;
        }
    };

    const confirmDelete = () => {
        setNotifications(notifications.filter(n => n.id !== notificationToDelete));
        setDeleteModalVisible(false);
    };

    return (
        <div className="min-h-screen w-full bg-[#f9f9f9] flex flex-col max-w-md mx-auto relative">
            {/* Header */}
            <div className="bg-white pt-10 pb-4 px-4 sticky top-0 z-30 shadow-sm flex items-center justify-center relative">
                <button onClick={() => navigate(-1)} className="absolute left-4 w-10 h-10 flex items-center justify-center text-zinc-800 bg-zinc-100 hover:bg-zinc-400 rounded-full transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-[17px] font-bold text-[#1C5E20]">Notifications</h1>
            </div>

            <div className="px-4 py-6 flex-1">
                {notifications.length > 0 ? (
                    <div className="space-y-4">
                        {notifications.map(notif => (
                            <div key={notif.id} className="bg-white p-4 rounded-xl border border-zinc-100 shadow-sm flex items-start gap-3">
                                {getIcon(notif.type)}
                                <div className="flex-1 mt-0.5">
                                    <p className="text-[13px] font-bold text-zinc-800 leading-tight mb-1 pr-6">{notif.text}</p>
                                    <p className="text-[11px] text-zinc-400 font-medium">{notif.time}</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setNotificationToDelete(notif.id);
                                        setDeleteModalVisible(true);
                                    }}
                                    className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-full shrink-0 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full pt-32 opacity-70">
                        <img src={notificationBell} alt="No notification" />
                        <p className="text-sm font-medium text-zinc-400">You have no notifications yet</p>
                    </div>
                )}
            </div>

            {/* Modal Overlay */}
            {deleteModalVisible && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
                    <div className="bg-white w-full max-w-xs rounded-3xl p-6 text-center shadow-xl animate-fade-in">
                        <h2 className="text-[17px] font-bold text-[#1C5E20] mb-2">Delete Notification</h2>
                        <p className="text-xs text-zinc-500 mb-6 font-medium">Are you sure you want to delete this notification?</p>

                        <div className="space-y-3">
                            <button
                                onClick={confirmDelete}
                                className="w-full bg-[#1C5E20] hover:bg-[#134015] text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-[#1C5E20]/20 text-sm"
                            >
                                Delete
                            </button>
                            <button
                                onClick={() => setDeleteModalVisible(false)}
                                className="w-full bg-transparent hover:bg-zinc-50 text-red-500 font-bold py-3.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-1"
                            >
                                <X size={16} strokeWidth={3} /> Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Notifications;
