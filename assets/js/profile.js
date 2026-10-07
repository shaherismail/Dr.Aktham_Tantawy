// Profile & Appointment Tracking Module (100% Standalone & LocalStorage Driven)

export function initPatientProfile() {
    const lookupForm = document.getElementById('lookupBookingForm');
    const lookupInput = document.getElementById('lookupInput');
    const loadingEl = document.getElementById('lookupLoading');
    const notFoundEl = document.getElementById('lookupNotFound');
    const foundCardsEl = document.getElementById('lookupFoundCards');

    if (!lookupForm || !lookupInput || !foundCardsEl) return;

    // Search executor function
    const executeLookup = (query) => {
        const cleanQuery = query.trim().toLowerCase();
        if (!cleanQuery) return;

        if (loadingEl) loadingEl.style.display = 'block';
        if (notFoundEl) notFoundEl.style.display = 'none';
        foundCardsEl.style.display = 'none';

        setTimeout(() => {
            if (loadingEl) loadingEl.style.display = 'none';

            let allBookings = [];
            try {
                allBookings = JSON.parse(localStorage.getItem('dr_aktham_bookings') || '[]');
            } catch (e) {
                allBookings = [];
            }

            // Filter bookings by ID or phone or name match
            const matches = allBookings.filter(b => {
                const bId = (b.id || '').toLowerCase();
                const bPhone = (b.phone || '').replace(/[^0-9]/g, '');
                const bName = (b.name || '').toLowerCase();
                const qCleanDigits = cleanQuery.replace(/[^0-9]/g, '');

                return bId === cleanQuery || 
                       (qCleanDigits.length >= 6 && bPhone.includes(qCleanDigits)) ||
                       (cleanQuery.length >= 3 && bName.includes(cleanQuery));
            });

            if (matches.length === 0) {
                if (notFoundEl) notFoundEl.style.display = 'block';
                foundCardsEl.style.display = 'none';
            } else {
                if (notFoundEl) notFoundEl.style.display = 'none';
                renderFoundBookings(matches, foundCardsEl);
                foundCardsEl.style.display = 'block';
            }
        }, 250);
    };

    // Form submission
    lookupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        executeLookup(lookupInput.value);
    });

    // Check URL parameters for direct deep-link (e.g. ?id=BK-1234 or ?phone=05xxxxxxxx)
    const urlParams = new URLSearchParams(window.location.search);
    const paramId = urlParams.get('id');
    const paramPhone = urlParams.get('phone');

    if (paramId) {
        lookupInput.value = paramId;
        executeLookup(paramId);
        return;
    }

    if (paramPhone) {
        lookupInput.value = paramPhone;
        executeLookup(paramPhone);
        return;
    }

    // Otherwise check if patient recently booked in this session
    try {
        const savedProfile = JSON.parse(localStorage.getItem('current_patient_profile') || 'null');
        if (savedProfile && (savedProfile.id || savedProfile.phone)) {
            lookupInput.value = savedProfile.id || savedProfile.phone;
            executeLookup(lookupInput.value);
        }
    } catch (e) {
        // No auto search
    }
}

// Renders matching patient bookings
function renderFoundBookings(bookings, container) {
    container.innerHTML = '';

    bookings.forEach(b => {
        const isConfirmed = b.status === 'confirmed';
        const card = document.createElement('div');
        card.className = 'booking-status-card';

        const waText = encodeURIComponent(`مرحباً عيادة د. أكثم، أود الاستفسار/التأكيد بخصوص موعدي رقم ${b.id} باسم ${b.name} بتاريخ ${b.date} الساعة ${b.time}.`);
        const waLink = `https://wa.me/966501234567?text=${waText}`;

        card.innerHTML = `
            <div class="status-header-row">
                <div>
                    <span style="font-size: 13px; font-weight: 800; color: var(--primary); background: var(--primary-subtle); padding: 4px 12px; border-radius: var(--radius-full); font-family: 'Outfit';">
                        معرف الحجز: ${b.id}
                    </span>
                    <h3 style="font-size: 20px; font-weight: 800; color: var(--dark); margin-top: 8px;">
                        المريض: ${b.name}
                    </h3>
                </div>
                <div>
                    <span style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: var(--radius-full); font-size: 13px; font-weight: 800; ${isConfirmed ? 'background: #ECFDF5; color: #059669;' : 'background: #FFFBEB; color: #D97706;'}">
                        ${isConfirmed ? '<i class="bx bx-check-double"></i> موعد مؤكد وموافق عليه' : '<i class="bx bx-time"></i> قيد مراجعة وتأكيد العيادة'}
                    </span>
                </div>
            </div>

            <div class="booking-meta-grid">
                <div class="meta-box-item">
                    <div class="meta-box-icon"><i class="bx bx-calendar"></i></div>
                    <div>
                        <div class="meta-box-lbl">تاريخ الموعد</div>
                        <div class="meta-box-val">${b.date}</div>
                    </div>
                </div>

                <div class="meta-box-item">
                    <div class="meta-box-icon"><i class="bx bx-time-five"></i></div>
                    <div>
                        <div class="meta-box-lbl">توقيت الجلسة</div>
                        <div class="meta-box-val">${b.time}</div>
                    </div>
                </div>

                <div class="meta-box-item">
                    <div class="meta-box-icon"><i class="bx bx-first-aid"></i></div>
                    <div>
                        <div class="meta-box-lbl">الخدمة المطلوبة</div>
                        <div class="meta-box-val">${b.service}</div>
                    </div>
                </div>

                <div class="meta-box-item">
                    <div class="meta-box-icon"><i class="bx bx-building-house"></i></div>
                    <div>
                        <div class="meta-box-lbl">مكان الكشف</div>
                        <div class="meta-box-val">${b.chair || 'العيادة الرئيسية 1'}</div>
                    </div>
                </div>
            </div>

            <div style="background: var(--bg); padding: 14px 18px; border-radius: var(--radius-md); margin-bottom: 20px; border: 1px solid var(--border-light); font-size: 13px; color: var(--text-muted); display: flex; align-items: center; gap: 8px;">
                <i class="bx bx-map-pin" style="color: var(--primary); font-size: 18px;"></i>
                <span>موقع العيادة: الرياض، شارع التخصصي - عيادة د. أكثم إسماعيل طنطاوي لتقويم الأسنان.</span>
            </div>

            <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                <a href="${waLink}" target="_blank" class="btn btn-whatsapp" style="flex: 1; min-width: 200px;">
                    <i class="bx bxl-whatsapp"></i> تواصل مع العيادة لتأكيد الموعد
                </a>
                <button type="button" class="btn btn-outline cancel-btn" data-id="${b.id}" style="color: #EF4444; border-color: rgba(239, 68, 68, 0.3);">
                    <i class="bx bx-trash"></i> إلغاء الحجز
                </button>
            </div>
        `;

        const cancelBtn = card.querySelector('.cancel-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                if (confirm(`هل أنت متأكد من رغبتك في إلغاء الحجز رقم (${b.id})؟`)) {
                    let bookingsList = JSON.parse(localStorage.getItem('dr_aktham_bookings') || '[]');
                    bookingsList = bookingsList.filter(item => item.id !== b.id);
                    localStorage.setItem('dr_aktham_bookings', JSON.stringify(bookingsList));
                    alert('تم إلغاء الحجز بنجاح.');
                    card.remove();
                    if (container.children.length === 0) {
                        const notFoundEl = document.getElementById('lookupNotFound');
                        if (notFoundEl) notFoundEl.style.display = 'block';
                    }
                }
            });
        }

        container.appendChild(card);
    });
}

// Alias export for backward compatibility
export const updatePatientProfilePage = initPatientProfile;

// Auto-run initialization
document.addEventListener('DOMContentLoaded', () => {
    initPatientProfile();
});
