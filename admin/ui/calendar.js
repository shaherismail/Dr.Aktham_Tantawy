// ui/calendar.js
// Calendar Rendering Module
// Renders the monthly booking calendar grid with appointment tickets,
// today highlight, and HTML5 drag-and-drop rescheduling.

import { AppState } from '../services/db.js';
import { logAuditAction } from '../services/audit.js';

/**
 * Renders the monthly calendar grid for the currently active month in AppState.
 * Fetches bookings for that month and populates appointment tickets per day.
 */
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

    const year          = currentCalDate.getFullYear();
    const month         = currentCalDate.getMonth();
    const firstDayIndex = (new Date(year, month, 1).getDay() + 1) % 7; // Saturday-start RTL
    const totalDays     = new Date(year, month + 1, 0).getDate();
    const startStr      = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const endStr        = `${year}-${String(month + 1).padStart(2, '0')}-${totalDays}`;
    const todayStr      = new Date().toISOString().split('T')[0];

    supabaseClient.from('bookings')
        .select('*')
        .eq('is_deleted', false)
        .gte('date', startStr)
        .lte('date', endStr)
        .then(({ data }) => {
            const bookings = data || [];

            // Leading empty cells (offset for first day of month)
            for (let i = 0; i < firstDayIndex; i++) {
                const emptyCell     = document.createElement('div');
                emptyCell.className = 'calendar-cell empty';
                cellsContainer.appendChild(emptyCell);
            }

            // Day cells
            for (let day = 1; day <= totalDays; day++) {
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const cell    = document.createElement('div');
                cell.className = 'calendar-cell';
                if (dateStr === todayStr) cell.classList.add('today');

                cell.innerHTML = `<span class="calendar-date-number">${day}</span>`;

                // Appointment tickets for this day
                bookings
                    .filter(b => b.date === dateStr)
                    .forEach(b => {
                        const ticket      = document.createElement('div');
                        ticket.className  = `calendar-appointment-ticket ${b.status === 'confirmed' ? 'confirmed' : 'pending'}`;
                        ticket.textContent = `${b.time} - ${b.name}`;
                        ticket.title       = `${b.name} (${b.service})`;
                        ticket.onclick     = () => alert(
                            `📂 تفاصيل الحجز:\nمريض: ${b.name}\nالهاتف: ${b.phone}\nالخدمة: ${b.service}\nالوقت: ${b.time}\nملاحظات: ${b.notes || 'لا يوجد'}`
                        );
                        cell.appendChild(ticket);
                    });

                // HTML5 drag-and-drop rescheduling
                cell.ondragover = (e) => e.preventDefault();
                cell.ondrop     = (e) => {
                    e.preventDefault();
                    const drag = JSON.parse(e.dataTransfer.getData('text/plain') || '{}');
                    if (drag.id && AppState.currentUserRole !== 'Viewer') {
                        supabaseClient.from('bookings').update({ date: dateStr }).eq('id', drag.id)
                            .then(({ error }) => {
                                if (!error) {
                                    logAuditAction('bookings:reschedule', `bookings:${drag.id}`, { date: drag.date }, { date: dateStr });
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
