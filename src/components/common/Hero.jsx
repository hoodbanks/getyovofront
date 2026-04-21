import React, { useState } from 'react';
import { Menu, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '../../assets/images/GetYovo-Logo1.png';
import phonesImg from '../../assets/images/Phones.png';
import mapBg from '../../assets/images/map-background.png';

const Hero = ({
    title,
    description,
    showPhones = false,
    showLogo = true,
    showDownload = true,
    showMenu = true
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLegalOpen, setIsLegalOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
        if (isMenuOpen) setIsLegalOpen(false); // Reset legal dropdown when closing menu
    };

    const toggleLegal = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsLegalOpen(!isLegalOpen);
    };

    return (
        <div className={`relative bg-[#225B28] rounded-2xl overflow-hidden px-2 md:px-12 py-2 md:py-6 ${showPhones ? 'min-h-[350px] md:min-h-[900px]' : 'min-h-[250px] md:min-h-[500px]'}`}>

            {/* Navigation */}
            <nav className="relative z-50 flex justify-between items-center">
                {showLogo ? (
                    <Link to="/">
                        <img src={logo} alt="GetYovo" className="h-16 md:h-20 w-auto" />
                    </Link>
                ) : <div />}

                {/* Desktop Links */}
                {showMenu && (
                    <div className="hidden lg:flex items-center gap-8 text-white/90 font-medium">
                        <Link to="/" className="hover:text-white transition-colors">Home</Link>
                        <Link to="/about" className="hover:text-white transition-colors">About Us</Link>
                        <div className="relative group">
                            <button
                                onClick={toggleLegal}
                                className="flex items-center gap-1 hover:text-white transition-colors"
                            >
                                Legal {isLegalOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                            {isLegalOpen && (
                                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl overflow-hidden py-1 z-50">
                                    <Link to="/privacy-policy" onClick={() => setIsLegalOpen(false)} className="block px-4 py-2 text-zinc-800 hover:bg-zinc-100 text-sm">Privacy Policy</Link>
                                    <Link to="/terms-and-conditions" onClick={() => setIsLegalOpen(false)} className="block px-4 py-2 text-zinc-800 hover:bg-zinc-100 text-sm">Terms & Conditions</Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-4">
                    {/* Desktop Download Button */}
                    {showDownload && (
                        <button className="hidden md:block bg-white text-[#0F4A33] px-6 py-2.5 rounded-full text-sm font-bold shadow-sm hover:bg-zinc-100 transition-all active:scale-95">
                            Download App
                        </button>
                    )}

                    {/* Mobile Menu Icon */}
                    {showMenu && (
                        <button
                            onClick={toggleMenu}
                            className="md:hidden text-white hover:bg-white/10 rounded-lg p-1 transition-colors z-50"
                        >
                            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    )}
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && showMenu && (
                <div className="fixed inset-0 bg-[#225B28] z-40 md:hidden flex flex-col p-8 pt-24 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex flex-col gap-6 text-2xl font-bold text-white">
                        <Link to="/" onClick={toggleMenu} className="hover:text-white/70 transition-colors">Home</Link>
                        <Link to="/about" onClick={toggleMenu} className="hover:text-white/70 transition-colors">About Us</Link>

                        <div className="space-y-4">
                            <button
                                onClick={toggleLegal}
                                className="flex items-center justify-between w-full hover:text-white/70 transition-colors"
                            >
                                Legal {isLegalOpen ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                            </button>

                            {isLegalOpen && (
                                <div className="flex flex-col gap-4 pl-6 animate-in fade-in slide-in-from-left-4 duration-200">
                                    <Link to="/privacy-policy" onClick={toggleMenu} className="text-xl text-white/70 hover:text-white transition-colors">Privacy Policy</Link>
                                    <Link to="/terms-and-conditions" onClick={toggleMenu} className="text-xl text-white/70 hover:text-white transition-colors">Terms & Conditions</Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {showDownload && (
                        <button className="mt-auto bg-white text-[#0C3D2A] w-full py-4 rounded-2xl font-bold text-lg shadow-lg">
                            Download App
                        </button>
                    )}
                </div>
            )}

            {/* Hero Content */}
            <div className={`relative z-10 md:mt-20 text-center max-w-4xl mx-auto space-y-3 ${!showPhones ? 'pb-10' : ''}`}>
                <h1 className="text-xl md:text-4xl lg:text-5xl font-semibold lg:font-bold text-white leading-[1.3] tracking-tight px-7 md:px-0">
                    {title}
                </h1>
                <p className="text-xs md:text-xl text-white/90 font-medium max-w-2xl mx-auto leading-relaxed px-10 md:px-0">
                    {description}
                </p>
            </div>

            {/* Map Background Decoration */}
            <div
                className="absolute bottom-15 md:bottom-5 left-0 right-0 z-0 pointer-events-none opacity-100"
                style={{
                    backgroundImage: `url(${mapBg})`,
                    backgroundPosition: 'center bottom',
                    backgroundSize: 'contain',
                    height: showPhones ? '600px' : '400px',
                    backgroundRepeat: 'no-repeat'
                }}
            ></div>

            {/* Phones Mockup Cluster */}
            {showPhones && (
                <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-full max-w-5xl top-30 lg:top-0 px-4 translate-y-1/3 md:translate-y-1/2 z-20">
                    <img
                        src={phonesImg}
                        alt="GetYovo App Mockups"
                        className="w-full h-auto drop-shadow-[0_20px_50px_rgba(0,0,0,0.15)]"
                    />
                </div>
            )}
        </div>
    );
};

export default Hero;
