// ==========================================================================
// Supabase client bootstrap for Dr. Aktham Clinic
// Publishable (anon) key is served by /api/config from Vercel env vars.
// RLS: public may only INSERT bookings/contacts/newsletter. No public reads.
// ==========================================================================
let _client = null;

// Strip characters that can break out of HTML/attributes, plus control chars. Also enforced by DB constraints.
export function clean(value, max = 200) {
    return String(value == null ? '' : value)
        .replace(/[<>"'`\\]/g, '')
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
        .trim()
        .slice(0, max);
}
// Escape for safe HTML insertion (defence in depth for anything coming back from the server).
export function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"'`]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','`':'&#96;'}[c]));
}
// Convert Arabic-Indic / Persian digits to Latin digits.
export function latinDigits(value) {
    return String(value == null ? '' : value)
        .replace(/[\u0660-\u0669]/g, d => d.charCodeAt(0) - 0x0660)
        .replace(/[\u06F0-\u06F9]/g, d => d.charCodeAt(0) - 0x06F0);
}

// ==========================================================================
// DEMO PREVIEW BUILD - no backend, no network writes, demo data only.
// ==========================================================================
const DEMO_TAKEN = [{ time: '06:00 م', chair: null }, { time: '08:00 م', chair: null }];

export async function getSupabase() {
    throw new Error('demo preview: backend disabled');
}

export async function insertBooking() {
    return { data: { demo: true }, error: null };
}

export async function insertContact() {
    return { data: { demo: true }, error: null };
}

export async function insertNewsletter() {
    return { data: { demo: true }, error: null };
}

export async function lookupBookings() {
    return { data: [], error: null };
}

export async function getBookedSlots() {
    // matches the real client: resolves to an array of {time, chair} pairs
    return DEMO_TAKEN.slice();
}

export async function cancelBooking() {
    return { data: null, error: { message: 'demo preview: cancellations disabled' } };
}
