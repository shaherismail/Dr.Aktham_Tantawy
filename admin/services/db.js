// services/db.js
// Centralized Application State + Database Abstraction Layer
//
// AppState is the single source of truth for all shared runtime data.
// All feature modules import from here instead of using scattered globals.
//
// Future: this layer can wrap Supabase queries with caching, retry logic,
// offline support, and pagination — without touching feature modules.

export const AppState = {
    /** @type {import('@supabase/supabase-js').SupabaseClient|null} */
    supabaseClient: null,

    /** @type {object|null} Supabase auth user object */
    currentUser: null,

    /** @type {'Super Admin'|'Doctor'|'Receptionist'|'Viewer'} */
    currentUserRole: 'Viewer',

    /** @type {object|null} Chart.js instance (dashboard) */
    conversionChart: null,

    /** @type {Date} Currently displayed calendar month */
    currentCalDate: new Date(),
};
