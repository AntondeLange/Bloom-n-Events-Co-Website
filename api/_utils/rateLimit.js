/**
 * Simple in-memory rate limiting for Vercel serverless functions
 * Note: This is per-instance, not global. For production, consider using Vercel Edge Config or Upstash Redis
 */

const rateLimitStore = new Map();

function getKey(ip, endpoint) {
  return `${ip}:${endpoint}`;
}

function cleanup() {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  const forwardedValue = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  if (typeof forwardedValue === 'string' && forwardedValue.trim() !== '') {
    return forwardedValue.split(',')[0].trim();
  }

  const realIp = req.headers['x-real-ip'];
  const realIpValue = Array.isArray(realIp) ? realIp[0] : realIp;
  if (typeof realIpValue === 'string' && realIpValue.trim() !== '') {
    return realIpValue.trim();
  }

  return 'unknown';
}

export function checkRateLimit(req, endpoint, windowMs, maxRequests) {
  const ip = getClientIp(req);
  const key = getKey(ip, endpoint);
  
  // Cleanup old entries periodically
  if (Math.random() < 0.1) { // 10% chance to cleanup
    cleanup();
  }
  
  const now = Date.now();
  const record = rateLimitStore.get(key);
  
  if (!record || record.resetTime < now) {
    // New window
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs
    });
    return { allowed: true, remaining: maxRequests - 1 };
  }
  
  if (record.count >= maxRequests) {
    return { 
      allowed: false, 
      remaining: 0,
      resetTime: record.resetTime
    };
  }
  
  record.count++;
  return { 
    allowed: true, 
    remaining: maxRequests - record.count,
    resetTime: record.resetTime
  };
}
