import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { KeyRound, UserCheck } from 'lucide-react';

const SuccessState = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Check if this is for registration verification or password reset
    const type = location.state?.type || 'verified'; // 'verified' or 'reset'

    const isReset = type === 'reset';

    return (
        <div className="min-h-screen bg-[#2d3a33] flex flex-col items-center justify-center p-4 relative">
            <div className="bg-white rounded-[40px] p-10 w-full max-w-sm flex flex-col items-center text-center shadow-2xl z-10 py-16">

                {/* Status Icon */}
                <div className="mb-8 relative">
                    {/* Decorative Rings */}
                    <div className="absolute inset-0 border-[3px] border-[#00B074]/30 rounded-full scale-[1.3] z-0"></div>
                    <div className="relative z-10 w-24 h-24 rounded-full flex items-center justify-center bg-white border-[3px] border-[#00B074]">
                        {isReset ? (
                            <div className="bg-[#fff0ed] p-3 rounded-full">
                                <KeyRound size={32} className="text-[#ff5238] drop-shadow-sm" strokeWidth={2.5} />
                            </div>
                        ) : (
                            <div className="bg-[#00B074] p-3 rounded-full shadow-lg shadow-[#00B074]/30">
                                <UserCheck size={32} className="text-white drop-shadow-sm" strokeWidth={2.5} />
                            </div>
                        )}

                        {/* Little checkmark badge for reset */}
                        {isReset && (
                            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-zinc-100">
                                <div className="bg-[#00B074] w-6 h-6 rounded-full flex items-center justify-center text-white">
                                    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <h1 className="text-xl font-bold text-[#1C5E20] mb-2">
                    {isReset ? 'Password Updated' : 'Account Verified'}
                </h1>

                <p className="text-[13px] text-zinc-500 font-medium mb-10 px-4">
                    {isReset
                        ? 'Your password has been reset successfully.'
                        : 'Your account has been verified successfully'}
                </p>

                <button
                    onClick={() => navigate(isReset ? '/customer/login' : '/')}
                    className="w-full bg-[#1C5E20] hover:bg-[#002414] text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-[#002f1a]/20 text-sm"
                >
                    {isReset ? 'Proceed to Login' : 'Proceed to Homepage'}
                </button>
            </div>

            <div className="w-32 h-1 bg-zinc-900 rounded-full mt-auto mb-2 opacity-50 absolute bottom-2"></div>
        </div>
    );
};

export default SuccessState;
