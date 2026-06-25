// services.js   ← Medical Services Feature Module (not the services/ folder)
// CRUD management for service_card component_content records.

import { AppState } from './services/db.js';
import { logAuditAction } from './services/audit.js';
import { softDeleteRecord, publishComponentContent, COMPONENT_IDS } from './utils.js';
import { setTableLoading, setTableError } from './ui/table.js';

const SERVICE_CID = COMPONENT_IDS.SERVICE_CARD;

// ---------------------------------------------------------------------------
// LIST
// ---------------------------------------------------------------------------

/** Loads all service cards and renders them in the services table. */
export function loadServices() {
    setTableLoading('servicesListTableBody', 9);

    AppState.supabaseClient.from('component_content')
        .select('*')
        .eq('component_id', SERVICE_CID)
        .eq('is_deleted', false)
        .order('display_order', { ascending: true })
        .then(({ data, error }) => {
            const listBody = document.getElementById('servicesListTableBody');
            if (error || !data) { setTableError('servicesListTableBody', 9, 'فشل تحميل الخدمات.'); return; }

            listBody.innerHTML = '';
            data.forEach(item => {
                const s       = item.draft_data || {};
                const isDraft = item.status === 'draft';
                const tr      = document.createElement('tr');

                tr.innerHTML = `
                    <td><span class="drag-handle"><i class="bx bx-menu"></i></span></td>
                    <td><i class="bx ${s.icon || 'bx-smile'}" style="font-size:24px; color:var(--accent);"></i></td>
                    <td style="font-weight:600;">${s.title || ''}</td>
                    <td style="max-width:250px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${s.description || ''}</td>
                    <td>${s.duration || 'غير محدد'}</td>
                    <td>${s.price || 'غير محدد'}</td>
                    <td><span class="badge ${item.is_visible ? 'badge-success' : 'badge-danger'}">${item.is_visible ? 'نشط' : 'مخفي'}</span></td>
                    <td><span class="badge ${isDraft ? 'badge-warning' : 'badge-success'}">${isDraft ? 'مسودة' : 'منشور'}</span></td>
                    <td>
                        <div style="display:flex; gap:6px;">
                            ${isDraft ? `<button class="btn btn-primary btn-sm pub-btn" title="نشر"><i class="bx bx-cloud-upload"></i></button>` : ''}
                            <button class="btn btn-secondary btn-sm edit-btn"><i class="bx bx-edit"></i></button>
                            <button class="btn btn-danger btn-sm del-btn"><i class="bx bx-trash"></i></button>
                        </div>
                    </td>
                `;

                listBody.appendChild(tr);
                tr.querySelector('.edit-btn').onclick = () => openServiceForm(item);
                tr.querySelector('.del-btn').onclick  = () => softDeleteRecord('component_content', item.id, loadServices);
                tr.querySelector('.pub-btn')?.addEventListener('click', () => {
                    if (AppState.currentUserRole !== 'Viewer') publishComponentContent(item.id, loadServices);
                });
            });
        });

    document.getElementById('openAddServiceModalBtn').onclick = () => openServiceForm(null);

    document.getElementById('serviceForm').onsubmit = (e) => {
        e.preventDefault();
        _submitServiceForm();
    };
}

// ---------------------------------------------------------------------------
// FORM SUBMIT
// ---------------------------------------------------------------------------

function _submitServiceForm() {
    if (AppState.currentUserRole === 'Viewer') { alert('حساب المشاهد لا يملك صلاحية التعديل.'); return; }

    const id          = document.getElementById('serviceFormId').value;
    const payload = {
        title:       document.getElementById('serviceFormTitle').value,
        description: document.getElementById('serviceFormDesc').value,
        duration:    document.getElementById('serviceFormDuration').value,
        price:       document.getElementById('serviceFormPrice').value,
        icon:        document.getElementById('serviceFormIcon').value,
        image_url:   document.getElementById('serviceFormImageUrl').value,
        category:    document.getElementById('serviceFormCategory').value,
        is_featured: document.getElementById('serviceFormFeatured').checked,
    };

    const query = id
        ? AppState.supabaseClient.from('component_content').update({ draft_data: payload, status: 'draft', updated_at: new Date().toISOString() }).eq('id', id)
        : AppState.supabaseClient.from('component_content').insert([{ component_id: SERVICE_CID, draft_data: payload, published_data: payload, status: 'draft', is_visible: true, display_order: 99 }]);

    query.then(({ error }) => {
        if (error) {
            alert(error.message);
        } else {
            logAuditAction(id ? 'component_content:update' : 'component_content:insert', `component_content:${id || 'new'}`, null, payload);
            alert(id ? '✅ تم تحديث الخدمة الطبية بنجاح كمسودة!' : '✅ تم إضافة الخدمة الطبية بنجاح!');
            document.getElementById('serviceModal').style.display = 'none';
            loadServices();
        }
    });
}

// ---------------------------------------------------------------------------
// FORM OPEN
// ---------------------------------------------------------------------------

/**
 * Opens the service form modal and populates for editing.
 * @param {object|null} item - Existing record or null for new
 */
export function openServiceForm(item) {
    document.getElementById('serviceModal').style.display = 'flex';
    document.getElementById('serviceForm').reset();

    if (item) {
        const s = item.draft_data || {};
        document.getElementById('serviceFormId').value          = item.id;
        document.getElementById('serviceFormTitle').value       = s.title       || '';
        document.getElementById('serviceFormDesc').value        = s.description || '';
        document.getElementById('serviceFormDuration').value    = s.duration    || '';
        document.getElementById('serviceFormPrice').value       = s.price       || '';
        document.getElementById('serviceFormIcon').value        = s.icon        || 'bx-smile';
        document.getElementById('serviceFormImageUrl').value    = s.image_url   || '';
        document.getElementById('serviceFormCategory').value    = s.category    || 'تقويم';
        document.getElementById('serviceFormFeatured').checked  = s.is_featured === true;
        document.getElementById('serviceModalTitle').textContent = 'تعديل الخدمة الطبية';
    } else {
        document.getElementById('serviceFormId').value           = '';
        document.getElementById('serviceModalTitle').textContent  = 'إضافة خدمة طبية جديدة';
    }
}
