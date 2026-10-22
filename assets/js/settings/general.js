// Global shared configuration and settings for the website
const defaultSettings = {
    clinicName: "عيادة الدكتور أكثم إسماعيل",
    clinicSubName: "لطب وجراحة الأسنان",
    logoUrl: "assets/logo.jpg",
    doctorPhotoUrl: "assets/doctor.jpg",
    heroCoverUrl: "",
    phone: "0107 054 2331",
    phoneFormatted: "0100 993 5493", // Landline/Extra phone
    whatsapp: "201070542331",
    whatsappText: "استفسار عاجل",
    emergencyPhone: "0107 054 2331",
    email: "",
    address: "الزقازيق، موقف المنصورة، بجوار مستشفى الطوارئ التخصصي",
    googleMapsIframe: "https://www.google.com/maps?q=%D9%85%D9%88%D9%82%D9%81%20%D8%A7%D9%84%D9%85%D9%86%D8%B5%D9%88%D8%B1%D8%A9%D8%8C%20%D8%A7%D9%84%D8%B2%D9%82%D8%A7%D8%B2%D9%8A%D9%82%D8%8C%20%D9%85%D8%AD%D8%A7%D9%81%D8%B8%D8%A9%20%D8%A7%D9%84%D8%B4%D8%B1%D9%82%D9%8A%D8%A9&output=embed",
    facebook: "https://www.facebook.com/p/Dr-Aktham-Tantawy-Dental-Clinic-100076245157975/",
    instagram: "",
    twitter: "",
    workingHours: "السبت والاثنين للأربعاء: ٥ - ١٠ م\nالأحد: ١ - ٦ م • الخميس والجمعة: إجازة",


    // Website Theme Color Palette - Customize your clinic style colors here
    theme: {
        "primary": "#1565FF",            // Main Primary Color (e.g. Buttons, active links)
        "primary-hover": "#004ecc",      // Hover state for primary items
        "primary-light": "#6FA8FF",      // Light primary accents
        "primary-glow": "rgba(21, 101, 255, 0.12)",
        "secondary": "#EBF3FF",          // Light secondary background panels
        "bg": "#F7FAFF",                 // Main Site Background Color
        "accent": "#FFFFFF",             // Accent Color
        "success": "#16A34A",            // Success color (Green badges, confirmed states)
        "success-light": "#DCFCE7",
        "dark": "#111827",               // Main text titles and headers
        "text-main": "#1F2937",          // Body text color
        "text-muted": "#4B5563",         // Secondary/Muted text color
        "border": "#E5E7EB",             // Default borders
        "border-light": "rgba(229, 231, 235, 0.5)"
    }
};



// Merge with any custom settings saved dynamically from the Admin Dashboard
let savedSettings = {};
try {
    const raw = localStorage.getItem('dr_aktham_general_settings');
    if (raw) savedSettings = JSON.parse(raw);
} catch (e) {
    console.warn('Failed to parse saved general settings:', e);
}

export const GeneralSettings = {
    ...defaultSettings,
    ...savedSettings,
    theme: {
        ...defaultSettings.theme,
        ...(savedSettings.theme || {})
    }
};

/**
 * Automatically pull latest deployed clinic_data.json published by GitHub/Vercel
 * and sync into localStorage for all public visitors
 */
export async function syncRemoteClinicData() {
    if (typeof window === 'undefined' || typeof fetch === 'undefined') return null;
    try {
        const res = await fetch('/data/clinic_data.json?v=' + Date.now());
        if (!res.ok) return null;
        const remote = await res.json();
        if (!remote) return null;

        if (remote.generalSettings && typeof remote.generalSettings === 'object') {
            localStorage.setItem('dr_aktham_general_settings', JSON.stringify(remote.generalSettings));
        }
        if (remote.services && Array.isArray(remote.services)) {
            localStorage.setItem('dr_aktham_services', JSON.stringify(remote.services));
        }
        if (remote.testimonials && Array.isArray(remote.testimonials)) {
            localStorage.setItem('dr_aktham_testimonials', JSON.stringify(remote.testimonials));
        }
        if (remote.galleryCases && Array.isArray(remote.galleryCases)) {
            localStorage.setItem('dr_aktham_gallery_cases', JSON.stringify(remote.galleryCases));
        }
        if (remote.bookings && Array.isArray(remote.bookings)) {
            const curBookings = JSON.parse(localStorage.getItem('dr_aktham_bookings') || '[]');
            if (curBookings.length === 0) {
                localStorage.setItem('dr_aktham_bookings', JSON.stringify(remote.bookings));
            }
        }
        if (remote.contacts && Array.isArray(remote.contacts)) {
            const curContacts = JSON.parse(localStorage.getItem('dr_aktham_contacts') || '[]');
            if (curContacts.length === 0) {
                localStorage.setItem('dr_aktham_contacts', JSON.stringify(remote.contacts));
            }
        }
        if (remote.newsletter && Array.isArray(remote.newsletter)) {
            const curNews = JSON.parse(localStorage.getItem('dr_aktham_newsletter') || '[]');
            if (curNews.length === 0) {
                localStorage.setItem('dr_aktham_newsletter', JSON.stringify(remote.newsletter));
            }
        }
        if (remote.lastUpdated) {
            localStorage.setItem('dr_aktham_last_sync_time', remote.lastUpdated);
        }
        return remote;
    } catch (e) {
        return null;
    }
}

// Auto-hydrate on first visit
if (typeof window !== 'undefined') {
    syncRemoteClinicData().catch(() => { });
}
