import type { APIRoute } from 'astro';
import { createEnquiryLimiter } from '../../server/rate-limit';
import { createEnquiryHandler } from '../../server/enquiry';
import { smtpAddresses, smtpDelivery } from '../../server/smtp';
export const prerender = false;
// Vite replaces statically named properties; runtime fallbacks support Vercel Functions.
const config = {
  redisUrl: import.meta.env.UPSTASH_REDIS_REST_URL || process.env.UPSTASH_REDIS_REST_URL || import.meta.env.KV_REST_API_URL || process.env.KV_REST_API_URL,
  redisToken: import.meta.env.UPSTASH_REDIS_REST_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || import.meta.env.KV_REST_API_TOKEN || process.env.KV_REST_API_TOKEN,
  host: import.meta.env.SMTP_HOST || process.env.SMTP_HOST || 'mail-au.smtp2go.com',
  port: import.meta.env.SMTP_PORT || process.env.SMTP_PORT || '2525',
  user: import.meta.env.SMTP_USER || process.env.SMTP_USER,
  pass: import.meta.env.SMTP_PASS || process.env.SMTP_PASS,
  ...smtpAddresses({
    LEAD_FROM_EMAIL: import.meta.env.LEAD_FROM_EMAIL || process.env.LEAD_FROM_EMAIL,
    SMTP_FROM: import.meta.env.SMTP_FROM || process.env.SMTP_FROM,
    CONTACT_FROM_EMAIL: import.meta.env.CONTACT_FROM_EMAIL || process.env.CONTACT_FROM_EMAIL,
    LEAD_TO_EMAIL: import.meta.env.LEAD_TO_EMAIL || process.env.LEAD_TO_EMAIL,
    ENQUIRIES_EMAIL: import.meta.env.ENQUIRIES_EMAIL || process.env.ENQUIRIES_EMAIL,
    CONTACT_TO_EMAIL: import.meta.env.CONTACT_TO_EMAIL || process.env.CONTACT_TO_EMAIL,
  }),
};
export const handleEnquiry = createEnquiryHandler({
  limit: createEnquiryLimiter(config),
  deliver: (data) => smtpDelivery(config)(data),
});
export const POST: APIRoute = ({ request, clientAddress }) => handleEnquiry(request, clientAddress ?? 'unknown');
