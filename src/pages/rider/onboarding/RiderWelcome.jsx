import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Store, User } from 'lucide-react';
import logo from '../../../assets/images/GetYovo-Logo2.png';

const RiderWelcome = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#1C5E20] flex flex-col relative overflow-hidden text-center">
            {/* Curved top yellow background */}
            <div className="absolute top-0 left-0 w-full h-[23%] bg-[#FFD22F] rounded-b-[40%] scale-100 origin-top z-10"></div>

            <div className="flex-1 flex flex-col justify-between pt-24 px-6 max-w-sm mx-auto w-full pb-8">

                {/* Logo Block */}
                <div className="flex justify-center mt-2 mb-8 relative z-10">
                    <div className="bg-white p-2 rounded-2xl shadow-xl shadow-black/10">
                        <img src={logo} alt="GetYovo" className="w-24 h-24 object-contain" />
                    </div>
                </div>

                {/* Text Content */}
                <div className="text-white space-y-4 relative z-10">
                    <h1 className="text-3xl font-bold">Sell with GetYovo</h1>
                    <p className="text-lg opacity-90 leading-relaxed">
                        For restaurants, supermarkets and pharmacies
                    </p>

                    {/* Feature Pills */}
                    <div className="flex justify-between text-[13px] font-medium">
                        <div className="bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm flex-1 mx-1">
                            Get more<br />daily orders
                        </div>
                        <div className="bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm flex-1 mx-1">
                            Easily track<br />payouts
                        </div>
                        <div className="bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm flex-1 mx-1">
                            Free setup<br />support
                        </div>
                    </div>
                </div>

                <div className="flex justify-center my-2">
                    <Link to="/rider/login"
                        className="flex items-center gap-1.5 bg-white text-[#1C5E20] px-4 py-2 rounded-full text-md font-medium shadow-md hover:bg-zinc-100 transition-colors">
                        <User size={20} />
                        Rider Section
                    </Link>
                </div>

                {/* Bottom Actions */}
                <div className="relative z-10 space-y-2">
                    <div className="bg-white rounded-[32px] p-6 shadow-2xl">
                        <div className="space-y-4">
                            <button
                                onClick={() => navigate('/rider/login')}
                                className="w-full bg-[#1C5E20] hover:bg-green-900 text-white font-bold py-4 rounded-xl transition-colors text-sm"
                            >
                                Sign in
                            </button>
                        </div>

                        <p className="text-sm text-zinc-500 font-medium mt-4 text-center">
                            By continuing you agree to our <span className="font-bold text-[#002f1a]">Terms</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RiderWelcome;
