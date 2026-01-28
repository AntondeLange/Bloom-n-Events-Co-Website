/**
 * Contact Form Submission Route
 * Handles form submissions from the website contact form
 */

import express from 'express';
import nodemailer from 'nodemailer';
import { contactFormSchema } from '../schemas/contact.schema.js';
import rateLimit from 'express-rate-limit';

function escapeHtml(s) {
  if (typeof s !== 'string') return '';
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const router = express.Router();

// Rate limiting for form submissions
const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many form submissions from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Form validation schema

/**
 * POST /api/contact
 * Submit contact form
 */
router.post('/contact', formLimiter, async (req, res) => {
  try {
    // Validate request body
    const validationResult = contactFormSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid form data',
        details: validationResult.error.errors
      });
    }
    
    const formData = validationResult.data;
    
    // Honeypot check - if website field has value, it's likely a bot
    if (formData.website && formData.website.trim() !== '') {
      // Silently fail for bots
      return res.status(200).json({
        success: true,
        message: 'Thank you for your message. We will get back to you soon.'
      });
    }
    
    // Configure email transporter
    // Note: Update these settings based on your email service provider
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    
    const e = escapeHtml;
    const msgHtml = e(formData.message).replace(/\n/g, '<br>');
    const mailOptions = {
      from: process.env.SMTP_FROM || `"Bloom'n Events Co Website" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_EMAIL || 'enquiries@bloomneventsco.com.au',
      replyTo: formData.email,
      subject: `New Contact Form Submission from ${formData.firstName} ${formData.lastName}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${e(formData.firstName)} ${e(formData.lastName)}</p>
        ${formData.company ? `<p><strong>Company:</strong> ${e(formData.company)}</p>` : ''}
        <p><strong>Email:</strong> ${e(formData.email)}</p>
        ${formData.phone ? `<p><strong>Phone:</strong> ${e(formData.phone)}</p>` : ''}
        <p><strong>Message:</strong></p>
        <p>${msgHtml}</p>
        <hr>
        <p><small>Submitted from: ${e(req.headers.referer || 'Unknown')}</small></p>
        <p><small>IP Address: ${e(req.ip)}</small></p>
      `,
      text: `
        New Contact Form Submission
        
        Name: ${formData.firstName} ${formData.lastName}
        ${formData.company ? `Company: ${formData.company}\n` : ''}
        Email: ${formData.email}
        ${formData.phone ? `Phone: ${formData.phone}\n` : ''}
        Message:
        ${formData.message}
      `,
    };
    
    // Send email
    await transporter.sendMail(mailOptions);
    
    const autoReplyOptions = {
      from: process.env.SMTP_FROM || `"Bloom'n Events Co" <${process.env.SMTP_USER}>`,
      to: formData.email,
      subject: 'Thank you for contacting Bloom\'n Events Co',
      html: `
        <p>Dear ${e(formData.firstName)},</p>
        <p>Thank you for contacting Bloom'n Events Co. We have received your message and will get back to you as soon as possible.</p>
        <p>Best regards,<br>The Bloom'n Events Co Team</p>
      `,
      text: `Dear ${formData.firstName},\n\nThank you for contacting Bloom'n Events Co. We have received your message and will get back to you as soon as possible.\n\nBest regards,\nThe Bloom'n Events Co Team`,
    };
    
    // Send auto-reply (don't fail if this fails)
    transporter.sendMail(autoReplyOptions).catch(err => {
      console.error('Auto-reply email failed:', err);
    });
    
    res.status(200).json({
      success: true,
      message: 'Thank you for your message. We will get back to you soon.'
    });
    
  } catch (error) {
    console.error('Contact form submission error:', error);
    res.status(500).json({
      success: false,
      error: 'An error occurred while submitting your form. Please try again later or contact us directly.'
    });
  }
});

export default router;
