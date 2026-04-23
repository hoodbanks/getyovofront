import { X, ChevronDown, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/api';
import { useAuthStore } from '../../store/useAuthStore';

const InputField = ({ label, placeholder, name, value, onChange, type = "text" }) => (
    <div className="space-y-2">
        <label className="text-[11px] font-bold text-zinc-900 uppercase tracking-tight">{label}</label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full px-5 py-4 bg-white border border-zinc-100 rounded-2xl text-xs font-medium text-zinc-700 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-zinc-300"
        />
    </div>
);

const SelectField = ({ label, placeholder, name, value, onChange, options }) => (
    <div className="space-y-2">
        <label className="text-[11px] font-bold text-zinc-900 uppercase tracking-tight">{label}</label>
        <div className="relative">
            <select 
                name={name}
                value={value}
                onChange={onChange}
                className="w-full px-5 py-4 bg-white border border-zinc-100 rounded-2xl text-xs font-medium text-zinc-400 appearance-none outline-none focus:ring-1 focus:ring-emerald-500/20 transition-all"
            >
                <option value="" disabled>{placeholder}</option>
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
        </div>
    </div>
);

const CreateVendorModal = ({ isOpen, onClose }) => {
    const token = useAuthStore((state) => state.accessToken);
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        storeName: '',
        ownerName: '',
        email: '',
        phonenumber: '',
        shopTypeId: 'shop_123', // Placeholder, ideally should fetch from shop types API
        storeAddress: '',
        latitude: 6.5,
        longitude: 3.4,
        storeDescription: '',
        openingTime: '08:00',
        closingTime: '20:00',
        minimumOrderAmount: 1000,
        whatsApp: '',
        bankName: '',
        accountName: '',
        accountNumber: ''
    });

    const createVendorMutation = useMutation({
        mutationFn: (data) => {
            const payload = {
                ...data,
                address: data.storeAddress, // Map storeAddress to address for API
                latitude: Number(data.latitude),
                longitude: Number(data.longitude),
                minimumOrderAmount: Number(data.minimumOrderAmount)
            };
            // Remove the internal storeAddress key to keep payload clean if needed
            delete payload.storeAddress;
            return api.post('/superadmin/vendors', payload, token);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['vendors']);
            onClose();
        }
    });

    if (!isOpen) return null;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            <div className={`absolute inset-0 bg-black/50 animate-fade-in`} onClick={onClose} />
            <div className={`absolute inset-y-0 right-0 max-w-lg w-full bg-white shadow-2xl animate-slide-in overflow-hidden flex flex-col`}>
                {/* Header */}
                <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-zinc-900">Create Vendor</h2>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-400 hover:text-zinc-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
                    {/* Vendor Details Section */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-bold text-zinc-900">Vendor Details</h3>
                        <div className="grid grid-cols-1 gap-5">
                            <InputField label="Store Name" name="storeName" value={formData.storeName} onChange={handleInputChange} placeholder="e.g Roban mart" />
                            <SelectField 
                                label="Store Type" 
                                name="shopTypeId"
                                value={formData.shopTypeId}
                                onChange={handleInputChange}
                                placeholder="Select store type..." 
                                options={[
                                    { label: 'Restaurant', value: 'shop_123' },
                                    { label: 'Grocery', value: 'shop_456' },
                                    { label: 'Supermarket', value: 'shop_789' }
                                ]}
                            />
                            <InputField label="Owner Name" name="ownerName" value={formData.ownerName} onChange={handleInputChange} placeholder="e.g Johnson" />
                            <InputField label="Phone" name="phonenumber" value={formData.phonenumber} onChange={handleInputChange} placeholder="Business phone (e.g. 0808...)" />
                            <InputField label="WhatsApp" name="whatsApp" value={formData.whatsApp} onChange={handleInputChange} placeholder="WhatsApp number" />
                            <InputField label="Email" name="email" value={formData.email} onChange={handleInputChange} placeholder="e.g johndoe@example.com" type="email" />
                            <InputField label="Address" name="storeAddress" value={formData.storeAddress} onChange={handleInputChange} placeholder="Enter address" />
                            <div className="grid grid-cols-2 gap-4">
                                <InputField label="Latitude" name="latitude" value={formData.latitude} onChange={handleInputChange} placeholder="6.5" type="number" />
                                <InputField label="Longitude" name="longitude" value={formData.longitude} onChange={handleInputChange} placeholder="3.4" type="number" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-zinc-900 uppercase tracking-tight">Store Description</label>
                                <textarea
                                    value={formData.storeDescription}
                                    onChange={(e) => setFormData({ ...formData, storeDescription: e.target.value })}
                                    placeholder="Enter store description..."
                                    className="w-full px-5 py-4 bg-white border border-zinc-100 rounded-2xl text-xs font-medium text-zinc-700 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-zinc-300 h-24 resize-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <InputField label="Opening Time" name="openingTime" value={formData.openingTime} onChange={handleInputChange} placeholder="08:00" type="time" />
                                <InputField label="Closing Time" name="closingTime" value={formData.closingTime} onChange={handleInputChange} placeholder="20:00" type="time" />
                            </div>
                            <InputField label="Min Order Amount" name="minimumOrderAmount" value={formData.minimumOrderAmount} onChange={handleInputChange} placeholder="1000" type="number" />
                        </div>
                    </div>

                    {/* Payout Details Section */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-bold text-zinc-900">Payout Details</h3>
                        <div className="grid grid-cols-1 gap-5">
                            <InputField label="Bank Name" name="bankName" value={formData.bankName} onChange={handleInputChange} placeholder="e.g Zenith" />
                            <InputField label="Account Name" name="accountName" value={formData.accountName} onChange={handleInputChange} placeholder="Registered name" />
                            <InputField label="Account Number" name="accountNumber" value={formData.accountNumber} onChange={handleInputChange} placeholder="10 digits account number" />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-zinc-100 flex flex-col gap-3">
                    {createVendorMutation.isError && (
                        <div className="mb-2 px-4 py-2 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-2">
                            <X size={14} className="text-rose-500" />
                            <p className="text-[10px] font-bold text-rose-600 uppercase tracking-tight">
                                {createVendorMutation.error?.message || 'Failed to create vendor. Check all fields.'}
                            </p>
                        </div>
                    )}
                    <div className="flex items-center gap-3 w-full">
                        <button
                            onClick={onClose}
                            disabled={createVendorMutation.isPending}
                            className="flex-1 py-3 text-xs font-bold text-zinc-900 bg-zinc-100 rounded-3xl hover:bg-zinc-200 transition-all disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={() => createVendorMutation.mutate(formData)}
                            disabled={createVendorMutation.isPending}
                            className="flex-1 py-3 text-xs font-bold text-white bg-emerald-800 rounded-3xl hover:bg-emerald-900 transition-all shadow-md shadow-emerald-900/10 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {createVendorMutation.isPending && <Loader2 className="animate-spin" size={16} />}
                            Create Vendor
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateVendorModal;
