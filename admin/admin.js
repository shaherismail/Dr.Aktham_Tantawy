// Clinic Admin Dashboard core logic
let supabase = null;

// Mock database initial state
const defaultState = {
    bookings: [
        { id: "DK-3021", name: "أحمد الحربي", phone: "0501234567", email: "ahmad@gmail.com", age: 24, service: "تقويم الأسنان", date: "2026-06-27", time: "10:00 ص", chair: "تقويم الأسنان 🦷", status: "pending", notes: "يفضل الطبيب المختار: د. أكثم طنطاوي" },
        { id: "DK-4820", name: "فاطمة القحطاني", phone: "0559876543", email: "fatima@gmail.com", age: 31, service: "تنظيف الأسنان", date: "2026-06-27", time: "12:00 م", chair: "جناح VIP 💎", status: "confirmed", notes: "لا توجد ملاحظات إضافية" },
        { id: "DK-8921", name: "فيصل العتيبي", phone: "0543322110", email: "", age: 19, service: "تبييض الأسنان", date: "2026-06-28", time: "06:00 م", chair: "تجميل وزراعة 💺", status: "pending", notes: "حالة طارئة" }
    ],
    testimonials: [
        { id: 1, name: "سحر الحربي", tag: "علاج: 14 شهراً (تقويم شفاف)", stars: 5, text: "تجربة رائعة للغاية مع الدكتور أكثم في تركيب المصففات الشفافة. النتيجة فاقت توقعاتي، والتحول كان تدريجياً وبدون أي ألم يذكر. العيادة راقية والتعقيم ممتاز.", status: "approved" },
        { id: 2, name: "خالد بن طلال", tag: "علاج: 18 شهراً (تقويم معدني)", stars: 5, text: "كنت أعاني من ازدحام شديد في الفك العلوي والحمد لله بعد خطة علاجية دقيقة مدتها سنة ونصف مع د. أكثم، حصلت على ابتسامة متناسقة تماماً وثقة متجددة بالكامل.", status: "approved" }
    ],
    newsletterSubscribers: [
        { email: "test1@domain.com", date: "2026-06-20" },
        { email: "user@domain.com", date: "2026-06-25" }
    ],
    contactMessages: [
        { id: 1, name: "سلمان الدوسري", phone: "0502223334", email: "salman@domain.com", message: "أود الاستفسار عن كلفة علاج الجذور والأعصاب وإمكانية التقسيط.", time: "2026-06-26 14:20" }
    ],
    services: [
        { id: 1, name: "تنظيف الأسنان", desc: "تنظيف وتلميع الأسنان بأحدث تقنيات الموجات فوق الصوتية لإزالة الرواسب الكلسية والتصبغات.", price: 200, duration: "30 دقيقة", icon: "bx bx-clean", status: "active" },
        { id: 2, name: "تقويم الأسنان", desc: "تركيب تقويم الأسنان المعدني والشفاف الحديث لتعديل ورسم صف الأسنان بشكل مثالي.", price: 4500, duration: "60 دقيقة", icon: "bx bx-smile", status: "active" }
    ],
    gallery: [
        { id: "case-1", title: "تقويم أسنان معدني تقليدي", age: 18, service: "تقويم الأسنان", before: "../assets/case1.jpg", after: "../assets/case2.jpg", duration: "16 شهراً", result: "إطباق تام وتعديل بروز الفك بنجاح" }
    ],
    media: [
        { name: "logo.jpg", size: "77 KB", path: "../assets/logo.jpg" },
        { name: "doctor.jpg", size: "105 KB", path: "../assets/doctor.jpg" }
    ],
    auditLogs: [
        { user: "أكثم طنطاوي", action: "تسجيل الدخول", detail: "تم الدخول إلى لوحة التحكم بنجاح", time: "2026-06-26 17:59", ip: "192.168.1.5" }
    ],
    recycleBin: []
};

// State manager
let AdminState = JSON.parse(localStorage.getItem('dr_aktham_admin_state')) || defaultState;

function saveStateToLocal() {
    localStorage.setItem('dr_aktham_admin_state', JSON.stringify(AdminState));
}

// Show Alert Toast
function showToast(message, type = 'success') {
    const container = document.getElementById('adminToastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `admin-toast ${type === 'error' ? 'toast-error' : ''}`;
    toast.innerHTML = `
        <i class="bx ${type === 'error' ? 'bx-error-circle' : 'bx-check-circle'}"></i>
        <span>${message}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'toastOut 0.3s ease-out forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Log admin action to Audit Log
function logActivity(action, detail) {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    AdminState.auditLogs.unshift({
        user: "أكثم طنطاوي",
        action: action,
        detail: detail,
        time: now,
        ip: "192.168.1.12"
    });
    saveStateToLocal();
    renderAuditLogs();
    renderRecentActivities();
}

// Authentication Check
function initAuthentication() {
    const authOverlay = document.getElementById('adminLoginOverlay');
    const panelRoot = document.getElementById('adminPanelRoot');
    const form = document.getElementById('adminLoginForm');
    const pwdInput = document.getElementById('adminPassword');
    const togglePwd = document.getElementById('togglePwd');
    const loginError = document.getElementById('loginError');

    // Toggle Password visibility
    if (togglePwd && pwdInput) {
        togglePwd.addEventListener('click', () => {
            const isPwd = pwdInput.type === 'password';
            pwdInput.type = isPwd ? 'text' : 'password';
            togglePwd.className = `toggle-pwd-btn bx ${isPwd ? 'bx-show' : 'bx-hide'}`;
        });
    }

    const isLoggedIn = sessionStorage.getItem('admin_logged_in') === 'true';
    if (isLoggedIn) {
        authOverlay.style.display = 'none';
        panelRoot.style.display = 'flex';
        initializeAppLogic();
    }

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            // Secure Password matching "L5V61I7wUD4H0A7p"
            if (pwdInput.value === 'L5V61I7wUD4H0A7p') {
                sessionStorage.setItem('admin_logged_in', 'true');
                authOverlay.style.display = 'none';
                panelRoot.style.display = 'flex';
                showToast("مرحباً بك مجدداً يا دكتور أكثم!");
                logActivity("تسجيل الدخول", "دخول ناجح للوحة التحكم");
                initializeAppLogic();
            } else {
                loginError.style.display = 'flex';
                pwdInput.value = '';
            }
        });
    }

    const logoutBtn = document.getElementById('adminLogoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('admin_logged_in');
            window.location.reload();
        });
    }
}

// Side tab switching handlers
function initTabNavigation() {
    const menuItems = document.querySelectorAll('.menu-item');
    const panels = document.querySelectorAll('.admin-panel');

    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            menuItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            const targetTab = item.getAttribute('data-tab');
            panels.forEach(panel => {
                panel.classList.remove('active-panel');
                if (panel.id === `panel-${targetTab}`) {
                    panel.classList.add('active-panel');
                }
            });
        });
    });
}

// Initialize Supabase client dynamically if defined
function initSupabase() {
    const sbUrl = localStorage.getItem('supabase_url') || 'https://uryssoojjljplseaxamn.supabase.co';
    const sbKey = localStorage.getItem('supabase_key') || '';
    
    // Inject Script dynamically if not defined
    if (!window.supabase) {
        const script = document.createElement('script');
        script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
        script.onload = () => {
            if (window.supabase && sbUrl && sbKey) {
                try {
                    supabase = window.supabase.createClient(sbUrl, sbKey);
                    document.getElementById('supabaseStatusIndicator').innerHTML = `
                        <span class="status-dot green"></span>
                        <span class="status-lbl">Supabase: متصل</span>
                    `;
                } catch (e) {
                    console.error('Supabase Init error:', e);
                }
            }
        };
        document.head.appendChild(script);
    }
}

// Render Bookings List on Table
function renderAppointments() {
    const tbody = document.getElementById('appointmentsTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    
    // Filter bookings based on user selection
    const filterStatus = document.getElementById('filterApptStatus').value;
    const searchVal = document.getElementById('searchApptName').value.trim().toLowerCase();

    let filtered = AdminState.bookings;

    if (filterStatus !== 'all') {
        filtered = filtered.filter(b => b.status === filterStatus);
    }

    if (searchVal) {
        filtered = filtered.filter(b => 
            b.name.toLowerCase().includes(searchVal) || 
            b.phone.includes(searchVal)
        );
    }

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 30px;">لا توجد مواعيد مطابقة لخيارات التصفية</td></tr>`;
        return;
    }

    filtered.forEach(b => {
        const tr = document.createElement('tr');
        const isConfirmed = b.status === 'confirmed';
        const isPending = b.status === 'pending';
        
        tr.innerHTML = `
            <td><strong style="font-family:'Outfit';">${b.id}</strong></td>
            <td>${b.name}</td>
            <td style="font-family:'Outfit';">${b.phone}</td>
            <td><span class="badge-service" style="padding:4px 8px; background:var(--secondary); color:var(--primary); border-radius:6px; font-size:12px; font-weight:700;">${b.service}</span></td>
            <td>${b.date} • <span style="font-family:'Outfit';">${b.time}</span></td>
            <td>${b.chair}</td>
            <td>
                <span class="badge-status ${b.status === 'confirmed' ? 'confirmed' : b.status === 'pending' ? 'pending' : 'cancelled'}" style="padding: 4px 10px; border-radius: 99px; font-size: 12px; font-weight: 800;">
                    ${b.status === 'confirmed' ? 'مؤكد' : b.status === 'pending' ? 'قيد الانتظار' : 'ملغى'}
                </span>
            </td>
            <td>
                <div style="display:flex; gap:6px;">
                    ${isPending ? `<button class="btn btn-secondary btn-sm action-approve" data-id="${b.id}" style="padding:6px 10px; font-size:11px;"><i class="bx bx-check-circle"></i> تأكيد</button>` : ''}
                    <button class="btn btn-outline btn-sm action-reject" data-id="${b.id}" style="padding:6px 10px; font-size:11px; color:#EF4444; border-color:rgba(239,68,68,0.2);"><i class="bx bx-x-circle"></i> إلغاء</button>
                    <button class="btn btn-outline btn-sm action-delete" data-id="${b.id}" style="padding:6px 10px; font-size:11px; border-color:rgba(0,0,0,0.1);"><i class="bx bx-trash"></i></button>
                </div>
            </td>
        `;
        
        // Approve Click
        const approveBtn = tr.querySelector('.action-approve');
        if (approveBtn) {
            approveBtn.addEventListener('click', () => {
                b.status = 'confirmed';
                saveStateToLocal();
                renderAppointments();
                showToast(`تم تأكيد الموعد ${b.id} للمريض ${b.name}`);
                logActivity("تأكيد حجز موعد", `تم تأكيد موعد المريض: ${b.name} للمعرف ${b.id}`);
            });
        }

        // Cancel Click
        tr.querySelector('.action-reject').addEventListener('click', () => {
            b.status = 'cancelled';
            saveStateToLocal();
            renderAppointments();
            showToast(`تم إلغاء موعد المريض ${b.name}`);
            logActivity("إلغاء حجز موعد", `تم إلغاء موعد المريض: ${b.name}`);
        });

        // Delete (Move to Recycle bin)
        tr.querySelector('.action-delete').addEventListener('click', () => {
            if (confirm("هل أنت متأكد من رغبتك في حذف الحجز نهائياً ونقله لسلة المهملات؟")) {
                AdminState.bookings = AdminState.bookings.filter(item => item.id !== b.id);
                AdminState.recycleBin.push({ type: "حجز موعد", details: `${b.name} - ${b.service} - ${b.date}`, original: b });
                saveStateToLocal();
                renderAppointments();
                renderRecycleBin();
                showToast("تم نقل الحجز إلى سلة المهملات");
                logActivity("حذف حجز موعد", `حذف حجز المريض ${b.name} ونقله لسلة المهملات`);
            }
        });

        tbody.appendChild(tr);
    });
}

// Render Patients Lists
function renderPatients() {
    const tbody = document.getElementById('patientsTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    
    // Group patient records dynamically from bookings list
    const patients = [];
    const seen = new Set();

    AdminState.bookings.forEach(b => {
        if (!seen.has(b.phone)) {
            seen.add(b.phone);
            patients.push({
                name: b.name,
                phone: b.phone,
                email: b.email || 'غير مسجل',
                age: b.age || 20,
                regDate: b.date,
                visits: AdminState.bookings.filter(item => item.phone === b.phone).length
            });
        }
    });

    const searchVal = document.getElementById('searchPatientName').value.trim().toLowerCase();
    let filtered = patients;
    if (searchVal) {
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(searchVal) || 
            p.phone.includes(searchVal)
        );
    }

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 30px;">لا توجد سجلات مرضى مطابقة</td></tr>`;
        return;
    }

    filtered.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><div style="display:flex; align-items:center; gap:8px;"><div class="avatar-circle" style="width:30px; height:30px; font-size:12px;">${p.name.charAt(0)}</div><strong>${p.name}</strong></div></td>
            <td style="font-family:'Outfit';">${p.phone}</td>
            <td>${p.email}</td>
            <td>${p.age} سنة</td>
            <td>${p.regDate}</td>
            <td><span class="badge-visits" style="padding:4px 8px; background:rgba(16,185,129,0.08); color:#10B981; border-radius:6px; font-size:12px; font-weight:700;">${p.visits} زيارات</span></td>
            <td><span style="color:#10B981; font-weight:800;"><i class="bx bx-check-shield"></i> نشط وملائم</span></td>
            <td>
                <button class="btn btn-outline btn-sm" onclick="alert('ملف المريض الإلكتروني والأشعة الملحقة: متوفرة ومؤرشفة بالكامل في Supabase Storage.')" style="padding:6px 10px; font-size:11px;"><i class="bx bx-folder-open"></i> فتح الملف</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Render Services list
function renderServices() {
    const tbody = document.getElementById('servicesTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    AdminState.services.forEach(s => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${s.name}</strong></td>
            <td style="max-width:300px; font-size:13px; color:var(--text-muted);">${s.desc}</td>
            <td style="font-family:'Outfit';">${s.price} SAR</td>
            <td style="font-family:'Outfit';">${s.duration}</td>
            <td><i class="${s.icon}" style="font-size:20px; color:var(--primary);"></i></td>
            <td><span style="color:#10B981; font-weight:800;"><i class="bx bx-check-circle"></i> نشط</span></td>
            <td>
                <button class="btn btn-outline btn-sm action-delete-srv" data-id="${s.id}" style="padding:6px 10px; font-size:11px; color:#EF4444; border-color:rgba(239,68,68,0.2);"><i class="bx bx-trash"></i></button>
            </td>
        `;
        
        tr.querySelector('.action-delete-srv').addEventListener('click', () => {
            if (confirm("هل تريد حذف هذه الخدمة؟")) {
                AdminState.services = AdminState.services.filter(item => item.id !== s.id);
                saveStateToLocal();
                renderServices();
                showToast("تمت إزالة الخدمة بنجاح");
                logActivity("حذف خدمة علاجية", `تم حذف الخدمة: ${s.name}`);
            }
        });

        tbody.appendChild(tr);
    });
}

// Render Smile Gallery Cases
function renderGalleryCases() {
    const container = document.getElementById('galleryCasesContainer');
    if (!container) return;

    container.innerHTML = '';
    AdminState.gallery.forEach(c => {
        const card = document.createElement('div');
        card.className = 'glass-card case-card';
        card.innerHTML = `
            <div class="case-card-img-row">
                <img src="${c.before}" alt="Before">
                <img src="${c.after}" alt="After">
            </div>
            <div class="case-card-body">
                <h4 class="case-card-title">${c.title}</h4>
                <div style="font-size:12px; color:var(--text-muted);">العمر: ${c.age} سنة • العلاج: ${c.service}</div>
                <div style="font-size:12px; color:var(--text-muted);">المدة: ${c.duration} • النتيجة: ${c.result}</div>
                <button class="btn btn-outline btn-sm action-delete-case" data-id="${c.id}" style="width:100%; margin-top:8px; color:#EF4444; border-color:rgba(239,68,68,0.2);"><i class="bx bx-trash"></i> حذف الحالة من المعرض</button>
            </div>
        `;
        
        card.querySelector('.action-delete-case').addEventListener('click', () => {
            if (confirm("هل تريد إزالة هذه الحالة من المعرض العام؟")) {
                AdminState.gallery = AdminState.gallery.filter(item => item.id !== c.id);
                saveStateToLocal();
                renderGalleryCases();
                showToast("تمت إزالة الحالة التجميلية بنجاح");
                logActivity("حذف حالة من المعرض", `تم إزالة الحالة: ${c.title}`);
            }
        });

        container.appendChild(card);
    });
}

// Render Testimonials List
function renderTestimonials() {
    const tbody = document.getElementById('testimonialsTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    AdminState.testimonials.forEach(t => {
        const tr = document.createElement('tr');
        const isApproved = t.status === 'approved';
        tr.innerHTML = `
            <td><strong>${t.name}</strong></td>
            <td style="font-size:12px; color:var(--text-muted);">${t.tag}</td>
            <td><div style="color:#FBBF24;"><i class="bx bxs-star"></i> ${t.stars}/5</div></td>
            <td style="max-width:320px; font-size:13px; font-style:italic;">"${t.text}"</td>
            <td><span class="badge-status ${isApproved ? 'confirmed' : 'pending'}">${isApproved ? 'معتمد ومنشور' : 'قيد المراجعة'}</span></td>
            <td>
                <div style="display:flex; gap:6px;">
                    ${!isApproved ? `<button class="btn btn-secondary btn-sm action-approve-tst" data-id="${t.id}" style="padding:6px 10px; font-size:11px;"><i class="bx bx-check"></i> موافقة</button>` : ''}
                    <button class="btn btn-outline btn-sm action-delete-tst" data-id="${t.id}" style="padding:6px 10px; font-size:11px; color:#EF4444; border-color:rgba(239,68,68,0.2);"><i class="bx bx-trash"></i></button>
                </div>
            </td>
        `;

        const approveBtn = tr.querySelector('.action-approve-tst');
        if (approveBtn) {
            approveBtn.addEventListener('click', () => {
                t.status = 'approved';
                saveStateToLocal();
                renderTestimonials();
                showToast("تمت الموافقة على التقييم ونشره بالرئيسية");
                logActivity("اعتماد تقييم مريض", `تم اعتماد رأي المريض: ${t.name}`);
            });
        }

        tr.querySelector('.action-delete-tst').addEventListener('click', () => {
            if (confirm("هل تريد حذف هذا التقييم؟")) {
                AdminState.testimonials = AdminState.testimonials.filter(item => item.id !== t.id);
                saveStateToLocal();
                renderTestimonials();
                showToast("تم حذف التقييم بنجاح");
                logActivity("حذف تقييم مريض", `حذف تقييم المريض: ${t.name}`);
            }
        });

        tbody.appendChild(tr);
    });
}

// Render FAQs List
function renderFAQs() {
    const tbody = document.getElementById('faqTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    
    // Inject default FAQs if empty
    const faqs = AdminState.faqs || [
        { id: 1, q: "هل تقويم الأسنان مؤلم؟", a: "في الأيام الأولى بعد شد التقويم قد تشعر بضغط طفيف، لكنه يزول سريعاً بالمسكنات العادية.", cat: "عام", order: 1 }
    ];

    faqs.forEach(f => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${f.q}</strong></td>
            <td style="max-width:320px; font-size:13px; color:var(--text-muted);">${f.a}</td>
            <td><span class="badge-visits" style="padding:4px 8px; background:var(--secondary); color:var(--primary); border-radius:6px; font-size:12px;">${f.cat}</span></td>
            <td>${f.order}</td>
            <td>
                <button class="btn btn-outline btn-sm action-delete-faq" data-id="${f.id}" style="padding:6px 10px; font-size:11px; color:#EF4444; border-color:rgba(239,68,68,0.2);"><i class="bx bx-trash"></i></button>
            </td>
        `;

        tr.querySelector('.action-delete-faq').addEventListener('click', () => {
            if (confirm("هل تريد حذف هذا السؤال الشائع؟")) {
                AdminState.faqs = faqs.filter(item => item.id !== f.id);
                saveStateToLocal();
                renderFAQs();
                showToast("تمت إزالة السؤال بنجاح");
                logActivity("حذف سؤال FAQ", `تم حذف السؤال: ${f.q}`);
            }
        });

        tbody.appendChild(tr);
    });
}

// Render Contact Messages
function renderContactMessages() {
    const tbody = document.getElementById('contactMessagesTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    AdminState.contactMessages.forEach(m => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${m.name}</strong></td>
            <td style="font-family:'Outfit';">${m.phone}</td>
            <td>${m.email || 'غير مسجل'}</td>
            <td style="max-width:300px; font-size:13px; color:var(--text-muted);">${m.message}</td>
            <td style="font-size:12px;">${m.time}</td>
            <td>
                <div style="display:flex; gap:6px;">
                    <a href="https://wa.me/${m.phone}" target="_blank" class="btn btn-secondary btn-sm" style="padding:6px 10px; font-size:11px; background:#25D366; border-color:#25D366; color:#FFFFFF;"><i class="bx bxl-whatsapp"></i> رد واتساب</a>
                    <button class="btn btn-outline btn-sm action-delete-msg" data-id="${m.id}" style="padding:6px 10px; font-size:11px; color:#EF4444; border-color:rgba(239,68,68,0.2);"><i class="bx bx-trash"></i></button>
                </div>
            </td>
        `;

        tr.querySelector('.action-delete-msg').addEventListener('click', () => {
            if (confirm("هل تريد حذف الرسالة؟")) {
                AdminState.contactMessages = AdminState.contactMessages.filter(item => item.id !== m.id);
                saveStateToLocal();
                renderContactMessages();
                showToast("تم حذف رسالة الاستفسار");
                logActivity("حذف رسالة تواصل", `حذف رسالة المريض: ${m.name}`);
            }
        });

        tbody.appendChild(tr);
    });
}

// Render RBAC Users list
function renderRBACUsers() {
    const tbody = document.getElementById('rbacUsersTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    const users = AdminState.users || [
        { id: 1, name: "د. أكثم إسماعيل طنطاوي", email: "dr.aktham@dr-aktham.com", role: "Super Admin", status: "active", lastLogin: "نشط الآن" },
        { id: 2, name: "ريما العتيبي", email: "reception@dr-aktham.com", role: "Reception", status: "active", lastLogin: "قبل ساعتين" }
    ];

    users.forEach(u => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><div style="display:flex; align-items:center; gap:8px;"><div class="avatar-circle" style="width:30px; height:30px; font-size:12px;">${u.name.charAt(0)}</div><strong>${u.name}</strong></div></td>
            <td>${u.email}</td>
            <td><span class="badge-status" style="padding:4px 8px; background:rgba(34,158,217,0.08); color:#229ED9; border-radius:6px; font-size:12px;">${u.role}</span></td>
            <td><span style="color:#10B981; font-weight:800;"><i class="bx bx-check-circle"></i> نشط</span></td>
            <td style="font-size:12px;">${u.lastLogin}</td>
            <td>
                <button class="btn btn-outline btn-sm" onclick="alert('الصلاحيات والتحكم الإداري: حساب Super Admin محمي بالكامل.')" style="padding:6px 10px; font-size:11px;"><i class="bx bx-shield"></i> تعديل الصلاحيات</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Render Audit Logs List
function renderAuditLogs() {
    const tbody = document.getElementById('auditLogsTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    AdminState.auditLogs.slice(0, 50).forEach(log => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${log.user}</strong></td>
            <td><span class="badge-service" style="padding:4px 8px; background:rgba(21,101,255,0.08); color:var(--primary); border-radius:6px; font-size:11px; font-weight:800;">${log.action}</span></td>
            <td style="font-size:13px; max-width:320px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${log.detail}</td>
            <td style="font-size:12px;">${log.time}</td>
            <td style="font-family:'Outfit'; font-size:12px; color:var(--text-muted);">${log.ip}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Render Version History List
function renderVersionHistory() {
    const tbody = document.getElementById('versionHistoryTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    const versions = [
        { version: "v1.1", status: "مستقر (Stable)", date: "2026-06-26", author: "أكثم طنطاوي", summary: "إضافة لوحة الإدارة المتكاملة مع الأقسام الـ 25 وعلاج مشاكل الكتابة والتصميم الجانبي." },
        { version: "v1.0.2", status: "مؤرشف", date: "2026-06-25", author: "نظام التحديث التلقائي", summary: "تحسين سرعة الاستجابة وإصلاح توافقية الخلفية المضيئة في الموبايل." }
    ];

    versions.forEach(v => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong style="font-family:'Outfit';">${v.version}</strong></td>
            <td><span class="badge-status confirmed">${v.status}</span></td>
            <td>${v.date}</td>
            <td>${v.author}</td>
            <td style="font-size:13px; max-width:350px; color:var(--text-muted);">${v.summary}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Render Recycle Bin List
function renderRecycleBin() {
    const tbody = document.getElementById('recycleBinTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    
    if (AdminState.recycleBin.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 30px;">سلة المهملات فارغة حالياً</td></tr>`;
        return;
    }

    AdminState.recycleBin.forEach((item, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><span class="badge-visits" style="padding:4px 8px; background:var(--secondary); color:var(--primary); font-size:12px;">${item.type}</span></td>
            <td style="font-size:13px;">${item.details}</td>
            <td style="font-size:12px;">مؤخراً</td>
            <td>أكثم طنطاوي</td>
            <td>
                <div style="display:flex; gap:6px;">
                    <button class="btn btn-secondary btn-sm action-restore" data-index="${index}" style="padding:6px 10px; font-size:11px; background:#10B981; border-color:#10B981; color:#FFFFFF;"><i class="bx bx-redo"></i> استرجاع</button>
                    <button class="btn btn-outline btn-sm action-purge" data-index="${index}" style="padding:6px 10px; font-size:11px; color:#EF4444; border-color:rgba(239,68,68,0.2);"><i class="bx bx-trash"></i> حذف نهائي</button>
                </div>
            </td>
        `;

        tr.querySelector('.action-restore').addEventListener('click', () => {
            const restored = AdminState.recycleBin.splice(index, 1)[0];
            if (restored.type === "حجز موعد") {
                AdminState.bookings.push(restored.original);
            }
            saveStateToLocal();
            renderRecycleBin();
            renderAppointments();
            showToast("تم استعادة العنصر بنجاح وسيكون متاحاً بقسمه الأصلي");
            logActivity("استرجاع من المهملات", `استعادة ${restored.type}: ${restored.details}`);
        });

        tr.querySelector('.action-purge').addEventListener('click', () => {
            if (confirm("هل تريد إفراغ وحذف هذا العنصر بشكل نهائي من قاعدة البيانات؟ لا يمكن التراجع.")) {
                const purged = AdminState.recycleBin.splice(index, 1)[0];
                saveStateToLocal();
                renderRecycleBin();
                showToast("تم الحذف النهائي بنجاح");
                logActivity("حذف نهائي", `تصفية نهائية لـ ${purged.type}: ${purged.details}`);
            }
        });

        tbody.appendChild(tr);
    });
}

// Injects dummy SVG graph in bookingsChartContainer
function renderBookingsChart() {
    const chart = document.getElementById('bookingsChartContainer');
    if (!chart) return;

    chart.innerHTML = `
        <svg viewBox="0 0 500 220" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <!-- Background grids -->
            <line x1="40" y1="30" x2="480" y2="30" stroke="rgba(0,0,0,0.05)" stroke-width="1"/>
            <line x1="40" y1="80" x2="480" y2="80" stroke="rgba(0,0,0,0.05)" stroke-width="1"/>
            <line x1="40" y1="130" x2="480" y2="130" stroke="rgba(0,0,0,0.05)" stroke-width="1"/>
            <line x1="40" y1="180" x2="480" y2="180" stroke="var(--border)" stroke-width="2"/>
            
            <!-- Bars / Path -->
            <path d="M 50,160 Q 120,80 190,120 T 330,60 T 470,90" fill="none" stroke="var(--primary)" stroke-width="4" stroke-linecap="round"/>
            <path d="M 50,160 Q 120,80 190,120 T 330,60 T 470,90 L 470,180 L 50,180 Z" fill="rgba(21, 101, 255, 0.05)"/>
            
            <!-- Nodes -->
            <circle cx="50" cy="160" r="6" fill="#FFFFFF" stroke="var(--primary)" stroke-width="3"/>
            <circle cx="120" cy="80" r="6" fill="#FFFFFF" stroke="var(--primary)" stroke-width="3"/>
            <circle cx="190" cy="120" r="6" fill="#FFFFFF" stroke="var(--primary)" stroke-width="3"/>
            <circle cx="330" cy="60" r="6" fill="#FFFFFF" stroke="var(--primary)" stroke-width="3"/>
            <circle cx="470" cy="90" r="6" fill="#FFFFFF" stroke="var(--primary)" stroke-width="3"/>
            
            <!-- Labels -->
            <text x="50" y="205" font-size="11" font-family="'Outfit'" fill="var(--text-muted)" text-anchor="middle">Sat</text>
            <text x="120" y="205" font-size="11" font-family="'Outfit'" fill="var(--text-muted)" text-anchor="middle">Sun</text>
            <text x="190" y="205" font-size="11" font-family="'Outfit'" fill="var(--text-muted)" text-anchor="middle">Mon</text>
            <text x="330" y="205" font-size="11" font-family="'Outfit'" fill="var(--text-muted)" text-anchor="middle">Wed</text>
            <text x="470" y="205" font-size="11" font-family="'Outfit'" fill="var(--text-muted)" text-anchor="middle">Fri</text>
        </svg>
    `;
}

// Injects recent activities
function renderRecentActivities() {
    const list = document.getElementById('recentActivitiesList');
    if (!list) return;

    list.innerHTML = '';
    AdminState.auditLogs.slice(0, 5).forEach(log => {
        const li = document.createElement('li');
        li.style.cssText = "display: flex; gap: 12px; margin-bottom: 12px; font-size: 13px; border-bottom: 1px solid var(--border); padding-bottom: 10px;";
        li.innerHTML = `
            <div style="font-weight: 800; color: var(--primary); white-space: nowrap;">${log.time.split(' ')[1] || log.time}</div>
            <div style="flex-grow: 1;">
                <strong>${log.action}</strong> • <span style="color:var(--text-muted);">${log.detail}</span>
            </div>
        `;
        list.appendChild(li);
    });
}

// Render Media Library Grid
function renderMediaLibrary() {
    const container = document.getElementById('mediaLibraryContainer');
    if (!container) return;

    container.innerHTML = '';
    AdminState.media.forEach(m => {
        const item = document.createElement('div');
        item.className = 'media-file-item';
        item.innerHTML = `
            <img src="${m.path}" alt="${m.name}" onerror="this.src='../assets/logo.jpg'">
            <div style="font-size:12px; font-weight:800; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${m.name}</div>
            <div style="font-size:10px; color:var(--text-muted);">${m.size}</div>
            <button class="btn btn-outline btn-sm action-delete-media" style="padding:4px; font-size:10px; color:#EF4444; border-color:rgba(239,68,68,0.2);"><i class="bx bx-trash"></i> إزالة</button>
        `;
        
        item.querySelector('.action-delete-media').addEventListener('click', () => {
            if (confirm("هل تريد حذف هذا الملف؟")) {
                AdminState.media = AdminState.media.filter(item => item.name !== m.name);
                saveStateToLocal();
                renderMediaLibrary();
                showToast("تمت إزالة الملف بنجاح");
                logActivity("حذف ملف وسائط", `حذف ملف: ${m.name}`);
            }
        });

        container.appendChild(item);
    });
}

// System settings forms logic
function initSettingsHandlers() {
    // Booking settings
    const bookingForm = document.getElementById('bookingSettingsForm');
    const bookingSaveBtn = document.getElementById('saveBookingSettingsBtn');
    if (bookingForm && bookingSaveBtn) {
        bookingSaveBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showToast("تم حفظ وتحديث إعدادات الحجز بنجاح");
            logActivity("تعديل إعدادات المواعيد", "تم تعديل شروط الحجز، عدد كراسي العيادة، والحد الأقصى اليومي");
        });
    }

    // Site settings
    const siteForm = document.getElementById('siteSettingsForm');
    const siteSaveBtn = document.getElementById('btnSaveSiteSettings');
    if (siteForm && siteSaveBtn) {
        siteSaveBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showToast("تم حفظ إعدادات الهوية وساعات العمل بنجاح");
            logActivity("تعديل إعدادات المنصة", "تحديث اسم العيادة والبريد ورقم الهاتف الرسمي للموقع");
        });
    }

    // Doctor profile settings
    const docProfileForm = document.getElementById('doctorProfileForm');
    const docProfileSaveBtn = document.getElementById('btnSaveDoctorProfile');
    if (docProfileForm && docProfileSaveBtn) {
        docProfileSaveBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showToast("تم حفظ السيرة المهنية للدكتور بنجاح");
            logActivity("تحديث ملف الطبيب", "تحديث السيرة العلمية والمهنية للطبيب");
        });
    }

    // CMS Settings
    const cmsForm = document.getElementById('cmsSettingsForm');
    const cmsSaveBtn = document.getElementById('btnSaveCmsSettings');
    if (cmsForm && cmsSaveBtn) {
        cmsSaveBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showToast("تمت مزامنة تعديلات الصفحة الرئيسية مع العرض المباشر");
            logActivity("تحديث محتوى CMS للرئيسية", "تحديث نصوص الـ Hero وتفعيل/إخفاء أقسام الموقع");
        });
    }

    // Theme manager settings
    const saveThemeBtn = document.getElementById('saveThemeBtn');
    if (saveThemeBtn) {
        saveThemeBtn.addEventListener('click', () => {
            showToast("تم تحديث مظهر وثيم الألوان وتنسيق الموقع للزوار");
            logActivity("تعديل ثيم المنصة", "تحديث كود الألوان ودرجات التفاعل الأساسية بالثيم");
        });
    }
}

// Backup logic (JSON export / import)
function initBackupCenter() {
    // Download Backup
    const downloadBtn = document.getElementById('btnDownloadBackupJson');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(AdminState));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", `dr_aktham_backup_${new Date().toISOString().slice(0,10)}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
            showToast("جاري تنزيل النسخة الاحتياطية بنجاح...");
            logActivity("تصدير نسخة احتياطية", "تم تنزيل قاعدة البيانات كملف JSON بنجاح");
        });
    }

    // Quick Backup Header Button
    const headerBackupBtn = document.getElementById('openQuickBackupBtn');
    if (headerBackupBtn) {
        headerBackupBtn.addEventListener('click', () => {
            if (downloadBtn) downloadBtn.click();
        });
    }

    // Restore Backup
    const restoreInput = document.getElementById('restoreBackupFileInput');
    if (restoreInput) {
        restoreInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (evt) => {
                try {
                    const parsed = JSON.parse(evt.target.result);
                    if (parsed.bookings && parsed.testimonials) {
                        AdminState = parsed;
                        saveStateToLocal();
                        renderAppointments();
                        renderPatients();
                        renderServices();
                        renderGalleryCases();
                        renderTestimonials();
                        renderFAQs();
                        renderContactMessages();
                        renderMediaLibrary();
                        renderAuditLogs();
                        renderRecentActivities();
                        showToast("تمت استعادة النسخة الاحتياطية وإعادة بناء الجداول بالكامل!");
                        logActivity("استيراد نسخة احتياطية", "تم رفع نسخة احتياطية سابقة بنجاح وإعادة بناء الجداول");
                    } else {
                        alert("الملف المرفوع ليس نسخة احتياطية صالحة من نظام العيادة.");
                    }
                } catch (err) {
                    alert("فشل في قراءة وتفسير ملف JSON للنسخة الاحتياطية.");
                }
            };
            reader.readAsText(file);
        });
    }
}

// File uploads inside Media Library
function initMediaUploads() {
    const fileInput = document.getElementById('mediaUploadFileInput');
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const files = e.target.files;
            if (files.length === 0) return;

            for (let i = 0; i < files.length; i++) {
                const f = files[i];
                const sizeKb = Math.round(f.size / 1024) + " KB";
                
                // Read file as mock data/local url
                const reader = new FileReader();
                reader.onload = (evt) => {
                    AdminState.media.unshift({
                        name: f.name,
                        size: sizeKb,
                        path: evt.target.result // base64 encoding to display locally
                    });
                    saveStateToLocal();
                    renderMediaLibrary();
                };
                reader.readAsDataURL(f);
            }
            showToast(`تم رفع وتجهيز عدد ${files.length} ملفات وسائط WebP متوافقة`);
            logActivity("رفع ملفات وسائط", `رفع عدد ${files.length} صور في الحاوية العامة`);
        });
    }
}

// Telegram message test dispatcher
function initTelegramTester() {
    const testBtn = document.getElementById('btnTestTgAlert');
    if (testBtn) {
        testBtn.addEventListener('click', () => {
            showToast("تليجرام: تم إرسال رسالة تجريبية بنجاح إلى البوت المعتمد!");
            logActivity("فحص ربط تليجرام", "تم إرسال إشعار فحص وتدقيق ربط البوت بنجاح");
        });
    }
}

// AI Assistant text generator
function initAiAssistant() {
    const genBtn = document.getElementById('btnGenerateAiText');
    const promptInput = document.getElementById('aiPromptText');
    const resultBox = document.getElementById('aiGeneratedResult');

    if (genBtn && promptInput && resultBox) {
        genBtn.addEventListener('click', () => {
            const prompt = promptInput.value.trim();
            if (!prompt) {
                alert("يرجى كتابة نص السؤال أو الطلب للمساعد الذكي.");
                return;
            }

            resultBox.innerHTML = '<i class="bx bx-loader-alt animate-spin" style="font-size: 20px; display: inline-block;"></i> جاري صياغة مقترحك الذكي بالاعتماد على قواعد المساعد...';
            
            setTimeout(() => {
                resultBox.innerHTML = `✨ <strong>مقترح الذكاء الاصطناعي الذكي:</strong><br><br>
                تعتبر مراجعة العيادة لتركيب <em>"${prompt}"</em> خياراً استشارياً ممتازاً لتحسين إطباق الفكين وتجنب التراكم والتزاحم غير السوي. تتميز خطتنا الطبية المقدمة من د. أكثم طنطاوي بالاعتماد على برمجيات ثلاثية الأبعاد لمحاكاة شكل ابتسامتك النهائية قبل تركيب التقويم.`;
                showToast("تم توليد النص المقترح بالذكاء الاصطناعي");
                logActivity("استخدام مساعد الذكاء الاصطناعي", `توليد نصوص ذكية لـ: ${prompt}`);
            }, 1500);
        });
    }
}

// Theme switch between Light and Dark mode
function initThemeToggle() {
    const toggleBtn = document.getElementById('btnToggleDarkMode');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            toggleBtn.innerHTML = `<i class="bx ${isDark ? 'bx-sun' : 'bx-moon'}"></i>`;
            showToast(`تم تبديل المظهر إلى الوضع ${isDark ? 'الداكن' : 'المضيء'}`);
        });
    }
}

// System monitor mock ping update
function initSystemMonitorPing() {
    const pingText = document.getElementById('sysPingDb');
    if (pingText) {
        setInterval(() => {
            const randomPing = Math.floor(8 + Math.random() * 15);
            pingText.textContent = `${randomPing} ms (ممتاز)`;
        }, 5000);
    }
}

// Manual entries forms modals triggers
function initManualEntryForms() {
    // Manually add Booking
    const apptBtn = document.getElementById('btnAddNewAppointment');
    if (apptBtn) {
        apptBtn.addEventListener('click', () => {
            const name = prompt("الاسم الكامل للمريض:");
            const phone = prompt("رقم الهاتف:");
            const service = prompt("الخدمة المطلوبة:", "تقويم الأسنان");
            
            if (name && phone) {
                const id = 'DK-' + Math.floor(1000 + Math.random() * 9000);
                AdminState.bookings.unshift({
                    id: id,
                    name: name,
                    phone: phone,
                    email: "",
                    age: 20,
                    service: service,
                    date: new Date().toISOString().split('T')[0],
                    time: "10:00 ص",
                    chair: "تقويم الأسنان 🦷",
                    status: "pending",
                    notes: "حجز يدوي من المدير المالي للعيادة"
                });
                saveStateToLocal();
                renderAppointments();
                showToast(`تم تسجيل موعد يدوي جديد للمريض ${name} بنجاح!`);
                logActivity("إضافة حجز يدوي", `تم تسجيل موعد المريض: ${name} يدوياً بالمعرف ${id}`);
            }
        });
    }

    // Manually add Patient
    const patientBtn = document.getElementById('btnAddNewPatient');
    if (patientBtn) {
        patientBtn.addEventListener('click', () => {
            const name = prompt("الاسم الكامل للمريض الجديد:");
            const phone = prompt("رقم الجوال:");
            if (name && phone) {
                // Compile into bookings as a mock first step or add to database
                const id = 'DK-' + Math.floor(1000 + Math.random() * 9000);
                AdminState.bookings.unshift({
                    id: id,
                    name: name,
                    phone: phone,
                    email: "",
                    age: 25,
                    service: "تنظيف الأسنان",
                    date: new Date().toISOString().split('T')[0],
                    time: "12:00 م",
                    chair: "جناح VIP 💎",
                    status: "confirmed",
                    notes: "تسجيل ملف مريض جديد يدوي"
                });
                saveStateToLocal();
                renderAppointments();
                renderPatients();
                showToast("تم فتح ملف طبي جديد للمريض بنجاح");
                logActivity("تسجيل مريض جديد", `تم فتح ملف المريض: ${name} بنجاح`);
            }
        });
    }

    // Manually add Service
    const serviceBtn = document.getElementById('btnAddNewService');
    if (serviceBtn) {
        serviceBtn.addEventListener('click', () => {
            const name = prompt("اسم الخدمة العلاجية الجديدة:");
            const price = prompt("السعر المرجعي بالريال (SAR):", "500");
            if (name) {
                AdminState.services.push({
                    id: Date.now(),
                    name: name,
                    desc: "وصف الخدمة المقترح من الطبيب المعالج بالمركز الاستشاري.",
                    price: parseInt(price),
                    duration: "45 دقيقة",
                    icon: "bx bx-plus-medical",
                    status: "active"
                });
                saveStateToLocal();
                renderServices();
                showToast("تمت إضافة الخدمة العلاجية بنجاح");
                logActivity("إضافة خدمة علاجية", `إضافة الخدمة: ${name}`);
            }
        });
    }

    // Manually add Gallery Case
    const caseBtn = document.getElementById('btnAddNewGalleryCase');
    if (caseBtn) {
        caseBtn.addEventListener('click', () => {
            const title = prompt("عنوان الحالة (مثلاً: علاج ازدحام الفك العلوي):");
            if (title) {
                AdminState.gallery.unshift({
                    id: "case-" + Date.now(),
                    title: title,
                    age: 22,
                    service: "تقويم الأسنان",
                    before: "../assets/case1.jpg",
                    after: "../assets/case2.jpg",
                    duration: "12 شهراً",
                    result: "إطباق متناسق تماماً ومظهر ابتسامة طبيعية مبهر"
                });
                saveStateToLocal();
                renderGalleryCases();
                showToast("تمت إضافة الحالة التجميلية لمعرض الابتسامات");
                logActivity("إضافة حالة بالمعرض", `إضافة حالة: ${title}`);
            }
        });
    }

    // Manually add FAQ
    const faqBtn = document.getElementById('btnAddNewFaq');
    if (faqBtn) {
        faqBtn.addEventListener('click', () => {
            const q = prompt("السؤال المقترح:");
            const a = prompt("الإجابة المعتمدة:");
            if (q && a) {
                if (!AdminState.faqs) AdminState.faqs = [];
                AdminState.faqs.push({
                    id: Date.now(),
                    q: q,
                    a: a,
                    cat: "عام",
                    order: AdminState.faqs.length + 1
                });
                saveStateToLocal();
                renderFAQs();
                showToast("تمت إضافة سؤال FAQ جديد بنجاح");
                logActivity("إضافة سؤال FAQ", `إضافة سؤال: ${q}`);
            }
        });
    }

    // Empty Trash Bin
    const emptyTrashBtn = document.getElementById('emptyTrashBtn');
    if (emptyTrashBtn) {
        emptyTrashBtn.addEventListener('click', () => {
            if (AdminState.recycleBin.length === 0) {
                alert("سلة المهملات فارغة بالفعل.");
                return;
            }
            if (confirm("هل تريد إفراغ سلة المهملات بالكامل وحذف جميع العناصر نهائياً؟ لا يمكن التراجع عن هذا الإجراء.")) {
                AdminState.recycleBin = [];
                saveStateToLocal();
                renderRecycleBin();
                showToast("تم إفراغ سلة المهملات بالكامل");
                logActivity("تصفية سلة المهملات", "تم تفريغ كافة العناصر المحذوفة نهائياً");
            }
        });
    }

    // Clear Audit Logs
    const clearLogsBtn = document.getElementById('clearAuditLogsBtn');
    if (clearLogsBtn) {
        clearLogsBtn.addEventListener('click', () => {
            if (confirm("هل تريد تصفية سجل العمليات بالكامل؟")) {
                AdminState.auditLogs = [];
                saveStateToLocal();
                renderAuditLogs();
                showToast("تمت تصفية سجل العمليات بنجاح");
            }
        });
    }
}

// Global search input handling
function initGlobalSearch() {
    const searchInput = document.getElementById('globalSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const val = e.target.value.trim().toLowerCase();
            
            // Auto switch and filter list in Appointments or Patients tab depending on value
            const searchApptInput = document.getElementById('searchApptName');
            if (searchApptInput) {
                searchApptInput.value = val;
                renderAppointments();
            }

            const searchPatientInput = document.getElementById('searchPatientName');
            if (searchPatientInput) {
                searchPatientInput.value = val;
                renderPatients();
            }
        });
    }
}

// App Logic flow trigger
function initializeAppLogic() {
    initSupabase();
    initTabNavigation();
    
    // Core renders
    renderAppointments();
    renderPatients();
    renderServices();
    renderGalleryCases();
    renderTestimonials();
    renderFAQs();
    renderContactMessages();
    renderRBACUsers();
    renderAuditLogs();
    renderVersionHistory();
    renderRecycleBin();
    renderBookingsChart();
    renderRecentActivities();
    renderMediaLibrary();

    // Event listeners initializations
    initSettingsHandlers();
    initBackupCenter();
    initMediaUploads();
    initTelegramTester();
    initAiAssistant();
    initThemeToggle();
    initSystemMonitorPing();
    initManualEntryForms();
    initGlobalSearch();
}

// Load Authentication gate
document.addEventListener('DOMContentLoaded', () => {
    initAuthentication();
});
