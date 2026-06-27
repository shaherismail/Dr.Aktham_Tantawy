// Layout component loader for Multi-Page application
import { SiteSettingsService, EventBus } from './architecture.js';

let siteSettings = null;
let navMenus = [];

// Helper to fetch dynamic layout configs using decoupled services
function fetchLayoutData() {
    return Promise.all([
        SiteSettingsService.getSettings().then(data => {
            if (data) siteSettings = data;
        }),
        SiteSettingsService.getNavigationMenu().then(data => {
            if (data) navMenus = data;
        })
    ]).catch(err => console.error('Error fetching layout data:', err));
}

// Hydrate header links dynamically
function hydrateHeaderMenus() {
    if (navMenus.length === 0) return;
    
    // Desktop Nav Menu
    const navLinksList = document.querySelector('.nav-links');
    if (navLinksList) {
        navLinksList.innerHTML = '';
        const desktopItems = navMenus.filter(m => m.menu_type === 'desktop');
        desktopItems.forEach(item => {
            const li = document.createElement('li');
            li.className = 'nav-item';
            const badgeHtml = item.badge ? `<span class="badge" style="background:var(--primary); color:white; font-size:10px; padding:2px 6px; border-radius:10px; margin-right:4px;">${item.badge}</span>` : '';
            li.innerHTML = `<a href="${item.link}">${item.label} ${badgeHtml}</a>`;
            navLinksList.appendChild(li);
        });
    }

    // Mobile Drawer Menu
    const drawerLinksList = document.querySelector('.drawer-links');
    if (drawerLinksList) {
        drawerLinksList.innerHTML = '';
        const mobileItems = navMenus.filter(m => m.menu_type === 'mobile');
        mobileItems.forEach(item => {
            const li = document.createElement('li');
            const badgeHtml = item.badge ? `<span class="badge" style="background:var(--primary); color:white; font-size:10px; padding:2px 6px; border-radius:10px; margin-right:4px;">${item.badge}</span>` : '';
            li.innerHTML = `<a href="${item.link}">${item.label} ${badgeHtml}</a>`;
            drawerLinksList.appendChild(li);
        });
    }
}

// Prepend announcement bar
function renderAnnouncementBar() {
    if (siteSettings && siteSettings.announcement_visible && siteSettings.announcement_text) {
        // Prevent duplicates
        if (document.getElementById('siteAnnouncementBar')) return;
        
        const bar = document.createElement('div');
        bar.id = 'siteAnnouncementBar';
        bar.style.cssText = `
            background: var(--primary, #1565FF);
            color: white;
            text-align: center;
            padding: 8px 16px;
            font-size: 13px;
            font-weight: 700;
            position: relative;
            z-index: 1001;
            direction: rtl;
        `;
        bar.innerHTML = `
            <span>${siteSettings.announcement_text}</span>
            <button onclick="this.parentElement.remove()" style="
                background: none;
                border: none;
                color: white;
                position: absolute;
                left: 16px;
                top: 50%;
                transform: translateY(-50%);
                cursor: pointer;
                font-size: 16px;
            "><i class="bx bx-x"></i></button>
        `;
        
        const header = document.querySelector('.header-nav');
        if (header) {
            header.parentNode.insertBefore(bar, header);
        } else {
            document.body.prepend(bar);
        }
    }
}

// Hydrate footer contact and hours details
function hydrateFooterDetails() {
    if (!siteSettings) return;

    // Col 1 Description
    const descPara = document.querySelector('.footer-col p');
    if (descPara && siteSettings.seo_description) {
        descPara.textContent = siteSettings.seo_description;
    }

    // Col 1 Social Links
    const socialRow = document.querySelector('.footer-social-row');
    if (socialRow && siteSettings.social_links) {
        socialRow.innerHTML = '';
        const links = typeof siteSettings.social_links === 'string' ? JSON.parse(siteSettings.social_links) : siteSettings.social_links;
        if (links.facebook) socialRow.innerHTML += `<a href="${links.facebook}" target="_blank" class="footer-social-icon"><i class="bx bxl-facebook"></i></a>`;
        if (links.instagram) socialRow.innerHTML += `<a href="${links.instagram}" target="_blank" class="footer-social-icon"><i class="bx bxl-instagram"></i></a>`;
        if (links.twitter) socialRow.innerHTML += `<a href="${links.twitter}" target="_blank" class="footer-social-icon"><i class="bx bxl-twitter"></i></a>`;
        if (siteSettings.whatsapp) {
            const cleanWa = siteSettings.whatsapp.replace(/\+/g, '').trim();
            socialRow.innerHTML += `<a href="https://wa.me/${cleanWa}" target="_blank" class="footer-social-icon" style="background:#25D366;"><i class="bx bxl-whatsapp"></i></a>`;
        }
    }

    // Col 3 Working Hours
    const timeItem = document.querySelector('.footer-info-item i.bx-time');
    if (timeItem && siteSettings.working_hours) {
        const parent = timeItem.parentElement;
        const span = parent.querySelector('span');
        if (span) {
            const hours = typeof siteSettings.working_hours === 'string' ? JSON.parse(siteSettings.working_hours) : siteSettings.working_hours;
            let hoursHtml = '';
            hours.forEach(h => {
                hoursHtml += `${h.day}: ${h.hours}<br>`;
            });
            span.innerHTML = hoursHtml;
        }
    }

    // Footer Copyright text
    const footerBottomSpan = document.querySelector('.footer-bottom span');
    if (footerBottomSpan) {
        footerBottomSpan.textContent = `جميع الحقوق محفوظة © ${new Date().getFullYear()} ${siteSettings.clinic_name || 'عيادة الدكتور أكثم طنطاوي'}`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetchLayoutData().then(() => {
        // Load Header component
        const headerPlaceholder = document.getElementById('header-nav');
        if (headerPlaceholder) {
            fetch('components/header.html')
                .then(res => {
                    if (!res.ok) throw new Error('Failed to load header component');
                    return res.text();
                })
                .then(html => {
                    if (siteSettings) {
                        html = html.replace(/عيادة د\. أكثم إسماعيل/g, siteSettings.clinic_name || 'عيادة د. أكثم إسماعيل')
                                   .replace(/عيادة د\. أكثم/g, siteSettings.clinic_name || 'عيادة د. أكثم')
                                   .replace(/assets\/logo\.jpg/g, siteSettings.logo_url || 'assets/logo.jpg');
                    }
                    
                    headerPlaceholder.outerHTML = html;
                    
                    hydrateHeaderMenus();
                    renderAnnouncementBar();
                    highlightActiveLink();
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
                    if (siteSettings) {
                        html = html.replace(/د\. أكثم طنطاوي/g, siteSettings.clinic_name || 'د. أكثم طنطاوي')
                                   .replace(/assets\/logo\.jpg/g, siteSettings.logo_url || 'assets/logo.jpg')
                                   .replace(/\+966 50 123 4567<br>011 123 4567/g, siteSettings.phone || '+966 50 123 4567')
                                   .replace(/\+966 50 999 1111/g, siteSettings.emergency_phone || '+966 50 999 1111')
                                   .replace(/info@dr-aktham\.com/g, siteSettings.email || 'info@dr-aktham.com')
                                   .replace(/الرياض، شارع التخصصي/g, siteSettings.address || 'الرياض، شارع التخصصي');
                        
                        if (siteSettings.google_maps_iframe) {
                            html = html.replace(/data-src="[^"]*"/, `data-src="${siteSettings.google_maps_iframe}"`);
                        }
                    }
                    
                    footerPlaceholder.outerHTML = html;
                    
                    hydrateFooterDetails();
                    
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
    });
});

// Highlights current nav link based on location filename
export function highlightActiveLink() {
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';
    const cleanPage = page.endsWith('.html') ? page : page + '.html';
    
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

function initMobileDrawerHandlers() {
    const openBtn = document.getElementById('openDrawerBtn');
    const closeBtn = document.getElementById('closeDrawerBtn');
    const drawer = document.getElementById('mobileDrawer');
    const overlay = document.getElementById('drawerOverlay');
    const links = document.querySelectorAll('.drawer-links a');
    const bookingBtn = document.getElementById('drawerBookingBtn');

    if (!openBtn || !closeBtn || !drawer || !overlay) return;

    const openDrawer = () => {
        drawer.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    const closeDrawer = () => {
        drawer.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
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

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && drawer.classList.contains('active')) {
            closeDrawer();
        }
    });
}

// Global Event Bus listeners for dynamic settings updates
EventBus.on('site:settings-updated', (newSettings) => {
    console.log('[EventBus] Site settings updated. Refreshing components dynamically...');
    siteSettings = newSettings;
    
    // Re-render settings-dependent elements in place
    renderAnnouncementBar();
    hydrateFooterDetails();
    
    // Fetch and re-hydrate desktop and mobile menu items
    SiteSettingsService.getNavigationMenu().then(data => {
        if (data) {
            navMenus = data;
            hydrateHeaderMenus();
        }
    });
});



