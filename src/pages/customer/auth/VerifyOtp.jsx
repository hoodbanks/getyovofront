import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import logo from '../../../assets/images/GetYovo-Logo2.png';

const VerifyOtp = () => {
    const [otp, setOtp] = useState(['', '', '', '']);
    const inputRefs = useRef([]);
    const navigate = useNavigate();
    const location = useLocation();

    // Check if this OTP is for registration or reset
    const flow = location.state?.flow || 'register';

    const handleChange = (index, value) => {
        if (isNaN(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Move to next input if filled
        if (value !== '' && index < 3) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handleVerify = (e) => {
        e.preventDefault();
        const code = otp.join('');
        if (code.length === 4) {
            if (flow === 'reset') {
                navigate('/customer/reset-password');
            } else {
                navigate('/customer/success', { state: { type: 'verified' } });
            }
        }
    };

    const isCodeComplete = otp.every(digit => digit !== '');

    return (
        <div className="min-h-screen bg-[#768C76] flex flex-col items-center justify-center relative px-4 text-center">
            {/* Top Back Button */}
            <div className="absolute top-10 left-6 z-20">
                <button onClick={() => navigate(-1)} className="p-1 bg-white rounded-full text-white hover:bg-white/30 transition-colors backdrop-blur-sm">
                    <ArrowLeft size={22} className='text-black' />
                </button>
            </div>

            <div className="bg-white rounded-[32px] p-8 md:p-10 w-full max-w-md shadow-2xl z-10 mb-8 mt-12">
                <div className="flex flex-col items-center mb-8">
                    <img src={logo} alt="GetYovo Logo" className="h-18 mb-8" />
                    <h1 className="text-xl font-bold text-[#1C5E20] mb-2">Check Your Messages!</h1>
                    <p className="text-[13px] text-zinc-500 font-medium px-2 leading-relaxed">
                        We've sent a code to your number. Enter it here to verify your account.
                    </p>
                </div>

                <form onSubmit={handleVerify} className="space-y-8">
                    <div className="flex justify-center gap-3 md:gap-4">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => (inputRefs.current[index] = el)}
                                type="text"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className="w-14 h-14 text-center text-xl font-bold rounded-2xl border-none bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-[#00B074]/30 focus:bg-white text-zinc-900 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]"
                            />
                        ))}
                    </div>

                    <div>
                        <p className="text-[12px] text-zinc-500 font-medium mb-6">
                            Didn't receive code?{' '}
                            <button type="button" className="text-[#002f1a] font-bold hover:underline bg-transparent border-none p-0 cursor-pointer">
                                Resend in 30s
                            </button>
                        </p>

                        <button
                            type="submit"
                            className={`w-full font-bold py-4 rounded-xl transition-colors text-sm ${isCodeComplete ? 'bg-[#1C5E20] hover:bg-[#002414] text-white shadow-lg shadow-[#002f1a]/30' : 'bg-zinc-200 text-zinc-400'}`}
                        >
                            Verify
                        </button>
                    </div>
                </form>
            </div>

            <div className="w-32 h-1 bg-zinc-900 rounded-full mt-auto mb-2 opacity-50 absolute bottom-2"></div>
        </div>
    );
};

export default VerifyOtp;
