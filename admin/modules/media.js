// modules/media.js
// Media Library Module
// Loads the media grid, handles multi-file upload with optional WebP compression,
// and manages media deletion.

import { AppState } from '../state/AppState.js';
import { uploadMediaFileDirectly } from '../services/storage.js';
import { compressImageToWebP } from '../utils/compress.js';
import { softDeleteRecord } from '../utils/helpers.js';

// ---------------------------------------------------------------------------
// MEDIA LIBRARY LOADER
// ---------------------------------------------------------------------------

/**
 * Loads all non-deleted media items into the media library grid.
 * Also binds the file upload input.
 */
export function loadMediaLibrary() {
    const { supabaseClient } = AppState;
    const container = document.getElementById('mediaLibraryContainer');
    container.innerHTML = '<div style="grid-column:1/-1; text-align:center;">جاري تحميل مكتبة الصور والملفات...</div>';

    supabaseClient.from('media_library')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
            if (error || !data) {
                container.innerHTML = '<div style="grid-column:1/-1; text-align:center; color:red;">فشل تحميل ملفات الميديا.</div>';
                return;
            }

            if (data.length === 0) {
                container.innerHTML = '<div style="grid-column:1/-1; text-align:center; color:var(--text-muted);">المكتبة فارغة حالياً. ابدأ برفع بعض الصور!</div>';
                return;
            }

            container.innerHTML = '';

            data.forEach(m => {
                const card    = document.createElement('div');
                card.className = 'media-thumbnail-card';

                const isVideo = m.mime_type && m.mime_type.startsWith('video/');

                card.innerHTML = `
                    ${isVideo
                        ? `<video src="${m.url}" muted></video>`
                        : `<img src="${m.url}" alt="${m.filename}">`
                    }
                    <div class="media-details-row">
                        <span class="media-filename" title="${m.filename}">${m.filename}</span>
                        <div class="media-actions-dropdown">
                            <button class="btn btn-secondary btn-sm copy-url-btn" data-url="${m.url}" title="نسخ الرابط"><i class="bx bx-copy"></i></button>
                            <button class="btn btn-danger btn-sm delete-media-btn" data-id="${m.id}" title="حذف"><i class="bx bx-trash"></i></button>
                        </div>
                    </div>
                `;

                container.appendChild(card);

                card.querySelector('.copy-url-btn').onclick = () => {
                    navigator.clipboard.writeText(m.url);
                    alert('📋 تم نسخ رابط الملف المباشر إلى الحافظة!');
                };
                card.querySelector('.delete-media-btn').onclick = () =>
                    softDeleteRecord('media_library', m.id, loadMediaLibrary);
            });
        });

    // Bind multi-file upload input
    const uploader = document.getElementById('mediaLibraryFileUpload');
    uploader.onchange = (e) => _handleMediaUpload(e);
}

// ---------------------------------------------------------------------------
// UPLOAD HANDLER (private)
// ---------------------------------------------------------------------------

/**
 * Processes and uploads all selected files.
 * Images are compressed to WebP before upload.
 *
 * @param {Event} e - File input change event
 */
function _handleMediaUpload(e) {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    alert(`جاري معالجة ورفع ${files.length} ملفات...`);

    Promise.all(files.map(file => {
        if (file.type.startsWith('image/')) {
            return compressImageToWebP(file).then(compressed => uploadMediaFileDirectly(compressed, 'general'));
        }
        return uploadMediaFileDirectly(file, 'general');
    }))
    .then(() => {
        alert('🎉 تم رفع جميع الملفات وتأكيد حفظها بنجاح!');
        loadMediaLibrary();
    })
    .catch(err => {
        alert('خطأ أثناء الرفع: ' + err.message);
    });
}
