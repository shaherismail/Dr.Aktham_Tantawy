// Main Application Shared State & Entry Point (100% Standalone / Static / Vercel-ready)

export const AppState = {
    bookingData: {
        id: '',
        name: '',
        phone: '',
        email: '',
        age: '',
        service: 'تقويم الأسنان',
        doctor: 'د. أكثم طنطاوي',
        date: '',
        time: '',
        chair: '',
        notes: ''
    }
};

export function checkUrlCallbacks() {
    const params = new URLSearchParams(window.location.search);
    const action = params.get('action');
    const id = params.get('id');

    if (action === 'confirm_booking' && id) {
        let bookings = JSON.parse(localStorage.getItem('dr_aktham_bookings') || '[]');
        const idx = bookings.findIndex(b => b.id === id);
        if (idx !== -1) {
            bookings[idx].status = 'confirmed';
            localStorage.setItem('dr_aktham_bookings', JSON.stringify(bookings));

            localStorage.setItem('current_patient_profile', JSON.stringify({
                name: bookings[idx].name,
                phone: bookings[idx].phone,
                email: bookings[idx].email,
                age: bookings[idx].age,
                id: bookings[idx].id
            }));
        }

        if (window.location.pathname.includes('profile')) {
            const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
            window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
        } else {
            window.location.href = 'profile.html';
            return;
        }

        setTimeout(() => {
            import('./profile.js').then(module => {
                module.initPatientProfile();
            });
            import('./animations.js').then(module => {
                module.fireConfettiEffect();
            });
            alert(`🎉 تم تأكيد الموعد رقم ${id} بنجاح!`);
        }, 100);
    }
}

// Scrolled navbar decoration listener
export function initScrollHeader() {
    const header = document.querySelector('.header-nav');
    if (!header) return;
    window.addEventListener('scroll', () => {
        if (window.scrollY > 30) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// FAQ accordion dynamic height toggling
export function initFAQAccordions() {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const header = item.querySelector('.faq-header-btn');
        const body = item.querySelector('.faq-body');

        if (header && body) {
            header.addEventListener('click', () => {
                const isOpen = item.classList.contains('active');

                // Close other items
                faqItems.forEach(otherItem => {
                    otherItem.classList.remove('active');
                    const otherBody = otherItem.querySelector('.faq-body');
                    if (otherBody) otherBody.style.maxHeight = null;
                });

                if (!isOpen) {
                    item.classList.add('active');
                    body.style.maxHeight = `${body.scrollHeight}px`;
                }
            });
        }
    });
}

// Testimonials Carousel / Loader (Reads directly from LocalStorage / Clinic Settings)
export function initTestimonials() {
    const track = document.getElementById('testimonialsTrack');
    if (!track) return;

    const defaultTestimonials = [
        { name: "سحر الحربي", tag: "علاج: 14 شهراً (تقويم شفاف) • العمر: 22 سنة", stars: 5, text: "تجربة رائعة للغاية مع الدكتور أكثم في تركيب المصففات الشفافة. النتيجة فاقت توقعاتي، والتحول كان تدريجياً وبدون أي ألم يذكر. العيادة راقية والتعقيم ممتاز." },
        { name: "خالد بن طلال", tag: "علاج: 18 شهراً (تقويم معدني) • العمر: 19 سنة", stars: 5, text: "كنت أعاني من ازدحام شديد في الفك العلوي والحمد لله بعد خطة علاجية دقيقة مدتها سنة ونصف مع د. أكثم، حصلت على ابتسامة متناسقة تماماً وثقة متجددة بالكامل." },
        { name: "ريما عبد الله", tag: "علاج: 12 شهراً (تقويم خزفي) • العمر: 27 سنة", stars: 5, text: "اخترت التقويم الخزفي التجميلي لعدم وضوحه، والخدمة كانت استثنائية! المتابعة الدورية كانت دقيقة ومريحة جداً، وأنصح بشدة بكل من يريد تعديل أسنانه بكفاءة عالية." }
    ];

    const render = (list) => {
        track.innerHTML = '';
        list.forEach(t => {
            const card = document.createElement('div');
            card.className = 'glass-card testimonial-card';

            let starsHtml = '';
            for (let i = 0; i < 5; i++) {
                starsHtml += `<i class="bx ${i < t.stars ? 'bxs-star' : 'bx-star'}"></i>`;
            }

            card.innerHTML = `
                <div class="testimonial-header">
                    <div class="testimonial-avatar">${t.name.charAt(0)}</div>
                    <div class="stars-row">${starsHtml}</div>
                </div>
                <p class="testimonial-text">"${t.text}"</p>
                <div class="testimonial-footer">
                    <span class="testimonial-name">${t.name}</span>
                    <span class="testimonial-tag">${t.tag || 'مريض مـؤكّد ✓'}</span>
                </div>
            `;
            track.appendChild(card);
        });
    };

    try {
        const stored = JSON.parse(localStorage.getItem('dr_aktham_testimonials') || '[]');
        if (stored && stored.length > 0) {
            render(stored);
        } else {
            render(defaultTestimonials);
        }
    } catch (e) {
        render(defaultTestimonials);
    }
}

// Newsletter sign-up feedback (Standalone LocalStorage)
export function initNewsletter() {
    const newsForm = document.getElementById('newsForm');
    if (!newsForm) return;

    newsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const emailInput = newsForm.querySelector('.newsletter-input');
        if (!emailInput) return;
        const emailVal = emailInput.value.trim();
        if (emailVal) {
            try {
                let list = JSON.parse(localStorage.getItem('dr_aktham_newsletter') || '[]');
                if (list.some(item => (typeof item === 'string' ? item : item.email) === emailVal)) {
                    alert('أنت مسجل بالفعل في النشرة الطبية للعيادة!');
                } else {
                    list.unshift({ email: emailVal, date: new Date().toISOString().split('T')[0] });
                    localStorage.setItem('dr_aktham_newsletter', JSON.stringify(list));
                    alert(`شكراً لك! تم تسجيل البريد الإلكتروني (${emailVal}) بنجاح في النشرة الطبية للعيادة.`);
                    newsForm.reset();
                }
            } catch (err) {
                alert(`شكراً لك! تم تسجيل البريد الإلكتروني (${emailVal}) بنجاح.`);
                newsForm.reset();
            }
        }
    });
}

// Main App Initialization
export function initApp() {
    initScrollHeader();
    initFAQAccordions();
    initTestimonials();
    initNewsletter();
    checkUrlCallbacks();
}

// Initialize layout modules
import './layout.js';

function onReady(fn) {
    if (document.readyState !== 'loading') {
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}

onReady(() => {
    initApp();
});
