export function isoDateToString(isoDate) {
    const options = {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit'
    }

    const date = new Date(isoDate);
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = String(date.getUTCFullYear()).slice(2);
    return `${day}/${month}/${year}`;
}
