

export function validateOnlyNumber(event) {
    if (!/[0-9]/.test(event.key)) {
        event.preventDefault();
    }
}

export function validateNoNumber(event) {
    if (!/^[a-zA-Z\s]*$/.test(event.key)) {
        event.preventDefault();
    }
}

export function onlyText(event) {
    if (!/[a-zA-Z]/.test(event.key)) {
        event.preventDefault();
    }
}

export function sanitizeText(text) {
    let value = text.trim();
    value = value.toLowerCase();
    value = value.replace("   ", " ");
    value = value.replace("  ", " ");

    return value;
}