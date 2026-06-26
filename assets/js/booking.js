import { AppState, supabaseClient } from './app.js';
import { sendTelegramNotification } from './telegram.js';

let currentStep = 1;
const totalSteps = 6;

// Dynamic Seating Matrix Generator (Replaces Cinema seating layout with clean time badge groups)
export function generateSeatGrid(dateString) {
    const grid = document.getElementById('cinemaSeatsGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const clinics = [
        { name: 'جناح VIP 💎', id: 'vip' },
        { name: 'تقويم الأسنان 🦷', id: 'ortho' },
        { name: 'تجميل وزراعة 💺', id: 'cosmetic' }
    ];
    const times = ["10:00 ص", "12:00 م", "04:00 م", "06:00 م", "08:00 م"];

    // Generate random pre-booked seats based on date hash
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
        
        clinics.forEach(clinic => {
            // Create suite block
            const suiteGroup = document.createElement('div');
            suiteGroup.className = 'suite-booking-group';
            suiteGroup.innerHTML = `
                <h4 class="suite-header-title"><i class="bx bx-clinic"></i> ${clinic.name}</h4>
                <div class="time-slots-group-grid"></div>
            `;
            const slotsGrid = suiteGroup.querySelector('.time-slots-group-grid');

            times.forEach(time => {
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
                
                seat.innerHTML = `<i class="bx ${isReserved ? 'bx-lock-alt' : 'bx-time-five'}"></i>`;

                container.appendChild(seat);
                slotsGrid.appendChild(container);

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
                            infoDetail.textContent = `${clinic.name} - في تمام الساعة ${time}`;
                        }
                    });
                }
            });

            grid.appendChild(suiteGroup);
        });
    };

    // Query bookings for this date from Supabase
    if (supabaseClient) {
        supabaseClient.from('bookings')
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
export function saveBookingToLocalStorage(bookingId) {
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

    // If Supabase is active, save to cloud and return the Promise
    if (supabaseClient) {
        return supabaseClient.from('bookings').insert([{
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
        }]);
    }
    return Promise.resolve({ data: null, error: null });
}

// Populate summaries in Step 6
function populateSummary() {
    document.getElementById('summaryName').textContent = document.getElementById('bookingName').value || 'غير محدد';
    document.getElementById('summaryPhone').textContent = document.getElementById('bookingPhone').value || 'غير محدد';
    document.getElementById('summaryService').textContent = AppState.bookingData.service || 'غير محدد';
    document.getElementById('summaryDoctor').textContent = AppState.bookingData.doctor || 'د. أكثم طنطاوي';
    document.getElementById('summaryDate').textContent = document.getElementById('bookingDate').value || 'لم يتم الاختيار';
    document.getElementById('summaryTime').textContent = AppState.bookingData.chair ? `${AppState.bookingData.chair} - ${AppState.bookingData.time}` : 'لم يتم تحديد وقت الحجز';
}

// Wizard Transitions
function showStep(step) {
    document.querySelectorAll('.wizard-step-panel').forEach(panel => panel.classList.remove('active'));
    document.querySelectorAll('.step-indicator').forEach(ind => ind.classList.remove('active', 'completed'));
    
    document.getElementById(`stepPanel${step}`).classList.add('active');
    
    for (let i = 1; i <= totalSteps; i++) {
        const ind = document.getElementById(`stepIndicator${i}`);
        if (ind) {
            if (i < step) ind.classList.add('completed');
            if (i === step) ind.classList.add('active');
        }
    }
    
    const prevBtn = document.getElementById('prevStepBtn');
    const nextBtn = document.getElementById('nextStepBtn');
    const submitBtn = document.getElementById('submitBookingBtn');
    
    if (prevBtn) prevBtn.style.visibility = step === 1 ? 'hidden' : 'visible';
    
    if (step === totalSteps) {
        if (nextBtn) nextBtn.style.display = 'none';
        if (submitBtn) submitBtn.style.display = 'inline-flex';
        populateSummary();
    } else {
        if (nextBtn) nextBtn.style.display = 'inline-flex';
        if (submitBtn) submitBtn.style.display = 'none';
    }

    // Auto-scroll to top of form wrapper on mobile for native app guidelines
    const bookingCard = document.querySelector('.booking-card');
    if (bookingCard) {
        const yOffset = -80; // height of mobile navigation header
        const y = bookingCard.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
    }
}

function validateStep(step) {
    if (step === 1) {
        const name = document.getElementById('bookingName').value.trim();
        const phone = document.getElementById('bookingPhone').value.trim();
        const age = document.getElementById('bookingAge').value.trim();
        
        if (!name || !phone || !age) {
            alert('الرجاء تعبئة كافة الحقول المطلوبة (الاسم الكامل، رقم الجوال، والعمر).');
            return false;
        }
        return true;
    }
    if (step === 2) {
        if (!AppState.bookingData.service) {
            alert('الرجاء اختيار الخدمة المطلوبة.');
            return false;
        }
        return true;
    }
    if (step === 3) {
        if (!AppState.bookingData.doctor) {
            alert('الرجاء اختيار الطبيب المفضل.');
            return false;
        }
        return true;
    }
    if (step === 4) {
        const date = document.getElementById('bookingDate').value;
        if (!date) {
            alert('الرجاء اختيار تاريخ الحجز.');
            return false;
        }
        return true;
    }
    if (step === 5) {
        if (!AppState.bookingData.chair || !AppState.bookingData.time) {
            alert('الرجاء اختيار الجناح ووقت المراجعة المفضل من لوحة المواعيد.');
            return false;
        }
        return true;
    }
    return true;
}

export function initBookingFlow() {
    const bookingForm = document.getElementById('bookingForm');
    const dateInput = document.getElementById('bookingDate');

    if (!bookingForm) return;

    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;

    // Default AppState service setup
    AppState.bookingData.service = 'تنظيف الأسنان';
    AppState.bookingData.doctor = 'د. أكثم طنطاوي'; // Default Doctor
    AppState.bookingData.chair = '';
    AppState.bookingData.time = '';

    // Handle Date Input changes
    dateInput.addEventListener('change', (e) => {
        generateSeatGrid(e.target.value);
    });

    // Handle Visual Services Selector click
    const servicesGrid = document.getElementById('bookingServicesGrid');
    const hiddenSelect = document.getElementById('bookingService');
    
    const bindServiceClicks = () => {
        const serviceItems = document.querySelectorAll('.service-select-item');
        serviceItems.forEach(item => {
            item.addEventListener('click', () => {
                serviceItems.forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');
                
                const serviceValue = item.getAttribute('data-value');
                AppState.bookingData.service = serviceValue;
                if (hiddenSelect) {
                    hiddenSelect.value = serviceValue;
                }
            });
        });
    };

    if (supabaseClient && servicesGrid) {
        supabaseClient.from('component_content')
            .select('*')
            .eq('component_id', 'f088192a-fa13-4c91-a20c-c603b10bcf2e') // service_card component ID
            .eq('is_visible', true)
            .order('display_order', { ascending: true })
            .then(({ data, error }) => {
                if (data && data.length > 0 && !error) {
                    servicesGrid.innerHTML = '';
                    if (hiddenSelect) hiddenSelect.innerHTML = '';
                    
                    data.forEach((item, idx) => {
                        const s = item.published_data;
                        if (hiddenSelect) {
                            const opt = document.createElement('option');
                            opt.value = s.title;
                            opt.textContent = s.title;
                            if (idx === 0) opt.selected = true;
                            hiddenSelect.appendChild(opt);
                        }

                        const div = document.createElement('div');
                        div.className = `service-select-item ${idx === 0 ? 'selected' : ''}`;
                        div.setAttribute('data-value', s.title);
                        div.innerHTML = `
                            <i class="bx ${s.icon || 'bx-smile'}"></i>
                            <span>${s.title}</span>
                        `;
                        servicesGrid.appendChild(div);
                        
                        if (idx === 0) {
                            AppState.bookingData.service = s.title;
                        }
                    });
                }
                bindServiceClicks();
            });
    } else {
        bindServiceClicks();
    }

    // Handle Visual Doctors Selector click
    const doctorsGrid = document.getElementById('bookingDoctorsGrid');
    const bindDoctorClicks = () => {
        const doctorCards = document.querySelectorAll('.doctor-select-card');
        doctorCards.forEach(card => {
            card.addEventListener('click', () => {
                doctorCards.forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                AppState.bookingData.doctor = card.getAttribute('data-doctor');
            });
        });
    };

    if (supabaseClient && doctorsGrid) {
        supabaseClient.from('page_sections')
            .select('published_content')
            .eq('section_type', 'doctor')
            .single()
            .then(({ data, error }) => {
                if (data && !error) {
                    const doc = data.published_content || {};
                    doctorsGrid.innerHTML = `
                        <!-- Doctor 1: Principal -->
                        <div class="doctor-select-card selected" data-doctor="${doc.name || 'د. أكثم طنطاوي'}">
                            <span class="doctor-badge-ribbon">الاستشاري الرئيسي</span>
                            <img src="${doc.photo_url || 'assets/doctor.jpg'}" alt="${doc.name || 'د. أكثم طنطاوي'}">
                            <h4 style="font-size: 16px; font-weight: 800; color: var(--dark); margin-bottom: 4px;">${doc.name || 'د. أكثم طنطاوي'}</h4>
                            <p style="font-size: 12px; color: var(--primary); font-weight: 600; margin-bottom: 8px;">استشاري تقويم الأسنان والفكين</p>
                            <p style="font-size: 11px; color: var(--text-muted); line-height: 1.5; margin: 0;">${(doc.bio || '').substr(0, 80)}...</p>
                        </div>
                        <!-- Doctor 2: Associate -->
                        <div class="doctor-select-card" data-doctor="د. سارة الأحمد">
                            <img src="https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&w=200&q=80" alt="د. سارة الأحمد">
                            <h4 style="font-size: 16px; font-weight: 800; color: var(--dark); margin-bottom: 4px;">د. سارة الأحمد</h4>
                            <p style="font-size: 12px; color: var(--text-muted); font-weight: 600; margin-bottom: 8px;">أخصائية الأسنان العامة والزراعة</p>
                            <p style="font-size: 11px; color: var(--text-muted); line-height: 1.5; margin: 0;">عضو البورد الألماني، متخصصة في العلاج العام والحشوات التجميلية.</p>
                        </div>
                    `;
                    AppState.bookingData.doctor = doc.name || 'د. أكثم طنطاوي';
                }
                bindDoctorClicks();
            });
    } else {
        bindDoctorClicks();
    }

    // Next/Prev Buttons Controllers
    const nextBtn = document.getElementById('nextStepBtn');
    const prevBtn = document.getElementById('prevStepBtn');

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (validateStep(currentStep)) {
                currentStep++;
                showStep(currentStep);
            }
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentStep--;
            showStep(currentStep);
        });
    }

    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!validateStep(5)) return;

        const submitBtn = document.getElementById('submitBookingBtn');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="bx bx-loader-alt animate-spin"></i> جاري تأكيد الحجز...';

        AppState.bookingData.name = document.getElementById('bookingName').value;
        AppState.bookingData.phone = document.getElementById('bookingPhone').value;
        AppState.bookingData.email = document.getElementById('bookingEmail').value || 'لا يوجد';
        AppState.bookingData.age = document.getElementById('bookingAge').value;
        AppState.bookingData.date = document.getElementById('bookingDate').value;
        
        // Compile Doctor and Notes together
        const selectedDoctor = AppState.bookingData.doctor || 'د. أكثم طنطاوي';
        const userNotes = document.getElementById('bookingNotes').value || 'لا توجد ملاحظات';
        AppState.bookingData.notes = `الطبيب المختار: ${selectedDoctor} | ملاحظات المريض: ${userNotes}`;

        // Generate Booking ID
        const bookingId = 'DK-' + Math.floor(1000 + Math.random() * 9000);
        AppState.bookingData.id = bookingId;

        // Save to LocalStorage & Supabase, then wait for completion before page redirect
        saveBookingToLocalStorage(bookingId)
            .then(({ error }) => {
                if (error) {
                    console.error('Booking save error:', error);
                    alert('فشل حفظ الموعد في خادم السحابة، تم حفظ الحجز محلياً فقط.');
                }
                
                // Send Notification to Telegram
                sendTelegramNotification(bookingId);

                // Transition to success page
                window.location.href = 'success.html';
            })
            .catch(err => {
                console.error('Booking save exception:', err);
                window.location.href = 'success.html';
            });
    });
}

// Populate booking success page details on success.html
export function initSuccessPage() {
    const confirmName = document.getElementById('confirmName');
    if (!confirmName) return;

    const bookings = JSON.parse(localStorage.getItem('dr_aktham_bookings') || '[]');
    if (bookings.length > 0) {
        const latest = bookings[0];
        document.getElementById('confirmName').textContent = latest.name || '';
        document.getElementById('confirmPhone').textContent = latest.phone || '';
        document.getElementById('confirmService').textContent = latest.service || '';
        document.getElementById('confirmDate').textContent = latest.date || '';
        document.getElementById('confirmTime').textContent = `${latest.chair || ''} - ${latest.time || ''}`;
    }
}

// Auto-run when module is loaded
document.addEventListener('DOMContentLoaded', () => {
    initBookingFlow();
    initSuccessPage();
});
