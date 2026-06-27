// Settings for profile.html (Patient Profile/Portal Page)
export const PageSettings = {
    title: "بوابة المريض - عيادة د. أكثم طنطاوي",
    description: "الملف الشخصي للمريض لمتابعة الخطة العلاجية والمواعيد الطبية لتقويم الأسنان.",
    keywords: "بوابة المريض, ملف المريض, مواعيد عيادة الاسنان",
    dynamicContent: {
        // Page header
        ".profile-section .section-label": "البوابة الرقمية للمريض",
        ".profile-section .section-title": "ملف المريض الموحد",
        ".profile-section .section-desc": "متابعة مواعيدك، فواتيرك، توصيات الطبيب، والتقدم العلاجي لحالتك",

        // Medical Card (Right Sidebar)
        ".patient-info-card:nth-child(1) .profile-status-badge": "<i class=\"bx bxs-circle status-online animate-pulse\"></i> ملف طبي نشط",
        ".patient-info-card:nth-child(1) .patient-details-list .detail-item:nth-child(1) .item-lbl": "<i class=\"bx bx-phone\"></i> رقم الجوال:",
        ".patient-info-card:nth-child(1) .patient-details-list .detail-item:nth-child(2) .item-lbl": "<i class=\"bx bx-envelope\"></i> البريد الإلكتروني:",
        ".patient-info-card:nth-child(1) .patient-details-list .detail-item:nth-child(3) .item-lbl": "<i class=\"bx bx-id-card\"></i> معرف الملف الطبي:",
        ".patient-info-card:nth-child(1) .patient-details-list .detail-item:nth-child(4) .item-lbl": "<i class=\"bx bx-calendar\"></i> العمر:",

        // Sidebar Tabs Navigation
        ".glass-card:nth-of-type(2) .profile-sub-title": "<i class=\"bx bx-menu\"></i> أقسام الحساب",
        "#tabBtn1": "<i class=\"bx bx-calendar-event\" style=\"font-size: 18px;\"></i> المواعيد والحجوزات",
        "#tabBtn2": "<i class=\"bx bx-pulse\" style=\"font-size: 18px;\"></i> الملف الطبي والخطط",
        "#tabBtn3": "<i class=\"bx bx-receipt\" style=\"font-size: 18px;\"></i> الفواتير والمدفوعات",
        "#tabBtn4": "<i class=\"bx bx-star\" style=\"font-size: 18px;\"></i> توصيات الطبيب المعالج",

        // Hidden Developer Config Section
        "#adminConfigSection .profile-box-title": "<i class=\"bx bx-cog\"></i> إعدادات المطور والربط",
        "#adminConfigSection .profile-instructions-text": "إعدادات تكامل تليجرام وبوت التنبيهات وقاعدة بيانات Supabase السحابية.",
        "#adminConfigSection h4:nth-of-type(1)": "إعدادات تليجرام",
        "#adminConfigSection .tg-config-form div:nth-child(1) label": "توكن البوت (Bot Token)",
        "#adminConfigSection .tg-config-form div:nth-child(2) label": "معرف الدردشة (Chat ID)",
        "#adminConfigSection .tg-config-form div:nth-child(3) label": "طريقة التشغيل",
        "#saveTgSettingsBtn": "حفظ إعدادات تليجرام",
        "#adminConfigSection h4:nth-of-type(2)": "إعدادات Supabase",
        "#adminConfigSection .sb-config-form div:nth-child(1) label": "رابط المشروع (URL)",
        "#adminConfigSection .sb-config-form div:nth-child(2) label": "مفتاح Anon API Key",
        "#saveSbSettingsBtn": "حفظ ومزامنة Supabase",
        "#adminConfigSection details summary": "كود SQL لجدول bookings",

        // TAB 1: Booking & Appointment Lists
        "#tabPanel1 .bookings-list-card .profile-box-title": "<i class=\"bx bx-calendar-event\"></i> سجل الحجوزات والمواعيد",
        "#noBookingsView h4": "لا توجد مواعيد نشطة حالياً",
        "#noBookingsView p": "ابتسامتك المشرقة لا يجب أن تنتظر! احجز موعدك التفاعلي مع الدكتور أكثم الآن في دقائق.",
        "#noBookingsView a": "احجز موعد الآن",
        "#addReviewSection .profile-sub-title": "<i class=\"bx bx-edit-alt\"></i> قيم تجربتك العلاجية بالعيادة",
        "#addReviewSection .profile-instructions-text": "ملاحظاتك تساعدنا في تحسين الرعاية وتقديم خدمة تليق بمرضانا.",
        "#addReviewForm div:nth-child(1) label": "التقييم بالنجوم:",
        "#addReviewForm div:nth-child(2) label": "تفاصيل تجربتك العلاجية:",
        "#reviewText": {
            placeholder: "شارِكنا رأيك بكل أمانة حول الدكتور وتجهيزات العيادة..."
        },
        "#addReviewForm button[type=\"submit\"]": "إرسال التقييم ونشره بالرئيسية",

        // TAB 2: Medical File & Progress Tracker
        "#tabPanel2 .bookings-list-card > div:nth-child(1) .profile-box-title": "<i class=\"bx bx-pulse\"></i> خطة العلاج والتقدم الإكلينيكية",
        "#progressServiceTitle": "خطة تقويم الأسنان الشفاف (Invisalign)",
        "#progressPctText": "65%",
        "#tabPanel2 .bookings-list-card > div:nth-child(1) p": "التقويم في الشهر 8 من أصل 12 شهراً. تم إنجاز 16 قالباً علاجياً بنجاح، قوس الإطباق يتحسن بمعدل ممتاز.",

        // Ziyarat / Follow-up Tracker
        "#tabPanel2 .bookings-list-card > div:nth-child(2) .profile-sub-title": "<i class=\"bx bx-check-double\"></i> جدول المتابعات الدورية والزيارات",
        "#tabPanel2 .bookings-list-card > div:nth-child(2) div div:nth-child(1) span:nth-child(1)": "<i class=\"bx bx-check-circle\"></i> الشهر الأول: أخذ قياسات ومحاكاة الابتسامة",
        "#tabPanel2 .bookings-list-card > div:nth-child(2) div div:nth-child(1) span:nth-child(2)": "مكتمل - ٢٠٢٦/٠١/١٠",
        "#tabPanel2 .bookings-list-card > div:nth-child(2) div div:nth-child(2) span:nth-child(1)": "<i class=\"bx bx-check-circle\"></i> الشهر الرابع: تسليم الدفعة الثانية من القوالب",
        "#tabPanel2 .bookings-list-card > div:nth-child(2) div div:nth-child(2) span:nth-child(2)": "مكتمل - ٢٠٢٦/٠٤/١٢",
        "#tabPanel2 .bookings-list-card > div:nth-child(2) div div:nth-child(3) span:nth-child(1)": "<i class=\"bx bx-loader-circle animate-spin\"></i> الشهر الثامن: مراجعة المسافة وتوسيع الفك (الزيارة الحالية)",
        "#tabPanel2 .bookings-list-card > div:nth-child(2) div div:nth-child(3) span:nth-child(2)": "قيد التنفيذ - ٢٠٢٦/٠٦/٢٤",
        "#tabPanel2 .bookings-list-card > div:nth-child(2) div div:nth-child(4) span:nth-child(1)": "<i class=\"bx bx-time-five\"></i> الشهر الثاني عشر: التقييم النهائي وفك التقويم وتثبيت الأسنان",
        "#tabPanel2 .bookings-list-card > div:nth-child(2) div div:nth-child(4) span:nth-child(2)": "قيد الانتظار - ٢٠٢٦/١٠/١٥",

        // Digital X-rays
        "#tabPanel2 .bookings-list-card > div:nth-child(3) .profile-sub-title": "<i class=\"bx bx-images\"></i> أرشيف الأشعة والفحوصات ثلاثية الأبعاد",
        "#tabPanel2 .bookings-list-card > div:nth-child(3) div div:nth-child(1) h5": "أشعة بانورامية كاملة",
        "#tabPanel2 .bookings-list-card > div:nth-child(3) div div:nth-child(1) span:nth-of-type(2)": "تاريخ: ٢٠٢٦/٠٦/٢٤",
        "#tabPanel2 .bookings-list-card > div:nth-child(3) div div:nth-child(2) h5": "أشعة سيفالومترية جانبية",
        "#tabPanel2 .bookings-list-card > div:nth-child(3) div div:nth-child(2) span:nth-of-type(2)": "تاريخ: ٢٠٢٦/٠٦/٢٤",
        "#tabPanel2 .bookings-list-card > div:nth-child(3) div div:nth-child(3) h5": "مسح رقمي ثلاثي الأبعاد",
        "#tabPanel2 .bookings-list-card > div:nth-child(3) div div:nth-child(3) span:nth-of-type(2)": "تاريخ: ٢٠٢٦/٠٦/٢٤",

        // Smile Album progress photos
        "#tabPanel2 .bookings-list-card > div:nth-child(4) .profile-sub-title": "<i class=\"bx bx-select-multiple\"></i> ألبوم تطور محاذاة الأسنان والابتسامة",
        "#tabPanel2 .bookings-list-card > div:nth-child(4) div div:nth-child(1) div": "قبل العلاج",
        "#tabPanel2 .bookings-list-card > div:nth-child(4) div div:nth-child(1) img": {
            src: "assets/WhatsApp Image 2026-06-24 at 10.52.22 PM.jpeg",
            alt: "قبل البدء"
        },
        "#tabPanel2 .bookings-list-card > div:nth-child(4) div div:nth-child(2) div": "الشهر ٣",
        "#tabPanel2 .bookings-list-card > div:nth-child(4) div div:nth-child(2) img": {
            src: "assets/WhatsApp Image 2026-06-24 at 10.52.22 PM (1).jpeg",
            alt: "الشهر ٣"
        },
        "#tabPanel2 .bookings-list-card > div:nth-child(4) div div:nth-child(3) div": "الشهر ٦",
        "#tabPanel2 .bookings-list-card > div:nth-child(4) div div:nth-child(3) img": {
            src: "assets/WhatsApp Image 2026-06-24 at 10.52.22 PM (2).jpeg",
            alt: "الشهر ٦"
        },
        "#tabPanel2 .bookings-list-card > div:nth-child(4) div div:nth-child(4) div": "اليوم (الشهر ٨)",
        "#tabPanel2 .bookings-list-card > div:nth-child(4) div div:nth-child(4) img": {
            src: "assets/WhatsApp Image 2026-06-24 at 10.52.21 PM (1).jpeg",
            alt: "اليوم"
        },

        // Clinical notes
        ".medical-file-records .profile-sub-title": "<i class=\"bx bx-notepad\"></i> سجل الملاحظات السريرية بالملف",
        ".medical-file-records div div:nth-child(1) .record-title": "الفحص السريري والاستشارة المجانية الأولى",
        ".medical-file-records div div:nth-child(1) .record-date": "مكتمل - ٢٠٢٦/٠١/١٠",
        ".medical-file-records div div:nth-child(1) .record-desc": "تشخيص تزاحم الأسنان بالفك العلوي بمعدل 4.5 مم. الفك السفلي سليم عموماً مع إطباق زائد من فئة Class II div 1. تقرر البدء ببرنامج التقويم الشفاف Invisalign بمعدل 24 قالباً علاجياً.",
        ".medical-file-records div div:nth-child(2) .record-title": "جلسة تسليم وتركيب قوالب التقويم",
        ".medical-file-records div div:nth-child(2) .record-date": "مكتمل - ٢٠٢٦/٠٤/١٢",
        ".medical-file-records div div:nth-child(2) .record-desc": "تركيب المرفقات التجميلية (Attachments) على الضواحك العلوية والرباعيات، تسليم القوالب من ١ إلى ١٢ والتأكيد على المريض بالارتداء لمدة ٢٢ ساعة يومياً.",
        ".medical-file-records div div:nth-child(3) .record-title": "جلسة فك المرفقات والتثبيت النهائي",
        ".medical-file-records div div:nth-child(3) .record-date": "قيد الانتظار لمرحلة لاحقة",
        ".medical-file-records div div:nth-child(3) .record-desc": "إزالة المرفقات التجميلية وتلميع الأسنان بجهاز بروفي، أخذ طبعة رقمية للمثبت النهائي (Vivera Retainers) لضمان المحافظة على نتيجة المحاذاة الممتازة.",

        // TAB 3: Invoices & Financials
        "#tabPanel3 .bookings-list-card .profile-box-title": "<i class=\"bx bx-receipt\"></i> سجل الفواتير والمستندات المالية",
        "#tabPanel3 .invoices-list-grid div:nth-child(1) .invoice-code": "رقم الفاتورة: INV-26-904",
        "#tabPanel3 .invoices-list-grid div:nth-child(1) .invoice-title": "كشف تشخيصي واستشارة أولية مجانية",
        "#tabPanel3 .invoices-list-grid div:nth-child(1) .invoice-price": "0 ريال",
        "#tabPanel3 .invoices-list-grid div:nth-child(2) .invoice-code": "رقم الفاتورة: INV-26-993",
        "#tabPanel3 .invoices-list-grid div:nth-child(2) .invoice-title": "جلسة تنظيف وتلميع وإزالة جير وقائي",
        "#tabPanel3 .invoices-list-grid div:nth-child(2) .invoice-price": "250 ريال",
        "#tabPanel3 .invoices-list-grid div:nth-child(3) .invoice-code": "رقم الفاتورة: INV-26-1045",
        "#tabPanel3 .invoices-list-grid div:nth-child(3) .invoice-title": "قالب تبييض منزلي وقائي مخصص",
        "#tabPanel3 .invoices-list-grid div:nth-child(3) .invoice-price": "قيد الجدولة",

        // TAB 4: Doctor Recommendations
        "#tabPanel4 .bookings-list-card .profile-box-title": "<i class=\"bx bx-star\"></i> توصيات الطبيب المعالج اليومية",
        ".doc-recs-box p": "مرحباً بك! يرجى الالتزام بالتعليمات والخطوات الوقائية التالية الموصى بها من قبل الدكتور أكثم طنطاوي لضمان سلامة أسنانك وسرعة استجابة اللثة للعلاج:",
        ".rec-list li:nth-child(1)": "<i class=\"bx bx-check-circle\"></i> استخدام فرشاة أسنان ناعمة مخصصة للثة مرتين يومياً على الأقل لمدة دقيقتين.",
        ".rec-list li:nth-child(2)": "<i class=\"bx bx-check-circle\"></i> استخدام معجون أسنان غني بالفلورايد ومقاوم للتكلس لحماية المينا من الأحماض.",
        ".rec-list li:nth-child(3)": "<i class=\"bx bx-check-circle\"></i> التخفيف قدر الإمكان من تناول المشروبات السكرية والقهوة والشاي لثبات بياض الأسنان.",
        ".rec-list li:nth-child(4)": "<i class=\"bx bx-check-circle\"></i> استخدام خيط الأسنان الطبي (المائي أو الحريري) للتنظيف بين الأسنان مرة كل مساء.",
        ".rec-list li:nth-child(5)": "<i class=\"bx bx-check-circle\"></i> في حال الشعور بأي ألم طارئ أو نزيف لثوي، يرجى تفعيل طلب اتصال عاجل من قسم الاتصال بنا فوراً."
    }
};
