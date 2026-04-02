import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import logo from '../../../assets/images/GetYovo-Logo2.png';

const ResetPassword = () => {
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();

    const handleResetPassword = (e) => {
        e.preventDefault();
        if (newPassword === confirmPassword) {
            navigate('/customer/success', { state: { type: 'reset' } });
        }
    };

    const isFormValid = newPassword && confirmPassword && (newPassword === confirmPassword);

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
                    <img src={logo} alt="GetYovo Logo" className="h-18 mb-6" />
                    <h1 className="text-xl font-bold text-[#1C5E20] mb-1">Enter New Password</h1>
                    <p className="text-[13px] text-zinc-500 font-medium px-4">
                        Enter a strong password to secure your account.
                    </p>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-4">
                    <div className="space-y-1.5 text-left">
                        <div className="relative">
                            <input
                                type={showNewPassword ? "text" : "password"}
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="New password"
                                className="w-full px-5 py-4 rounded-xl border-none bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-[#00B074]/30 focus:bg-white text-sm text-zinc-900 placeholder:text-zinc-600 font-medium transition-all pr-12"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 focus:outline-none"
                            >
                                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-1.5 text-left pb-2">
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                                className="w-full px-5 py-4 rounded-xl border-none bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-[#00B074]/30 focus:bg-white text-sm text-zinc-900 placeholder:text-zinc-600 font-medium transition-all pr-12"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 focus:outline-none"
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className={`w-full font-bold py-4 rounded-xl transition-colors text-sm ${isFormValid ? 'bg-[#1C5E20] hover:bg-[#002414] text-white shadow-lg shadow-[#002f1a]/30' : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'}`}
                        disabled={!isFormValid}
                    >
                        Continue
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

export default ResetPassword;
