/**
 * Google Analytics (gtag.js) initialization
 * CSP-compliant version (no inline scripts)
 * 
 * Waits for the async gtag.js library to load before initializing
 */

// Initialize dataLayer immediately
window.dataLayer = window.dataLayer || [];

// Define placeholder function that queues calls until gtag.js loads
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;

// Wait for gtag.js library to load before configuring
function initGtag() {
  // Check if gtag.js has loaded (it will overwrite our placeholder function)
  if (typeof window.gtag === 'function' && window.gtag.toString().includes('native code')) {
    // gtag.js has loaded - now initialize
    gtag('js', new Date());
    gtag('config', 'G-T5DJCCT19V');
    
    // Track Web Vitals
    if (typeof PerformanceObserver !== 'undefined') {
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            gtag('event', 'LCP', {
              'event_category': 'Web Vitals',
              'value': Math.round(entry.startTime),
              'non_interaction': true
            });
          }
        }
      }).observe({entryTypes: ['largest-contentful-paint']});
    }
  } else {
    // gtag.js not loaded yet - check again after a short delay
    setTimeout(initGtag, 100);
  }
}

// Start initialization check
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGtag);
} else {
  initGtag();
}
