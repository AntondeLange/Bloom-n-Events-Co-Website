import type { APIRoute } from 'astro';
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';
import { createEnquiryHandler, postmarkDelivery } from '../../server/enquiry';
export const prerender = false;
let limiter: Ratelimit | undefined;
const env = (key: string) => import.meta.env[key] || process.env[key];
export const handleEnquiry = createEnquiryHandler({
  limit: async (ip) => {
    if (!env('UPSTASH_REDIS_REST_URL') || !env('UPSTASH_REDIS_REST_TOKEN')) throw new Error('Spam protection unavailable');
    limiter ??= new Ratelimit({ redis: new Redis({ url: env('UPSTASH_REDIS_REST_URL'), token: env('UPSTASH_REDIS_REST_TOKEN') }), limiter: Ratelimit.slidingWindow(5, '1 m'), prefix: 'bloom:enquiries' });
    return (await limiter.limit(ip)).success;
  },
  deliver: (data) => postmarkDelivery({ token: env('POSTMARK_SERVER_TOKEN'), from: env('LEAD_FROM_EMAIL'), to: env('LEAD_TO_EMAIL') })(data),
});
export const POST: APIRoute = ({ request, clientAddress }) => handleEnquiry(request, clientAddress ?? 'unknown');
