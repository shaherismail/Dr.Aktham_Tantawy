// Settings for gallery.html (Gallery Page)
export const PageSettings = {
    title: "معرض الحالات - عيادة د. أكثم طنطاوي",
    description: "شاهد نتائج علاج الحالات وابتسامات مراجعي العيادة قبل وبعد تقويم الأسنان.",
    keywords: "قبل وبعد تقويم الاسنان, حالات تقويم الاسنان, ابتسامة هوليود",
    dynamicContent: {
        // Page header
        ".gallery-section .section-label": "معرض الحالات",
        ".gallery-section .section-title": "حالات واقعية.. ونتائج استثنائية",
        ".gallery-section .section-desc": "تصفح نتائج رحلة العلاج والتقويم لمرضانا، والتحولات الحقيقية في إطباق وجمال الابتسامات.",

        // Case 1
        ".gallery-grid > div:nth-child(1) img": {
            src: "assets/case2.jpg",
            alt: "حالة تقويم - تزاحم الأسنان"
        },
        ".gallery-grid > div:nth-child(1) .case-badge": "تقويم الأسنان المعدني",
        ".gallery-grid > div:nth-child(1) .case-title": "تعديل الازدحام الشديد وتطابق الفكين",
        ".gallery-grid > div:nth-child(1) .case-desc": "علاج تزاحم الأسنان الحاد وتوسيع القوس السني دون الحاجة لخلع أي أسنان دائمية، مع ضبط مالي للإطباق.",
        ".gallery-grid > div:nth-child(1) .case-meta-row .meta-item:nth-child(1) span": "<strong>الحالة:</strong> تزاحم بالفكين",
        ".gallery-grid > div:nth-child(1) .case-meta-row .meta-item:nth-child(2) span": "<strong>العمر:</strong> 18 عاماً",
        ".gallery-grid > div:nth-child(1) .case-meta-row .meta-item:nth-child(3) span": "<strong>المدة:</strong> 14 شهراً",
        ".gallery-grid > div:nth-child(1) .case-meta-row .meta-item:nth-child(4) span": "<strong>الزيارات:</strong> 12 زيارة",

        // Case 2
        ".gallery-grid > div:nth-child(2) img": {
            src: "assets/case1.jpg",
            alt: "حالة تقويم - سد الفراغات"
        },
        ".gallery-grid > div:nth-child(2) .case-badge": "تقويم الأسنان التجميلي",
        ".gallery-grid > div:nth-child(2) .case-title": "إغلاق الفراغات الأمامية وتصحيح المحاذاة",
        ".gallery-grid > div:nth-child(2) .case-desc": "علاج الفراغات الواسعة (الستيرما) بين الثنايا والرباعيات العلوية وإعادة بناء تماثل خط الابتسامة بنجاح تام.",
        ".gallery-grid > div:nth-child(2) .case-meta-row .meta-item:nth-child(1) span": "<strong>الحالة:</strong> فراغات متفرقة",
        ".gallery-grid > div:nth-child(2) .case-meta-row .meta-item:nth-child(2) span": "<strong>العمر:</strong> 22 عاماً",
        ".gallery-grid > div:nth-child(2) .case-meta-row .meta-item:nth-child(3) span": "<strong>المدة:</strong> 11 شهراً",
        ".gallery-grid > div:nth-child(2) .case-meta-row .meta-item:nth-child(4) span": "<strong>الزيارات:</strong> 9 زيارات",

        // Case 3
        ".gallery-grid > div:nth-child(3) .before-img": {
            style: "background-image: url('assets/WhatsApp Image 2026-06-24 at 10.52.23 PM.jpeg');"
        },
        ".gallery-grid > div:nth-child(3) .after-img": {
            style: "background-image: url('assets/WhatsApp Image 2026-06-24 at 10.52.23 PM (1).jpeg');"
        },
        ".gallery-grid > div:nth-child(3) .case-badge": "تعديل الإطباق الهيكلي",
        ".gallery-grid > div:nth-child(3) .case-title": "تصحيح العضة العميقة (Overbite)",
        ".gallery-grid > div:nth-child(3) .case-desc": "علاج التغطية الزائدة للأسنان السفلية ورفع العضة وتقديم الفك السفلي لتحسين المظهر الجانبي للوجه والابتسامة.",
        ".gallery-grid > div:nth-child(3) .case-meta-row .meta-item:nth-child(1) span": "<strong>الحالة:</strong> عضة عميقة",
        ".gallery-grid > div:nth-child(3) .case-meta-row .meta-item:nth-child(2) span": "<strong>العمر:</strong> 25 عاماً",
        ".gallery-grid > div:nth-child(3) .case-meta-row .meta-item:nth-child(3) span": "<strong>المدة:</strong> 18 شهراً",
        ".gallery-grid > div:nth-child(3) .case-meta-row .meta-item:nth-child(4) span": "<strong>الزيارات:</strong> 15 زيارة",

        // Case 4
        ".gallery-grid > div:nth-child(4) .before-img": {
            style: "background-image: url('assets/WhatsApp Image 2026-06-24 at 10.52.24 PM.jpeg');"
        },
        ".gallery-grid > div:nth-child(4) .after-img": {
            style: "background-image: url('assets/WhatsApp Image 2026-06-24 at 10.52.24 PM (1).jpeg');"
        },
        ".gallery-grid > div:nth-child(4) .case-badge": "تقويم وقائي وعلاجي",
        ".gallery-grid > div:nth-child(4) .case-title": "تصحيح العضة المعكوسة الجانبية",
        ".gallery-grid > div:nth-child(4) .case-desc": "تصحيح انطباق الأسنان العلوية خلف السفلية جانبياً، وتحقيق محاذاة سليمة تمنع تآكل المفصل الصدغي.",
        ".gallery-grid > div:nth-child(4) .case-meta-row .meta-item:nth-child(1) span": "<strong>الحالة:</strong> عضة معكوسة",
        ".gallery-grid > div:nth-child(4) .case-meta-row .meta-item:nth-child(2) span": "<strong>العمر:</strong> 16 عاماً",
        ".gallery-grid > div:nth-child(4) .case-meta-row .meta-item:nth-child(3) span": "<strong>المدة:</strong> 16 شهراً",
        ".gallery-grid > div:nth-child(4) .case-meta-row .meta-item:nth-child(4) span": "<strong>الزيارات:</strong> 14 زيارة",

        // Case 5
        ".gallery-grid > div:nth-child(5) .before-img": {
            style: "background-image: url('assets/WhatsApp Image 2026-06-24 at 10.52.24 PM.jpeg');"
        },
        ".gallery-grid > div:nth-child(5) .after-img": {
            style: "background-image: url('assets/WhatsApp Image 2026-06-24 at 10.52.24 PM (2).jpeg');"
        },
        ".gallery-grid > div:nth-child(5) .case-badge": "تقويم الأسنان المتقدم",
        ".gallery-grid > div:nth-child(5) .case-title": "علاج العضة المفتوحة الأمامية (Open Bite)",
        ".gallery-grid > div:nth-child(5) .case-desc": "إعادة توجيه الأسنان الأمامية وتنزيلها لتتطابق بشكل سليم، وتصحيح وظائف التحدث والمضغ لثقة متجددة.",
        ".gallery-grid > div:nth-child(5) .case-meta-row .meta-item:nth-child(1) span": "<strong>الحالة:</strong> عضة مفتوحة",
        ".gallery-grid > div:nth-child(5) .case-meta-row .meta-item:nth-child(2) span": "<strong>العمر:</strong> 20 عاماً",
        ".gallery-grid > div:nth-child(5) .case-meta-row .meta-item:nth-child(3) span": "<strong>المدة:</strong> 20 شهراً",
        ".gallery-grid > div:nth-child(5) .case-meta-row .meta-item:nth-child(4) span": "<strong>الزيارات:</strong> 18 زيارة",

        // Case 6
        ".gallery-grid > div:nth-child(6) .before-img": {
            style: "background-image: url('assets/WhatsApp Image 2026-06-24 at 10.52.21 PM.jpeg');"
        },
        ".gallery-grid > div:nth-child(6) .after-img": {
            style: "background-image: url('assets/WhatsApp Image 2026-06-24 at 10.52.21 PM (1).jpeg');"
        },
        ".gallery-grid > div:nth-child(6) .case-badge": "التقويم الشفاف (ألاينرز)",
        ".gallery-grid > div:nth-child(6) .case-title": "تقويم غير مرئي لمشكلة الفراغات والاعوجاج",
        ".gallery-grid > div:nth-child(6) .case-desc": "علاج تجميلي ووظيفي بالكامل باستخدام قوالب الألاينرز الشفافة سريعة الفك والتركيب والمصممة رقمياً بالكامل.",
        ".gallery-grid > div:nth-child(6) .case-meta-row .meta-item:nth-child(1) span": "<strong>الحالة:</strong> تقويم شفاف",
        ".gallery-grid > div:nth-child(6) .case-meta-row .meta-item:nth-child(2) span": "<strong>العمر:</strong> 28 عاماً",
        ".gallery-grid > div:nth-child(6) .case-meta-row .meta-item:nth-child(3) span": "<strong>المدة:</strong> 12 شهراً",
        ".gallery-grid > div:nth-child(6) .case-meta-row .meta-item:nth-child(4) span": "<strong>الزيارات:</strong> 8 زيارات",

        // Case 7
        ".gallery-grid > div:nth-child(7) .before-img": {
            style: "background-image: url('assets/WhatsApp Image 2026-06-25 at 7.41.45 PM.jpeg');"
        },
        ".gallery-grid > div:nth-child(7) .after-img": {
            style: "background-image: url('assets/WhatsApp Image 2026-06-25 at 7.41.45 PM (1).jpeg');"
        },
        ".gallery-grid > div:nth-child(7) .case-badge": "زراعة وتجميل الأسنان",
        ".gallery-grid > div:nth-child(7) .case-title": "زراعة فورية وتجميل فينير للأسنان الأمامية",
        ".gallery-grid > div:nth-child(7) .case-desc": "تعويض سن مفقود بالزراعة الألمانية الفورية وتركيب عدسات الفينير الرقيقة لبقية الأسنان لابتسامة هوليودية متناسقة.",
        ".gallery-grid > div:nth-child(7) .case-meta-row .meta-item:nth-child(1) span": "<strong>الحالة:</strong> زراعة + تجميل",
        ".gallery-grid > div:nth-child(7) .case-meta-row .meta-item:nth-child(2) span": "<strong>العمر:</strong> 35 عاماً",
        ".gallery-grid > div:nth-child(7) .case-meta-row .meta-item:nth-child(3) span": "<strong>المدة:</strong> 3 أشهر",
        ".gallery-grid > div:nth-child(7) .case-meta-row .meta-item:nth-child(4) span": "<strong>الزيارات:</strong> 4 زيارات",

        // CTA Button
        ".gallery-section > div:nth-child(4) a": "احصل على تشخيص لحالتك الآن"
    }
};
