import React, { useEffect } from 'react';
import Footer from '../components/common/Footer';
import Hero from '../components/common/Hero';
import orderImg from '../assets/images/order-img.png';
import prepareImg from '../assets/images/prepare-img.png';
import deliverImg from '../assets/images/deliver-img.png';
import prepareCheckImg from '../assets/images/prepare-check-img.png';
import googlePlayImg from '../assets/images/google-play-img.png';
import appleStoreImg from '../assets/images/apple-store-img.png';
import bgImage1 from '../assets/images/login-background2.png';
import bgImage2 from '../assets/images/login-background3.png';
import bgImage3 from '../assets/images/login-background4.png';
import doublePhoneImg from '../assets/images/double-phone-img.png';
import aboutImg from '../assets/images/about-image.png';

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

const About = () => {
    useReveal();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-white p-1 font-sans pb-0 overflow-x-hidden">
            <div className="max-w-[1440px] mx-auto">
                <Hero
                    title=" About Us"
                    description="Getyovo connects people with the local stores, pharmacies, and restaurants they already love and makes getting what you need as easy as a few taps."
                    showPhones={false}
                    showLogo={true}
                    showDownload={true}
                    showMenu={true}
                />

                {/* Our Story Section */}
                <div className="reveal reveal-up py-20 px-3 text-center max-w-4xl mx-auto space-y-8">
                    <div className="flex items-center justify-center gap-2 text-xl md:text-2xl font-bold text-[#1C5E20]">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#1C5E20]"></span>
                        <span>Our Story</span>
                    </div>
                    <div className="space-y-6 text-zinc-600 text-[15px] md:text-lg leading-relaxed font-medium max-w-3xl mx-auto">
                        <p>
                            Getyovo started with a simple observation: your neighborhood has everything you need, great food, trusted pharmacies, reliable grocery stores, but getting to them isn't always easy. Traffic, distance, time, and life get in the way.
                        </p>
                        <p>
                            We built Getyovo to close that gap. Not by replacing your local vendors, but by giving them a smarter way to reach you. Every order you place supports a business in your community. Every delivery keeps money and opportunity local.
                        </p>
                        <p>
                            We're growing, one neighborhood, one vendor, one delivery at a time.
                        </p>
                    </div>
                </div>

                {/* Mission & Vision Section */}
                <div className="reveal reveal-up px-4 mb-24 max-w-[1200px] mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Image Box */}
                        <div className="rounded-3xl overflow-hidden h-[400px] md:h-auto min-h-[500px]">
                            <img src={aboutImg} alt="Getyovo community" className="w-full h-full object-cover" />
                        </div>

                        {/* Text Boxes */}
                        <div className="flex flex-col gap-6">
                            {/* Our Mission */}
                            <div className="bg-[#F0F4F0] p-8 md:p-12 rounded-3xl flex-1 flex flex-col justify-center">
                                <div className="flex items-center gap-2 text-xl md:text-2xl font-bold text-zinc-900 mb-4">
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#1C5E20]"></span>
                                    <span>Our Mission</span>
                                </div>
                                <p className="text-zinc-600 text-[15px] md:text-base leading-relaxed font-medium">
                                    To power local commerce by making it effortless for people to order from nearby stores and for vendors to grow their businesses without the headache of managing delivery.
                                </p>
                            </div>

                            {/* Our Vision */}
                            <div className="bg-[#225B28] p-8 md:p-12 rounded-3xl flex-1 flex flex-col justify-center text-white">
                                <div className="flex items-center gap-2 text-xl md:text-2xl font-bold mb-4">
                                    <span className="w-2.5 h-2.5 rounded-full bg-white"></span>
                                    <span>Our Vision</span>
                                </div>
                                <p className="text-white/90 text-[15px] md:text-base leading-relaxed font-medium">
                                    To become the most trusted delivery network in every Nigerian community, where local businesses thrive and getting what you need is never more than a few taps away.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Page Content */}
                {/* How it Works Section */}
                <div className="mb-10 px-4 md:px-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
                        <div className="space-y-4 max-w-xl">
                            <div className="flex items-center gap-2 text-sm font-semibold text-[#1C5E20]">
                                <span className="w-2 h-2 rounded-full bg-[#1C5E20]"></span>
                                <span className='text-lg'>What We Do</span>
                            </div>
                            
                        </div>
                        <p className="text-zinc-600 max-w-md text-sm md:text-base leading-relaxed">
                            Getyovo is a delivery App built for three groups of people:
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Step 1 */}
                        <div className="reveal reveal-up bg-[#EEF2EF] p-8 space-y-6 relative group border border-zinc-100 hover:border-[#1C5E20]/20 transition-all rounded-tr-[5rem] md:rounded-tr-none md:rounded-bl-[5rem] overflow-hidden">
                            <div className="w-10 h-10 rounded-full bg-[#1C5E20] text-white flex items-center justify-center font-bold text-lg">
                                1
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-2xl font-bold text-zinc-900">Shopper</h3>
                                <p className="text-zinc-600 text-sm leading-relaxed">
                                    Get fast, reliable delivery from pharmacies, grocery stores, and restaurants near them with live tracking and a smooth experience from tap to doorstep.
                                </p>
                            </div>
                            <div className="pt-8">
                                <img src={orderImg} alt="Order" className="w-4/5 mx-auto transition-transform group-hover:scale-110" />
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="reveal reveal-up delay-100 bg-[#1C5E20] p-8 space-y-6 text-white relative group shadow-2xl shadow-[#1C5E20]/20 overflow-hidden">
                            <div className="w-10 h-10 rounded-full bg-white text-[#1C5E20] flex items-center justify-center font-bold text-lg">
                                2
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-2xl font-bold">Vendor</h3>
                                <p className="text-white/80 text-sm leading-relaxed">
                                    Get a ready-made digital storefront, a broader customer base, and a delivery network they don't have to build themselves.
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
                        <div className="reveal reveal-up delay-200 bg-[#EEF2EF] p-8 space-y-6 relative group border border-zinc-100 hover:border-[#1C5E20]/20 transition-all rounded-bl-[5rem] md:rounded-tr-[5rem] md:rounded-bl-none overflow-hidden">
                            <div className="w-10 h-10 rounded-full bg-[#1C5E20] text-white flex items-center justify-center font-bold text-lg">
                                3
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-2xl font-bold text-zinc-900">Rider</h3>
                                <p className="text-zinc-600 text-sm leading-relaxed">
                                    Get flexible earning opportunities connecting the two.
                                </p>
                            </div>
                            <div className="pt-8">
                                <img src={deliverImg} alt="Deliver" className="w-4/5 mx-auto transition-transform group-hover:scale-110" />
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
        </div>
    );
};

export default About;
