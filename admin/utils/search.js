// utils/search.js
// Global Search Utility
// Powers the admin panel's cross-section quick search dropdown.

import { AppState } from '../state/AppState.js';

/**
 * Searches across bookings by name, phone, or service and renders
 * results in the #searchDropdown element.
 *
 * @param {string} query - Search string from the global search input
 */
export function executeGlobalSearch(query) {
    const { supabaseClient } = AppState;
    const dropdown = document.getElementById('searchDropdown');

    if (!query) {
        dropdown.style.display = 'none';
        return;
    }

    supabaseClient.from('bookings')
        .select('*')
        .eq('is_deleted', false)
        .or(`name.ilike.%${query}%,phone.ilike.%${query}%,service.ilike.%${query}%`)
        .limit(10)
        .then(({ data, error }) => {
            if (error || !data || data.length === 0) {
                dropdown.innerHTML = '<span style="color:var(--text-muted); font-size:12px;">لا توجد نتائج بحث مطابقة.</span>';
                dropdown.style.display = 'block';
                return;
            }

            dropdown.innerHTML = '<h4>نتائج البحث السريع:</h4>';

            data.forEach(item => {
                const div = document.createElement('div');
                div.style.padding = '8px';
                div.style.borderBottom = '1px solid var(--border-color)';
                div.style.cursor = 'pointer';
                div.innerHTML = `
                    <div style="font-weight:600; font-size:13px;">${item.name} (${item.service})</div>
                    <div style="font-size:11px; color:var(--text-muted);">التاريخ: ${item.date} • الهاتف: ${item.phone}</div>
                `;

                div.onclick = () => {
                    dropdown.style.display = 'none';
                    location.hash = '#/appointments';
                    setTimeout(() => {
                        alert(`معلومات المريض المحددة:\nمريض: ${item.name}\nالخدمة: ${item.service}\nالتاريخ: ${item.date}`);
                    }, 200);
                };

                dropdown.appendChild(div);
            });

            dropdown.style.display = 'block';
        });
}
