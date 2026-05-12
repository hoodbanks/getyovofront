import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Music2 } from 'lucide-react';
import logo from '../../assets/images/GetYovo-Logo-Sized-yellow+white.png';

const Footer = () => {
    return (
        <footer className="w-full bg-[#225B28] rounded-2xl text-white mb-3 pt-16 pb-8 px-6 md:px-12 relative overflow-hidden">
            <div className="max-w-[1440px] mx-auto relative z-10">
                {/* Newsletter Section */}
                <div className="text-center mb-20">
                    <h2 className="text-2xl md:text-3xl font-bold mb-4 text-left md:text-center">Stay in the loop</h2>
                    <p className="text-white/80 max-w-xl mx-auto mb-8 text-left md:text-center text-sm md:text-base leading-relaxed">
                        Subscribe to receive exclusive offers from local vendors, early access to new features, and the latest Getyovo updates.
                    </p>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 max-w-2xl mx-auto">
                        <input 
                            type="email" 
                            placeholder="Enter your email" 
                            className="w-full md:flex-1 bg-white/10 border border-white/20 rounded-4xl px-6 py-4 outline-none focus:bg-white/15 transition-all text-white placeholder:text-white/50"
                        />
                        <button className="w-full md:w-auto bg-white text-[#0C3D2A] font-bold px-10 py-4 rounded-4xl hover:bg-zinc-100 transition-all active:scale-95">
                            Subscribe
                        </button>
                    </div>
                </div>

                {/* Divider */}
                <div className="w-full h-[1px] bg-white/20 mb-16"></div>

                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-16">
                    {/* Brand Section */}
                    <div className="space-y-6">
                        <img src={logo} alt="GetYovo" className="h-20 w-auto" />
                        <p className="text-white text-sm md:text-base leading-relaxed max-w-xs">
                            Getyovo powers local commerce by connecting pharmacies, grocers, and restaurants with riders and customers. Your neighborhood essentials, delivered in one app.
                        </p>
                        
                    </div>

                    {/* Quick Links Section */}
                    <div className="lg:pl-20">
                        <h3 className="text-xl font-bold mb-6">Quick Links</h3>
                        <ul className="space-y-4 text-white">
                            <li><Link title="About us" to="/about" className="hover:text-white transition-colors">Register as a vendor</Link></li>
                            <li><Link title="About us" to="/about" className="hover:text-white transition-colors">About us</Link></li>
                            <li><Link title="Terms & Privacy" to="/terms-and-conditions" className="hover:text-white transition-colors">Terms & Privacy</Link></li>
                            <li><Link title="Privacy Policy" to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                        </ul>
                    </div>

                    {/* Quick Links Section */}
                    <div className="lg:pl-20">
                        <div className="space-y-2 pt-4">
                            <p className="text-sm font-medium">+234 70 000 0000</p>
                            <p className="text-sm font-medium">info@getyovo.com</p>
                            <p className="text-sm font-medium leading-relaxed">
                                No 1 Grace and court Rd, Awka,<br />
                                EnuguOnitsha Expressway
                            </p>
                        </div>
                        {/* Social Icons */}
                        <div className="flex items-center gap-6 pt-4">
                            <a href="#" className="hover:text-white transition-colors"><Facebook size={24} /></a>
                            <a href="#" className="hover:text-white transition-colors"><Instagram size={24} /></a>
                            <a href="#" className="hover:text-white transition-colors"><Twitter size={24} /></a>
                            <a href="#" className="hover:text-white transition-colors"><Music2 size={24} /></a>
                        </div>
                    </div>
                </div>

                {/* Copyright Section */}
                <div className="text-center pt-8 border-t border-white/5">
                    <p className="text-sm text-white">
                        © 2026 Getyovo. All rights reserved. Built for the community.
                    </p>
                </div>
            </div>

            {/* Background Accent Text */}
            <div className="absolute bottom-[-15%] left-1/2 -translate-x-1/2 select-none pointer-events-none opacity-[0.2] text-[20vw] font-bold whitespace-nowrap">
                Getyovo
            </div>
        </footer>
    );
};

export default Footer;
