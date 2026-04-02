import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import RiderSimpleHeader from '../../../../components/rider/RiderSimpleHeader';

const RiderProfileForgotPassword = () => {
    const navigate = useNavigate();
    const [phone, setPhone] = useState('');

    const handleSendCode = (e) => {
        e.preventDefault();
        navigate('/rider/app/profile/reset/verify-otp');
    };

    return (
        <div className="min-h-screen bg-[#F9FAF7] flex flex-col font-sans">
            <RiderSimpleHeader title="Reset Password" icon={User} />

            <div className="flex-1 flex flex-col items-center px-6 pt-12">
                <div className="bg-white rounded-[32px] p-8 w-full max-w-[360px] shadow-sm flex flex-col items-center">
                    <h1 className="text-[22px] font-bold text-[#103D2E] mb-2">Reset Password</h1>
                    <p className="text-[14px] text-zinc-500 font-medium text-center mb-10 leading-relaxed px-4">
                        Enter the email address linked to your account.
                    </p>

                    <form onSubmit={handleSendCode} className="w-full space-y-8">
                        <div className="space-y-2">
                            <input
                                type="tel"
                                required
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="Business phone (e.g. 0803...)"
                                className="w-full px-5 py-4.5 rounded-xl border-none bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-[#1C5E20]/20 focus:bg-white text-[15px] text-zinc-900 placeholder:text-zinc-400 font-bold transition-all"
                            />
                        </div>

                        <button
                            type="submit"
                            className={`w-full font-bold py-4.5 rounded-[12px] transition-all text-[15px] ${phone ? 'bg-[#1C5E20] text-white shadow-lg shadow-[#1C5E20]/20 active:scale-[0.98]' : 'bg-[#CED4D1] text-white cursor-not-allowed'}`}
                            disabled={!phone}
                        >
                            Send Code
                        </button>

                        <div className="text-center pt-2">
                            <p className="text-[14px] text-zinc-500 font-medium">
                                Remember your login? <button type="button" onClick={() => navigate('/rider/app/dashboard')} className="text-[#1C5E20] font-bold hover:underline">Home</button>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RiderProfileForgotPassword;
