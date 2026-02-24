/**
 * Environment variable utilities for Vercel serverless functions
 */

export function getEnv() {
  const nodeEnv = process.env.NODE_ENV || 'production';
  const smtpUser = process.env.SMTP_USER;
  const smtpPortRaw = process.env.SMTP_PORT || '587';
  const parsedSmtpPort = Number.parseInt(smtpPortRaw, 10);
  const smtpPort = Number.isFinite(parsedSmtpPort) && parsedSmtpPort > 0 ? parsedSmtpPort : 587;
  const smtpSecure = process.env.SMTP_SECURE
    ? process.env.SMTP_SECURE === 'true'
    : smtpPort === 465;
  
  return {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
    NODE_ENV: nodeEnv,
    FRONTEND_URL: process.env.FRONTEND_URL,
    // Email configuration
    ENQUIRIES_EMAIL:
      process.env.ENQUIRIES_EMAIL ||
      process.env.CONTACT_TO_EMAIL ||
      'enquiries@bloomneventsco.com.au',
    SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
    SMTP_PORT: smtpPort,
    SMTP_USER: smtpUser,
    SMTP_PASS: process.env.SMTP_PASS,
    SMTP_SECURE: smtpSecure,
    SMTP_FROM:
      process.env.SMTP_FROM ||
      process.env.CONTACT_FROM_EMAIL ||
      `"Bloom'n Events Co Website" <${smtpUser || 'noreply@bloomneventsco.com.au'}>`,
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
