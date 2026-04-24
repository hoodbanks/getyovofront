import React, { useState } from 'react';
import {
    X,
    ChevronDown,
    Upload,
    Trash2,
    ImageIcon,
    CheckCircle2,
    Loader2
} from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import api from '../../api/api';
import { useAuthStore } from '../../store/useAuthStore';
import { toast } from 'sonner';

const RecordPayoutModal = ({ isOpen, onClose, vendor, amount, payoutBatchId, onConfirm }) => {
    const token = useAuthStore((state) => state.accessToken);
    const [paymentMethod, setPaymentMethod] = useState('Transfer');
    const [reference, setReference] = useState('');
    const [notes, setNotes] = useState('');
    const [proof, setProof] = useState(null);
    const [fileObj, setFileObj] = useState(null);

    // Execute Payout Mutation
    const executeMutation = useMutation({
        mutationFn: async (formData) => {
            return await api.post(`/superadmin/payment/vendor/${vendor.id}/execute`, formData, token, true);
        },
        onSuccess: (res) => {
            toast.success(`Successfully paid ₦${amount}. Total orders: ${res.data.ordersPaid}`);
            onConfirm();
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Failed to execute payout');
        }
    });

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFileObj(file);
            setProof({
                name: file.name,
                size: (file.size / 1024).toFixed(2) + ' KB',
                url: URL.createObjectURL(file)
            });
        }
    };

    const handleSubmit = () => {
        if (!payoutBatchId) {
            toast.error('Payout session lost. Please try again.');
            return;
        }
        if (!reference) {
            toast.error('Reference/Narration is required');
            return;
        }
        if (!fileObj) {
            toast.error('Proof of payment image is required');
            return;
        }

        const formData = new FormData();
        formData.append('payoutBatchId', payoutBatchId);
        formData.append('paymentMode', paymentMethod);
        formData.append('reference', reference);
        formData.append('narration', notes);
        formData.append('proofImage', fileObj);

        executeMutation.mutate(formData);
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div
                className={`absolute inset-0 bg-black/50  transition-opacity duration-300 animate-fade-in`}
                onClick={onClose}
            />

            <div className={`relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]`}>
                {/* Header */}
                <div className="p-6 border-b border-zinc-100 flex items-center justify-between shrink-0">
                    <h2 className="text-lg font-bold text-zinc-900">Record payout</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-400"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1 min-h-0">
                    {/* Summary */}
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-sm uppercase">
                            {vendor.initials || vendor.name?.substring(0, 2)}
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-zinc-900">{vendor.name}</h3>
                            <p className="text-[11px] text-zinc-500 font-medium">Amount to pay now: <span className="text-zinc-900 font-bold tracking-tight">₦{amount}</span></p>
                        </div>
                    </div>

                    {/* Form Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-zinc-900">Payment Method</label>
                            <div className="relative">
                                <select
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="w-full appearance-none bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-[11px] font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 cursor-pointer"
                                >
                                    <option>Transfer</option>
                                    <option>Cash</option>
                                    <option>Bank Deposit</option>
                                </select>
                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-zinc-900">Reference/Narration *</label>
                            <input
                                type="text"
                                value={reference}
                                onChange={(e) => setReference(e.target.value)}
                                placeholder="e.g GTB-TRF-1234 or narration"
                                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-[11px] font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-zinc-900">Reference/Narration *</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Any note for audit trail..."
                            rows={4}
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-[11px] font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 resize-none"
                        />
                    </div>

                    {/* Upload */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-zinc-900">Upload proof of payment *</label>
                        {!proof ? (
                            <div className="relative">
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                                <div className="flex items-center gap-2 px-4 py-2 border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors w-fit">
                                    <Upload size={14} className="text-zinc-500" />
                                    <span className="text-[10px] font-bold text-zinc-600">Choose image</span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-2xl border border-zinc-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-white border border-zinc-100">
                                        <img src={proof.url} className="w-full h-full object-cover" alt="Proof" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-zinc-900">Screenshot</p>
                                        <p className="text-[9px] text-zinc-500 font-medium">{proof.size}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setProof(null)}
                                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1"
                                >
                                    <Trash2 size={14} />
                                    <span className="text-[10px] font-bold">Remove</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-zinc-50/50 flex flex-col items-center gap-4 shrink-0">
                    <div className="flex items-center w-full gap-4">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3.5 bg-zinc-100/80 text-zinc-900 rounded-3xl text-[12px] font-bold hover:bg-zinc-200/80 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={executeMutation.isLoading}
                            className="flex-1 py-3.5 bg-emerald-800 text-white rounded-3xl text-[12px] font-bold hover:bg-emerald-900 transition-all shadow-md shadow-emerald-900/10 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {executeMutation.isLoading ? <Loader2 className="animate-spin" size={16} /> : 'Confirm Paid'}
                        </button>
                    </div>
                    <p className="text-[10px] font-medium text-zinc-500">
                        This marks <span className="font-bold text-zinc-900">ALL unpaid delivered</span> orders in this range as <span className="font-bold text-zinc-900 uppercase">PAID</span> for this vendor.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RecordPayoutModal;
