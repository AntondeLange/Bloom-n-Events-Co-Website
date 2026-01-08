import nodemailer from 'nodemailer';
import { env } from './env.mjs';

/**
 * Create email transporter
 * Uses environment variables for SMTP configuration
 */
function createTransporter() {
  // If SMTP configuration is provided, use it
  if (env.SMTP_HOST && env.SMTP_PORT && env.SMTP_USER && env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: parseInt(env.SMTP_PORT, 10),
      secure: env.SMTP_SECURE === 'true' || env.SMTP_PORT === '465', // true for 465, false for other ports
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }

  // Otherwise, use Gmail OAuth or default to no authentication (for development)
  // For production, you should set up SMTP credentials
  if (env.NODE_ENV === 'development') {
    console.warn('⚠️  No SMTP configuration found. Email sending will fail in production.');
    console.warn('⚠️  Please configure SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS in Railway.');
    return null;
  }

  throw new Error('SMTP configuration is required for email sending in production');
}

/**
 * Escape HTML to prevent XSS in email templates
 * @param {string} text - Text to escape
 * @returns {string} - Escaped HTML
 */
function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Send contact form email
 * @param {Object} contactData - The contact form data
 * @returns {Promise<Object>} - Email send result
 */
export async function sendContactEmail(contactData) {
  const { firstName, lastName, company, email, message } = contactData;

  // Escape HTML for safety
  const safeFirstName = escapeHtml(firstName);
  const safeLastName = escapeHtml(lastName);
  const safeCompany = company ? escapeHtml(company) : '';
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message);

  const transporter = createTransporter();
  if (!transporter) {
    throw new Error('Email transporter not configured. Please set up SMTP credentials.');
  }

  const enquiriesEmail = env.ENQUIRIES_EMAIL || 'enquiries@bloomneventsco.com.au';

  // Email subject (plain text, no HTML escaping needed)
  const subject = company
    ? `New Contact Form Submission from ${firstName} ${lastName} (${company})`
    : `New Contact Form Submission from ${firstName} ${lastName}`;

  // Email HTML body
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f4f4f4; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
          .content { padding: 20px; background-color: #ffffff; border: 1px solid #ddd; border-radius: 5px; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #555; }
          .value { margin-top: 5px; padding: 10px; background-color: #f9f9f9; border-radius: 3px; }
          .message { white-space: pre-wrap; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>New Contact Form Submission</h2>
          </div>
          <div class="content">
            <div class="field">
              <div class="label">Name:</div>
              <div class="value">${safeFirstName} ${safeLastName}</div>
            </div>
            ${safeCompany ? `
            <div class="field">
              <div class="label">Company:</div>
              <div class="value">${safeCompany}</div>
            </div>
            ` : ''}
            <div class="field">
              <div class="label">Email:</div>
              <div class="value"><a href="mailto:${safeEmail}">${safeEmail}</a></div>
            </div>
            <div class="field">
              <div class="label">Message:</div>
              <div class="value message">${safeMessage.replace(/\n/g, '<br>')}</div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  // Email text version (for email clients that don't support HTML)
  const text = `
New Contact Form Submission

Name: ${firstName} ${lastName}
${company ? `Company: ${company}\n` : ''}Email: ${email}

Message:
${message}
  `.trim();

  const mailOptions = {
    from: env.SMTP_FROM || env.SMTP_USER || enquiriesEmail,
    to: enquiriesEmail,
    replyTo: email,
    subject: subject,
    text: text,
    html: html,
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
}

