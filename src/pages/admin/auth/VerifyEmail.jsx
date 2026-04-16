import React, { useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import api from '../../../api/api';
import logo from '../../../assets/images/GetYovo-Logo2.png';

const VerifyEmail = () => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState(null);
    const inputRefs = useRef([]);
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;

    const verifyOtpMutation = useMutation({
        mutationFn: (otpCode) => api.post('/superadmin/auth/verify-password-otp', { email, otp: otpCode }),
        onSuccess: (response) => {
            if (response.success) {
                navigate('/admin/reset-password', { state: { email } });
            }
        },
        onError: (err) => {
            setError(err.message || 'Invalid verification code.');
        },
    });

    const handleChange = (index, value) => {
        if (isNaN(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1); // Only take the last character
        setOtp(newOtp);

        // Move to next input if filled
        if (value !== '' && index < 5) {
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
        setError(null);
        const code = otp.join('');
        if (code.length === 6) {
            verifyOtpMutation.mutate(code);
        } else {
            setError('Please enter all 6 digits.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 relative overflow-hidden">
            <div className="bg-white rounded-[24px] p-8 md:p-10 w-full max-w-md shadow-[0_8px_30px_rgb(0,0,0,0.20)] z-10 mx-4">
                <div className="flex flex-col items-center mb-6 text-center">
                    <img src={logo} alt="GetYovo Logo" className="h-12 mb-6" />
                    <h1 className="text-xl font-bold text-zinc-800 mb-2">Check your email</h1>
                    <p className="text-sm text-zinc-500 px-2">
                        We've sent a password reset code to your email address. If you don't see it, check your spam or junk folder.
                    </p>
                </div>

                <form onSubmit={handleVerify} className="space-y-8 mt-8">
                    {error && (
                        <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-medium text-center animate-in fade-in slide-in-from-top-1">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-between gap-2">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => (inputRefs.current[index] = el)}
                                type="text"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className="w-12 h-12 md:w-14 md:h-14 text-center text-xl font-bold rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#00B074]/20 focus:border-[#00B074] text-zinc-800 bg-white transition-all shadow-sm disabled:opacity-50"
                                disabled={verifyOtpMutation.isPending}
                            />
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={verifyOtpMutation.isPending}
                        className="w-full bg-[#002f1a] hover:bg-[#002414] text-white font-medium py-3.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        {verifyOtpMutation.isPending ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Verifying...
                            </>
                        ) : (
                            'Verify Code'
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center bg-zinc-100/50 -mx-8 -mb-8 sm:-mx-10 sm:-mb-10 py-5 rounded-b-[24px]">
                    <p className="text-[13px] text-zinc-500 font-medium">
                        Didn't receive the email?{' '}
                        <button className="text-[#00B074] font-bold hover:underline bg-transparent border-none p-0 cursor-pointer">
                            Resend
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;
