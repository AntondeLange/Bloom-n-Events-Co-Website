import express from 'express';
import { validateContactForm } from '../schemas/contact.schema.js';
import { contactRateLimiter } from '../config/rateLimiter.js';
import { sendContactEmail } from '../config/email.js';

const router = express.Router();

/**
 * POST /api/contact
 * Submit contact form and send email
 * Rate limited to prevent spam
 */
router.post('/contact', contactRateLimiter, async (req, res) => {
  try {
    // Validate and sanitize input
    const validated = validateContactForm(req.body);

    // Send email to enquiries address
    await sendContactEmail(validated);

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Thank you for your message! We will get back to you soon.',
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

    // Handle email sending errors
    console.error('Contact form email error:', err.message || err);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Sorry, we encountered an error processing your submission. Please try again later.'
    });
  }
});

export default router;

