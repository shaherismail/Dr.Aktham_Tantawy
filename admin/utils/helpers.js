// utils/helpers.js
// Shared Helper Utilities
// Reusable functions used across multiple feature modules.
// Centralizes logic that would otherwise be duplicated.

import { AppState } from '../state/AppState.js';
import { logAuditAction } from '../services/audit.js';

// ---------------------------------------------------------------------------
// COMPONENT IDs — centralized to avoid magic strings across modules
// ---------------------------------------------------------------------------
export const COMPONENT_IDS = {
    SERVICE_CARD:   'f088192a-fa13-4c91-a20c-c603b10bcf2e',
    CASE_CARD:      '4808cfcf-349c-4932-a083-0a716c52a0a2',
    FAQ:            '990cd082-cd28-4a92-be20-2b1031f0cfbf',
    TESTIMONIALS:   'd508192a-fa13-4c91-a20c-c603b10bcfff',
};

// ---------------------------------------------------------------------------
// SOFT DELETE
// ---------------------------------------------------------------------------

/**
 * Moves a record to the recycle bin by setting is_deleted = true.
 * Restricted to non-Viewer roles.
 *
 * @param {string}   table    - Supabase table name
 * @param {string}   id       - Record ID
 * @param {Function} [callback] - Called after successful soft delete
 */
export function softDeleteRecord(table, id, callback) {
    const { supabaseClient, currentUserRole } = AppState;

    if (currentUserRole === 'Viewer') {
        alert('حساب المشاهد لا يملك صلاحية الحذف.');
        return;
    }

    if (confirm('هل ترغب بنقل هذا العنصر لسلة المهملات؟')) {
        supabaseClient.from(table).update({ is_deleted: true }).eq('id', id)
            .then(({ error }) => {
                if (error) {
                    alert(error.message);
                } else {
                    logAuditAction(`${table}:soft_delete`, `${table}:${id}`, null, { is_deleted: true });
                    alert('🗑️ تم نقل العنصر لسلة المهملات. يمكنك استرجاعه في أي وقت.');
                    if (callback) callback();
                }
            });
    }
}

// ---------------------------------------------------------------------------
// CONTENT PUBLISHING
// ---------------------------------------------------------------------------

/**
 * Publishes a component_content record by copying draft_data → published_data.
 *
 * @param {string}   itemId   - component_content record ID
 * @param {Function} [callback] - Called after successful publish
 */
export function publishComponentContent(itemId, callback) {
    const { supabaseClient } = AppState;

    supabaseClient.from('component_content').select('draft_data').eq('id', itemId).single()
        .then(({ data }) => {
            if (!data) return;

            supabaseClient.from('component_content').update({
                published_data: data.draft_data,
                status: 'published',
                updated_at: new Date().toISOString(),
            }).eq('id', itemId).then(({ error }) => {
                if (error) {
                    alert('فشل النشر: ' + error.message);
                } else {
                    logAuditAction('component_content:publish', `component_content:${itemId}`, null, data.draft_data);
                    alert('🎉 تم نشر وتطبيق التحديثات بنجاح للموقع العام!');
                    if (callback) callback();
                }
            });
        });
}

/**
 * Publishes a page_section by calling the DBService publish helper.
 *
 * @param {string} sectionId - page_sections record ID
 * @param {Function} [onSuccess] - Optional callback after publish
 */
export function publishSectionCMS(sectionId, onSuccess) {
    import('../assets/js/db-service.js').then(({ DBService }) => {
        DBService.publishSection(sectionId, AppState.supabaseClient, AppState.currentUser.email)
            .then(({ error }) => {
                if (error) {
                    alert('فشل النشر: ' + error.message);
                } else {
                    alert('🎉 تم نشر هذا القسم وجعله حياً للجمهور بنجاح!');
                    if (onSuccess) onSuccess();
                }
            });
    });
}

// ---------------------------------------------------------------------------
// SECTION LABELS
// ---------------------------------------------------------------------------

/**
 * Returns the Arabic display name for a homepage section type.
 *
 * @param {string} type - Section type key (e.g. 'hero', 'stats')
 * @returns {string}
 */
export function getSectionArabicName(type) {
    const names = {
        hero:          'قسم الهيرو الرئيسي (Hero)',
        stats:         'الأرقام والإحصائيات (Stats)',
        features:      'مميزات العيادة (Features)',
        doctor:        'الملف الطبي للطبيب (Doctor)',
        services:      'الخدمات الطبية (Services)',
        cases:         'الحالات وقبل وبعد (Cases)',
        testimonials:  'آراء ومراجعات المرضى (Testimonials)',
        faq:           'الأسئلة الشائعة (FAQ)',
    };
    return names[type] || type;
}
