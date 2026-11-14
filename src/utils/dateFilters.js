export const isWithinDateFilter = (createdAt, filter, dates = {}) => {
    const date = new Date(createdAt);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (filter === 'all') return true;
    if (filter === 'custom') {
        const start = dates.start ? new Date(`${dates.start}T00:00:00`) : null;
        const end = dates.end ? new Date(`${dates.end}T23:59:59.999`) : null;
        return (!start || date >= start) && (!end || date <= end);
    }
    if (filter === 'today') return date >= today;
    if (filter === 'yesterday') {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return date >= yesterday && date < today;
    }
    if (filter === 'last7days') return date >= new Date(now.getTime() - 7 * 86400000);
    if (filter === 'last30days') return date >= new Date(now.getTime() - 30 * 86400000);
    if (filter === 'thisMonth') return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    if (filter === 'lastMonth') {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return date.getMonth() === lastMonth.getMonth() && date.getFullYear() === lastMonth.getFullYear();
    }
    return true;
};
