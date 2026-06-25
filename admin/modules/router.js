// modules/router.js
// SPA Hash Router
// Handles hash-based navigation, activates page views,
// highlights sidebar links, and dispatches feature module loaders.

import { executeGlobalSearch } from '../utils/search.js';

/**
 * Registers the hashchange event listener and the global search input listener.
 * Must be called once during app initialization.
 */
export function setupRouting() {
    window.addEventListener('hashchange', handleRoute);

    document.getElementById('globalSearchInput').addEventListener('input', (e) => {
        executeGlobalSearch(e.target.value.trim());
    });
}

/**
 * Reads the current URL hash, activates the matching page view and sidebar link,
 * then calls the appropriate feature module loader.
 */
export function handleRoute() {
    const hash       = window.location.hash || '#/dashboard';
    const cleanRoute = hash.replace('#/', '');

    // Deactivate all views and sidebar items
    document.querySelectorAll('.page-view').forEach(view => view.classList.remove('active'));
    document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));

    const targetView  = document.getElementById(`view-${cleanRoute}`);
    const sidebarLink = document.querySelector(`.menu-item[data-target="${cleanRoute}"]`);

    if (targetView)  targetView.classList.add('active');
    if (sidebarLink) sidebarLink.classList.add('active');

    // Lazy-load feature modules on demand for better initial performance
    switch (cleanRoute) {
        case 'dashboard':
            import('./dashboard.js').then(({ loadDashboardStats }) => loadDashboardStats());
            break;
        case 'appointments':
            import('./appointments.js').then(({ loadAppointments }) => loadAppointments());
            break;
        case 'patients':
            import('./patients.js').then(({ loadPatients }) => loadPatients());
            break;
        case 'services':
            import('./services.js').then(({ loadServices }) => loadServices());
            break;
        case 'cases':
            import('./cases.js').then(({ loadCases }) => loadCases());
            break;
        case 'media':
            import('./media.js').then(({ loadMediaLibrary }) => loadMediaLibrary());
            break;
        case 'homepage':
            import('./homepage.js').then(({ loadHomepageCMS }) => loadHomepageCMS());
            break;
        case 'doctor':
            import('./doctor.js').then(({ loadDoctorCMS }) => loadDoctorCMS());
            break;
        case 'pages':
            import('./contact.js').then(({ loadContactInbox }) => loadContactInbox());
            break;
        case 'settings':
            import('./settings.js').then(({ loadClinicSettings }) => loadClinicSettings());
            break;
        case 'users':
            import('./users.js').then(({ loadUserRoles }) => loadUserRoles());
            break;
        case 'logs':
            import('./logs.js').then(({ loadAuditLogs }) => loadAuditLogs());
            break;
        case 'recycle-bin':
            import('./recycle.js').then(({ loadRecycleBin }) => loadRecycleBin());
            break;
    }
}
