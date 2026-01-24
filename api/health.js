/**
 * Vercel serverless function for health check
 * GET /api/health
 */

import { setCorsHeaders, handleCorsPreflight } from './_utils/cors.js';

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return handleCorsPreflight(req, res);
  }
  
  // Set CORS headers
  setCorsHeaders(req, res);
  
  // Allow GET and HEAD
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  return res.status(200).json({ 
    status: 'ok', 
    service: 'bloomn-events-chatbot',
    timestamp: new Date().toISOString()
  });
}
