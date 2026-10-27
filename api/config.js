// DEMO PREVIEW BUILD: no backend configured. Public demo only.
export default function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    res.status(503).json({ error: 'demo preview - backend disabled' });
}
