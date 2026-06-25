// modules/appointments.js
// Appointment Manager Module
// Handles: calendar rendering, booking CRUD, drag-and-drop rescheduling,
// pending bookings list, and status updates.

import { AppState } from '../state/AppState.js';
import { logAuditAction } from '../services/audit.js';
import { softDeleteRecord } from '../utils/helpers.js';

// ---------------------------------------------------------------------------
// ENTRY POINT
// ---------------------------------------------------------------------------

/** Initializes the appointments view: calendar, pending list, controls. */
export function loadAppointments() {
    renderCalendarView();
    loadPendingBookingsList();
    setupCalendarControls();
}

// ---------------------------------------------------------------------------
// CALENDAR CONTROLS
// ---------------------------------------------------------------------------

/**
 * Binds previous/next month buttons and the manual booking form submission.
 * Clones buttons to prevent duplicate listener accumulation.
 */
export function setupCalendarControls() {
    const prevBtn = document.getElementById('calPrevMonthBtn');
    const nextBtn = document.getElementById('calNextMonthBtn');

    // Replace nodes to clear any existing listeners before re-binding
    const newPrevBtn = prevBtn.cloneNode(true);
    const newNextBtn = nextBtn.cloneNode(true);
    prevBtn.parentNode.replaceChild(newPrevBtn, prevBtn);
    nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);

    newPrevBtn.addEventListener('click', () => {
        AppState.currentCalDate.setMonth(AppState.currentCalDate.getMonth() - 1);
        renderCalendarView();
    });
    newNextBtn.addEventListener('click', () => {
        AppState.currentCalDate.setMonth(AppState.currentCalDate.getMonth() + 1);
        renderCalendarView();
    });

    // Open add appointment modal
    document.getElementById('openAddApptModalBtn').onclick = () => {
        document.getElementById('bookingModal').style.display = 'flex';
    };

    // Booking form submit handler
    const bookingForm = document.getElementById('bookingForm');
    bookingForm.onsubmit = (e) => {
        e.preventDefault();

        if (AppState.currentUserRole === 'Viewer') {
            alert('عذراً: حساب المشاهد (Viewer) لا يملك صلاحية تعديل أو جدولة الحجوزات.');
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

        const bookingId = 'bk_' + Math.random().toString(36).substr(2, 9);

        AppState.supabaseClient.from('bookings').insert([{
            id: bookingId,
            name, phone, email, service, age, date, time, chair, notes,
            status: 'confirmed',
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

// ---------------------------------------------------------------------------
// CALENDAR RENDERING
// ---------------------------------------------------------------------------

/** Renders the monthly calendar grid with appointment tickets per day. */
export function renderCalendarView() {
    const { supabaseClient, currentCalDate } = AppState;

    const monthNames = [
        'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
    ];

    document.getElementById('calendarMonthTitle').textContent =
        `${monthNames[currentCalDate.getMonth()]} ${currentCalDate.getFullYear()}`;

    const cellsContainer = document.getElementById('calendarCellsContainer');
    cellsContainer.innerHTML = '';

    const year           = currentCalDate.getFullYear();
    const month          = currentCalDate.getMonth();
    const firstDayIndex  = (new Date(year, month, 1).getDay() + 1) % 7; // Saturday-start
    const totalDays      = new Date(year, month + 1, 0).getDate();
    const startStr       = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const endStr         = `${year}-${String(month + 1).padStart(2, '0')}-${totalDays}`;

    supabaseClient.from('bookings')
        .select('*')
        .eq('is_deleted', false)
        .gte('date', startStr)
        .lte('date', endStr)
        .then(({ data }) => {
            const bookingsList = data || [];
            const todayStr     = new Date().toISOString().split('T')[0];

            // Leading empty cells
            for (let i = 0; i < firstDayIndex; i++) {
                const emptyCell = document.createElement('div');
                emptyCell.className = 'calendar-cell empty';
                cellsContainer.appendChild(emptyCell);
            }

            // Day cells
            for (let day = 1; day <= totalDays; day++) {
                const cell    = document.createElement('div');
                cell.className = 'calendar-cell';

                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                if (dateStr === todayStr) cell.classList.add('today');

                cell.innerHTML = `<span class="calendar-date-number">${day}</span>`;

                // Appointment tickets
                bookingsList
                    .filter(b => b.date === dateStr)
                    .forEach(b => {
                        const ticket = document.createElement('div');
                        ticket.className = `calendar-appointment-ticket ${b.status === 'confirmed' ? 'confirmed' : 'pending'}`;
                        ticket.textContent = `${b.time} - ${b.name}`;
                        ticket.title       = `${b.name} (${b.service})`;
                        ticket.onclick     = () => {
                            alert(`📂 تفاصيل الحجز:\nمريض: ${b.name}\nالهاتف: ${b.phone}\nالخدمة: ${b.service}\nالوقت: ${b.time}\nملاحظات: ${b.notes || 'لا يوجد'}`);
                        };
                        cell.appendChild(ticket);
                    });

                // Drag-and-drop rescheduling
                cell.ondragover = (e) => e.preventDefault();
                cell.ondrop     = (e) => {
                    e.preventDefault();
                    const dragData = JSON.parse(e.dataTransfer.getData('text/plain') || '{}');
                    if (dragData.id && AppState.currentUserRole !== 'Viewer') {
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

// ---------------------------------------------------------------------------
// PENDING BOOKINGS LIST
// ---------------------------------------------------------------------------

/** Loads all non-deleted bookings into the appointments table. */
export function loadPendingBookingsList() {
    const { supabaseClient } = AppState;
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
                tr.draggable = true;
                tr.ondragstart = (e) => {
                    e.dataTransfer.setData('text/plain', JSON.stringify({ id: b.id, date: b.date }));
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
                            ${!isConfirmed ? `<button class="btn btn-secondary btn-sm approve-appt-btn" data-id="${b.id}" title="موافقة"><i class="bx bx-check"></i></button>` : ''}
                            <button class="btn btn-secondary btn-sm cancel-appt-btn" data-id="${b.id}" title="إلغاء الموعد"><i class="bx bx-x"></i></button>
                            <button class="btn btn-danger btn-sm delete-appt-btn" data-id="${b.id}" title="حذف للمهملات"><i class="bx bx-trash"></i></button>
                        </div>
                    </td>
                `;

                listBody.appendChild(tr);

                const approveBtn = tr.querySelector('.approve-appt-btn');
                if (approveBtn) {
                    approveBtn.onclick = () => updateBookingStatus(b.id, 'confirmed');
                }
                tr.querySelector('.cancel-appt-btn').onclick  = () => updateBookingStatus(b.id, 'cancelled');
                tr.querySelector('.delete-appt-btn').onclick  = () => softDeleteRecord('bookings', b.id, loadAppointments);
            });
        });
}

// ---------------------------------------------------------------------------
// STATUS UPDATE
// ---------------------------------------------------------------------------

/**
 * Updates a booking's status field.
 * @param {string} bookingId
 * @param {'confirmed'|'cancelled'} status
 */
export function updateBookingStatus(bookingId, status) {
    const { supabaseClient, currentUserRole } = AppState;

    if (currentUserRole === 'Viewer') {
        alert('حساب المشاهد لا يملك صلاحية تغيير الحجوزات.');
        return;
    }

    supabaseClient.from('bookings').update({ status }).eq('id', bookingId)
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
