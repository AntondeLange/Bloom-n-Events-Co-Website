/**
 * Cookie Consent Management
 * 
 * Handles cookie consent banner and preference storage.
 * Moved from inline script to external file for CSP compliance.
 */

(function() {
  'use strict';
  
  const COOKIE_CONSENT_KEY = 'cookieConsent';
  const COOKIE_EXPIRY_DAYS = 365;
  
  const banner = document.getElementById('cookieConsentBanner');
  const acceptBtn = document.getElementById('cookieAcceptBtn');
  const declineBtn = document.getElementById('cookieDeclineBtn');
  
  if (!banner || !acceptBtn || !declineBtn) {
    console.warn('Cookie consent elements not found');
    return;
  }
  
  /**
   * Get stored consent preference
   */
  function getCookieConsent() {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    return consent === 'accepted' || consent === 'declined' ? consent : null;
  }
  
  /**
   * Save consent preference
   * Uses Secure, HttpOnly, and SameSite flags via server-side cookie
   * LocalStorage is used as fallback for client-side access
   */
  function setCookieConsent(accepted) {
    localStorage.setItem(COOKIE_CONSENT_KEY, accepted ? 'accepted' : 'declined');
    
    // Set HTTP-only cookie via server (would need backend endpoint)
    // For now, using document.cookie with Secure and SameSite flags
    const expiryDate = new Date();
    expiryDate.setTime(expiryDate.getTime() + (COOKIE_EXPIRY_DAYS * 24 * 60 * 60 * 1000));
    
    // Note: Secure flag requires HTTPS, SameSite=Strict for security
    const cookieString = `${COOKIE_CONSENT_KEY}=${accepted ? 'accepted' : 'declined'}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Strict${window.location.protocol === 'https:' ? '; Secure' : ''}`;
    document.cookie = cookieString;
  }
  
  /**
   * Show consent banner if no consent given
   */
  function showBanner() {
    const consent = getCookieConsent();
    if (!consent) {
      banner.classList.add('show');
    } else if (consent === 'accepted') {
      // Enable Google Analytics if consent was given
      enableAnalytics();
    }
  }
  
  /**
   * Hide consent banner
   */
  function hideBanner() {
    banner.classList.remove('show');
  }
  
  /**
   * Enable Google Analytics
   */
  function enableAnalytics() {
    if (typeof gtag !== 'undefined') {
      gtag('consent', 'update', {
        'analytics_storage': 'granted'
      });
      // Send page view now that consent is granted
      gtag('config', 'G-T5DJCCT19V', {
        'send_page_view': true
      });
    }
  }
  
  /**
   * Disable Google Analytics
   */
  function disableAnalytics() {
    if (typeof gtag !== 'undefined') {
      gtag('consent', 'update', {
        'analytics_storage': 'denied'
      });
    }
  }
  
  /**
   * Handle accept button click
   */
  acceptBtn.addEventListener('click', function() {
    setCookieConsent(true);
    enableAnalytics();
    hideBanner();
  });
  
  /**
   * Handle decline button click
   */
  declineBtn.addEventListener('click', function() {
    setCookieConsent(false);
    disableAnalytics();
    hideBanner();
  });
  
  /**
   * Initialize on page load
   */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', showBanner);
  } else {
    showBanner();
  }
})();
