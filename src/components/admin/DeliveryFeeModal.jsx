import React, { useState } from 'react';
import { X } from 'lucide-react';

const DeliveryFeeModal = ({ isOpen, onClose }) => {
    const [baseFee, setBaseFee] = useState(800);
    const [perKmFee, setPerKmFee] = useState(150);

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
                    <h2 className="text-lg font-bold text-zinc-900">Delivery Fee Calculation</h2>
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
                            <label className="text-xs font-bold text-zinc-900">Base fee (₦)</label>
                            <input
                                type="number"
                                value={baseFee}
                                onChange={(e) => setBaseFee(Number(e.target.value))}
                                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-5 py-4 text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
                            />
                            <p className="text-[9px] text-zinc-400 font-medium leading-tight">
                                ⓘ Minimum charge applied to every delivery (covers up to 3 km)
                            </p>
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-zinc-900">Per-km fee</label>
                            <input
                                type="number"
                                value={perKmFee}
                                onChange={(e) => setPerKmFee(Number(e.target.value))}
                                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-5 py-4 text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
                            />
                            <p className="text-[9px] text-zinc-400 font-medium leading-tight">
                                ⓘ Charged only for each kilometer beyond the first 3 km
                            </p>
                        </div>
                    </div>

                    {/* Example Calculation Box */}
                    <div className="p-6 bg-zinc-50 rounded-[1.5rem] border border-zinc-100 space-y-4">
                        <h3 className="text-sm font-bold text-zinc-900">Example Calculation</h3>
                        <div className="space-y-2 text-xs font-medium text-zinc-500">
                            <div className="flex justify-between">
                                <span>Total Distance: 5 km</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Base Fee (3 km): ₦{baseFee}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Extra Distance (2 km × ₦{perKmFee}): ₦{2 * perKmFee}</span>
                            </div>
                        </div>
                        <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-center">
                            <p className="text-xs font-bold text-amber-900">
                                ₦{baseFee} (Base fee) + ₦{2 * perKmFee} (Extra distance) <br />
                                <span className="text-sm">= ₦{(baseFee + 2 * perKmFee).toLocaleString()} Total Delivery Fee</span>
                            </p>
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
                            Done
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeliveryFeeModal;
