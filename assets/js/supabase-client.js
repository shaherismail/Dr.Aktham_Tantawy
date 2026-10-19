// ==========================================================================
// Supabase client bootstrap for Dr. Aktham Clinic
// Publishable (anon) key is served by /api/config from Vercel env vars.
// RLS: public may only INSERT bookings/contacts/newsletter. No public reads.
// ==========================================================================
let _client = null;

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

// Privacy-safe lookup: server-side filtered by booking ID or phone digits only
export async function lookupBookings(query) {
    const sb = await getSupabase();
    const { data, error } = await sb.rpc('lookup_booking', { query });
    if (error) throw error;
    return data || [];
}
