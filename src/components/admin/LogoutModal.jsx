import React from 'react';
import { X, LogOut, Loader2 } from 'lucide-react';

const LogoutModal = ({ isOpen, onClose, onLogout, isLoading }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/50 transition-opacity duration-300 animate-fade-in"
                onClick={onClose}
            />

            <div className="relative w-full max-w-sm bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-slide-up p-8">
                <button
                    onClick={onClose}
                    className="absolute right-6 top-6 p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-400"
                >
                    <X size={20} />
                </button>

                <div className="flex flex-col items-center text-center space-y-6">
                    {/* Door Icon Visual */}
                    <div className="relative w-24 h-24 mb-2">
                        <div className="absolute inset-0 bg-zinc-100 rounded-full scale-110 opacity-50" />
                        <div className="relative z-10 w-full h-full flex items-center justify-center">
                            <div className="relative">
                                {/* Simple Door Illustration using SVG for exact match */}
                                <svg width="48" height="60" viewBox="0 0 48 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M8 58V6C8 3.79086 9.79086 2 12 2H40C42.2091 2 44 3.79086 44 6V58" stroke="#18181B" strokeWidth="2.5" />
                                    <rect x="2" y="58" width="44" height="2.5" fill="#18181B" />
                                    <path d="M40 2V58H16V10L40 2Z" fill="#A16207" stroke="#18181B" strokeWidth="2" />
                                    <circle cx="34" cy="32" r="1.5" fill="#18181B" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-xl font-bold text-zinc-900">Log Out</h2>
                        <p className="text-sm text-zinc-500 font-medium">Are you sure you want to log out of your account?</p>
                    </div>

                    <div className="flex w-full gap-3 pt-2">
                        <button
                            onClick={onClose}
                            className="w-full py-4 bg-zinc-100/80 text-zinc-900 rounded-3xl text-sm font-bold hover:bg-zinc-200/80 transition-all active:scale-[0.98]"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onLogout}
                            disabled={isLoading}
                            className="w-full py-4 bg-rose-600 text-white rounded-3xl text-sm font-bold hover:bg-rose-700 transition-all shadow-md shadow-rose-600/10 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    <span>Processing...</span>
                                </>
                            ) : (
                                'Log Out'
                            )}
                        </button>

                        
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LogoutModal;
