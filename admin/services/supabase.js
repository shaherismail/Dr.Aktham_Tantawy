// services/supabase.js
// Supabase Client Factory — initializes and provides the client instance.
// The UI and feature modules must never call window.supabase directly.

import { AppState } from '../state/AppState.js';

/**
 * Creates and stores the Supabase client in AppState.
 * @param {string} url - Supabase project URL
 * @param {string} key - Supabase anon/service key
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
export function initSupabaseClient(url, key) {
    AppState.supabaseClient = window.supabase.createClient(url, key);
    return AppState.supabaseClient;
}

/**
 * Returns the active Supabase client from AppState.
 * @returns {import('@supabase/supabase-js').SupabaseClient|null}
 */
export function getSupabaseClient() {
    return AppState.supabaseClient;
}
