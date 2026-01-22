# Security Headers Configuration

This document provides configuration examples for HTTP security headers to be set at the server level (Vercel, Apache, Nginx, or Express.js).

## Required Security Headers

### 1. Content-Security-Policy (CSP)

**Purpose:** Prevents XSS attacks by controlling which resources can be loaded.

**Configuration:**

#### For Vercel (`vercel.json`):
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' cdn.jsdelivr.net www.googletagmanager.com; style-src 'self' 'unsafe-inline' cdn.jsdelivr.net fonts.googleapis.com; font-src 'self' cdn.jsdelivr.net fonts.gstatic.com fonts.googleapis.com; img-src 'self' data: https:; connect-src 'self' www.googletagmanager.com www.google-analytics.com google-analytics.com api.openai.com cdn.jsdelivr.net; frame-src 'self' www.facebook.com widgets.sociablekit.com www.google.com maps.google.com *.googleapis.com; base-uri 'self'; form-action 'self'; upgrade-insecure-requests;"
        }
      ]
    }
  ]
}
```

#### For Apache (`.htaccess`):
```apache
<IfModule mod_headers.c>
    Header always set Content-Security-Policy "default-src 'self'; script-src 'self' cdn.jsdelivr.net www.googletagmanager.com; style-src 'self' 'unsafe-inline' cdn.jsdelivr.net fonts.googleapis.com; font-src 'self' cdn.jsdelivr.net fonts.gstatic.com fonts.googleapis.com; img-src 'self' data: https:; connect-src 'self' www.googletagmanager.com www.google-analytics.com google-analytics.com api.openai.com cdn.jsdelivr.net; frame-src 'self' www.facebook.com widgets.sociablekit.com www.google.com maps.google.com *.googleapis.com; base-uri 'self'; form-action 'self'; upgrade-insecure-requests;"
</IfModule>
```

#### For Express.js (using Helmet):
```javascript
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "cdn.jsdelivr.net", "www.googletagmanager.com"],
    styleSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net", "fonts.googleapis.com"],
    fontSrc: ["'self'", "cdn.jsdelivr.net", "fonts.gstatic.com", "fonts.googleapis.com"],
    imgSrc: ["'self'", "data:", "https:"],
    connectSrc: ["'self'", "www.googletagmanager.com", "www.google-analytics.com", "google-analytics.com", "api.openai.com", "cdn.jsdelivr.net"],
    frameSrc: ["'self'", "www.facebook.com", "widgets.sociablekit.com", "www.google.com", "maps.google.com", "*.googleapis.com"],
    baseUri: ["'self'"],
    formAction: ["'self'"],
    upgradeInsecureRequests: [],
  },
}));
```

**Note:** After moving all inline scripts/styles to external files, remove `'unsafe-inline'` from `style-src` and `script-src`.

### 2. Strict-Transport-Security (HSTS)

**Purpose:** Forces browsers to use HTTPS for all connections.

**Configuration:**

#### Vercel (`vercel.json`):
```json
{
  "key": "Strict-Transport-Security",
  "value": "max-age=31536000; includeSubDomains; preload"
}
```

#### Apache:
```apache
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
```

#### Express.js:
```javascript
app.use(helmet.hsts({
  maxAge: 31536000, // 1 year
  includeSubDomains: true,
  preload: true
}));
```

### 3. X-Frame-Options

**Purpose:** Prevents clickjacking attacks.

**Configuration:**

#### Vercel:
```json
{
  "key": "X-Frame-Options",
  "value": "SAMEORIGIN"
}
```

#### Apache:
```apache
Header always set X-Frame-Options "SAMEORIGIN"
```

#### Express.js:
```javascript
app.use(helmet.frameguard({ action: 'sameorigin' }));
```

### 4. X-Content-Type-Options

**Purpose:** Prevents MIME type sniffing.

**Configuration:**

#### Vercel:
```json
{
  "key": "X-Content-Type-Options",
  "value": "nosniff"
}
```

#### Apache:
```apache
Header always set X-Content-Type-Options "nosniff"
```

#### Express.js:
```javascript
app.use(helmet.noSniff());
```

### 5. Referrer-Policy

**Purpose:** Controls how much referrer information is sent.

**Configuration:**

#### Vercel:
```json
{
  "key": "Referrer-Policy",
  "value": "strict-origin-when-cross-origin"
}
```

#### Apache:
```apache
Header always set Referrer-Policy "strict-origin-when-cross-origin"
```

#### Express.js:
```javascript
app.use(helmet.referrerPolicy({ policy: 'strict-origin-when-cross-origin' }));
```

### 6. Permissions-Policy (formerly Feature-Policy)

**Purpose:** Controls which browser features can be used.

**Configuration:**

#### Vercel:
```json
{
  "key": "Permissions-Policy",
  "value": "geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()"
}
```

#### Apache:
```apache
Header always set Permissions-Policy "geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()"
```

#### Express.js:
```javascript
app.use(helmet.permissionsPolicy({
  features: {
    geolocation: [],
    microphone: [],
    camera: [],
    payment: [],
    usb: [],
    magnetometer: [],
    gyroscope: [],
    accelerometer: [],
  },
}));
```

## Complete Vercel Configuration

Create `vercel.json` in the project root:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' cdn.jsdelivr.net www.googletagmanager.com; style-src 'self' 'unsafe-inline' cdn.jsdelivr.net fonts.googleapis.com; font-src 'self' cdn.jsdelivr.net fonts.gstatic.com fonts.googleapis.com; img-src 'self' data: https:; connect-src 'self' www.googletagmanager.com www.google-analytics.com google-analytics.com api.openai.com cdn.jsdelivr.net; frame-src 'self' www.facebook.com widgets.sociablekit.com www.google.com maps.google.com *.googleapis.com; base-uri 'self'; form-action 'self'; upgrade-insecure-requests;"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains; preload"
        },
        {
          "key": "X-Frame-Options",
          "value": "SAMEORIGIN"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()"
        }
      ]
    }
  ]
}
```

## Testing Security Headers

Use these tools to verify headers are set correctly:

1. **SecurityHeaders.com**: https://securityheaders.com/
2. **Mozilla Observatory**: https://observatory.mozilla.org/
3. **Browser DevTools**: Network tab → Response Headers

## Cookie Security

For cookies set via JavaScript (like cookie consent), ensure:

```javascript
document.cookie = `cookieName=value; expires=${expiryDate.toUTCString()}; path=/; SameSite=Strict; Secure`;
```

For server-side cookies (Express.js):

```javascript
res.cookie('cookieName', 'value', {
  httpOnly: true,    // Prevents JavaScript access
  secure: true,      // HTTPS only
  sameSite: 'strict', // CSRF protection
  maxAge: 365 * 24 * 60 * 60 * 1000 // 1 year
});
```
