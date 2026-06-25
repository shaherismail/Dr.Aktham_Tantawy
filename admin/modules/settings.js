// modules/settings.js
// Clinic Settings & Theme Module
// Loads and saves clinic info (name, phone, SEO) and theme variables.
// Also manages the dark/light theme toggle button.

import { AppState } from '../state/AppState.js';
import { logAuditAction } from '../services/audit.js';

// ---------------------------------------------------------------------------
// CLINIC SETTINGS LOADER
// ---------------------------------------------------------------------------

/**
 * Loads clinic settings and theme settings from Supabase,
 * populates the form fields, and binds the save button.
 */
export function loadClinicSettings() {
    const { supabaseClient } = AppState;

    // Load site settings
    supabaseClient.from('site_settings').select('*').eq('id', 1).single()
        .then(({ data, error }) => {
            if (error || !data) return;

            document.getElementById('setClinicName').value  = data.clinic_name;
            document.getElementById('setPhone').value       = data.phone;
            document.getElementById('setWhatsapp').value    = data.whatsapp;
            document.getElementById('setEmail').value       = data.email;
            document.getElementById('setAddress').value     = data.address;
            document.getElementById('setGmaps').value       = data.google_maps_iframe              || '';
            document.getElementById('seoTitleField').value  = data.seo_title                       || '';
            document.getElementById('seoDescriptionField').value = data.seo_description            || '';
            document.getElementById('seoGaId').value        = data.analytics_google_id             || '';
            document.getElementById('seoGscId').value       = data.analytics_search_console_id    || '';
        });

    // Load theme settings
    supabaseClient.from('theme_settings').select('*').eq('id', 1).single()
        .then(({ data, error }) => {
            if (error || !data) return;

            document.getElementById('themePrimary').value     = data.primary_color;
            document.getElementById('themeSecondary').value   = data.secondary_color;
            document.getElementById('themeAccent').value      = data.accent_color;
            document.getElementById('themeRadius').value      = data.border_radius;
            document.getElementById('themeButtonStyle').value = data.button_style;
            document.getElementById('themeFontArabic').value  = data.fonts ? (data.fonts.arabic || 'Tajawal') : 'Tajawal';
        });

    // Bind save button
    document.getElementById('saveClinicSettingsBtn').onclick = () => _saveClinicSettings();
}

// ---------------------------------------------------------------------------
// SAVE (private)
// ---------------------------------------------------------------------------

function _saveClinicSettings() {
    const { supabaseClient, currentUserRole } = AppState;

    if (currentUserRole === 'Viewer') {
        alert('Viewer accounts cannot edit settings.');
        return;
    }

    const clinic_name                  = document.getElementById('setClinicName').value;
    const phone                        = document.getElementById('setPhone').value;
    const whatsapp                     = document.getElementById('setWhatsapp').value;
    const email                        = document.getElementById('setEmail').value;
    const address                      = document.getElementById('setAddress').value;
    const google_maps_iframe           = document.getElementById('setGmaps').value;
    const seo_title                    = document.getElementById('seoTitleField').value;
    const seo_description              = document.getElementById('seoDescriptionField').value;
    const analytics_google_id          = document.getElementById('seoGaId').value;
    const analytics_search_console_id  = document.getElementById('seoGscId').value;

    const sitePayload = {
        clinic_name, phone, whatsapp, email, address,
        google_maps_iframe, seo_title, seo_description,
        analytics_google_id, analytics_search_console_id,
    };

    const primary_color    = document.getElementById('themePrimary').value;
    const secondary_color  = document.getElementById('themeSecondary').value;
    const accent_color     = document.getElementById('themeAccent').value;
    const border_radius    = document.getElementById('themeRadius').value;
    const button_style     = document.getElementById('themeButtonStyle').value;
    const font_ar          = document.getElementById('themeFontArabic').value;

    const themePayload = {
        primary_color, secondary_color, accent_color,
        border_radius, button_style,
        fonts: { base: 'Outfit', arabic: font_ar },
    };

    Promise.all([
        supabaseClient.from('site_settings').update(sitePayload).eq('id', 1),
        supabaseClient.from('theme_settings').update(themePayload).eq('id', 1),
    ]).then(([siteRes, themeRes]) => {
        if (siteRes.error || themeRes.error) {
            alert('خطأ أثناء الحفظ: ' + (siteRes.error?.message || themeRes.error?.message));
        } else {
            logAuditAction('site_settings:update', 'site_settings:1', null, sitePayload);
            logAuditAction('theme_settings:update', 'theme_settings:1', null, themePayload);
            alert('🎉 تم تحديث بيانات العيادة وإعدادات الثيم والخطوط بنجاح!');
        }
    });
}

// ---------------------------------------------------------------------------
// THEME TOGGLE
// ---------------------------------------------------------------------------

/**
 * Binds the dark/light theme toggle button.
 * Must be called once during app initialization.
 */
export function setupThemeToggle() {
    const btn = document.getElementById('themeToggleBtn');
    if (!btn) return;

    btn.onclick = () => {
        const isDark = document.body.getAttribute('data-theme') === 'dark';
        document.body.setAttribute('data-theme', isDark ? 'light' : 'dark');
        btn.querySelector('i').className = isDark ? 'bx bx-moon' : 'bx bx-sun';
    };
}
