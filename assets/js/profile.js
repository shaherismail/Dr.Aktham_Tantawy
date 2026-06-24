import { supabaseClient } from './app.js';
import { executeSimulatedConfirm } from './telegram.js';

export function updatePatientProfilePage() {
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
    if (supabaseClient && p) {
        supabaseClient.from('bookings')
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
export function cancelBooking(bookingId) {
    let bookings = JSON.parse(localStorage.getItem('dr_aktham_bookings') || '[]');
    bookings = bookings.filter(b => b.id !== bookingId);
    localStorage.setItem('dr_aktham_bookings', JSON.stringify(bookings));

    if (supabaseClient) {
        supabaseClient.from('bookings')
            .delete()
            .eq('id', bookingId)
            .then(({ error }) => {
                if (error) console.error('Supabase delete error:', error);
                else console.log(`Supabase booking ${bookingId} deleted.`);
            });
    }

    updatePatientProfilePage();
}

export function initPatientProfile() {
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

            alert('✅ تم حفظ إعدادات Supabase ومزامنة الاتصال!');
            
            // Re-render profile lists
            updatePatientProfilePage();
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
                
                if (supabaseClient) {
                    supabaseClient.from('testimonials').insert([{
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

// Auto-run layout binder
document.addEventListener('DOMContentLoaded', () => {
    initPatientProfile();
});
