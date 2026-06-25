// utils/compress.js
// Client-Side Image Compression Utility
// Converts images to WebP format using HTML5 Canvas API.
// Used by media upload flows before sending to storage.

/**
 * Compresses an image File to WebP format using Canvas.
 * Scales down images exceeding maxDim while preserving aspect ratio.
 *
 * @param {File} file           - Source image file
 * @param {number} [quality=0.8] - WebP quality (0.0 – 1.0)
 * @returns {Promise<File>}     - Resolves with a new .webp File object
 */
export function compressImageToWebP(file, quality = 0.8) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = function (e) {
            const img = new Image();

            img.onload = function () {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Optimal max dimension for dentistry before/after photos
                const maxDim = 1200;

                if (width > maxDim || height > maxDim) {
                    if (width > height) {
                        height = Math.round((height * maxDim) / width);
                        width = maxDim;
                    } else {
                        width = Math.round((width * maxDim) / height);
                        height = maxDim;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    resolve(new File(
                        [blob],
                        file.name.replace(/\.[^/.]+$/, '') + '.webp',
                        { type: 'image/webp' }
                    ));
                }, 'image/webp', quality);
            };

            img.onerror = reject;
            img.src = e.target.result;
        };

        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
