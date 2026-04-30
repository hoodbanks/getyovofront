import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Loader2, AlertCircle } from 'lucide-react';
import RiderSimpleHeader from '../../../../components/rider/RiderSimpleHeader';
import api from '../../../../api/api';

const RiderProfileVerifyOtp = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const phone = location.state?.phone || '';

    const [otp, setOtp] = useState(['', '', '', '']);
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [error, setError] = useState('');
    const inputRefs = useRef([]);

    // Countdown timer
    useEffect(() => {
        if (timer <= 0) { setCanResend(true); return; }
        const interval = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) { setCanResend(true); return 0; }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [timer]);

    const handleChange = (value, index) => {
        if (!/^\d?$/.test(value)) return; // digits only
        const updated = [...otp];
        updated[index] = value;
        setOtp(updated);
        setError('');
        // Auto-advance
        if (value && index < otp.length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
        const updated = [...otp];
        pasted.split('').forEach((char, i) => { updated[i] = char; });
        setOtp(updated);
        inputRefs.current[Math.min(pasted.length, otp.length - 1)]?.focus();
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        const code = otp.join('');
        if (code.length < otp.length || isVerifying) return;

        setIsVerifying(true);
        setError('');
        try {
            await api.post('/rider/auth/verify-password-otp', {
                phonenumber: phone,
                otp: code,
            });
            // Pass phone to the new password screen
            navigate('/rider/app/profile/reset/new-password', { state: { phone } });
        } catch (err) {
            setError(err.message || 'Incorrect OTP. Please try again.');
            setOtp(['', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResend = async () => {
        if (!canResend || isResending) return;
        setIsResending(true);
        setError('');
        try {
            await api.post('/rider/auth/forgot-password-otp', { phonenumber: phone });
            setOtp(['', '', '', '']);
            setTimer(60);
            setCanResend(false);
            inputRefs.current[0]?.focus();
        } catch (err) {
            setError(err.message || 'Could not resend OTP. Try again shortly.');
        } finally {
            setIsResending(false);
        }
    };

    const isComplete = otp.every((v) => v !== '');

    return (
        <div className="min-h-screen bg-[#F9FAF7] flex flex-col font-sans">
            <RiderSimpleHeader title="Reset Password" icon={User} />

            <div className="flex-1 flex flex-col items-center px-6 pt-12">
                <div className="bg-white rounded-[32px] p-8 w-full max-w-[360px] shadow-sm flex flex-col items-center">
                    <h1 className="text-[22px] font-bold text-[#103D2E] mb-2 text-center">Check Your Messages!</h1>
                    <p className="text-[14px] text-zinc-500 font-medium text-center mb-2 leading-relaxed px-2">
                        We've sent a 4-digit code via SMS to
                    </p>
                    {phone && (
                        <p className="text-[14px] font-bold text-[#1C5E20] mb-8">{phone}</p>
                    )}

                    {error && (
                        <div className="w-full bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3 mb-6">
                            <AlertCircle size={16} className="text-red-500 shrink-0" />
                            <p className="text-[13px] font-medium text-red-700">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleVerify} className="w-full space-y-8 flex flex-col items-center">
                        <div className="flex gap-3 justify-center" onPaste={handlePaste}>
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => (inputRefs.current[index] = el)}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(e.target.value, index)}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                    onFocus={(e) => e.target.select()}
                                    className={`w-14 h-16 bg-zinc-100 border-2 rounded-xl text-center text-xl font-bold text-zinc-900 focus:outline-none transition-all ${digit ? 'border-[#1C5E20] bg-[#1C5E20]/5' : 'border-transparent focus:border-[#1C5E20]/30 focus:bg-white'}`}
                                />
                            ))}
                        </div>

                        <p className="text-[14px] text-zinc-500 font-medium">
                            Didn't receive code?{' '}
                            {canResend ? (
                                <button
                                    type="button"
                                    onClick={handleResend}
                                    disabled={isResending}
                                    className="text-[#1C5E20] font-bold hover:underline disabled:opacity-60"
                                >
                                    {isResending ? 'Resending...' : 'Resend'}
                                </button>
                            ) : (
                                <span className="text-zinc-400 font-bold">Resend in {timer}s</span>
                            )}
                        </p>

                        <button
                            type="submit"
                            disabled={!isComplete || isVerifying}
                            className={`w-full font-bold py-4 rounded-[12px] transition-all text-[15px] flex items-center justify-center gap-2 ${isComplete && !isVerifying ? 'bg-[#1C5E20] text-white shadow-lg shadow-[#1C5E20]/20 active:scale-[0.98]' : 'bg-[#CED4D1] text-white cursor-not-allowed'}`}
                        >
                            {isVerifying ? <><Loader2 size={18} className="animate-spin" /> Verifying...</> : 'Verify'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RiderProfileVerifyOtp;
