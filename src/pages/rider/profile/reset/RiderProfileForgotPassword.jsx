import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Loader2, AlertCircle } from 'lucide-react';
import RiderSimpleHeader from '../../../../components/rider/RiderSimpleHeader';
import api from '../../../../api/api';

const RiderProfileForgotPassword = () => {
    const navigate = useNavigate();
    const [phone, setPhone] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSendCode = async (e) => {
        e.preventDefault();
        if (!phone || isLoading) return;

        setIsLoading(true);
        setError('');
        try {
            await api.post('/rider/auth/forgot-password-otp', { phonenumber: phone });
            // Pass phone number to verify OTP screen
            navigate('/rider/app/profile/reset/verify-otp', { state: { phone } });
        } catch (err) {
            setError(err.message || 'Failed to send OTP. Check the number and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F9FAF7] flex flex-col font-sans">
            <RiderSimpleHeader title="Reset Password" icon={User} />

            <div className="flex-1 flex flex-col items-center px-6 pt-12">
                <div className="bg-white rounded-[32px] p-8 w-full max-w-[360px] shadow-sm flex flex-col items-center">
                    <h1 className="text-[22px] font-bold text-[#103D2E] mb-2">Reset Password</h1>
                    <p className="text-[14px] text-zinc-500 font-medium text-center mb-10 leading-relaxed px-4">
                        Enter your phone number to receive a reset code via SMS.
                    </p>

                    {error && (
                        <div className="w-full bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3 mb-6">
                            <AlertCircle size={16} className="text-red-500 shrink-0" />
                            <p className="text-[13px] font-medium text-red-700">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSendCode} className="w-full space-y-8">
                        <div className="space-y-2">
                            <input
                                type="tel"
                                required
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="Phone number (e.g. 0803...)"
                                className="w-full px-5 py-4 rounded-xl border-none bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-[#1C5E20]/20 focus:bg-white text-[15px] text-zinc-900 placeholder:text-zinc-400 font-bold transition-all"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={!phone || isLoading}
                            className={`w-full font-bold py-4 rounded-[12px] transition-all text-[15px] flex items-center justify-center gap-2 ${phone && !isLoading ? 'bg-[#1C5E20] text-white shadow-lg shadow-[#1C5E20]/20 active:scale-[0.98]' : 'bg-[#CED4D1] text-white cursor-not-allowed'}`}
                        >
                            {isLoading ? <><Loader2 size={18} className="animate-spin" /> Sending...</> : 'Send Code'}
                        </button>

                        <div className="text-center pt-2">
                            <p className="text-[14px] text-zinc-500 font-medium">
                                Remember your password?{' '}
                                <button
                                    type="button"
                                    onClick={() => navigate(-1)}
                                    className="text-[#1C5E20] font-bold hover:underline"
                                >
                                    Go back
                                </button>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RiderProfileForgotPassword;
