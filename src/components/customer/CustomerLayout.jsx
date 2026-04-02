import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home, Search, ShoppingCart, User } from 'lucide-react';

const CustomerLayout = () => {
    const location = useLocation();

    const navItems = [
        { path: '/customer/app/home', label: 'Home', icon: Home },
        { path: '/customer/app/search', label: 'Search', icon: Search },
        { path: '/customer/app/cart', label: 'Cart', icon: ShoppingCart },
        { path: '/customer/app/profile', label: 'Profile', icon: User }
    ];

    return (
        <div className="min-h-screen bg-[#F7F9F4] flex flex-col relative w-full pb-20">
            {/* Main Content Area */}
            <main className="flex-1 w-full max-w-md mx-auto relative bg-[#F7F9F4] overflow-y-auto">
                <Outlet />
            </main>

            {/* Bottom Navigation */}
            <div className="fixed bottom-0 left-0 w-full bg-white border-t border-zinc-100 z-50">
                <div className="flex justify-around items-center h-16 max-w-md mx-auto px-2">
                    {navItems.map((item) => {
                        const isActive = location.pathname.startsWith(item.path);
                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={`flex flex-col items-center justify-center w-16 h-full transition-colors ${isActive ? 'text-[#1C5E20]' : 'text-zinc-600 hover:text-zinc-600'}`}
                            >
                                <Icon size={22} className={`mb-1 ${isActive ? 'fill-transparent' : 'fill-transparent stroke-[1.5]'}`} />
                                <span className={`text-[10px] font-semibold ${isActive ? 'text-[#1C5E20]' : ''}`}>
                                    {item.label}
                                </span>
                            </NavLink>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default CustomerLayout;
