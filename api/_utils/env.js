/**
 * Environment variable utilities for Vercel serverless functions
 */

export function getEnv() {
  const nodeEnv = process.env.NODE_ENV || 'production';
  
  return {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
    NODE_ENV: nodeEnv,
    FRONTEND_URL: process.env.FRONTEND_URL,
    // Email configuration
    ENQUIRIES_EMAIL: process.env.ENQUIRIES_EMAIL || 'enquiries@bloomneventsco.com.au',
    SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
    SMTP_PORT: parseInt(process.env.SMTP_PORT || '587'),
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    SMTP_SECURE: process.env.SMTP_SECURE === 'true',
    SMTP_FROM: process.env.SMTP_FROM || `"Bloom'n Events Co Website" <${process.env.SMTP_USER || 'noreply@bloomneventsco.com.au'}>`,
  };
}

export function getAllowedOrigins() {
  const env = getEnv();
  
  if (env.NODE_ENV !== 'production') {
    return '*'; // Development: allow all
  }
  
  return [
    'https://antondelange.github.io',
    'https://www.bloomneventsco.com.au',
    'https://bloomneventsco.com.au',
    env.FRONTEND_URL
  ].filter(Boolean);
}
