// ui/modal.js
// Modal UI Helpers
// Centralizes modal open/close logic to prevent duplication across modules.

/**
 * Opens a modal by setting its display to 'flex'.
 * @param {string} modalId - The element ID of the modal container
 */
export function openModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.style.display = 'flex';
}

/**
 * Closes a modal by setting its display to 'none'.
 * @param {string} modalId - The element ID of the modal container
 */
export function closeModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.style.display = 'none';
}

/**
 * Toggles a modal's visibility.
 * @param {string} modalId
 */
export function toggleModal(modalId) {
    const el = document.getElementById(modalId);
    if (!el) return;
    el.style.display = el.style.display === 'none' ? 'flex' : 'none';
}
