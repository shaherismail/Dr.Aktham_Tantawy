// modules/cases.js
// Smile Transformation Cases Module
// CRUD management for case_card (before/after) component_content records.

import { AppState } from '../state/AppState.js';
import { logAuditAction } from '../services/audit.js';
import { softDeleteRecord, publishComponentContent, COMPONENT_IDS } from '../utils/helpers.js';

// ---------------------------------------------------------------------------
// CASES LIST
// ---------------------------------------------------------------------------

/** Loads all case cards and renders them in the cases table. */
export function loadCases() {
    const { supabaseClient } = AppState;
    const listBody = document.getElementById('casesListTableBody');
    listBody.innerHTML = '<tr><td colspan="9" style="text-align:center;">جاري تحميل الحالات الناجحة...</td></tr>';

    supabaseClient.from('component_content')
        .select('*')
        .eq('component_id', COMPONENT_IDS.CASE_CARD)
        .eq('is_deleted', false)
        .order('display_order', { ascending: true })
        .then(({ data, error }) => {
            if (error || !data) {
                listBody.innerHTML = '<tr><td colspan="9" style="text-align:center; color:red;">فشل تحميل الحالات.</td></tr>';
                return;
            }

            listBody.innerHTML = '';

            data.forEach(item => {
                const c       = item.draft_data || {};
                const isDraft = item.status === 'draft';
                const tr      = document.createElement('tr');

                tr.innerHTML = `
                    <td>
                        <div style="display:flex; gap:4px;">
                            <img src="${c.before_image_url || ''}" style="width:40px; height:40px; object-fit:cover; border-radius:4px;" title="قبل">
                            <img src="${c.after_image_url  || ''}" style="width:40px; height:40px; object-fit:cover; border-radius:4px;" title="بعد">
                        </div>
                    </td>
                    <td style="font-weight:600;">${c.title || ''}<br><span style="font-size:11px; color:var(--text-muted);">${c.treatment_type || ''}</span></td>
                    <td>${c.patient_age || '?'} سنة • ${c.duration || '?'}</td>
                    <td>${c.visits || 0} زيارات<br><span style="font-size:11px; color:var(--text-muted);">${c.doctor_notes || ''}</span></td>
                    <td><span class="badge ${c.is_featured ? 'badge-success' : 'badge-danger'}">${c.is_featured ? 'نعم' : 'لا'}</span></td>
                    <td><span class="badge ${item.is_visible ? 'badge-success' : 'badge-danger'}">${item.is_visible ? 'نشط' : 'مخفي'}</span></td>
                    <td><span class="badge ${isDraft ? 'badge-warning' : 'badge-success'}">${isDraft ? 'مسودة' : 'منشور'}</span></td>
                    <td><code>${c.category || ''}</code></td>
                    <td>
                        <div style="display:flex; gap:6px;">
                            ${isDraft ? `<button class="btn btn-primary btn-sm publish-case-row-btn" data-id="${item.id}" title="نشر التعديل"><i class="bx bx-cloud-upload"></i></button>` : ''}
                            <button class="btn btn-secondary btn-sm edit-case-btn" data-id="${item.id}"><i class="bx bx-edit"></i></button>
                            <button class="btn btn-danger btn-sm delete-case-btn" data-id="${item.id}"><i class="bx bx-trash"></i></button>
                        </div>
                    </td>
                `;

                listBody.appendChild(tr);

                tr.querySelector('.edit-case-btn').onclick   = () => openCaseForm(item);
                tr.querySelector('.delete-case-btn').onclick = () => softDeleteRecord('component_content', item.id, loadCases);

                const pubBtn = tr.querySelector('.publish-case-row-btn');
                if (pubBtn) {
                    pubBtn.onclick = () => {
                        if (AppState.currentUserRole === 'Viewer') return;
                        publishComponentContent(item.id, loadCases);
                    };
                }
            });
        });

    // Bind "Add Case" button
    document.getElementById('openAddCaseModalBtn').onclick = () => openCaseForm(null);

    // Bind case form submission
    const caseForm = document.getElementById('caseForm');
    caseForm.onsubmit = (e) => {
        e.preventDefault();
        _handleCaseFormSubmit();
    };
}

// ---------------------------------------------------------------------------
// FORM SUBMIT HANDLER (private)
// ---------------------------------------------------------------------------

function _handleCaseFormSubmit() {
    const { supabaseClient, currentUserRole } = AppState;

    if (currentUserRole === 'Viewer') {
        alert('حساب المشاهد لا يملك صلاحية التعديل.');
        return;
    }

    const id               = document.getElementById('caseFormId').value;
    const title            = document.getElementById('caseFormTitle').value;
    const before_image_url = document.getElementById('caseFormBeforeUrl').value;
    const after_image_url  = document.getElementById('caseFormAfterUrl').value;
    const treatment_type   = document.getElementById('caseFormTreatment').value;
    const category         = document.getElementById('caseFormCategory').value;
    const patient_age      = parseInt(document.getElementById('caseFormAge').value) || 20;
    const duration         = document.getElementById('caseFormDuration').value;
    const visits           = parseInt(document.getElementById('caseFormVisits').value) || 5;
    const doctor_notes     = document.getElementById('caseFormNotes').value;
    const is_featured      = document.getElementById('caseFormFeatured').checked;

    const payload = {
        title, before_image_url, after_image_url, treatment_type,
        category, patient_age, duration, visits, doctor_notes, is_featured,
    };

    if (id) {
        // UPDATE existing case
        supabaseClient.from('component_content').update({
            draft_data: payload,
            status: 'draft',
            updated_at: new Date().toISOString(),
        }).eq('id', id).then(({ error }) => {
            if (error) {
                alert(error.message);
            } else {
                logAuditAction('component_content:update', `component_content:${id}`, null, payload);
                alert('✅ تم تحديث الحالة بنجاح كمسودة! اضغط على زر النشر لاعتمادها.');
                document.getElementById('caseModal').style.display = 'none';
                loadCases();
            }
        });
    } else {
        // INSERT new case
        supabaseClient.from('component_content').insert([{
            component_id: COMPONENT_IDS.CASE_CARD,
            draft_data: payload,
            published_data: payload,
            status: 'draft',
            is_visible: true,
            display_order: 99,
        }]).then(({ error }) => {
            if (error) {
                alert(error.message);
            } else {
                logAuditAction('component_content:insert', 'component_content:new_case', null, payload);
                alert('✅ تم إضافة الحالة بنجاح كمسودة!');
                document.getElementById('caseModal').style.display = 'none';
                loadCases();
            }
        });
    }
}

// ---------------------------------------------------------------------------
// FORM OPEN
// ---------------------------------------------------------------------------

/**
 * Opens the case form modal and populates fields for editing.
 * @param {object|null} c - Existing component_content record, or null for new
 */
export function openCaseForm(c) {
    document.getElementById('caseModal').style.display = 'flex';
    const form = document.getElementById('caseForm');
    form.reset();

    if (c) {
        const caseData = c.draft_data || {};
        document.getElementById('caseFormId').value          = c.id;
        document.getElementById('caseFormTitle').value       = caseData.title            || '';
        document.getElementById('caseFormBeforeUrl').value   = caseData.before_image_url || '';
        document.getElementById('caseFormAfterUrl').value    = caseData.after_image_url  || '';
        document.getElementById('caseFormTreatment').value   = caseData.treatment_type   || '';
        document.getElementById('caseFormCategory').value    = caseData.category         || 'all';
        document.getElementById('caseFormAge').value         = caseData.patient_age      || '';
        document.getElementById('caseFormDuration').value    = caseData.duration         || '';
        document.getElementById('caseFormVisits').value      = caseData.visits           || '';
        document.getElementById('caseFormNotes').value       = caseData.doctor_notes     || '';
        document.getElementById('caseFormFeatured').checked  = caseData.is_featured === true;
        document.getElementById('caseModalTitle').textContent = 'تعديل حالة Smile Transformation';
    } else {
        document.getElementById('caseFormId').value           = '';
        document.getElementById('caseModalTitle').textContent  = 'إضافة حالة Smile Transformation جديدة';
    }

    import('../assets/js/ai-assistant.js').then(({ attachAIAssistant }) => {
        document.querySelectorAll('#caseForm input[type="text"], #caseForm textarea').forEach(field => {
            const id = field.id || '';
            if (!id.includes('Url') && !id.includes('Id') && !id.includes('Age') && !id.includes('Duration') && !id.includes('Visits')) {
                attachAIAssistant(field);
            }
        });
    }).catch(() => {});
}
