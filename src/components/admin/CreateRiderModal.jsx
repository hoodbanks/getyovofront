import React, { useState } from 'react';
import { X, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/api';
import { useAuthStore } from '../../store/useAuthStore';

const CreateRiderModal = ({ isOpen, onClose }) => {
    const [name, setName] = useState('');
    const [phonenumber, setPhonenumber] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [vehicleName, setVehicleName] = useState('');
    const [vehiclePlate, setVehiclePlate] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const accessToken = useAuthStore((state) => state.accessToken);
    const queryClient = useQueryClient();

    const createRiderMutation = useMutation({
        mutationFn: (data) => api.post('/superadmin/riders/register', data, accessToken),
        onSuccess: (response) => {
            if (response.success) {
                setSuccess(true);
                // Refresh the riders list if needed
                queryClient.invalidateQueries({ queryKey: ['riders'] });
                queryClient.invalidateQueries({ queryKey: ['riders-search'] });
                
                setTimeout(() => {
                    handleClose();
                }, 1500);
            }
        },
        onError: (err) => {
            setError(err.message || 'Failed to create rider. Please check your inputs.');
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setError(null);

        const cleanName = name.trim();
        const cleanPhone = phonenumber.trim();
        const cleanAddress = address.trim();
        const cleanVehicleName = vehicleName.trim();
        const cleanVehiclePlate = vehiclePlate.trim();
        if (cleanName.length < 3 || cleanName.length > 100) return setError('Name must be between 3 and 100 characters.');
        if (!/^(0\d{10}|234\d{10}|\+234\d{10})$/.test(cleanPhone)) return setError('Enter a Nigerian phone number in 0XXXXXXXXXX, 234XXXXXXXXXX, or +234XXXXXXXXXX format.');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError('Enter a valid email address.');
        if (cleanAddress.length < 3 || cleanAddress.length > 150) return setError('Address must be between 3 and 150 characters.');
        if (!/^[A-Za-z0-9 ]{2,50}$/.test(cleanVehicleName)) return setError('Vehicle name must be 2–50 letters, numbers, or spaces.');
        if (!/^[A-Za-z0-9 -]{2,10}$/.test(cleanVehiclePlate)) return setError('Vehicle plate must be 2–10 letters, numbers, dashes, or spaces.');

        createRiderMutation.mutate({
            name: cleanName,
            phonenumber: cleanPhone,
            email: email.trim(),
            vehicleName: cleanVehicleName,
            vehiclePlate: cleanVehiclePlate,
            address: cleanAddress,
        });
    };

    const handleClose = () => {
        // Reset form
        setName('');
        setPhonenumber('');
        setEmail('');
        setAddress('');
        setVehicleName('');
        setVehiclePlate('');
        setError(null);
        setSuccess(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            <div
                className={`absolute inset-0 bg-black/50 transition-opacity duration-300 animate-fade-in`}
                onClick={handleClose}
            />

            <div className={`relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-slide-in overflow-hidden`}>
                {/* Header */}
                <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#0F172B] shrink-0">
                    <h2 className="text-sm font-bold text-white">Create Rider</h2>
                    <button
                        onClick={handleClose}
                        className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-slate-300 hover:text-white"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Form Content */}
                <form id="create-rider-form" noValidate onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
                    {success ? (
                        <div className="flex flex-col items-center justify-center py-20 animate-in zoom-in duration-300">
                            <CheckCircle2 size={48} className="text-emerald-500 mb-4" />
                            <h3 className="text-sm font-bold text-zinc-900">Rider Created</h3>
                            <p className="mt-1 text-center text-[10px] font-medium text-zinc-500">The account starts pending verification and offline. It has not been assigned an order.</p>
                        </div>
                    ) : (
                        <>
                            {error && (
                                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 animate-in slide-in-from-top-2 duration-300">
                                    <AlertCircle size={16} className="text-rose-500 shrink-0 mt-0.5" />
                                    <div className="space-y-1">
                                        <p className="text-[11px] font-bold text-rose-700">Creation Failed</p>
                                        <p className="text-[10px] text-rose-600 font-medium leading-relaxed">{error}</p>
                                    </div>
                                </div>
                            )}

                            {/* Rider Details */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-tight">Rider Details</h3>
                                <div className="space-y-4 p-5 bg-zinc-50/50 rounded-2xl border border-zinc-100">
                                    <div>
                                        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 ml-1">Rider Name</label>
                                        <input
                                            type="text"
                                            required
                                            minLength={3}
                                            maxLength={100}
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="e.g John"
                                            className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all placeholder:text-zinc-300 disabled:opacity-50"
                                            disabled={createRiderMutation.isPending}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 ml-1">Phone</label>
                                        <input
                                            type="tel"
                                            required
                                            pattern="(0[0-9]{10}|234[0-9]{10}|\+234[0-9]{10})"
                                            value={phonenumber}
                                            onChange={(e) => setPhonenumber(e.target.value)}
                                            placeholder="e.g. 08012345678"
                                            className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all placeholder:text-zinc-300 disabled:opacity-50"
                                            disabled={createRiderMutation.isPending}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 ml-1">Email</label>
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="e.g. john@example.com"
                                            className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all placeholder:text-zinc-300 disabled:opacity-50"
                                            disabled={createRiderMutation.isPending}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 ml-1">Address</label>
                                        <input
                                            type="text"
                                            required
                                            minLength={3}
                                            maxLength={150}
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            placeholder="e.g. 12 Admiralty Way, Lekki, Lagos"
                                            className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all placeholder:text-zinc-300 disabled:opacity-50"
                                            disabled={createRiderMutation.isPending}
                                        />
                                        <p className="text-[9px] text-zinc-400 mt-2 ml-1 italic font-medium">Note: Address must be valid for geocoding.</p>
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
                                            required
                                            pattern="[A-Za-z0-9 ]{2,50}"
                                            value={vehicleName}
                                            onChange={(e) => setVehicleName(e.target.value)}
                                            placeholder="e.g Toyota Corolla"
                                            className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all placeholder:text-zinc-300 disabled:opacity-50"
                                            disabled={createRiderMutation.isPending}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 ml-1">Vehicle Plate</label>
                                        <input
                                            type="text"
                                            required
                                            pattern="[A-Za-z0-9 -]{2,10}"
                                            value={vehiclePlate}
                                            onChange={(e) => setVehiclePlate(e.target.value)}
                                            placeholder="e.g ABC-123XY"
                                            className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all placeholder:text-zinc-300 disabled:opacity-50"
                                            disabled={createRiderMutation.isPending}
                                        />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </form>

                {/* Footer */}
                <div className="p-6 border-t border-zinc-100 bg-white shrink-0">
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={handleClose}
                            disabled={createRiderMutation.isPending || success}
                            className="px-6 py-3 bg-zinc-100 text-zinc-700 rounded-2xl text-[11px] font-bold hover:bg-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            form="create-rider-form"
                            disabled={createRiderMutation.isPending || success}
                            className="px-6 py-3 bg-emerald-800 text-white rounded-2xl text-[11px] font-bold hover:bg-emerald-900 transition-all shadow-md shadow-emerald-900/10 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {createRiderMutation.isPending ? (
                                <>
                                    <Loader2 size={14} className="animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Rider'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateRiderModal;
