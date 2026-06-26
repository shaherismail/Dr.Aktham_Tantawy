// doctor.js
// Doctor Profile CMS Module

import { AppState } from './services/db.js';
import { logAuditAction } from './services/audit.js';

export function loadDoctorCMS() {
    AppState.supabaseClient.from('page_sections')
        .select('*').eq('section_type', 'doctor').single()
        .then(({ data, error }) => {
            if (error || !data) return;
            const c = data.draft_content || {};
            document.getElementById('docName').value            = c.name                              || '';
            document.getElementById('docPhotoUrl').value        = c.photo_url                         || '';
            document.getElementById('docBio').value             = c.bio                               || '';
            document.getElementById('docExperience').value      = c.experience_years                   || 15;
            document.getElementById('docSpecializations').value = (c.specializations || []).join('، ');
            document.getElementById('docCertificates').value    = JSON.stringify(c.certificates || [], null, 2);
            document.getElementById('saveDoctorProfileBtn').onclick = () => _save(data.id);
        });
}

function _save(sectionId) {
    if (AppState.currentUserRole === 'Viewer') { alert('صلاحية مشاهد فقط.'); return; }

    let certificates = [];
    try { certificates = JSON.parse(document.getElementById('docCertificates').value); }
    catch { alert('صيغة ملف الشهادات غير صحيحة (JSON Array مطلوب).'); return; }

    const payload = {
        name:             document.getElementById('docName').value,
        photo_url:        document.getElementById('docPhotoUrl').value,
        bio:              document.getElementById('docBio').value,
        experience_years: parseInt(document.getElementById('docExperience').value) || 15,
        specializations:  document.getElementById('docSpecializations').value.split(/[،,]/).map(s => s.trim()).filter(Boolean),
        certificates,
    };

    AppState.supabaseClient.from('page_sections').update({ draft_content: payload, status: 'draft', updated_at: new Date().toISOString() }).eq('id', sectionId)
        .then(({ error }) => {
            if (error) alert(error.message);
            else {
                logAuditAction('page_sections:update_doctor', `page_sections:${sectionId}`, null, payload);
                alert('✅ تم حفظ بيانات السيرة الذاتية بنجاح كمسودة!');
            }
        });
}
