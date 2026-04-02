import React, { useState, useRef, useEffect } from 'react';
import {
    X,
    ChevronDown,
    AlertCircle,
    CheckCircle2,
    AlertTriangle
} from 'lucide-react';

const ConfirmationModal = ({ isOpen, onClose, type, customer, onConfirm }) => {
    const [reason, setReason] = useState('');
    const [otherReason, setOtherReason] = useState('');
    const [showReasons, setShowReasons] = useState(false);
    const dropdownRef = useRef(null);

    const reasons = [
        'Policy violation',
        'Fraudulent activity',
        'Repeated cancellations',
        'Abuse or misconduct',
        'Suspicious behavior',
        'Other'
    ];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowReasons(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!isOpen) return null;

    if (type === 'activate') {
        return (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-fade-in" onClick={onClose} />
                <div className="relative bg-white rounded-[2rem] w-full max-w-sm overflow-hidden shadow-2xl animate-fade-in scale-100 transition-all duration-300">
                    <div className="p-6 flex flex-col items-center text-center">
                        <div className="flex justify-between w-full mb-4">
                            <span className="text-sm font-bold text-zinc-900">Activate account</span>
                            <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="w-20 h-20 rounded-full bg-zinc-100 flex items-center justify-center mb-6">
                            <CheckCircle2 size={40} className="text-zinc-900" />
                        </div>

                        <h3 className="text-xl font-bold text-zinc-900 mb-2">Confirm Account Activation</h3>
                        <p className="text-xs text-zinc-400 font-medium leading-relaxed mb-8 px-4">
                            Activating this account will allow the customer to log in and use all available features.
                        </p>

                        <div className="flex w-full gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 py-4 bg-zinc-50 text-zinc-900 text-sm font-bold rounded-3xl hover:bg-zinc-100 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => { onConfirm(); onClose(); }}
                                className="flex-1 py-4 bg-emerald-800 text-white text-sm font-bold rounded-3xl hover:bg-emerald-900 transition-all shadow-md shadow-emerald-900/10"
                            >
                                Activate
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-fade-in" onClick={onClose} />
            <div className="relative bg-white rounded-[2rem] w-full max-w-sm overflow-hidden shadow-2xl animate-fade-in transition-all duration-300">
                <div className="p-6 flex flex-col items-center">
                    <div className="flex justify-between w-full mb-4">
                        <span className="text-sm font-bold text-zinc-900">Suspend account</span>
                        <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="w-24 h-24 flex items-center justify-center mb-4">
                        <div className="relative">
                            <div className="absolute inset-0 bg-amber-400 opacity-20 blur-xl rounded-full"></div>
                            <AlertTriangle size={60} className="text-amber-400 relative z-10" fill="currentColor" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-1">
                                <span className="text-white font-bold text-xl">!</span>
                            </div>
                        </div>
                    </div>

                    <p className="text-xs text-zinc-500 font-bold text-center mb-6 max-w-[200px]">
                        This will temporarily restrict this account from accessing the platform.
                    </p>

                    <div className="w-full space-y-4 mb-8">
                        <div>
                            <label className="text-xs font-bold text-zinc-900 mb-2 block tracking-tight">Suspension Reason *</label>
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setShowReasons(!showReasons)}
                                    className="w-full flex items-center justify-between px-4 py-4 bg-white border border-zinc-100 rounded-2xl text-xs font-medium text-zinc-400 hover:bg-zinc-50 transition-all"
                                >
                                    <span>{reason || 'Reasons'}</span>
                                    <ChevronDown size={18} className={`transition-transform duration-300 ${showReasons ? 'rotate-180' : ''}`} />
                                </button>

                                {showReasons && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-zinc-100 rounded-2xl shadow-xl z-10 overflow-hidden py-1">
                                        {reasons.map((r) => (
                                            <button
                                                key={r}
                                                onClick={() => { setReason(r); setShowReasons(false); }}
                                                className="w-full text-left px-4 py-3 text-xs font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
                                            >
                                                {r}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {reason === 'Other' && (
                            <textarea
                                placeholder="Give reasons if you select others..."
                                className="w-full px-4 py-4 bg-white border border-zinc-100 rounded-2xl text-xs font-medium text-zinc-700 focus:ring-1 focus:ring-rose-500/20 outline-none h-24 resize-none transition-all"
                                value={otherReason}
                                onChange={(e) => setOtherReason(e.target.value)}
                            />
                        )}
                    </div>

                    <div className="flex w-full gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-4 bg-zinc-50 text-zinc-900 text-sm font-bold rounded-3xl hover:bg-zinc-100 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => { onConfirm({ reason, otherReason }); onClose(); }}
                            className="flex-1 py-4 bg-rose-600 text-white text-sm font-bold rounded-3xl hover:bg-rose-700 transition-all shadow-md shadow-rose-900/10"
                        >
                            Suspend
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CustomerModal = ({ isOpen, onClose, customer }) => {
    const [activeTab, setActiveTab] = useState('Overview');
    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmType, setConfirmType] = useState(''); // 'activate' or 'suspend'

    if (!isOpen) return null;

    const mockOrders = [
        { id: 'GY-276025', date: '21 Jan, 2026 1:45 PM', store: 'Candles', status: 'Cancelled', amount: '₦15,404' },
        { id: 'GY-276025', date: '21 Jan, 2026 1:45 PM', store: 'Raban Mart', status: 'Delivered', amount: '₦15,404' },
        { id: 'GY-276025', date: '21 Jan, 2026 1:45 PM', store: 'Candles', status: 'Delivered', amount: '₦15,404' },
        { id: 'GY-276025', date: '21 Jan, 2026 1:45 PM', store: 'Candles', status: 'Cancelled', amount: '₦15,404' },
    ];

    const handleActionClick = () => {
        setConfirmType(customer?.status === 'Suspended' ? 'activate' : 'suspend');
        setShowConfirm(true);
    };

    const handleConfirm = (data) => {
        console.log('Action confirmed:', confirmType, data);
        // Here you would typically call an API
    };

    return (
        <>
            <div className="fixed inset-0 z-50 overflow-hidden">
                {/* Backdrop */}
                <div
                    className={`absolute inset-0 bg-black/50 animate-fade-in`}
                    onClick={onClose}
                />

                {/* Drawer */}
                <div className={`absolute inset-y-0 right-0 max-w-lg w-full bg-white shadow-2xl animate-slide-in`}>
                    <div className="h-full flex flex-col">
                        {/* Header */}
                        <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 font-bold text-sm">
                                    {customer?.initials || 'AJ'}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-zinc-900">{customer?.name || 'Adaeze James'}</h2>
                                    <p className="text-xs text-zinc-400 font-medium tracking-wide uppercase">CUS-mli5fxnu_615hfs</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-400 hover:text-zinc-600"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {/* Contact Info */}
                            <div className="p-6 space-y-4">
                                <div className="bg-zinc-100 rounded-2xl p-5 border border-zinc-100 space-y-4">
                                    <div>
                                        <label className="text-sm font-bold text-zinc-900 tracking-wider block mb-1">Phone</label>
                                        <p className="text-xs font-medium text-zinc-400">+2348088888888</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-zinc-900 tracking-wider block mb-1">Email</label>
                                        <p className="text-xs font-medium text-zinc-400">adaezegetyovo@email.com</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-zinc-900 tracking-wider block mb-1">Address</label>
                                        <p className="text-xs font-medium text-zinc-400">No 1 Nzekwe street, Awka, Anambra state</p>
                                    </div>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="px-4 flex items-center justify-between gap-4 mb-6">
                                <div className="flex p-1.5 flex-1">
                                    {['Overview', 'Orders'].map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`flex-1 py-2.5 text-xs font-medium rounded-3xl transition-all ${activeTab === tab
                                                ? 'bg-emerald-800 text-white shadow-sm'
                                                : 'text-zinc-500 rounded-3xl bg-zinc-100 mx-2 hover:text-zinc-700'
                                                }`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>
                                <div className="relative">
                                    <button className="flex items-center gap-2 px-4 py-2.5 bg-zinc-100 rounded-2xl text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                                        All Time <ChevronDown size={14} />
                                    </button>
                                </div>
                            </div>

                            {activeTab === 'Overview' ? (
                                <div className="px-6 space-y-6">
                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { label: 'Total Orders (Week)', value: '6' },
                                            { label: 'Delivered', value: '5' },
                                            { label: 'Cancelled', value: '1' },
                                            { label: 'Total Spent', value: '₦72,766' },
                                        ].map((stat, i) => (
                                            <div key={i} className="bg-zinc-100 border border-zinc-100 p-5 rounded-2xl hover:bg-white hover:shadow-md transition-all group">
                                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 group-hover:text-zinc-500">{stat.label}</p>
                                                <p className="text-xl font-bold text-zinc-900">{stat.value}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* DetailsSection */}
                                    <div className="bg-white border border-zinc-100 rounded-2xl p-6 shadow-sm">
                                        <h3 className="text-sm font-bold text-zinc-900 mb-4">Details</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Joined</label>
                                                <p className="text-sm font-bold text-zinc-800">31 Dec 2025</p>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Last Seen</label>
                                                <p className="text-sm font-bold text-zinc-800">20 Jan, 1:00 PM</p>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Last Order</label>
                                                <p className="text-sm font-bold text-zinc-800">20 Jan, 1:00 PM</p>
                                            </div>
                                        </div>
                                    </div>

                                    {customer?.status === 'Suspended' && (
                                        <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-5 flex items-start gap-3">
                                            <AlertCircle className="text-amber-500 shrink-0" size={18} />
                                            <div>
                                                <p className="text-sm font-bold text-amber-900">Account Suspended</p>
                                                <p className="text-xs text-amber-600 font-medium">This user's access to the platform has been restricted.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="px-6 space-y-6">
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Today</p>
                                        {mockOrders.map((order, i) => (
                                            <div key={i} className="group relative flex items-center justify-between p-4 bg-zinc-100 border border-zinc-100 rounded-2xl hover:bg-white hover:shadow-md transition-all">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className="text-sm font-bold text-zinc-900">{order.id}</span>
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${order.status === 'Cancelled' ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'
                                                            }`}>
                                                            {order.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-[10px] font-medium text-zinc-400">{order.date} • {order.store}</p>
                                                    <div className="mt-2 text-[10px] font-bold text-zinc-400 flex justify-between items-center gap-1.5 uppercase tracking-wider">
                                                        Amount <span className="text-zinc-900">{order.amount}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 border-t border-zinc-100 flex items-center gap-3">
                            <button className="flex-1 py-3 text-xs font-bold text-emerald-800 border-2 border-emerald-800/20 rounded-3xl hover:bg-emerald-50 transition-all flex items-center justify-center gap-2">
                                Delete account
                            </button>
                            <button
                                onClick={handleActionClick}
                                className={`flex-1 py-3 text-xs font-bold text-white rounded-3xl transition-all shadow-md shadow-emerald-900/10 ${customer?.status === 'Suspended' ? 'bg-emerald-800' : 'bg-emerald-900 hover:bg-emerald-950'
                                    }`}>
                                {customer?.status === 'Suspended' ? 'Activate account' : 'Suspend account'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation Modals */}
            <ConfirmationModal
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                type={confirmType}
                customer={customer}
                onConfirm={handleConfirm}
            />
        </>
    );
};

export default CustomerModal;
