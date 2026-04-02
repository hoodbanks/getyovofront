import React, { useState } from 'react';
import {
    Search,
    ChevronDown,
    Eye,
    ShoppingBag,
    Clock,
    Truck,
    CheckCircle2,
    Download,
    Filter
} from 'lucide-react';
import OrderModal from '../../components/admin/OrderModal';

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
                    <p className="text-[10px] font-medium text-zinc-400 mt-2">{subLabel}</p>
                </div>
            </div>
            <div className={`p-2 rounded-xl ${bg} ${color} shadow-sm border border-white/40 group-hover:rotate-6 transition-all duration-300`}>
                <Icon size={18} />
            </div>
        </div>
    </div>
);

const Orders = () => {
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const orders = [
        { id: 'GY-145896', customerName: 'Cameron Williamson', vendor: 'Jacob Jones', rider: 'Leslie Alexander', status: 'Delivered', time: '01:08 pm', eta: '01:28 pm' },
        { id: 'GY-145895', customerName: 'Wade Warren', vendor: 'Bessie Cooper', rider: 'Arlene McCoy', status: 'Canceled', time: '07:59 pm', eta: '-' },
        { id: 'GY-145896', customerName: 'Kathryn Murphy', vendor: 'Jenny Wilson', rider: 'Jane Cooper', status: 'In Transit', time: '07:38 am', eta: '10 minutes' },
        { id: 'GY-145896', customerName: 'Darrell Steward', vendor: 'Ronald Richards', rider: 'Marvin McKinney', status: 'Pending', time: '01:55 pm', eta: '10 minutes' },
        { id: 'GY-145896', customerName: 'Jerome Bell', vendor: 'Dianne Russell', rider: 'Cody Fisher', status: 'Delivered', time: '12:01 pm', eta: '12:31 pm' },
    ];

    const openModal = (order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6 w-full mx-auto">
            <div className='bg-white py-5 rounded-2xl'>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl">
                    <StatCard
                        label="Total Orders"
                        value="1,000,000"
                        subLabel="All-time"
                        icon={ShoppingBag}
                        color="text-white"
                        bg="bg-emerald-900"
                        cardBg="bg-emerald-100/20"
                        borderColor="border-emerald-500"
                        dotColor="#10b981"
                    />
                    <StatCard
                        label="Pending Orders"
                        value="1,000,000"
                        subLabel="Awaiting action"
                        icon={Clock}
                        color="text-white"
                        bg="bg-blue-900"
                        cardBg="bg-blue-100/20"
                        borderColor="border-blue-500"
                        dotColor="#3b82f6"
                    />
                    <StatCard
                        label="In Transit"
                        value="1,000,000"
                        subLabel="On the way"
                        icon={Truck}
                        color="text-white"
                        bg="bg-purple-900"
                        cardBg="bg-purple-100/20"
                        borderColor="border-purple-500"
                        dotColor="#a855f7"
                    />
                    <StatCard
                        label="Delivered Today"
                        value="1,000,000"
                        subLabel="Completed"
                        icon={CheckCircle2}
                        color="text-white"
                        bg="bg-amber-900"
                        cardBg="bg-amber-100/20"
                        borderColor="border-amber-500"
                        dotColor="#f59e0b"
                    />
                </div>

                {/* Search Bar Section */}
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
                        <h3 className="text-base font-medium text-zinc-900">Orders</h3>
                        <p className="text-[10px] text-zinc-500 font-medium">All Order operations in one place.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <select className="appearance-none bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2 pr-10 text-[10px] font-bold text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 cursor-pointer">
                                <option>All</option>
                                <option>Pending</option>
                                <option>Delivered</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                        </div>
                        <div className="relative">
                            <select className="appearance-none bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2 pr-10 text-[10px] font-bold text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 cursor-pointer">
                                <option>Last 7 Days</option>
                                <option>Last 30 Days</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-800 rounded-3xl text-[10px] font-bold text-white hover:bg-emerald-900 transition-all shadow-md shadow-emerald-900/10">
                            <Download size={14} />
                            Export CSV
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-zinc-50/50 border-b border-zinc-100">
                                <th className="px-3 py-3.5 text-left text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Order ID</th>
                                <th className="px-3 py-3.5 text-left text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Customer Name</th>
                                <th className="px-3 py-3.5 text-left text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Vendor</th>
                                <th className="px-3 py-3.5 text-left text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Rider</th>
                                <th className="px-3 py-3.5 text-left text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Status</th>
                                <th className="px-3 py-3.5 text-left text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Order Time</th>
                                <th className="px-3 py-3.5 text-left text-[9px] font-bold text-zinc-400 uppercase tracking-wider">ETA/Delivered</th>
                                <th className="px-3 py-3.5 text-center text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {orders.map((order, idx) => (
                                <tr key={idx} className="hover:bg-zinc-50/50 transition-colors group">
                                    <td className="px-3 py-3.5 text-[9px] font-bold text-zinc-900">{order.id}</td>
                                    <td className="px-3 py-3.5 text-[9px] font-medium text-zinc-500 truncate max-w-[100px]">{order.customerName}</td>
                                    <td className="px-3 py-3.5 text-[9px] font-medium text-zinc-500 truncate max-w-[100px]">{order.vendor}</td>
                                    <td className="px-3 py-3.5 text-[9px] font-medium text-zinc-500 truncate max-w-[100px]">{order.rider}</td>
                                    <td className="px-3 py-3.5">
                                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold border whitespace-nowrap ${order.status === 'Delivered'
                                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                : order.status === 'Canceled'
                                                    ? 'bg-rose-50 text-rose-600 border-rose-100'
                                                    : order.status === 'In Transit'
                                                        ? 'bg-blue-50 text-blue-600 border-blue-100'
                                                        : 'bg-amber-50 text-amber-600 border-amber-100'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-3 py-3.5 text-[9px] font-medium text-zinc-500 whitespace-nowrap">{order.time}</td>
                                    <td className="px-3 py-3.5 text-[9px] font-medium text-zinc-500 whitespace-nowrap">{order.eta}</td>
                                    <td className="px-3 py-3.5">
                                        <div className="flex justify-center">
                                            <button
                                                onClick={() => openModal(order)}
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

            <OrderModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                order={selectedOrder}
            />
        </div>
    );
};

export default Orders;
