// contact.js
// Contact Inbox Module — loads messages, marks read, WhatsApp replies, soft delete.

import { AppState } from './services/db.js';
import { logAuditAction } from './services/audit.js';
import { softDeleteRecord } from './utils.js';
import { setTableLoading, setTableError } from './ui/table.js';

export function loadContactInbox() {
    setTableLoading('contactInboxTableBody', 6);

    AppState.supabaseClient.from('contact_messages')
        .select('*').eq('is_deleted', false).order('created_at', { ascending: false })
        .then(({ data, error }) => {
            const listBody = document.getElementById('contactInboxTableBody');
            if (error || !data) { setTableError('contactInboxTableBody', 6, 'فشل تحميل رسائل الوارد.'); return; }

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
                            ${isUnread ? `<button class="btn btn-secondary btn-sm read-btn" title="تم القراءة"><i class="bx bx-envelope-open"></i></button>` : ''}
                            <button class="btn btn-primary btn-sm reply-btn" title="رد واتساب"><i class="bxl-whatsapp bx"></i> رد</button>
                            <button class="btn btn-danger btn-sm del-btn" title="حذف"><i class="bx bx-trash"></i></button>
                        </div>
                    </td>
                `;
                listBody.appendChild(tr);
                tr.querySelector('.read-btn')?.addEventListener('click', () => {
                    AppState.supabaseClient.from('contact_messages').update({ status: 'read' }).eq('id', m.id)
                        .then(() => { logAuditAction('messages:read', `contact_messages:${m.id}`, null, { status: 'read' }); loadContactInbox(); });
                });
                tr.querySelector('.reply-btn').addEventListener('click', () => {
                    window.open(`https://wa.me/${m.phone.replace('+', '')}?text=${encodeURIComponent('أهلاً ' + m.name + '، معك عيادة د. أكثم طنطاوي. رداً على رسالتك: ')}`, '_blank');
                });
                tr.querySelector('.del-btn').addEventListener('click', () => softDeleteRecord('contact_messages', m.id, loadContactInbox));
            });
        });
}
