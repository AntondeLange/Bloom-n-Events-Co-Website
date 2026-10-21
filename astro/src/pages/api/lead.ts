import type { APIRoute } from 'astro';
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';
import { createEnquiryHandler } from '../../server/enquiry';
import { smtpDelivery } from '../../server/smtp';
export const prerender = false;
let limiter: Ratelimit | undefined;
// Vite replaces statically named properties; runtime fallbacks support Vercel Functions.
const config = {
  redisUrl: import.meta.env.UPSTASH_REDIS_REST_URL || process.env.UPSTASH_REDIS_REST_URL || import.meta.env.KV_REST_API_URL || process.env.KV_REST_API_URL,
  redisToken: import.meta.env.UPSTASH_REDIS_REST_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || import.meta.env.KV_REST_API_TOKEN || process.env.KV_REST_API_TOKEN,
  host: import.meta.env.SMTP_HOST || process.env.SMTP_HOST || 'mail-au.smtp2go.com',
  port: import.meta.env.SMTP_PORT || process.env.SMTP_PORT || '2525',
  user: import.meta.env.SMTP_USER || process.env.SMTP_USER,
  pass: import.meta.env.SMTP_PASS || process.env.SMTP_PASS,
  from: import.meta.env.LEAD_FROM_EMAIL || process.env.LEAD_FROM_EMAIL || import.meta.env.CONTACT_FROM_EMAIL || process.env.CONTACT_FROM_EMAIL,
  to: import.meta.env.LEAD_TO_EMAIL || process.env.LEAD_TO_EMAIL || import.meta.env.CONTACT_TO_EMAIL || process.env.CONTACT_TO_EMAIL,
};
export const handleEnquiry = createEnquiryHandler({
  limit: async (ip) => {
    if (!config.redisUrl || !config.redisToken) throw new Error('Spam protection unavailable');
    limiter ??= new Ratelimit({ redis: new Redis({ url: config.redisUrl, token: config.redisToken }), limiter: Ratelimit.slidingWindow(5, '1 m'), prefix: 'bloom:enquiries' });
    return (await limiter.limit(ip)).success;
  },
  deliver: (data) => smtpDelivery(config)(data),
});
export const POST: APIRoute = ({ request, clientAddress }) => handleEnquiry(request, clientAddress ?? 'unknown');
