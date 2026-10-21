import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

type Config = { redisUrl?: string; redisToken?: string };
type Limiter = { limit: (ip: string) => Promise<{ success: boolean; reason?: string }> };

export function createEnquiryLimiter(config: Config, factory: () => Limiter = () =>
  new Ratelimit({
    redis: new Redis({ url: config.redisUrl!, token: config.redisToken! }),
    limiter: Ratelimit.slidingWindow(5, '1 m'), prefix: 'bloom:enquiries', timeout: 5000,
  })
) {
  let limiter: Limiter | undefined;
  return async (ip: string) => {
    if (!config.redisUrl || !config.redisToken) throw new Error('Spam protection unavailable');
    limiter ??= factory();
    const result = await limiter.limit(ip);
    // Upstash deliberately returns success=true on timeout; enquiries must fail closed.
    if (result.reason === 'timeout') throw new Error('Spam protection unavailable');
    return result.success;
  };
}
