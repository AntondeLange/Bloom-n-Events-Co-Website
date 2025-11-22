/**
 * Application Constants
 * Centralized configuration values to avoid magic numbers/strings
 */

export const CONFIG = {
  // API Configuration
  BACKEND: {
    DEV_URL: 'http://localhost:3000',
    PROD_URL: '', // Empty for production (uses relative paths)
    CHAT_ENDPOINT: '/api/chat', // Full endpoint path
    CONTACT_ENDPOINT: '/api/contact', // Contact form endpoint
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
    // Production: use empty string for relative paths, Development: use localhost
    return window.location.hostname === 'localhost' 
      ? CONFIG.BACKEND.DEV_URL 
      : CONFIG.BACKEND.PROD_URL;
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

// Get full API URL for contact form
export function getContactApiUrl() {
  const baseUrl = getBackendUrl();
  return baseUrl ? `${baseUrl}${CONFIG.BACKEND.CONTACT_ENDPOINT}` : CONFIG.BACKEND.CONTACT_ENDPOINT;
}

