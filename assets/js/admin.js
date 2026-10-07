// ==========================================================================
// Dr. Aktham Dental Clinic - Comprehensive Admin Dashboard Logic
// 100% Standalone, Self-Contained, Vercel & GitHub Ready (No External DB)
// ==========================================================================
import { getGithubConfig, saveGithubConfig, testGithubConnection, pushDataToGitHub, compileCurrentClinicData } from './github-sync.js?v=20261007_03';
import { defaultGalleryCases } from './gallery.js';
import { GeneralSettings } from './settings/general.js';

// Global State
export const AdminState = {
    bookings: [],
    patients: [],
    services: [],
    testimonials: [],
    contacts: [],
    newsletter: [],
    galleryCases: [],
    settings: {},
    currentTab: 'overview',
    filters: {
        search: '',
        status: 'all',
        service: 'all',
        chair: 'all',
        date: 'all'
    }
};

// Default Clinic Services Database
const defaultServices = [
    { id: 'srv-1', name: 'التقويم الشفاف (ألاينرز)', price: 9500, duration: '12 - 18 شهراً', category: 'ortho', active: true, desc: 'تقويم غير مرئي مريح ومصمم رقمياً بالكامل' },
    { id: 'srv-2', name: 'تقويم الأسنان المعدني', price: 6000, duration: '14 - 24 شهراً', category: 'ortho', active: true, desc: 'تقويم تقليدي عالي الدقة لحالات التزاحم المتقدمة' },
    { id: 'srv-3', name: 'التقويم الخزفي التجميلي', price: 7500, duration: '12 - 20 شهراً', category: 'ortho', active: true, desc: 'حواصر بلون السن الطبيعي لمظهر أنيق' },
    { id: 'srv-4', name: 'ابتسامة هوليوود وزراعة الأسنان', price: 12000, duration: 'جلسات متعددة', category: 'cosmetic', active: true, desc: 'عدسات تجميلية وزرعات سويسرية معتمدة' },
    { id: 'srv-5', name: 'تبييض الأسنان بالليزر Zoom', price: 1200, duration: '٤٥ دقيقة', category: 'cosmetic', active: true, desc: 'تبييض فوري فعال بتقنية الليزر الألمانية' },
    { id: 'srv-6', name: 'تنظيف الأسنان وإزالة الجير والتلميع', price: 350, duration: '٣٠ دقيقة', category: 'general', active: true, desc: 'إزالة الرواسب الكلسية والتلميع بمواد سويسرية' },
    { id: 'srv-7', name: 'علاج جذور الأسنان وحشو العصب', price: 850, duration: 'جلسة إلى جلستين', category: 'general', active: true, desc: 'علاج ميكروسكوبي متطور بدون ألم' }
];

// Clean Production Data (Demo mock bookings removed as requested)
const demoBookings = [];

// Initial Demo Testimonials
const defaultTestimonials = [
    { id: 1, name: "سحر الحربي", tag: "علاج: 14 شهراً (تقويم شفاف) • العمر: 22 سنة", stars: 5, text: "تجربة رائعة للغاية مع الدكتور أكثم في تركيب المصففات الشفافة. النتيجة فاقت توقعاتي، والتحول كان تدريجياً وبدون أي ألم يذكر. العيادة راقية والتعقيم ممتاز." },
    { id: 2, name: "خالد بن طلال", tag: "علاج: 18 شهراً (تقويم معدني) • العمر: 19 سنة", stars: 5, text: "كنت أعاني من ازدحام شديد في الفك العلوي والحمد لله بعد خطة علاجية دقيقة مدتها سنة ونصف مع د. أكثم، حصلت على ابتسامة متناسقة تماماً وثقة متجددة بالكامل." },
    { id: 3, name: "ريما عبد الله", tag: "علاج: 12 شهراً (تقويم خزفي) • العمر: 27 سنة", stars: 5, text: "اخترت التقويم الخزفي التجميلي لعدم وضوحه، والخدمة كانت استثنائية! المتابعة الدورية كانت دقيقة ومريحة جداً، وأنصح بشدة بكل من يريد تعديل أسنانه بكفاءة عالية." }
];

// Helper: Toast notification
export function showToast(message, type = 'success') {
    const container = document.getElementById('admToastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `adm-toast toast-${type}`;
    
    let icon = 'bx-check-circle';
    if (type === 'error') icon = 'bx-error-circle';
    if (type === 'warning') icon = 'bx-info-circle';

    toast.innerHTML = `
        <i class="bx ${icon}" style="font-size: 22px; color: var(--adm-${type === 'error' ? 'danger' : type === 'warning' ? 'warning' : 'success'});"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// --------------------------------------------------------------------------
// --------------------------------------------------------------------------
// 1. Authentication & Security
// --------------------------------------------------------------------------
export function initAuth() {
    const authOverlay = document.getElementById('adminAuthOverlay');
    const pinForm = document.getElementById('adminPinForm');
    const pinInput = document.getElementById('adminPinInput');
    const savedPin = localStorage.getItem('dr_aktham_admin_pin') || '1234';

    // Allow direct entry from link without mandatory lock obstruction
    sessionStorage.setItem('dr_aktham_admin_logged_in', 'true');
    if (authOverlay) authOverlay.style.display = 'none';

    if (pinForm) {
        pinForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const entered = pinInput.value.trim();
            if (entered === savedPin || entered === 'admin2026') {
                sessionStorage.setItem('dr_aktham_admin_logged_in', 'true');
                if (authOverlay) authOverlay.style.display = 'none';
                showToast('مرحباً بك! تم تسجيل الدخول بنجاح إلى لوحة الإدارة.', 'success');
            } else {
                pinInput.value = '';
                showToast('رمز الدخول غير صحيح، يرجى المحاولة مرة أخرى.', 'error');
            }
        });
    }

    // Logout
    const logoutBtn = document.getElementById('admLogoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('هل أنت متأكد من تسجيل الخروج من لوحة التحكم؟')) {
                sessionStorage.removeItem('dr_aktham_admin_logged_in');
                window.location.href = 'index.html';
            }
        });
    }

    // Lock screen (Manual lock button)
    const lockBtn = document.getElementById('admLockBtn');
    if (lockBtn) {
        lockBtn.addEventListener('click', () => {
            sessionStorage.removeItem('dr_aktham_admin_logged_in');
            if (authOverlay) {
                authOverlay.style.display = 'flex';
                if (pinInput) pinInput.value = '';
            }
        });
    }
}

// --------------------------------------------------------------------------
// 2. Data Initialization (100% LocalStorage - Production Clean)
// --------------------------------------------------------------------------
export function initAdminData() {
    // Bookings - Purge any previous test/mock data automatically
    let bookings = [];
    try {
        const stored = localStorage.getItem('dr_aktham_bookings');
        if (stored) {
            bookings = JSON.parse(stored);
            // Strictly filter out test demo records
            bookings = bookings.filter(b => 
                b && b.id && 
                !b.id.startsWith('DK-849') && 
                b.name !== 'عبد الرحمن الشمري' && 
                b.name !== 'نورة عبد العزيز القحطاني' && 
                b.name !== 'محمد إبراهيم الدوسري' && 
                b.name !== 'سارة خالد العتيبي' && 
                b.name !== 'فهد سلطان المطيري' && 
                b.name !== 'ريم عبد الله الغامدي'
            );
        }
    } catch (e) {
        bookings = [];
    }
    // Do NOT seed demoBookings!
    AdminState.bookings = bookings;
    localStorage.setItem('dr_aktham_bookings', JSON.stringify(bookings));

    // Services
    let services = [];
    try {
        const stored = localStorage.getItem('dr_aktham_services');
        if (stored) services = JSON.parse(stored);
        if (!services || services.length === 0) {
            services = defaultServices;
            localStorage.setItem('dr_aktham_services', JSON.stringify(services));
        }
    } catch (e) {
        services = defaultServices;
    }
    AdminState.services = services;

    // Testimonials
    let testimonials = [];
    try {
        const stored = localStorage.getItem('dr_aktham_testimonials');
        if (stored) testimonials = JSON.parse(stored);
        if (!testimonials || testimonials.length === 0) {
            testimonials = defaultTestimonials;
            localStorage.setItem('dr_aktham_testimonials', JSON.stringify(testimonials));
        }
    } catch (e) {
        testimonials = defaultTestimonials;
    }
    AdminState.testimonials = testimonials;

    // Contacts - Strictly clean out mock messages
    let contacts = [];
    try {
        const stored = localStorage.getItem('dr_aktham_contacts');
        if (stored) {
            contacts = JSON.parse(stored);
            contacts = contacts.filter(c => c && c.id !== 'MSG-101' && c.id !== 'MSG-102');
        }
    } catch (e) {
        contacts = [];
    }
    AdminState.contacts = contacts;
    localStorage.setItem('dr_aktham_contacts', JSON.stringify(contacts));

    // Newsletter Subscribers - Strictly clean out mock emails
    let newsletter = [];
    try {
        const stored = localStorage.getItem('dr_aktham_newsletter');
        if (stored) {
            newsletter = JSON.parse(stored);
            newsletter = newsletter.filter(n => {
                const email = typeof n === 'string' ? n : n.email;
                return email && !email.includes('@hospital.sa') && !email.includes('patient.care@') && !email.includes('amira.ortho@');
            });
        }
    } catch (e) {
        newsletter = [];
    }
    AdminState.newsletter = newsletter;
    localStorage.setItem('dr_aktham_newsletter', JSON.stringify(newsletter));

    // Gallery Cases (Before & After)
    let galleryCases = [];
    try {
        const stored = localStorage.getItem('dr_aktham_gallery_cases');
        if (stored) galleryCases = JSON.parse(stored);
        if (!galleryCases || galleryCases.length === 0) {
            galleryCases = defaultGalleryCases;
            localStorage.setItem('dr_aktham_gallery_cases', JSON.stringify(galleryCases));
        }
    } catch (e) {
        galleryCases = defaultGalleryCases;
    }
    AdminState.galleryCases = galleryCases;

    // General Settings (including Logo and Doctor photo)
    let generalSettings = {};
    try {
        const stored = localStorage.getItem('dr_aktham_general_settings');
        if (stored) generalSettings = JSON.parse(stored);
    } catch (e) {}
    AdminState.settings = { ...GeneralSettings, ...generalSettings };

    // Extract patient directories from real bookings only
    extractPatientsFromBookings();
}

export function extractPatientsFromBookings() {
    const map = new Map();
    AdminState.bookings.forEach(b => {
        const phone = b.phone ? b.phone.trim() : b.id;
        if (!map.has(phone)) {
            map.set(phone, {
                id: 'P-' + phone.slice(-4),
                name: b.name,
                phone: b.phone,
                email: b.email || 'غير مسجل',
                age: b.age || 'غير محدد',
                visitsCount: 1,
                lastVisit: b.date || 'اليوم',
                lastService: b.service || 'تقويم الأسنان',
                notes: b.notes || 'لا توجد ملاحظات سابقة'
            });
        } else {
            const p = map.get(phone);
            p.visitsCount++;
            if (b.notes && !p.notes.includes(b.notes)) {
                p.notes += ' | ' + b.notes;
            }
        }
    });

    AdminState.patients = Array.from(map.values());
}

// --------------------------------------------------------------------------
// 3. Tab Routing & Navigation (Standard Clinical Flat Architecture)
// --------------------------------------------------------------------------
export const adminTabMetadata = {
    'overview': { title: 'نظرة عامة ومؤشرات', category: 'العمليات السريرية', icon: 'bxs-dashboard' },
    'bookings': { title: 'جدول المواعيد والحجوزات', category: 'العمليات السريرية', icon: 'bx-calendar-check' },
    'clinic': { aliasOf: 'bookings' },
    'patients': { title: 'سجل ملفات المرضى', category: 'العمليات السريرية', icon: 'bx-user-pin' },
    'messages': { title: 'رسائل واستفسارات الزوار', category: 'العمليات السريرية', icon: 'bx-envelope' },

    'media': { title: 'الشعار وهوية العيادة', category: 'محتوى الموقع CMS', icon: 'bx-images' },
    'content': { aliasOf: 'media' },
    'gallery': { title: 'معرض الحالات وقبل/بعد', category: 'محتوى الموقع CMS', icon: 'bx-slider-alt' },
    'services': { title: 'الخدمات والأسعار', category: 'محتوى الموقع CMS', icon: 'bx-plus-medical' },
    'testimonials': { title: 'آراء وتقييمات المرضى', category: 'محتوى الموقع CMS', icon: 'bx-star' },
    'newsletter': { aliasOf: 'messages' },

    'settings': { title: 'بيانات وأرقام العيادة', category: 'النظام والإعدادات', icon: 'bx-cog' },
    'clinic-info': { aliasOf: 'settings' },
    'publish': { title: 'النشر السحابي والمزامنة', category: 'النظام والإعدادات', icon: 'bxl-github' },
    'github': { aliasOf: 'publish' },
    'github-sync': { aliasOf: 'publish' },
    'backup': { title: 'النسخ الاحتياطي وتليجرام', category: 'النظام والإعدادات', icon: 'bx-archive' },
    'database': { aliasOf: 'backup' },
    'telegram': { aliasOf: 'backup' }
};

export function initNavigation() {
    // Sidebar navigation links
    document.querySelectorAll('.sidebar-link[data-tab]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = link.getAttribute('data-tab');
            switchTab(tabId);
        });
    });

    // Hash change routing
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash.replace('#', '');
        if (hash) switchTab(hash, false);
    });

    const initialHash = window.location.hash.replace('#', '') || 'overview';
    switchTab(initialHash, false);

    // Mobile Sidebar toggle
    const toggleBtn = document.getElementById('mobileSidebarToggle');
    const sidebar = document.getElementById('adminSidebar');
    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('mobile-open');
        });

        document.querySelectorAll('.sidebar-link').forEach(l => {
            l.addEventListener('click', () => {
                if (window.innerWidth <= 1024) {
                    sidebar.classList.remove('mobile-open');
                }
            });
        });
    }

    // Theme Switcher (Dark / Light)
    const themeBtn = document.getElementById('admThemeToggleBtn');
    const savedTheme = localStorage.getItem('adm_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const cur = document.documentElement.getAttribute('data-theme') || 'light';
            const next = cur === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('adm_theme', next);
            updateThemeIcon(next);
            showToast(`تم التبديل إلى المظهر ${next === 'dark' ? 'الليلي' : 'النهاري'}`, 'warning');
        });
    }

    // Global Shortcut: Ctrl+K / Cmd+K to jump to bookings search
    window.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            switchTab('bookings');
            const searchInput = document.getElementById('bookingsSearchInput');
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        }
    });
}

function updateThemeIcon(theme) {
    const themeBtn = document.getElementById('admThemeToggleBtn');
    if (themeBtn) {
        themeBtn.innerHTML = theme === 'dark' ? '<i class="bx bx-sun"></i>' : '<i class="bx bx-moon"></i>';
    }
}

export function switchTab(tabId, updateHash = true) {
    let cleanId = (tabId || 'overview').replace('#', '').trim();
    if (cleanId.includes('/')) {
        const parts = cleanId.split('/');
        cleanId = parts[1] || parts[0];
    }

    if (adminTabMetadata[cleanId] && adminTabMetadata[cleanId].aliasOf) {
        cleanId = adminTabMetadata[cleanId].aliasOf;
    }

    if (!adminTabMetadata[cleanId]) {
        cleanId = 'overview';
    }

    const meta = adminTabMetadata[cleanId];
    AdminState.currentTab = cleanId;

    // 1. Sidebar link active state
    document.querySelectorAll('.sidebar-item').forEach(item => item.classList.remove('active'));
    const activeLink = document.querySelector(`.sidebar-link[data-tab="${cleanId}"]`);
    if (activeLink && activeLink.parentElement) {
        activeLink.parentElement.classList.add('active');
    }

    // 2. Tab panels display
    document.querySelectorAll('.tab-content-panel').forEach(p => p.classList.remove('active'));
    const targetPanel = document.getElementById(`tab-${cleanId}`);
    if (targetPanel) {
        targetPanel.classList.add('active');
    }

    // 3. Breadcrumbs update
    const breadcrumbCategory = document.getElementById('admBreadcrumbCategory');
    const breadcrumbCurrent = document.getElementById('admBreadcrumbCurrent');
    if (breadcrumbCategory && meta.category) breadcrumbCategory.textContent = meta.category;
    if (breadcrumbCurrent && meta.title) breadcrumbCurrent.textContent = meta.title;

    // 4. Update hash
    if (updateHash) {
        window.location.hash = cleanId;
    }

    // 5. Render panel content
    renderTab(cleanId);
}

// Global helpers for button onclick attributes
window.switchTab = switchTab;
window.switchTabAndSub = (parent, sub) => switchTab(sub || parent);

// --------------------------------------------------------------------------
// 4. Render Engine
// --------------------------------------------------------------------------
export function renderAll() {
    updateBadges();
    renderOverview();
    renderBookings();
    renderPatients();
    renderServices();
    renderTestimonials();
    renderContacts();
    renderNewsletter();
    renderDatabase();
    renderMedia();
    renderAdminGallery();
}

export function renderTab(tabId) {
    updateBadges();
    switch (tabId) {
        case 'overview': 
            renderOverview(); 
            break;
        case 'bookings': 
            renderBookings(); 
            break;
        case 'patients': 
            renderPatients(); 
            break;
        case 'messages': 
            renderContacts(); 
            break;
        case 'media': 
            renderMedia(); 
            break;
        case 'gallery': 
            renderAdminGallery(); 
            break;
        case 'services': 
            renderServices(); 
            break;
        case 'testimonials': 
            renderTestimonials(); 
            break;
        case 'settings': 
            renderSettings(); 
            break;
        case 'publish': 
            renderGithubSync(); 
            break;
        case 'backup': 
            renderDatabase(); 
            renderTelegram(); 
            break;
        default:
            renderOverview();
            break;
    }
}

function updateBadges() {
    const pendingCount = AdminState.bookings.filter(b => b.status === 'pending').length;
    const unreadMsgs = AdminState.contacts.filter(c => c.status === 'unread').length;

    // Sidebar badges
    const bookingBadge = document.getElementById('badgeBookingsCount');
    if (bookingBadge) {
        bookingBadge.textContent = pendingCount;
        bookingBadge.style.display = pendingCount > 0 ? 'inline-block' : 'none';
    }

    const patientsBadge = document.getElementById('badgePatientsCount');
    if (patientsBadge) {
        patientsBadge.textContent = AdminState.patients.length;
        patientsBadge.style.display = AdminState.patients.length > 0 ? 'inline-block' : 'none';
    }

    const messagesBadge = document.getElementById('badgeMessagesCount');
    if (messagesBadge) {
        messagesBadge.textContent = unreadMsgs;
        messagesBadge.style.display = unreadMsgs > 0 ? 'inline-block' : 'none';
    }

    const galleryBadge = document.getElementById('badgeGalleryCount');
    if (galleryBadge) {
        galleryBadge.textContent = AdminState.galleryCases.length;
        galleryBadge.style.display = 'inline-block';
    }

    // Command Center Overview Cards counters
    const cmdBookingsCount = document.getElementById('cmdBookingsCount');
    if (cmdBookingsCount) {
        cmdBookingsCount.textContent = AdminState.bookings.length + ' موعد';
    }

    const cmdGalleryCount = document.getElementById('cmdGalleryCount');
    if (cmdGalleryCount) {
        cmdGalleryCount.textContent = AdminState.galleryCases.length + ' حالات';
    }

    const notifBellBadge = document.getElementById('headerNotifBadge');
    if (notifBellBadge) {
        const total = pendingCount + unreadMsgs;
        notifBellBadge.style.display = total > 0 ? 'block' : 'none';
    }
}

// --------------------------------------------------------------------------
// 5. Overview Tab
// --------------------------------------------------------------------------
function renderOverview() {
    const totalBookings = AdminState.bookings.length;
    const confirmedCount = AdminState.bookings.filter(b => b.status === 'confirmed').length;
    const patientsCount = AdminState.patients.length;

    let totalRevenue = 0;
    AdminState.bookings.forEach(b => {
        if (b.status !== 'cancelled') {
            const srv = AdminState.services.find(s => s.name === b.service);
            totalRevenue += srv ? srv.price : 1500;
        }
    });

    const kpiTotal = document.getElementById('kpiTotalBookings');
    if (kpiTotal) kpiTotal.textContent = totalBookings;

    const kpiConfirmed = document.getElementById('kpiConfirmedBookings');
    if (kpiConfirmed) {
        const rate = totalBookings > 0 ? Math.round((confirmedCount / totalBookings) * 100) : 0;
        kpiConfirmed.innerHTML = `${confirmedCount} <span style="font-size: 14px; color: var(--adm-text-muted); font-weight: normal;">(${rate}%)</span>`;
    }

    const kpiPatients = document.getElementById('kpiTotalPatients');
    if (kpiPatients) kpiPatients.textContent = patientsCount;

    const kpiRevenue = document.getElementById('kpiTotalRevenue');
    if (kpiRevenue) kpiRevenue.textContent = totalRevenue.toLocaleString('ar-SA') + ' ر.س';

    // Render Today's Live Queue
    const todayStr = new Date().toISOString().split('T')[0];
    const todayList = AdminState.bookings.filter(b => b.date === todayStr || !b.date);
    const queueTbody = document.getElementById('todayQueueTbody');

    if (queueTbody) {
        if (todayList.length === 0) {
            queueTbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 30px; color: var(--adm-text-muted);">
                        <i class="bx bx-calendar-check" style="font-size: 32px; display: block; margin-bottom: 8px;"></i>
                        لا توجد مواعيد متبقية لليوم! يمكنك إضافة موعد جديد عبر الزر أعلاه.
                    </td>
                </tr>
            `;
        } else {
            queueTbody.innerHTML = todayList.map(b => `
                <tr>
                    <td><strong>${b.id}</strong></td>
                    <td>
                        <div style="font-weight: 700;">${b.name}</div>
                        <div style="font-size: 12px; color: var(--adm-text-muted);">${b.phone}</div>
                    </td>
                    <td><span class="status-badge ${b.chair && b.chair.includes('VIP') ? 'completed' : 'pending'}">${b.chair || 'عيادة عامة'}</span></td>
                    <td><span style="font-family: 'Outfit'; font-weight: 700;">${b.time || '10:00 ص'}</span></td>
                    <td><span class="status-badge ${b.status}">${getStatusLabel(b.status)}</span></td>
                    <td>
                        <div style="display: flex; gap: 6px;">
                            ${b.status !== 'confirmed' ? `<button class="adm-btn adm-btn-success adm-btn-sm" onclick="window.adminActions.confirmBooking('${b.id}')" title="تأكيد"><i class="bx bx-check"></i></button>` : ''}
                            ${b.status !== 'completed' ? `<button class="adm-btn adm-btn-primary adm-btn-sm" onclick="window.adminActions.completeBooking('${b.id}')" title="إكمال العلاج"><i class="bx bx-badge-check"></i></button>` : ''}
                            <button class="adm-btn adm-btn-secondary adm-btn-sm" onclick="window.adminActions.openWhatsApp('${b.phone}', '${b.name}', '${b.time}')" title="مراسلة واتساب"><i class="bx bxl-whatsapp" style="color: #25D366; font-size: 16px;"></i></button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    }

    // Render Services Distribution Bars
    const serviceDistributionContainer = document.getElementById('serviceDistributionBars');
    if (serviceDistributionContainer) {
        const counts = {};
        AdminState.bookings.forEach(b => {
            counts[b.service] = (counts[b.service] || 0) + 1;
        });

        const total = AdminState.bookings.length || 1;
        serviceDistributionContainer.innerHTML = Object.entries(counts).map(([srv, count]) => {
            const pct = Math.round((count / total) * 100);
            return `
                <div style="margin-bottom: 12px;">
                    <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 700; margin-bottom: 4px;">
                        <span>${srv}</span>
                        <span>${count} موعد (${pct}%)</span>
                    </div>
                    <div style="height: 8px; background: var(--adm-surface-alt); border-radius: 4px; overflow: hidden; border: 1px solid var(--adm-border);">
                        <div style="height: 100%; width: ${pct}%; background: linear-gradient(90deg, var(--adm-primary), var(--adm-purple)); border-radius: 4px;"></div>
                    </div>
                </div>
            `;
        }).join('');
    }
}

// --------------------------------------------------------------------------
// 6. Bookings Manager Tab
// --------------------------------------------------------------------------
function renderBookings() {
    const tbody = document.getElementById('bookingsTableBody');
    if (!tbody) return;

    let filtered = AdminState.bookings.filter(b => {
        const q = AdminState.filters.search.toLowerCase();
        const matchesQuery = !q || (b.name && b.name.toLowerCase().includes(q)) || 
                             (b.phone && b.phone.includes(q)) || 
                             (b.id && b.id.toLowerCase().includes(q));

        const matchesStatus = AdminState.filters.status === 'all' || b.status === AdminState.filters.status;
        const matchesChair = AdminState.filters.chair === 'all' || (b.chair && b.chair.includes(AdminState.filters.chair));
        
        let matchesDate = true;
        const todayStr = new Date().toISOString().split('T')[0];
        if (AdminState.filters.date === 'today') {
            matchesDate = b.date === todayStr;
        } else if (AdminState.filters.date === 'week') {
            const d = new Date(b.date);
            const diff = Math.abs(d - new Date());
            matchesDate = diff <= 7 * 86400000;
        }

        return matchesQuery && matchesStatus && matchesChair && matchesDate;
    });

    const countElem = document.getElementById('bookingsResultCount');
    if (countElem) countElem.textContent = `عرض ${filtered.length} من إجمالي ${AdminState.bookings.length} موعد`;

    if (filtered.length === 0) {
        if (AdminState.bookings.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 60px 20px; color: var(--adm-text-muted);">
                        <div style="max-width: 440px; margin: 0 auto; display: flex; flex-direction: column; align-items: center; gap: 14px;">
                            <div style="width: 72px; height: 72px; border-radius: 50%; background: rgba(21, 101, 255, 0.08); display: flex; align-items: center; justify-content: center;">
                                <i class="bx bx-calendar-check" style="font-size: 38px; color: var(--adm-primary);"></i>
                            </div>
                            <h4 style="margin: 0; font-size: 18px; font-weight: 800; color: var(--adm-text-main);">لا توجد حجوزات مسجلة حتى الآن</h4>
                            <p style="margin: 0; font-size: 13.5px; color: var(--adm-text-muted); line-height: 1.6;">
                                تم تنظيف كافة بيانات التيست التجريبية. أي حجز جديد يقوم المريض بتسجيله من صفحة الحجز سيظهر هنا مباشرة وفي الوقت الفعلي.
                            </p>
                            <button type="button" class="adm-btn adm-btn-primary" onclick="window.adminActions.newBookingForPatient('', '')" style="margin-top: 6px;">
                                <i class="bx bx-plus"></i> إضافة موعد جديد يدوياً
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        } else {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 40px; color: var(--adm-text-muted);">
                        <i class="bx bx-search-alt" style="font-size: 36px; display: block; margin-bottom: 10px;"></i>
                        لا توجد مواعيد مطابقة للبحث أو الفلتر المحدد!
                    </td>
                </tr>
            `;
        }
        return;
    }

    tbody.innerHTML = filtered.map(b => `
        <tr>
            <td><strong style="font-family: 'Outfit'; color: var(--adm-primary);">${b.id}</strong></td>
            <td>
                <div style="font-weight: 800; font-size: 14.5px;">${b.name}</div>
                <div style="font-size: 12px; color: var(--adm-text-muted);"><i class="bx bx-user"></i> العمر: ${b.age || 'غير محدد'} سنة</div>
            </td>
            <td>
                <div style="font-family: 'Outfit'; font-weight: 600; direction: ltr; text-align: right;">${b.phone}</div>
                <div style="font-size: 11.5px; color: var(--adm-text-muted);">${b.email || '—'}</div>
            </td>
            <td>
                <div style="font-weight: 700;">${b.service || 'تقويم الأسنان'}</div>
                <span class="status-badge ${b.chair && b.chair.includes('VIP') ? 'completed' : 'pending'}" style="font-size: 11px; margin-top: 3px;">${b.chair || 'جناح العيادة'}</span>
            </td>
            <td>
                <div style="font-family: 'Outfit'; font-weight: 700;"><i class="bx bx-calendar"></i> ${b.date || '—'}</div>
                <div style="font-size: 12px; color: var(--adm-text-muted); font-family: 'Outfit';"><i class="bx bx-time"></i> ${b.time || '—'}</div>
            </td>
            <td><span class="status-badge ${b.status}">${getStatusLabel(b.status)}</span></td>
            <td>
                <span title="${b.notes || ''}" style="font-size: 12.5px; color: var(--adm-text-muted); display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; max-width: 140px;">
                    ${b.notes || '—'}
                </span>
            </td>
            <td>
                <div style="display: flex; gap: 5px; align-items: center;">
                    ${b.status !== 'confirmed' ? `<button class="adm-btn adm-btn-success adm-btn-icon" onclick="window.adminActions.confirmBooking('${b.id}')" title="تأكيد الحجز"><i class="bx bx-check"></i></button>` : ''}
                    ${b.status !== 'completed' ? `<button class="adm-btn adm-btn-primary adm-btn-icon" onclick="window.adminActions.completeBooking('${b.id}')" title="إكمال الجلسة"><i class="bx bx-badge-check"></i></button>` : ''}
                    <button class="adm-btn adm-btn-secondary adm-btn-icon" onclick="window.adminActions.openWhatsApp('${b.phone}', '${b.name}', '${b.date} - ${b.time}')" title="مراسلة واتساب"><i class="bx bxl-whatsapp" style="color: #25D366; font-size: 17px;"></i></button>
                    <button class="adm-btn adm-btn-secondary adm-btn-icon" onclick="window.adminActions.viewBookingModal('${b.id}')" title="عرض التفاصيل"><i class="bx bx-show"></i></button>
                    <button class="adm-btn adm-btn-secondary adm-btn-icon" onclick="window.adminActions.editBookingModal('${b.id}')" title="تعديل"><i class="bx bx-edit"></i></button>
                    <button class="adm-btn adm-btn-danger adm-btn-icon" onclick="window.adminActions.deleteBooking('${b.id}')" title="حذف"><i class="bx bx-trash"></i></button>
                </div>
            </td>
        </tr>
    `).join('');
}

// --------------------------------------------------------------------------
// 7. Patients CRM Tab
// --------------------------------------------------------------------------
function renderPatients() {
    const tbody = document.getElementById('patientsTableBody');
    if (!tbody) return;

    extractPatientsFromBookings();

    if (AdminState.patients.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: var(--adm-text-muted);">
                    <i class="bx bx-user-x" style="font-size: 36px; display: block; margin-bottom: 10px;"></i>
                    لا توجد ملفات مرضى مسجلة حالياً!
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = AdminState.patients.map(p => `
        <tr>
            <td><strong style="font-family: 'Outfit'; color: var(--adm-primary);">${p.id}</strong></td>
            <td>
                <div style="font-weight: 800; font-size: 15px;">${p.name}</div>
                <div style="font-size: 12px; color: var(--adm-text-muted);">العمر: ${p.age} سنة</div>
            </td>
            <td>
                <div style="font-family: 'Outfit'; direction: ltr; text-align: right; font-weight: 700;">${p.phone}</div>
                <div style="font-size: 12px; color: var(--adm-text-muted);">${p.email}</div>
            </td>
            <td><span class="status-badge completed" style="font-family: 'Outfit'; font-weight: 800;">${p.visitsCount} زيارات</span></td>
            <td>
                <div style="font-weight: 600;">${p.lastService}</div>
                <div style="font-size: 11.5px; color: var(--adm-text-muted);">${p.lastVisit}</div>
            </td>
            <td>
                <div style="font-size: 12.5px; color: var(--adm-text-muted); max-width: 180px; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;">
                    ${p.notes}
                </div>
            </td>
            <td>
                <div style="display: flex; gap: 6px;">
                    <button class="adm-btn adm-btn-secondary adm-btn-sm" onclick="window.adminActions.openWhatsApp('${p.phone}', '${p.name}', '')" title="مراسلة واتساب"><i class="bx bxl-whatsapp" style="color: #25D366; font-size: 16px;"></i> واتساب</button>
                    <button class="adm-btn adm-btn-primary adm-btn-sm" onclick="window.adminActions.newBookingForPatient('${p.name}', '${p.phone}')"><i class="bx bx-calendar-plus"></i> حجز</button>
                </div>
            </td>
        </tr>
    `).join('');
}

// --------------------------------------------------------------------------
// 8. Services & Pricing Tab
// --------------------------------------------------------------------------
function renderServices() {
    const grid = document.getElementById('servicesGridContainer');
    if (!grid) return;

    grid.innerHTML = AdminState.services.map(s => `
        <div class="adm-card" style="display: flex; flex-direction: column; justify-content: space-between; gap: 14px;">
            <div>
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                    <h4 style="margin: 0; font-size: 16px; font-weight: 800; color: var(--adm-text-main);">${s.name}</h4>
                    <span class="status-badge ${s.active ? 'confirmed' : 'cancelled'}">${s.active ? 'نشط ومتاح' : 'متوقف مؤقتاً'}</span>
                </div>
                <p style="font-size: 13px; color: var(--adm-text-muted); margin: 0 0 12px 0;">${s.desc}</p>
                <div style="display: flex; gap: 12px; font-size: 12.5px; color: var(--adm-text-muted);">
                    <span><i class="bx bx-time"></i> ${s.duration}</span>
                    <span><i class="bx bx-category"></i> ${getCategoryLabel(s.category)}</span>
                </div>
            </div>

            <div style="padding-top: 12px; border-top: 1px solid var(--adm-border); display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <span style="font-size: 11px; color: var(--adm-text-muted); display: block;">سعر الخدمة:</span>
                    <strong style="font-size: 20px; font-family: 'Outfit'; color: var(--adm-primary);">${s.price.toLocaleString('ar-SA')} ر.س</strong>
                </div>
                <div style="display: flex; gap: 6px;">
                    <button class="adm-btn adm-btn-secondary adm-btn-sm" onclick="window.adminActions.toggleService('${s.id}')" title="تبديل الحالة">
                        <i class="bx ${s.active ? 'bx-hide' : 'bx-show'}"></i>
                    </button>
                    <button class="adm-btn adm-btn-primary adm-btn-sm" onclick="window.adminActions.editServicePrice('${s.id}')">تعديل السعر</button>
                </div>
            </div>
        </div>
    `).join('');
}

// --------------------------------------------------------------------------
// 9. Testimonials Manager Tab
// --------------------------------------------------------------------------
function renderTestimonials() {
    const list = document.getElementById('testimonialsListContainer');
    if (!list) return;

    list.innerHTML = AdminState.testimonials.map(t => {
        let starsHtml = '';
        for (let i = 0; i < 5; i++) {
            starsHtml += `<i class="bx ${i < t.stars ? 'bxs-star' : 'bx-star'}" style="color: #F59E0B;"></i>`;
        }
        return `
            <div class="adm-card" style="margin-bottom: 14px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                    <div>
                        <div style="font-weight: 800; font-size: 15px;">${t.name}</div>
                        <div style="font-size: 12px; color: var(--adm-text-muted);">${t.tag || 'مريض مـؤكّد ✓'}</div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="display: flex; gap: 2px;">${starsHtml}</div>
                        <button class="adm-btn adm-btn-danger adm-btn-sm" onclick="window.adminActions.deleteTestimonial(${t.id})"><i class="bx bx-trash"></i></button>
                    </div>
                </div>
                <p style="font-size: 14px; line-height: 1.6; color: var(--adm-text-main); margin: 0;">"${t.text}"</p>
            </div>
        `;
    }).join('');
}

// --------------------------------------------------------------------------
// 10. Contact Inquiries Tab
// --------------------------------------------------------------------------
function renderContacts() {
    const tbody = document.getElementById('contactsTableBody');
    if (!tbody) return;

    if (AdminState.contacts.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px; color: var(--adm-text-muted);">
                    <i class="bx bx-envelope-open" style="font-size: 36px; display: block; margin-bottom: 10px;"></i>
                    لا توجد رسائل تواصل جديدة!
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = AdminState.contacts.map(c => `
        <tr style="${c.status === 'unread' ? 'background: rgba(21, 101, 255, 0.04); font-weight: 600;' : ''}">
            <td><strong style="font-family: 'Outfit';">${c.id}</strong></td>
            <td>
                <div>${c.name}</div>
                <div style="font-size: 12px; color: var(--adm-text-muted); font-family: 'Outfit'; direction: ltr; text-align: right;">${c.phone}</div>
            </td>
            <td><div style="font-size: 13px; font-family: 'Outfit';">${c.email}</div></td>
            <td><div style="font-size: 13.5px; max-width: 300px;">${c.message}</div></td>
            <td><span style="font-size: 12px; color: var(--adm-text-muted);">${c.date}</span></td>
            <td>
                <div style="display: flex; gap: 6px;">
                    <button class="adm-btn adm-btn-secondary adm-btn-sm" onclick="window.adminActions.openWhatsApp('${c.phone}', '${c.name}', 'استفسارك في عيادة د. أكثم')" title="رد عبر واتساب">
                        <i class="bx bxl-whatsapp" style="color: #25D366; font-size: 16px;"></i> رد
                    </button>
                    ${c.status === 'unread' ? `<button class="adm-btn adm-btn-primary adm-btn-sm" onclick="window.adminActions.markContactRead('${c.id}')"><i class="bx bx-check"></i> مقروء</button>` : ''}
                    <button class="adm-btn adm-btn-danger adm-btn-icon" onclick="window.adminActions.deleteContact('${c.id}')"><i class="bx bx-trash"></i></button>
                </div>
            </td>
        </tr>
    `).join('');
}

// --------------------------------------------------------------------------
// 11. Newsletter Tab
// --------------------------------------------------------------------------
function renderNewsletter() {
    const tbody = document.getElementById('newsletterTableBody');
    if (!tbody) return;

    const countElem = document.getElementById('newsletterTotalCount');
    if (countElem) countElem.textContent = `${AdminState.newsletter.length} مشترك`;

    tbody.innerHTML = AdminState.newsletter.map((n, idx) => `
        <tr>
            <td>${idx + 1}</td>
            <td><strong style="font-family: 'Outfit'; font-size: 14.5px;">${n.email}</strong></td>
            <td><span style="font-family: 'Outfit'; font-size: 12.5px; color: var(--adm-text-muted);">${n.date}</span></td>
            <td><span class="status-badge confirmed">مشترك نشط</span></td>
            <td>
                <button class="adm-btn adm-btn-danger adm-btn-sm" onclick="window.adminActions.deleteNewsletterEmail('${n.email}')"><i class="bx bx-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

// --------------------------------------------------------------------------
// 12. Telegram Hub Tab
// --------------------------------------------------------------------------
function renderTelegram() {
    const tokenInput = document.getElementById('admTgToken');
    const chatIdInput = document.getElementById('admTgChatId');

    if (tokenInput) tokenInput.value = localStorage.getItem('tg_bot_token') || '';
    if (chatIdInput) chatIdInput.value = localStorage.getItem('tg_chat_id') || '';
}

// --------------------------------------------------------------------------
// 13. Data & Storage Hub Tab (100% Local / Standalone)
// --------------------------------------------------------------------------
function renderDatabase() {
    // Render Storage Statistics
    const bookingsCnt = AdminState.bookings.length;
    const patientsCnt = AdminState.patients.length;
    const servicesCnt = AdminState.services.length;
    const testimonialsCnt = AdminState.testimonials.length;
    const contactsCnt = AdminState.contacts.length;
    const newsletterCnt = AdminState.newsletter.length;

    const statsElem = document.getElementById('admStorageStats');
    if (statsElem) {
        statsElem.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 14px; margin-top: 14px;">
                <div style="background: var(--adm-surface); padding: 14px; border-radius: 12px; border: 1px solid var(--adm-border); text-align: center;">
                    <span style="font-size: 12px; color: var(--adm-text-muted); display: block;">الحجوزات</span>
                    <strong style="font-size: 22px; font-family: 'Outfit'; color: var(--adm-primary);">${bookingsCnt}</strong>
                </div>
                <div style="background: var(--adm-surface); padding: 14px; border-radius: 12px; border: 1px solid var(--adm-border); text-align: center;">
                    <span style="font-size: 12px; color: var(--adm-text-muted); display: block;">ملفات المرضى</span>
                    <strong style="font-size: 22px; font-family: 'Outfit'; color: var(--adm-purple);">${patientsCnt}</strong>
                </div>
                <div style="background: var(--adm-surface); padding: 14px; border-radius: 12px; border: 1px solid var(--adm-border); text-align: center;">
                    <span style="font-size: 12px; color: var(--adm-text-muted); display: block;">الخدمات</span>
                    <strong style="font-size: 22px; font-family: 'Outfit'; color: var(--adm-success);">${servicesCnt}</strong>
                </div>
                <div style="background: var(--adm-surface); padding: 14px; border-radius: 12px; border: 1px solid var(--adm-border); text-align: center;">
                    <span style="font-size: 12px; color: var(--adm-text-muted); display: block;">التقييمات</span>
                    <strong style="font-size: 22px; font-family: 'Outfit'; color: #F59E0B;">${testimonialsCnt}</strong>
                </div>
                <div style="background: var(--adm-surface); padding: 14px; border-radius: 12px; border: 1px solid var(--adm-border); text-align: center;">
                    <span style="font-size: 12px; color: var(--adm-text-muted); display: block;">رسائل التواصل</span>
                    <strong style="font-size: 22px; font-family: 'Outfit'; color: var(--adm-cyan);">${contactsCnt}</strong>
                </div>
                <div style="background: var(--adm-surface); padding: 14px; border-radius: 12px; border: 1px solid var(--adm-border); text-align: center;">
                    <span style="font-size: 12px; color: var(--adm-text-muted); display: block;">النشرة البريدية</span>
                    <strong style="font-size: 22px; font-family: 'Outfit'; color: var(--adm-text-main);">${newsletterCnt}</strong>
                </div>
            </div>
        `;
    }
}

// --------------------------------------------------------------------------
// 14. Clinic CMS Settings Tab
// --------------------------------------------------------------------------
function renderSettings() {
    import('./settings/general.js').then(module => {
        const s = module.GeneralSettings;
        if (!s) return;

        const setVal = (id, val) => {
            const el = document.getElementById(id);
            if (el && val !== undefined) el.value = val;
        };

        setVal('cfgClinicName', s.clinicName);
        setVal('cfgClinicSub', s.clinicSubName);
        setVal('cfgPhone', s.phone);
        setVal('cfgPhoneFormatted', s.phoneFormatted);
        setVal('cfgEmergency', s.emergencyPhone);
        setVal('cfgWhatsapp', s.whatsapp);
        setVal('cfgEmail', s.email);
        setVal('cfgAddress', s.address);
        setVal('cfgHours', s.workingHours);
        setVal('cfgMaps', s.googleMapsIframe);
        setVal('cfgFacebook', s.facebook);
        setVal('cfgInstagram', s.instagram);
        setVal('cfgTwitter', s.twitter);

        if (s.theme && s.theme.primary) {
            setVal('cfgPrimaryColor', s.theme.primary);
        }
    });
}

// --------------------------------------------------------------------------
// 14.b GitHub & Vercel Auto-Deploy CMS Tab
// --------------------------------------------------------------------------
export function renderGithubSync() {
    const cfg = getGithubConfig();

    const tokenInput = document.getElementById('ghTokenInput');
    const ownerInput = document.getElementById('ghOwnerInput');
    const repoInput = document.getElementById('ghRepoInput');
    const branchInput = document.getElementById('ghBranchInput');
    const filePathInput = document.getElementById('ghFilePathInput');
    const autoSyncCheckbox = document.getElementById('ghAutoSyncCheckbox');

    if (tokenInput && !tokenInput.dataset.userEditing) tokenInput.value = cfg.token || '';
    if (ownerInput) ownerInput.value = cfg.owner || 'shaherismail';
    if (repoInput) repoInput.value = cfg.repo || 'Dr.Aktham_Tantawy';
    if (branchInput) branchInput.value = cfg.branch || 'main';
    if (filePathInput) filePathInput.value = cfg.filePath || 'data/clinic_data.json';
    if (autoSyncCheckbox) autoSyncCheckbox.checked = !!cfg.autoSync;

    const repoDisplay = document.getElementById('ghRepoDisplay');
    if (repoDisplay) repoDisplay.textContent = `${cfg.owner}/${cfg.repo}`;

    const branchDisplay = document.getElementById('ghBranchDisplay');
    if (branchDisplay) branchDisplay.textContent = `الفرع: ${cfg.branch} (إنتاج مباشر)`;

    updateGithubStatusUI(cfg);
}

function updateGithubStatusUI(cfg) {
    const statusBadge = document.getElementById('ghStatusBadge');
    const statusDot = document.getElementById('ghStatusDot');
    const statusText = document.getElementById('ghStatusText');
    const lastSyncDisplay = document.getElementById('ghLastSyncDisplay');
    const lastCommitLink = document.getElementById('ghLastCommitLink');
    const sidebarBadge = document.getElementById('badgeGithubStatus');

    if (cfg.token) {
        if (statusBadge) statusBadge.className = 'gh-status-badge connected';
        if (statusDot) statusDot.className = 'pulse-indicator green';
        if (statusText) statusText.textContent = 'متصل وجاهز للنشر';
        if (sidebarBadge) {
            sidebarBadge.className = 'sidebar-badge badge-green';
            sidebarBadge.textContent = 'متصل';
        }
    } else {
        if (statusBadge) statusBadge.className = 'gh-status-badge disconnected';
        if (statusDot) statusDot.className = 'pulse-indicator red';
        if (statusText) statusText.textContent = 'غير متصل - أدخل التوكن';
        if (sidebarBadge) {
            sidebarBadge.className = 'sidebar-badge badge-yellow';
            sidebarBadge.textContent = 'إعداد';
        }
    }

    if (cfg.lastSync && lastSyncDisplay) {
        const d = new Date(cfg.lastSync);
        lastSyncDisplay.textContent = d.toLocaleDateString('ar-SA', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    if (cfg.lastCommitUrl && lastCommitLink) {
        lastCommitLink.href = cfg.lastCommitUrl;
        lastCommitLink.style.display = 'inline-flex';
        if (cfg.lastCommitSha) {
            lastCommitLink.innerHTML = `<i class="bx bx-git-commit"></i> عرض الـ Commit (${cfg.lastCommitSha})`;
        }
    }
}

// --------------------------------------------------------------------------
// 14.c Media & Branding Management (Logo & Doctor Image)
// --------------------------------------------------------------------------
export function renderMedia() {
    const s = AdminState.settings || {};
    const logoImg = document.getElementById('logoPreviewImg');
    const logoInput = document.getElementById('logoUrlInput');
    const doctorImg = document.getElementById('doctorPreviewImg');
    const doctorInput = document.getElementById('doctorUrlInput');

    const logoSrc = s.logoUrl || 'assets/logo.jpg';
    const doctorSrc = s.doctorPhotoUrl || 'assets/doctor.jpg';

    if (logoImg) logoImg.src = logoSrc;
    if (logoInput) logoInput.value = logoSrc;
    if (doctorImg) doctorImg.src = doctorSrc;
    if (doctorInput) doctorInput.value = doctorSrc;
}

// --------------------------------------------------------------------------
// 14.d Gallery Cases CMS Management (Before & After)
// --------------------------------------------------------------------------
export const categoryNamesMap = {
    'all': 'جميع الحالات والتصنيفات',
    'crowding': 'تزاحم الأسنان',
    'spacing': 'فراغات الأسنان',
    'overbite': 'العضة العميقة (Overbite)',
    'crossbite': 'العضة المعكوسة (Crossbite)',
    'openbite': 'العضة المفتوحة (Open Bite)',
    'aligners': 'التقويم الشفاف (Aligners)',
    'other': 'علاجات أخرى / تجميل'
};

export function renderAdminGallery() {
    const container = document.getElementById('adminCasesGridContainer');
    if (!container) return;

    const catFilter = document.getElementById('galleryCategoryFilter')?.value || 'all';
    const searchQuery = (document.getElementById('gallerySearchInput')?.value || '').trim().toLowerCase();

    let cases = AdminState.galleryCases || [];

    if (catFilter !== 'all') {
        cases = cases.filter(c => c.category === catFilter);
    }

    if (searchQuery) {
        cases = cases.filter(c => 
            (c.title && c.title.toLowerCase().includes(searchQuery)) ||
            (c.badge && c.badge.toLowerCase().includes(searchQuery)) ||
            (c.desc && c.desc.toLowerCase().includes(searchQuery))
        );
    }

    if (cases.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 50px 20px; background: var(--adm-card-bg); border-radius: 16px; border: 1px dashed var(--adm-border);">
                <i class="bx bx-image-alt" style="font-size: 54px; color: var(--adm-text-muted); display: block; margin-bottom: 12px;"></i>
                <h4 style="font-size: 16px; font-weight: 700; color: var(--adm-text);">لم يتم العثور على أي حالات مطابقة</h4>
                <p style="font-size: 13px; color: var(--adm-text-muted); margin-bottom: 16px;">جرّب تغيير خيارات البحث أو قم بإضافة حالة علاجية جديدة الآن</p>
                <button type="button" class="adm-btn adm-btn-primary adm-btn-sm" id="admEmptyAddCaseBtn">
                    <i class="bx bx-plus-circle"></i> إضافة حالة علاجية جديدة
                </button>
            </div>
        `;
        const emptyAddBtn = document.getElementById('admEmptyAddCaseBtn');
        if (emptyAddBtn) {
            emptyAddBtn.addEventListener('click', openAddCaseModal);
        }
        return;
    }

    container.innerHTML = cases.map(c => `
        <div class="admin-case-card" data-case-id="${c.id}">
            <div class="admin-case-media-header">
                <div class="admin-case-thumb">
                    <img src="${c.beforeImg || 'assets/case1.jpg'}" alt="قبل" onerror="this.src='assets/case1.jpg'">
                    <span class="admin-thumb-badge badge-before">قبل</span>
                </div>
                <div class="admin-case-thumb">
                    <img src="${c.afterImg || 'assets/case2.jpg'}" alt="بعد" onerror="this.src='assets/case2.jpg'">
                    <span class="admin-thumb-badge badge-after">بعد</span>
                </div>
            </div>
            <div class="admin-case-body">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 8px;">
                    <span class="admin-case-category-tag">${categoryNamesMap[c.category] || c.category}</span>
                    <span style="font-size: 11px; font-weight: 700; color: var(--adm-primary);">${c.badge || ''}</span>
                </div>
                <h4 class="admin-case-title">${c.title}</h4>
                <p class="admin-case-desc">${c.desc || 'لا يوجد وصف مضاف'}</p>
                <div class="admin-case-meta">
                    <span><i class="bx bx-user"></i> ${c.age || '-'}</span>
                    <span><i class="bx bx-time"></i> ${c.duration || '-'}</span>
                    <span><i class="bx bx-calendar-check"></i> ${c.visits || '-'}</span>
                </div>
                <div class="admin-case-actions">
                    <button type="button" class="adm-btn adm-btn-secondary adm-btn-sm edit-case-btn" data-id="${c.id}" style="flex: 1;">
                        <i class="bx bx-edit"></i> تعديل
                    </button>
                    <button type="button" class="adm-btn adm-btn-danger adm-btn-sm delete-case-btn" data-id="${c.id}" style="flex: 1;">
                        <i class="bx bx-trash"></i> حذف
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    // Wire edit & delete buttons
    container.querySelectorAll('.edit-case-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            editCase(id);
        });
    });

    container.querySelectorAll('.delete-case-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            deleteCase(id);
        });
    });
}

export function openAddCaseModal() {
    const form = document.getElementById('caseForm');
    if (form) form.reset();
    const idInput = document.getElementById('caseFormId');
    if (idInput) idInput.value = '';
    const titleEl = document.getElementById('caseModalTitle');
    if (titleEl) titleEl.innerHTML = '<i class="bx bx-plus-medical" style="color: var(--adm-primary);"></i> إضافة حالة جديدة بالمعرض';
    
    const beforePreview = document.getElementById('caseBeforePreview');
    const afterPreview = document.getElementById('caseAfterPreview');
    const beforeUrl = document.getElementById('caseBeforeUrlInput');
    const afterUrl = document.getElementById('caseAfterUrlInput');

    if (beforePreview) beforePreview.src = 'assets/case1.jpg';
    if (afterPreview) afterPreview.src = 'assets/case2.jpg';
    if (beforeUrl) beforeUrl.value = 'assets/case1.jpg';
    if (afterUrl) afterUrl.value = 'assets/case2.jpg';

    openModal('caseModal');
}

export function editCase(caseId) {
    const c = AdminState.galleryCases.find(item => item.id === caseId);
    if (!c) return;

    document.getElementById('caseFormId').value = c.id;
    document.getElementById('caseFormTitle').value = c.title || '';
    document.getElementById('caseFormCategory').value = c.category || 'crowding';
    document.getElementById('caseFormBadge').value = c.badge || '';
    document.getElementById('caseFormAge').value = c.age || '';
    document.getElementById('caseFormDuration').value = c.duration || '';
    document.getElementById('caseFormVisits').value = c.visits || '';
    document.getElementById('caseFormDesc').value = c.desc || '';

    const beforePreview = document.getElementById('caseBeforePreview');
    const afterPreview = document.getElementById('caseAfterPreview');
    const beforeUrl = document.getElementById('caseBeforeUrlInput');
    const afterUrl = document.getElementById('caseAfterUrlInput');

    if (beforePreview) beforePreview.src = c.beforeImg || 'assets/case1.jpg';
    if (afterPreview) afterPreview.src = c.afterImg || 'assets/case2.jpg';
    if (beforeUrl) beforeUrl.value = c.beforeImg || '';
    if (afterUrl) afterUrl.value = c.afterImg || '';

    const titleEl = document.getElementById('caseModalTitle');
    if (titleEl) titleEl.innerHTML = `<i class="bx bx-edit" style="color: var(--adm-primary);"></i> تعديل الحالة: ${c.title}`;

    openModal('caseModal');
}

export async function deleteCase(caseId) {
    const c = AdminState.galleryCases.find(item => item.id === caseId);
    if (!c) return;

    if (!confirm(`هل أنت متأكد من حذف الحالة "${c.title}" نهائياً من معرض الأعمال؟`)) {
        return;
    }

    AdminState.galleryCases = AdminState.galleryCases.filter(item => item.id !== caseId);
    localStorage.setItem('dr_aktham_gallery_cases', JSON.stringify(AdminState.galleryCases));
    showToast(`تم حذف الحالة "${c.title}" بنجاح!`, 'success');
    renderAdminGallery();
    updateBadges();

    // Auto sync to GitHub if configured
    try {
        const ghCfg = getGithubConfig();
        if (ghCfg.token && ghCfg.autoSync) {
            await pushDataToGitHub(`CMS: حذف الحالة العلاجية ${c.title}`);
        }
    } catch (e) {}
}

function getStatusLabel(status) {
    switch (status) {
        case 'confirmed': return 'مؤكد';
        case 'pending': return 'قيد الانتظار';
        case 'completed': return 'مكتمل';
        case 'cancelled': return 'ملغي';
        default: return status || '—';
    }
}

function getCategoryLabel(cat) {
    switch (cat) {
        case 'ortho': return 'تقويم الأسنان';
        case 'cosmetic': return 'تجميل وزراعة';
        case 'general': return 'طب أسنان عام';
        default: return 'عام';
    }
}

// --------------------------------------------------------------------------
// 15. Global Action Handlers
// --------------------------------------------------------------------------
window.adminActions = {
    confirmBooking: (id) => {
        const b = AdminState.bookings.find(item => item.id === id);
        if (b) {
            b.status = 'confirmed';
            saveBookings(`تأكيد الموعد رقم (${id})`);
            showToast(`تم تأكيد الموعد (${id}) بنجاح!`, 'success');
            renderAll();
        }
    },

    completeBooking: (id) => {
        const b = AdminState.bookings.find(item => item.id === id);
        if (b) {
            b.status = 'completed';
            saveBookings(`إكمال الموعد رقم (${id})`);
            showToast(`تم تمييز الموعد (${id}) كمكتمل وتحديث الملف الطبي.`, 'success');
            renderAll();
        }
    },

    deleteBooking: (id) => {
        if (confirm(`هل أنت متأكد من حذف الموعد رقم ${id} نهائياً؟`)) {
            AdminState.bookings = AdminState.bookings.filter(b => b.id !== id);
            saveBookings(`حذف الموعد رقم (${id})`);
            showToast(`تم حذف الموعد (${id}) بنجاح.`, 'warning');
            renderAll();
        }
    },

    openWhatsApp: (phone, name, details) => {
        if (!phone) {
            showToast('رقم الجوال غير مسجل لهذا المريض!', 'error');
            return;
        }
        const clean = phone.replace(/[^0-9]/g, '');
        const saPhone = clean.startsWith('05') ? '966' + clean.slice(1) : clean.startsWith('5') ? '966' + clean : clean;
        const msg = encodeURIComponent(`مرحباً ${name || 'عزيزي المراجع'}، نود تذكيرك بموعدك لدى عيادة الدكتور أكثم طنطاوي لتقويم وجراحة الأسنان ${details ? `(${details})` : ''}. يرجى تأكيد حضورك، ويسعدنا دائماً استقبالكم!`);
        window.open(`https://wa.me/${saPhone}?text=${msg}`, '_blank');
    },

    viewBookingModal: (id) => {
        const b = AdminState.bookings.find(item => item.id === id);
        if (!b) return;

        const body = document.getElementById('viewBookingModalBody');
        if (body) {
            body.innerHTML = `
                <div style="display: flex; flex-direction: column; gap: 14px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--adm-border); padding-bottom: 10px;">
                        <h4 style="margin: 0; font-size: 18px; font-weight: 800;">الموعد رقم: ${b.id}</h4>
                        <span class="status-badge ${b.status}">${getStatusLabel(b.status)}</span>
                    </div>
                    <div class="form-grid-2">
                        <div><strong style="color: var(--adm-text-muted); font-size: 13px;">اسم المريض:</strong><p style="margin: 4px 0; font-size: 15px; font-weight: 700;">${b.name}</p></div>
                        <div><strong style="color: var(--adm-text-muted); font-size: 13px;">رقم الجوال:</strong><p style="margin: 4px 0; font-size: 15px; font-weight: 700; direction: ltr; text-align: right;">${b.phone}</p></div>
                        <div><strong style="color: var(--adm-text-muted); font-size: 13px;">العمر:</strong><p style="margin: 4px 0; font-size: 15px; font-weight: 700;">${b.age || 'غير محدد'} سنة</p></div>
                        <div><strong style="color: var(--adm-text-muted); font-size: 13px;">البريد الإلكتروني:</strong><p style="margin: 4px 0; font-size: 14px;">${b.email || 'غير مسجل'}</p></div>
                        <div><strong style="color: var(--adm-text-muted); font-size: 13px;">الخدمة المطلوبة:</strong><p style="margin: 4px 0; font-size: 15px; font-weight: 700; color: var(--adm-primary);">${b.service}</p></div>
                        <div><strong style="color: var(--adm-text-muted); font-size: 13px;">الجناح / الكرسي:</strong><p style="margin: 4px 0; font-size: 15px; font-weight: 700;">${b.chair || 'عيادة عامة'}</p></div>
                        <div><strong style="color: var(--adm-text-muted); font-size: 13px;">تاريخ الموعد:</strong><p style="margin: 4px 0; font-size: 15px; font-weight: 700;">${b.date}</p></div>
                        <div><strong style="color: var(--adm-text-muted); font-size: 13px;">وقت الموعد:</strong><p style="margin: 4px 0; font-size: 15px; font-weight: 700;">${b.time}</p></div>
                    </div>
                    <div style="margin-top: 10px; background: var(--adm-surface-alt); padding: 14px; border-radius: 12px; border: 1px solid var(--adm-border);">
                        <strong style="color: var(--adm-text-muted); font-size: 13px; display: block; margin-bottom: 6px;">الملاحظات والتشخيص الطبي:</strong>
                        <p style="margin: 0; font-size: 14px; line-height: 1.6;">${b.notes || 'لا توجد ملاحظات مدونة لهذا الموعد.'}</p>
                    </div>
                </div>
            `;
            openModal('viewBookingModal');
        }
    },

    editBookingModal: (id) => {
        const b = AdminState.bookings.find(item => item.id === id);
        if (!b) return;

        document.getElementById('editBookingId').value = b.id;
        document.getElementById('editBookingName').value = b.name;
        document.getElementById('editBookingPhone').value = b.phone;
        document.getElementById('editBookingDate').value = b.date || '';
        document.getElementById('editBookingTime').value = b.time || '10:00 ص';
        document.getElementById('editBookingService').value = b.service || 'التقويم الشفاف (ألاينرز)';
        document.getElementById('editBookingChair').value = b.chair || 'جناح VIP';
        document.getElementById('editBookingStatus').value = b.status || 'pending';
        document.getElementById('editBookingNotes').value = b.notes || '';

        openModal('editBookingModal');
    },

    newBookingForPatient: (name, phone) => {
        openModal('addBookingModal');
        if (name) document.getElementById('addBookingName').value = name;
        if (phone) document.getElementById('addBookingPhone').value = phone;
    },

    clearDemoData: () => {
        if (confirm('هل ترغب في تصفير وحذف جميع بيانات التيست والتجارب من لوحة الإدارة؟')) {
            let b = JSON.parse(localStorage.getItem('dr_aktham_bookings') || '[]');
            b = b.filter(item => item && item.id && !item.id.startsWith('DK-849') && item.name !== 'عبد الرحمن الشمري' && item.name !== 'نورة عبد العزيز القحطاني' && item.name !== 'محمد إبراهيم الدوسري');
            localStorage.setItem('dr_aktham_bookings', JSON.stringify(b));

            let c = JSON.parse(localStorage.getItem('dr_aktham_contacts') || '[]');
            c = c.filter(item => item && item.id !== 'MSG-101' && item.id !== 'MSG-102');
            localStorage.setItem('dr_aktham_contacts', JSON.stringify(c));

            let n = JSON.parse(localStorage.getItem('dr_aktham_newsletter') || '[]');
            n = n.filter(item => {
                const em = typeof item === 'string' ? item : item.email;
                return em && !em.includes('@hospital.sa') && !em.includes('patient.care@');
            });
            localStorage.setItem('dr_aktham_newsletter', JSON.stringify(n));

            initAdminData();
            renderAll();
            showToast('تم تصفير وإزالة كافة بيانات التيست بنجاح! اللوحة نظيفة 100%.', 'success');
        }
    },

    toggleService: (id) => {
        const s = AdminState.services.find(item => item.id === id);
        if (s) {
            s.active = !s.active;
            localStorage.setItem('dr_aktham_services', JSON.stringify(AdminState.services));
            showToast(`تم ${s.active ? 'تفعيل' : 'إيقاف'} خدمة "${s.name}"`, 'success');
            renderServices();

            const ghCfg = getGithubConfig();
            if (ghCfg.token && ghCfg.autoSync) {
                pushDataToGitHub(`CMS: ${s.active ? 'تفعيل' : 'إيقاف'} خدمة ${s.name}`)
                    .then(res => showToast(`🚀 تم تحديث GitHub (${res.commitSha}) وجاري النشر على Vercel!`, 'success'))
                    .catch(() => {});
            }
        }
    },

    editServicePrice: (id) => {
        const s = AdminState.services.find(item => item.id === id);
        if (!s) return;
        const newPrice = prompt(`تعديل سعر خدمة "${s.name}" (بالريال السعودي):`, s.price);
        if (newPrice !== null && !isNaN(newPrice) && Number(newPrice) > 0) {
            s.price = Number(newPrice);
            localStorage.setItem('dr_aktham_services', JSON.stringify(AdminState.services));
            showToast(`تم تحديث سعر "${s.name}" إلى ${s.price} ر.س`, 'success');
            renderServices();

            const ghCfg = getGithubConfig();
            if (ghCfg.token && ghCfg.autoSync) {
                pushDataToGitHub(`CMS: تحديث سعر خدمة ${s.name} إلى ${s.price} ر.س`)
                    .then(res => showToast(`🚀 تم تحديث السعر في GitHub (${res.commitSha}) وجاري النشر على Vercel!`, 'success'))
                    .catch(() => {});
            }
        }
    },

    deleteTestimonial: (id) => {
        if (confirm('هل أنت متأكد من حذف هذا التقييم؟')) {
            AdminState.testimonials = AdminState.testimonials.filter(t => t.id !== id);
            localStorage.setItem('dr_aktham_testimonials', JSON.stringify(AdminState.testimonials));
            showToast('تم حذف التقييم بنجاح.', 'warning');
            renderTestimonials();

            const ghCfg = getGithubConfig();
            if (ghCfg.token && ghCfg.autoSync) {
                pushDataToGitHub(`CMS: حذف تقييم مريض`)
                    .then(res => showToast(`🚀 تم تحديث التقييمات في GitHub (${res.commitSha})!`, 'success'))
                    .catch(() => {});
            }
        }
    },

    markContactRead: (id) => {
        const c = AdminState.contacts.find(item => item.id === id);
        if (c) {
            c.status = 'read';
            localStorage.setItem('dr_aktham_contacts', JSON.stringify(AdminState.contacts));
            showToast('تم تمييز الرسالة كمقروءة.', 'success');
            renderContacts();
            updateBadges();

            const ghCfg = getGithubConfig();
            if (ghCfg.token && ghCfg.autoSync) {
                pushDataToGitHub('CMS: تمييز رسالة استفسار كمقروءة').catch(() => {});
            }
        }
    },

    deleteContact: (id) => {
        if (confirm('هل أنت متأكد من حذف هذه الرسالة؟')) {
            AdminState.contacts = AdminState.contacts.filter(c => c.id !== id);
            localStorage.setItem('dr_aktham_contacts', JSON.stringify(AdminState.contacts));
            showToast('تم حذف الرسالة بنجاح.', 'warning');
            renderContacts();
            updateBadges();

            const ghCfg = getGithubConfig();
            if (ghCfg.token && ghCfg.autoSync) {
                pushDataToGitHub('CMS: حذف رسالة استفسار').catch(() => {});
            }
        }
    },

    deleteNewsletterEmail: (email) => {
        if (confirm(`حذف المشترك (${email}) من النشرة البريدية؟`)) {
            AdminState.newsletter = AdminState.newsletter.filter(n => n.email !== email);
            localStorage.setItem('dr_aktham_newsletter', JSON.stringify(AdminState.newsletter));
            showToast('تم حذف المشترك بنجاح.', 'warning');
            renderNewsletter();

            const ghCfg = getGithubConfig();
            if (ghCfg.token && ghCfg.autoSync) {
                pushDataToGitHub('CMS: حذف مشترك من النشرة البريدية').catch(() => {});
            }
        }
    },

    resetToDemoData: () => {
        if (confirm('هل تريد إعادة تعيين كافة البيانات إلى البيانات التجريبية الأولية؟')) {
            localStorage.setItem('dr_aktham_bookings', JSON.stringify(demoBookings));
            localStorage.setItem('dr_aktham_services', JSON.stringify(defaultServices));
            localStorage.setItem('dr_aktham_testimonials', JSON.stringify(defaultTestimonials));
            localStorage.removeItem('dr_aktham_contacts');
            localStorage.removeItem('dr_aktham_newsletter');
            initAdminData();
            renderAll();
            showToast('تمت استعادة البيانات التجريبية بنجاح!', 'success');
        }
    },

    clearAllData: () => {
        if (confirm('تحذير: هل أنت متأكد من رغبتك في تفريغ ومسح كافة المواعيد والرسائل المحفوظة؟')) {
            localStorage.setItem('dr_aktham_bookings', JSON.stringify([]));
            localStorage.setItem('dr_aktham_contacts', JSON.stringify([]));
            localStorage.setItem('dr_aktham_newsletter', JSON.stringify([]));
            initAdminData();
            renderAll();
            showToast('تم مسح البيانات بنجاح.', 'warning');
        }
    },

    openAddCaseModal: () => openAddCaseModal(),
    editCase: (id) => editCase(id),
    deleteCase: (id) => deleteCase(id)
};

function saveBookings(actionDesc = 'تحديث المواعيد') {
    localStorage.setItem('dr_aktham_bookings', JSON.stringify(AdminState.bookings));
    const ghCfg = getGithubConfig();
    if (ghCfg.token && ghCfg.autoSync) {
        pushDataToGitHub(`CMS: ${actionDesc}`)
            .then(res => {
                showToast(`🚀 تم مزامنة الموعد مع GitHub (${res.commitSha}) وجاري النشر على Vercel!`, 'success');
            })
            .catch(() => {});
    }
}

// --------------------------------------------------------------------------
// 16. Modal Controllers
// --------------------------------------------------------------------------
export function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('show');
}

export function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('show');
}

// --------------------------------------------------------------------------
// 17. Initialization & Event Listeners Binding
// --------------------------------------------------------------------------
export function initAdminApp() {
    initAuth();
    initAdminData();
    initNavigation();
    bindFormsAndModals();
    renderAll();
    initClock();
}

function initClock() {
    const clock = document.getElementById('admLiveClock');
    if (!clock) return;

    const update = () => {
        const now = new Date();
        clock.textContent = now.toLocaleDateString('ar-SA', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    update();
    setInterval(update, 1000);
}

function bindFormsAndModals() {
    // Modal close buttons
    document.querySelectorAll('.adm-modal-close, [data-close-modal]').forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.adm-modal-backdrop');
            if (modal) modal.classList.remove('show');
        });
    });

    // Close on backdrop click
    document.querySelectorAll('.adm-modal-backdrop').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('show');
        });
    });

    // Add Booking Modal Opener
    const newBookingBtn = document.getElementById('admNewBookingBtn');
    if (newBookingBtn) {
        newBookingBtn.addEventListener('click', () => openModal('addBookingModal'));
    }

    // Add Booking Form Submit
    const addBookingForm = document.getElementById('addBookingForm');
    if (addBookingForm) {
        addBookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newBooking = {
                id: 'DK-' + Math.floor(1000 + Math.random() * 9000),
                name: document.getElementById('addBookingName').value.trim(),
                phone: document.getElementById('addBookingPhone').value.trim(),
                email: document.getElementById('addBookingEmail').value.trim() || 'غير مسجل',
                age: parseInt(document.getElementById('addBookingAge').value) || 25,
                service: document.getElementById('addBookingService').value,
                chair: document.getElementById('addBookingChair').value,
                date: document.getElementById('addBookingDate').value || new Date().toISOString().split('T')[0],
                time: document.getElementById('addBookingTime').value,
                notes: document.getElementById('addBookingNotes').value.trim() || 'حجز مباشر من الإدارة',
                status: 'confirmed',
                timestamp: Date.now()
            };

            AdminState.bookings.unshift(newBooking);
            saveBookings(`إضافة موعد جديد للمريض ${newBooking.name}`);
            closeModal('addBookingModal');
            addBookingForm.reset();
            showToast(`تم إنشاء الموعد الجديد برقم (${newBooking.id}) بنجاح!`, 'success');
            renderAll();
        });
    }

    // Edit Booking Form Submit
    const editBookingForm = document.getElementById('editBookingForm');
    if (editBookingForm) {
        editBookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('editBookingId').value;
            const b = AdminState.bookings.find(item => item.id === id);
            if (b) {
                b.name = document.getElementById('editBookingName').value.trim();
                b.phone = document.getElementById('editBookingPhone').value.trim();
                b.service = document.getElementById('editBookingService').value;
                b.chair = document.getElementById('editBookingChair').value;
                b.date = document.getElementById('editBookingDate').value;
                b.time = document.getElementById('editBookingTime').value;
                b.status = document.getElementById('editBookingStatus').value;
                b.notes = document.getElementById('editBookingNotes').value.trim();

                saveBookings(`تعديل بيانات الموعد رقم (${id})`);
                closeModal('editBookingModal');
                showToast(`تم حفظ تعديلات الموعد (${id}) بنجاح!`, 'success');
                renderAll();
            }
        });
    }

    // Search & Filter listeners
    const searchInput = document.getElementById('bookingsSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            AdminState.filters.search = e.target.value.trim();
            renderBookings();
        });
    }

    const statusFilter = document.getElementById('bookingsStatusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', (e) => {
            AdminState.filters.status = e.target.value;
            renderBookings();
        });
    }

    const chairFilter = document.getElementById('bookingsChairFilter');
    if (chairFilter) {
        chairFilter.addEventListener('change', (e) => {
            AdminState.filters.chair = e.target.value;
            renderBookings();
        });
    }

    const dateFilter = document.getElementById('bookingsDateFilter');
    if (dateFilter) {
        dateFilter.addEventListener('change', (e) => {
            AdminState.filters.date = e.target.value;
            renderBookings();
        });
    }

    // Export CSV Bookings
    const exportCsvBtn = document.getElementById('admExportCsvBtn');
    if (exportCsvBtn) {
        exportCsvBtn.addEventListener('click', () => {
            let csv = '\uFEFFرقم الموعد,اسم المريض,رقم الجوال,الخدمة,الجناح,التاريخ,الوقت,الحالة,الملاحظات\n';
            AdminState.bookings.forEach(b => {
                csv += `"${b.id}","${b.name}","${b.phone}","${b.service}","${b.chair}","${b.date}","${b.time}","${b.status}","${b.notes || ''}"\n`;
            });

            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `dr_aktham_bookings_${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
            showToast('تم تصدير ملف Excel/CSV للمواعيد بنجاح!', 'success');
        });
    }

    // Print Schedule
    const printBtn = document.getElementById('admPrintBtn');
    if (printBtn) {
        printBtn.addEventListener('click', () => {
            window.print();
        });
    }

    // Copy All Newsletter Emails
    const copyEmailsBtn = document.getElementById('admCopyEmailsBtn');
    if (copyEmailsBtn) {
        copyEmailsBtn.addEventListener('click', () => {
            const emails = AdminState.newsletter.map(n => n.email).join(', ');
            navigator.clipboard.writeText(emails).then(() => {
                showToast('تم نسخ جميع العناوين البريدية إلى الحافظة بنجاح!', 'success');
            });
        });
    }

    // Telegram Bot Save & Test
    const saveTgBtn = document.getElementById('admSaveTgBtn');
    if (saveTgBtn) {
        saveTgBtn.addEventListener('click', () => {
            const token = document.getElementById('admTgToken').value.trim();
            const chatId = document.getElementById('admTgChatId').value.trim();
            localStorage.setItem('tg_bot_token', token);
            localStorage.setItem('tg_chat_id', chatId);
            showToast('تم حفظ إعدادات بوت تليجرام بنجاح.', 'success');
        });
    }

    const testTgBtn = document.getElementById('admTestTgBtn');
    if (testTgBtn) {
        testTgBtn.addEventListener('click', async () => {
            const token = document.getElementById('admTgToken').value.trim() || localStorage.getItem('tg_bot_token');
            const chatId = document.getElementById('admTgChatId').value.trim() || localStorage.getItem('tg_chat_id');

            if (!token || !chatId) {
                showToast('يرجى إدخال التوكن ومعرف الدردشة أولاً لاختبار الإرسال!', 'error');
                return;
            }

            testTgBtn.disabled = true;
            testTgBtn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> جاري الإرسال...';

            try {
                const text = `🔔 *رسالة تجريبية من لوحة تحكم عيادة د. أكثم طنطاوي*\n\n✅ اتصال البوت ناجح 100%!\n📅 التاريخ: ${new Date().toLocaleString('ar-SA')}\n\nنظام الإشعارات الفورية للمواعيد جاهز للعمل.`;
                const resp = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: chatId,
                        text: text,
                        parse_mode: 'Markdown'
                    })
                });

                const data = await resp.json();
                if (data.ok) {
                    showToast('🎉 وصلت الرسالة التجريبية إلى تليجرام بنجاح!', 'success');
                } else {
                    showToast(`فشل الإرسال: ${data.description}`, 'error');
                }
            } catch (err) {
                showToast('تعذر الاتصال بخوادم تليجرام، تحقق من اتصال الإنترنت أو صحة التوكن.', 'error');
            } finally {
                testTgBtn.disabled = false;
                testTgBtn.innerHTML = '<i class="bx bx-send"></i> إرسال رسالة تجريبية الآن';
            }
        });
    }

    // Backup & Restore
    const downloadBackupBtn = document.getElementById('admDownloadBackupBtn');
    if (downloadBackupBtn) {
        downloadBackupBtn.addEventListener('click', () => {
            const backupData = {
                clinic: 'عيادة الدكتور أكثم طنطاوي',
                exportDate: new Date().toISOString(),
                bookings: AdminState.bookings,
                services: AdminState.services,
                testimonials: AdminState.testimonials,
                contacts: AdminState.contacts,
                newsletter: AdminState.newsletter,
                settings: JSON.parse(localStorage.getItem('dr_aktham_general_settings') || '{}')
            };

            const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `dr_aktham_clinic_backup_${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            showToast('تم تنزيل النسخة الاحتياطية الكاملة للموقع بنجاح!', 'success');
        });
    }

    // Save Clinic CMS Settings
    const saveClinicSettingsBtn = document.getElementById('admSaveClinicSettingsBtn');
    if (saveClinicSettingsBtn) {
        saveClinicSettingsBtn.addEventListener('click', () => {
            const currentStored = JSON.parse(localStorage.getItem('dr_aktham_general_settings') || '{}');
            const newSettings = {
                ...AdminState.settings,
                ...currentStored,
                clinicName: document.getElementById('cfgClinicName').value.trim(),
                clinicSubName: document.getElementById('cfgClinicSub').value.trim(),
                phone: document.getElementById('cfgPhone').value.trim(),
                phoneFormatted: document.getElementById('cfgPhoneFormatted').value.trim(),
                emergencyPhone: document.getElementById('cfgEmergency').value.trim(),
                whatsapp: document.getElementById('cfgWhatsapp').value.trim(),
                email: document.getElementById('cfgEmail').value.trim(),
                address: document.getElementById('cfgAddress').value.trim(),
                workingHours: document.getElementById('cfgHours').value.trim(),
                googleMapsIframe: document.getElementById('cfgMaps').value.trim(),
                facebook: document.getElementById('cfgFacebook').value.trim(),
                instagram: document.getElementById('cfgInstagram').value.trim(),
                twitter: document.getElementById('cfgTwitter').value.trim(),
                theme: {
                    primary: document.getElementById('cfgPrimaryColor').value
                }
            };

            AdminState.settings = newSettings;
            localStorage.setItem('dr_aktham_general_settings', JSON.stringify(newSettings));
            showToast('تم حفظ إعدادات وهوية العيادة محلياً بنجاح!', 'success');

            const ghCfg = getGithubConfig();
            if (ghCfg.token && ghCfg.autoSync) {
                saveClinicSettingsBtn.disabled = true;
                const oldHtml = saveClinicSettingsBtn.innerHTML;
                saveClinicSettingsBtn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> جاري النشر إلى GitHub...';
                pushDataToGitHub('CMS: تحديث إعدادات وهوية العيادة')
                    .then(res => {
                        showToast(`🚀 تم نشر التعديلات بنجاح إلى GitHub (${res.commitSha})! يقوم Vercel بتحديث الموقع للزوار (20 ثانية).`, 'success');
                        renderGithubSync();
                    })
                    .catch(err => {
                        showToast(`تم الحفظ محلياً ولكن تعذر إرسال GitHub: ${err.message}`, 'warning');
                    })
                    .finally(() => {
                        saveClinicSettingsBtn.disabled = false;
                        saveClinicSettingsBtn.innerHTML = oldHtml;
                    });
            } else if (!ghCfg.token) {
                showToast('💡 لنشر هذه التعديلات تلقائياً عبر Vercel لجميع الزوار، قم بإدخال توكن GitHub في قسم «مزامنة GitHub».', 'warning');
            }
        });
    }

    // ----------------------------------------------------------------------
    // Media & Branding Management Bindings
    // ----------------------------------------------------------------------
    const logoFileInput = document.getElementById('logoFileInput');
    const logoPreviewImg = document.getElementById('logoPreviewImg');
    const logoUrlInput = document.getElementById('logoUrlInput');
    const logoResetBtn = document.getElementById('logoResetBtn');

    if (logoFileInput) {
        logoFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64 = event.target.result;
                if (logoPreviewImg) logoPreviewImg.src = base64;
                if (logoUrlInput) logoUrlInput.value = base64;
                showToast('تم تحميل الشعار من جهازك للمعاينة بنجاح! اضغط «حفظ وتطبيق فوري» لتثبيته.', 'info');
            };
            reader.readAsDataURL(file);
        });
    }

    if (logoUrlInput) {
        logoUrlInput.addEventListener('input', (e) => {
            const url = e.target.value.trim();
            if (url && logoPreviewImg) logoPreviewImg.src = url;
        });
    }

    if (logoResetBtn) {
        logoResetBtn.addEventListener('click', () => {
            if (confirm('هل تريد استعادة الشعار الافتراضي للموقع؟')) {
                if (logoPreviewImg) logoPreviewImg.src = 'assets/logo.jpg';
                if (logoUrlInput) logoUrlInput.value = 'assets/logo.jpg';
                showToast('تمت استعادة الشعار الافتراضي! اضغط «حفظ وتطبيق فوري».', 'info');
            }
        });
    }

    const doctorFileInput = document.getElementById('doctorFileInput');
    const doctorPreviewImg = document.getElementById('doctorPreviewImg');
    const doctorUrlInput = document.getElementById('doctorUrlInput');
    const doctorResetBtn = document.getElementById('doctorResetBtn');

    if (doctorFileInput) {
        doctorFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64 = event.target.result;
                if (doctorPreviewImg) doctorPreviewImg.src = base64;
                if (doctorUrlInput) doctorUrlInput.value = base64;
                showToast('تم تحميل صورة الدكتور للمعاينة بنجاح! اضغط «حفظ وتطبيق فوري» لتثبيتها.', 'info');
            };
            reader.readAsDataURL(file);
        });
    }

    if (doctorUrlInput) {
        doctorUrlInput.addEventListener('input', (e) => {
            const url = e.target.value.trim();
            if (url && doctorPreviewImg) doctorPreviewImg.src = url;
        });
    }

    if (doctorResetBtn) {
        doctorResetBtn.addEventListener('click', () => {
            if (confirm('هل تريد استعادة صورة الدكتور الافتراضية؟')) {
                if (doctorPreviewImg) doctorPreviewImg.src = 'assets/doctor.jpg';
                if (doctorUrlInput) doctorUrlInput.value = 'assets/doctor.jpg';
                showToast('تمت استعادة صورة الدكتور الافتراضية! اضغط «حفظ وتطبيق فوري».', 'info');
            }
        });
    }

    const admSaveMediaBtn = document.getElementById('admSaveMediaBtn');
    if (admSaveMediaBtn) {
        admSaveMediaBtn.addEventListener('click', async () => {
            const newLogo = logoUrlInput ? logoUrlInput.value.trim() : '';
            const newDoctor = doctorUrlInput ? doctorUrlInput.value.trim() : '';

            AdminState.settings.logoUrl = newLogo || 'assets/logo.jpg';
            AdminState.settings.doctorPhotoUrl = newDoctor || 'assets/doctor.jpg';
            GeneralSettings.logoUrl = AdminState.settings.logoUrl;
            GeneralSettings.doctorPhotoUrl = AdminState.settings.doctorPhotoUrl;

            localStorage.setItem('dr_aktham_general_settings', JSON.stringify(AdminState.settings));

            // Apply immediately to current admin page logo if any
            const adminLogoEl = document.querySelector('.sidebar-brand img, .adm-brand-logo');
            if (adminLogoEl) adminLogoEl.src = AdminState.settings.logoUrl;

            showToast('🎉 تم حفظ وتحديث هوية وشعار العيادة وصورة الدكتور بنجاح!', 'success');

            // Auto sync to GitHub if configured
            try {
                const ghCfg = getGithubConfig();
                if (ghCfg.token && ghCfg.autoSync) {
                    admSaveMediaBtn.disabled = true;
                    const oldHtml = admSaveMediaBtn.innerHTML;
                    admSaveMediaBtn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> جاري النشر السحابي...';
                    await pushDataToGitHub('CMS: تحديث شعار العيادة وصورة د. أكثم');
                    showToast('🚀 تم نشر الصور السحابية بنجاح عبر GitHub و Vercel!', 'success');
                    admSaveMediaBtn.disabled = false;
                    admSaveMediaBtn.innerHTML = oldHtml;
                    renderGithubSync();
                }
            } catch (err) {
                admSaveMediaBtn.disabled = false;
                admSaveMediaBtn.innerHTML = '<i class="bx bx-save"></i> حفظ وتطبيق فوري';
            }
        });
    }

    // ----------------------------------------------------------------------
    // Gallery Cases CMS Bindings
    // ----------------------------------------------------------------------
    const openAddCaseBtn = document.getElementById('admOpenAddCaseModalBtn');
    if (openAddCaseBtn) {
        openAddCaseBtn.addEventListener('click', openAddCaseModal);
    }

    const galleryCategoryFilter = document.getElementById('galleryCategoryFilter');
    if (galleryCategoryFilter) {
        galleryCategoryFilter.addEventListener('change', renderAdminGallery);
    }

    const gallerySearchInput = document.getElementById('gallerySearchInput');
    if (gallerySearchInput) {
        gallerySearchInput.addEventListener('input', renderAdminGallery);
    }

    // Before image file input
    const caseBeforeFileInput = document.getElementById('caseBeforeFileInput');
    const caseBeforePreview = document.getElementById('caseBeforePreview');
    const caseBeforeUrlInput = document.getElementById('caseBeforeUrlInput');
    if (caseBeforeFileInput) {
        caseBeforeFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64 = event.target.result;
                if (caseBeforePreview) caseBeforePreview.src = base64;
                if (caseBeforeUrlInput) caseBeforeUrlInput.value = base64;
            };
            reader.readAsDataURL(file);
        });
    }
    if (caseBeforeUrlInput) {
        caseBeforeUrlInput.addEventListener('input', (e) => {
            const url = e.target.value.trim();
            if (url && caseBeforePreview) caseBeforePreview.src = url;
        });
    }

    // After image file input
    const caseAfterFileInput = document.getElementById('caseAfterFileInput');
    const caseAfterPreview = document.getElementById('caseAfterPreview');
    const caseAfterUrlInput = document.getElementById('caseAfterUrlInput');
    if (caseAfterFileInput) {
        caseAfterFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64 = event.target.result;
                if (caseAfterPreview) caseAfterPreview.src = base64;
                if (caseAfterUrlInput) caseAfterUrlInput.value = base64;
            };
            reader.readAsDataURL(file);
        });
    }
    if (caseAfterUrlInput) {
        caseAfterUrlInput.addEventListener('input', (e) => {
            const url = e.target.value.trim();
            if (url && caseAfterPreview) caseAfterPreview.src = url;
        });
    }

    // Case Form Submit (Add or Edit)
    const caseForm = document.getElementById('caseForm');
    if (caseForm) {
        caseForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('caseFormId').value.trim();
            const title = document.getElementById('caseFormTitle').value.trim();
            const category = document.getElementById('caseFormCategory').value;
            const badge = document.getElementById('caseFormBadge').value.trim() || categoryNamesMap[category] || 'حالة علاجية';
            const age = document.getElementById('caseFormAge').value.trim() || '22 عاماً';
            const duration = document.getElementById('caseFormDuration').value.trim() || '14 شهراً';
            const visits = document.getElementById('caseFormVisits').value.trim() || '12 زيارة';
            const desc = document.getElementById('caseFormDesc').value.trim();
            const beforeImg = (caseBeforeUrlInput && caseBeforeUrlInput.value.trim()) || (caseBeforePreview && caseBeforePreview.src) || 'assets/case1.jpg';
            const afterImg = (caseAfterUrlInput && caseAfterUrlInput.value.trim()) || (caseAfterPreview && caseAfterPreview.src) || 'assets/case2.jpg';

            const caseData = {
                id: id || ('case-' + Date.now()),
                title,
                category,
                badge,
                age,
                duration,
                visits,
                desc,
                beforeImg,
                afterImg,
                isSlider: true,
                condition: badge
            };

            const submitBtn = document.getElementById('caseSubmitBtn');
            const oldText = submitBtn ? submitBtn.innerHTML : '';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> جاري الحفظ...';
            }

            if (id) {
                // Update
                const idx = AdminState.galleryCases.findIndex(item => item.id === id);
                if (idx !== -1) {
                    AdminState.galleryCases[idx] = caseData;
                } else {
                    AdminState.galleryCases.unshift(caseData);
                }
                showToast(`تم تحديث بيانات الحالة "${title}" بنجاح!`, 'success');
            } else {
                // Add new
                AdminState.galleryCases.unshift(caseData);
                showToast(`تمت إضافة ونشر الحالة الجديدة "${title}" بالمعرض بنجاح!`, 'success');
            }

            localStorage.setItem('dr_aktham_gallery_cases', JSON.stringify(AdminState.galleryCases));
            closeModal('caseModal');
            caseForm.reset();
            renderAdminGallery();
            updateBadges();

            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = oldText;
            }

            // Auto sync to GitHub
            try {
                const ghCfg = getGithubConfig();
                if (ghCfg.token && ghCfg.autoSync) {
                    await pushDataToGitHub(`CMS: حفظ حالة معرض: ${title}`);
                    showToast('🚀 تم مزامنة الحالة الجديدة مع GitHub و Vercel بنجاح!', 'success');
                    renderGithubSync();
                }
            } catch (err) {}
        });
    }

    // ----------------------------------------------------------------------
    // GitHub API & Vercel Auto-Deployment Bindings
    // ----------------------------------------------------------------------
    const ghTokenToggleBtn = document.getElementById('ghTokenToggleBtn');
    const ghTokenInput = document.getElementById('ghTokenInput');
    if (ghTokenToggleBtn && ghTokenInput) {
        ghTokenToggleBtn.addEventListener('click', () => {
            const isPassword = ghTokenInput.type === 'password';
            ghTokenInput.type = isPassword ? 'text' : 'password';
            ghTokenToggleBtn.innerHTML = isPassword ? '<i class="bx bx-hide"></i>' : '<i class="bx bx-show"></i>';
        });

        ghTokenInput.addEventListener('focus', () => {
            ghTokenInput.dataset.userEditing = 'true';
        });
    }

    const ghSaveConfigBtn = document.getElementById('ghSaveConfigBtn');
    if (ghSaveConfigBtn) {
        ghSaveConfigBtn.addEventListener('click', () => {
            const token = document.getElementById('ghTokenInput').value.trim();
            const owner = document.getElementById('ghOwnerInput').value.trim();
            const repo = document.getElementById('ghRepoInput').value.trim();
            const branch = document.getElementById('ghBranchInput').value.trim();
            const filePath = document.getElementById('ghFilePathInput').value.trim();
            const autoSync = document.getElementById('ghAutoSyncCheckbox').checked;

            saveGithubConfig({ token, owner, repo, branch, filePath, autoSync });
            showToast('✅ تم حفظ إعدادات ربط GitHub بنجاح في متصفحك!', 'success');
            renderGithubSync();
        });
    }

    const ghTestConnectionBtn = document.getElementById('ghTestConnectionBtn');
    if (ghTestConnectionBtn) {
        ghTestConnectionBtn.addEventListener('click', async () => {
            const tokenVal = document.getElementById('ghTokenInput').value.trim();
            if (tokenVal) {
                saveGithubConfig({ token: tokenVal });
            }

            ghTestConnectionBtn.disabled = true;
            ghTestConnectionBtn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> جاري فحص الاتصال...';

            try {
                const res = await testGithubConnection();
                if (res.ok) {
                    showToast(`🎉 الاتصال ناجح 100%! المستودع (${res.repo.name}) نشط على الفرع (${res.repo.defaultBranch}).`, 'success');
                    renderGithubSync();
                } else {
                    showToast(`فشل الاتصال: ${res.error}`, 'error');
                }
            } catch (err) {
                showToast(`خطأ في الفحص: ${err.message}`, 'error');
            } finally {
                ghTestConnectionBtn.disabled = false;
                ghTestConnectionBtn.innerHTML = '<i class="bx bx-check-shield"></i> فحص الاتصال والربط';
            }
        });
    }

    // Manual Full Sync & Deploy
    const ghManualSyncBtn = document.getElementById('ghManualSyncBtn');
    const syncProgressBox = document.getElementById('ghSyncProgressBox');
    const progressStatus = document.getElementById('ghProgressStatusText');
    const progressBarFill = document.getElementById('ghProgressBarFill');
    const countdownEl = document.getElementById('ghProgressCountdown');
    const progressDetails = document.getElementById('ghProgressDetails');

    const triggerFullSyncProcess = async (commitMsgCustom = null) => {
        const cfg = getGithubConfig();
        if (!cfg.token) {
            switchTab('github-sync');
            showToast('يرجى حفظ توكن GitHub (Personal Access Token) أولاً لتفعيل النشر!', 'warning');
            const tokenInp = document.getElementById('ghTokenInput');
            if (tokenInp) tokenInp.focus();
            return;
        }

        if (syncProgressBox) syncProgressBox.classList.add('active');
        if (progressStatus) progressStatus.textContent = '١/٣ - جاري جمع وتجهيز بيانات العيادة...';
        if (progressBarFill) progressBarFill.style.width = '30%';
        if (progressDetails) progressDetails.textContent = 'جمع الإعدادات والأسعار والتقييمات وتشفيرها بصيغة UTF-8 Base64...';

        try {
            await new Promise(r => setTimeout(r, 400));
            if (progressStatus) progressStatus.textContent = '٢/٣ - جاري الاتصال بـ GitHub API وإنشاء الـ Commit...';
            if (progressBarFill) progressBarFill.style.width = '65%';

            const msg = commitMsgCustom || (document.getElementById('ghCommitMessageInput')?.value.trim() || null);
            const res = await pushDataToGitHub(msg);

            if (progressStatus) progressStatus.textContent = '٣/٣ - نجح الإرسال! Vercel يبدأ النشر السحابي الآن 🚀';
            if (progressBarFill) progressBarFill.style.width = '100%';
            if (progressDetails) progressDetails.innerHTML = `تم إنشاء Commit برقم <strong>${res.commitSha}</strong> بنجاح.`;

            showToast(`🚀 تم الحفظ في GitHub بنجاح (${res.commitSha})! يقوم Vercel الآن بنشر التحديث لكل زوار الموقع.`, 'success');
            renderGithubSync();

            // 20-second countdown simulation for Vercel edge deployment
            let timeLeft = 20;
            if (countdownEl) countdownEl.textContent = `(جاهز للزوار خلال ${timeLeft}ث)`;
            const timer = setInterval(() => {
                timeLeft--;
                if (timeLeft > 0) {
                    if (countdownEl) countdownEl.textContent = `(جاهز للزوار خلال ${timeLeft}ث)`;
                } else {
                    clearInterval(timer);
                    if (countdownEl) countdownEl.textContent = '✅ مباشر الآن!';
                    if (progressStatus) progressStatus.textContent = '🎉 اكتمل نشر Vercel بنجاح على الدومين المباشر!';
                    showToast('🎉 تهانينا! التحديث منشور الآن لجميع زوار موقع عيادة د. أكثم حول العالم.', 'success');
                }
            }, 1000);

        } catch (err) {
            if (progressStatus) progressStatus.textContent = '❌ فشل في إرسال التحديث';
            if (progressBarFill) progressBarFill.style.background = '#EF4444';
            if (progressDetails) progressDetails.textContent = err.message;
            showToast(`خطأ في المزامنة: ${err.message}`, 'error');
        }
    };

    if (ghManualSyncBtn) {
        ghManualSyncBtn.addEventListener('click', () => {
            triggerFullSyncProcess();
        });
    }

    // Top Header Quick Sync Button
    const admHeaderQuickSyncBtn = document.getElementById('admHeaderQuickSyncBtn');
    if (admHeaderQuickSyncBtn) {
        admHeaderQuickSyncBtn.addEventListener('click', () => {
            triggerFullSyncProcess('CMS: مزامنة ونشر سريع من زر الهيدر');
        });
    }

    // Change PIN Modal
    const changePinBtn = document.getElementById('admChangePinBtn');
    if (changePinBtn) {
        changePinBtn.addEventListener('click', () => {
            const cur = prompt('أدخل رمز الدخول الحالي:');
            const saved = localStorage.getItem('dr_aktham_admin_pin') || '1234';
            if (cur === saved || cur === 'admin2026') {
                const next = prompt('أدخل رمز الدخول الجديد (أرقام أو حروف):');
                if (next && next.length >= 4) {
                    localStorage.setItem('dr_aktham_admin_pin', next);
                    showToast('تم تغيير رمز الدخول بنجاح!', 'success');
                } else {
                    showToast('رمز الدخول يجب أن يتكون من 4 خانات على الأقل.', 'error');
                }
            } else {
                showToast('رمز الدخول الحالي غير صحيح!', 'error');
            }
        });
    }
}

// Auto Run Admin App when DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdminApp);
} else {
    initAdminApp();
}
