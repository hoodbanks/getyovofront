import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, X } from 'lucide-react';
import RiderHeader from '../../../components/rider/RiderHeader';

const RiderHistory = () => {
    const navigate = useNavigate();
    const [filter, setFilter] = useState('All');
    const [showCalendar, setShowCalendar] = useState(false);

    // Calendar State
    const [viewDate, setViewDate] = useState(new Date(2025, 11, 1)); // Default to Dec 2025
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [selectingType, setSelectingType] = useState('from'); // 'from' or 'to'

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const handleDateClick = (day) => {
        const selected = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        selected.setHours(0, 0, 0, 0);

        if (selectingType === 'from' || !fromDate) {
            setFromDate(selected);
            if (toDate && selected > toDate) setToDate(null);
            setSelectingType('to');
        } else {
            if (selected < fromDate) {
                setFromDate(selected);
                setToDate(null);
                setSelectingType('to');
            } else {
                setToDate(selected);
                setSelectingType('from');
                setShowCalendar(false); // Close modal when range is complete
            }
        }
    };

    const formatDate = (date) => {
        if (!date) return "";
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const changeMonth = (offset) => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1));
    };

    const historyData = [
        {
            date: 'Today',
            orders: [
                { id: '#01-A', store: 'Restaurant', name: 'Candles', address: '18 Ogui Rd, Enugu', items: '2x Jollof Rice, 1x Grilled Chicken' },
                { id: '#01-A', store: 'Restaurant', name: 'Candles', address: '18 Ogui Rd, Enugu', items: '2x Jollof Rice, 1x Grilled Chicken' }
            ]
        },
        {
            date: 'Yesterday',
            orders: [
                { id: '#01-A', store: 'Restaurant', name: 'Candles', address: '18 Ogui Rd, Enugu', items: '2x Jollof Rice, 1x Grilled Chicken' }
            ]
        },
        {
            date: '2 days ago',
            orders: [
                { id: '#01-A', store: 'Restaurant', name: 'Candles', address: '18 Ogui Rd, Enugu', items: '2x Jollof Rice, 1x Grilled Chicken' }
            ]
        }
    ];

    const daysInMonth = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth());
    const firstDay = getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: firstDay }, (_, i) => i);

    return (
        <div className="min-h-screen bg-[#F9FCF9] flex flex-col font-sans">
            <RiderHeader activeTab="History" activeCount={1} historyCount={5} />

            <div className="flex-1 px-4 py-6 overflow-y-auto">
                <div className="flex gap-2.5 mb-8 overflow-x-auto no-scrollbar py-1">
                    {['All', 'Restaurant', 'Shops', 'Pharmacy'].map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={`px-6 py-3 rounded-full text-[14px] font-bold whitespace-nowrap shrink-0 transition-colors ${filter === cat
                                ? 'bg-[#1C5E20] text-white shadow-md'
                                : 'bg-[#F1F4F1] text-zinc-500 hover:bg-zinc-200'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="bg-white rounded-xl p-5 mb-8 border border-zinc-100 shadow-sm">
                    <h3 className="text-[13px] font-bold text-[#1C5E20] mb-4">Date range</h3>
                    <div className="flex gap-4">
                        <div
                            onClick={() => {
                                setSelectingType('from');
                                setShowCalendar(true);
                            }}
                            className={`flex-1 rounded-xl px-4 py-3.5 text-[14px] font-medium cursor-pointer transition-all border-2 ${selectingType === 'from' && showCalendar
                                ? 'border-[#1C5E20] bg-white shadow-sm'
                                : fromDate
                                    ? 'border-[#1C5E20]/20 bg-[#1C5E20]/5 text-[#1C5E20]'
                                    : 'border-transparent bg-[#F3F4F6] text-zinc-400'
                                }`}
                        >
                            {fromDate ? formatDate(fromDate) : "From"}
                        </div>
                        <div
                            onClick={() => {
                                setSelectingType('to');
                                setShowCalendar(true);
                            }}
                            className={`flex-1 rounded-xl px-4 py-3.5 text-[14px] font-medium cursor-pointer transition-all border-2 ${selectingType === 'to' && showCalendar
                                ? 'border-[#1C5E20] bg-white shadow-sm'
                                : toDate
                                    ? 'border-[#1C5E20]/20 bg-[#1C5E20]/5 text-[#1C5E20]'
                                    : 'border-transparent bg-[#F3F4F6] text-zinc-400'
                                }`}
                        >
                            {toDate ? formatDate(toDate) : "To"}
                        </div>
                    </div>
                </div>

                <div className="space-y-8 pb-12">
                    {historyData.map((group, i) => (
                        <div key={i} className="space-y-4">
                            <h4 className="text-[13px] font-bold text-zinc-500 ml-1">{group.date}</h4>
                            <div className="space-y-4">
                                {group.orders.map((order, j) => (
                                    <div key={j} className="bg-white rounded-xl p-6 border border-zinc-100 shadow-sm">
                                        <p className="text-[11px] font-bold text-zinc-400 mb-1">{order.id}</p>
                                        <p className="text-[13px] font-semibold text-zinc-800">{order.store}</p>
                                        <h3 className="text-[18px] font-bold text-[#1C5E20] leading-tight mt-1 mb-1">{order.name}</h3>
                                        <p className="text-[14px] text-zinc-500 font-medium mb-1">{order.address}</p>
                                        <p className="text-[13px] font-medium text-zinc-400">
                                            Items: <span className="text-zinc-600">{order.items}</span>
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {showCalendar && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-8">
                    <div className="bg-white w-full max-w-sm rounded-[40px] p-8 shadow-2xl relative animate-in fade-in zoom-in duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-2">
                                <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-zinc-100 rounded-full transition-colors">
                                    <ChevronLeft size={16} className="text-zinc-400" />
                                </button>
                                <span className="text-[16px] font-bold text-zinc-900 min-w-[100px] text-center">
                                    {months[viewDate.getMonth()]} {viewDate.getFullYear()}
                                </span>
                                <button onClick={() => changeMonth(1)} className="p-1 hover:bg-zinc-100 rounded-full transition-colors">
                                    <ChevronRight size={16} className="text-zinc-400" />
                                </button>
                            </div>
                            <button onClick={() => setShowCalendar(false)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                                <X size={20} className="text-zinc-400" />
                            </button>
                        </div>

                        <div className="grid grid-cols-7 gap-y-2 text-center mb-8">
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                                <span key={day} className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider h-8 flex items-center justify-center">{day}</span>
                            ))}
                            {blanks.map(i => (
                                <div key={`blank-${i}`} className="h-10 w-10"></div>
                            ))}
                            {days.map(day => {
                                const current = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
                                current.setHours(0, 0, 0, 0);

                                const isSelected = (fromDate && current.getTime() === fromDate.getTime()) || (toDate && current.getTime() === toDate.getTime());
                                const inRange = fromDate && toDate && current.getTime() > fromDate.getTime() && current.getTime() < toDate.getTime();

                                return (
                                    <button
                                        key={day}
                                        onClick={() => handleDateClick(day)}
                                        className={`text-[14px] h-10 w-10 flex items-center justify-center rounded-xl mx-auto transition-all relative ${isSelected ? 'bg-[#1C5E20] text-white font-bold shadow-md' : inRange ? 'bg-[#1C5E20]/10 text-[#1C5E20]' : 'text-zinc-800 hover:bg-zinc-100'}`}
                                    >
                                        {day}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => setShowCalendar(false)}
                            className="w-full bg-[#1C5E20] text-white font-bold py-4 rounded-xl text-[15px] shadow-lg shadow-[#1C5E20]/20"
                        >
                            Apply Filter
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RiderHistory;
