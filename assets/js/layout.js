// Layout component loader for Multi-Page application
document.addEventListener('DOMContentLoaded', () => {
    // Load Header component
    const headerPlaceholder = document.getElementById('header-nav');
    if (headerPlaceholder) {
        fetch('components/header.html')
            .then(res => {
                if (!res.ok) throw new Error('Failed to load header component');
                return res.text();
            })
            .then(html => {
                headerPlaceholder.outerHTML = html; // replace placeholder with template content
                
                // Highlight active nav item
                highlightActiveLink();
                
                // Initialize mobile menu after header is in DOM
                initMobileMenu();

                // Initialize scroll shrink effect
                initScrollEffect();
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
                footerPlaceholder.outerHTML = html; // replace placeholder with template content
                
                // Lazy load Google Maps iframe in footer
                const lazyIframes = document.querySelectorAll('.lazy-iframe');
                lazyIframes.forEach(iframe => {
                    const dataSrc = iframe.getAttribute('data-src');
                    if (dataSrc) {
                        iframe.src = dataSrc;
                    }
                });

                // Apply dynamic CMS site settings to layout links
                const savedSettings = localStorage.getItem('clinic_site_settings');
                if (savedSettings) {
                    try {
                        const s = JSON.parse(savedSettings);
                        document.querySelectorAll('.clinic-phone-link').forEach(el => {
                            el.href = `tel:${s.phone}`;
                            el.textContent = s.phone;
                        });
                        document.querySelectorAll('.clinic-whatsapp-link').forEach(el => {
                            el.href = `https://wa.me/${s.whatsapp.replace('+', '')}`;
                        });
                        
                        const mapIframe = document.querySelector('.lazy-iframe');
                        if (mapIframe && s.google_maps_iframe) {
                            let src = s.google_maps_iframe;
                            if (src.includes('src="')) {
                                src = src.split('src="')[1].split('"')[0];
                            }
                            mapIframe.src = src;
                        }
                    } catch(e) {
                        console.error('Error applying dynamic layout settings:', e);
                    }
                }
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

    // Load Bottom Navigation Bar (mobile app experience)
    fetch('components/bottom-nav.html')
        .then(res => {
            if (res.ok) return res.text();
        })
        .then(html => {
            if (html) {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = html.trim();
                document.body.appendChild(tempDiv.firstChild);
                // Highlight active bottom nav item
                highlightBottomNav();
            }
        })
        .catch(err => console.error('Error loading bottom nav:', err));
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

    // Drawer links highlight
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

/**
 * Initialize mobile drawer open/close behavior
 */
function initMobileMenu() {
    const menuBtn   = document.getElementById('mobileMenuBtn');
    const drawer    = document.getElementById('mobileDrawer');
    const overlay   = document.getElementById('drawerOverlay');
    const closeBtn  = document.getElementById('drawerCloseBtn');

    if (!menuBtn || !drawer || !overlay) return;

    function openDrawer() {
        drawer.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // prevent background scroll
        // Toggle icon
        const icon = menuBtn.querySelector('i');
        if (icon) { icon.className = 'bx bx-x'; }
    }

    function closeDrawer() {
        drawer.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
        const icon = menuBtn.querySelector('i');
        if (icon) { icon.className = 'bx bx-menu'; }
    }

    menuBtn.addEventListener('click', openDrawer);
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    overlay.addEventListener('click', closeDrawer);

    // Close drawer when any drawer link is clicked
    const drawerLinks = document.querySelectorAll('.drawer-links a');
    drawerLinks.forEach(link => {
        link.addEventListener('click', closeDrawer);
    });

    // Close drawer on resize back to desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth > 991) {
            closeDrawer();
        }
    });
}

/**
 * Initialize scroll shrink effect on header
 */
function initScrollEffect() {
    const header = document.getElementById('stickyHeader');
    if (!header) return;

    function onScroll() {
        if (window.scrollY > 40) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run once on load
}

/**
 * Highlight the active item in the bottom navigation bar
 */
function highlightBottomNav() {
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';
    const cleanPage = page.endsWith('.html') ? page : page + '.html';

    const items = document.querySelectorAll('.bottom-nav-item, .bottom-nav-fab');
    items.forEach(item => {
        const href = item.getAttribute('href') || item.getAttribute('data-page') || '';
        const itemPage = href.split('/').pop();
        if (itemPage === cleanPage || (cleanPage === 'index.html' && itemPage === 'index.html')) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}
