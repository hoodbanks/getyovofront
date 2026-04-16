import React from 'react';
import { Menu } from 'lucide-react';
import logo from '../assets/images/GetYovo-Logo1.png';
import phones from '../assets/images/Phones.png';
import mapBg from '../assets/images/map-background.png';

const Home = () => {
    return (
        <div className="min-h-screen bg-white p-3 font-sans">
            <div className="max-w-[1440px] mx-auto">
                {/* Hero Section */}
                <div className="relative bg-[#225B28] rounded-2xl overflow-hidden px-2 md:px-12 py-2 md:py-6 min-h-[350px] md:min-h-[900px]">
                   

                    {/* Navigation */}
                    <nav className="relative z-10 flex justify-between items-center">
                        <img src={logo} alt="GetYovo" className="h-16 md:h-20 w-auto" />
                        
                        {/* Desktop Download Button */}
                        <button className="hidden md:block bg-white text-[#0F4A33] px-6 py-2.5 rounded-full text-sm font-bold shadow-sm hover:bg-zinc-100 transition-all active:scale-95">
                            Download App
                        </button>

                        {/* Mobile Menu Icon */}
                        <button className="md:hidden text-white hover:bg-white/10 rounded-lg transition-colors">
                            <Menu size={28} />
                        </button>
                    </nav>

                    {/* Hero Content */}
                    <div className="relative z-10 md:mt-20 text-center max-w-4xl mx-auto space-y-3">
                        <h1 className="text-xl md:text-4xl lg:text-5xl font-semibold lg:font-bold text-white leading-[1.3] tracking-tight px-7 md:px-0">
                            Everything you need, delivered to your doorstep.
                        </h1>
                        <p className="text-xs md:text-xl text-white/90 font-medium max-w-2xl mx-auto leading-relaxed px-10 md:px-0">
                            Order from nearby stores and get it delivered in minutes.
                        </p>
                    </div>

                    {/* Map Background Decoration */}
                    <div 
                        className="absolute bottom-15 md:bottom-5 left-0 right-0 z-0 pointer-events-none opacity-100"
                        style={{
                            backgroundImage: `url(${mapBg})`,
                            backgroundPosition: 'center bottom',
                            backgroundSize: 'contain',
                            height: '600px',
                            backgroundRepeat: 'no-repeat'
                        }}
                    ></div>
                
                    {/* Phones Mockup Cluster */}
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-full max-w-5xl top-30 lg:top-0 px-4 translate-y-1/3 md:translate-y-1/2 z-20">
                        <img 
                            src={phones} 
                            alt="GetYovo App Mockups" 
                            className="w-full h-auto drop-shadow-[0_20px_50px_rgba(0,0,0,0.15)]"
                        />
                    </div>
                </div>

                {/* Mission Section */}
                <div className="mt-8 md:mt-10 mb-20 px-6 text-center bg-[#EEF2EF] rounded-2xl py-6">
                    <div className="lg:max-w-4xl mx-auto space-y-6">
                        <h2 className="text-md md:text-2xl lg:text-3xl font-medium text-zinc-900 md:leading-[1.3]">
                            We're changing the way people order, sell, and deliver by bringing customers closer to local vendors.
                        </h2>
                        
                        <div className="flex justify-center">
                            <button className=" sm:w-auto bg-[#225B28] text-white px-10 py-4 rounded-full text-base font-bold shadow-lg shadow-[#0F4A33]/20 hover:bg-[#0C3D2A] transition-all hover:scale-105 active:scale-95">
                                Download App
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <style jsx>{`
                .balance-text {
                    text-wrap: balance;
                }
            `}</style>
        </div>
    );
};

export default Home;
