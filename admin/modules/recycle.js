// modules/recycle.js
// Recycle Bin Module
// Lists soft-deleted records from all tracked tables, allows restoration,
// permanent purge (Super Admin only), and media usage checking.

import { AppState } from '../state/AppState.js';
import { logAuditAction } from '../services/audit.js';
import { COMPONENT_IDS } from '../utils/helpers.js';

/** Tables scanned for soft-deleted records. */
const RECYCLE_TABLES = ['component_content', 'contact_messages', 'bookings', 'media_library'];

// ---------------------------------------------------------------------------
// RECYCLE BIN LOADER
// ---------------------------------------------------------------------------

/**
 * Queries all tracked tables for soft-deleted records and renders them
 * in the recycle bin table.
 */
export function loadRecycleBin() {
    const { supabaseClient } = AppState;
    const listBody = document.getElementById('recycleBinTableBody');
    listBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">جاري تحميل العناصر المحذوفة...</td></tr>';

    Promise.all(
        RECYCLE_TABLES.map(tbl =>
            supabaseClient.from(tbl).select('*').eq('is_deleted', true)
                .then(res => ({ table: tbl, data: res.data || [] }))
        )
    ).then(results => {
        listBody.innerHTML = '';
        let hasDeleted = false;

        results.forEach(({ table, data }) => {
            data.forEach(item => {
                hasDeleted = true;
                const tr = document.createElement('tr');

                const { displayTable, displayTitle } = _resolveDisplayInfo(table, item);

                tr.innerHTML = `
                    <td><code>${displayTable}</code></td>
                    <td style="font-weight:600;">${displayTitle}</td>
                    <td>${item.updated_at || item.created_at
                        ? new Date(item.updated_at || item.created_at).toLocaleDateString('ar-EG')
                        : 'غير متوفر'}</td>
                    <td>
                        <div style="display:flex; gap:6px;">
                            <button class="btn btn-secondary btn-sm restore-item-btn" data-id="${item.id}" data-table="${table}">
                                <i class="bx bx-undo"></i> استعادة
                            </button>
                            <button class="btn btn-danger btn-sm purge-item-btn" data-id="${item.id}" data-table="${table}">
                                <i class="bx bx-trash"></i> حذف نهائي
                            </button>
                        </div>
                    </td>
                `;
                listBody.appendChild(tr);

                tr.querySelector('.restore-item-btn').onclick = () => restoreSoftDeletedRecord(table, item.id);
                tr.querySelector('.purge-item-btn').onclick   = () => hardDeleteRecord(table, item.id);
            });
        });

        if (!hasDeleted) {
            listBody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:var(--text-muted);">سلة المهملات فارغة.</td></tr>';
        }
    });
}

// ---------------------------------------------------------------------------
// DISPLAY INFO RESOLVER (private)
// ---------------------------------------------------------------------------

function _resolveDisplayInfo(table, item) {
    let displayTable = table;
    let displayTitle = 'عنصر';

    if (table === 'component_content') {
        const contentData = item.draft_data || item.published_data || {};
        displayTitle = contentData.title || contentData.question || contentData.name || 'محتوى مكون';

        if      (item.component_id === COMPONENT_IDS.SERVICE_CARD)  displayTable = 'الخدمات (component_content)';
        else if (item.component_id === COMPONENT_IDS.CASE_CARD)     displayTable = 'الحالات (component_content)';
        else if (item.component_id === COMPONENT_IDS.FAQ)           displayTable = 'الأسئلة الشائعة (component_content)';
        else if (item.component_id === COMPONENT_IDS.TESTIMONIALS)  displayTable = 'آراء المرضى (component_content)';
        else                                                          displayTable = 'محتوى مكون (component_content)';
    } else {
        displayTitle = item.title || item.name || item.question || item.filename || 'عنصر';
        if (table === 'contact_messages') displayTable = 'الرسائل (contact_messages)';
        if (table === 'bookings')         displayTable = 'الحجوزات (bookings)';
        if (table === 'media_library')    displayTable = 'المكتبة (media_library)';
    }

    return { displayTable, displayTitle };
}

// ---------------------------------------------------------------------------
// RESTORE
// ---------------------------------------------------------------------------

/**
 * Restores a soft-deleted record by setting is_deleted = false.
 * @param {string} table - Table name
 * @param {string} id    - Record ID
 */
export function restoreSoftDeletedRecord(table, id) {
    const { supabaseClient, currentUserRole } = AppState;
    if (currentUserRole === 'Viewer') return;

    supabaseClient.from(table).update({ is_deleted: false }).eq('id', id)
        .then(({ error }) => {
            if (error) {
                alert(error.message);
            } else {
                logAuditAction(`${table}:restore`, `${table}:${id}`, null, { is_deleted: false });
                alert('✅ تم استعادة العنصر بنجاح للموقع العام!');
                loadRecycleBin();
            }
        });
}

// ---------------------------------------------------------------------------
// HARD DELETE
// ---------------------------------------------------------------------------

/**
 * Permanently deletes a record from Supabase. Super Admin only.
 * @param {string} table - Table name
 * @param {string} id    - Record ID
 */
export function hardDeleteRecord(table, id) {
    const { supabaseClient, currentUserRole } = AppState;

    if (currentUserRole !== 'Super Admin') {
        alert('الحذف النهائي والدائم للعناصر مسموح فقط لمدير النظام (Super Admin).');
        return;
    }

    if (confirm('تنبيه هام: هذا الإجراء سيحذف العنصر نهائياً من خوادم وقواعد بيانات Supabase ولن يمكن استرجاعه. هل تود المتابعة؟')) {
        supabaseClient.from(table).delete().eq('id', id)
            .then(({ error }) => {
                if (error) {
                    alert(error.message);
                } else {
                    logAuditAction(`${table}:purge`, `${table}:${id}`, null, null);
                    alert('🔥 تم حذف وتطهير العنصر نهائياً.');
                    loadRecycleBin();
                }
            });
    }
}

// ---------------------------------------------------------------------------
// MEDIA USAGE CHECKER
// ---------------------------------------------------------------------------

/**
 * Checks how many places reference a media file by URL.
 * Used to warn before deletion.
 *
 * @param {string} id - media_library record ID
 * @returns {Promise<{ usageCount: number, usages: string[] }>}
 */
export async function checkMediaUsage(id) {
    const { supabaseClient } = AppState;

    const { data: media } = await supabaseClient.from('media_library').select('url').eq('id', id).single();
    if (!media) return { usageCount: 0, usages: [] };

    const url        = media.url;
    let usageCount   = 0;
    const usages     = [];

    // Check site settings (logo, favicon)
    const { data: settings } = await supabaseClient.from('site_settings').select('logo_url, favicon_url').eq('id', 1).single();
    if (settings) {
        if (settings.logo_url    === url) { usages.push('شعار العيادة (Settings)');    usageCount++; }
        if (settings.favicon_url === url) { usages.push('أيقونة الموقع (Settings)');  usageCount++; }
    }

    // Check page sections
    const { data: sections } = await supabaseClient.from('page_sections').select('section_type, draft_content, published_content');
    if (sections) {
        sections.forEach(sec => {
            const draftStr = JSON.stringify(sec.draft_content     || {});
            const pubStr   = JSON.stringify(sec.published_content || {});
            if (draftStr.includes(url) || pubStr.includes(url)) {
                usages.push(`قسم الصفحة الرئيسية: ${sec.section_type}`);
                usageCount++;
            }
        });
    }

    // Check component_content records
    const { data: compContents } = await supabaseClient.from('component_content')
        .select('component_id, draft_data, published_data')
        .eq('is_deleted', false);

    if (compContents) {
        compContents.forEach(item => {
            const draftStr = JSON.stringify(item.draft_data     || {});
            const pubStr   = JSON.stringify(item.published_data || {});
            if (draftStr.includes(url) || pubStr.includes(url)) {
                const dataObj  = item.draft_data || item.published_data || {};
                const title    = dataObj.title || dataObj.question || dataObj.name || 'عنصر';
                let compType   = 'محتوى مكون';
                if      (item.component_id === COMPONENT_IDS.SERVICE_CARD)  compType = 'الخدمات';
                else if (item.component_id === COMPONENT_IDS.CASE_CARD)     compType = 'الحالات';
                else if (item.component_id === COMPONENT_IDS.FAQ)           compType = 'الأسئلة الشائعة';
                else if (item.component_id === COMPONENT_IDS.TESTIMONIALS)  compType = 'آراء المرضى';

                usages.push(`${compType}: ${title}`);
                usageCount++;
            }
        });
    }

    return { usageCount, usages };
}
