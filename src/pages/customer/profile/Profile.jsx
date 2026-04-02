import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, Shield, Bell, HeadphonesIcon, FileText, Trash2, LogOut, ChevronRight, X } from 'lucide-react';

const Profile = () => {
    const navigate = useNavigate();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    // Modals state
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [logoutModalVisible, setLogoutModalVisible] = useState(false);

    return (
        <div className="min-h-screen w-full bg-[#F7F9F4] flex flex-col pb-24 relative">
            <div className="bg-white pt-10 pb-4 px-4 shadow-sm rounded-b-3xl sticky top-0 z-30">
                <div className="flex justify-center items-center mb-6">
                    <h1 className="text-[17px] font-bold text-[#1C5E20] flex items-center gap-2">
                        <User size={18} /> Profile
                    </h1>
                </div>

                {/* Profile Header Card */}
                <div className="flex items-center gap-4 bg-zinc-50 border border-zinc-100 rounded-2xl p-4">
                    <div className="w-14 h-14 bg-[#1C5E20] rounded-full flex items-center justify-center text-white text-xl font-bold">
                        O
                    </div>
                    <div className="flex-1">
                        <h2 className="text-[15px] font-bold text-zinc-900 leading-tight">Okenulu Micheal</h2>
                        <p className="text-[12px] font-medium text-zinc-500 mb-0.5">+234 123 456 7890</p>
                        <p className="text-[12px] font-medium text-zinc-500">okenulumicheal@gmail.com</p>
                    </div>
                </div>
            </div>

            <div className="px-4 py-6 space-y-6">

                {/* Menu List */}
                <div className="bg-white rounded-[24px] p-2 shadow-sm border border-zinc-100">

                    <button onClick={() => navigate('/customer/profile/personal-data')} className="w-full flex items-center justify-between p-4 hover:bg-zinc-50 rounded-xl transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500"><User size={16} /></div>
                            <div className="text-left">
                                <h3 className="text-[14px] font-bold text-zinc-900">Personal Data</h3>
                                <p className="text-[11px] font-medium text-zinc-400">Edit Profile</p>
                            </div>
                        </div>
                        <ChevronRight size={18} className="text-zinc-400" />
                    </button>

                    <div className="w-full h-px bg-zinc-50 my-1"></div>

                    <button onClick={() => navigate('/customer/profile/addresses')} className="w-full flex items-center justify-between p-4 hover:bg-zinc-50 rounded-xl transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500"><MapPin size={16} /></div>
                            <div className="text-left">
                                <h3 className="text-[14px] font-bold text-zinc-900">Addresses</h3>
                                <p className="text-[11px] font-medium text-zinc-400">Your delivery addresses</p>
                            </div>
                        </div>
                        <ChevronRight size={18} className="text-zinc-400" />
                    </button>

                    <div className="w-full h-px bg-zinc-50 my-1"></div>

                    <button onClick={() => navigate('/customer/profile/password')} className="w-full flex items-center justify-between p-4 hover:bg-zinc-50 rounded-xl transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500"><Shield size={16} /></div>
                            <div className="text-left">
                                <h3 className="text-[14px] font-bold text-zinc-900">Security</h3>
                                <p className="text-[11px] font-medium text-zinc-400">Change password</p>
                            </div>
                        </div>
                        <ChevronRight size={18} className="text-zinc-400" />
                    </button>

                    <div className="w-full h-px bg-zinc-50 my-1"></div>

                    <div className="w-full flex items-center justify-between p-4">
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500"><Bell size={16} /></div>
                            <div className="text-left">
                                <h3 className="text-[14px] font-bold text-zinc-900">Preferences</h3>
                                <p className="text-[11px] font-medium text-zinc-400">Notifications</p>
                            </div>
                        </div>
                        {/* Toggle Switch */}
                        <div
                            className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${notificationsEnabled ? 'bg-[#1C5E20]' : 'bg-zinc-300'}`}
                            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                        >
                            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${notificationsEnabled ? 'translate-x-5' : 'translate-x-0'}`}></div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[24px] p-2 shadow-sm border border-zinc-100">
                    <button className="w-full flex items-center justify-between p-4 hover:bg-zinc-50 rounded-xl transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500"><HeadphonesIcon size={16} /></div>
                            <div className="text-left">
                                <h3 className="text-[14px] font-bold text-zinc-900">Contact Us</h3>
                                <p className="text-[11px] font-medium text-zinc-400">We are here to help</p>
                            </div>
                        </div>
                        <ChevronRight size={18} className="text-zinc-400" />
                    </button>

                    <div className="w-full h-px bg-zinc-50 my-1"></div>

                    <button className="w-full flex items-center justify-between p-4 hover:bg-zinc-50 rounded-xl transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500"><FileText size={16} /></div>
                            <div className="text-left">
                                <h3 className="text-[14px] font-bold text-zinc-900">Legal</h3>
                                <p className="text-[11px] font-medium text-zinc-400">Terms and privacy policy</p>
                            </div>
                        </div>
                        <ChevronRight size={18} className="text-zinc-400" />
                    </button>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={() => setDeleteModalVisible(true)}
                        className="flex-1 bg-white border border-zinc-200 text-zinc-800 font-bold py-3.5 rounded-xl transition-colors text-[13px] hover:bg-zinc-50"
                    >
                        Delete Account
                    </button>
                    <button
                        onClick={() => setLogoutModalVisible(true)}
                        className="flex-1 bg-white border border-red-200 text-red-500 font-bold py-3.5 rounded-xl transition-colors text-[13px] flex items-center justify-center gap-1.5 hover:bg-red-50"
                    >
                        <LogOut size={16} /> Log Out
                    </button>
                </div>
            </div>

            {/* Delete Account Modal */}
            {deleteModalVisible && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
                    <div className="bg-white w-full max-w-xs rounded-3xl p-6 text-center shadow-xl animate-fade-in">
                        <h2 className="text-[17px] font-bold text-[#1C5E20] mb-2">Delete Account</h2>
                        <p className="text-xs text-zinc-500 mb-6 font-medium px-4">Are you sure you want to delete this account?</p>

                        <div className="space-y-3">
                            <button
                                onClick={() => {/* Delete logic */ }}
                                className="w-full bg-[#1C5E20] hover:bg-[#134015] text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-[#1C5E20]/20 text-sm"
                            >
                                Delete Account
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

            {/* Log Out Modal */}
            {logoutModalVisible && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
                    <div className="bg-white w-full max-w-xs rounded-3xl p-6 text-center shadow-xl animate-fade-in">
                        <h2 className="text-[17px] font-bold text-[#1C5E20] mb-2">Log Out</h2>
                        <p className="text-xs text-zinc-500 mb-6 font-medium px-4">Are you sure you want to log out of this app?</p>

                        <div className="space-y-3">
                            <button
                                onClick={() => navigate('/customer/login')}
                                className="w-full bg-[#1C5E20] hover:bg-[#134015] text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-[#1C5E20]/20 text-sm"
                            >
                                Log Out
                            </button>
                            <button
                                onClick={() => setLogoutModalVisible(false)}
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

export default Profile;
