import { getAllowedOrigins } from './env.js';

function appendVary(headers, token) {
  const current = headers.get('Vary');
  if (!current) {
    headers.set('Vary', token);
    return;
  }

  const tokens = current
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  if (!tokens.includes(token.toLowerCase())) {
    headers.set('Vary', `${current}, ${token}`);
  }
}

export function buildCorsHeaders(request) {
  const headers = new Headers();
  const allowedOrigins = getAllowedOrigins();
  const origin = request.headers.get('origin');

  if (allowedOrigins === '*') {
    headers.set('Access-Control-Allow-Origin', '*');
  } else if (origin && allowedOrigins.includes(origin)) {
    headers.set('Access-Control-Allow-Origin', origin);
    appendVary(headers, 'Origin');
  }

  headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  headers.set('Access-Control-Max-Age', '86400');
  return headers;
}

export function handleCorsPreflight(request) {
  return new Response(null, {
    status: 204,
    headers: buildCorsHeaders(request),
  });
}

export function withCors(response, request) {
  const headers = new Headers(response.headers);
  const corsHeaders = buildCorsHeaders(request);
  for (const [key, value] of corsHeaders.entries()) {
    headers.set(key, value);
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
