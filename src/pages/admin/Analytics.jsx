import React, { useState, useRef, useEffect } from 'react';
import {
    Search,
    ChevronDown,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Search as SearchIcon,
    Wallet,
    ShoppingBag,
    Percent,
    Banknote
} from 'lucide-react';
import {
    AreaChart, Area,
    BarChart, Bar,
    LineChart, Line,
    PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const data = [
    { name: 'Sun', orders: 400, payout: 350, revenue: 300 },
    { name: 'Mon', orders: 300, payout: 600, revenue: 550 },
    { name: 'Tue', orders: 500, payout: 180, revenue: 150 },
    { name: 'Wed', orders: 280, payout: 210, revenue: 300 },
    { name: 'Thu', orders: 450, payout: 350, revenue: 750 },
    { name: 'Fri', orders: 300, payout: 580, revenue: 600 },
    { name: 'Sat', orders: 550, payout: 800, revenue: 900 },
];

const pieData = [
    { name: 'Vendor Payout', value: 80, amount: '13,280,000', color: '#00B074' },
    { name: 'Platform Commission', value: 20, amount: '3,250,000', color: '#880055' },
];

const StatCard = ({ label, value, icon: Icon, color, dotColor }) => (
    <div className="relative overflow-hidden p-6 rounded-2xl bg-white border border-zinc-100 shadow-sm transition-all hover:shadow-md group flex-1 min-w-[240px]">
        {/* Grain effect */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{ backgroundImage: `radial-gradient(${dotColor} 1px, transparent 1px)`, backgroundSize: '4px 4px' }}></div>

        <div className="relative z-10 flex justify-between items-start">
            <div className="space-y-4">
                <p className="text-[11px] font-medium text-zinc-500">{label}</p>
                <h3 className="text-xl font-bold text-zinc-900 leading-tight">{value}</h3>
            </div>
            <div className={`p-1 rounded-xl ${color} bg-opacity-10 text-white shadow-sm transition-all duration-300 group-hover:scale-110`}>
                <div className={`p-1 rounded-lg ${color}`}>
                    <Icon size={18} />
                </div>
            </div>
        </div>
    </div>
);

const FilterDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState('Last 7 Days');
    const dropdownRef = useRef(null);

    const options = [
        'All time', 'Today', 'Yesterday', 'Last 7 days', 'Last 30 days', 'This month', 'Last month', 'Custom'
    ];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-zinc-200 rounded-xl text-[10px] font-bold text-zinc-900 group hover:border-zinc-300 transition-all shadow-sm"
            >
                {selected}
                <ChevronDown size={14} className={`text-zinc-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-zinc-100 rounded-2xl shadow-xl z-50 py-2 animate-in fade-in zoom-in-95 duration-200">
                    {options.map((opt) => (
                        <button
                            key={opt}
                            onClick={() => {
                                setSelected(opt);
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-[10px] font-medium transition-colors ${selected === opt ? 'bg-zinc-50 text-emerald-600 font-bold' : 'text-zinc-600 hover:bg-zinc-50'
                                }`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const Analytics = () => {
    return (
        <div className="space-y-6 w-full mx-auto">
            {/* Stats Grid */}
            <div className="flex flex-wrap gap-4">
                <StatCard label="Orders Today" value="1,000,000" icon={ShoppingBag} color="bg-[#880055]" dotColor="#880055" />
                <StatCard label="Revenue Generated" value="₦1,000,000" icon={Banknote} color="bg-[#00B074]" dotColor="#00B074" />
                <StatCard label="Platform Commission" value="₦1,000,000" icon={Percent} color="bg-[#880055]" dotColor="#880055" />
                <StatCard label="Vendor Payout" value="₦1,000,000" icon={Wallet} color="bg-[#FF4D00]" dotColor="#FF4D00" />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Orders over time */}
                <div className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-zinc-900">Orders over time</h3>
                        <FilterDropdown />
                    </div>
                    <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#880055" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#880055" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F4F4F5" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#A1A1AA' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#A1A1AA' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ stroke: '#880055', strokeWidth: 1, strokeDasharray: '4 4' }}
                                />
                                <Area type="monotone" dataKey="orders" stroke="#880055" strokeWidth={2} fillOpacity={1} fill="url(#colorOrders)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Vendor Payout */}
                <div className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-zinc-900">Vendor Payout</h3>
                        <FilterDropdown />
                    </div>
                    <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F4F4F5" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#A1A1AA' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#A1A1AA' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="payout" fill="#FF4D00" radius={[4, 4, 0, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue over time */}
                <div className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-zinc-900">Revenue over time</h3>
                        <FilterDropdown />
                    </div>
                    <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F4F4F5" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#A1A1AA' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#A1A1AA' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#00B074"
                                    strokeWidth={1.5}
                                    dot={{ fill: '#00B074', r: 4, strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Revenue split */}
                <div className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-zinc-900">Revenue split</h3>
                        <FilterDropdown />
                    </div>
                    <div className="h-[280px] w-full flex items-center gap-8">
                        <div className="flex-1 h-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={0}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none w-full">
                                <p className="text-[9px] font-bold text-zinc-400 uppercase leading-none tracking-tight">Revenue Generated</p>
                                <p className="text-sm font-bold text-zinc-900 mt-2">₦16,540,000</p>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="w-1/2 space-y-4">
                            {pieData.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                                    <div className="flex-1 flex items-center justify-between gap-4">
                                        <div>
                                            <p className="text-[10px] font-bold text-zinc-600 leading-tight">{item.name}</p>
                                            <p className="text-[10px] font-medium text-zinc-400">{item.amount} / {item.value}%</p>
                                        </div>
                                        <span className="text-[11px] font-bold text-zinc-900">{item.value}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
