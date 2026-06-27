// Settings for about.html (About Page)
export const PageSettings = {
    title: "عن استشاري التقويم - عيادة د. أكثم طنطاوي",
    description: "تعرف على الدكتور أكثم إسماعيل طنطاوي، استشاري تقويم الأسنان والفكين، خبرته وشهاداته المهنية وزمالاته الدولية في الكلية الملكية.",
    keywords: "الدكتور أكثم طنطاوي, استشاري تقويم الاسنان, زمالة تقويم الاسنان",
    dynamicContent: {
        // Portrait Image
        ".doctor-image-container img": {
            src: "assets/doctor.jpg",
            alt: "د. أكثم طنطاوي"
        },
        ".doctor-stats-badge .tag-title": "د. أكثم طنطاوي",
        ".doctor-stats-badge .tag-subtitle": "استشاري تقويم الأسنان",

        // Biography Text
        ".doctor-info-content .section-label": "استشاري الحالة",
        ".doctor-bio-title": "د. أكثم إسماعيل طنطاوي",
        ".doctor-specialty-tag": "استشاري تقويم الأسنان والفكين للبالغين والأطفال",
        ".doctor-bio-text": "استشاري رائد ومتميز في تقويم الأسنان وتعديل نمو الفكين للأطفال والكبار، يمتلك مسيرة علمية وعملية حافلة تمتد لأكثر من 15 عاماً في تصميم الابتسامات ورصف الأسنان المزدحمة. كرس مسيرته المهنية لتطبيق أحدث التقنيات الرقمية ثلاثية الأبعاد وتخطيط العلاج المعتمد على محاكاة الابتسامة المتقدمة، لتقديم رعاية تقويمية فاخرة ونتائج تضمن المظهر الجمالي والوظيفة المثالية لمدى الحياة.",

        // Highlights
        ".doctor-highlights .highlight-box:nth-child(1) .highlight-text": "زمالة تقويم الأسنان من الكلية الملكية للجراحين بإدنبرة (MOrth RCSEd)",
        ".doctor-highlights .highlight-box:nth-child(2) .highlight-text": "عضو الجمعية العالمية لتقويم الأسنان (WFO) والجمعية الأمريكية لتقويم الأسنان (AAO)",
        ".doctor-highlights .highlight-box:nth-child(3) .highlight-text": "دبلوم تخصصي معتمد في التقويم الشفاف الرقمي وتخطيط الابتسامات ثلاثي الأبعاد",
        ".doctor-highlights .highlight-box:nth-child(4) .highlight-text": "أكثر من 5,000 حالة تقويم أسنان وتعديل إطباق ناجحة وموثقة إكلينيكياً",

        // Accreditations Certificate Card
        ".doctor-info-content .glass-card img": {
            src: "assets/congrats.jpg",
            alt: "شهادة د. أكثم"
        },
        ".doctor-info-content .glass-card h4": "الاعتمادات والزمالات الدولية",
        ".doctor-info-content .glass-card p": "حاصل على زمالة الكلية الملكية لتقويم الأسنان بالمملكة المتحدة واجتياز اختباراتها بنجاح باهر لتقديم أفضل رعاية لتقويم وتعديل الإطباق وتشوهات الفكين.",

        // Timeline Header
        ".about-doctor-section > div:nth-child(2) .section-header .section-label": "مسيرة التطور",
        ".about-doctor-section > div:nth-child(2) .section-header .section-title": "المحطات المهنية والأكاديمية",
        ".about-doctor-section > div:nth-child(2) .section-header .section-desc": "أبرز الشهادات والدراسات والمشاركات الدولية للاستشاري د. أكثم طنطاوي",

        // Timeline Items
        ".experience-timeline .timeline-item:nth-child(1) .timeline-year": "2011",
        ".experience-timeline .timeline-item:nth-child(1) .timeline-title": "بكالوريوس طب وجراحة الفم والأسنان",
        ".experience-timeline .timeline-item:nth-child(1) .timeline-desc": "التخرج بمرتبة الشرف الأولى والبدء في الممارسة الإكلينيكية والتركيز على تشخيص المشاكل الإطباقية للأسنان.",
        
        ".experience-timeline .timeline-item:nth-child(2) .timeline-year": "2014",
        ".experience-timeline .timeline-item:nth-child(2) .timeline-title": "دبلوم الدراسات العليا التخصصي في تقويم الأسنان",
        ".experience-timeline .timeline-item:nth-child(2) .timeline-desc": "دراسة تخصصية مكثفة في أنظمة تقويم الأسنان التقليدية والوقائية وكيفية معالجة نمو الفكين غير المتطابق.",
        
        ".experience-timeline .timeline-item:nth-child(3) .timeline-year": "2018",
        ".experience-timeline .timeline-item:nth-child(3) .timeline-title": "زمالة الكلية الملكية البريطانية لتقويم الأسنان (MOrth)",
        ".experience-timeline .timeline-item:nth-child(3) .timeline-desc": "الحصول على الزمالة المرموقة من الكلية الملكية للجراحين بإدنبرة لتقويم الأسنان والمشاركة في اللقاءات العلمية الأوروبية.",
        
        ".experience-timeline .timeline-item:nth-child(4) .timeline-year": "2021",
        ".experience-timeline .timeline-item:nth-child(4) .timeline-title": "الاعتماد الدولي لأنظمة التقويم الشفاف (Clear Aligners)",
        ".experience-timeline .timeline-item:nth-child(4) .timeline-desc": "إتقان التخطيط ثلاثي الأبعاد وتصميم قوالب التقويم الشفافة غير المرئية بالكامل ومتابعة المرضى رقمياً.",
        
        ".experience-timeline .timeline-item:nth-child(5) .timeline-year": "2024",
        ".experience-timeline .timeline-item:nth-child(5) .timeline-title": "المشاركة في المؤتمر العالمي لتقويم الأسنان (سويسرا)",
        ".experience-timeline .timeline-item:nth-child(5) .timeline-desc": "تمثيل العيادة بورقة بحثية رائدة حول استخدام التخطيط الرقمي لتقليص مدة علاج التقويم وتحسين استقرار النتائج.",

        // Video Introduction Section
        ".about-doctor-section > div:nth-child(3) .section-header .section-label": "فيديو ترحيبي",
        ".about-doctor-section > div:nth-child(3) .section-header .section-title": "فيديو تعريفي بالعيادة والتجهيزات",
        ".about-doctor-section > div:nth-child(3) .section-header .section-desc": "شاهد رسالة ترحيبية من الدكتور أكثم طنطاوي وجولة حول التقنيات الطبية الرقمية المعتمدة لضمان أفضل تشخيص وراحة تامة لمرضانا",
        ".about-doctor-section .video-wrapper video": {
            src: "assets/WhatsApp Video 2026-06-25 at 8.02.08 PM.mp4",
            poster: "assets/doctor.jpg"
        },

        // Clinic Interior Gallery Section
        ".about-doctor-section > div:nth-child(4) .section-header .section-label": "صور العيادة",
        ".about-doctor-section > div:nth-child(4) .section-header .section-title": "بيئة علاجية فاخرة ومجهزة بأعلى التقنيات",
        ".about-doctor-section > div:nth-child(4) .section-header .section-desc": "صور حقيقية لعيادتنا وتجهيزات تقويم الأسنان المتقدمة وصور أثناء الجلسات العلاجية مع مرضانا",
        
        // Gallery Photos
        ".clinic-gallery-grid .gallery-photo-card:nth-child(1) img": {
            src: "assets/WhatsApp Image 2026-06-25 at 7.41.42 PM.jpeg",
            alt: "جلسة استشارية وتعديل تقويم الأسنان مع المريض"
        },
        ".clinic-gallery-grid .gallery-photo-card:nth-child(2) img": {
            src: "assets/WhatsApp Image 2026-06-24 at 10.52.22 PM.jpeg",
            alt: "أجهزة التخطيط الرقمي والماسح ثلاثي الأبعاد للتقويم الشفاف"
        },
        ".clinic-gallery-grid .gallery-photo-card:nth-child(3) img": {
            src: "assets/WhatsApp Image 2026-06-24 at 10.52.23 PM.jpeg",
            alt: "صالة الاستقبال وخدمة كبار الشخصيات بالعيادة"
        },
        ".clinic-gallery-grid .gallery-photo-card:nth-child(4) img": {
            src: "assets/WhatsApp Image 2026-06-24 at 10.52.24 PM.jpeg",
            alt: "تسليم جهاز التقويم الشفاف ومناقشة الخطة العلاجية"
        },

        // Call to action button
        ".about-doctor-section > div:nth-child(5) a": "احجز استشارة تقويم مع الدكتور الآن"
    }
};
