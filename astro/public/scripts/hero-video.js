/**
 * Hero video autoplay handler
 * Respects prefers-reduced-motion: pause video autoplay if user prefers reduced motion
 * Extracted from index.astro for CSP compliance
 */
(function() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const video = document.getElementById('hero-video');
  if (video instanceof HTMLVideoElement) {
    if (!prefersReducedMotion) {
      video.autoplay = true;
      video.play().catch(() => {
        // Autoplay blocked by browser - user can play manually
      });
    }
  }
})();
