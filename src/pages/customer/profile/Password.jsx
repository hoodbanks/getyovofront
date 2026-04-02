import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ChevronDown } from 'lucide-react';

const Password = () => {
    const navigate = useNavigate();

    // Using a simplistic native select replacement look as shown in UI 
    // where they look like dropdowns but they are password fields.
    const [currentPassword, setCurrentPassword] = useState('password123');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // UI state
    const [successModalVisible, setSuccessModalVisible] = useState(false);

    const handleUpdate = () => {
        // Simple mock behavior
        if (newPassword && newPassword === confirmPassword) {
            setSuccessModalVisible(true);
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#f9f9f9] flex flex-col max-w-md mx-auto relative">
            <div className="bg-white pt-10 pb-4 px-4 sticky top-0 z-30 shadow-sm flex items-center justify-center relative">
                <button onClick={() => navigate(-1)} className="absolute left-4 w-10 h-10 flex items-center justify-center text-zinc-800 hover:bg-zinc-100 rounded-full transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-[17px] font-bold text-[#1C5E20]">Password</h1>
            </div>

            <div className="flex-1 px-4 py-8 overflow-y-auto">
                <div className="space-y-5 mb-8">
                    <div>
                        <label className="block text-[12px] font-bold text-zinc-500 mb-1.5 ml-1">Current password</label>
                        <div className="relative">
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-4 text-sm font-bold text-zinc-900 focus:outline-none focus:border-[#1C5E20] transition-colors"
                            />
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                        </div>
                        {/* Figma shows an error state alternative here */}
                    </div>

                    <div>
                        <label className="block text-[12px] font-bold text-zinc-500 mb-1.5 ml-1">New password</label>
                        <div className="relative">
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-4 text-sm font-bold text-zinc-900 focus:outline-none focus:border-[#1C5E20] transition-colors"
                            />
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[12px] font-bold text-zinc-500 mb-1.5 ml-1">Confirm new password</label>
                        <div className="relative">
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-4 text-sm font-bold text-zinc-900 focus:outline-none focus:border-[#1C5E20] transition-colors"
                            />
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleUpdate}
                    className="w-full bg-[#1C5E20] hover:bg-[#134015] text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-[#1C5E20]/20 text-[15px]"
                >
                    Update Password
                </button>
            </div>

            {/* Success Modal */}
            {successModalVisible && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
                    <div className="bg-white w-full max-w-xs rounded-3xl p-6 text-center shadow-xl animate-fade-in relative pt-10 pb-8">

                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
                            <div className="relative">
                                {/* Lock inside shield concept from UI */}
                                <CheckCircle2 size={48} className="text-[#1C5E20]" />
                            </div>
                        </div>

                        <h2 className="text-[17px] font-bold text-[#1C5E20] mb-2 mt-4">Password Updated</h2>
                        <p className="text-xs text-zinc-500 mb-8 font-medium px-2">Your new password has been successfully updated.</p>

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

export default Password;
