import React, { useState } from 'react';
import {
    Search,
    ChevronDown,
    Wallet,
    ShoppingBag,
    CheckCircle2,
    Building2,
    Calendar,
    ChevronRight,
    Search as SearchIcon
} from 'lucide-react';
import PaymentModal from '../../components/admin/PaymentModal';

const StatCard = ({ label, value, subLabel, icon: Icon, color, bg, borderColor, cardBg, dotColor }) => (
    <div className={`relative overflow-hidden p-6 rounded-2xl ${cardBg} border ${borderColor} shadow-sm transition-all hover:shadow-md group flex-1 min-w-[280px]`}>
        {/* Grain/Texture Effect */}
        <div className={`absolute inset-0 opacity-[0.03] pointer-events-none`}
            style={{ backgroundImage: `radial-gradient(${dotColor} 1px, transparent 1px)`, backgroundSize: '4px 4px' }}></div>

        {/* Glow Effect */}
        <div className={`absolute -top-10 -right-10 w-48 h-48 ${bg} opacity-10 blur-[40px] rounded-full transition-all duration-500 group-hover:scale-125 group-hover:opacity-20`} />

        <div className="relative z-10 flex justify-between items-start">
            <div>
                <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-3">{label}</p>
                <div className="space-y-1">
                    <h3 className="text-lg font-bold text-zinc-900 leading-tight">{value}</h3>
                    <p className="text-[11px] font-medium text-zinc-400 mt-3">{subLabel}</p>
                </div>
            </div>
            <div className={`p-3 rounded-2xl ${bg} ${color} shadow-sm border border-white/40 group-hover:rotate-6 transition-all duration-300`}>
                <Icon size={20} />
            </div>
        </div>
    </div>
);

const Payments = () => {
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const vendors = [
        { name: 'Candles', unpaidCount: 12, paidCount: 2, lastPaid: '20 Jan, 2026 • 1:45 PM', amount: 146375, initials: 'C' },
        { name: 'ChopLife', unpaidCount: 12, paidCount: 2, lastPaid: '20 Jan, 2026 • 1:45 PM', amount: 146375, initials: 'CL' },
        { name: 'PharmaPlus', unpaidCount: 16, paidCount: 2, lastPaid: '20 Jan, 2026 • 1:45 PM', amount: 146375, initials: 'PP' },
        { name: 'Roban Mart', unpaidCount: 11, paidCount: 2, lastPaid: '20 Jan, 2026 • 1:45 PM', amount: 146375, initials: 'RM' },
        { name: 'FreshMart', unpaidCount: 9, paidCount: 2, lastPaid: '20 Jan, 2026 • 1:45 PM', amount: 146375, initials: 'F' },
    ];

    const handleVendorClick = (vendor) => {
        setSelectedVendor(vendor);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6 w-full mx-auto">
            <div className='bg-white py-6 rounded-2xl'>
                {/* Stats Grid */}
                <div className="flex flex-wrap gap-4 p-4">
                    <StatCard
                        label="Pending to Pay Vendors"
                        value="1,000,000 NGN"
                        subLabel="Delivered orders only"
                        icon={Wallet}
                        color="text-white"
                        bg="bg-amber-900"
                        cardBg="bg-amber-100/20"
                        borderColor="border-amber-500"
                        dotColor="#f59e0b"
                    />
                    <StatCard
                        label="Total Orders"
                        value="1,000,000 NGN"
                        subLabel="Paid within selected range"
                        icon={ShoppingBag}
                        color="text-white"
                        bg="bg-emerald-900"
                        cardBg="bg-emerald-100/20"
                        borderColor="border-emerald-500"
                        dotColor="#10b981"
                    />
                </div>

                {/* Search Bar Section */}
                <div className="px-4">
                    <div className="relative max-w-md">
                        <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                        <input
                            type="text"
                            placeholder="Search vendors"
                            className="w-full pl-14 pr-6 py-4 bg-zinc-100 border-none rounded-3xl text-sm focus:ring-2 focus:ring-emerald-500/10 placeholder:text-zinc-500 outline-none transition-all font-medium"
                        />
                    </div>
                </div>
            </div>

            {/* Vendor List Section */}
            <div className="bg-white rounded-[2rem] border border-zinc-200 overflow-hidden shadow-sm">
                <div className="p-6 flex items-center justify-between border-b border-zinc-100">
                    <div>
                        <h3 className="text-base font-bold text-zinc-900">Payments</h3>
                        <p className="text-[11px] text-zinc-500 font-medium tracking-tight">Click a vendor row to see all orders + amount to pay</p>
                    </div>
                    <div className="relative">
                        <select className="appearance-none bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2 pr-10 text-[11px] font-bold text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 cursor-pointer">
                            <option>Last 7 Days</option>
                            <option>Last 30 Days</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                    </div>
                </div>

                <div className="divide-y divide-zinc-100">
                    {vendors.map((vendor, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleVendorClick(vendor)}
                            className="w-full p-5 flex items-center justify-between hover:bg-zinc-50 transition-all text-left group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 font-bold text-sm uppercase group-hover:scale-105 transition-transform">
                                    {vendor.initials}
                                </div>
                                <div className="space-y-1.5">
                                    <h4 className="text-[13px] font-bold text-zinc-900">{vendor.name}</h4>
                                    <div className="flex items-center gap-2">
                                        <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-300 rounded-full text-[9px] font-bold">
                                            Unpaid Deliveries: {vendor.unpaidCount}
                                        </span>
                                        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-full text-[9px] font-bold">
                                            Paid orders: {vendor.paidCount}
                                        </span>
                                        <span className="text-[10px] text-zinc-400 font-medium ml-2">
                                            Last paid: {vendor.lastPaid}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-right flex items-center gap-4">
                                <div>
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">Amount to pay</p>
                                    <h3 className="text-base font-bold text-zinc-900 leading-tight">₦{vendor.amount.toLocaleString()}</h3>
                                </div>
                                <ChevronRight size={18} className="text-zinc-300 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <PaymentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                vendor={selectedVendor}
            />
        </div>
    );
};

export default Payments;
