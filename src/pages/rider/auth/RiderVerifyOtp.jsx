import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import logo from '../../../assets/images/GetYovo-Logo2.png';

const RiderVerifyOtp = () => {
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
        navigate('/rider/reset-password');
    };

    return (
        <div className="min-h-screen bg-[#768C76] flex flex-col items-center justify-center px-4 relative">
            <div className="absolute top-10 left-6 z-20">
                <button onClick={() => navigate('/rider/forgot-password')} className="p-1 bg-white rounded-full shadow-sm">
                    <ArrowLeft size={22} className='text-zinc-900' />
                </button>
            </div>

            <div className="bg-white rounded-[32px] p-8 md:p-10 w-full max-w-md shadow-2xl z-10 flex flex-col items-center">
                <img src={logo} alt="GetYovo Logo" className="h-16 mb-6" />
                <h1 className="text-2xl font-bold text-[#1C5E20] mb-2">Check Your Message!</h1>
                <p className="text-[14px] text-zinc-500 font-medium text-center mb-8 px-4">
                    We’ve sent a code to your number. Enter it here to verify your account.
                </p>

                <form onSubmit={handleVerify} className="w-full flex flex-col items-center gap-8">
                    <div className="flex gap-4">
                        {otp.map((data, index) => (
                            <input
                                key={index}
                                type="text"
                                maxLength="1"
                                className="w-12 h-14 bg-zinc-100 border-none rounded-xl text-center text-xl font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#00B074]/30 focus:bg-white transition-all shadow-sm"
                                value={data}
                                onChange={(e) => handleChange(e.target, index)}
                                onFocus={(e) => e.target.select()}
                            />
                        ))}
                    </div>

                    <p className="text-sm text-zinc-600 font-medium">
                        Didn't receive code? <button type="button" className="text-[#103D2E] font-bold">Resend in {timer}s</button>
                    </p>

                    <button
                        type="submit"
                        className={`w-full font-bold py-4 rounded-xl transition-colors text-sm ${otp.every(v => v !== '') ? 'bg-[#1C5E20] hover:bg-[#002414] text-white shadow-lg shadow-[#002f1a]/30' : 'bg-zinc-200 text-zinc-400'}`}
                        disabled={otp.some(v => v === '')}
                    >
                        Verify
                    </button>
                </form>
            </div>

            <div className="w-32 h-1 bg-zinc-900 rounded-full mt-auto mb-2 opacity-50 absolute bottom-2"></div>
        </div>
    );
};

export default RiderVerifyOtp;
