import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Static file middleware with caching headers
 * For production: serve static files with proper cache headers
 */
export function staticFilesMiddleware(publicDir = '../public') {
  return express.static(path.join(__dirname, publicDir), {
    maxAge: '1y', // Cache for 1 year
    immutable: true, // Tell browser content won't change
    etag: true, // Enable ETags for better caching
    lastModified: true, // Enable Last-Modified headers
    setHeaders: (res, path) => {
      // Add custom headers for different file types
      if (path.endsWith('.html')) {
        res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour for HTML
        res.setHeader('X-Content-Type-Options', 'nosniff');
      } else if (path.endsWith('.css') || path.endsWith('.js')) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // 1 year for CSS/JS
      } else if (path.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // 1 year for images
      }
    }
  });
}

