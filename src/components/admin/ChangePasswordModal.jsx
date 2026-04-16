import React, { useState } from 'react';
import { X, Eye, EyeOff, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import api from '../../api/api';
import { useAuthStore } from '../../store/useAuthStore';

const ChangePasswordModal = ({ isOpen, onClose }) => {
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const accessToken = useAuthStore((state) => state.accessToken);

    const changePasswordMutation = useMutation({
        mutationFn: (data) => api.post('/superadmin/auth/reset-password', data, accessToken),
        onSuccess: (response) => {
            if (response.success) {
                setSuccess(true);
                setTimeout(() => {
                    handleClose();
                }, 2000);
            }
        },
        onError: (err) => {
            setError(err.message || 'Failed to change password. Please check your current password.');
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setError(null);

        if (newPassword !== confirmPassword) {
            setError('New passwords do not match.');
            return;
        }

        if (newPassword === oldPassword) {
            setError('New password must be different from current password.');
            return;
        }

        changePasswordMutation.mutate({
            oldPassword,
            newPassword,
            confirmPassword,
        });
    };

    const handleClose = () => {
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setError(null);
        setSuccess(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-zinc-100">
                    <h2 className="text-sm font-bold text-zinc-900">Change Password</h2>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-400"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="p-8">
                    {success ? (
                        <div className="py-8 flex flex-col items-center text-center space-y-4 animate-in zoom-in duration-300">
                            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500">
                                <ShieldCheck size={32} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-sm font-bold text-zinc-900">Password Changed!</h3>
                                <p className="text-[10px] text-zinc-500 font-medium">Your account security has been updated successfully.</p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-[11px] font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                                    <AlertCircle size={14} />
                                    {error}
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-zinc-900 px-1">Current Password</label>
                                <div className="relative">
                                    <input
                                        type={showOldPassword ? "text" : "password"}
                                        required
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs text-zinc-700 font-medium transition-all"
                                        placeholder="Enter current password"
                                        disabled={changePasswordMutation.isPending}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowOldPassword(!showOldPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                                    >
                                        {showOldPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-zinc-900 px-1">New Password</label>
                                <div className="relative">
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        required
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs text-zinc-700 font-medium transition-all"
                                        placeholder="Enter new password"
                                        disabled={changePasswordMutation.isPending}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                                    >
                                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-zinc-900 px-1">Confirm New Password</label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs text-zinc-700 font-medium transition-all"
                                        placeholder="Confirm new password"
                                        disabled={changePasswordMutation.isPending}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={changePasswordMutation.isPending}
                                    className="w-full bg-[#002f1a] hover:bg-[#002414] text-white font-bold py-3.5 rounded-xl transition-all shadow-md active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2 text-xs"
                                >
                                    {changePasswordMutation.isPending ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            Updating Password...
                                        </>
                                    ) : (
                                        'Update Password'
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChangePasswordModal;
