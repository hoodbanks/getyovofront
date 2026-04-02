import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import logo from '../../../assets/images/GetYovo-Logo2.png';

const ForgotPassword = () => {
    const [phone, setPhone] = useState('');
    const navigate = useNavigate();

    const handleSendCode = (e) => {
        e.preventDefault();
        navigate('/customer/verify-otp', { state: { flow: 'reset' } });
    };

    return (
        <div className="min-h-screen bg-[#768C76] flex flex-col items-center justify-center relative px-4 text-center">
            {/* Top Back Button */}
            <div className="absolute top-10 left-6 z-20">
                <button onClick={() => navigate(-1)} className="p-1 bg-white rounded-full text-white hover:bg-white/30 transition-colors backdrop-blur-sm">
                    <ArrowLeft size={22} className='text-black' />
                </button>
            </div>

            <div className="bg-white rounded-[32px] p-8 md:p-10 w-full max-w-md shadow-2xl z-10 mb-8">
                <div className="flex flex-col items-center mb-8">
                    <img src={logo} alt="GetYovo Logo" className="h-18 mb-6" />
                    <h1 className="text-xl font-bold text-[#1C5E20] mb-1">Reset Password</h1>
                    <p className="text-[13px] text-zinc-500 font-medium px-4">
                        Enter the phone number linked to your account.
                    </p>
                </div>

                <form onSubmit={handleSendCode} className="space-y-6">
                    <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Phone number (e.g. 0803...)"
                        className="w-full px-5 py-4 rounded-xl border-none bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-[#00B074]/30 focus:bg-white text-sm text-zinc-900 placeholder:text-zinc-400 font-medium transition-all"
                    />

                    <button
                        type="submit"
                        className={`w-full font-bold py-4 rounded-xl transition-colors text-sm ${phone ? 'bg-[#1C5E20] hover:bg-[#002414] text-white shadow-lg shadow-[#002f1a]/30' : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'}`}
                        disabled={!phone}
                    >
                        Send Code
                    </button>

                    <div className="pt-2">
                        <p className="text-[12px] text-zinc-500 font-medium tracking-tight">
                            Remember your login?{' '}
                            <Link to="/customer/login" className="text-[#1C5E20] font-bold hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </form>
            </div>

            <div className="w-32 h-1 bg-zinc-900 rounded-full mt-auto mb-2 opacity-50 absolute bottom-2"></div>
        </div>
    );
};

export default ForgotPassword;
