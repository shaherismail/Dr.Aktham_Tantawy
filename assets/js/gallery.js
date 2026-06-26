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
                const category = card.getAttribute('data-category') || '';
                if (filterVal === 'all' || category.toLowerCase() === filterVal.toLowerCase()) {
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
    
    // Clear previous click handlers by cloning
    triggerImages.forEach(elem => {
        elem.onclick = null;
        elem.addEventListener('click', (e) => {
            if (e.target.closest('.slider-handle') || e.target.closest('.slider-button')) {
                return;
            }

            let src = '';
            const img = elem.querySelector('img');
            if (img) {
                src = img.src;
            } else {
                // Check background-image style if it's a div
                const afterDiv = elem.querySelector('.after-img');
                if (afterDiv) {
                    const bg = window.getComputedStyle(afterDiv).backgroundImage;
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
        closeBtn.onclick = closeLightbox;
    }

    lightbox.onclick = (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    };
}

export function loadCasesFromDatabase() {
    const grid = document.getElementById('galleryGrid');
    if (!grid) return;

    const params = new URLSearchParams(window.location.search);
    const previewMode = params.get('preview') === 'true';

    if (supabaseClient) {
        supabaseClient.from('component_content')
            .select('*')
            .eq('component_id', '4808cfcf-349c-4932-a083-0a716c52a0a2') // case_card component ID
            .eq('is_visible', true)
            .order('display_order', { ascending: true })
            .then(({ data, error }) => {
                if (data && data.length > 0 && !error) {
                    grid.innerHTML = '';
                    data.forEach(item => {
                        const c = previewMode ? item.draft_data : item.published_data;
                        const card = document.createElement('div');
                        card.className = 'glass-card';
                        card.setAttribute('data-category', c.category || 'other');
                        
                        card.innerHTML = `
                            <div class="before-after-wrapper" style="position: relative; overflow: hidden; aspect-ratio: 4/3; border-radius: var(--radius-md) var(--radius-md) 0 0;">
                                <div class="after-img" style="background-image: url('${c.after_image_url || ''}'); background-size: cover; background-position: center; width: 100%; height: 100%; position: absolute; top: 0; left: 0; clip-path: polygon(0 0, 50% 0, 50% 100%, 0 100%);"></div>
                                <div class="before-img" style="background-image: url('${c.before_image_url || ''}'); background-size: cover; background-position: center; width: 100%; height: 100%; position: absolute; top: 0; left: 0;"></div>
                                
                                <div class="slider-handle" style="position: absolute; top: 0; bottom: 0; left: 50%; width: 4px; background: white; cursor: ew-resize; z-index: 10;">
                                    <div class="slider-button" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 40px; height: 40px; background: var(--accent); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.2); pointer-events: none; border: 3px solid white;">
                                        <i class="bx bx-left-arrow-alt" style="font-size: 16px;"></i>
                                        <i class="bx bx-right-arrow-alt" style="font-size: 16px;"></i>
                                    </div>
                                </div>
                                
                                <span class="label-before" style="position: absolute; top: 12px; right: 12px; background: rgba(0,0,0,0.6); color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px; z-index: 5; font-weight: 600;">قبل</span>
                                <span class="label-after" style="position: absolute; top: 12px; left: 12px; background: var(--accent); color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px; z-index: 5; font-weight: 600;">بعد</span>
                            </div>
                            
                            <div class="case-info-card">
                                <span class="case-badge">${c.treatment_type || ''}</span>
                                <h4 class="case-title" data-cms-key="title" data-cms-table="component_content" data-cms-id="${item.id}">${c.title || ''}</h4>
                                <p class="case-desc" data-cms-key="description" data-cms-table="component_content" data-cms-id="${item.id}">${c.description || ''}</p>
                                <div class="case-meta-row" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 16px; border-top: 1.5px solid var(--border-color); padding-top: 16px;">
                                    <div class="meta-item">
                                        <i class="bx bx-user" style="color:var(--accent);"></i>
                                        <span><strong>العمر:</strong> ${c.patient_age || '?'} عاماً</span>
                                    </div>
                                    <div class="meta-item">
                                        <i class="bx bx-time-five" style="color:var(--accent);"></i>
                                        <span><strong>المدة:</strong> ${c.duration || '?'}</span>
                                    </div>
                                    <div class="meta-item">
                                        <i class="bx bx-calendar-check" style="color:var(--accent);"></i>
                                        <span><strong>الزيارات:</strong> ${c.visits || '?'} زيارات</span>
                                    </div>
                                    <div class="meta-item">
                                        <i class="bx bx-comment" style="color:var(--accent);"></i>
                                        <span data-cms-key="doctor_notes" data-cms-table="component_content" data-cms-id="${item.id}"><strong>ملاحظة:</strong> ${c.doctor_notes || 'لا يوجد'}</span>
                                    </div>
                                </div>
                            </div>
                        `;
                        grid.appendChild(card);
                    });
                }
                
                // Initialize events
                initBeforeAfterSliders();
                initGalleryFilters();
                initGalleryLightbox();
            });
    } else {
        // Run fallbacks
        initBeforeAfterSliders();
        initGalleryFilters();
        initGalleryLightbox();
    }
}

// Auto-run if element is on screen
document.addEventListener('DOMContentLoaded', () => {
    loadCasesFromDatabase();
});
