export function customerMapQuery(latitude, longitude, address) {
    const lat = Number(latitude);
    const lng = Number(longitude);
    if (Number.isFinite(lat) && Number.isFinite(lng)) return `${lat},${lng}`;
    const text = typeof address === 'string' ? address.trim() : '';
    return text ? encodeURIComponent(text) : '';
}

export function customerCoordinateText(latitude, longitude) {
    const lat = Number(latitude);
    const lng = Number(longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return '';
    return `Lat ${lat.toFixed(6)} · Long ${lng.toFixed(6)}`;
}
