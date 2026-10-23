import { AppState } from './app.js';
import { clean, latinDigits, getBookedSlots, insertBooking } from './supabase-client.js';

// Local (device) calendar date as YYYY-MM-DD. toISOString() is UTC and gives the wrong day around midnight.
function localDate(offsetDays = 0) {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function slotMinutes(label) {
    const m = /(\d{1,2}):(\d{2})\s*(ص|م)/.exec(label || '');
    if (!m) return null;
    let h = parseInt(m[1], 10) % 12;
    if (m[3] === 'م') h += 12;
    return h * 60 + parseInt(m[2], 10);
}
function isPastSlot(label, dateStr) {
    if (dateStr !== localDate()) return false;
    const mins = slotMinutes(label);
    const now = new Date();
    return mins !== null && mins <= now.getHours() * 60 + now.getMinutes();
}
const remoteBookedCache = {};

function showFieldError(el, msg) {
    if (!el) return;
    el.focus();
    el.style.borderColor = 'var(--danger)';
    let n = el.parentElement.querySelector('.field-error-msg');
    if (!n) {
        n = document.createElement('div');
        n.className = 'field-error-msg';
        n.setAttribute('role', 'alert');
        n.style.cssText = 'color:#DC2626;font-size:14px;margin-top:6px;font-weight:700;line-height:1.6';
        el.insertAdjacentElement('afterend', n);
    }
    n.textContent = msg;
    try { el.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (e) {}
}
function clearFieldError(el) {
    if (!el) return;
    el.style.borderColor = '';
    const n = el.parentElement && el.parentElement.querySelector('.field-error-msg');
    if (n) n.remove();
}

let currentStep = 1;
const totalSteps = 6;

// Real clinic schedule (Zagazig): Sat & Mon-Wed 5-10 PM, Sun 1-6 PM, Thu & Fri closed.
function slotsForDate(dateStr) {
    const day = new Date((dateStr || localDate()) + 'T12:00:00').getDay();
    if (day === 4 || day === 5) return { closed: true, morning: [], evening: [] };
    if (day === 0) return { closed: false, morning: [], evening: ["01:00 م", "02:00 م", "03:00 م", "04:00 م", "05:00 م"] };
    return { closed: false, morning: [], evening: ["05:00 م", "06:00 م", "07:00 م", "08:00 م", "09:00 م"] };
}

// Dynamic Appointment Slots Generator
export function generateSeatGrid(dateString) {
    const grid = document.getElementById('cinemaSeatsGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const selectedDate = dateString || document.getElementById('bookingDate')?.value || localDate();
    if (!(selectedDate in remoteBookedCache)) {
        remoteBookedCache[selectedDate] = null; // fetching
        getBookedSlots(selectedDate).then(list => { remoteBookedCache[selectedDate] = list; generateSeatGrid(selectedDate); });
    }
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

    if (Array.isArray(remoteBookedCache[selectedDate])) {
        bookedPairs = bookedPairs.concat(remoteBookedCache[selectedDate]);
    }
    const slotTaken = (time) => bookedPairs.some(p => p.time === time && (p.chair === currentSuite || !p.chair));
    const slotBlocked = (time) => slotTaken(time) || isPastSlot(time, selectedDate);
    const daySlots = slotsForDate(selectedDate);
    const allDaySlots = daySlots.morning.concat(daySlots.evening);
    // Drop a previously chosen slot that is no longer available (taken, past, or outside this day's schedule)
    if (AppState.bookingData.time && (!allDaySlots.includes(AppState.bookingData.time) || slotBlocked(AppState.bookingData.time))) {
        AppState.bookingData.time = '';
    }

    if (daySlots.closed) {
        const closedMsg = document.createElement('p');
        closedMsg.setAttribute('role', 'alert');
        closedMsg.style.cssText = 'color:#B45309;font-weight:700;margin-top:14px;line-height:1.8';
        closedMsg.textContent = 'العيادة مغلقة يومي الخميس والجمعة. برجاء اختيار يوماً آخر.';
        grid.appendChild(closedMsg);
        return;
    }

    const container = document.createElement('div');
    container.className = 'slots-wrapper-box';

    // 1. Morning Shift
    const morningGroup = document.createElement('div');
    morningGroup.className = 'shift-group';
    morningGroup.innerHTML = `
        <div class="shift-title"><i class="bx bx-sun"></i> الفترة الصباحية (${daySlots.morning[0]} - ${daySlots.morning[daySlots.morning.length - 1]})</div>
        <div class="slots-pill-grid" id="morningSlotsGrid"></div>
    `;
    const morningGrid = morningGroup.querySelector('#morningSlotsGrid');

    daySlots.morning.forEach(time => {
        const isReserved = slotBlocked(time);
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `slot-pill-btn ${isReserved ? 'slot-reserved' : 'slot-available'} ${AppState.bookingData.time === time ? 'selected' : ''}`;
        btn.disabled = isReserved;
        btn.innerHTML = `
            <i class="bx ${isReserved ? 'bx-lock-alt' : 'bx-time-five'}"></i>
            <span class="slot-time-text">${time}</span>
            <span class="slot-badge">${isReserved ? (isPastSlot(time, selectedDate) && !slotTaken(time) ? 'انتهى' : 'محجوز') : 'متاح'}</span>
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
        <div class="shift-title"><i class="bx bx-moon"></i> الفترة المسائية (${daySlots.evening[0]} - ${daySlots.evening[daySlots.evening.length - 1]})</div>
        <div class="slots-pill-grid" id="eveningSlotsGrid"></div>
    `;
    const eveningGrid = eveningGroup.querySelector('#eveningSlotsGrid');

    daySlots.evening.forEach(time => {
        const isReserved = slotBlocked(time);
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `slot-pill-btn ${isReserved ? 'slot-reserved' : 'slot-available'} ${AppState.bookingData.time === time ? 'selected' : ''}`;
        btn.disabled = isReserved;
        btn.innerHTML = `
            <i class="bx ${isReserved ? 'bx-lock-alt' : 'bx-time-five'}"></i>
            <span class="slot-time-text">${time}</span>
            <span class="slot-badge">${isReserved ? (isPastSlot(time, selectedDate) && !slotTaken(time) ? 'انتهى' : 'محجوز') : 'متاح'}</span>
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

    if (daySlots.morning.length) container.appendChild(morningGroup);
    if (daySlots.evening.length) container.appendChild(eveningGroup);
    grid.appendChild(container);

    if (!grid.querySelector('.slot-pill-btn.slot-available')) {
        const msg = document.createElement('p');
        msg.setAttribute('role', 'alert');
        msg.style.cssText = 'color:#B45309;font-weight:700;margin-top:14px;line-height:1.8';
        msg.textContent = 'لا توجد مواعيد متاحة في هذا اليوم. اختر يوماً آخر من الخطوة السابقة.';
        grid.appendChild(msg);
        const card = document.getElementById('selectedSeatInfoCard');
        if (card) card.style.display = 'none';
    }

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
    const timeVal = AppState.bookingData.time || '-';

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
        const emailEl = document.getElementById('bookingEmail');
        const ageEl = document.getElementById('bookingAge');
        [nameEl, phoneEl, emailEl, ageEl].forEach(clearFieldError);

        const name = clean(nameEl?.value, 100);
        if (nameEl && nameEl.value !== name && nameEl.value.trim() !== name) nameEl.value = name;
        if (name.length < 2) {
            showFieldError(nameEl, 'الرجاء كتابة اسم المريض (حرفان على الأقل).');
            return false;
        }

        const phoneRaw = latinDigits(phoneEl?.value || '').replace(/[\s\-()]/g, '');
        const phoneDigits = phoneRaw.replace(/^\+/, '');
        if (!/^\d{8,15}$/.test(phoneDigits)) {
            showFieldError(phoneEl, 'الرجاء إدخال رقم جوال صحيح من 8 إلى 15 رقماً (أرقام فقط).');
            return false;
        }
        if (phoneEl) phoneEl.value = phoneRaw;

        const email = (emailEl?.value || '').trim();
        if (email && !/^[^@\s<>"'`\\]+@[^@\s<>"'`\\]+\.[^@\s<>"'`\\]+$/.test(email)) {
            showFieldError(emailEl, 'البريد الإلكتروني غير صحيح. اتركه فارغاً إن لم يكن لديك بريد.');
            return false;
        }

        const age = latinDigits(ageEl?.value || '').trim();
        if (age && (!/^\d{1,3}$/.test(age) || parseInt(age, 10) < 3 || parseInt(age, 10) > 120)) {
            showFieldError(ageEl, 'الرجاء إدخال عمر صحيح بالسنوات (من 3 إلى 120).');
            return false;
        }
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
        const today = localDate();
        if (!dateInput || !dateInput.value || dateInput.value < today) {
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
            const firstAvailable = document.querySelector('.slot-pill-btn.slot-available');
            if (firstAvailable) {
                const timeSpan = firstAvailable.querySelector('.slot-time-text');
                if (timeSpan) AppState.bookingData.time = timeSpan.textContent.trim();
            }
        }
        if (!AppState.bookingData.time) {
            alert('لا توجد مواعيد متاحة في هذا اليوم. اختر يوماً آخر.');
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

    // Set today's date as min and default
    const today = localDate();
    if (dateInput) {
        dateInput.min = today;
        if (!dateInput.value) dateInput.value = today;
    }

    // Default AppState service setup
    AppState.bookingData.service = 'تقويم الأسنان الحديث';
    AppState.bookingData.doctor = 'د. أكثم طنطاوي';
    AppState.bookingData.chair = 'عيادة تقويم الأسنان 🦷';
    AppState.bookingData.time = '';
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
            const tmr = localDate(1);
            dateInput.value = tmr;
            AppState.bookingData.date = tmr;
            generateSeatGrid(tmr);
        });
    }

    if (chipAfterTomorrow) {
        chipAfterTomorrow.addEventListener('click', () => {
            setChipActive(chipAfterTomorrow);
            const aft = localDate(2);
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

    ['bookingName', 'bookingPhone', 'bookingEmail', 'bookingAge'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', () => clearFieldError(el));
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
    bookingForm.addEventListener('submit', async (e) => {
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

        validateStep(4);

        const submitBtn = document.getElementById('submitBookingBtn');
        if (submitBtn && submitBtn.dataset.busy === '1') return; // block double taps
        if (!validateStep(5)) { showStep(5); return; }

        const nameVal = clean(document.getElementById('bookingName').value, 100);
        const phoneVal = latinDigits(document.getElementById('bookingPhone').value).replace(/[\s\-()]/g, '').slice(0, 20);
        const emailVal = clean(document.getElementById('bookingEmail').value, 254) || 'غير مسجل';
        const ageParsed = parseInt(latinDigits(document.getElementById('bookingAge').value), 10);
        const ageVal = Number.isFinite(ageParsed) ? ageParsed : null;
        const dateVal = document.getElementById('bookingDate').value || localDate();
        const timeVal = AppState.bookingData.time;
        const chairVal = AppState.bookingData.chair || 'عيادة تقويم الأسنان 🦷';
        const serviceVal = AppState.bookingData.service || 'تقويم الأسنان الحديث';
        const doctorVal = AppState.bookingData.doctor || 'د. أكثم طنطاوي';
        const notesVal = clean(document.getElementById('bookingNotes').value, 1000) || 'لا توجد ملاحظات إضافية';

        const newBooking = {
            name: nameVal, phone: phoneVal, email: emailVal, age: ageVal,
            service: serviceVal, doctor: doctorVal, date: dateVal, time: timeVal,
            chair: chairVal, notes: notesVal, status: 'pending', timestamp: Date.now()
        };

        const origLabel = submitBtn ? submitBtn.innerHTML : '';
        if (submitBtn) { submitBtn.dataset.busy = '1'; submitBtn.disabled = true; submitBtn.textContent = 'جارٍ تسجيل الحجز...'; }

        // Save to the clinic database FIRST. Retry with a new ID if the ID is already taken.
        let saved = false;
        let lastTimedOut = false;
        let bookingId = 'DK-' + Math.floor(1000 + Math.random() * 9000);
        for (let attempt = 0; attempt < 6 && !saved; attempt++) {
            newBooking.id = bookingId;
            let res;
            try {
                res = await Promise.race([
                    insertBooking(newBooking),
                    new Promise(r => setTimeout(() => r({ error: { code: 'timeout' } }), 10000))
                ]);
            } catch (err) {
                res = { error: { code: 'exception' } };
            }
            if (!res || !res.error) { saved = true; break; }
            if (res.error.code === '23505') {
                if (lastTimedOut) { saved = true; break; } // our earlier timed-out request actually landed
                bookingId = 'DK-' + Math.floor(10000 + Math.random() * 90000);
                lastTimedOut = false;
                continue;
            }
            lastTimedOut = res.error.code === 'timeout';
            await new Promise(r => setTimeout(r, 800));
        }

        if (!saved) {
            if (submitBtn) { submitBtn.dataset.busy = '0'; submitBtn.disabled = false; submitBtn.innerHTML = origLabel; }
            alert('تعذر تسجيل الحجز الآن. تأكد من الاتصال بالإنترنت وحاول مرة أخرى، أو تواصل مع العيادة مباشرة.');
            return;
        }

        try {
            let bookings = JSON.parse(localStorage.getItem('dr_aktham_bookings') || '[]');
            bookings = bookings.filter(b => b && b.id && !b.id.startsWith('DK-849') && b.name !== 'عبد الرحمن الشمري');
            bookings.unshift(newBooking);
            localStorage.setItem('dr_aktham_bookings', JSON.stringify(bookings));
            localStorage.setItem('current_patient_profile', JSON.stringify({
                name: newBooking.name, phone: newBooking.phone, email: newBooking.email, age: newBooking.age, id: bookingId
            }));
        } catch (err) {
            console.error('Failed saving to localStorage:', err);
        }

        try {
            import('./telegram.js')
                .then(m => m.sendTelegramNotification && m.sendTelegramNotification(bookingId))
                .catch(() => {});
        } catch (err) {}

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
                const msg = encodeURIComponent(`مرحباً عيادة د. أكثم طنطاوي، قمت بتسجيل حجز موعد باسم (${latest.name || '-'}) برقم (${latest.id || '-'}) بتاريخ (${latest.date || '-'}) الساعة (${latest.time || '-'}) لخدمة (${latest.service || '-'}). أود تأكيد الحضور.`);
                waBtn.href = `https://wa.me/201070542331?text=${msg}`;
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
