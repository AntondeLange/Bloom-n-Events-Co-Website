# Input Validation and Sanitization Patterns

This document provides secure input validation and sanitization patterns for the backend API, following OWASP best practices.

## General Principles

1. **Never trust user input** - Always validate and sanitize
2. **Validate on both client and server** - Client-side is for UX, server-side is for security
3. **Use whitelist validation** - Only allow known good values
4. **Use parameterized queries** - Prevent SQL injection
5. **Sanitize output** - Prevent XSS attacks
6. **Set appropriate limits** - Prevent DoS attacks

## Node.js/Express Examples

### 1. Contact Form Validation

```javascript
import { z } from 'zod';
import express from 'express';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Zod schema for validation
const contactSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name contains invalid characters'),
  
  email: z.string()
    .email('Invalid email address')
    .max(255, 'Email must not exceed 255 characters')
    .toLowerCase()
    .trim(),
  
  phone: z.string()
    .regex(/^[\d\s()+-]+$/, 'Phone contains invalid characters')
    .max(20, 'Phone must not exceed 20 characters')
    .optional(),
  
  subject: z.string()
    .min(3, 'Subject must be at least 3 characters')
    .max(200, 'Subject must not exceed 200 characters')
    .trim(),
  
  message: z.string()
    .min(10, 'Message must be at least 10 characters')
    .max(5000, 'Message must not exceed 5000 characters')
    .trim(),
  
  honeypot: z.string().max(0).optional(), // Honeypot field (should be empty)
});

// Express-validator middleware (alternative approach)
const contactValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .matches(/^[a-zA-Z\s'-]+$/)
    .escape(), // Sanitize HTML
  
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail() // Normalize email format
    .isLength({ max: 255 }),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^[\d\s()+-]+$/)
    .isLength({ max: 20 }),
  
  body('subject')
    .trim()
    .isLength({ min: 3, max: 200 })
    .escape(),
  
  body('message')
    .trim()
    .isLength({ min: 10, max: 5000 })
    .escape(),
  
  body('honeypot')
    .optional()
    .isLength({ max: 0 }), // Honeypot should be empty
];

/**
 * Contact form submission handler
 */
router.post('/contact', contactValidation, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }
    
    // Additional Zod validation (defense in depth)
    const validatedData = contactSchema.parse(req.body);
    
    // Check honeypot (spam prevention)
    if (validatedData.honeypot && validatedData.honeypot.length > 0) {
      // Silently fail (don't reveal it's a honeypot)
      return res.status(200).json({
        success: true,
        message: 'Thank you for your message.',
      });
    }
    
    // Rate limiting check (implement separately)
    // await checkRateLimit(req.ip);
    
    // Sanitize and process data
    const sanitizedData = {
      name: validatedData.name,
      email: validatedData.email,
      phone: validatedData.phone || null,
      subject: validatedData.subject,
      message: validatedData.message,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      timestamp: new Date(),
    };
    
    // Save to database (use parameterized queries)
    // await saveContactSubmission(sanitizedData);
    
    // Send email notification
    // await sendEmailNotification(sanitizedData);
    
    res.status(200).json({
      success: true,
      message: 'Thank you for your message. We will get back to you soon.',
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        errors: error.errors,
      });
    }
    
    // Log error (don't expose details to client)
    console.error('Contact form error:', error);
    
    res.status(500).json({
      success: false,
      message: 'An error occurred. Please try again later.',
    });
  }
});

export default router;
```

### 2. SQL Injection Prevention (MongoDB Example)

```javascript
import mongoose from 'mongoose';

// Use Mongoose (parameterized queries built-in)
const ContactSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, trim: true },
  subject: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  ipAddress: { type: String },
  userAgent: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// Safe query (Mongoose handles parameterization)
async function getContactById(id) {
  // Mongoose automatically escapes input
  return await Contact.findById(id);
}

// Unsafe query (NEVER DO THIS)
// const query = `SELECT * FROM contacts WHERE id = '${id}'`; // VULNERABLE!
```

### 3. XSS Prevention (Output Sanitization)

```javascript
import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize HTML output to prevent XSS
 */
function sanitizeHTML(dirty) {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href'],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  });
}

/**
 * Sanitize user input before storing
 */
function sanitizeUserInput(input) {
  if (typeof input !== 'string') return input;
  
  // Remove null bytes
  input = input.replace(/\0/g, '');
  
  // Remove control characters (except newlines and tabs)
  input = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  // Trim whitespace
  input = input.trim();
  
  return input;
}
```

### 4. Rate Limiting

```javascript
import rateLimit from 'express-rate-limit';

// Contact form rate limiter
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many contact form submissions. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  // Skip successful requests (only count errors)
  skipSuccessfulRequests: true,
});

// Apply to contact route
router.post('/contact', contactLimiter, contactValidation, async (req, res) => {
  // ... handler code
});
```

### 5. File Upload Validation

```javascript
import multer from 'multer';
import { z } from 'zod';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: (req, file, cb) => {
    // Whitelist allowed file types
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and PDF are allowed.'));
    }
  },
});

router.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  // Additional validation
  const fileSchema = z.object({
    size: z.number().max(5 * 1024 * 1024), // 5MB
    mimetype: z.enum(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
    originalname: z.string().max(255).regex(/^[a-zA-Z0-9._-]+$/),
  });
  
  try {
    const validated = fileSchema.parse({
      size: req.file.size,
      mimetype: req.file.mimetype,
      originalname: req.file.originalname,
    });
    
    // Process file...
    
  } catch (error) {
    return res.status(400).json({ error: 'Invalid file' });
  }
});
```

## Best Practices Summary

1. **Use validation libraries** (Zod, express-validator, Joi)
2. **Validate early** - Check input as soon as it arrives
3. **Sanitize output** - Clean data before displaying
4. **Use parameterized queries** - Never concatenate user input into queries
5. **Set limits** - File sizes, string lengths, request rates
6. **Whitelist validation** - Only allow known good values
7. **Escape special characters** - Prevent injection attacks
8. **Implement rate limiting** - Prevent abuse
9. **Use HTTPS** - Encrypt data in transit
10. **Log security events** - Monitor for suspicious activity

## Additional Security Measures

- **CSRF Protection**: Use CSRF tokens for state-changing operations
- **Honeypot Fields**: Add hidden fields to catch bots
- **Content Security Policy**: Prevent XSS attacks
- **Input Length Limits**: Prevent buffer overflow attacks
- **Regular Security Audits**: Keep dependencies updated
