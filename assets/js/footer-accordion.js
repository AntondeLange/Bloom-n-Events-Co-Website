/**
 * Footer Accordion Enhancement
 * 
 * Enhances Bootstrap collapse functionality for footer accordions.
 * Uses CSS classes instead of inline styles to comply with CSP.
 */

(function() {
    'use strict';
    
    function initFooterAccordion() {
        const accordionButtons = document.querySelectorAll('.footer-accordion-button[data-bs-toggle="collapse"]');
        
        if (accordionButtons.length === 0) {
            return; // No accordion buttons found
        }
        
        // Handle Bootstrap collapse events to update chevron rotation and classes
        accordionButtons.forEach(button => {
            const targetId = button.getAttribute('data-bs-target');
            if (!targetId) return;
            
            const target = document.querySelector(targetId);
            if (!target) return;
            
            // Listen for Bootstrap collapse events
            target.addEventListener('show.bs.collapse', function() {
                button.setAttribute('aria-expanded', 'true');
                const chevron = button.querySelector('.footer-accordion-chevron');
                if (chevron) {
                    chevron.classList.add('rotated');
                }
                // Add expanded class to column for styling
                const column = button.closest('.footer-accordion-column');
                if (column) {
                    column.classList.add('expanded');
                }
            });
            
            target.addEventListener('hide.bs.collapse', function() {
                button.setAttribute('aria-expanded', 'false');
                const chevron = button.querySelector('.footer-accordion-chevron');
                if (chevron) {
                    chevron.classList.remove('rotated');
                }
                // Remove expanded class
                const column = button.closest('.footer-accordion-column');
                if (column) {
                    column.classList.remove('expanded');
                }
            });
        });
        
        // Handle mobile/desktop visibility using CSS classes
        function handleFooterAccordionVisibility() {
            const isMobile = window.innerWidth <= 768;
            const footer = document.querySelector('footer');
            if (!footer) return;
            
            if (isMobile) {
                footer.classList.add('mobile-view');
                footer.classList.remove('desktop-view');
            } else {
                footer.classList.add('desktop-view');
                footer.classList.remove('mobile-view');
            }
        }
        
        // Initial check
        handleFooterAccordionVisibility();
        
        // Update on resize
        let resizeTimeout;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(handleFooterAccordionVisibility, 100);
        });
    }
    
    // Export function for main.js to call after footer injection
    // main.js handles initialization for pages with partials (home page, etc.)
    // This auto-initialization is only for pages that don't use partials and have footer in HTML
    window.initFooterAccordion = initFooterAccordion;
    
    // Guard to prevent double initialization
    let isInitialized = false;
    const originalInit = initFooterAccordion;
    window.initFooterAccordion = function() {
        if (isInitialized) {
            return; // Already initialized, skip
        }
        isInitialized = true;
        originalInit();
    };
    
    // Only auto-initialize if footer already exists in HTML (for pages that don't use partials)
    // Check after a delay to allow main.js to inject footer first on pages with partials
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            // Wait longer to ensure main.js has had a chance to inject footer on pages with partials
            setTimeout(function() {
                const footer = document.querySelector('footer');
                if (footer && footer.querySelector('.footer-accordion-button') && !isInitialized) {
                    // Footer exists in HTML (not injected by main.js) and not yet initialized
                    window.initFooterAccordion();
                }
            }, 1000); // Increased delay to ensure main.js initialization completes first
        });
    } else {
        // DOM already loaded - wait longer to ensure main.js initialization completes
        setTimeout(function() {
            const footer = document.querySelector('footer');
            if (footer && footer.querySelector('.footer-accordion-button') && !isInitialized) {
                // Footer exists in HTML (not injected by main.js) and not yet initialized
                window.initFooterAccordion();
            }
        }, 1000); // Increased delay to ensure main.js initialization completes first
    }
})();
