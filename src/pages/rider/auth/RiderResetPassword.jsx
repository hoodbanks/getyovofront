import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import api from '../../../api/api';
import logo from '../../../assets/images/GetYovo-Logo2.png';

const RiderResetPassword = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const phonenumber = location.state?.phonenumber;

    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        // Redirect if no phone number provided (security measure)
        if (!phonenumber) {
            navigate('/rider/forgot-password');
        }
    }, [phonenumber, navigate]);

    const resetMutation = useMutation({
        mutationFn: (data) => api.post('/rider/auth/set-password', data),
        onSuccess: (response) => {
            if (response.success) {
                navigate('/rider/success');
            }
        },
        onError: (err) => {
            setError(err.message || 'Failed to update password. Please try again.');
        },
    });

    const handleReset = (e) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        resetMutation.mutate({
            phonenumber,
            newPassword: password,
            confirmPassword,
        });
    };

    const isFormValid = password && confirmPassword && password === confirmPassword;

    return (
        <div className="min-h-screen bg-[#768C76] flex flex-col items-center justify-center px-4 relative">
            <div className="absolute top-10 left-6 z-20">
                <button onClick={() => navigate('/rider/forgot-password')} className="p-1 bg-white rounded-full transition-colors backdrop-blur-sm shadow-sm hover:bg-zinc-100">
                    <ArrowLeft size={22} className='text-zinc-900' />
                </button>
            </div>

            <div className="bg-white rounded-[32px] p-8 md:p-10 w-full max-w-md shadow-2xl z-10 flex flex-col items-center">
                <img src={logo} alt="GetYovo Logo" className="h-16 mb-6" />
                <h1 className="text-2xl font-bold text-[#1C5E20] mb-2">New Password</h1>
                <p className="text-[14px] text-zinc-500 font-medium text-center mb-8 px-4 leading-relaxed">
                    Set a secure password for your rider account associated with <span className="font-bold text-zinc-900">{phonenumber}</span>.
                </p>

                {error && (
                    <div className="w-full mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 animate-in slide-in-from-top-2 duration-300">
                        <AlertCircle size={18} className="text-rose-500 shrink-0 mt-0.5" />
                        <p className="text-[13px] text-rose-600 font-medium leading-relaxed">{error}</p>
                    </div>
                )}

                <form onSubmit={handleReset} className="w-full space-y-4">
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="New password"
                            disabled={resetMutation.isPending}
                            className="w-full px-5 py-4 rounded-xl border-none bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#00B074]/30 focus:bg-white text-sm text-zinc-900 placeholder:text-zinc-400 font-medium transition-all"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            disabled={resetMutation.isPending}
                            className="w-full px-5 py-4 rounded-xl border-none bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#00B074]/30 focus:bg-white text-sm text-zinc-900 placeholder:text-zinc-400 font-medium transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={resetMutation.isPending || !isFormValid}
                        className={`w-full font-bold py-4 rounded-xl transition-colors text-sm flex items-center justify-center gap-2 ${isFormValid && !resetMutation.isPending ? 'bg-[#1C5E20] hover:bg-[#002414] text-white shadow-lg shadow-[#002f1a]/30' : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'}`}
                    >
                        {resetMutation.isPending ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Updating...
                            </>
                        ) : (
                            'Reset Password'
                        )}
                    </button>

                    <div className="text-center pt-2">
                        <p className="text-[13px] text-zinc-500 font-medium">
                            Remember your login? <button type="button" onClick={() => navigate('/rider/login')} className="text-[#1C5E20] font-bold hover:underline">Sign in</button>
                        </p>
                    </div>
                </form>
            </div>

            <div className="w-32 h-1 bg-zinc-900 rounded-full mt-auto mb-2 opacity-50 absolute bottom-2"></div>
        </div>
    );
};

export default RiderResetPassword;
