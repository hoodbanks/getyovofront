import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import RiderSimpleHeader from '../../../../components/rider/RiderSimpleHeader';
import api from '../../../../api/api';

const RiderProfileResetPassword = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const phone = location.state?.phone || '';

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const isFormValid = password && confirmPassword && password === confirmPassword;

    const handleReset = async (e) => {
        e.preventDefault();
        if (!isFormValid || isLoading) return;

        if (!phone) {
            setError('Session expired. Please restart the password reset flow.');
            return;
        }

        setIsLoading(true);
        setError('');
        try {
            await api.post('/rider/auth/set-password', {
                phonenumber: phone,
                newPassword: password,
                confirmPassword,
            });
            navigate('/rider/app/profile/reset/success');
        } catch (err) {
            setError(err.message || 'Failed to reset password. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F9FAF7] flex flex-col font-sans">
            <RiderSimpleHeader title="Reset Password" icon={User} />

            <div className="flex-1 flex flex-col items-center px-6 pt-12">
                <div className="bg-white rounded-[32px] p-8 w-full max-w-[360px] shadow-sm flex flex-col items-center">
                    <h1 className="text-[22px] font-bold text-[#103D2E] mb-2">Enter New Password</h1>
                    <p className="text-[14px] text-zinc-500 font-medium text-center mb-10 leading-relaxed px-4">
                        Enter a strong password to secure your account.
                    </p>

                    {error && (
                        <div className="w-full bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3 mb-6">
                            <AlertCircle size={16} className="text-red-500 shrink-0" />
                            <p className="text-[13px] font-medium text-red-700">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleReset} className="w-full space-y-4">
                        {/* New Password */}
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                                placeholder="New password"
                                className="w-full px-5 py-4 rounded-xl border-none bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-[#1C5E20]/20 focus:bg-white text-[15px] text-zinc-900 placeholder:text-zinc-400 font-bold transition-all pr-12"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        {/* Confirm Password */}
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                required
                                value={confirmPassword}
                                onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                                placeholder="Confirm new password"
                                className="w-full px-5 py-4 rounded-xl border-none bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-[#1C5E20]/20 focus:bg-white text-[15px] text-zinc-900 placeholder:text-zinc-400 font-bold transition-all pr-12"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400"
                            >
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        {/* Mismatch hint */}
                        {password && confirmPassword && password !== confirmPassword && (
                            <p className="text-[12px] font-medium text-red-500">Passwords do not match.</p>
                        )}

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={!isFormValid || isLoading}
                                className={`w-full font-bold py-4 rounded-[12px] transition-all text-[15px] flex items-center justify-center gap-2 ${isFormValid && !isLoading ? 'bg-[#1C5E20] text-white shadow-lg shadow-[#1C5E20]/20 active:scale-[0.98]' : 'bg-[#CED4D1] text-white cursor-not-allowed'}`}
                            >
                                {isLoading ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : 'Continue'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RiderProfileResetPassword;
