// modules/services.js
// Medical Services Module
// CRUD management for service_card component_content records.

import { AppState } from '../state/AppState.js';
import { logAuditAction } from '../services/audit.js';
import { softDeleteRecord, publishComponentContent, COMPONENT_IDS } from '../utils/helpers.js';

// ---------------------------------------------------------------------------
// SERVICE LIST
// ---------------------------------------------------------------------------

/** Loads all service cards and renders them in the services table. */
export function loadServices() {
    const { supabaseClient } = AppState;
    const listBody = document.getElementById('servicesListTableBody');
    listBody.innerHTML = '<tr><td colspan="9" style="text-align:center;">جاري تحميل الخدمات...</td></tr>';

    supabaseClient.from('component_content')
        .select('*')
        .eq('component_id', COMPONENT_IDS.SERVICE_CARD)
        .eq('is_deleted', false)
        .order('display_order', { ascending: true })
        .then(({ data, error }) => {
            if (error || !data) {
                listBody.innerHTML = '<tr><td colspan="9" style="text-align:center; color:red;">فشل تحميل الخدمات.</td></tr>';
                return;
            }

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
                            ${isDraft ? `<button class="btn btn-primary btn-sm publish-service-row-btn" data-id="${item.id}" title="نشر التعديل"><i class="bx bx-cloud-upload"></i></button>` : ''}
                            <button class="btn btn-secondary btn-sm edit-service-btn" data-id="${item.id}"><i class="bx bx-edit"></i></button>
                            <button class="btn btn-danger btn-sm delete-service-btn" data-id="${item.id}"><i class="bx bx-trash"></i></button>
                        </div>
                    </td>
                `;

                listBody.appendChild(tr);

                tr.querySelector('.edit-service-btn').onclick   = () => openServiceForm(item);
                tr.querySelector('.delete-service-btn').onclick = () => softDeleteRecord('component_content', item.id, loadServices);

                const pubBtn = tr.querySelector('.publish-service-row-btn');
                if (pubBtn) {
                    pubBtn.onclick = () => {
                        if (AppState.currentUserRole === 'Viewer') return;
                        publishComponentContent(item.id, loadServices);
                    };
                }
            });
        });

    // Bind "Add Service" button
    document.getElementById('openAddServiceModalBtn').onclick = () => openServiceForm(null);

    // Bind service form submission
    const serviceForm = document.getElementById('serviceForm');
    serviceForm.onsubmit = (e) => {
        e.preventDefault();
        _handleServiceFormSubmit();
    };
}

// ---------------------------------------------------------------------------
// FORM SUBMIT HANDLER (private)
// ---------------------------------------------------------------------------

function _handleServiceFormSubmit() {
    const { supabaseClient, currentUserRole } = AppState;

    if (currentUserRole === 'Viewer') {
        alert('حساب المشاهد لا يملك صلاحية التعديل.');
        return;
    }

    const id           = document.getElementById('serviceFormId').value;
    const title        = document.getElementById('serviceFormTitle').value;
    const description  = document.getElementById('serviceFormDesc').value;
    const duration     = document.getElementById('serviceFormDuration').value;
    const price        = document.getElementById('serviceFormPrice').value;
    const icon         = document.getElementById('serviceFormIcon').value;
    const image_url    = document.getElementById('serviceFormImageUrl').value;
    const category     = document.getElementById('serviceFormCategory').value;
    const is_featured  = document.getElementById('serviceFormFeatured').checked;

    const payload = { title, description, duration, price, icon, image_url, category, is_featured };

    if (id) {
        // UPDATE existing record
        supabaseClient.from('component_content').update({
            draft_data: payload,
            status: 'draft',
            updated_at: new Date().toISOString(),
        }).eq('id', id).then(({ error }) => {
            if (error) {
                alert(error.message);
            } else {
                logAuditAction('component_content:update', `component_content:${id}`, null, payload);
                alert('✅ تم تحديث الخدمة الطبية بنجاح كمسودة! اضغط على زر النشر لاعتمادها.');
                document.getElementById('serviceModal').style.display = 'none';
                loadServices();
            }
        });
    } else {
        // INSERT new record
        supabaseClient.from('component_content').insert([{
            component_id: COMPONENT_IDS.SERVICE_CARD,
            draft_data: payload,
            published_data: payload,
            status: 'draft',
            is_visible: true,
            display_order: 99,
        }]).then(({ error }) => {
            if (error) {
                alert(error.message);
            } else {
                logAuditAction('component_content:insert', 'component_content:new_service', null, payload);
                alert('✅ تم إضافة الخدمة الطبية بنجاح كمسودة!');
                document.getElementById('serviceModal').style.display = 'none';
                loadServices();
            }
        });
    }
}

// ---------------------------------------------------------------------------
// FORM OPEN
// ---------------------------------------------------------------------------

/**
 * Opens the service form modal and populates fields if editing an existing item.
 * @param {object|null} item - Existing component_content record, or null for new
 */
export function openServiceForm(item) {
    document.getElementById('serviceModal').style.display = 'flex';
    const form = document.getElementById('serviceForm');
    form.reset();

    if (item) {
        const service = item.draft_data || {};
        document.getElementById('serviceFormId').value          = item.id;
        document.getElementById('serviceFormTitle').value       = service.title        || '';
        document.getElementById('serviceFormDesc').value        = service.description  || '';
        document.getElementById('serviceFormDuration').value    = service.duration     || '';
        document.getElementById('serviceFormPrice').value       = service.price        || '';
        document.getElementById('serviceFormIcon').value        = service.icon         || 'bx-smile';
        document.getElementById('serviceFormImageUrl').value    = service.image_url    || '';
        document.getElementById('serviceFormCategory').value    = service.category     || 'تقويم';
        document.getElementById('serviceFormFeatured').checked  = service.is_featured === true;
        document.getElementById('serviceModalTitle').textContent = 'تعديل الخدمة الطبية';
    } else {
        document.getElementById('serviceFormId').value           = '';
        document.getElementById('serviceModalTitle').textContent  = 'إضافة خدمة طبية جديدة';
    }

    import('./ai-assistant-init.js').catch(() => {
        // Lazy-load AI assistant; silently skip if unavailable
        import('../../assets/js/ai-assistant.js').then(({ attachAIAssistant }) => {
            document.querySelectorAll('#serviceForm input[type="text"], #serviceForm textarea').forEach(field => {
                const id = field.id || '';
                if (!id.includes('Url') && !id.includes('Icon') && !id.includes('Id') && !id.includes('Color') && !id.includes('Price') && !id.includes('Duration')) {
                    attachAIAssistant(field);
                }
            });
        }).catch(() => {});
    });
}
