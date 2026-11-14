import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

const AppUpdateModal = ({ isOpen, version, saving, onClose, onSave }) => {
    const [draft, setDraft] = useState(version || '1.1.0');

    useEffect(() => {
        if (isOpen) setDraft(version || '1.1.0');
    }, [isOpen, version]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <div className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-zinc-900">App update</h2>
                    <button type="button" onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full text-zinc-400">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-8 space-y-6">
                    <div className="space-y-3">
                        <label htmlFor="app-min-version" className="text-xs font-bold text-zinc-900">Oldest allowed version</label>
                        <input
                            id="app-min-version"
                            value={draft}
                            onChange={(event) => setDraft(event.target.value)}
                            placeholder="1.1.0"
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-5 py-4 text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
                        />
                        <p className="text-[10px] text-zinc-500 font-medium">Use the store version, like 1.1.0. The switch stays off until you turn it on.</p>
                    </div>
                    <div className="flex gap-4">
                        <button type="button" onClick={onClose} className="flex-1 py-4 bg-zinc-100 text-zinc-900 rounded-3xl text-sm font-bold">
                            Cancel
                        </button>
                        <button
                            type="button"
                            disabled={saving}
                            onClick={() => onSave(draft.trim())}
                            className="flex-1 py-4 bg-emerald-800 text-white rounded-3xl text-sm font-bold disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Done'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppUpdateModal;
