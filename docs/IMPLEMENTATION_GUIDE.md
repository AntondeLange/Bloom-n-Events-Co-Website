# Implementation Guide

This guide provides step-by-step instructions for implementing the refactoring changes.

## Prerequisites

1. Node.js 18+ installed
2. npm or yarn package manager
3. Access to the production server (Vercel/GitHub Pages)

## Step 1: Install Dependencies

```bash
npm install
```

This installs:
- Vite (build tool)
- Sharp (image optimization)
- PostCSS plugins (CSS processing)
- Stylelint (CSS linting)

## Step 2: Optimize Images

### 2.1 Run Image Optimization Script

```bash
npm run optimize-images
```

This will:
- Convert images to WebP and AVIF formats
- Generate responsive sizes (480w, 768w, 1200w, 1600w)
- Create optimized fallback images
- Output to `assets/images/optimized/`

### 2.2 Update HTML with Optimized Images

Replace existing image tags with the optimized versions:

**Before:**
```html
<img src="assets/images/Home/Corporate Events Hero Image.jpg" 
     alt="Corporate events" 
     loading="lazy">
```

**After:**
```html
<picture>
  <source type="image/avif" 
          srcset="assets/images/optimized/Home/Corporate Events Hero Image-480w.avif 480w,
                  assets/images/optimized/Home/Corporate Events Hero Image-768w.avif 768w,
                  assets/images/optimized/Home/Corporate Events Hero Image-1200w.avif 1200w,
                  assets/images/optimized/Home/Corporate Events Hero Image-1600w.avif 1600w"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw">
  <source type="image/webp" 
          srcset="assets/images/optimized/Home/Corporate Events Hero Image-480w.webp 480w,
                  assets/images/optimized/Home/Corporate Events Hero Image-768w.webp 768w,
                  assets/images/optimized/Home/Corporate Events Hero Image-1200w.webp 1200w,
                  assets/images/optimized/Home/Corporate Events Hero Image-1600w.webp 1600w"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw">
  <img src="assets/images/optimized/Home/Corporate Events Hero Image-fallback.jpg" 
       srcset="assets/images/optimized/Home/Corporate Events Hero Image-480w.webp 480w,
               assets/images/optimized/Home/Corporate Events Hero Image-768w.webp 768w,
               assets/images/optimized/Home/Corporate Events Hero Image-1200w.webp 1200w,
               assets/images/optimized/Home/Corporate Events Hero Image-1600w.webp 1600w"
       sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
       alt="Corporate event planning and production services in Perth and Western Australia"
       loading="lazy"
       decoding="async"
       width="1600"
       height="900">
</picture>
```

### 2.3 Use Helper Script for Batch Updates

You can use the `generate-srcset.js` script to generate HTML for multiple images:

```javascript
import { generateImageHTML } from './scripts/generate-srcset.js';

const html = generateImageHTML(
  'Home/Corporate Events Hero Image',
  'Corporate event planning and production services',
  '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
);
```

## Step 3: Move Inline Scripts to External Files

### 3.1 Update HTML to Use External Scripts

**Before (inline script in `index.html`):**
```html
<script>
  // Google Analytics code...
</script>
```

**After:**
```html
<script src="assets/js/analytics.js" defer></script>
<script src="assets/js/cookie-consent.js" defer></script>
<script src="assets/js/utils.js" defer></script>
```

### 3.2 Remove Inline Scripts

1. Remove all `<script>` tags that don't have `src` attributes
2. Move their content to appropriate external files
3. Update HTML to reference the external files with `defer` or `async`

### 3.3 Update CSP

After moving all inline scripts, update CSP to remove `'unsafe-inline'`:

**Before:**
```
script-src 'self' 'unsafe-inline' cdn.jsdelivr.net
```

**After:**
```
script-src 'self' cdn.jsdelivr.net
```

## Step 4: Extract Inline Styles

### 4.1 Move Critical CSS

Extract inline `<style>` blocks to `assets/css/critical.css`:

**Before:**
```html
<style>
  /* Critical above-the-fold styles */
  body { margin: 0; }
</style>
```

**After:**
```html
<link rel="stylesheet" href="assets/css/critical.css">
```

### 4.2 Update CSP for Styles

After moving inline styles, update CSP:

**Before:**
```
style-src 'self' 'unsafe-inline' cdn.jsdelivr.net
```

**After:**
```
style-src 'self' cdn.jsdelivr.net
```

## Step 5: Build for Production

### 5.1 Development Build

```bash
npm run dev
```

Starts development server at `http://localhost:3000`

### 5.2 Production Build

```bash
npm run build
```

This will:
- Bundle and minify JavaScript
- Minify CSS
- Optimize assets
- Generate hashed filenames for cache busting
- Output to `dist/` directory

### 5.3 Preview Production Build

```bash
npm run preview
```

Starts preview server at `http://localhost:4173`

## Step 6: Deploy to Vercel

### 6.1 Configure Vercel

1. Ensure `vercel.json` is in the project root
2. Connect your GitHub repository to Vercel
3. Vercel will automatically detect the build settings

### 6.2 Build Settings

Vercel will use:
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### 6.3 Verify Security Headers

After deployment, verify headers are set correctly:

```bash
curl -I https://www.bloomneventsco.com.au/
```

Or use online tools:
- https://securityheaders.com/
- https://observatory.mozilla.org/

## Step 7: Accessibility Improvements

### 7.1 Add Alt Text to All Images

Audit all images and ensure they have meaningful `alt` attributes:

```html
<!-- Informative image -->
<img src="..." alt="Corporate event setup with floral arrangements and lighting">

<!-- Decorative image -->
<img src="..." alt="">
```

### 7.2 Test Color Contrast

Use tools to test color contrast:
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- Chrome DevTools: Lighthouse audit

Update colors in `assets/css/tokens.css` if needed.

### 7.3 Add Focus Styles

Ensure all interactive elements have visible focus styles:

```css
a:focus,
button:focus,
input:focus,
select:focus,
textarea:focus {
  outline: 2px solid var(--coreGold);
  outline-offset: 2px;
}
```

## Step 8: SEO Improvements

### 8.1 Create Unique Meta Descriptions

Update each HTML page with a unique meta description:

```html
<meta name="description" content="Unique description for this specific page (150-160 characters)">
```

### 8.2 Add Open Graph Tags

Ensure all pages have proper Open Graph tags:

```html
<meta property="og:title" content="Page Title">
<meta property="og:description" content="Page description">
<meta property="og:image" content="https://www.bloomneventsco.com.au/assets/images/og-image.jpg">
<meta property="og:url" content="https://www.bloomneventsco.com.au/page.html">
```

## Step 9: Testing

### 9.1 Performance Testing

Run Lighthouse audits:
1. Open Chrome DevTools
2. Go to Lighthouse tab
3. Run audit for Performance, Accessibility, SEO, Best Practices

Target scores:
- Performance: 90+
- Accessibility: 100
- SEO: 100
- Best Practices: 90+

### 9.2 Cross-Browser Testing

Test on:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

### 9.3 Responsive Testing

Test at breakpoints:
- 320px (mobile)
- 375px (mobile)
- 768px (tablet)
- 1024px (tablet)
- 1280px (desktop)
- 1920px (desktop)

## Step 10: Monitoring

### 10.1 Set Up Monitoring

- Google Analytics: Track Core Web Vitals
- Vercel Analytics: Monitor performance
- Uptime monitoring: Track availability

### 10.2 Regular Audits

Schedule monthly:
- Dependency updates (`npm audit`)
- Security header verification
- Performance audits
- Accessibility audits

## Troubleshooting

### Images Not Loading

- Check file paths are correct
- Verify optimized images exist in `assets/images/optimized/`
- Check browser console for errors

### Scripts Not Working

- Verify scripts are loaded (check Network tab)
- Check for CSP violations in console
- Ensure `defer` or `async` attributes are correct

### Build Errors

- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version` (should be 18+)
- Review build logs for specific errors

## Next Steps

1. Complete image optimization for all pages
2. Move remaining inline scripts/styles
3. Update all meta descriptions
4. Test accessibility with screen readers
5. Monitor performance metrics
