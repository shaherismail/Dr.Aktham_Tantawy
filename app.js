let supabase = null;
function initSupabaseClient() {
    const sbUrl = localStorage.getItem('supabase_url') || '';
    const sbKey = localStorage.getItem('supabase_key') || '';
    if (sbUrl && sbKey && window.supabase) {
        try {
            supabase = window.supabase.createClient(sbUrl, sbKey);
            console.log('Supabase client initialized successfully!');
        } catch (e) {
            console.error('Failed to initialize Supabase client:', e);
        }
    } else {
        supabase = null;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

// Main App Controller State
const AppState = {
    currentMode: 'live', // 'live' or 'figma'
    zoomLevel: 1, // Figma mockup zoom level
    bookingData: {
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

function initApp() {
    initSupabaseClient();
    initRouter();
    initScrollHeader();
    initBeforeAfterSliders();
    initBookingFlow();
    initTestimonialsCarousel();
    initPricingCalculator();
    initFAQAccordions();
    initCountdownTimer();
    initFigmaZoom();
    initNewsletter();
    initMobileDrawer();
    initPatientProfile();
    initTelegramSimulator();
    checkUrlCallbacks();
}

// Client side hash router
function initRouter() {
    const handleRoute = () => {
        const hash = window.location.hash || '#home';
        const sectionId = hash.substring(1);
        
        // Hide all main section containers
        const sections = document.querySelectorAll('.page-view');
        let sectionFound = false;

        sections.forEach(sec => {
            if (sec.id === `${sectionId}-page`) {
                sec.style.display = 'block';
                sectionFound = true;
            } else {
                sec.style.display = 'none';
            }
        });

        // Refresh profile page contents on route change if going to profile
        if (sectionId === 'profile') {
            updatePatientProfilePage();
        }

        // 404 Route handling
        if (!sectionFound) {
            const errorPage = document.getElementById('404-page');
            if (errorPage) {
                errorPage.style.display = 'block';
            }
        }

        // Highlight header item
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            const link = item.querySelector('a');
            if (link && link.getAttribute('href') === hash) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('hashchange', handleRoute);
    handleRoute(); // Call once on start
}

// Scrolled navbar decoration
function initScrollHeader() {
    const header = document.querySelector('.header-nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// Before/After interactive slider logic
function initBeforeAfterSliders() {
    const sliders = document.querySelectorAll('.before-after-wrapper');
    
    sliders.forEach(slider => {
        const handle = slider.querySelector('.slider-handle');
        const afterImg = slider.querySelector('.after-img');
        let isDragging = false;

        const updateSlider = (clientX) => {
            const rect = slider.getBoundingClientRect();
            const x = clientX - rect.left;
            let percentage = (x / rect.width) * 100;
            
            // Boundary constraints
            if (percentage < 0) percentage = 0;
            if (percentage > 100) percentage = 100;
            
            handle.style.left = `${percentage}%`;
            afterImg.style.width = `${percentage}%`;
        };

        const startDragging = () => {
            isDragging = true;
        };

        const stopDragging = () => {
            isDragging = false;
        };

        const drag = (e) => {
            if (!isDragging) return;
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            updateSlider(clientX);
        };

        // Event hooks
        handle.addEventListener('mousedown', startDragging);
        handle.addEventListener('touchstart', startDragging, { passive: true });
        
        window.addEventListener('mouseup', stopDragging);
        window.addEventListener('touchend', stopDragging);
        
        slider.addEventListener('mousemove', drag);
        slider.addEventListener('touchmove', drag, { passive: true });
    });
}

// Booking Page flows
function initBookingFlow() {
    const bookingForm = document.getElementById('bookingForm');
    if (!bookingForm) return;

    // Date Picker Input Limit (Disable past dates)
    const dateInput = document.getElementById('bookingDate');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
        dateInput.value = today; // default value
        
        // Initial seat grid generation
        generateSeatGrid(today);

        // Regenerate on change
        dateInput.addEventListener('change', (e) => {
            generateSeatGrid(e.target.value);
            // Reset selection
            AppState.bookingData.time = '';
            AppState.bookingData.chair = '';
            const infoCard = document.getElementById('selectedSeatInfoCard');
            if (infoCard) infoCard.style.display = 'none';
        });
    }

    // Form Submission
    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Validate time slot chosen
        if (!AppState.bookingData.time || !AppState.bookingData.chair) {
            alert('يرجى اختيار مقعد (عيادة ووقت) مناسب من لوحة حجز السينما التفاعلية.');
            return;
        }

        // Get values
        AppState.bookingData.name = document.getElementById('bookingName').value;
        AppState.bookingData.phone = document.getElementById('bookingPhone').value;
        AppState.bookingData.email = document.getElementById('bookingEmail').value || 'لا يوجد';
        AppState.bookingData.age = document.getElementById('bookingAge').value;
        AppState.bookingData.service = document.getElementById('bookingService').value;
        AppState.bookingData.date = document.getElementById('bookingDate').value;
        AppState.bookingData.notes = document.getElementById('bookingNotes').value || 'لا توجد ملاحظات';

        // Generate Booking ID
        const bookingId = 'DK-' + Math.floor(1000 + Math.random() * 9000);
        AppState.bookingData.id = bookingId;

        // Render values on confirmation view
        document.getElementById('confirmName').textContent = AppState.bookingData.name;
        document.getElementById('confirmPhone').textContent = AppState.bookingData.phone;
        document.getElementById('confirmService').textContent = AppState.bookingData.service;
        document.getElementById('confirmDate').textContent = AppState.bookingData.date;
        document.getElementById('confirmTime').textContent = `${AppState.bookingData.chair} - ${AppState.bookingData.time}`;

        // Save to LocalStorage
        saveBookingToLocalStorage(bookingId);

        // Send Notification to Telegram
        sendTelegramNotification(bookingId);

        // Transition to success page
        window.location.hash = '#success';
    });
}

// Dynamics Seating Matrix Generator (Cinema seat style slots connected to Supabase)
function generateSeatGrid(dateString) {
    const grid = document.getElementById('cinemaSeatsGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const clinics = [
        { name: 'جناح VIP 💎', id: 'vip' },
        { name: 'تقويم الأسنان 🦷', id: 'ortho' },
        { name: 'تجميل وزراعة 💺', id: 'cosmetic' }
    ];
    const times = ["10:00 ص", "12:00 م", "04:00 م", "06:00 م", "08:00 م"];

    // Generate random pre-booked seats based on date
    let seed = 0;
    if (dateString) {
        for (let i = 0; i < dateString.length; i++) {
            seed += dateString.charCodeAt(i);
        }
    } else {
        seed = 123;
    }

    const renderGrid = (reservedPairs) => {
        grid.innerHTML = '';
        times.forEach(time => {
            clinics.forEach(clinic => {
                let isReserved = false;
                const matchesDb = reservedPairs.some(p => p.time === time && p.chair === clinic.name);
                if (matchesDb) {
                    isReserved = true;
                } else {
                    const seatHash = (seed * time.charCodeAt(0) * clinic.name.charCodeAt(0)) % 100;
                    isReserved = seatHash < 35; // 35% chance booked
                }

                const container = document.createElement('div');
                container.className = 'seat-item-container';

                const seat = document.createElement('div');
                seat.className = `seat ${isReserved ? 'reserved' : 'available'}`;
                seat.dataset.time = time;
                seat.dataset.clinic = clinic.name;
                
                seat.innerHTML = `<i class="bx bx-chair"></i>`;

                const timeLabel = document.createElement('span');
                timeLabel.className = 'seat-time-lbl';
                timeLabel.textContent = time;

                container.appendChild(seat);
                container.appendChild(timeLabel);
                grid.appendChild(container);

                if (!isReserved) {
                    seat.addEventListener('click', () => {
                        document.querySelectorAll('.seat.selected').forEach(s => s.classList.remove('selected'));
                        seat.classList.add('selected');
                        
                        AppState.bookingData.time = time;
                        AppState.bookingData.chair = clinic.name;

                        const infoCard = document.getElementById('selectedSeatInfoCard');
                        const infoDetail = document.getElementById('selectedSeatDetail');
                        if (infoCard && infoDetail) {
                            infoCard.style.display = 'flex';
                            infoDetail.textContent = `${clinic.name} في تمام الساعة ${time}`;
                        }
                    });
                }
            });
        });
    };

    // Query bookings for this date from Supabase
    if (supabase) {
        supabase.from('bookings')
            .select('time, chair')
            .eq('date', dateString)
            .then(({ data, error }) => {
                if (error) {
                    console.error('Error fetching reserved seats:', error);
                    renderGrid([]);
                } else {
                    renderGrid(data || []);
                }
            });
    } else {
        renderGrid([]);
    }
}

// LocalStorage & Supabase Booking manager
function saveBookingToLocalStorage(bookingId) {
    const booking = {
        id: bookingId,
        name: AppState.bookingData.name,
        phone: AppState.bookingData.phone,
        email: AppState.bookingData.email,
        age: AppState.bookingData.age,
        service: AppState.bookingData.service,
        date: AppState.bookingData.date,
        time: AppState.bookingData.time,
        chair: AppState.bookingData.chair,
        notes: AppState.bookingData.notes,
        status: 'pending',
        timestamp: new Date().getTime()
    };

    let bookings = JSON.parse(localStorage.getItem('dr_aktham_bookings') || '[]');
    bookings.unshift(booking);
    localStorage.setItem('dr_aktham_bookings', JSON.stringify(bookings));

    localStorage.setItem('current_patient_profile', JSON.stringify({
        name: AppState.bookingData.name,
        phone: AppState.bookingData.phone,
        email: AppState.bookingData.email,
        age: AppState.bookingData.age,
        id: bookingId
    }));

    // If Supabase is active, save to cloud
    if (supabase) {
        supabase.from('bookings').insert([{
            id: bookingId,
            name: AppState.bookingData.name,
            phone: AppState.bookingData.phone,
            email: AppState.bookingData.email,
            age: parseInt(AppState.bookingData.age),
            service: AppState.bookingData.service,
            date: AppState.bookingData.date,
            time: AppState.bookingData.time,
            chair: AppState.bookingData.chair,
            notes: AppState.bookingData.notes,
            status: 'pending'
        }]).then(({ error }) => {
            if (error) console.error('Supabase insert error:', error);
            else console.log('Booking successfully inserted into Supabase cloud.');
        });
    }
}

// Send Real/Simulated Telegram notifications
function sendTelegramNotification(bookingId) {
    const botToken = localStorage.getItem('tg_bot_token') || '';
    const chatId = localStorage.getItem('tg_chat_id') || '';
    const tgMode = localStorage.getItem('tg_mode') || 'simulated';

    const b = AppState.bookingData;
    const approvalUrl = window.location.origin + window.location.pathname + `?action=confirm_booking&id=${bookingId}`;

    const text = `🔔 *طلب حجز جديد قيد الانتظار!*
    
👤 *اسم المريض:* ${b.name}
📞 *الجوال:* ${b.phone}
🦷 *الخدمة:* ${b.service}
📅 *التاريخ:* ${b.date}
⏰ *الوقت:* ${b.time}
💺 *العيادة:* ${b.chair}
📝 *ملاحظات:* ${b.notes}

يرجى الضغط على الزر أدناه لتأكيد الحجز وتحديث حالة الملف الطبي للمريض فوراً:`;

    // 1. Send Real Message
    if ((tgMode === 'real' || tgMode === 'both') && botToken && chatId) {
        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
        const body = {
            chat_id: chatId,
            text: text,
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: "✅ موافق (تأكيد الحجز)", url: approvalUrl }
                    ]
                ]
            }
        };

        fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        })
        .then(res => res.json())
        .then(data => {
            console.log('Telegram real notification sent', data);
        })
        .catch(err => {
            console.error('Error sending real Telegram notification', err);
        });
    }

    // 2. Trigger Chat Simulator
    if (tgMode === 'simulated' || tgMode === 'both') {
        const simulator = document.getElementById('tgSimulatorWidget');
        if (simulator) {
            const badge = document.getElementById('tgSimBadge');
            if (badge) {
                badge.textContent = '1';
                badge.style.display = 'flex';
            }

            const messagesContainer = document.getElementById('tgSimMessages');
            if (messagesContainer) {
                const botMsg = document.createElement('div');
                botMsg.className = 'tg-msg tg-msg-bot';
                
                botMsg.innerHTML = `
                    🔔 <strong>طلب حجز جديد قيد الانتظار!</strong>
                    <div class="tg-booking-details-box">
                        <div class="tg-detail-line"><span class="tg-detail-lbl">المريض:</span><span class="tg-detail-val">${b.name}</span></div>
                        <div class="tg-detail-line"><span class="tg-detail-lbl">الجوال:</span><span class="tg-detail-val">${b.phone}</span></div>
                        <div class="tg-detail-line"><span class="tg-detail-lbl">الخدمة:</span><span class="tg-detail-val">${b.service}</span></div>
                        <div class="tg-detail-line"><span class="tg-detail-lbl">التاريخ:</span><span class="tg-detail-val">${b.date}</span></div>
                        <div class="tg-detail-line"><span class="tg-detail-lbl">الوقت:</span><span class="tg-detail-val">${b.chair} - ${b.time}</span></div>
                        <div class="tg-detail-line"><span class="tg-detail-lbl">ملاحظات:</span><span class="tg-detail-val">${b.notes}</span></div>
                    </div>
                    <div class="tg-msg-actions">
                        <button class="tg-action-btn approve-btn" data-booking-id="${bookingId}"><i class="bx bx-check"></i> موافق</button>
                        <button class="tg-action-btn reject-btn" data-booking-id="${bookingId}"><i class="bx bx-x"></i> رفض</button>
                    </div>
                `;

                messagesContainer.appendChild(botMsg);
                messagesContainer.scrollTop = messagesContainer.scrollHeight;

                botMsg.querySelector('.approve-btn').addEventListener('click', () => {
                    executeSimulatedConfirm(bookingId);
                });
                botMsg.querySelector('.reject-btn').addEventListener('click', () => {
                    botMsg.remove();
                    alert('تم رفض طلب الحجز.');
                });

                try {
                    if ('speechSynthesis' in window) {
                        const utterance = new SpeechSynthesisUtterance("طلب حجز جديد قيد المراجعة");
                        utterance.lang = "ar-SA";
                        speechSynthesis.speak(utterance);
                    }
                } catch(e) {
                    console.log('Speech synthesis failed', e);
                }
            }
        }
    }
}

// Execute confirmation through the simulator
function executeSimulatedConfirm(bookingId) {
    let bookings = JSON.parse(localStorage.getItem('dr_aktham_bookings') || '[]');
    const idx = bookings.findIndex(b => b.id === bookingId);
    if (idx !== -1) {
        bookings[idx].status = 'confirmed';
        localStorage.setItem('dr_aktham_bookings', JSON.stringify(bookings));
    }

    if (supabase) {
        supabase.from('bookings')
            .update({ status: 'confirmed' })
            .eq('id', bookingId)
            .then(({ error }) => {
                if (error) console.error('Supabase update error:', error);
                else console.log(`Supabase booking ${bookingId} confirmed.`);
            });
    }

    updatePatientProfilePage();

    const badge = document.getElementById('tgSimBadge');
    if (badge) badge.style.display = 'none';

    window.location.hash = '#profile';
    fireConfettiEffect();
}

// Confetti visual effect generator
function fireConfettiEffect() {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const colors = ['#0D6EFD', '#4DA3FF', '#22C55E', '#FBBF24', '#F43F5E', '#8B5CF6'];

    const interval = setInterval(() => {
        if (Date.now() > animationEnd) {
            return clearInterval(interval);
        }

        const confetti = document.createElement('div');
        confetti.style.position = 'fixed';
        confetti.style.zIndex = '9999';
        confetti.style.width = '10px';
        confetti.style.height = '10px';
        confetti.style.borderRadius = '50%';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.top = '-20px';
        confetti.style.transform = `scale(${Math.random() * 1.5 + 0.5})`;
        confetti.style.opacity = Math.random().toString();
        
        document.body.appendChild(confetti);

        const fallDuration = Math.random() * 2000 + 1500;
        confetti.animate([
            { transform: `translateY(0) rotate(0deg) translateX(0)` },
            { transform: `translateY(110vh) rotate(${Math.random() * 360}deg) translateX(${(Math.random() - 0.5) * 100}px)` }
        ], {
            duration: fallDuration,
            easing: 'cubic-bezier(0.1, 0.8, 0.3, 1)'
        });

        setTimeout(() => confetti.remove(), fallDuration);
    }, 40);
}

// Patient profile initialization (including Supabase connections)
function initPatientProfile() {
    const saveBtn = document.getElementById('saveTgSettingsBtn');
    if (saveBtn) {
        document.getElementById('tgBotToken').value = localStorage.getItem('tg_bot_token') || '';
        document.getElementById('tgChatId').value = localStorage.getItem('tg_chat_id') || '';
        document.getElementById('tgMode').value = localStorage.getItem('tg_mode') || 'simulated';

        saveBtn.addEventListener('click', () => {
            const token = document.getElementById('tgBotToken').value;
            const chat = document.getElementById('tgChatId').value;
            const mode = document.getElementById('tgMode').value;

            localStorage.setItem('tg_bot_token', token);
            localStorage.setItem('tg_chat_id', chat);
            localStorage.setItem('tg_mode', mode);

            alert('✅ تم حفظ إعدادات تكامل تليجرام بنجاح!');
        });
    }

    const saveSbBtn = document.getElementById('saveSbSettingsBtn');
    if (saveSbBtn) {
        document.getElementById('sbUrl').value = localStorage.getItem('supabase_url') || '';
        document.getElementById('sbKey').value = localStorage.getItem('supabase_key') || '';

        saveSbBtn.addEventListener('click', () => {
            const url = document.getElementById('sbUrl').value.trim();
            const key = document.getElementById('sbKey').value.trim();

            localStorage.setItem('supabase_url', url);
            localStorage.setItem('supabase_key', key);

            // Re-initialize client
            initSupabaseClient();

            alert('✅ تم حفظ إعدادات Supabase ومزامنة الاتصال!');
            
            // Re-render profile lists
            updatePatientProfilePage();
            
            // Re-render testimonials if connected
            initTestimonialsCarousel();
        });
    }

    // Connect Review submission form
    const reviewForm = document.getElementById('addReviewForm');
    if (reviewForm) {
        if (!reviewForm.dataset.bound) {
            reviewForm.dataset.bound = 'true';
            reviewForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const profileJson = localStorage.getItem('current_patient_profile');
                if (!profileJson) {
                    alert('خطأ: لا يوجد ملف مريض نشط حالياً.');
                    return;
                }
                
                const p = JSON.parse(profileJson);
                const starsRadio = reviewForm.querySelector('input[name="reviewStars"]:checked');
                if (!starsRadio) {
                    alert('يرجى تحديد تقييم بالنجوم أولاً.');
                    return;
                }
                const starsVal = parseInt(starsRadio.value);
                const textVal = document.getElementById('reviewText').value.trim();
                
                if (supabase) {
                    supabase.from('testimonials').insert([{
                        name: p.name,
                        tag: 'مريض مـؤكّد ✓',
                        stars: starsVal,
                        text: textVal,
                        status: 'approved'
                    }]).then(({ error }) => {
                        if (error) {
                            console.error('Error saving testimonial:', error);
                            alert('حدث خطأ أثناء إرسال التقييم. يرجى المحاولة لاحقاً.');
                        } else {
                            alert('🎉 شكراً لك! تم إرسال تقييمك بنجاح وسيظهر فوراً في الصفحة الرئيسية.');
                            reviewForm.reset();
                            initTestimonialsCarousel();
                        }
                    });
                } else {
                    alert('تم إرسال التقييم بنجاح (محاكاة محلية، يرجى ربط Supabase للحفظ الفعلي).');
                    reviewForm.reset();
                }
            });
        }
    }

    updatePatientProfilePage();
}

// Update profile page view (queries Supabase cloud if active, fallback to localStorage)
function updatePatientProfilePage() {
    const profileJson = localStorage.getItem('current_patient_profile');
    let p = null;
    if (profileJson) {
        p = JSON.parse(profileJson);
        const nameDisp = document.getElementById('profileNameDisplay');
        const phoneDisp = document.getElementById('profilePhoneDisplay');
        const emailDisp = document.getElementById('profileEmailDisplay');
        const ageDisp = document.getElementById('profileAgeDisplay');
        const fileIdDisp = document.getElementById('profileFileId');
        const avatarDisp = document.getElementById('profileAvatar');

        if (nameDisp) nameDisp.textContent = p.name;
        if (phoneDisp) phoneDisp.textContent = p.phone;
        if (emailDisp) emailDisp.textContent = p.email || 'غير مسجل';
        if (ageDisp) ageDisp.textContent = p.age ? `${p.age} سنة` : 'غير محدد';
        if (fileIdDisp) fileIdDisp.textContent = p.id;
        if (avatarDisp && p.name) avatarDisp.textContent = p.name.charAt(0);
    }

    const noView = document.getElementById('noBookingsView');
    const listView = document.getElementById('bookingsListView');

    if (!listView || !noView) return;

    // Show loading indicator
    listView.innerHTML = '<div style="text-align:center; padding:30px; color:var(--primary);"><i class="bx bx-loader-alt animate-spin" style="font-size:30px; margin-bottom:10px; display:block;"></i>جاري تحميل المواعيد من قاعدة البيانات...</div>';
    listView.style.display = 'flex';
    noView.style.display = 'none';

    const renderBookings = (bookingsList) => {
        // Show review section if at least one booking is confirmed
        const reviewSection = document.getElementById('addReviewSection');
        if (reviewSection) {
            const hasConfirmed = bookingsList.some(b => b.status === 'confirmed');
            if (hasConfirmed) {
                reviewSection.style.display = 'block';
            } else {
                reviewSection.style.display = 'none';
            }
        }

        if (bookingsList.length === 0) {
            noView.style.display = 'flex';
            listView.style.display = 'none';
        } else {
            noView.style.display = 'none';
            listView.style.display = 'flex';
            listView.innerHTML = '';

            bookingsList.forEach(b => {
                const card = document.createElement('div');
                const isConfirmed = b.status === 'confirmed';
                card.className = `booking-item-card ${isConfirmed ? 'confirmed-card' : 'pending-card'}`;

                card.innerHTML = `
                    <div class="booking-header-row">
                        <span class="booking-id-tag">معرف: ${b.id}</span>
                        <span class="badge-status ${isConfirmed ? 'confirmed' : 'pending'}">
                            ${isConfirmed ? '<i class="bx bx-check-double"></i> مؤكد وموافق عليه' : '<i class="bx bx-time"></i> قيد تأكيد تليجرام'}
                        </span>
                    </div>
                    <h4 class="booking-service-title">${b.service}</h4>
                    <div class="booking-meta-grid">
                        <div class="meta-col"><i class="bx bx-calendar"></i> <span>التاريخ: ${b.date}</span></div>
                        <div class="meta-col"><i class="bx bx-time-five"></i> <span>الوقت: ${b.time}</span></div>
                        <div class="meta-col"><i class="bx bx-building-house"></i> <span>العيادة: ${b.chair}</span></div>
                        <div class="meta-col"><i class="bx bx-user-pin"></i> <span>الملف: نشط</span></div>
                    </div>
                    <div class="booking-footer-actions">
                        ${!isConfirmed ? `
                            <button class="btn btn-secondary btn-sm sim-approve-direct-btn" data-booking-id="${b.id}" style="padding: 6px 12px; font-size: 11px; margin-left: 10px;">
                                <i class="bx bxl-telegram"></i> محاكاة تأكيد الطبيب
                            </button>
                        ` : ''}
                        <button class="btn btn-outline btn-sm cancel-booking-btn" data-booking-id="${b.id}" style="padding: 6px 12px; font-size: 11px;">
                            <i class="bx bx-trash"></i> إلغاء الموعد
                        </button>
                    </div>
                `;

                listView.appendChild(card);

                const simApproveBtn = card.querySelector('.sim-approve-direct-btn');
                if (simApproveBtn) {
                    simApproveBtn.addEventListener('click', () => {
                        executeSimulatedConfirm(b.id);
                    });
                }

                card.querySelector('.cancel-booking-btn').addEventListener('click', () => {
                    if (confirm('هل أنت متأكد من رغبتك في إلغاء هذا الموعد؟')) {
                        cancelBooking(b.id);
                    }
                });
            });
        }
    };

    // Query from Supabase
    if (supabase && p) {
        supabase.from('bookings')
            .select('*')
            .eq('phone', p.phone)
            .order('created_at', { ascending: false })
            .then(({ data, error }) => {
                if (error) {
                    console.error('Supabase fetch error:', error);
                    // Fallback to local
                    const localBookings = JSON.parse(localStorage.getItem('dr_aktham_bookings') || '[]');
                    renderBookings(localBookings);
                } else {
                    renderBookings(data || []);
                }
            });
    } else {
        const localBookings = JSON.parse(localStorage.getItem('dr_aktham_bookings') || '[]');
        renderBookings(localBookings);
    }
}

// Cancel active bookings in local storage and Supabase cloud
function cancelBooking(bookingId) {
    let bookings = JSON.parse(localStorage.getItem('dr_aktham_bookings') || '[]');
    bookings = bookings.filter(b => b.id !== bookingId);
    localStorage.setItem('dr_aktham_bookings', JSON.stringify(bookings));

    if (supabase) {
        supabase.from('bookings')
            .delete()
            .eq('id', bookingId)
            .then(({ error }) => {
                if (error) console.error('Supabase delete error:', error);
                else console.log(`Supabase booking ${bookingId} deleted.`);
            });
    }

    updatePatientProfilePage();
}

// Telegram chat simulator launcher toggles
function initTelegramSimulator() {
    const launcher = document.getElementById('tgSimLauncher');
    const closeBtn = document.getElementById('tgSimClose');
    const chatbox = document.getElementById('tgSimChatbox');

    if (!launcher || !chatbox) return;

    launcher.addEventListener('click', () => {
        chatbox.classList.toggle('active');
        const badge = document.getElementById('tgSimBadge');
        if (badge) badge.style.display = 'none';
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            chatbox.classList.remove('active');
        });
    }
}

// Check incoming URL parameters for Telegram click approvals
function checkUrlCallbacks() {
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

        if (supabase) {
            supabase.from('bookings')
                .update({ status: 'confirmed' })
                .eq('id', id)
                .then(({ error }) => {
                    if (error) console.error('Supabase url callback update error:', error);
                    else console.log(`Supabase booking ${id} confirmed via URL.`);
                });
        }
        
        const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + '#profile';
        window.history.replaceState({ path: cleanUrl }, '', cleanUrl);

        setTimeout(() => {
            initPatientProfile();
            fireConfettiEffect();
            alert(`🎉 تم تأكيد الموعد رقم ${id} بنجاح من خلال تليجرام!`);
        }, 100);
    }
}

// Testimonials Slider logic (dynamic fetching from Supabase)
function initTestimonialsCarousel() {
    const track = document.getElementById('testimonialsTrack');
    const indicatorsContainer = document.getElementById('testimonialsIndicators');
    if (!track || !indicatorsContainer) return;

    let currentIndex = 0;
    let autoplayTimer;
    let slides = [];
    let dots = [];

    const setupSlider = () => {
        slides = Array.from(track.children);
        indicatorsContainer.innerHTML = '';

        if (slides.length === 0) return;

        slides.forEach((_, idx) => {
            const dot = document.createElement('div');
            dot.classList.add('indicator-dot');
            if (idx === 0) dot.classList.add('active');
            dot.addEventListener('click', () => {
                goToSlide(idx);
                resetAutoplay();
            });
            indicatorsContainer.appendChild(dot);
        });

        dots = Array.from(indicatorsContainer.children);
        resetAutoplay();
    };

    const goToSlide = (index) => {
        if (slides.length === 0) return;
        currentIndex = index;
        const percentage = -currentIndex * 100;
        track.style.transform = `translateX(${percentage}%)`;
        
        dots.forEach((dot, idx) => {
            if (idx === currentIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    };

    const nextSlide = () => {
        if (slides.length === 0) return;
        let nextIndex = currentIndex + 1;
        if (nextIndex >= slides.length) {
            nextIndex = 0;
        }
        goToSlide(nextIndex);
    };

    const resetAutoplay = () => {
        clearInterval(autoplayTimer);
        if (slides.length > 1) {
            autoplayTimer = setInterval(nextSlide, 5000);
        }
    };

    // Load from local storage static fallback reviews
    const fallbackReviews = [
        { name: 'عبد الرحمن خالد', tag: 'مريض زراعة الأسنان', stars: 5, text: 'تجربة رائعة بمعنى الكلمة، قمت بعملية زراعة فك كاملة مع الدكتور أكثم طنطاوي، وبصراحة لم أشعر بأي ألم على الإطلاق والتعامل كان في منتهى الرقي. الابتسامة أعادت لي ثقتي بنفسي!' },
        { name: 'سارة محمد', tag: 'مريضة تقويم الأسنان', stars: 5, text: 'كان لدي خوف شديد من طبيب الأسنان منذ الصغر، لكن الأسلوب المريح والمهنية العالية لدى الدكتور أكثم جعلتني أنجز تقويم الأسنان بدون أي قلق وبنتائج مذهلة فاقت توقعاتي.' }
    ];

    const renderTestimonials = (list) => {
        track.innerHTML = '';
        list.forEach(item => {
            const slide = document.createElement('div');
            slide.className = 'testimonial-card-slide';

            let starsHtml = '';
            for (let i = 0; i < 5; i++) {
                starsHtml += `<i class="bx ${i < item.stars ? 'bxs-star' : 'bx-star'}"></i>`;
            }

            slide.innerHTML = `
                <div class="glass-card testimonial-card">
                    <div class="testimonial-quote-icon">“</div>
                    <div class="testimonial-stars" style="color: #FBBF24; display: flex; justify-content: center; gap: 4px; font-size: 20px; margin-bottom: 24px;">
                        ${starsHtml}
                    </div>
                    <p class="testimonial-text" style="font-size: 20px; font-weight: 500; line-height: 1.8; color: var(--text-main); margin-bottom: 30px;">
                        ${item.text}
                    </p>
                    <div class="patient-profile" style="display: flex; align-items: center; justify-content: center; gap: 16px;">
                        <div class="patient-avatar" style="width: 54px; height: 54px; background: var(--secondary); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; color: var(--primary); font-size: 18px;">
                            ${item.name.charAt(0)}
                        </div>
                        <div>
                            <h4 class="patient-name" style="font-size: 16px; font-weight: 700; color: var(--text-main); text-align: right;">${item.name}</h4>
                            <span class="patient-tag" style="font-size: 12px; color: var(--text-muted);">${item.tag}</span>
                        </div>
                    </div>
                </div>
            `;
            track.appendChild(slide);
        });

        setupSlider();
    };

    // Attempt to load from Supabase
    if (supabase) {
        supabase.from('testimonials')
            .select('*')
            .eq('status', 'approved')
            .order('created_at', { ascending: false })
            .then(({ data, error }) => {
                if (error || !data || data.length === 0) {
                    renderTestimonials(fallbackReviews);
                } else {
                    renderTestimonials(data);
                }
            });
    } else {
        renderTestimonials(fallbackReviews);
    }
}

// Pricing Packages & Installments calculations
function initPricingCalculator() {
    const termRange = document.getElementById('installmentTerms');
    const termLabel = document.getElementById('termValue');
    const packageSelect = document.getElementById('calcPackage');
    
    const monthlyResult = document.getElementById('monthlyPaymentResult');
    const totalResult = document.getElementById('totalCostResult');
    const togglePricing = document.querySelector('.pricing-toggle');

    if (!termRange || !packageSelect) return;

    const recalculateInstallment = () => {
        const packageKey = packageSelect.value;
        const months = parseInt(termRange.value);
        const baseCost = AppState.pricing.basePrices[packageKey];
        
        // Add subtle interest rate for installments
        const interestRate = months > 12 ? 0.08 : (months > 6 ? 0.04 : 0);
        const totalCost = baseCost * (1 + interestRate);
        const monthlyCost = totalCost / months;

        termLabel.textContent = `${months} شهر`;
        monthlyResult.textContent = `${Math.round(monthlyCost)} ريال`;
        totalResult.textContent = `${Math.round(totalCost)} ريال`;
    };

    termRange.addEventListener('input', recalculateInstallment);
    packageSelect.addEventListener('change', recalculateInstallment);

    // Installments display toggle
    if (togglePricing) {
        togglePricing.addEventListener('click', () => {
            togglePricing.classList.toggle('active');
            const prices = document.querySelectorAll('.pricing-price');
            const isInstallment = togglePricing.classList.contains('active');

            prices.forEach(priceEl => {
                const baseVal = parseInt(priceEl.dataset.basePrice);
                if (isInstallment) {
                    // Divide base cost by 12 installments
                    const installmentVal = Math.round((baseVal * 1.05) / 12);
                    priceEl.innerHTML = `${installmentVal} <span>ريال / شهرياً</span>`;
                } else {
                    priceEl.innerHTML = `${baseVal} <span>ريال</span>`;
                }
            });
        });
    }

    recalculateInstallment(); // Call initially
}

// FAQ accordion dynamic height toggling
function initFAQAccordions() {
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
function initCountdownTimer() {
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

// Mode Switcher (Website vs Figma View) & Zoom functionality
function initFigmaZoom() {
    const liveBtn = document.getElementById('viewLiveBtn');
    const figmaBtn = document.getElementById('viewFigmaBtn');
    const websiteContainer = document.getElementById('app-root');
    const figmaContainer = document.getElementById('figma-canvas');

    const zoomInBtn = document.getElementById('zoomIn');
    const zoomOutBtn = document.getElementById('zoomOut');
    const zoomResetBtn = document.getElementById('zoomReset');
    const zoomText = document.getElementById('zoomVal');
    const artboardGrid = document.querySelector('.figma-artboards-grid');

    if (!liveBtn || !figmaBtn) return;

    liveBtn.addEventListener('click', () => {
        liveBtn.classList.add('active');
        figmaBtn.classList.remove('active');
        websiteContainer.style.display = 'flex';
        figmaContainer.classList.remove('active');
        AppState.currentMode = 'live';
    });

    figmaBtn.addEventListener('click', () => {
        figmaBtn.classList.add('active');
        liveBtn.classList.remove('active');
        websiteContainer.style.display = 'none';
        figmaContainer.classList.add('active');
        AppState.currentMode = 'figma';
    });

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
}

// Newsletter sign-up feedback (integrated with Supabase)
function initNewsletter() {
    const newsForm = document.getElementById('newsForm');
    if (!newsForm) return;

    newsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const emailVal = newsForm.querySelector('.newsletter-input').value.trim();
        if (emailVal) {
            if (supabase) {
                supabase.from('newsletter_subscribers').insert([{ email: emailVal }])
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

// Mobile Side Drawer Navigation Controller
function initMobileDrawer() {
    const openBtn = document.getElementById('openDrawerBtn');
    const closeBtn = document.getElementById('closeDrawerBtn');
    const drawer = document.getElementById('mobileDrawer');
    const overlay = document.getElementById('drawerOverlay');
    const links = document.querySelectorAll('.drawer-links a');
    const bookingBtn = document.getElementById('drawerBookingBtn');

    if (!openBtn || !drawer) return;

    const openDrawer = () => {
        drawer.classList.add('active');
        overlay.classList.add('active');
    };

    const closeDrawer = () => {
        drawer.classList.remove('active');
        overlay.classList.remove('active');
    };

    openBtn.addEventListener('click', openDrawer);
    closeBtn.addEventListener('click', closeDrawer);
    overlay.addEventListener('click', closeDrawer);

    links.forEach(link => {
        link.addEventListener('click', closeDrawer);
    });

    if (bookingBtn) {
        bookingBtn.addEventListener('click', closeDrawer);
    }
}
