import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Search, Bell, Menu } from 'lucide-react';
import { useStore } from '../../store/useStore';

const AdminLayout = () => {
    const { isSidebarCollapsed, toggleMobileMenu } = useStore();
    const location = useLocation();

    const routeDetails = {
        '/admin': {
            title: 'Dashboard',
            description: 'Monitor platform activity. Financial cards stay separate and are not one revenue total.'
        },
        '/admin/analytics': {
            title: 'Analytics',
            description: 'Monitor activity, growth, and performance at a glance.'
        },
        '/admin/customers': {
            title: 'Customers',
            description: 'View and manage registered customers.'
        },
        '/admin/vendors': {
            title: 'Vendors',
            description: 'Review and manage all platform vendors.'
        },
        '/admin/riders': {
            title: 'Riders',
            description: 'Track and manage delivery rider activities.'
        },
        '/admin/orders': {
            title: 'Orders',
            description: 'Paid vendor orders. Cancelled order amounts stay separate from Customer Wallet refunds.'
        },
        '/admin/transactions': {
            title: 'Transactions',
            description: 'Review operational financial activity. These records are not an accounting ledger.'
        },
        '/admin/payments': {
            title: 'Payments',
            description: 'Legacy delivered-order payout queue. This is not Vendor Wallet withdrawals or verified bank payouts.'
        },
        '/admin/wallet/vendor': {
            title: 'Vendor Wallet',
            description: 'Review vendor wallet balances, order credits, and withdrawal requests.'
        },
        '/admin/wallet/user': {
            title: 'User Wallet',
            description: 'Review user wallet balances, top-ups, payments, and refunds.'
        },
        '/admin/wallet/user/balances': {
            title: 'User Wallet Balances',
            description: 'Browse each customer spending-wallet balance and activity.'
        },
        '/admin/wallet/user/reconciliation': {
            title: 'Payment Reconciliation',
            description: 'Review customer spending-wallet payments held for reconciliation.'
        },
        '/admin/referral-activities': {
            title: 'Referral Wallet / Activities',
            description: 'Review referral wallet rewards and referral activity.'
        },
        '/admin/promotions': {
            title: 'Promotions',
            description: 'Create, enable, and disable promotional features.'
        },
        '/admin/push-notifications': {
            title: 'Push Notification',
            description: 'Send updates and alerts to your community.'
        },
        '/admin/broadcast': {
            title: 'Broadcast',
            description: 'Draft, publish, and deactivate persistent announcements for customers and vendors.'
        },
        '/admin/vendor-management': {
            title: 'Vendor Management',
            description: 'Manage vendor store types and categories.'
        },
        '/admin/settings': {
            title: 'Settings',
            description: 'Configure platform preferences and rules.'
        },
        '/admin/accounts': {
            title: 'Super Admin Accounts',
            description: 'Review and create Super Admin accounts.'
        },
        '/admin/audit': {
            title: 'Audit trail',
            description: 'Review recorded Super Admin actions and inspect event details.'
        }
    };

    const currentRoute = routeDetails[location.pathname] || (location.pathname.startsWith('/admin/wallet/vendor/vendors/') ? {
        title: 'Vendor Wallet Details',
        description: 'Review a vendor’s spending and withdrawal wallet activity.'
    } : location.pathname === '/admin/wallet/vendor/vendors' ? {
        title: 'Vendor Wallets',
        description: 'Browse vendor identities and available wallet balances.'
    } : {
        title: 'Dashboard',
        description: 'Monitor platform activity. Financial cards stay separate and are not one revenue total.'
    });

    return (
        <div className="min-h-screen bg-[#E2E8F0A6] flex">
            <Sidebar />
            <div className={`flex-1 min-w-0 flex flex-col transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
                {/* Header */}
                <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-zinc-200">
                    <div className="max-w-[1600px] mx-auto">
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
