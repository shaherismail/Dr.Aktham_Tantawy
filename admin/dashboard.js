// dashboard.js
// Dashboard Statistics Module
// Fetches KPI stats in parallel and delegates chart rendering to ui/charts.js.

import { AppState } from './services/db.js';
import { renderStatsChart } from './ui/charts.js';

/**
 * Fetches all dashboard KPI stats in parallel and populates the stat cards.
 * Delegates chart rendering to ui/charts.js.
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
        document.getElementById('statTodayAppts').textContent      = todayRes.count    || 0;
        document.getElementById('statUpcomingAppts').textContent   = upcomingRes.count || 0;
        document.getElementById('statPendingBookings').textContent = pendingRes.count  || 0;

        const patientSet = new Set();
        (patientsRes.data || []).forEach(item => patientSet.add(item.phone));
        document.getElementById('statTotalPatients').textContent = patientSet.size || 0;
        document.getElementById('statTotalCases').textContent    = casesRes.count  || 0;

        renderStatsChart();
    });
}
