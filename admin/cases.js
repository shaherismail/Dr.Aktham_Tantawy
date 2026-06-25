// cases.js
// Smile Transformation Cases Module
// CRUD management for case_card (before/after) component_content records.

import { AppState } from './services/db.js';
import { logAuditAction } from './services/audit.js';
import { softDeleteRecord, publishComponentContent, COMPONENT_IDS } from './utils.js';
import { setTableLoading, setTableError } from './ui/table.js';

const CASE_CID = COMPONENT_IDS.CASE_CARD;

// ---------------------------------------------------------------------------
// LIST
// ---------------------------------------------------------------------------

/** Loads all case cards and renders them in the cases table. */
export function loadCases() {
    setTableLoading('casesListTableBody', 9);

    AppState.supabaseClient.from('component_content')
        .select('*')
        .eq('component_id', CASE_CID)
        .eq('is_deleted', false)
        .order('display_order', { ascending: true })
        .then(({ data, error }) => {
            const listBody = document.getElementById('casesListTableBody');
            if (error || !data) { setTableError('casesListTableBody', 9, 'فشل تحميل الحالات.'); return; }

            listBody.innerHTML = '';
            data.forEach(item => {
                const c       = item.draft_data || {};
                const isDraft = item.status === 'draft';
                const tr      = document.createElement('tr');

                tr.innerHTML = `
                    <td>
                        <div style="display:flex; gap:4px;">
                            <img src="${c.before_image_url || ''}" style="width:40px;height:40px;object-fit:cover;border-radius:4px;" title="قبل">
                            <img src="${c.after_image_url  || ''}" style="width:40px;height:40px;object-fit:cover;border-radius:4px;" title="بعد">
                        </div>
                    </td>
                    <td style="font-weight:600;">${c.title || ''}<br><span style="font-size:11px;color:var(--text-muted);">${c.treatment_type || ''}</span></td>
                    <td>${c.patient_age || '?'} سنة • ${c.duration || '?'}</td>
                    <td>${c.visits || 0} زيارات<br><span style="font-size:11px;color:var(--text-muted);">${c.doctor_notes || ''}</span></td>
                    <td><span class="badge ${c.is_featured ? 'badge-success' : 'badge-danger'}">${c.is_featured ? 'نعم' : 'لا'}</span></td>
                    <td><span class="badge ${item.is_visible ? 'badge-success' : 'badge-danger'}">${item.is_visible ? 'نشط' : 'مخفي'}</span></td>
                    <td><span class="badge ${isDraft ? 'badge-warning' : 'badge-success'}">${isDraft ? 'مسودة' : 'منشور'}</span></td>
                    <td><code>${c.category || ''}</code></td>
                    <td>
                        <div style="display:flex; gap:6px;">
                            ${isDraft ? `<button class="btn btn-primary btn-sm pub-btn" title="نشر"><i class="bx bx-cloud-upload"></i></button>` : ''}
                            <button class="btn btn-secondary btn-sm edit-btn"><i class="bx bx-edit"></i></button>
                            <button class="btn btn-danger btn-sm del-btn"><i class="bx bx-trash"></i></button>
                        </div>
                    </td>
                `;

                listBody.appendChild(tr);
                tr.querySelector('.edit-btn').onclick = () => openCaseForm(item);
                tr.querySelector('.del-btn').onclick  = () => softDeleteRecord('component_content', item.id, loadCases);
                tr.querySelector('.pub-btn')?.addEventListener('click', () => {
                    if (AppState.currentUserRole !== 'Viewer') publishComponentContent(item.id, loadCases);
                });
            });
        });

    document.getElementById('openAddCaseModalBtn').onclick = () => openCaseForm(null);

    document.getElementById('caseForm').onsubmit = (e) => {
        e.preventDefault();
        _submitCaseForm();
    };
}

// ---------------------------------------------------------------------------
// FORM SUBMIT
// ---------------------------------------------------------------------------

function _submitCaseForm() {
    if (AppState.currentUserRole === 'Viewer') { alert('حساب المشاهد لا يملك صلاحية التعديل.'); return; }

    const id      = document.getElementById('caseFormId').value;
    const payload = {
        title:            document.getElementById('caseFormTitle').value,
        before_image_url: document.getElementById('caseFormBeforeUrl').value,
        after_image_url:  document.getElementById('caseFormAfterUrl').value,
        treatment_type:   document.getElementById('caseFormTreatment').value,
        category:         document.getElementById('caseFormCategory').value,
        patient_age:      parseInt(document.getElementById('caseFormAge').value) || 20,
        duration:         document.getElementById('caseFormDuration').value,
        visits:           parseInt(document.getElementById('caseFormVisits').value) || 5,
        doctor_notes:     document.getElementById('caseFormNotes').value,
        is_featured:      document.getElementById('caseFormFeatured').checked,
    };

    const query = id
        ? AppState.supabaseClient.from('component_content').update({ draft_data: payload, status: 'draft', updated_at: new Date().toISOString() }).eq('id', id)
        : AppState.supabaseClient.from('component_content').insert([{ component_id: CASE_CID, draft_data: payload, published_data: payload, status: 'draft', is_visible: true, display_order: 99 }]);

    query.then(({ error }) => {
        if (error) {
            alert(error.message);
        } else {
            logAuditAction(id ? 'component_content:update' : 'component_content:insert', `component_content:${id || 'new'}`, null, payload);
            alert(id ? '✅ تم تحديث الحالة بنجاح كمسودة!' : '✅ تم إضافة الحالة بنجاح!');
            document.getElementById('caseModal').style.display = 'none';
            loadCases();
        }
    });
}

// ---------------------------------------------------------------------------
// FORM OPEN
// ---------------------------------------------------------------------------

/**
 * Opens the case form modal and populates for editing.
 * @param {object|null} c - Existing record or null for new
 */
export function openCaseForm(c) {
    document.getElementById('caseModal').style.display = 'flex';
    document.getElementById('caseForm').reset();

    if (c) {
        const d = c.draft_data || {};
        document.getElementById('caseFormId').value           = c.id;
        document.getElementById('caseFormTitle').value        = d.title            || '';
        document.getElementById('caseFormBeforeUrl').value    = d.before_image_url || '';
        document.getElementById('caseFormAfterUrl').value     = d.after_image_url  || '';
        document.getElementById('caseFormTreatment').value    = d.treatment_type   || '';
        document.getElementById('caseFormCategory').value     = d.category         || 'all';
        document.getElementById('caseFormAge').value          = d.patient_age      || '';
        document.getElementById('caseFormDuration').value     = d.duration         || '';
        document.getElementById('caseFormVisits').value       = d.visits           || '';
        document.getElementById('caseFormNotes').value        = d.doctor_notes     || '';
        document.getElementById('caseFormFeatured').checked   = d.is_featured === true;
        document.getElementById('caseModalTitle').textContent  = 'تعديل حالة Smile Transformation';
    } else {
        document.getElementById('caseFormId').value            = '';
        document.getElementById('caseModalTitle').textContent   = 'إضافة حالة Smile Transformation جديدة';
    }
}
