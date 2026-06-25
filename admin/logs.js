// logs.js
// Audit Logs & Rollback Module

import { AppState } from './services/db.js';
import { logAuditAction } from './services/audit.js';
import { setTableLoading, setTableError } from './ui/table.js';

export function loadAuditLogs() {
    setTableLoading('auditLogsTableBody', 5);

    AppState.supabaseClient.from('audit_logs')
        .select('*').order('timestamp', { ascending: false }).limit(30)
        .then(({ data, error }) => {
            const listBody = document.getElementById('auditLogsTableBody');
            if (error || !data) { setTableError('auditLogsTableBody', 5, 'خطأ في تحميل سجل النشاط.'); return; }

            listBody.innerHTML = '';
            data.forEach(l => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td style="font-size:12px;">${l.user_email}</td>
                    <td><code>${l.action}</code></td>
                    <td><code>${l.affected_item}</code></td>
                    <td style="font-size:12px;">${new Date(l.timestamp).toLocaleString('ar-EG')}</td>
                    <td><button class="btn btn-secondary btn-sm rollback-btn"><i class="bx bx-reset"></i> استرجاع</button></td>
                `;
                listBody.appendChild(tr);
                tr.querySelector('.rollback-btn').onclick = () => executeRollback(l);
            });
        });
}

export function executeRollback(log) {
    const { supabaseClient, currentUserRole } = AppState;
    if (currentUserRole !== 'Super Admin' && currentUserRole !== 'Doctor') {
        alert('صلاحية الاسترجاع محصورة بالطبيب ومدير النظام.');
        return;
    }
    if (!log.old_value) { alert('لا توجد لقطة بيانات للتراجع عنها.'); return; }
    if (confirm('هل ترغب في التراجع عن العملية وإرجاع البيانات كما كانت؟')) {
        const table   = log.affected_item.split(':')[0];
        const id      = log.affected_item.split(':')[1];
        supabaseClient.from(table).update(log.old_value).eq('id', id)
            .then(({ error }) => {
                if (error) alert('فشل الـ Rollback: ' + error.message);
                else {
                    logAuditAction(`${table}:rollback`, log.affected_item, log.old_value, null);
                    alert('🎉 تم التراجع واستعادة البيانات السابقة!');
                    loadAuditLogs();
                }
            });
    }
}
