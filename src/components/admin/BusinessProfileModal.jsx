import React from 'react';
import { X } from 'lucide-react';

const BusinessProfileModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/50 transition-opacity duration-300 animate-fade-in"
                onClick={onClose}
            />

            <div className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-slide-up">
                {/* Header */}
                <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-zinc-900">Business Profile</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-400"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-zinc-900">Business name</label>
                            <input
                                type="text"
                                placeholder="e.g. GetYovo"
                                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-[11px] font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 placeholder:text-zinc-300"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-zinc-900">Support phone</label>
                            <input
                                type="text"
                                placeholder="e.g. +234 801 2234 5678"
                                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-[11px] font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 placeholder:text-zinc-300"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-zinc-900">Support email</label>
                            <input
                                type="email"
                                placeholder="e.g. support@yourcompany.com"
                                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-[11px] font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 placeholder:text-zinc-300"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-zinc-900">Address</label>
                            <input
                                type="text"
                                placeholder="e.g. 12 Adeniyi Celebu Street..."
                                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-[11px] font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 placeholder:text-zinc-300"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            onClick={onClose}
                            className="flex-1 py-4 bg-zinc-100/80 text-zinc-900 rounded-3xl text-sm font-bold hover:bg-zinc-200/80 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            className="flex-1 py-4 bg-emerald-800 text-white rounded-3xl text-sm font-bold hover:bg-emerald-900 transition-all shadow-md shadow-emerald-900/10"
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BusinessProfileModal;
