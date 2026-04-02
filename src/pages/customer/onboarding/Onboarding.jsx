import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import phone1 from '../../../assets/images/phone1.png';
import phone2 from '../../../assets/images/phone2.png';
import phone3 from '../../../assets/images/phone3.png';

const slides = [
    {
        id: 1,
        title: "Find nearby Vendors",
        description: "Groceries, restaurants, pharmacies- around you in minutes.",
        image: phone1
    },
    {
        id: 2,
        title: "Where should we deliver?",
        description: "Proceed with your current location or add your address.",
        image: phone2
    },
    {
        id: 3,
        title: "Track order in real time",
        description: "Order received -> Preparing -> Rider en-route -> Delivered.",
        image: phone3
    }
];

const Onboarding = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const navigate = useNavigate();

    const handleNext = () => {
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(currentSlide + 1);
        } else {
            navigate('/customer/welcome');
        }
    };

    const handleSkip = () => {
        navigate('/customer/welcome');
    };

    return (
        <div className="min-h-screen bg-[#F7F9F4] flex flex-col relative overflow-hidden">
            {/* Added a subtle green curve behind it like in the design */}
            <div className="absolute top-0 left-0 w-full h-[53.9%] bg-[#103D2E] rounded-b-[25%] scale-[1.15] origin-top z-0"></div>

            {/* Curved top yellow background */}
            <div className="absolute top-0 left-0 w-full h-[28%] bg-[#FFD22F] rounded-b-[80%] scale-100 origin-top z-10"></div>

            <div className="flex-1 flex flex-col pt-10 max-w-md mx-auto w-full h-full pb-8 relative z-20">
                {/* Image Container with precise constraints */}
                <div className="flex-1 min-h-0 flex items-center justify-center relative mt-4">
                    <img
                        src={slides[currentSlide].image}
                        alt="Onboarding Illustration"
                        className="h-full max-h-[460px] object-contain w-auto animate-fade-in drop-shadow-2xl"
                    />
                </div>

                {/* Bottom Content Area */}
                <div className="bg-[#F7F9F4] z-10 text-center p-6 animate-slide-in">
                    {/* Slide Indicators */}
                    <div className="flex justify-center gap-1.5 mb-6">
                        {slides.map((slide, index) => (
                            <div
                                key={slide.id}
                                className={`h-1.5 rounded-full transition-all duration-300 ${index === currentSlide ? 'w-6 bg-[#1C5E20]' : 'w-2 bg-[#00B074]/30'}`}
                            />
                        ))}
                    </div>

                    <h2 className="text-2xl font-medium text-[#1C5E20] mb-3">{slides[currentSlide].title}</h2>
                    <p className="text-sm font-medium text-zinc-500 mb-8 px-4 leading-relaxed">
                        {slides[currentSlide].description}
                    </p>

                    <div className="space-y-4 w-full">
                        <button
                            onClick={handleNext}
                            className="w-full bg-[#1C5E20] hover:bg-[#009260] text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-[#00B074]/30"
                        >
                            Next
                        </button>

                        <button
                            onClick={handleSkip}
                            className="w-full bg-transparent hover:bg-red-50 text-red-500 font-bold pt-3 rounded-xl transition-colors"
                        >
                            Skip
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Onboarding;
