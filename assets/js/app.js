// Main Application Shared State & Entry Point

export let supabaseClient = null;

export const AppState = {
    bookingData: {
        id: '',
        name: '',
        phone: '',
        email: '',
        age: '',
        service: 'تنظيف الأسنان',
        date: '',
        time: '',
        chair: '',
        notes: ''
    }
};

export function initSupabaseClient() {
    const sbUrl = localStorage.getItem('supabase_url') || '';
    const sbKey = localStorage.getItem('supabase_key') || '';
    if (sbUrl && sbKey && window.supabase) {
        try {
            supabaseClient = window.supabase.createClient(sbUrl, sbKey);
            console.log('Supabase client initialized successfully!');
        } catch (e) {
            console.error('Failed to initialize Supabase client:', e);
        }
    } else {
        supabaseClient = null;
    }
}

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

        if (supabaseClient) {
            supabaseClient.from('bookings')
                .update({ status: 'confirmed' })
                .eq('id', id)
                .then(({ error }) => {
                    if (error) console.error('Supabase url callback update error:', error);
                    else console.log(`Supabase booking ${id} confirmed via URL.`);
                });
        }
        
        if (window.location.pathname.includes('profile')) {
            const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
            window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
        } else {
            window.location.href = 'profile.html';
            return;
        }

        setTimeout(() => {
            // Import and run profile init dynamically
            import('./profile.js').then(module => {
                module.initPatientProfile();
            });
            import('./animations.js').then(module => {
                module.fireConfettiEffect();
            });
            alert(`🎉 تم تأكيد الموعد رقم ${id} بنجاح من خلال تليجرام!`);
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

// Testimonials Carousel / Loader
export function initTestimonials() {
    const track = document.getElementById('testimonialsTrack');
    if (!track) return;

    const defaultTestimonials = [
        { name: "سلطان العتيبي", tag: "مريض مـؤكّد ✓", stars: 5, text: "تجربة رائعة جداً في عيادة الدكتور أكثم، قمت بعمل زراعة لثلاثة أسنان وكانت العملية بدون أي ألم تذكر وبمنتهى الاحترافية والتعقيم الفائق. أنصح الجميع بالتعامل معه." },
        { name: "سارة الشمري", tag: "مريض مـؤكّد ✓", stars: 5, text: "الدكتور أكثم متميز جداً وخلوق، قمت بتركيب التقويم الشفاف ومتابعة العلاج لديه، والنتائج تظهر بشكل مذهل أسرع مما كنت أتوقع. العيادة مجهزة بأحدث التقنيات." },
        { name: "فيصل الحربي", tag: "مريض مـؤكّد ✓", stars: 5, text: "خدمة تنظيف وتبييض الأسنان بالليزر كانت ممتازة وسريعة، والنتيجة مذهلة جداً! تعامل راقٍ جداً من الاستقبال وحتى الطبيب. العيادة نظيفة للغاية والتعقيم 100%." }
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

    if (supabaseClient) {
        supabaseClient.from('testimonials')
            .select('*')
            .order('id', { ascending: false })
            .then(({ data, error }) => {
                if (error || !data || data.length === 0) {
                    render(defaultTestimonials);
                } else {
                    render(data);
                }
            });
    } else {
        render(defaultTestimonials);
    }
}

// Newsletter sign-up feedback (integrated with Supabase)
export function initNewsletter() {
    const newsForm = document.getElementById('newsForm');
    if (!newsForm) return;

    newsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const emailInput = newsForm.querySelector('.newsletter-input');
        if (!emailInput) return;
        const emailVal = emailInput.value.trim();
        if (emailVal) {
            if (supabaseClient) {
                supabaseClient.from('newsletter_subscribers').insert([{ email: emailVal }])
                    .then(({ error }) => {
                        if (error) {
                            if (error.code === '23505') {
                                alert('أنت مسجل بالفعل في النشرة الطبية للعيادة!');
                            } else {
                                console.error('Newsletter Supabase save error:', error);
                            }
                        } else {
                            alert(`شكراً لك! تم تسجيل البريد الإلكتروني (${emailVal}) بنجاح في النشرة الطبية للعيادة.`);
                            newsForm.reset();
                        }
                    });
            } else {
                alert(`شكراً لك! تم تسجيل البريد الإلكتروني (${emailVal}) بنجاح في النشرة الطبية للعيادة.`);
                newsForm.reset();
            }
        }
    });
}

// Main App Initialization
export function initApp() {
    initSupabaseClient();
    initScrollHeader();
    initFAQAccordions();
    initTestimonials();
    initNewsletter();
    checkUrlCallbacks();
}

// Initialize layout modules
import './layout.js';

// Auto run app
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});
