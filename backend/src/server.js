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
const PORT = env.PORT;

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
app.use(cors({
  origin: env.FRONTEND_URL || (env.NODE_ENV === 'production' ? false : '*'),
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
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
app.listen(PORT, () => {
  if (env.NODE_ENV === 'development') {
    console.log(`🚀 Bloom'n Events backend listening on http://localhost:${PORT}`);
    console.log(`📡 Chat API: http://localhost:${PORT}/api/chat`);
    console.log(`📧 Contact API: http://localhost:${PORT}/api/contact`);
    console.log(`✅ Health check: http://localhost:${PORT}/health`);
    console.log(`🔒 Environment: ${env.NODE_ENV}`);
  } else {
    console.log(`Server started on port ${PORT}`);
  }
});

