/**
 * Content Security Policy (CSP) Configuration
 * Centralized CSP directives to ensure consistency across all pages
 * 
 * Usage: Import this config and use it to generate CSP meta tags
 */

export const CSP_DIRECTIVES = {
  defaultSrc: ["'self'"],
  scriptSrc: [
    "'self'",
    "'unsafe-inline'", // TODO: Remove after moving inline scripts to external files
    "cdn.jsdelivr.net",
    "www.googletagmanager.com"
  ],
  styleSrc: [
    "'self'",
    "'unsafe-inline'", // TODO: Remove after extracting inline styles
    "cdn.jsdelivr.net",
    "fonts.googleapis.com"
  ],
  fontSrc: [
    "'self'",
    "cdn.jsdelivr.net",
    "fonts.gstatic.com",
    "fonts.googleapis.com"
  ],
  imgSrc: [
    "'self'",
    "data:",
    "https:"
  ],
  connectSrc: [
    "'self'",
    "www.googletagmanager.com",
    "www.google-analytics.com",
    "google-analytics.com",
    "api.openai.com",
    "cdn.jsdelivr.net",
    "formsubmit.co" // For contact form submissions
  ],
  frameSrc: [
    "'self'",
    "www.facebook.com",
    "widgets.sociablekit.com"
  ]
};

/**
 * Generate CSP meta tag content string
 * @returns {string} CSP directive string for meta tag
 */
export function generateCSPString() {
  return Object.entries(CSP_DIRECTIVES)
    .map(([directive, sources]) => {
      return `${directive} ${sources.join(' ')}`;
    })
    .join('; ');
}

/**
 * Generate CSP meta tag HTML
 * @returns {string} Complete meta tag HTML
 */
export function generateCSPMetaTag() {
  return `<meta http-equiv="Content-Security-Policy" content="${generateCSPString()}">`;
}
