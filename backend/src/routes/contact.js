import express from 'express';
import Contact from '../models/Contact.js';
import { validateContactForm } from '../schemas/contact.schema.js';
import { contactRateLimiter } from '../config/rateLimiter.js';

const router = express.Router();

/**
 * POST /api/contact
 * Submit contact form
 * Rate limited to prevent spam
 */
router.post('/contact', contactRateLimiter, async (req, res) => {
  try {
    // Check if MongoDB is connected
    const mongoose = await import('mongoose');
    if (mongoose.default.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        error: 'Service unavailable',
        message: 'Database connection is not available. Please configure MongoDB and restart the server. See MONGODB_SETUP.md for instructions.'
      });
    }

    // Validate and sanitize input
    const validated = validateContactForm(req.body);
    
    // Get client information (for logging/spam prevention)
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || '';

    // Create contact document
    const contact = new Contact({
      firstName: validated.firstName,
      lastName: validated.lastName,
      company: validated.company || null,
      email: validated.email,
      message: validated.message,
      ipAddress: ipAddress,
      userAgent: userAgent,
      status: 'new'
    });

    // Save to database
    await contact.save();

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Thank you for your message! We will get back to you soon.',
      data: {
        id: contact._id,
        submittedAt: contact.createdAt
      }
    });

  } catch (err) {
    // Handle validation errors
    if (err.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        message: 'Please check your form data and try again',
        details: err.errors
      });
    }

    // Handle MongoDB duplicate key errors (if email index has unique constraint)
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Duplicate entry',
        message: 'A submission with this email already exists'
      });
    }

    // Handle other errors
    console.error('Contact form error:', err.message || err);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Sorry, we encountered an error processing your submission. Please try again later.'
    });
  }
});

/**
 * GET /api/contact
 * Get all contact submissions (admin endpoint - should be protected in production)
 * TODO: Add authentication/authorization middleware
 */
router.get('/contact', async (req, res) => {
  try {
    // TODO: Add admin authentication check
    // For now, this endpoint should be disabled or protected

    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    const query = status ? { status } : {};

    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v'); // Exclude version key

    const total = await Contact.countDocuments(query);

    res.json({
      success: true,
      data: contacts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (err) {
    console.error('Error fetching contacts:', err.message || err);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch contact submissions'
    });
  }
});

export default router;

