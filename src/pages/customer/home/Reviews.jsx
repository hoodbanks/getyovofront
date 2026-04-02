import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Star } from 'lucide-react';

const Reviews = () => {
    const navigate = useNavigate();

    const reviews = [
        { id: 1, title: 'I love it', text: 'Crispy golden fries served with tender, well-seasoned chicken for a perfect classic combo', author: 'John Doe', rating: 5 },
        { id: 2, title: 'I love it', text: 'Crispy golden fries served with tender, well-seasoned chicken for a perfect classic combo', author: 'John Doe', rating: 4 },
        { id: 3, title: 'I love it', text: 'Crispy golden fries served with tender, well-seasoned chicken for a perfect classic combo', author: 'John Doe', rating: 5 },
        { id: 4, title: 'I love it', text: 'Crispy golden fries served with tender, well-seasoned chicken for a perfect classic combo', author: 'John Doe', rating: 4 },
    ];

    const renderStars = (rating) => {
        return (
            <div className="flex text-[#f5a623] mb-2">
                {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} fill={i < rating ? "currentColor" : "none"} className={i < rating ? "" : "text-zinc-300"} />
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen w-full bg-[#F7F9F4] flex flex-col max-w-md mx-auto relative pb-8">
            {/* Header */}
            <div className="bg-white pt-10 pb-4 px-4 sticky top-0 z-30 shadow-sm flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center text-zinc-800 hover:bg-zinc-100 rounded-full transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold text-[#002f1a]">Customer Review</h1>
            </div>

            <div className="px-4 py-6 space-y-4">
                {reviews.map(review => (
                    <div key={review.id} className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm">
                        {renderStars(review.rating)}
                        <h4 className="text-[14px] font-bold text-zinc-900 mb-1">{review.title}</h4>
                        <p className="text-[12px] text-zinc-500 font-medium leading-relaxed mb-3">
                            {review.text}
                        </p>
                        <p className="text-[11px] text-zinc-400 font-bold">By {review.author}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Reviews;
