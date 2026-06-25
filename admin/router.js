// router.js
// SPA Hash Router
// Registers hashchange listener, reads URL hash, activates the matching view
// and sidebar link, then lazy-loads the corresponding feature module.

import { executeGlobalSearch } from './utils.js';

/**
 * Registers the hashchange event and global search input listener.
 * Call once during app initialization.
 */
export function setupRouting() {
    window.addEventListener('hashchange', handleRoute);
    document.getElementById('globalSearchInput').addEventListener('input', (e) => {
        executeGlobalSearch(e.target.value.trim());
    });
}

/**
 * Reads the current hash, activates the matching page view and sidebar link,
 * then calls the corresponding feature module loader via dynamic import.
 */
export function handleRoute() {
    const hash       = window.location.hash || '#/dashboard';
    const cleanRoute = hash.replace('#/', '');

    document.querySelectorAll('.page-view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));

    document.getElementById(`view-${cleanRoute}`)?.classList.add('active');
    document.querySelector(`.menu-item[data-target="${cleanRoute}"]`)?.classList.add('active');

    // Lazy-load feature modules — only fetched on first navigation to that section
    switch (cleanRoute) {
        case 'dashboard':   import('./dashboard.js').then(m => m.loadDashboardStats());  break;
        case 'appointments':import('./appointments.js').then(m => m.loadAppointments()); break;
        case 'patients':    import('./patients.js').then(m => m.loadPatients());         break;
        case 'services':    import('./services.js').then(m => m.loadServices());         break;
        case 'cases':       import('./cases.js').then(m => m.loadCases());               break;
        case 'media':       import('./media.js').then(m => m.loadMediaLibrary());        break;
        case 'homepage':    import('./homepage.js').then(m => m.loadHomepageCMS());      break;
        case 'doctor':      import('./doctor.js').then(m => m.loadDoctorCMS());          break;
        case 'pages':       import('./contact.js').then(m => m.loadContactInbox());      break;
        case 'settings':    import('./settings.js').then(m => m.loadClinicSettings());   break;
        case 'users':       import('./users.js').then(m => m.loadUserRoles());           break;
        case 'logs':        import('./logs.js').then(m => m.loadAuditLogs());            break;
        case 'recycle-bin': import('./recycle.js').then(m => m.loadRecycleBin());        break;
    }
}
