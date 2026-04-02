import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ChevronRight, Check } from 'lucide-react';

const Checkout = () => {
    const navigate = useNavigate();
    const [addresses, setAddresses] = useState([
        { id: 1, text: 'Proceed with current location', current: true },
        { id: 2, text: '24B, Adeola Odeku Street, Victoria Island, Lagos.', current: false },
        { id: 3, text: '24B, Adeola Odeku Street, Victoria Island, Lagos.', current: false } // Intentional dupe representation from UI spec
    ]);
    const [selectedAddress, setSelectedAddress] = useState(1);

    // Add address form state
    const [isAddingAddress, setIsAddingAddress] = useState(false);
    const [newAddress, setNewAddress] = useState({ street: '', city: '', state: '' });

    const handleSaveAddress = () => {
        if (newAddress.street && newAddress.city && newAddress.state) {
            const fullText = `${newAddress.street}, ${newAddress.city}, ${newAddress.state}`;
            setAddresses([...addresses, { id: Date.now(), text: fullText, current: false }]);
            setIsAddingAddress(false);
            setNewAddress({ street: '', city: '', state: '' });
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#f9f9f9] flex flex-col max-w-md mx-auto relative">
            <div className="bg-white pt-10 pb-4 px-4 sticky top-0 z-30 shadow-sm flex items-center justify-center">
                <button onClick={() => isAddingAddress ? setIsAddingAddress(false) : navigate(-1)} className="absolute left-4 w-10 h-10 flex items-center justify-center text-zinc-800 hover:bg-zinc-100 rounded-full transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-[17px] font-bold text-[#1C5E20]">{isAddingAddress ? 'Add delivery address' : 'Checkout'}</h1>
            </div>

            <div className="flex-1 px-4 py-6 overflow-y-auto">
                {!isAddingAddress ? (
                    <>
                        {/* Delivery Address Box */}
                        <div className="bg-white rounded-[24px] p-5 shadow-sm border border-zinc-100 mb-6 relative overflow-hidden">
                            <div className="flex items-center gap-2 mb-4">
                                <MapPinIcon className="text-red-500" />
                                <span className="font-bold text-[#002f1a] text-[15px]">Delivery Address</span>
                            </div>

                            <div className="space-y-4">
                                {addresses.map(addr => (
                                    <div
                                        key={addr.id}
                                        onClick={() => setSelectedAddress(addr.id)}
                                        className="flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-colors hover:bg-zinc-50"
                                        style={{ borderColor: selectedAddress === addr.id ? '#1C5E20' : '#f4f4f5' }}
                                    >
                                        <div className={`mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${selectedAddress === addr.id ? 'border-[#1C5E20] bg-[#1C5E20]' : 'border-zinc-300'}`}>
                                            {selectedAddress === addr.id && <Check size={12} className="text-white" strokeWidth={3} />}
                                        </div>
                                        <div className="flex-1">
                                            <p className={`text-[13px] font-bold leading-relaxed pr-6 ${selectedAddress === addr.id ? 'text-zinc-900' : 'text-zinc-500'}`}>{addr.text}</p>
                                        </div>
                                        {!addr.current && (
                                            <button className="text-zinc-400 hover:text-zinc-600 p-1 shrink-0">
                                                <Edit2Icon />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => setIsAddingAddress(true)}
                                className="mt-6 flex items-center gap-2 text-[#1C5E20] font-bold text-[14px] hover:underline"
                            >
                                <span className="bg-[#1C5E20]/10 p-1 rounded-md"><Plus size={16} /></span> Add delivery address
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="animate-fade-in space-y-6 pt-4">
                        <div className="flex items-start gap-3 opacity-60 pointer-events-none mb-10">
                            <div className="w-5 h-5 rounded-full border-2 border-zinc-300"></div>
                            <p className="text-[14px] font-bold text-zinc-500 mt-[-1px]">Proceed with current location</p>
                        </div>

                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Street Address"
                                value={newAddress.street}
                                onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                                className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-4 text-sm font-medium focus:outline-none focus:border-[#1C5E20]"
                            />
                            <input
                                type="text"
                                placeholder="City/Town"
                                value={newAddress.city}
                                onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                                className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-4 text-sm font-medium focus:outline-none focus:border-[#1C5E20]"
                            />
                            <input
                                type="text"
                                placeholder="State"
                                value={newAddress.state}
                                onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                                className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-4 text-sm font-medium focus:outline-none focus:border-[#1C5E20]"
                            />
                        </div>

                        <button
                            onClick={handleSaveAddress}
                            disabled={!newAddress.street || !newAddress.city || !newAddress.state}
                            className="w-full mt-4 bg-[#1C5E20] hover:bg-[#134015] disabled:bg-zinc-300 disabled:shadow-none text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-[#1C5E20]/20 text-[15px]"
                        >
                            Save
                        </button>
                    </div>
                )}
            </div>

            {/* Bottom Checkout Action (only visible when not adding) */}
            {!isAddingAddress && (
                <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-zinc-100 p-6 z-40 rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                    <div className="space-y-3 mb-6">
                        <div className="flex justify-between items-center text-[14px] font-bold">
                            <span className="text-zinc-900">Subtotal:</span>
                            <span className="text-zinc-500 font-medium">₦12,600</span>
                        </div>
                        <div className="flex justify-between items-center text-[14px] font-bold">
                            <span className="text-zinc-900">Delivery fee:</span>
                            <span className="text-zinc-500 font-medium">₦2,000</span>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/customer/order-confirmed')}
                        className="w-full bg-[#1C5E20] hover:bg-[#134015] text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-[#1C5E20]/20 flex justify-between items-center px-6"
                    >
                        <span>₦14,600</span>
                        <span className="flex items-center gap-1">Proceed to pay <ChevronRight size={18} /></span>
                    </button>
                </div>
            )}
        </div>
    );
};

// Helper components missing from imports to keep file clean
const MapPinIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>;
const Edit2Icon = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>;
const Plus = ({ size, className }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;


export default Checkout;
