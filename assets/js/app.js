// Main Application Shared State & Entry Point
import { DBService } from './db-service.js';

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
    const sbUrl = localStorage.getItem('supabase_url') || '';
    const sbKey = localStorage.getItem('supabase_key') || '';
    if (sbUrl && sbKey && window.supabase) {
        try {
            supabaseClient = window.supabase.createClient(sbUrl, sbKey);
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
    const wrapper = document.getElementById('faqWrapper');
    const params = new URLSearchParams(window.location.search);
    const previewMode = params.get('preview') === 'true';
    
    const bindAccordionClickEvents = () => {
        const faqItems = document.querySelectorAll('.faq-item');
        faqItems.forEach(item => {
            const header = item.querySelector('.faq-header-btn');
            const body = item.querySelector('.faq-body');

            if (header && body) {
                // Remove old event listeners by cloning
                const newHeader = header.cloneNode(true);
                header.parentNode.replaceChild(newHeader, header);

                newHeader.addEventListener('click', () => {
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
    };

    if (supabaseClient && wrapper) {
        supabaseClient.from('component_content')
            .select('*')
            .eq('component_id', '990cd082-cd28-4a92-be20-2b1031f0cfbf') // faq_item component ID
            .eq('is_visible', true)
            .order('display_order', { ascending: true })
            .then(({ data, error }) => {
                if (data && data.length > 0 && !error) {
                    wrapper.innerHTML = '';
                    data.forEach(item => {
                        const faq = previewMode ? item.draft_data : item.published_data;
                        const faqEl = document.createElement('div');
                        faqEl.className = 'faq-item';
                        faqEl.innerHTML = `
                            <button class="faq-header-btn">
                                <span data-cms-key="question" data-cms-table="component_content" data-cms-id="${item.id}">${faq.question || ''}</span>
                                <i class="bx bx-chevron-down faq-icon-chevron"></i>
                            </button>
                            <div class="faq-body">
                                <div class="faq-body-inner" data-cms-key="answer" data-cms-table="component_content" data-cms-id="${item.id}">
                                    ${faq.answer || ''}
                                </div>
                            </div>
                        `;
                        wrapper.appendChild(faqEl);
                    });
                }
                bindAccordionClickEvents();
            });
    } else {
        bindAccordionClickEvents();
    }
}

// Testimonials Carousel / Loader
export function initTestimonials() {
    const track = document.getElementById('testimonialsTrack');
    if (!track) return;
    
    const params = new URLSearchParams(window.location.search);
    const previewMode = params.get('preview') === 'true';

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
            const rating = parseInt(t.stars) || 5;
            for (let i = 0; i < 5; i++) {
                starsHtml += `<i class="bx ${i < rating ? 'bxs-star' : 'bx-star'}"></i>`;
            }

            card.innerHTML = `
                <div class="testimonial-header">
                    <div class="testimonial-avatar">${(t.name || '').charAt(0)}</div>
                    <div class="stars-row">${starsHtml}</div>
                </div>
                <p class="testimonial-text">"${t.text || ''}"</p>
                <div class="testimonial-footer">
                    <span class="testimonial-name">${t.name || ''}</span>
                    <span class="testimonial-tag">${t.tag || 'مريض مـؤكّد ✓'}</span>
                </div>
            `;
            track.appendChild(card);
        });
    };

    if (supabaseClient) {
        supabaseClient.from('component_content')
            .select('*')
            .eq('component_id', 'd508192a-fa13-4c91-a20c-c603b10bcfff')
            .eq('is_visible', true)
            .order('display_order', { ascending: true })
            .then(({ data, error }) => {
                if (error || !data || data.length === 0) {
                    render(defaultTestimonials);
                } else {
                    const list = data.map(item => previewMode ? item.draft_data : item.published_data);
                    render(list);
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

// Dynamic Theme Settings applicator
export function applyThemeSettings() {
    if (!supabaseClient) return;
    supabaseClient.from('theme_settings').select('*').eq('id', 1).single()
        .then(({ data, error }) => {
            if (data && !error) {
                const root = document.documentElement;
                root.style.setProperty('--primary', data.primary_color);
                root.style.setProperty('--secondary', data.secondary_color);
                root.style.setProperty('--accent', data.accent_color);
                root.style.setProperty('--radius', data.border_radius);
                
                if (data.fonts && data.fonts.arabic) {
                    root.style.setProperty('--font-sans', `'Outfit', '${data.fonts.arabic}', sans-serif`);
                }
            }
        });
}

// Dynamic settings applicator
export function applyDynamicCMSContent() {
    const params = new URLSearchParams(window.location.search);
    const previewMode = params.get('preview') === 'true';

    // 1. Fetch site settings
    if (supabaseClient) {
        supabaseClient.from('site_settings').select('*').eq('id', 1).single()
            .then(({ data, error }) => {
                if (data && !error) {
                    document.title = data.seo_title || document.title;
                    const metaDesc = document.querySelector('meta[name="description"]');
                    if (metaDesc) metaDesc.setAttribute('content', data.seo_description || '');

                    localStorage.setItem('clinic_site_settings', JSON.stringify(data));
                    updateSiteSettingsInDOM(data);
                }
            });
    }

    // 2. Fetch homepage layouts and reorder sections
    window.addEventListener('cms_layout_updated', (e) => {
        if (e.detail.slug === 'home') {
            renderHomepageLayout(e.detail.sections, previewMode);
        }
    });

    DBService.getPageLayout('home', supabaseClient, previewMode).then(sections => {
        if (sections) {
            renderHomepageLayout(sections, previewMode);
        }
    });

    // 3. Fetch doctor profile
    if (window.location.pathname.includes('about') || window.location.pathname.includes('profile')) {
        DBService.getPageLayout('home', supabaseClient, previewMode).then(sections => {
            if (sections) {
                const docSec = sections.find(s => s.section_type === 'doctor');
                if (docSec) {
                    const content = previewMode ? (docSec.draft_content || {}) : (docSec.published_content || {});
                    const bioEl = document.querySelector('[data-cms-key="bio"]');
                    if (bioEl && content.bio) bioEl.textContent = content.bio;
                    
                    const nameEls = document.querySelectorAll('.doctor-stats-badge .tag-title');
                    nameEls.forEach(el => {
                        if (content.name) el.textContent = content.name;
                    });
                }
            }
        });
    }
}

export function renderHomepageLayout(sections, previewMode = false) {
    const parent = document.getElementById('home-page');
    if (!parent) return;

    // Define DOM selector mapping for each section type
    const sectionSelectors = {
        hero: '#home-hero-section',
        features: '#home-excellence-section',
        stats: null, // stats are embedded inside hero
        doctor: null, // doctor portrait is inside hero, details on about page
        testimonials: '#home-testimonials-section',
        faq: '#home-faq-section'
    };

    // Reorder sections in DOM
    sections.forEach(sec => {
        const selector = sectionSelectors[sec.section_type];
        if (!selector) return;
        const el = parent.querySelector(selector);
        if (el) {
            // Append it to move it to the end of the parent, sorting it in display_order
            parent.appendChild(el);
            
            // Apply Visibility
            el.style.display = sec.is_visible ? '' : 'none';
            
            // Apply Spacing (remove old spacing classes and add new ones)
            el.classList.remove('padding-small', 'padding-medium', 'padding-large');
            if (sec.spacing) el.classList.add(sec.spacing);
            
            // Apply Background Style
            el.classList.remove('bg-glass', 'bg-light', 'bg-dark', 'bg-accent');
            if (sec.background_style) el.classList.add(`bg-${sec.background_style}`);
        }
    });

    // Populate Content: Hero title, subtitle, image, video
    const heroSec = sections.find(s => s.section_type === 'hero');
    if (heroSec) {
        const content = previewMode ? (heroSec.draft_content || {}) : (heroSec.published_content || {});
        const titleEl = document.querySelector('[data-cms-key="hero_title"]');
        const descEl = document.querySelector('[data-cms-key="hero_subtitle"]');
        if (titleEl && content.title) titleEl.innerHTML = content.title;
        if (descEl && content.subtitle) descEl.textContent = content.subtitle;
        
        // Update hero image if there's any
        const imgEl = document.querySelector('.doctor-portrait');
        if (imgEl && content.image_url) imgEl.src = content.image_url;
    }

    // Populate Content: Stats
    const statsSec = sections.find(s => s.section_type === 'stats');
    if (statsSec) {
        const content = previewMode ? (statsSec.draft_content || {}) : (statsSec.published_content || {});
        const stats = content.statistics || [];
        const statsContainer = document.querySelector('.hero-stats-row');
        if (statsContainer && stats.length > 0) {
            statsContainer.innerHTML = '';
            stats.forEach(st => {
                const div = document.createElement('div');
                div.className = 'stat-item';
                div.innerHTML = `
                    <span class="stat-num">${st.value}</span>
                    <span class="stat-label">${st.label}</span>
                `;
                statsContainer.appendChild(div);
            });
        }
    }
}

function updateSiteSettingsInDOM(settings) {
    document.querySelectorAll('.clinic-phone-link').forEach(el => {
        el.href = `tel:${settings.phone}`;
        el.textContent = settings.phone;
    });
    document.querySelectorAll('.clinic-whatsapp-link').forEach(el => {
        el.href = `https://wa.me/${settings.whatsapp.replace('+', '')}`;
    });
    document.querySelectorAll('.clinic-address-text').forEach(el => {
        el.textContent = settings.address;
    });
}

export function initDynamicServicesPage() {
    const grid = document.getElementById('servicesPageGrid');
    if (!grid || !supabaseClient) return;

    const params = new URLSearchParams(window.location.search);
    const previewMode = params.get('preview') === 'true';

    supabaseClient.from('component_content')
        .select('*')
        .eq('component_id', 'f088192a-fa13-4c91-a20c-c603b10bcf2e') // service_card component ID
        .eq('is_visible', true)
        .order('display_order', { ascending: true })
        .then(({ data, error }) => {
            if (data && data.length > 0 && !error) {
                grid.innerHTML = '';
                data.forEach(item => {
                    const s = previewMode ? item.draft_data : item.published_data;
                    const card = document.createElement('div');
                    const category = s.category || '';
                    const isOrtho = category.includes('تقويم') || s.is_featured;
                    card.className = `glass-card service-card ${isOrtho ? 'featured-ortho' : ''}`;
                    
                    card.innerHTML = `
                        <div class="service-img-wrapper">
                            ${s.is_featured ? '<span class="service-badge">التخصص الرئيسي للعيادة</span>' : ''}
                            <img src="${s.image_url || 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=400&q=80'}" alt="${s.title || ''}" loading="lazy">
                        </div>
                        <div class="service-icon-wrapper"><i class="bx ${s.icon || 'bx-bracket'}"></i></div>
                        <h3 class="card-title" style="font-size: 20px;" data-cms-key="title" data-cms-table="component_content" data-cms-id="${item.id}">${s.title || ''}</h3>
                        <p class="service-card-desc" data-cms-key="description" data-cms-table="component_content" data-cms-id="${item.id}">${s.description || ''}</p>
                        <div style="font-size:12px; color:var(--text-muted); margin: 8px 0; display:flex; gap:12px; padding:0 24px; direction:rtl;">
                            <span>⏱️ ${s.duration || 'غير محدد'}</span>
                            <span>💰 ${s.price || 'غير محدد'}</span>
                        </div>
                        <a href="booking.html" class="service-card-link">احجز موعدك <i class="bx bx-left-arrow-alt"></i></a>
                    `;
                    grid.appendChild(card);
                });
            }
        });
}

// Main App Initialization
export async function initApp() {
    initSupabaseClient();
    await DBService.init();
    initScrollHeader();
    applyThemeSettings();
    applyDynamicCMSContent();
    initDynamicServicesPage();
    initFAQAccordions();
    initTestimonials();
    initNewsletter();
    checkUrlCallbacks();

    // Lazy load and launch the Live Visual Editor if admin session is detected
    if (supabaseClient) {
        import('./live-editor.js').then(module => {
            if (typeof module.initLiveEditor === 'function') {
                module.initLiveEditor(supabaseClient);
            }
        });
    }
}

// Initialize layout modules
import './layout.js';

// Auto run app
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});
