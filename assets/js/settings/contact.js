// Settings for contact.html (Contact Page)
export const PageSettings = {
    title: "اتصل بنا - عيادة د. أكثم طنطاوي بالزقازيق | 01070542331",
    description: "تواصل مع عيادة د. أكثم طنطاوي لطب الأسنان بالزقازيق: العنوان موقف المنصورة بجوار مستشفى الطوارئ التخصصي، هاتف وواتساب 01070542331، وساعات العمل.",
    keywords: "اتصل بنا, عنوان عيادة د. أكثم طنطاوي, رقم عيادة أسنان الزقازيق, موقف المنصورة الزقازيق",
    dynamicContent: {
        // Page header
        ".contact-section .section-label": "تواصل معنا",
        ".contact-section .section-title": "نحن هنا للإجابة على استفساراتكم",
        ".contact-section .section-desc": "للحجز أو الاستفسار عن الخدمات والمواعيد، تواصل مع العيادة.",
        
        // Right Column: Contact Details Cards
        ".patient-info-card:nth-child(1) .profile-box-title": "<i class=\"bx bx-info-circle\"></i> معلومات الاتصال",
        ".patient-details-list .detail-item:nth-child(1) .item-lbl": "<i class=\"bx bx-phone\"></i> أرقام الهاتف والجوال:",
        ".patient-details-list .detail-item:nth-child(2) .item-lbl": "<i class=\"bx bx-map\"></i> موقع العيادة:",
        ".patient-details-list .detail-item:nth-child(3) .item-lbl": "<i class=\"bx bx-time\"></i> ساعات العمل الرسمية:",
        ".patient-details-list .detail-item:nth-child(4) .item-lbl": "<i class=\"bx bx-money\"></i> سعر الكشف المباشر:",
        
        // Direct WhatsApp Button
        ".patient-info-card:nth-child(1) a.btn-secondary": "<i class=\"bx bxl-whatsapp\" style=\"font-size: 22px;\"></i> تواصل معنا عبر واتساب مباشرة",

        // Left Column: Send Message Form
        ".patient-info-card:nth-child(2) .profile-box-title": "<i class=\"bx bx-envelope-open\"></i> أرسل لنا رسالة مباشرة",
        "#contactForm div:nth-child(1) label": "الاسم الكريم",
        "#contactForm div:nth-child(1) input": {
            placeholder: "اكتب اسمك هنا"
        },
        "#contactForm div:nth-child(2) label": "رقم الجوال",
        "#contactForm div:nth-child(2) input": {
            placeholder: "01xxxxxxxxx"
        },
        "#contactForm div:nth-child(3) label": "البريد الإلكتروني",
        "#contactForm div:nth-child(3) input": {
            placeholder: "name@domain.com"
        },
        "#contactForm div:nth-child(4) label": "تفاصيل الاستفسار أو الرسالة",
        "#contactForm div:nth-child(4) textarea": {
            placeholder: "اكتب استفسارك بالتفصيل هنا..."
        },
        "#contactForm button[type=\"submit\"]": "إرسال الاستفسار الآن <i class=\"bx bx-send\"></i>"
    }
};
