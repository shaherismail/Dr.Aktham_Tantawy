// assets/js/ai-assistant.js
// AI Copywriting Assistant Module for Dr. Aktham Clinic CMS Platform

// Orthodontic medical term dictionary and copywriting templates
const CLINIC_TEMPLATES = {
    professional: {
        title: [
            "تقويم أسنان رقمي متطور بتخطيط ثلاثي الأبعاد",
            "ابتسامتك المثالية تبدأ بخبرة سريرية استثنائية",
            "مصففات شفافة ذكية مصممة خصيصاً لراحتك وثقتك",
            "استشاري تقويم الأسنان والفكين للبالغين والأطفال",
            "رحلة علاجية دقيقة مدعومة بأحدث تقنيات التصوير الرقمي"
        ],
        desc: [
            "نقدم حزمة علاجية متطورة لتقويم وتجميل الأسنان وتعديل إطباق الفكين، بالاعتماد الكلي على المحاكاة ثلاثية الأبعاد والمصففات غير المرئية لتوفير رحلة مريحة ونتائج سريرية فائقة الدقة.",
            "نسعى لتصميم الابتسامة المتميزة التي تتكامل مع المظهر الطبيعي للوجه، عبر رعاية طبية متكاملة وتحت إشراف استشاري زميل الكلية الملكية لجراحي الأسنان.",
            "تخلص من مشاكل ازدحام الأسنان أو الفراغات بأحدث أنظمة التقويم المعدني والخزفي والشفاف الرقمي، مع خطط دفع مرنة ومتابعة مستمرة تضمن راحتك وسلامتك."
        ]
    },
    seo: {
        title: [
            "أفضل عيادة تقويم أسنان في مصر | د. أكثم طنطاوي",
            "تقويم الأسنان الشفاف الرقمي - أسعار ومميزات المصففات",
            "استشاري تقويم أسنان بشبرا القاهرة | ابتسامة هوليوود",
            "علاج الفكين وتعديل الأسنان بدون ألم بأحدث التقنيات"
        ],
        desc: [
            "تبحث عن أفضل طبيب لتقويم الأسنان في القاهرة؟ عيادة دكتور أكثم طنطاوي تقدم لك أحدث تقنيات التقويم الشفاف الرقمي وتجميل الأسنان بأعلى نسب نجاح وأفضل الأسعار.",
            "احجز موعدك الآن لتصميم الابتسامة الرقمية وعلاج فراغات الأسنان والازدحام باستخدام مصففات شفافة متطورة غير مرئية تفصيلية مريحة وقابلة للإزالة."
        ]
    }
};

export function simulateAIResponse(currentValue, mode, fieldType = 'desc') {
    const text = currentValue || '';
    
    // Choose list based on mode & fieldType
    const list = CLINIC_TEMPLATES[mode === 'seo' ? 'seo' : 'professional'][fieldType === 'title' ? 'title' : 'desc'];
    
    // Select a template
    let baseText = list[Math.floor(Math.random() * list.length)];
    
    if (mode === 'shorten') {
        if (text.length > 10) {
            return text.substring(0, Math.floor(text.length / 2)) + '...';
        }
        return "تقويم رقمي متطور لابتسامة طبيعية متناسقة وسريعة.";
    }
    
    if (mode === 'expand') {
        return (text ? text + ' ' : '') + "نحن نوظف الابتكار التقني المتمثل في المسح الضوئي الرقمي والذكاء الاصطناعي لرسم مسار حركة الأسنان بدقة متناهية، مما يقلل فترة العلاج بنسبة تصل إلى 30% ويمنحك راحة تامة أثناء التحدث وتناول الطعام.";
    }
    
    if (mode === 'translate') {
        // Basic English translations for ortho terms
        const orthoTranslations = {
            "تقويم أسنان": "Orthodontic treatment",
            "مصففات شفافة": "Clear aligners",
            "د. أكثم طنطاوي": "Dr. Aktham Tantawy",
            "الكلية الملكية": "Royal College of Surgeons",
            "تعديل الفكين": "Jaw correction",
            "ابتسامة": "Smile design"
        };
        
        let translated = "Advanced Orthodontic treatment. Clear Aligners and premium jaw correction therapies designed using 3D simulations for optimal clinical results.";
        for (let key in orthoTranslations) {
            if (text.includes(key)) {
                translated = `Premium Orthodontic Care by Dr. Aktham Tantawy. Specialized in ${orthoTranslations[key]} and advanced smile aesthetics.`;
                break;
            }
        }
        return translated;
    }
    
    return baseText;
}

// Attach AI Assistant helper wands
export function attachAIAssistant(inputElement, onApplyCallback) {
    if (!inputElement) return;
    
    // Ensure parent relative for positioning
    const parent = inputElement.parentElement;
    if (!parent) return;
    
    if (parent.querySelector('.ai-wand-btn')) return;
    
    if (getComputedStyle(parent).position === 'static') {
        parent.style.position = 'relative';
    }
    
    // Create Sparkle button
    const aiBtn = document.createElement('button');
    aiBtn.className = 'ai-wand-btn';
    aiBtn.type = 'button';
    aiBtn.innerHTML = '✨ <span style="font-size:10px; font-weight:bold; font-family:\'Tajawal\';">مساعد الذكاء الاصطناعي</span>';
    aiBtn.title = 'توليد ومراجعة النص بالذكاء الاصطناعي';
    
    // Apply styling
    aiBtn.style.position = 'absolute';
    aiBtn.style.top = '6px';
    aiBtn.style.left = '8px';
    aiBtn.style.background = 'linear-gradient(135deg, #7c3aed, #2563eb)';
    aiBtn.style.color = 'white';
    aiBtn.style.border = 'none';
    aiBtn.style.borderRadius = '20px';
    aiBtn.style.padding = '4px 10px';
    aiBtn.style.cursor = 'pointer';
    aiBtn.style.zIndex = '5';
    aiBtn.style.display = 'flex';
    aiBtn.style.alignItems = 'center';
    aiBtn.style.gap = '4px';
    aiBtn.style.boxShadow = '0 2px 4px rgba(124, 58, 237, 0.3)';
    
    // Padding adjustments to make space for the button
    inputElement.style.paddingLeft = '140px';
    
    aiBtn.onclick = (e) => {
        e.stopPropagation();
        showAIMenu(aiBtn, inputElement, onApplyCallback);
    };
    
    parent.appendChild(aiBtn);
}

function showAIMenu(btn, inputElement, onApplyCallback) {
    // Remove existing menus
    document.querySelectorAll('.ai-assistant-menu').forEach(m => m.remove());
    
    const menu = document.createElement('div');
    menu.className = 'ai-assistant-menu';
    
    // Position menu below the button
    const rect = btn.getBoundingClientRect();
    menu.style.position = 'fixed';
    menu.style.top = `${rect.bottom + window.scrollY + 6}px`;
    menu.style.left = `${rect.left + window.scrollX}px`;
    menu.style.background = 'white';
    menu.style.border = '1px solid #e2e8f0';
    menu.style.borderRadius = '12px';
    menu.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
    menu.style.zIndex = '10002';
    menu.style.width = '240px';
    menu.style.fontFamily = "'Tajawal', sans-serif";
    menu.style.direction = 'rtl';
    menu.style.padding = '8px 0';
    
    const options = [
        { mode: 'professional', label: '✍️ صياغة طبية احترافية' },
        { mode: 'seo', label: '🔍 تحسين لمحركات البحث SEO' },
        { mode: 'expand', label: '➕ توسيع وإثراء النص' },
        { mode: 'shorten', label: '➖ تقصير وتلخيص النص' },
        { mode: 'translate', label: '🌐 ترجمة النص للإنجليزية' }
    ];
    
    options.forEach(opt => {
        const item = document.createElement('div');
        item.style.padding = '10px 16px';
        item.style.cursor = 'pointer';
        item.style.fontSize = '13px';
        item.style.color = '#1e293b';
        item.style.transition = 'background 0.2s';
        item.textContent = opt.label;
        
        item.onmouseenter = () => { item.style.background = '#f1f5f9'; };
        item.onmouseleave = () => { item.style.background = 'transparent'; };
        
        item.onclick = (e) => {
            e.stopPropagation();
            const fieldType = (inputElement.tagName === 'INPUT' && inputElement.id.toLowerCase().includes('title')) ? 'title' : 'desc';
            const result = simulateAIResponse(inputElement.value, opt.mode, fieldType);
            inputElement.value = result;
            menu.remove();
            
            // Fire callback to notify changes
            if (onApplyCallback) onApplyCallback(result);
            
            // Highlight change briefly
            inputElement.style.transition = 'background 0.5s';
            inputElement.style.background = '#f0fdf4';
            setTimeout(() => { inputElement.style.background = ''; }, 1000);
        };
        menu.appendChild(item);
    });
    
    document.body.appendChild(menu);
    
    // Close menu when clicking outside
    const outsideClickListener = (e) => {
        if (!menu.contains(e.target) && e.target !== btn) {
            menu.remove();
            document.removeEventListener('click', outsideClickListener);
        }
    };
    document.addEventListener('click', outsideClickListener);
}
