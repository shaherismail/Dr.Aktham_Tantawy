// Before/After interactive slider logic & Gallery page features
import { supabaseClient } from './app.js';

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

export function loadDynamicGallery() {
    const grid = document.querySelector('.gallery-grid');
    if (!grid) return;

    const renderCases = (casesList) => {
        casesList.forEach(c => {
            // Avoid duplicates
            if (document.querySelector(`[data-case-id="${c.id}"]`)) return;

            const card = document.createElement('div');
            card.className = 'glass-card';
            card.setAttribute('data-category', c.category || 'other');
            card.setAttribute('data-case-id', c.id);
            card.innerHTML = `
                <div class="before-after-wrapper case-static-img" style="cursor: zoom-in;">
                    <img src="${c.after || 'assets/case2.jpg'}" alt="${c.title}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='assets/case2.jpg'">
                    <span class="label-before" style="background: var(--primary);">حالة واقعية للعيادة</span>
                </div>
                <div class="case-info-card">
                    <span class="case-badge">${c.service || 'تقويم الأسنان'}</span>
                    <h4 class="case-title">${c.title}</h4>
                    <p class="case-desc">${c.result || 'تعديل وتطابق الأسنان والفكين بمستويات متقدمة.'}</p>
                    <div class="case-meta-row">
                        <div class="meta-item">
                            <i class="bx bx-purchase-tag-alt"></i>
                            <span><strong>الحالة:</strong> ${c.title}</span>
                        </div>
                        <div class="meta-item">
                            <i class="bx bx-user"></i>
                            <span><strong>العمر:</strong> ${c.age || 20} عاماً</span>
                        </div>
                        <div class="meta-item">
                            <i class="bx bx-time-five"></i>
                            <span><strong>المدة:</strong> ${c.duration || '12 شهراً'}</span>
                        </div>
                        <div class="meta-item">
                            <i class="bx bx-calendar-check"></i>
                            <span><strong>الزيارات:</strong> ${c.visits || '10'} زيارات</span>
                        </div>
                    </div>
                </div>
            `;
            grid.insertBefore(card, grid.firstChild);
        });

        // Re-initialize lightbox triggers for newly loaded elements
        initGalleryLightbox();
    };

    if (supabaseClient) {
        supabaseClient.from('gallery').select('*').order('created_at', { ascending: false }).then(({ data, error }) => {
            if (!error && data && data.length > 0) {
                renderCases(data);
            }
        });
    }
}

// Auto-run if element is on screen
document.addEventListener('DOMContentLoaded', () => {
    initBeforeAfterSliders();
    initGalleryFilters();
    initGalleryLightbox();
    
    // Load dynamic cases from Supabase
    setTimeout(() => {
        loadDynamicGallery();
    }, 100);
});
