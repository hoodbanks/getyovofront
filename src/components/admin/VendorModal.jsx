import React, { useState, useRef, useEffect } from 'react';
import {
    X,
    ChevronDown,
    AlertCircle,
    CheckCircle2,
    AlertTriangle,
    Copy,
    Check
} from 'lucide-react';

const ConfirmationModal = ({ isOpen, onClose, type, vendor, onConfirm }) => {
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

    const isActivate = type === 'activate' || type === 'approve';

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-fade-in" onClick={onClose} />
            <div className="relative bg-white rounded-[2rem] w-full max-w-sm overflow-hidden shadow-2xl animate-fade-in transition-all duration-300">
                <div className="p-6 flex flex-col items-center text-center">
                    <div className="flex justify-between w-full mb-4">
                        <span className="text-sm font-bold text-zinc-900 capitalize">{type} account</span>
                        <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {isActivate ? (
                        <>
                            <div className="w-20 h-20 rounded-full bg-zinc-100 flex items-center justify-center mb-6">
                                <CheckCircle2 size={40} className="text-zinc-900" />
                            </div>
                            <h3 className="text-xl font-bold text-zinc-900 mb-2">Confirm Account {type === 'approve' ? 'Approval' : 'Activation'}</h3>
                            <p className="text-xs text-zinc-400 font-medium leading-relaxed mb-8 px-4">
                                {type === 'approve'
                                    ? 'Approving this vendor will allow them to start receiving orders on the platform.'
                                    : 'Activating this account will allow the vendor to log in and use all available features.'}
                            </p>
                        </>
                    ) : (
                        <>
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
                            <div className="w-full text-left space-y-4 mb-8">
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
                        </>
                    )}

                    <div className="flex w-full gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-4 bg-zinc-50 text-zinc-900 text-sm font-bold rounded-3xl hover:bg-zinc-100 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => { onConfirm({ reason, otherReason }); onClose(); }}
                            className={`flex-1 py-4 text-white text-sm font-bold rounded-3xl transition-all shadow-md ${isActivate
                                    ? 'bg-emerald-800 hover:bg-emerald-900 shadow-emerald-900/10'
                                    : 'bg-rose-600 hover:bg-rose-700 shadow-rose-900/10'
                                }`}
                        >
                            {isActivate ? (type === 'approve' ? 'Approve' : 'Activate') : 'Suspend'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const VendorModal = ({ isOpen, onClose, vendor }) => {
    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmType, setConfirmType] = useState(''); // 'activate', 'suspend', 'approve'
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const handleActionClick = (type) => {
        setConfirmType(type);
        setShowConfirm(true);
    };

    const handleConfirm = (data) => {
        console.log('Vendor action confirmed:', confirmType, data);
        // API call logic here
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <>
            <div className="fixed inset-0 z-50 overflow-hidden">
                <div className={`absolute inset-0 bg-black/50 animate-fade-in`} onClick={onClose} />
                <div className={`absolute inset-y-0 right-0 max-w-lg w-full bg-white shadow-2xl animate-slide-in`}>
                    <div className="h-full flex flex-col">
                        {/* Header */}
                        <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 font-bold text-sm">
                                    {vendor?.initials || 'AJ'}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-zinc-900">{vendor?.storeName || 'Roban Mart'}</h2>
                                    <p className="text-xs text-zinc-400 font-medium tracking-wide uppercase">{vendor?.vendorId || 'v_1005'}</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-400 hover:text-zinc-600">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { label: 'Total Orders (Week)', value: '6' },
                                    { label: 'Delivered', value: '5' },
                                    { label: 'Cancelled', value: '1' },
                                    { label: 'Total Payout', value: '₦72,766' },
                                ].map((stat, i) => (
                                    <div key={i} className="bg-zinc-100 border border-zinc-100 p-5 rounded-2xl hover:bg-white hover:shadow-md transition-all group">
                                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 group-hover:text-zinc-500">{stat.label}</p>
                                        <p className="text-xl font-bold text-zinc-900">{stat.value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Details Section */}
                            <div className="bg-white border border-zinc-100 rounded-2xl p-6 shadow-sm">
                                <h3 className="text-sm font-bold text-zinc-900 mb-4">Details</h3>
                                <div className="mb-6">
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold border capitalize ${vendor?.status === 'Active'
                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                            : vendor?.status === 'Suspended'
                                                ? 'bg-rose-50 text-rose-600 border-rose-100'
                                                : 'bg-amber-50 text-amber-600 border-amber-100'
                                        }`}>
                                        {vendor?.status || 'Active'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-y-6">
                                    <div>
                                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Store owner</label>
                                        <p className="text-sm font-bold text-zinc-800">{vendor?.owner || 'Priscilia Onoh'}</p>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Store Type</label>
                                        <p className="text-sm font-bold text-zinc-800">{vendor?.type || 'Restaurant'}</p>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Phone</label>
                                        <p className="text-sm font-bold text-zinc-800">{vendor?.phone || '+2348067772345'}</p>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Email</label>
                                        <p className="text-sm font-bold text-zinc-800 lowercase break-all pr-2">{vendor?.email || 'storeowner@yahoo.com'}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Address</label>
                                        <p className="text-sm font-bold text-zinc-800">{vendor?.address || '18 Ogui Rd, Enugu'}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Date Joined</label>
                                        <p className="text-sm font-bold text-zinc-800">{vendor?.joined || '20 Jan 2024, 1:00 PM'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Payout Account */}
                            <div className="bg-white border border-zinc-100 rounded-2xl p-6 shadow-sm">
                                <h3 className="text-sm font-bold text-zinc-900 mb-4">Payout Account</h3>
                                <div className="space-y-4">
                                    <div className="bg-zinc-100 rounded-2xl p-4 flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-bold text-zinc-600">Candles Enterprises</p>
                                            <p className="text-xs font-medium text-zinc-400 mt-0.5">GTBank</p>
                                            <div className="flex items-center gap-3 mt-4">
                                                <span className="text-sm font-medium text-zinc-400 tracking-widest">0123456789</span>
                                                <button
                                                    onClick={() => copyToClipboard('0123456789')}
                                                    className="p-1.5 bg-white rounded-lg border border-zinc-200 text-zinc-400 hover:text-zinc-600 transition-colors"
                                                >
                                                    {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Contextual Alerts */}
                            {vendor?.status === 'Suspended' && (
                                <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-5 flex items-start gap-3">
                                    <AlertTriangle className="text-amber-500 shrink-0" size={18} />
                                    <div>
                                        <p className="text-sm font-bold text-amber-900">Vendor Account Suspended</p>
                                        <p className="text-[11px] text-amber-600 font-medium leading-relaxed mt-1">
                                            The store is currently unavailable and cannot accept new orders until reinstated by an administrator.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {vendor?.status === 'Pending' && (
                                <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-5 flex items-start gap-3">
                                    <AlertCircle className="text-amber-500 shrink-0" size={18} />
                                    <div>
                                        <p className="text-sm font-bold text-amber-900">Vendor account pending approval.</p>
                                        <p className="text-[11px] text-amber-600 font-medium leading-relaxed mt-1">
                                            Vendor account pending approval. Store access is restricted until approved by administrator.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 border-t border-zinc-100 flex items-center gap-3">
                            <button className="flex-1 py-3 text-xs font-bold text-emerald-800 border-2 border-emerald-800/20 rounded-3xl hover:bg-emerald-50 transition-all">
                                Delete account
                            </button>
                            {vendor?.status === 'Pending' ? (
                                <button
                                    onClick={() => handleActionClick('approve')}
                                    className="flex-1 py-3 text-xs font-bold text-white rounded-3xl bg-emerald-800 hover:bg-emerald-900 transition-all shadow-md shadow-emerald-900/10"
                                >
                                    Approve account
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleActionClick(vendor?.status === 'Suspended' ? 'activate' : 'suspend')}
                                    className={`flex-1 py-3 text-xs font-bold text-white rounded-3xl transition-all shadow-md shadow-emerald-900/10 ${vendor?.status === 'Suspended' ? 'bg-emerald-800 hover:bg-emerald-900' : 'bg-emerald-900 hover:bg-black'
                                        }`}>
                                    {vendor?.status === 'Suspended' ? 'Activate account' : 'Suspend account'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmationModal
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                type={confirmType}
                vendor={vendor}
                onConfirm={handleConfirm}
            />
        </>
    );
};

export default VendorModal;
