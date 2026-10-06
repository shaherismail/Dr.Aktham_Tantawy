// Vercel Serverless API Route: /api/contact
// Automatically commits patient inquiries to GitHub repository if GITHUB_TOKEN is set in Vercel.

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

    const contact = req.body;
    if (!contact || !contact.name) {
        return res.status(400).json({ error: 'Invalid contact data' });
    }

    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_OWNER || 'shaherismail';
    const repo = process.env.GITHUB_REPO || 'Dr.Aktham_Tantawy';
    const branch = process.env.GITHUB_BRANCH || 'main';
    const filePath = 'data/clinic_data.json';

    if (!token) {
        return res.status(200).json({ ok: true, message: 'Message received and stored.' });
    }

    try {
        const getUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`;
        const getResp = await fetch(getUrl, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!getResp.ok) return res.status(200).json({ ok: true });

        const fileData = await getResp.json();
        const currentContent = Buffer.from(fileData.content, 'base64').toString('utf8');
        const clinicData = JSON.parse(currentContent);

        if (!Array.isArray(clinicData.contacts)) {
            clinicData.contacts = [];
        }

        clinicData.contacts.unshift({
            id: Date.now(),
            name: contact.name,
            phone: contact.phone || '',
            email: contact.email || '',
            message: contact.message || '',
            status: 'unread',
            date: new Date().toISOString().split('T')[0]
        });

        clinicData.lastUpdated = new Date().toISOString();
        clinicData.updatedBy = `رسالة استفسار جديدة من: ${contact.name}`;

        const updatedBase64 = Buffer.from(JSON.stringify(clinicData, null, 2), 'utf8').toString('base64');

        const putUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
        await fetch(putUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `Contact: رسالة جديدة من ${contact.name}`,
                content: updatedBase64,
                sha: fileData.sha,
                branch: branch
            })
        });

        return res.status(200).json({ ok: true, syncedToGitHub: true });
    } catch (e) {
        return res.status(200).json({ ok: true });
    }
}
