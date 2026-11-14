import { X, ChevronDown, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../api/api';
import { useAuthStore } from '../../store/useAuthStore';

const InputField = ({ label, placeholder, name, value, onChange, type = "text" }) => (
    <div className="space-y-1.5">
        <label className="ml-1 block text-[10px] font-bold uppercase tracking-wider text-zinc-500">{label}</label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-xs font-medium text-zinc-700 outline-none transition-all placeholder:text-zinc-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
        />
    </div>
);

const SelectField = ({ label, placeholder, name, value, onChange, options }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectedOption = options.find((option) => option.value === value);
    return (
        <div className="space-y-1.5">
            <label className="ml-1 block text-[10px] font-bold uppercase tracking-wider text-zinc-500">{label}</label>
            <div className="relative">
                <button type="button" name={name} aria-haspopup="listbox" aria-expanded={isOpen} onClick={() => setIsOpen((current) => !current)} className="flex w-full items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 text-left text-xs font-medium text-zinc-700 outline-none transition-all hover:border-zinc-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10">
                    <span className={selectedOption ? 'text-zinc-700' : 'text-zinc-400'}>{selectedOption?.label || placeholder}</span>
                    <ChevronDown size={16} className={`shrink-0 text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && <div role="listbox" aria-label={label} className="absolute z-20 mt-2 max-h-52 w-full overflow-y-auto rounded-xl border border-zinc-100 bg-white p-1.5 shadow-xl">
                    {options.length ? options.map((option) => <button key={option.value} type="button" role="option" aria-selected={option.value === value} onClick={() => { onChange({ target: { name, value: option.value } }); setIsOpen(false); }} className={`w-full rounded-lg px-3 py-2.5 text-left text-xs transition-colors ${option.value === value ? 'bg-emerald-50 font-semibold text-emerald-800' : 'text-zinc-700 hover:bg-zinc-50'}`}>{option.label}</button>) : <p className="px-3 py-2 text-xs text-zinc-400">Loading store types…</p>}
                </div>}
            </div>
        </div>
    );
};

const CreateVendorModal = ({ isOpen, onClose }) => {
    const token = useAuthStore((state) => state.accessToken);
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        storeName: '',
        ownerName: '',
        email: '',
        phonenumber: '',
        shopTypeId: '', 
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

    const { data: shopTypesData } = useQuery({
        queryKey: ['shop-types'],
        queryFn: () => api.get('/shop-types/get-all', token)
    });

    const shopTypes = shopTypesData?.data || [];

    const createVendorMutation = useMutation({
        mutationFn: (data) => {
            const payload = {
                ...data,
                latitude: Number(data.latitude),
                longitude: Number(data.longitude),
                minimumOrderAmount: Number(data.minimumOrderAmount)
            };
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
                <div role="dialog" aria-modal="true" aria-label="Create Vendor" className="absolute inset-y-0 right-0 flex w-full max-w-lg animate-slide-in flex-col overflow-hidden bg-white shadow-2xl">
                {/* Header */}
                <div className="shrink-0 border-b border-white/10 bg-[#0F172B] p-4 flex items-center justify-between">
                    <h2 className="text-sm font-bold text-white">Create Vendor</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-300 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                    {/* Vendor Details Section */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-tight text-zinc-900">Vendor Details</h3>
                        <div className="space-y-4 rounded-2xl border border-zinc-100 bg-zinc-50/50 p-5">
                            <InputField label="Store Name" name="storeName" value={formData.storeName} onChange={handleInputChange} placeholder="e.g Roban mart" />
                            <SelectField 
                                label="Store Type" 
                                name="shopTypeId"
                                value={formData.shopTypeId}
                                onChange={handleInputChange}
                                placeholder="Select store type..." 
                                options={shopTypes.map(st => ({ 
                                    label: st.name.charAt(0).toUpperCase() + st.name.slice(1), 
                                    value: st.id 
                                }))}
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
                                    className="h-24 w-full resize-none rounded-xl border border-zinc-200 bg-white px-4 py-3 text-xs font-medium text-zinc-700 outline-none transition-all placeholder:text-zinc-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
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
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-tight text-zinc-900">Payout Details</h3>
                        <div className="space-y-4 rounded-2xl border border-zinc-100 bg-zinc-50/50 p-5">
                            <InputField label="Bank Name" name="bankName" value={formData.bankName} onChange={handleInputChange} placeholder="e.g Zenith" />
                            <InputField label="Account Name" name="accountName" value={formData.accountName} onChange={handleInputChange} placeholder="Registered name" />
                            <InputField label="Account Number" name="accountNumber" value={formData.accountNumber} onChange={handleInputChange} placeholder="10 digits account number" />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="shrink-0 border-t border-zinc-100 bg-white p-6 flex flex-col gap-3">
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
                            className="flex-1 rounded-2xl bg-zinc-100 px-6 py-3 text-[11px] font-bold text-zinc-700 transition-all hover:bg-zinc-200 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={() => createVendorMutation.mutate(formData)}
                            disabled={createVendorMutation.isPending}
                            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-800 px-6 py-3 text-[11px] font-bold text-white shadow-md shadow-emerald-900/10 transition-all hover:bg-emerald-900 disabled:opacity-50"
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
