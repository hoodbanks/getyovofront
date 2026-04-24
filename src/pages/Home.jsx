import React, { useEffect } from 'react';
import Footer from '../components/common/Footer';
import Hero from '../components/common/Hero';
import shopperImg from '../assets/images/shopper-img.png';
import vendorImg from '../assets/images/vendor-img.png';
import orderImg from '../assets/images/order-img.png';
import prepareImg from '../assets/images/prepare-img.png';
import deliverImg from '../assets/images/deliver-img.png';
import prepareCheckImg from '../assets/images/prepare-check-img.png';
import pharmacyImg from '../assets/images/pharmacy-img.png';
import groceriesImg from '../assets/images/groceries-img.png';
import restaurantsImg from '../assets/images/restaurants-img.png';
import googlePlayImg from '../assets/images/google-play-img.png';
import appleStoreImg from '../assets/images/apple-store-img.png';
import bgImage1 from '../assets/images/login-background2.png';
import bgImage2 from '../assets/images/login-background3.png';
import bgImage3 from '../assets/images/login-background4.png';
import doublePhoneImg from '../assets/images/double-phone-img.png';

const useReveal = () => {
    useEffect(() => {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('show');
                }
            });
        }, observerOptions);

        const elements = document.querySelectorAll('.reveal');
        elements.forEach(el => observer.observe(el));

        return () => observer.disconnect();
    }, []);
};

const Home = () => {
    useReveal();

    return (
        <div className="min-h-screen bg-white p-1 font-sans pb-0">
            <div className="max-w-[1440px] mx-auto">
                <Hero
                    title="Everything you need, delivered to your doorstep."
                    description="Order from nearby stores and get it delivered in minutes."
                    showPhones={true}
                    showLogo={true}
                    showDownload={true}
                    showMenu={true}
                />

                {/* Mission Section */}
                <div className="reveal reveal-up mt-8 md:mt-10 mb-5 px-6 mx-2 text-center bg-[#EEF2EF] rounded-2xl py-6">
                    <div className="lg:max-w-4xl mx-auto space-y-6">
                        <h2 className="text-md md:text-2xl lg:text-3xl font-medium text-zinc-900 md:leading-[1.3]">
                            We're changing the way people order, sell, and deliver by bringing customers closer to local vendors.
                        </h2>

                        <div className="flex justify-center delay-200">
                            <button className=" sm:w-auto bg-[#225B28] text-white px-10 py-4 rounded-full text-base font-bold shadow-lg shadow-[#0F4A33]/20 hover:bg-[#0C3D2A] transition-all hover:scale-105 active:scale-95">
                                Download App
                            </button>
                        </div>
                    </div>
                </div>

                {/* Marketplace Sections */}
                <div className="space-y-16 md:space-y-32 mb-10 px-1 md:px-4">

                    {/* Shoppers Section */}
                    <div className="flex flex-col md:flex-row items-center text-left gap-6 lg:gap-12">
                        <div className="reveal reveal-left flex-1 space-y-6 text-left md:text-left">
                            <div className="flex items-center justify-start gap-2 text-sm font-semibold text-[#1C5E20]">
                                <span className="w-2 h-2 rounded-full bg-[#1C5E20]"></span>
                                <span>For Shoppers</span>
                            </div>
                            <h2 className="text-3xl md:text-5xl font-bold text-zinc-900 leading-tight">
                                Shop your favorites.
                            </h2>
                            <p className="text-lg text-zinc-600 max-w-lg mx-auto md:mx-0">
                                Simple ordering, reliable delivery, and a smooth experience from the moment you order to the moment it arrives.
                            </p>
                            <button className="bg-[#225B28] text-white px-8 py-3.5 rounded-4xl font-bold hover:bg-[#1C5E20] transition-colors shadow-lg shadow-[#1C5E20]/20">
                                Join as a shopper
                            </button>
                        </div>
                        <div className="reveal reveal-right flex-1 w-full max-w-xl">
                            <div className="relative overflow-hidden group">
                                <div className="absolute inset-x-0 bottom-0 top-1/4 rounded-t-full transition-transform group-hover:scale-105"></div>
                                <img
                                    src={shopperImg}
                                    alt="Shop your favorites"
                                    className="relative z-10 w-full h-auto"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Vendors Section */}
                    <div className="flex flex-col-reverse md:flex-row-reverse items-center gap-6 lg:gap-12">

                        {/* Text Content */}
                        <div className="reveal reveal-right flex-1 space-y-6 text-left md:text-left w-full">
                            <div className="flex items-center justify-start gap-2 text-sm font-semibold text-[#1C5E20]">
                                <span className="w-2 h-2 rounded-full bg-[#1C5E20]"></span>
                                <span>For Vendors</span>
                            </div>

                            <h2 className="text-3xl md:text-5xl font-bold text-zinc-900 leading-tight">
                                Grow your business.
                            </h2>

                            <p className="text-lg text-zinc-600 max-w-lg">
                                Reach more customers, increase sales, and let us handle the delivery side without adding stress to your day.
                            </p>

                            <button className="bg-[#225B28] text-white px-8 py-3.5 rounded-4xl font-bold hover:bg-[#1C5E20] transition-colors shadow-lg shadow-[#1C5E20]/20">
                                Join as a Vendor
                            </button>
                        </div>

                        {/* Image */}
                        <div className="reveal reveal-left flex-1 w-full max-w-xl">
                            <div className="relative overflow-hidden group">
                                <div className="absolute inset-x-0 bottom-0 top-1/4 transition-transform group-hover:scale-105"></div>

                                <img
                                    src={vendorImg}
                                    alt="Grow your business"
                                    className="relative z-10 w-full h-auto"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* How it Works Section */}
                <div className="mb-10 px-4 md:px-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
                        <div className="space-y-4 max-w-xl">
                            <div className="flex items-center gap-2 text-sm font-semibold text-[#1C5E20]">
                                <span className="w-2 h-2 rounded-full bg-[#1C5E20]"></span>
                                <span>How it works</span>
                            </div>
                            <h2 className="text-3xl md:text-5xl font-bold text-zinc-900 leading-tight">
                                We made the process easy for you
                            </h2>
                        </div>
                        <p className="text-zinc-600 max-w-md text-sm md:text-base leading-relaxed">
                            From life's essentials to your favorite cravings, Getyovo bridges the gap between your local stores and your front door. Just a few taps, and we handle the rest.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Step 1 */}
                        <div className="reveal reveal-up bg-[#EEF2EF] p-8 space-y-6 relative group border border-zinc-100 hover:border-[#1C5E20]/20 transition-all rounded-tr-[5rem] md:rounded-tr-none md:rounded-bl-[5rem]">
                            <div className="w-10 h-10 rounded-full bg-[#1C5E20] text-white flex items-center justify-center font-bold text-lg">
                                1
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-2xl font-bold text-zinc-900">Order</h3>
                                <p className="text-zinc-600 text-sm leading-relaxed">
                                    Choose your items from Pharmacy, Grocery, or Restaurant categories.
                                </p>
                            </div>
                            <div className="pt-8">
                                <img src={orderImg} alt="Order" className="w-4/5 mx-auto transition-transform group-hover:scale-110" />
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="reveal reveal-up delay-100 bg-[#1C5E20] p-8 space-y-6 text-white relative group shadow-2xl shadow-[#1C5E20]/20">
                            <div className="w-10 h-10 rounded-full bg-white text-[#1C5E20] flex items-center justify-center font-bold text-lg">
                                2
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-2xl font-bold">Prepare</h3>
                                <p className="text-white/80 text-sm leading-relaxed">
                                    The vendor accepts and prepares your order with care.
                                </p>
                            </div>
                            <div className="pt-8 relative">
                                <img src={prepareImg} alt="Prepare" className="w-4/5 mx-auto transition-transform group-hover:scale-110" />
                                <img
                                    src={prepareCheckImg}
                                    alt="Check"
                                    className="absolute top-5 right-[0] w-46 h-46 animate-in zoom-in duration-500 delay-300 fill-mode-both"
                                />
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="reveal reveal-up delay-200 bg-[#EEF2EF] p-8 space-y-6 relative group border border-zinc-100 hover:border-[#1C5E20]/20 transition-all rounded-bl-[5rem] md:rounded-tr-[5rem] md:rounded-bl-none">
                            <div className="w-10 h-10 rounded-full bg-[#1C5E20] text-white flex items-center justify-center font-bold text-lg">
                                3
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-2xl font-bold text-zinc-900">Deliver</h3>
                                <p className="text-zinc-600 text-sm leading-relaxed">
                                    A Getyovo rider picks it up and brings it straight to your door.
                                </p>
                            </div>
                            <div className="pt-8">
                                <img src={deliverImg} alt="Deliver" className="w-4/5 mx-auto transition-transform group-hover:scale-110" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Vendor Categories Section */}
                <div className="mb-32 px-4 md:px-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
                        <div className="space-y-4 max-w-xl">
                            <div className="flex items-center gap-2 text-sm font-semibold text-[#1C5E20]">
                                <span className="w-2 h-2 rounded-full bg-[#1C5E20]"></span>
                                <span>Vendor Categories</span>
                            </div>
                            <h2 className="text-3xl md:text-5xl font-bold text-zinc-900 leading-tight">
                                From Essentials to Indulgences
                            </h2>
                        </div>
                        <p className="text-zinc-600 max-w-md text-sm md:text-base leading-relaxed">
                            Shop the stores you trust and support your community with every order, all while enjoying the ultimate convenience.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Pharmacy */}
                        <div className="reveal reveal-up bg-[#225B28] rounded-[2.5rem] overflow-hidden flex flex-col pt-10 group">
                            <div className="px-10 space-y-4 mb-10">
                                <h3 className="text-2xl font-bold text-white">Pharmacy</h3>
                                <p className="text-white/80 text-sm max-w-[220px]">
                                    Professional care and health essentials delivered discreetly.
                                </p>
                            </div>
                            <div className="mt-auto">
                                <img
                                    src={pharmacyImg}
                                    alt="Pharmacy"
                                    className="w-full h-auto object-cover transition-transform group-hover:scale-105"
                                />
                            </div>
                        </div>

                        {/* Groceries */}
                        <div className="reveal reveal-up delay-100 bg-[#EEF2EF] rounded-[2.5rem] overflow-hidden flex flex-col pt-10 group">
                            <div className="px-10 space-y-4 mb-10">
                                <h3 className="text-2xl font-bold text-zinc-900">Groceries</h3>
                                <p className="text-zinc-600 text-sm max-w-[220px]">
                                    Fresh produce and household staples from local markets.
                                </p>
                            </div>
                            <div className="mt-auto">
                                <img
                                    src={groceriesImg}
                                    alt="Groceries"
                                    className="w-full h-auto object-cover transition-transform group-hover:scale-105"
                                />
                            </div>
                        </div>

                        {/* Restaurants */}
                        <div className="reveal reveal-up delay-200 bg-[#EEF2EF] rounded-[2.5rem] overflow-hidden flex flex-col pt-10 group">
                            <div className="px-10 space-y-4 mb-10">
                                <h3 className="text-2xl font-bold text-zinc-900">Restaurants</h3>
                                <p className="text-zinc-600 text-sm max-w-[220px]">
                                    Your city's best flavors, from street food to fine dining.
                                </p>
                            </div>
                            <div className="mt-auto">
                                <img
                                    src={restaurantsImg}
                                    alt="Restaurants"
                                    className="w-full h-auto object-cover transition-transform group-hover:scale-105"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Get Started CTA Banner */}
                <div className="reveal mt-15 mb-15 px-2">
                    <div className="bg-[#225B28] rounded-2xl relative overflow-hidden flex flex-col md:flex-row items-center px-2 md:px-20 pt-10">

                        {/* Background Images */}
                        <img
                            src={bgImage1}
                            alt="Background Decoration 1"
                            className="absolute top-[-100px] left-[-60px] md:top-[-60px] md:left-[-30px] -z-0 opacity-10 pointer-events-none"
                        />
                        <img
                            src={bgImage2}
                            alt="Background Decoration 2"
                            className="absolute top-[-80px] left-[-100px] md:top-[-110px] md:left-[-100px] -z-0 opacity-10 pointer-events-none"
                        />
                        <img
                            src={bgImage3}
                            alt="Background Decoration 3"
                            className="absolute bottom-0 right-0 -z-0 opacity-10 pointer-events-none w-140"
                        />

                        <div className="relative z-10 flex-1 space-y-8 text-center md:text-left">
                            <div className="space-y-2">
                                <h2 className="text-2xl text-left md:text-5xl font-bold text-white tracking-tight leading-tight">
                                    Ready to get started?
                                </h2>
                                <p className="text-white/80 text-left text-sm md:text-xl max-w-xl">
                                    Join the Getyovo community today as a shopper or a vendor.
                                </p>
                            </div>

                            <div className="flex flex-col md:flex-row justify-start gap-4">
                                <a href="#" className="transition-transform hover:scale-105">
                                    <img src={googlePlayImg} alt="Get it on Google Play" className="h-12 md:h-14" />
                                </a>
                                <a href="#" className="transition-transform hover:scale-105">
                                    <img src={appleStoreImg} alt="Download on the App Store" className="h-12 md:h-14" />
                                </a>
                            </div>
                        </div>

                        <div className="relative z-10 flex-1 mt-16 md:mt-0 w-full md:w-auto h-full flex justify-center md:justify-end">
                            <div className="relative w-full max-w-md transform md:translate-x-10 md:translate-y-10 rotate-3 group">
                                <div className="absolute inset-0 bg-white/5 rounded-3xl blur-2xl group-hover:bg-white/10 transition-colors"></div>
                                <img
                                    src={doublePhoneImg}
                                    alt="Join Getyovo"
                                    className="relative z-10 w-full"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />

            <style jsx>{`
                .balance-text {
                    text-wrap: balance;
                }
            `}</style>
        </div>
    );
};

export default Home;
