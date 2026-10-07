import { AppState } from './app.js';

let currentStep = 1;
const totalSteps = 6;

// Available Appointment Slots
const morningTimes = ["10:00 ص", "11:00 ص", "12:00 م", "01:00 م"];
const eveningTimes = ["04:30 م", "05:30 م", "06:30 م", "07:30 م", "08:30 م"];

// Dynamic Appointment Slots Generator
export function generateSeatGrid(dateString) {
    const grid = document.getElementById('cinemaSeatsGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const selectedDate = dateString || document.getElementById('bookingDate')?.value || new Date().toISOString().split('T')[0];
    const currentSuite = AppState.bookingData.chair || 'عيادة تقويم الأسنان 🦷';

    // Retrieve already booked slots for this date and clinic suite
    let bookedPairs = [];
    try {
        const stored = JSON.parse(localStorage.getItem('dr_aktham_bookings') || '[]');
        bookedPairs = stored
            .filter(b => b.date === selectedDate && b.status !== 'cancelled')
            .map(b => ({ time: b.time, chair: b.chair }));
    } catch (e) {
        bookedPairs = [];
    }

    const container = document.createElement('div');
    container.className = 'slots-wrapper-box';

    // 1. Morning Shift
    const morningGroup = document.createElement('div');
    morningGroup.className = 'shift-group';
    morningGroup.innerHTML = `
        <div class="shift-title"><i class="bx bx-sun"></i> الفترة الصباحية (10:00 ص - 01:00 م)</div>
        <div class="slots-pill-grid" id="morningSlotsGrid"></div>
    `;
    const morningGrid = morningGroup.querySelector('#morningSlotsGrid');

    morningTimes.forEach(time => {
        const isReserved = bookedPairs.some(p => p.time === time && (p.chair === currentSuite || !p.chair));
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `slot-pill-btn ${isReserved ? 'slot-reserved' : 'slot-available'} ${AppState.bookingData.time === time ? 'selected' : ''}`;
        btn.disabled = isReserved;
        btn.innerHTML = `
            <i class="bx ${isReserved ? 'bx-lock-alt' : 'bx-time-five'}"></i>
            <span class="slot-time-text">${time}</span>
            <span class="slot-badge">${isReserved ? 'محجوز' : 'متاح'}</span>
        `;

        if (!isReserved) {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.slot-pill-btn.selected').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                AppState.bookingData.time = time;
                AppState.bookingData.chair = currentSuite;
                updateSelectedSlotFeedback();
            });
        }
        morningGrid.appendChild(btn);
    });

    // 2. Evening Shift
    const eveningGroup = document.createElement('div');
    eveningGroup.className = 'shift-group';
    eveningGroup.innerHTML = `
        <div class="shift-title"><i class="bx bx-moon"></i> الفترة المسائية (04:30 م - 08:30 م)</div>
        <div class="slots-pill-grid" id="eveningSlotsGrid"></div>
    `;
    const eveningGrid = eveningGroup.querySelector('#eveningSlotsGrid');

    eveningTimes.forEach(time => {
        const isReserved = bookedPairs.some(p => p.time === time && (p.chair === currentSuite || !p.chair));
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `slot-pill-btn ${isReserved ? 'slot-reserved' : 'slot-available'} ${AppState.bookingData.time === time ? 'selected' : ''}`;
        btn.disabled = isReserved;
        btn.innerHTML = `
            <i class="bx ${isReserved ? 'bx-lock-alt' : 'bx-time-five'}"></i>
            <span class="slot-time-text">${time}</span>
            <span class="slot-badge">${isReserved ? 'محجوز' : 'متاح'}</span>
        `;

        if (!isReserved) {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.slot-pill-btn.selected').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                AppState.bookingData.time = time;
                AppState.bookingData.chair = currentSuite;
                updateSelectedSlotFeedback();
            });
        }
        eveningGrid.appendChild(btn);
    });

    container.appendChild(morningGroup);
    container.appendChild(eveningGroup);
    grid.appendChild(container);

    // Auto-select first available slot if none selected yet
    if (!AppState.bookingData.time) {
        const firstAvailable = grid.querySelector('.slot-pill-btn.slot-available');
        if (firstAvailable) {
            firstAvailable.classList.add('selected');
            const timeSpan = firstAvailable.querySelector('.slot-time-text');
            if (timeSpan) {
                AppState.bookingData.time = timeSpan.textContent.trim();
                AppState.bookingData.chair = currentSuite;
                updateSelectedSlotFeedback();
            }
        }
    } else {
        updateSelectedSlotFeedback();
    }
}

function updateSelectedSlotFeedback() {
    const infoCard = document.getElementById('selectedSeatInfoCard');
    const infoDetail = document.getElementById('selectedSeatDetail');
    if (infoCard && infoDetail && AppState.bookingData.time) {
        infoCard.style.display = 'flex';
        const suite = AppState.bookingData.chair || 'عيادة تقويم الأسنان 🦷';
        const date = document.getElementById('bookingDate')?.value || 'اليوم';
        infoDetail.textContent = `${suite} - الساعة ${AppState.bookingData.time} (بتاريخ ${date})`;
    }
}

// Populate summaries in Step 6
function populateSummary() {
    const nameVal = document.getElementById('bookingName')?.value.trim() || 'غير محدد';
    const phoneVal = document.getElementById('bookingPhone')?.value.trim() || 'غير محدد';
    const serviceVal = AppState.bookingData.service || 'تقويم الأسنان الحديث';
    const doctorVal = AppState.bookingData.doctor || 'د. أكثم طنطاوي';
    const dateVal = document.getElementById('bookingDate')?.value || 'اليوم';
    const chairVal = AppState.bookingData.chair || 'عيادة تقويم الأسنان 🦷';
    const timeVal = AppState.bookingData.time || '10:00 ص';

    const sumName = document.getElementById('summaryName');
    const sumPhone = document.getElementById('summaryPhone');
    const sumService = document.getElementById('summaryService');
    const sumDoctor = document.getElementById('summaryDoctor');
    const sumDate = document.getElementById('summaryDate');
    const sumTime = document.getElementById('summaryTime');

    if (sumName) sumName.textContent = nameVal;
    if (sumPhone) sumPhone.textContent = phoneVal;
    if (sumService) sumService.textContent = serviceVal;
    if (sumDoctor) sumDoctor.textContent = doctorVal;
    if (sumDate) sumDate.textContent = dateVal;
    if (sumTime) sumTime.textContent = `${chairVal} - الساعة ${timeVal}`;
}

// Wizard Transitions
function showStep(step) {
    currentStep = step;
    document.querySelectorAll('.wizard-step-panel').forEach(panel => panel.classList.remove('active'));
    document.querySelectorAll('.step-indicator').forEach(ind => ind.classList.remove('active', 'completed'));
    
    const panel = document.getElementById(`stepPanel${step}`);
    if (panel) panel.classList.add('active');
    
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
    
    if (step === 5) {
        generateSeatGrid(document.getElementById('bookingDate')?.value);
    }

    if (step === totalSteps) {
        if (nextBtn) nextBtn.style.display = 'none';
        if (submitBtn) submitBtn.style.display = 'inline-flex';
        populateSummary();
    } else {
        if (nextBtn) nextBtn.style.display = 'inline-flex';
        if (submitBtn) submitBtn.style.display = 'none';
    }

    // Scroll to top of wizard on mobile
    const wrapper = document.querySelector('.booking-card');
    if (wrapper && window.innerWidth < 768) {
        wrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function validateStep(step) {
    if (step === 1) {
        const nameEl = document.getElementById('bookingName');
        const phoneEl = document.getElementById('bookingPhone');
        const ageEl = document.getElementById('bookingAge');

        const name = nameEl?.value.trim() || '';
        const phone = phoneEl?.value.trim() || '';
        const age = ageEl?.value.trim() || '';
        
        if (!name || name.length < 2) {
            if (nameEl) {
                nameEl.focus();
                nameEl.style.borderColor = 'var(--danger)';
            }
            alert('الرجاء كتابة اسم المريض الكامل.');
            return false;
        }
        if (nameEl) nameEl.style.borderColor = '';

        if (!phone || phone.length < 8) {
            if (phoneEl) {
                phoneEl.focus();
                phoneEl.style.borderColor = 'var(--danger)';
            }
            alert('الرجاء إدخال رقم جوال صحيح للتواصل (مثال: 05xxxxxxxx).');
            return false;
        }
        if (phoneEl) phoneEl.style.borderColor = '';

        if (age && (parseInt(age) < 3 || parseInt(age) > 120)) {
            if (ageEl) {
                ageEl.focus();
                ageEl.style.borderColor = 'var(--danger)';
            }
            alert('الرجاء إدخال عمر صحيح بالسنوات.');
            return false;
        }
        if (ageEl) ageEl.style.borderColor = '';

        return true;
    }
    if (step === 2) {
        if (!AppState.bookingData.service) {
            AppState.bookingData.service = 'تقويم الأسنان الحديث';
        }
        return true;
    }
    if (step === 3) {
        if (!AppState.bookingData.doctor) {
            AppState.bookingData.doctor = 'د. أكثم طنطاوي';
        }
        return true;
    }
    if (step === 4) {
        const dateInput = document.getElementById('bookingDate');
        if (!dateInput || !dateInput.value) {
            const today = new Date().toISOString().split('T')[0];
            if (dateInput) dateInput.value = today;
            AppState.bookingData.date = today;
        } else {
            AppState.bookingData.date = dateInput.value;
        }
        return true;
    }
    if (step === 5) {
        if (!AppState.bookingData.chair) {
            AppState.bookingData.chair = 'عيادة تقويم الأسنان 🦷';
        }
        if (!AppState.bookingData.time) {
            // Auto pick first available
            const firstAvailable = document.querySelector('.slot-pill-btn.slot-available');
            if (firstAvailable) {
                const timeSpan = firstAvailable.querySelector('.slot-time-text');
                if (timeSpan) AppState.bookingData.time = timeSpan.textContent.trim();
            } else {
                AppState.bookingData.time = '10:00 ص';
            }
        }
        return true;
    }
    return true;
}

export function initBookingFlow() {
    const bookingForm = document.getElementById('bookingForm');
    const dateInput = document.getElementById('bookingDate');

    if (!bookingForm) return;

    // Set today's date as min and default
    const today = new Date().toISOString().split('T')[0];
    if (dateInput) {
        dateInput.min = today;
        if (!dateInput.value) dateInput.value = today;
    }

    // Default AppState service setup
    AppState.bookingData.service = 'تقويم الأسنان الحديث';
    AppState.bookingData.doctor = 'د. أكثم طنطاوي';
    AppState.bookingData.chair = 'عيادة تقويم الأسنان 🦷';
    AppState.bookingData.time = '10:00 ص';
    AppState.bookingData.date = today;

    // Quick Date Chips logic
    const chipToday = document.getElementById('chipToday');
    const chipTomorrow = document.getElementById('chipTomorrow');
    const chipAfterTomorrow = document.getElementById('chipAfterTomorrow');
    const chips = [chipToday, chipTomorrow, chipAfterTomorrow];

    const setChipActive = (activeBtn) => {
        chips.forEach(c => c && c.classList.remove('active'));
        if (activeBtn) activeBtn.classList.add('active');
    };

    if (chipToday) {
        chipToday.addEventListener('click', () => {
            setChipActive(chipToday);
            dateInput.value = today;
            AppState.bookingData.date = today;
            generateSeatGrid(today);
        });
    }

    if (chipTomorrow) {
        chipTomorrow.addEventListener('click', () => {
            setChipActive(chipTomorrow);
            const tmr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
            dateInput.value = tmr;
            AppState.bookingData.date = tmr;
            generateSeatGrid(tmr);
        });
    }

    if (chipAfterTomorrow) {
        chipAfterTomorrow.addEventListener('click', () => {
            setChipActive(chipAfterTomorrow);
            const aft = new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0];
            dateInput.value = aft;
            AppState.bookingData.date = aft;
            generateSeatGrid(aft);
        });
    }

    // Handle Date Input changes
    if (dateInput) {
        dateInput.addEventListener('change', (e) => {
            chips.forEach(c => c && c.classList.remove('active'));
            AppState.bookingData.date = e.target.value;
            generateSeatGrid(e.target.value);
        });
    }

    // Handle Visual Services Selector click
    const serviceItems = document.querySelectorAll('.service-select-item');
    const hiddenSelect = document.getElementById('bookingService');
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

    // Handle Visual Doctors Selector click
    const doctorCards = document.querySelectorAll('.doctor-select-card');
    doctorCards.forEach(card => {
        card.addEventListener('click', () => {
            doctorCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            AppState.bookingData.doctor = card.getAttribute('data-doctor');
        });
    });

    // Handle Suite Choice in Step 5
    const suiteCards = document.querySelectorAll('.suite-card');
    suiteCards.forEach(card => {
        card.addEventListener('click', () => {
            suiteCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            AppState.bookingData.chair = card.getAttribute('data-suite');
            generateSeatGrid(dateInput?.value);
        });
    });

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
            if (currentStep > 1) {
                currentStep--;
                showStep(currentStep);
            }
        });
    }

    // Step indicators click (allow jumping to previously completed steps)
    for (let i = 1; i <= totalSteps; i++) {
        const ind = document.getElementById(`stepIndicator${i}`);
        if (ind) {
            ind.addEventListener('click', () => {
                if (i < currentStep || validateStep(currentStep)) {
                    showStep(i);
                }
            });
        }
    }

    // SUBMIT BOOKING HANDLER ("تسجيل الحجز")
    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // If submitted prematurely (e.g. Enter pressed on input), advance to next step
        if (currentStep < totalSteps) {
            if (validateStep(currentStep)) {
                currentStep++;
                showStep(currentStep);
            }
            return;
        }

        // Validate Step 1
        if (!validateStep(1)) {
            showStep(1);
            return;
        }

        // Validate Step 4 & 5
        validateStep(4);
        validateStep(5);

        const nameVal = document.getElementById('bookingName').value.trim();
        const phoneVal = document.getElementById('bookingPhone').value.trim();
        const emailVal = document.getElementById('bookingEmail').value.trim() || 'غير مسجل';
        const ageVal = parseInt(document.getElementById('bookingAge').value) || 25;
        const dateVal = document.getElementById('bookingDate').value || today;
        const timeVal = AppState.bookingData.time || '10:00 ص';
        const chairVal = AppState.bookingData.chair || 'عيادة تقويم الأسنان 🦷';
        const serviceVal = AppState.bookingData.service || 'تقويم الأسنان الحديث';
        const doctorVal = AppState.bookingData.doctor || 'د. أكثم طنطاوي';
        const notesVal = document.getElementById('bookingNotes').value.trim() || 'لا توجد ملاحظات إضافية';

        // Generate unique Booking ID
        const bookingId = 'DK-' + Math.floor(1000 + Math.random() * 9000);

        const newBooking = {
            id: bookingId,
            name: nameVal,
            phone: phoneVal,
            email: emailVal,
            age: ageVal,
            service: serviceVal,
            doctor: doctorVal,
            date: dateVal,
            time: timeVal,
            chair: chairVal,
            notes: notesVal,
            status: 'pending',
            timestamp: Date.now()
        };

        // Save cleanly to LocalStorage
        try {
            let bookings = JSON.parse(localStorage.getItem('dr_aktham_bookings') || '[]');
            // Filter out any lingering mock test data
            bookings = bookings.filter(b => b && b.id && !b.id.startsWith('DK-849') && b.name !== 'عبد الرحمن الشمري');
            bookings.unshift(newBooking);
            localStorage.setItem('dr_aktham_bookings', JSON.stringify(bookings));

            // Save patient profile
            localStorage.setItem('current_patient_profile', JSON.stringify({
                name: newBooking.name,
                phone: newBooking.phone,
                email: newBooking.email,
                age: newBooking.age,
                id: bookingId
            }));
        } catch (err) {
            console.error('Failed saving to localStorage:', err);
        }

        // Send Telegram notification (dynamic, non-blocking)
        try {
            import('./telegram.js')
                .then(m => m.sendTelegramNotification && m.sendTelegramNotification(bookingId))
                .catch(() => {});
        } catch (err) {}

        // Non-blocking sync to API if available
        try {
            fetch('/api/book', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newBooking)
            }).catch(() => {});
        } catch (e) {}

        // Smooth transition to success page
        window.location.href = 'success.html';
    });
}

// Populate booking success page details on success.html
export function initSuccessPage() {
    const confirmName = document.getElementById('confirmName');
    if (!confirmName) return;

    try {
        const bookings = JSON.parse(localStorage.getItem('dr_aktham_bookings') || '[]');
        if (bookings.length > 0) {
            const latest = bookings[0];
            const sumName = document.getElementById('confirmName');
            const sumPhone = document.getElementById('confirmPhone');
            const sumService = document.getElementById('confirmService');
            const sumDate = document.getElementById('confirmDate');
            const sumTime = document.getElementById('confirmTime');
            const sumId = document.getElementById('confirmBookingId');
            const sumDoctor = document.getElementById('confirmDoctor');

            if (sumName) sumName.textContent = latest.name || '';
            if (sumPhone) sumPhone.textContent = latest.phone || '';
            if (sumService) sumService.textContent = latest.service || '';
            if (sumDate) sumDate.textContent = latest.date || '';
            if (sumTime) sumTime.textContent = `${latest.chair || ''} - الساعة ${latest.time || ''}`;
            if (sumId) sumId.textContent = latest.id || '';
            if (sumDoctor) sumDoctor.textContent = latest.doctor || 'د. أكثم طنطاوي';

            const waBtn = document.getElementById('confirmWaBtn');
            if (waBtn) {
                const msg = encodeURIComponent(`مرحباً عيادة د. أكثم طنطاوي، قمت بتسجيل حجز موعد باسم (${latest.name}) برقم (${latest.id}) بتاريخ (${latest.date}) الساعة (${latest.time}) لخدمة (${latest.service}). أود تأكيد الحضور.`);
                waBtn.href = `https://wa.me/966501234567?text=${msg}`;
            }
        }
    } catch (e) {}
}

// Robust auto-run helper (handles fast-load / interactive DOM state)
function onReady(fn) {
    if (document.readyState !== 'loading') {
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}

onReady(() => {
    initBookingFlow();
    initSuccessPage();
});
