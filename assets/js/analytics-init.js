/**
 * Google Analytics Initialization
 * Handles gtag initialization with cookie consent
 */

(function() {
  'use strict';
  
  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  
  // Set default consent to denied (will be updated when user accepts)
  gtag('consent', 'default', {
    'analytics_storage': 'denied',
    'ad_storage': 'denied'
  });
  
  // Check for existing consent
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
  
  // Load gtag.js script
  function loadAnalytics() {
    if (document.querySelector('script[src*="googletagmanager.com/gtag/js"]')) {
      return; // Already loaded
    }
    
    if ('requestIdleCallback' in window) {
      requestIdleCallback(function() {
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://www.googletagmanager.com/gtag/js?id=G-T5DJCCT19V';
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
  
  // Initialize on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkCookieConsent);
  } else {
    checkCookieConsent();
  }
})();
