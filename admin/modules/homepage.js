// modules/homepage.js
// Homepage CMS Editor Module
// Manages page sections ordering, visibility, spacing, background,
// hero content editing, stats builder, and batch section saving.

import { AppState } from '../state/AppState.js';
import { logAuditAction } from '../services/audit.js';
import { getSectionArabicName, publishSectionCMS } from '../utils/helpers.js';

// ---------------------------------------------------------------------------
// HOMEPAGE CMS LOADER
// ---------------------------------------------------------------------------

/**
 * Loads the homepage CMS editor:
 * - Fetches page sections for the 'home' page
 * - Populates hero and stats inputs
 * - Renders the draggable section ordering list
 * - Binds save and stat-management buttons
 */
export function loadHomepageCMS() {
    const { supabaseClient } = AppState;
    if (!supabaseClient) return;

    supabaseClient.from('pages').select('id').eq('slug', 'home').single()
        .then(({ data: page, error: pageErr }) => {
            if (pageErr || !page) {
                console.error('Failed to load homepage metadata:', pageErr);
                return;
            }

            supabaseClient.from('page_sections')
                .select('*')
                .eq('page_id', page.id)
                .order('display_order', { ascending: true })
                .then(({ data: sections, error: secErr }) => {
                    if (secErr || !sections) {
                        console.error('Failed to load page sections:', secErr);
                        return;
                    }

                    _populateHeroInputs(sections);
                    _populateStatsInputs(sections);
                    _renderSectionsOrderList(sections);

                    import('../assets/js/ai-assistant.js').then(({ attachAIAssistant }) => {
                        document.querySelectorAll('#homepageCMSSection input[type="text"], #homepageCMSSection textarea').forEach(field => {
                            attachAIAssistant(field);
                        });
                    }).catch(() => {});
                });
        });

    // Bind stat addition button
    document.getElementById('addNewStatBtn').onclick = () => _addStatRow();

    // Bind save button
    document.getElementById('saveHomepageCMSBtn').onclick = () => _saveHomepageCMS();
}

// ---------------------------------------------------------------------------
// HERO INPUTS (private)
// ---------------------------------------------------------------------------

function _populateHeroInputs(sections) {
    const heroSec = sections.find(s => s.section_type === 'hero');
    if (!heroSec) return;

    const content = heroSec.draft_content || {};
    document.getElementById('cmsHeroTitle').value    = content.title     || '';
    document.getElementById('cmsHeroSubtitle').value = content.subtitle  || '';
    document.getElementById('cmsHeroImageUrl').value = content.image_url || '';
    document.getElementById('cmsHeroVideoUrl').value = content.video_url || '';
}

// ---------------------------------------------------------------------------
// STATS INPUTS (private)
// ---------------------------------------------------------------------------

function _populateStatsInputs(sections) {
    const statsSec       = sections.find(s => s.section_type === 'stats');
    const statsContainer = document.getElementById('cmsStatsContainer');
    statsContainer.innerHTML = '';

    if (!statsSec) return;

    const stats = (statsSec.draft_content || {}).statistics || [];
    stats.forEach(st => _addStatRow(st.label, st.value, statsContainer));
}

function _addStatRow(label = '', value = '', container = null) {
    const statsContainer = container || document.getElementById('cmsStatsContainer');
    const row = document.createElement('div');
    row.className = 'form-grid';
    row.style.marginBottom = '10px';
    row.innerHTML = `
        <div class="form-group">
            <label class="form-label">الاسم التوضيحي (Label)</label>
            <input type="text" class="form-input stat-lbl-input" value="${label}" placeholder="حالة تقويم" required>
        </div>
        <div class="form-group">
            <label class="form-label">القيمة الرقمية (Value)</label>
            <input type="text" class="form-input stat-val-input" value="${value}" placeholder="3000+" required>
        </div>
        <button class="btn btn-danger btn-sm delete-stat-row-btn" style="margin-top:28px;"><i class="bx bx-trash"></i></button>
    `;
    statsContainer.appendChild(row);
    row.querySelector('.delete-stat-row-btn').onclick = () => row.remove();
}

// ---------------------------------------------------------------------------
// SECTIONS ORDER LIST (private)
// ---------------------------------------------------------------------------

function _renderSectionsOrderList(sections) {
    const orderList = document.getElementById('homepageSectionsOrderingList');
    orderList.innerHTML = '';

    sections.forEach(sec => {
        const li      = document.createElement('div');
        li.className  = 'section-builder-item';
        li.setAttribute('data-id',   sec.id);
        li.setAttribute('data-type', sec.section_type);

        Object.assign(li.style, {
            display: 'flex', flexDirection: 'column', gap: '12px',
            padding: '16px',
            background: 'var(--bg-panel-sec, #f8fafc)',
            border: '1px solid var(--border-color, #e2e8f0)',
            borderRadius: '8px',
            marginBottom: '12px',
        });

        const isChecked = sec.is_visible !== false;
        const isDraft   = sec.status === 'draft';

        li.innerHTML = `
            <div style="display:flex; align-items:center; justify-content:space-between; width:100%;">
                <div style="display:flex; align-items:center; gap:12px; flex:1;">
                    <span class="drag-handle" style="cursor:grab;"><i class="bx bx-menu"></i></span>
                    <span style="font-weight:600;">${getSectionArabicName(sec.section_type)}</span>
                    <span class="badge ${isDraft ? 'badge-warning' : 'badge-success'}" style="margin-right:8px; display:inline-block; padding:2px 8px; border-radius:4px; font-size:11px;">${isDraft ? 'مسودة (عدم النشر)' : 'منشور للعامة'}</span>
                </div>
                <div style="display:flex; align-items:center; gap:8px;">
                    <label style="font-size:12px; display:flex; align-items:center; gap:4px; margin:0;">
                        <input type="checkbox" class="section-vis-checkbox" ${isChecked ? 'checked' : ''}> مرئي
                    </label>
                    <div style="display:flex; gap:4px;">
                        <button class="btn btn-secondary btn-sm move-up-btn"><i class="bx bx-chevron-up"></i></button>
                        <button class="btn btn-secondary btn-sm move-down-btn"><i class="bx bx-chevron-down"></i></button>
                    </div>
                </div>
            </div>
            <div style="display:flex; gap:12px; font-size:12px; align-items:flex-end;">
                <div style="flex:1;">
                    <label class="form-label" style="font-size:11px; margin-bottom:4px;">الهوامش والتباعد (Spacing)</label>
                    <select class="form-input section-spacing-select" style="padding:4px 8px; height:auto; font-size:12px;">
                        <option value="padding-small"  ${sec.spacing === 'padding-small'  ? 'selected' : ''}>صغير (Small)</option>
                        <option value="padding-medium" ${sec.spacing === 'padding-medium' ? 'selected' : ''}>متوسط (Medium)</option>
                        <option value="padding-large"  ${sec.spacing === 'padding-large'  ? 'selected' : ''}>كبير (Large)</option>
                    </select>
                </div>
                <div style="flex:1;">
                    <label class="form-label" style="font-size:11px; margin-bottom:4px;">خلفية القسم (Background)</label>
                    <select class="form-input section-bg-select" style="padding:4px 8px; height:auto; font-size:12px;">
                        <option value="glass"  ${sec.background_style === 'glass'  ? 'selected' : ''}>تأثير زجاجي (Glass)</option>
                        <option value="light"  ${sec.background_style === 'light'  ? 'selected' : ''}>مضيء (Light)</option>
                        <option value="dark"   ${sec.background_style === 'dark'   ? 'selected' : ''}>مظلم (Dark)</option>
                        <option value="accent" ${sec.background_style === 'accent' ? 'selected' : ''}>لون تمييز (Accent)</option>
                    </select>
                </div>
                <div>
                    <button class="btn btn-primary btn-sm publish-section-btn" style="padding:6px 12px; font-size:11px;" ${!isDraft ? 'disabled' : ''}>
                        <i class="bx bx-cloud-upload"></i> نشر التعديل
                    </button>
                </div>
            </div>
        `;

        orderList.appendChild(li);

        li.querySelector('.move-up-btn').onclick = (e) => {
            e.preventDefault();
            const prev = li.previousElementSibling;
            if (prev) orderList.insertBefore(li, prev);
        };
        li.querySelector('.move-down-btn').onclick = (e) => {
            e.preventDefault();
            const next = li.nextElementSibling;
            if (next) orderList.insertBefore(next, li);
        };
        li.querySelector('.publish-section-btn').onclick = (e) => {
            e.preventDefault();
            if (AppState.currentUserRole === 'Viewer') {
                alert('لا تملك الصلاحية لنشر التعديلات.');
                return;
            }
            publishSectionCMS(sec.id, loadHomepageCMS);
        };
    });
}

// ---------------------------------------------------------------------------
// SAVE HANDLER (private)
// ---------------------------------------------------------------------------

function _saveHomepageCMS() {
    const { supabaseClient, currentUserRole } = AppState;

    if (currentUserRole === 'Viewer') {
        alert('حساب المشاهد لا يملك صلاحية تعديل نصوص الموقع.');
        return;
    }

    const hero_title      = document.getElementById('cmsHeroTitle').value;
    const hero_subtitle   = document.getElementById('cmsHeroSubtitle').value;
    const hero_image_url  = document.getElementById('cmsHeroImageUrl').value;
    const hero_video_url  = document.getElementById('cmsHeroVideoUrl').value;

    // Collect stats rows
    const stats = [];
    document.querySelectorAll('#cmsStatsContainer .form-grid').forEach(row => {
        const lbl = row.querySelector('.stat-lbl-input').value;
        const val = row.querySelector('.stat-val-input').value;
        if (lbl && val) stats.push({ label: lbl, value: val });
    });

    // Build update promises for each section
    const promises = [];
    let index = 0;

    document.querySelectorAll('#homepageSectionsOrderingList > div').forEach(li => {
        const sectionId        = li.getAttribute('data-id');
        const sectionType      = li.getAttribute('data-type');
        const isVisible        = li.querySelector('.section-vis-checkbox').checked;
        const spacing          = li.querySelector('.section-spacing-select').value;
        const background_style = li.querySelector('.section-bg-select').value;

        const basePayload = {
            display_order: index++,
            is_visible: isVisible,
            spacing,
            background_style,
            status: 'draft',
            updated_at: new Date().toISOString(),
        };

        if (sectionType === 'hero') {
            basePayload.draft_content = { title: hero_title, subtitle: hero_subtitle, image_url: hero_image_url, video_url: hero_video_url };
        } else if (sectionType === 'stats') {
            basePayload.draft_content = { statistics: stats };
        }

        promises.push(
            supabaseClient.from('page_sections').update(basePayload).eq('id', sectionId)
        );
    });

    Promise.all(promises).then(results => {
        const error = results.find(r => r.error)?.error;
        if (error) {
            alert('حدث خطأ أثناء حفظ الأقسام: ' + error.message);
        } else {
            logAuditAction('page_sections:update_batch', 'page_sections:batch', null, { count: promises.length });
            alert('🎉 تم حفظ جميع تعديلات الواجهة كمسودة بنجاح! اضغط على "نشر التعديل" في كل قسم لاعتماده للموقع العام.');
            loadHomepageCMS();
        }
    });
}
