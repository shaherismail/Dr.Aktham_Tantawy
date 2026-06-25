// settings.js
// Clinic Settings & Theme Module + Dark/Light Mode Toggle

import { AppState } from './services/db.js';
import { logAuditAction } from './services/audit.js';

export function loadClinicSettings() {
    const { supabaseClient } = AppState;

    supabaseClient.from('site_settings').select('*').eq('id', 1).single()
        .then(({ data }) => {
            if (!data) return;
            document.getElementById('setClinicName').value              = data.clinic_name;
            document.getElementById('setPhone').value                   = data.phone;
            document.getElementById('setWhatsapp').value                = data.whatsapp;
            document.getElementById('setEmail').value                   = data.email;
            document.getElementById('setAddress').value                 = data.address;
            document.getElementById('setGmaps').value                   = data.google_maps_iframe              || '';
            document.getElementById('seoTitleField').value              = data.seo_title                       || '';
            document.getElementById('seoDescriptionField').value        = data.seo_description                 || '';
            document.getElementById('seoGaId').value                    = data.analytics_google_id             || '';
            document.getElementById('seoGscId').value                   = data.analytics_search_console_id    || '';
        });

    supabaseClient.from('theme_settings').select('*').eq('id', 1).single()
        .then(({ data }) => {
            if (!data) return;
            document.getElementById('themePrimary').value     = data.primary_color;
            document.getElementById('themeSecondary').value   = data.secondary_color;
            document.getElementById('themeAccent').value      = data.accent_color;
            document.getElementById('themeRadius').value      = data.border_radius;
            document.getElementById('themeButtonStyle').value = data.button_style;
            document.getElementById('themeFontArabic').value  = data.fonts?.arabic || 'Tajawal';
        });

    document.getElementById('saveClinicSettingsBtn').onclick = () => _save();
}

function _save() {
    if (AppState.currentUserRole === 'Viewer') { alert('لا يملك حساب المشاهد صلاحية تعديل الإعدادات.'); return; }

    const sitePayload = {
        clinic_name:                document.getElementById('setClinicName').value,
        phone:                      document.getElementById('setPhone').value,
        whatsapp:                   document.getElementById('setWhatsapp').value,
        email:                      document.getElementById('setEmail').value,
        address:                    document.getElementById('setAddress').value,
        google_maps_iframe:         document.getElementById('setGmaps').value,
        seo_title:                  document.getElementById('seoTitleField').value,
        seo_description:            document.getElementById('seoDescriptionField').value,
        analytics_google_id:        document.getElementById('seoGaId').value,
        analytics_search_console_id: document.getElementById('seoGscId').value,
    };

    const themePayload = {
        primary_color:   document.getElementById('themePrimary').value,
        secondary_color: document.getElementById('themeSecondary').value,
        accent_color:    document.getElementById('themeAccent').value,
        border_radius:   document.getElementById('themeRadius').value,
        button_style:    document.getElementById('themeButtonStyle').value,
        fonts: { base: 'Outfit', arabic: document.getElementById('themeFontArabic').value },
    };

    Promise.all([
        AppState.supabaseClient.from('site_settings').update(sitePayload).eq('id', 1),
        AppState.supabaseClient.from('theme_settings').update(themePayload).eq('id', 1),
    ]).then(([siteRes, themeRes]) => {
        if (siteRes.error || themeRes.error) {
            alert('خطأ أثناء الحفظ: ' + (siteRes.error?.message || themeRes.error?.message));
        } else {
            logAuditAction('site_settings:update', 'site_settings:1', null, sitePayload);
            logAuditAction('theme_settings:update', 'theme_settings:1', null, themePayload);
            alert('🎉 تم تحديث بيانات العيادة والثيم بنجاح!');
        }
    });
}

/** Binds the dark/light theme toggle button. Call once on init. */
export function setupThemeToggle() {
    const btn = document.getElementById('themeToggleBtn');
    if (!btn) return;
    btn.onclick = () => {
        const isDark = document.body.getAttribute('data-theme') === 'dark';
        document.body.setAttribute('data-theme', isDark ? 'light' : 'dark');
        btn.querySelector('i').className = isDark ? 'bx bx-moon' : 'bx bx-sun';
    };
}
