import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, Loader2, AlertCircle } from 'lucide-react';
import RiderHeader from '../../../components/rider/RiderHeader';
import api from '../../../api/api';
import { useAuthStore } from '../../../store/useAuthStore';
import { useRiderStore } from '../../../store/useRiderStore';

const RiderHistory = () => {
    const token = useAuthStore((state) => state.accessToken);
    const activeOrdersCount = useRiderStore((state) => state.activeOrdersCount);
    const deliveredOrdersCount = useRiderStore((state) => state.deliveredOrdersCount);
    const setCounts = useRiderStore((state) => state.setCounts);

    // Shop type filter — client-side
    const [filter, setFilter] = useState('All');
    const [shopTypes, setShopTypes] = useState([]);

    const [showCalendar, setShowCalendar] = useState(false);

    // Date range state
    const [viewDate, setViewDate] = useState(new Date());
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [selectingType, setSelectingType] = useState('from');

    // API state — store all fetched orders, then filter client-side
    const [allOrders, setAllOrders] = useState([]);
    const [meta, setMeta] = useState(null);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 4000);
    };

    // Sync counts once on mount
    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const res = await api.get('/rider/orders/counts', token);
                if (res?.data) setCounts(res.data);
            } catch (_) {}
        };
        fetchCounts();
    }, [token, setCounts]);

    // Fetch history — no shopTypeId query param, filter client-side
    const fetchHistory = useCallback(async () => {
        setIsLoading(true);
        try {
            let url;
            if (fromDate && toDate) {
                const from = fromDate.toISOString().split('T')[0];
                const to = toDate.toISOString().split('T')[0];
                url = `/rider/orders/history/date?from=${from}&to=${to}&page=${page}`;
            } else {
                url = `/rider/orders/history?page=${page}`;
            }

            const res = await api.get(url, token);
            if (res?.data) {
                const orders = res.data.data || [];
                setAllOrders(orders);
                setMeta(res.data.meta || null);

                // Build shop type pills from returned data (first page only)
                if (page === 1) {
                    const seen = new Map();
                    orders.forEach(o => {
                        if (o.shopType && !seen.has(o.shopType)) {
                            seen.set(o.shopType, o.shopType);
                        }
                    });
                    if (seen.size > 0) setShopTypes([...seen.keys()]);
                }
            }
        } catch (err) {
            showToast(err.message || 'Failed to load history');
        } finally {
            setIsLoading(false);
        }
    }, [fromDate, toDate, page, token]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    // Client-side filter by shop type
    const displayedOrders = filter === 'All'
        ? allOrders
        : allOrders.filter(o => o.shopType === filter);

    // Calendar helpers
    const handleDateClick = (day) => {
        const selected = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        selected.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selected > today) return;

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
                setShowCalendar(false);
            }
        }
    };

    const handleApplyFilter = () => {
        if (fromDate && toDate) {
            setPage(1);
            setFilter('All');
            setShowCalendar(false);
        }
    };

    const handleClearDates = () => {
        setFromDate(null);
        setToDate(null);
        setSelectingType('from');
        setPage(1);
        setFilter('All');
    };

    const formatDate = (date) => {
        if (!date) return '';
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const formatDisplayDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const changeMonth = (offset) => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1));
    };

    const daysInMonth = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth());
    const firstDay = getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: firstDay }, (_, i) => i);

    // Group displayed orders by delivery/created date
    const groupedOrders = displayedOrders.reduce((groups, order) => {
        const dateKey = order.deliveredAt
            ? formatDisplayDate(order.deliveredAt)
            : order.createdAt
            ? formatDisplayDate(order.createdAt)
            : 'Unknown date';
        if (!groups[dateKey]) groups[dateKey] = [];
        groups[dateKey].push(order);
        return groups;
    }, {});

    return (
        <div className="min-h-screen bg-[#F9FCF9] flex flex-col font-sans">
            <RiderHeader
                activeTab="History"
                activeCount={activeOrdersCount}
                historyCount={deliveredOrdersCount}
            />

            {/* Toast */}
            {toast && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] w-[90%] max-w-sm animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3 shadow-lg">
                        <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white shrink-0">
                            <AlertCircle size={16} />
                        </div>
                        <p className="text-[13px] font-bold text-red-900 flex-1">{toast}</p>
                    </div>
                </div>
            )}

            <div className="flex-1 px-4 py-6 overflow-y-auto">
                {/* Shop Type Filter Pills */}
                {shopTypes.length > 0 && (
                    <div className="flex gap-2.5 mb-6 overflow-x-auto no-scrollbar py-1">
                        {['All', ...shopTypes].map(cat => (
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
                )}

                {/* Date Range Picker */}
                <div className="bg-white rounded-xl p-5 mb-6 border border-zinc-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[13px] font-bold text-[#1C5E20]">Date range</h3>
                        {(fromDate || toDate) && (
                            <button
                                onClick={handleClearDates}
                                className="text-[12px] font-bold text-red-500 flex items-center gap-1"
                            >
                                <X size={12} />
                                Clear
                            </button>
                        )}
                    </div>
                    <div className="flex gap-4">
                        <div
                            onClick={() => { setSelectingType('from'); setShowCalendar(true); }}
                            className={`flex-1 rounded-xl px-4 py-3.5 text-[14px] font-medium cursor-pointer transition-all border-2 ${
                                selectingType === 'from' && showCalendar
                                    ? 'border-[#1C5E20] bg-white shadow-sm'
                                    : fromDate
                                    ? 'border-[#1C5E20]/20 bg-[#1C5E20]/5 text-[#1C5E20]'
                                    : 'border-transparent bg-[#F3F4F6] text-zinc-400'
                            }`}
                        >
                            {fromDate ? formatDate(fromDate) : 'From'}
                        </div>
                        <div
                            onClick={() => { setSelectingType('to'); setShowCalendar(true); }}
                            className={`flex-1 rounded-xl px-4 py-3.5 text-[14px] font-medium cursor-pointer transition-all border-2 ${
                                selectingType === 'to' && showCalendar
                                    ? 'border-[#1C5E20] bg-white shadow-sm'
                                    : toDate
                                    ? 'border-[#1C5E20]/20 bg-[#1C5E20]/5 text-[#1C5E20]'
                                    : 'border-transparent bg-[#F3F4F6] text-zinc-400'
                            }`}
                        >
                            {toDate ? formatDate(toDate) : 'To'}
                        </div>
                    </div>
                </div>

                {/* Orders List */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 size={32} className="text-[#1C5E20] animate-spin mb-3" />
                        <p className="text-[13px] font-medium text-zinc-400">Loading history...</p>
                    </div>
                ) : displayedOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center px-10">
                        <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
                            <span className="text-2xl">📋</span>
                        </div>
                        <h2 className="text-[15px] font-bold text-zinc-500 mb-1">No delivery history</h2>
                        <p className="text-[13px] text-zinc-400 font-medium">
                            {fromDate && toDate
                                ? 'No orders found for the selected date range.'
                                : filter !== 'All'
                                ? `No ${filter} deliveries yet.`
                                : 'Your completed deliveries will appear here.'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-8 pb-12">
                        {Object.entries(groupedOrders).map(([date, orders]) => (
                            <div key={date} className="space-y-4">
                                <h4 className="text-[13px] font-bold text-zinc-500 ml-1">{date}</h4>
                                <div className="space-y-4">
                                    {orders.map((order) => (
                                        <div key={order.orderId} className="bg-white rounded-xl p-6 border border-zinc-100 shadow-sm">
                                            <p className="text-[11px] font-bold text-zinc-400 mb-1">{order.orderId}</p>
                                            {order.shopType && (
                                                <p className="text-[13px] font-semibold text-zinc-800">{order.shopType}</p>
                                            )}
                                            <h3 className="text-[18px] font-bold text-[#1C5E20] leading-tight mt-1 mb-1">{order.vendorStoreName}</h3>
                                            {order.itemsString && (
                                                <p className="text-[13px] font-medium text-zinc-400 mb-2">
                                                    Items: <span className="text-zinc-600">{order.itemsString}</span>
                                                </p>
                                            )}
                                            <div className="flex items-center justify-between mt-3">
                                                <span className="px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-[11px] font-bold border border-green-100">
                                                    {order.status || 'DELIVERED'}
                                                </span>
                                                {order.totalAmount && (
                                                    <span className="text-[15px] font-extrabold text-zinc-900">
                                                        ₦{order.totalAmount.toLocaleString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* Pagination */}
                        {meta && meta.totalPages > 1 && (
                            <div className="flex items-center justify-between pt-2 pb-4">
                                <button
                                    disabled={page === 1}
                                    onClick={() => { setPage(p => p - 1); setFilter('All'); }}
                                    className="px-5 py-2.5 rounded-full bg-white border border-zinc-200 text-[13px] font-bold text-zinc-600 disabled:opacity-40 shadow-sm"
                                >
                                    ← Prev
                                </button>
                                <span className="text-[12px] text-zinc-400 font-medium">
                                    Page {meta.page} of {meta.totalPages}
                                </span>
                                <button
                                    disabled={page >= meta.totalPages}
                                    onClick={() => { setPage(p => p + 1); setFilter('All'); }}
                                    className="px-5 py-2.5 rounded-full bg-white border border-zinc-200 text-[13px] font-bold text-zinc-600 disabled:opacity-40 shadow-sm"
                                >
                                    Next →
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Calendar Modal */}
            {showCalendar && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-8">
                    <div className="bg-white w-full max-w-sm rounded-[40px] p-8 shadow-2xl relative animate-in fade-in zoom-in duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-2">
                                <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-zinc-100 rounded-full transition-colors">
                                    <ChevronLeft size={16} className="text-zinc-400" />
                                </button>
                                <span className="text-[16px] font-bold text-zinc-900 min-w-[130px] text-center">
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

                        <p className="text-[12px] font-bold text-zinc-400 mb-4 text-center">
                            {selectingType === 'from' ? 'Select start date' : 'Select end date'}
                        </p>

                        <div className="grid grid-cols-7 gap-y-2 text-center mb-8">
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                                <span key={i} className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider h-8 flex items-center justify-center">{day}</span>
                            ))}
                            {blanks.map(i => (
                                <div key={`blank-${i}`} className="h-10 w-10" />
                            ))}
                            {days.map(day => {
                                const current = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
                                current.setHours(0, 0, 0, 0);
                                const today = new Date(); today.setHours(0, 0, 0, 0);
                                const isFuture = current > today;
                                const isSelected =
                                    (fromDate && current.getTime() === fromDate.getTime()) ||
                                    (toDate && current.getTime() === toDate.getTime());
                                const inRange = fromDate && toDate && current > fromDate && current < toDate;

                                return (
                                    <button
                                        key={day}
                                        onClick={() => !isFuture && handleDateClick(day)}
                                        disabled={isFuture}
                                        className={`text-[14px] h-10 w-10 flex items-center justify-center rounded-xl mx-auto transition-all
                                            ${isSelected
                                                ? 'bg-[#1C5E20] text-white font-bold shadow-md'
                                                : inRange
                                                ? 'bg-[#1C5E20]/10 text-[#1C5E20]'
                                                : isFuture
                                                ? 'text-zinc-300 cursor-not-allowed'
                                                : 'text-zinc-800 hover:bg-zinc-100'
                                            }`}
                                    >
                                        {day}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={handleApplyFilter}
                            disabled={!fromDate || !toDate}
                            className="w-full bg-[#1C5E20] text-white font-bold py-4 rounded-xl text-[15px] shadow-lg shadow-[#1C5E20]/20 disabled:opacity-50"
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
