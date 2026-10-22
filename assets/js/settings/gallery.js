// Settings for gallery.html (Gallery Page)
export const PageSettings = {
    title: "صور من العيادة | د. أكثم طنطاوي بالزقازيق",
    description: "صور من عيادة د. أكثم طنطاوي لطب الأسنان وتقويم الأسنان في الزقازيق.",
    keywords: "صور عيادة أسنان الزقازيق, تقويم الأسنان, عيادة د. أكثم طنطاوي",
    dynamicContent: {
        // Page header
        ".gallery-section .section-label": "صور العيادة",
        ".gallery-section .section-title": "صور العيادة",
        ".gallery-section .section-desc": "تختلف صور العيادة، ولا تمثل وصفاً لخطة علاجية أو نتيجة مضمونة.",

        // Case 1
        ".gallery-grid > div:nth-child(1) img": {
            src: "assets/case2.jpg",
            alt: "صورة من العيادة"
        },

        // Case 2
        ".gallery-grid > div:nth-child(2) img": {
            src: "assets/case1.jpg",
            alt: "صورة من العيادة"
        },

        // Case 3
        ".gallery-grid > div:nth-child(3) .before-img": {
            style: "background-image: url('assets/WhatsApp Image 2026-06-24 at 10.52.23 PM.jpeg');"
        },
        ".gallery-grid > div:nth-child(3) .after-img": {
            style: "background-image: url('assets/WhatsApp Image 2026-06-24 at 10.52.23 PM (1).jpeg');"
        },

        // Case 4
        ".gallery-grid > div:nth-child(4) .before-img": {
            style: "background-image: url('assets/WhatsApp Image 2026-06-24 at 10.52.24 PM.jpeg');"
        },
        ".gallery-grid > div:nth-child(4) .after-img": {
            style: "background-image: url('assets/WhatsApp Image 2026-06-24 at 10.52.24 PM (1).jpeg');"
        },

        // Case 5
        ".gallery-grid > div:nth-child(5) .before-img": {
            style: "background-image: url('assets/WhatsApp Image 2026-06-24 at 10.52.24 PM.jpeg');"
        },
        ".gallery-grid > div:nth-child(5) .after-img": {
            style: "background-image: url('assets/WhatsApp Image 2026-06-24 at 10.52.24 PM (2).jpeg');"
        },

        // Case 6
        ".gallery-grid > div:nth-child(6) .before-img": {
            style: "background-image: url('assets/WhatsApp Image 2026-06-24 at 10.52.21 PM.jpeg');"
        },
        ".gallery-grid > div:nth-child(6) .after-img": {
            style: "background-image: url('assets/WhatsApp Image 2026-06-24 at 10.52.21 PM (1).jpeg');"
        },

        // Case 7
        ".gallery-grid > div:nth-child(7) .before-img": {
            style: "background-image: url('assets/WhatsApp Image 2026-06-25 at 7.41.45 PM.jpeg');"
        },
        ".gallery-grid > div:nth-child(7) .after-img": {
            style: "background-image: url('assets/WhatsApp Image 2026-06-25 at 7.41.45 PM (1).jpeg');"
        },

        // CTA Button
        ".gallery-section > div:nth-child(4) a": "احصل على تشخيص لحالتك الآن"
    }
};
