// modules/dashboard.js
// Dashboard Statistics Module
// Loads KPI cards and renders the monthly bookings trend chart.

import { AppState } from '../state/AppState.js';

/**
 * Fetches all dashboard statistics in parallel and updates the KPI cards.
 * Also triggers chart rendering.
 */
export function loadDashboardStats() {
    const { supabaseClient } = AppState;
    if (!supabaseClient) return;

    const todayDateStr = new Date().toISOString().split('T')[0];

    Promise.all([
        supabaseClient.from('bookings').select('*', { count: 'exact' }).eq('date', todayDateStr).eq('is_deleted', false),
        supabaseClient.from('bookings').select('*', { count: 'exact' }).gt('date', todayDateStr).eq('is_deleted', false),
        supabaseClient.from('bookings').select('*', { count: 'exact' }).eq('status', 'pending').eq('is_deleted', false),
        supabaseClient.from('bookings').select('phone', { count: 'exact', head: false }).eq('is_deleted', false),
        supabaseClient.from('component_content').select('*', { count: 'exact' }).eq('component_id', '4808cfcf-349c-4932-a083-0a716c52a0a2').eq('is_deleted', false),
    ]).then(([todayRes, upcomingRes, pendingRes, patientsRes, casesRes]) => {
        document.getElementById('statTodayAppts').textContent     = todayRes.count    || 0;
        document.getElementById('statUpcomingAppts').textContent  = upcomingRes.count || 0;
        document.getElementById('statPendingBookings').textContent = pendingRes.count  || 0;

        // Count unique patients by phone number
        const patientSet = new Set();
        if (patientsRes.data) {
            patientsRes.data.forEach(item => patientSet.add(item.phone));
        }
        document.getElementById('statTotalPatients').textContent = patientSet.size || 0;
        document.getElementById('statTotalCases').textContent    = casesRes.count  || 0;

        renderStatsChart();
    });
}

/**
 * Renders or re-renders the monthly bookings trend line chart
 * using Chart.js (loaded from CDN).
 */
export function renderStatsChart() {
    const ctx = document.getElementById('conversionChart').getContext('2d');

    if (AppState.conversionChart) {
        AppState.conversionChart.destroy();
    }

    AppState.conversionChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
            datasets: [{
                label: 'نمو حجوزات المرضى اليومية',
                data: [15, 28, 41, 35, 62, 78],
                borderColor: '#0284c7',
                backgroundColor: 'rgba(2, 132, 199, 0.1)',
                tension: 0.3,
                fill: true,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true },
            },
        },
    });
}
