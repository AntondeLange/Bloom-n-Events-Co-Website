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

export function checkRateLimit(req, endpoint, windowMs, maxRequests) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || 
             req.headers['x-real-ip'] || 
             'unknown';
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
