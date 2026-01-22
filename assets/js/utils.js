/**
 * Utility Functions
 * 
 * Common utility functions used across the site.
 * Moved from inline scripts to external file for CSP compliance.
 */

/**
 * Update copyright year
 */
export function updateCopyrightYear() {
  const currentYearSpan = document.getElementById('current-year');
  if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
  }
}

/**
 * Optimize hero video loading
 * Only loads video when hero section is visible
 */
export function optimizeHeroVideo() {
  const heroVideo = document.querySelector('.hero-video');
  if (!heroVideo) return;
  
  const heroSection = document.querySelector('.hero-section');
  if (heroSection) {
    const observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          // Hero section is visible, set video to preload metadata
          heroVideo.preload = 'metadata';
          // Start loading video source
          if (heroVideo.readyState === 0) {
            heroVideo.load();
          }
          observer.disconnect();
        }
      });
    }, { rootMargin: '50px' });
    
    observer.observe(heroSection);
  }
}

// Initialize utilities on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    updateCopyrightYear();
    optimizeHeroVideo();
  });
} else {
  updateCopyrightYear();
  optimizeHeroVideo();
}
