

export function validateOnlyNumber(event) {
    if (!/[0-9]/.test(event.key)) {
        event.preventDefault();
    }
}

export function validateNoNumber(event) {
    if (/[0-9]/.test(event.key)) {
        event.preventDefault();
    }
}

export function cleanText(text) {
    let value = text.trim();
    value = value.toLowerCase();
    value = value.replace("   ", " ");
    value = value.replace("  ", " ");

    return value;
}