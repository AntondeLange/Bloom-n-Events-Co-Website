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

export function getClientIp(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded && forwarded.trim() !== '') {
    return forwarded.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp && realIp.trim() !== '') {
    return realIp.trim();
  }

  return 'unknown';
}

export function checkRateLimit(request, endpoint, windowMs, maxRequests) {
  const ip = getClientIp(request);
  const key = getKey(ip, endpoint);

  if (Math.random() < 0.1) {
    cleanup();
  }

  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || record.resetTime < now) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (record.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetTime: record.resetTime,
  };
}
