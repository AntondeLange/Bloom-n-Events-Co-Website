/**
 * Google Analytics Integration
 * 
 * Handles cookie consent and analytics initialization.
 * Moved from inline script to external file for CSP compliance.
 */

// Initialize dataLayer
window.dataLayer = window.dataLayer || [];
function gtag() {
  dataLayer.push(arguments);
}
gtag('js', new Date());

// Set default consent to denied (will be updated when user accepts)
gtag('consent', 'default', {
  'analytics_storage': 'denied',
  'ad_storage': 'denied'
});

/**
 * Check for existing consent and load analytics accordingly
 */
function checkCookieConsent() {
  const consent = localStorage.getItem('cookieConsent');
  if (consent === 'accepted') {
    gtag('consent', 'update', {
      'analytics_storage': 'granted'
    });
    loadAnalytics();
  } else {
    // Still load gtag.js but with consent denied
    loadAnalytics();
  }
}

/**
 * Load Google Analytics script
 */
function loadAnalytics() {
  if (document.querySelector('script[src*="googletagmanager.com/gtag/js"]')) {
    return; // Already loaded
  }
  
  if ('requestIdleCallback' in window) {
    requestIdleCallback(function() {
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=G-T5DJCCT19V';
      script.integrity = 'sha384-...'; // Add SRI hash
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
      script.onload = function() {
        const consent = localStorage.getItem('cookieConsent');
        gtag('config', 'G-T5DJCCT19V', {
          'send_page_view': consent === 'accepted'
        });
      };
    });
  } else {
    window.addEventListener('load', function() {
      setTimeout(function() {
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://www.googletagmanager.com/gtag/js?id=G-T5DJCCT19V';
        script.integrity = 'sha384-...'; // Add SRI hash
        script.crossOrigin = 'anonymous';
        document.head.appendChild(script);
        script.onload = function() {
          const consent = localStorage.getItem('cookieConsent');
          gtag('config', 'G-T5DJCCT19V', {
            'send_page_view': consent === 'accepted'
          });
        };
      }, 1000);
    });
  }
}

/**
 * Performance monitoring with deferred loading
 */
function initPerformanceMonitoring() {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(function() {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'largest-contentful-paint') {
              if (typeof gtag === 'function') {
                gtag('event', 'lcp', {
                  event_category: 'Web Vitals',
                  value: Math.round(entry.startTime),
                  non_interaction: true
                });
              }
            }
          }
        });
        observer.observe({type: 'largest-contentful-paint', buffered: true});
      }
    });
  } else {
    window.addEventListener('load', function() {
      setTimeout(function() {
        if ('PerformanceObserver' in window) {
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (entry.entryType === 'largest-contentful-paint') {
                if (typeof gtag === 'function') {
                  gtag('event', 'lcp', {
                    event_category: 'Web Vitals',
                    value: Math.round(entry.startTime),
                    non_interaction: true
                  });
                }
              }
            }
          });
          observer.observe({type: 'largest-contentful-paint', buffered: true});
        }
      }, 1000);
    });
  }
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', checkCookieConsent);
  document.addEventListener('DOMContentLoaded', initPerformanceMonitoring);
} else {
  checkCookieConsent();
  initPerformanceMonitoring();
}

// Export for use in other modules
export { gtag, checkCookieConsent, loadAnalytics };
