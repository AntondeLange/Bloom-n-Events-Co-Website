/**
 * Bloom'n Events Co - Main JavaScript Entry Point
 * 
 * Architecture:
 * - Single DOMContentLoaded listener for all functionality
 * - Modular imports for configuration and logging
 * - Performance-optimized with lazy loading and efficient event handling
 * - No scroll hijacking or gimmicky interactions
 * 
 * Motion Philosophy:
 * - Subtle, purposeful animations only
 * - Respects prefers-reduced-motion
 * - Performance-first approach
 */

// Import utilities
import { CONFIG, getBackendUrl, getApiUrl } from './config.js';
import { logger } from './logger.js';

// Performance optimization: Use requestIdleCallback for non-critical tasks
const runWhenIdle = (callback) => {
    if ('requestIdleCallback' in window) {
        requestIdleCallback(callback);
    } else {
        setTimeout(callback, 1);
    }
};

// Debounce function for performance optimization
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Throttle function for scroll events
const throttle = (func, limit) => {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// ===== HERO PARALLAX - RESTRAINED MOTION =====
// Subtle parallax effect for hero background (only on homepage)
// Disabled on mobile and low-powered devices for performance
function initHeroParallax() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const isMobile = window.innerWidth < 769;
    const isLowPower = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) ||
        (navigator.deviceMemory && navigator.deviceMemory <= 2);
    if (isMobile || isLowPower) return;

    const heroSection = document.querySelector('body.home .hero-section');
    const heroBackground = document.querySelector('body.home .hero-background');
    if (!heroSection || !heroBackground) return;

    let ticking = false;
    const handleScroll = () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrolled = window.pageYOffset;
                const heroHeight = heroSection.offsetHeight;
                if (scrolled < heroHeight) {
                    const parallaxSpeed = 0.3;
                    const yPos = -(scrolled * parallaxSpeed);
                    // Use CSS custom property instead of inline style for CSP compliance
                    heroBackground.style.setProperty('--parallax-y', `${yPos}px`);
                }
                ticking = false;
            });
            ticking = true;
        }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
}

// Prevent browser scroll restoration on page load
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

// Clear any hash from URL that might cause unwanted scrolling
if (window.location.hash) {
    // Remove hash without scrolling
    history.replaceState(null, null, ' ');
}

// Ensure page starts at top - set immediately before any other scripts run
(function() {
    'use strict';
    // Set scroll position to top immediately
    if (typeof window !== 'undefined') {
        window.scrollTo(0, 0);
        if (document.documentElement) {
            document.documentElement.scrollTop = 0;
        }
        if (document.body) {
            document.body.scrollTop = 0;
        }
    }
})();

// Mobile-specific scroll lock during initial page load
const isMobile = window.innerWidth <= 768 || ('ontouchstart' in window);
let userHasInteracted = false;
let scrollLockActive = true;
const SCROLL_LOCK_DURATION = 1500; // Lock scroll for 1.5 seconds on mobile
const pageLoadTime = Date.now();

// Track user interaction - but be more careful on mobile
const trackUserInteraction = () => {
    const timeSinceLoad = Date.now() - pageLoadTime;
    // Only count as interaction after a brief delay to avoid false positives
    if (timeSinceLoad > 200) {
        userHasInteracted = true;
        scrollLockActive = false;
        // Remove listeners once user has interacted
        window.removeEventListener('touchstart', trackUserInteraction, { passive: true });
        window.removeEventListener('mousedown', trackUserInteraction, { passive: true });
        window.removeEventListener('wheel', trackUserInteraction, { passive: true });
    }
};

// Add listeners to detect actual user gestures
window.addEventListener('touchstart', trackUserInteraction, { passive: true });
window.addEventListener('mousedown', trackUserInteraction, { passive: true });
window.addEventListener('wheel', trackUserInteraction, { passive: true });

// Aggressive scroll reset on mobile during initial load
const resetScrollToTop = () => {
    if (!scrollLockActive || userHasInteracted) {
        return;
    }
    
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    
    if (currentScroll > 5) {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
    }
};

// On mobile, aggressively reset scroll during initial load period
if (isMobile) {
    // Reset immediately
    resetScrollToTop();
    
    // Reset multiple times during the lock period
    const scrollResetInterval = setInterval(() => {
        if (!scrollLockActive || userHasInteracted) {
            clearInterval(scrollResetInterval);
            return;
        }
        resetScrollToTop();
    }, 50); // Check every 50ms
    
    // Disable scroll lock after duration
    setTimeout(() => {
        scrollLockActive = false;
        clearInterval(scrollResetInterval);
    }, SCROLL_LOCK_DURATION);
    
    // Also reset on window load
    window.addEventListener('load', () => {
        if (!userHasInteracted) {
            requestAnimationFrame(() => {
                resetScrollToTop();
            });
        }
    }, { once: true });
}

// ===== IMMEDIATE DROPDOWN CLOSE (runs before DOMContentLoaded) =====
// Close any dropdowns that might be open from HTML or Bootstrap auto-init
(function closeDropdownsImmediately() {
    const closeAll = () => {
        document.querySelectorAll('.dropdown-menu.show').forEach(m => {
            m.classList.remove('show');
            m.classList.add('d-none');
        });
        document.querySelectorAll('.dropdown.show, .dropup.show').forEach(d => {
            d.classList.remove('show');
        });
        document.querySelectorAll('.dropdown-toggle[aria-expanded="true"]').forEach(t => {
            t.setAttribute('aria-expanded', 'false');
        });
    };
    
    // Run immediately if DOM is already loaded
    if (document.readyState !== 'loading') {
        closeAll();
    }
    
    // Also run on DOMContentLoaded (before other scripts)
    document.addEventListener('DOMContentLoaded', closeAll, { once: true, capture: true });
})();

// Single DOMContentLoaded event listener for all functionality
document.addEventListener('DOMContentLoaded', function() {
    // Ensure page starts at top on all devices (especially important for capabilities page)
    if (!userHasInteracted) {
        requestAnimationFrame(() => {
            window.scrollTo(0, 0);
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
        });
    }
    
    // Initialize hero parallax
    initHeroParallax();
    
    // ===== HERO VIDEO OPTIMIZED LOADING =====
    // Progressive video loading: start with metadata, load full video when visible
    (function initHeroVideo() {
        const heroVideo = document.querySelector('body.home .hero-video');
        if (!heroVideo) return;
        
        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            heroVideo.pause();
            return;
        }
        
        // Check for data saver mode
        const saveData = navigator.connection && navigator.connection.saveData;
        if (saveData) {
            heroVideo.preload = 'none';
            return;
        }
        
        // Progressive loading: start with metadata, upgrade to auto when visible
        heroVideo.preload = 'metadata';
        
        // Use IntersectionObserver to load full video when hero section is visible
        if ('IntersectionObserver' in window) {
            const videoObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && entry.intersectionRatio > 0) {
                        // Hero section is visible, upgrade to full preload
                        heroVideo.preload = 'auto';
                        heroVideo.load(); // Force reload with new preload setting
                        
                        // Try to play
                        const playPromise = heroVideo.play();
                        if (playPromise !== undefined) {
                            playPromise.catch(error => {
                                // Autoplay prevented, play on interaction
                                const playOnInteraction = () => {
                                    heroVideo.play().catch(() => {});
                                    document.removeEventListener('click', playOnInteraction, { once: true });
                                    document.removeEventListener('scroll', playOnInteraction, { once: true });
                                };
                                document.addEventListener('click', playOnInteraction, { once: true });
                                document.addEventListener('scroll', playOnInteraction, { once: true });
                            });
                        }
                        
                        videoObserver.disconnect();
                    }
                });
            }, { rootMargin: '50px', threshold: 0.1 });
            
            const heroSection = document.querySelector('body.home .hero-section');
            if (heroSection) {
                videoObserver.observe(heroSection);
            }
        } else {
            // Fallback: load immediately if no IntersectionObserver
            heroVideo.preload = 'auto';
            heroVideo.play().catch(() => {});
        }
        
        // Pause video when page is hidden (tab switch)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                heroVideo.pause();
            } else {
                heroVideo.play().catch(() => {});
            }
        });
    })();
    // ===== PARTIALS INJECTION (Navbar/Footer) =====
    const loadPartials = async () => {
        const isHome = document.body.classList.contains('home');
        const navbarPartial = isHome ? 'assets/partials/navbar-home.html' : 'assets/partials/navbar-default.html';
        const footerPartial = 'assets/partials/footer.html';
        try {
            const [navHtml, footerHtml] = await Promise.all([
                fetch(navbarPartial, { cache: 'no-cache' }).then(r => r.ok ? r.text() : ''),
                fetch(footerPartial, { cache: 'no-cache' }).then(r => r.ok ? r.text() : '')
            ]);
            if (navHtml) {
                const existingNav = document.querySelector('nav.navbar');
                if (existingNav) {
                    existingNav.outerHTML = navHtml;
                    // Immediately ensure navbar is at bottom after injection
                    const newNav = document.getElementById('homeNavbar');
                    if (newNav && isHome) {
                        newNav.classList.remove('fixed-top');
                        newNav.classList.add('fixed-bottom');
                    }
                    
                    // Reset scroll after navbar injection to prevent unwanted scrolling (all devices)
                    if (!userHasInteracted) {
                        requestAnimationFrame(() => {
                            window.scrollTo(0, 0);
                            document.documentElement.scrollTop = 0;
                            document.body.scrollTop = 0;
                        });
                    }
                }
            }
            if (footerHtml) {
                // Remove all existing footers first to prevent duplicates
                const existingFooters = document.querySelectorAll('footer');
                existingFooters.forEach(footer => footer.remove());
                // Insert the footer before the closing body tag (before scripts)
                const scripts = document.querySelectorAll('script[src*="scripts"], script[src*="bootstrap"], script[src*="gsap"]');
                const insertionPoint = scripts.length > 0 ? scripts[0] : null;
                if (insertionPoint && insertionPoint.parentNode) {
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = footerHtml;
                    const footer = tempDiv.firstElementChild;
                    if (footer) {
                        insertionPoint.parentNode.insertBefore(footer, insertionPoint);
                        // On mobile, reset scroll after footer injection
                        if (isMobile && !userHasInteracted) {
                            requestAnimationFrame(() => {
                                window.scrollTo(0, 0);
                                document.documentElement.scrollTop = 0;
                                document.body.scrollTop = 0;
                            });
                        }
                        // Initialize footer accordion AFTER footer is injected
                        if (typeof window.initFooterAccordion === 'function') {
                            setTimeout(() => {
                                window.initFooterAccordion();
                            }, 100);
                        }
                    }
                } else {
                    // Fallback: append to body
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = footerHtml;
                    const footer = tempDiv.firstElementChild;
                    if (footer) {
                        document.body.appendChild(footer);
                        // On mobile, reset scroll after footer injection
                        if (isMobile && !userHasInteracted) {
                            requestAnimationFrame(() => {
                                window.scrollTo(0, 0);
                                document.documentElement.scrollTop = 0;
                                document.body.scrollTop = 0;
                            });
                        }
                        // Initialize footer accordion AFTER footer is injected
                        if (typeof window.initFooterAccordion === 'function') {
                            setTimeout(() => {
                                window.initFooterAccordion();
                            }, 100);
                        }
                    }
                    if (footer) {
                        document.body.appendChild(footer);
                    }
                }
            }
        } catch (e) {
            logger.warn('Partial injection failed', e);
        }
        // Set active nav link based on current page (after partials are loaded)
        setActiveNavLink();
        // Re-initialize dropdowns after injection
        if (typeof window.setupDropdowns === 'function') window.setupDropdowns();
        // Initialize home navbar immediately after partials load (not waiting for window load)
        if (isHome && typeof window.setupHomeNavbar === 'function') {
            // Small delay to ensure DOM is ready
            setTimeout(() => {
                window.setupHomeNavbar();
                // After navbar setup, ensure dropdown is closed
                setTimeout(() => {
                    const navbar = document.getElementById('homeNavbar');
                    if (navbar) {
                        const dropdown = navbar.querySelector('.dropdown, .dropup');
                        if (dropdown) {
                            const menu = dropdown.querySelector('.dropdown-menu');
                            const toggle = dropdown.querySelector('.dropdown-toggle');
                            if (menu) {
                                menu.classList.remove('show');
                                menu.classList.add('d-none');
                            }
                            dropdown.classList.remove('show');
                            if (toggle) {
                                toggle.setAttribute('aria-expanded', 'false');
                            }
                        }
                    }
                }, 50);
            }, 0);
        }
    };
    
    // Function to set active nav link based on current page URL
    const setActiveNavLink = () => {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('.navbar-nav .nav-link:not(.dropdown-toggle), .navbar-nav .dropdown-item');
        const dropdownToggles = document.querySelectorAll('.navbar-nav .dropdown-toggle');
        
        // First, clear all active states
        navLinks.forEach(link => {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
        });
        dropdownToggles.forEach(toggle => {
            toggle.classList.remove('active');
            toggle.removeAttribute('aria-current');
        });
        
        // Find and mark the active link
        let activeFound = false;
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && (href === currentPage || href.endsWith(currentPage))) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
                activeFound = true;
                
                // If it's a dropdown item, also mark the parent dropdown toggle
                if (link.classList.contains('dropdown-item')) {
                    const dropdown = link.closest('.dropdown');
                    if (dropdown) {
                        const dropdownToggle = dropdown.querySelector('.dropdown-toggle');
                        if (dropdownToggle) {
                            dropdownToggle.classList.add('active');
                            dropdownToggle.setAttribute('aria-current', 'page');
                        }
                    }
                }
            }
        });
    };
    
    loadPartials();
    // ===== NAVBAR FUNCTIONALITY =====
    function setupHomeNavbar() {
    const navbar = document.getElementById('homeNavbar');
        if (!navbar) return;
        const body = document.body;
        let portfolioDropdown = navbar.querySelector('.dropdown');
        let lastScrollTop = 0;
        const initializeNavbar = () => {
            navbar.classList.remove('fixed-top');
            navbar.classList.add('fixed-bottom');
            body.setAttribute('class', body.className.replace(/\bnavbar-top\b/, '').trim());
            portfolioDropdown = navbar.querySelector('.dropdown') || navbar.querySelector('.dropup');
            if (portfolioDropdown) {
                portfolioDropdown.classList.remove('dropdown');
                portfolioDropdown.classList.add('dropup');
            }
            // Clear any inline positional styles immediately so Bootstrap classes take over
            navbar.style.position = '';
            navbar.style.top = '';
            navbar.style.bottom = '';
            navbar.style.left = '';
            navbar.style.right = '';
        };
        initializeNavbar();
        
        // Set initial state immediately based on scroll position
        const setNavbarPosition = (scrollTop) => {
            if (scrollTop <= 100) {
                // At top - navbar at bottom
                navbar.classList.remove('fixed-top');
                navbar.classList.add('fixed-bottom');
                body.classList.remove('navbar-top');
                // Clear any inline styles that might override
                navbar.style.position = '';
                navbar.style.top = '';
                navbar.style.bottom = '';
                if (portfolioDropdown) {
                    portfolioDropdown.classList.remove('dropdown');
                    portfolioDropdown.classList.add('dropup');
                }
            } else {
                // Scrolled down - navbar at top
                navbar.classList.remove('fixed-bottom');
                navbar.classList.add('fixed-top');
                body.classList.add('navbar-top');
                // Clear any inline styles that might override
                navbar.style.position = '';
                navbar.style.top = '';
                navbar.style.bottom = '';
                if (portfolioDropdown) {
                    portfolioDropdown.classList.remove('dropup');
                    portfolioDropdown.classList.add('dropdown');
                }
            }
        };
        
        const handleScroll = throttle(function() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            setNavbarPosition(scrollTop);
            lastScrollTop = scrollTop;
        }, 16);
        
        window.addEventListener('scroll', handleScroll, { passive: true });
        
        // Set initial position immediately - don't wait for scroll event
        const initialScrollTop = window.pageYOffset || document.documentElement.scrollTop;
        setNavbarPosition(initialScrollTop);

        // Robust fallback using IntersectionObserver on a top sentinel
        // Only activate after first scroll to prevent immediate firing on page load
        let ioActive = false;
        if ('IntersectionObserver' in window) {
            let sentinel = document.getElementById('navbar-sentinel');
            if (!sentinel) {
                sentinel = document.createElement('div');
                sentinel.id = 'navbar-sentinel';
                sentinel.classList.add('intersection-sentinel');
                document.body.prepend(sentinel);
            }
            
            const io = new IntersectionObserver((entries) => {
                if (!ioActive) return; // Don't fire until after first scroll
                const entry = entries[0];
                const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
                // Only use IntersectionObserver if scroll handler hasn't already set position correctly
                if (entry && entry.isIntersecting && currentScrollTop <= 100) {
                    // near top - ensure bottom
                    if (!navbar.classList.contains('fixed-bottom')) {
                        navbar.classList.remove('fixed-top');
                        navbar.classList.add('fixed-bottom');
                        body.classList.remove('navbar-top');
                        if (portfolioDropdown) {
                            portfolioDropdown.classList.remove('dropdown');
                            portfolioDropdown.classList.add('dropup');
                        }
                    }
                } else if (entry && !entry.isIntersecting && currentScrollTop > 100) {
                    // scrolled away from top - ensure top
                    if (!navbar.classList.contains('fixed-top')) {
                        navbar.classList.remove('fixed-bottom');
                        navbar.classList.add('fixed-top');
                        body.classList.add('navbar-top');
                        if (portfolioDropdown) {
                            portfolioDropdown.classList.remove('dropup');
                            portfolioDropdown.classList.add('dropdown');
                        }
                    }
                }
            }, { rootMargin: '-100px 0px 0px 0px', threshold: 0 });
            
            // Activate IntersectionObserver only after first scroll
            const activateIO = () => {
                ioActive = true;
                io.observe(sentinel);
                window.removeEventListener('scroll', activateIO);
            };
            window.addEventListener('scroll', activateIO, { once: true, passive: true });
        }
        const mobileMenu = navbar.querySelector('.navbar-collapse');
        if (mobileMenu) {
            // Ensure mobile menu is collapsed on load
            mobileMenu.classList.remove('show');
            mobileMenu.addEventListener('click', function(e) { e.stopPropagation(); });
        }
        
        // Ensure dropdown menu is closed on navbar initialization
        const forceCloseDropdown = () => {
            if (portfolioDropdown) {
                const dropdownMenu = portfolioDropdown.querySelector('.dropdown-menu');
                if (dropdownMenu) {
                    dropdownMenu.classList.remove('show');
                    dropdownMenu.classList.add('d-none');
                }
                portfolioDropdown.classList.remove('show');
                const dropdownToggle = portfolioDropdown.querySelector('.dropdown-toggle');
                if (dropdownToggle) {
                    dropdownToggle.setAttribute('aria-expanded', 'false');
                }
            }
        };
        
        // Close immediately
        forceCloseDropdown();
        
        // Use MutationObserver to watch for any attempts to show the dropdown
        if (portfolioDropdown && 'MutationObserver' in window) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                        const menu = portfolioDropdown.querySelector('.dropdown-menu');
                        if (menu && menu.classList.contains('show')) {
                            // If menu got .show class without user interaction, close it
                            const toggle = portfolioDropdown.querySelector('.dropdown-toggle');
                            if (toggle && toggle.getAttribute('aria-expanded') === 'false') {
                                forceCloseDropdown();
                            }
                        }
                    }
                });
            });
            
            observer.observe(portfolioDropdown, {
                attributes: true,
                attributeFilter: ['class'],
                subtree: true
            });
            
            // Also observe the menu directly
            const menu = portfolioDropdown.querySelector('.dropdown-menu');
            if (menu) {
                observer.observe(menu, {
                    attributes: true,
                    attributeFilter: ['class', 'style']
                });
            }
        }
        
        // Also ensure navbar toggle button state is correct
        const navbarToggler = navbar.querySelector('.navbar-toggler');
        if (navbarToggler) {
            navbarToggler.setAttribute('aria-expanded', 'false');
        }
    }
    window.setupHomeNavbar = setupHomeNavbar;
    // Note: Home navbar is now initialized immediately after partials load (see loadPartials function)
    // This prevents the navbar from appearing at top before moving to bottom
    
    // ===== FORM VALIDATION =====
    // Note: Enhanced form validation is handled later in the script
    
    // ===== ENHANCED IMAGE AND IFRAME LAZY LOADING =====
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                    const img = entry.target;
                // Skip carousel images entirely to avoid flicker
                if (img.closest('.carousel')) {
                    observer.unobserve(img);
                    return;
                }
                    img.classList.add('loading');
                const sourceToLoad = img.dataset.src || null;
                const srcsetToLoad = img.dataset.srcset || null;
                if (!sourceToLoad && !srcsetToLoad) {
                    // No data-* provided; rely on native lazy, just mark as viewed
                    img.classList.remove('loading');
                    img.classList.add('loaded');
                    observer.unobserve(img);
                    return;
                }
                    const newImg = new Image();
                if (srcsetToLoad) newImg.srcset = srcsetToLoad;
                    newImg.onload = () => {
                    if (sourceToLoad) img.src = sourceToLoad;
                    if (srcsetToLoad) img.srcset = srcsetToLoad;
                        img.classList.remove('lazy', 'loading');
                        img.classList.add('loaded');
                        if (typeof gtag !== 'undefined') {
                            gtag('event', 'image_load', {
                                event_category: 'Performance',
                                event_label: img.alt || 'Unknown',
                                value: 1
                            });
                        }
                    observer.unobserve(img);
                    };
                    newImg.onerror = () => {
                        img.classList.remove('lazy', 'loading');
                        img.classList.add('error');
                    logger.warn('Failed to load image:', sourceToLoad || srcsetToLoad || '(unknown)');
                    observer.unobserve(img);
                    };
                newImg.src = sourceToLoad || img.currentSrc || img.src;
            });
        }, {
            rootMargin: '300px 0px', // Start loading images earlier (300px before they enter viewport)
            threshold: 0.01
        });
        
        // Observe both explicit data-* lazy images and native-lazy images
        document.querySelectorAll('img[data-src], img[data-srcset], img[loading="lazy"]').forEach(img => imageObserver.observe(img));

        // Lazy load iframes (e.g., maps) using data-src
        const iframeObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const target = entry.target;
                // If observing placeholder, load adjacent iframe
                if (target.classList && target.classList.contains('map-placeholder')) {
                    const iframe = target.nextElementSibling;
                    if (iframe && iframe.hasAttribute('data-src')) {
                        const src = iframe.getAttribute('data-src');
                        iframe.src = src;
                        iframe.removeAttribute('data-src');
                        iframe.classList.add('iframe-loaded');
                        target.remove();
                    }
                    observer.unobserve(target);
                    return;
                }
                // Observing an iframe directly
                const iframe = target;
                const src = iframe.getAttribute('data-src');
                if (src) {
                    iframe.src = src;
                    iframe.removeAttribute('data-src');
                    if (iframe.style && iframe.style.display === 'none') {
                        iframe.classList.add('iframe-loaded');
                    }
                    const prev = iframe.previousElementSibling;
                    if (prev && prev.classList && prev.classList.contains('map-placeholder')) {
                        prev.remove();
                    }
                }
                observer.unobserve(target);
            });
        }, { rootMargin: '200px 0px', threshold: 0.01 });
        document.querySelectorAll('iframe[data-src]').forEach(iframe => iframeObserver.observe(iframe));
        document.querySelectorAll('.map-placeholder').forEach(ph => iframeObserver.observe(ph));
    }

    // ===== SCROLL REVEAL SYSTEM =====
    // Consistent scroll-based section reveals with fade + translate
    // Animations trigger once, natural timing, respects reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (!prefersReducedMotion && 'IntersectionObserver' in window) {
        // Detect mobile for larger trigger distance
        const isMobile = window.innerWidth <= 768;
        const triggerDistance = isMobile ? '600px' : '400px'; // Much larger on mobile
        
        // Main section reveals - major content blocks
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    sectionObserver.unobserve(entry.target); // Trigger once
                }
            });
        }, { 
            rootMargin: `${triggerDistance} 0px 0px 0px`, // Trigger much earlier on mobile
            threshold: 0.01 
        });
        
        // Apply to major sections
        const sections = document.querySelectorAll('.section-main, .section-hero, .section-secondary, .cta-card, .workshop-section, .event-section, .display-section');
        sections.forEach(section => {
            // Exclude acknowledgement section from scroll reveal - it should be visible immediately
            if (section.querySelector('.acknowledgement-text') || section.id === 'preFooterCtaHeading' || section.getAttribute('aria-labelledby') === 'preFooterCtaHeading') {
                // Make acknowledgement section visible immediately, no scroll reveal
                section.classList.add('revealed');
                return; // Skip scroll reveal for this section
            }
            
            section.classList.add('scroll-reveal');
            
            // On mobile, check if section is already in viewport and reveal immediately
            if (isMobile) {
                const rect = section.getBoundingClientRect();
                const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
                // If section is within 600px of viewport, reveal it immediately
                if (rect.top < viewportHeight + 600 && rect.bottom > -600) {
                    section.classList.add('revealed');
                } else {
                    sectionObserver.observe(section);
                }
            } else {
                sectionObserver.observe(section);
            }
        });
        
        // Staggered child elements - cards, grid items, etc.
        const staggerObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    staggerObserver.unobserve(entry.target); // Trigger once
                }
            });
        }, { 
            rootMargin: `${triggerDistance} 0px 0px 0px`, // Trigger much earlier on mobile
            threshold: 0.01 
        });
        
        // Apply to card groups and grid containers
        document.querySelectorAll('.row.g-4, .row.g-3, .row.g-2, .card-group, .cta-buttons, .hero-cta')
            .forEach(group => {
                group.classList.add('scroll-reveal-stagger');
                staggerObserver.observe(group);
            });
        
        // Individual cards and items (if not in a stagger group)
        const itemObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    itemObserver.unobserve(entry.target);
                }
            });
        }, { 
            rootMargin: `${triggerDistance} 0px 0px 0px`, // Trigger much earlier on mobile
            threshold: 0.01 
        });
        
        // Apply to standalone cards and items
        document.querySelectorAll('.card:not(.scroll-reveal-stagger .card), .service-card:not(.scroll-reveal-stagger .service-card), .testimonial-item:not(.scroll-reveal-stagger .testimonial-item), [data-reveal]')
            .forEach(item => {
                item.classList.add('scroll-reveal');
                itemObserver.observe(item);
            });
    }
    
    // ===== ENHANCED ACCESSIBILITY FEATURES =====
    // Add skip link functionality
    // ===== LAZY-LOAD THIRD-PARTY SOCIAL WIDGETS =====
    (function lazyLoadSocialWidgets() {
        const heading = document.querySelector('#socialMediaHeading');
        const section = heading ? heading.closest('section') : document.querySelector('.social-card')?.closest('section');
        if (!section) return;
        let loaded = false;
        const loadScripts = () => {
            if (loaded) return; loaded = true;
            const fb = document.createElement('script');
            fb.async = true; fb.defer = true; fb.crossOrigin = 'anonymous';
            fb.src = 'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v18.0';
            fb.nonce = 'bloomn';
            document.body.appendChild(fb);
            const ig = document.createElement('script');
            ig.src = 'https://widgets.sociablekit.com/instagram-feed/widget.js';
            ig.defer = true; document.body.appendChild(ig);
            const li = document.createElement('script');
            li.src = 'https://widgets.sociablekit.com/linkedin-profile-posts/widget.js';
            li.defer = true; document.body.appendChild(li);
        };
        // Fallback: load on first interaction or after timeout
        const triggerOnce = () => { loadScripts(); window.removeEventListener('scroll', triggerOnce); window.removeEventListener('touchstart', triggerOnce); };
        setTimeout(loadScripts, 3000);
        window.addEventListener('scroll', triggerOnce, { passive: true, once: true });
        window.addEventListener('touchstart', triggerOnce, { passive: true, once: true });
        if ('IntersectionObserver' in window) {
            const io = new IntersectionObserver((entries) => {
                if (entries.some(e => e.isIntersecting)) {
                    loadScripts();
                    io.disconnect();
                }
            }, { rootMargin: '400px 0px 400px 0px' });
            io.observe(section);
            // Immediate visibility check
            const rect = section.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) loadScripts();
        } else {
            // No IO support
            loadScripts();
        }
    })();

    // ===== BOOTSTRAP DROPDOWN INITIALIZATION + FALLBACK =====
    (function initDropdowns() {
        // First, ensure all dropdowns are closed on page load
        const closeAllDropdowns = () => {
            document.querySelectorAll('.dropdown-menu.show').forEach(m => {
                m.classList.remove('show');
                m.classList.add('d-none');
            });
            document.querySelectorAll('.dropdown-menu:not(.show)').forEach(m => {
                m.classList.add('d-none');
            });
            document.querySelectorAll('.dropdown.show, .dropup.show').forEach(d => {
                d.classList.remove('show');
            });
            document.querySelectorAll('.dropdown-toggle[aria-expanded="true"]').forEach(t => {
                t.setAttribute('aria-expanded', 'false');
            });
        };
        
        // Close all dropdowns immediately on page load
        closeAllDropdowns();
        
        const toggles = document.querySelectorAll('.navbar .dropdown-toggle');
        if (toggles.length === 0) return;
        
        if (window.bootstrap && bootstrap.Dropdown) {
            toggles.forEach(t => {
                try {
                    // Get the menu element first
                    const parent = t.closest('.dropdown, .dropup');
                    const menu = parent ? parent.querySelector('.dropdown-menu') : null;
                    
                    // Explicitly close before initialization
                    if (menu) {
                        menu.classList.remove('show');
                        menu.classList.add('d-none');
                    }
                    if (parent) {
                        parent.classList.remove('show');
                    }
                    t.setAttribute('aria-expanded', 'false');
                    
                    // Initialize Bootstrap dropdown with autoClose enabled
                    const dropdown = new bootstrap.Dropdown(t, {
                        autoClose: true
                    });
                    
                    // Ensure it stays closed after initialization
                    setTimeout(() => {
                        if (menu) {
                            menu.classList.remove('show');
                            menu.classList.add('d-none');
                        }
                        if (parent) {
                            parent.classList.remove('show');
                        }
                        t.setAttribute('aria-expanded', 'false');
                    }, 0);
                } catch (e) {
                    console.warn('Dropdown initialization error:', e);
                }
            });
        } else {
            // Fallback: minimal manual toggle
            const closeAll = () => {
                document.querySelectorAll('.dropdown-menu.show').forEach(m => m.classList.remove('show'));
                document.querySelectorAll('.dropdown.show, .dropup.show').forEach(d => d.classList.remove('show'));
                document.querySelectorAll('.dropdown-toggle[aria-expanded="true"]').forEach(t => {
                    t.setAttribute('aria-expanded', 'false');
                });
            };
            toggles.forEach(t => {
                // Ensure initial state is closed
                t.setAttribute('aria-expanded', 'false');
                const parent = t.closest('.dropdown, .dropup');
                const menu = parent && parent.querySelector('.dropdown-menu');
                if (menu) {
                    menu.classList.remove('show');
                }
                
                t.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const parent = t.closest('.dropdown, .dropup');
                    const menu = parent && parent.querySelector('.dropdown-menu');
                    if (!parent || !menu) return;
                    const willOpen = !menu.classList.contains('show');
                    closeAll();
                    if (willOpen) {
                        parent.classList.add('show');
                        menu.classList.add('show');
                        t.setAttribute('aria-expanded', 'true');
                    } else {
                        t.setAttribute('aria-expanded', 'false');
                    }
                });
            });
            document.addEventListener('click', (e) => {
                // Don't close if clicking inside dropdown
                if (!e.target.closest('.dropdown, .dropup')) {
                    closeAll();
                }
            });
        }
        
        // Also close all dropdowns after a short delay to catch any late initialization
        setTimeout(closeAllDropdowns, 100);
    })();

    // ===== AUTO-INJECT WEBP SOURCES VIA <picture> =====
    (function enhanceImagesWithWebP() {
        // Only enable when deployment has generated matching .webp assets
        const webpAssetsReady = !!document.querySelector('meta[name="webp-assets"][content="true"]');
        if (!webpAssetsReady) return;
        const isSupported = (function() {
            try {
                const canvas = document.createElement('canvas');
                return !!(canvas.getContext && canvas.getContext('2d')) && canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
            } catch { return false; }
        })();
        // If browser supports WebP natively, still add <picture> so srcset picks the best
        const skipClasses = new Set(['navbar-logo', 'footer-logo', 'client-logo-img']);
        const candidates = Array.from(document.querySelectorAll('main img'))
            .filter(img => !skipClasses.has(Array.from(img.classList)[0]))
            .filter(img => !img.closest('.fullscreen-modal'))
            .filter(img => !img.closest('.sk-instagram-feed'));
        // Helper: check if WebP version exists using Image object
        // Note: Browsers will log 404 errors to console for missing files - this is expected behavior
        // We minimize checks by only testing one representative image first
        const checkWebPExists = async (url) => {
            if (!url) return false;
            return new Promise((resolve) => {
                const img = new Image();
                // Set a timeout to avoid hanging
                const timeout = setTimeout(() => {
                    resolve(false);
                }, 2000);
                img.onload = () => {
                    clearTimeout(timeout);
                    resolve(true);
                };
                img.onerror = () => {
                    clearTimeout(timeout);
                    resolve(false);
                };
                try {
                    img.src = url;
                } catch (e) {
                    clearTimeout(timeout);
                    resolve(false);
                }
            });
        };
        // Global gate: if a representative .webp doesn't exist, skip all injections (avoid 404 spam)
        const computeTestUrl = (imgEl) => {
            const hasSrc = !!imgEl.getAttribute('src');
            const hasSrcset = !!imgEl.getAttribute('srcset');
            if (hasSrcset) {
                const parts = imgEl.getAttribute('srcset').split(',').map(p => p.trim());
                const [url] = (parts[0] || '').split(/\s+(?=[^\s]*$)/);
                return url ? url.replace(/\.(jpg|jpeg|png)$/i, '.webp') : '';
            }
            if (hasSrc) {
                const url = imgEl.getAttribute('src');
                return url ? url.replace(/\.(jpg|jpeg|png)$/i, '.webp') : '';
            }
            return '';
        };
        (async () => {
            let representativeUrl = '';
            for (const img of candidates) {
                representativeUrl = computeTestUrl(img);
                if (representativeUrl) break;
            }
            // Only check representative URL - if it doesn't exist, skip all WebP enhancements
            // This minimizes console 404 errors to just one check
            const canInject = isSupported && representativeUrl && await checkWebPExists(representativeUrl);
            if (!canInject) {
                // WebP files don't exist, skip all enhancements to avoid 404 spam
                return;
            }
            // Proceed with per-image cautious injection (with per-image fetch probe)
            candidates.forEach(async img => {
                    if (img.closest('picture')) return;
                    const hasSrc = !!img.getAttribute('src');
                    const hasSrcset = !!img.getAttribute('srcset');
                    if (!hasSrc && !hasSrcset) return;
                    const sizes = img.getAttribute('sizes') || '';
                    let webpSrcset = '';
                    let testUrl = '';
                    if (hasSrcset) {
                        // Convert each candidate in srcset to .webp sibling
                        const parts = img.getAttribute('srcset').split(',').map(p => p.trim());
                        const converted = parts.map(p => {
                            const [url, descriptor] = p.split(/\s+(?=[^\s]*$)/); // split last token
                            const w = url.replace(/\.(jpg|jpeg|png)$/i, '.webp');
                            return descriptor ? `${w} ${descriptor}` : w;
                        }).join(', ');
                        webpSrcset = converted;
                        // Use the first candidate url as a test
                        const first = converted.split(',')[0].trim();
                        testUrl = (first.split(/\s+/)[0] || '').trim();
                    } else if (hasSrc) {
                        const url = img.getAttribute('src');
                        webpSrcset = url.replace(/\.(jpg|jpeg|png)$/i, '.webp');
                        testUrl = webpSrcset;
                    }
                    if (!webpSrcset) return;
                    // Only inject if a representative .webp for this image exists
                    const exists = await checkWebPExists(testUrl);
                    if (exists) {
                        const picture = document.createElement('picture');
                        const source = document.createElement('source');
                        source.type = 'image/webp';
                        source.setAttribute('srcset', webpSrcset);
                        if (sizes) source.setAttribute('sizes', sizes);
                        img.parentNode.insertBefore(picture, img);
                        picture.appendChild(source);
                        picture.appendChild(img);
                    }
                });
        })();
        // If not supported or no representativeUrl, do nothing (original images remain)
    })();
    
    // Enhanced focus management for keyboard navigation
    const focusableElements = document.querySelectorAll('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])');
    focusableElements.forEach(element => {
        element.addEventListener('focus', function() {
            this.style.outline = '2px solid var(--coreGold)';
            this.style.outlineOffset = '2px';
            
            // Announce focus changes to screen readers
            if (this.getAttribute('aria-label') || this.textContent.trim()) {
                const announcement = this.getAttribute('aria-label') || this.textContent.trim();
                announceToScreenReader(announcement);
            }
        });
        
        element.addEventListener('blur', function() {
            this.style.outline = 'none';
        });
    });
    
    // Screen reader announcement function
    function announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }
    
    // Enhanced keyboard navigation for carousels
    const carousels = document.querySelectorAll('.carousel');
    carousels.forEach(carousel => {
        carousel.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                e.preventDefault();
                const direction = e.key === 'ArrowLeft' ? 'prev' : 'next';
                const control = carousel.querySelector(`.carousel-control-${direction}`);
                if (control) {
                    control.click();
                }
            }
        });
    });
    
    // ===== LIGHTBOX FOR NON-CAROUSEL IMAGES =====
    const lightboxImages = Array.from(document.querySelectorAll('main img'))
        .filter(img => !img.closest('.carousel') && !img.classList.contains('client-logo-img') && !img.classList.contains('navbar-logo') && !img.classList.contains('footer-logo') && !img.closest('a') && !img.hasAttribute('data-no-lightbox'));
    lightboxImages.forEach((img, index) => {
        const modalId = `fullscreen-${Date.now()}-${index}`;
        const wrapper = document.createElement('a');
        wrapper.href = `#${modalId}`;
        wrapper.classList.add('social-wrapper-block');
        img.parentNode.insertBefore(wrapper, img);
        wrapper.appendChild(img);
        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'fullscreen-modal';
        
        // Create modal content safely
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        modalContent.setAttribute('role', 'dialog');
        modalContent.setAttribute('aria-modal', 'true');
        
        const closeBtn = document.createElement('a');
        closeBtn.href = '#';
        closeBtn.className = 'close-btn';
        closeBtn.setAttribute('aria-label', 'Close');
        closeBtn.textContent = '×';
        
        const modalImg = document.createElement('img');
        modalImg.src = img.src; // Image src is already loaded from trusted source
        modalImg.alt = `${img.alt || ''} - Fullscreen`.trim();
        
        modalContent.appendChild(closeBtn);
        modalContent.appendChild(modalImg);
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        closeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.hash = '';
        });
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                window.location.hash = '';
            }
        });
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && window.location.hash === `#${modalId}`) {
                window.location.hash = '';
            }
        });
    });
    
    // ===== CHATBOT FUNCTIONALITY =====
    const chatbotWidget = document.getElementById('chatbot-widget');
    const chatbotToggle = document.getElementById('chatbot-toggle');
    const chatbotContainer = document.getElementById('chatbot-container');
    const chatbotClose = document.getElementById('chatbot-close');
    const chatbotMessages = document.getElementById('chatbot-messages');
    const chatbotInput = document.getElementById('chatbot-input');
    const chatbotSend = document.getElementById('chatbot-send');
    const chatbotTyping = document.getElementById('chatbot-typing');
    const chatbotNotification = document.getElementById('chatbot-notification');
    
    // OpenAI API Configuration via Backend Proxy
    // API Key Name: bloom'n-website-chatbot-prod
    // 
    // The API key is securely stored on the backend server.
    // Update BACKEND_URL to match your deployment (e.g., Vercel serverless function, Railway, etc.)
    // Use config for backend URL
    const BACKEND_URL = getBackendUrl();
    const OPENAI_API_URL = getApiUrl();
    const USE_OPENAI = true; // Backend proxy is ready
    
    // Debug: Log API URL (development only)
    if (typeof window !== 'undefined' && 
        (window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1' ||
         window.location.protocol === 'file:')) {
        logger.debug('Backend API URL:', OPENAI_API_URL);
    }
    
    // Chatbot system prompt
    const CHATBOT_SYSTEM_PROMPT = `You are a helpful assistant for Bloom'n Events Co, a professional event planning and display company based in Brookton, Western Australia. 

Company Information:
- Name: Bloom'n Events Co Pty Ltd
- Location: Brookton, WA
- Services: Corporate event planning, workshops (adults and kids), custom displays, food festivals
- Notable clients: Hawaiian, Centuria, Stockland
- Service area: Greater Perth area and Western Australia

Your role is to:
- Answer questions about their services (corporate events, workshops, displays)
- Provide information about their capabilities and past work
- Help visitors understand their offerings
- Guide users to appropriate pages (events.html, workshops.html, displays.html, contact.html, gallery.html, team.html, about.html)
- Be friendly, professional, and helpful
- If asked about pricing, explain that pricing depends on scope and suggest contacting them for a quote
- Keep responses concise and conversational
- Always maintain a positive, enthusiastic tone about events and celebrations

If you don't know something specific, suggest they contact the company directly through the contact page.`;
    
    if (chatbotWidget) {
        let isOpen = false;
        let hasInteracted = false;
        let lastFocusedBeforeOpen = null;
        
        // Show notification after 3 seconds if user hasn't interacted
        // Use requestIdleCallback for better performance
        runWhenIdle(() => {
            setTimeout(() => {
                if (!hasInteracted) {
                    chatbotNotification.classList.add('chatbot-notification-visible');
                    chatbotNotification.classList.remove('chatbot-notification-hidden');
                    
                    // Track chatbot notification display
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'chatbot_notification_shown', {
                            event_category: 'Engagement',
                            event_label: 'Auto Notification',
                            value: 1
                        });
                    }
                }
            }, CONFIG.CHAT.NOTIFICATION_DELAY);
        });
        
        // Toggle chatbot with analytics tracking
        chatbotToggle.addEventListener('click', () => {
            isOpen = !isOpen;
            if (isOpen) {
                chatbotContainer.classList.add('show');
                chatbotInput.focus();
                chatbotNotification.classList.add('chatbot-notification-hidden');
                hasInteracted = true;
                chatbotToggle.setAttribute('aria-expanded', 'true');
                lastFocusedBeforeOpen = document.activeElement;
                trapFocus(chatbotContainer);
                
                // Track chatbot open
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'chatbot_opened', {
                        event_category: 'Engagement',
                        event_label: 'Chatbot Interaction',
                        value: 1
                    });
                }
            } else {
                chatbotContainer.classList.remove('show');
                releaseFocusTrap();
                chatbotToggle.setAttribute('aria-expanded', 'false');
                if (lastFocusedBeforeOpen && document.contains(lastFocusedBeforeOpen)) {
                    lastFocusedBeforeOpen.focus();
                } else {
                    chatbotToggle.focus();
                }
                
                // Track chatbot close
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'chatbot_closed', {
                        event_category: 'Engagement',
                        event_label: 'Chatbot Interaction',
                        value: 1
                    });
                }
            }
        });
        
        // Close chatbot
        chatbotClose.addEventListener('click', () => {
            isOpen = false;
            chatbotContainer.classList.remove('show');
            releaseFocusTrap();
            chatbotToggle.setAttribute('aria-expanded', 'false');
            chatbotToggle.focus();
        });
        
        // Send message
        async function sendMessage() {
            const message = chatbotInput.value.trim();
            if (!message) return;
            
            // Add user message
            addMessage(message, 'user');
            chatbotInput.value = '';
            
            // Show typing indicator
            showTyping();
            
            try {
                let response;
                
                // Try OpenAI API if configured
                if (USE_OPENAI) {
                    try {
                        response = await getOpenAIResponse(message);
                        if (response && response.text) {
                            hideTyping();
                            addMessage(response.text, 'bot', response.quickReplies);
                            return;
                        }
                    } catch (error) {
                        // Only log detailed debug info in development
                        const isDevelopment = typeof window !== 'undefined' && 
                            (window.location.hostname === 'localhost' || 
                             window.location.hostname === '127.0.0.1' ||
                             window.location.protocol === 'file:');
                        
                        if (isDevelopment) {
                            logger.debug('API URL attempted:', OPENAI_API_URL);
                            logger.debug('Error details:', error.message);
                        }
                        logger.warn('OpenAI API error, falling back to rule-based responses');
                        // Fall through to rule-based response
                    }
                }
                
                // Fallback to rule-based response
                setTimeout(() => {
                    hideTyping();
                    response = getBotResponse(message);
                    addMessage(response.text, 'bot', response.quickReplies);
                }, 1000 + Math.random() * 1000);
                
            } catch (error) {
                logger.error('Error sending message:', error);
                hideTyping();
                addMessage("I'm sorry, I encountered an error. Please try again or contact us directly through our contact page.", 'bot', [
                    { text: "Contact Us", message: "Take me to the contact page", action: "navigate:contact.html" }
                ]);
            }
        }
        
        // Get OpenAI API response via backend proxy
        async function getOpenAIResponse(userMessage) {
            if (!USE_OPENAI) {
                return null;
            }
            
            // Get conversation history (last 10 messages for context)
            const conversationHistory = Array.from(chatbotMessages.querySelectorAll('.chatbot-message'))
                .slice(-10)
                .map(msg => {
                    const isBot = msg.classList.contains('chatbot-message-bot');
                    const text = msg.querySelector('.chatbot-message-content p')?.textContent || '';
                    return {
                        role: isBot ? 'assistant' : 'user',
                        content: text
                    };
                })
                .filter(msg => msg.content.trim().length > 0); // Filter out empty messages
            
            // Send request to backend proxy
            const response = await fetch(OPENAI_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: userMessage,
                    conversationHistory: conversationHistory
                })
            });
            
            if (!response.ok) {
                const error = await response.json().catch(() => ({ error: 'Unknown error' }));
                throw new Error(error.error || error.message || 'API request failed');
            }
            
            const data = await response.json();
            const aiResponse = data.reply || '';
            
            // Extract quick replies if the response suggests navigation
            const quickReplies = extractQuickReplies(aiResponse);
            
            return {
                text: aiResponse,
                quickReplies: quickReplies.length > 0 ? quickReplies : getDefaultQuickReplies()
            };
        }
        
        // Extract quick reply suggestions from AI response
        function extractQuickReplies(response) {
            const quickReplies = [];
            const lowerResponse = response.toLowerCase();
            
            // Check for common navigation suggestions
            if (lowerResponse.includes('contact') || lowerResponse.includes('get in touch')) {
                quickReplies.push({ text: "Contact Us", message: "How can I contact you?", action: "navigate:contact.html" });
            }
            if (lowerResponse.includes('gallery') || lowerResponse.includes('photos') || lowerResponse.includes('examples')) {
                quickReplies.push({ text: "View Gallery", message: "Show me your gallery", action: "navigate:gallery.html" });
            }
            if (lowerResponse.includes('workshop')) {
                quickReplies.push({ text: "View Workshops", message: "Tell me about your workshops", action: "navigate:workshops.html" });
            }
            if (lowerResponse.includes('display')) {
                quickReplies.push({ text: "View Displays", message: "Show me your displays", action: "navigate:displays.html" });
            }
            if (lowerResponse.includes('event')) {
                quickReplies.push({ text: "View Events", message: "Show me your events", action: "navigate:events.html" });
            }
            
            return quickReplies.slice(0, 4); // Limit to 4 quick replies
        }
        
        // Get default quick replies
        function getDefaultQuickReplies() {
            return [
                { text: "View Events", message: "Show me your events", action: "navigate:events.html" },
                { text: "View Workshops", message: "Show me your workshops", action: "navigate:workshops.html" },
                { text: "View Displays", message: "Show me your displays", action: "navigate:displays.html" },
                { text: "Contact Us", message: "How can I contact you?", action: "navigate:contact.html" }
            ];
        }
        
        // Send button click
        chatbotSend.addEventListener('click', sendMessage);
        
        // Enter key press
        chatbotInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
        
        // Mobile-specific input handling
        chatbotInput.addEventListener('input', () => {
            // Ensure input is visible on mobile
            chatbotInput.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
        
        // Prevent zoom on input focus (iOS Safari)
        chatbotInput.addEventListener('focus', () => {
            if (window.innerWidth <= 768) {
                const viewport = document.querySelector('meta[name="viewport"]');
                if (viewport) {
                    viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
                }
            }
        });
        
        chatbotInput.addEventListener('blur', () => {
            if (window.innerWidth <= 768) {
                const viewport = document.querySelector('meta[name="viewport"]');
                if (viewport) {
                    viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
                }
            }
        });
        
        // Quick reply buttons - use event delegation on the messages container
        chatbotMessages.addEventListener('click', (e) => {
            if (e.target.classList.contains('chatbot-quick-reply')) {
                e.preventDefault();
                e.stopPropagation();
                
                const message = e.target.dataset.message;
                const action = e.target.dataset.action; // Check for navigation action
                
                // Check if this is a navigation action
                if (action && action.startsWith('navigate:')) {
                    const targetPage = action.replace('navigate:', '');
                    
                    // Add user message
                    addMessage(message, 'user');
                    
                    // Show typing indicator
                    showTyping();
                    
                    // Navigate after a short delay
                    setTimeout(() => {
                        hideTyping();
                        addMessage(`Taking you to our ${targetPage} page...`, 'bot');
                        setTimeout(() => {
                            window.location.href = targetPage;
                        }, 1000);
                    }, 1000);
                } else {
                    // Regular conversation flow
                    addMessage(message, 'user');
                    
                    // Show typing indicator
                    showTyping();
                    
                    // Get bot response after delay
                    setTimeout(() => {
                        hideTyping();
                        const response = getBotResponse(message);
                        addMessage(response.text, 'bot', response.quickReplies);
                    }, 1000 + Math.random() * 1000);
                }
            }
        });
        
        // Add message to chat
        function addMessage(text, sender, quickReplies = null) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `chatbot-message chatbot-message-${sender}`;
            
            const avatar = document.createElement('div');
            avatar.className = 'chatbot-avatar';
            if (sender === 'bot') {
                const butterflyImg = document.createElement('img');
                butterflyImg.src = 'images/butterfly-icon.svg';
                butterflyImg.alt = 'Bloom\'n Events Co';
                butterflyImg.className = 'chatbot-avatar-icon';
                butterflyImg.width = 32;
                butterflyImg.height = 32;
                avatar.appendChild(butterflyImg);
            } else {
                // Create user icon safely
                const userIcon = document.createElement('i');
                userIcon.className = 'bi bi-person';
                avatar.appendChild(userIcon);
            }
            
            const content = document.createElement('div');
            content.className = 'chatbot-message-content';
            
            const textP = document.createElement('p');
            textP.textContent = text;
            content.appendChild(textP);
            
            if (quickReplies && sender === 'bot') {
                const quickRepliesDiv = document.createElement('div');
                quickRepliesDiv.className = 'chatbot-quick-replies';
                
                quickReplies.forEach(reply => {
                    const button = document.createElement('button');
                    button.className = 'chatbot-quick-reply';
                    button.type = 'button';
                    button.textContent = reply.text;
                    button.dataset.message = reply.message;
                    if (reply.action) {
                        button.dataset.action = reply.action;
                    }
                    button.classList.add('cursor-pointer');
                    
                    // Add click event directly to each button as backup
                    button.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        // Check if this is a navigation action
                        if (reply.action && reply.action.startsWith('navigate:')) {
                            const targetPage = reply.action.replace('navigate:', '');
                            
                            // Add user message
                            addMessage(reply.message, 'user');
                            
                            // Show typing indicator
                            showTyping();
                            
                            // Navigate after a short delay
                            setTimeout(() => {
                                hideTyping();
                                addMessage(`Taking you to our ${targetPage} page...`, 'bot');
                                setTimeout(() => {
                                    window.location.href = targetPage;
                                }, 1000);
                            }, 1000);
                        } else {
                            // Regular conversation flow
                            addMessage(reply.message, 'user');
                            
                            // Show typing indicator
                            showTyping();
                            
                            // Get bot response after delay
                            setTimeout(() => {
                                hideTyping();
                                const response = getBotResponse(reply.message);
                                addMessage(response.text, 'bot', response.quickReplies);
                            }, 1000 + Math.random() * 1000);
                        }
                    });
                    
                    quickRepliesDiv.appendChild(button);
                });
                
                content.appendChild(quickRepliesDiv);
            }
            
            messageDiv.appendChild(avatar);
            messageDiv.appendChild(content);
            chatbotMessages.appendChild(messageDiv);
            
            // Scroll to bottom
            chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        }
        
        // Show typing indicator
        function showTyping() {
            chatbotTyping.classList.add('chatbot-typing-visible');
            chatbotTyping.classList.remove('chatbot-typing-hidden');
            chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        }
        
        // Hide typing indicator
        function hideTyping() {
            chatbotTyping.classList.add('chatbot-typing-hidden');
        }
        
        // Get bot response based on user input
        function getBotResponse(userMessage) {
            const message = userMessage.toLowerCase();
            
            // Corporate Events
            if (message.includes('corporate') || message.includes('business') || message.includes('company')) {
                return {
                    text: "We excel at corporate events! From team building workshops to networking events and company celebrations. We've worked with major clients like Hawaiian and Centuria. Our corporate services include event planning, custom displays, and team building activities.",
                    quickReplies: [
                        { text: "Team Building", message: "Tell me about your team building workshops" },
                        { text: "View Events", message: "Show me your corporate events", action: "navigate:events.html" },
                        { text: "View Displays", message: "Show me your corporate display work", action: "navigate:displays.html" },
                        { text: "Contact Us", message: "I need a quote for a corporate event", action: "navigate:contact.html" }
                    ]
                };
            }
            
            // Food Festivals
            if (message.includes('food festival') || message.includes('hawaiian') || message.includes('culinary')) {
                return {
                    text: "Food festivals are our specialty! We've created amazing events like the Hawaiian World of Flavours and Neighbourhood Nibbles. We handle everything from concept to execution, including displays, activities, and vendor coordination.",
                    quickReplies: [
                        { text: "View Events", message: "Show me your food festival events", action: "navigate:events.html" },
                        { text: "View Gallery", message: "Show me your food festival photos", action: "navigate:gallery.html" },
                        { text: "Our Capabilities", message: "What can you do for food festivals?", action: "navigate:capabilities.html" },
                        { text: "Contact Us", message: "I want to discuss a food festival", action: "navigate:contact.html" }
                    ]
                };
            }
            
            // Adult Workshops
            if (message.includes('adult workshop') || message.includes('adult class') || message.includes('grown up')) {
                return {
                    text: "Our adult workshops are perfect for team building, community events, or just fun! We offer craft activities, cooking classes, and creative projects. Great for corporate events, community groups, or special occasions.",
                    quickReplies: [
                        { text: "View Workshops", message: "Show me your adult workshops", action: "navigate:workshops.html" },
                        { text: "View Gallery", message: "Show me workshop photos", action: "navigate:gallery.html" },
                        { text: "Our Team", message: "Who runs the workshops?", action: "navigate:team.html" },
                        { text: "Contact Us", message: "How can I book a workshop?", action: "navigate:contact.html" }
                    ]
                };
            }
            
            // Kids Workshops
            if (message.includes('kids') || message.includes('children') || message.includes('child') || message.includes('school holiday')) {
                return {
                    text: "Kids love our workshops! We create engaging, age-appropriate activities that are both fun and educational. Perfect for school holiday programs, birthday parties, or community events. All activities are safe and supervised.",
                    quickReplies: [
                        { text: "View Workshops", message: "Show me your kids workshops", action: "navigate:workshops.html" },
                        { text: "View Gallery", message: "Show me kids workshop photos", action: "navigate:gallery.html" },
                        { text: "Our Team", message: "Who runs the kids workshops?", action: "navigate:team.html" },
                        { text: "Contact Us", message: "How can I book a kids workshop?", action: "navigate:contact.html" }
                    ]
                };
            }
            
            // Team Building
            if (message.includes('team building') || message.includes('teamwork') || message.includes('corporate training')) {
                return {
                    text: "Team building is one of our strengths! We create engaging workshops that bring teams together through creative activities, problem-solving challenges, and collaborative projects. Perfect for improving workplace relationships and communication.",
                    quickReplies: [
                        { text: "Workshop Types", message: "What types of team building workshops do you offer?" },
                        { text: "Group Sizes", message: "What group sizes can you accommodate?" },
                        { text: "Duration", message: "How long are your team building sessions?" },
                        { text: "Book Session", message: "How can I book a team building workshop?" }
                    ]
                };
            }
            
            // Seasonal Displays
            if (message.includes('seasonal') || message.includes('christmas') || message.includes('easter') || message.includes('holiday')) {
                return {
                    text: "We create stunning seasonal displays for any time of year! From Christmas decorations to Easter displays, we transform spaces with beautiful, themed installations that capture the spirit of the season.",
                    quickReplies: [
                        { text: "Christmas Displays", message: "What Christmas displays do you create?" },
                        { text: "Easter Displays", message: "Tell me about your Easter displays" },
                        { text: "Custom Themes", message: "Can you create custom seasonal themes?" },
                        { text: "Installation", message: "Do you install the displays?" }
                    ]
                };
            }
            
            // Custom Displays
            if (message.includes('custom display') || message.includes('branded') || message.includes('themed')) {
                return {
                    text: "Custom displays are our specialty! We work with your brand and vision to create unique, eye-catching displays that perfectly represent your business or event. From concept to installation, we handle everything.",
                    quickReplies: [
                        { text: "Design Process", message: "How do you design custom displays?" },
                        { text: "Brand Integration", message: "How do you incorporate my brand?" },
                        { text: "Timeline", message: "How long does it take to create a custom display?" },
                        { text: "Get Quote", message: "I want a quote for a custom display" }
                    ]
                };
            }
            
            // Pricing and Quotes
            if (message.includes('quote') || message.includes('pricing') || message.includes('cost') || message.includes('budget') || message.includes('price')) {
                return {
                    text: "We'd love to provide you with a detailed quote! Our pricing depends on the scope of your event, number of participants, materials needed, and location. We offer competitive rates and can work within various budgets.",
                    quickReplies: [
                        { text: "Get Quote", message: "I want a detailed quote for my event" },
                        { text: "Budget Options", message: "What are your budget-friendly options?" },
                        { text: "Package Deals", message: "Do you offer package deals?" },
                        { text: "Contact", message: "I want to discuss pricing" }
                    ]
                };
            }
            
            // Contact Information
            if (message.includes('contact') || message.includes('phone') || message.includes('email') || message.includes('reach')) {
                return {
                    text: "We'd love to hear from you! You can reach us through our contact page on the website, or I can help you get started right here. We're based in Brookton, WA, and serve the greater Perth area.",
                    quickReplies: [
                        { text: "Contact Page", message: "Take me to your contact page", action: "navigate:contact.html" },
                        { text: "About Us", message: "Tell me about your company", action: "navigate:about.html" },
                        { text: "Our Team", message: "Who works at Bloom'n Events?", action: "navigate:team.html" },
                        { text: "Get Quote", message: "I want a quote for my event", action: "navigate:contact.html" }
                    ]
                };
            }
            
            // Location and Service Areas
            if (message.includes('location') || message.includes('where') || message.includes('based') || message.includes('brookton') || message.includes('perth')) {
                return {
                    text: "We're based in Brookton, WA, and proudly serve the greater Perth area and beyond! We're happy to travel for events and have experience working throughout Western Australia. Distance is no barrier to creating amazing events!",
                    quickReplies: [
                        { text: "Service Areas", message: "What specific areas do you serve?" },
                        { text: "Travel", message: "Do you travel for events?" },
                        { text: "Local Events", message: "Have you done events in my area?" },
                        { text: "Contact", message: "How can I contact you?" }
                    ]
                };
            }
            
            // Portfolio and Gallery
            if (message.includes('portfolio') || message.includes('gallery') || message.includes('examples') || message.includes('show') || message.includes('work')) {
                return {
                    text: "We're proud of our work! We've created amazing events for clients like Hawaiian, Centuria, and many local businesses. Check out our gallery to see our recent projects, or visit our Events, Workshops, and Displays pages for specific examples.",
                    quickReplies: [
                        { text: "View Gallery", message: "I want to see your gallery" },
                        { text: "Client Examples", message: "Show me your client work" },
                        { text: "Testimonials", message: "What do clients say about you?" },
                        { text: "Recent Work", message: "Show me your recent projects" }
                    ]
                };
            }
            
            // Testimonials
            if (message.includes('testimonial') || message.includes('review') || message.includes('feedback') || message.includes('client say')) {
                return {
                    text: "Our clients love working with us! We have testimonials from Hawaiian, Centuria, and many satisfied customers. They praise our creativity, professionalism, and ability to bring their visions to life. Check out our testimonials on the website!",
                    quickReplies: [
                        { text: "View Testimonials", message: "I want to see your testimonials" },
                        { text: "Client Stories", message: "Tell me about your client success stories" },
                        { text: "References", message: "Can you provide client references?" },
                        { text: "Book Meeting", message: "I want to book a consultation" }
                    ]
                };
            }
            
            // General Event Planning
            if (message.includes('event') || message.includes('planning') || message.includes('organize') || message.includes('celebration')) {
                return {
                    text: "We specialize in creating unforgettable events! Our services include corporate events, community celebrations, food festivals, and custom displays. We handle everything from concept to execution, ensuring your vision comes to life perfectly.",
                    quickReplies: [
                        { text: "Corporate Events", message: "Tell me about your corporate event services" },
                        { text: "Food Festivals", message: "What food festival events have you done?" },
                        { text: "Community Events", message: "Do you do community celebrations?" },
                        { text: "Get Quote", message: "I need a quote for my event" }
                    ]
                };
            }
            
            // Workshop General
            if (message.includes('workshop') || message.includes('class') || message.includes('learn') || message.includes('activity')) {
                return {
                    text: "We offer amazing workshops for both adults and children! Our workshops include craft activities, cooking classes, and creative projects. Perfect for team building, community events, or school holiday programs.",
                    quickReplies: [
                        { text: "Adult Workshops", message: "What adult workshops do you offer?" },
                        { text: "Kids Workshops", message: "Tell me about your children's workshops" },
                        { text: "Team Building", message: "Do you do corporate team building workshops?" },
                        { text: "Book Workshop", message: "How can I book a workshop?" }
                    ]
                };
            }
            
            // Display General
            if (message.includes('display') || message.includes('decoration') || message.includes('setup') || message.includes('installation')) {
                return {
                    text: "Our custom displays are perfect for any occasion! We create beautiful, themed displays that capture attention and create memorable experiences. From seasonal decorations to branded installations, we bring your ideas to life.",
                    quickReplies: [
                        { text: "Seasonal Displays", message: "What seasonal displays do you create?" },
                        { text: "Custom Displays", message: "Can you create custom displays for my business?" },
                        { text: "Gallery", message: "Show me examples of your displays" },
                        { text: "Quote", message: "How much do displays cost?" }
                    ]
                };
            }
            
            // Default response
            return {
                text: "I'm here to help with all your event planning needs! Whether you're looking for event planning, workshops, custom displays, or just want to learn more about our services, I'm happy to assist. What would you like to know?",
                quickReplies: [
                    { text: "View Events", message: "Show me your events", action: "navigate:events.html" },
                    { text: "View Workshops", message: "Show me your workshops", action: "navigate:workshops.html" },
                    { text: "View Displays", message: "Show me your displays", action: "navigate:displays.html" },
                    { text: "Contact Us", message: "How can I contact you?", action: "navigate:contact.html" }
                ]
            };
        }
        
        // Close chatbot when clicking outside (with mobile considerations)
        document.addEventListener('click', (e) => {
            if (isOpen && !chatbotWidget.contains(e.target)) {
                isOpen = false;
                chatbotContainer.classList.remove('show');
                releaseFocusTrap();
                chatbotToggle.setAttribute('aria-expanded', 'false');
                chatbotToggle.focus();
            }
        });
        
        // Mobile-specific touch handling
        if ('ontouchstart' in window) {
            // Prevent chatbot from closing on touch outside on mobile
            document.addEventListener('touchstart', (e) => {
                if (isOpen && !chatbotWidget.contains(e.target)) {
                    // Only close if it's a tap outside, not a scroll
                    const touch = e.touches[0];
                    const target = document.elementFromPoint(touch.clientX, touch.clientY);
                    if (target && !chatbotWidget.contains(target)) {
                        isOpen = false;
                        chatbotContainer.classList.remove('show');
                    }
                }
            }, { passive: true });
        }
        
        // Prevent chatbot from closing when clicking inside
        chatbotContainer.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // Focus trap helpers
        let focusTrapHandler = null;
        function trapFocus(container) {
            const FOCUSABLE_SELECTORS = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
            const focusables = Array.from(container.querySelectorAll(FOCUSABLE_SELECTORS));
            if (focusables.length === 0) return;
            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            focusTrapHandler = function(e) {
                if (e.key !== 'Tab') return;
                if (e.shiftKey) {
                    if (document.activeElement === first) {
                        e.preventDefault();
                        last.focus();
                    }
                } else {
                    if (document.activeElement === last) {
                        e.preventDefault();
                        first.focus();
                    }
                }
            };
            container.addEventListener('keydown', focusTrapHandler);
        }
        function releaseFocusTrap() {
            if (focusTrapHandler) {
                chatbotContainer.removeEventListener('keydown', focusTrapHandler);
                focusTrapHandler = null;
            }
        }
        
    }
    
    // ===== ERROR HANDLING AND PERFORMANCE MONITORING =====
    
    // Global error handler
    window.addEventListener('error', (e) => {
        logger.error('JavaScript Error:', e.error);
        
        // Track errors in analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'exception', {
                description: e.error?.message || 'Unknown error',
                fatal: false
            });
        }
    });
    
    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (e) => {
        logger.error('Unhandled Promise Rejection:', e.reason);
        
        // Track promise rejections in analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'exception', {
                description: e.reason?.message || 'Unhandled promise rejection',
                fatal: false
            });
        }
    });
    
    // Performance monitoring
    if ('PerformanceObserver' in window) {
        // Monitor Core Web Vitals
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.entryType === 'largest-contentful-paint') {
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'lcp', {
                            event_category: 'Web Vitals',
                            value: Math.round(entry.startTime),
                            non_interaction: true,
                        });
                    }
                }
                
                if (entry.entryType === 'first-input') {
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'fid', {
                            event_category: 'Web Vitals',
                            value: Math.round(entry.processingStart - entry.startTime),
                            non_interaction: true,
                        });
                    }
                }
                
                if (entry.entryType === 'layout-shift') {
                    if (!entry.hadRecentInput) {
                        if (typeof gtag !== 'undefined') {
                            gtag('event', 'cls', {
                                event_category: 'Web Vitals',
                                value: entry.value,
                                non_interaction: true,
                            });
                        }
                    }
                }
            }
        });
        
        observer.observe({type: 'largest-contentful-paint', buffered: true});
        observer.observe({type: 'first-input', buffered: true});
        observer.observe({type: 'layout-shift', buffered: true});
    }
    
    // Service Worker registration for offline functionality
    if ('serviceWorker' in navigator) {
        runWhenIdle(() => {
            // Use relative path for GitHub Pages and similar hosts
            navigator.serviceWorker.register('sw.js').catch((error) => {
                logger.error('Service Worker registration failed:', error);
            });
        });
    }
    
    // Preload critical resources
    const preloadCriticalResources = () => {
        const criticalImages = [
            'assets/images/logo-wht.png',
            'assets/images/logo-blk-long.png'
        ];
        
        criticalImages.forEach(src => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = src;
            document.head.appendChild(link);
        });
    };
    
    // Run preloading when idle and prefetch on intent
    runWhenIdle(preloadCriticalResources);
    // Note: IG feed now provided by SociableKIT embed
    runWhenIdle(() => {
        const igFeed = document.querySelector('.sk-instagram-feed');
        const fbPage = document.querySelector('.fb-page');
        if (!igFeed || !fbPage) return;
        const adjustHeight = () => {
            const h = Math.round(igFeed.getBoundingClientRect().height);
            if (h && h > 0) {
                fbPage.setAttribute('data-height', String(h));
                if (window.FB && FB.XFBML && typeof FB.XFBML.parse === 'function') {
                    // Re-render FB widget with new height
                    try { FB.XFBML.parse(fbPage.parentNode); } catch {}
                }
            }
        };
        // Initial attempt after widgets likely loaded
        setTimeout(adjustHeight, 2500);
        // Observe changes in IG feed to re-adjust when it finishes rendering
        const mo = new MutationObserver(() => setTimeout(adjustHeight, 300));
        mo.observe(igFeed, { childList: true, subtree: true });
        // Also re-adjust on resize
        window.addEventListener('resize', debounce(adjustHeight, 300));
    });
    runWhenIdle(() => {
        const isSameOrigin = (url) => {
            try { const u = new URL(url, location.href); return u.origin === location.origin; } catch { return false; }
        };
        const prefetch = (href) => {
            if (!href || !isSameOrigin(href)) return;
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = href;
            link.as = 'document';
            document.head.appendChild(link);
        };
        document.querySelectorAll('a[href]').forEach(a => {
            a.addEventListener('mouseenter', () => prefetch(a.getAttribute('href')));
            a.addEventListener('touchstart', () => prefetch(a.getAttribute('href')), { passive: true });
        });
    });
    
    // Enhanced form validation with better UX
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            // Real-time validation
            input.addEventListener('blur', () => {
                validateField(input);
            });
            
            input.addEventListener('input', debounce(() => {
                if (input.classList.contains('is-invalid')) {
                    validateField(input);
                }
            }, 300));
        });
        
        form.addEventListener('submit', (e) => {
            let isValid = true;
            
            inputs.forEach(input => {
                if (!validateField(input)) {
                    isValid = false;
                }
            });
            
            if (!isValid) {
                e.preventDefault();
                
                // Focus first invalid field
                const firstInvalid = form.querySelector('.is-invalid');
                if (firstInvalid) {
                    firstInvalid.focus();
                    firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        });
    });
    
    function validateField(field) {
        const value = field.value.trim();
        const isRequired = field.hasAttribute('required');
        const type = field.type;
        
        let isValid = true;
        let errorMessage = '';
        
        if (isRequired && !value) {
            isValid = false;
            errorMessage = 'This field is required';
        } else if (value) {
            switch (type) {
                case 'email':
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(value)) {
                        isValid = false;
                        errorMessage = 'Please enter a valid email address';
                    }
                    break;
                case 'tel':
                    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
                    if (!phoneRegex.test(value.replace(/\s/g, ''))) {
                        isValid = false;
                        errorMessage = 'Please enter a valid phone number';
                    }
                    break;
            }
        }
        
        // Update field state
        if (isValid) {
            field.classList.remove('is-invalid');
            field.classList.add('is-valid');
            removeErrorMessage(field);
        } else {
            field.classList.remove('is-valid');
            field.classList.add('is-invalid');
            showErrorMessage(field, errorMessage);
        }
        
        return isValid;
    }
    
    function showErrorMessage(field, message) {
        removeErrorMessage(field);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback';
        errorDiv.textContent = message;
        
        field.parentNode.appendChild(errorDiv);
    }
    
    function removeErrorMessage(field) {
        const existingError = field.parentNode.querySelector('.invalid-feedback');
        if (existingError) {
            existingError.remove();
        }
    }

    // ===== BACK TO TOP BUTTON =====
    (function setupBackToTop() {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'back-to-top';
        btn.setAttribute('aria-label', 'Back to top');
        btn.classList.add('scroll-to-top-btn', 'scroll-to-top-hidden');
        
        // Create arrow icon safely
        const arrowIcon = document.createElement('i');
        arrowIcon.className = 'bi bi-arrow-up';
        btn.appendChild(arrowIcon);
        document.body.appendChild(btn);
        const onScroll = throttle(() => {
            const y = window.pageYOffset || document.documentElement.scrollTop;
            if (y > 400) {
                btn.classList.add('scroll-to-top-visible');
                btn.classList.remove('scroll-to-top-hidden');
            } else {
                btn.classList.add('scroll-to-top-hidden');
                btn.classList.remove('scroll-to-top-visible');
            }
        }, 100);
        window.addEventListener('scroll', onScroll, { passive: true });
        btn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        });
    })();

    // ===== ANALYTICS: Enhanced Event Tracking =====
    document.addEventListener('click', (e) => {
        const a = e.target.closest('a');
        if (!a || typeof gtag === 'undefined') return;
        
        const href = a.getAttribute('href') || '';
        const linkText = a.textContent.trim() || '';
        const pagePath = window.location.pathname;
        
        // Track telephone clicks
        if (href.startsWith('tel:')) {
            gtag('event', 'contact_click', {
                'event_category': 'Engagement',
                'event_label': 'Phone',
                'method': 'telephone',
                'value': 1
            });
            return;
        }
        
        // Track email clicks
        if (href.startsWith('mailto:')) {
            gtag('event', 'contact_click', {
                'event_category': 'Engagement',
                'event_label': 'Email',
                'method': 'email',
                'value': 1
            });
            return;
        }
        
        // Track service card clicks (homepage)
        if (a.closest('.service-card')) {
            const serviceCard = a.closest('.service-card');
            const serviceTitle = serviceCard.querySelector('h3')?.textContent.trim() || 'Unknown Service';
            const serviceName = serviceTitle.toLowerCase().replace(/\s+/g, '_');
            
            gtag('event', 'select_content', {
                'content_type': 'service',
                'content_id': serviceName,
                'item_name': serviceTitle,
                'event_label': href,
                'value': 1
            });
            return;
        }
        
        // Track case study clicks (homepage)
        if (href.includes('case-study-')) {
            const caseStudyCard = a.closest('.card');
            const caseStudyTitle = caseStudyCard?.querySelector('.card-title')?.textContent.trim() || 'Unknown Case Study';
            const caseStudyId = href.split('/').pop().replace('.html', '');
            
            gtag('event', 'select_content', {
                'content_type': 'case_study',
                'content_id': caseStudyId,
                'item_name': caseStudyTitle,
                'event_label': href,
                'value': 1
            });
            return;
        }
        
        // Track primary CTA clicks (hero and final CTA sections)
        if (a.classList.contains('btn-gold') || a.classList.contains('btn-outline-gold')) {
            const isPrimaryCTA = a.classList.contains('btn-gold') && 
                                 (a.closest('.hero-cta') || a.closest('.cta-card') || a.closest('.cta-buttons'));
            const ctaText = linkText || 'CTA';
            const ctaLocation = a.closest('.hero-cta') ? 'hero' : 
                               a.closest('.cta-card') || a.closest('.cta-buttons') ? 'final_cta' : 
                               'other';
            
            if (isPrimaryCTA) {
                gtag('event', 'generate_lead', {
                    'event_category': 'Conversion',
                    'event_label': ctaText,
                    'location': ctaLocation,
                    'method': href.includes('contact') ? 'contact_form' : 'portfolio_view',
                    'value': 1
                });
            } else {
                // Secondary CTA tracking
                gtag('event', 'click', {
                    'event_category': 'Engagement',
                    'event_label': ctaText,
                    'location': ctaLocation,
                    'value': 1
                });
            }
            return;
        }
    });

    // ===== HERO VIDEO SAVEDATA / VISIBILITY HANDLING =====
    (function enhanceHeroVideo() {
        const video = document.querySelector('.hero-carousel video');
        if (!video) return;
        // Add WebM source ahead of MP4 if available
        const mp4 = video.querySelector('source[type="video/mp4"]');
        if (mp4) {
            const webmUrl = mp4.getAttribute('src').replace(/\.mp4$/i, '.webm');
            const existingWebm = video.querySelector('source[type="video/webm"]');
            if (!existingWebm) {
                const s = document.createElement('source');
                s.type = 'video/webm';
                s.src = webmUrl;
                video.insertBefore(s, mp4);
            }
        }
        const saveData = navigator.connection && navigator.connection.saveData;
        const shouldReduce = prefersReducedMotion || saveData;
        const pauseIfHidden = () => {
            if (document.hidden) { try { video.pause(); } catch {} } else { if (!shouldReduce) { try { video.play(); } catch {} } }
        };
        if (shouldReduce) { try { video.pause(); } catch {} }
        document.addEventListener('visibilitychange', pauseIfHidden);
        if ('IntersectionObserver' in window) {
            const obs = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !shouldReduce) { try { video.play(); } catch {} } else { try { video.pause(); } catch {} }
                });
            }, { threshold: 0.25 });
            obs.observe(video);
        }
    })();

    // ===== GALLERY CAROUSEL IMAGE ERROR HANDLING =====
    (function initGalleryImageErrorHandling() {
        const setupErrorHandling = () => {
            // Handle image loading errors in gallery carousels
            const galleryCarousels = document.querySelectorAll('.gallery-section .carousel img');
            galleryCarousels.forEach(img => {
                // Skip if already has error handler
                if (img.dataset.errorHandlerAdded) return;
                img.dataset.errorHandlerAdded = 'true';
                
                // Store original src for fallback
                const originalSrc = img.src || img.getAttribute('src');
                const originalSrcset = img.srcset || img.getAttribute('srcset');
                
                img.addEventListener('error', function() {
                    // If srcset failed, try falling back to base src without srcset
                    if (this.srcset && this.src !== originalSrc) {
                        this.srcset = '';
                        this.src = originalSrc;
                    } else if (this.src !== originalSrc) {
                        // Try original src
                        this.src = originalSrc;
                        if (originalSrcset) this.srcset = originalSrcset;
                    } else {
                        // If base image also fails, show placeholder
                        logger.warn('Gallery image failed to load:', originalSrc);
                        this.classList.add('d-none');
                        const placeholder = document.createElement('div');
                        placeholder.className = 'image-error-placeholder';
                        placeholder.textContent = 'Image unavailable';
                        this.parentElement.appendChild(placeholder);
                    }
                }, { once: true });
            });
        };
        
        // Run immediately and also after DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setupErrorHandling);
        } else {
            setupErrorHandling();
        }
        
        // Also run after a short delay to catch dynamically loaded images
        setTimeout(setupErrorHandling, 100);
    })();
    
    // Auto-update copyright year
    function updateCopyrightYear() {
        const currentYearSpan = document.getElementById('current-year');
        if (currentYearSpan) {
            currentYearSpan.textContent = new Date().getFullYear();
        }
    }
    
    // Update immediately and after partials load
    updateCopyrightYear();
    setTimeout(updateCopyrightYear, 500); // After partials load
    
    // ===== SUCCESS STORIES CAROUSEL =====
    (function initSuccessStoriesCarousel() {
        // Initialize all success stories carousels on the page
        // Match both "successStoriesCarouselTrack" (homepage) and "*SuccessStoriesCarouselTrack" (other pages)
        const tracks = document.querySelectorAll('[id$="SuccessStoriesCarouselTrack"], [id$="successStoriesCarouselTrack"]');
        
        tracks.forEach((track) => {
            const wrapper = track.closest('.success-stories-carousel-wrapper');
            if (!wrapper) return;
            
            const prevBtn = wrapper.querySelector('.success-stories-carousel-prev');
            const nextBtn = wrapper.querySelector('.success-stories-carousel-next');
            const cards = wrapper.querySelectorAll('.success-stories-carousel-card');
            const container = track.parentElement;
            
            if (!prevBtn || !nextBtn || cards.length === 0 || !container) return;
            
            initCarousel(track, prevBtn, nextBtn, cards, container);
        });
        
        function initCarousel(track, prevBtn, nextBtn, cards, container) {
            // On mobile, start at index 0 to prevent offset issues; on desktop, start at index 3 (celebration card)
            const isMobile = window.innerWidth <= 768;
            let currentIndex = isMobile ? 0 : 3; // Start on first card on mobile, celebration card on desktop
            const totalCards = cards.length;
            const gap = isMobile ? 0 : 30; // No gap on mobile (cards are 100% width), 30px gap on desktop
            
            // Initialize: set appropriate card as active
            function initializeCarousel() {
                cards.forEach((card, index) => {
                    card.classList.remove('active');
                    if (index === currentIndex) {
                        card.classList.add('active');
                    }
                });
                // Delay transform update to ensure layout is complete
                setTimeout(updateTransform, 100);
            }
            
            // Update positioning - separate contract for mobile vs desktop
            function updateTransform() {
                if (cards.length === 0) return;
                
                const isMobile = window.innerWidth <= 768;
                
                if (isMobile) {
                    // MOBILE CONTRACT: NO transform-based positioning
                    // Use scrollIntoView for natural flow navigation
                    const activeCard = cards[currentIndex];
                    if (activeCard) {
                        // Scroll active card into view using native scroll behavior
                        activeCard.scrollIntoView({
                            behavior: 'smooth',
                            block: 'nearest',
                            inline: 'start'
                        });
                    }
                    // Remove any transform - let natural flow handle positioning
                    track.style.transform = 'none';
                } else {
                    // DESKTOP CONTRACT: Transform-based centering is OK
                    const containerWidth = container.offsetWidth;
                    const cardWidth = cards[0].offsetWidth;
                    const offset = (containerWidth / 2) - (cardWidth / 2) - (currentIndex * (cardWidth + gap));
                    track.style.transform = `translateX(${offset}px)`;
                }
            }
            
            // Move to specific index (with wrapping)
            function moveToIndex(index) {
                // Normalize index to valid range using modulo (handles negative numbers correctly)
                currentIndex = ((index % totalCards) + totalCards) % totalCards;
                cards.forEach((card, i) => {
                    card.classList.toggle('active', i === currentIndex);
                });
                updateTransform();
            }
            
            // Navigation handlers with infinite loop
            prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                // Loop: prev from first card goes to last card
                moveToIndex(currentIndex - 1);
            });
            
            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                // Loop: next from last card goes to first card
                moveToIndex(currentIndex + 1);
            });
            
            // Card click handlers
            cards.forEach((card, index) => {
                card.addEventListener('click', (e) => {
                    // Prevent click if card is already active
                    if (card.classList.contains('active')) return;
                    // Prevent navigation if clicking on a link inside the card
                    if (e.target.closest('a')) return;
                    e.preventDefault();
                    e.stopPropagation();
                    moveToIndex(index);
                });
            });
            
            // Handle window resize
            let resizeTimer;
            const handleResize = () => {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(() => {
                    // On resize, adjust currentIndex if switching between mobile/desktop
                    const isMobileNow = window.innerWidth <= 768;
                    if (isMobileNow && currentIndex !== 0) {
                        // If switching to mobile, reset to first card
                        currentIndex = 0;
                        cards.forEach((card, index) => {
                            card.classList.toggle('active', index === 0);
                        });
                        // Mobile: remove transform, use natural flow
                        track.style.transform = 'none';
                        // Don't scroll into view - preserve user's scroll position
                        // The carousel will be in the correct position without forcing scroll
                    } else if (!isMobileNow && currentIndex === 0) {
                        // If switching to desktop, move to celebration card
                        currentIndex = 3;
                        cards.forEach((card, index) => {
                            card.classList.toggle('active', index === 3);
                        });
                    }
                    // Recalculate transform after resize
                    requestAnimationFrame(() => {
                        updateTransform();
                    });
                }, 250);
            };
            window.addEventListener('resize', handleResize);
            
            // Initialize on load - wait for layout to be ready
            const runInit = () => {
                // Use requestAnimationFrame to ensure layout is complete
                requestAnimationFrame(() => {
                    // On mobile, reset to first card (index 0) to prevent offset issues
                    const isMobile = window.innerWidth <= 768;
                    if (isMobile && currentIndex !== 0) {
                        currentIndex = 0;
                        cards.forEach((card, index) => {
                            card.classList.toggle('active', index === 0);
                        });
                        // Mobile: remove transform, use natural flow
                        track.style.transform = 'none';
                        // Don't scroll into view - preserve user's scroll position
                        // The carousel will be in the correct position without forcing scroll
                    }
                    // Small delay to ensure layout is settled before calculating transforms
                    setTimeout(() => {
                        initializeCarousel();
                        // Force a recalculation after a brief moment to catch any layout shifts
                        requestAnimationFrame(() => {
                            updateTransform();
                        });
                    }, 150);
                });
            };
            
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', runInit);
            } else {
                runInit();
            }
        }
    })();
    
    // ===== CASE STUDY PAGE ENHANCEMENTS =====
    // Section-based scroll reveals for case study pages
    const initCaseStudyReveals = () => {
        if (!document.body.classList.contains('case-study')) return;
        
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;
        
        const sections = document.querySelectorAll('.case-study-section, body.case-study .section-main > .container > section');
        
        if (sections.length === 0) return;
        
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -10% 0px',
            threshold: 0.1
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        sections.forEach(section => {
            section.classList.add('case-study-section');
            observer.observe(section);
        });
    };
    
    // Optimized image loading for case study pages
    const initCaseStudyImageLoading = () => {
        if (!document.body.classList.contains('case-study')) return;
        
        const images = document.querySelectorAll('.case-study-image, body.case-study img[loading="lazy"]');
        
        if (images.length === 0) return;
        
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    // Load image if it has a data-src attribute
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    
                    // Add loaded class for fade-in effect
                    img.addEventListener('load', () => {
                        img.classList.add('loaded');
                    }, { once: true });
                    
                    // If image is already loaded (cached), add loaded class immediately
                    if (img.complete && img.naturalHeight !== 0) {
                        img.classList.add('loaded');
                    }
                    
                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px'
        });
        
        images.forEach(img => {
            imageObserver.observe(img);
        });
    };
    
    // Initialize case study enhancements
    if (document.body.classList.contains('case-study')) {
        initCaseStudyReveals();
        initCaseStudyImageLoading();
    }
    
    // ===== ANIMATION SYSTEM INITIALIZATION =====
    // Initialize animations after partials are loaded and DOM is ready
    if (typeof window.initAnimations === 'function') {
        setTimeout(() => {
            window.initAnimations();
        }, 100);
    } else {
        // Fallback: import animations module if available
        import('./animations.js').then((module) => {
            if (module && module.initAnimations) {
                module.initAnimations();
            }
        }).catch(() => {
            // Animations module not available - graceful degradation
            logger.debug('Animation system not available');
        });
    }

    // ===== STICKY MOBILE CTA =====
    const initStickyMobileCTA = () => {
        const stickyCTA = document.getElementById('stickyMobileCTA');
        if (!stickyCTA) return;

        // Show sticky CTA after user scrolls past hero/first section
        const showStickyCTA = () => {
            const scrollY = window.scrollY || window.pageYOffset;
            const threshold = 400; // Show after scrolling 400px
            
            if (scrollY > threshold) {
                stickyCTA.classList.add('show');
            } else {
                stickyCTA.classList.remove('show');
            }
        };

        // Throttle scroll events for performance
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    showStickyCTA();
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });

        // Initial check
        showStickyCTA();
    };

    // ===== ANCHOR NAVIGATION =====
    const initAnchorNavigation = () => {
        const anchorNav = document.querySelector('.anchor-nav');
        if (!anchorNav) return;

        const links = anchorNav.querySelectorAll('.anchor-nav-link');
        const sections = Array.from(links).map(link => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                return document.querySelector(href);
            }
            return null;
        }).filter(Boolean);

        if (sections.length === 0) return;

        // Update active link on scroll
        const updateActiveLink = () => {
            const scrollY = window.scrollY || window.pageYOffset;
            const offset = 150; // Offset for sticky nav

            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop - offset;
                if (scrollY >= sectionTop) {
                    current = '#' + section.id;
                }
            });

            links.forEach(link => {
                if (link.getAttribute('href') === current) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
        };

        // Smooth scroll for anchor links
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href && href.startsWith('#')) {
                    const target = document.querySelector(href);
                    if (target) {
                        e.preventDefault();
                        // Get navbar height dynamically or use fixed offset
                        const navbar = document.querySelector('.navbar.fixed-top, .navbar');
                        const navbarHeight = navbar ? navbar.offsetHeight : 100;
                        const anchorNav = document.querySelector('.anchor-nav');
                        const anchorNavHeight = anchorNav ? anchorNav.offsetHeight : 0;
                        // Total offset: navbar + anchor nav + some padding
                        const offset = navbarHeight + anchorNavHeight + 20;
                        
                        // Get the target's position relative to the document
                        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
                        
                        window.scrollTo({
                            top: Math.max(0, targetPosition), // Ensure we don't scroll to negative position
                            behavior: 'smooth'
                        });
                    }
                }
            });
        });

        // Throttle scroll events
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    updateActiveLink();
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });

        // Initial update
        updateActiveLink();
    };

    // Initialize sticky CTA and anchor navigation
    initStickyMobileCTA();
    
    // Initialize anchor navigation after a short delay to ensure DOM is ready
    setTimeout(() => {
        initAnchorNavigation();
    }, 100);
    
    // Initialize mobile menu accessibility enhancements
    initMobileMenuAccessibility();

    // Ensure page starts at top on window load (especially for capabilities page)
    window.addEventListener('load', function() {
        if (!userHasInteracted) {
            // Clear any hash that might cause scrolling
            if (window.location.hash) {
                history.replaceState(null, null, window.location.pathname + window.location.search);
            }
            // Force scroll to top
            requestAnimationFrame(() => {
                window.scrollTo(0, 0);
                document.documentElement.scrollTop = 0;
                document.body.scrollTop = 0;
            });
        }
    }, { once: true });
    
    // ===== MOBILE MENU ACCESSIBILITY ENHANCEMENTS =====
    function initMobileMenuAccessibility() {
        const navbarToggler = document.querySelector('.navbar-toggler');
        const navbarCollapse = document.querySelector('.navbar-collapse');
        const navLinks = document.querySelectorAll('.navbar-nav .nav-link, .dropdown-item');
        
        if (!navbarToggler || !navbarCollapse) return;
        
        // Close menu on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navbarCollapse.classList.contains('show')) {
                navbarToggler.click();
                navbarToggler.focus();
            }
        });
        
        // Trap focus within mobile menu when open
        navLinks.forEach(link => {
            link.addEventListener('keydown', (e) => {
                if (e.key === 'Tab' && window.innerWidth < 992) {
                    const linksArray = Array.from(navLinks);
                    const currentIndex = linksArray.indexOf(link);
                    
                    if (e.shiftKey && currentIndex === 0) {
                        e.preventDefault();
                        linksArray[linksArray.length - 1].focus();
                    } else if (!e.shiftKey && currentIndex === linksArray.length - 1) {
                        e.preventDefault();
                        linksArray[0].focus();
                    }
                }
            });
        });
    }

    // ===== FOOTER ACCORDION (MOBILE) =====
    // Note: This will be called after footer is loaded via loadPartials
    function initFooterAccordion() {
        const accordionButtons = document.querySelectorAll('.footer-accordion-button');
        
        console.log('Footer Accordion Init - Found buttons:', accordionButtons.length);
        
        if (accordionButtons.length === 0) {
            console.warn('Footer Accordion: No buttons found!');
            return;
        }
        
        // Function to handle desktop/mobile toggle
        function handleFooterAccordionVisibility() {
            const isMobile = window.innerWidth <= 768;
            
            accordionButtons.forEach(button => {
                if (isMobile) {
                    // Show buttons on mobile - ensure they're visible
                    button.style.display = 'flex';
                    button.style.visibility = 'visible';
                    button.style.opacity = '1';
                    button.style.height = 'auto';
                    button.style.width = '100%';
                    button.style.padding = '14px 16px';
                    button.style.margin = '0 0 8px 0';
                    button.style.pointerEvents = 'auto';
                    // Ensure text is visible with direct colors
                    // Styles are handled by .footer-accordion-button-visible CSS class
                    const chevron = button.querySelector('.footer-accordion-chevron');
                    if (chevron && !chevron.hasAttribute('data-icon-set')) {
                        chevron.setAttribute('data-icon-set', 'true');
                    }
                } else {
                    // Hide buttons on desktop
                    button.classList.add('footer-accordion-button-hidden');
                }
            });
            
            // Also hide/show chevrons
            const chevrons = document.querySelectorAll('.footer-accordion-chevron');
            chevrons.forEach(chevron => {
                if (isMobile) {
                    chevron.classList.remove('footer-accordion-chevron-hidden');
                    chevron.classList.add('d-inline-block');
                } else {
                    chevron.classList.add('footer-accordion-chevron-hidden');
                    chevron.classList.remove('d-inline-block');
                }
            });
        }
        
        // Initial check
        handleFooterAccordionVisibility();
        
        // Update on resize
        let resizeTimeout;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(handleFooterAccordionVisibility, 100);
        });
        
        // Add click handlers for accordion functionality
        accordionButtons.forEach((button, index) => {
            console.log(`Footer Accordion: Adding click handler to button ${index}`);
            button.addEventListener('click', function(e) {
                console.log('Footer Accordion: Button clicked!', this);
                // Prevent event bubbling and default behavior
                e.preventDefault();
                e.stopPropagation();
                
                // Only work on mobile
                const isMobile = window.innerWidth <= 768;
                console.log('Footer Accordion: Is mobile?', isMobile, 'Window width:', window.innerWidth);
                if (!isMobile) {
                    console.log('Footer Accordion: Not mobile, returning');
                    return;
                }
                
                const column = this.closest('.footer-accordion-column');
                if (!column) {
                    console.warn('Footer accordion: Could not find parent column');
                    return;
                }
                
                console.log('Footer Accordion: Found column', column);
                const isExpanded = column.classList.contains('expanded');
                console.log('Footer Accordion: Is expanded?', isExpanded);
                
                // Close all other accordions
                document.querySelectorAll('.footer-accordion-column').forEach(col => {
                    if (col !== column) {
                        col.classList.remove('expanded');
                        const btn = col.querySelector('.footer-accordion-button');
                        if (btn) {
                            btn.setAttribute('aria-expanded', 'false');
                        }
                        const content = col.querySelector('.footer-accordion-content');
                        if (content) {
                            content.classList.add('footer-accordion-content-collapsed');
                        }
                        // Reset button colors and ensure text is visible (btn already declared above)
                        if (btn) {
                            btn.classList.add('footer-accordion-button-collapsed');
                            btn.style.visibility = 'visible';
                            // Styles are handled by .footer-accordion-button-collapsed CSS class
                            const chevron = btn.querySelector('.footer-accordion-chevron');
                            if (chevron) {
                                chevron.classList.add('footer-accordion-chevron-reset');
                                if (!chevron.hasAttribute('data-icon-set')) {
                                    chevron.setAttribute('data-icon-set', 'true');
                                }
                            }
                        }
                    }
                });
                
                // Toggle current accordion
                const content = column.querySelector('.footer-accordion-content');
                if (isExpanded) {
                    console.log('Footer Accordion: Closing accordion, resetting to gold background');
                    // Remove expanded class FIRST to prevent CSS from overriding
                    column.classList.remove('expanded');
                    this.setAttribute('aria-expanded', 'false');
                    if (content) {
                        content.classList.add('footer-accordion-content-collapsed');
                    }
                    // Reset button to collapsed state - ensure text is visible
                    // Use CSS classes instead of inline styles for CSP compliance
                    this.classList.add('footer-accordion-button-collapsed');
                    console.log('Footer Accordion: Resetting button to collapsed - setting background to gold, text to charcoal');
                        span.style.fontFamily = "'Dancing Script', cursive";
                        span.style.fontSize = '18px';
                    }
                    const chevron = this.querySelector('.footer-accordion-chevron');
                    if (chevron) {
                        chevron.classList.add('footer-accordion-chevron-reset');
                        if (!chevron.hasAttribute('data-icon-set')) {
                            chevron.setAttribute('data-icon-set', 'true');
                        }
                    }
                    // Force a reflow to ensure styles are applied
                    void this.offsetHeight;
                } else {
                    column.classList.add('expanded');
                    this.setAttribute('aria-expanded', 'true');
                    if (content) {
                        // Force show content with explicit styles
                        content.classList.add('footer-accordion-content-expanded');
                        content.classList.remove('footer-accordion-content-collapsed');
                        // Ensure nav container is visible
                        const nav = content.querySelector('.nav');
                        if (nav) {
                            nav.classList.add('footer-accordion-nav-visible');
                        }
                        // Ensure nav links are visible
                        const navLinks = content.querySelectorAll('.nav-link');
                        navLinks.forEach(link => {
                            link.classList.add('footer-accordion-nav-link-visible');
                            // Styles handled by .footer-accordion-nav-link-visible CSS class
                        });
                        // Ensure nav items are visible
                        const navItems = content.querySelectorAll('.nav-item');
                        navItems.forEach(item => {
                            item.classList.add('footer-accordion-nav-item-visible');
                        });
                    }
                    // Update button colors for expanded state - use CSS class
                    this.classList.add('footer-accordion-button-expanded');
                    this.classList.remove('footer-accordion-button-collapsed');
                    // Styles handled by .footer-accordion-button-expanded CSS class
                        // Ensure the icon content is set (Bootstrap Icons use ::before)
                        if (!chevron.hasAttribute('data-icon-set')) {
                            chevron.setAttribute('data-icon-set', 'true');
                        }
                    }
                }
            });
        });
    }
    
    // Also try to initialize immediately in case footer already exists
    console.log('Document ready state:', document.readyState);
    // Use window.initFooterAccordion from footer-accordion.js if available
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        console.log('Trying immediate accordion init...');
        setTimeout(() => {
            console.log('Calling window.initFooterAccordion (immediate)...');
            if (typeof window.initFooterAccordion === 'function') {
                window.initFooterAccordion();
            }
        }, 500);
    }
    
    // Also try on window load as final fallback
    window.addEventListener('load', () => {
        console.log('Window loaded, trying accordion init...');
        setTimeout(() => {
            if (typeof window.initFooterAccordion === 'function') {
                window.initFooterAccordion();
            }
        }, 1000);
    });
});
