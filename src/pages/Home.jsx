import React from 'react';
import Footer from '../components/common/Footer';
import Hero from '../components/common/Hero';

const Home = () => {
    return (
        <div className="min-h-screen bg-white p-3 font-sans pb-0">
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
