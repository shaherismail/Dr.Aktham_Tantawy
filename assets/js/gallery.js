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

// Default Cases Collection
export const defaultGalleryCases = [
    {
        id: 'case-1',
        title: 'تعديل الازدحام الشديد وتطابق الفكين',
        category: 'crowding',
        badge: 'تقويم الأسنان المعدني',
        beforeImg: 'assets/case2.jpg',
        afterImg: 'assets/case2.jpg',
        isSlider: false,
        desc: 'علاج تزاحم الأسنان الحاد وتوسيع القوس السني دون الحاجة لخلع أي أسنان دائمية، مع ضبط مالي للإطباق.',
        condition: 'تزاحم بالفكين',
        age: '18 عاماً',
        duration: '14 شهراً',
        visits: '12 زيارة'
    },
    {
        id: 'case-2',
        title: 'إغلاق الفراغات الأمامية وتصحيح المحاذاة',
        category: 'spacing',
        badge: 'تقويم الأسنان التجميلي',
        beforeImg: 'assets/case1.jpg',
        afterImg: 'assets/case1.jpg',
        isSlider: false,
        desc: 'علاج الفراغات الواسعة (الستيرما) بين الثنايا والرباعيات العلوية وإعادة بناء تماثل خط الابتسامة بنجاح تام.',
        condition: 'فراغات متفرقة',
        age: '22 عاماً',
        duration: '11 شهراً',
        visits: '9 زيارات'
    },
    {
        id: 'case-3',
        title: 'تصحيح العضة العميقة (Overbite)',
        category: 'overbite',
        badge: 'تعديل الإطباق الهيكلي',
        beforeImg: 'assets/WhatsApp Image 2026-06-24 at 10.52.23 PM.jpeg',
        afterImg: 'assets/WhatsApp Image 2026-06-24 at 10.52.23 PM (1).jpeg',
        isSlider: true,
        desc: 'علاج التغطية الزائدة للأسنان السفلية ورفع العضة وتقديم الفك السفلي لتحسين المظهر الجانبي للوجه والابتسامة.',
        condition: 'عضة عميقة',
        age: '24 عاماً',
        duration: '16 شهراً',
        visits: '14 زيارة'
    },
    {
        id: 'case-4',
        title: 'تصحيح العضة المعكوسة الجانبية',
        category: 'crossbite',
        badge: 'تقويم وقائي وعلاجي',
        beforeImg: 'assets/WhatsApp Image 2026-06-24 at 10.52.24 PM.jpeg',
        afterImg: 'assets/WhatsApp Image 2026-06-24 at 10.52.24 PM (1).jpeg',
        isSlider: true,
        desc: 'تصحيح انطباق الأسنان العلوية خلف السفلية جانبياً، وتحقيق محاذاة سليمة تمنع تآكل المفصل الصدغي.',
        condition: 'عضة معكوسة',
        age: '16 عاماً',
        duration: '16 شهراً',
        visits: '14 زيارة'
    },
    {
        id: 'case-5',
        title: 'علاج العضة المفتوحة الأمامية (Open Bite)',
        category: 'openbite',
        badge: 'تقويم الأسنان المتقدم',
        beforeImg: 'assets/WhatsApp Image 2026-06-24 at 10.52.24 PM.jpeg',
        afterImg: 'assets/WhatsApp Image 2026-06-24 at 10.52.24 PM (2).jpeg',
        isSlider: true,
        desc: 'إعادة توجيه الأسنان الأمامية وتنزيلها لتتطابق بشكل سليم، وتصحيح وظائف التحدث والمضغ لثقة متجددة.',
        condition: 'عضة مفتوحة',
        age: '20 عاماً',
        duration: '20 شهراً',
        visits: '18 زيارة'
    },
    {
        id: 'case-6',
        title: 'تقويم غير مرئي لمشكلة الفراغات والاعوجاج',
        category: 'aligners',
        badge: 'التقويم الشفاف (ألاينرز)',
        beforeImg: 'assets/WhatsApp Image 2026-06-24 at 10.52.21 PM.jpeg',
        afterImg: 'assets/WhatsApp Image 2026-06-24 at 10.52.21 PM (1).jpeg',
        isSlider: true,
        desc: 'علاج تجميلي ووظيفي بالكامل باستخدام قوالب الألاينرز الشفافة سريعة الفك والتركيب والمصممة رقمياً بالكامل.',
        condition: 'تقويم شفاف',
        age: '28 عاماً',
        duration: '12 شهراً',
        visits: '8 زيارات'
    },
    {
        id: 'case-7',
        title: 'زراعة فورية وتجميل فينير للأسنان الأمامية',
        category: 'other',
        badge: 'زراعة وتجميل الأسنان',
        beforeImg: 'assets/WhatsApp Image 2026-06-25 at 7.41.45 PM.jpeg',
        afterImg: 'assets/WhatsApp Image 2026-06-25 at 7.41.45 PM (1).jpeg',
        isSlider: true,
        desc: 'تعويض سن مفقود بالزراعة الألمانية الفورية وتركيب عدسات الفينير الرقيقة لبقية الأسنان لابتسامة هوليودية متناسقة.',
        condition: 'زراعة + تجميل',
        age: '35 عاماً',
        duration: 'جلسات متعددة',
        visits: '6 زيارات'
    }
];

// Dynamic Renderer
export function renderGalleryCases() {
    const grid = document.querySelector('.gallery-grid');
    if (!grid) return;

    let cases = [];
    try {
        const stored = localStorage.getItem('dr_aktham_gallery_cases');
        if (stored) {
            cases = JSON.parse(stored);
        }
    } catch (e) {
        cases = [];
    }

    if (!cases || cases.length === 0) {
        cases = defaultGalleryCases;
    }

    grid.innerHTML = cases.map(c => `
        <div class="glass-card" data-category="${c.category}">
            ${c.isSlider ? `
            <div class="before-after-wrapper">
                <div class="before-img" style="background-image: url('${c.beforeImg}');"></div>
                <div class="after-img" style="background-image: url('${c.afterImg}');"></div>
                <div class="slider-handle">
                    <div class="slider-button"><i class="bx bx-chevrons-left"></i></div>
                </div>
                <span class="label-before">قبل</span>
                <span class="label-after">بعد العلاج</span>
            </div>
            ` : `
            <div class="before-after-wrapper case-static-img" style="cursor: zoom-in;">
                <img src="${c.afterImg || c.beforeImg}" alt="${c.title}" style="width: 100%; height: 100%; object-fit: cover;">
                <span class="label-before" style="background: var(--primary);">حالة واقعية للعيادة</span>
            </div>
            `}
            <div class="case-info-card">
                <span class="case-badge">${c.badge || 'علاج سريري'}</span>
                <h4 class="case-title">${c.title}</h4>
                <p class="case-desc">${c.desc}</p>
                <div class="case-meta-row">
                    <div class="meta-item">
                        <i class="bx bx-purchase-tag-alt"></i>
                        <span><strong>الحالة:</strong> ${c.condition || '-'}</span>
                    </div>
                    <div class="meta-item">
                        <i class="bx bx-user"></i>
                        <span><strong>العمر:</strong> ${c.age || '-'}</span>
                    </div>
                    <div class="meta-item">
                        <i class="bx bx-time-five"></i>
                        <span><strong>المدة:</strong> ${c.duration || '-'}</span>
                    </div>
                    <div class="meta-item">
                        <i class="bx bx-calendar-check"></i>
                        <span><strong>الزيارات:</strong> ${c.visits || '-'}</span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    initBeforeAfterSliders();
    initGalleryFilters();
    initGalleryLightbox();
}

function onReady(fn) {
    if (typeof document === 'undefined') return;
    if (document.readyState !== 'loading') {
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}

// Auto-run if element is on screen
onReady(() => {
    if (document.querySelector('.gallery-grid')) {
        renderGalleryCases();
    } else {
        initBeforeAfterSliders();
        initGalleryFilters();
        initGalleryLightbox();
    }
});
