import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, ChevronDown, ChevronLeft, Image as ImageIcon, Loader2, Pencil, Plus, Search, Store, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../api/api';
import { useAuthStore } from '../../store/useAuthStore';
import { getPromotionError, validatePromotionTitle } from '../../utils/promotionAdminUtils';

const PROMOTIONS = '/superadmin/promotions';

const Toggle = ({ checked, onChange, label, disabled = false }) => (
    <button type="button" role="switch" aria-label={label} aria-checked={checked} disabled={disabled} onClick={onChange} className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:opacity-50 ${checked ? 'bg-emerald-700' : 'bg-zinc-300'}`}>
        <span className={`pointer-events-none h-5 w-5 rounded-full bg-white shadow-sm ring-1 ring-black/5 transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
);

const Drawer = ({ title, subtitle, onClose, children, footer, zIndex = 80, darkHeader = false }) => (
    <div className="fixed inset-0" style={{ zIndex }}>
        <button type="button" aria-label="Close panel" className="absolute inset-0 bg-black/45 backdrop-blur-[1px]" onClick={onClose} />
        <section className="absolute inset-y-0 right-0 flex w-full max-w-[560px] flex-col bg-white shadow-2xl">
            <header className={`flex shrink-0 items-center justify-between border-b px-5 py-4 md:px-6 ${darkHeader ? 'border-slate-800 bg-slate-900 text-white' : 'border-zinc-100 bg-white'}`}>
                <div className="min-w-0">
                    {subtitle && <p className={`text-[10px] font-semibold uppercase tracking-wider ${darkHeader ? 'text-emerald-300' : 'text-zinc-400'}`}>{subtitle}</p>}
                    <h2 className={`truncate text-lg font-bold ${darkHeader ? 'text-white' : 'text-zinc-900'}`}>{title}</h2>
                </div>
                <button type="button" aria-label="Close" onClick={onClose} className={`rounded-lg p-2 ${darkHeader ? 'text-slate-300 hover:bg-slate-800 hover:text-white' : 'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700'}`}><X size={20} /></button>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-5">{children}</div>
            {footer && <footer className="shrink-0 border-t border-zinc-100 bg-white p-4 md:px-5">{footer}</footer>}
        </section>
    </div>
);

const ConfirmDialog = ({ title, message, confirmLabel, pending, onCancel, onConfirm }) => (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        <button type="button" aria-label="Close confirmation" onClick={onCancel} className="absolute inset-0 bg-black/45 backdrop-blur-[1px]" />
        <section role="alertdialog" aria-modal="true" className="relative w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600"><Trash2 size={21} /></div>
            <h3 className="mt-4 text-base font-bold text-zinc-900">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-zinc-500">{message}</p>
            <div className="mt-6 flex gap-3">
                <button type="button" disabled={pending} onClick={onCancel} className="flex-1 rounded-xl bg-zinc-100 px-4 py-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-200 disabled:opacity-50">Cancel</button>
                <button type="button" disabled={pending} onClick={onConfirm} className="flex-1 rounded-xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50">{pending ? 'Removing…' : confirmLabel}</button>
            </div>
        </section>
    </div>
);

const FormField = ({ id, label, error, children }) => (
    <div>
        <label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-zinc-700">{label}</label>
        {children}
        {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
);

const StyledSelect = ({ id, value, onChange, options, placeholder, disabled = false, loading = false }) => {
    const [open, setOpen] = useState(false);
    const rootRef = useRef(null);
    const selected = options.find((option) => option.value === value);

    useEffect(() => {
        const closeOnOutsideClick = (event) => {
            if (!rootRef.current?.contains(event.target)) setOpen(false);
        };
        const closeOnEscape = (event) => {
            if (event.key === 'Escape') setOpen(false);
        };
        document.addEventListener('mousedown', closeOnOutsideClick);
        document.addEventListener('keydown', closeOnEscape);
        return () => {
            document.removeEventListener('mousedown', closeOnOutsideClick);
            document.removeEventListener('keydown', closeOnEscape);
        };
    }, []);

    return <div ref={rootRef} className="relative">
        <button
            id={id}
            type="button"
            aria-haspopup="listbox"
            aria-expanded={open}
            disabled={disabled || loading}
            onClick={() => setOpen((current) => !current)}
            className={`flex h-[50px] w-full items-center justify-between rounded-xl border border-zinc-200 bg-white px-3.5 text-left text-sm shadow-sm outline-none transition hover:border-zinc-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400 ${selected ? 'text-zinc-900' : 'text-zinc-400'}`}
        >
            <span className="truncate">{loading ? 'Loading options…' : selected?.label || placeholder}</span>
            <ChevronDown size={17} strokeWidth={1.8} className={`ml-3 shrink-0 text-zinc-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && !disabled && !loading && <div role="listbox" aria-labelledby={id} className="absolute z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-zinc-200 bg-white p-1.5 shadow-xl">
            {options.length ? options.map((option) => <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={value === option.value}
                onClick={() => { onChange(option.value); setOpen(false); }}
                className={`w-full rounded-lg px-3 py-2.5 text-left text-sm transition ${value === option.value ? 'bg-emerald-50 font-semibold text-emerald-900' : 'text-zinc-700 hover:bg-zinc-50'}`}
            >{option.label}</button>) : <p className="px-3 py-2.5 text-sm text-zinc-500">No options available</p>}
        </div>}
    </div>;
};

const inputClass = 'w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-3 text-sm text-zinc-900 outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-100 disabled:opacity-50';
const LIST_PREVIEW = 3;
const LIST_STEP = 5;

function ListToggle({ label, shown, total, onMore, onLess }) {
    const more = shown < total;
    const less = shown > LIST_PREVIEW;
    if (!more && !less) return null;
    return (
        <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-[10px] text-zinc-400">Showing {Math.min(shown, total)} of {total}</p>
            <div className="flex gap-3">
                {less && <button type="button" aria-label={`View less ${label}`} onClick={onLess} className="text-[11px] font-semibold text-zinc-500 underline">View less</button>}
                {more && <button type="button" aria-label={`View more ${label}`} onClick={onMore} className="text-[11px] font-semibold text-emerald-800 underline">View more</button>}
            </div>
        </div>
    );
}

const Promotions = () => {
    const token = useAuthStore((state) => state.accessToken);
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [selectedId, setSelectedId] = useState(null);
    const [showCreate, setShowCreate] = useState(false);
    const [title, setTitle] = useState('');
    const [titleValidationError, setTitleValidationError] = useState('');
    const [renameTarget, setRenameTarget] = useState(null);
    const [renameValue, setRenameValue] = useState('');
    const [confirmTarget, setConfirmTarget] = useState(null);
    const [showAddProduct, setShowAddProduct] = useState(false);
    const [promotionVisible, setPromotionVisible] = useState(LIST_PREVIEW);

    const promotionsQuery = useQuery({ queryKey: ['admin-promotions'], queryFn: () => api.get(PROMOTIONS, token) });
    const promotionList = promotionsQuery.data?.data?.promotions ?? [];
    const selectedPromotion = promotionList.find((promotion) => promotion.id === selectedId);
    const detailsQuery = useQuery({
        queryKey: ['admin-promotion', selectedId],
        queryFn: () => api.get(`${PROMOTIONS}/${encodeURIComponent(selectedId)}`, token),
        enabled: Boolean(selectedId),
    });
    const details = detailsQuery.data?.data?.promotion;

    const refreshAll = async (promotionId = selectedId) => {
        await queryClient.invalidateQueries({ queryKey: ['admin-promotions'] });
        if (promotionId) await queryClient.invalidateQueries({ queryKey: ['admin-promotion', promotionId] });
    };

    const createMutation = useMutation({
        mutationFn: (payload) => api.post(PROMOTIONS, payload, token),
        onSuccess: async (response) => {
            toast.success(response?.message || 'Promotion created.');
            setShowCreate(false);
            setTitle('');
            setTitleValidationError('');
            await refreshAll(null);
        },
        onError: (error) => toast.error(error.status === 409 ? 'A promotion with this title already exists.' : getPromotionError(error, 'Could not create promotion.')),
    });

    const renameMutation = useMutation({
        mutationFn: ({ id, title: nextTitle }) => api.patch(`${PROMOTIONS}/${encodeURIComponent(id)}`, { title: nextTitle }, token),
        onSuccess: async (response) => {
            toast.success(response?.message || 'Promotion renamed.');
            setRenameTarget(null);
            await refreshAll();
        },
        onError: (error) => toast.error(error.status === 409 ? 'A promotion with this title already exists.' : getPromotionError(error, 'Could not rename promotion.')),
    });

    const statusMutation = useMutation({
        mutationFn: ({ id, isActive }) => api.patch(`${PROMOTIONS}/${encodeURIComponent(id)}/status`, { isActive }, token),
        onSuccess: async (response) => {
            toast.success(response?.message || 'Promotion status updated.');
            await refreshAll();
        },
        onError: (error) => toast.error(getPromotionError(error, 'Could not update promotion status.')),
    });

    const deletePromotionMutation = useMutation({
        mutationFn: (id) => api.delete(`${PROMOTIONS}/${encodeURIComponent(id)}`, undefined, token),
        onSuccess: async (response, id) => {
            toast.success(response?.message || 'Promotion deleted.');
            setConfirmTarget(null);
            if (selectedId === id) setSelectedId(null);
            await refreshAll(null);
        },
        onError: (error) => toast.error(getPromotionError(error, 'Could not delete promotion.')),
    });

    const handleCreate = (event) => {
        event.preventDefault();
        const validationError = validatePromotionTitle(title);
        setTitleValidationError(validationError);
        if (validationError) return;
        createMutation.mutate({ title: title.trim(), isActive: true });
    };

    const filteredPromotions = promotionList.filter((promotion) => promotion.title.toLowerCase().includes(search.toLowerCase().trim()));
    const visiblePromotions = filteredPromotions.slice(0, promotionVisible);

    useEffect(() => {
        setPromotionVisible(LIST_PREVIEW);
    }, [search]);

    return (
        <div className="mx-auto flex min-h-[calc(100vh-150px)] max-w-[1600px] flex-col gap-5 pb-4">
            <section className="flex flex-1 flex-col rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm md:p-5">
                <div className="mb-4 flex justify-end border-b border-zinc-100 pb-4">
                    <label className="relative block w-full sm:max-w-xs">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search promotions" className={`${inputClass} pl-9`} />
                    </label>
                </div>

                {promotionsQuery.isLoading ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-3 text-sm text-zinc-500"><Loader2 className="animate-spin text-emerald-700" size={26} />Loading promotions…</div>
                ) : promotionsQuery.isError ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center"><AlertCircle size={25} className="text-rose-500" /><p className="max-w-md text-sm text-zinc-600">{promotionsQuery.error.status === 401 ? 'Your admin session has expired. Please sign in again.' : promotionsQuery.error.status === 429 ? 'Too many requests. Please wait a moment and try again.' : promotionsQuery.error.status === 503 ? 'Promotion data is temporarily unavailable.' : promotionsQuery.error.message || 'Could not load promotions.'}</p><button type="button" onClick={() => promotionsQuery.refetch()} className="rounded-xl bg-zinc-900 px-4 py-2.5 text-xs font-bold text-white">Retry</button></div>
                ) : !filteredPromotions.length ? (
                    <div className="flex flex-1 flex-col items-center justify-center py-14 text-center"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500"><Store size={20} /></div><p className="mt-3 text-sm font-semibold text-zinc-800">{search ? 'No promotions match your search' : 'No promotions yet'}</p><p className="mt-1 text-xs text-zinc-500">{search ? 'Try another title.' : 'Add a promotion section to start featuring products.'}</p></div>
                ) : (
                    <div className="space-y-2">
                        {visiblePromotions.map((promotion) => (
                            <article key={promotion.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-zinc-100 bg-zinc-50/70 px-4 py-3 transition hover:border-zinc-200 hover:bg-zinc-50 sm:flex-nowrap">
                                <button type="button" onClick={() => { setSelectedId(promotion.id); setShowAddProduct(false); }} className="min-w-0 flex-1 cursor-pointer text-left">
                                    <span className="block truncate text-sm font-semibold text-zinc-900">{promotion.title}</span>
                                    <span className="mt-0.5 block text-[11px] text-zinc-500">{promotion.activePlacementCount ?? 0} active product{promotion.activePlacementCount === 1 ? '' : 's'} · {promotion.placementCount ?? 0} total</span>
                                </button>
                                <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${promotion.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-200 text-zinc-600'}`}>{promotion.isActive ? 'Active' : 'Inactive'}</span>
                                <Toggle checked={Boolean(promotion.isActive)} label={`${promotion.isActive ? 'Deactivate' : 'Activate'} ${promotion.title}`} disabled={statusMutation.isPending} onChange={() => statusMutation.mutate({ id: promotion.id, isActive: !promotion.isActive })} />
                                <button type="button" aria-label={`Rename ${promotion.title}`} onClick={() => { setRenameTarget(promotion); setRenameValue(promotion.title); }} className="rounded-lg p-2 text-emerald-700 transition hover:bg-emerald-50 hover:text-emerald-800"><Pencil size={15} /></button>
                                <button type="button" aria-label={`Delete ${promotion.title}`} onClick={() => setConfirmTarget({ kind: 'promotion', id: promotion.id, title: promotion.title })} className="rounded-lg p-2 text-rose-600 transition hover:bg-rose-50 hover:text-rose-700"><Trash2 size={16} /></button>
                            </article>
                        ))}
                        <ListToggle label="promotions" shown={visiblePromotions.length} total={filteredPromotions.length} onMore={() => setPromotionVisible((count) => count + LIST_STEP)} onLess={() => setPromotionVisible(LIST_PREVIEW)} />
                    </div>
                )}

                <button type="button" onClick={() => { setTitle(''); setTitleValidationError(''); setShowCreate(true); }} className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#1C5E20] px-4 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-[#174D1A]"><Plus size={16} />Add New Promotion</button>
            </section>

            {showCreate && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <button type="button" aria-label="Close" onClick={() => setShowCreate(false)} className="absolute inset-0 bg-black/45" />
                    <form onSubmit={handleCreate} className="relative w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
                        <div className="mb-5 flex items-center justify-between"><h2 className="text-base font-bold text-zinc-900">New Promotion</h2><button type="button" aria-label="Close" onClick={() => setShowCreate(false)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100"><X size={18} /></button></div>
                        <FormField id="create-promotion-title" label="Promotion title" error={titleValidationError}><input id="create-promotion-title" autoFocus maxLength={40} value={title} onChange={(event) => { setTitle(event.target.value); setTitleValidationError(''); }} placeholder="Enter promotion title" className={inputClass} /></FormField>
                        {createMutation.isError && <p role="alert" className="mt-3 text-xs text-rose-600">{createMutation.error.status === 409 ? 'A promotion with this title already exists.' : createMutation.error.message || 'Could not create promotion.'}</p>}
                        <button type="submit" disabled={createMutation.isPending} className="mt-5 w-full rounded-full bg-[#1C5E20] px-4 py-3 text-xs font-bold text-white disabled:opacity-60">{createMutation.isPending ? 'Adding…' : 'Add'}</button>
                    </form>
                </div>
            )}

            {renameTarget && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <button type="button" aria-label="Close" onClick={() => setRenameTarget(null)} className="absolute inset-0 bg-black/45" />
                    <form onSubmit={(event) => { event.preventDefault(); const validationError = validatePromotionTitle(renameValue); if (validationError) { setTitleValidationError(validationError); return; } renameMutation.mutate({ id: renameTarget.id, title: renameValue.trim() }); }} className="relative w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
                        <div className="mb-5 flex items-center justify-between"><h2 className="text-base font-bold text-zinc-900">Rename Promotion</h2><button type="button" aria-label="Close" onClick={() => setRenameTarget(null)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100"><X size={18} /></button></div>
                        <FormField id="rename-promotion-title" label="Promotion title" error={titleValidationError}><input id="rename-promotion-title" autoFocus maxLength={40} value={renameValue} onChange={(event) => { setRenameValue(event.target.value); setTitleValidationError(''); }} className={inputClass} /></FormField>
                        {renameMutation.isError && <p role="alert" className="mt-3 text-xs text-rose-600">{renameMutation.error.status === 409 ? 'A promotion with this title already exists.' : renameMutation.error.message || 'Could not rename promotion.'}</p>}
                        <button type="submit" disabled={renameMutation.isPending} className="mt-5 w-full rounded-full bg-[#1C5E20] px-4 py-3 text-xs font-bold text-white disabled:opacity-60">{renameMutation.isPending ? 'Saving…' : 'Save changes'}</button>
                    </form>
                </div>
            )}

            {selectedId && (
                <PromotionDetailDrawer
                    promotion={selectedPromotion}
                    promotionId={selectedId}
                    details={details}
                    query={detailsQuery}
                    token={token}
                    onClose={() => { setSelectedId(null); setShowAddProduct(false); }}
                    onRefresh={refreshAll}
                    showAddProduct={showAddProduct}
                    setShowAddProduct={setShowAddProduct}
                />
            )}

            {confirmTarget && (
                <ConfirmDialog
                    title={confirmTarget.kind === 'promotion' ? 'Delete promotion?' : 'Remove product?'}
                    message={confirmTarget.kind === 'promotion' ? `“${confirmTarget.title}” and its placements will be removed. Catalog products will not be deleted.` : `Remove “${confirmTarget.title}” from this promotion? The catalog product will remain unchanged.`}
                    confirmLabel={confirmTarget.kind === 'promotion' ? 'Delete' : 'Remove'}
                    pending={deletePromotionMutation.isPending}
                    onCancel={() => setConfirmTarget(null)}
                    onConfirm={() => deletePromotionMutation.mutate(confirmTarget.id)}
                />
            )}
        </div>
    );
};

const PromotionDetailDrawer = ({ promotion, promotionId, details, query, token, onClose, onRefresh, showAddProduct, setShowAddProduct }) => {
    const [activePlacementMutationId, setActivePlacementMutationId] = useState(null);
    const [removeTarget, setRemoveTarget] = useState(null);
    const [removeError, setRemoveError] = useState('');
    const [productVisible, setProductVisible] = useState(LIST_PREVIEW);
    const placementStatusMutation = useMutation({
        mutationFn: ({ placementId, isActive }) => api.patch(`${PROMOTIONS}/${encodeURIComponent(promotionId)}/placements/${encodeURIComponent(placementId)}/status`, { isActive }, token),
        onSuccess: async (response) => {
            toast.success(response?.message || 'Product visibility updated.');
            await onRefresh(promotionId);
            setActivePlacementMutationId(null);
        },
        onError: (error) => { toast.error(getPromotionError(error, 'Could not update product visibility.')); setActivePlacementMutationId(null); },
    });
    const removePlacementMutation = useMutation({
        mutationFn: (placementId) => api.delete(`${PROMOTIONS}/${encodeURIComponent(promotionId)}/placements/${encodeURIComponent(placementId)}`, undefined, token),
        onSuccess: async (response) => {
            toast.success(response?.message || 'Product removed from promotion.');
            setRemoveTarget(null);
            setRemoveError('');
            await onRefresh(promotionId);
        },
        onError: (error) => { const message = getPromotionError(error, 'Could not remove product.'); setRemoveError(message); toast.error(message); },
    });

    const currentPromotion = details || promotion;
    const placements = details?.placements ?? [];
    const visiblePlacements = placements.slice(0, productVisible);

    useEffect(() => {
        setProductVisible(LIST_PREVIEW);
    }, [promotionId]);

    return (
        <>
            <Drawer title={currentPromotion?.title || 'Promotion'} subtitle="Promotions" onClose={onClose} darkHeader footer={<button type="button" onClick={() => setShowAddProduct(true)} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#1C5E20] px-4 py-3 text-xs font-bold text-white hover:bg-[#174D1A]"><Plus size={15} />Add Product</button>}>
                {query.isLoading ? <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-zinc-500"><Loader2 size={20} className="animate-spin" />Loading promotion…</div> : query.isError ? <div className="rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">{query.error.status === 401 ? 'Your admin session has expired. Please sign in again.' : query.error.status === 404 ? 'This promotion no longer exists.' : query.error.status === 429 ? 'Too many requests. Please try again shortly.' : query.error.message || 'Could not load promotion details.'}<button type="button" onClick={() => query.refetch()} className="ml-2 font-bold underline">Retry</button></div> : (
                    <>
                        <div className="mb-4 flex items-center justify-between rounded-xl bg-zinc-50 px-4 py-3">
                            <div><p className="text-sm font-semibold text-zinc-900">{currentPromotion?.title}</p><p className="mt-0.5 text-[11px] text-zinc-500">{currentPromotion?.activePlacementCount ?? 0} active · {currentPromotion?.placementCount ?? 0} total products</p></div>
                            <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${currentPromotion?.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-200 text-zinc-600'}`}>{currentPromotion?.isActive ? 'Section active' : 'Section inactive'}</span>
                        </div>
                        {removeError && <p role="alert" className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{removeError}</p>}
                        {!placements.length ? <div className="rounded-xl border border-dashed border-zinc-200 px-4 py-12 text-center"><Store size={22} className="mx-auto text-zinc-400" /><p className="mt-3 text-sm font-semibold text-zinc-700">No products in this promotion</p><p className="mt-1 text-xs text-zinc-500">Add products from a shop type and vendor.</p></div> : (
                            <div className="space-y-2.5">
                                {visiblePlacements.map((placement) => (
                                    <article key={placement.id} className="flex items-center gap-3 rounded-xl border border-zinc-100 bg-zinc-50/70 p-2.5">
                                        <ProductThumbnail images={placement.product?.images} name={placement.product?.name} />
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-xs font-bold text-zinc-900">{placement.product?.name || 'Unnamed product'}</p>
                                            <p className="mt-0.5 truncate text-[10px] text-zinc-500">{placement.vendor?.storeName || 'Unknown vendor'} · {placement.shopType?.name || 'Unknown shop type'}</p>
                                            <p className="mt-1 text-[10px] font-semibold text-zinc-800">₦{Number(placement.product?.price ?? 0).toLocaleString('en-NG')}</p>
                                        </div>
                                        <div className="flex shrink-0 flex-col items-end gap-1.5">
                                            <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${placement.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-200 text-zinc-600'}`}>{placement.isActive ? 'Visible' : 'Hidden'}</span>
                                            <div className="flex items-center gap-2">
                                                <Toggle checked={Boolean(placement.isActive)} label={`${placement.isActive ? 'Hide' : 'Show'} ${placement.product?.name || 'product'}`} disabled={placementStatusMutation.isPending} onChange={() => { setActivePlacementMutationId(placement.id); placementStatusMutation.mutate({ placementId: placement.id, isActive: !placement.isActive }); }} />
                                                <button type="button" aria-label={`Remove ${placement.product?.name || 'product'}`} onClick={() => { setRemoveError(''); setRemoveTarget(placement); }} className="rounded-lg p-1.5 text-zinc-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 size={15} /></button>
                                            </div>
                                            {activePlacementMutationId === placement.id && placementStatusMutation.isPending && <span className="text-[9px] text-zinc-400">Saving…</span>}
                                        </div>
                                    </article>
                                ))}
                                <ListToggle label="promotion products" shown={visiblePlacements.length} total={placements.length} onMore={() => setProductVisible((count) => count + LIST_STEP)} onLess={() => setProductVisible(LIST_PREVIEW)} />
                            </div>
                        )}
                    </>
                )}
            </Drawer>
            {removeTarget && <ConfirmDialog title="Remove product?" message={`Remove “${removeTarget.product?.name || 'this product'}” from this promotion? The catalog product will remain unchanged.`} confirmLabel="Remove" pending={removePlacementMutation.isPending} onCancel={() => setRemoveTarget(null)} onConfirm={() => removePlacementMutation.mutate(removeTarget.id)} />}
            {showAddProduct && <AddProductDrawer promotionId={promotionId} token={token} onClose={() => setShowAddProduct(false)} onAdded={async () => { setShowAddProduct(false); await onRefresh(promotionId); }} />}
        </>
    );
};

const ProductThumbnail = ({ images = [], name }) => {
    const imageUrl = images[0]?.imageUrl;
    return imageUrl ? <img src={imageUrl} alt={name || ''} className="h-14 w-16 shrink-0 rounded-lg object-cover" /> : <div className="flex h-14 w-16 shrink-0 items-center justify-center rounded-lg bg-zinc-200 text-zinc-400"><ImageIcon size={18} /></div>;
};

const AddProductDrawer = ({ promotionId, token, onClose, onAdded }) => {
    const [shopTypeId, setShopTypeId] = useState('');
    const [vendorId, setVendorId] = useState('');
    const [productId, setProductId] = useState('');
    const queryClient = useQueryClient();
    const shopTypesQuery = useQuery({ queryKey: ['promotion-shop-types'], queryFn: () => api.get('/shop-types/get-all') });
    const vendorsQuery = useQuery({ queryKey: ['promotion-vendors', shopTypeId], queryFn: () => api.get(`${PROMOTIONS}/vendors?shopTypeId=${encodeURIComponent(shopTypeId)}`, token), enabled: Boolean(shopTypeId) });
    const productsQuery = useQuery({ queryKey: ['promotion-products', vendorId], queryFn: () => api.get(`${PROMOTIONS}/products?vendorId=${encodeURIComponent(vendorId)}`, token), enabled: Boolean(vendorId) });
    const addMutation = useMutation({
        mutationFn: (payload) => api.post(`${PROMOTIONS}/${encodeURIComponent(promotionId)}/placements`, payload, token),
        onSuccess: async (response) => {
            toast.success(response?.message || 'Product added to promotion.');
            await queryClient.invalidateQueries({ queryKey: ['admin-promotions'] });
            onAdded();
        },
        onError: (error) => toast.error(error.status === 409 ? 'This product is already in this promotion.' : error.status === 404 ? 'The selected shop type, vendor, product, or promotion could not be found.' : error.status === 429 ? 'Too many requests. Please try again shortly.' : error.message || 'Could not add product.'),
    });
    const shopTypes = shopTypesQuery.data?.data?.shopTypes ?? shopTypesQuery.data?.data ?? [];
    const vendors = vendorsQuery.data?.data?.vendors ?? [];
    const products = productsQuery.data?.data?.products ?? [];
    const selectedProduct = products.find((product) => product.id === productId);
    return (
        <Drawer title="Add Product" subtitle="Promotion placement" onClose={onClose} zIndex={90} darkHeader footer={<div className="flex gap-3"><button type="button" onClick={onClose} className="flex-1 rounded-full border border-emerald-800 px-4 py-3 text-xs font-bold text-emerald-800">Cancel</button><button type="button" disabled={!shopTypeId || !vendorId || !productId || addMutation.isPending} onClick={() => addMutation.mutate({ shopTypeId, vendorId, productId })} className="flex-1 rounded-full bg-[#1C5E20] px-4 py-3 text-xs font-bold text-white disabled:opacity-50">{addMutation.isPending ? 'Adding…' : 'Add Product'}</button></div>}>
            <p className="mb-5 text-xs leading-5 text-zinc-500">Choose the shop type, then a vendor, then one of that vendor’s products.</p>
            {addMutation.isError && <p role="alert" className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{addMutation.error.status === 401 ? 'Your admin session has expired. Please sign in again.' : addMutation.error.status === 409 ? 'This product is already in this promotion.' : addMutation.error.status === 404 ? 'The selected shop type, vendor, product, or promotion could not be found.' : addMutation.error.status === 429 ? 'Too many requests. Please try again shortly.' : addMutation.error.message || 'Could not add product.'}</p>}
            <div className="space-y-3">
                <FormField id="promotion-shop-type" label="Shop type" error={shopTypesQuery.isError ? getPromotionError(shopTypesQuery.error) : ''}><StyledSelect id="promotion-shop-type" value={shopTypeId} disabled={shopTypesQuery.isError} loading={shopTypesQuery.isLoading} placeholder="Select shop type" options={shopTypes.map((type) => ({ value: type.id, label: type.name }))} onChange={(nextId) => { setShopTypeId(nextId); setVendorId(''); setProductId(''); }} /></FormField>
                <FormField id="promotion-vendor" label="Vendor" error={vendorsQuery.isError ? getPromotionError(vendorsQuery.error) : ''}><StyledSelect id="promotion-vendor" value={vendorId} disabled={!shopTypeId || vendorsQuery.isError} loading={vendorsQuery.isLoading} placeholder={shopTypeId ? 'Select vendor' : 'Select a shop type first'} options={vendors.map((vendor) => ({ value: vendor.id, label: vendor.storeName }))} onChange={(nextId) => { setVendorId(nextId); setProductId(''); }} /></FormField>
                <FormField id="promotion-product" label="Product" error={productsQuery.isError ? getPromotionError(productsQuery.error) : ''}><StyledSelect id="promotion-product" value={productId} disabled={!vendorId || productsQuery.isError} loading={productsQuery.isLoading} placeholder={vendorId ? 'Select product' : 'Select a vendor first'} options={products.map((product) => ({ value: product.id, label: `${product.name} · ₦${Number(product.price).toLocaleString('en-NG')}${product.isInStock ? '' : ' · Out of stock'}` }))} onChange={setProductId} /></FormField>
            </div>
            {selectedProduct && <div className="mt-5 flex items-center gap-3 rounded-xl bg-zinc-50 p-3"><ProductThumbnail images={selectedProduct.images} name={selectedProduct.name} /><div><p className="text-sm font-semibold text-zinc-900">{selectedProduct.name}</p><p className="mt-1 text-xs text-zinc-500">₦{Number(selectedProduct.price).toLocaleString('en-NG')} · {selectedProduct.isInStock ? 'In stock' : 'Out of stock'}</p></div></div>}
        </Drawer>
    );
};

export default Promotions;
