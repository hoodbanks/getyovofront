import React from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound } from 'lucide-react';

const ResetSuccess = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 relative overflow-hidden">
            <div className="bg-white rounded-[24px] p-8 md:p-10 w-full max-w-md shadow-[0_8px_30px_rgb(0,0,0,0.20)] z-10 mx-4 text-center">
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 rounded-full bg-[#E6F7F1] flex items-center justify-center relative">
                        <div className="absolute inset-0 bg-[#00B074] rounded-full opacity-20 transform scale-125 animate-pulse"></div>
                        <KeyRound size={40} className="text-[#00B074] z-10 relative" strokeWidth={2.5} />
                    </div>
                </div>

                <h1 className="text-xl font-bold text-zinc-800 mb-3">Password reset successful</h1>
                <p className="text-sm text-zinc-500 px-4 mb-8">
                    Your password has been updated. You can now log in with your new password.
                </p>

                <button
                    onClick={() => navigate('/admin/login')}
                    className="w-full bg-[#002f1a] hover:bg-[#002414] text-white font-medium py-3.5 rounded-xl transition-colors text-sm"
                >
                    Go to Login
                </button>
            </div>
        </div>
    );
};

export default ResetSuccess;
