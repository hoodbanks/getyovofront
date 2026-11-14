import React, { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight, Clock3, ImagePlus, Loader2, Megaphone, X } from 'lucide-react';
import api from '../../api/api';
import { useAuthStore } from '../../store/useAuthStore';
import { formatDateTime } from '../../utils/formatters';
import { AnnouncementDetailView } from '../../components/announcements/AnnouncementView';
import {
    AUDIENCE_LABELS,
    AUDIENCES,
    CATEGORIES,
    CATEGORY_LABELS,
    LIMITS,
    PUSH_COUNT_FIELDS,
    STATUS_LABELS,
    STATUSES,
    blankForm,
    buildDraftPayload,
    destinationsForAudience,
    emptyBlock,
    formFromDetail,
    listPath,
    newIdempotencyKey,
    previewAnnouncement,
    validateImageFile,
    validateImageWidth,
} from './announcementContract';

const pushCountExplanations = {
    pending: { text: 'Waiting in line to be sent.', tone: 'border-slate-200 bg-slate-50' },
    attempting: { text: 'Being sent right now.', tone: 'border-blue-200 bg-blue-50' },
    accepted: { text: 'The delivery service took it and may send it to a phone. This does not prove anyone saw it.', tone: 'border-emerald-200 bg-emerald-50' },
    failed: { text: 'The delivery service did not take the message.', tone: 'border-rose-200 bg-rose-50' },
    exhausted: { text: 'The system tried again and again. No more automatic tries are left.', tone: 'border-orange-200 bg-orange-50' },
    noToken: { text: 'No device connection is saved on this account for push messages.', tone: 'border-violet-200 bg-violet-50' },
    cancelled: { text: 'This send was stopped before the delivery service took it—for example, if the campaign was turned off before sending.', tone: 'border-zinc-300 bg-zinc-100' },
};

const fieldClass = 'mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-3 text-sm text-zinc-800 outline-none transition placeholder:text-zinc-400 focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10';

function Switch({ checked, onChange, label, description }) {
    return <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)} className="flex w-full items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-white px-3.5 py-3 text-left transition hover:border-zinc-300 focus:outline-none focus:ring-4 focus:ring-emerald-700/10">
        <span><span className="block text-xs font-semibold text-zinc-800">{label}</span>{description && <span className="mt-0.5 block text-[11px] leading-4 text-zinc-500">{description}</span>}</span>
        <span className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? 'bg-emerald-700' : 'bg-zinc-300'}`}><span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-[22px]' : 'translate-x-0.5'}`} /></span>
    </button>;
}

function CalendarPicker({ value, onChange }) {
    const [open, setOpen] = useState(false);
    const selected = value ? new Date(`${value}T00:00:00`) : null;
    const [monthDate, setMonthDate] = useState(() => selected || new Date());
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const cells = Array.from({ length: Math.ceil((firstDay + totalDays) / 7) * 7 }, (_, index) => index - firstDay + 1);
    const display = value ? new Date(`${value}T00:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Choose an end date';
    return <div className="relative">
        <button type="button" aria-label="End date" aria-expanded={open} onClick={() => { if (selected) setMonthDate(selected); setOpen(!open); }} className="flex min-h-11 w-full items-center justify-between gap-2 rounded-xl border border-zinc-200 bg-white px-3.5 py-3 text-left text-sm text-zinc-700 transition hover:border-zinc-300 focus:outline-none focus:ring-4 focus:ring-emerald-700/10"><span className={value ? '' : 'text-zinc-400'}>{display}</span><CalendarDays size={16} className="text-zinc-400" /></button>
        {open && <div className="absolute right-0 top-full z-40 mt-2 w-72 rounded-2xl border border-zinc-200 bg-white p-4 shadow-xl">
            <div className="mb-3 flex items-center justify-between"><button type="button" aria-label="Previous month" onClick={() => setMonthDate(new Date(year, month - 1, 1))} className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100"><ChevronLeft size={17} /></button><p className="text-xs font-bold text-zinc-800">{monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p><button type="button" aria-label="Next month" onClick={() => setMonthDate(new Date(year, month + 1, 1))} className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100"><ChevronRight size={17} /></button></div>
            <div className="grid grid-cols-7 text-center">{['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => <span key={day} className="py-2 text-[10px] font-bold text-zinc-400">{day}</span>)}{cells.map((day, index) => day > 0 && day <= totalDays ? <button type="button" key={index} onClick={() => { onChange(`${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`); setOpen(false); }} className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-xs transition ${selected?.getDate() === day && selected?.getMonth() === month && selected?.getFullYear() === year ? 'bg-emerald-800 font-bold text-white' : 'text-zinc-700 hover:bg-emerald-50 hover:text-emerald-800'}`}>{day}</button> : <span key={index} className="h-8" />)}</div>
        </div>}
    </div>;
}

function MenuSelect({ label, value, options, onChange, className = '' }) {
    const [open, setOpen] = useState(false);
    const selected = options.find((option) => option.value === value);
    return <div className={`relative ${className}`}>
        <button type="button" aria-label={label} aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((current) => !current)} onKeyDown={(event) => { if (event.key === 'Escape') setOpen(false); }} className="flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-left text-sm text-zinc-800 transition hover:border-zinc-300 focus:outline-none focus:ring-4 focus:ring-emerald-700/10">
            <span className="truncate">{selected?.label || 'Choose an option'}</span><ChevronDown size={16} className={`shrink-0 text-zinc-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && <div role="listbox" aria-label={label} className="absolute z-30 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-zinc-200 bg-white p-1 shadow-xl">
            {options.map((option) => <button type="button" role="option" aria-selected={option.value === value} key={option.value} onClick={() => { onChange(option.value); setOpen(false); }} className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-xs transition ${option.value === value ? 'bg-emerald-50 font-semibold text-emerald-900' : 'text-zinc-700 hover:bg-zinc-50'}`}>
                <span>{option.label}</span>{option.value === value && <Check size={14} className="shrink-0 text-emerald-700" />}
            </button>)}
        </div>}
    </div>;
}

function readImageWidth(file) {
    return new Promise((resolve) => {
        const url = URL.createObjectURL(file);
        const image = new Image();
        let settled = false;
        const finish = (width) => {
            if (settled) return;
            settled = true;
            URL.revokeObjectURL(url);
            resolve(width);
        };
        const timer = setTimeout(() => finish(null), 400);
        image.onload = () => {
            clearTimeout(timer);
            finish(image.naturalWidth);
        };
        image.onerror = () => {
            clearTimeout(timer);
            finish(null);
        };
        image.src = url;
    });
}

const Broadcast = () => {
    const token = useAuthStore((state) => state.accessToken);
    const queryClient = useQueryClient();
    const [form, setForm] = useState(blankForm);
    const [formError, setFormError] = useState('');
    const [uploadError, setUploadError] = useState('');
    const [uploading, setUploading] = useState(false);
    const [selectedFileName, setSelectedFileName] = useState('');
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState('');
    const [audience, setAudience] = useState('');
    const [query, setQuery] = useState('');
    const [selectedId, setSelectedId] = useState(null);
    const [publishResult, setPublishResult] = useState(null);
    const publishKeys = useRef(new Map());
    const draftId = useRef(null);
    const imageInputRef = useRef(null);

    const listQuery = useQuery({
        queryKey: ['announcements', page, status, audience, query],
        queryFn: () => api.get(listPath({ page, status, audience, query }), token),
        enabled: Boolean(token),
        placeholderData: (previous) => previous,
    });

    const detailQuery = useQuery({
        queryKey: ['announcement', selectedId],
        queryFn: () => api.get(`/superadmin/announcements/${encodeURIComponent(selectedId)}`, token),
        enabled: Boolean(token && selectedId),
    });

    const saveMutation = useMutation({
        mutationFn: async () => {
            const built = buildDraftPayload(form, { forUpdate: Boolean(form.id) });
            if (built.error) throw new Error(built.error);
            if (form.id) return api.patch(`/superadmin/announcements/${encodeURIComponent(form.id)}`, built.payload, token);
            return api.post('/superadmin/announcements', built.payload, token);
        },
        onSuccess: (response) => {
            const saved = response.data;
            draftId.current = saved?.id || draftId.current;
            setForm(formFromDetail(saved));
            setFormError('');
            queryClient.invalidateQueries({ queryKey: ['announcements'] });
        },
        onError: (error) => setFormError(error.message || 'Could not save the draft.'),
    });

    const publishMutation = useMutation({
        mutationFn: async () => {
            const id = form.id || draftId.current;
            const built = buildDraftPayload(form, { forUpdate: Boolean(id) });
            if (built.error) throw new Error(built.error);
            const savedResponse = id
                ? await api.patch(`/superadmin/announcements/${encodeURIComponent(id)}`, built.payload, token)
                : await api.post('/superadmin/announcements', built.payload, token);
            const saved = savedResponse.data;
            if (!saved?.id) throw new Error('The draft was not saved.');
            draftId.current = saved.id;
            setForm(formFromDetail(saved));
            if (!publishKeys.current.has(saved.id)) publishKeys.current.set(saved.id, newIdempotencyKey());
            const key = publishKeys.current.get(saved.id);
            return api.post(`/superadmin/announcements/${encodeURIComponent(saved.id)}/publish`, {}, token, { 'Idempotency-Key': key });
        },
        onSuccess: (response) => {
            draftId.current = null;
            setPublishResult(response.data || {});
            setFormError('');
            setForm(blankForm());
            queryClient.invalidateQueries({ queryKey: ['announcements'] });
        },
        onError: (error) => setFormError(error.message || 'Publish did not finish. Retry uses the same idempotency key.'),
    });

    const deactivateMutation = useMutation({
        mutationFn: (id) => api.post(`/superadmin/announcements/${encodeURIComponent(id)}/deactivate`, {}, token),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['announcements'] });
            queryClient.invalidateQueries({ queryKey: ['announcement', selectedId] });
        },
    });

    const update = (patch) => setForm((current) => ({ ...current, ...patch }));

    const changeAudience = (next) => {
        const destinations = destinationsForAudience(next);
        update({
            audience: next,
            ctaEnabled: next === 'ALL_CUSTOMERS_AND_VENDORS' ? false : form.ctaEnabled,
            ctaDestination: destinations.includes(form.ctaDestination) ? form.ctaDestination : (destinations[0] || 'HOME'),
        });
    };

    const uploadImage = async (file) => {
        const fileError = validateImageFile(file);
        setUploadError(fileError || '');
        if (fileError) return;
        const width = await readImageWidth(file);
        const widthError = validateImageWidth(width);
        if (widthError) {
            setUploadError(widthError);
            return;
        }
        const body = new FormData();
        body.append('image', file);
        setUploading(true);
        try {
            const response = await api.postForm('/superadmin/announcements/assets', body, token);
            const asset = response.data;
            if (!asset?.id) throw new Error('The upload did not return an image asset id.');
            update({ image: asset });
            setUploadError('');
        } catch (error) {
            setUploadError(error.message || 'Image upload failed.');
        } finally {
            setUploading(false);
        }
    };

    const list = listQuery.data?.data;
    const rows = Array.isArray(list?.data) ? list.data : [];
    const total = Number.isFinite(list?.total) ? list.total : null;
    const limit = list?.limit || 20;
    const pages = total == null ? 1 : Math.max(1, Math.ceil(total / limit));
    const malformedList = listQuery.isSuccess && !Array.isArray(list?.data);
    const preview = previewAnnouncement(form);
    const destinations = destinationsForAudience(form.audience);
    const detail = detailQuery.data?.data;

    return (
        <div className="mx-auto w-full max-w-[1440px] space-y-5 pb-10">
            <section className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-3.5 text-xs leading-5 text-emerald-950">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-800"><Megaphone size={15}/></span>
                <div><p className="font-semibold">Persistent announcements</p>
                <p className="mt-0.5 text-emerald-900/80">Separate from one-off Notifications. Only eligible, non-suspended customers and vendors are included; riders and Super Admins are excluded.</p></div>
            </section>

            <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(300px,360px)]">
                <form className="space-y-5 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5" onSubmit={(event) => { event.preventDefault(); setFormError(''); saveMutation.mutate(); }}>
                    <div className="flex items-start justify-between gap-3 border-b border-zinc-100 pb-4"><div><h2 className="text-base font-bold text-zinc-900">{form.id ? 'Edit draft' : 'Create announcement'}</h2><p className="mt-1 text-xs text-zinc-500">Compose the customer or vendor message and review it before publishing.</p></div>{form.id && <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-800">Draft</span>}</div>
                    <label className="block text-xs font-semibold text-zinc-700">Title<input aria-label="Title" maxLength={LIMITS.title} value={form.title} onChange={(event) => update({ title: event.target.value })} className={fieldClass} /></label>
                    <label className="block text-xs font-semibold text-zinc-700">Summary<input aria-label="Summary" maxLength={LIMITS.summary} value={form.summary} onChange={(event) => update({ summary: event.target.value })} className={fieldClass} /></label>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <label className="block text-xs font-semibold text-zinc-700">Audience<MenuSelect label="Audience" value={form.audience} onChange={changeAudience} options={AUDIENCES.map((value) => ({ value, label: AUDIENCE_LABELS[value] }))} className="mt-1" /></label>
                        <label className="block text-xs font-semibold text-zinc-700">Category<MenuSelect label="Category" value={form.category} onChange={(value) => update({ category: value })} options={CATEGORIES.map((value) => ({ value, label: CATEGORY_LABELS[value] }))} className="mt-1" /></label>
                    </div>

                    <fieldset className="rounded-xl border border-zinc-100 p-3">
                        <legend className="px-1 text-xs font-bold text-zinc-800">Announcement text</legend>
                        <p className="text-[11px] leading-5 text-zinc-500">Structured text only. This is not the notification message, and it is not HTML.</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {[['paragraph', 'Paragraph'], ['heading', 'Heading'], ['bulleted_list', 'Bulleted list'], ['numbered_list', 'Numbered list']].map(([type, label]) => (
                                <button key={type} type="button" onClick={() => update({ blocks: [...form.blocks, emptyBlock(type)] })} className="rounded-full border border-zinc-200 px-3 py-1 text-[11px] font-semibold text-zinc-700">Add {label.toLowerCase()}</button>
                            ))}
                        </div>
                        <div className="mt-3 space-y-3">
                            {form.blocks.map((block, index) => (
                                <div key={index} className="rounded-xl bg-zinc-50 p-3">
                                    <div className="mb-2 flex items-center justify-between">
                                        <p className="text-[11px] font-bold uppercase text-zinc-500">{block.type.replace('_', ' ')}</p>
                                        <button type="button" aria-label={`Remove block ${index + 1}`} onClick={() => update({ blocks: form.blocks.filter((_, item) => item !== index) })} className="text-zinc-400"><X size={14} /></button>
                                    </div>
                                    {block.type === 'heading' && (
                                        <label className="mb-2 block text-[11px] font-semibold text-zinc-600">Level
                                            <MenuSelect label={`Heading level ${index + 1}`} value={block.level} onChange={(value) => update({ blocks: form.blocks.map((item, itemIndex) => itemIndex === index ? { ...item, level: Number(value) } : item) })} options={[{ value: 1, label: 'Heading 1' }, { value: 2, label: 'Heading 2' }]} className="mt-1" />
                                        </label>
                                    )}
                                    {block.type === 'bulleted_list' || block.type === 'numbered_list' ? (
                                        <div className="space-y-2">
                                            {block.items.map((item, itemIndex) => (
                                                <input key={itemIndex} aria-label={`List item ${index + 1}.${itemIndex + 1}`} value={item} maxLength={LIMITS.spanText} onChange={(event) => update({ blocks: form.blocks.map((entry, entryIndex) => entryIndex === index ? { ...entry, items: entry.items.map((value, valueIndex) => valueIndex === itemIndex ? event.target.value : value) } : entry) })} className={fieldClass} />
                                            ))}
                                            <button type="button" onClick={() => update({ blocks: form.blocks.map((entry, entryIndex) => entryIndex === index ? { ...entry, items: [...entry.items, ''] } : entry) })} className="text-[11px] font-semibold text-emerald-800">Add list item</button>
                                        </div>
                                    ) : (
                                        <>
                                            <textarea aria-label={`Block text ${index + 1}`} value={block.text} maxLength={LIMITS.spanText} rows={3} onChange={(event) => update({ blocks: form.blocks.map((item, itemIndex) => itemIndex === index ? { ...item, text: event.target.value } : item) })} className={fieldClass} />
                                            <div className="mt-2 flex flex-wrap gap-3 text-[11px]">
                                                <label><input type="checkbox" checked={Boolean(block.bold)} onChange={(event) => update({ blocks: form.blocks.map((item, itemIndex) => itemIndex === index ? { ...item, bold: event.target.checked } : item) })} /> Bold</label>
                                                <label><input type="checkbox" checked={Boolean(block.italic)} onChange={(event) => update({ blocks: form.blocks.map((item, itemIndex) => itemIndex === index ? { ...item, italic: event.target.checked } : item) })} /> Italic</label>
                                            </div>
                                            <label className="mt-2 block text-[11px] font-semibold text-zinc-600">HTTPS link<input aria-label={`Block link ${index + 1}`} value={block.link} onChange={(event) => update({ blocks: form.blocks.map((item, itemIndex) => itemIndex === index ? { ...item, link: event.target.value } : item) })} className={fieldClass} placeholder="https://" /></label>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </fieldset>

                    <fieldset className="rounded-xl border border-zinc-100 p-3">
                        <legend className="px-1 text-xs font-bold text-zinc-800">Flyer image</legend>
                        <p className="text-[11px] leading-5 text-zinc-500">JPEG, PNG, or WebP. Maximum 1 MB and 1600 pixels wide. The server asset id is stored with the draft.</p>
                        <input ref={imageInputRef} aria-label="Flyer image" type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; setSelectedFileName(file?.name || ''); uploadImage(file); }} />
                        <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-zinc-300 bg-zinc-50/70 p-3">
                            <button type="button" disabled={uploading} onClick={() => imageInputRef.current?.click()} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3.5 text-xs font-semibold text-zinc-800 shadow-sm transition hover:border-emerald-300 hover:text-emerald-800 disabled:opacity-50"><ImagePlus size={15} />{form.image ? 'Replace flyer' : 'Choose flyer'}</button>
                            <span className="min-w-0 flex-1 truncate text-xs text-zinc-500">{uploading ? 'Uploading flyer…' : (selectedFileName || (form.image ? `Uploaded image · ${form.image.width} × ${form.image.height}px` : 'No image selected'))}</span>
                        </div>
                        {uploadError && <p role="alert" className="mt-2 text-xs text-rose-700">{uploadError}</p>}
                        {form.image && (
                            <div className="mt-2 flex items-center justify-between gap-3">
                                <p className="text-xs text-zinc-600">Asset {form.image.id} · {form.image.width}×{form.image.height}</p>
                                <button type="button" onClick={() => { update({ image: null, imageAltText: '' }); setSelectedFileName(''); if (imageInputRef.current) imageInputRef.current.value = ''; }} className="text-xs font-semibold text-rose-700">Remove image</button>
                            </div>
                        )}
                        <label className="mt-2 block text-xs font-semibold text-zinc-700">Alt text<input aria-label="Image alt text" maxLength={LIMITS.alt} value={form.imageAltText} onChange={(event) => update({ imageAltText: event.target.value })} className={fieldClass} /></label>
                    </fieldset>

                    <fieldset className="rounded-xl border border-zinc-100 p-3">
                        <legend className="px-1 text-xs font-bold text-zinc-800">Call to action</legend>
                        {form.audience === 'ALL_CUSTOMERS_AND_VENDORS' ? (
                            <p className="text-[11px] leading-5 text-zinc-600">A call to action is not supported when the audience is customers and vendors together. Choose Customers or Vendors if this broadcast needs a destination.</p>
                        ) : (
                            <>
                        <Switch checked={form.ctaEnabled} onChange={(checked) => update({ ctaEnabled: checked })} label="Add a call to action" />
                                {form.ctaEnabled && (
                                    <div className="mt-2 grid gap-2">
                                        <input aria-label="Call to action label" maxLength={LIMITS.ctaLabel} value={form.ctaLabel} onChange={(event) => update({ ctaLabel: event.target.value })} className={fieldClass} placeholder="Button label" />
                                        <MenuSelect label="Call to action destination" value={form.ctaDestination} onChange={(value) => update({ ctaDestination: value })} options={destinations.map((value) => ({ value, label: value.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase()) }))} />
                                        {(form.ctaDestination === 'STORE' || form.ctaDestination === 'PRODUCT') && <input aria-label="Vendor id" value={form.vendorId} onChange={(event) => update({ vendorId: event.target.value })} className={fieldClass} placeholder="Vendor id" />}
                                        {form.ctaDestination === 'PRODUCT' && <input aria-label="Product id" value={form.productId} onChange={(event) => update({ productId: event.target.value })} className={fieldClass} placeholder="Product id" />}
                                    </div>
                                )}
                            </>
                        )}
                    </fieldset>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <label className="block text-xs font-semibold text-zinc-700">Priority<input aria-label="Priority" type="text" inputMode="numeric" maxLength={3} value={form.priority} onChange={(event) => update({ priority: event.target.value === '' ? '' : Number(event.target.value.replace(/\D/g, '')) })} className={fieldClass} /></label>
                        <div><span className="mb-1.5 block text-xs font-semibold text-zinc-700">Ends at</span><div className="flex gap-2"><CalendarPicker value={form.endsAt?.slice(0, 10) || ''} onChange={(date) => update({ endsAt: `${date}T${form.endsAt?.slice(11, 16) || '23:59'}` })} />{form.endsAt && <MenuSelect label="End time" value={form.endsAt.slice(11, 16) || '23:59'} onChange={(time) => update({ endsAt: `${form.endsAt.slice(0, 10)}T${time}` })} options={Array.from({ length: 48 }, (_, index) => { const hour = String(Math.floor(index / 2)).padStart(2, '0'); const minute = index % 2 ? '30' : '00'; return { value: `${hour}:${minute}`, label: `${hour}:${minute}` }; })} className="min-w-28 flex-1" />}{form.endsAt && <button type="button" aria-label="Clear end date" onClick={() => update({ endsAt: '' })} className="rounded-xl border border-zinc-200 px-3 text-xs font-semibold text-zinc-500 hover:bg-zinc-50">Clear</button>}</div><p className="mt-1 text-[10px] text-zinc-500">Optional. Uses your local time.</p></div>
                    </div>
                    <Switch checked={form.dismissible} onChange={(checked) => update({ dismissible: checked })} label="Allow users to dismiss" description="Users can hide this announcement from their app." />
                    <Switch checked={form.pushEnabled} onChange={(checked) => update({ pushEnabled: checked })} label="Queue a push notification" description="Queues a push for eligible accounts at publish time; it does not confirm delivery." />
                    {form.pushEnabled && <label className="block text-xs font-semibold text-zinc-700">Push preview<input aria-label="Push preview" maxLength={LIMITS.pushPreview} value={form.pushPreview} onChange={(event) => update({ pushPreview: event.target.value })} className={fieldClass} placeholder="Optional. The summary is used when this is empty." /></label>}
                    <p className="text-[11px] leading-5 text-zinc-500">Publish is immediate. There is no schedule. The recipient count is the audience snapshot at publish time, not the number of people who can see it later. A queued push is not a delivered push.</p>
                    {formError && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-xs text-rose-700">{formError}</p>}
                    {publishResult && (
                        <div className="rounded-xl bg-emerald-50 p-3 text-xs leading-5 text-emerald-950">
                            <p className="font-semibold">Publish accepted</p>
                            <p>Status {publishResult.status || 'PUBLISHED'}. Snapshot recipients: {Number.isFinite(publishResult.recipientCount) ? publishResult.recipientCount : 'Not recorded'}.</p>
                            <p>{publishResult.pushQueued ? 'Push work was queued. That is not device delivery.' : 'No push work was queued.'} {publishResult.recipientCount === 0 ? 'A zero-recipient campaign does not queue a push.' : ''}</p>
                            {publishResult.note && <p>{publishResult.note}</p>}
                            {publishResult.duplicate && <p>This publish was already accepted.</p>}
                        </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                        <button type="submit" disabled={saveMutation.isPending || publishMutation.isPending} className="rounded-xl border border-zinc-200 px-4 py-2.5 text-xs font-bold text-zinc-800 disabled:opacity-50">{saveMutation.isPending ? 'Saving...' : 'Save draft'}</button>
                        <button type="button" disabled={publishMutation.isPending || saveMutation.isPending || uploading} onClick={() => { setFormError(''); publishMutation.mutate(); }} className="rounded-xl bg-emerald-800 px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50">{publishMutation.isPending ? 'Publishing...' : 'Publish'}</button>
                    </div>
                </form>

                <aside className="sticky top-4 self-start rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-3"><div><h2 className="text-sm font-bold text-zinc-900">Preview</h2><p className="mt-0.5 text-[10px] text-zinc-500">As shown in the customer or vendor app.</p></div><span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[9px] font-bold text-zinc-600">{AUDIENCE_LABELS[form.audience]}</span></div>
                    <div className="mt-3 rounded-xl border border-zinc-100 bg-zinc-50 p-3">
                        <AnnouncementDetailView announcement={preview} role={form.audience === 'VENDORS' ? 'VENDOR' : 'USER'} />
                    </div>
                    {!form.blocks.length && !form.image && <p className="mt-3 text-center text-[10px] text-zinc-400">Your text or flyer preview will appear here.</p>}
                </aside>
            </div>

            <section className="rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h2 className="text-base font-bold text-zinc-900">Campaign history</h2>
                        <p className="mt-1 text-xs text-zinc-500">Drafts, published campaigns, and deactivated campaigns. A deactivated announcement cannot be published again.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <input aria-label="Search announcements" maxLength={LIMITS.query} value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search title or summary" className="min-h-10 min-w-[220px] flex-1 rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs outline-none transition placeholder:text-zinc-400 focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10" />
                        <MenuSelect label="Status filter" value={status} onChange={(value) => { setStatus(value); setPage(1); }} options={[{ value: '', label: 'All statuses' }, ...STATUSES.map((value) => ({ value, label: STATUS_LABELS[value] }))]} className="min-w-36" />
                        <MenuSelect label="History audience" value={audience} onChange={(value) => { setAudience(value); setPage(1); }} options={[{ value: '', label: 'All audiences' }, ...AUDIENCES.map((value) => ({ value, label: AUDIENCE_LABELS[value] }))]} className="min-w-44" />
                    </div>
                </div>
                {listQuery.isLoading ? <div className="flex justify-center py-10"><Loader2 className="animate-spin text-emerald-700" /></div> : listQuery.isError ? (
                    <div role="alert" className="mt-4 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{listQuery.error.message || 'Could not load announcements.'} <button type="button" onClick={() => listQuery.refetch()} className="font-bold underline">Retry</button></div>
                ) : malformedList ? (
                    <p role="alert" className="mt-4 text-sm text-rose-700">The announcement list was not in the expected shape.</p>
                ) : rows.length === 0 ? (
                    <p className="mt-6 text-center text-sm text-zinc-500">{query || status || audience ? 'No announcements match these filters.' : 'No announcements yet.'}</p>
                ) : (
                    <div className="mt-4 overflow-x-auto">
                        <table className="w-full min-w-[760px] text-left">
                            <thead><tr>{['Title', 'Audience', 'Status', 'Snapshot recipients', 'Published'].map((heading) => <th key={heading} className="px-3 py-2 text-[10px] font-bold uppercase text-zinc-400">{heading}</th>)}</tr></thead>
                            <tbody>
                                {rows.map((row) => (
                                    <tr key={row.id} className="border-t border-zinc-100">
                                        <td className="px-3 py-3 text-xs font-semibold text-zinc-900">{row.title}</td>
                                        <td className="px-3 py-3 text-xs text-zinc-600">{AUDIENCE_LABELS[row.audience] || row.audience}</td>
                                        <td className="px-3 py-3 text-xs text-zinc-700">{STATUS_LABELS[row.status] || row.status}</td>
                                        <td className="px-3 py-3 text-xs text-zinc-700">{Number.isFinite(row.recipientCount) ? row.recipientCount : 'Not recorded'}</td>
                                        <td className="whitespace-nowrap px-3 py-3 text-xs text-zinc-500">{row.publishedAt ? formatDateTime(row.publishedAt) : 'Not published'}</td>
                                        <td className="px-3 py-3 text-right"><button type="button" onClick={() => setSelectedId(row.id)} className="text-xs font-bold text-emerald-800">View</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
                            <span>{total == null ? '' : `${total} announcements`}</span>
                            <div className="flex gap-2">
                                <button type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)} className="rounded-lg border px-3 py-1 disabled:opacity-40">Previous</button>
                                <span>Page {page} of {pages}</span>
                                <button type="button" disabled={page >= pages} onClick={() => setPage((current) => current + 1)} className="rounded-lg border px-3 py-1 disabled:opacity-40">Next</button>
                            </div>
                        </div>
                    </div>
                )}
            </section>

            {selectedId && (
                <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
                    <aside role="dialog" aria-label="Announcement campaign" className="flex h-full w-full max-w-lg flex-col overflow-hidden bg-white shadow-2xl">
                        <header className="flex shrink-0 items-center justify-between border-b border-slate-800 bg-slate-900 px-5 py-4">
                            <div className="min-w-0"><h2 className="text-lg font-bold text-white">Campaign</h2>{detail && <p className="mt-1 truncate text-xs text-slate-300">{STATUS_LABELS[detail.status] || detail.status} Â· {AUDIENCE_LABELS[detail.audience] || detail.audience}</p>}</div>
                            <button type="button" aria-label="Close campaign" onClick={() => setSelectedId(null)} className="rounded-lg p-2 text-slate-300 hover:bg-slate-800 hover:text-white"><X /></button>
                        </header>
                        <div className="min-h-0 flex-1 overflow-y-auto p-5">
                        {detailQuery.isLoading ? <div className="flex justify-center py-10"><Loader2 className="animate-spin text-emerald-700" /></div> : detailQuery.isError ? (
                            <div role="alert" className="mt-4 text-sm text-rose-700">{detailQuery.error.status === 404 ? 'Announcement not found.' : detailQuery.error.message || 'Could not load this announcement.'} <button type="button" onClick={() => detailQuery.refetch()} className="font-bold underline">Retry</button></div>
                        ) : detail ? (
                            <div className="mt-4 space-y-4">
                                <p className="text-xs text-zinc-500">{STATUS_LABELS[detail.status] || detail.status} · {AUDIENCE_LABELS[detail.audience] || detail.audience}</p>
                                <p className="text-sm text-zinc-700">Snapshot recipients: {Number.isFinite(detail.recipientCount) ? detail.recipientCount : 'Not recorded'}. This is not the live audience. Eligible accounts who join later can still see an active announcement, and they do not get a catch-up push.</p>
                                <AnnouncementDetailView announcement={{ ...detail, image: detail.image }} role={detail.audience === 'VENDORS' ? 'VENDOR' : 'USER'} />
                                <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
                                    <header className="flex flex-wrap items-center justify-between gap-2 bg-[#0F172B] px-4 py-3.5 text-white">
                                        <div><p className="text-[9px] font-bold uppercase tracking-wider text-emerald-300">Delivery summary</p><h3 className="mt-0.5 text-sm font-bold">Push delivery results</h3></div>
                                        <span className="rounded-full bg-white/10 px-2.5 py-1 text-[9px] font-semibold text-slate-200">Counts are per account</span>
                                    </header>
                                    <div className="p-4">
                                        <p className="mb-3 rounded-xl border border-blue-100 bg-blue-50 p-3 text-[11px] leading-5 text-blue-950"><span className="font-bold">In simple words:</span> these numbers show what happened while trying to send the push. “Accepted” means the push service took the message for at least one device—it does not mean the person saw it. Turning a campaign off cannot take back a push already accepted.</p>
                                        {detail.pushCounts ? (
                                            <dl className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                                                {PUSH_COUNT_FIELDS.map(([key, label]) => (
                                                    <div key={key} className={`min-w-0 rounded-xl border p-3.5 ${pushCountExplanations[key]?.tone || 'border-zinc-200 bg-zinc-50'}`}>
                                                        <div className="flex items-start justify-between gap-3"><dt className="text-[10px] font-bold uppercase tracking-wide text-zinc-600">{label}</dt><dd className="shrink-0 text-xl font-bold leading-none text-zinc-900">{Number.isFinite(detail.pushCounts[key]) ? detail.pushCounts[key] : '—'}</dd></div>
                                                        <p className="mt-2 text-[11px] leading-5 text-zinc-700">{pushCountExplanations[key]?.text || 'The push send is in this status.'}</p>
                                                    </div>
                                                ))}
                                            </dl>
                                        ) : <p className="rounded-xl bg-zinc-50 p-4 text-xs text-zinc-500">Push counts were not included for this campaign.</p>}
                                    </div>
                                </section>
                                {detail.status === 'DRAFT' && <button type="button" onClick={() => { setForm(formFromDetail(detail)); setSelectedId(null); }} className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-bold">Edit draft</button>}
                                {detail.status === 'PUBLISHED' && <button type="button" disabled={deactivateMutation.isPending} onClick={() => deactivateMutation.mutate(detail.id)} className="rounded-xl bg-zinc-900 px-4 py-2 text-xs font-bold text-white disabled:opacity-50">{deactivateMutation.isPending ? 'Deactivating...' : 'Deactivate'}</button>}
                                {detail.status === 'DEACTIVATED' && <p className="text-xs text-zinc-600">This announcement cannot be published again. Create a new broadcast instead.</p>}
                                {deactivateMutation.isError && <p role="alert" className="text-xs text-rose-700">{deactivateMutation.error.message}</p>}
                            </div>
                        ) : null}
                        </div>
                    </aside>
                </div>
            )}
        </div>
    );
};

export default Broadcast;
