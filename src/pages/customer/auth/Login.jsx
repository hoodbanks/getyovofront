import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import logo from '../../../assets/images/GetYovo-Logo2.png';

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        // Handle logic
    };

    return (
        <div className="min-h-screen bg-[#768C76] flex flex-col items-center justify-center relative px-4">
            {/* Top Back Button */}
            <div className="absolute top-10 left-6 z-20">
                <button onClick={() => navigate(-1)} className="p-1 bg-white rounded-full text-white hover:bg-white/30 transition-colors backdrop-blur-sm">
                    <ArrowLeft size={22} className='text-black' />
                </button>
            </div>

            <div className="bg-white rounded-[32px] p-8 md:p-10 w-full max-w-md shadow-2xl z-10 mt-26 mb-8">
                <div className="flex flex-col items-center mb-8">
                    <img src={logo} alt="GetYovo Logo" className="h-18 mb-6" />
                    <h1 className="text-2xl font-bold text-[#1C5E20]">Sign in</h1>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <input
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Phone number (e.g. 0803...)"
                            className="w-full px-5 py-4 rounded-xl border-none bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-[#00B074]/30 focus:bg-white text-sm text-zinc-900 placeholder:text-zinc-400 font-medium transition-all"
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
                                className="w-full px-5 py-4 rounded-xl border-none bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-[#00B074]/30 focus:bg-white text-sm text-zinc-900 placeholder:text-zinc-400 font-medium transition-all pr-12"
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

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="remember"
                            className="w-4 h-4 rounded text-[#00B074] border-zinc-300 focus:ring-[#00B074] cursor-pointer"
                        />
                        <label htmlFor="remember" className="text-[13px] text-zinc-500 font-medium cursor-pointer">
                            Remember me
                        </label>
                    </div>

                    <button
                        type="submit"
                        className={`w-full font-bold py-4 rounded-xl transition-colors text-sm ${phone && password ? 'bg-[#1C5E20] hover:bg-[#002414] text-white shadow-lg shadow-[#002f1a]/30' : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'}`}
                        disabled={!phone || !password}
                    >
                        Continue
                    </button>

                    <div className="text-center space-y-4 pt-4">
                        <p className="text-[13px] text-zinc-500 font-medium">
                            Don't have an account?{' '}
                            <Link to="/customer/register" className="text-[#1C5E20] font-bold hover:underline">
                                Sign up
                            </Link>
                        </p>

                        <Link to="/customer/forgot-password" className="block text-[13px] text-red-700 font-bold hover:underline">
                            Forgot password?
                        </Link>
                    </div>
                </form>
            </div>

            {/* Minimalist bottom line indicator (like iOS) */}
            <div className="w-32 h-1 bg-zinc-900 rounded-full mt-auto mb-2 opacity-50"></div>
        </div>
    );
};

export default Login;
