import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import api from '../../../api/api';
import { useAuthStore } from '../../../store/useAuthStore';
import logo from '../../../assets/images/GetYovo-Logo2.png';
import bgImage from '../../../assets/images/login-background.png';

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { setAuth, isAuthenticated, superAdmin } = useAuthStore();

    const from = location.state?.from?.pathname || '/admin';

    // Redirect if already logged in
    React.useEffect(() => {
        if (isAuthenticated && superAdmin) {
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, superAdmin, navigate, from]);

    const loginMutation = useMutation({
        mutationFn: (credentials) => api.post('/superadmin/auth/login', credentials),
        onSuccess: (response) => {
            if (response.success && response.data) {
                setAuth(response.data);
                navigate(from, { replace: true });
            }
        },
        onError: (err) => {
            if (err.status === 404) {
                setError('User does not exist');
            } else if (err.status === 401) {
                setError('Invalid credentials');
            } else {
                setError(err.message || 'Login failed. Please check your credentials.');
            }
        },
    });

    const handleLogin = (e) => {
        e.preventDefault();
        setError(null);
        loginMutation.mutate({ email, password });
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center bg-zinc-50 relative overflow-hidden"
            style={{
                backgroundImage: `url(${bgImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'bottom center',
                backgroundRepeat: 'no-repeat'
            }}
        >
            <div className="bg-white rounded-[24px] p-8 md:p-10 w-full max-w-md shadow-[0_8px_30px_rgb(0,0,0,0.20)] z-10 mx-4">
                <div className="flex flex-col items-center mb-8">
                    <img src={logo} alt="GetYovo Logo" className="h-12 mb-6" />
                    <h1 className="text-xl font-bold text-zinc-800">Admin Login</h1>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    {error && (
                        <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-medium animate-in fade-in slide-in-from-top-1">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-800 block">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="e.g. johndoe@example.com"
                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#00B074]/20 focus:border-[#00B074] text-sm text-zinc-700 placeholder:text-zinc-600 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loginMutation.isPending}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-800 block">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="•••••"
                                className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#00B074]/20 focus:border-[#00B074] text-sm text-zinc-700 placeholder:text-zinc-400 font-medium transition-colors pr-12 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={loginMutation.isPending}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 focus:outline-none disabled:opacity-50"
                                disabled={loginMutation.isPending}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loginMutation.isPending}
                        className="w-full bg-[#002f1a] hover:bg-[#002414] text-white font-medium py-3.5 rounded-xl transition-colors mt-2 text-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loginMutation.isPending ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Signing in...
                            </>
                        ) : (
                            'Sign in'
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center bg-zinc-100/50 -mx-8 -mb-8 sm:-mx-10 sm:-mb-10 py-5 rounded-b-[24px]">
                    <p className="text-[13px] text-zinc-500 font-medium">
                        Don't remember Password?{' '}
                        <Link to="/admin/forgot-password" className="text-[#00B074] font-bold hover:underline">
                            Reset Password
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
