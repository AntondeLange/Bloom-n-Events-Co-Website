/**
 * Video Loading Optimization
 * Optimizes hero video loading - only load when hero section is visible
 */

export function optimizeHeroVideo() {
  document.addEventListener('DOMContentLoaded', function() {
    const heroVideo = document.querySelector('.hero-video');
    if (!heroVideo) return;
    
    // Only preload video when hero section is visible
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
  });
}

// Auto-initialize
optimizeHeroVideo();
