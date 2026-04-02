import React, { useState } from 'react';
import {
    X,
    Bike,
    Calendar,
    Phone,
    Mail,
    MapPin,
    Clock,
    CheckCircle2,
    AlertTriangle,
    Navigation,
    ShoppingBag,
    History,
    ChevronRight,
    Search
} from 'lucide-react';

const RiderModal = ({ isOpen, onClose, rider }) => {
    const [activeTab, setActiveTab] = useState('overview');

    if (!isOpen || !rider) return null;

    const deliveries = [
        { id: 'GY-276025', date: '21 Jan, 2026 1:45 PM', items: 'Candles', pickup: 'Nibo', dropoff: 'Aroma Junction', distance: '9.3 km', status: 'Delivered', day: 'Today' },
        { id: 'GY-276026', date: '21 Jan, 2026 1:45 PM', items: 'Candles', pickup: 'Nibo', dropoff: 'Aroma Junction', distance: '-', status: 'Cancelled', day: 'Today' },
        { id: 'GY-276027', date: '20 Jan, 2026 3:20 PM', items: 'Groceries', pickup: 'Market Square', dropoff: 'GRA Phase 2', distance: '5.2 km', status: 'Delivered', day: 'Yesterday' },
        { id: 'GY-276028', date: '19 Jan, 2026 11:10 AM', items: 'Pizza', pickup: 'Dominoes', dropoff: 'UniZik Sub', distance: '3.1 km', status: 'Delivered', day: '2 days ago' },
    ];

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            <div
                className={`absolute inset-0 bg-black/50 transition-opacity duration-300 animate-fade-in`}
                onClick={onClose}
            />

            <div className={`relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-slide-in overflow-hidden`}>
                {/* Header */}
                <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-white shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">
                            {rider.initials}
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-zinc-900">{rider.name}</h2>
                            <p className="text-[10px] text-zinc-500 font-medium tracking-tight uppercase">RID-1005</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-zinc-100 rounded-lg transition-colors text-zinc-400"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="px-4 py-2 border-b border-zinc-100 flex items-center justify-between shrink-0">
                    <div className="flex gap-1 bg-zinc-100 p-0.5 rounded-3xl">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`px-6 py-2 rounded-3xl text-[11px] font-bold transition-all ${activeTab === 'overview'
                                    ? 'bg-emerald-800 text-white shadow-md'
                                    : 'text-zinc-500 hover:text-zinc-700'
                                }`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('deliveries')}
                            className={`px-6 py-2 rounded-3xl text-[11px] font-bold transition-all ${activeTab === 'deliveries'
                                    ? 'bg-emerald-800 text-white shadow-md'
                                    : 'text-zinc-500 hover:text-zinc-700'
                                }`}
                        >
                            Deliveries
                        </button>
                    </div>
                    <div className="relative">
                        <select className="appearance-none bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-1.5 pr-8 text-[10px] font-bold text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/10">
                            <option>Last 7 Days</option>
                            <option>Last 30 Days</option>
                        </select>
                        <ChevronRight size={14} className="absolute right-2 top-1/2 -translate-y-1/2 rotate-90 text-zinc-400 pointer-events-none" />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
                    {activeTab === 'overview' ? (
                        <>
                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Total KM</p>
                                    <h4 className="text-base font-bold text-zinc-900">0 km</h4>
                                </div>
                                <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Completed Orders</p>
                                    <h4 className="text-base font-bold text-zinc-900">5</h4>
                                </div>
                                <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1 text-rose-500">Cancelled</p>
                                    <h4 className="text-base font-bold text-zinc-900">1</h4>
                                </div>
                                <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Avg KM / Order</p>
                                    <h4 className="text-base font-bold text-zinc-900">0 km</h4>
                                </div>
                            </div>

                            {/* Rider Details */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs font-bold text-zinc-900 flex items-center gap-2">
                                        Details
                                    </h3>
                                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[9px] font-bold">
                                        Active
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-y-5">
                                    <div>
                                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Rider Name</p>
                                        <p className="text-[11px] font-bold text-zinc-800">{rider.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Vehicle Name</p>
                                        <p className="text-[11px] font-bold text-zinc-800">{rider.vehicle || 'Okada 125cc'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Phone</p>
                                        <p className="text-[11px] font-bold text-zinc-800">{rider.phone}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Vehicle Plate</p>
                                        <p className="text-[11px] font-bold text-zinc-800">{rider.plate || 'ENU-345AA'}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Email</p>
                                        <p className="text-[11px] font-bold text-zinc-800 lowercase">{rider.email}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Address</p>
                                        <p className="text-[11px] font-bold text-zinc-800">{rider.address || '18 Ogui Rd, Enugu'}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Date Joined</p>
                                        <p className="text-[11px] font-bold text-zinc-800">{rider.joined || '20 Jan 2024, 1:00 PM'}</p>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-6">
                            {['Today', 'Yesterday', '2 days ago'].map((day) => (
                                <div key={day} className="space-y-3">
                                    <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{day}</h4>
                                    <div className="space-y-3">
                                        {deliveries.filter(d => d.day === day).map((delivery, i) => (
                                            <div key={i} className="p-4 bg-zinc-50/50 rounded-2xl border border-zinc-100 hover:border-emerald-100 transition-colors group">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div>
                                                        <h5 className="text-[11px] font-bold text-zinc-900">{delivery.id}</h5>
                                                        <p className="text-[9px] text-zinc-500 font-medium">{delivery.date} • {delivery.items}</p>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-[8px] font-bold border ${delivery.status === 'Delivered'
                                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                            : 'bg-rose-50 text-rose-600 border-rose-100'
                                                        }`}>
                                                        {delivery.status}
                                                    </span>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex gap-2 text-[9px]">
                                                        <div className="p-1 h-fit bg-emerald-100 rounded text-emerald-600 uppercase font-bold text-[7px] shrink-0">Pickup</div>
                                                        <p className="font-bold text-zinc-700">{delivery.pickup}</p>
                                                    </div>
                                                    <div className="flex gap-2 text-[9px]">
                                                        <div className="p-1 h-fit bg-indigo-100 rounded text-indigo-600 uppercase font-bold text-[7px] shrink-0">Dropoff</div>
                                                        <p className="font-bold text-zinc-700">{delivery.dropoff}</p>
                                                    </div>
                                                </div>
                                                <div className="mt-3 text-right">
                                                    <span className="text-[11px] font-bold text-zinc-900">{delivery.distance}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-5 border-t border-zinc-100 bg-zinc-50/50 shrink-0">
                    <div className="grid grid-cols-2 gap-3">
                        <button className="px-6 py-3 bg-white border border-emerald-800 text-emerald-800 rounded-2xl text-[11px] font-bold hover:bg-emerald-50 transition-all">
                            Delete account
                        </button>
                        <button className="px-6 py-3 bg-emerald-800 text-white rounded-2xl text-[11px] font-bold hover:bg-emerald-900 transition-all shadow-md shadow-emerald-900/10">
                            Suspend account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RiderModal;
