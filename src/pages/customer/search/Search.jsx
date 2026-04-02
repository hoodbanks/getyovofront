import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';
import searching from '../../../assets/images/searching.png';

const imgPlaceholder = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=60';
const vendorPlaceholder = 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&auto=format&fit=crop&q=60';

const Search = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('Vendors');

    const vendorResults = [
        { id: 1, name: 'Roban Mart', image: vendorPlaceholder },
        { id: 2, name: 'Roban Mart', image: vendorPlaceholder },
    ];

    const itemResults = [
        { id: 1, name: 'Ogbono Soup', desc: 'Candles • ₦1,300', image: imgPlaceholder },
        { id: 2, name: 'Goat Pepper soup', desc: 'Candles • ₦4,500', image: imgPlaceholder },
        { id: 3, name: 'Paracetamol - 500mg', desc: 'Medplus • ₦700', image: imgPlaceholder },
    ];

    return (
        <div className="min-h-screen w-full bg-[#f9f9f9] flex flex-col">
            {/* Header / Search Controls */}
            <div className="bg-white pt-10 pb-4 px-4 sticky top-0 z-30 shadow-sm rounded-b-3xl">
                <div className="flex justify-center items-center mb-6 gap-2">
                    <SearchIcon size={18} className="text-[#1C5E20]" />
                    <h1 className="text-[17px] font-bold text-[#1C5E20]">Search</h1>
                </div>

                <div className="flex gap-2 mb-6">
                    <div className="flex-1 bg-zinc-100 rounded-xl px-4 py-3 flex items-center border border-zinc-100/50">
                        <input
                            type="text"
                            placeholder="Search vendors or items"
                            className="bg-transparent border-none outline-none w-full text-sm font-medium text-zinc-800 placeholder:text-zinc-400"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button className="bg-[#1C5E20] hover:bg-[#134015] text-white px-5 rounded-xl font-medium text-sm transition-colors shadow-sm shadow-[#1C5E20]/20">
                        Search
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 bg-zinc-100 rounded-full p-1">
                    <button
                        onClick={() => setActiveTab('Vendors')}
                        className={`flex-1 py-3 rounded-full text-sm font-medium transition-colors border ${activeTab === 'Vendors' ? 'bg-white border-[#1C5E20]/20 text-[#1C5E20] shadow-sm' : 'bg-transparent border-transparent text-[#1C5E20] hover:bg-zinc-50'}`}
                    >
                        Vendors
                    </button>
                    <button
                        onClick={() => setActiveTab('Items')}
                        className={`flex-1 py-3 rounded-full text-sm font-medium transition-colors border ${activeTab === 'Items' ? 'bg-white border-[#1C5E20]/20 text-[#1C5E20] shadow-sm' : 'bg-transparent border-transparent text-[#1C5E20] hover:bg-zinc-50'}`}
                    >
                        Items
                    </button>
                </div>
            </div>

            {/* Results Area */}
            <div className="px-4 py-6 flex-1 bg-[#F7F9F4]">
                {!searchQuery ? (
                    <div className="flex flex-col items-center justify-center h-full pt-20 opacity-70">
                        <img src={searching} alt="no Item" />
                        <p className="text-sm font-medium my-2 text-zinc-400">Start typing to find items</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {activeTab === 'Vendors' ? (
                            vendorResults.map(vendor => (
                                <div key={vendor.id} className="bg-white rounded-[20px] p-2 pb-4 shadow-sm border border-zinc-50">
                                    <div className="w-full h-28 rounded-xl overflow-hidden mb-3">
                                        <img src={vendor.image} alt={vendor.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="px-2">
                                        <h3 className="font-bold text-[#002f1a] text-sm mb-3">{vendor.name}</h3>
                                        <button
                                            onClick={() => navigate(`/customer/store/${vendor.id}`)}
                                            className="w-full bg-[#1C5E20] hover:bg-[#134015] text-white font-medium py-3 rounded-xl transition-colors text-sm"
                                        >
                                            Open store
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            itemResults.map(item => (
                                <div
                                    key={item.id}
                                    onClick={() => navigate(`/customer/item/${item.id}`)}
                                    className="bg-white p-3 rounded-2xl border border-zinc-100 shadow-sm flex items-center gap-4 cursor-pointer hover:border-zinc-200 transition-colors"
                                >
                                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h4 className="text-[14px] font-bold text-[#002f1a] mb-0.5">{item.name}</h4>
                                        <p className="text-[12px] font-medium text-zinc-600">{item.desc}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Search;
