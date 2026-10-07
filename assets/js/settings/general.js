// Global shared configuration and settings for the website
const defaultSettings = {
    clinicName: "عيادة الدكتور أكثم إسماعيل",
    clinicSubName: "لطب وجراحة الأسنان",
    logoUrl: "assets/logo.jpg",
    doctorPhotoUrl: "assets/doctor.jpg",
    heroCoverUrl: "",
    phone: "+966 50 123 4567",
    phoneFormatted: "011 123 4567", // Landline/Extra phone
    whatsapp: "+966501234567",
    whatsappText: "استفسار عاجل",
    emergencyPhone: "+966 50 999 1111",
    email: "info@dr-aktham.com",
    address: "الرياض، شارع التخصصي",
    googleMapsIframe: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14498.461622329388!2d46.66699625!3d24.6937402!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e2f03328e1858bb%3A0xe54e6fa16b0810bd!2z2LTYp9ix2Lkg2KfZhNiq2K7Ytdi12Yog2KfZhNix2YrYp9i2!5e0!3m2!1sar!2ssa!4v1719266624000!5m2!1sar!2ssa",
    facebook: "https://facebook.com",
    instagram: "https://instagram.com",
    twitter: "https://twitter.com",
    workingHours: "السبت - الخميس:\n٩:٠٠ ص - ٩:٠٠ م",


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
