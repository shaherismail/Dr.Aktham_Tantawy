// Before/After interactive slider logic & Gallery page features

export function initBeforeAfterSliders() {
    const sliders = document.querySelectorAll('.before-after-wrapper');
    
    sliders.forEach(slider => {
        const handle = slider.querySelector('.slider-handle');
        const afterImg = slider.querySelector('.after-img');
        if (!handle || !afterImg) return;
        
        let isDragging = false;

        const updateSlider = (clientX) => {
            const rect = slider.getBoundingClientRect();
            const x = clientX - rect.left;
            let percentage = (x / rect.width) * 100;
            
            // Boundary constraints
            if (percentage < 0) percentage = 0;
            if (percentage > 100) percentage = 100;

            handle.style.left = `${percentage}%`;
            afterImg.style.clipPath = `polygon(0 0, ${percentage}% 0, ${percentage}% 100%, 0 100%)`;
        };

        const startDragging = () => { isDragging = true; };
        const stopDragging = () => { isDragging = false; };

        // Mouse Events
        handle.addEventListener('mousedown', startDragging);
        window.addEventListener('mouseup', stopDragging);
        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            updateSlider(e.clientX);
        });

        // Touch Events (Mobile)
        handle.addEventListener('touchstart', startDragging, { passive: true });
        window.addEventListener('touchend', stopDragging);
        window.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            updateSlider(e.touches[0].clientX);
        });
    });
}

// Category Filtering logic
export function initGalleryFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const caseCards = document.querySelectorAll('.gallery-grid .glass-card');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from other buttons
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterVal = btn.getAttribute('data-filter');

            caseCards.forEach(card => {
                if (filterVal === 'all' || card.getAttribute('data-category') === filterVal) {
                    card.style.display = 'block';
                    card.style.animation = 'pageFadeIn 0.5s ease forwards';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

// Lightbox Modal logic
export function initGalleryLightbox() {
    const lightbox = document.getElementById('galleryLightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const closeBtn = document.getElementById('closeLightboxBtn');

    if (!lightbox || !lightboxImg) return;

    // Trigger on clicking slider photos or standard case images
    const triggerImages = document.querySelectorAll('.before-after-wrapper, .case-static-img');
    triggerImages.forEach(elem => {
        elem.addEventListener('click', (e) => {
            // If clicking the slider button or handle, do not trigger lightbox
            if (e.target.closest('.slider-handle') || e.target.closest('.slider-button')) {
                return;
            }

            // Find an image within this container
            let src = '';
            const img = elem.querySelector('img');
            if (img) {
                src = img.src;
            } else {
                // Check background-image
                const beforeDiv = elem.querySelector('.before-img');
                if (beforeDiv) {
                    const bg = window.getComputedStyle(beforeDiv).backgroundImage;
                    src = bg.replace(/url\(['"]?(.*?)['"]?\)/i, '$1');
                }
            }

            if (src) {
                lightboxImg.src = src;
                lightbox.style.display = 'flex';
            }
        });
    });

    const closeLightbox = () => {
        lightbox.style.display = 'none';
        lightboxImg.src = '';
    };

    if (closeBtn) {
        closeBtn.addEventListener('click', closeLightbox);
    }

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
}

// Auto-run if element is on screen
document.addEventListener('DOMContentLoaded', () => {
    initBeforeAfterSliders();
    initGalleryFilters();
    initGalleryLightbox();
});
