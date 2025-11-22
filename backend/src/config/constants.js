/**
 * Backend Constants
 * Centralized configuration values
 */

export const OPENAI_CONFIG = {
  MODEL: 'gpt-3.5-turbo',
  MAX_TOKENS: 300,
  TEMPERATURE: 0.7,
  TIMEOUT: 30000, // 30 seconds
};

export const REQUEST_LIMITS = {
  MESSAGE_MAX_LENGTH: 500,
  CONVERSATION_HISTORY_MAX_ITEMS: 20,
  CONVERSATION_MESSAGE_MAX_LENGTH: 1000,
  BODY_SIZE: '10kb',
};

export const CACHE_CONFIG = {
  STATIC_FILES_MAX_AGE: '1y',
  HTML_MAX_AGE: '3600', // 1 hour
  ASSETS_MAX_AGE: '31536000', // 1 year
};

export const RATE_LIMITS = {
  CHAT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX: 20,
  },
  API: {
    WINDOW_MS: 15 * 60 * 1000,
    MAX: 100,
  },
};

