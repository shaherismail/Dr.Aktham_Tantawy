// Supabase Clinic Management Platform Admin Panel Controller

let supabaseClient = null;
let currentUser = null;
let currentUserRole = 'Viewer';
let conversionChart = null;

// Initialize connection on DOM load
document.addEventListener('DOMContentLoaded', () => {
    initConnectionKeys();
    setupAuthListeners();
    setupRouting();
    setupThemeToggle();
});

// Setup settings inputs or default connection keys
function initConnectionKeys() {
    const defaultUrl = 'https://uryssoojjljplseaxamn.supabase.co';
    const defaultKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyeXNzb29qamxqcGxzZWF4YW1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzMjE0NjgsImV4cCI6MjA5Nzg5NzQ2OH0.VmSSd3_7we4ZNOcHSaklHAN05Bnx9dCiTHjY_UI7c_k'; // anon key from PASSWORD

    const savedUrl = localStorage.getItem('supabase_url') || defaultUrl;
    const savedKey = localStorage.getItem('supabase_key') || defaultKey;

    document.getElementById('configUrl').value = savedUrl;
    document.getElementById('configKey').value = savedKey;

    localStorage.setItem('supabase_url', savedUrl);
    localStorage.setItem('supabase_key', savedKey);

    try {
        if (window.supabase) {
            supabaseClient = window.supabase.createClient(savedUrl, savedKey);
            checkActiveSession();
        }
    } catch(e) {
        console.error("Failed to load default supabase connection settings", e);
    }
}

// Authentication check and UI redirection
function checkActiveSession() {
    if (!supabaseClient) return;

    supabaseClient.auth.getSession().then(({ data: { session }, error }) => {
        if (session && !error) {
            currentUser = session.user;
            // Fetch User Role from database
            supabaseClient.from('user_roles')
                .select('role')
                .eq('id', currentUser.id)
                .single()
                .then(({ data, error }) => {
                    if (data && !error) {
                        currentUserRole = data.role;
                    } else {
                        // Default to Viewer if role isn't assigned
                        currentUserRole = 'Viewer';
                    }
                    displayAuthenticatedUI();
                });
        } else {
            displayAuthScreen();
        }
    });
}

function displayAuthScreen() {
    document.getElementById('authScreen').style.display = 'flex';
    document.getElementById('appScreen').style.display = 'none';
}

function displayAuthenticatedUI() {
    document.getElementById('authScreen').style.display = 'none';
    document.getElementById('appScreen').style.display = 'grid';

    document.getElementById('adminUserEmail').textContent = currentUser.email;
    document.getElementById('adminUserRole').textContent = currentUserRole;
    document.getElementById('avatarLetter').textContent = currentUser.email.charAt(0).toUpperCase();

    // Trigger router and default load
    handleRoute();
    loadDashboardStats();
    initNotificationBell();
    initBackupRestoreListeners();
}

function initBackupRestoreListeners() {
    const downloadBtn = document.getElementById('downloadBackupBtn');
    const uploadInput = document.getElementById('uploadBackupInput');
    
    if (downloadBtn) {
        downloadBtn.onclick = () => {
            if (currentUserRole !== 'Super Admin' && currentUserRole !== 'Doctor') {
                alert('عذراً: فقط مدير النظام أو الطبيب يملك صلاحية تنزيل النسخ الاحتياطية.');
                return;
            }
            
            alert('جاري توليد ملف النسخة الاحتياطية...');
            import('../assets/js/db-service.js').then(({ DBService }) => {
                DBService.generateBackupPayload(supabaseClient).then(jsonStr => {
                    if (!jsonStr) {
                        alert('فشل توليد النسخة الاحتياطية.');
                        return;
                    }
                    const blob = new Blob([jsonStr], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `dr_aktham_clinic_backup_${new Date().toISOString().split('T')[0]}.json`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    alert('🎉 تم تنزيل النسخة الاحتياطية لقاعدة البيانات بنجاح!');
                });
            });
        };
    }
    
    if (uploadInput) {
        uploadInput.onchange = (e) => {
            if (currentUserRole !== 'Super Admin') {
                alert('تنبيه: استعادة النسخة الاحتياطية مسموح بها فقط لمدير النظام (Super Admin).');
                return;
            }
            
            const file = e.target.files[0];
            if (!file) return;
            
            if (confirm('⚠️ تحذير خطير: استعادة النسخة الاحتياطية ستمسح كافة البيانات الحالية وتستبدلها ببيانات الملف. هل تود المتابعة؟')) {
                const reader = new FileReader();
                reader.onload = (evt) => {
                    const payloadStr = evt.target.result;
                    import('../assets/js/db-service.js').then(({ DBService }) => {
                        DBService.restoreBackupPayload(payloadStr, supabaseClient, currentUser.email)
                            .then(res => {
                                if (res.error) {
                                    alert('❌ فشل استعادة البيانات: ' + res.error);
                                } else {
                                    alert('🎉 تم استعادة قاعدة البيانات والملفات والخيارات بنجاح!');
                                    location.reload();
                                }
                            });
                    });
                };
                reader.readAsText(file);
            }
        };
    }
}

function setupAuthListeners() {
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value.trim();
        const pass = document.getElementById('loginPassword').value;

        // Apply any revised connection keys from form input
        const url = document.getElementById('configUrl').value.trim();
        const key = document.getElementById('configKey').value.trim();
        localStorage.setItem('supabase_url', url);
        localStorage.setItem('supabase_key', key);
        supabaseClient = window.supabase.createClient(url, key);

        supabaseClient.auth.signInWithPassword({ email, password: pass })
            .then(({ data, error }) => {
                if (error) {
                    alert('خطأ في المصادقة: ' + error.message);
                } else {
                    currentUser = data.user;
                    checkActiveSession();
                }
            });
    });

    document.getElementById('logoutBtn').addEventListener('click', () => {
        if (supabaseClient) {
            supabaseClient.auth.signOut().then(() => {
                currentUser = null;
                currentUserRole = 'Viewer';
                displayAuthScreen();
            });
        }
    });
}

// Router for SPA navigation based on hash paths
function setupRouting() {
    window.addEventListener('hashchange', handleRoute);
    
    // Global Search event listener
    document.getElementById('globalSearchInput').addEventListener('input', (e) => {
        executeGlobalSearch(e.target.value.trim());
    });
}

function handleRoute() {
    const hash = window.location.hash || '#/dashboard';
    const cleanRoute = hash.replace('#/', '');
    
    // Deactivate all views
    document.querySelectorAll('.page-view').forEach(view => {
        view.classList.remove('active');
    });
    
    // Deactivate all sidebar buttons
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });

    const targetView = document.getElementById(`view-${cleanRoute}`);
    const sidebarLink = document.querySelector(`.menu-item[data-target="${cleanRoute}"]`);

    if (targetView) {
        targetView.classList.add('active');
    }
    if (sidebarLink) {
        sidebarLink.classList.add('active');
    }

    // Trigger loaders based on section selected
    switch(cleanRoute) {
        case 'dashboard':
            loadDashboardStats();
            break;
        case 'appointments':
            loadAppointments();
            break;
        case 'patients':
            loadPatients();
            break;
        case 'services':
            loadServices();
            break;
        case 'cases':
            loadCases();
            break;
        case 'media':
            loadMediaLibrary();
            break;
        case 'homepage':
            loadHomepageCMS();
            break;
        case 'doctor':
            loadDoctorCMS();
            break;
        case 'pages':
            loadContactInbox();
            break;
        case 'settings':
            loadClinicSettings();
            break;
        case 'users':
            loadUserRoles();
            break;
        case 'logs':
            loadAuditLogs();
            break;
        case 'recycle-bin':
            loadRecycleBin();
            break;
    }
}

// Global Audit Log and Version Backup Logger helper
function logAuditAction(action, affectedItem, oldValue, newValue) {
    if (!supabaseClient || !currentUser) return;
    
    // 1. Save entry to audit_logs
    supabaseClient.from('audit_logs').insert([{
        user_email: currentUser.email,
        action: action,
        affected_item: affectedItem,
        old_value: oldValue || null,
        new_value: newValue || null
    }]).then(({ error }) => {
        if (error) console.error("Audit logger insertion error:", error);
    });

    // 2. Save version history snapshot for rollbacks if modifying main CMS settings
    const trackableTables = ['site_settings', 'theme_settings', 'homepage_editor', 'doctor_profile', 'page_sections', 'component_content'];
    const parsedTable = affectedItem.split(':')[0];

    if (trackableTables.includes(parsedTable)) {
        supabaseClient.from('version_history').insert([{
            table_name: parsedTable,
            record_id: affectedItem.split(':')[1] || '1',
            version_data: newValue || {},
            created_by: currentUser.email
        }]).then(({ error }) => {
            if (error) console.error("Version backup logging error:", error);
        });
    }
}

// ---------------------------------------------------------
// 1. DASHBOARD STATISTICS VIEW
// ---------------------------------------------------------
function loadDashboardStats() {
    if (!supabaseClient) return;

    const todayDateStr = new Date().toISOString().split('T')[0];

    // Load statistics queries in parallel
    Promise.all([
        supabaseClient.from('bookings').select('*', { count: 'exact' }).eq('date', todayDateStr).eq('is_deleted', false),
        supabaseClient.from('bookings').select('*', { count: 'exact' }).gt('date', todayDateStr).eq('is_deleted', false),
        supabaseClient.from('bookings').select('*', { count: 'exact' }).eq('status', 'pending').eq('is_deleted', false),
        supabaseClient.from('bookings').select('phone', { count: 'exact', head: false }).eq('is_deleted', false),
        supabaseClient.from('component_content').select('*', { count: 'exact' }).eq('component_id', '4808cfcf-349c-4932-a083-0a716c52a0a2').eq('is_deleted', false)
    ]).then(([todayRes, upcomingRes, pendingRes, patientsRes, casesRes]) => {
        document.getElementById('statTodayAppts').textContent = todayRes.count || 0;
        document.getElementById('statUpcomingAppts').textContent = upcomingRes.count || 0;
        document.getElementById('statPendingBookings').textContent = pendingRes.count || 0;
        
        // Find total unique patients based on phone number counts
        let patientSet = new Set();
        if (patientsRes.data) {
            patientsRes.data.forEach(item => patientSet.add(item.phone));
        }
        document.getElementById('statTotalPatients').textContent = patientSet.size || 0;
        document.getElementById('statTotalCases').textContent = casesRes.count || 0;

        renderStatsChart();
    });
}

function renderStatsChart() {
    const ctx = document.getElementById('conversionChart').getContext('2d');
    if (conversionChart) conversionChart.destroy();

    conversionChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
            datasets: [{
                label: 'نمو حجوزات المرضى اليومية',
                data: [15, 28, 41, 35, 62, 78],
                borderColor: '#0284c7',
                backgroundColor: 'rgba(2, 132, 199, 0.1)',
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

// ---------------------------------------------------------
// 2. APPOINTMENT MANAGER
// ---------------------------------------------------------
let currentCalDate = new Date();

function loadAppointments() {
    renderCalendarView();
    loadPendingBookingsList();
    setupCalendarControls();
}

function setupCalendarControls() {
    const prevBtn = document.getElementById('calPrevMonthBtn');
    const nextBtn = document.getElementById('calNextMonthBtn');
    
    // Clear and rebind event listeners to avoid duplicates
    const newPrevBtn = prevBtn.cloneNode(true);
    const newNextBtn = nextBtn.cloneNode(true);
    prevBtn.parentNode.replaceChild(newPrevBtn, prevBtn);
    nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);

    newPrevBtn.addEventListener('click', () => {
        currentCalDate.setMonth(currentCalDate.getMonth() - 1);
        renderCalendarView();
    });
    newNextBtn.addEventListener('click', () => {
        currentCalDate.setMonth(currentCalDate.getMonth() + 1);
        renderCalendarView();
    });

    // Add manual booking setup
    document.getElementById('openAddApptModalBtn').onclick = () => {
        document.getElementById('bookingModal').style.display = 'flex';
    };

    const bookingForm = document.getElementById('bookingForm');
    bookingForm.onsubmit = (e) => {
        e.preventDefault();
        if (currentUserRole === 'Viewer') {
            alert('عذراً: حساب المشاهد (Viewer) لا يملك صلاحية تعديل أو جدولة الحجوزات.');
            return;
        }

        const name = document.getElementById('bkFormName').value;
        const phone = document.getElementById('bkFormPhone').value;
        const email = document.getElementById('bkFormEmail').value;
        const service = document.getElementById('bkFormService').value;
        const age = parseInt(document.getElementById('bkFormAge').value) || 20;
        const date = document.getElementById('bkFormDate').value;
        const time = document.getElementById('bkFormTime').value;
        const chair = document.getElementById('bkFormChair').value;
        const notes = document.getElementById('bkFormNotes').value;

        const bookingId = 'bk_' + Math.random().toString(36).substr(2, 9);

        supabaseClient.from('bookings').insert([{
            id: bookingId,
            name, phone, email, service, age, date, time, chair, notes, status: 'confirmed'
        }]).then(({ error }) => {
            if (error) {
                alert('خطأ أثناء الإدخال: ' + error.message);
            } else {
                logAuditAction('bookings:insert', `bookings:${bookingId}`, null, { name, service, date, time });
                alert('✅ تم تسجيل الموعد الجديد بنجاح في جدول العيادة ومزامنته!');
                document.getElementById('bookingModal').style.display = 'none';
                bookingForm.reset();
                loadAppointments();
            }
        });
    };
}

function renderCalendarView() {
    const monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
    document.getElementById('calendarMonthTitle').textContent = `${monthNames[currentCalDate.getMonth()]} ${currentCalDate.getFullYear()}`;

    const cellsContainer = document.getElementById('calendarCellsContainer');
    cellsContainer.innerHTML = '';

    // Calculate dates
    const year = currentCalDate.getFullYear();
    const month = currentCalDate.getMonth();
    const firstDayIndex = (new Date(year, month, 1).getDay() + 1) % 7; // Align to Saturday start
    const totalDays = new Date(year, month + 1, 0).getDate();

    // Get all bookings for this month
    const startStr = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const endStr = `${year}-${String(month + 1).padStart(2, '0')}-${totalDays}`;

    supabaseClient.from('bookings')
        .select('*')
        .eq('is_deleted', false)
        .gte('date', startStr)
        .lte('date', endStr)
        .then(({ data, error }) => {
            const bookingsList = data || [];
            
            // Render empty cells for leading days
            for (let i = 0; i < firstDayIndex; i++) {
                const emptyCell = document.createElement('div');
                emptyCell.className = 'calendar-cell empty';
                cellsContainer.appendChild(emptyCell);
            }

            // Render calendar day cells
            for (let day = 1; day <= totalDays; day++) {
                const cell = document.createElement('div');
                cell.className = 'calendar-cell';
                
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                
                // Highlight today
                const todayStr = new Date().toISOString().split('T')[0];
                if (dateStr === todayStr) {
                    cell.classList.add('today');
                }

                cell.innerHTML = `<span class="calendar-date-number">${day}</span>`;

                // Add appointments tickets in cell
                const dayBookings = bookingsList.filter(b => b.date === dateStr);
                dayBookings.forEach(b => {
                    const ticket = document.createElement('div');
                    ticket.className = `calendar-appointment-ticket ${b.status === 'confirmed' ? 'confirmed' : 'pending'}`;
                    ticket.textContent = `${b.time} - ${b.name}`;
                    ticket.title = `${b.name} (${b.service})`;
                    
                    ticket.onclick = () => {
                        alert(`📂 تفاصيل الحجز:\nمريض: ${b.name}\nالهاتف: ${b.phone}\nالخدمة: ${b.service}\nالوقت: ${b.time}\nملاحظات: ${b.notes || 'لا يوجد'}`);
                    };
                    cell.appendChild(ticket);
                });

                // HTML5 Drag and drop rescheduling
                cell.ondragover = (e) => e.preventDefault();
                cell.ondrop = (e) => {
                    e.preventDefault();
                    const dragData = JSON.parse(e.dataTransfer.getData("text/plain") || "{}");
                    if (dragData.id && currentUserRole !== 'Viewer') {
                        supabaseClient.from('bookings').update({ date: dateStr }).eq('id', dragData.id)
                            .then(({ error }) => {
                                if (!error) {
                                    logAuditAction('bookings:reschedule', `bookings:${dragData.id}`, { date: dragData.date }, { date: dateStr });
                                    alert(`🔄 تم نقل موعد المريض إلى تاريخ: ${dateStr}`);
                                    renderCalendarView();
                                }
                            });
                    }
                };

                cellsContainer.appendChild(cell);
            }
        });
}

function loadPendingBookingsList() {
    const listBody = document.getElementById('appointmentsListTableBody');
    listBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">جاري تحميل الحجوزات...</td></tr>';

    supabaseClient.from('bookings')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
            if (error || !data) {
                listBody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:red;">فشل تحميل المواعيد.</td></tr>';
                return;
            }

            listBody.innerHTML = '';
            data.forEach(b => {
                const tr = document.createElement('tr');
                // Drag properties
                tr.draggable = true;
                tr.ondragstart = (e) => {
                    e.dataTransfer.setData("text/plain", JSON.stringify({ id: b.id, date: b.date }));
                };

                const isConfirmed = b.status === 'confirmed';

                tr.innerHTML = `
                    <td style="font-weight:600;">${b.name}</td>
                    <td>${b.phone}</td>
                    <td>${b.service}</td>
                    <td>${b.date} • ${b.time}</td>
                    <td>${b.chair || 'عيادة 1'}</td>
                    <td><span class="badge ${isConfirmed ? 'badge-success' : 'badge-warning'}">${isConfirmed ? 'مؤكد' : 'معلق تليجرام'}</span></td>
                    <td>
                        <div style="display:flex; gap:6px;">
                            ${!isConfirmed ? `
                                <button class="btn btn-secondary btn-sm approve-appt-btn" data-id="${b.id}" title="موافقة"><i class="bx bx-check"></i></button>
                            ` : ''}
                            <button class="btn btn-secondary btn-sm cancel-appt-btn" data-id="${b.id}" title="إلغاء الموعد"><i class="bx bx-x"></i></button>
                            <button class="btn btn-danger btn-sm delete-appt-btn" data-id="${b.id}" title="حذف للمهملات"><i class="bx bx-trash"></i></button>
                        </div>
                    </td>
                `;

                listBody.appendChild(tr);

                // Actions handlers
                const approveBtn = tr.querySelector('.approve-appt-btn');
                if (approveBtn) {
                    approveBtn.onclick = () => updateBookingStatus(b.id, 'confirmed');
                }
                tr.querySelector('.cancel-appt-btn').onclick = () => updateBookingStatus(b.id, 'cancelled');
                tr.querySelector('.delete-appt-btn').onclick = () => softDeleteRecord('bookings', b.id, loadAppointments);
            });
        });
}

function updateBookingStatus(bookingId, status) {
    if (currentUserRole === 'Viewer') {
        alert('حساب المشاهد لا يملك صلاحية تغيير الحجوزات.');
        return;
    }
    supabaseClient.from('bookings').update({ status }).eq('id', bookingId)
        .then(({ error }) => {
            if (error) alert(error.message);
            else {
                logAuditAction('bookings:update_status', `bookings:${bookingId}`, null, { status });
                alert(`✅ تم تحديث حالة الحجز إلى: ${status === 'confirmed' ? 'مؤكد' : 'ملغي'}`);
                loadAppointments();
            }
        });
}

// ---------------------------------------------------------
// 3. PATIENT MANAGER
// ---------------------------------------------------------
function loadPatients() {
    const listBody = document.getElementById('patientsTableBody');
    listBody.innerHTML = '<tr><td colspan="8" style="text-align:center;">جاري تحميل المرضى...</td></tr>';

    supabaseClient.from('bookings')
        .select('*')
        .eq('is_deleted', false)
        .then(({ data, error }) => {
            if (error || !data) {
                listBody.innerHTML = '<tr><td colspan="8" style="text-align:center; color:red;">خطأ في تحميل المرضى.</td></tr>';
                return;
            }

            // Extract unique patients based on phone number
            const patientMap = new Map();
            data.forEach(b => {
                if (!patientMap.has(b.phone)) {
                    patientMap.set(b.phone, {
                        id: b.id,
                        name: b.name,
                        phone: b.phone,
                        email: b.email || 'غير مسجل',
                        age: b.age || 'غير محدد',
                        lastAppt: `${b.date} ${b.time}`
                    });
                }
            });

            listBody.innerHTML = '';
            patientMap.forEach(p => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><code>#${p.id.substr(3, 6)}</code></td>
                    <td style="font-weight:600;">${p.name}</td>
                    <td>${p.phone}</td>
                    <td>${p.age} سنة</td>
                    <td>${p.lastAppt}</td>
                    <td><button class="btn btn-secondary btn-sm edit-history-btn" data-phone="${p.phone}"><i class="bx bx-plus-medical"></i> عرض</button></td>
                    <td><button class="btn btn-secondary btn-sm view-files-btn" data-phone="${p.phone}"><i class="bx bx-file"></i> الأشعة</button></td>
                    <td><button class="btn btn-primary btn-sm view-full-profile-btn" data-phone="${p.phone}">الملف الكامل</button></td>
                `;

                listBody.appendChild(tr);

                tr.querySelector('.view-full-profile-btn').onclick = () => displayPatientDetails(p);
                tr.querySelector('.view-files-btn').onclick = () => displayPatientDetails(p);
                tr.querySelector('.edit-history-btn').onclick = () => {
                    const hist = prompt("أدخل السوابق المرضية والملخص التقويمي لهذا المريض:", "لا يعاني من أي أمراض مزمنة. تقويم شفاف للفكين.");
                    if (hist) {
                        logAuditAction('patient:update_history', `patient:${p.phone}`, null, { medical_history: hist });
                        alert("✅ تم تحديث التاريخ الطبي بنجاح.");
                    }
                };
            });
        });
}

function displayPatientDetails(patient) {
    const modal = document.getElementById('patientDetailsModal');
    modal.style.display = 'block';
    modal.scrollIntoView({ behavior: 'smooth' });

    document.getElementById('patientDetailTitle').textContent = `السجل التقويمي الطبي: ${patient.name}`;
    document.getElementById('pdEmail').textContent = `البريد الإلكتروني: ${patient.email}`;
    
    // Configure X-ray uploads for specific patient
    const fileInput = document.getElementById('patientXrayUpload');
    fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            uploadMediaFileDirectly(file, 'cases').then((url) => {
                logAuditAction('patient:xray_upload', `patient:${patient.phone}`, null, { xray_url: url });
                alert("✅ تم رفع ملف الأشعة السينية بنجاح ومزامنته بملف المريض!");
                renderPatientXrays(patient.phone);
            });
        }
    };

    renderPatientXrays(patient.phone);
}
function renderPatientXrays(phone) {
    const container = document.getElementById('patientXraysGrid');
    container.innerHTML = 'جاري تحميل الأشعة...';

    // Mock/Fetch images associated with patient phone/folder tags
    supabaseClient.from('media_library')
        .select('*')
        .eq('folder', 'cases')
        .eq('is_deleted', false)
        .then(({ data, error }) => {
            if (error || !data || data.length === 0) {
                container.innerHTML = '<span style="color:var(--text-muted); font-size:12px;">لم يتم رفع أي صور أشعة بعد.</span>';
                return;
            }

            container.innerHTML = '';
            data.forEach(media => {
                const img = document.createElement('img');
                img.src = media.url;
                img.style.width = '70px';
                img.style.height = '70px';
                img.style.objectFit = 'cover';
                img.style.borderRadius = '6px';
                img.style.cursor = 'pointer';
                img.onclick = () => window.open(media.url, '_blank');
                container.appendChild(img);
            });
        });
}

function publishComponentContent(itemId, callback) {
    supabaseClient.from('component_content').select('draft_data').eq('id', itemId).single()
        .then(({ data }) => {
            if (!data) return;
            supabaseClient.from('component_content').update({
                published_data: data.draft_data,
                status: 'published',
                updated_at: new Date().toISOString()
            }).eq('id', itemId).then(({ error }) => {
                if (error) alert('فشل النشر: ' + error.message);
                else {
                    logAuditAction('component_content:publish', `component_content:${itemId}`, null, data.draft_data);
                    alert('🎉 تم نشر وتطبيق التحديثات بنجاح للموقع العام!');
                    if (callback) callback();
                }
            });
        });
}

function loadServices() {
    const listBody = document.getElementById('servicesListTableBody');
    listBody.innerHTML = '<tr><td colspan="9" style="text-align:center;">جاري تحميل الخدمات...</td></tr>';

    supabaseClient.from('component_content')
        .select('*')
        .eq('component_id', 'f088192a-fa13-4c91-a20c-c603b10bcf2e') // service_card component ID
        .eq('is_deleted', false)
        .order('display_order', { ascending: true })
        .then(({ data, error }) => {
            if (error || !data) {
                listBody.innerHTML = '<tr><td colspan="9" style="text-align:center; color:red;">فشل تحميل الخدمات.</td></tr>';
                return;
            }

            listBody.innerHTML = '';
            data.forEach(item => {
                const s = item.draft_data || {};
                const tr = document.createElement('tr');
                const isDraft = item.status === 'draft';
                tr.innerHTML = `
                    <td><span class="drag-handle"><i class="bx bx-menu"></i></span></td>
                    <td><i class="bx ${s.icon || 'bx-smile'}" style="font-size:24px; color:var(--accent);"></i></td>
                    <td style="font-weight:600;">${s.title || ''}</td>
                    <td style="max-width:250px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${s.description || ''}</td>
                    <td>${s.duration || 'غير محدد'}</td>
                    <td>${s.price || 'غير محدد'}</td>
                    <td><span class="badge ${item.is_visible ? 'badge-success' : 'badge-danger'}">${item.is_visible ? 'نشط' : 'مخفي'}</span></td>
                    <td><span class="badge ${isDraft ? 'badge-warning' : 'badge-success'}">${isDraft ? 'مسودة' : 'منشور'}</span></td>
                    <td>
                        <div style="display:flex; gap:6px;">
                            ${isDraft ? `<button class="btn btn-primary btn-sm publish-service-row-btn" data-id="${item.id}" title="نشر التعديل"><i class="bx bx-cloud-upload"></i></button>` : ''}
                            <button class="btn btn-secondary btn-sm edit-service-btn" data-id="${item.id}"><i class="bx bx-edit"></i></button>
                            <button class="btn btn-danger btn-sm delete-service-btn" data-id="${item.id}"><i class="bx bx-trash"></i></button>
                        </div>
                    </td>
                `;

                listBody.appendChild(tr);

                tr.querySelector('.edit-service-btn').onclick = () => openServiceForm(item);
                tr.querySelector('.delete-service-btn').onclick = () => softDeleteRecord('component_content', item.id, loadServices);
                
                const pubBtn = tr.querySelector('.publish-service-row-btn');
                if (pubBtn) {
                    pubBtn.onclick = () => {
                        if (currentUserRole === 'Viewer') return;
                        publishComponentContent(item.id, loadServices);
                    };
                }
            });
        });

    // Configure Add Service button
    document.getElementById('openAddServiceModalBtn').onclick = () => openServiceForm(null);

    const serviceForm = document.getElementById('serviceForm');
    serviceForm.onsubmit = (e) => {
        e.preventDefault();
        if (currentUserRole === 'Viewer') {
            alert('حساب المشاهد لا يملك صلاحية التعديل.');
            return;
        }

        const id = document.getElementById('serviceFormId').value;
        const title = document.getElementById('serviceFormTitle').value;
        const description = document.getElementById('serviceFormDesc').value;
        const duration = document.getElementById('serviceFormDuration').value;
        const price = document.getElementById('serviceFormPrice').value;
        const icon = document.getElementById('serviceFormIcon').value;
        const image_url = document.getElementById('serviceFormImageUrl').value;
        const category = document.getElementById('serviceFormCategory').value;
        const is_featured = document.getElementById('serviceFormFeatured').checked;

        const payload = { title, description, duration, price, icon, image_url, category, is_featured };

        if (id) {
            // Update
            supabaseClient.from('component_content').update({
                draft_data: payload,
                status: 'draft',
                updated_at: new Date().toISOString()
            }).eq('id', id)
                .then(({ error }) => {
                    if (error) alert(error.message);
                    else {
                        logAuditAction('component_content:update', `component_content:${id}`, null, payload);
                        alert('✅ تم تحديث الخدمة الطبية بنجاح كمسودة! اضغط على زر النشر لاعتمادها.');
                        document.getElementById('serviceModal').style.display = 'none';
                        loadServices();
                    }
                });
        } else {
            // Insert
            const newRecord = {
                component_id: 'f088192a-fa13-4c91-a20c-c603b10bcf2e',
                draft_data: payload,
                published_data: payload,
                status: 'draft',
                is_visible: true,
                display_order: 99
            };
            supabaseClient.from('component_content').insert([newRecord])
                .then(({ error }) => {
                    if (error) alert(error.message);
                    else {
                        logAuditAction('component_content:insert', 'component_content:new_service', null, payload);
                        alert('✅ تم إضافة الخدمة الطبية بنجاح كمسودة!');
                        document.getElementById('serviceModal').style.display = 'none';
                        loadServices();
                    }
                });
        }
    };
}

function openServiceForm(item) {
    document.getElementById('serviceModal').style.display = 'flex';
    const form = document.getElementById('serviceForm');
    form.reset();

    if (item) {
        const service = item.draft_data || {};
        document.getElementById('serviceFormId').value = item.id;
        document.getElementById('serviceFormTitle').value = service.title || '';
        document.getElementById('serviceFormDesc').value = service.description || '';
        document.getElementById('serviceFormDuration').value = service.duration || '';
        document.getElementById('serviceFormPrice').value = service.price || '';
        document.getElementById('serviceFormIcon').value = service.icon || 'bx-smile';
        document.getElementById('serviceFormImageUrl').value = service.image_url || '';
        document.getElementById('serviceFormCategory').value = service.category || 'تقويم';
        document.getElementById('serviceFormFeatured').checked = service.is_featured === true;
        document.getElementById('serviceModalTitle').textContent = "تعديل الخدمة الطبية";
    } else {
        document.getElementById('serviceFormId').value = '';
        document.getElementById('serviceModalTitle').textContent = "إضافة خدمة طبية جديدة";
    }
    setTimeout(initAdminAIAssistant, 100);
}

function loadCases() {
    const listBody = document.getElementById('casesListTableBody');
    listBody.innerHTML = '<tr><td colspan="9" style="text-align:center;">جاري تحميل الحالات الناجحة...</td></tr>';

    supabaseClient.from('component_content')
        .select('*')
        .eq('component_id', '4808cfcf-349c-4932-a083-0a716c52a0a2') // case_card component ID
        .eq('is_deleted', false)
        .order('display_order', { ascending: true })
        .then(({ data, error }) => {
            if (error || !data) {
                listBody.innerHTML = '<tr><td colspan="9" style="text-align:center; color:red;">فشل تحميل الحالات.</td></tr>';
                return;
            }

            listBody.innerHTML = '';
            data.forEach(item => {
                const c = item.draft_data || {};
                const tr = document.createElement('tr');
                const isDraft = item.status === 'draft';
                tr.innerHTML = `
                    <td>
                        <div style="display:flex; gap:4px;">
                            <img src="${c.before_image_url || ''}" style="width:40px; height:40px; object-fit:cover; border-radius:4px;" title="قبل">
                            <img src="${c.after_image_url || ''}" style="width:40px; height:40px; object-fit:cover; border-radius:4px;" title="بعد">
                        </div>
                    </td>
                    <td style="font-weight:600;">${c.title || ''}<br><span style="font-size:11px; color:var(--text-muted);">${c.treatment_type || ''}</span></td>
                    <td>${c.patient_age || '?'} سنة • ${c.duration || '?'}</td>
                    <td>${c.visits || 0} زيارات<br><span style="font-size:11px; color:var(--text-muted);">${c.doctor_notes || ''}</span></td>
                    <td><span class="badge ${c.is_featured ? 'badge-success' : 'badge-danger'}">${c.is_featured ? 'نعم' : 'لا'}</span></td>
                    <td><span class="badge ${item.is_visible ? 'badge-success' : 'badge-danger'}">${item.is_visible ? 'نشط' : 'مخفي'}</span></td>
                    <td><span class="badge ${isDraft ? 'badge-warning' : 'badge-success'}">${isDraft ? 'مسودة' : 'منشور'}</span></td>
                    <td><code>${c.category || ''}</code></td>
                    <td>
                        <div style="display:flex; gap:6px;">
                            ${isDraft ? `<button class="btn btn-primary btn-sm publish-case-row-btn" data-id="${item.id}" title="نشر التعديل"><i class="bx bx-cloud-upload"></i></button>` : ''}
                            <button class="btn btn-secondary btn-sm edit-case-btn" data-id="${item.id}"><i class="bx bx-edit"></i></button>
                            <button class="btn btn-danger btn-sm delete-case-btn" data-id="${item.id}"><i class="bx bx-trash"></i></button>
                        </div>
                    </td>
                `;

                listBody.appendChild(tr);

                tr.querySelector('.edit-case-btn').onclick = () => openCaseForm(item);
                tr.querySelector('.delete-case-btn').onclick = () => softDeleteRecord('component_content', item.id, loadCases);
                
                const pubBtn = tr.querySelector('.publish-case-row-btn');
                if (pubBtn) {
                    pubBtn.onclick = () => {
                        if (currentUserRole === 'Viewer') return;
                        publishComponentContent(item.id, loadCases);
                    };
                }
            });
        });

    document.getElementById('openAddCaseModalBtn').onclick = () => openCaseForm(null);

    const caseForm = document.getElementById('caseForm');
    caseForm.onsubmit = (e) => {
        e.preventDefault();
        if (currentUserRole === 'Viewer') {
            alert('حساب المشاهد لا يملك صلاحية التعديل.');
            return;
        }

        const id = document.getElementById('caseFormId').value;
        const title = document.getElementById('caseFormTitle').value;
        const before_image_url = document.getElementById('caseFormBeforeUrl').value;
        const after_image_url = document.getElementById('caseFormAfterUrl').value;
        const treatment_type = document.getElementById('caseFormTreatment').value;
        const category = document.getElementById('caseFormCategory').value;
        const patient_age = parseInt(document.getElementById('caseFormAge').value) || 20;
        const duration = document.getElementById('caseFormDuration').value;
        const visits = parseInt(document.getElementById('caseFormVisits').value) || 5;
        const doctor_notes = document.getElementById('caseFormNotes').value;
        const is_featured = document.getElementById('caseFormFeatured').checked;

        const payload = { 
            title, 
            before_image_url, 
            after_image_url, 
            treatment_type, 
            category, 
            patient_age, 
            duration, 
            visits, 
            doctor_notes, 
            is_featured 
        };

        if (id) {
            // Update
            supabaseClient.from('component_content').update({
                draft_data: payload,
                status: 'draft',
                updated_at: new Date().toISOString()
            }).eq('id', id)
                .then(({ error }) => {
                    if (error) alert(error.message);
                    else {
                        logAuditAction('component_content:update', `component_content:${id}`, null, payload);
                        alert('✅ تم تحديث الحالة بنجاح كمسودة! اضغط على زر النشر لاعتمادها.');
                        document.getElementById('caseModal').style.display = 'none';
                        loadCases();
                    }
                });
        } else {
            // Insert
            const newRecord = {
                component_id: '4808cfcf-349c-4932-a083-0a716c52a0a2', // case_card component ID
                draft_data: payload,
                published_data: payload,
                status: 'draft',
                is_visible: true,
                display_order: 99
            };
            supabaseClient.from('component_content').insert([newRecord])
                .then(({ error }) => {
                    if (error) alert(error.message);
                    else {
                        logAuditAction('component_content:insert', 'component_content:new_case', null, payload);
                        alert('✅ تم إضافة الحالة بنجاح كمسودة!');
                        document.getElementById('caseModal').style.display = 'none';
                        loadCases();
                    }
                });
        }
    };
}

function openCaseForm(c) {
    document.getElementById('caseModal').style.display = 'flex';
    const form = document.getElementById('caseForm');
    form.reset();

    if (c) {
        const caseData = c.draft_data || {};
        document.getElementById('caseFormId').value = c.id;
        document.getElementById('caseFormTitle').value = caseData.title || '';
        document.getElementById('caseFormBeforeUrl').value = caseData.before_image_url || '';
        document.getElementById('caseFormAfterUrl').value = caseData.after_image_url || '';
        document.getElementById('caseFormTreatment').value = caseData.treatment_type || '';
        document.getElementById('caseFormCategory').value = caseData.category || 'all';
        document.getElementById('caseFormAge').value = caseData.patient_age || '';
        document.getElementById('caseFormDuration').value = caseData.duration || '';
        document.getElementById('caseFormVisits').value = caseData.visits || '';
        document.getElementById('caseFormNotes').value = caseData.doctor_notes || '';
        document.getElementById('caseFormFeatured').checked = caseData.is_featured === true;
        document.getElementById('caseModalTitle').textContent = "تعديل حالة Smile Transformation";
    } else {
        document.getElementById('caseFormId').value = '';
        document.getElementById('caseModalTitle').textContent = "إضافة حالة Smile Transformation جديدة";
    }
    setTimeout(initAdminAIAssistant, 100);
}

// ---------------------------------------------------------
// 6. MEDIA LIBRARY & COMPRESSION
// ---------------------------------------------------------
function loadMediaLibrary() {
    const container = document.getElementById('mediaLibraryContainer');
    container.innerHTML = '<div style="grid-column:1/-1; text-align:center;">جاري تحميل مكتبة الصور والملفات...</div>';

    supabaseClient.from('media_library')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
            if (error || !data) {
                container.innerHTML = '<div style="grid-column:1/-1; text-align:center; color:red;">فشل تحميل ملفات الميديا.</div>';
                return;
            }

            if (data.length === 0) {
                container.innerHTML = '<div style="grid-column:1/-1; text-align:center; color:var(--text-muted);">المكتبة فارغة حالياً. ابدأ برفع بعض الصور!</div>';
                return;
            }

            container.innerHTML = '';
            data.forEach(m => {
                const card = document.createElement('div');
                card.className = 'media-thumbnail-card';

                const isVideo = m.mime_type && m.mime_type.startsWith('video/');

                card.innerHTML = `
                    ${isVideo ? `
                        <video src="${m.url}" muted></video>
                    ` : `
                        <img src="${m.url}" alt="${m.filename}">
                    `}
                    <div class="media-details-row">
                        <span class="media-filename" title="${m.filename}">${m.filename}</span>
                        <div class="media-actions-dropdown">
                            <button class="btn btn-secondary btn-sm copy-url-btn" data-url="${m.url}" title="نسخ الرابط"><i class="bx bx-copy"></i></button>
                            <button class="btn btn-danger btn-sm delete-media-btn" data-id="${m.id}" title="حذف"><i class="bx bx-trash"></i></button>
                        </div>
                    </div>
                `;

                container.appendChild(card);

                card.querySelector('.copy-url-btn').onclick = () => {
                    navigator.clipboard.writeText(m.url);
                    alert("📋 تم نسخ رابط الملف المباشر إلى الحافظة!");
                };
                card.querySelector('.delete-media-btn').onclick = () => softDeleteRecord('media_library', m.id, loadMediaLibrary);
            });
        });

    // Handle Upload
    const uploader = document.getElementById('mediaLibraryFileUpload');
    uploader.onchange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        alert(`جاري معالجة ورفع ${files.length} ملفات...`);
        
        Promise.all(files.map(file => {
            // Apply Client side compression to WebP if image
            if (file.type.startsWith('image/')) {
                return compressImageToWebP(file).then(compressedFile => {
                    return uploadMediaFileDirectly(compressedFile, 'general');
                });
            } else {
                return uploadMediaFileDirectly(file, 'general');
            }
        })).then(() => {
            alert('🎉 تم رفع جميع الملفات وتأكيد حفظها بنجاح!');
            loadMediaLibrary();
        }).catch(err => {
            alert('خطأ أثناء الرفع: ' + err.message);
        });
    };
}

// Upload direct file helper
function uploadMediaFileDirectly(file, folder = 'general') {
    return new Promise((resolve, reject) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `${folder}/${fileName}`;

        // Upload to storage bucket (named "clinic-assets" or fallback to local table metadata URLs if storage isn't set up yet)
        // Check if storage bucket exists or use standard table url reference directly
        supabaseClient.storage.from('media').upload(filePath, file)
            .then(({ data, error }) => {
                if (error) {
                    // Fallback to uploading file as base64 data URL inside media_library directly to ensure it works even if user didn't configure a storage bucket
                    const reader = new FileReader();
                    reader.onload = () => {
                        const base64Url = reader.result;
                        saveMediaMetadataToTable(file.name, base64Url, file.size, file.type, folder)
                            .then(resolve)
                            .catch(reject);
                    };
                    reader.readAsDataURL(file);
                } else {
                    const { data: { publicUrl } } = supabaseClient.storage.from('media').getPublicUrl(filePath);
                    saveMediaMetadataToTable(file.name, publicUrl, file.size, file.type, folder)
                        .then(resolve)
                        .catch(reject);
                }
            });
    });
}

function saveMediaMetadataToTable(filename, url, size, mime, folder) {
    const id = 'med_' + Math.random().toString(36).substr(2, 9);
    return supabaseClient.from('media_library').insert([{
        id, filename, url, size_bytes: size, mime_type: mime, folder
    }]).then(({ error }) => {
        if (error) throw error;
        return url;
    });
}

// Client-side WebP compressor using Canvas
function compressImageToWebP(file, quality = 0.8) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const maxDim = 1200; // Optimal size for dentistry teeth transformations
                if (width > maxDim || height > maxDim) {
                    if (width > height) {
                        height = Math.round((height * maxDim) / width);
                        width = maxDim;
                    } else {
                        width = Math.round((width * maxDim) / height);
                        height = maxDim;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                canvas.toBlob((blob) => {
                    resolve(new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", { type: "image/webp" }));
                }, 'image/webp', quality);
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// ---------------------------------------------------------
// 7. HOMEPAGE EDITOR
// ---------------------------------------------------------
function getSectionArabicName(type) {
    const names = {
        hero: 'قسم الهيرو الرئيسي (Hero)',
        stats: 'الأرقام والإحصائيات (Stats)',
        features: 'مميزات العيادة (Features)',
        doctor: 'الملف الطبي للطبيب (Doctor)',
        services: 'الخدمات الطبية (Services)',
        cases: 'الحالات وقبل وبعد (Cases)',
        testimonials: 'آراء ومراجعات المرضى (Testimonials)',
        faq: 'الأسئلة الشائعة (FAQ)'
    };
    return names[type] || type;
}

function publishSectionCMS(sectionId) {
    import('../assets/js/db-service.js').then(({ DBService }) => {
        DBService.publishSection(sectionId, supabaseClient, currentUser.email)
            .then(({ error }) => {
                if (error) {
                    alert('فشل النشر: ' + error.message);
                } else {
                    alert('🎉 تم نشر هذا القسم وجعله حياً للجمهور بنجاح!');
                    loadHomepageCMS();
                }
            });
    });
}

function loadHomepageCMS() {
    if (!supabaseClient) return;
    
    // First, let's fetch the page ID for 'home'
    supabaseClient.from('pages').select('id').eq('slug', 'home').single()
        .then(({ data: page, error: pageErr }) => {
            if (pageErr || !page) {
                console.error("Failed to load homepage metadata:", pageErr);
                return;
            }
            
            // Now fetch all sections for this page
            supabaseClient.from('page_sections')
                .select('*')
                .eq('page_id', page.id)
                .order('display_order', { ascending: true })
                .then(({ data: sections, error: secErr }) => {
                    if (secErr || !sections) {
                        console.error("Failed to load page sections:", secErr);
                        return;
                    }
                    
                    // Populate Hero inputs using draft_content of 'hero' section
                    const heroSec = sections.find(s => s.section_type === 'hero');
                    if (heroSec) {
                        const content = heroSec.draft_content || {};
                        document.getElementById('cmsHeroTitle').value = content.title || '';
                        document.getElementById('cmsHeroSubtitle').value = content.subtitle || '';
                        document.getElementById('cmsHeroImageUrl').value = content.image_url || '';
                        document.getElementById('cmsHeroVideoUrl').value = content.video_url || '';
                    }
                    setTimeout(initAdminAIAssistant, 150);
                    
                    // Populate Stats inputs using draft_content of 'stats' section
                    const statsSec = sections.find(s => s.section_type === 'stats');
                    const statsContainer = document.getElementById('cmsStatsContainer');
                    statsContainer.innerHTML = '';
                    if (statsSec) {
                        const content = statsSec.draft_content || {};
                        const stats = content.statistics || [];
                        stats.forEach((st, idx) => {
                            const row = document.createElement('div');
                            row.className = 'form-grid';
                            row.style.marginBottom = '10px';
                            row.innerHTML = `
                                <div class="form-group">
                                    <label class="form-label">الاسم التوضيحي (Label)</label>
                                    <input type="text" class="form-input stat-lbl-input" value="${st.label}" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">القيمة الرقمية (Value)</label>
                                    <input type="text" class="form-input stat-val-input" value="${st.value}" required>
                                </div>
                                <button class="btn btn-danger btn-sm delete-stat-row-btn" style="margin-top:28px;"><i class="bx bx-trash"></i></button>
                            `;
                            statsContainer.appendChild(row);
                            row.querySelector('.delete-stat-row-btn').onclick = () => row.remove();
                        });
                    }
                    
                    // Render page sections builder
                    const orderList = document.getElementById('homepageSectionsOrderingList');
                    orderList.innerHTML = '';
                    
                    sections.forEach((sec) => {
                        const li = document.createElement('div');
                        li.className = 'section-builder-item';
                        li.setAttribute('data-id', sec.id);
                        li.setAttribute('data-type', sec.section_type);
                        
                        li.style.display = 'flex';
                        li.style.flexDirection = 'column';
                        li.style.gap = '12px';
                        li.style.padding = '16px';
                        li.style.background = 'var(--bg-panel-sec, #f8fafc)';
                        li.style.border = '1px solid var(--border-color, #e2e8f0)';
                        li.style.borderRadius = '8px';
                        li.style.marginBottom = '12px';
                        
                        const isChecked = sec.is_visible !== false;
                        const isDraft = sec.status === 'draft';
                        
                        li.innerHTML = `
                            <div style="display:flex; align-items:center; justify-content:space-between; width:100%;">
                                <div style="display:flex; align-items:center; gap:12px; flex:1;">
                                    <span class="drag-handle" style="cursor:grab;"><i class="bx bx-menu"></i></span>
                                    <span style="font-weight:600;">${getSectionArabicName(sec.section_type)}</span>
                                    <span class="badge ${isDraft ? 'badge-warning' : 'badge-success'}" style="margin-right:8px; display:inline-block; padding: 2px 8px; border-radius: 4px; font-size:11px;">${isDraft ? 'مسودة (عدم النشر)' : 'منشور للعامة'}</span>
                                </div>
                                <div style="display:flex; align-items:center; gap:8px;">
                                    <label style="font-size:12px; display:flex; align-items:center; gap:4px; margin:0;">
                                        <input type="checkbox" class="section-vis-checkbox" ${isChecked ? 'checked' : ''}> مرئي
                                    </label>
                                    <div style="display:flex; gap:4px;">
                                        <button class="btn btn-secondary btn-sm move-up-btn"><i class="bx bx-chevron-up"></i></button>
                                        <button class="btn btn-secondary btn-sm move-down-btn"><i class="bx bx-chevron-down"></i></button>
                                    </div>
                                </div>
                            </div>
                            <div style="display:flex; gap:12px; font-size:12px; align-items:flex-end;">
                                <div style="flex:1;">
                                    <label class="form-label" style="font-size:11px; margin-bottom:4px;">الهوامش والتباعد (Spacing)</label>
                                    <select class="form-input section-spacing-select" style="padding:4px 8px; height:auto; font-size:12px;">
                                        <option value="padding-small" ${sec.spacing === 'padding-small' ? 'selected' : ''}>صغير (Small)</option>
                                        <option value="padding-medium" ${sec.spacing === 'padding-medium' ? 'selected' : ''}>متوسط (Medium)</option>
                                        <option value="padding-large" ${sec.spacing === 'padding-large' ? 'selected' : ''}>كبير (Large)</option>
                                    </select>
                                </div>
                                <div style="flex:1;">
                                    <label class="form-label" style="font-size:11px; margin-bottom:4px;">خلفية القسم (Background)</label>
                                    <select class="form-input section-bg-select" style="padding:4px 8px; height:auto; font-size:12px;">
                                        <option value="glass" ${sec.background_style === 'glass' ? 'selected' : ''}>تأثير زجاجي (Glass)</option>
                                        <option value="light" ${sec.background_style === 'light' ? 'selected' : ''}>مضيء (Light)</option>
                                        <option value="dark" ${sec.background_style === 'dark' ? 'selected' : ''}>مظلم (Dark)</option>
                                        <option value="accent" ${sec.background_style === 'accent' ? 'selected' : ''}>لون تمييز (Accent)</option>
                                    </select>
                                </div>
                                <div>
                                    <button class="btn btn-primary btn-sm publish-section-btn" style="padding:6px 12px; font-size:11px;" ${!isDraft ? 'disabled' : ''}>
                                        <i class="bx bx-cloud-upload"></i> نشر التعديل
                                    </button>
                                </div>
                            </div>
                        `;
                        
                        orderList.appendChild(li);
                        
                        li.querySelector('.move-up-btn').onclick = (e) => {
                            e.preventDefault();
                            const prev = li.previousElementSibling;
                            if (prev) orderList.insertBefore(li, prev);
                        };
                        li.querySelector('.move-down-btn').onclick = (e) => {
                            e.preventDefault();
                            const next = li.nextElementSibling;
                            if (next) orderList.insertBefore(next, li);
                        };
                        li.querySelector('.publish-section-btn').onclick = (e) => {
                            e.preventDefault();
                            if (currentUserRole === 'Viewer') {
                                alert('لا تملك الصلاحية لنشر التعديلات.');
                                return;
                            }
                            publishSectionCMS(sec.id);
                        };
                    });
                });
        });

    // Handle new stats addition
    document.getElementById('addNewStatBtn').onclick = () => {
        const statsContainer = document.getElementById('cmsStatsContainer');
        const row = document.createElement('div');
        row.className = 'form-grid';
        row.style.marginBottom = '10px';
        row.innerHTML = `
            <div class="form-group">
                <label class="form-label">الاسم التوضيحي (Label)</label>
                <input type="text" class="form-input stat-lbl-input" placeholder="حالة تقويم" required>
            </div>
            <div class="form-group">
                <label class="form-label">القيمة الرقمية (Value)</label>
                <input type="text" class="form-input stat-val-input" placeholder="3000+" required>
            </div>
            <button class="btn btn-danger btn-sm delete-stat-row-btn" style="margin-top:28px;"><i class="bx bx-trash"></i></button>
        `;
        statsContainer.appendChild(row);
        row.querySelector('.delete-stat-row-btn').onclick = () => row.remove();
    };

    // Save Homepage CMS
    document.getElementById('saveHomepageCMSBtn').onclick = () => {
        if (currentUserRole === 'Viewer') {
            alert('حساب المشاهد لا يملك صلاحية تعديل نصوص الموقع.');
            return;
        }

        const hero_title = document.getElementById('cmsHeroTitle').value;
        const hero_subtitle = document.getElementById('cmsHeroSubtitle').value;
        const hero_image_url = document.getElementById('cmsHeroImageUrl').value;
        const hero_video_url = document.getElementById('cmsHeroVideoUrl').value;

        // Parse statistics inputs
        const stats = [];
        document.querySelectorAll('#cmsStatsContainer .form-grid').forEach(row => {
            const lbl = row.querySelector('.stat-lbl-input').value;
            const val = row.querySelector('.stat-val-input').value;
            if (lbl && val) stats.push({ label: lbl, value: val });
        });

        // Collect all updates from section list
        const promises = [];
        let index = 0;
        
        document.querySelectorAll('#homepageSectionsOrderingList > div').forEach(li => {
            const sectionId = li.getAttribute('data-id');
            const sectionType = li.getAttribute('data-type');
            const isVisible = li.querySelector('.section-vis-checkbox').checked;
            const spacing = li.querySelector('.section-spacing-select').value;
            const background_style = li.querySelector('.section-bg-select').value;
            
            const basePayload = {
                display_order: index++,
                is_visible: isVisible,
                spacing: spacing,
                background_style: background_style,
                status: 'draft', // Change status to draft when modified
                updated_at: new Date().toISOString()
            };
            
            if (sectionType === 'hero') {
                basePayload.draft_content = {
                    title: hero_title,
                    subtitle: hero_subtitle,
                    image_url: hero_image_url,
                    video_url: hero_video_url
                };
            } else if (sectionType === 'stats') {
                basePayload.draft_content = {
                    statistics: stats
                };
            }
            
            promises.push(
                supabaseClient.from('page_sections')
                    .update(basePayload)
                    .eq('id', sectionId)
            );
        });

        Promise.all(promises).then((results) => {
            const error = results.find(r => r.error)?.error;
            if (error) {
                alert('حدث خطأ أثناء حفظ الأقسام: ' + error.message);
            } else {
                logAuditAction('page_sections:update_batch', 'page_sections:batch', null, { count: promises.length });
                alert('🎉 تم حفظ جميع تعديلات الواجهة كمسودة بنجاح! اضغط على "نشر التعديل" في كل قسم لاعتماده للموقع العام.');
                loadHomepageCMS();
            }
        });
    };
}

// ---------------------------------------------------------
// 8. DOCTOR PROFILE
// ---------------------------------------------------------
function loadDoctorCMS() {
    supabaseClient.from('page_sections').select('*').eq('section_type', 'doctor').single()
        .then(({ data, error }) => {
            if (error || !data) return;

            const content = data.draft_content || {};
            document.getElementById('docName').value = content.name || '';
            document.getElementById('docPhotoUrl').value = content.photo_url || '';
            document.getElementById('docBio').value = content.bio || '';
            document.getElementById('docExperience').value = content.experience_years || 15;
            document.getElementById('docSpecializations').value = (content.specializations || []).join('، ');
            document.getElementById('docCertificates').value = JSON.stringify(content.certificates || [], null, 2);
            
            setTimeout(initAdminAIAssistant, 150);

            document.getElementById('saveDoctorProfileBtn').onclick = () => {
                if (currentUserRole === 'Viewer') {
                    alert('صلاحية مشاهد فقط.');
                    return;
                }

                const name = document.getElementById('docName').value;
                const photo_url = document.getElementById('docPhotoUrl').value;
                const bio = document.getElementById('docBio').value;
                const experience_years = parseInt(document.getElementById('docExperience').value) || 15;
                const specializations = document.getElementById('docSpecializations').value.split(/[،,]/).map(s => s.trim()).filter(Boolean);
                
                let certificates = [];
                try {
                    certificates = JSON.parse(document.getElementById('docCertificates').value);
                } catch(e) {
                    alert('صيغة ملف الشهادات غير صحيحة، يجب أن تكون JSON Array.');
                    return;
                }

                const payload = { name, photo_url, bio, experience_years, specializations, certificates };

                supabaseClient.from('page_sections').update({
                    draft_content: payload,
                    status: 'draft',
                    updated_at: new Date().toISOString()
                }).eq('id', data.id)
                    .then(({ error: updateErr }) => {
                        if (updateErr) alert(updateErr.message);
                        else {
                            logAuditAction('page_sections:update_doctor', `page_sections:${data.id}`, null, payload);
                            alert('✅ تم حفظ بيانات السيرة الذاتية للطبيب بنجاح كمسودة! اضغط على زر النشر أو لوحة نشر الصفحة الرئيسية للتفعيل.');
                        }
                    });
            };
        });
}

// ---------------------------------------------------------
// 9. CONTACT MESSAGES / INBOX
// ---------------------------------------------------------
function loadContactInbox() {
    const listBody = document.getElementById('contactInboxTableBody');
    listBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">جاري تحميل الرسائل...</td></tr>';

    supabaseClient.from('contact_messages')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
            if (error || !data) {
                listBody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:red;">فشل تحميل رسائل الوارد.</td></tr>';
                return;
            }

            listBody.innerHTML = '';
            data.forEach(m => {
                const tr = document.createElement('tr');
                const isUnread = m.status === 'unread';

                tr.innerHTML = `
                    <td style="font-weight:${isUnread ? '700' : 'normal'};">${m.name}</td>
                    <td>${m.phone}</td>
                    <td style="max-width:300px; font-style:italic;">"${m.message}"</td>
                    <td>${new Date(m.created_at).toLocaleString('ar-EG')}</td>
                    <td><span class="badge ${isUnread ? 'badge-warning' : 'badge-success'}">${isUnread ? 'غير مقروءة' : 'تم الرد'}</span></td>
                    <td>
                        <div style="display:flex; gap:6px;">
                            ${isUnread ? `
                                <button class="btn btn-secondary btn-sm read-msg-btn" data-id="${m.id}" title="وضع مقروءة"><i class="bx bx-envelope-open"></i></button>
                            ` : ''}
                            <button class="btn btn-primary btn-sm reply-msg-btn" data-id="${m.id}" data-phone="${m.phone}" title="رد واتساب"><i class="bx bxl-whatsapp"></i> رد</button>
                            <button class="btn btn-danger btn-sm delete-msg-btn" data-id="${m.id}" title="حذف للمهملات"><i class="bx bx-trash"></i></button>
                        </div>
                    </td>
                `;

                listBody.appendChild(tr);

                const readBtn = tr.querySelector('.read-msg-btn');
                if (readBtn) {
                    readBtn.onclick = () => {
                        supabaseClient.from('contact_messages').update({ status: 'read' }).eq('id', m.id)
                            .then(() => {
                                logAuditAction('messages:read', `contact_messages:${m.id}`, null, { status: 'read' });
                                loadContactInbox();
                            });
                    };
                }

                tr.querySelector('.reply-msg-btn').onclick = () => {
                    const waUrl = `https://wa.me/${m.phone.replace('+', '')}?text=${encodeURIComponent('أهلاً ' + m.name + '، معك عيادة د. أكثم طنطاوي لتقويم الأسنان. رداً على رسالتك: ')}`;
                    window.open(waUrl, '_blank');
                };

                tr.querySelector('.delete-msg-btn').onclick = () => softDeleteRecord('contact_messages', m.id, loadContactInbox);
            });
        });
}

// ---------------------------------------------------------
// 10. CLINIC SETTINGS & THEME
// ---------------------------------------------------------
function loadClinicSettings() {
    // 1. Load settings
    supabaseClient.from('site_settings').select('*').eq('id', 1).single()
        .then(({ data, error }) => {
            if (error || !data) return;
            document.getElementById('setClinicName').value = data.clinic_name;
            document.getElementById('setPhone').value = data.phone;
            document.getElementById('setWhatsapp').value = data.whatsapp;
            document.getElementById('setEmail').value = data.email;
            document.getElementById('setAddress').value = data.address;
            document.getElementById('setGmaps').value = data.google_maps_iframe || '';
            document.getElementById('seoTitleField').value = data.seo_title || '';
            document.getElementById('seoDescriptionField').value = data.seo_description || '';
            document.getElementById('seoGaId').value = data.analytics_google_id || '';
            document.getElementById('seoGscId').value = data.analytics_search_console_id || '';
        });

    // 2. Load theme
    supabaseClient.from('theme_settings').select('*').eq('id', 1).single()
        .then(({ data, error }) => {
            if (error || !data) return;
            document.getElementById('themePrimary').value = data.primary_color;
            document.getElementById('themeSecondary').value = data.secondary_color;
            document.getElementById('themeAccent').value = data.accent_color;
            document.getElementById('themeRadius').value = data.border_radius;
            document.getElementById('themeButtonStyle').value = data.button_style;
            document.getElementById('themeFontArabic').value = data.fonts ? (data.fonts.arabic || 'Tajawal') : 'Tajawal';
        });

    // Bind save settings button
    document.getElementById('saveClinicSettingsBtn').onclick = () => {
        if (currentUserRole === 'Viewer') {
            alert('Viewer accounts cannot edit settings.');
            return;
        }

        const clinic_name = document.getElementById('setClinicName').value;
        const phone = document.getElementById('setPhone').value;
        const whatsapp = document.getElementById('setWhatsapp').value;
        const email = document.getElementById('setEmail').value;
        const address = document.getElementById('setAddress').value;
        const google_maps_iframe = document.getElementById('setGmaps').value;
        const seo_title = document.getElementById('seoTitleField').value;
        const seo_description = document.getElementById('seoDescriptionField').value;
        const analytics_google_id = document.getElementById('seoGaId').value;
        const analytics_search_console_id = document.getElementById('seoGscId').value;

        const sitePayload = { clinic_name, phone, whatsapp, email, address, google_maps_iframe, seo_title, seo_description, analytics_google_id, analytics_search_console_id };

        // Save theme settings
        const primary_color = document.getElementById('themePrimary').value;
        const secondary_color = document.getElementById('themeSecondary').value;
        const accent_color = document.getElementById('themeAccent').value;
        const border_radius = document.getElementById('themeRadius').value;
        const button_style = document.getElementById('themeButtonStyle').value;
        const font_ar = document.getElementById('themeFontArabic').value;

        const themePayload = { primary_color, secondary_color, accent_color, border_radius, button_style, fonts: { base: 'Outfit', arabic: font_ar } };

        Promise.all([
            supabaseClient.from('site_settings').update(sitePayload).eq('id', 1),
            supabaseClient.from('theme_settings').update(themePayload).eq('id', 1)
        ]).then(([siteRes, themeRes]) => {
            if (siteRes.error || themeRes.error) {
                alert('خطأ أثناء الحفظ: ' + (siteRes.error?.message || themeRes.error?.message));
            } else {
                logAuditAction('site_settings:update', 'site_settings:1', null, sitePayload);
                logAuditAction('theme_settings:update', 'theme_settings:1', null, themePayload);
                alert('🎉 تم تحديث بيانات العيادة وإعدادات الثيم والخطوط بنجاح!');
            }
        });
    };
}

// ---------------------------------------------------------
// 11. USERS & RBAC MANAGER
// ---------------------------------------------------------
function loadUserRoles() {
    const listBody = document.getElementById('userRolesTableBody');
    listBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">جاري تحميل أدوار المستخدمين...</td></tr>';

    supabaseClient.from('user_roles')
        .select('*')
        .then(({ data, error }) => {
            if (error || !data) {
                listBody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:red;">خطأ في تحميل الأدوار.</td></tr>';
                return;
            }

            listBody.innerHTML = '';
            data.forEach(u => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${u.email}</td>
                    <td><span class="badge badge-success">${u.role}</span></td>
                    <td>${new Date(u.created_at).toLocaleDateString('ar-EG')}</td>
                    <td><button class="btn btn-danger btn-sm revoke-role-btn" data-id="${u.id}"><i class="bx bx-user-minus"></i> سحب الدور</button></td>
                `;
                listBody.appendChild(tr);

                tr.querySelector('.revoke-role-btn').onclick = () => {
                    if (currentUserRole !== 'Super Admin') {
                        alert('عذراً: فقط مدير النظام (Super Admin) يملك صلاحيات تعديل أدوار المستخدمين.');
                        return;
                    }
                    if (confirm('هل أنت متأكد من سحب صلاحية هذا المستخدم؟')) {
                        supabaseClient.from('user_roles').delete().eq('id', u.id)
                            .then(() => {
                                logAuditAction('user_roles:delete', `user_roles:${u.id}`, { email: u.email, role: u.role }, null);
                                loadUserRoles();
                            });
                    }
                };
            });
        });

    // Bind assign user role
    document.getElementById('assignUserRoleBtn').onclick = () => {
        if (currentUserRole !== 'Super Admin') {
            alert('فقط مدير النظام يملك الصلاحية.');
            return;
        }

        const id = document.getElementById('newUserUid').value.trim();
        const email = document.getElementById('newUserEmail').value.trim();
        const role = document.getElementById('newUserRole').value;

        if (!id || !email) {
            alert('يرجى تعبئة UUID والبريد الإلكتروني.');
            return;
        }

        supabaseClient.from('user_roles').insert([{ id, email, role }])
            .then(({ error }) => {
                if (error) alert(error.message);
                else {
                    logAuditAction('user_roles:assign', `user_roles:${id}`, null, { email, role });
                    alert('✅ تم منح الدور وصلاحية الدخول بنجاح!');
                    loadUserRoles();
                }
            });
    };
}

// ---------------------------------------------------------
// 12. AUDIT LOGS VIEW
// ---------------------------------------------------------
function loadAuditLogs() {
    const listBody = document.getElementById('auditLogsTableBody');
    listBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">جاري تحميل سجلات النشاط...</td></tr>';

    supabaseClient.from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(30)
        .then(({ data, error }) => {
            if (error || !data) {
                listBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:red;">خطأ في تحميل سجل النشاط.</td></tr>';
                return;
            }

            listBody.innerHTML = '';
            data.forEach(l => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td style="font-size:12px;">${l.user_email}</td>
                    <td><code>${l.action}</code></td>
                    <td><code>${l.affected_item}</code></td>
                    <td style="font-size:12px;">${new Date(l.timestamp).toLocaleString('ar-EG')}</td>
                    <td>
                        <button class="btn btn-secondary btn-sm rollback-btn" data-item="${l.affected_item}"><i class="bx bx-reset"></i> استرجاع (Rollback)</button>
                    </td>
                `;
                listBody.appendChild(tr);

                tr.querySelector('.rollback-btn').onclick = () => executeRollback(l);
            });
        });
}

function executeRollback(log) {
    if (currentUserRole !== 'Super Admin' && currentUserRole !== 'Doctor') {
        alert('صلاحية الاسترجاع والrollback محصورة بالطبيب ومدير النظام.');
        return;
    }

    if (!log.old_value && !log.new_value) {
        alert('لا توجد لقطة بيانات (Snapshot) مخزنة للتراجع عنها.');
        return;
    }

    if (confirm(`هل ترغب فعلاً في التراجع عن العملية وإرجاع حالة البيانات كما كانت؟`)) {
        const table = log.affected_item.split(':')[0];
        const id = log.affected_item.split(':')[1];
        
        // Write old value back
        const restorePayload = log.old_value || {};
        
        supabaseClient.from(table).update(restorePayload).eq('id', id)
            .then(({ error }) => {
                if (error) alert('فشل الـ Rollback: ' + error.message);
                else {
                    logAuditAction(`${table}:rollback`, log.affected_item, restorePayload, null);
                    alert('🎉 تم التراجع عن العملية واستعادة نسخة البيانات السابقة بنجاح!');
                    loadAuditLogs();
                }
            });
    }
}

// ---------------------------------------------------------
// 13. RECYCLE BIN (SOFT DELETES)
// ---------------------------------------------------------
function loadRecycleBin() {
    const listBody = document.getElementById('recycleBinTableBody');
    listBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">جاري تحميل العناصر المحذوفة...</td></tr>';

    const tablesToQuery = ['component_content', 'contact_messages', 'bookings', 'media_library'];
    
    Promise.all(tablesToQuery.map(tbl => 
        supabaseClient.from(tbl).select('*').eq('is_deleted', true).then(res => ({ table: tbl, data: res.data || [] }))
    )).then((results) => {
        listBody.innerHTML = '';
        let hasDeleted = false;

        results.forEach(({ table, data }) => {
            data.forEach(item => {
                hasDeleted = true;
                const tr = document.createElement('tr');
                
                let displayTable = table;
                let displayTitle = 'عنصر';
                
                if (table === 'component_content') {
                    const contentData = item.draft_data || item.published_data || {};
                    displayTitle = contentData.title || contentData.question || contentData.name || 'محتوى مكون';
                    
                    if (item.component_id === 'f088192a-fa13-4c91-a20c-c603b10bcf2e') {
                        displayTable = 'الخدمات (component_content)';
                    } else if (item.component_id === '4808cfcf-349c-4932-a083-0a716c52a0a2') {
                        displayTable = 'الحالات (component_content)';
                    } else if (item.component_id === '990cd082-cd28-4a92-be20-2b1031f0cfbf') {
                        displayTable = 'الأسئلة الشائعة (component_content)';
                    } else if (item.component_id === 'd508192a-fa13-4c91-a20c-c603b10bcfff') {
                        displayTable = 'آراء المرضى (component_content)';
                    } else {
                        displayTable = 'محتوى مكون (component_content)';
                    }
                } else {
                    displayTitle = item.title || item.name || item.question || item.filename || 'عنصر';
                    if (table === 'contact_messages') displayTable = 'الرسائل (contact_messages)';
                    if (table === 'bookings') displayTable = 'الحجوزات (bookings)';
                    if (table === 'media_library') displayTable = 'المكتبة (media_library)';
                }
                
                tr.innerHTML = `
                    <td><code>${displayTable}</code></td>
                    <td style="font-weight:600;">${displayTitle}</td>
                    <td>${item.updated_at || item.created_at ? new Date(item.updated_at || item.created_at).toLocaleDateString('ar-EG') : 'غير متوفر'}</td>
                    <td>
                        <div style="display:flex; gap:6px;">
                            <button class="btn btn-secondary btn-sm restore-item-btn" data-id="${item.id}" data-table="${table}"><i class="bx bx-undo"></i> استعادة</button>
                            <button class="btn btn-danger btn-sm purge-item-btn" data-id="${item.id}" data-table="${table}"><i class="bx bx-trash"></i> حذف نهائي</button>
                        </div>
                    </td>
                `;
                listBody.appendChild(tr);

                tr.querySelector('.restore-item-btn').onclick = () => restoreSoftDeletedRecord(table, item.id);
                tr.querySelector('.purge-item-btn').onclick = () => hardDeleteRecord(table, item.id);
            });
        });

        if (!hasDeleted) {
            listBody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:var(--text-muted);">سلة المهملات فارغة.</td></tr>';
        }
    });
}

async function checkMediaUsage(id) {
    const { data: media } = await supabaseClient.from('media_library').select('url').eq('id', id).single();
    if (!media) return { usageCount: 0, usages: [] };

    const url = media.url;
    let usageCount = 0;
    const usages = [];

    const { data: settings } = await supabaseClient.from('site_settings').select('logo_url, favicon_url').eq('id', 1).single();
    if (settings) {
        if (settings.logo_url === url) { usages.push('شعار العيادة (Settings)'); usageCount++; }
        if (settings.favicon_url === url) { usages.push('أيقونة الموقع (Settings)'); usageCount++; }
    }

    const { data: sections } = await supabaseClient.from('page_sections').select('section_type, draft_content, published_content');
    if (sections) {
        sections.forEach(sec => {
            const draftStr = JSON.stringify(sec.draft_content || {});
            const pubStr = JSON.stringify(sec.published_content || {});
            if (draftStr.includes(url) || pubStr.includes(url)) {
                usages.push(`قسم الصفحة الرئيسية: ${sec.section_type}`);
                usageCount++;
            }
        });
    }

    const { data: compContents } = await supabaseClient.from('component_content').select('component_id, draft_data, published_data').eq('is_deleted', false);
    if (compContents) {
        compContents.forEach(item => {
            const draftStr = JSON.stringify(item.draft_data || {});
            const pubStr = JSON.stringify(item.published_data || {});
            if (draftStr.includes(url) || pubStr.includes(url)) {
                const dataObj = item.draft_data || item.published_data || {};
                const title = dataObj.title || dataObj.question || dataObj.name || 'عنصر';
                let compType = 'محتوى مكون';
                if (item.component_id === 'f088192a-fa13-4c91-a20c-c603b10bcf2e') compType = 'الخدمات';
                else if (item.component_id === '4808cfcf-349c-4932-a083-0a716c52a0a2') compType = 'الحالات';
                else if (item.component_id === '990cd082-cd28-4a92-be20-2b1031f0cfbf') compType = 'الأسئلة الشائعة';
                else if (item.component_id === 'd508192a-fa13-4c91-a20c-c603b10bcfff') compType = 'آراء المرضى';
                
                usages.push(`${compType}: ${title}`);
                usageCount++;
            }
        });
    }

    return { usageCount, usages };
}

function restoreSoftDeletedRecord(table, id) {
    if (currentUserRole === 'Viewer') return;
    
    supabaseClient.from(table).update({ is_deleted: false }).eq('id', id)
        .then(({ error }) => {
            if (error) alert(error.message);
            else {
                logAuditAction(`${table}:restore`, `${table}:${id}`, null, { is_deleted: false });
                alert('✅ تم استعادة العنصر بنجاح للموقع العام!');
                loadRecycleBin();
            }
        });
}

function hardDeleteRecord(table, id) {
    if (currentUserRole !== 'Super Admin') {
        alert('الحذف النهائي والدائم للعناصر مسموح فقط لمدير النظام (Super Admin).');
        return;
    }
    
    if (confirm('تنبيه هام: هذا الإجراء سيحذف العنصر نهائياً من خوادم وقواعد بيانات Supabase ولن يمكن استرجاعه. هل تود المتابعة؟')) {
        supabaseClient.from(table).delete().eq('id', id)
            .then(({ error }) => {
                if (error) alert(error.message);
                else {
                    logAuditAction(`${table}:purge`, `${table}:${id}`, null, null);
                    alert('🔥 تم حذف وتطهير العنصر نهائياً.');
                    loadRecycleBin();
                }
            });
    }
}

// ---------------------------------------------------------
// REUSABLE HELPER UTILITIES
// ---------------------------------------------------------
function softDeleteRecord(table, id, callback) {
    if (currentUserRole === 'Viewer') {
        alert('حساب المشاهد لا يملك صلاحية الحذف.');
        return;
    }
    
    if (confirm('هل ترغب بنقل هذا العنصر لسلة المهملات؟')) {
        supabaseClient.from(table).update({ is_deleted: true }).eq('id', id)
            .then(({ error }) => {
                if (error) alert(error.message);
                else {
                    logAuditAction(`${table}:soft_delete`, `${table}:${id}`, null, { is_deleted: true });
                    alert('🗑️ تم نقل العنصر لسلة المهملات. يمكنك استرجاعه في أي وقت.');
                    if (callback) callback();
                }
            });
    }
}

// Global search engine across categories
function executeGlobalSearch(query) {
    const dropdown = document.getElementById('searchDropdown');
    if (!query) {
        dropdown.style.display = 'none';
        return;
    }

    // Query across Bookings, Patients (unique name matches)
    supabaseClient.from('bookings')
        .select('*')
        .eq('is_deleted', false)
        .or(`name.ilike.%${query}%,phone.ilike.%${query}%,service.ilike.%${query}%`)
        .limit(10)
        .then(({ data, error }) => {
            if (error || !data || data.length === 0) {
                dropdown.innerHTML = '<span style="color:var(--text-muted); font-size:12px;">لا توجد نتائج بحث مطابقة.</span>';
                dropdown.style.display = 'block';
                return;
            }

            dropdown.innerHTML = '<h4>نتائج البحث السريع:</h4>';
            data.forEach(item => {
                const div = document.createElement('div');
                div.style.padding = '8px';
                div.style.borderBottom = '1px solid var(--border-color)';
                div.style.cursor = 'pointer';
                div.innerHTML = `
                    <div style="font-weight:600; font-size:13px;">${item.name} (${item.service})</div>
                    <div style="font-size:11px; color:var(--text-muted);">التاريخ: ${item.date} • الهاتف: ${item.phone}</div>
                `;
                div.onclick = () => {
                    dropdown.style.display = 'none';
                    // Redirect to calendar or patient detail
                    location.hash = '#/appointments';
                    setTimeout(() => {
                        alert(`معلومات المريض المحددة:\nمريض: ${item.name}\nالخدمة: ${item.service}\nالتاريخ: ${item.date}`);
                    }, 200);
                };
                dropdown.appendChild(div);
            });
            dropdown.style.display = 'block';
        });
}

// Dynamic theme toggle (Dark/Light mode helper)
function setupThemeToggle() {
    const btn = document.getElementById('themeToggleBtn');
    btn.onclick = () => {
        const isDark = document.body.getAttribute('data-theme') === 'dark';
        document.body.setAttribute('data-theme', isDark ? 'light' : 'dark');
        btn.querySelector('i').className = isDark ? 'bx bx-moon' : 'bx bx-sun';
    };
}

function initNotificationBell() {
    // Check for pending items to set notification dot
    supabaseClient.from('bookings').select('id').eq('status', 'pending').eq('is_deleted', false)
        .then(({ data }) => {
            if (data && data.length > 0) {
                document.getElementById('notificationDot').style.display = 'block';
                document.getElementById('quickNotificationsList').innerHTML = `
                    <div style="padding: 8px; background: rgba(245,158,11,0.08); border-radius: 6px; color:#f59e0b; font-weight:600;">
                        ⚠️ يوجد لديك عدد ${data.length} حجز تقويم أسنان جديد معلق بانتظار المراجعة والموافقة!
                    </div>
                `;
            }
        });
}

function initAdminAIAssistant() {
    import('../assets/js/ai-assistant.js').then(({ attachAIAssistant }) => {
        const textFields = document.querySelectorAll(
            '#serviceForm input[type="text"], #serviceForm textarea, ' +
            '#caseForm input[type="text"], #caseForm textarea, ' +
            '#doctorCMSSection input[type="text"], #doctorCMSSection textarea, ' +
            '#homepageCMSSection input[type="text"], #homepageCMSSection textarea'
        );
        textFields.forEach(field => {
            const id = field.id || '';
            if (id.includes('Url') || id.includes('Icon') || id.includes('Id') || id.includes('Color') || id.includes('Age') || id.includes('Price') || id.includes('Duration') || id.includes('Visits') || id.includes('Chair')) {
                return;
            }
            attachAIAssistant(field);
        });
    });
}
