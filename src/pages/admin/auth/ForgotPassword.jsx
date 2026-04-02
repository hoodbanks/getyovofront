import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../../assets/images/GetYovo-Logo2.png';
import bgImage1 from '../../../assets/images/login-background2.png';
import bgImage2 from '../../../assets/images/login-background3.png';
import bgImage3 from '../../../assets/images/login-background4.png';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

    const handleSendResetLink = (e) => {
        e.preventDefault();
        // Add logic to send reset link
        navigate('/admin/verify-email');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 relative overflow-hidden">
            {/* Background Images */}
            <img
                src={bgImage1}
                alt="Background Decoration 1"
                className="absolute top-[-30px] left-10 -z-0 pointer-events-none"
            />
            <img
                src={bgImage2}
                alt="Background Decoration 2"
                className="absolute top-[-30px] left-0 -z-0 pointer-events-none"
            />
            <img
                src={bgImage3}
                alt="Background Decoration 3"
                className="absolute bottom-0 right-0 -z-0 pointer-events-none w-140"
            />
            <div className="bg-white rounded-[24px] p-8 md:p-10 w-full max-w-md shadow-[0_8px_30px_rgb(0,0,0,0.20)] z-10 mx-4">
                <div className="flex flex-col items-center mb-6 text-center">
                    <img src={logo} alt="GetYovo Logo" className="h-12 mb-6" />
                    <h1 className="text-xl font-bold text-zinc-800 mb-2">Forgot your password?</h1>
                    <p className="text-sm text-zinc-500 px-4">
                        Enter the email address linked to your admin account and we'll send you a reset link.
                    </p>
                </div>

                <form onSubmit={handleSendResetLink} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-800 block">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="e.g. johndoe@example.com"
                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#00B074]/20 focus:border-[#00B074] text-sm text-zinc-700 placeholder:text-zinc-600 font-medium transition-colors"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-[#002f1a] hover:bg-[#002414] text-white font-medium py-3.5 rounded-xl transition-colors mt-2 text-sm"
                    >
                        Send Reset Link
                    </button>
                </form>

                <div className="mt-8 text-center bg-zinc-100/50 -mx-8 -mb-8 sm:-mx-10 sm:-mb-10 py-5 rounded-b-[24px]">
                    <p className="text-[13px] text-zinc-500 font-medium">
                        Remember Password?{' '}
                        <Link to="/admin/login" className="text-[#00B074] font-bold hover:underline">
                            Back to Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
