import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/images/GetYovo-Logo2.png';

const RiderSimpleHeader = ({ title, icon: Icon }) => {
    const navigate = useNavigate();

    return (
        <div className="bg-white pt-6 pb-4 px-4 shadow-sm flex items-center justify-between sticky top-0 z-40">
            <button onClick={() => navigate('/rider/app/dashboard')} className="outline-none">
                <img src={logo} alt="GetYovo" className="h-16 object-contain" />
            </button>
            <div className="flex items-center gap-2">
                {Icon && <Icon size={20} className="text-[#1C5E20]" />}
                <h1 className="text-[17px] font-bold text-[#1C5E20]">{title}</h1>
            </div>
        </div>
    );
};

export default RiderSimpleHeader;
