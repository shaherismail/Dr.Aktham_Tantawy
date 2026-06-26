// users.js
// User Roles & RBAC Manager Module

import { AppState } from './services/db.js';
import { logAuditAction } from './services/audit.js';
import { setTableLoading, setTableError } from './ui/table.js';

export function loadUserRoles() {
    setTableLoading('userRolesTableBody', 4);

    AppState.supabaseClient.from('user_roles').select('*')
        .then(({ data, error }) => {
            const listBody = document.getElementById('userRolesTableBody');
            if (error || !data) { setTableError('userRolesTableBody', 4, 'خطأ في تحميل الأدوار.'); return; }

            listBody.innerHTML = '';
            data.forEach(u => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${u.email}</td>
                    <td><span class="badge badge-success">${u.role}</span></td>
                    <td>${new Date(u.created_at).toLocaleDateString('ar-EG')}</td>
                    <td><button class="btn btn-danger btn-sm revoke-btn"><i class="bx bx-user-minus"></i> سحب الدور</button></td>
                `;
                listBody.appendChild(tr);
                tr.querySelector('.revoke-btn').onclick = () => {
                    if (AppState.currentUserRole !== 'Super Admin') { alert('فقط مدير النظام يملك صلاحية سحب الأدوار.'); return; }
                    if (confirm('هل أنت متأكد من سحب صلاحية هذا المستخدم؟')) {
                        AppState.supabaseClient.from('user_roles').delete().eq('id', u.id)
                            .then(() => { logAuditAction('user_roles:delete', `user_roles:${u.id}`, { email: u.email, role: u.role }, null); loadUserRoles(); });
                    }
                };
            });
        });

    document.getElementById('assignUserRoleBtn').onclick = () => _assignRole();
}

function _assignRole() {
    if (AppState.currentUserRole !== 'Super Admin') { alert('فقط مدير النظام يملك الصلاحية.'); return; }

    const id    = document.getElementById('newUserUid').value.trim();
    const email = document.getElementById('newUserEmail').value.trim();
    const role  = document.getElementById('newUserRole').value;

    if (!id || !email) { alert('يرجى تعبئة UUID والبريد الإلكتروني.'); return; }

    AppState.supabaseClient.from('user_roles').insert([{ id, email, role }])
        .then(({ error }) => {
            if (error) alert(error.message);
            else {
                logAuditAction('user_roles:assign', `user_roles:${id}`, null, { email, role });
                alert('✅ تم منح الدور وصلاحية الدخول بنجاح!');
                loadUserRoles();
            }
        });
}
