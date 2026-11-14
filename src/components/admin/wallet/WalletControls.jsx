import { useEffect, useRef, useState } from 'react';
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { toast } from 'sonner';

export const WalletFilterDropdown = ({ label, selected, options, onSelect, fullWidth = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const selectedLabel = options.find((option) => option.value === selected)?.label || selected;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={`relative w-full ${fullWidth ? 'min-w-0' : 'sm:w-auto'}`} ref={dropdownRef}>
            {label && <span className="mb-1.5 block px-1 text-[11px] font-semibold text-zinc-500">{label}</span>}
            <button type="button" aria-expanded={isOpen} onClick={() => setIsOpen((open) => !open)} className={`flex w-full items-center justify-between gap-3 rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-2.5 text-left text-[11px] font-bold text-zinc-600 outline-none transition-colors hover:bg-zinc-100 focus-visible:ring-2 focus-visible:ring-emerald-500/20 ${fullWidth ? 'min-w-0' : 'sm:min-w-36'}`}>
                <span className="truncate whitespace-nowrap">{selectedLabel}</span><ChevronDown size={14} className={`shrink-0 text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="absolute right-0 z-40 mt-2 max-h-72 w-full min-w-40 overflow-y-auto rounded-2xl border border-zinc-100 bg-white py-2 shadow-xl animate-in fade-in zoom-in-95 duration-200">
                    {options.map((option) => (
                        <button type="button" key={option.value} onClick={() => { onSelect(option.value); setIsOpen(false); }} className={`w-full px-4 py-2.5 text-left text-[11px] font-bold transition-colors ${selected === option.value ? 'bg-zinc-50 text-emerald-700' : 'text-zinc-600 hover:bg-zinc-50'}`}>
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const toIsoDate = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const formatDisplayDate = (value) => {
    if (!value) return '';
    const [year, month, day] = value.split('-');
    return `${day}/${month}/${year}`;
};

export const WalletDatePicker = ({ label, value, onChange }) => {
    const selectedDate = value ? new Date(`${value}T00:00:00`) : null;
    const [isOpen, setIsOpen] = useState(false);
    const [visibleMonth, setVisibleMonth] = useState(() => selectedDate || new Date());
    const pickerRef = useRef(null);
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const firstWeekday = new Date(year, month, 1).getDay();
    const dayCount = new Date(year, month + 1, 0).getDate();
    const cellCount = Math.ceil((firstWeekday + dayCount) / 7) * 7;
    const days = Array.from({ length: cellCount }, (_, index) => {
        const day = index - firstWeekday + 1;
        return day > 0 && day <= dayCount ? new Date(year, month, day) : null;
    });

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const openPicker = () => {
        if (selectedDate) setVisibleMonth(selectedDate);
        setIsOpen((open) => !open);
    };

    return (
        <div className="relative" ref={pickerRef}>
            <span className="mb-2 block text-xs font-semibold text-zinc-700">{label}</span>
            <div className="flex min-h-11 items-center rounded-xl border border-zinc-200 bg-white px-3 transition-colors focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-600/10">
                <span className={`flex-1 text-xs ${value ? 'text-zinc-700' : 'text-zinc-400'}`}>{formatDisplayDate(value) || 'DD/MM/YYYY'}</span>
                <button type="button" onClick={openPicker} aria-label={`Choose ${label.toLowerCase()}`} aria-expanded={isOpen} className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700">
                    <CalendarDays size={17} />
                </button>
            </div>
            {isOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-2xl border border-zinc-100 bg-white p-4 shadow-2xl">
                    <div className="mb-3 flex items-center justify-between">
                        <button type="button" onClick={() => setVisibleMonth(new Date(year, month - 1, 1))} aria-label="Previous month" className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100"><ChevronLeft size={17} /></button>
                        <p className="text-xs font-bold text-zinc-800">{visibleMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                        <button type="button" onClick={() => setVisibleMonth(new Date(year, month + 1, 1))} aria-label="Next month" className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100"><ChevronRight size={17} /></button>
                    </div>
                    <div className="grid grid-cols-7 text-center">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => <span key={day} className="py-2 text-[10px] font-bold text-zinc-400">{day}</span>)}
                        {days.map((day, index) => {
                            const selected = day && selectedDate && day.toDateString() === selectedDate.toDateString();
                            return day ? (
                                <button type="button" key={day.toISOString()} onClick={() => { onChange(toIsoDate(day)); setIsOpen(false); }} className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-xs transition-colors ${selected ? 'bg-[#1C5E20] font-bold text-white' : 'text-zinc-700 hover:bg-emerald-50 hover:text-emerald-800'}`}>
                                    {day.getDate()}
                                </button>
                            ) : <span key={`empty-${index}`} className="h-8" />;
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export const WalletCustomDateModal = ({ isOpen, dates, onDatesChange, onClose, onApply }) => {
    if (!isOpen) return null;

    const applyDates = () => {
        if (!dates.start || !dates.end) {
            toast('Choose both a start date and an end date.');
            return;
        }
        if (new Date(`${dates.start}T00:00:00`) > new Date(`${dates.end}T00:00:00`)) {
            toast('The start date must be before the end date.');
            return;
        }
        onApply(dates);
    };

    return (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/50 p-4 animate-fade-in" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
            <section role="dialog" aria-modal="true" aria-labelledby="wallet-custom-date-title" className="w-full max-w-md overflow-visible rounded-2xl bg-white shadow-2xl">
                <header className="flex items-center justify-between rounded-t-2xl border-b border-zinc-100 px-5 py-4">
                    <h2 id="wallet-custom-date-title" className="text-sm font-bold text-zinc-900">Custom Date</h2>
                    <button type="button" onClick={onClose} aria-label="Close custom date" className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"><X size={18} /></button>
                </header>
                <div className="space-y-4 p-5">
                    <WalletDatePicker label="Start date *" value={dates.start} onChange={(start) => onDatesChange((current) => ({ ...current, start }))} />
                    <WalletDatePicker label="End date *" value={dates.end} onChange={(end) => onDatesChange((current) => ({ ...current, end }))} />
                    <button type="button" onClick={applyDates} className="w-full rounded-xl bg-[#1C5E20] py-3 text-xs font-bold text-white transition-colors hover:bg-[#174D1A] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2">Apply</button>
                </div>
            </section>
        </div>
    );
};
