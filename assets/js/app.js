// Main Application Shared State & Entry Point

export let supabaseClient = null;

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

export function initSupabaseClient() {
    const sbUrl = localStorage.getItem('supabase_url') || 'https://uryssoojjljplseaxamn.supabase.co';
    const sbKey = localStorage.getItem('supabase_key') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyeXNzb29qamxqcGxzZWF4YW1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzMjE0NjgsImV4cCI6MjA5Nzg5NzQ2OH0.VmSSd3_7we4ZNOcHSaklHAN05Bnx9dCiTHjY_UI7c_k';
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

// Dynamic Theme Engine from Supabase Services
export function initThemeEngine() {
    import('./architecture.js').then(({ ThemeService }) => {
        ThemeService.getTheme().then(data => {
            if (data) {
                const root = document.documentElement;
                if (data.primary_color) root.style.setProperty('--primary', data.primary_color);
                if (data.secondary_color) root.style.setProperty('--secondary', data.secondary_color);
                if (data.accent_color) root.style.setProperty('--accent', data.accent_color);
                if (data.success_color) root.style.setProperty('--success', data.success_color);
                if (data.warning_color) root.style.setProperty('--warning', data.warning_color);
                if (data.danger_color) root.style.setProperty('--danger', data.danger_color);
                
                if (data.border_radius) {
                    const baseRad = parseInt(data.border_radius) || 16;
                    root.style.setProperty('--radius-xl', `${Math.round(baseRad * 1.75)}px`);
                    root.style.setProperty('--radius-lg', `${Math.round(baseRad * 1.25)}px`);
                    root.style.setProperty('--radius-md', `${Math.round(baseRad * 0.875)}px`);
                    root.style.setProperty('--radius-sm', `${Math.round(baseRad * 0.5)}px`);
                }
                
                if (data.fonts) {
                    const fontConfig = typeof data.fonts === 'string' ? JSON.parse(data.fonts) : data.fonts;
                    if (fontConfig.body) {
                        root.style.setProperty('--font-body', fontConfig.body);
                        document.body.style.fontFamily = `"${fontConfig.body}", sans-serif`;
                    }
                }
            }
        });
    });
}

// Dynamic SEO Engine from Supabase Services
export function initSeoEngine() {
    const path = window.location.pathname;
    let slug = path.split('/').pop() || 'index.html';
    if (slug.endsWith('.html')) slug = slug.replace('.html', '');
    if (slug === '') slug = 'index';

    import('./architecture.js').then(({ SeoService }) => {
        SeoService.getPageSeo(slug).then(data => {
            if (data) {
                if (data.title) document.title = data.title;
                
                let descMeta = document.querySelector('meta[name="description"]');
                if (data.description) {
                    if (!descMeta) {
                        descMeta = document.createElement('meta');
                        descMeta.name = 'description';
                        document.head.appendChild(descMeta);
                    }
                    descMeta.content = data.description;
                }

                let keywordsMeta = document.querySelector('meta[name="keywords"]');
                if (data.keywords) {
                    if (!keywordsMeta) {
                        keywordsMeta = document.createElement('meta');
                        keywordsMeta.name = 'keywords';
                        document.head.appendChild(keywordsMeta);
                    }
                    keywordsMeta.content = data.keywords;
                }

                updateMetaTag('property', 'og:title', data.open_graph_title || data.title);
                updateMetaTag('property', 'og:description', data.open_graph_desc || data.description);
                updateMetaTag('property', 'og:image', data.open_graph_image);
                updateMetaTag('name', 'twitter:title', data.open_graph_title || data.title);
                updateMetaTag('name', 'twitter:description', data.open_graph_desc || data.description);
                updateMetaTag('name', 'twitter:image', data.open_graph_image);

                let canonicalLink = document.querySelector('link[rel="canonical"]');
                if (data.canonical_url) {
                    if (!canonicalLink) {
                        canonicalLink = document.createElement('link');
                        canonicalLink.rel = 'canonical';
                        document.head.appendChild(canonicalLink);
                    }
                    canonicalLink.href = data.canonical_url;
                }
            }
        });
    });
}

function updateMetaTag(attribute, name, content) {
    if (!content) return;
    let meta = document.querySelector(`meta[${attribute}="${name}"]`);
    if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
    }
    meta.content = content;
}

// Dynamic Maintenance Gate from Supabase Services
export function initMaintenanceGate() {
    import('./architecture.js').then(({ SiteSettingsService }) => {
        SiteSettingsService.getMaintenanceMode().then(data => {
            if (data && data.is_active) {
                const isAdmin = sessionStorage.getItem('admin_logged_in') === 'true';
                if (isAdmin) {
                    console.log('Maintenance mode active, bypassed for Admin.');
                    return;
                }

                document.body.innerHTML = `
                    <div class="maintenance-overlay" style="
                        position: fixed;
                        top: 0; left: 0; right: 0; bottom: 0;
                        background: radial-gradient(circle at top right, rgba(21, 101, 255, 0.1) 0%, rgba(15, 23, 42, 0.98) 100%);
                        color: white;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        z-index: 999999;
                        font-family: 'Tajawal', sans-serif;
                        padding: 30px;
                        text-align: center;
                        direction: rtl;
                    ">
                        <div style="
                            background: rgba(255, 255, 255, 0.03);
                            border: 1px solid rgba(255, 255, 255, 0.1);
                            padding: 50px;
                            border-radius: 24px;
                            max-width: 600px;
                            box-shadow: 0 20px 50px rgba(0,0,0,0.3);
                            backdrop-filter: blur(12px);
                        ">
                            <i class="bx bx-cog animate-spin" style="font-size: 70px; color: var(--primary, #1565FF); margin-bottom: 20px; display: inline-block;"></i>
                            <h1 style="font-size: 28px; font-weight: 900; margin-bottom: 15px;">المنصة قيد الصيانة المؤقتة</h1>
                            <p style="font-size: 15px; color: #94A3B8; line-height: 1.8; margin-bottom: 25px;">
                                ${data.message || 'المنصة حالياً قيد التحديث الإجباري السنوي، سنعود للعمل مجدداً خلال دقائق معدودة. نشكر تفهمكم!'}
                            </p>
                            ${data.countdown_end ? `
                                <div style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: var(--primary-light, #6FA8FF); margin-bottom: 10px;">الوقت المتبقي التقريبي:</div>
                                <div id="maintenance-timer" style="font-size: 24px; font-weight: 800; font-family: \'Outfit\'; font-variant-numeric: tabular-nums;">--:--:--</div>
                            ` : ''}
                        </div>
                    </div>
                `;

                if (data.countdown_end) {
                    const targetTime = new Date(data.countdown_end).getTime();
                    const timerEl = document.getElementById('maintenance-timer');
                    
                    const updateTimer = () => {
                        const now = new Date().getTime();
                        const diff = targetTime - now;
                        if (diff <= 0) {
                            window.location.reload();
                            return;
                        }
                        const hours = Math.floor(diff / (1000 * 60 * 60));
                        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                        
                        if (timerEl) {
                            timerEl.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                        }
                    };
                    
                    updateTimer();
                    setInterval(updateTimer, 1000);
                }
            }
        });
    });
}

// Main App Initialization
export function initApp() {
    initSupabaseClient();
    initThemeEngine();
    initSeoEngine();
    initMaintenanceGate();
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

