/**
 * Google Analytics (gtag.js) initialization
 * CSP-compliant version (no inline scripts)
 */

window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
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
