// ==========================================================================
// GitHub REST API Integration & Vercel Auto-Deploy Engine
// 100% Free, Standalone, Secure Client-side CMS for Dr. Aktham Clinic
// ==========================================================================

const STORAGE_KEYS = {
    TOKEN: 'dr_aktham_gh_token',
    OWNER: 'dr_aktham_gh_owner',
    REPO: 'dr_aktham_gh_repo',
    BRANCH: 'dr_aktham_gh_branch',
    FILEPATH: 'dr_aktham_gh_filepath',
    AUTOSYNC: 'dr_aktham_gh_autosync',
    LAST_SYNC: 'dr_aktham_gh_last_sync',
    LAST_COMMIT_URL: 'dr_aktham_gh_last_commit_url',
    LAST_COMMIT_SHA: 'dr_aktham_gh_last_commit_sha'
};

const DEFAULT_CONFIG = {
    owner: 'shaherismail',
    repo: 'Dr.Aktham_Tantawy',
    branch: 'main',
    filePath: 'data/clinic_data.json',
    autoSync: true
};

/**
 * Retrieve stored GitHub configuration
 */
export function getGithubConfig() {
    return {
        token: (localStorage.getItem(STORAGE_KEYS.TOKEN) || '').trim(),
        owner: (localStorage.getItem(STORAGE_KEYS.OWNER) || DEFAULT_CONFIG.owner).trim(),
        repo: (localStorage.getItem(STORAGE_KEYS.REPO) || DEFAULT_CONFIG.repo).trim(),
        branch: (localStorage.getItem(STORAGE_KEYS.BRANCH) || DEFAULT_CONFIG.branch).trim(),
        filePath: (localStorage.getItem(STORAGE_KEYS.FILEPATH) || DEFAULT_CONFIG.filePath).trim(),
        autoSync: localStorage.getItem(STORAGE_KEYS.AUTOSYNC) === null ? true : localStorage.getItem(STORAGE_KEYS.AUTOSYNC) === 'true',
        lastSync: localStorage.getItem(STORAGE_KEYS.LAST_SYNC) || null,
        lastCommitUrl: localStorage.getItem(STORAGE_KEYS.LAST_COMMIT_URL) || null,
        lastCommitSha: localStorage.getItem(STORAGE_KEYS.LAST_COMMIT_SHA) || null
    };
}

/**
 * Save updated GitHub configuration
 */
export function saveGithubConfig(config = {}) {
    if (config.token !== undefined) localStorage.setItem(STORAGE_KEYS.TOKEN, config.token.trim());
    if (config.owner !== undefined) localStorage.setItem(STORAGE_KEYS.OWNER, config.owner.trim());
    if (config.repo !== undefined) localStorage.setItem(STORAGE_KEYS.REPO, config.repo.trim());
    if (config.branch !== undefined) localStorage.setItem(STORAGE_KEYS.BRANCH, config.branch.trim());
    if (config.filePath !== undefined) localStorage.setItem(STORAGE_KEYS.FILEPATH, config.filePath.trim());
    if (config.autoSync !== undefined) localStorage.setItem(STORAGE_KEYS.AUTOSYNC, config.autoSync ? 'true' : 'false');
}

/**
 * UTF-8 safe String to Base64 encoding for Arabic text
 */
function utf8ToBase64(str) {
    const bytes = new TextEncoder().encode(str);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

/**
 * Test connectivity and token authorization against GitHub API
 */
export async function testGithubConnection() {
    const config = getGithubConfig();
    if (!config.token) {
        return { ok: false, error: 'لم يتم إدخال توكن GitHub (Personal Access Token). يرجى إدخاله أولاً.' };
    }

    try {
        const resp = await fetch(`https://api.github.com/repos/${config.owner}/${config.repo}`, {
            headers: {
                'Authorization': `Bearer ${config.token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (resp.status === 401) {
            return { ok: false, error: 'التوكن غير صالح أو منتهي الصلاحية (Bad credentials).' };
        }
        if (resp.status === 404) {
            return { ok: false, error: `المستودع (${config.owner}/${config.repo}) غير موجود أو ليس للتوكن صلاحية الوصول إليه.` };
        }
        if (!resp.ok) {
            const err = await resp.json().catch(() => ({}));
            return { ok: false, error: err.message || `خطأ استجابة من GitHub: ${resp.status}` };
        }

        const repoData = await resp.json();

        // Also fetch authenticated user details
        const userResp = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `Bearer ${config.token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        }).catch(() => null);

        let userData = null;
        if (userResp && userResp.ok) {
            userData = await userResp.json();
        }

        return {
            ok: true,
            repo: {
                name: repoData.full_name,
                defaultBranch: repoData.default_branch,
                isPrivate: repoData.private,
                updatedAt: repoData.updated_at,
                stars: repoData.stargazers_count
            },
            user: userData ? {
                login: userData.login,
                name: userData.name,
                avatar: userData.avatar_url
            } : null
        };
    } catch (e) {
        return { ok: false, error: 'تعذر الاتصال بـ GitHub API. تأكد من اتصال الإنترنت: ' + e.message };
    }
}

/**
 * Gather full clinic state from localStorage into a clean JSON structure
 */
export function compileCurrentClinicData() {
    let generalSettings = {};
    try {
        generalSettings = JSON.parse(localStorage.getItem('dr_aktham_general_settings') || '{}');
    } catch (e) {}

    let services = [];
    try {
        services = JSON.parse(localStorage.getItem('dr_aktham_services') || '[]');
    } catch (e) {}

    let testimonials = [];
    try {
        testimonials = JSON.parse(localStorage.getItem('dr_aktham_testimonials') || '[]');
    } catch (e) {}

    return {
        lastUpdated: new Date().toISOString(),
        updatedBy: "لوحة تحكم د. أكثم عبر GitHub API (مزامنة تلقائية)",
        generalSettings,
        services,
        testimonials
    };
}

/**
 * Send / Commit clinic data directly to GitHub repository via REST API
 * Triggers automatic Vercel production rebuild & deployment (~20s)
 */
export async function pushDataToGitHub(customMessage = null) {
    const config = getGithubConfig();
    if (!config.token) {
        throw new Error('يرجى حفظ توكن GitHub أولاً لتفعيل النشر والمزامنة التلقائية.');
    }

    const payload = compileCurrentClinicData();
    const jsonContent = JSON.stringify(payload, null, 2);
    const base64Content = utf8ToBase64(jsonContent);

    // 1. Fetch current file SHA if file already exists on GitHub
    let currentSha = null;
    try {
        const getUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.filePath}?ref=${config.branch}`;
        const getResp = await fetch(getUrl, {
            headers: {
                'Authorization': `Bearer ${config.token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (getResp.ok) {
            const fileData = await getResp.json();
            currentSha = fileData.sha;
        }
    } catch (e) {
        console.warn('Could not check existing file SHA:', e);
    }

    // 2. Prepare PUT commit body
    const nowArabic = new Date().toLocaleString('ar-SA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const commitMessage = customMessage || `CMS: تحديث بيانات العيادة والأسعار تلقائياً (${nowArabic})`;

    const putBody = {
        message: commitMessage,
        content: base64Content,
        branch: config.branch
    };

    if (currentSha) {
        putBody.sha = currentSha;
    }

    // 3. Send PUT request to GitHub Contents API
    const putUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.filePath}`;
    const putResp = await fetch(putUrl, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${config.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(putBody)
    });

    if (!putResp.ok) {
        const errData = await putResp.json().catch(() => ({}));
        throw new Error(errData.message || `فشل الحفظ في GitHub برمز استجابة: ${putResp.status}`);
    }

    const result = await putResp.json();
    const commitSha = result.commit?.sha ? result.commit.sha.substring(0, 7) : 'محدث';
    const commitUrl = result.commit?.html_url || `https://github.com/${config.owner}/${config.repo}/commits/${config.branch}`;

    // Record last sync metadata
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
    localStorage.setItem(STORAGE_KEYS.LAST_COMMIT_URL, commitUrl);
    localStorage.setItem(STORAGE_KEYS.LAST_COMMIT_SHA, commitSha);

    return {
        success: true,
        commitSha,
        commitUrl,
        timestamp: new Date()
    };
}
