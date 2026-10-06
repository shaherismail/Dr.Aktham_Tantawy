// Vercel Serverless API Route: /api/book
// Automatically commits patient bookings to GitHub repository if GITHUB_TOKEN is set in Vercel.

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const booking = req.body;
    if (!booking || !booking.id) {
        return res.status(400).json({ error: 'Invalid booking data' });
    }

    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_OWNER || 'shaherismail';
    const repo = process.env.GITHUB_REPO || 'Dr.Aktham_Tantawy';
    const branch = process.env.GITHUB_BRANCH || 'main';
    const filePath = 'data/clinic_data.json';

    if (!token) {
        return res.status(200).json({
            ok: true,
            status: 'local_storage_mode',
            message: 'Booking received. Set GITHUB_TOKEN in Vercel environment variables for automatic GitHub commits.'
        });
    }

    try {
        const getUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`;
        const getResp = await fetch(getUrl, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!getResp.ok) {
            return res.status(200).json({ ok: false, error: 'Could not fetch current clinic_data.json from GitHub' });
        }

        const fileData = await getResp.json();
        const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');
        const clinicData = JSON.parse(currentContent);

        if (!Array.isArray(clinicData.bookings)) {
            clinicData.bookings = [];
        }

        if (!clinicData.bookings.some(b => b.id === booking.id)) {
            clinicData.bookings.unshift(booking);
        }

        clinicData.lastUpdated = new Date().toISOString();
        clinicData.updatedBy = `حجز جديد من الموقع: ${booking.name || 'مريض'} (${booking.id})`;

        const updatedBase64 = Buffer.from(JSON.stringify(clinicData, null, 2), 'utf8').toString('base64');

        const putUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
        const putResp = await fetch(putUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `Booking: حجز موعد جديد ${booking.name} (${booking.id}) - ${booking.date}`,
                content: updatedBase64,
                sha: fileData.sha,
                branch: branch
            })
        });

        if (putResp.ok) {
            const result = await putResp.json();
            return res.status(200).json({
                ok: true,
                syncedToGitHub: true,
                commitSha: result.commit?.sha?.substring(0, 7)
            });
        } else {
            return res.status(200).json({ ok: true, syncedToGitHub: false });
        }
    } catch (err) {
        return res.status(200).json({ ok: true, warning: err.message });
    }
}
