// Bloom'n Events Co - Consolidated Scripts
// Performance optimized with lazy loading and efficient event handling

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

// Single DOMContentLoaded event listener for all functionality
document.addEventListener('DOMContentLoaded', function() {
    // ===== PARTIALS INJECTION (Navbar/Footer) =====
    const loadPartials = async () => {
        const isHome = document.body.classList.contains('home');
        const navbarPartial = isHome ? 'partials/navbar-home.html' : 'partials/navbar-default.html';
        const footerPartial = 'partials/footer.html';
        try {
            const [navHtml, footerHtml] = await Promise.all([
                fetch(navbarPartial, { cache: 'no-cache' }).then(r => r.ok ? r.text() : ''),
                fetch(footerPartial, { cache: 'no-cache' }).then(r => r.ok ? r.text() : '')
            ]);
            if (navHtml) {
                const existingNav = document.querySelector('nav.navbar');
                if (existingNav) existingNav.outerHTML = navHtml;
            }
            if (footerHtml) {
                const existingFooter = document.querySelector('footer');
                if (existingFooter) existingFooter.outerHTML = footerHtml;
            }
        } catch (e) {
            console.warn('Partial injection failed', e);
        }
        // Re-initialize interactive components after injection
        if (typeof window.setupDropdowns === 'function') window.setupDropdowns();
        if (document.body.classList.contains('home') && typeof window.setupHomeNavbar === 'function') window.setupHomeNavbar();
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
            body.classList.remove('navbar-top');
            portfolioDropdown = navbar.querySelector('.dropdown') || navbar.querySelector('.dropup');
            if (portfolioDropdown) {
                portfolioDropdown.classList.remove('dropdown');
                portfolioDropdown.classList.add('dropup');
            }
        };
        initializeNavbar();
        const handleScroll = throttle(function() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            if (scrollTop <= 100) {
                if (!navbar.classList.contains('fixed-bottom')) {
                    navbar.classList.remove('fixed-top');
                    navbar.classList.add('fixed-bottom');
                    body.classList.remove('navbar-top');
                    if (portfolioDropdown) {
                        portfolioDropdown.classList.remove('dropdown');
                        portfolioDropdown.classList.add('dropup');
                    }
                }
            } else {
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
            lastScrollTop = scrollTop;
        }, 16);
        window.addEventListener('scroll', handleScroll, { passive: true });
        // Run once to set initial state after load/injection
        handleScroll();

        // Robust fallback using IntersectionObserver on a top sentinel
        if ('IntersectionObserver' in window) {
            let sentinel = document.getElementById('navbar-sentinel');
            if (!sentinel) {
                sentinel = document.createElement('div');
                sentinel.id = 'navbar-sentinel';
                sentinel.style.position = 'absolute';
                sentinel.style.top = '0';
                sentinel.style.left = '0';
                sentinel.style.width = '1px';
                sentinel.style.height = '1px';
                sentinel.style.pointerEvents = 'none';
                document.body.prepend(sentinel);
            }
            const io = new IntersectionObserver((entries) => {
                const entry = entries[0];
                if (entry && entry.isIntersecting) {
                    // near top
                    navbar.classList.remove('fixed-top');
                    navbar.classList.add('fixed-bottom');
                    body.classList.remove('navbar-top');
                    if (portfolioDropdown) {
                        portfolioDropdown.classList.remove('dropdown');
                        portfolioDropdown.classList.add('dropup');
                    }
                } else {
                    // scrolled away from top
                    navbar.classList.remove('fixed-bottom');
                    navbar.classList.add('fixed-top');
                    body.classList.add('navbar-top');
                    if (portfolioDropdown) {
                        portfolioDropdown.classList.remove('dropup');
                        portfolioDropdown.classList.add('dropdown');
                    }
                }
            }, { rootMargin: '-100px 0px 0px 0px', threshold: 0 });
            io.observe(sentinel);
        }
        const mobileMenu = navbar.querySelector('.navbar-collapse');
        if (mobileMenu) {
            mobileMenu.addEventListener('click', function(e) { e.stopPropagation(); });
        }
    }
    window.setupHomeNavbar = setupHomeNavbar;
    if (document.body.classList.contains('home')) {
        // Ensure init after partials and after window load to avoid early runs
        if (document.readyState === 'complete') {
            setupHomeNavbar();
        } else {
            window.addEventListener('load', () => setTimeout(setupHomeNavbar, 0), { once: true });
        }
    }
    
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
                    console.warn('Failed to load image:', sourceToLoad || srcsetToLoad || '(unknown)');
                    observer.unobserve(img);
                };
                newImg.src = sourceToLoad || img.currentSrc || img.src;
            });
        }, {
            rootMargin: '200px 0px',
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
                        iframe.style.display = 'block';
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
                        iframe.style.display = 'block';
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

    // ===== REVEAL-ON-SCROLL (respects reduced motion) =====
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion && 'IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { rootMargin: '100px 0px', threshold: 0.1 });
        document.querySelectorAll('.section-main, .card, .social-card, .testimonial-item, [data-reveal]')
            .forEach(el => {
                el.classList.add('will-reveal');
                revealObserver.observe(el);
            });
    }
    
    // ===== ENHANCED ACCESSIBILITY FEATURES =====
    // Add skip link functionality
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'skip-link sr-only sr-only-focusable';
    skipLink.style.cssText = 'position: absolute; top: -40px; left: 6px; z-index: 1000; background: var(--coreCharcoal); color: var(--coreGold); padding: 8px; text-decoration: none; border-radius: 4px; transition: top 0.3s ease;';
    
    // Enhanced skip link behavior
    skipLink.addEventListener('focus', () => {
        skipLink.style.top = '6px';
    });
    
    skipLink.addEventListener('blur', () => {
        skipLink.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
    
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
        const toggles = document.querySelectorAll('.navbar .dropdown-toggle');
        if (toggles.length === 0) return;
        if (window.bootstrap && bootstrap.Dropdown) {
            toggles.forEach(t => {
                try { new bootstrap.Dropdown(t); } catch {}
            });
        } else {
            // Fallback: minimal manual toggle
            const closeAll = () => {
                document.querySelectorAll('.dropdown-menu.show').forEach(m => m.classList.remove('show'));
                document.querySelectorAll('.dropdown.show, .dropup.show').forEach(d => d.classList.remove('show'));
            };
            toggles.forEach(t => {
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
            document.addEventListener('click', closeAll);
        }
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
        candidates.forEach(img => {
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
            // Only inject if a representative .webp actually loads to avoid broken images
            const probe = new Image();
            probe.onload = () => {
                const picture = document.createElement('picture');
                const source = document.createElement('source');
                source.type = 'image/webp';
                source.setAttribute('srcset', webpSrcset);
                if (sizes) source.setAttribute('sizes', sizes);
                img.parentNode.insertBefore(picture, img);
                picture.appendChild(source);
                picture.appendChild(img);
            };
            probe.onerror = () => {
                // Skip injection; keep original jpg/png so image renders
            };
            if (isSupported && testUrl) {
                probe.src = testUrl;
            }
        });
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
        wrapper.style.display = 'block';
        wrapper.style.textDecoration = 'none';
        img.parentNode.insertBefore(wrapper, img);
        wrapper.appendChild(img);
        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'fullscreen-modal';
        modal.innerHTML = `
            <div class="modal-content" role="dialog" aria-modal="true">
                <a href="#" class="close-btn" aria-label="Close">&times;</a>
                <img src="${img.src}" alt="${img.alt} - Fullscreen">
            </div>
        `;
        document.body.appendChild(modal);
        const closeBtn = modal.querySelector('.close-btn');
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
    
    if (chatbotWidget) {
        let isOpen = false;
        let hasInteracted = false;
        let lastFocusedBeforeOpen = null;
        
        // Show notification after 3 seconds if user hasn't interacted
        // Use requestIdleCallback for better performance
        runWhenIdle(() => {
            setTimeout(() => {
                if (!hasInteracted) {
                    chatbotNotification.style.display = 'flex';
                    
                    // Track chatbot notification display
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'chatbot_notification_shown', {
                            event_category: 'Engagement',
                            event_label: 'Auto Notification',
                            value: 1
                        });
                    }
                }
            }, 3000);
        });
        
        // Toggle chatbot with analytics tracking
        chatbotToggle.addEventListener('click', () => {
            isOpen = !isOpen;
            if (isOpen) {
                chatbotContainer.classList.add('show');
                chatbotInput.focus();
                chatbotNotification.style.display = 'none';
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
        function sendMessage() {
            const message = chatbotInput.value.trim();
            if (!message) return;
            
            // Add user message
            addMessage(message, 'user');
            chatbotInput.value = '';
            
            // Show typing indicator
            showTyping();
            
            // Get bot response after delay
            setTimeout(() => {
                hideTyping();
                const response = getBotResponse(message);
                addMessage(response.text, 'bot', response.quickReplies);
            }, 1000 + Math.random() * 1000);
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
                console.log('Quick reply clicked:', message, 'Action:', action); // Debug log
                
                // Check if this is a navigation action
                if (action && action.startsWith('navigate:')) {
                    const targetPage = action.replace('navigate:', '');
                    console.log('Navigating to:', targetPage);
                    
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
            avatar.innerHTML = sender === 'bot' ? '<i class="bi bi-flower1"></i>' : '<i class="bi bi-person"></i>';
            
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
                    button.style.cursor = 'pointer';
                    
                    // Add click event directly to each button as backup
                    button.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Direct button click:', reply.message, 'Action:', reply.action);
                        
                        // Check if this is a navigation action
                        if (reply.action && reply.action.startsWith('navigate:')) {
                            const targetPage = reply.action.replace('navigate:', '');
                            console.log('Navigating to:', targetPage);
                            
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
            chatbotTyping.style.display = 'flex';
            chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        }
        
        // Hide typing indicator
        function hideTyping() {
            chatbotTyping.style.display = 'none';
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
        
        // Debug function - you can call this in browser console to test
        window.testChatbot = function(message) {
            console.log('Testing chatbot with message:', message);
            const response = getBotResponse(message);
            console.log('Bot response:', response);
            addMessage(response.text, 'bot', response.quickReplies);
        };
        
        // Add a test button for debugging (remove in production)
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            const testButton = document.createElement('button');
            testButton.textContent = 'Test Chatbot';
            testButton.style.position = 'fixed';
            testButton.style.top = '10px';
            testButton.style.right = '10px';
            testButton.style.zIndex = '10001';
            testButton.style.padding = '10px';
            testButton.style.background = 'red';
            testButton.style.color = 'white';
            testButton.style.border = 'none';
            testButton.style.borderRadius = '5px';
            testButton.onclick = () => {
                addMessage('Test message', 'user');
                setTimeout(() => {
                    const response = getBotResponse('Tell me about your event planning services');
                    addMessage(response.text, 'bot', response.quickReplies);
                }, 1000);
            };
            document.body.appendChild(testButton);
        }
    }
    
    // ===== ERROR HANDLING AND PERFORMANCE MONITORING =====
    
    // Global error handler
    window.addEventListener('error', (e) => {
        console.error('JavaScript Error:', e.error);
        
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
        console.error('Unhandled Promise Rejection:', e.reason);
        
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
                console.log('Service Worker registration failed:', error);
            });
        });
    }
    
    // Preload critical resources
    const preloadCriticalResources = () => {
        const criticalImages = [
            'images/logo-wht.png',
            'images/logo-blk-long.png'
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
        btn.style.cssText = 'position:fixed;right:16px;bottom:16px;z-index:1000;display:none;border:none;border-radius:999px;padding:10px 12px;background:var(--coreGold);color:#000;box-shadow:0 2px 8px rgba(0,0,0,.2);cursor:pointer;';
        btn.innerHTML = '<i class="bi bi-arrow-up"></i>';
        document.body.appendChild(btn);
        const onScroll = throttle(() => {
            const y = window.pageYOffset || document.documentElement.scrollTop;
            btn.style.display = y > 400 ? 'block' : 'none';
        }, 100);
        window.addEventListener('scroll', onScroll, { passive: true });
        btn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        });
    })();

    // ===== ANALYTICS: CTA, TEL, MAILTO =====
    document.addEventListener('click', (e) => {
        const a = e.target.closest('a');
        if (!a) return;
        const href = a.getAttribute('href') || '';
        if (typeof gtag === 'undefined') return;
        if (href.startsWith('tel:')) {
            gtag('event', 'click_tel', { event_category: 'Engagement', event_label: href });
        } else if (href.startsWith('mailto:')) {
            gtag('event', 'click_mailto', { event_category: 'Engagement', event_label: href });
        } else if (a.classList.contains('btn') || a.classList.contains('btn-gold')) {
            gtag('event', 'click_cta', { event_category: 'Engagement', event_label: href });
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

    // ===== HERO LOGO ANIMATION (Lottie) =====
    (function initHeroLogoAnimation() {
        const container = document.getElementById('logoAnimation');
        if (!container) return;
        const animationPath = container.getAttribute('data-src') || 'animations/BloomnLogoAnimation.json';
        const iframePath = container.getAttribute('data-iframe') || 'animations/BloomnLogoAnimation/index.html';
        // Lazy-load lottie only on home page and only if JSON exists
        const loadLottie = () => {
            const s = document.createElement('script');
            s.src = 'https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js';
            s.defer = true;
            s.onload = () => {
                try {
                    // Probe animation JSON before loading to avoid console noise
                    fetch(animationPath, { cache: 'no-cache' })
                        .then(r => r.ok ? r.json() : Promise.reject(new Error('Animation JSON not found')))
                        .then(() => {
                            // Load animation
                            const anim = window.lottie.loadAnimation({
                                container,
                                renderer: 'svg',
                                loop: true,
                                autoplay: true,
                                path: animationPath,
                                rendererSettings: { preserveAspectRatio: 'xMidYMid meet' }
                            });
                            // Respect reduced motion and page visibility
                            const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                            if (prefersReducedMotion) { try { anim.pause(); } catch {} }
                            document.addEventListener('visibilitychange', () => {
                                if (document.hidden) { try { anim.pause(); } catch {} }
                                else if (!prefersReducedMotion) { try { anim.play(); } catch {} }
                            });
                            // Pause/play based on visibility in viewport
                            if ('IntersectionObserver' in window) {
                                const obs = new IntersectionObserver((entries) => {
                                    entries.forEach(entry => {
                                        if (entry.isIntersecting && !prefersReducedMotion) { try { anim.play(); } catch {} }
                                        else { try { anim.pause(); } catch {} }
                                    });
                                }, { threshold: 0.1 });
                                obs.observe(container);
                            }
                        })
                        .catch(() => {
                            // Fallback: try iframe-based animation project
                            if (iframePath) {
                                fetch(iframePath, { method: 'HEAD', cache: 'no-cache' })
                                    .then(r => {
                                        if (!r.ok) throw new Error('No iframe animation');
                                        const iframe = document.createElement('iframe');
                                        iframe.src = iframePath;
                                        iframe.title = 'Bloomn Logo Animation';
                                        iframe.setAttribute('aria-hidden', 'true');
                                        iframe.style.border = '0';
                                        iframe.style.background = 'transparent';
                                        iframe.style.width = '100%';
                                        iframe.style.height = '100%';
                                        // Ensure pointer events don't block carousel
                                        iframe.style.pointerEvents = 'none';
                                        // Clear container and insert iframe
                                        container.innerHTML = '';
                                        container.appendChild(iframe);
                                    })
                                    .catch(() => {
                                        // leave empty
                                    });
                            }
                        });
                } catch { /* noop */ }
            };
            document.body.appendChild(s);
        };
        // Defer to idle or after load
        if (document.readyState === 'complete') {
            runWhenIdle(loadLottie);
        } else {
            window.addEventListener('load', () => runWhenIdle(loadLottie), { once: true });
        }
    })();
});
