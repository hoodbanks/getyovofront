import { Bike, Loader2, MapPin, Phone, ShoppingBag, Store, User, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/api';
import { useAuthStore } from '../../store/useAuthStore';

const unavailable = 'Not available';
const valueOrUnavailable = (value) => value === null || value === undefined || value === '' ? unavailable : value;
const formatLagosDateTime = (value) => {
    if (!value) return unavailable;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return unavailable;
    return new Intl.DateTimeFormat('en-NG', { timeZone: 'Africa/Lagos', day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }).format(date);
};
const formatNaira = (value) => typeof value === 'number' && Number.isFinite(value)
    ? new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 2 }).format(value)
    : unavailable;

const DetailField = ({ label, value }) => (
    <div className="min-w-0">
        <p className="text-[8px] font-semibold uppercase tracking-wide text-zinc-400">{label}</p>
        <p className="mt-0.5 break-words text-[10px] font-medium leading-4 text-zinc-800">{valueOrUnavailable(value)}</p>
    </div>
);

const OrderModal = ({ isOpen, onClose, order }) => {
    const token = useAuthStore((state) => state.accessToken);
    const orderId = order?.id;
    const detailQuery = useQuery({
        queryKey: ['order-detail', orderId],
        queryFn: () => api.get(`/superadmin/orders/${encodeURIComponent(orderId)}/overview`, token),
        enabled: Boolean(isOpen && orderId),
    });
    const orderDetails = detailQuery.data?.data?.order;
    const validDetail = Boolean(orderDetails && typeof orderDetails === 'object' && !Array.isArray(orderDetails));
    const detailError = detailQuery.error || (detailQuery.data && !validDetail ? new Error('Unexpected order detail response shape.') : null);
    if (!isOpen || !order) return null;

    const items = Array.isArray(orderDetails?.items) ? orderDetails.items
        : Array.isArray(orderDetails?.itemsStructured) ? orderDetails.itemsStructured : null;
    const detailOrderCode = orderDetails?.orderCode ?? orderDetails?.code ?? order.orderCode;
    const detailOrderTime = orderDetails?.orderTime ?? orderDetails?.placedAt ?? orderDetails?.paidAt ?? order.orderTime;
    const detailTotal = orderDetails?.totalAmount ?? orderDetails?.totalAmountPaid ?? order.totalAmount;
    const detailDistance = orderDetails?.distanceKm === undefined ? order.distanceKm : orderDetails.distanceKm;
    const timestampFromEither = (field, ...aliases) => {
        for (const source of [orderDetails, order]) {
            for (const key of [field, ...aliases]) {
                if (source?.[key] !== null && source?.[key] !== undefined && source?.[key] !== '') return source[key];
            }
        }
        return undefined;
    };
    const timestamps = [
        ['Order time', timestampFromEither('orderTime', 'placedAt', 'createdAt') ?? detailOrderTime],
        ['Paid at', timestampFromEither('paidAt')],
        ['Order received at', timestampFromEither('orderReceivedAt')],
        ['Preparing at', timestampFromEither('preparingAt')],
        ['Accepted at', timestampFromEither('riderAssignedAt')],
        ['Ready at', timestampFromEither('readyAt')],
        ['Out for delivery at', timestampFromEither('outForDeliveryAt')],
        ['Delivered at', timestampFromEither('deliveredAt')],
    ];

    return (
        <div className="fixed inset-0 z-[100] flex justify-end" role="presentation">
            <button type="button" aria-label="Close order details" className="absolute inset-0 bg-black/50" onClick={onClose} />
            <aside role="dialog" aria-modal="true" aria-label="Order details" className="relative flex h-full w-full max-w-lg flex-col overflow-hidden bg-zinc-50 shadow-2xl">
                <header className="flex shrink-0 items-center justify-between border-b border-white/10 bg-[#0F172B] px-4 py-3">
                    <div><p className="text-[13px] font-bold text-white">Order details</p><p className="mt-0.5 text-[9px] text-slate-300">{detailOrderCode || unavailable}</p></div>
                    <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10 hover:text-white"><X size={18} /></button>
                </header>

                <div className="flex-1 space-y-2.5 overflow-y-auto p-3">
                    {detailQuery.isLoading ? (
                        <div className="flex items-center justify-center py-24"><Loader2 className="animate-spin text-emerald-700" size={28} /></div>
                    ) : detailError ? (
                        <div className="rounded-xl border border-rose-100 bg-rose-50 p-4 text-center" role="alert">
                            <p className="text-xs text-rose-700">{detailError.message || 'Order details could not be loaded.'}</p>
                            <button type="button" onClick={() => detailQuery.refetch()} className="mt-3 rounded-lg bg-emerald-800 px-4 py-2 text-xs font-semibold text-white">Retry</button>
                        </div>
                    ) : (
                        <>
                    <section className="rounded-xl border border-zinc-100 bg-white p-3">
                                <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-2"><ShoppingBag size={13} className="text-emerald-700" /><h3 className="text-[10px] font-bold text-zinc-900">Order summary</h3></div>
                                    <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[9px] font-semibold text-zinc-700">{valueOrUnavailable(orderDetails.status).replaceAll('_', ' ')}</span>
                                </div>
                                <div className="mt-3 grid grid-cols-2 gap-3">
                                    <DetailField label="Order code" value={detailOrderCode} />
                                    <DetailField label="Payment status" value={orderDetails.paymentStatus} />
                                    <DetailField label="Total" value={formatNaira(detailTotal)} />
                                    <DetailField label="Distance" value={typeof detailDistance === 'number' ? `${detailDistance} km` : unavailable} />
                                </div>
                            </section>

                            <section className="rounded-xl border border-zinc-100 bg-white p-3">
                                <h3 className="text-[10px] font-bold text-zinc-900">People and store</h3>
                                <div className="mt-2 grid grid-cols-2 gap-3">
                                    <DetailField label="Customer" value={orderDetails.customerName} />
                                    <DetailField label="Customer phone" value={orderDetails.customerPhone} />
                                    <DetailField label="Store" value={orderDetails.vendorStoreName} />
                                    <DetailField label="Vendor phone" value={orderDetails.vendorPhone} />
                                    <DetailField label="Rider" value={orderDetails.riderName} />
                                    <DetailField label="Rider phone" value={orderDetails.riderPhone} />
                                </div>
                                <div className="mt-3 flex items-start gap-2 border-t border-zinc-100 pt-2"><MapPin size={13} className="mt-0.5 shrink-0 text-zinc-400" /><DetailField label="Delivery address" value={orderDetails.deliveryAddress} /></div>
                                <div className="mt-3 border-t border-zinc-100 pt-2"><DetailField label="Note for rider" value={orderDetails.riderInstruction} /></div>
                            </section>

                            {(orderDetails.status === 'CANCELLED' || orderDetails.cancellationReason) && (
                            <section className="rounded-xl border border-zinc-100 bg-white p-3">
                                <h3 className="text-[10px] font-bold text-zinc-900">Cancellation</h3>
                                <div className="mt-2">
                                    <DetailField label="Cancel reason" value={orderDetails.cancellationReason?.label || orderDetails.cancellationReason?.code} />
                                    {orderDetails.cancellationReason?.note && (
                                        <div className="mt-2"><DetailField label="Cancel note" value={orderDetails.cancellationReason.note} /></div>
                                    )}
                                </div>
                            </section>
                            )}

                            <section className="rounded-xl border border-zinc-100 bg-white p-3">
                                <h3 className="text-[10px] font-bold text-zinc-900">Items and add-ons</h3>
                                {!items ? <p className="mt-3 text-[11px] text-zinc-500">{unavailable}</p> : items.length === 0 ? <p className="mt-3 text-[11px] text-zinc-500">No items provided.</p> : (
                                <div className="mt-2 space-y-2">
                                        {items.map((item, index) => (
                                            <div key={item.id || `${item.productName || item.name || 'item'}-${index}`} className="border-b border-zinc-100 pb-3 last:border-0 last:pb-0">
                                                <div className="flex items-start justify-between gap-3 text-[11px]">
                                                    <span className="text-zinc-700">{item.quantity ?? unavailable} × {item.productName || item.name || unavailable}</span>
                                                    <span className="font-semibold text-zinc-900">{formatNaira(item.total)}</span>
                                                </div>
                                                {Array.isArray(item.addOns) && item.addOns.length > 0 && <ul className="mt-2 space-y-1 pl-4 text-[10px] text-zinc-500">{item.addOns.map((addon, addonIndex) => <li key={addon.id || `${addon.name || 'add-on'}-${addonIndex}`}>{addon.name || unavailable} · qty {addon.quantity ?? unavailable} · {formatNaira(addon.price)}</li>)}</ul>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="mt-2 grid grid-cols-2 gap-3 border-t border-zinc-100 pt-2">
                                    <DetailField label="Items subtotal" value={formatNaira(orderDetails.itemsSubtotal)} />
                                    <DetailField label="Delivery fee" value={formatNaira(orderDetails.deliveryFee)} />
                                </div>
                            </section>

                            <section className="rounded-xl border border-zinc-100 bg-white p-3">
                                <h3 className="text-[10px] font-bold text-zinc-900">Dates</h3>
                                <div className="mt-2 grid grid-cols-2 gap-3">{timestamps.map(([label, value]) => <DetailField key={label} label={label} value={formatLagosDateTime(value)} />)}</div>
                            </section>
                        </>
                    )}
                </div>
            </aside>
        </div>
    );
};

export default OrderModal;
