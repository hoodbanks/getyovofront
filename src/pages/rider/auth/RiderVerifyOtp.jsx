import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import api from '../../../api/api';
import logo from '../../../assets/images/GetYovo-Logo2.png';

const RiderVerifyOtp = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const phonenumber = location.state?.phonenumber;
    const isPasswordReset = location.state?.isPasswordReset;
    
    // OTP is 4 digits as per updated requirement
    const [otp, setOtp] = useState(['', '', '', '']);
    const [timer, setTimer] = useState(60);
    const [error, setError] = useState(null);
    const inputRefs = useRef([]);

    useEffect(() => {
        if (!phonenumber) {
            navigate('/rider/login');
        }

        const interval = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, [phonenumber, navigate]);

    const handleChange = (value, index) => {
        if (isNaN(value)) return;
        
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value !== '' && index < 3) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const verifyMutation = useMutation({
        mutationFn: (data) => api.post(
            isPasswordReset ? '/rider/auth/verify-password-otp' : '/rider/auth/verify-otp', 
            data
        ),
        onSuccess: (response) => {
            if (response.success) {
                if (isPasswordReset) {
                    navigate('/rider/reset-password', { state: { phonenumber } });
                } else {
                    navigate('/rider/login', { state: { message: 'Verification successful! You can now log in.' } });
                }
            }
        },
        onError: (err) => {
            setError(err.message || 'Verification failed. Please check your code.');
        },
    });

    const resendMutation = useMutation({
        mutationFn: (data) => api.post(
            isPasswordReset ? '/rider/auth/forgot-password-otp' : '/rider/auth/resend-otp', 
            data
        ),
        onSuccess: () => {
            setTimer(60);
            setError(null);
        },
        onError: (err) => {
            setError(err.message || 'Failed to resend code.');
        },
    });

    const handleVerify = (e) => {
        e.preventDefault();
        setError(null);
        verifyMutation.mutate({
            phonenumber,
            otp: otp.join(''),
        });
    };

    const handleResend = () => {
        if (timer > 0) return;
        resendMutation.mutate({ phonenumber });
    };

    return (
        <div className="min-h-screen bg-[#768C76] flex flex-col items-center justify-center px-4 relative">
            <div className="absolute top-10 left-6 z-20">
                <button onClick={() => navigate(isPasswordReset ? '/rider/forgot-password' : '/rider/login')} className="p-1 bg-white rounded-full shadow-sm hover:bg-zinc-100 transition-colors">
                    <ArrowLeft size={22} className='text-zinc-900' />
                </button>
            </div>

            <div className="bg-white rounded-[32px] p-8 md:p-10 w-full max-w-md shadow-2xl z-10 flex flex-col items-center">
                <img src={logo} alt="GetYovo Logo" className="h-16 mb-6" />
                <h1 className="text-xl font-bold text-[#1C5E20] mb-2">Check Your Message!</h1>
                <p className="text-[14px] text-zinc-500 font-medium text-center mb-8 px-4 leading-relaxed">
                    {isPasswordReset 
                        ? 'We’ve sent a password reset code to ' 
                        : 'We’ve sent a verification code to '
                    }
                    <span className="text-[#1C5E20] font-bold">{phonenumber}</span>. Enter it here.
                </p>

                {error && (
                    <div className="w-full mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 animate-in slide-in-from-top-2 duration-300">
                        <AlertCircle size={18} className="text-rose-500 shrink-0 mt-0.5" />
                        <p className="text-[13px] text-rose-600 font-medium leading-relaxed">{error}</p>
                    </div>
                )}

                <form onSubmit={handleVerify} className="w-full flex flex-col items-center gap-8">
                    <div className="flex gap-4">
                        {otp.map((data, index) => (
                            <input
                                key={index}
                                ref={(el) => (inputRefs.current[index] = el)}
                                type="tel"
                                maxLength="1"
                                className="w-12 h-14 bg-zinc-100 border-none rounded-xl text-center text-xl font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#00B074]/30 focus:bg-white transition-all shadow-sm disabled:opacity-50"
                                value={data}
                                disabled={verifyMutation.isPending}
                                onChange={(e) => handleChange(e.target.value, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                onFocus={(e) => e.target.select()}
                            />
                        ))}
                    </div>

                    <p className="text-sm text-zinc-600 font-medium text-center">
                        Didn't receive code? <br className="sm:hidden" />
                        <button 
                            type="button" 
                            disabled={timer > 0 || resendMutation.isPending}
                            onClick={handleResend}
                            className={`font-bold transition-opacity ${timer > 0 || resendMutation.isPending ? 'text-zinc-400 cursor-not-allowed' : 'text-[#103D2E] hover:underline'}`}
                        >
                            {resendMutation.isPending ? 'Sending...' : timer > 0 ? `Resend in ${timer}s` : 'Resend Code'}
                        </button>
                    </p>

                    <button
                        type="submit"
                        disabled={verifyMutation.isPending || otp.some(v => v === '')}
                        className={`w-full font-bold py-4 rounded-xl transition-colors text-sm flex items-center justify-center gap-2 ${!otp.some(v => v === '') && !verifyMutation.isPending ? 'bg-[#1C5E20] hover:bg-[#002414] text-white shadow-lg shadow-[#002f1a]/30' : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'}`}
                    >
                        {verifyMutation.isPending ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Verifying...
                            </>
                        ) : (
                            isPasswordReset ? 'Verify & Reset' : 'Verify Account'
                        )}
                    </button>
                </form>
            </div>

            <div className="w-32 h-1 bg-zinc-900 rounded-full mt-auto mb-2 opacity-50 absolute bottom-2"></div>
        </div>
    );
};

export default RiderVerifyOtp;
