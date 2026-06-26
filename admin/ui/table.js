// ui/table.js
// Reusable Table Rendering Utilities
// Provides generic helpers for building responsive admin data tables.
// Feature modules call these instead of writing inline table HTML.

/**
 * Clears a table body and shows a loading placeholder row.
 * @param {string} tbodyId    - ID of the <tbody> element
 * @param {number} colspan    - Number of columns to span
 */
export function setTableLoading(tbodyId, colspan = 6) {
    const el = document.getElementById(tbodyId);
    if (el) {
        el.innerHTML = `<tr><td colspan="${colspan}" style="text-align:center; padding:24px; color:var(--text-muted);">
            <i class="bx bx-loader-alt bx-spin" style="font-size:24px; display:block; margin-bottom:8px;"></i>
            جاري التحميل...
        </td></tr>`;
    }
}

/**
 * Shows an error state in a table body.
 * @param {string} tbodyId
 * @param {number} colspan
 * @param {string} [message]
 */
export function setTableError(tbodyId, colspan = 6, message = 'حدث خطأ في التحميل.') {
    const el = document.getElementById(tbodyId);
    if (el) {
        el.innerHTML = `<tr><td colspan="${colspan}" style="text-align:center; padding:24px; color:#ef4444;">
            <i class="bx bx-error-circle" style="font-size:24px; display:block; margin-bottom:8px;"></i>
            ${message}
        </td></tr>`;
    }
}

/**
 * Shows an empty state in a table body.
 * @param {string} tbodyId
 * @param {number} colspan
 * @param {string} [message]
 */
export function setTableEmpty(tbodyId, colspan = 6, message = 'لا توجد بيانات للعرض.') {
    const el = document.getElementById(tbodyId);
    if (el) {
        el.innerHTML = `<tr><td colspan="${colspan}" style="text-align:center; padding:32px; color:var(--text-muted);">
            <i class="bx bx-inbox" style="font-size:32px; display:block; margin-bottom:8px; opacity:0.4;"></i>
            ${message}
        </td></tr>`;
    }
}

/**
 * Creates a standard action button element.
 * @param {'primary'|'secondary'|'danger'} variant
 * @param {string} icon   - Boxicons class name (e.g. 'bx-edit')
 * @param {string} title  - Tooltip text
 * @param {Function} onClick
 * @returns {HTMLButtonElement}
 */
export function createActionBtn(variant, icon, title, onClick) {
    const btn = document.createElement('button');
    btn.className = `btn btn-${variant} btn-sm`;
    btn.title = title;
    btn.innerHTML = `<i class="bx ${icon}"></i>`;
    btn.onclick = onClick;
    return btn;
}

/**
 * Creates a badge <span> element.
 * @param {string} text
 * @param {'success'|'warning'|'danger'|'info'} type
 * @returns {HTMLSpanElement}
 */
export function createBadge(text, type = 'success') {
    const span = document.createElement('span');
    span.className = `badge badge-${type}`;
    span.textContent = text;
    return span;
}
