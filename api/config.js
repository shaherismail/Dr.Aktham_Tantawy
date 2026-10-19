// Vercel Serverless API Route: /api/config
// Serves the public Supabase publishable config to the browser.
// Keys live only in Vercel environment variables.
export default function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
    if (!supabaseUrl || !supabaseKey) {
        return res.status(503).json({ error: 'Backend not configured' });
    }
    res.status(200).json({ supabaseUrl, supabaseKey });
}
