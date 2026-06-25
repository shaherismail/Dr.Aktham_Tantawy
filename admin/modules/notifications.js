// modules/notifications.js
// Notification Bell Module
// Checks for pending bookings and activates the notification indicator dot.

import { AppState } from '../state/AppState.js';

/**
 * Queries pending bookings and shows the notification dot + message
 * if any are found.
 */
export function initNotificationBell() {
    const { supabaseClient } = AppState;

    supabaseClient.from('bookings')
        .select('id')
        .eq('status', 'pending')
        .eq('is_deleted', false)
        .then(({ data }) => {
            if (data && data.length > 0) {
                const dot = document.getElementById('notificationDot');
                if (dot) dot.style.display = 'block';

                const list = document.getElementById('quickNotificationsList');
                if (list) {
                    list.innerHTML = `
                        <div style="padding:8px; background:rgba(245,158,11,0.08); border-radius:6px; color:#f59e0b; font-weight:600;">
                            ⚠️ يوجد لديك عدد ${data.length} حجز تقويم أسنان جديد معلق بانتظار المراجعة والموافقة!
                        </div>
                    `;
                }
            }
        });
}
