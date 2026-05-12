import React, { useState, useEffect } from 'react';
import { X, Loader2, Save } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/api';
import { useAuthStore } from '../../store/useAuthStore';
import { toast } from 'sonner';

const DeliveryFeeModal = ({ isOpen, onClose, settingsMap }) => {
    const token = useAuthStore((state) => state.accessToken);
    const queryClient = useQueryClient();

    // Local states initialized with settingsMap values
    const [baseFeeKobo, setBaseFeeKobo] = useState('');
    const [baseDistanceKm, setBaseDistanceKm] = useState('');
    const [perKmFeeKobo, setPerKmFeeKobo] = useState('');
    const [maxDistanceKm, setMaxDistanceKm] = useState('');

    useEffect(() => {
        if (settingsMap) {
            setBaseFeeKobo(settingsMap.DELIVERY_BASE_FEE_KOBO || '80000');
            setBaseDistanceKm(settingsMap.DELIVERY_BASE_DISTANCE_KM || '3');
            setPerKmFeeKobo(settingsMap.DELIVERY_PER_KM_FEE_KOBO || '15000');
            setMaxDistanceKm(settingsMap.ORDER_MAX_DISTANCE_KM || '25');
        }
    }, [settingsMap, isOpen]);

    const updateMutation = useMutation({
        mutationFn: async ({ key, value }) => {
            return await api.patch(`/superadmin/settings/${key}`, { value: String(value) }, token);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-settings']);
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to update setting');
        }
    });

    const handleSave = async () => {
        try {
            const updates = [
                { key: 'DELIVERY_BASE_FEE_KOBO', value: baseFeeKobo },
                { key: 'DELIVERY_BASE_DISTANCE_KM', value: baseDistanceKm },
                { key: 'DELIVERY_PER_KM_FEE_KOBO', value: perKmFeeKobo },
                { key: 'ORDER_MAX_DISTANCE_KM', value: maxDistanceKm },
            ];

            for (const update of updates) {
                await updateMutation.mutateAsync(update);
            }

            toast.success('Settings updated successfully');
            onClose();
        } catch (err) {
            // Error handled in mutation
        }
    };

    if (!isOpen) return null;

    const baseFeeNaira = Number(baseFeeKobo) / 100;
    const perKmFeeNaira = Number(perKmFeeKobo) / 100;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
                onClick={onClose}
            />

            <div className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-up border border-zinc-100">
                {/* Header */}
                <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                    <div>
                        <h2 className="text-lg font-bold text-zinc-900">Delivery & Logistics Settings</h2>
                        <p className="text-[10px] text-zinc-500 font-medium tracking-tight">Configure global delivery fee and distance rules</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-zinc-200 rounded-full transition-colors text-zinc-400"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto no-scrollbar">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Base fee (Kobo)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={baseFeeKobo}
                                    onChange={(e) => setBaseFeeKobo(e.target.value)}
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-5 py-4 text-sm font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all"
                                    placeholder="80000"
                                />
                                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-600">
                                    ₦{baseFeeNaira.toLocaleString()}
                                </span>
                            </div>
                            <p className="text-[9px] text-zinc-400 font-medium leading-tight">
                                ⓘ Minimum charge (e.g. 80000 kobo = ₦800)
                            </p>
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Base Distance (KM)</label>
                            <input
                                type="number"
                                value={baseDistanceKm}
                                onChange={(e) => setBaseDistanceKm(e.target.value)}
                                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-5 py-4 text-sm font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all"
                                placeholder="3"
                            />
                            <p className="text-[9px] text-zinc-400 font-medium leading-tight">
                                ⓘ Max distance covered by the base fee
                            </p>
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Per-KM Fee (Kobo)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={perKmFeeKobo}
                                    onChange={(e) => setPerKmFeeKobo(e.target.value)}
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-5 py-4 text-sm font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all"
                                    placeholder="15000"
                                />
                                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-600">
                                    ₦{perKmFeeNaira.toLocaleString()}
                                </span>
                            </div>
                            <p className="text-[9px] text-zinc-400 font-medium leading-tight">
                                ⓘ Fee for each KM beyond base distance
                            </p>
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Max Order Distance (KM)</label>
                            <input
                                type="number"
                                value={maxDistanceKm}
                                onChange={(e) => setMaxDistanceKm(e.target.value)}
                                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-5 py-4 text-sm font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all"
                                placeholder="25"
                            />
                            <p className="text-[9px] text-zinc-400 font-medium leading-tight">
                                ⓘ Absolute limit for any order delivery
                            </p>
                        </div>
                    </div>

                    {/* Example Calculation Box */}
                    <div className="p-6 bg-zinc-900 rounded-[2rem] border border-zinc-800 space-y-4 shadow-xl">
                        <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Live Fee Preview
                        </h3>
                        <div className="space-y-2 text-xs font-medium text-zinc-400">
                            <div className="flex justify-between items-center">
                                <span>Test Distance:</span>
                                <span className="text-zinc-100 font-bold">{(Number(baseDistanceKm) + 2).toFixed(2)} km</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Base Fee ({baseDistanceKm} km):</span>
                                <span className="text-zinc-100 font-bold">₦{baseFeeNaira.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Extra Distance (2.00 km × ₦{perKmFeeNaira}):</span>
                                <span className="text-zinc-100 font-bold">₦{(2 * perKmFeeNaira).toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-center">
                            <p className="text-sm font-black text-emerald-400 tracking-tight">
                                Total: ₦{(baseFeeNaira + 2 * perKmFeeNaira).toLocaleString()}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-2">
                        <button
                            onClick={onClose}
                            className="flex-1 py-4 bg-zinc-100 text-zinc-600 rounded-3xl text-[11px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={updateMutation.isPending}
                            className="flex-1 py-4 bg-emerald-800 text-white rounded-3xl text-[11px] font-black uppercase tracking-widest hover:bg-emerald-900 transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {updateMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeliveryFeeModal;
