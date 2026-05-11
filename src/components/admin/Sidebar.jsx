import React, { useState } from 'react';
import {
    LayoutDashboard,
    BarChart3,
    Users,
    Store,
    Bike,
    ShoppingBag,
    CreditCard,
    Settings,
    LogOut,
    PanelLeftClose,
    PanelLeftOpen,
    Bell,
    Layers,
    X
} from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useMutation } from '@tanstack/react-query';
import api from '../../api/api';
import logo from '../../assets/images/GetYovo-Logo2.png';
import LogoutModal from './LogoutModal';

const SidebarItem = ({ icon: Icon, label, to, collapsed, end }) => {
    const { setMobileMenuOpen } = useStore();
    return (
        <NavLink
            to={to}
            end={end}
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) => `group flex items-center px-4 py-2.5 rounded-xl transition-all duration-200 ${isActive
                ? 'bg-[#00B074] text-white shadow-lg shadow-[#00B074]/20'
                : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100'
                } ${collapsed ? 'justify-center' : 'justify-between'}`}
        >
            {({ isActive }) => (
                <>
                    <div className="flex items-center gap-3">
                        <Icon size={20} className="shrink-0" strokeWidth={isActive ? 2.5 : 2} />
                        {!collapsed && <span className="text-sm font-medium whitespace-nowrap overflow-hidden">{label}</span>}
                    </div>

                    {/* Tooltip for collapsed state */}
                    {collapsed && (
                        <div className="fixed left-20 bg-zinc-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-[100] border border-zinc-800 whitespace-nowrap font-bold uppercase tracking-wider">
                            {label}
                        </div>
                    )}
                </>
            )}
        </NavLink>
    );
};

const SidebarGroup = ({ title, children, collapsed }) => (
    <div className="mb-6 border-t border-[#1F3655]">
        {!collapsed && (
            <h3 className="px-4 mb-2 py-3 text-[10px] uppercase tracking-wider font-bold text-zinc-500 truncate">
                {title}
            </h3>
        )}
        <div className="space-y-1">
            {children}
        </div>
    </div>
);

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { accessToken, logout: storeLogout, superAdmin } = useAuthStore();
    const {
        isSidebarCollapsed,
        toggleSidebar,
        isMobileMenuOpen,
        setMobileMenuOpen
    } = useStore();

    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const logoutMutation = useMutation({
        mutationFn: () => api.post('/superadmin/auth/logout', {}, accessToken),
        onSettled: () => {
            storeLogout();
            setIsLogoutModalOpen(false);
            navigate('/admin/login');
        }
    });

    const handleLogout = () => {
        logoutMutation.mutate();
    };

    const adminName = superAdmin?.firstname ? `${superAdmin.firstname} ${superAdmin.lastname}` : 'GetYovo Admin';
    const adminEmail = superAdmin?.email || 'admin@getyovo.com';
    const initials = superAdmin?.firstname 
        ? `${superAdmin.firstname[0]}${superAdmin.lastname?.[0] || ''}`.toUpperCase()
        : 'GA';

    const sidebarClasses = `
    fixed left-0 top-0 bottom-0 bg-[#0F172B] text-zinc-400 flex flex-col border-r border-zinc-800/50 z-50 transition-all duration-300 ease-in-out
    ${isSidebarCollapsed ? 'w-20' : 'w-64'}
    ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
  `;

    return (
        <>
            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            <aside className={sidebarClasses}>
                {/* Brand */}
                <div className={`mb-2 flex items-center transition-all duration-300 ${isSidebarCollapsed ? 'p-4 justify-center' : 'p-6 justify-between'}`}>
                    <div className="flex items-center gap-3">
                        <img
                            src={logo}
                            alt="GetYovo Logo"
                            className={`object-contain transition-all duration-300 ${isSidebarCollapsed ? 'w-10 h-10' : 'w-16 h-16'}`}
                        />
                    </div>
                    
                    {/* Desktop Toggle */}
                    {!isSidebarCollapsed && (
                        <button
                            onClick={toggleSidebar}
                            className="hidden lg:flex p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-500 transition-colors"
                        >
                            <PanelLeftClose size={18} />
                        </button>
                    )}

                    {/* Mobile Close Button */}
                    <button
                        onClick={() => setMobileMenuOpen(false)}
                        className="lg:hidden p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-500 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Mini Toggle for Collapsed State */}
                {isSidebarCollapsed && (
                    <div className="px-4 mb-4">
                        <button
                            onClick={toggleSidebar}
                            className="w-full flex justify-center p-2 hover:bg-zinc-800 rounded-xl text-zinc-500 transition-colors"
                        >
                            <PanelLeftOpen size={20} />
                        </button>
                    </div>
                )}

                {/* Profile */}
                <div className="px-4 mb-8">
                    <div className={`flex items-center gap-3 p-3 transition-all ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                        <div className="relative shrink-0">
                            <div className="w-10 h-10 rounded-full bg-emerald-900/80 text-emerald-400 flex items-center justify-center font-bold text-sm border border-emerald-800/50">
                                {initials}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#0a0f1e] rounded-full" />
                        </div>
                        {!isSidebarCollapsed && (
                            <div className="overflow-hidden">
                                <h4 className="text-sm font-bold text-white uppercase truncate">{adminName}</h4>
                                <p className="text-[10px] text-zinc-500 truncate">{adminEmail}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex-1 px-2 overflow-y-auto scrollbar-hide pb-6">
                    <div className="space-y-1 mb-6">
                        <SidebarItem
                            icon={LayoutDashboard}
                            label="Dashboard"
                            to="/admin"
                            collapsed={isSidebarCollapsed}
                            end={true}
                        />
                        <SidebarItem
                            icon={BarChart3}
                            label="Analytics"
                            to="/admin/analytics"
                            collapsed={isSidebarCollapsed}
                        />
                    </div>

                    <SidebarGroup title="User Management" collapsed={isSidebarCollapsed}>
                        <SidebarItem icon={Users} label="Customer" to="/admin/customers" collapsed={isSidebarCollapsed} />
                        <SidebarItem icon={Store} label="Vendor" to="/admin/vendors" collapsed={isSidebarCollapsed} />
                        <SidebarItem icon={Bike} label="Rider" to="/admin/riders" collapsed={isSidebarCollapsed} />
                    </SidebarGroup>

                    <SidebarGroup title="Orders & Payments" collapsed={isSidebarCollapsed}>
                        <SidebarItem icon={ShoppingBag} label="Orders" to="/admin/orders" collapsed={isSidebarCollapsed} />
                        <SidebarItem icon={CreditCard} label="Payments" to="/admin/payments" collapsed={isSidebarCollapsed} />
                        <SidebarItem icon={Bell} label="Push Notification" to="/admin/push-notifications" collapsed={isSidebarCollapsed} />
                        <SidebarItem icon={Settings} label="Settings" to="/admin/settings" collapsed={isSidebarCollapsed} />
                    </SidebarGroup>

                </div>

                {/* Logout */}
                <div className="p-4 mt-auto">
                    <button
                        onClick={() => {
                            setIsLogoutModalOpen(true);
                            setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:bg-red-500/10 hover:text-red-400 transition-colors duration-200 font-medium text-sm ${isSidebarCollapsed ? 'justify-center' : ''}`}
                    >
                        <LogOut size={20} className="shrink-0" />
                        {!isSidebarCollapsed && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            <LogoutModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onLogout={handleLogout}
                isLoading={logoutMutation.isPending}
            />
        </>
    );
};

export default Sidebar;
