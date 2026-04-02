import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Bell, Search, Star } from 'lucide-react';
import logo from '../../../assets/images/GetYovo-Logo2.png';
import map from '../../../assets/images/map1.png';
import position from '../../../assets/images/position.png';

// Using a placeholder image for stores for now, usually fetched from assets/api
const storePlaceholder = 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&auto=format&fit=crop&q=60';

const Home = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('All');

    const tabs = ['All', 'Restaurant', 'Shops', 'Pharmacy'];

    const vendors = [
        {
            id: 1,
            name: 'Roban Mart',
            image: storePlaceholder,
            deliveryTime: '25 - 45min',
            hours: '08:00 - 21:00 • Closed',
            rating: 4.5
        },
        {
            id: 2,
            name: 'Roban Mart',
            image: storePlaceholder,
            deliveryTime: '25 - 45min',
            hours: '08:00 - 21:00 • Open',
            rating: 4.5
        }
    ];

    return (
        <div className="min-h-screen w-full bg-[#F7F9F4] flex flex-col">
            {/* Header Section */}
            <div className="bg-white pt-10 pb-4 px-4 sticky top-0 z-30 shadow-sm rounded-b-3xl">
                <div className="flex items-center justify-between gap-3 mb-4">
                    {/* Logo */}
                    <img src={logo} alt="GetYovo" className="w-18 h-18 object-contain shrink-0" />

                    {/* Address Select */}
                    <div className="flex-1 bg-zinc-100 rounded-xl px-4 py-2.5 flex items-center justify-between border border-zinc-100">
                        <span className="text-zinc-400 text-sm font-medium">Enter new address</span>
                        <MapPin size={18} className="text-red-500" />
                        {/* <img src={position} alt="location" /> */}

                    </div>

                    {/* Notifications */}
                    <button onClick={() => navigate('/customer/notifications')} className="w-10 h-10 flex items-center justify-center shrink-0 text-zinc-600 hover:bg-zinc-100 rounded-full transition-colors relative">
                        <Bell size={22} />
                        <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                    </button>
                </div>

                {/* Search Bar Input (redirects to search view) */}
                <div
                    onClick={() => navigate('/customer/app/search')}
                    className="w-full bg-zinc-100 rounded-xl px-4 py-3.5 flex items-center gap-2 mb-4 border border-zinc-100/50 text-zinc-400 cursor-text"
                >
                    <Search size={18} className="text-zinc-400" />
                    <span className="text-sm font-medium">Search vendors or items</span>
                </div>

                {/* Category Tabs */}
                <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-5 py-2 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors ${activeTab === tab ? 'bg-[#103D2E] text-white' : 'bg-zinc-100 text-[#103D2E] hover:bg-zinc-200'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="px-4 py-6">
                <h2 className="text-[17px] font-bold text-[#103D2E] mb-4">Nearby vendors</h2>

                <div className="space-y-4">
                    {vendors.map(vendor => (
                        <div key={vendor.id} className="bg-white rounded-[32px] p-4 shadow-sm border border-zinc-100/50">
                            {/* Top Section: Horizontal Layout */}
                            <div className="flex items-center gap-4 mb-4">
                                {/* Vendor Image */}
                                <div className="w-34 h-26 rounded-2xl overflow-hidden shrink-0">
                                    <img src={vendor.image} alt={vendor.name} className="w-full h-full object-cover" />
                                </div>

                                {/* Vendor Details */}
                                <div className="flex-1 min-w-0 py-1">
                                    <h3 className="font-bold text-[#103D2E] text-lg truncate mb-1">{vendor.name}</h3>
                                    <p className="text-[14px] text-zinc-500 font-medium mb-1">{vendor.deliveryTime}</p>
                                    <p className="text-[14px] text-zinc-500 font-medium mb-2">{vendor.hours}</p>

                                    <div className="flex items-center gap-2">
                                        <div className="flex text-[#103D2E]">
                                            <Star size={20} fill="currentColor" strokeWidth={1} />
                                            <Star size={20} fill="currentColor" strokeWidth={1} />
                                            <Star size={20} fill="currentColor" strokeWidth={1} />
                                            <Star size={20} fill="currentColor" strokeWidth={1} />
                                            <Star size={20} className="text-[#103D2E]" fill="none" strokeWidth={1.5} />
                                        </div>
                                        <span className="text-[15px] font-bold text-zinc-500">{vendor.rating}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Button */}
                            <button
                                onClick={() => navigate(`/customer/store/${vendor.id}`)}
                                className="w-full bg-[#1C5E20] hover:bg-[#0a261d] text-white font-medium py-4 rounded-2xl transition-colors text-[17px]"
                            >
                                Open store
                            </button>
                        </div>
                    ))}
                </div>

                {/* Empty State / Prompt Box (as shown in design variant) */}
                <div className="mt-8 flex flex-col items-center justify-center p-6 text-center">
                    <img src={map} alt="GetYovo" className="w-18 h-18 object-contain shrink-0" />
                    <p className="text-sm font-medium text-zinc-500 px-4">
                        Click the red location <MapPin size={16} className="inline align-middle text-red-500" /> icon at the top to see nearby vendors
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Home;
