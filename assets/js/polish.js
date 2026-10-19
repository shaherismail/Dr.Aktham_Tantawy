// UI polish: scroll reveal, floating WhatsApp, mobile booking bar. Pure progressive enhancement.
(function () {
    try {
        var path = location.pathname;
        var isAdmin = /admin/.test(path);
        if (isAdmin) return;
        var root = document.documentElement;

        function init() {
            // Scroll reveal
            var targets = document.querySelectorAll('.section-header, .service-card, .glass-card, .testimonial-card, .faq-item, .protection-item, .case-card, .hero-stats-row');
            if ('IntersectionObserver' in window && targets.length) {
                root.classList.add('reveal-on');
                var io = new IntersectionObserver(function (es) {
                    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
                }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
                targets.forEach(function (t) { t.classList.add('reveal'); io.observe(t); });
                // Safety: never leave content hidden
                setTimeout(function () { document.querySelectorAll('.reveal:not(.in)').forEach(function (t) { var r = t.getBoundingClientRect(); if (r.top < innerHeight) t.classList.add('in'); }); }, 1500);
            }

            // WhatsApp link from the page itself
            var wa = document.querySelector('a[href*="wa.me"]');
            var waHref = wa ? wa.getAttribute('href') : '';
                        if (waHref && !document.querySelector('.fab-wa')) {
                var fab = document.createElement('a');
                fab.className = 'fab-wa'; fab.href = waHref; fab.target = '_blank'; fab.rel = 'noopener';
                fab.setAttribute('aria-label', 'تواصل عبر واتساب');
                fab.innerHTML = '<i class="bx bxl-whatsapp"></i>';
                document.body.appendChild(fab);
            }
        }
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
    } catch (e) { /* never break the page */ }
})();
