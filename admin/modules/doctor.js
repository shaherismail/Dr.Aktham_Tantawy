// modules/doctor.js
// Doctor Profile CMS Module
// Loads and saves the doctor's profile data from/to the 'doctor' page_section.

import { AppState } from '../state/AppState.js';
import { logAuditAction } from '../services/audit.js';

/**
 * Loads the doctor profile section and populates the form fields.
 * Binds the save button to persist changes as a draft.
 */
export function loadDoctorCMS() {
    const { supabaseClient } = AppState;

    supabaseClient.from('page_sections')
        .select('*')
        .eq('section_type', 'doctor')
        .single()
        .then(({ data, error }) => {
            if (error || !data) return;

            const content = data.draft_content || {};

            document.getElementById('docName').value            = content.name                            || '';
            document.getElementById('docPhotoUrl').value        = content.photo_url                       || '';
            document.getElementById('docBio').value             = content.bio                             || '';
            document.getElementById('docExperience').value      = content.experience_years                 || 15;
            document.getElementById('docSpecializations').value = (content.specializations || []).join('، ');
            document.getElementById('docCertificates').value    = JSON.stringify(content.certificates || [], null, 2);

            import('../assets/js/ai-assistant.js').then(({ attachAIAssistant }) => {
                document.querySelectorAll('#doctorCMSSection input[type="text"], #doctorCMSSection textarea').forEach(field => {
                    attachAIAssistant(field);
                });
            }).catch(() => {});

            // Bind save button
            document.getElementById('saveDoctorProfileBtn').onclick = () => _saveDoctorProfile(data.id);
        });
}

// ---------------------------------------------------------------------------
// SAVE (private)
// ---------------------------------------------------------------------------

/**
 * Reads form values and saves the doctor profile as a draft.
 * @param {string} sectionId - page_sections record ID
 */
function _saveDoctorProfile(sectionId) {
    const { supabaseClient, currentUserRole } = AppState;

    if (currentUserRole === 'Viewer') {
        alert('صلاحية مشاهد فقط.');
        return;
    }

    const name             = document.getElementById('docName').value;
    const photo_url        = document.getElementById('docPhotoUrl').value;
    const bio              = document.getElementById('docBio').value;
    const experience_years = parseInt(document.getElementById('docExperience').value) || 15;
    const specializations  = document.getElementById('docSpecializations').value
        .split(/[،,]/)
        .map(s => s.trim())
        .filter(Boolean);

    let certificates = [];
    try {
        certificates = JSON.parse(document.getElementById('docCertificates').value);
    } catch {
        alert('صيغة ملف الشهادات غير صحيحة، يجب أن تكون JSON Array.');
        return;
    }

    const payload = { name, photo_url, bio, experience_years, specializations, certificates };

    supabaseClient.from('page_sections').update({
        draft_content: payload,
        status: 'draft',
        updated_at: new Date().toISOString(),
    }).eq('id', sectionId)
        .then(({ error }) => {
            if (error) {
                alert(error.message);
            } else {
                logAuditAction('page_sections:update_doctor', `page_sections:${sectionId}`, null, payload);
                alert('✅ تم حفظ بيانات السيرة الذاتية للطبيب بنجاح كمسودة! اضغط على زر النشر أو لوحة نشر الصفحة الرئيسية للتفعيل.');
            }
        });
}
