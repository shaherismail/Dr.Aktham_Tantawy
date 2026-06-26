// utils.js
// Shared Utility Library
// Single utility module containing: image compression, shared helpers,
// content publishing, and global search. Import only what you need.

import { AppState } from './services/db.js';
import { logAuditAction } from './services/audit.js';

// ===========================================================================
// COMPONENT IDs — centralized to avoid magic strings across feature modules
// ===========================================================================
export const COMPONENT_IDS = {
    SERVICE_CARD: 'f088192a-fa13-4c91-a20c-c603b10bcf2e',
    CASE_CARD:    '4808cfcf-349c-4932-a083-0a716c52a0a2',
    FAQ:          '990cd082-cd28-4a92-be20-2b1031f0cfbf',
    TESTIMONIALS: 'd508192a-fa13-4c91-a20c-c603b10bcfff',
};

// ===========================================================================
// IMAGE COMPRESSION — Client-side WebP conversion via Canvas API
// ===========================================================================

/**
 * Compresses an image File to WebP using Canvas, scaling down if needed.
 * @param {File}   file           - Source image file
 * @param {number} [quality=0.8]  - WebP quality 0.0–1.0
 * @returns {Promise<File>}
 */
export function compressImageToWebP(file, quality = 0.8) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const img = new Image();

            img.onload = () => {
                const canvas = document.createElement('canvas');
                let { width, height } = img;
                const maxDim = 1200; // Optimal for dental before/after photos

                if (width > maxDim || height > maxDim) {
                    if (width > height) {
                        height = Math.round((height * maxDim) / width);
                        width  = maxDim;
                    } else {
                        width  = Math.round((width * maxDim) / height);
                        height = maxDim;
                    }
                }

                canvas.width  = width;
                canvas.height = height;
                canvas.getContext('2d').drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    blob => resolve(new File(
                        [blob],
                        file.name.replace(/\.[^/.]+$/, '') + '.webp',
                        { type: 'image/webp' }
                    )),
                    'image/webp',
                    quality
                );
            };

            img.onerror = reject;
            img.src = e.target.result;
        };

        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// ===========================================================================
// SOFT DELETE
// ===========================================================================

/**
 * Moves a record to the recycle bin by setting is_deleted = true.
 * @param {string}    table    - Supabase table name
 * @param {string}    id       - Record primary key
 * @param {Function}  [callback] - Invoked after successful soft delete
 */
export function softDeleteRecord(table, id, callback) {
    if (AppState.currentUserRole === 'Viewer') {
        alert('حساب المشاهد لا يملك صلاحية الحذف.');
        return;
    }

    if (confirm('هل ترغب بنقل هذا العنصر لسلة المهملات؟')) {
        AppState.supabaseClient.from(table).update({ is_deleted: true }).eq('id', id)
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

// ===========================================================================
// CONTENT PUBLISHING
// ===========================================================================

/**
 * Publishes a component_content record: copies draft_data → published_data.
 * @param {string}   itemId   - component_content record ID
 * @param {Function} [callback]
 */
export function publishComponentContent(itemId, callback) {
    AppState.supabaseClient.from('component_content').select('draft_data').eq('id', itemId).single()
        .then(({ data }) => {
            if (!data) return;
            AppState.supabaseClient.from('component_content').update({
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
 * Publishes a page_section via DBService.
 * @param {string}   sectionId
 * @param {Function} [onSuccess]
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

// ===========================================================================
// SECTION LABELS
// ===========================================================================

/**
 * Returns the Arabic display name for a homepage section type.
 * @param {string} type
 * @returns {string}
 */
export function getSectionArabicName(type) {
    const names = {
        hero:         'قسم الهيرو الرئيسي (Hero)',
        stats:        'الأرقام والإحصائيات (Stats)',
        features:     'مميزات العيادة (Features)',
        doctor:       'الملف الطبي للطبيب (Doctor)',
        services:     'الخدمات الطبية (Services)',
        cases:        'الحالات وقبل وبعد (Cases)',
        testimonials: 'آراء ومراجعات المرضى (Testimonials)',
        faq:          'الأسئلة الشائعة (FAQ)',
    };
    return names[type] || type;
}

// ===========================================================================
// GLOBAL SEARCH
// ===========================================================================

/**
 * Searches bookings across name, phone, service and renders results
 * in the #searchDropdown element.
 * @param {string} query
 */
export function executeGlobalSearch(query) {
    const dropdown = document.getElementById('searchDropdown');

    if (!query) {
        dropdown.style.display = 'none';
        return;
    }

    AppState.supabaseClient.from('bookings')
        .select('*')
        .eq('is_deleted', false)
        .or(`name.ilike.%${query}%,phone.ilike.%${query}%,service.ilike.%${query}%`)
        .limit(10)
        .then(({ data, error }) => {
            if (error || !data || data.length === 0) {
                dropdown.innerHTML = '<span style="color:var(--text-muted); font-size:12px;">لا توجد نتائج بحث مطابقة.</span>';
                dropdown.style.display = 'block';
                return;
            }

            dropdown.innerHTML = '<h4>نتائج البحث السريع:</h4>';

            data.forEach(item => {
                const div = document.createElement('div');
                div.style.cssText = 'padding:8px; border-bottom:1px solid var(--border-color); cursor:pointer;';
                div.innerHTML = `
                    <div style="font-weight:600; font-size:13px;">${item.name} (${item.service})</div>
                    <div style="font-size:11px; color:var(--text-muted);">التاريخ: ${item.date} • الهاتف: ${item.phone}</div>
                `;
                div.onclick = () => {
                    dropdown.style.display = 'none';
                    location.hash = '#/appointments';
                    setTimeout(() => {
                        alert(`معلومات المريض المحددة:\nمريض: ${item.name}\nالخدمة: ${item.service}\nالتاريخ: ${item.date}`);
                    }, 200);
                };
                dropdown.appendChild(div);
            });

            dropdown.style.display = 'block';
        });
}
