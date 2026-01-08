# Contact Form Email Setup

The contact form now sends emails directly to the enquiries email address instead of storing data in MongoDB.

## What Changed

1. **Removed MongoDB dependency** from contact form route
2. **Added email sending** using `nodemailer`
3. **Simplified contact route** - now just validates and sends email

## Environment Variables Required

Add these to your Railway environment variables:

### Required for Email Sending

```env
# Email address to receive contact form submissions
ENQUIRIES_EMAIL=enquiries@bloomneventsco.com.au

# SMTP Configuration (use your email provider's SMTP settings)
SMTP_HOST=smtp.gmail.com              # Your SMTP server hostname
SMTP_PORT=587                         # SMTP port (587 for TLS, 465 for SSL)
SMTP_USER=your-email@gmail.com        # Your SMTP username/email
SMTP_PASS=your-app-password           # Your SMTP password or app password
SMTP_SECURE=false                     # 'true' for port 465 (SSL), 'false' for port 587 (TLS)

# Optional: From address (defaults to SMTP_USER if not set)
SMTP_FROM=enquiries@bloomneventsco.com.au
```

### SMTP Configuration Examples

#### Gmail
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password        # Use App Password, not regular password
SMTP_SECURE=false
```

**Note:** For Gmail, you need to:
1. Enable 2-factor authentication
2. Generate an "App Password" at https://myaccount.google.com/apppasswords
3. Use the app password as `SMTP_PASS`

#### Outlook/Office365
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
SMTP_SECURE=false
```

#### Custom SMTP Server
```env
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587
SMTP_USER=enquiries@yourdomain.com
SMTP_PASS=your-password
SMTP_SECURE=false
```

## Setup Steps

1. **Add environment variables in Railway:**
   - Go to Railway Dashboard → Your Service → Variables
   - Add all required SMTP variables
   - Add `ENQUIRIES_EMAIL=enquiries@bloomneventsco.com.au`

2. **Redeploy:**
   - Railway will automatically redeploy when environment variables change
   - Or manually trigger a redeploy

3. **Test:**
   - Submit the contact form on your live site
   - Check that the email arrives at `enquiries@bloomneventsco.com.au`

## Email Format

The contact form sends a nicely formatted HTML email with:
- **Subject:** "New Contact Form Submission from [Name] ([Company])"
- **From:** Your configured SMTP_FROM address
- **To:** `enquiries@bloomneventsco.com.au`
- **Reply-To:** The submitter's email address
- **Content:** Formatted display of all form fields (name, company, email, message)

## Testing Locally

For local development, email sending will fail if SMTP is not configured. You can:

1. **Set up SMTP credentials** in `backend/.env` (same format as Railway)
2. **Use a test email service** like Mailtrap for development

## Troubleshooting

### Email not sending
- Check Railway logs for error messages
- Verify all SMTP environment variables are set correctly
- Test SMTP credentials with an email client first
- Check that your email provider allows SMTP from Railway's IPs

### "Email transporter not configured" error
- Ensure all required SMTP variables are set in Railway
- Check that SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS are all configured

### Gmail authentication errors
- Make sure you're using an App Password, not your regular password
- Verify 2-factor authentication is enabled
- Check that "Less secure app access" is disabled (use App Passwords instead)

## Files Changed

- ✅ `backend/src/routes/contact.js` - Removed MongoDB, added email sending
- ✅ `backend/src/config/email.js` - New email sending utility
- ✅ `backend/src/config/env.mjs` - Added email environment variables
- ✅ `backend/src/server.js` - Made MongoDB optional
- ✅ `backend/package.json` - Added `nodemailer` dependency

## Benefits

- ✅ **Simpler setup** - No MongoDB required for contact form
- ✅ **Direct delivery** - Emails go straight to enquiries inbox
- ✅ **No database management** - No need to monitor or query MongoDB
- ✅ **Reply functionality** - Reply-To is set to submitter's email
- ✅ **Formatted emails** - Professional HTML email format

