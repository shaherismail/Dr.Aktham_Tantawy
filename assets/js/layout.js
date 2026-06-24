// Layout component loader for Multi-Page application
document.addEventListener('DOMContentLoaded', () => {
    const isIframe = window.self !== window.top;
    
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
                footerPlaceholder.outerHTML = html; // replace placeholder with template content
            })
            .catch(err => console.error('Error loading footer:', err));
    }

    // Load Telegram Simulator component dynamically
    if (!isIframe) {
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
    }
});

// Highlights current nav link based on location filename
export function highlightActiveLink() {
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index';
    const cleanPage = page.replace('.html', '');
    
    // Desktop navbar item highlight
    const navItems = document.querySelectorAll('.nav-links .nav-item');
    navItems.forEach(item => {
        const link = item.querySelector('a');
        if (link) {
            const href = link.getAttribute('href');
            const cleanHref = href.replace('.html', '');
            if (cleanHref === cleanPage || (cleanPage === 'index' && cleanHref === '') || (cleanPage === '' && cleanHref === 'index')) {
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
        const cleanHref = href.replace('.html', '');
        if (cleanHref === cleanPage || (cleanPage === 'index' && cleanHref === '') || (cleanPage === '' && cleanHref === 'index')) {
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

    if (!openBtn || !drawer) return;

    const openDrawer = () => {
        drawer.classList.add('active');
        overlay.classList.add('active');
    };

    const closeDrawer = () => {
        drawer.classList.remove('active');
        overlay.classList.remove('active');
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
}
