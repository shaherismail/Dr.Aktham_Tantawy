// Settings for booking.html (Booking Page)
export const PageSettings = {
    title: "احجز موعدك أونلاين | عيادة د. أكثم طنطاوي بالزقازيق",
    description: "احجز موعدك إلكترونياً في عيادة د. أكثم طنطاوي لطب وتقويم الأسنان بالزقازيق - موقف المنصورة. اختر الخدمة والطبيب والتاريخ والوقت المناسب لك.",
    keywords: "حجز موعد أسنان الزقازيق, حجز تقويم أسنان, عيادة الدكتور أكثم طنطاوي, حجز أونلاين دكتور أسنان",
    dynamicContent: {
        // Step Indicators
        "#stepIndicator1": "1 <span class=\"step-label-nav\">المعلومات</span>",
        "#stepIndicator2": "2 <span class=\"step-label-nav\">الخدمة</span>",
        "#stepIndicator3": "3 <span class=\"step-label-nav\">الطبيب</span>",
        "#stepIndicator4": "4 <span class=\"step-label-nav\">التاريخ</span>",
        "#stepIndicator5": "5 <span class=\"step-label-nav\">الوقت</span>",
        "#stepIndicator6": "6 <span class=\"step-label-nav\">التأكيد</span>",

        // Step 1: Patient Information
        "#stepPanel1 .profile-sub-title": "<i class=\"bx bx-user\"></i> البيانات الشخصية للمريض",
        "#stepPanel1 div div:nth-child(1) label": "الاسم الكامل",
        "#stepPanel1 div div:nth-child(1) input": {
            placeholder: "مثال: أحمد محمد طنطاوي"
        },
        "#stepPanel1 div div:nth-child(2) label": "رقم الجوال",
        "#stepPanel1 div div:nth-child(2) input": {
            placeholder: "01xxxxxxxxx"
        },
        "#stepPanel1 div div:nth-child(3) label": "البريد الإلكتروني (اختياري)",
        "#stepPanel1 div div:nth-child(3) input": {
            placeholder: "name@domain.com"
        },
        "#stepPanel1 div div:nth-child(4) label": "العمر",
        "#stepPanel1 div div:nth-child(4) input": {
            placeholder: "العمر بالسنوات"
        },

        // Step 2: Choose Service
        "#stepPanel2 .profile-sub-title": "<i class=\"bx bx-check-shield\"></i> حدد الخدمة الطبية المطلوبة",
        ".services-selector-grid div:nth-child(1) span": "تنظيف وتلميع الأسنان",
        ".services-selector-grid div:nth-child(2) span": "تبييض الأسنان",
        ".services-selector-grid div:nth-child(3) span": "زراعة الأسنان",
        ".services-selector-grid div:nth-child(4) span": "تقويم الأسنان الحديث",
        ".services-selector-grid div:nth-child(5) span": "علاج الجذور والأعصاب",
        ".services-selector-grid div:nth-child(6) span": "الفينير",

        // Step 3: Choose Doctor
        "#stepPanel3 .profile-sub-title": "<i class=\"bx bx-user-voice\"></i> اختر الطبيب المعالج",
        "#stepPanel3 .profile-instructions-text": "اختر الطبيب الذي تود مراجعته",

        // Dr. Aktham Card
        ".doctors-selector-grid > div:nth-child(1) .doctor-badge-ribbon": "الطبيب المعالج",
        ".doctors-selector-grid > div:nth-child(1) img": {
            src: "assets/doctor.jpg",
            alt: "د. أكثم طنطاوي"
        },
        ".doctors-selector-grid > div:nth-child(1) h4": "د. أكثم طنطاوي",
        ".doctors-selector-grid > div:nth-child(1) p:nth-of-type(1)": "طب الأسنان وتقويم الأسنان",
        ".doctors-selector-grid > div:nth-child(1) p:nth-of-type(2)": "",


        // Step 4: Choose Date
        "#stepPanel4 .profile-sub-title": "<i class=\"bx bx-calendar\"></i> حدد تاريخ الحجز المفضل",
        "#stepPanel4 .date-picker-container label": "تاريخ الفحص والمراجعة",

        // Step 5: Choose Time Slot
        "#stepPanel5 .profile-sub-title": "<i class=\"bx bx-time-five\"></i> اختر الجناح والوقت المفضل",
        "#stepPanel5 .profile-instructions-text": "اختر موعداً من المواعيد المتاحة",
        "#selectedSeatInfoCard strong": "الموعد المحدد:",

        // Step 6: Final Confirmation
        "#stepPanel6 .profile-sub-title": "<i class=\"bx bx-list-check\"></i> مراجعة وتأكيد تفاصيل الحجز",
        "#stepPanel6 .glass-card div:nth-child(1) .item-lbl": "<i class=\"bx bx-user\"></i> اسم المريض:",
        "#stepPanel6 .glass-card div:nth-child(2) .item-lbl": "<i class=\"bx bx-phone\"></i> الجوال:",
        "#stepPanel6 .glass-card div:nth-child(3) .item-lbl": "<i class=\"bx bx-purchase-tag\"></i> الخدمة:",
        "#stepPanel6 .glass-card div:nth-child(4) .item-lbl": "<i class=\"bx bx-user-voice\"></i> الطبيب المعالج:",
        "#stepPanel6 .glass-card div:nth-child(5) .item-lbl": "<i class=\"bx bx-calendar\"></i> تاريخ الموعد:",
        "#stepPanel6 .glass-card div:nth-child(6) .item-lbl": "<i class=\"bx bx-time-five\"></i> الوقت والعيادة:",
        "#stepPanel6 .form-group label": "هل لديك أي ملاحظات أو شكوى طبية للطبيب؟ (اختياري)",
        "#stepPanel6 .form-group textarea": {
            placeholder: "اكتب هنا أي تفاصيل إضافية تود إطلاع الدكتور عليها قبل موعدك..."
        },

        // Prev / Next wizard buttons
        "#prevStepBtn": "<i class=\"bx bx-right-arrow-alt\"></i> السابق",
        "#nextStepBtn": "التالي <i class=\"bx bx-left-arrow-alt\"></i>",
        "#submitBookingBtn": "<i class=\"bx bx-check-circle\"></i> تسجيل الحجز الآن"
    }
};
