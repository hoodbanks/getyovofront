import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';

const itemPlaceholder = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=60';

const StoreDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState('All');

    const tabs = ['All', 'Breakfast', 'Lunch', 'Dinner'];

    const items = [
        { id: 1, name: 'Frozen Chicken (1kg)', price: 4200, oldPrice: 4500, image: itemPlaceholder, outOfStock: false, isDeal: true },
        { id: 2, name: 'Frozen Chicken (1kg)', price: 4200, oldPrice: null, image: itemPlaceholder, outOfStock: true, isDeal: false },
        { id: 3, name: 'Frozen Chicken (1kg)', price: 4200, oldPrice: 4500, image: itemPlaceholder, outOfStock: false, isDeal: true },
        { id: 4, name: 'Frozen Chicken (1kg)', price: 4200, oldPrice: null, image: itemPlaceholder, outOfStock: false, isDeal: false },
        { id: 5, name: 'Frozen Chicken (1kg)', price: 4200, oldPrice: 4500, image: itemPlaceholder, outOfStock: false, isDeal: true },
        { id: 6, name: 'Frozen Chicken (1kg)', price: 4200, oldPrice: null, image: itemPlaceholder, outOfStock: false, isDeal: false },
    ];

    return (
        <div className="min-h-screen w-full bg-[#F7F9F4] flex flex-col max-w-md mx-auto relative pb-8">
            {/* Header */}
            <div className="bg-white pt-10 px-4 sticky top-0 z-30">
                <div className="flex items-center justify-between mb-2">
                    <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-full transition-colors">
                        <ArrowLeft size={24} />
                    </button>

                    <h1 className="text-xl font-bold text-[#103D2E]">Roban Mart</h1>

                    <button className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:bg-zinc-50 rounded-full transition-colors">
                        <Search size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-6 px-2 pt-4 border-b border-zinc-100 overflow-x-auto scrollbar-hide">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-2 px-1 text-[16px] font-medium whitespace-nowrap transition-colors relative ${activeTab === tab ? 'text-[#103D2E]' : 'text-zinc-400'}`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#103D2E] rounded-t-full"></div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div className="px-4 py-8">
                <div className="grid grid-cols-2 gap-2">
                    {items.map(item => (
                        <div
                            key={item.id}
                            onClick={() => !item.outOfStock && navigate(`/customer/item/${item.id}`)}
                            className={`bg-white rounded-[28px] p-2 shadow-sm border border-zinc-100/50 flex flex-col relative ${item.outOfStock ? 'opacity-90' : 'cursor-pointer'}`}
                        >
                            {/* Image Container */}
                            <div className="w-full aspect-[4/3] rounded-[20px] overflow-hidden mb-3 relative">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />

                                {item.isDeal && (
                                    <div className="absolute top-2 right-2 bg-[#8B4513]/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-[12px] font-medium">
                                        Deal
                                    </div>
                                )}

                                {item.outOfStock && (
                                    <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-sm text-white px-3 py-1 rounded-full text-[12px] font-medium">
                                        Out of stock
                                    </div>
                                )}
                            </div>

                            {/* Text Info */}
                            <div className="px-1.5 pb-2 ml-1">
                                <h3 className="text-[13px] font-bold text-[#103D2E] mb-1 leading-snug">{item.name}</h3>
                                <div className="flex items-center text-[14px] font-bold">
                                    <span className="text-[#103D2E]">₦{item.price.toLocaleString()}</span>
                                    {item.oldPrice && (
                                        <span className="text-zinc-500 line-through font-medium text-[13px] ml-2">₦{item.oldPrice.toLocaleString()}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StoreDetail;
