/**
 * CORS utilities for Vercel serverless functions
 */

import { getAllowedOrigins } from './env.js';

export function setCorsHeaders(req, res) {
  const allowedOrigins = getAllowedOrigins();
  const origin = req.headers.origin;
  
  if (allowedOrigins === '*') {
    res.setHeader('Access-Control-Allow-Origin', '*');
  } else if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
}

export function handleCorsPreflight(req, res) {
  setCorsHeaders(req, res);
  res.status(204).end();
}
