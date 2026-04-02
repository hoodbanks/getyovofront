import React from 'react';
import { X, ChevronDown } from 'lucide-react';

const CreateVendorModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const InputField = ({ label, placeholder, type = "text" }) => (
        <div className="space-y-2">
            <label className="text-[11px] font-bold text-zinc-900 uppercase tracking-tight">{label}</label>
            <input
                type={type}
                placeholder={placeholder}
                className="w-full px-5 py-4 bg-white border border-zinc-100 rounded-2xl text-xs font-medium text-zinc-700 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-zinc-300"
            />
        </div>
    );

    const SelectField = ({ label, placeholder }) => (
        <div className="space-y-2">
            <label className="text-[11px] font-bold text-zinc-900 uppercase tracking-tight">{label}</label>
            <div className="relative">
                <select className="w-full px-5 py-4 bg-white border border-zinc-100 rounded-2xl text-xs font-medium text-zinc-400 appearance-none outline-none focus:ring-1 focus:ring-emerald-500/20 transition-all">
                    <option value="" disabled selected>{placeholder}</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="grocery">Grocery</option>
                    <option value="supermarket">Supermarket</option>
                </select>
                <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            </div>
        </div>
    );

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
                            <InputField label="Store Name" placeholder="e.g Roban mart" />
                            <SelectField label="Store Type" placeholder="Select store type..." />
                            <InputField label="Vendor Name" placeholder="e.g Johnson" />
                            <InputField label="Phone" placeholder="Business phone (e.g. 0808...)" />
                            <InputField label="Email" placeholder="e.g johndoe@example.com" type="email" />
                            <InputField label="Address" placeholder="Enter address" />
                        </div>
                    </div>

                    {/* Payout Details Section */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-bold text-zinc-900">Payout Details</h3>
                        <div className="grid grid-cols-1 gap-5">
                            <InputField label="Bank Name" placeholder="e.g Zenith" />
                            <InputField label="Account Name" placeholder="Registered name" />
                            <InputField label="Account Number" placeholder="10 digits account number" />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-zinc-100 flex items-center gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 text-xs font-bold text-zinc-900 bg-zinc-100 rounded-3xl hover:bg-zinc-200 transition-all"
                    >
                        Cancel
                    </button>
                    <button className="flex-1 py-3 text-xs font-bold text-white bg-emerald-800 rounded-3xl hover:bg-emerald-900 transition-all shadow-md shadow-emerald-900/10">
                        Create Vendor
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateVendorModal;
