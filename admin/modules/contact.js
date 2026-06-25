// modules/contact.js
// Contact Inbox Module
// Loads contact form messages, marks them as read, enables WhatsApp replies,
// and handles soft deletion.

import { AppState } from '../state/AppState.js';
import { logAuditAction } from '../services/audit.js';
import { softDeleteRecord } from '../utils/helpers.js';

/**
 * Loads all non-deleted contact messages ordered by newest first.
 */
export function loadContactInbox() {
    const { supabaseClient } = AppState;
    const listBody = document.getElementById('contactInboxTableBody');
    listBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">جاري تحميل الرسائل...</td></tr>';

    supabaseClient.from('contact_messages')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
            if (error || !data) {
                listBody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:red;">فشل تحميل رسائل الوارد.</td></tr>';
                return;
            }

            listBody.innerHTML = '';

            data.forEach(m => {
                const tr       = document.createElement('tr');
                const isUnread = m.status === 'unread';

                tr.innerHTML = `
                    <td style="font-weight:${isUnread ? '700' : 'normal'};">${m.name}</td>
                    <td>${m.phone}</td>
                    <td style="max-width:300px; font-style:italic;">"${m.message}"</td>
                    <td>${new Date(m.created_at).toLocaleString('ar-EG')}</td>
                    <td><span class="badge ${isUnread ? 'badge-warning' : 'badge-success'}">${isUnread ? 'غير مقروءة' : 'تم الرد'}</span></td>
                    <td>
                        <div style="display:flex; gap:6px;">
                            ${isUnread ? `<button class="btn btn-secondary btn-sm read-msg-btn" data-id="${m.id}" title="وضع مقروءة"><i class="bx bx-envelope-open"></i></button>` : ''}
                            <button class="btn btn-primary btn-sm reply-msg-btn" data-id="${m.id}" data-phone="${m.phone}" title="رد واتساب"><i class="bx bxl-whatsapp"></i> رد</button>
                            <button class="btn btn-danger btn-sm delete-msg-btn" data-id="${m.id}" title="حذف للمهملات"><i class="bx bx-trash"></i></button>
                        </div>
                    </td>
                `;

                listBody.appendChild(tr);

                const readBtn = tr.querySelector('.read-msg-btn');
                if (readBtn) {
                    readBtn.onclick = () => {
                        supabaseClient.from('contact_messages').update({ status: 'read' }).eq('id', m.id)
                            .then(() => {
                                logAuditAction('messages:read', `contact_messages:${m.id}`, null, { status: 'read' });
                                loadContactInbox();
                            });
                    };
                }

                tr.querySelector('.reply-msg-btn').onclick = () => {
                    const waUrl = `https://wa.me/${m.phone.replace('+', '')}?text=${encodeURIComponent('أهلاً ' + m.name + '، معك عيادة د. أكثم طنطاوي لتقويم الأسنان. رداً على رسالتك: ')}`;
                    window.open(waUrl, '_blank');
                };

                tr.querySelector('.delete-msg-btn').onclick = () =>
                    softDeleteRecord('contact_messages', m.id, loadContactInbox);
            });
        });
}
