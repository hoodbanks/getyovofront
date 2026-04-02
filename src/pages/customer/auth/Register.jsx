import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import logo from '../../../assets/images/GetYovo-Logo2.png';

const Register = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        agreed: false
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleRegister = (e) => {
        e.preventDefault();
        // Go to OTP verification
        navigate('/customer/verify-otp', { state: { flow: 'register' } });
    };

    const isFormValid = formData.firstName && formData.lastName && formData.email && formData.phone && formData.password && formData.confirmPassword && formData.agreed;

    return (
        <div className="min-h-screen bg-[#768C76] flex flex-col items-center py-12 relative px-4">
            {/* Top Back Button */}
            <div className="absolute top-10 left-6 z-20">
                <button onClick={() => navigate(-1)} className="p-1 bg-white rounded-full text-white hover:bg-white/30 transition-colors backdrop-blur-sm">
                    <ArrowLeft size={22} className='text-black' />
                </button>
            </div>

            <div className="bg-white rounded-[32px] p-8 md:p-10 w-full max-w-md shadow-2xl z-10 my-auto mt-12">
                <div className="flex flex-col items-center mb-8">
                    <img src={logo} alt="GetYovo Logo" className="h-18 mb-4" />
                    <h1 className="text-xl font-bold text-[#1C5E20] mb-1">Create account</h1>
                    <p className="text-[13px] text-zinc-500 font-medium">Kindly fill your information below</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-zinc-800 ml-1">First name</label>
                        <input
                            type="text"
                            name="firstName"
                            required
                            value={formData.firstName}
                            onChange={handleChange}
                            placeholder="e.g Adaeze"
                            className="w-full px-5 py-3.5 rounded-xl border-none bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-[#00B074]/30 focus:bg-white text-sm text-zinc-900 placeholder:text-zinc-400 font-medium transition-all"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-zinc-800 ml-1">Last name</label>
                        <input
                            type="text"
                            name="lastName"
                            required
                            value={formData.lastName}
                            onChange={handleChange}
                            placeholder="e.g Johnson"
                            className="w-full px-5 py-3.5 rounded-xl border-none bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-[#00B074]/30 focus:bg-white text-sm text-zinc-900 placeholder:text-zinc-400 font-medium transition-all"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-zinc-800 ml-1">Email address</label>
                        <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="e.g. johndoe@example.com"
                            className="w-full px-5 py-3.5 rounded-xl border-none bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-[#00B074]/30 focus:bg-white text-sm text-zinc-900 placeholder:text-zinc-400 font-medium transition-all"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-zinc-800 ml-1">Phone number</label>
                        <input
                            type="tel"
                            name="phone"
                            required
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="e.g. 0803..."
                            className="w-full px-5 py-3.5 rounded-xl border-none bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-[#00B074]/30 focus:bg-white text-sm text-zinc-900 placeholder:text-zinc-400 font-medium transition-all"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-zinc-800 ml-1">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Password"
                                className="w-full px-5 py-3.5 rounded-xl border-none bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-[#00B074]/30 focus:bg-white text-sm text-zinc-900 placeholder:text-zinc-400 font-medium transition-all pr-12"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 focus:outline-none"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-zinc-800 ml-1">Confirm Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="confirmPassword"
                                required
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm password"
                                className="w-full px-5 py-3.5 rounded-xl border-none bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-[#00B074]/30 focus:bg-white text-sm text-zinc-900 placeholder:text-zinc-400 font-medium transition-all pr-12"
                            />
                        </div>
                    </div>

                    <div className="flex items-start gap-2 pt-2">
                        <input
                            type="checkbox"
                            id="agreed"
                            name="agreed"
                            checked={formData.agreed}
                            onChange={handleChange}
                            className="mt-0.5 w-4 h-4 rounded text-[#00B074] border-zinc-300 focus:ring-[#00B074] cursor-pointer"
                        />
                        <label htmlFor="agreed" className="text-[11px] text-zinc-500 font-medium cursor-pointer leading-tight">
                            I agree to the <span className="font-bold text-[#1C5E20]">Terms & condition</span>
                        </label>
                    </div>

                    <button
                        type="submit"
                        className={`w-full font-bold py-4 rounded-xl transition-colors text-sm mt-4 ${isFormValid ? 'bg-[#002f1a] hover:bg-[#002414] text-white shadow-lg shadow-[#002f1a]/30' : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'}`}
                        disabled={!isFormValid}
                    >
                        Sign up
                    </button>

                    <div className="text-center pt-2">
                        <p className="text-[12px] text-zinc-500 font-medium">
                            Already have an account?{' '}
                            <Link to="/customer/login" className="text-[#1C5E20] font-bold hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </form>
            </div>

            <div className="w-32 h-1 bg-zinc-900 rounded-full mt-4 mb-2 opacity-50 shrink-0"></div>
        </div>
    );
};

export default Register;
