// Settings for about.html (About Page)
export const PageSettings = {
    title: "Dr. Aktham | عن د. أكثم طنطاوي - تقويم الأسنان بالزقازيق",
    description: "تعرف على د. أكثم إسماعيل طنطاوي وعيادته لطب وتقويم الأسنان في الزقازيق.",
    keywords: "الدكتور أكثم طنطاوي, Dr Aktham Tantawy, طبيب أسنان الزقازيق, تقويم الأسنان",
    dynamicContent: {
        // Portrait Image
        ".doctor-image-container img": {
            src: "assets/doctor.jpg",
            alt: "د. أكثم طنطاوي"
        },
        ".doctor-stats-badge .tag-title": "د. أكثم طنطاوي",
        ".doctor-stats-badge .tag-subtitle": "تقويم الأسنان",

        // Biography Text
        ".doctor-info-content .section-label": "عن الطبيب",
        ".doctor-bio-title": "د. أكثم إسماعيل طنطاوي",
        ".doctor-specialty-tag": "طب الأسنان وتقويم الأسنان",
        ".doctor-bio-text": "يقدم د. أكثم إسماعيل طنطاوي رعاية في مجال طب الأسنان وتقويم الأسنان في الزقازيق. يشرح الطبيب خيارات العلاج بعد فحص الحالة، وقد تختلف الخطة والمدة من شخص لآخر.",

        // Verified credential shown in the certificate image
        ".doctor-highlights .highlight-box:nth-child(1) .highlight-text": "طب الأسنان وتقويم الأسنان",
        ".doctor-highlights .highlight-box:nth-child(2) .highlight-text": "",
        ".doctor-highlights .highlight-box:nth-child(3) .highlight-text": "",
        ".doctor-highlights .highlight-box:nth-child(4) .highlight-text": "",
        ".doctor-info-content .glass-card h4": "الملف المهني",
        ".doctor-info-content .glass-card p": "للاطلاع على المعلومات المهنية كما يعرضها الملف على فيزيتا، يرجى زيارة الرابط التالي.",

        // Remove unsupported timeline claims from the rendered page
        ".about-doctor-section > div:nth-child(2) .section-header .section-label": "",
        ".about-doctor-section > div:nth-child(2) .section-header .section-title": "",
        ".about-doctor-section > div:nth-child(2) .section-header .section-desc": "",
        ".experience-timeline": "",

        // Video Introduction Section
        ".about-doctor-section > div:nth-child(3) .section-header .section-label": "فيديو ترحيبي",
        ".about-doctor-section > div:nth-child(3) .section-header .section-title": "فيديو تعريفي بالعيادة والتجهيزات",
        ".about-doctor-section > div:nth-child(3) .section-header .section-desc": "مقطع مصوّر من العيادة.",

        // Clinic Interior Gallery Section
        ".about-doctor-section > div:nth-child(4) .section-header .section-label": "صور العيادة",
        ".about-doctor-section > div:nth-child(4) .section-header .section-title": "صور من العيادة",
        ".about-doctor-section > div:nth-child(4) .section-header .section-desc": "لقطات مصوّرة داخل العيادة.",
        ".about-doctor-section > div:nth-child(2)": "",
        ".about-doctor-section > div:nth-child(3) .section-header .section-desc": "مقطع مصوّر من العيادة.",

        // Gallery Photos

        // Call to action button
        ".about-doctor-section > div:nth-child(5) a": "احجز استشارة تقويم مع الدكتور الآن"
    }
};
