import React from 'react';
import { X, Clock } from 'lucide-react';

const OperatingHoursModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/50 transition-opacity duration-300 animate-fade-in"
                onClick={onClose}
            />

            <div className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-slide-up">
                {/* Header */}
                <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-zinc-900">Operating Hours</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-400"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 space-y-8">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-zinc-900">Open time</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    defaultValue="09:00 AM"
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-5 py-4 text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 placeholder:text-zinc-400"
                                />
                                <Clock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-zinc-900">Close time</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Enter closing time"
                                    className="w-full bg-zinc-100 border border-zinc-200 rounded-2xl px-5 py-4 text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 placeholder:text-zinc-500"
                                />
                                <Clock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={onClose}
                            className="flex-1 py-4 bg-zinc-100/80 text-zinc-900 rounded-3xl text-sm font-bold hover:bg-zinc-200/80 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            className="flex-1 py-4 bg-emerald-800 text-white rounded-3xl text-sm font-bold hover:bg-emerald-900 transition-all shadow-md shadow-emerald-900/10"
                        >
                            Apply
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OperatingHoursModal;
