import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import logo from '../../../assets/images/GetYovo-Logo2.png';

const RiderForgotPassword = () => {
    const navigate = useNavigate();
    const [phone, setPhone] = useState('');

    const handleSendCode = (e) => {
        e.preventDefault();
        navigate('/rider/verify-otp');
    };

    return (
        <div className="min-h-screen bg-[#768C76] flex flex-col items-center justify-center px-4 relative">
            {/* Top Back Button */}
            <div className="absolute top-10 left-6 z-20">
                <button onClick={() => navigate('/rider/login')} className="p-1 bg-white rounded-full transition-colors backdrop-blur-sm shadow-sm">
                    <ArrowLeft size={22} className='text-zinc-900' />
                </button>
            </div>

            <div className="bg-white rounded-[32px] p-8 md:p-10 w-full max-w-md shadow-2xl z-10 flex flex-col items-center">
                <img src={logo} alt="GetYovo Logo" className="h-16 mb-6" />
                <h1 className="text-2xl font-bold text-[#1C5E20] mb-2">Reset Password</h1>
                <p className="text-[14px] text-zinc-500 font-medium text-center mb-10 leading-relaxed px-4">
                    Enter the phone number linked to your account.
                </p>

                <form onSubmit={handleSendCode} className="w-full space-y-8">
                    <div className="space-y-2">
                        <input
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Business phone (e.g. 0803...)"
                            className="w-full px-5 py-4 rounded-xl border-none bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#00B074]/30 focus:bg-white text-sm text-zinc-900 placeholder:text-zinc-400 font-medium transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        className={`w-full font-bold py-4 rounded-xl transition-colors text-sm ${phone ? 'bg-[#1C5E20] hover:bg-[#002414] text-white shadow-lg shadow-[#002f1a]/30' : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'}`}
                        disabled={!phone}
                    >
                        Send Code
                    </button>

                    <div className="text-center pt-2">
                        <p className="text-[13px] text-zinc-500 font-medium">
                            Remember your login? <button type="button" onClick={() => navigate('/rider/login')} className="text-[#1C5E20] font-bold">Sign in</button>
                        </p>
                    </div>
                </form>
            </div>

            <div className="w-32 h-1 bg-zinc-900 rounded-full mt-auto mb-2 opacity-50 absolute bottom-2"></div>
        </div>
    );
};

export default RiderForgotPassword;
