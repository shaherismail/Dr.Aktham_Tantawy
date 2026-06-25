// homepage.js
// Homepage CMS Editor Module
// Manages section ordering, visibility, spacing, background,
// hero and stats editing, and batch saving.

import { AppState } from './services/db.js';
import { logAuditAction } from './services/audit.js';
import { getSectionArabicName, publishSectionCMS } from './utils.js';

export function loadHomepageCMS() {
    const { supabaseClient } = AppState;
    if (!supabaseClient) return;

    supabaseClient.from('pages').select('id').eq('slug', 'home').single()
        .then(({ data: page, error: pageErr }) => {
            if (pageErr || !page) return;

            supabaseClient.from('page_sections')
                .select('*')
                .eq('page_id', page.id)
                .order('display_order', { ascending: true })
                .then(({ data: sections }) => {
                    if (!sections) return;
                    _populateHeroInputs(sections);
                    _populateStatsInputs(sections);
                    _renderSectionsOrderList(sections);
                });
        });

    document.getElementById('addNewStatBtn').onclick = () => _addStatRow();
    document.getElementById('saveHomepageCMSBtn').onclick = () => _saveHomepageCMS();
}

function _populateHeroInputs(sections) {
    const heroSec = sections.find(s => s.section_type === 'hero');
    if (!heroSec) return;
    const c = heroSec.draft_content || {};
    document.getElementById('cmsHeroTitle').value    = c.title     || '';
    document.getElementById('cmsHeroSubtitle').value = c.subtitle  || '';
    document.getElementById('cmsHeroImageUrl').value = c.image_url || '';
    document.getElementById('cmsHeroVideoUrl').value = c.video_url || '';
}

function _populateStatsInputs(sections) {
    const statsSec = sections.find(s => s.section_type === 'stats');
    const statsContainer = document.getElementById('cmsStatsContainer');
    statsContainer.innerHTML = '';
    if (!statsSec) return;
    ((statsSec.draft_content || {}).statistics || []).forEach(st => _addStatRow(st.label, st.value, statsContainer));
}

function _addStatRow(label = '', value = '', container = null) {
    const el = container || document.getElementById('cmsStatsContainer');
    const row = document.createElement('div');
    row.className = 'form-grid';
    row.style.marginBottom = '10px';
    row.innerHTML = `
        <div class="form-group"><label class="form-label">الاسم التوضيحي</label><input type="text" class="form-input stat-lbl-input" value="${label}" placeholder="حالة تقويم"></div>
        <div class="form-group"><label class="form-label">القيمة</label><input type="text" class="form-input stat-val-input" value="${value}" placeholder="3000+"></div>
        <button class="btn btn-danger btn-sm del-stat-btn" style="margin-top:28px;"><i class="bx bx-trash"></i></button>
    `;
    el.appendChild(row);
    row.querySelector('.del-stat-btn').onclick = () => row.remove();
}

function _renderSectionsOrderList(sections) {
    const orderList = document.getElementById('homepageSectionsOrderingList');
    orderList.innerHTML = '';

    sections.forEach(sec => {
        const li      = document.createElement('div');
        li.className  = 'section-builder-item';
        li.setAttribute('data-id', sec.id);
        li.setAttribute('data-type', sec.section_type);

        Object.assign(li.style, {
            display: 'flex', flexDirection: 'column', gap: '12px',
            padding: '16px', background: 'var(--bg-panel-sec, #f8fafc)',
            border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '8px', marginBottom: '12px',
        });

        const isChecked = sec.is_visible !== false;
        const isDraft   = sec.status === 'draft';

        li.innerHTML = `
            <div style="display:flex; align-items:center; justify-content:space-between;">
                <div style="display:flex; align-items:center; gap:12px; flex:1;">
                    <span class="drag-handle" style="cursor:grab;"><i class="bx bx-menu"></i></span>
                    <span style="font-weight:600;">${getSectionArabicName(sec.section_type)}</span>
                    <span class="badge ${isDraft ? 'badge-warning' : 'badge-success'}" style="padding:2px 8px; border-radius:4px; font-size:11px;">${isDraft ? 'مسودة' : 'منشور'}</span>
                </div>
                <div style="display:flex; align-items:center; gap:8px;">
                    <label style="font-size:12px; display:flex; align-items:center; gap:4px; margin:0;">
                        <input type="checkbox" class="sec-vis" ${isChecked ? 'checked' : ''}> مرئي
                    </label>
                    <button class="btn btn-secondary btn-sm up-btn"><i class="bx bx-chevron-up"></i></button>
                    <button class="btn btn-secondary btn-sm dn-btn"><i class="bx bx-chevron-down"></i></button>
                </div>
            </div>
            <div style="display:flex; gap:12px; font-size:12px; align-items:flex-end;">
                <div style="flex:1;">
                    <label class="form-label" style="font-size:11px; margin-bottom:4px;">التباعد</label>
                    <select class="form-input sec-spacing" style="padding:4px 8px; height:auto; font-size:12px;">
                        <option value="padding-small"  ${sec.spacing === 'padding-small'  ? 'selected' : ''}>صغير</option>
                        <option value="padding-medium" ${sec.spacing === 'padding-medium' ? 'selected' : ''}>متوسط</option>
                        <option value="padding-large"  ${sec.spacing === 'padding-large'  ? 'selected' : ''}>كبير</option>
                    </select>
                </div>
                <div style="flex:1;">
                    <label class="form-label" style="font-size:11px; margin-bottom:4px;">الخلفية</label>
                    <select class="form-input sec-bg" style="padding:4px 8px; height:auto; font-size:12px;">
                        <option value="glass"  ${sec.background_style === 'glass'  ? 'selected' : ''}>زجاجي</option>
                        <option value="light"  ${sec.background_style === 'light'  ? 'selected' : ''}>مضيء</option>
                        <option value="dark"   ${sec.background_style === 'dark'   ? 'selected' : ''}>مظلم</option>
                        <option value="accent" ${sec.background_style === 'accent' ? 'selected' : ''}>تمييز</option>
                    </select>
                </div>
                <div>
                    <button class="btn btn-primary btn-sm pub-sec-btn" ${!isDraft ? 'disabled' : ''}>
                        <i class="bx bx-cloud-upload"></i> نشر
                    </button>
                </div>
            </div>
        `;

        orderList.appendChild(li);

        li.querySelector('.up-btn').onclick = () => { const p = li.previousElementSibling; if (p) orderList.insertBefore(li, p); };
        li.querySelector('.dn-btn').onclick = () => { const n = li.nextElementSibling;     if (n) orderList.insertBefore(n, li); };
        li.querySelector('.pub-sec-btn').onclick = () => {
            if (AppState.currentUserRole === 'Viewer') return;
            publishSectionCMS(sec.id, loadHomepageCMS);
        };
    });
}

function _saveHomepageCMS() {
    if (AppState.currentUserRole === 'Viewer') { alert('حساب المشاهد لا يملك صلاحية تعديل نصوص الموقع.'); return; }

    const heroPayload = {
        title:     document.getElementById('cmsHeroTitle').value,
        subtitle:  document.getElementById('cmsHeroSubtitle').value,
        image_url: document.getElementById('cmsHeroImageUrl').value,
        video_url: document.getElementById('cmsHeroVideoUrl').value,
    };

    const stats = [];
    document.querySelectorAll('#cmsStatsContainer .form-grid').forEach(row => {
        const lbl = row.querySelector('.stat-lbl-input').value;
        const val = row.querySelector('.stat-val-input').value;
        if (lbl && val) stats.push({ label: lbl, value: val });
    });

    const promises = [];
    let index = 0;
    document.querySelectorAll('#homepageSectionsOrderingList > div').forEach(li => {
        const sectionId        = li.getAttribute('data-id');
        const sectionType      = li.getAttribute('data-type');
        const payload          = {
            display_order: index++,
            is_visible:    li.querySelector('.sec-vis').checked,
            spacing:       li.querySelector('.sec-spacing').value,
            background_style: li.querySelector('.sec-bg').value,
            status: 'draft',
            updated_at: new Date().toISOString(),
        };
        if (sectionType === 'hero')  payload.draft_content = heroPayload;
        if (sectionType === 'stats') payload.draft_content = { statistics: stats };
        promises.push(AppState.supabaseClient.from('page_sections').update(payload).eq('id', sectionId));
    });

    Promise.all(promises).then(results => {
        const err = results.find(r => r.error)?.error;
        if (err) {
            alert('خطأ أثناء الحفظ: ' + err.message);
        } else {
            logAuditAction('page_sections:update_batch', 'page_sections:batch', null, { count: promises.length });
            alert('🎉 تم حفظ جميع تعديلات الواجهة كمسودة بنجاح!');
            loadHomepageCMS();
        }
    });
}
