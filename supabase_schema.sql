-- ==========================================
-- DR. AKTHAM TANTAWY CLINIC WEBSITE SCHEMA
-- COMPLETE DYNAMIC DATABASE ARCHITECTURE
-- ==========================================

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- 1. SITE SETTINGS TABLE (Single Row Configuration)
create table if not exists site_settings (
    id integer primary key default 1 check (id = 1),
    clinic_name text not null default 'عيادة الدكتور أكثم إسماعيل لتقويم الأسنان',
    logo_url text not null default 'assets/logo.jpg',
    favicon_url text default 'assets/logo.jpg',
    phone text not null default '+966 50 123 4567',
    whatsapp text not null default '+966501234567',
    email text not null default 'info@dr-aktham.com',
    address text not null default 'الرياض، شارع التخصصي',
    google_maps_iframe text not null default 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14498.461622329388!2d46.66699625!3d24.6937402!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e2f03328e1858bb%3A0xe54e6fa16b0810bd!2z2LTYp9ix2Lkg2KfZhNiq2K7Ytdi12Yog2KfZhNix2YrYp9i2!5e0!3m2!1sar!2ssa!4v1719266624000!5m2!1sar!2ssa',
    working_hours jsonb default '[
        {"day": "السبت", "hours": "٩:٠٠ ص - ٩:٠٠ م"},
        {"day": "الأحد", "hours": "٩:٠٠ ص - ٩:٠٠ م"},
        {"day": "الاثنين", "hours": "٩:٠٠ ص - ٩:٠٠ م"},
        {"day": "الثلاثاء", "hours": "٩:٠٠ ص - ٩:٠٠ م"},
        {"day": "الأربعاء", "hours": "٩:٠٠ ص - ٩:٠٠ م"},
        {"day": "الخميس", "hours": "٩:٠٠ ص - ٩:٠٠ م"},
        {"day": "الجمعة", "hours": "مغلق"}
    ]'::jsonb,
    seo_title text default 'مركز الدكتور أكثم إسماعيل لتقويم الأسنان',
    seo_description text default 'الموقع الرسمي لعيادة الدكتور أكثم إسماعيل طنطاوي لتقويم وتجميل الأسنان. مركز تقويم أسنان متقدم وتصميم الابتسامة.',
    open_graph_image text default 'assets/doctor.jpg',
    social_links jsonb default '{
        "facebook": "https://facebook.com",
        "instagram": "https://instagram.com",
        "twitter": "https://twitter.com"
    }'::jsonb,
    analytics_google_id text default 'G-XXXXXXXXXX',
    analytics_search_console_id text default 'google-search-console-verification',
    emergency_phone text not null default '+966 50 999 1111',
    branches jsonb default '[{"name": "فرع الرياض التخصصي", "address": "شارع التخصصي"}]'::jsonb,
    announcement_text text default 'خصم خاص ٢٠٪ على مصففات التقويم الشفاف هذا الشهر 🎉 احجز استشارتك الآن!',
    announcement_visible boolean default true,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. THEME SETTINGS TABLE (Single Row Configuration)
create table if not exists theme_settings (
    id integer primary key default 1 check (id = 1),
    primary_color text not null default '#1565FF',
    secondary_color text not null default '#F8FAFC',
    accent_color text not null default '#0F172A',
    success_color text not null default '#10B981',
    warning_color text not null default '#F59E0B',
    danger_color text not null default '#EF4444',
    border_radius text not null default '16px',
    button_style text not null default 'glass',
    card_style text not null default 'glassmorphism',
    fonts jsonb default '{
        "body": "Tajawal",
        "headings": "Outfit"
    }'::jsonb,
    spacing_scale text not null default '1rem',
    dark_mode boolean default false,
    glass_effects boolean default true,
    animation_speed text default '0.3s',
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. NAVIGATION MENU TABLE
create table if not exists navigation_menu (
    id uuid primary key default uuid_generate_v4(),
    menu_type text not null default 'desktop', -- desktop, mobile, footer, quick_links
    label text not null,
    link text not null,
    icon text,
    display_order integer default 0,
    is_visible boolean default true,
    badge text,
    permissions text[] default '{}'::text[],
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. SEO PAGES TABLE
create table if not exists seo_pages (
    id uuid primary key default uuid_generate_v4(),
    slug text unique not null, -- index, about, services, gallery, booking, contact, profile
    title text not null,
    description text not null,
    keywords text,
    canonical_url text,
    robots text default 'index, follow',
    schema_markup jsonb default '{}'::jsonb,
    open_graph_title text,
    open_graph_desc text,
    open_graph_image text,
    twitter_card text default 'summary_large_image',
    sitemap_priority numeric(3,2) default 0.80,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. DOCTOR PROFILE TABLE
create table if not exists doctor_profile (
    id uuid primary key default uuid_generate_v4(),
    name text not null default 'د. أكثم إسماعيل طنطاوي',
    title text not null default 'استشاري تقويم الأسنان والفكين للبالغين والأطفال',
    bio text not null,
    portrait_url text not null default 'assets/doctor.jpg',
    qualifications text[] default '{}'::text[],
    highlights text[] default '{}'::text[],
    timeline jsonb default '[]'::jsonb,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. CLINIC STATISTICS TABLE
create table if not exists clinic_statistics (
    id uuid primary key default uuid_generate_v4(),
    label text not null,
    value text not null,
    trend text,
    display_order integer default 0,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. WORKING HOURS TABLE
create table if not exists working_hours (
    id uuid primary key default uuid_generate_v4(),
    day_name text not null unique,
    open_time text not null default '09:00 ص',
    close_time text not null default '09:00 م',
    is_holiday boolean default false,
    max_appointments integer default 15,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. SOCIAL LINKS TABLE
create table if not exists social_links (
    id uuid primary key default uuid_generate_v4(),
    platform text not null unique,
    url text not null,
    icon text not null,
    is_visible boolean default true,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. FOOTER CONTENT TABLE
create table if not exists footer_content (
    id integer primary key default 1 check (id = 1),
    copyright_text text not null default 'جميع الحقوق محفوظة © ٢٠٢٦ عيادة الدكتور أكثم إسماعيل طنطاوي',
    privacy_policy_url text default '#',
    terms_url text default '#',
    emergency_numbers jsonb default '[]'::jsonb,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. NEWSLETTER SUBSCRIBERS
create table if not exists newsletter (
    id uuid primary key default uuid_generate_v4(),
    email text unique not null,
    status text default 'active',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 11. PAGE BUILDER & SECTIONS
create table if not exists page_builder (
    id uuid primary key default uuid_generate_v4(),
    page_name text unique not null,
    layout_data jsonb default '{}'::jsonb,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 12. SYSTEM SETTINGS TABLE (Branding and thresholds)
create table if not exists system_settings (
    id uuid primary key default uuid_generate_v4(),
    setting_key text unique not null,
    setting_value jsonb not null,
    description text,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 13. NOTIFICATION TEMPLATES TABLE
create table if not exists notification_templates (
    id uuid primary key default uuid_generate_v4(),
    name text unique not null,
    channel text not null, -- email, sms, telegram, push
    subject text,
    template_body text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 14. ANALYTICS SETTINGS TABLE
create table if not exists analytics_settings (
    id integer primary key default 1 check (id = 1),
    visitors_count integer default 0,
    bookings_count integer default 0,
    conversions_count integer default 0,
    popular_services jsonb default '[]'::jsonb,
    traffic_sources jsonb default '[]'::jsonb,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 15. INTEGRATIONS CONFIGURATION TABLE
create table if not exists integrations (
    id uuid primary key default uuid_generate_v4(),
    name text unique not null, -- telegram, google_maps, google_analytics, smtp, storage
    config jsonb not null,
    status text default 'active',
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 16. CHAIRS TABLE
create table if not exists chairs (
    id uuid primary key default uuid_generate_v4(),
    name text unique not null,
    type text,
    is_active boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 17. DOCTOR SCHEDULE & HOLIDAYS
create table if not exists doctor_schedule (
    id uuid primary key default uuid_generate_v4(),
    doctor_name text not null default 'د. أكثم طنطاوي',
    day_of_week integer not null, -- 0 = Sunday, 6 = Saturday
    start_time time not null,
    end_time time not null,
    break_start time,
    break_end time,
    chair_id uuid references chairs(id),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 18. SERVICE CATEGORIES TABLE
create table if not exists service_categories (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    slug text unique not null,
    is_active boolean default true,
    display_order integer default 0
);

-- 19. GALLERY CATEGORIES TABLE
create table if not exists gallery_categories (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    slug text unique not null,
    is_active boolean default true,
    display_order integer default 0
);

-- 20. PATIENT DOCUMENTS TABLE (X-Rays, Reports)
create table if not exists patient_documents (
    id uuid primary key default uuid_generate_v4(),
    patient_id uuid references patients(id) on delete cascade,
    file_name text not null,
    file_url text not null,
    file_type text,
    file_size_kb integer,
    uploaded_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 21. PATIENT NOTES TABLE
create table if not exists patient_notes (
    id uuid primary key default uuid_generate_v4(),
    patient_id uuid references patients(id) on delete cascade,
    doctor_name text not null default 'د. أكثم طنطاوي',
    note text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 22. APPOINTMENT HISTORY TABLE
create table if not exists appointment_history (
    id uuid primary key default uuid_generate_v4(),
    patient_id uuid references patients(id) on delete cascade,
    booking_id text not null,
    action text not null,
    details text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 23. SYSTEM NOTIFICATIONS TABLE
create table if not exists system_notifications (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid,
    title text not null,
    message text not null,
    is_read boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 24. FEATURE FLAGS TABLE
create table if not exists feature_flags (
    id uuid primary key default uuid_generate_v4(),
    flag_name text unique not null,
    is_enabled boolean default false,
    description text,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 25. MAINTENANCE MODE TABLE
create table if not exists maintenance_mode (
    id integer primary key default 1 check (id = 1),
    is_active boolean default false,
    message text default 'المنصة حالياً قيد التحديث الإجباري السنوي، سنعود للعمل مجدداً خلال دقائق معدودة. نشكر تفهمكم!',
    countdown_end timestamp with time zone,
    allowed_ips text[] default '{}'::text[],
    allowed_users text[] default '{}'::text[],
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 26. CRON JOBS TABLE
create table if not exists cron_jobs (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    schedule text not null, -- standard cron string
    endpoint text not null,
    last_run timestamp with time zone,
    status text,
    is_active boolean default true
);

-- 27. API KEYS TABLE
create table if not exists api_keys (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    api_key_hash text not null,
    permissions text[] default '{}'::text[],
    is_active boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 28. STORAGE FILES METADATA TABLE
create table if not exists storage_files (
    id uuid primary key default uuid_generate_v4(),
    file_name text not null,
    url text not null,
    owner_id uuid,
    size_bytes integer,
    mime_type text,
    page_used text,
    metadata jsonb default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 29. ACTIVITY FEED LOGS TABLE (Duplicate of audit logs structure or unified feed)
create table if not exists activity_feed (
    id uuid primary key default uuid_generate_v4(),
    operator text not null,
    action text not null,
    detail text,
    ip text,
    browser text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 30. SEARCH INDEX TABLE
create table if not exists search_index (
    id uuid primary key default uuid_generate_v4(),
    item_type text not null, -- patients, appointments, services, gallery, faqs
    item_id text not null,
    title text not null,
    content text not null,
    url text not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS for newly created tables
alter table site_settings enable row level security;
alter table theme_settings enable row level security;
alter table navigation_menu enable row level security;
alter table seo_pages enable row level security;
alter table doctor_profile enable row level security;
alter table clinic_statistics enable row level security;
alter table working_hours enable row level security;
alter table social_links enable row level security;
alter table footer_content enable row level security;
alter table system_settings enable row level security;
alter table notification_templates enable row level security;
alter table analytics_settings enable row level security;
alter table integrations enable row level security;
alter table chairs enable row level security;
alter table doctor_schedule enable row level security;
alter table service_categories enable row level security;
alter table gallery_categories enable row level security;
alter table patient_documents enable row level security;
alter table patient_notes enable row level security;
alter table appointment_history enable row level security;
alter table system_notifications enable row level security;
alter table feature_flags enable row level security;
alter table maintenance_mode enable row level security;
alter table cron_jobs enable row level security;
alter table api_keys enable row level security;
alter table storage_files enable row level security;
alter table activity_feed enable row level security;
alter table search_index enable row level security;

-- Setup Public SELECT (anonymous readability) policies
create policy "Allow public read on site_settings" on site_settings for select using (true);
create policy "Allow public read on theme_settings" on theme_settings for select using (true);
create policy "Allow public read on navigation_menu" on navigation_menu for select using (true);
create policy "Allow public read on seo_pages" on seo_pages for select using (true);
create policy "Allow public read on doctor_profile" on doctor_profile for select using (true);
create policy "Allow public read on clinic_statistics" on clinic_statistics for select using (true);
create policy "Allow public read on working_hours" on working_hours for select using (true);
create policy "Allow public read on social_links" on social_links for select using (true);
create policy "Allow public read on footer_content" on footer_content for select using (true);
create policy "Allow public read on system_settings" on system_settings for select using (true);
create policy "Allow public read on chairs" on chairs for select using (true);
create policy "Allow public read on doctor_schedule" on doctor_schedule for select using (true);
create policy "Allow public read on service_categories" on service_categories for select using (true);
create policy "Allow public read on gallery_categories" on gallery_categories for select using (true);
create policy "Allow public read on feature_flags" on feature_flags for select using (true);
create policy "Allow public read on maintenance_mode" on maintenance_mode for select using (true);

-- Setup Admin FULL access policies (bypassed by service_role, but explicit for convenience)
create policy "Allow admin edit on site_settings" on site_settings for all using (true) with check (true);
create policy "Allow admin edit on theme_settings" on theme_settings for all using (true) with check (true);
create policy "Allow admin edit on navigation_menu" on navigation_menu for all using (true) with check (true);
create policy "Allow admin edit on seo_pages" on seo_pages for all using (true) with check (true);
create policy "Allow admin edit on doctor_profile" on doctor_profile for all using (true) with check (true);
create policy "Allow admin edit on clinic_statistics" on clinic_statistics for all using (true) with check (true);
create policy "Allow admin edit on working_hours" on working_hours for all using (true) with check (true);
create policy "Allow admin edit on social_links" on social_links for all using (true) with check (true);
create policy "Allow admin edit on footer_content" on footer_content for all using (true) with check (true);
create policy "Allow admin edit on system_settings" on system_settings for all using (true) with check (true);
create policy "Allow admin edit on notification_templates" on notification_templates for all using (true) with check (true);
create policy "Allow admin edit on analytics_settings" on analytics_settings for all using (true) with check (true);
create policy "Allow admin edit on integrations" on integrations for all using (true) with check (true);
create policy "Allow admin edit on chairs" on chairs for all using (true) with check (true);
create policy "Allow admin edit on doctor_schedule" on doctor_schedule for all using (true) with check (true);
create policy "Allow admin edit on service_categories" on service_categories for all using (true) with check (true);
create policy "Allow admin edit on gallery_categories" on gallery_categories for all using (true) with check (true);
create policy "Allow admin edit on patient_documents" on patient_documents for all using (true) with check (true);
create policy "Allow admin edit on patient_notes" on patient_notes for all using (true) with check (true);
create policy "Allow admin edit on appointment_history" on appointment_history for all using (true) with check (true);
create policy "Allow admin edit on system_notifications" on system_notifications for all using (true) with check (true);
create policy "Allow admin edit on feature_flags" on feature_flags for all using (true) with check (true);
create policy "Allow admin edit on maintenance_mode" on maintenance_mode for all using (true) with check (true);
create policy "Allow admin edit on cron_jobs" on cron_jobs for all using (true) with check (true);
create policy "Allow admin edit on api_keys" on api_keys for all using (true) with check (true);
create policy "Allow admin edit on storage_files" on storage_files for all using (true) with check (true);
create policy "Allow admin edit on activity_feed" on activity_feed for all using (true) with check (true);
create policy "Allow admin edit on search_index" on search_index for all using (true) with check (true);

-- ==========================================
-- DEFAULT SEED DATA INJECTION
-- ==========================================

-- Insert single rows check
insert into site_settings (id) values (1) on conflict (id) do nothing;
insert into theme_settings (id) values (1) on conflict (id) do nothing;
insert into footer_content (id) values (1) on conflict (id) do nothing;
insert into maintenance_mode (id) values (1) on conflict (id) do nothing;
insert into analytics_settings (id) values (1) on conflict (id) do nothing;

-- Seed default navigation links
insert into navigation_menu (menu_type, label, link, icon, display_order) values
('desktop', 'الرئيسية', 'index.html', 'bx bx-home', 1),
('desktop', 'خدماتنا', 'services.html', 'bx bx-wrench', 2),
('desktop', 'عن الدكتور', 'about.html', 'bx bx-user', 3),
('desktop', 'معرض الحالات', 'gallery.html', 'bx bx-images', 4),
('desktop', 'الملف الشخصي', 'profile.html', 'bx bx-user-pin', 5),
('desktop', 'اتصل بنا', 'contact.html', 'bx bx-envelope', 6),
('mobile', 'الرئيسية', 'index.html', 'bx bx-home', 1),
('mobile', 'خدماتنا', 'services.html', 'bx bx-wrench', 2),
('mobile', 'عن الدكتور', 'about.html', 'bx bx-user', 3),
('mobile', 'معرض الحالات', 'gallery.html', 'bx bx-images', 4),
('mobile', 'الملف الشخصي', 'profile.html', 'bx bx-user-pin', 5),
('mobile', 'اتصل بنا', 'contact.html', 'bx bx-envelope', 6)
on conflict do nothing;

-- Seed SEO pages metadata
insert into seo_pages (slug, title, description, keywords) values
('index', 'مركز الدكتور أكثم إسماعيل لتقويم الأسنان', 'الموقع الرسمي لعيادة الدكتور أكثم إسماعيل طنطاوي لتقويم وتجميل الأسنان. مركز تقويم أسنان متقدم وتصميم الابتسامة.', 'تقويم اسنان, تقويم شفاف, دكتور اكثم طنطاوي, الرياض, عيادة اسنان'),
('about', 'عن استشاري التقويم - عيادة د. أكثم طنطاوي', 'تعرف على الدكتور أكثم إسماعيل طنطاوي، استشاري تقويم الأسنان والفكين، خبرته وشهاداته المهنية وزمالاته الدولية في الكلية الملكية.', 'سيرة الدكتور اكثم طنطاوي, زمالة تقويم اسنان, استشاري تقويم الرياض'),
('services', 'خدماتنا العلاجية - عيادة د. أكثم طنطاوي', 'تصفح قائمة خدمات عيادة د. أكثم لتقويم وتجميل الأسنان: تقويم شفاف، تقويم معدني، زراعة رقمية وتصميم الابتسامة الاحترافي.', 'علاجات الاسنان, مصففات شفافة, تقويم خزفي, زراعة اسنان الرياض'),
('gallery', 'معرض الابتسامات - عيادة د. أكثم طنطاوي', 'شاهد الحالات العلاجية لتقويم الأسنان وصور قبل وبعد لابتسامات مراجعي العيادة الموثقة بتقنية التصوير الرقمي المتطور.', 'قبل وبعد تقويم اسنان, ابتسامات هوليوود, حالات تقويم واقعية الرياض'),
('booking', 'حجز موعد استشارة تقويم - عيادة د. أكثم طنطاوي', 'احجز موعد استشارتك لتقويم وتجميل الأسنان بطريقة تفاعلية ومريحة في العيادة، واختر الجناح والوقت المناسب لك.', 'حجز موعد اسنان, استشارة تقويم الرياض, عيادة الدكتور اكثم'),
('contact', 'اتصل بنا - عيادة د. أكثم طنطاوي', 'تواصل مع مركز الدكتور أكثم إسماعيل طنطاوي لتقويم الأسنان بالرياض: أرقام الهواتف، خريطة الموقع، الدعم الفني وحجز الطوارئ.', 'اتصال عيادة اسنان, رقم الطوارئ الدكتور اكثم, موقع عيادة اكثم'),
('profile', 'الملف الشخصي للمريض - عيادة د. أكثم طنطاوي', 'بوابة المريض الخاصة لمراجعة المواعيد والملفات الطبية والتقارير الطبية وتفاصيل الخطط العلاجية لتقويم الأسنان.', 'بوابة المريض, ملف طبي للاسنان, مواعيد تقويم اسنان')
on conflict (slug) do nothing;

-- Seed default chairs
insert into chairs (name, type) values
('جناح VIP 💎', 'vip'),
('تقويم الأسنان 🦷', 'ortho'),
('تجميل وزراعة 💺', 'cosmetic')
on conflict (name) do nothing;

-- Seed default doctor profile
insert into doctor_profile (name, title, bio, portrait_url, qualifications, highlights, timeline) values
(
    'د. أكثم إسماعيل طنطاوي',
    'استشاري تقويم الأسنان والفكين للبالغين والأطفال',
    'استشاري رائد ومتميز في تقويم الأسنان وتعديل نمو الفكين للأطفال والكبار، يمتلك مسيرة علمية وعملية حافلة تمتد لأكثر من 15 عاماً في تصميم الابتسامات ورصف الأسنان المزدحمة. كرس مسيرته المهنية لتطبيق أحدث التقنيات الرقمية ثلاثية الأبعاد وتخطيط العلاج المعتمد على محاكاة الابتسامة المتقدمة، لتقديم رعاية تقويمية فاخرة ونتائج تضمن المظهر الجمالي والوظيفة المثالية لمدى الحياة.',
    'assets/doctor.jpg',
    array[
        'زمالة تقويم الأسنان من الكلية الملكية للجراحين بإدنبرة (MOrth RCSEd)',
        'عضو الجمعية العالمية لتقويم الأسنان (WFO) والجمعية الأمريكية لتقويم الأسنان (AAO)',
        'دبلوم تخصصي معتمد في التقويم الشفاف الرقمي وتخطيط الابتسامات ثلاثي الأبعاد'
    ],
    array[
        'خبرة تزيد عن 15 عاماً في تخصص تقويم الأسنان والفكين',
        'أكثر من 5,000 حالة تقويم أسنان وتعديل إطباق ناجحة وموثقة إكلينيكياً',
        'شريك رائد معتمد لمصففات Invisalign وتصميم الابتسامات الرقمي'
    ],
    '[
        {"year": "2011", "title": "بكالوريوس طب وجراحة الفم والأسنان", "desc": "التخرج بمرتبة الشرف الأولى والبدء في الممارسة الإكلينيكية والتركيز على تشخيص المشاكل الإطباقية للأسنان."},
        {"year": "2014", "title": "دبلوم الدراسات العليا التخصصي في تقويم الأسنان", "desc": "دراسة تخصصية مكثفة في أنظمة تقويم الأسنان التقليدية والوقائية وكيفية معالجة نمو الفكين غير المتطابق."},
        {"year": "2018", "title": "زمالة تقويم الأسنان MOrth بإدنبرة", "desc": "الحصول على الزمالة العريقة من الكلية الملكية للجراحين بالمملكة المتحدة واجتياز اختباراتها بنجاح باهر."}
    ]'::jsonb
) on conflict do nothing;

-- Seed system configuration settings
insert into system_settings (setting_key, setting_value, description) values
('pricing_config', '{"basePrices": {"metal": 4500, "ceramic": 6500, "clear": 12000, "general": 200}, "installmentInterest": {"6": 0, "12": 0.04, "18": 0.08}}'::jsonb, 'سعر الخدمات وتفاصيل الفوائد والأقساط الشهرية'),
('tg_notification_config', '{"botToken": "", "chatId": "", "enabled": false}'::jsonb, 'معلومات الاتصال ببوت التليجرام لإشعارات المواعيد')
on conflict (setting_key) do nothing;
