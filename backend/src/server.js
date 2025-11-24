import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import chatRouter from './routes/chat.js';
import contactRouter from './routes/contact.js';
import { apiRateLimiter } from './config/rateLimiter.js';
import { env } from './config/env.mjs';
import { connectDatabase } from './config/database.js';

const app = express();
const PORT = env.PORT || process.env.PORT || 3000;

// Add startup logging
console.log('🚀 Starting Bloom\'n Events backend...');
console.log('📋 Environment:', env.NODE_ENV);
console.log('🔌 Port:', PORT);

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net", "fonts.googleapis.com"],
      fontSrc: ["'self'", "fonts.gstatic.com", "fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "api.openai.com"],
      frameSrc: ["'self'", "www.facebook.com", "widgets.sociablekit.com"]
    }
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  crossOriginEmbedderPolicy: false // Allow third-party widgets
}));

// Compression
app.use(compression());

// CORS - restrict to frontend URL in production
// Allow both GitHub Pages and custom domain
const allowedOrigins = env.NODE_ENV === 'production'
  ? [
      'https://antondelange.github.io',
      'https://www.bloomneventsco.com.au',
      'https://bloomneventsco.com.au', // Without www
      env.FRONTEND_URL // Also allow from environment variable
    ].filter(Boolean) // Remove undefined values
  : '*'; // Development: allow all

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // In development, allow all origins
    if (env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    // In production, check against allowed origins
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('CORS blocked origin:', origin);
      console.warn('Allowed origins:', allowedOrigins);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Type'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  maxAge: 86400 // Cache preflight for 24 hours
}));

// Request size limits
app.use(express.json({ limit: '50kb' })); // Increased for contact form messages
app.use(express.urlencoded({ extended: true, limit: '50kb' }));

// General API rate limiting
app.use('/api', apiRateLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'bloomn-events-chatbot' });
});

// Explicit OPTIONS handler for CORS preflight (before routes)
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Max-Age', '86400');
  res.sendStatus(204);
});

// API routes (register before MongoDB connection check)
app.use('/api', chatRouter);
app.use('/api', contactRouter);

// Connect to MongoDB (non-blocking - server can still serve API routes)
connectDatabase().catch((error) => {
  console.error('⚠️ Failed to connect to MongoDB:', error.message);
  console.error('⚠️ Contact form submissions will fail until MongoDB is configured');
  // Don't exit - allow server to run for other endpoints (chat still works without MongoDB)
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server started successfully on port ${PORT}`);
  if (env.NODE_ENV === 'development') {
    console.log(`🚀 Bloom'n Events backend listening on http://localhost:${PORT}`);
    console.log(`📡 Chat API: http://localhost:${PORT}/api/chat`);
    console.log(`📧 Contact API: http://localhost:${PORT}/api/contact`);
    console.log(`✅ Health check: http://localhost:${PORT}/health`);
    console.log(`🔒 Environment: ${env.NODE_ENV}`);
  }
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit - log and continue
});
