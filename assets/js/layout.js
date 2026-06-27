// Layout component loader for Multi-Page application
import { GeneralSettings } from './settings/general.js';

// Function to dynamically apply theme color variables to document root
function applyTheme(theme) {
    if (!theme) return;
    const root = document.documentElement;
    for (const [key, val] of Object.entries(theme)) {
        root.style.setProperty(`--${key}`, val);
    }
}

// Function to dynamically replace placeholders with GeneralSettings
function replaceGeneralSettings(html) {
    // Logo
    html = html.replace(/assets\/logo\.jpg/g, GeneralSettings.logoUrl);

    // Clinic Name
    html = html.replace(/عيادة د\. أكثم إسماعيل/g, GeneralSettings.clinicName);
    html = html.replace(/عيادة د\. أكثم/g, GeneralSettings.clinicName);
    html = html.replace(/د\. أكثم طنطاوي/g, GeneralSettings.clinicName);
    html = html.replace(/عيادة الدكتور أكثم إسماعيل طنطاوي/g, GeneralSettings.clinicName);
    html = html.replace(/لطب وجراحة الأسنان/g, GeneralSettings.clinicSubName);

    // Phone numbers
    html = html.replace(/\+966 50 123 4567<br>011 123 4567/g, `${GeneralSettings.phone}<br>${GeneralSettings.phoneFormatted}`);
    html = html.replace(/\+966 50 999 1111/g, GeneralSettings.emergencyPhone);
    html = html.replace(/info@dr-aktham\.com/g, GeneralSettings.email);
    html = html.replace(/الرياض، شارع التخصصي/g, GeneralSettings.address);

    // Working Hours
    html = html.replace(/السبت - الخميس:<br>٩:٠٠ ص - ٩:٠٠ م/g, GeneralSettings.workingHours.replace(/\n/g, '<br>'));

    // Map iframe
    if (GeneralSettings.googleMapsIframe) {
        html = html.replace(/data-src="https:\/\/www\.google\.com\/maps\/embed[^"]*"/, `data-src="${GeneralSettings.googleMapsIframe}"`);
    }

    // Social Media
    html = html.replace(/href="https:\/\/facebook\.com"/g, `href="${GeneralSettings.facebook}"`);
    html = html.replace(/href="https:\/\/instagram\.com"/g, `href="${GeneralSettings.instagram}"`);
    html = html.replace(/href="https:\/\/twitter\.com"/g, `href="${GeneralSettings.twitter}"`);

    // Whatsapp Link
    const cleanWa = GeneralSettings.whatsapp.replace(/\+/g, '').trim();
    const escWaText = encodeURIComponent(GeneralSettings.whatsappText);
    html = html.replace(/href="https:\/\/wa\.me\/[^"]*"/g, `href="https://wa.me/${cleanWa}?text=${escWaText}"`);

    return html;
}

// Function to apply page specific settings (SEO & content overrides)
function applyPageSettings(settings) {
    if (!settings) return;

    // 1. Update title
    if (settings.title) {
        document.title = settings.title;
    }

    // 2. Update description
    if (settings.description) {
        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.name = 'description';
            document.head.appendChild(metaDesc);
        }
        metaDesc.content = settings.description;
    }

    // 3. Update keywords
    if (settings.keywords) {
        let metaKeywords = document.querySelector('meta[name="keywords"]');
        if (!metaKeywords) {
            metaKeywords = document.createElement('meta');
            metaKeywords.name = 'keywords';
            document.head.appendChild(metaKeywords);
        }
        metaKeywords.content = settings.keywords;
    }

    // 4. Update dynamic elements matching selectors
    if (settings.dynamicContent) {
        for (const selector in settings.dynamicContent) {
            const elements = document.querySelectorAll(selector);
            const val = settings.dynamicContent[selector];
            elements.forEach(el => {
                if (typeof val === 'string') {
                    el.innerHTML = val;
                } else if (typeof val === 'object') {
                    for (const attr in val) {
                        if (attr === 'html') {
                            el.innerHTML = val[attr];
                        } else if (attr === 'text') {
                            el.textContent = val[attr];
                        } else {
                            el.setAttribute(attr, val[attr]);
                        }
                    }
                }
            });
        }
    }

    // 5. Update page specific theme overrides if they exist
    if (settings.theme) {
        applyTheme(settings.theme);
    }
}

// Function to apply general settings to dynamic content in page
function applyGeneralSettingsToPage() {
    // Replace telephone links
    const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
    const numericPhone = GeneralSettings.phone.replace(/[^0-9+]/g, '');
    phoneLinks.forEach(link => {
        link.href = `tel:${numericPhone}`;
    });

    // Replace WhatsApp links (look for hrefs containing wa.me)
    const waLinks = document.querySelectorAll('a[href*="wa.me"]');
    const cleanWa = GeneralSettings.whatsapp.replace(/\+/g, '').trim();
    const escWaText = encodeURIComponent(GeneralSettings.whatsappText);
    waLinks.forEach(link => {
        link.href = `https://wa.me/${cleanWa}?text=${escWaText}`;
    });

    // Replace mailto links
    const mailLinks = document.querySelectorAll('a[href^="mailto:"]');
    mailLinks.forEach(link => {
        link.href = `mailto:${GeneralSettings.email}`;
    });

    // Replace Google Maps iframes
    if (GeneralSettings.googleMapsIframe) {
        const mapIframes = document.querySelectorAll('iframe[src*="google.com/maps"], iframe.lazy-iframe');
        mapIframes.forEach(iframe => {
            if (iframe.classList.contains('lazy-iframe') || iframe.hasAttribute('data-src')) {
                iframe.setAttribute('data-src', GeneralSettings.googleMapsIframe);
            } else {
                iframe.src = GeneralSettings.googleMapsIframe;
            }
        });
    }

    // Replace details list in contact.html or similar pages
    const detailsContainer = document.querySelector('.patient-details-list');
    if (detailsContainer) {
        let html = detailsContainer.innerHTML;
        html = html.replace(/\+966 50 123 4567/g, GeneralSettings.phone);
        html = html.replace(/011 123 4567/g, GeneralSettings.phoneFormatted);
        html = html.replace(/info@dr-aktham\.com/g, GeneralSettings.email);
        html = html.replace(/الرياض، شارع التخصصي/g, GeneralSettings.address);
        html = html.replace(/السبت - الخميس: ٩:٠٠ ص - ٩:٠٠ م/g, GeneralSettings.workingHours.replace(/\n/g, ' '));
        detailsContainer.innerHTML = html;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Apply global theme color variables first
    applyTheme(GeneralSettings.theme);

    // Apply general settings to pages
    applyGeneralSettingsToPage();

    // Dynamically load page specific settings file based on the page slug
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';
    const slug = page.replace('.html', '') || 'index';

    import(`./settings/${slug}.js`)
        .then(module => {
            if (module && module.PageSettings) {
                applyPageSettings(module.PageSettings);
            }
        })
        .catch(err => {
            console.warn(`No separate settings file found for page: ${slug}.js`, err);
        });

    // Load Header component
    const headerPlaceholder = document.getElementById('header-nav');
    if (headerPlaceholder) {
        fetch('components/header.html')
            .then(res => {
                if (!res.ok) throw new Error('Failed to load header component');
                return res.text();
            })
            .then(html => {
                // Apply replacements
                html = replaceGeneralSettings(html);
                headerPlaceholder.outerHTML = html; // replace placeholder with template content

                // Highlight active nav item
                highlightActiveLink();

                // Initialize drawer events
                initMobileDrawerHandlers();
            })
            .catch(err => console.error('Error loading header:', err));
    }

    // Load Footer component
    const footerPlaceholder = document.getElementById('footer-wrapper');
    if (footerPlaceholder) {
        fetch('components/footer.html')
            .then(res => {
                if (!res.ok) throw new Error('Failed to load footer component');
                return res.text();
            })
            .then(html => {
                // Apply replacements
                html = replaceGeneralSettings(html);
                footerPlaceholder.outerHTML = html; // replace placeholder with template content

                // Lazy load Google Maps iframe in footer
                const lazyIframes = document.querySelectorAll('.lazy-iframe');
                lazyIframes.forEach(iframe => {
                    const dataSrc = iframe.getAttribute('data-src');
                    if (dataSrc) {
                        iframe.src = dataSrc;
                    }
                });
            })
            .catch(err => console.error('Error loading footer:', err));
    }

    // Load Telegram Simulator component dynamically
    fetch('components/telegram.html')
        .then(res => {
            if (res.ok) return res.text();
        })
        .then(html => {
            if (html) {
                // Apply replacements if needed
                html = replaceGeneralSettings(html);
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = html.trim();
                document.body.appendChild(tempDiv.firstChild);

                // Lazy import telegram logic
                import('./telegram.js').then(module => {
                    if (typeof module.initTelegramSimulator === 'function') {
                        module.initTelegramSimulator();
                    }
                });
            }
        })
        .catch(err => console.error('Error loading telegram simulator:', err));
});

// Highlights current nav link based on location filename
export function highlightActiveLink() {
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';
    const cleanPage = page.endsWith('.html') ? page : page + '.html';

    // Desktop navbar item highlight
    const navItems = document.querySelectorAll('.nav-links .nav-item');
    navItems.forEach(item => {
        const link = item.querySelector('a');
        if (link) {
            const href = link.getAttribute('href');
            if (href === cleanPage || (cleanPage === 'index.html' && href === 'index.html')) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        }
    });

    // Mobile drawer links highlight
    const drawerLinks = document.querySelectorAll('.drawer-links a');
    drawerLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === cleanPage || (cleanPage === 'index.html' && href === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Mobile drawer open/close
function initMobileDrawerHandlers() {
    const openBtn = document.getElementById('openDrawerBtn');
    const closeBtn = document.getElementById('closeDrawerBtn');
    const drawer = document.getElementById('mobileDrawer');
    const overlay = document.getElementById('drawerOverlay');
    const links = document.querySelectorAll('.drawer-links a');
    const bookingBtn = document.getElementById('drawerBookingBtn');

    // Guard: all critical elements must exist
    if (!openBtn || !closeBtn || !drawer || !overlay) return;

    const openDrawer = () => {
        drawer.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // prevent background scroll
    };

    const closeDrawer = () => {
        drawer.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = ''; // restore scroll
    };

    openBtn.addEventListener('click', openDrawer);
    closeBtn.addEventListener('click', closeDrawer);
    overlay.addEventListener('click', closeDrawer);

    links.forEach(link => {
        link.addEventListener('click', closeDrawer);
    });

    if (bookingBtn) {
        bookingBtn.addEventListener('click', closeDrawer);
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && drawer.classList.contains('active')) {
            closeDrawer();
        }
    });
}
