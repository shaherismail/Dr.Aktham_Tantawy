// modules/logs.js
// Audit Logs & Rollback Module
// Displays the last 30 audit log entries and allows Super Admin/Doctor
// to roll back changes to their previous state.

import { AppState } from '../state/AppState.js';
import { logAuditAction } from '../services/audit.js';

/**
 * Loads the 30 most recent audit log entries and renders them in the table.
 */
export function loadAuditLogs() {
    const { supabaseClient } = AppState;
    const listBody = document.getElementById('auditLogsTableBody');
    listBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">جاري تحميل سجلات النشاط...</td></tr>';

    supabaseClient.from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(30)
        .then(({ data, error }) => {
            if (error || !data) {
                listBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:red;">خطأ في تحميل سجل النشاط.</td></tr>';
                return;
            }

            listBody.innerHTML = '';

            data.forEach(l => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td style="font-size:12px;">${l.user_email}</td>
                    <td><code>${l.action}</code></td>
                    <td><code>${l.affected_item}</code></td>
                    <td style="font-size:12px;">${new Date(l.timestamp).toLocaleString('ar-EG')}</td>
                    <td>
                        <button class="btn btn-secondary btn-sm rollback-btn" data-item="${l.affected_item}">
                            <i class="bx bx-reset"></i> استرجاع (Rollback)
                        </button>
                    </td>
                `;
                listBody.appendChild(tr);

                tr.querySelector('.rollback-btn').onclick = () => executeRollback(l);
            });
        });
}

// ---------------------------------------------------------------------------
// ROLLBACK
// ---------------------------------------------------------------------------

/**
 * Reverts a record to its previous state using the old_value snapshot in the log.
 * Only accessible to Super Admin and Doctor roles.
 *
 * @param {object} log - Audit log entry object
 */
export function executeRollback(log) {
    const { supabaseClient, currentUserRole } = AppState;

    if (currentUserRole !== 'Super Admin' && currentUserRole !== 'Doctor') {
        alert('صلاحية الاسترجاع والrollback محصورة بالطبيب ومدير النظام.');
        return;
    }

    if (!log.old_value && !log.new_value) {
        alert('لا توجد لقطة بيانات (Snapshot) مخزنة للتراجع عنها.');
        return;
    }

    if (confirm('هل ترغب فعلاً في التراجع عن العملية وإرجاع حالة البيانات كما كانت؟')) {
        const table          = log.affected_item.split(':')[0];
        const id             = log.affected_item.split(':')[1];
        const restorePayload = log.old_value || {};

        supabaseClient.from(table).update(restorePayload).eq('id', id)
            .then(({ error }) => {
                if (error) {
                    alert('فشل الـ Rollback: ' + error.message);
                } else {
                    logAuditAction(`${table}:rollback`, log.affected_item, restorePayload, null);
                    alert('🎉 تم التراجع عن العملية واستعادة نسخة البيانات السابقة بنجاح!');
                    loadAuditLogs();
                }
            });
    }
}
