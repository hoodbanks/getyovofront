import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, MapPin, X } from 'lucide-react';

const Addresses = () => {
    const navigate = useNavigate();
    const [addresses, setAddresses] = useState([
        { id: 1, text: '24B, Adeola Odeku Street, Victoria Island, Lagos.' },
        { id: 2, text: '24B, Adeola Odeku Street, Victoria Island, Lagos.' },
        { id: 3, text: '24B, Adeola Odeku Street, Victoria Island, Lagos.' }
    ]);

    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [addressToDelete, setAddressToDelete] = useState(null);

    const confirmDelete = () => {
        setAddresses(addresses.filter(a => a.id !== addressToDelete));
        setDeleteModalVisible(false);
    };

    return (
        <div className="min-h-screen w-full bg-[#f9f9f9] flex flex-col max-w-md mx-auto relative">
            <div className="bg-white pt-10 pb-4 px-4 sticky top-0 z-30 shadow-sm flex items-center justify-center relative">
                <button onClick={() => navigate(-1)} className="absolute left-4 w-10 h-10 flex items-center justify-center text-zinc-800 hover:bg-zinc-100 rounded-full transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-[17px] font-bold text-[#1C5E20]">Addresses</h1>
            </div>

            <div className="flex-1 px-4 py-6 overflow-y-auto">
                <div className="space-y-4">
                    {addresses.map((addr) => (
                        <div key={addr.id} className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm flex items-center gap-4">
                            <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center shrink-0">
                                <MapPin size={20} className="text-[#1C5E20]" />
                            </div>
                            <p className="flex-1 text-[13px] font-bold text-zinc-700 leading-relaxed pr-2">
                                {addr.text}
                            </p>
                            <button
                                onClick={() => {
                                    setAddressToDelete(addr.id);
                                    setDeleteModalVisible(true);
                                }}
                                className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-full shrink-0 transition-colors"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Delete Modal Overlay */}
            {deleteModalVisible && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
                    <div className="bg-white w-full max-w-xs rounded-3xl p-6 text-center shadow-xl animate-fade-in">
                        <h2 className="text-[17px] font-bold text-[#1C5E20] mb-2">Delete Address</h2>
                        <p className="text-xs text-zinc-500 mb-6 font-medium">Are you sure you want to delete this address?</p>

                        <div className="space-y-3">
                            <button
                                onClick={confirmDelete}
                                className="w-full bg-[#1C5E20] hover:bg-[#134015] text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-[#1C5E20]/20 text-sm"
                            >
                                Delete
                            </button>
                            <button
                                onClick={() => setDeleteModalVisible(false)}
                                className="w-full bg-transparent hover:bg-zinc-50 text-red-500 font-bold py-3.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-1"
                            >
                                <X size={16} strokeWidth={3} /> Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Addresses;
