// ui/toast.js
// User Notification Layer
// Currently wraps native alert() calls with semantic function names.
// This consolidation point allows future upgrade to a toast library
// (e.g., Sonner, Notyf) without touching feature modules.

/**
 * Shows a success notification.
 * @param {string} message
 */
export function showSuccess(message) {
    alert(message);
}

/**
 * Shows an error notification.
 * @param {string} message
 */
export function showError(message) {
    alert(message);
}

/**
 * Shows an informational notification.
 * @param {string} message
 */
export function showInfo(message) {
    alert(message);
}

/**
 * Shows a warning notification.
 * @param {string} message
 */
export function showWarning(message) {
    alert(message);
}
