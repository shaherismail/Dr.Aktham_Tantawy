// Settings for services.html (Services Page)
export const PageSettings = {
    title: "خدماتنا - عيادة د. أكثم طنطاوي",
    description: "خدمات عيادة الدكتور أكثم طنطاوي لطب الأسنان: زراعة الأسنان، تقويم، علاج الجذور، ابتسامة هوليود، وتبييض الأسنان.",
    keywords: "خدمات العيادة, تقويم شفاف, تقويم معدني, تقويم خزفي",
    dynamicContent: {
        // Page header
        ".services-section .section-title": "ابتسامة مثالية وصحة فموية مستدامة",
        ".services-section .section-desc": "نركز بصفة أساسية على تقويم الأسنان الحديث وتعديل الإطباق بأحدث الأنظمة الرقمية، إلى جانب تقديم رعاية سنية شاملة ومتكاملة.",

        // Card 1: Orthodontics
        ".grid-4 > div:nth-child(1) img": {
            src: "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=400&q=80",
            alt: "تقويم الأسنان التخصصي"
        },
        ".grid-4 > div:nth-child(1) .service-badge": "التخصص الرئيسي للعيادة",
        ".grid-4 > div:nth-child(1) .card-title": "تقويم الأسنان التخصصي",
        ".grid-4 > div:nth-child(1) .service-card-desc": "تعديل ورصف الأسنان المزدحمة وتصحيح إطباق الفكين ومشاكل الفك العلوي والسفلي بأدق المعايير الطبية.",

        // Card 2: Clear Aligners
        ".grid-4 > div:nth-child(2) img": {
            src: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=400&q=80",
            alt: "تقويم الأسنان الشفاف"
        },
        ".grid-4 > div:nth-child(2) .service-badge": "تقنية رقمية ثلاثية الأبعاد",
        ".grid-4 > div:nth-child(2) .card-title": "التقويم الشفاف (ألاينرز)",
        ".grid-4 > div:nth-child(2) .service-card-desc": "أجهزة تقويمية غير مرئية وقابلة للإزالة لتعديل الأسنان براحة تامة ودون إحراج، مصممة حاسوبياً بالكامل.",

        // Card 3: Ceramic Braces
        ".grid-4 > div:nth-child(3) img": {
            src: "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=400&q=80",
            alt: "التقويم الخزفي التجميلي"
        },
        ".grid-4 > div:nth-child(3) .service-badge-secondary": "مظهر طبيعي جمالي",
        ".grid-4 > div:nth-child(3) .card-title": "التقويم الخزفي التجميلي",
        ".grid-4 > div:nth-child(3) .service-card-desc": "حواصر تقويمية خزفية شفافة تتطابق مع لون الأسنان الطبيعي لتقدم علاجاً فعالاً ومظهراً لائقاً جداً.",

        // Card 4: Children Orthodontics
        ".grid-4 > div:nth-child(4) img": {
            src: "https://images.unsplash.com/photo-1513415277900-a62401e50853?auto=format&fit=crop&w=400&q=80",
            alt: "تقويم الأسنان للأطفال"
        },
        ".grid-4 > div:nth-child(4) .service-badge-secondary": "علاج وقائي مبكر",
        ".grid-4 > div:nth-child(4) .card-title": "تقويم الأسنان للأطفال",
        ".grid-4 > div:nth-child(4) .service-card-desc": "توجيه نمو الفكين مبكراً ورصف الأسنان الجديدة لمنع حدوث تشوهات إطباقية معقدة في المستقبل.",

        // Card 5: Adult Orthodontics
        ".grid-4 > div:nth-child(5) img": {
            src: "https://images.unsplash.com/photo-1629909615184-74f495363b67?auto=format&fit=crop&w=400&q=80",
            alt: "تقويم الأسنان للبالغين"
        },
        ".grid-4 > div:nth-child(5) .card-title": "تقويم الأسنان للبالغين",
        ".grid-4 > div:nth-child(5) .service-card-desc": "حلول علاجية وتجميلية متكاملة للبالغين تناسب التزاماتهم المهنية وتحقق نتائج باهرة وابتسامة واثقة.",

        // Card 6: Retainers
        ".grid-4 > div:nth-child(6) img": {
            src: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=400&q=80",
            alt: "أجهزة تثبيت الأسنان"
        },
        ".grid-4 > div:nth-child(6) .card-title": "مثبتات الأسنان (Retainers)",
        ".grid-4 > div:nth-child(6) .service-card-desc": "مثبتات سلكية أو شفافة مخصصة للمحافظة على مواضع الأسنان وحمايتها من التراجع بعد فك التقويم.",

        // Card 7: Smile Design
        ".grid-4 > div:nth-child(7) img": {
            src: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=400&q=80",
            alt: "تصميم الابتسامة"
        },
        ".grid-4 > div:nth-child(7) .card-title": "تصميم الابتسامة الرقمي",
        ".grid-4 > div:nth-child(7) .service-card-desc": "استخدام عدسات الفينير واللومينير فائقة الرقة لتجميل وتنسيق الأسنان وتغيير شكلها ولونها بجمال طبيعي.",

        // Card 8: Dental Implants
        ".grid-4 > div:nth-child(8) img": {
            src: "https://images.unsplash.com/photo-1579684389782-64d84b5e905d?auto=format&fit=crop&w=400&q=80",
            alt: "زراعة الأسنان الرقمية"
        },
        ".grid-4 > div:nth-child(8) .card-title": "زراعة الأسنان الرقمية",
        ".grid-4 > div:nth-child(8) .service-card-desc": "تعويض الأسنان المفقودة بأجود الغرسات المعتمدة عالمياً واستعادة وظائف الفم والمضغ والمظهر الطبيعي.",

        // Card 9: Root Canal
        ".grid-4 > div:nth-child(9) img": {
            src: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=400&q=80",
            alt: "علاج العصب والجذور"
        },
        ".grid-4 > div:nth-child(9) .card-title": "علاج قنوات الجذور والأعصاب",
        ".grid-4 > div:nth-child(9) .service-card-desc": "تنظيف وحشو جذور الأسنان بدقة متناهية تحت التكبير لإنقاذ الضرس الطبيعي وتخفيف الآلام بسرعة.",

        // Card 10: Oral Surgery
        ".grid-4 > div:nth-child(10) img": {
            src: "https://images.unsplash.com/photo-1579684389782-64d84b5e905d?auto=format&fit=crop&w=400&q=80",
            alt: "جراحة الفم الصغرى"
        },
        ".grid-4 > div:nth-child(10) .card-title": "جراحة الفم والأسنان الصغرى",
        ".grid-4 > div:nth-child(10) .service-card-desc": "خلع الأسنان وأضراس العقل المطمورة بدقة جراحية وبأقل قدر من الانزعاج، وعلاجات اللثة التجميلية.",

        // Card 11: General Dentistry
        ".grid-4 > div:nth-child(11) img": {
            src: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=400&q=80",
            alt: "طب الأسنان العام والتنظيف"
        },
        ".grid-4 > div:nth-child(11) .card-title": "طب الأسنان العام والتنظيف",
        ".grid-4 > div:nth-child(11) .service-card-desc": "التشخيص الدوري، إزالة الجير والترسبات، علاج التسوس بالحشوات التجميلية، وحماية صحة الأسنان العامة."
    }
};
