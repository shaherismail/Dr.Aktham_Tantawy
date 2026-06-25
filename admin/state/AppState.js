// state/AppState.js
// Centralized Application State — Single Source of Truth
// All modules import this object instead of relying on scattered globals.

export const AppState = {
    /** @type {import('@supabase/supabase-js').SupabaseClient|null} */
    supabaseClient: null,

    /** @type {object|null} Supabase auth user object */
    currentUser: null,

    /** @type {'Super Admin'|'Doctor'|'Receptionist'|'Viewer'} */
    currentUserRole: 'Viewer',

    /** @type {object|null} Chart.js instance for dashboard */
    conversionChart: null,

    /** @type {Date} Currently displayed calendar month */
    currentCalDate: new Date(),
};
