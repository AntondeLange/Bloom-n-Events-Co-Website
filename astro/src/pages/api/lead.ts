import type { APIRoute } from 'astro';
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';
import { createEnquiryHandler, postmarkDelivery } from '../../server/enquiry';
export const prerender = false;
let limiter: Ratelimit | undefined;
// Vite replaces statically named properties; runtime fallbacks support Vercel Functions.
const config = {
  redisUrl: import.meta.env.UPSTASH_REDIS_REST_URL || process.env.UPSTASH_REDIS_REST_URL,
  redisToken: import.meta.env.UPSTASH_REDIS_REST_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN,
  postmarkToken: import.meta.env.POSTMARK_SERVER_TOKEN || process.env.POSTMARK_SERVER_TOKEN,
  from: import.meta.env.LEAD_FROM_EMAIL || process.env.LEAD_FROM_EMAIL,
  to: import.meta.env.LEAD_TO_EMAIL || process.env.LEAD_TO_EMAIL,
};
export const handleEnquiry = createEnquiryHandler({
  limit: async (ip) => {
    if (!config.redisUrl || !config.redisToken) throw new Error('Spam protection unavailable');
    limiter ??= new Ratelimit({ redis: new Redis({ url: config.redisUrl, token: config.redisToken }), limiter: Ratelimit.slidingWindow(5, '1 m'), prefix: 'bloom:enquiries' });
    return (await limiter.limit(ip)).success;
  },
  deliver: (data) => postmarkDelivery({ token: config.postmarkToken, from: config.from, to: config.to })(data),
});
export const POST: APIRoute = ({ request, clientAddress }) => handleEnquiry(request, clientAddress ?? 'unknown');
