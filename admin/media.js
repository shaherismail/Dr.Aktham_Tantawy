// media.js
// Media Library Module
// Renders the media grid, handles multi-file upload with WebP compression,
// and manages media soft deletion.

import { AppState } from './services/db.js';
import { uploadMediaFileDirectly } from './services/storage.js';
import { softDeleteRecord, compressImageToWebP } from './utils.js';

/** Loads all non-deleted media items and binds the upload input. */
export function loadMediaLibrary() {
    const container = document.getElementById('mediaLibraryContainer');
    container.innerHTML = '<div style="grid-column:1/-1; text-align:center;">جاري تحميل مكتبة الصور...</div>';

    AppState.supabaseClient.from('media_library')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
            if (error || !data) {
                container.innerHTML = '<div style="grid-column:1/-1; text-align:center; color:red;">فشل تحميل ملفات الميديا.</div>';
                return;
            }
            if (data.length === 0) {
                container.innerHTML = '<div style="grid-column:1/-1; text-align:center; color:var(--text-muted);">المكتبة فارغة. ابدأ برفع بعض الصور!</div>';
                return;
            }

            container.innerHTML = '';
            data.forEach(m => {
                const card     = document.createElement('div');
                card.className = 'media-thumbnail-card';
                const isVideo  = m.mime_type?.startsWith('video/');

                card.innerHTML = `
                    ${isVideo ? `<video src="${m.url}" muted></video>` : `<img src="${m.url}" alt="${m.filename}">`}
                    <div class="media-details-row">
                        <span class="media-filename" title="${m.filename}">${m.filename}</span>
                        <div class="media-actions-dropdown">
                            <button class="btn btn-secondary btn-sm copy-btn" title="نسخ الرابط"><i class="bx bx-copy"></i></button>
                            <button class="btn btn-danger btn-sm del-btn" title="حذف"><i class="bx bx-trash"></i></button>
                        </div>
                    </div>
                `;
                container.appendChild(card);
                card.querySelector('.copy-btn').onclick = () => { navigator.clipboard.writeText(m.url); alert('📋 تم نسخ رابط الملف!'); };
                card.querySelector('.del-btn').onclick  = () => softDeleteRecord('media_library', m.id, loadMediaLibrary);
            });
        });

    document.getElementById('mediaLibraryFileUpload').onchange = (e) => _handleUpload(e);
}

/** Compresses images to WebP then uploads all selected files. */
function _handleUpload(e) {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    alert(`جاري معالجة ورفع ${files.length} ملفات...`);

    Promise.all(files.map(f =>
        f.type.startsWith('image/')
            ? compressImageToWebP(f).then(compressed => uploadMediaFileDirectly(compressed, 'general'))
            : uploadMediaFileDirectly(f, 'general')
    )).then(() => {
        alert('🎉 تم رفع جميع الملفات بنجاح!');
        loadMediaLibrary();
    }).catch(err => alert('خطأ أثناء الرفع: ' + err.message));
}
