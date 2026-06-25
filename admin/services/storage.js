// services/storage.js
// File Upload & Media Metadata Service
// All file upload logic flows through here — UI modules must not call
// supabase.storage directly.

import { AppState } from './db.js';

/**
 * Uploads a file to the Supabase storage bucket ('media').
 * Falls back to base64 data URL inside media_library if storage isn't configured.
 *
 * @param {File} file            - File object to upload
 * @param {string} [folder='general'] - Target folder name inside the bucket
 * @returns {Promise<string>}    - Resolves with the public URL of the uploaded file
 */
export function uploadMediaFileDirectly(file, folder = 'general') {
    const { supabaseClient } = AppState;

    return new Promise((resolve, reject) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `${folder}/${fileName}`;

        supabaseClient.storage.from('media').upload(filePath, file)
            .then(({ data, error }) => {
                if (error) {
                    // Fallback: store file as base64 data URL directly in media_library
                    // This ensures upload works even without a configured storage bucket.
                    const reader = new FileReader();
                    reader.onload = () => {
                        const base64Url = reader.result;
                        saveMediaMetadataToTable(file.name, base64Url, file.size, file.type, folder)
                            .then(resolve)
                            .catch(reject);
                    };
                    reader.readAsDataURL(file);
                } else {
                    const { data: { publicUrl } } = supabaseClient.storage.from('media').getPublicUrl(filePath);
                    saveMediaMetadataToTable(file.name, publicUrl, file.size, file.type, folder)
                        .then(resolve)
                        .catch(reject);
                }
            });
    });
}

/**
 * Saves file metadata record to the media_library table.
 *
 * @param {string} filename - Original filename
 * @param {string} url      - Public URL or base64 data URL
 * @param {number} size     - File size in bytes
 * @param {string} mime     - MIME type (e.g. 'image/webp')
 * @param {string} folder   - Folder name tag for categorization
 * @returns {Promise<string>} - Resolves with the URL
 */
export function saveMediaMetadataToTable(filename, url, size, mime, folder) {
    const { supabaseClient } = AppState;
    const id = 'med_' + Math.random().toString(36).substr(2, 9);

    return supabaseClient.from('media_library').insert([{
        id, filename, url, size_bytes: size, mime_type: mime, folder,
    }]).then(({ error }) => {
        if (error) throw error;
        return url;
    });
}
