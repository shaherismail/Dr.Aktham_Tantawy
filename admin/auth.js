// auth.js
// Authentication Module
// Handles: Supabase connection init, session check, login/logout,
// role resolution, UI state switching, and backup/restore listeners.

import { AppState } from './services/db.js';
import { initSupabaseClient } from './services/supabase.js';
import { logAuditAction } from './services/audit.js';

// ---------------------------------------------------------------------------
// CONNECTION INITIALIZATION
// ---------------------------------------------------------------------------

/**
 * Reads or sets Supabase connection keys from localStorage,
 * populates the config UI fields, and initializes the Supabase client.
 */
export function initConnectionKeys() {
    const defaultUrl = 'https://uryssoojjljplseaxamn.supabase.co';
    const defaultKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyeXNzb29qamxqcGxzZWF4YW1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzMjE0NjgsImV4cCI6MjA5Nzg5NzQ2OH0.VmSSd3_7we4ZNOcHSaklHAN05Bnx9dCiTHjY_UI7c_k';

    const savedUrl = localStorage.getItem('supabase_url') || defaultUrl;
    const savedKey = localStorage.getItem('supabase_key') || defaultKey;

    document.getElementById('configUrl').value = savedUrl;
    document.getElementById('configKey').value = savedKey;
    localStorage.setItem('supabase_url', savedUrl);
    localStorage.setItem('supabase_key', savedKey);

    try {
        if (window.supabase) {
            initSupabaseClient(savedUrl, savedKey);
            checkActiveSession();
        }
    } catch (e) {
        console.error('Failed to initialize Supabase connection:', e);
    }
}

// ---------------------------------------------------------------------------
// SESSION & ROLE
// ---------------------------------------------------------------------------

/** Checks existing Supabase auth session and resolves the user's role. */
export function checkActiveSession() {
    const { supabaseClient } = AppState;
    if (!supabaseClient) return;

    supabaseClient.auth.getSession().then(({ data: { session }, error }) => {
        if (session && !error) {
            AppState.currentUser = session.user;
            supabaseClient.from('user_roles')
                .select('role')
                .eq('id', AppState.currentUser.id)
                .single()
                .then(({ data, error: roleErr }) => {
                    AppState.currentUserRole = (data && !roleErr) ? data.role : 'Viewer';
                    displayAuthenticatedUI();
                });
        } else {
            displayAuthScreen();
        }
    });
}

// ---------------------------------------------------------------------------
// UI STATE SWITCHES
// ---------------------------------------------------------------------------

/** Shows the login screen. */
export function displayAuthScreen() {
    document.getElementById('authScreen').style.display = 'flex';
    document.getElementById('appScreen').style.display  = 'none';
}

/** Shows the app shell and triggers initial data load. */
export function displayAuthenticatedUI() {
    const { currentUser, currentUserRole } = AppState;

    document.getElementById('authScreen').style.display  = 'none';
    document.getElementById('appScreen').style.display   = 'grid';
    document.getElementById('adminUserEmail').textContent = currentUser.email;
    document.getElementById('adminUserRole').textContent  = currentUserRole;
    document.getElementById('avatarLetter').textContent   = currentUser.email.charAt(0).toUpperCase();

    // Lazy-import to break circular dependency — these modules import from auth
    import('./router.js').then(({ handleRoute }) => handleRoute());
    import('./dashboard.js').then(({ loadDashboardStats }) => loadDashboardStats());
    import('./notifications.js').then(({ initNotificationBell }) => initNotificationBell());
    initBackupRestoreListeners();
}

// ---------------------------------------------------------------------------
// AUTH EVENT LISTENERS
// ---------------------------------------------------------------------------

/** Binds login form submit and logout button. */
export function setupAuthListeners() {
    document.getElementById('loginForm').addEventListener('submit', (e) => {
        e.preventDefault();

        const email = document.getElementById('loginEmail').value.trim();
        const pass  = document.getElementById('loginPassword').value;
        const url   = document.getElementById('configUrl').value.trim();
        const key   = document.getElementById('configKey').value.trim();

        localStorage.setItem('supabase_url', url);
        localStorage.setItem('supabase_key', key);

        const client = initSupabaseClient(url, key);

        client.auth.signInWithPassword({ email, password: pass }).then(({ data, error }) => {
            if (error) {
                alert('خطأ في المصادقة: ' + error.message);
            } else {
                AppState.currentUser = data.user;
                checkActiveSession();
            }
        });
    });

    document.getElementById('logoutBtn').addEventListener('click', () => {
        AppState.supabaseClient?.auth.signOut().then(() => {
            AppState.currentUser     = null;
            AppState.currentUserRole = 'Viewer';
            displayAuthScreen();
        });
    });
}

// ---------------------------------------------------------------------------
// BACKUP & RESTORE
// ---------------------------------------------------------------------------

/** Binds backup download and restore upload events. */
export function initBackupRestoreListeners() {
    const downloadBtn = document.getElementById('downloadBackupBtn');
    const uploadInput = document.getElementById('uploadBackupInput');

    if (downloadBtn) {
        downloadBtn.onclick = () => {
            const role = AppState.currentUserRole;
            if (role !== 'Super Admin' && role !== 'Doctor') {
                alert('عذراً: فقط مدير النظام أو الطبيب يملك صلاحية تنزيل النسخ الاحتياطية.');
                return;
            }
            alert('جاري توليد ملف النسخة الاحتياطية...');
            import('../assets/js/db-service.js').then(({ DBService }) => {
                DBService.generateBackupPayload(AppState.supabaseClient).then(jsonStr => {
                    if (!jsonStr) { alert('فشل توليد النسخة الاحتياطية.'); return; }
                    const blob = new Blob([jsonStr], { type: 'application/json' });
                    const url  = URL.createObjectURL(blob);
                    const a    = document.createElement('a');
                    a.href     = url;
                    a.download = `dr_aktham_clinic_backup_${new Date().toISOString().split('T')[0]}.json`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    alert('🎉 تم تنزيل النسخة الاحتياطية بنجاح!');
                });
            });
        };
    }

    if (uploadInput) {
        uploadInput.onchange = (e) => {
            if (AppState.currentUserRole !== 'Super Admin') {
                alert('استعادة النسخة الاحتياطية مسموح بها فقط لمدير النظام.');
                return;
            }
            const file = e.target.files[0];
            if (!file) return;
            if (confirm('⚠️ تحذير: استعادة النسخة الاحتياطية ستمسح كافة البيانات الحالية. هل تود المتابعة؟')) {
                const reader = new FileReader();
                reader.onload = (evt) => {
                    import('../assets/js/db-service.js').then(({ DBService }) => {
                        DBService.restoreBackupPayload(evt.target.result, AppState.supabaseClient, AppState.currentUser.email)
                            .then(res => {
                                if (res.error) {
                                    alert('❌ فشل استعادة البيانات: ' + res.error);
                                } else {
                                    alert('🎉 تم استعادة قاعدة البيانات بنجاح!');
                                    location.reload();
                                }
                            });
                    });
                };
                reader.readAsText(file);
            }
        };
    }
}
