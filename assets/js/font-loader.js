/**
 * CSP-compliant font loader
 * Replaces inline event handlers with external script
 */

(function() {
  'use strict';
  
  const link = document.getElementById('google-fonts-stylesheet') || 
                document.querySelector('link[href*="fonts.googleapis.com"][media="print"]');
  if (link) {
    if (link.media === 'all') {
      // Already loaded
      return;
    }
    link.addEventListener('load', function() {
      this.media = 'all';
    });
    // Fallback: if load event already fired, set media immediately
    if (link.sheet || link.href) {
      link.media = 'all';
    }
  }
})();
