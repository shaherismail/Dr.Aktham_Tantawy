// ==========================================================================
// GitHub REST API Integration & Vercel Auto-Deploy Engine
// 100% Free, Standalone, Secure Client-side CMS for Dr. Aktham Clinic
// ==========================================================================
import { GeneralSettings } from './settings/general.js';
import { defaultGalleryCases } from './gallery.js';

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
        // 1. Fetch authenticated user details first to see WHO owns this token
        const userResp = await fetch(`https://api.github.com/user?_nocache=${Date.now()}`, {
            cache: 'no-store',
            headers: {
                'Authorization': `Bearer ${config.token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (userResp.status === 401) {
            return { ok: false, error: 'التوكن غير صالح أو منتهي الصلاحية (Bad credentials). يرجى التأكد من نسخه بشكل صحيح.' };
        }

        let userData = null;
        if (userResp.ok) {
            userData = await userResp.json();
        }

        // 2. Fetch repository information
        const resp = await fetch(`https://api.github.com/repos/${config.owner}/${config.repo}?_nocache=${Date.now()}`, {
            cache: 'no-store',
            headers: {
                'Authorization': `Bearer ${config.token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache'
            }
        });

        if (resp.status === 404) {
            return { ok: false, error: `المستودع (${config.owner}/${config.repo}) غير موجود أو ليس للتوكن صلاحية الوصول إليه.` };
        }
        if (!resp.ok) {
            const err = await resp.json().catch(() => ({}));
            return { ok: false, error: err.message || `خطأ استجابة من GitHub: ${resp.status}` };
        }

        const repoData = await resp.json();
        const oauthScopes = resp.headers.get('x-oauth-scopes');
        const hasPushPermission = !!(repoData.permissions && repoData.permissions.push === true);

        // 3. Validate write/push permission on repository
        if (!hasPushPermission) {
            let errorMsg = '';
            const userLogin = userData?.login || 'غير معروف';

            if (userData && userData.login.toLowerCase() !== config.owner.toLowerCase()) {
                errorMsg = `تنبيه: التوكن ينتمي لحساب (${userLogin})، بينما المستودع مملوك للحساب (${config.owner})! يرجى إما تسجيل الدخول بحساب (${config.owner}) في المتصفح وإنشاء التوكن منه، أو إضافة حساب (${userLogin}) كـ Collaborator في إعدادات المستودع.`;
            } else if (oauthScopes !== null) {
                // Classic token
                errorMsg = `التوكن المستخدم من نوع Classic ولكنه يفتقر لصلاحية الكتابة (repo)! الصلاحيات المتاحة حالياً: [${oauthScopes || 'بدون صلاحيات'}]. يرجى تفعيل خيار (repo) بالكامل.`;
            } else {
                // Fine-grained token
                errorMsg = `التوكن المستخدم من نوع Fine-grained ولكنه لا يمتلك صلاحية الكتابة (Contents: Read and write) على هذا المستودع! يرجى تعديل الصلاحيات أو إنشاء Classic Token بصلاحية (repo).`;
            }

            return {
                ok: false,
                error: errorMsg,
                user: userData ? { login: userData.login, name: userData.name, avatar: userData.avatar_url } : null,
                repo: { name: repoData.full_name, defaultBranch: repoData.default_branch, canPush: false }
            };
        }

        return {
            ok: true,
            repo: {
                name: repoData.full_name,
                defaultBranch: repoData.default_branch,
                isPrivate: repoData.private,
                updatedAt: repoData.updated_at,
                stars: repoData.stargazers_count,
                canPush: true
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
 * Includes: General settings, services, testimonials, bookings, contacts, newsletter
 */
export function compileCurrentClinicData() {
    let generalSettings = { ...GeneralSettings };
    try {
        const stored = JSON.parse(localStorage.getItem('dr_aktham_general_settings') || '{}');
        generalSettings = { ...GeneralSettings, ...stored };
    } catch (e) {}

    let services = [];
    try {
        services = JSON.parse(localStorage.getItem('dr_aktham_services') || '[]');
    } catch (e) {}

    let testimonials = [];
    try {
        testimonials = JSON.parse(localStorage.getItem('dr_aktham_testimonials') || '[]');
    } catch (e) {}

    let bookings = [];
    try {
        bookings = JSON.parse(localStorage.getItem('dr_aktham_bookings') || '[]');
    } catch (e) {}

    let contacts = [];
    try {
        contacts = JSON.parse(localStorage.getItem('dr_aktham_contacts') || '[]');
    } catch (e) {}

    let newsletter = [];
    try {
        newsletter = JSON.parse(localStorage.getItem('dr_aktham_newsletter') || '[]');
    } catch (e) {}

    let galleryCases = defaultGalleryCases || [];
    try {
        const stored = JSON.parse(localStorage.getItem('dr_aktham_gallery_cases') || '[]');
        if (stored && stored.length > 0) galleryCases = stored;
    } catch (e) {}

    return {
        lastUpdated: new Date().toISOString(),
        updatedBy: "لوحة تحكم د. أكثم عبر GitHub API (مزامنة شاملة)",
        generalSettings,
        services,
        testimonials,
        bookings,
        contacts,
        newsletter,
        galleryCases
    };
}

/**
 * Fetch the freshest file SHA from GitHub with strict cache-busting
 */
async function getLatestFileSha(config) {
    try {
        const getUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.filePath}?ref=${config.branch}&_nocache=${Date.now()}`;
        const resp = await fetch(getUrl, {
            cache: 'no-store',
            headers: {
                'Authorization': `Bearer ${config.token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache'
            }
        });

        if (resp.ok) {
            const fileData = await resp.json();
            return fileData.sha || null;
        }
        if (resp.status === 404) {
            return null; // File does not exist yet
        }
    } catch (e) {
        console.warn('Could not fetch latest file SHA:', e);
    }
    return null;
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

    // 0. Proactively verify write permissions and account ownership
    const authCheck = await testGithubConnection();
    if (!authCheck.ok) {
        throw new Error(authCheck.error);
    }

    const payload = compileCurrentClinicData();
    const jsonContent = JSON.stringify(payload, null, 2);
    const base64Content = utf8ToBase64(jsonContent);

    // 1. Fetch freshest file SHA from GitHub (bypassing any browser cache)
    let currentSha = await getLatestFileSha(config);

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

    // Helper to send PUT request with cache disabled
    const putUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.filePath}`;
    const executePut = (body) => fetch(putUrl, {
        method: 'PUT',
        cache: 'no-store',
        headers: {
            'Authorization': `Bearer ${config.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
        },
        body: JSON.stringify(body)
    });

    // 3. Send PUT request
    let putResp = await executePut(putBody);

    // 4. Handle 409 Conflict (stale SHA) - auto-retry once with freshly retrieved SHA
    if (!putResp.ok && (putResp.status === 409 || putResp.status === 422)) {
        console.warn('GitHub SHA mismatch detected. Re-fetching latest SHA and retrying...');
        const freshSha = await getLatestFileSha(config);
        if (freshSha && freshSha !== currentSha) {
            putBody.sha = freshSha;
            putResp = await executePut(putBody);
        }
    }

    if (!putResp.ok) {
        const errData = await putResp.json().catch(() => ({}));
        const rawMsg = errData.message || '';
        
        if (rawMsg.includes('Resource not accessible by personal access token') || putResp.status === 403) {
            throw new Error('التوكن المستخدم لا يمتلك صلاحية الكتابة (Write Permission) على هذا المستودع. يرجى إنشاء Classic Token وتفعيل خيار [repo] عبر الرابط المباشر في صفحة المزامنة.');
        }

        if (rawMsg.includes('does not match') || putResp.status === 409) {
            throw new Error('حدث تعارض في نسخة الملف على GitHub. تم جلب أحدث SHA الآن، يرجى إعادة الضغط على زر المزامنة.');
        }
        
        throw new Error(rawMsg || `فشل الحفظ في GitHub برمز استجابة: ${putResp.status}`);
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
