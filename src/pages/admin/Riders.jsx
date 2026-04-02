import React, { useState } from 'react';
import {
    Search,
    ChevronDown,
    Eye,
    Bike,
    Activity,
    UserX,
    Navigation,
    Plus
} from 'lucide-react';
import RiderModal from '../../components/admin/RiderModal';
import CreateRiderModal from '../../components/admin/CreateRiderModal';

const StatCard = ({ label, value, subLabel, icon: Icon, color, bg, borderColor, cardBg, dotColor }) => (
    <div className={`relative overflow-hidden p-4 pb-6 rounded-xl ${cardBg} border ${borderColor} shadow-sm transition-all hover:shadow-md group flex-1 min-w-[200px]`}>
        {/* Grain/Texture Effect using Radial Gradients */}
        <div className={`absolute inset-0 opacity-[0.03] pointer-events-none`}
            style={{ backgroundImage: `radial-gradient(${dotColor} 1px, transparent 1px)`, backgroundSize: '4px 4px' }}></div>

        {/* Glow Effect Background */}
        <div className={`absolute -top-10 -right-10 w-40 h-40 ${bg} opacity-10 blur-[30px] rounded-full transition-all duration-500 group-hover:scale-125 group-hover:opacity-20`} />

        <div className="relative z-10 flex justify-between items-start">
            <div>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">{label}</p>
                <div className="flex flex-col">
                    <h3 className="text-sm font-bold text-zinc-900 leading-tight">{value}</h3>
                    <p className="text-[9px] font-medium text-zinc-400 mt-2">{subLabel}</p>
                </div>
            </div>
            <div className={`p-2 rounded-xl ${bg} ${color} shadow-sm border border-white/40 group-hover:rotate-6 transition-all duration-300`}>
                <Icon size={18} />
            </div>
        </div>
    </div>
);

const Riders = () => {
    const [selectedRider, setSelectedRider] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const riders = [
        { id: 1, name: 'Courtney Henry', vehicle: 'Bajaj Pulsar', plate: 'ENU-345AA', phone: '(235) 555-0118', deliveries: 360, email: 'nathan.roberts@example.com', address: '2715 Ash Dr. San Jose, South Dakota 83475', joined: 'May 6, 2012', status: 'Active', initials: 'CH' },
        { id: 2, name: 'Annette Black', vehicle: 'Kymco 125cc', plate: 'ENU-345AA', phone: '(252) 555-0126', deliveries: 520, email: 'deanna.curtis@example.com', address: '2715 Ash Dr. San Jose, South Dakota 83475', joined: 'December 2, 2013', status: 'Suspended', initials: 'AB' },
        { id: 3, name: 'Brooklyn Simmons', vehicle: 'Honda Ace', plate: 'ENU-345AA', phone: '(270) 555-0117', deliveries: 64, email: 'tanya.hill@example.com', address: '2715 Ash Dr. San Jose, South Dakota 83475', joined: 'May 31, 2015', status: 'Inactive', initials: 'BS' },
        { id: 4, name: 'Dianne Russell', vehicle: 'Honda Ace 110', plate: 'ENU-345AA', phone: '(307) 555-0101', deliveries: 100, email: 'tanya.hill@example.com', address: '2715 Ash Dr. San Jose, South Dakota 83475', joined: 'October 24, 2018', status: 'On Delivery', initials: 'DR' },
        { id: 5, name: 'Floyd Miles', vehicle: 'Boxer 150cc', plate: 'ENU-345AA', phone: '(201) 555-0124', deliveries: 226, email: 'tanya.hill@example.com', address: '2715 Ash Dr. San Jose, South Dakota 83475', joined: 'September 9, 2013', status: 'Active', initials: 'FM' },
    ];

    const openDetailModal = (rider) => {
        setSelectedRider(rider);
        setIsDetailModalOpen(true);
    };

    return (
        <div className="space-y-6 w-full mx-auto">
            <div className='bg-white py-5 rounded-2xl'>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl">
                    <StatCard
                        label="Total Riders"
                        value="1,000,000"
                        subLabel="Excludes Pending"
                        icon={Bike}
                        color="text-white"
                        bg="bg-emerald-900"
                        cardBg="bg-emerald-100/20"
                        borderColor="border-emerald-500"
                        dotColor="#10b981"
                    />
                    <StatCard
                        label="Active Riders"
                        value="1,000,000"
                        subLabel="On-duty"
                        icon={Activity}
                        color="text-white"
                        bg="bg-blue-900"
                        cardBg="bg-blue-100/20"
                        borderColor="border-blue-500"
                        dotColor="#3b82f6"
                    />
                    <StatCard
                        label="Inactive Riders"
                        value="1,000,000"
                        subLabel="Unavailable/offline"
                        icon={UserX}
                        color="text-white"
                        bg="bg-purple-900"
                        cardBg="bg-purple-100/20"
                        borderColor="border-purple-500"
                        dotColor="#a855f7"
                    />
                    <StatCard
                        label="On Delivery"
                        value="1,000,000"
                        subLabel="In progress"
                        icon={Navigation}
                        color="text-white"
                        bg="bg-amber-900"
                        cardBg="bg-amber-100/20"
                        borderColor="border-amber-500"
                        dotColor="#f59e0b"
                    />
                </div>

                {/* Search & Filter Section */}
                <div className="px-4">
                    <div className="relative max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                        <input
                            type="text"
                            placeholder="Search name, phone, email"
                            className="w-full pl-12 pr-6 py-4 bg-zinc-100 border-none rounded-3xl text-sm focus:ring-2 focus:ring-emerald-500/10 placeholder:text-zinc-500 outline-none transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-[1.5rem] border border-zinc-200 overflow-hidden shadow-sm">
                <div className="p-4 flex items-center justify-between border-b border-zinc-100">
                    <div>
                        <h3 className="text-base font-medium text-zinc-900">Riders</h3>
                        <p className="text-[10px] text-zinc-500 font-medium">All rider operations in one place.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="flex items-center gap-1.5 px-3 py-2 bg-zinc-50 rounded-xl text-[9px] font-bold text-zinc-500 hover:bg-zinc-100 transition-colors uppercase tracking-tight">
                            Sort by <ChevronDown size={14} />
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-2 bg-zinc-50 rounded-xl text-[9px] font-bold text-zinc-500 hover:bg-zinc-100 transition-colors uppercase tracking-tight">
                            Filters <ChevronDown size={14} />
                        </button>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-800 rounded-3xl text-[10px] font-bold text-white hover:bg-emerald-900 transition-all shadow-md shadow-emerald-900/10"
                        >
                            Create Rider
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-zinc-50/50 border-b border-zinc-100">
                                <th className="px-3 py-3.5 text-left text-[12px] font-bold text-zinc-400 uppercase tracking-wider">Rider Name</th>
                                <th className="px-3 py-3.5 text-left text-[12px] font-bold text-zinc-400 uppercase tracking-wider">Vehicle Name</th>
                                <th className="px-3 py-3.5 text-left text-[12px] font-bold text-zinc-400 uppercase tracking-wider">Plate Number</th>
                                <th className="px-3 py-3.5 text-left text-[12px] font-bold text-zinc-400 uppercase tracking-wider">Phone</th>
                                <th className="px-3 py-3.5 text-left text-[12px] font-bold text-zinc-400 uppercase tracking-wider">Deliveries</th>
                                <th className="px-3 py-3.5 text-left text-[12px] font-bold text-zinc-400 uppercase tracking-wider">Email</th>
                                <th className="px-3 py-3.5 text-left text-[12px] font-bold text-zinc-400 uppercase tracking-wider">Address</th>
                                <th className="px-3 py-3.5 text-left text-[12px] font-bold text-zinc-400 uppercase tracking-wider">Date Joined</th>
                                <th className="px-3 py-3.5 text-left text-[12px] font-bold text-zinc-400 uppercase tracking-wider">Status</th>
                                <th className="px-3 py-3.5 text-center text-[12px] font-bold text-zinc-400 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {riders.map((rider) => (
                                <tr key={rider.id} className="hover:bg-zinc-50/50 transition-colors group">
                                    <td className="px-3 py-3.5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center text-[8px] font-bold text-zinc-500 overflow-hidden shrink-0">
                                                {rider.initials}
                                            </div>
                                            <span className="text-[12px] font-bold text-zinc-900 max-w-[80px]">{rider.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-3 py-3.5 text-[12px] font-medium text-zinc-500 truncate max-w-[80px]">{rider.vehicle}</td>
                                    <td className="px-3 py-3.5 text-[12px] font-medium text-zinc-500 whitespace-nowrap">{rider.plate}</td>
                                    <td className="px-3 py-3.5 text-[12px] font-medium text-zinc-500 whitespace-nowrap">{rider.phone}</td>
                                    <td className="px-3 py-3.5 text-[12px] font-bold text-zinc-900 text-center">{rider.deliveries}</td>
                                    <td className="px-3 py-3.5 text-[12px] font-medium text-zinc-500 truncate max-w-[100px] lowercase">{rider.email}</td>
                                    <td className="px-3 py-3.5 text-[12px] font-medium text-zinc-500 max-w-[120px] truncate">{rider.address}</td>
                                    <td className="px-3 py-3.5 text-[12px] font-medium text-zinc-500 whitespace-nowrap">{rider.joined}</td>
                                    <td className="px-3 py-3.5">
                                        <span className={`px-2 py-0.5 rounded-full text-[12px] font-bold border whitespace-nowrap ${rider.status === 'Active'
                                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                : rider.status === 'Suspended'
                                                    ? 'bg-rose-50 text-rose-600 border-rose-100'
                                                    : rider.status === 'On Delivery'
                                                        ? 'bg-blue-50 text-blue-600 border-blue-100'
                                                        : 'bg-amber-50 text-amber-600 border-amber-100'
                                            }`}>
                                            {rider.status}
                                        </span>
                                    </td>
                                    <td className="px-3 py-3.5">
                                        <div className="flex justify-center">
                                            <button
                                                onClick={() => openDetailModal(rider)}
                                                className="p-1.5 bg-indigo-50 text-indigo-500 rounded-lg hover:bg-indigo-500 hover:text-white transition-all shadow-sm"
                                            >
                                                <Eye size={12} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <RiderModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                rider={selectedRider}
            />

            <CreateRiderModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
        </div>
    );
};

export default Riders;
