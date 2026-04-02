import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import RiderSimpleHeader from '../../../../components/rider/RiderSimpleHeader';

const RiderProfileVerifyOtp = () => {
    const navigate = useNavigate();
    const [otp, setOtp] = useState(['', '', '', '']);
    const [timer, setTimer] = useState(30);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleChange = (element, index) => {
        if (isNaN(element.value)) return false;
        setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);
        if (element.nextSibling) {
            element.nextSibling.focus();
        }
    };

    const handleVerify = (e) => {
        e.preventDefault();
        navigate('/rider/app/profile/reset/new-password');
    };

    return (
        <div className="min-h-screen bg-[#F9FAF7] flex flex-col font-sans">
            <RiderSimpleHeader title="Reset Password" icon={User} />

            <div className="flex-1 flex flex-col items-center px-6 pt-12">
                <div className="bg-white rounded-[32px] p-8 w-full max-w-[360px] shadow-sm flex flex-col items-center">
                    <h1 className="text-[22px] font-bold text-[#103D2E] mb-2 text-center">Check Your Messages!</h1>
                    <p className="text-[14px] text-zinc-500 font-medium text-center mb-10 leading-relaxed px-2">
                        We've sent a code to your number. Enter it here to verify your account.
                    </p>

                    <form onSubmit={handleVerify} className="w-full space-y-8 flex flex-col items-center">
                        <div className="flex gap-3 justify-center mb-2">
                            {otp.map((data, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    maxLength="1"
                                    className="w-14 h-16 bg-zinc-100 border-none rounded-xl text-center text-xl font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#1C5E20]/20 focus:bg-white transition-all"
                                    value={data}
                                    onChange={(e) => handleChange(e.target, index)}
                                    onFocus={(e) => e.target.select()}
                                />
                            ))}
                        </div>

                        <p className="text-[14px] text-zinc-500 font-medium mb-4">
                            Didn't receive code? <button type="button" className="text-[#1C5E20] font-bold">Resend in {timer}s</button>
                        </p>

                        <button
                            type="submit"
                            className={`w-full font-bold py-4.5 rounded-[12px] transition-all text-[15px] ${otp.every(v => v !== '') ? 'bg-[#1C5E20] text-white shadow-lg shadow-[#1C5E20]/20 active:scale-[0.98]' : 'bg-[#CED4D1] text-white cursor-not-allowed'}`}
                            disabled={otp.some(v => v === '')}
                        >
                            Verify
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RiderProfileVerifyOtp;
