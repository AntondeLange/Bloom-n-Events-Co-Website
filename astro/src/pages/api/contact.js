import fs from 'node:fs/promises';
import path from 'node:path';
import nodemailer from 'nodemailer';
import { getEnv } from './_utils/env.js';
import { checkRateLimit, getClientIp } from './_utils/rateLimit.js';
import { handleCorsPreflight, withCors } from './_utils/cors.js';

export const prerender = false;

const MESSAGE_MIN = 10;
const MESSAGE_MAX = 200;

function escapeHtml(s) {
  if (typeof s !== 'string') return '';
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function parseRequestBody(request) {
  const contentType = (request.headers.get('content-type') || '').toLowerCase();

  if (contentType.includes('application/json')) {
    try {
      const parsed = await request.json();
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
      return {};
    } catch {
      return {};
    }
  }

  if (
    contentType.includes('application/x-www-form-urlencoded') ||
    contentType.includes('multipart/form-data')
  ) {
    const formData = await request.formData();
    return Object.fromEntries(formData.entries());
  }

  const text = await request.text();
  if (text.includes('=')) {
    return Object.fromEntries(new URLSearchParams(text).entries());
  }

  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === 'object') {
      return parsed;
    }
  } catch {
    return {};
  }

  return {};
}

function wantsHtmlResponse(request) {
  const contentType = (request.headers.get('content-type') || '').toLowerCase();
  const accept = (request.headers.get('accept') || '').toLowerCase();
  const isFormPost =
    contentType.includes('application/x-www-form-urlencoded') ||
    contentType.includes('multipart/form-data');
  return isFormPost && accept.includes('text/html');
}

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

  if (!message || typeof message !== 'string' || message.trim().length < MESSAGE_MIN) {
    throw new Error(`Message is required and must be at least ${MESSAGE_MIN} characters`);
  }
  if (message.length > MESSAGE_MAX) {
    throw new Error(`Message too long (max ${MESSAGE_MAX} characters)`);
  }

  if (company && String(company).length > 200) {
    throw new Error('Company name too long (max 200 characters)');
  }
  if (phone && String(phone).length > 20) {
    throw new Error('Phone number too long (max 20 characters)');
  }

  return {
    firstName: String(firstName).trim(),
    lastName: String(lastName).trim(),
    email: String(email).trim(),
    message: String(message).trim(),
    company: typeof company === 'string' ? company.trim() : '',
    phone: typeof phone === 'string' ? phone.trim() : '',
    website: typeof website === 'string' ? website.trim() : '',
  };
}

function getRequestContext(request) {
  const requestId =
    request.headers.get('x-request-id') ||
    request.headers.get('x-amzn-trace-id') ||
    `${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  return {
    requestId,
    timestamp: new Date().toISOString(),
  };
}

function json(payload, status = 200, extraHeaders) {
  const headers = new Headers({
    'content-type': 'application/json; charset=utf-8',
  });

  if (extraHeaders) {
    for (const [key, value] of Object.entries(extraHeaders)) {
      headers.set(key, String(value));
    }
  }

  return new Response(JSON.stringify(payload), {
    status,
    headers,
  });
}

function redirectTo(location) {
  return new Response(null, {
    status: 303,
    headers: {
      Location: location,
    },
  });
}

async function backlogSubmission(formData, request, env, note = 'Stored offline because SMTP not configured') {
  const backlogDir = path.resolve(env.CONTACT_BACKLOG_DIR || '/tmp');
  const backlogPath = path.join(backlogDir, 'contact-backlog.log');

  try {
    await fs.mkdir(backlogDir, { recursive: true });
    const { requestId, timestamp } = getRequestContext(request);
    const entry = {
      requestId,
      timestamp,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      company: formData.company,
      message: formData.message,
      category: 'EmailService',
      note,
    };
    await fs.appendFile(backlogPath, JSON.stringify(entry) + '\n');
    console.info('Contact form submission queued for manual review', { requestId, timestamp });
  } catch (error) {
    console.error('Failed to backlog contact form submission', error);
  }
}

function respondQueued(useHtmlRedirect, rateLimit, request) {
  if (useHtmlRedirect) {
    return withCors(redirectTo('/contact-success?queued=1'), request);
  }

  return withCors(
    json(
      {
        success: true,
        queued: true,
        message: 'Thanks for reaching out. Your enquiry has been received and queued for manual follow-up.',
      },
      202,
      {
        'X-RateLimit-Remaining': rateLimit.remaining,
      },
    ),
    request,
  );
}

export const OPTIONS = async ({ request }) => handleCorsPreflight(request);

export const POST = async ({ request }) => {
  const useHtmlRedirect = wantsHtmlResponse(request);

  const rateLimit = checkRateLimit(request, 'contact', 15 * 60 * 1000, 5);
  if (!rateLimit.allowed) {
    return withCors(
      json(
        {
          success: false,
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
        },
        429,
        {
          'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
        },
      ),
      request,
    );
  }

  let formData;
  try {
    const parsedBody = await parseRequestBody(request);
    formData = validateContactForm(parsedBody);
  } catch (error) {
    return withCors(
      json(
        {
          success: false,
          error: 'Invalid form data',
          message: error instanceof Error ? error.message : 'Validation failed',
        },
        400,
      ),
      request,
    );
  }

  if (formData.website && formData.website.trim() !== '') {
    if (useHtmlRedirect) {
      return withCors(redirectTo('/contact-success'), request);
    }

    return withCors(
      json({
        success: true,
        message: 'Thank you for your message. We will get back to you soon.',
      }),
      request,
    );
  }

  const env = getEnv();

  if (!env.SMTP_USER || !env.SMTP_PASS) {
    console.warn('Email not configured - form submission received but not sent');
    await backlogSubmission(formData, request, env);
    return respondQueued(useHtmlRedirect, rateLimit, request);
  }

  try {
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
    const clientIp = getClientIp(request);
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
        <p><small>Submitted from: ${e(request.headers.get('referer') || 'Unknown')}</small></p>
        <p><small>IP Address: ${e(clientIp)}</small></p>
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

    await transporter.sendMail(mailOptions);

    const autoReplyOptions = {
      from: env.SMTP_FROM,
      to: formData.email,
      subject: "Thank you for contacting Bloom'n Events Co",
      html: `
        <p>Dear ${e(formData.firstName)},</p>
        <p>Thank you for contacting Bloom'n Events Co. We have received your message and will get back to you as soon as possible.</p>
        <p>Best regards,<br>The Bloom'n Events Co Team</p>
      `,
      text: `Dear ${formData.firstName},\n\nThank you for contacting Bloom'n Events Co. We have received your message and will get back to you as soon as possible.\n\nBest regards,\nThe Bloom'n Events Co Team`,
    };

    transporter.sendMail(autoReplyOptions).catch((err) => {
      console.error('Auto-reply email failed:', err);
    });
  } catch (emailError) {
    console.error('Primary contact email failed; queuing submission for manual follow-up', {
      code: emailError?.code || 'unknown',
      command: emailError?.command || 'unknown',
      message: emailError?.message || 'unknown',
    });
    await backlogSubmission(
      formData,
      request,
      env,
      'Stored offline because SMTP delivery failed',
    );
    return respondQueued(useHtmlRedirect, rateLimit, request);
  }

  if (useHtmlRedirect) {
    return withCors(redirectTo('/contact-success'), request);
  }

  return withCors(
    json(
      {
        success: true,
        message: 'Thank you for your message. We will get back to you soon.',
      },
      200,
      {
        'X-RateLimit-Remaining': rateLimit.remaining,
      },
    ),
    request,
  );
};
