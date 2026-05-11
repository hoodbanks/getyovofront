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
