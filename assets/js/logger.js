/**
 * Logger Utility
 * Replaces console.log statements with proper logging
 * In production, logs only errors and warnings
 */

const isDevelopment = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || 
   window.location.hostname === '127.0.0.1' ||
   window.location.protocol === 'file:');

const isProduction = !isDevelopment;

class Logger {
  constructor() {
    this.enabled = isDevelopment || typeof window === 'undefined';
  }

  log(message, ...args) {
    if (this.enabled) {
      console.log(`[LOG] ${message}`, ...args);
    }
  }

  info(message, ...args) {
    if (this.enabled) {
      console.info(`[INFO] ${message}`, ...args);
    }
  }

  warn(message, ...args) {
    // Always log warnings
    console.warn(`[WARN] ${message}`, ...args);
    
    // Send to analytics in production
    if (isProduction && typeof gtag !== 'undefined') {
      gtag('event', 'warning', {
        event_category: 'Error',
        event_label: message,
        non_interaction: true
      });
    }
  }

  error(message, error = null, ...args) {
    // Always log errors
    console.error(`[ERROR] ${message}`, error, ...args);
    
    // Send to analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'exception', {
        description: message,
        fatal: false,
        error: error?.message || error?.toString() || 'Unknown error'
      });
    }
  }

  debug(message, ...args) {
    if (isDevelopment) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export for compatibility
export default logger;

