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

export async function getSupabase() {
    if (_client) return _client;
    const res = await fetch('/api/config', { cache: 'no-store' });
    if (!res.ok) throw new Error('backend config unavailable');
    const cfg = await res.json();
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    _client = createClient(cfg.supabaseUrl, cfg.supabaseKey);
    return _client;
}

export async function insertBooking(booking) {
    const sb = await getSupabase();
    return sb.from('bookings').insert({
        id: booking.id,
        name: booking.name,
        phone: booking.phone,
        email: booking.email,
        age: booking.age,
        service: booking.service,
        doctor: booking.doctor,
        date: booking.date,
        time: booking.time,
        chair: booking.chair,
        notes: booking.notes,
        status: booking.status || 'pending'
    });
}

export async function insertContact(msg) {
    const sb = await getSupabase();
    return sb.from('contacts').insert({
        id: msg.id,
        name: msg.name,
        phone: msg.phone,
        email: msg.email,
        message: msg.message,
        status: msg.status || 'unread'
    });
}

export async function insertNewsletter(email) {
    const sb = await getSupabase();
    return sb.from('newsletter').insert({
        id: 'NL-' + Date.now(),
        email
    });
}

// Privacy-safe lookup: server returns a row only when booking ID AND phone both match
export async function lookupBookings(query, phone) {
    const sb = await getSupabase();
    const { data, error } = await sb.rpc('lookup_booking', { query, ph: phone });
    if (error) throw error;
    return data || [];
}

// Slots already taken for a date (no patient data returned)
export async function getBookedSlots(date) {
    try {
        const sb = await getSupabase();
        const { data, error } = await sb.rpc('get_booked_slots', { d: date });
        if (error) return [];
        return (data || []).map(r => ({ time: r.slot_time, chair: r.slot_chair }));
    } catch (e) { return []; }
}

// Patient-initiated cancel: needs booking ID + the phone used when booking
export async function cancelBooking(id, phone) {
    const sb = await getSupabase();
    const { data, error } = await sb.rpc('cancel_booking', { bid: id, ph: phone });
    if (error) throw error;
    return data === true;
}
