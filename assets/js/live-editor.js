// Live Visual Editor Module for Dr. Aktham Clinic CMS Platform
import { DBService } from './db-service.js';
import { attachAIAssistant } from './ai-assistant.js';

let supabase = null;
let activeAdmin = null;
let isEditModeActive = false;
let editingElement = null;
let editingSection = null;
let pageSections = [];

export function initLiveEditor(supabaseClient) {
    if (!supabaseClient) return;
    supabase = supabaseClient;

    // Check if an authenticated admin is browsing
    supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) return;
        
        // Verify User Role in public.user_roles
        supabase.from('user_roles')
            .select('role')
            .eq('id', session.user.id)
            .single()
            .then(({ data, error }) => {
                if (data && !error && ['Super Admin', 'Doctor', 'Reception'].includes(data.role)) {
                    activeAdmin = session.user;
                    console.log(`Live Editor unlocked for admin role: ${data.role}`);
                    injectLiveEditorDOM();
                }
            });
    });
}

function injectLiveEditorDOM() {
    // 1. Inject Stylesheet Link dynamically
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'assets/css/live-editor.css';
    document.head.appendChild(link);

    // 2. Inject Float Manager Bar
    const bar = document.createElement('div');
    bar.className = 'live-edit-float-bar';
    bar.id = 'liveEditBar';
    bar.innerHTML = `
        <div class="live-edit-status-dot"></div>
        <span class="live-edit-title">بوابة التعديل المرئي نشطة</span>
        <button class="live-edit-toggle-btn" id="liveEditToggleBtn">تفعيل وضع التحرير</button>
        <button class="live-edit-toggle-btn" style="background:#475569;" onclick="window.open('admin/index.html', '_blank')">لوحة التحكم</button>
    `;
    document.body.appendChild(bar);
    setTimeout(() => bar.classList.add('visible'), 200);

    // 3. Inject Side Drawer Panel
    const panel = document.createElement('div');
    panel.className = 'live-edit-side-panel';
    panel.id = 'liveEditPanel';
    panel.innerHTML = `
        <div class="live-edit-panel-header">
            <h3 style="font-size:16px; font-weight:700;"><i class="bx bx-edit-alt"></i> تعديل محتوى CMS</h3>
            <button id="closeLiveEditPanelBtn" style="background:transparent; border:none; color:white; font-size:22px; cursor:pointer;"><i class="bx bx-x"></i></button>
        </div>
        <div class="live-edit-panel-body" id="liveEditPanelBody">
            <!-- Dynamically loaded fields -->
        </div>
        <div class="live-edit-panel-footer">
            <button class="live-edit-toggle-btn" id="saveLiveEditBtn" style="flex:1;">حفظ ومزامنة</button>
            <button class="live-edit-toggle-btn" id="cancelLiveEditBtn" style="background:#64748b; flex:1;">إلغاء</button>
        </div>
    `;
    document.body.appendChild(panel);

    // 4. Inject Toast notification container
    const toast = document.createElement('div');
    toast.className = 'live-edit-toast';
    toast.id = 'liveEditToast';
    document.body.appendChild(toast);

    // Bind basic layout events
    document.getElementById('liveEditToggleBtn').onclick = toggleEditMode;
    document.getElementById('closeLiveEditPanelBtn').onclick = closeInspector;
    document.getElementById('cancelLiveEditBtn').onclick = closeInspector;
    document.getElementById('saveLiveEditBtn').onclick = saveChanges;
}

function getSectionArabicName(type) {
    const names = {
        hero: 'قسم الهيرو الرئيسي (Hero)',
        stats: 'الأرقام والإحصائيات (Stats)',
        features: 'مميزات العيادة (Features)',
        doctor: 'الملف الطبي للطبيب (Doctor)',
        services: 'الخدمات الطبية (Services)',
        cases: 'الحالات وقبل وبعد (Cases)',
        testimonials: 'آراء ومراجعات المرضى (Testimonials)',
        faq: 'الأسئلة الشائعة (FAQ)'
    };
    return names[type] || type;
}

async function fetchPageSections() {
    try {
        const { data: page } = await supabase.from('pages').select('id').eq('slug', 'home').single();
        if (page) {
            const { data } = await supabase.from('page_sections')
                .select('*')
                .eq('page_id', page.id)
                .order('display_order', { ascending: true });
            pageSections = data || [];
        }
    } catch(e) {
        console.error('Failed to fetch sections for live editor:', e);
    }
}

function toggleEditMode() {
    isEditModeActive = !isEditModeActive;
    const btn = document.getElementById('liveEditToggleBtn');
    
    if (isEditModeActive) {
        document.body.classList.add('live-editor-active');
        btn.textContent = 'تعطيل وضع التحرير';
        btn.classList.add('active');
        showToast('🔓 تم تفعيل وضع التعديل المرئي! اضغط على أي نص محاط أو أيقونة تخصيص القسم للمراجعة.');
        fetchPageSections().then(() => {
            attachPencilsToEditableElements();
        });
    } else {
        document.body.classList.remove('live-editor-active');
        btn.textContent = 'تفعيل وضع التحرير';
        btn.classList.remove('active');
        showToast('🔒 تم إيقاف وضع التعديل.');
        removePencils();
        closeInspector();
    }
}

function attachPencilsToEditableElements() {
    // 1. Scan DOM for elements carrying data-cms-key and data-cms-table
    const editables = document.querySelectorAll('[data-cms-key]');
    editables.forEach(el => {
        // Prevent duplicate buttons
        if (el.querySelector('.live-edit-pencil-btn')) return;

        const btn = document.createElement('button');
        btn.className = 'live-edit-pencil-btn';
        btn.innerHTML = '<i class="bx bx-pencil"></i>';
        btn.title = 'تعديل هذا النص';
        
        btn.onclick = (e) => {
            e.stopPropagation();
            openInspector(el);
        };
        
        el.appendChild(btn);
    });

    // 2. Scan DOM and attach Section Settings badges to section containers
    const sectionsMapping = [
        { id: '#home-hero-section', type: 'hero' },
        { id: '#home-excellence-section', type: 'features' },
        { id: '#home-testimonials-section', type: 'testimonials' },
        { id: '#home-faq-section', type: 'faq' }
    ];

    sectionsMapping.forEach(mapping => {
        const el = document.querySelector(mapping.id);
        if (!el) return;
        if (el.querySelector('.live-edit-section-badge')) return;

        // Find database record
        const secRecord = pageSections.find(s => s.section_type === mapping.type);
        if (!secRecord) return;

        const btn = document.createElement('button');
        btn.className = 'live-edit-section-badge';
        btn.innerHTML = `<i class="bx bx-cog"></i> تخصيص القسم`;
        btn.title = `تعديل إعدادات قسم ${getSectionArabicName(mapping.type)}`;
        
        // Ensure relative position for accurate absolute placement
        if (getComputedStyle(el).position === 'static') {
            el.style.position = 'relative';
        }

        btn.onclick = (e) => {
            e.stopPropagation();
            openSectionInspector(secRecord);
        };

        el.appendChild(btn);
    });
}

function removePencils() {
    document.querySelectorAll('.live-edit-pencil-btn').forEach(btn => btn.remove());
    document.querySelectorAll('.live-edit-section-badge').forEach(btn => btn.remove());
}

function openInspector(element) {
    editingElement = element;
    editingSection = null; // Reset section edit state
    const key = element.getAttribute('data-cms-key');
    const table = element.getAttribute('data-cms-table') || 'homepage_editor';
    const recordId = element.getAttribute('data-cms-id') || '1';
    
    // Get text excluding the pencil button HTML content
    const originalText = Array.from(element.childNodes)
        .filter(node => node.nodeType === Node.TEXT_NODE || (node.nodeType === Node.ELEMENT_NODE && !node.classList.contains('live-edit-pencil-btn')))
        .map(node => node.textContent)
        .join('').trim();

    const panel = document.getElementById('liveEditPanel');
    const body = document.getElementById('liveEditPanelBody');
    
    body.innerHTML = `
        <div class="live-edit-field-group">
            <label class="live-edit-field-label">اسم الحقل</label>
            <code style="background:#f1f5f9; padding:4px 8px; border-radius:4px; font-size:12px;">${table}.${key}</code>
        </div>
        <div class="live-edit-field-group" style="position:relative;">
            <label class="live-edit-field-label">المحتوى النصي</label>
            ${originalText.length > 60 ? `
                <textarea id="liveInspectorInput" class="live-edit-field-input" rows="5">${originalText}</textarea>
            ` : `
                <input type="text" id="liveInspectorInput" class="live-edit-field-input" value="${originalText}">
            `}
        </div>
        ${(table === 'homepage_editor' || table === 'component_content') ? `
        <div class="live-edit-field-group" style="flex-direction:row; align-items:center; gap:8px; margin-top:12px;">
            <input type="checkbox" id="publishImmediatelyInput" style="width:auto; cursor:pointer;" checked>
            <label for="publishImmediatelyInput" class="live-edit-field-label" style="cursor:pointer; margin:0; font-size:13px; color:#0f172a;">نشر التعديل فوراً للعامة</label>
        </div>
        ` : ''}
    `;

    const inputEl = document.getElementById('liveInspectorInput');
    attachAIAssistant(inputEl);

    panel.classList.add('open');
}

function openSectionInspector(secRecord) {
    editingSection = secRecord;
    editingElement = null; // Reset text edit state
    
    const panel = document.getElementById('liveEditPanel');
    const body = document.getElementById('liveEditPanelBody');
    
    const isDraft = secRecord.status === 'draft';
    
    body.innerHTML = `
        <div class="live-edit-field-group">
            <label class="live-edit-field-label">اسم القسم</label>
            <h4 style="font-weight:700; margin:0; color:#0f172a;">${getSectionArabicName(secRecord.section_type)}</h4>
        </div>
        
        <div class="live-edit-field-group" style="flex-direction:row; align-items:center; gap:8px;">
            <input type="checkbox" id="secVisibilityInput" ${secRecord.is_visible ? 'checked' : ''} style="width:auto; cursor:pointer;">
            <label for="secVisibilityInput" class="live-edit-field-label" style="cursor:pointer; margin:0;">القسم مرئي للجمهور</label>
        </div>

        <div class="live-edit-field-group">
            <label class="live-edit-field-label">الهوامش والتباعد (Spacing)</label>
            <select id="secSpacingInput" class="live-edit-field-input">
                <option value="padding-small" ${secRecord.spacing === 'padding-small' ? 'selected' : ''}>صغير (Small)</option>
                <option value="padding-medium" ${secRecord.spacing === 'padding-medium' ? 'selected' : ''}>متوسط (Medium)</option>
                <option value="padding-large" ${secRecord.spacing === 'padding-large' ? 'selected' : ''}>كبير (Large)</option>
            </select>
        </div>

        <div class="live-edit-field-group">
            <label class="live-edit-field-label">خلفية القسم (Background)</label>
            <select id="secBgInput" class="live-edit-field-input">
                <option value="glass" ${secRecord.background_style === 'glass' ? 'selected' : ''}>تأثير زجاجي (Glass)</option>
                <option value="light" ${secRecord.background_style === 'light' ? 'selected' : ''}>مضيء (Light)</option>
                <option value="dark" ${secRecord.background_style === 'dark' ? 'selected' : ''}>مظلم (Dark)</option>
                <option value="accent" ${secRecord.background_style === 'accent' ? 'selected' : ''}>لون تمييز (Accent)</option>
            </select>
        </div>

        <div class="live-edit-field-group">
            <label class="live-edit-field-label">ترتيب العرض (Order)</label>
            <input type="number" id="secOrderInput" class="live-edit-field-input" value="${secRecord.display_order}">
        </div>

        <div class="live-edit-field-group" style="margin-top:16px; border-top:1px dashed #cbd5e1; padding-top:16px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <span class="live-edit-field-label">حالة النشر الحالي</span>
                <span class="badge ${isDraft ? 'badge-warning' : 'badge-success'}" style="display:inline-block; padding:4px 10px; border-radius:4px; font-size:11px;">
                    ${isDraft ? 'مسودة (عدم النشر)' : 'منشور للعامة'}
                </span>
            </div>
            <button class="live-edit-toggle-btn" id="secPublishBtn" style="width:100%; background:#10b981;" ${!isDraft ? 'disabled' : ''}>
                <i class="bx bx-cloud-upload"></i> نشر هذا القسم الآن
            </button>
        </div>
    `;
    
    // Bind publish button
    document.getElementById('secPublishBtn').onclick = (e) => {
        e.preventDefault();
        publishSectionLive(secRecord.id);
    };

    panel.classList.add('open');
}

function publishSectionLive(sectionId) {
    if (!supabase || !activeAdmin) return;
    
    DBService.publishSection(sectionId, supabase, activeAdmin.email)
        .then(({ error }) => {
            if (error) {
                showToast(`❌ فشل نشر التغييرات: ${error.message}`);
            } else {
                showToast('🎉 تم نشر وتعميم حالة القسم الجديد للجمهور بنجاح!');
                fetchPageSections().then(() => {
                    // Update current settings dialog
                    const updated = pageSections.find(s => s.id === sectionId);
                    if (updated) openSectionInspector(updated);
                    // Update DOM display layout
                    import('./app.js').then(({ renderHomepageLayout }) => {
                        renderHomepageLayout(pageSections, false);
                    });
                });
            }
        });
}

function closeInspector() {
    document.getElementById('liveEditPanel').classList.remove('open');
    editingElement = null;
    editingSection = null;
}

function saveChanges() {
    if (!supabase || !activeAdmin) return;

    if (editingSection) {
        // Saving section configurations
        const isVisible = document.getElementById('secVisibilityInput').checked;
        const spacing = document.getElementById('secSpacingInput').value;
        const background_style = document.getElementById('secBgInput').value;
        const display_order = parseInt(document.getElementById('secOrderInput').value) || 0;

        const payload = {
            is_visible: isVisible,
            spacing: spacing,
            background_style: background_style,
            display_order: display_order,
            status: 'draft',
            updated_at: new Date().toISOString()
        };

        supabase.from('page_sections').update(payload).eq('id', editingSection.id)
            .then(({ error }) => {
                if (error) {
                    showToast(`❌ خطأ في حفظ إعدادات القسم: ${error.message}`);
                } else {
                    // Log audit
                    supabase.from('audit_logs').insert([{
                        user_email: activeAdmin.email,
                        action: 'live_edit:section_update',
                        affected_item: `page_sections:${editingSection.id}`,
                        new_value: payload
                    }]).then(() => {});

                    showToast('🎉 تم حفظ تعديلات القسم بنجاح كمسودة!');
                    
                    fetchPageSections().then(() => {
                        // Re-render DOM layouts instantly
                        import('./app.js').then(({ renderHomepageLayout }) => {
                            renderHomepageLayout(pageSections, true);
                            
                            // Re-attach pencils so their click events map to updated records
                            removePencils();
                            attachPencilsToEditableElements();
                        });
                        closeInspector();
                    });
                }
            });
    } else if (editingElement) {
        // Saving text content
        const key = editingElement.getAttribute('data-cms-key');
        const table = editingElement.getAttribute('data-cms-table') || 'homepage_editor';
        const recordId = editingElement.getAttribute('data-cms-id') || '1';
        const newValue = document.getElementById('liveInspectorInput').value.trim();

        const payload = {};
        payload[key] = newValue;

        if (table === 'homepage_editor') {
            // Find the hero section on home page
            const heroSec = pageSections.find(s => s.section_type === 'hero');
            if (!heroSec) {
                showToast('❌ لم يتم العثور على قسم الهيرو بقاعدة البيانات.');
                return;
            }
            
            const publishImmediately = document.getElementById('publishImmediatelyInput')?.checked || false;
            const updatedDraft = { ...(heroSec.draft_content || {}) };
            if (key === 'hero_title') updatedDraft.title = newValue;
            if (key === 'hero_subtitle') updatedDraft.subtitle = newValue;
            
            const updatePayload = {
                draft_content: updatedDraft,
                status: publishImmediately ? 'published' : 'draft',
                updated_at: new Date().toISOString()
            };
            if (publishImmediately) {
                updatePayload.published_content = updatedDraft;
            }
            
            supabase.from('page_sections')
                .update(updatePayload)
                .eq('id', heroSec.id)
                .then(({ error }) => {
                    if (error) {
                        showToast(`❌ خطأ في التحديث: ${error.message}`);
                    } else {
                        // Update DOM text
                        updateDomTextNode(newValue);
                        showToast(publishImmediately ? '🎉 تم حفظ ونشر التعديل بنجاح!' : '🎉 تم حفظ النص في مسودة قسم الهيرو بنجاح!');
                        closeInspector();
                        fetchPageSections();
                    }
                });
        } else if (table === 'component_content') {
            const publishImmediately = document.getElementById('publishImmediatelyInput')?.checked || false;
            supabase.from('component_content').select('draft_data, published_data').eq('id', recordId).single()
                .then(({ data, error }) => {
                    if (error || !data) {
                        showToast(`❌ فشل تحميل البيانات الحالية: ${error ? error.message : 'غير موجود'}`);
                        return;
                    }
                    const draftData = { ...(data.published_data || {}), ...(data.draft_data || {}) };
                    draftData[key] = newValue;
                    
                    const updatePayload = {
                        draft_data: draftData,
                        status: publishImmediately ? 'published' : 'draft',
                        updated_at: new Date().toISOString()
                    };
                    if (publishImmediately) {
                        updatePayload.published_data = draftData;
                    }
                    
                    supabase.from('component_content').update(updatePayload).eq('id', recordId)
                        .then(({ error: updateError }) => {
                            if (updateError) {
                                showToast(`❌ حدث خطأ أثناء الحفظ: ${updateError.message}`);
                            } else {
                                updateDomTextNode(newValue);
                                
                                // Write audit log
                                supabase.from('audit_logs').insert([{
                                    user_email: activeAdmin.email,
                                    action: publishImmediately ? 'live_edit:component_publish' : 'live_edit:component_update',
                                    affected_item: `component_content:${recordId}`,
                                    new_value: updatePayload
                                }]).then(() => {});
                                
                                showToast(publishImmediately ? '🎉 تم حفظ ونشر التغييرات بنجاح!' : '🎉 تم حفظ التغييرات كمسودة بنجاح!');
                                closeInspector();
                            }
                        });
                });
        } else {
            // Standard update for any other table (like services, faqs, etc.)
            supabase.from(table).update(payload).eq('id', parseInt(recordId) || recordId)
                .then(({ error }) => {
                    if (error) {
                        showToast(`❌ حدث خطأ أثناء الحفظ: ${error.message}`);
                    } else {
                        updateDomTextNode(newValue);
                        
                        // Write audit log
                        supabase.from('audit_logs').insert([{
                            user_email: activeAdmin.email,
                            action: 'live_edit:update',
                            affected_item: `${table}:${recordId}`,
                            new_value: payload
                        }]).then(() => {});

                        showToast('🎉 تم حفظ التغييرات ومزامنتها بنجاح!');
                        closeInspector();
                    }
                });
        }
    }
}

function updateDomTextNode(newValue) {
    if (!editingElement) return;
    Array.from(editingElement.childNodes).forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
            node.textContent = newValue;
        } else if (node.nodeType === Node.ELEMENT_NODE && !node.classList.contains('live-edit-pencil-btn')) {
            node.textContent = newValue;
        }
    });
}

function showToast(message) {
    const toast = document.getElementById('liveEditToast');
    toast.textContent = message;
    toast.classList.add('visible');
    setTimeout(() => {
        toast.classList.remove('visible');
    }, 4000);
}

