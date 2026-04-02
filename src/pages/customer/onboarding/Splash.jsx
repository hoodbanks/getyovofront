import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../../assets/images/GetYovo-Logo2.png';

const Splash = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/customer/onboarding');
        }, 3000);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center relative">
            <div className="flex flex-col items-center animate-pulse">
                <img src={logo} alt="GetYovo" className="w-48 md:w-56 mb-2" />
                <p className="text-[#00B074] font-semibold text-sm tracking-wide">Get your own Value on Demand</p>
                <div className="flex gap-1 mt-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00B074]"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00B074]"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00B074]"></div>
                </div>
            </div>
        </div>
    );
};

export default Splash;
