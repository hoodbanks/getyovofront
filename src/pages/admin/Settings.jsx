import React, { useState } from 'react';
import {
    ChevronRight,
    Clock,
    Settings as SettingsIcon,
    Truck,
    Building2,
    Users,
    Store,
    MessageSquare,
    Search,
    Lock,
    Layers
} from 'lucide-react';
import VendorManagement from './VendorManagement';
import OperatingHoursModal from '../../components/admin/OperatingHoursModal';
import MaintenanceModeModal from '../../components/admin/MaintenanceModeModal';
import DeliveryFeeModal from '../../components/admin/DeliveryFeeModal';
import BusinessProfileModal from '../../components/admin/BusinessProfileModal';
import ChangePasswordModal from '../../components/admin/ChangePasswordModal';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('General App Controls');
    const [maintenanceEnabled, setMaintenanceEnabled] = useState(false);

    // Modal states
    const [isHoursModalOpen, setIsHoursModalOpen] = useState(false);
    const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
    const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    const tabs = [
        { id: 'General App Controls', icon: SettingsIcon },
        { id: 'User App Settings', icon: Users },
        { id: 'Vendor App Settings', icon: Store },
        { id: 'Vendor Management', icon: Layers },
    ];

    const generalSettings = [
        {
            id: 'operating-hours',
            title: 'Operating Hours',
            description: 'Set business hours & closures',
            icon: Clock,
            action: () => setIsHoursModalOpen(true)
        },
        {
            id: 'maintenance-mode',
            title: 'Maintenance mode',
            description: 'Enable this while performing system updates',
            icon: SettingsIcon,
            hasToggle: true,
            onToggle: () => setMaintenanceEnabled(!maintenanceEnabled),
            toggleValue: maintenanceEnabled,
            secondaryAction: () => setIsMaintenanceModalOpen(true),
            secondaryActionLabel: 'Edit message'
        },
        {
            id: 'delivery-fee',
            title: 'Delivery Fee Calculation',
            description: 'Set how delivery charges are calculated based on distance.',
            icon: Truck,
            action: () => setIsFeeModalOpen(true)
        },
        {
            id: 'business-profile',
            title: 'Business Profile',
            description: 'Company info & contacts',
            icon: Building2,
            action: () => setIsProfileModalOpen(true)
        },
        {
            id: 'change-password',
            title: 'Change Password',
            description: 'Update your account security',
            icon: Lock,
            action: () => setIsPasswordModalOpen(true)
        },
    ];

    return (
        <div className="space-y-6 max-w-[440px] md:max-w-[1600px] mx-auto pb-10">
            {/* Header with Tabs */}
            <div className="bg-white p-4 rounded-[2rem] shadow-sm border border-zinc-100 overflow-hidden">
                <div className="flex items-center gap-2 bg-zinc-50 p-1.5 rounded-3xl w-full overflow-x-auto no-scrollbar whitespace-nowrap">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-3xl text-[11px] font-bold transition-all ${activeTab === tab.id
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-100 shadow-sm'
                                    : 'text-zinc-500 hover:text-zinc-700'
                                }`}
                        >
                            {tab.id}
                        </button>
                    ))}
                </div>
            </div>

            {/* List of Settings */}
            <div className="bg-white rounded-[2rem] border border-zinc-100 overflow-hidden shadow-sm">
                <div className="p-8 space-y-4">
                    {activeTab === 'General App Controls' && generalSettings.map((item) => (
                        <div
                            key={item.id}
                            className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 md:p-6 bg-zinc-50/50 hover:bg-zinc-100/50 rounded-2xl border border-zinc-100 transition-all cursor-pointer gap-4"
                            onClick={item.action}
                        >
                            <div className="flex items-center gap-5">
                                <div className="p-3 bg-white rounded-xl text-zinc-400 group-hover:text-zinc-600 transition-colors shadow-sm">
                                    <item.icon size={20} />
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="text-sm font-bold text-zinc-900 leading-tight">{item.title}</h3>
                                    <p className="text-[10px] text-zinc-500 font-medium">{item.description}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                                {item.hasToggle && (
                                    <div className="flex items-center gap-6">
                                        {/* Toggle Switch */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                item.onToggle();
                                            }}
                                            className={`relative w-11 h-6 rounded-full transition-colors duration-200 outline-none ${item.toggleValue ? 'bg-emerald-500' : 'bg-zinc-300'
                                                }`}
                                        >
                                            <div className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${item.toggleValue ? 'translate-x-5' : 'translate-x-0'
                                                }`} />
                                        </button>

                                        {item.secondaryAction && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    item.secondaryAction();
                                                }}
                                                className="text-[11px] font-bold text-zinc-800 hover:text-zinc-900 transition-colors"
                                            >
                                                {item.secondaryActionLabel}
                                            </button>
                                        )}
                                    </div>
                                )}
                                <ChevronRight
                                    size={18}
                                    className="text-zinc-300 group-hover:text-zinc-400 group-hover:translate-x-1 transition-all"
                                />
                            </div>
                        </div>
                    ))}

                    {activeTab === 'Vendor Management' && (
                        <div className="p-0">
                            <VendorManagement />
                        </div>
                    )}

                    {activeTab !== 'General App Controls' && activeTab !== 'Vendor Management' && (
                        <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
                            <div className="p-4 bg-zinc-50 rounded-full text-zinc-300">
                                <SettingsIcon size={32} />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-zinc-900">{activeTab}</h3>
                                <p className="text-[10px] text-zinc-500 font-medium max-w-[200px]">Specific settings for this app category are coming soon.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            <OperatingHoursModal
                isOpen={isHoursModalOpen}
                onClose={() => setIsHoursModalOpen(false)}
            />
            <MaintenanceModeModal
                isOpen={isMaintenanceModalOpen}
                onClose={() => setIsMaintenanceModalOpen(false)}
            />
            <DeliveryFeeModal
                isOpen={isFeeModalOpen}
                onClose={() => setIsFeeModalOpen(false)}
            />
            <BusinessProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
            />
            <ChangePasswordModal
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
            />
        </div>
    );
};

export default Settings;
