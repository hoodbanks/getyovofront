import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

const PersonalData = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: 'Okenulu123',
        firstName: 'Okenulu',
        lastName: 'Micheal',
        phone: '08123456789',
        email: 'okenulumicheal@gmail.com'
    });

    const [successModalVisible, setSuccessModalVisible] = useState(false);

    const handleUpdate = () => {
        setSuccessModalVisible(true);
    };

    return (
        <div className="min-h-screen w-full bg-[#f9f9f9] flex flex-col max-w-md mx-auto relative">
            <div className="bg-white pt-10 pb-4 px-4 sticky top-0 z-30 shadow-sm flex items-center justify-center relative">
                <button onClick={() => navigate(-1)} className="absolute left-4 w-10 h-10 flex items-center justify-center text-zinc-800 hover:bg-zinc-100 rounded-full transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-[17px] font-bold text-[#1C5E20]">Personal Data</h1>
            </div>

            <div className="flex-1 px-4 py-8 overflow-y-auto">
                <div className="flex justify-center mb-8">
                    <div className="w-20 h-20 bg-[#1C5E20] rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-[#1C5E20]/20 relative">
                        O
                        <button className="absolute bottom-0 right-0 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
                            <div className="w-4 h-4 bg-zinc-200 rounded-full"></div>{/* Pencil icon placeholder space */}
                        </button>
                    </div>
                </div>

                <div className="space-y-4 mb-8">
                    <div>
                        <label className="block text-[12px] font-bold text-zinc-500 mb-1.5 ml-1">Username</label>
                        <input
                            type="text"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-4 text-sm font-bold text-zinc-900 focus:outline-none focus:border-[#1C5E20] transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-[12px] font-bold text-zinc-500 mb-1.5 ml-1">First name</label>
                        <input
                            type="text"
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-4 text-sm font-bold text-zinc-900 focus:outline-none focus:border-[#1C5E20] transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-[12px] font-bold text-zinc-500 mb-1.5 ml-1">Last name</label>
                        <input
                            type="text"
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-4 text-sm font-bold text-zinc-900 focus:outline-none focus:border-[#1C5E20] transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-[12px] font-bold text-zinc-500 mb-1.5 ml-1">Phone number</label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-4 text-sm font-bold text-zinc-900 focus:outline-none focus:border-[#1C5E20] transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-[12px] font-bold text-zinc-500 mb-1.5 ml-1">Email address</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-4 text-sm font-bold text-zinc-900 focus:outline-none focus:border-[#1C5E20] transition-colors"
                        />
                    </div>
                </div>

                <button
                    onClick={handleUpdate}
                    className="w-full bg-[#1C5E20] hover:bg-[#134015] text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-[#1C5E20]/20 text-[15px]"
                >
                    Update Profile
                </button>
            </div>

            {/* Success Modal */}
            {successModalVisible && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
                    <div className="bg-white w-full max-w-xs rounded-3xl p-6 text-center shadow-xl animate-fade-in relative pt-10 pb-8">

                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
                            <CheckCircle2 size={48} className="text-[#1C5E20]" />
                        </div>

                        <h2 className="text-[17px] font-bold text-[#1C5E20] mb-2 mt-4">Profile Updated</h2>
                        <p className="text-xs text-zinc-500 mb-8 font-medium px-2">Your profile data has been successfully updated.</p>

                        <div className="space-y-3">
                            <button
                                onClick={() => {
                                    setSuccessModalVisible(false);
                                    navigate(-1);
                                }}
                                className="w-full bg-[#1C5E20] hover:bg-[#134015] text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-[#1C5E20]/20 text-sm"
                            >
                                Done
                            </button>
                            <button
                                onClick={() => setSuccessModalVisible(false)}
                                className="w-full bg-transparent hover:bg-zinc-50 text-[#1C5E20] border border-[#1C5E20] font-bold py-3.5 rounded-xl transition-colors text-sm"
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PersonalData;
