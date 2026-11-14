import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
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
    Layers,
    Timer,
    Loader2,
    Gift,
    CreditCard,
    Smartphone
} from 'lucide-react';
import VendorManagement from './VendorManagement';
import OperatingHoursModal from '../../components/admin/OperatingHoursModal';
import MaintenanceModeModal from '../../components/admin/MaintenanceModeModal';
import AppUpdateModal from '../../components/admin/AppUpdateModal';
import DeliveryFeeModal from '../../components/admin/DeliveryFeeModal';
import OrderTimingModal from '../../components/admin/OrderTimingModal';
import BusinessProfileModal from '../../components/admin/BusinessProfileModal';
import ChangePasswordModal from '../../components/admin/ChangePasswordModal';
import ReferralProgramSettings from '../../components/admin/ReferralProgramSettings';
import PaymentMethodsSettings from '../../components/admin/PaymentMethodsSettings';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '../../api/api';
import { useAuthStore } from '../../store/useAuthStore';

const DEFAULT_MAINTENANCE_MESSAGE = 'Maintenance ongoing.';

const Settings = () => {
    const token = useAuthStore((state) => state.accessToken);
    const queryClient = useQueryClient();
    const [searchParams, setSearchParams] = useSearchParams();
    const requestedTab = searchParams.get('tab');
    const availableTabs = ['General App Controls', 'User App Settings', 'Vendor App Settings', 'Shop Type Management', 'Referral Program', 'Payment Methods'];
    const activeTab = availableTabs.includes(requestedTab) ? requestedTab : 'General App Controls';
    const handleTabChange = (tab) => {
        setSearchParams((current) => {
            const next = new URLSearchParams(current);
            if (tab === 'General App Controls') next.delete('tab');
            else next.set('tab', tab);
            return next;
        });
    };

    // Modal states
    const [isHoursModalOpen, setIsHoursModalOpen] = useState(false);
    const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
    const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
    const [isTimingModalOpen, setIsTimingModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isAppUpdateModalOpen, setIsAppUpdateModalOpen] = useState(false);

    // Fetch All Settings
    const { data: settingsData, isLoading } = useQuery({
        queryKey: ['admin-settings'],
        queryFn: async () => {
            return await api.get('/superadmin/settings', token);
        }
    });

    const settings = settingsData?.data || [];
    const settingsMap = settings.reduce((acc, curr) => {
        acc[curr.key] = curr.value;
        return acc;
    }, {});
    const maintenanceEnabled = settingsMap.MAINTENANCE_ENABLED === 'true';
    const maintenanceMessage = String(settingsMap.MAINTENANCE_MESSAGE || '').trim() || DEFAULT_MAINTENANCE_MESSAGE;

    const maintenanceMutation = useMutation({
        mutationFn: (payload) => api.patch('/superadmin/settings/maintenance', payload, token),
        onSuccess: async (response) => {
            await queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
            toast.success(response?.message || 'Maintenance updated');
            setIsMaintenanceModalOpen(false);
        },
        onError: (error) => toast.error(error?.message || 'Could not save maintenance.'),
    });

    const appUpdateEnabled = settingsMap.APP_UPDATE_REQUIRED === 'true';
    const appMinVersion = String(settingsMap.APP_MIN_VERSION || '').trim() || '1.1.0';

    const appUpdateMutation = useMutation({
        mutationFn: (payload) => api.patch('/superadmin/settings/app-update', payload, token),
        onSuccess: async (response) => {
            await queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
            toast.success(response?.message || 'App update rule saved');
            setIsAppUpdateModalOpen(false);
        },
        onError: (error) => toast.error(error?.message || 'Could not save the app update rule.'),
    });

    const tabs = [
        { id: 'General App Controls', icon: SettingsIcon },
        { id: 'User App Settings', icon: Users },
        { id: 'Vendor App Settings', icon: Store },
        { id: 'Shop Type Management', icon: Layers },
        { id: 'Referral Program', icon: Gift },
        { id: 'Payment Methods', icon: CreditCard },
    ];

    const generalSettings = [
        {
            id: 'delivery-fee',
            title: 'Delivery Fee Calculation',
            description: 'Set how delivery charges are calculated based on distance.',
            icon: Truck,
            action: () => setIsFeeModalOpen(true)
        },
        {
            id: 'order-timing',
            title: 'Order Prep & Timing',
            description: 'Set default prep time and travel rates.',
            icon: Timer,
            action: () => setIsTimingModalOpen(true)
        },
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
            description: maintenanceEnabled ? maintenanceMessage : 'Enable this while performing system updates',
            icon: SettingsIcon,
            hasToggle: true,
            action: () => setIsMaintenanceModalOpen(true),
            toggleDisabled: maintenanceMutation.isPending,
            onToggle: () => maintenanceMutation.mutate({
                enabled: !maintenanceEnabled,
                message: maintenanceMessage,
            }),
            toggleValue: maintenanceEnabled,
            secondaryAction: () => setIsMaintenanceModalOpen(true),
            secondaryActionLabel: 'Edit message'
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

    const phoneAppSettings = [
        {
            id: 'app-update',
            title: 'Require app update',
            description: appUpdateEnabled ? `Phones older than ${appMinVersion} are stopped.` : 'Old customer and vendor apps keep working until you turn this on.',
            icon: Smartphone,
            hasToggle: true,
            action: () => setIsAppUpdateModalOpen(true),
            toggleDisabled: appUpdateMutation.isPending,
            onToggle: () => {
                if (!appUpdateEnabled && !settingsMap.APP_MIN_VERSION) {
                    setIsAppUpdateModalOpen(true);
                    return;
                }
                appUpdateMutation.mutate({ enabled: !appUpdateEnabled, minVersion: appMinVersion });
            },
            toggleValue: appUpdateEnabled,
            secondaryAction: () => setIsAppUpdateModalOpen(true),
            secondaryActionLabel: 'Edit version'
        },
    ];
    const visibleSettings = activeTab === 'General App Controls'
        ? generalSettings
        : (activeTab === 'User App Settings' || activeTab === 'Vendor App Settings')
            ? phoneAppSettings
            : [];

    return (
        <div className="space-y-6 max-w-[440px] md:max-w-[1600px] mx-auto pb-10">
            {/* Header with Tabs */}
            <div className="bg-white p-4 rounded-[2rem] shadow-sm border border-zinc-100 overflow-hidden">
                <div className="flex items-center gap-2 bg-zinc-50 p-1.5 rounded-3xl w-full overflow-x-auto no-scrollbar whitespace-nowrap">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
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
                    {isLoading ? (
                        <div className="py-20 flex flex-col items-center justify-center">
                            <Loader2 className="animate-spin text-emerald-600 mb-4" size={32} />
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Loading Settings...</p>
                        </div>
                    ) : (
                        visibleSettings.length > 0 && visibleSettings.map((item) => (
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
                                                type="button"
                                                aria-label={item.title}
                                                aria-pressed={Boolean(item.toggleValue)}
                                                disabled={item.toggleDisabled}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    item.onToggle();
                                                }}
                                                className={`relative w-11 h-6 rounded-full transition-colors duration-200 outline-none disabled:opacity-50 ${item.toggleValue ? 'bg-emerald-500' : 'bg-zinc-300'
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
                        ))
                    )}

                    {activeTab === 'Shop Type Management' && (
                        <div className="p-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <VendorManagement />
                        </div>
                    )}

                    {activeTab === 'Referral Program' && <ReferralProgramSettings />}

                    {activeTab === 'Payment Methods' && <PaymentMethodsSettings />}

                    {visibleSettings.length === 0 && activeTab !== 'Shop Type Management' && activeTab !== 'Referral Program' && activeTab !== 'Payment Methods' && (
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
            <AppUpdateModal
                isOpen={isAppUpdateModalOpen}
                version={appMinVersion}
                saving={appUpdateMutation.isPending}
                onClose={() => setIsAppUpdateModalOpen(false)}
                onSave={(minVersion) => appUpdateMutation.mutate({ enabled: appUpdateEnabled, minVersion })}
            />
            <MaintenanceModeModal
                isOpen={isMaintenanceModalOpen}
                message={maintenanceMessage}
                saving={maintenanceMutation.isPending}
                onClose={() => setIsMaintenanceModalOpen(false)}
                onSave={(message) => maintenanceMutation.mutate({ enabled: maintenanceEnabled, message })}
            />
            {isFeeModalOpen && (
                <DeliveryFeeModal
                    isOpen
                    onClose={() => setIsFeeModalOpen(false)}
                    settingsMap={settingsMap}
                />
            )}
            {isTimingModalOpen && (
                <OrderTimingModal
                    isOpen
                    onClose={() => setIsTimingModalOpen(false)}
                    settingsMap={settingsMap}
                />
            )}
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
