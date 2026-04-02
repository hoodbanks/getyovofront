import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Search, Bell, Menu } from 'lucide-react';
import { useStore } from '../../store/useStore';

const AdminLayout = () => {
    const { isSidebarCollapsed, toggleMobileMenu } = useStore();
    const location = useLocation();

    const routeDetails = {
        '/': {
            title: 'Dashboard',
            description: 'Monitor platform activity, performance, and revenue.'
        },
        '/analytics': {
            title: 'Analytics',
            description: 'Monitor activity, growth, and performance at a glance.'
        },
        '/customers': {
            title: 'Customers',
            description: 'View and manage registered customers.'
        },
        '/vendors': {
            title: 'Vendors',
            description: 'Review and manage all platform vendors.'
        },
        '/riders': {
            title: 'Riders',
            description: 'Track and manage delivery rider activities.'
        },
        '/orders': {
            title: 'Orders',
            description: 'Monitor and manage all customer orders.'
        },
        '/payments': {
            title: 'Payments',
            description: 'Track revenue, commissions, and payouts.'
        },
        '/settings': {
            title: 'Settings',
            description: 'Configure platform preferences and rules.'
        }
    };

    const currentRoute = routeDetails[location.pathname] || {
        title: 'Dashboard',
        description: 'Monitor platform activity, performance, and revenue.'
    };

    return (
        <div className="min-h-screen bg-[#E2E8F0A6] flex">
            <Sidebar />
            <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
                {/* Header */}
                <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-zinc-200">
                    <div className="flex items-center justify-between px-4 lg:px-8 py-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={toggleMobileMenu}
                                className="lg:hidden p-2 text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors"
                            >
                                <Menu size={20} />
                            </button>
                            <div>
                                <h2 className="text-lg lg:text-2xl font-medium text-zinc-900 leading-tight">{currentRoute.title}</h2>
                                <p className="hidden sm:block text-sm text-zinc-500">{currentRoute.description}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 lg:gap-4">
                            <div className="relative group hidden md:block">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="pl-10 pr-4 py-2.5 w-48 lg:w-72 bg-zinc-100 border-transparent rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                />
                            </div>
                            <button className="relative w-11 h-11 flex items-center justify-center bg-zinc-100 rounded-2xl text-zinc-600 hover:bg-zinc-200 transition-colors">
                                <Bell size={20} />
                                <div className="absolute top-3 right-3 w-2 h-2 bg-red-500 border-2 border-white rounded-full" />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="p-4 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
