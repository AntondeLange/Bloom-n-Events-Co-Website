/**
 * Vercel serverless function for contact form API
 * POST /api/contact
 */

import nodemailer from 'nodemailer';
import { getEnv } from './_utils/env.js';
import { setCorsHeaders, handleCorsPreflight } from './_utils/cors.js';
import { checkRateLimit } from './_utils/rateLimit.js';

function escapeHtml(s) {
  if (typeof s !== 'string') return '';
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Validation schema
function validateContactForm(body) {
  if (!body || typeof body !== 'object') {
    throw new Error('Invalid request body');
  }
  
  const { firstName, lastName, email, message, company, phone, website } = body;
  
  if (!firstName || typeof firstName !== 'string' || firstName.trim().length === 0) {
    throw new Error('First name is required');
  }
  if (firstName.length > 100) {
    throw new Error('First name too long (max 100 characters)');
  }
  
  if (!lastName || typeof lastName !== 'string' || lastName.trim().length === 0) {
    throw new Error('Last name is required');
  }
  if (lastName.length > 100) {
    throw new Error('Last name too long (max 100 characters)');
  }
  
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    throw new Error('Valid email is required');
  }
  if (email.length > 255) {
    throw new Error('Email too long (max 255 characters)');
  }
  
  if (!message || typeof message !== 'string' || message.trim().length < 10) {
    throw new Error('Message is required and must be at least 10 characters');
  }
  if (message.length > 2000) {
    throw new Error('Message too long (max 2000 characters)');
  }
  
  // Optional fields
  if (company && company.length > 200) {
    throw new Error('Company name too long (max 200 characters)');
  }
  if (phone && phone.length > 20) {
    throw new Error('Phone number too long (max 20 characters)');
  }
  
  return {
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: email.trim(),
    message: message.trim(),
    company: company?.trim() || '',
    phone: phone?.trim() || '',
    website: (typeof website === 'string' ? website : '').trim()
  };
}

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return handleCorsPreflight(req, res);
  }
  
  // Set CORS headers
  setCorsHeaders(req, res);
  
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Rate limiting: 5 submissions per 15 minutes
  const rateLimit = checkRateLimit(req, 'contact', 15 * 60 * 1000, 5);
  if (!rateLimit.allowed) {
    res.setHeader('Retry-After', Math.ceil((rateLimit.resetTime - Date.now()) / 1000));
    return res.status(429).json({
      success: false,
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
    });
  }
  
  try {
    // Validate request
    let formData;
    try {
      formData = validateContactForm(req.body);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Invalid form data',
        message: error.message
      });
    }
    
    // Honeypot check - if website field has value, it's likely a bot
    if (formData.website && formData.website.trim() !== '') {
      // Silently fail for bots
      return res.status(200).json({
        success: true,
        message: 'Thank you for your message. We will get back to you soon.'
      });
    }
    
    const env = getEnv();
    
    // Check if email is configured
    if (!env.SMTP_USER || !env.SMTP_PASS) {
      console.warn('Email not configured - form submission received but not sent');
      // Still return success to user, but log the submission
      console.log('Form submission:', {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        message: formData.message.substring(0, 100) + '...'
      });
      
      return res.status(200).json({
        success: true,
        message: 'Thank you for your message. We will get back to you soon.'
      });
    }
    
    // Configure email transporter
    const transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
    
    const e = escapeHtml;
    const msgHtml = e(formData.message).replace(/\n/g, '<br>');
    const mailOptions = {
      from: env.SMTP_FROM,
      to: env.ENQUIRIES_EMAIL,
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
        <p><small>IP Address: ${e(req.headers['x-forwarded-for']?.split(',')[0] || req.headers['x-real-ip'] || 'Unknown')}</small></p>
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
    
    // Send auto-reply to user
    const autoReplyOptions = {
      from: env.SMTP_FROM,
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
    
    // Add rate limit headers
    res.setHeader('X-RateLimit-Remaining', rateLimit.remaining);
    
    return res.status(200).json({
      success: true,
      message: 'Thank you for your message. We will get back to you soon.'
    });
    
  } catch (error) {
    console.error('Contact form submission error:', error);
    return res.status(500).json({
      success: false,
      error: 'An error occurred while submitting your form. Please try again later or contact us directly.'
    });
  }
}
