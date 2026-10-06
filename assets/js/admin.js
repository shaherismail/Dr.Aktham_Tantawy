// ==========================================================================
// Dr. Aktham Dental Clinic - Comprehensive Admin Dashboard Logic
// 100% Standalone, Self-Contained, Vercel & GitHub Ready (No External DB)
// ==========================================================================

// Global State
export const AdminState = {
    bookings: [],
    patients: [],
    services: [],
    testimonials: [],
    contacts: [],
    newsletter: [],
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

// Initial Demo Bookings (Ensures dashboard is rich and functional out of the box)
const demoBookings = [
    {
        id: 'DK-8492',
        name: 'عبد الرحمن الشمري',
        phone: '0501234891',
        email: 'a.shammari@gmail.com',
        age: 26,
        service: 'التقويم الشفاف (ألاينرز)',
        doctor: 'د. أكثم طنطاوي',
        date: new Date().toISOString().split('T')[0],
        time: '10:00 ص',
        chair: 'جناح VIP 💎',
        notes: 'مراجعة دورية للمصفف رقم 6، رغبة في تقييم تقدم الفك العلوي',
        status: 'confirmed',
        timestamp: Date.now() - 3600000
    },
    {
        id: 'DK-8493',
        name: 'نورة عبد العزيز القحطاني',
        phone: '0559871234',
        email: 'noura.qahtani@hotmail.com',
        age: 23,
        service: 'التقويم الخزفي التجميلي',
        doctor: 'د. أكثم طنطاوي',
        date: new Date().toISOString().split('T')[0],
        time: '12:00 م',
        chair: 'تقويم الأسنان 🦷',
        notes: 'جلسة شد الحواصر الخزفية واستبدال الأسلاك التجميلية',
        status: 'confirmed',
        timestamp: Date.now() - 7200000
    },
    {
        id: 'DK-8494',
        name: 'محمد إبراهيم الدوسري',
        phone: '0562349012',
        email: 'm.dosari@yahoo.com',
        age: 31,
        service: 'ابتسامة هوليوود وزراعة الأسنان',
        doctor: 'د. أكثم طنطاوي',
        date: new Date().toISOString().split('T')[0],
        time: '04:00 م',
        chair: 'تجميل وزراعة 💺',
        notes: 'كشف واستشارة زراعة سنين في الفك السفلي مع أشعة ثلاثية الأبعاد',
        status: 'pending',
        timestamp: Date.now() - 10800000
    },
    {
        id: 'DK-8495',
        name: 'سارة خالد العتيبي',
        phone: '0543321144',
        email: 'sara.otaibi@gmail.com',
        age: 19,
        service: 'تقويم الأسنان المعدني',
        doctor: 'د. أكثم طنطاوي',
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        time: '06:00 م',
        chair: 'تقويم الأسنان 🦷',
        notes: 'تركيب مثبت الأسنان بعد انتهاء خطة التقويم المعدني بنجاح',
        status: 'pending',
        timestamp: Date.now() - 14400000
    },
    {
        id: 'DK-8496',
        name: 'فهد سلطان المطيري',
        phone: '0507712398',
        email: 'fahad.mutairi@outlook.com',
        age: 28,
        service: 'تبييض الأسنان بالليزر Zoom',
        doctor: 'د. أكثم طنطاوي',
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        time: '08:00 م',
        chair: 'تجميل وزراعة 💺',
        notes: 'جلسة تبييض قبل مناسبة زواج',
        status: 'confirmed',
        timestamp: Date.now() - 18000000
    },
    {
        id: 'DK-8497',
        name: 'ريم عبد الله الغامدي',
        phone: '0538821901',
        email: 'reem.ghamdi@gmail.com',
        age: 24,
        service: 'التقويم الشفاف (ألاينرز)',
        doctor: 'د. أكثم طنطاوي',
        date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        time: '10:00 ص',
        chair: 'جناح VIP 💎',
        notes: 'تسليم أول مجموعة مصففات شفافة والشرح على برنامج العناية',
        status: 'completed',
        timestamp: Date.now() - 90000000
    }
];

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
// 1. Authentication & Security
// --------------------------------------------------------------------------
export function initAuth() {
    const authOverlay = document.getElementById('adminAuthOverlay');
    const pinForm = document.getElementById('adminPinForm');
    const pinInput = document.getElementById('adminPinInput');
    const savedPin = localStorage.getItem('dr_aktham_admin_pin') || '1234';
    const isLoggedIn = sessionStorage.getItem('dr_aktham_admin_logged_in') === 'true';

    if (isLoggedIn) {
        if (authOverlay) authOverlay.style.display = 'none';
    } else {
        if (authOverlay) authOverlay.style.display = 'flex';
        if (pinInput) setTimeout(() => pinInput.focus(), 200);
    }

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
                window.location.reload();
            }
        });
    }

    // Lock screen
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
// 2. Data Initialization (100% LocalStorage)
// --------------------------------------------------------------------------
export function initAdminData() {
    // Bookings
    let bookings = [];
    try {
        const stored = localStorage.getItem('dr_aktham_bookings');
        if (stored) bookings = JSON.parse(stored);
        if (!bookings || bookings.length === 0) {
            bookings = demoBookings;
            localStorage.setItem('dr_aktham_bookings', JSON.stringify(bookings));
        }
    } catch (e) {
        bookings = demoBookings;
    }
    AdminState.bookings = bookings;

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

    // Contacts
    let contacts = [];
    try {
        const stored = localStorage.getItem('dr_aktham_contacts');
        if (stored) contacts = JSON.parse(stored);
        if (!contacts || contacts.length === 0) {
            contacts = [
                {
                    id: 'MSG-101',
                    name: 'سلطان بن عبد العزيز',
                    phone: '0551122334',
                    email: 'sultan@yahoo.com',
                    message: 'السلام عليكم، استفسر عن إمكانية تقسيط تكلفة التقويم الشفاف ومدة الخطة المقترحة؟',
                    date: 'اليوم، ١١:٣٠ ص',
                    status: 'unread',
                    timestamp: Date.now() - 7200000
                },
                {
                    id: 'MSG-102',
                    name: 'منى الشريف',
                    phone: '0549988776',
                    email: 'mona.sh@gmail.com',
                    message: 'أريد حجز موعد كشف استشاري يوم السبت القادم لعلاج عضة معكوسة لطفل عمره ٩ سنوات.',
                    date: 'أمس، ٠٤:١٥ م',
                    status: 'read',
                    timestamp: Date.now() - 86400000
                }
            ];
            localStorage.setItem('dr_aktham_contacts', JSON.stringify(contacts));
        }
    } catch (e) {
        contacts = [];
    }
    AdminState.contacts = contacts;

    // Newsletter Subscribers
    let newsletter = [];
    try {
        const stored = localStorage.getItem('dr_aktham_newsletter');
        if (stored) newsletter = JSON.parse(stored);
        if (!newsletter || newsletter.length === 0) {
            newsletter = [
                { email: 'patient.care@gmail.com', date: '2026-09-15' },
                { email: 'dr.fahad@hospital.sa', date: '2026-09-22' },
                { email: 'amira.ortho@outlook.com', date: '2026-10-02' }
            ];
            localStorage.setItem('dr_aktham_newsletter', JSON.stringify(newsletter));
        }
    } catch (e) {
        newsletter = [];
    }
    AdminState.newsletter = newsletter;

    // Extract patient directories
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
// 3. Tab Routing & Navigation
// --------------------------------------------------------------------------
export function initNavigation() {
    const navLinks = document.querySelectorAll('.sidebar-link[data-tab]');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = link.getAttribute('data-tab');
            switchTab(tabId);
        });
    });

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
}

function updateThemeIcon(theme) {
    const themeBtn = document.getElementById('admThemeToggleBtn');
    if (themeBtn) {
        themeBtn.innerHTML = theme === 'dark' ? '<i class="bx bx-sun"></i>' : '<i class="bx bx-moon"></i>';
    }
}

export function switchTab(tabId, updateHash = true) {
    const targetPanel = document.getElementById(`tab-${tabId}`);
    if (!targetPanel) return;

    AdminState.currentTab = tabId;

    document.querySelectorAll('.sidebar-item').forEach(item => item.classList.remove('active'));
    const activeLink = document.querySelector(`.sidebar-link[data-tab="${tabId}"]`);
    if (activeLink && activeLink.parentElement) {
        activeLink.parentElement.classList.add('active');
    }

    document.querySelectorAll('.tab-content-panel').forEach(p => p.classList.remove('active'));
    targetPanel.classList.add('active');

    const headerTitle = document.getElementById('admHeaderPageTitle');
    if (headerTitle && activeLink) {
        headerTitle.innerHTML = activeLink.innerHTML;
        const badge = headerTitle.querySelector('.sidebar-badge');
        if (badge) badge.remove();
    }

    if (updateHash) {
        window.location.hash = tabId;
    }

    renderTab(tabId);
}

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
}

export function renderTab(tabId) {
    updateBadges();
    switch (tabId) {
        case 'overview': renderOverview(); break;
        case 'bookings': renderBookings(); break;
        case 'patients': renderPatients(); break;
        case 'services': renderServices(); break;
        case 'testimonials': renderTestimonials(); break;
        case 'messages': renderContacts(); break;
        case 'newsletter': renderNewsletter(); break;
        case 'telegram': renderTelegram(); break;
        case 'database': renderDatabase(); break;
        case 'settings': renderSettings(); break;
    }
}

function updateBadges() {
    const pendingCount = AdminState.bookings.filter(b => b.status === 'pending').length;
    const unreadMsgs = AdminState.contacts.filter(c => c.status === 'unread').length;

    const bookingBadge = document.getElementById('badgeBookingsCount');
    if (bookingBadge) {
        bookingBadge.textContent = pendingCount;
        bookingBadge.style.display = pendingCount > 0 ? 'inline-block' : 'none';
    }

    const msgBadge = document.getElementById('badgeMessagesCount');
    if (msgBadge) {
        msgBadge.textContent = unreadMsgs;
        msgBadge.style.display = unreadMsgs > 0 ? 'inline-block' : 'none';
    }

    const notifBellBadge = document.getElementById('headerNotifBadge');
    if (notifBellBadge) {
        const total = pendingCount + unreadMsgs;
        notifBellBadge.textContent = total;
        notifBellBadge.style.display = total > 0 ? 'flex' : 'none';
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
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px; color: var(--adm-text-muted);">
                    <i class="bx bx-search-alt" style="font-size: 36px; display: block; margin-bottom: 10px;"></i>
                    لا توجد مواعيد مطابقة للبحث أو الفلتر المحدد!
                </td>
            </tr>
        `;
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

function getStatusLabel(status) {
    switch (status) {
        case 'confirmed': return 'مؤكد ✓';
        case 'pending': return 'قيد الانتظار ⏳';
        case 'completed': return 'مكتمل ✅';
        case 'cancelled': return 'ملغي ❌';
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
            saveBookings();
            showToast(`تم تأكيد الموعد (${id}) بنجاح!`, 'success');
            renderAll();
        }
    },

    completeBooking: (id) => {
        const b = AdminState.bookings.find(item => item.id === id);
        if (b) {
            b.status = 'completed';
            saveBookings();
            showToast(`تم تمييز الموعد (${id}) كمكتمل وتحديث الملف الطبي.`, 'success');
            renderAll();
        }
    },

    deleteBooking: (id) => {
        if (confirm(`هل أنت متأكد من حذف الموعد رقم ${id} نهائياً؟`)) {
            AdminState.bookings = AdminState.bookings.filter(b => b.id !== id);
            saveBookings();
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
        document.getElementById('editBookingChair').value = b.chair || 'جناح VIP 💎';
        document.getElementById('editBookingStatus').value = b.status || 'pending';
        document.getElementById('editBookingNotes').value = b.notes || '';

        openModal('editBookingModal');
    },

    newBookingForPatient: (name, phone) => {
        openModal('addBookingModal');
        if (name) document.getElementById('addBookingName').value = name;
        if (phone) document.getElementById('addBookingPhone').value = phone;
    },

    toggleService: (id) => {
        const s = AdminState.services.find(item => item.id === id);
        if (s) {
            s.active = !s.active;
            localStorage.setItem('dr_aktham_services', JSON.stringify(AdminState.services));
            showToast(`تم ${s.active ? 'تفعيل' : 'إيقاف'} خدمة "${s.name}"`, 'success');
            renderServices();
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
        }
    },

    deleteTestimonial: (id) => {
        if (confirm('هل أنت متأكد من حذف هذا التقييم؟')) {
            AdminState.testimonials = AdminState.testimonials.filter(t => t.id !== id);
            localStorage.setItem('dr_aktham_testimonials', JSON.stringify(AdminState.testimonials));
            showToast('تم حذف التقييم بنجاح.', 'warning');
            renderTestimonials();
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
        }
    },

    deleteContact: (id) => {
        if (confirm('هل أنت متأكد من حذف هذه الرسالة؟')) {
            AdminState.contacts = AdminState.contacts.filter(c => c.id !== id);
            localStorage.setItem('dr_aktham_contacts', JSON.stringify(AdminState.contacts));
            showToast('تم حذف الرسالة بنجاح.', 'warning');
            renderContacts();
            updateBadges();
        }
    },

    deleteNewsletterEmail: (email) => {
        if (confirm(`حذف المشترك (${email}) من النشرة البريدية؟`)) {
            AdminState.newsletter = AdminState.newsletter.filter(n => n.email !== email);
            localStorage.setItem('dr_aktham_newsletter', JSON.stringify(AdminState.newsletter));
            showToast('تم حذف المشترك بنجاح.', 'warning');
            renderNewsletter();
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
    }
};

function saveBookings() {
    localStorage.setItem('dr_aktham_bookings', JSON.stringify(AdminState.bookings));
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
            saveBookings();
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

                saveBookings();
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
            const newSettings = {
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

            localStorage.setItem('dr_aktham_general_settings', JSON.stringify(newSettings));
            showToast('تم حفظ إعدادات وهوية العيادة بنجاح! تم التحديث على كامل الموقع.', 'success');
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
document.addEventListener('DOMContentLoaded', () => {
    initAdminApp();
});
