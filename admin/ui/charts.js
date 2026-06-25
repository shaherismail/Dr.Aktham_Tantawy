// ui/charts.js
// Chart Rendering Module
// Wraps Chart.js interactions. All chart creation/destruction goes here.

import { AppState } from '../services/db.js';

/**
 * Renders or re-renders the monthly bookings trend line chart.
 * Destroys the existing chart instance before creating a new one to avoid
 * Chart.js canvas reuse warnings.
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
