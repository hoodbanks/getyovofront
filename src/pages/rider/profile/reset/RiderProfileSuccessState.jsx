import React from 'react';
import { useNavigate } from 'react-router-dom';
import PasswordSuccess from '../../../../assets/images/password-success-icon.png';

const RiderSuccessState = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#768C76] flex flex-col items-center justify-center p-4 relative text-center">
            <div className="bg-white rounded-[40px] p-10 w-full max-w-sm flex flex-col items-center text-center shadow-2xl z-10 py-16">

                {/* Status Icon */}
                <div className="mb-8 relative">
                    <div className="w-24 h-24 rounded-full flex items-center justify-center bg-white border-[3px] border-[#00B074]">
                        <img src={PasswordSuccess} alt="password success" />
                    </div>
                </div>

                <h1 className="text-xl font-bold text-[#1C5E20] mb-2">
                    Password Updated
                </h1>

                <p className="text-[13px] text-zinc-500 font-medium mb-10 px-4 leading-relaxed italic">
                    Your password has been reset successfully.
                </p>

                <button
                    onClick={() => navigate('/rider/app/dashboard')}
                    className="w-full bg-[#1C5E20] hover:bg-[#002414] text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-[#002f1a]/20 text-sm"
                >
                    Proceed to Home
                </button>
            </div>

            <div className="w-32 h-1 bg-zinc-900 rounded-full mt-auto mb-2 opacity-50 absolute bottom-2"></div>
        </div>
    );
};

export default RiderSuccessState;
