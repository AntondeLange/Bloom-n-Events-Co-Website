// Bloom'n Events Co - Consolidated Scripts

// Single DOMContentLoaded event listener for all functionality
document.addEventListener('DOMContentLoaded', function() {
    // ===== NAVBAR FUNCTIONALITY =====
    const navbar = document.getElementById('homeNavbar');
    if (navbar) {
        const body = document.body;
        const portfolioDropdown = navbar.querySelector('.dropdown');
        let lastScrollTop = 0;
        
        // Dynamic navbar behaviour for home page with dropdown direction switching
        window.addEventListener('scroll', function() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            // Check if we're near the top of the page
            if (scrollTop <= 100) {
                // At the top - switch to fixed-bottom (dropup behaviour)
                navbar.classList.remove('fixed-top');
                navbar.classList.add('fixed-bottom');
                body.classList.remove('navbar-top');
                
                // Switch to dropup (menu opens upward) when navbar is at bottom
                if (portfolioDropdown) {
                    portfolioDropdown.classList.remove('dropdown');
                    portfolioDropdown.classList.add('dropup');
                }
            } else {
                // Away from top - switch to fixed-top (dropdown behaviour)
                navbar.classList.remove('fixed-bottom');
                navbar.classList.add('fixed-top');
                body.classList.add('navbar-top');
                
                // Switch to dropdown (menu opens downward) when navbar is at top
                if (portfolioDropdown) {
                    portfolioDropdown.classList.remove('dropup');
                    portfolioDropdown.classList.add('dropdown');
                }
            }
            
            lastScrollTop = scrollTop;
        });
        
        // Mobile menu click prevention
        const mobileMenu = navbar.querySelector('.navbar-collapse');
        if (mobileMenu) {
            mobileMenu.addEventListener('click', function(e) {
                e.stopPropagation();
            });
        }
    }
    
    // ===== FORM VALIDATION =====
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const requiredFields = form.querySelectorAll('[required]');
            let isValid = true;
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.classList.add('is-invalid');
                } else {
                    field.classList.remove('is-invalid');
                }
            });
            
            if (!isValid) {
                e.preventDefault();
            }
        });
    });
    
    // ===== IMAGE LAZY LOADING =====
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => imageObserver.observe(img));
    }
    
    // ===== ACCESSIBILITY ENHANCEMENTS =====
    // Add skip link functionality
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'skip-link sr-only sr-only-focusable';
    skipLink.style.cssText = 'position: absolute; top: -40px; left: 6px; z-index: 1000; background: var(--coreCharcoal); color: var(--coreGold); padding: 8px; text-decoration: none; border-radius: 4px;';
    
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Add focus styles for keyboard navigation
    const focusableElements = document.querySelectorAll('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])');
    focusableElements.forEach(element => {
        element.addEventListener('focus', function() {
            this.style.outline = '2px solid var(--coreGold)';
            this.style.outlineOffset = '2px';
        });
        
        element.addEventListener('blur', function() {
            this.style.outline = 'none';
        });
    });
    
    // ===== AUTO-FULLSCREEN IMAGE FUNCTIONALITY =====
    // Get all images in main content, excluding carousels and client logos
    const images = document.querySelectorAll('main img:not(.carousel-item img):not(.client-logo-img):not(.navbar-logo):not(.footer-logo)');
    
    images.forEach((img, index) => {
        // Create unique ID for each image
        const modalId = `fullscreen-${Date.now()}-${index}`;
        
        // Wrap image in clickable link
        const wrapper = document.createElement('a');
        wrapper.href = `#${modalId}`;
        wrapper.style.display = 'block';
        wrapper.style.textDecoration = 'none';
        
        // Insert wrapper before image and move image into it
        img.parentNode.insertBefore(wrapper, img);
        wrapper.appendChild(img);
        
        // Create fullscreen modal
        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'fullscreen-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <a href="#" class="close-btn">&times;</a>
                <img src="${img.src}" alt="${img.alt} - Fullscreen">
            </div>
        `;
        
        // Add modal to body
        document.body.appendChild(modal);
        
        // Add click event to close modal
        const closeBtn = modal.querySelector('.close-btn');
        closeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.hash = '';
        });
        
        // Close modal when clicking outside the image
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                window.location.hash = '';
            }
        });
        
        // Close modal with ESC key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && window.location.hash === `#${modalId}`) {
                window.location.hash = '';
            }
        });
    });
});
