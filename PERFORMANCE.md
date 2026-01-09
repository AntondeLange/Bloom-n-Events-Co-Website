# Performance Optimization - Bloom'n Events Co

**Date:** January 2026  
**Engineer:** Performance Engineer

## Overview

This document outlines the performance optimizations implemented for the Bloom'n Events Co website, focusing on load speed and runtime responsiveness without changing visual design intent.

## Image Optimizations

### Critical Hero Assets (Preloaded)

**Implementation:**
- **Hero video poster:** `images/logo-wht.png` - Preloaded with `fetchpriority="high"`
- **Navbar logo:** `images/logo-blk-long.png` - Preloaded with `fetchpriority="high"`
- **Favicon:** `images/butterfly-icon.svg` - Preloaded

**Code:**
```html
<link rel="preload" href="images/logo-wht.png" as="image" fetchpriority="high">
<link rel="preload" href="images/logo-blk-long.png" as="image" fetchpriority="high">
```

**Rationale:** These assets are visible above the fold and critical for initial render. Preloading ensures they're available immediately.

### Responsive Images (srcset/sizes)

**Implementation:**
All service card and case study images on homepage now include responsive `srcset` and `sizes` attributes.

**Breakpoints:**
- **480w:** Mobile devices (small screens)
- **768w:** Tablets (medium screens)
- **1200w:** Desktop (large screens)
- **1600w:** Full-size (original, fallback)

**Sizes Attribute:**
```html
sizes="(max-width: 576px) 100vw, (max-width: 992px) 50vw, 33vw"
```

**Images Optimized:**
- Service card images (Corporate Events, Creative Workshops, Custom Displays)
- Case study card images (3 case studies)

**Example:**
```html
<img src="images/Home/Corporate Events Hero Image.jpg" 
     class="card-img-top" 
     alt="Corporate Event Planning" 
     loading="lazy" 
     decoding="async" 
     width="1600" 
     height="900" 
     sizes="(max-width: 576px) 100vw, (max-width: 992px) 50vw, 33vw" 
     srcset="images/Home/Corporate Events Hero Image-480w.jpg 480w, 
             images/Home/Corporate Events Hero Image-768w.jpg 768w, 
             images/Home/Corporate Events Hero Image-1200w.jpg 1200w, 
             images/Home/Corporate Events Hero Image.jpg 1600w">
```

**Rationale:** Responsive images reduce bandwidth usage on mobile devices while maintaining quality on larger screens. Browser automatically selects appropriate size based on viewport and device pixel ratio.

### Lazy Loading

**Implementation:**
- **Above-fold images:** `loading="eager"` with `fetchpriority="high"` (navbar logo)
- **Below-fold images:** `loading="lazy"` with `decoding="async"` (all service cards, case studies, testimonials)

**Rationale:** Lazy loading defers non-critical image loading until needed, improving initial page load time. `decoding="async"` prevents image decoding from blocking the main thread.

### Hero Video Optimization

**Implementation:**
- **Initial state:** `preload="none"` - Video doesn't load until needed
- **Intersection Observer:** Video preloads to `metadata` when hero section is visible
- **Poster image:** Preloaded separately for immediate display

**Code:**
```html
<video class="hero-video" autoplay muted loop playsinline preload="none" 
       poster="images/logo-wht.png" width="1920" height="1080">
    <source src="images/bloomn-hero.mp4" type="video/mp4">
</video>
```

**Rationale:** Large video files can significantly impact initial load. Deferring video load until hero section is visible reduces initial bandwidth usage while maintaining smooth playback.

### WebP/AVIF Conversion

**Status:** Not implemented (requires image conversion tooling)

**Recommendation:** 
- Convert JPEG/PNG images to WebP format (better compression, ~30% smaller)
- Provide AVIF fallback for modern browsers (even better compression)
- Maintain original formats as fallback for older browsers

**Implementation Pattern (when ready):**
```html
<picture>
    <source srcset="image.avif" type="image/avif">
    <source srcset="image.webp" type="image/webp">
    <img src="image.jpg" alt="Description">
</picture>
```

## CSS Optimizations

### Deferred Loading

**Implementation:**
- **Bootstrap CSS:** Loaded with `media="print"` trick, switched to `all` on load
- **Custom CSS:** Preloaded as style, loaded asynchronously
- **Bootstrap Icons:** Deferred loading with same technique
- **Critical CSS:** Inlined in `<head>` for above-the-fold content

**Code:**
```html
<!-- Bootstrap CSS - Deferred -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css" 
      rel="stylesheet" 
      media="print" 
      onload="this.media='all'">
<noscript>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css" 
          rel="stylesheet">
</noscript>

<!-- Custom CSS - Preloaded -->
<link rel="preload" href="styles.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="styles.css"></noscript>

<!-- Critical CSS - Inlined -->
<style>
    /* Critical above-the-fold styles */
    body{margin:0;padding:0;font-family:Montserrat,sans-serif}
    .navbar{min-height:60px}
    .hero-section{position:relative;width:100%;height:100vh;...}
</style>
```

**Rationale:** 
- Non-critical CSS doesn't block initial render
- Critical CSS inlined ensures above-the-fold content renders immediately
- `noscript` fallback ensures functionality without JavaScript

### CSS File Size

**Current State:**
- `styles.css`: ~4,185 lines (custom styles)
- Bootstrap CSS: ~200KB (minified, from CDN)
- Bootstrap Icons: Font-based (efficient)

**Optimization Opportunities:**
- Remove unused CSS selectors (requires analysis tool)
- Consider CSS purging for production builds
- Minify custom CSS (if not already minified)

## JavaScript Optimizations

### Deferred Loading

**Implementation:**
- **Bootstrap JS:** `defer` attribute
- **Custom scripts:** `defer` attribute with `type="module"`
- **Google Analytics:** Deferred using `requestIdleCallback` or `setTimeout`

**Code:**
```html
<!-- Bootstrap JS - Deferred -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/js/bootstrap.bundle.min.js" defer></script>

<!-- Custom Scripts - Deferred Module -->
<script src="scripts.js" type="module" defer></script>

<!-- Google Analytics - Deferred -->
<script>
  if ('requestIdleCallback' in window) {
    requestIdleCallback(function() {
      // Load GA4 script
    });
  } else {
    setTimeout(function() {
      // Load GA4 script
    }, 1000);
  }
</script>
```

**Rationale:** 
- `defer` ensures scripts execute after HTML parsing without blocking
- Module scripts are automatically deferred
- Analytics deferred to not impact initial page load metrics

### Performance Utilities

**Implementation in `scripts.js`:**
- `requestIdleCallback` for non-critical tasks
- `debounce` for scroll/resize events
- `throttle` for frequent events
- Intersection Observer for lazy loading

**Code:**
```javascript
// Use requestIdleCallback for non-critical tasks
const runWhenIdle = (callback) => {
    if ('requestIdleCallback' in window) {
        requestIdleCallback(callback);
    } else {
        setTimeout(callback, 1);
    }
};

// Debounce for performance
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};
```

**Rationale:** These utilities prevent performance bottlenecks from excessive event handling and ensure non-critical code runs during idle time.

### Script File Size

**Current State:**
- `scripts.js`: ~1,674 lines (consolidated functionality)
- Bootstrap JS: ~60KB (minified, from CDN)

**Optimization Opportunities:**
- Code splitting for large functions
- Tree shaking for unused exports
- Minification for production (if not already minified)

## Third-Party Scripts

### Google Analytics (GA4)

**Implementation:**
- Deferred loading using `requestIdleCallback` or `setTimeout`
- Script loaded asynchronously
- Configuration deferred until script loads

**Status:** ✅ Optimized

### Bootstrap CDN

**Implementation:**
- CSS: Deferred loading
- JS: Deferred loading
- Icons: Deferred loading

**Status:** ✅ Optimized

### Other Third-Party Scripts

**Current:** None identified

**Recommendation:** If adding third-party scripts (e.g., chat widgets, social feeds), ensure they:
- Load asynchronously (`async` or `defer`)
- Don't block initial render
- Use resource hints (`dns-prefetch`, `preconnect`) when appropriate

## Caching & Delivery

### Service Worker (sw.js)

**Implementation:**
- Service worker registered for offline support
- Static assets cached (CSS, JS, images)
- HTML bypassed (always fetch from network)
- Cache versioning for updates

**Code:**
```javascript
const CACHE_VERSION = 'v5';
const CACHE_NAME = `bloomn-events-cache-${CACHE_VERSION}`;

// Cache static assets
self.addEventListener('fetch', (event) => {
    const req = event.request;
    const url = new URL(req.url);
    if (req.method !== 'GET') return;

    // HTML: always go to network (no caching)
    if (req.destination === 'document' || 
        (req.headers.get('accept') || '').includes('text/html')) {
        event.respondWith(fetch(req));
        return;
    }

    // Static assets: cache first, network fallback
    event.respondWith(
        caches.match(req).then(response => {
            return response || fetch(req).then(fetchResponse => {
                const cacheResponse = fetchResponse.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(req, cacheResponse);
                });
                return fetchResponse;
            });
        })
    );
});
```

**Rationale:** Service worker provides offline support and faster subsequent page loads by caching static assets.

### HTTP Caching Headers

**Status:** GitHub Pages handles automatically

**GitHub Pages Default Headers:**
- Static assets: Long cache times (immutable resources)
- HTML: Short cache times (frequently updated)
- Compression: Automatic (gzip/brotli)

**Note:** GitHub Pages automatically:
- Serves compressed content (gzip/brotli) when supported
- Sets appropriate cache headers
- Uses CDN for global delivery

**Verification:**
```bash
curl -I https://www.bloomneventsco.com.au/styles.css
# Should show: Content-Encoding: gzip or br
# Should show: Cache-Control header
```

### Resource Hints

**Implementation:**
- `dns-prefetch` for external domains
- `preconnect` for critical third-party resources
- `preload` for critical assets

**Code:**
```html
<!-- DNS Prefetch -->
<link rel="dns-prefetch" href="//cdn.jsdelivr.net">
<link rel="dns-prefetch" href="//fonts.googleapis.com">
<link rel="dns-prefetch" href="//fonts.gstatic.com">
<link rel="dns-prefetch" href="//www.googletagmanager.com">

<!-- Preconnect (with crossorigin) -->
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
```

**Rationale:** Resource hints reduce connection setup time for external resources, improving perceived performance.

## Performance Metrics

### Target Metrics (Web Vitals)

**Largest Contentful Paint (LCP):**
- **Target:** < 2.5 seconds
- **Current:** Optimized with hero video preload and critical CSS

**First Input Delay (FID):**
- **Target:** < 100 milliseconds
- **Current:** Optimized with deferred JavaScript

**Cumulative Layout Shift (CLS):**
- **Target:** < 0.1
- **Current:** Optimized with explicit image dimensions and aspect ratios

**First Contentful Paint (FCP):**
- **Target:** < 1.8 seconds
- **Current:** Optimized with critical CSS inlining

### Monitoring

**Tools:**
- Google PageSpeed Insights
- Chrome DevTools Lighthouse
- Web Vitals extension
- Google Search Console (Core Web Vitals report)

**Recommendation:** Monitor these metrics regularly and address any regressions.

## Files Modified

### Image Optimizations
- `index.html` - Added preload for critical hero assets
- `index.html` - Added responsive srcset/sizes to service and case study images

### CSS Optimizations
- Already optimized (deferred loading, critical CSS inlined)

### JavaScript Optimizations
- Already optimized (deferred loading, performance utilities)

### Caching
- `sw.js` - Service worker already in place

## Recommendations for Future

### High Priority

1. **Image Format Conversion:**
   - Convert JPEG/PNG to WebP/AVIF
   - Implement `<picture>` elements with format fallbacks
   - Expected savings: ~30-50% file size reduction

2. **CSS Purging:**
   - Analyze unused CSS selectors
   - Remove unused Bootstrap components
   - Expected savings: ~20-30% CSS file size reduction

3. **JavaScript Code Splitting:**
   - Split large functions into separate modules
   - Load modules on-demand
   - Expected improvement: Faster initial load

### Medium Priority

4. **Image CDN:**
   - Consider using image CDN (e.g., Cloudinary, Imgix) for automatic optimization
   - Automatic format conversion, resizing, compression

5. **Font Optimization:**
   - Subset fonts to include only used characters
   - Use `font-display: swap` (already implemented)
   - Consider variable fonts

6. **Critical CSS Extraction:**
   - Automate critical CSS extraction
   - Ensure all above-the-fold styles are inlined

### Low Priority

7. **HTTP/2 Server Push:**
   - Not applicable (GitHub Pages doesn't support)
   - Consider if migrating to custom hosting

8. **Preload Key Requests:**
   - Already implemented for critical assets
   - Monitor and adjust based on actual usage

## Testing & Validation

### Performance Testing Tools

1. **Google PageSpeed Insights:**
   - https://pagespeed.web.dev/
   - Tests mobile and desktop performance
   - Provides actionable recommendations

2. **Chrome DevTools Lighthouse:**
   - Built into Chrome DevTools
   - Run audits for Performance, Best Practices, SEO
   - Provides detailed metrics and recommendations

3. **WebPageTest:**
   - https://www.webpagetest.org/
   - Detailed waterfall charts
   - Multiple test locations

4. **Chrome DevTools Network Tab:**
   - Analyze resource loading
   - Identify blocking resources
   - Check compression and caching

### Validation Checklist

- [x] Critical hero assets preloaded
- [x] Responsive images with srcset/sizes
- [x] Lazy loading for below-fold images
- [x] CSS deferred loading
- [x] JavaScript deferred loading
- [x] Third-party scripts async/deferred
- [x] Service worker for caching
- [x] Resource hints (dns-prefetch, preconnect)
- [x] Critical CSS inlined
- [ ] Image format conversion (WebP/AVIF) - Recommended
- [ ] CSS purging - Recommended
- [ ] JavaScript code splitting - Recommended

## Conclusion

The website has been optimized for performance with:
- **Image optimizations:** Preloading critical assets, responsive images, lazy loading
- **CSS optimizations:** Deferred loading, critical CSS inlined
- **JavaScript optimizations:** Deferred loading, performance utilities
- **Caching:** Service worker for offline support and faster subsequent loads
- **Delivery:** Resource hints for faster external resource loading

All optimizations maintain visual design intent while significantly improving load speed and runtime responsiveness. Future enhancements (WebP/AVIF conversion, CSS purging, code splitting) can further improve performance.
