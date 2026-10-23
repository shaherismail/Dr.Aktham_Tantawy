// Profile & Appointment Tracking Module (100% Standalone & LocalStorage/Cloud Driven)
import { esc, cancelBooking, latinDigits } from './supabase-client.js';

export function initPatientProfile() {
    const lookupForm = document.getElementById('lookupBookingForm');
    const lookupInput = document.getElementById('lookupInput');
    const lookupSubmitBtn = document.getElementById('lookupSubmitBtn');
    const loadingEl = document.getElementById('lookupLoading');
    const notFoundEl = document.getElementById('lookupNotFound');
    const foundCardsEl = document.getElementById('lookupFoundCards');

    if (!lookupInput || !foundCardsEl) return;

    // Search executor function (async to pull from localStorage AND remote clinic_data.json)
    const executeLookup = async (query) => {
        const cleanQuery = (query || '').trim().toLowerCase();
        if (!cleanQuery) return;

        if (loadingEl) loadingEl.style.display = 'block';
        if (notFoundEl) notFoundEl.style.display = 'none';
        foundCardsEl.style.display = 'none';
        foundCardsEl.innerHTML = '';

        try {
            // 1. Gather local bookings
            let allBookings = [];
            try {
                allBookings = JSON.parse(localStorage.getItem('dr_aktham_bookings') || '[]');
            } catch (e) {
                allBookings = [];
            }

            // 2. Privacy-safe remote lookup via Supabase RPC (by ID or phone only)
            let remoteMatches = [];
            try {
                const m = await import('./supabase-client.js');
                // Privacy: a booking is only shown remotely when BOTH the booking ID and its phone match.
                const phoneEl = document.getElementById('lookupPhone');
                const typedPhone = latinDigits(phoneEl ? phoneEl.value : '').replace(/\D/g, '');
                const core = typedPhone.length >= 9 ? typedPhone.slice(-9) : '';
                if (core && /[a-z]/i.test(cleanQuery)) {
                    const found = await m.lookupBookings(cleanQuery, typedPhone);
                    remoteMatches = (found || []).filter(b => b && (b.id || '').toLowerCase() === cleanQuery && (b.phone || '').replace(/\D/g, '').slice(-9) === core);
                }
            } catch (err) {
                console.warn('Could not look up remote bookings:', err);
            }

            // 3. Normalize digits for phone matching (e.g. 010973936821 vs +2010973936821 vs 05xxxxxxxx)
            const qCleanDigits = cleanQuery.replace(/\D/g, '');
            // Extract the core last 9 digits (handles country codes like +966 or +20 or leading 0)
            const qCorePhone = qCleanDigits.length >= 9 ? qCleanDigits.slice(-9) : qCleanDigits;

            // 4. Filter bookings by ID, phone, or patient name
            const matches = allBookings.filter(b => {
                if (!b) return false;
                const bId = (b.id || '').toLowerCase().trim();
                const bPhone = (b.phone || '').replace(/\D/g, '');
                const bCorePhone = bPhone.length >= 9 ? bPhone.slice(-9) : bPhone;
                const bName = (b.name || '').toLowerCase();

                // Direct ID match (e.g. DK-8421 or 8421)
                if (bId === cleanQuery || bId.replace(/[^a-z0-9]/g, '') === cleanQuery.replace(/[^a-z0-9]/g, '')) {
                    return true;
                }

                // Phone match (checks core last 9 digits or contains)
                if (qCleanDigits.length >= 6) {
                    if (bPhone.includes(qCleanDigits) || qCleanDigits.includes(bPhone)) return true;
                    if (qCorePhone.length >= 8 && bCorePhone.length >= 8 && (bPhone.includes(qCorePhone) || qCleanDigits.includes(bCorePhone))) return true;
                }

                // Name match
                if (cleanQuery.length >= 3 && bName.includes(cleanQuery)) {
                    return true;
                }

                return false;
            });

            // Merge remote RPC matches (dedupe by id)
            // The clinic database is the source of truth: its status/details replace any local copy.
            if (remoteMatches.length > 0) {
                remoteMatches.forEach(b => {
                    if (!b || !b.id) return;
                    const i = matches.findIndex(x => x.id === b.id);
                    if (i >= 0) matches[i] = { ...matches[i], ...b }; else matches.push(b);
                });
            }
            // Cancelled bookings are not shown as active appointments
            for (let i = matches.length - 1; i >= 0; i--) { if (matches[i].status === 'cancelled') matches.splice(i, 1); }

            if (loadingEl) loadingEl.style.display = 'none';

            if (matches.length === 0) {
                if (notFoundEl) {
                    const notFoundText = notFoundEl.querySelector('p');
                    if (notFoundText) {
                        notFoundText.innerHTML = `لم نتمكن من مطابقة رقم الحجز مع رقم الجوال.<br>تأكد من كتابتهما بشكل صحيح أو تواصل مع العيادة على 01070542331.`;
                    }
                    notFoundEl.style.display = 'block';
                }
                foundCardsEl.style.display = 'none';
            } else {
                if (notFoundEl) notFoundEl.style.display = 'none';
                renderFoundBookings(matches, foundCardsEl);
                foundCardsEl.style.display = 'block';
            }
        } catch (err) {
            console.error('Error in executeLookup:', err);
            if (loadingEl) loadingEl.style.display = 'none';
            if (notFoundEl) notFoundEl.style.display = 'block';
        }
    };

    // Form submission event
    if (lookupForm) {
        lookupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            executeLookup(lookupInput.value);
        });
    }

    // Direct button click event
    if (lookupSubmitBtn) {
        lookupSubmitBtn.addEventListener('click', (e) => {
            e.preventDefault();
            executeLookup(lookupInput.value);
        });
    }

    // Input Enter key press
    lookupInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            executeLookup(lookupInput.value);
        }
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
        const savedProfile = JSON.parse(sessionStorage.getItem('current_patient_profile') || 'null');
        if (savedProfile && (savedProfile.id || savedProfile.phone)) {
            lookupInput.value = savedProfile.id || savedProfile.phone;
            const pe = document.getElementById('lookupPhone'); if (pe && savedProfile.phone) pe.value = savedProfile.phone;
            executeLookup(lookupInput.value);
        }
    } catch (e) {}
}

// Renders matching patient bookings
function renderFoundBookings(bookings, container) {
    container.innerHTML = '';

    bookings.forEach(b => {
        const isConfirmed = b.status === 'confirmed';
        const card = document.createElement('div');
        card.className = 'booking-status-card';

        const waText = encodeURIComponent(`مرحباً عيادة د. أكثم، أود الاستفسار/التأكيد بخصوص موعدي رقم ${esc(b.id)} باسم ${esc(b.name)} بتاريخ ${esc(b.date)} الساعة ${esc(b.time)}.`);
        const waLink = `https://wa.me/201070542331?text=${waText}`;

        card.innerHTML = `
            <div class="status-header-row">
                <div>
                    <span style="font-size: 13px; font-weight: 800; color: var(--primary); background: var(--primary-subtle); padding: 4px 12px; border-radius: var(--radius-full); font-family: 'Outfit';">
                        معرف الحجز: ${esc(b.id)}
                    </span>
                    <h3 style="font-size: 20px; font-weight: 800; color: var(--dark); margin-top: 8px;">
                        المريض: ${esc(b.name)}
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
                        <div class="meta-box-val">${esc(b.date)}</div>
                    </div>
                </div>

                <div class="meta-box-item">
                    <div class="meta-box-icon"><i class="bx bx-time-five"></i></div>
                    <div>
                        <div class="meta-box-lbl">توقيت الجلسة</div>
                        <div class="meta-box-val">${esc(b.time)}</div>
                    </div>
                </div>

                <div class="meta-box-item">
                    <div class="meta-box-icon"><i class="bx bx-first-aid"></i></div>
                    <div>
                        <div class="meta-box-lbl">الخدمة المطلوبة</div>
                        <div class="meta-box-val">${esc(b.service)}</div>
                    </div>
                </div>

                <div class="meta-box-item">
                    <div class="meta-box-icon"><i class="bx bx-building-house"></i></div>
                    <div>
                        <div class="meta-box-lbl">مكان الكشف</div>
                        <div class="meta-box-val">${esc(b.chair || 'العيادة الرئيسية 1')}</div>
                    </div>
                </div>
            </div>

            <div style="background: var(--bg); padding: 14px 18px; border-radius: var(--radius-md); margin-bottom: 20px; border: 1px solid var(--border-light); font-size: 13px; color: var(--text-muted); display: flex; align-items: center; gap: 8px;">
                <i class="bx bx-map-pin" style="color: var(--primary); font-size: 18px;"></i>
                <span>موقع العيادة: الزقازيق، موقف المنصورة، بجوار مستشفى الطوارئ التخصصي - عيادة د. أكثم طنطاوي لطب الأسنان.</span>
            </div>

            <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                <a href="${waLink}" target="_blank" class="btn btn-whatsapp" style="flex: 1; min-width: 200px;">
                    <i class="bx bxl-whatsapp"></i> تواصل مع العيادة لتأكيد الموعد
                </a>
                <button type="button" class="btn btn-outline cancel-btn" data-id="${esc(b.id)}" style="color: #EF4444; border-color: rgba(239, 68, 68, 0.3);">
                    <i class="bx bx-trash"></i> إلغاء الحجز
                </button>
            </div>
        `;

        const cancelBtn = card.querySelector('.cancel-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', async () => {
                if (!confirm(`هل أنت متأكد من رغبتك في إلغاء الحجز رقم (${b.id})؟`)) return;
                const phoneIn = prompt('للتأكيد، اكتب رقم الجوال الذي حجزت به:');
                if (!phoneIn) return;
                cancelBtn.disabled = true;
                try {
                    const ok = await cancelBooking(b.id, latinDigits(phoneIn).replace(/[\s\-()]/g, ''));
                    if (!ok) {
                        cancelBtn.disabled = false;
                        alert('رقم الجوال غير مطابق لهذا الحجز، لم يتم الإلغاء. يمكنك التواصل مع العيادة لإلغاء الموعد.');
                        return;
                    }
                } catch (err) {
                    cancelBtn.disabled = false;
                    alert('تعذر إلغاء الحجز الآن. حاول مرة أخرى أو تواصل مع العيادة.');
                    return;
                }
                try {
                    let bookingsList = JSON.parse(localStorage.getItem('dr_aktham_bookings') || '[]');
                    bookingsList = bookingsList.filter(item => item.id !== b.id);
                    localStorage.setItem('dr_aktham_bookings', JSON.stringify(bookingsList));
                    const prof = JSON.parse(sessionStorage.getItem('current_patient_profile') || 'null');
                    if (prof && prof.id === b.id) { sessionStorage.removeItem('current_patient_profile'); sessionStorage.removeItem('dr_aktham_last_booking'); }
                } catch (e) {}
                alert('تم إلغاء الحجز بنجاح.');
                card.remove();
                if (container.children.length === 0) {
                    const notFoundEl = document.getElementById('lookupNotFound');
                    if (notFoundEl) notFoundEl.style.display = 'block';
                }
            });
        }

        container.appendChild(card);
    });
}

// Alias export for backward compatibility
export const updatePatientProfilePage = initPatientProfile;

// Auto-run initialization (handles both fast interactive DOM and loading states)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPatientProfile);
} else {
    initPatientProfile();
}
