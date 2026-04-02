import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Share2, Heart, Star, Minus, Plus, X } from 'lucide-react';
import addedToCartIcon from '../../../assets/images/cart-success.png';

const itemImage = 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=800&auto=format&fit=crop&q=60';

const ItemDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState(2);
    const [successModalVisible, setSuccessModalVisible] = useState(false);

    const [addons, setAddons] = useState([
        { id: 1, name: 'Extra Meat', price: 500, count: 0 },
        { id: 2, name: 'Fish', price: 700, count: 0 },
        { id: 3, name: 'Pomo', price: 400, count: 0 },
    ]);

    const basePrice = 20000;

    const updateAddonCount = (id, delta) => {
        setAddons(addons.map(addon => {
            if (addon.id === id) {
                const newCount = Math.max(0, addon.count + delta);
                return { ...addon, count: newCount };
            }
            return addon;
        }));
    };

    const addonsTotal = addons.reduce((sum, addon) => sum + (addon.price * addon.count), 0);
    const totalPrice = (basePrice * quantity) + addonsTotal;

    return (
        <div className="min-h-screen w-full bg-[#f9f9f9] flex flex-col max-w-md mx-auto relative pb-32">
            {/* Header Image Area */}
            <div className="relative w-full h-[400px]">
                <img src={itemImage} alt="Chicken and chips" className="w-full h-full object-cover" />

                {/* Top overlay controls */}
                <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-10">
                    <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white/90 backdrop-blur-md flex items-center justify-center rounded-full text-zinc-900 shadow-sm">
                        <ArrowLeft size={22} />
                    </button>

                    <div className="flex gap-2">
                        <div className="bg-white/40 backdrop-blur-md text-white px-4 py-2 rounded-full text-[12px] font-medium border border-white/20 h-10 flex items-center">
                            Deal
                        </div>
                        <button className="w-10 h-10 bg-white/90 backdrop-blur-md flex items-center justify-center rounded-full text-zinc-900 shadow-sm">
                            <Share2 size={20} />
                        </button>
                    </div>
                </div>

                {/* Pagination Dots Indicator */}
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-1.5 z-30">
                    {[...Array(8)].map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setActiveImage(i)}
                            className={`w-1.5 h-1.5 rounded-full transition-colors ${i === activeImage ? 'bg-white' : 'bg-white/40'}`}
                        />
                    ))}
                </div>
            </div>

            {/* Content Section (Overlapping Image) */}
            <div className="bg-[#F8FAF9] -mt-10 px-6 pt-8 relative z-20 pb-10">
                {/* Item Details */}
                <div className="mb-8 rounded-2xl bg-white p-4 shadow-sm">
                    <p className="text-[13px] font-bold text-[#103D2E] mb-1">Roban Mart</p>
                    <h1 className="text-2xl font-bold text-[#103D2E] mb-2 leading-tight">Chicken and chips</h1>
                    <p className="text-[14px] font-medium text-zinc-500 leading-snug mb-5">
                        Crispy golden fries served with tender, well-seasoned chicken for a perfect classic combo
                    </p>

                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-2xl font-bold text-[#103D2E]">₦{basePrice.toLocaleString()}</span>
                        <span className="text-[14px] font-medium text-zinc-400 line-through">₦25,000</span>
                    </div>

                    <div className="flex items-center gap-1.5 mb-6">
                        <div className="flex text-[#FFB800]">
                            <Star size={18} fill="currentColor" strokeWidth={0} />
                            <Star size={18} fill="currentColor" strokeWidth={0} />
                            <Star size={18} fill="currentColor" strokeWidth={0} />
                            <Star size={18} fill="currentColor" strokeWidth={0} />
                            <Star size={18} className="text-zinc-300" fill="currentColor" strokeWidth={0} />
                        </div>
                        <span className="text-[15px] font-bold text-zinc-400 ml-1">4.2</span>
                    </div>

                    {/* Main Quantity Selector */}
                    <div className="flex items-center gap-5">
                        <button
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="w-10 h-10 flex items-center justify-center border-2 border-[#1C5E20] rounded-lg text-zinc-400"
                        >
                            <Minus size={20} />
                        </button>
                        <span className="text-lg font-bold text-zinc-800">{quantity}</span>
                        <button
                            onClick={() => setQuantity(quantity + 1)}
                            className="w-10 h-10 flex items-center justify-center bg-[#1C5E20] rounded-lg text-white"
                        >
                            <Plus size={20} />
                        </button>
                    </div>


                    {/* Add-ons Section */}
                    <div className="mb-10">
                        <h3 className="text-lg font-bold text-[#103D2E] mb-5">Add-ons</h3>
                        <div className="space-y-3">
                            {addons.map(addon => (
                                <div key={addon.id} className="bg-white rounded-2xl p-4 border border-zinc-100 flex justify-between items-center shadow-sm">
                                    <div>
                                        <p className="text-[15px] font-bold text-[#103D2E] mb-0.5">{addon.name}</p>
                                        <p className="text-[14px] text-zinc-500 font-medium">₦{addon.price}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => updateAddonCount(addon.id, -1)}
                                            className="w-9 h-9 flex items-center justify-center border-2 border-[#1C5E20] rounded-lg text-zinc-500 disabled:opacity-80"
                                            disabled={addon.count === 0}
                                        >
                                            <Minus size={18} />
                                        </button>
                                        <span className="text-[15px] font-bold w-3 text-center text-zinc-800">{addon.count}</span>
                                        <button
                                            onClick={() => updateAddonCount(addon.id, 1)}
                                            className="w-9 h-9 flex items-center justify-center bg-[#1C5E20] rounded-lg text-white"
                                        >
                                            <Plus size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
                {/* Review Section */}
                <div className="mb-8 bg-white p-4 shadow-sm rounded-2xl">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-[#103D2E]">Customer Review</h3>
                        <button
                            onClick={() => navigate(`/customer/item/${id}/reviews`)}
                            className="text-[14px] font-bold text-[#103D2E] flex items-center gap-1.5"
                        >
                            See all
                            <div className="w-5 h-5 flex items-center justify-center">
                                <ArrowLeft size={18} className="rotate-180" />
                            </div>
                        </button>
                    </div>

                    <div className="space-y-4">
                        {[1, 2].map(r => (
                            <div key={r} className="bg-[#F8FAF9] p-6 rounded-[32px] border border-zinc-50/50 shadow-sm">
                                <div className="flex text-[#FFB800] mb-3">
                                    <Star size={16} fill="currentColor" strokeWidth={0} />
                                    <Star size={16} fill="currentColor" strokeWidth={0} />
                                    <Star size={16} fill="currentColor" strokeWidth={0} />
                                    <Star size={16} fill="currentColor" strokeWidth={0} />
                                    <Star size={16} className="text-zinc-200" fill="currentColor" strokeWidth={0} />
                                </div>
                                <h4 className="text-[16px] font-bold text-zinc-900 mb-1.5">I love it</h4>
                                <p className="text-[13px] text-zinc-500 font-medium leading-relaxed mb-4">
                                    Crispy golden fries served with tender, well-seasoned chicken for a perfect classic combo
                                </p>
                                <p className="text-[12px] text-zinc-900 font-bold">by John Doe</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Add to Cart Bar */}
            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-zinc-100 p-4 z-40 rounded-t-[32px]">
                <button
                    onClick={() => setSuccessModalVisible(true)}
                    className="w-full bg-[#1C5E20] text-white font-medium py-4 rounded-2xl flex justify-between items-center px-8 transition-transform active:scale-[0.98]"
                >
                    <span className="text-[17px] font-medium">₦{totalPrice.toLocaleString()}</span>
                    <div className="flex items-center gap-2">
                        <span className="text-[17px] font-medium">Add to cart</span>
                        <ArrowLeft size={18} className="rotate-180" />
                    </div>
                </button>
            </div>

            {/* Success Modal */}
            {successModalVisible && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-6">
                    <div className="bg-white w-full max-w-sm rounded-[40px] p-8 text-center shadow-2xl relative animate-in fade-in zoom-in duration-300">
                        <div className="flex justify-center mb-6">
                            <div className="w-32 h-32 flex items-center justify-center relative">
                                <img src={addedToCartIcon} alt="Added to cart" className="w-full h-full object-contain" />
                            </div>
                        </div>

                        <h2 className="text-[24px] font-bold text-[#103D2E] mb-2 leading-tight">Added to Cart</h2>
                        <p className="text-[14px] text-zinc-500 mb-10 font-medium px-4">
                            Your item has been successfully added to cart.
                        </p>

                        <div className="space-y-3 px-2">
                            <button
                                onClick={() => {
                                    setSuccessModalVisible(false);
                                    navigate('/customer/app/cart');
                                }}
                                className="w-full bg-[#1C5E20] text-white font-bold py-4 rounded-2xl transition-all active:scale-[0.98] text-[15px]"
                            >
                                View cart
                            </button>
                            <button
                                onClick={() => setSuccessModalVisible(false)}
                                className="w-full bg-transparent text-[#1C5E20] border-2 border-[#1C5E20]/20 font-bold py-4 rounded-2xl transition-all active:scale-[0.98] text-[15px]"
                            >
                                Continue shopping
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ItemDetail;
