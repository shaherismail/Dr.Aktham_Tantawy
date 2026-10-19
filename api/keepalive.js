// /api/keepalive - daily ping so the free Supabase project is never paused for inactivity.
export default async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;
    if (!url || !key) return res.status(503).json({ ok: false });
    try {
        const r = await fetch(url + '/rest/v1/bookings?select=id&limit=1', { headers: { apikey: key, Authorization: 'Bearer ' + key } });
        return res.status(200).json({ ok: r.ok, status: r.status });
    } catch (e) {
        return res.status(502).json({ ok: false });
    }
}
