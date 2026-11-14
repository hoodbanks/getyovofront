import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

const MaintenanceModeModal = ({ isOpen, message, saving, onClose, onSave }) => {
    const [draft, setDraft] = useState(message || '');

    useEffect(() => {
        if (isOpen) setDraft(message || '');
    }, [isOpen, message]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/50 transition-opacity duration-300 animate-fade-in"
                onClick={onClose}
            />

            <div className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-slide-up">
                <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-zinc-900">Maintenance Mode</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-400"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 space-y-8">
                    <div className="space-y-3">
                        <label htmlFor="maintenance-message" className="text-xs font-bold text-zinc-900">Maintenance notice</label>
                        <textarea
                            id="maintenance-message"
                            value={draft}
                            onChange={(event) => setDraft(event.target.value)}
                            maxLength={240}
                            placeholder="e.g. Maintenance ongoing."
                            rows={4}
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-[1.5rem] px-5 py-4 text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 placeholder:text-zinc-500 resize-none"
                        />
                        <p className="text-[10px] text-zinc-500 font-medium">The customer, vendor, and rider apps show this when maintenance is on. 240 characters.</p>
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 bg-zinc-100/80 text-zinc-900 rounded-3xl text-sm font-bold hover:bg-zinc-200/80 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            disabled={saving}
                            onClick={() => onSave(draft)}
                            className="flex-1 py-4 bg-emerald-800 text-white rounded-3xl text-sm font-bold hover:bg-emerald-900 transition-all shadow-md shadow-emerald-900/10 disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Done'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MaintenanceModeModal;
