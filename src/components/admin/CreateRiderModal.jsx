import React from 'react';
import { X } from 'lucide-react';

const CreateRiderModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            <div
                className={`absolute inset-0 bg-black/50 transition-opacity duration-300 animate-fade-in`}
                onClick={onClose}
            />

            <div className={`relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-slide-in overflow-hidden`}>
                {/* Header */}
                <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-white shrink-0">
                    <h2 className="text-sm font-bold text-zinc-900">Create Rider</h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-zinc-100 rounded-lg transition-colors text-zinc-400"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Form Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
                    {/* Rider Details */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-tight">Rider Details</h3>
                        <div className="space-y-4 p-5 bg-zinc-50/50 rounded-2xl border border-zinc-100">
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 ml-1">Rider Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g John"
                                    className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all placeholder:text-zinc-300"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 ml-1">Phone</label>
                                <input
                                    type="tel"
                                    placeholder="Business phone (e.g. 0803...)"
                                    className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all placeholder:text-zinc-300"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 ml-1">Email</label>
                                <input
                                    type="email"
                                    placeholder="e.g. johndoe@example.com"
                                    className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all placeholder:text-zinc-300"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 ml-1">Address</label>
                                <input
                                    type="text"
                                    placeholder="Enter address"
                                    className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all placeholder:text-zinc-300"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Vehicle Details */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-tight">Vehicle Details</h3>
                        <div className="space-y-4 p-5 bg-zinc-50/50 rounded-2xl border border-zinc-100">
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 ml-1">Vehicle Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g Kymco 125cc"
                                    className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all placeholder:text-zinc-300"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 ml-1">Vehicle Plate</label>
                                <input
                                    type="text"
                                    placeholder="e.g AWK-432KY"
                                    className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all placeholder:text-zinc-300"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-zinc-100 bg-white shrink-0">
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-3 bg-zinc-100 text-zinc-700 rounded-2xl text-[11px] font-bold hover:bg-zinc-200 transition-all"
                        >
                            Cancel
                        </button>
                        <button className="px-6 py-3 bg-emerald-800 text-white rounded-2xl text-[11px] font-bold hover:bg-emerald-900 transition-all shadow-md shadow-emerald-900/10">
                            Create Rider
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateRiderModal;
