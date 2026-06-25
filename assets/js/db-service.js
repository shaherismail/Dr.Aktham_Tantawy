// Business Logic Layer - Data Service & Offline Caching Module

let db = null;
const DB_NAME = 'DrAkthamCMSCache';
const STORE_NAME = 'cms_records';

// 1. Initialize IndexedDB Cache
function initIndexedDB() {
    return new Promise((resolve) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = (e) => {
            const database = e.target.result;
            if (!database.objectStoreNames.contains(STORE_NAME)) {
                database.createObjectStore(STORE_NAME);
            }
        };
        request.onsuccess = (e) => {
            db = e.target.result;
            resolve(db);
        };
        request.onerror = () => {
            console.error('IndexedDB initialization failed. Running in memory mode.');
            resolve(null);
        };
    });
}

// 2. Cache Helpers
function cacheGet(key) {
    return new Promise((resolve) => {
        if (!db) return resolve(null);
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => resolve(null);
    });
}

function cacheSet(key, value) {
    if (!db) return;
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.put(value, key);
}

// 3. Centralized Database Operations Service
export const DBService = {
    async init() {
        await initIndexedDB();
    },

    // Dynamic relational page layouts loading with background caching
    async getPageLayout(slug, client, previewMode = false) {
        const cacheKey = `page_layout_${slug}_${previewMode ? 'preview' : 'prod'}`;
        const cached = await cacheGet(cacheKey);

        // Run background network update if connected
        if (client) {
            this.syncPageLayoutNetwork(slug, client, previewMode, cacheKey);
        }

        return cached; // resolve instantly from IndexedDB cache
    },

    async syncPageLayoutNetwork(slug, client, previewMode, cacheKey) {
        try {
            const { data: page } = await client.from('pages').select('id').eq('slug', slug).single();
            if (!page) return;

            // Fetch sections
            const { data: sections, error } = await client.from('page_sections')
                .select('*')
                .eq('page_id', page.id)
                .eq('is_visible', true)
                .order('display_order', { ascending: true });

            if (!error && sections) {
                // Update Cache
                cacheSet(cacheKey, sections);
                // Dispatch event to warn DOM of updates
                window.dispatchEvent(new CustomEvent('cms_layout_updated', { detail: { slug, sections } }));
            }
        } catch(e) {
            console.warn('Background dynamic content sync failed. Serving from cache.');
        }
    },

    // Transactional Testimonials loading
    async getTestimonials(client) {
        const cached = await cacheGet('testimonials');
        if (client) {
            client.from('component_content')
                .select('*')
                .eq('is_visible', true)
                .eq('status', 'published')
                .then(({ data }) => {
                    if (data) {
                        cacheSet('testimonials', data);
                        window.dispatchEvent(new CustomEvent('cms_testimonials_updated', { detail: data }));
                    }
                });
        }
        return cached;
    },

    // Transactional FAQs loading
    async getFAQs(client) {
        const cached = await cacheGet('faqs');
        if (client) {
            client.from('component_content')
                .select('*')
                .eq('is_visible', true)
                .eq('status', 'published')
                .then(({ data }) => {
                    if (data) {
                        cacheSet('faqs', data);
                        window.dispatchEvent(new CustomEvent('cms_faqs_updated', { detail: data }));
                    }
                });
        }
        return cached;
    },

    // Draft & Publish workflows
    async publishSection(sectionId, client, userEmail) {
        if (!client) return { error: 'No connection' };
        
        // 1. Fetch draft content
        const { data: section } = await client.from('page_sections').select('draft_content').eq('id', sectionId).single();
        if (!section) return { error: 'Section not found' };

        // 2. Overwrite published_content with draft
        const { error } = await client.from('page_sections')
            .update({ 
                published_content: section.draft_content, 
                status: 'published',
                updated_at: new Date().toISOString()
            })
            .eq('id', sectionId);

        if (!error) {
            // Log Action
            await client.from('audit_logs').insert([{
                user_email: userEmail,
                action: 'page_section:publish',
                affected_item: `page_sections:${sectionId}`,
                new_value: { published_content: section.draft_content }
            }]);
        }

        return { error };
    },

    // Backup Serializer
    async generateBackupPayload(client) {
        if (!client) return null;

        const tables = ['site_settings', 'theme_settings', 'pages', 'page_sections', 'components', 'component_content', 'media_library', 'bookings'];
        const payload = {};

        await Promise.all(tables.map(async (table) => {
            const { data } = await client.from(table).select('*');
            payload[table] = data || [];
        }));

        return JSON.stringify(payload, null, 2);
    },

    // Restore Backup payload
    async restoreBackupPayload(payloadStr, client, userEmail) {
        if (!client) return { error: 'No client connected' };
        
        try {
            const data = JSON.parse(payloadStr);
            const tables = ['site_settings', 'theme_settings', 'pages', 'page_sections', 'components', 'component_content', 'media_library', 'bookings'];

            for (const table of tables) {
                if (data[table] && data[table].length > 0) {
                    // Truncate existing and insert restored records
                    await client.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
                    await client.from(table).insert(data[table]);
                }
            }

            // Log restore
            await client.from('audit_logs').insert([{
                user_email: userEmail,
                action: 'backup:restore',
                affected_item: 'database:all',
                new_value: { tables_restored: tables }
            }]);

            return { success: true };
        } catch(e) {
            return { error: 'Invalid backup file format: ' + e.message };
        }
    }
};
