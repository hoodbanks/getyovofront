import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import api from '../../../api/api';
import { useAuthStore } from '../../../store/useAuthStore';
import logo from '../../../assets/images/GetYovo-Logo2.png';

const RiderLogin = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [phonenumber, setPhonenumber] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);

    const loginMutation = useMutation({
        mutationFn: (data) => api.post('/rider/auth/login', data),
        onSuccess: (response) => {
            if (response.success) {
                setAuth({
                    accessToken: response.data.accessToken,
                    refreshToken: response.data.refreshToken,
                    rider: response.data.rider,
                });
                navigate('/rider/app/dashboard');
            }
        },
        onError: (err) => {
            // Handle specific status codes
            if (err.statusCode === 404) {
                setError('Account not found. Please check your phone number.');
            } else if (err.statusCode === 401) {
                setError('Invalid phone number or password.');
            } else if (err.statusCode === 400 && err.message === 'Verification pending') {
                // Redirect to OTP verification if the account is not verified
                navigate('/rider/verify-otp', { state: { phonenumber } });
            } else {
                setError(err.message || 'Login failed. Please try again.');
            }
        },
    });

    const handleLogin = (e) => {
        e.preventDefault();
        setError(null);
        loginMutation.mutate({ phonenumber, password });
    };

    return (
        <div className="min-h-screen bg-[#768C76] flex flex-col items-center justify-center relative px-4">
            {/* Top Back Button */}
            <div className="absolute top-10 left-6 z-20">
                <button onClick={() => navigate('/rider/welcome')} className="p-1 bg-white rounded-full text-white hover:bg-white/30 transition-colors backdrop-blur-sm">
                    <ArrowLeft size={22} className='text-black' />
                </button>
            </div>

            <div className="bg-white rounded-[32px] p-8 md:p-10 w-full max-w-md shadow-2xl z-10 mt-26 mb-8">
                <div className="flex flex-col items-center mb-8">
                    <img src={logo} alt="GetYovo Logo" className="h-18 mb-6" />
                    <h1 className="text-2xl font-bold text-[#1C5E20]">Sign in</h1>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 animate-in slide-in-from-top-2 duration-300">
                        <AlertCircle size={18} className="text-rose-500 shrink-0 mt-0.5" />
                        <p className="text-[13px] text-rose-600 font-medium leading-relaxed">{error}</p>
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <input
                            type="tel"
                            required
                            value={phonenumber}
                            onChange={(e) => setPhonenumber(e.target.value)}
                            placeholder="Phone number (e.g. 080...)"
                            disabled={loginMutation.isPending}
                            className="w-full px-5 py-4 rounded-xl border-none bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#00B074]/30 focus:bg-white text-sm text-zinc-900 placeholder:text-zinc-400 font-medium transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                disabled={loginMutation.isPending}
                                className="w-full px-5 py-4 rounded-xl border-none bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#00B074]/30 focus:bg-white text-sm text-zinc-900 placeholder:text-zinc-400 font-medium transition-all pr-12"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 focus:outline-none"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loginMutation.isPending || !phonenumber || !password}
                        className={`w-full font-bold py-4 rounded-xl transition-colors text-sm flex items-center justify-center gap-2 ${phonenumber && password && !loginMutation.isPending ? 'bg-[#1C5E20] hover:bg-[#002414] text-white shadow-lg shadow-[#002f1a]/30' : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'}`}
                    >
                        {loginMutation.isPending ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Processing...
                            </>
                        ) : (
                            'Continue'
                        )}
                    </button>

                    <div className="text-center space-y-4 pt-4">
                        <button
                            type="button"
                            onClick={() => navigate('/rider/forgot-password')}
                            className="block w-full text-[13px] text-red-700 font-bold hover:underline"
                        >
                            Forgot password?
                        </button>
                    </div>
                </form>
            </div>

            {/* Minimalist bottom line indicator (like iOS) */}
            <div className="w-32 h-1 bg-zinc-900 rounded-full mt-auto mb-2 opacity-50"></div>
        </div>
    );
};

export default RiderLogin;
