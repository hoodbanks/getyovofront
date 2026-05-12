import React, { useState, useEffect } from 'react';
import { X, Loader2, Save, Timer } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/api';
import { useAuthStore } from '../../store/useAuthStore';
import { toast } from 'sonner';

const OrderTimingModal = ({ isOpen, onClose, settingsMap }) => {
    const token = useAuthStore((state) => state.accessToken);
    const queryClient = useQueryClient();

    const [prepTime, setPrepTime] = useState('');
    const [kmRate, setKmRate] = useState('');

    useEffect(() => {
        if (settingsMap) {
            setPrepTime(settingsMap.ORDER_PREP_TIME_MINUTES || '20');
            setKmRate(settingsMap.ORDER_KM_RATE_MINUTES || '5');
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
            await updateMutation.mutateAsync({ key: 'ORDER_PREP_TIME_MINUTES', value: prepTime });
            await updateMutation.mutateAsync({ key: 'ORDER_KM_RATE_MINUTES', value: kmRate });

            toast.success('Timing settings updated successfully');
            onClose();
        } catch (err) {}
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
                onClick={onClose}
            />

            <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-up border border-zinc-100">
                <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                    <div>
                        <h2 className="text-lg font-bold text-zinc-900">Order Timing</h2>
                        <p className="text-[10px] text-zinc-500 font-medium tracking-tight">Configure estimated delivery & prep times</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-200 rounded-full transition-colors text-zinc-400">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                            <Timer size={14} className="text-indigo-500" />
                            Default Prep Time (Mins)
                        </label>
                        <input
                            type="number"
                            value={prepTime}
                            onChange={(e) => setPrepTime(e.target.value)}
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-5 py-4 text-sm font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all"
                        />
                        <p className="text-[9px] text-zinc-400 font-medium leading-tight">
                            ⓘ Estimated time for vendors to prepare an order
                        </p>
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                            <Timer size={14} className="text-emerald-500" />
                            KM Travel Rate (Mins/KM)
                        </label>
                        <input
                            type="number"
                            value={kmRate}
                            onChange={(e) => setKmRate(e.target.value)}
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-5 py-4 text-sm font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all"
                        />
                        <p className="text-[9px] text-zinc-400 font-medium leading-tight">
                            ⓘ Estimated minutes it takes a rider to cover 1 KM
                        </p>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            onClick={onClose}
                            className="flex-1 py-4 bg-zinc-100 text-zinc-600 rounded-3xl text-[11px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={updateMutation.isPending}
                            className="flex-1 py-4 bg-zinc-900 text-white rounded-3xl text-[11px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/20 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {updateMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderTimingModal;
