-- Advanced CMS & Orthodontic Clinic Management Platform Database Schema
-- Paste this script into the Supabase SQL Editor and run it.

-- 1. Create Role-Based Access Control (RBAC) User Roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('Super Admin', 'Doctor', 'Reception', 'Assistant', 'Viewer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Site Settings table (Single Row)
CREATE TABLE IF NOT EXISTS public.site_settings (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    clinic_name TEXT DEFAULT 'عيادة د. أكثم طنطاوي لتقويم الأسنان' NOT NULL,
    logo_url TEXT,
    favicon_url TEXT,
    phone TEXT DEFAULT '+201000000000',
    whatsapp TEXT DEFAULT '+201000000000',
    email TEXT DEFAULT 'info@drakthamtantawy.com',
    address TEXT DEFAULT 'القاهرة، مصر',
    google_maps_iframe TEXT,
    working_hours JSONB DEFAULT '{"weekdays": "السبت - الخميس: 1:00 م - 9:00 م", "friday": "الجمعة: مغلق"}'::jsonb,
    seo_title TEXT DEFAULT 'د. أكثم طنطاوي | استشاري تقويم الأسنان والفكين بمصر',
    seo_description TEXT DEFAULT 'عيادة رائدة متخصصة في تقويم الأسنان الرقمي، التقويم الشفاف، والابتسامات التجميلية المتكاملة بأحدث الأجهزة والتقنيات.',
    open_graph_image TEXT,
    social_links JSONB DEFAULT '{"facebook": "#", "instagram": "#", "twitter": "#", "youtube": "#"}'::jsonb,
    analytics_google_id TEXT,
    analytics_search_console_id TEXT,
    emergency_phone TEXT DEFAULT '+201099999999',
    branches JSONB DEFAULT '[{"name": "فرع القاهرة الرئيسي", "address": "شبرا، القاهرة"}]'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Theme Settings table (Single Row)
CREATE TABLE IF NOT EXISTS public.theme_settings (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    primary_color TEXT DEFAULT '#0f172a' NOT NULL, -- Slate 900
    secondary_color TEXT DEFAULT '#f8fafc' NOT NULL, -- Slate 50
    accent_color TEXT DEFAULT '#0284c7' NOT NULL, -- Sky 600
    border_radius TEXT DEFAULT '12px' NOT NULL,
    button_style TEXT DEFAULT 'rounded' NOT NULL,
    card_style TEXT DEFAULT 'glassmorphism' NOT NULL,
    fonts JSONB DEFAULT '{"base": "Outfit", "arabic": "Tajawal"}'::jsonb,
    spacing_scale TEXT DEFAULT '1rem' NOT NULL,
    dark_mode BOOLEAN DEFAULT false NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Pages table (Presentation layer endpoints)
CREATE TABLE IF NOT EXISTS public.pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    seo_title TEXT,
    seo_description TEXT,
    is_published BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create Page Sections table (Dynamic layouts & ordering)
CREATE TABLE IF NOT EXISTS public.page_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID REFERENCES public.pages(id) ON DELETE CASCADE,
    section_type TEXT NOT NULL, -- 'hero', 'stats', 'services', 'cases', 'testimonials', 'faq', 'doctor'
    display_order INT DEFAULT 0 NOT NULL,
    is_visible BOOLEAN DEFAULT true NOT NULL,
    spacing TEXT DEFAULT 'padding-medium' NOT NULL,
    background_style TEXT DEFAULT 'glass' NOT NULL,
    draft_content JSONB DEFAULT '{}'::jsonb NOT NULL,
    published_content JSONB DEFAULT '{}'::jsonb NOT NULL,
    status TEXT DEFAULT 'published' NOT NULL CHECK (status IN ('draft', 'published')),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Create Components table (Templates definition)
CREATE TABLE IF NOT EXISTS public.components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'service_card', 'faq_item', 'case_card', 'testimonial_item'
    schema JSONB DEFAULT '{}'::jsonb NOT NULL
);

-- 7. Create Component Content table (Instance variables)
CREATE TABLE IF NOT EXISTS public.component_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID REFERENCES public.page_sections(id) ON DELETE CASCADE,
    component_id UUID REFERENCES public.components(id) ON DELETE CASCADE,
    display_order INT DEFAULT 0 NOT NULL,
    is_visible BOOLEAN DEFAULT true NOT NULL,
    draft_data JSONB DEFAULT '{}'::jsonb NOT NULL,
    published_data JSONB DEFAULT '{}'::jsonb NOT NULL,
    status TEXT DEFAULT 'published' NOT NULL CHECK (status IN ('draft', 'published')),
    is_deleted BOOLEAN DEFAULT false NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Create Patients table (Clinical operating files)
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    email TEXT,
    age INT,
    medical_history JSONB DEFAULT '{"diseases": [], "allergies": [], "notes": ""}'::jsonb,
    timeline JSONB DEFAULT '[]'::jsonb, -- medical follow-ups log
    invoices JSONB DEFAULT '[]'::jsonb,
    emergency_contact JSONB DEFAULT '{"name": "", "phone": ""}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Create Bookings table (Synchronized appointments scheduler)
CREATE TABLE IF NOT EXISTS public.bookings (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    age INT,
    service TEXT NOT NULL,
    doctor TEXT DEFAULT 'د. أكثم طنطاوي',
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    chair TEXT NOT NULL,
    notes TEXT,
    status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    is_deleted BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Create Contact Messages (Inbox Messages)
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'unread' NOT NULL CHECK (status IN ('unread', 'read', 'archived')),
    is_deleted BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. Create Audit Logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT NOT NULL,
    action TEXT NOT NULL,
    affected_item TEXT NOT NULL,
    old_value JSONB,
    new_value JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 12. Create Version History table (Snapshots for rollback recovery)
CREATE TABLE IF NOT EXISTS public.version_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    version_data JSONB NOT NULL,
    created_by TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 13. Create Media Library metadata table
CREATE TABLE IF NOT EXISTS public.media_library (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename TEXT NOT NULL,
    url TEXT NOT NULL,
    size_bytes INT,
    mime_type TEXT,
    folder TEXT DEFAULT 'general' NOT NULL,
    tags JSONB DEFAULT '[]'::jsonb,
    alt_text TEXT,
    caption TEXT,
    seo_title TEXT,
    is_deleted BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.theme_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.component_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.version_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;

-- Helper Function to check if a user is an Admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN SECURITY DEFINER AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE id = auth.uid() 
        AND role IN ('Super Admin', 'Doctor', 'Reception', 'Assistant')
    );
END;
$$ LANGUAGE plpgsql;

-- 1. Policies for public reads
CREATE POLICY "Public Read Site Settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Public Read Theme" ON public.theme_settings FOR SELECT USING (true);
CREATE POLICY "Public Read Pages" ON public.pages FOR SELECT USING (is_published = true);
CREATE POLICY "Public Read Page Sections" ON public.page_sections FOR SELECT USING (is_visible = true);
CREATE POLICY "Public Read Component Content" ON public.component_content FOR SELECT USING (is_visible = true);
CREATE POLICY "Public Read Components" ON public.components FOR SELECT USING (true);
CREATE POLICY "Public Read Media Library" ON public.media_library FOR SELECT USING (is_deleted = false);
CREATE POLICY "Public Read Bookings Self" ON public.bookings FOR SELECT USING (true);

-- 2. Policies for visitor submits
CREATE POLICY "Public Insert Bookings" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Insert Contact Messages" ON public.contact_messages FOR INSERT WITH CHECK (true);

-- 3. Policies for Admins (Full write access)
CREATE POLICY "Admin All User Roles" ON public.user_roles FOR ALL USING (public.is_admin() OR (auth.uid() IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.user_roles)));
CREATE POLICY "Admin All Site Settings" ON public.site_settings FOR ALL USING (public.is_admin());
CREATE POLICY "Admin All Theme" ON public.theme_settings FOR ALL USING (public.is_admin());
CREATE POLICY "Admin All Pages" ON public.pages FOR ALL USING (public.is_admin());
CREATE POLICY "Admin All Page Sections" ON public.page_sections FOR ALL USING (public.is_admin());
CREATE POLICY "Admin All Components" ON public.components FOR ALL USING (public.is_admin());
CREATE POLICY "Admin All Component Content" ON public.component_content FOR ALL USING (public.is_admin());
CREATE POLICY "Admin All Patients" ON public.patients FOR ALL USING (public.is_admin());
CREATE POLICY "Admin All Bookings" ON public.bookings FOR ALL USING (public.is_admin());
CREATE POLICY "Admin All Messages" ON public.contact_messages FOR ALL USING (public.is_admin());
CREATE POLICY "Admin All Audit Logs" ON public.audit_logs FOR ALL USING (public.is_admin());
CREATE POLICY "Admin All Version History" ON public.version_history FOR ALL USING (public.is_admin());
CREATE POLICY "Admin All Media Library" ON public.media_library FOR ALL USING (public.is_admin());

-- =========================================================================
-- SEED DATA
-- =========================================================================

-- Seed Site Settings
INSERT INTO public.site_settings (id, clinic_name, phone, whatsapp, email, address, seo_title, seo_description)
VALUES (1, 'عيادة د. أكثم طنطاوي لتقويم الأسنان', '+201000000000', '+201000000000', 'info@drakthamtantawy.com', 'شبرا، القاهرة، مصر', 'د. أكثم طنطاوي | استشاري تقويم الأسنان والفكين بمصر', 'عيادة رائدة متخصصة في تقويم الأسنان الرقمي، التقويم الشفاف، والابتسامات التجميلية المتكاملة.')
ON CONFLICT (id) DO NOTHING;

-- Seed Theme Settings
INSERT INTO public.theme_settings (id, primary_color, secondary_color, accent_color, border_radius, button_style, card_style, fonts)
VALUES (1, '#0c4a6e', '#f0f9ff', '#0284c7', '16px', 'rounded', 'glassmorphism', '{"base": "Outfit", "arabic": "Tajawal"}')
ON CONFLICT (id) DO NOTHING;

-- Seed Pages & Page Builder sections default configs
INSERT INTO public.pages (id, slug, title, seo_title, seo_description)
VALUES ('77a64147-380c-40b9-8736-69e1f579cdfb', 'home', 'الصفحة الرئيسية', 'مركز د. أكثم طنطاوي للتقويم', 'الموقع الرسمي للتقويم التخصصي')
ON CONFLICT (id) DO NOTHING;

-- Seed default sections on homepage page
INSERT INTO public.page_sections (id, page_id, section_type, display_order, is_visible, draft_content, published_content)
VALUES 
('d5089332-9df7-440f-ae52-25ecb1239aa1', '77a64147-380c-40b9-8736-69e1f579cdfb', 'hero', 0, true, 
 '{"title": "تقويم أسنان متقدم. ابتسامات رائعة. تقنيات حديثة.", "subtitle": "احصل على ابتسامة أحلامك المتناسقة والجميلة مع رائد علاج وتقويم الأسنان في مصر د. أكثم طنطاوي."}'::jsonb,
 '{"title": "تقويم أسنان متقدم. ابتسامات رائعة. تقنيات حديثة.", "subtitle": "احصل على ابتسامة أحلامك المتناسقة والجميلة مع رائد علاج وتقويم الأسنان في مصر د. أكثم طنطاوي."}'::jsonb),
('e98031d2-0941-47cc-bb34-3151cf57b983', '77a64147-380c-40b9-8736-69e1f579cdfb', 'stats', 1, true, 
 '{"statistics": [{"label": "حالات ناجحة", "value": "5000+"}, {"label": "سنوات خبرة", "value": "15+"}, {"label": "نسبة الرضا", "value": "98%"}]}'::jsonb,
 '{"statistics": [{"label": "حالات ناجحة", "value": "5000+"}, {"label": "سنوات خبرة", "value": "15+"}, {"label": "نسبة الرضا", "value": "98%"}]}'::jsonb),
('bf7de988-1428-4034-8c81-192770281c7f', '77a64147-380c-40b9-8736-69e1f579cdfb', 'doctor', 2, true,
 '{"name": "د. أكثم طنطاوي", "bio": "استشاري تقويم الأسنان والفكين، زميل الكلية الملكية للجراحين في إدنبرة، وخبرة أكثر من 15 عاماً في تقويم الأسنان التجميلي والرقمي في مصر والوطن العربي."}'::jsonb,
 '{"name": "د. أكثم طنطاوي", "bio": "استشاري تقويم الأسنان والفكين، زميل الكلية الملكية للجراحين في إدنبرة، وخبرة أكثر من 15 عاماً في تقويم الأسنان التجميلي والرقمي في مصر والوطن العربي."}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Seed default components
INSERT INTO public.components (id, name, type)
VALUES 
('f088192a-fa13-4c91-a20c-c603b10bcf2e', 'خدمة علاجية', 'service_card'),
('990cd082-cd28-4a92-be20-2b1031f0cfbf', 'سؤال شائع', 'faq_item'),
('4808cfcf-349c-4932-a083-0a716c52a0a2', 'حالة تجميل', 'case_card'),
('d508192a-fa13-4c91-a20c-c603b10bcfff', 'آراء المرضى', 'testimonial_item')
ON CONFLICT (id) DO NOTHING;
