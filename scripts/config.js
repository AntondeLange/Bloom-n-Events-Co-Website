/**
 * Application Constants
 * Centralized configuration values to avoid magic numbers/strings
 */

export const CONFIG = {
  // API Configuration
  BACKEND: {
    DEV_URL: 'http://localhost:3000',
    // Production backend deployed on Railway
    PROD_URL: 'https://bloom-n-events-co-website-production.up.railway.app',
    CHAT_ENDPOINT: '/api/chat', // Full endpoint path
    TIMEOUT: 30000, // 30 seconds
  },
  
  // Rate Limiting
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 20,
  },
  
  // Chat Configuration
  CHAT: {
    MAX_MESSAGE_LENGTH: 500,
    MAX_HISTORY_ITEMS: 20,
    MAX_HISTORY_MESSAGE_LENGTH: 1000,
    TYPING_DELAY_MIN: 1000,
    TYPING_DELAY_MAX: 2000,
    NOTIFICATION_DELAY: 3000, // 3 seconds
  },
  
  // UI Configuration
  UI: {
    SCROLL_THRESHOLD: 100, // Pixels from top for navbar toggle
    SCROLL_THROTTLE: 16, // ms for scroll throttling
    DEBOUNCE_DELAY: 300, // ms for debouncing
    INTERSECTION_ROOT_MARGIN: '200px 0px',
    REVEAL_THRESHOLD: 0.1,
  },
  
  // Image Loading
  IMAGES: {
    LAZY_LOAD_ROOT_MARGIN: '200px 0px',
    LAZY_LOAD_THRESHOLD: 0.01,
    RESPONSIVE_SIZES: [480, 768, 1200, 1600],
  },
  
  // Performance
  PERFORMANCE: {
    IDLE_CALLBACK_TIMEOUT: 5000, // 5 seconds
    PRELOAD_DELAY: 1000,
  },
  
  // Analytics
  ANALYTICS: {
    GA_TRACKING_ID: 'G-T5DJCCT19V',
  },
  
  // Service Worker
  SERVICE_WORKER: {
    PATH: 'sw.js',
  },
};

// Get backend URL based on environment
export function getBackendUrl() {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // Development: use localhost backend if accessing from localhost (any port)
    const isLocalhost = hostname === 'localhost' || 
                       hostname === '127.0.0.1' || 
                       hostname === '' ||
                       window.location.protocol === 'file:';
    
    if (isLocalhost) {
      // Always use localhost:3000 for development
      return CONFIG.BACKEND.DEV_URL;
    }
    
    // Production: use production backend URL
    // Debug logging
    console.log('🔍 getBackendUrl() debug:', {
      hostname,
      PROD_URL: CONFIG.BACKEND.PROD_URL,
      PROD_URL_length: CONFIG.BACKEND.PROD_URL?.length,
      PROD_URL_type: typeof CONFIG.BACKEND.PROD_URL
    });
    
    // If PROD_URL is not set, show a helpful error
    if (!CONFIG.BACKEND.PROD_URL || 
        CONFIG.BACKEND.PROD_URL.trim() === '' || 
        CONFIG.BACKEND.PROD_URL.includes('YOUR-BACKEND-URL')) {
      console.error('⚠️ Production backend URL not configured!');
      console.error('PROD_URL value:', CONFIG.BACKEND.PROD_URL);
      console.error('Please set CONFIG.BACKEND.PROD_URL in scripts/config.js with your deployed backend URL');
      // Fallback to relative path (won't work on GitHub Pages, but prevents errors)
      return '';
    }
    
    return CONFIG.BACKEND.PROD_URL;
  }
  return CONFIG.BACKEND.DEV_URL;
}

// Get full API URL for chat
export function getApiUrl() {
  const baseUrl = getBackendUrl();
  // If baseUrl is empty (production), use the endpoint directly
  // Otherwise append endpoint to baseUrl
  return baseUrl ? `${baseUrl}${CONFIG.BACKEND.CHAT_ENDPOINT}` : CONFIG.BACKEND.CHAT_ENDPOINT;
}

