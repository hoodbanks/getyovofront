import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User } from 'lucide-react';
import RiderSimpleHeader from '../../../../components/rider/RiderSimpleHeader';

const RiderChangePassword = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState({
        old: false,
        new: false,
        confirm: false
    });
    const [passwords, setPasswords] = useState({
        old: '',
        new: '',
        confirm: ''
    });

    const isFormValid = passwords.old && passwords.new && passwords.confirm && passwords.new === passwords.confirm;

    const handleUpdate = (e) => {
        e.preventDefault();
        navigate('/rider/app/profile/reset/success');
    };

    return (
        <div className="min-h-screen bg-[#F9FAF7] flex flex-col font-sans">
            <RiderSimpleHeader title="Password" icon={User} />

            <div className="flex-1 px-6 py-8">
                <div className="bg-white rounded-[24px] p-6 border border-zinc-100 shadow-sm space-y-6">
                    <div>
                        <label className="text-[14px] font-bold text-[#103D2E] block mb-2">Old Password</label>
                        <div className="relative">
                            <input
                                type={showPassword.old ? "text" : "password"}
                                value={passwords.old}
                                onChange={(e) => setPasswords({ ...passwords, old: e.target.value })}
                                placeholder="Password"
                                className="w-full bg-zinc-50 rounded-xl px-5 py-4 text-[15px] font-medium text-zinc-900 border-none focus:ring-2 focus:ring-[#1C5E20]/20 placeholder:text-zinc-400"
                            />
                            <button
                                onClick={() => setShowPassword({ ...showPassword, old: !showPassword.old })}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400"
                            >
                                {showPassword.old ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="text-[14px] font-bold text-[#103D2E] block mb-2">New Password</label>
                        <div className="relative">
                            <input
                                type={showPassword.new ? "text" : "password"}
                                value={passwords.new}
                                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                placeholder="Password"
                                className="w-full bg-zinc-50 rounded-xl px-5 py-4 text-[15px] font-medium text-zinc-900 border-none focus:ring-2 focus:ring-[#1C5E20]/20 placeholder:text-zinc-400"
                            />
                            <button
                                onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400"
                            >
                                {showPassword.new ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="text-[14px] font-bold text-[#103D2E] block mb-2">Confirm New Password</label>
                        <div className="relative">
                            <input
                                type={showPassword.confirm ? "text" : "password"}
                                value={passwords.confirm}
                                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                placeholder="Confirm password"
                                className="w-full bg-zinc-50 rounded-xl px-5 py-4 text-[15px] font-medium text-zinc-900 border-none focus:ring-2 focus:ring-[#1C5E20]/20 placeholder:text-zinc-400"
                            />
                            <button
                                onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400"
                            >
                                {showPassword.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={handleUpdate}
                        disabled={!isFormValid}
                        className={`w-full font-bold py-4.5 rounded-[12px] transition-all text-[15px] ${isFormValid ? 'bg-[#1C5E20] text-white shadow-lg shadow-[#1C5E20]/20 active:scale-[0.98]' : 'bg-[#CED4D1] text-white cursor-not-allowed'}`}
                    >
                        change password
                    </button>

                    <div className="text-center">
                        <button
                            onClick={() => navigate('/rider/app/profile/reset/forgot-password')}
                            className="text-[14px] text-[#1C5E20] font-bold hover:underline"
                        >
                            Forgot Password?
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RiderChangePassword;
