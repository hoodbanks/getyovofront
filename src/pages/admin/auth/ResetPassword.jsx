import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import api from '../../../api/api';
import logo from '../../../assets/images/GetYovo-Logo2.png';

const ResetPassword = () => {
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;

    const setPasswordMutation = useMutation({
        mutationFn: (data) => api.post('/superadmin/auth/set-password', data),
        onSuccess: (response) => {
            if (response.success) {
                navigate('/admin/reset-success');
            }
        },
        onError: (err) => {
            setError(err.message || 'Failed to reset password. Please try again.');
        },
    });

    const handleResetPassword = (e) => {
        e.preventDefault();
        setError(null);

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setPasswordMutation.mutate({
            email,
            newPassword,
            confirmPassword,
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 relative overflow-hidden">
            <div className="bg-white rounded-[24px] p-8 md:p-10 w-full max-w-md shadow-[0_8px_30px_rgb(0,0,0,0.20)] z-10 mx-4">
                <div className="flex flex-col items-center mb-8 text-center">
                    <img src={logo} alt="GetYovo Logo" className="h-12 mb-6" />
                    <h1 className="text-xl font-bold text-zinc-800 mb-2">Create a new password</h1>
                    <p className="text-sm text-zinc-500 px-6">
                        Your new password must be different from your previous one.
                    </p>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-5">
                    {error && (
                        <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-medium text-center animate-in fade-in slide-in-from-top-1">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-800 block">New password</label>
                        <div className="relative">
                            <input
                                type={showNewPassword ? "text" : "password"}
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="•••••"
                                className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#00B074]/20 focus:border-[#00B074] text-sm text-zinc-700 placeholder:text-zinc-600 font-medium transition-colors pr-12 disabled:opacity-50"
                                disabled={setPasswordMutation.isPending}
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 focus:outline-none disabled:opacity-50"
                                disabled={setPasswordMutation.isPending}
                            >
                                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2 pb-4">
                        <label className="text-xs font-semibold text-zinc-800 block">Confirm new password</label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="•••••"
                                className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#00B074]/20 focus:border-[#00B074] text-sm text-zinc-700 placeholder:text-zinc-600 font-medium transition-colors pr-12 disabled:opacity-50"
                                disabled={setPasswordMutation.isPending}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 focus:outline-none disabled:opacity-50"
                                disabled={setPasswordMutation.isPending}
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={setPasswordMutation.isPending}
                        className="w-full bg-[#002f1a] hover:bg-[#002414] text-white font-medium py-3.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        {setPasswordMutation.isPending ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Resetting Password...
                            </>
                        ) : (
                            'Reset Password'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
