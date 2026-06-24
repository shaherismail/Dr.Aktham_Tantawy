// Main Application Shared State & Entry Point

export let supabaseClient = null;

export const AppState = {
    currentMode: 'live', // 'live' or 'figma'
    zoomLevel: 1, // Figma mockup zoom level
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
    },
    pricing: {
        package: 'standard', // 'basic', 'standard', 'premium'
        termMonths: 12,
        basePrices: {
            basic: 499,
            standard: 999,
            premium: 1999
        }
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
            window.location.href = 'profile';
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
        if (window.scrollY > 50) {
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

        header.addEventListener('click', () => {
            const isOpen = item.classList.contains('active');

            // Close other items
            faqItems.forEach(otherItem => {
                otherItem.classList.remove('active');
                otherItem.querySelector('.faq-body').style.maxHeight = null;
            });

            if (!isOpen) {
                item.classList.add('active');
                body.style.maxHeight = `${body.scrollHeight}px`;
            }
        });
    });
}

// Upcoming Page countdown timer logic
export function initCountdownTimer() {
    const daysVal = document.getElementById('countDays');
    if (!daysVal) return;

    const hoursVal = document.getElementById('countHours');
    const minsVal = document.getElementById('countMins');
    const secsVal = document.getElementById('countSecs');

    // Launch date set to 45 days from current load
    const launchDate = new Date();
    launchDate.setDate(launchDate.getDate() + 45);

    const updateTimer = () => {
        const now = new Date().getTime();
        const diff = launchDate - now;

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        daysVal.textContent = days.toString().padStart(2, '0');
        hoursVal.textContent = hours.toString().padStart(2, '0');
        minsVal.textContent = minutes.toString().padStart(2, '0');
        secsVal.textContent = seconds.toString().padStart(2, '0');
    };

    updateTimer();
    setInterval(updateTimer, 1000);
}

// Newsletter sign-up feedback (integrated with Supabase)
export function initNewsletter() {
    const newsForm = document.getElementById('newsForm');
    if (!newsForm) return;

    newsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const emailVal = newsForm.querySelector('.newsletter-input').value.trim();
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
                            alert(`شكراً لك! تم تسجيل البريد الإلكتروني (${emailVal}) بنجاح في النشرة الطبية السحابية للعيادة.`);
                            newsForm.reset();
                        }
                    });
            } else {
                alert(`شكراً لك! تم تسجيل البريد الإلكتروني (${emailVal}) بنجاح في النشرة الطبية للعيادة (محلي).`);
                newsForm.reset();
            }
        }
    });
}

// Figma presentation mockups zoom dashboard controls
export function initFigmaZoom() {
    const zoomInBtn = document.getElementById('zoomIn');
    const zoomOutBtn = document.getElementById('zoomOut');
    const zoomResetBtn = document.getElementById('zoomReset');
    const zoomText = document.getElementById('zoomVal');
    const artboardGrid = document.querySelector('.figma-artboards-grid');

    if (!zoomInBtn || !artboardGrid) return;

    const updateZoom = () => {
        artboardGrid.style.transform = `scale(${AppState.zoomLevel})`;
        zoomText.textContent = `${Math.round(AppState.zoomLevel * 100)}%`;
    };

    zoomInBtn.addEventListener('click', () => {
        if (AppState.zoomLevel < 1.5) {
            AppState.zoomLevel += 0.1;
            updateZoom();
        }
    });

    zoomOutBtn.addEventListener('click', () => {
        if (AppState.zoomLevel > 0.4) {
            AppState.zoomLevel -= 0.1;
            updateZoom();
        }
    });

    zoomResetBtn.addEventListener('click', () => {
        AppState.zoomLevel = 1.0;
        updateZoom();
    });

    // Lazy load all iframes since they are in grid on figma.html
    setTimeout(() => {
        const iframes = document.querySelectorAll('.artboard-frame');
        iframes.forEach(iframe => {
            const dataSrc = iframe.getAttribute('data-src');
            if (dataSrc && (!iframe.src || iframe.src === 'about:blank')) {
                iframe.src = dataSrc;
            }
        });
    }, 300);
}

// Main App Initialization
export function initApp() {
    // If inside an iframe on figma.html, check to block loading recursive frames
    if (window.self !== window.top && window.location.pathname.includes('figma')) {
        document.body.innerHTML = '';
        return;
    }

    initSupabaseClient();
    initScrollHeader();
    initFAQAccordions();
    initCountdownTimer();
    initNewsletter();
    initFigmaZoom();
    checkUrlCallbacks();
}

// Initialize layout modules
import './layout.js';

// Auto run app
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});
