// modules/users.js
// User Roles & RBAC Manager Module
// Lists all user roles and allows Super Admin to assign or revoke them.

import { AppState } from '../state/AppState.js';
import { logAuditAction } from '../services/audit.js';

/**
 * Loads all user roles from the user_roles table and renders them in the table.
 * Also binds the "Assign Role" button.
 */
export function loadUserRoles() {
    const { supabaseClient } = AppState;
    const listBody = document.getElementById('userRolesTableBody');
    listBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">جاري تحميل أدوار المستخدمين...</td></tr>';

    supabaseClient.from('user_roles')
        .select('*')
        .then(({ data, error }) => {
            if (error || !data) {
                listBody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:red;">خطأ في تحميل الأدوار.</td></tr>';
                return;
            }

            listBody.innerHTML = '';

            data.forEach(u => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${u.email}</td>
                    <td><span class="badge badge-success">${u.role}</span></td>
                    <td>${new Date(u.created_at).toLocaleDateString('ar-EG')}</td>
                    <td><button class="btn btn-danger btn-sm revoke-role-btn" data-id="${u.id}"><i class="bx bx-user-minus"></i> سحب الدور</button></td>
                `;
                listBody.appendChild(tr);

                tr.querySelector('.revoke-role-btn').onclick = () => {
                    if (AppState.currentUserRole !== 'Super Admin') {
                        alert('عذراً: فقط مدير النظام (Super Admin) يملك صلاحيات تعديل أدوار المستخدمين.');
                        return;
                    }
                    if (confirm('هل أنت متأكد من سحب صلاحية هذا المستخدم؟')) {
                        supabaseClient.from('user_roles').delete().eq('id', u.id)
                            .then(() => {
                                logAuditAction('user_roles:delete', `user_roles:${u.id}`, { email: u.email, role: u.role }, null);
                                loadUserRoles();
                            });
                    }
                };
            });
        });

    // Bind the assign role button
    document.getElementById('assignUserRoleBtn').onclick = () => _assignUserRole();
}

// ---------------------------------------------------------------------------
// ASSIGN ROLE (private)
// ---------------------------------------------------------------------------

function _assignUserRole() {
    const { supabaseClient, currentUserRole } = AppState;

    if (currentUserRole !== 'Super Admin') {
        alert('فقط مدير النظام يملك الصلاحية.');
        return;
    }

    const id    = document.getElementById('newUserUid').value.trim();
    const email = document.getElementById('newUserEmail').value.trim();
    const role  = document.getElementById('newUserRole').value;

    if (!id || !email) {
        alert('يرجى تعبئة UUID والبريد الإلكتروني.');
        return;
    }

    supabaseClient.from('user_roles').insert([{ id, email, role }])
        .then(({ error }) => {
            if (error) {
                alert(error.message);
            } else {
                logAuditAction('user_roles:assign', `user_roles:${id}`, null, { email, role });
                alert('✅ تم منح الدور وصلاحية الدخول بنجاح!');
                loadUserRoles();
            }
        });
}
