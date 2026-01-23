/**
 * Initialize structured data for homepage
 * CSP-compliant version (no inline scripts)
 */

import { homepageStructuredData, injectStructuredData } from './structured-data.js';

// Inject structured data when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    injectStructuredData(homepageStructuredData);
  });
} else {
  injectStructuredData(homepageStructuredData);
}
