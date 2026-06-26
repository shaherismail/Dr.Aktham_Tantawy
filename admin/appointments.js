// appointments.js
// Appointment Manager Module
// Handles: calendar setup, booking form CRUD, pending bookings table,
// and status updates. Calendar rendering is delegated to ui/calendar.js.

import { AppState } from './services/db.js';
import { logAuditAction } from './services/audit.js';
import { softDeleteRecord } from './utils.js';
import { renderCalendarView } from './ui/calendar.js';
import { setTableLoading, setTableError } from './ui/table.js';

// ---------------------------------------------------------------------------
// ENTRY POINT
// ---------------------------------------------------------------------------

/** Initializes the appointments view. */
export function loadAppointments() {
    renderCalendarView();
    loadPendingBookingsList();
    setupCalendarControls();
}

// ---------------------------------------------------------------------------
// CALENDAR CONTROLS
// ---------------------------------------------------------------------------

/** Binds prev/next month buttons and the manual booking form. */
export function setupCalendarControls() {
    const prevBtn = document.getElementById('calPrevMonthBtn');
    const nextBtn = document.getElementById('calNextMonthBtn');

    // Clone to clear stale listeners before re-binding
    const newPrev = prevBtn.cloneNode(true);
    const newNext = nextBtn.cloneNode(true);
    prevBtn.parentNode.replaceChild(newPrev, prevBtn);
    nextBtn.parentNode.replaceChild(newNext, nextBtn);

    newPrev.addEventListener('click', () => {
        AppState.currentCalDate.setMonth(AppState.currentCalDate.getMonth() - 1);
        renderCalendarView();
    });
    newNext.addEventListener('click', () => {
        AppState.currentCalDate.setMonth(AppState.currentCalDate.getMonth() + 1);
        renderCalendarView();
    });

    document.getElementById('openAddApptModalBtn').onclick = () => {
        document.getElementById('bookingModal').style.display = 'flex';
    };

    const bookingForm = document.getElementById('bookingForm');
    bookingForm.onsubmit = (e) => {
        e.preventDefault();
        if (AppState.currentUserRole === 'Viewer') {
            alert('عذراً: حساب المشاهد لا يملك صلاحية جدولة الحجوزات.');
            return;
        }

        const name    = document.getElementById('bkFormName').value;
        const phone   = document.getElementById('bkFormPhone').value;
        const email   = document.getElementById('bkFormEmail').value;
        const service = document.getElementById('bkFormService').value;
        const age     = parseInt(document.getElementById('bkFormAge').value) || 20;
        const date    = document.getElementById('bkFormDate').value;
        const time    = document.getElementById('bkFormTime').value;
        const chair   = document.getElementById('bkFormChair').value;
        const notes   = document.getElementById('bkFormNotes').value;
        const id      = 'bk_' + Math.random().toString(36).substr(2, 9);

        AppState.supabaseClient.from('bookings').insert([{
            id, name, phone, email, service, age, date, time, chair, notes, status: 'confirmed',
        }]).then(({ error }) => {
            if (error) {
                alert('خطأ أثناء الإدخال: ' + error.message);
            } else {
                logAuditAction('bookings:insert', `bookings:${id}`, null, { name, service, date, time });
                alert('✅ تم تسجيل الموعد الجديد بنجاح ومزامنته!');
                document.getElementById('bookingModal').style.display = 'none';
                bookingForm.reset();
                loadAppointments();
            }
        });
    };
}

// ---------------------------------------------------------------------------
// PENDING BOOKINGS LIST
// ---------------------------------------------------------------------------

/** Loads all bookings into the appointments table. */
export function loadPendingBookingsList() {
    const listBody = document.getElementById('appointmentsListTableBody');
    setTableLoading('appointmentsListTableBody', 7);

    AppState.supabaseClient.from('bookings')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
            if (error || !data) { setTableError('appointmentsListTableBody', 7, 'فشل تحميل المواعيد.'); return; }

            listBody.innerHTML = '';
            data.forEach(b => {
                const tr          = document.createElement('tr');
                tr.draggable      = true;
                tr.ondragstart    = (e) => e.dataTransfer.setData('text/plain', JSON.stringify({ id: b.id, date: b.date }));
                const isConfirmed = b.status === 'confirmed';

                tr.innerHTML = `
                    <td style="font-weight:600;">${b.name}</td>
                    <td>${b.phone}</td>
                    <td>${b.service}</td>
                    <td>${b.date} • ${b.time}</td>
                    <td>${b.chair || 'عيادة 1'}</td>
                    <td><span class="badge ${isConfirmed ? 'badge-success' : 'badge-warning'}">${isConfirmed ? 'مؤكد' : 'معلق'}</span></td>
                    <td>
                        <div style="display:flex; gap:6px;">
                            ${!isConfirmed ? `<button class="btn btn-secondary btn-sm approve-btn" title="موافقة"><i class="bx bx-check"></i></button>` : ''}
                            <button class="btn btn-secondary btn-sm cancel-btn" title="إلغاء"><i class="bx bx-x"></i></button>
                            <button class="btn btn-danger btn-sm delete-btn" title="حذف"><i class="bx bx-trash"></i></button>
                        </div>
                    </td>
                `;

                listBody.appendChild(tr);
                tr.querySelector('.approve-btn')?.addEventListener('click', () => updateBookingStatus(b.id, 'confirmed'));
                tr.querySelector('.cancel-btn').addEventListener('click', ()  => updateBookingStatus(b.id, 'cancelled'));
                tr.querySelector('.delete-btn').addEventListener('click', ()  => softDeleteRecord('bookings', b.id, loadAppointments));
            });
        });
}

// ---------------------------------------------------------------------------
// STATUS UPDATE
// ---------------------------------------------------------------------------

/**
 * Updates a booking's status in Supabase.
 * @param {string} bookingId
 * @param {'confirmed'|'cancelled'} status
 */
export function updateBookingStatus(bookingId, status) {
    if (AppState.currentUserRole === 'Viewer') { alert('لا يملك حساب المشاهد صلاحية تغيير الحجوزات.'); return; }

    AppState.supabaseClient.from('bookings').update({ status }).eq('id', bookingId)
        .then(({ error }) => {
            if (error) {
                alert(error.message);
            } else {
                logAuditAction('bookings:update_status', `bookings:${bookingId}`, null, { status });
                alert(`✅ تم تحديث حالة الحجز إلى: ${status === 'confirmed' ? 'مؤكد' : 'ملغي'}`);
                loadAppointments();
            }
        });
}
