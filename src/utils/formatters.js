/**
 * Formats a name to Title Case (e.g., "john doe" -> "John Doe")
 */
export const formatName = (name) => {
    if (!name) return '---';
    return name
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

/**
 * Capitalizes the first letter of a string
 */
export const capitalizeFirst = (str) => {
    if (!str) return '---';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Formats a plate number to all uppercase
 */
export const formatPlate = (plate) => {
    if (!plate) return '---';
    return plate.toUpperCase();
};

/**
 * Gets capitalized initials from a name
 */
export const getInitials = (name) => {
    if (!name) return '??';
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
};

/**
 * Formats a date into a readable format: "10th March, 2026"
 * Supports ISO strings and nested objects {date, month, year, time}
 */
export const formatDate = (dateInput) => {
    if (!dateInput) return '---';

    let date;
    let day, monthName, year;

    const isLegacyObj = typeof dateInput === 'object' && (dateInput.date || dateInput.day) && dateInput.month && dateInput.year;
    
    if (isLegacyObj) {
        // Handle nested object format {date/day, month, year, time}
        day = parseInt(dateInput.date || dateInput.day);
        year = dateInput.year;
        // Month might be index or name
        if (isNaN(parseInt(dateInput.month))) {
            monthName = dateInput.month;
        } else {
            monthName = new Date(year, parseInt(dateInput.month) - 1).toLocaleString('en-US', { month: 'long' });
        }
    } else {
        // Handle ISO string or timestamp
        date = new Date(dateInput);
        if (isNaN(date.getTime())) return typeof dateInput === 'string' ? dateInput : 'Invalid Date';
        day = date.getDate();
        monthName = date.toLocaleString('en-US', { month: 'long' });
        year = date.getFullYear();
    }

    const getOrdinal = (d) => {
        if (d > 3 && d < 21) return 'th';
        switch (d % 10) {
            case 1: return "st";
            case 2: return "nd";
            case 3: return "rd";
            default: return "th";
        }
    };

    return `${day}${getOrdinal(day)} ${monthName}, ${year}`;
};

const chartOrdinal = (day) => {
    const suffix = day % 100 >= 11 && day % 100 <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' }[day % 10] || 'th');
    return `${day}${suffix}`;
};

/** Calendar day for a YYYY-MM-DD label or an instant, read in Africa/Lagos. */
const lagosDayParts = (value) => {
    const calendar = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value).trim());
    if (calendar) {
        const date = new Date(Date.UTC(Number(calendar[1]), Number(calendar[2]) - 1, Number(calendar[3])));
        return {
            day: date.getUTCDate(),
            month: new Intl.DateTimeFormat('en', { month: 'short', timeZone: 'UTC' }).format(date),
        };
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    const parts = new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', timeZone: 'Africa/Lagos' }).formatToParts(date);
    const day = Number(parts.find((part) => part.type === 'day')?.value);
    const month = parts.find((part) => part.type === 'month')?.value;
    return day && month ? { day, month } : null;
};

export const formatLagosMonthDay = (value) => {
    if (!value) return '';
    const parts = lagosDayParts(value);
    return parts ? `${parts.month} ${parts.day}` : '';
};

/** Date-input day as the Lagos midnight or end-of-day instant. Full ISO values are left unchanged. */
export const lagosDateInputInstant = (dateString, boundary = 'start') => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString || '')) return dateString || '';
    const [year, month, day] = dateString.split('-').map(Number);
    const lagosMidnightUtc = Date.UTC(year, month - 1, day) - 60 * 60 * 1000;
    const instant = boundary === 'end' ? lagosMidnightUtc + 24 * 60 * 60 * 1000 - 1 : lagosMidnightUtc;
    return new Date(instant).toISOString();
};

export const formatCompactChartDate = (value) => {
    if (!value) return '—';
    if (typeof value === 'object') {
        const day = Number(value.date ?? value.day);
        const year = Number(value.year);
        const month = typeof value.month === 'number' || /^\d+$/.test(String(value.month))
            ? Number(value.month) - 1
            : new Date(`${value.month} 1, ${year}`).getMonth();
        const date = new Date(year, month, day);
        if (Number.isNaN(date.getTime())) return formatDate(value);
        return `${chartOrdinal(date.getDate())} ${new Intl.DateTimeFormat('en', { month: 'short' }).format(date)}`;
    }
    const parts = lagosDayParts(value);
    if (!parts) return formatDate(value);
    return `${chartOrdinal(parts.day)} ${parts.month}`;
};


/**
 * Formats a date + time: "10th March, 2026 • 8:35 PM"
 */
export const formatDateTime = (dateInput) => {
    if (!dateInput) return '---';
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return '---';

    const day = date.getDate();
    const monthName = date.toLocaleString('en-US', { month: 'long' });
    const year = date.getFullYear();
    const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const getOrdinal = (d) => {
        if (d > 3 && d < 21) return 'th';
        switch (d % 10) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
            default: return 'th';
        }
    };

    return `${day}${getOrdinal(day)} ${monthName}, ${year} • ${time}`;
};

/**
 * Formats a date with a short month name, for example "Oct 31, 2026".
 */
export const formatShortDate = (dateInput) => {
    if (!dateInput) return '---';

    const date = new Date(dateInput);
    if (Number.isNaN(date.getTime())) return '---';

    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(date);
};

/**
 * Formats a date and local time with a short month name, for example "Oct 31, 2026 • 10:32 AM".
 */
export const formatShortDateTime = (dateInput) => {
    if (!dateInput) return '---';

    const date = new Date(dateInput);
    if (Number.isNaN(date.getTime())) return '---';

    const readableDate = formatShortDate(date);
    const readableTime = new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
    }).format(date);

    return `${readableDate} • ${readableTime}`;
};

/**
 * Exports data to CSV with BOM for Excel compatibility
 */
export const exportToCSV = (data, fileName) => {
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0]).map(h => `"${h}"`).join(',');
    const rows = data.map(obj =>
        Object.values(obj)
            .map(val => {
                const str = String(val ?? '').replace(/"/g, '""');
                return `"${str}"`;
            })
            .join(',')
    );

    // BOM + CSV content ensures proper UTF-8 encoding when opened in Excel
    const BOM = '\uFEFF';
    const csvContent = BOM + [headers, ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${fileName}_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
