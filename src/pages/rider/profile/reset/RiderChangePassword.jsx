import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Loader2, AlertCircle } from 'lucide-react';
import RiderSimpleHeader from '../../../../components/rider/RiderSimpleHeader';
import api from '../../../../api/api';
import { useAuthStore } from '../../../../store/useAuthStore';

const RiderChangePassword = () => {
    const navigate = useNavigate();
    const { accessToken } = useAuthStore();

    const [showPassword, setShowPassword] = useState({ old: false, new: false, confirm: false });
    const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const isFormValid = passwords.old && passwords.new && passwords.confirm && passwords.new === passwords.confirm;

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!isFormValid || isLoading) return;

        if (passwords.new !== passwords.confirm) {
            setError('New passwords do not match.');
            return;
        }

        setIsLoading(true);
        setError('');
        try {
            await api.post('/rider/auth/reset-password', {
                oldPassword: passwords.old,
                newPassword: passwords.new,
            }, accessToken);
            navigate('/rider/app/profile/reset/success');
        } catch (err) {
            setError(err.message || 'Failed to update password. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const fields = [
        { key: 'old', label: 'Old Password', placeholder: 'Current password', show: showPassword.old },
        { key: 'new', label: 'New Password', placeholder: 'New password', show: showPassword.new },
        { key: 'confirm', label: 'Confirm New Password', placeholder: 'Confirm new password', show: showPassword.confirm },
    ];

    return (
        <div className="min-h-screen bg-[#F9FAF7] flex flex-col font-sans">
            <RiderSimpleHeader title="Password" icon={User} />

            <div className="flex-1 px-6 py-8">
                <div className="bg-white rounded-[24px] p-6 border border-zinc-100 shadow-sm space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3">
                            <AlertCircle size={16} className="text-red-500 shrink-0" />
                            <p className="text-[13px] font-medium text-red-700">{error}</p>
                        </div>
                    )}

                    {fields.map(({ key, label, placeholder, show }) => (
                        <div key={key}>
                            <label className="text-[14px] font-bold text-[#103D2E] block mb-2">{label}</label>
                            <div className="relative">
                                <input
                                    type={show ? 'text' : 'password'}
                                    value={passwords[key]}
                                    onChange={(e) => setPasswords({ ...passwords, [key]: e.target.value })}
                                    placeholder={placeholder}
                                    className="w-full bg-zinc-50 rounded-xl px-5 py-4 text-[15px] font-medium text-zinc-900 border-none focus:ring-2 focus:ring-[#1C5E20]/20 placeholder:text-zinc-400 outline-none pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword({ ...showPassword, [key]: !show })}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400"
                                >
                                    {show ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>
                    ))}

                    {passwords.new && passwords.confirm && passwords.new !== passwords.confirm && (
                        <p className="text-[12px] font-medium text-red-500 -mt-3">Passwords do not match.</p>
                    )}

                    <button
                        onClick={handleUpdate}
                        disabled={!isFormValid || isLoading}
                        className={`w-full font-bold py-4 rounded-[12px] transition-all text-[15px] flex items-center justify-center gap-2 ${isFormValid && !isLoading ? 'bg-[#1C5E20] text-white shadow-lg shadow-[#1C5E20]/20 active:scale-[0.98]' : 'bg-[#CED4D1] text-white cursor-not-allowed'}`}
                    >
                        {isLoading ? <><Loader2 size={18} className="animate-spin" /> Updating...</> : 'Change Password'}
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
