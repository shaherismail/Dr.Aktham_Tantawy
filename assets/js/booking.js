import { AppState, supabaseClient } from './app.js';
import { sendTelegramNotification } from './telegram.js';

// Dynamics Seating Matrix Generator (Cinema seat style slots connected to Supabase)
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

    // If Supabase is active, save to cloud
    if (supabaseClient) {
        supabaseClient.from('bookings').insert([{
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

export function initBookingFlow() {
    const bookingForm = document.getElementById('bookingForm');
    const dateInput = document.getElementById('bookingDate');

    if (!bookingForm) return;

    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;

    // Set default select to VIP slot index
    AppState.bookingData.chair = '';
    AppState.bookingData.time = '';

    dateInput.addEventListener('change', (e) => {
        generateSeatGrid(e.target.value);
    });

    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!AppState.bookingData.chair || !AppState.bookingData.time) {
            alert('الرجاء اختيار العيادة ووقت الفحص المفضل من لوحة المقاعد قبل التأكيد.');
            return;
        }

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

        // Save to LocalStorage
        saveBookingToLocalStorage(bookingId);

        // Send Notification to Telegram
        sendTelegramNotification(bookingId);

        // Transition to success page
        window.location.href = 'success';
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
