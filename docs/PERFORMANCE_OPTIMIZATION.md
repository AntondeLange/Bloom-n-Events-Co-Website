# Performance Optimization Guide
## Image and Video Loading Optimization

This document outlines the optimizations implemented to speed up image and video loading.

---

## Video Optimization

### Hero Video Loading Strategy

**Current Implementation:**
- **Initial Load:** `preload="metadata"` - Only loads video metadata initially
- **Progressive Loading:** Upgrades to `preload="auto"` when hero section becomes visible
- **IntersectionObserver:** Monitors hero section visibility to trigger full video load
- **Data Saver Mode:** Respects user's data saver preference
- **Reduced Motion:** Respects `prefers-reduced-motion` setting

**Benefits:**
- Faster initial page load (only metadata loaded)
- Video starts loading when user can see it
- Reduces bandwidth usage for users who don't scroll to hero
- Better performance on mobile devices

**Code Location:**
- HTML: `index.html` line ~188
- JavaScript: `assets/js/main.js` - `initHeroVideo()` function

---

## Image Optimization

### Current Optimizations

1. **Lazy Loading:**
   - All below-the-fold images use `loading="lazy"`
   - Hero/critical images use `loading="eager"` with `fetchpriority="high"`

2. **Async Decoding:**
   - All images use `decoding="async"` to prevent blocking main thread

3. **IntersectionObserver:**
   - Custom lazy loading with 300px rootMargin (starts loading before visible)
   - Optimized threshold for better performance

4. **Preloading:**
   - Critical images (logos, hero poster) preloaded with `fetchpriority="high"`

### Recommended Future Optimizations

1. **Responsive Images with srcset:**
   ```html
   <img 
     src="image.jpg"
     srcset="image-480w.jpg 480w, image-768w.jpg 768w, image-1200w.jpg 1200w, image-1600w.jpg 1600w"
     sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
     alt="Description"
     loading="lazy"
     decoding="async"
   >
   ```

2. **Modern Image Formats (WebP/AVIF):**
   ```html
   <picture>
     <source type="image/avif" srcset="image.avif">
     <source type="image/webp" srcset="image.webp">
     <img src="image.jpg" alt="Description" loading="lazy" decoding="async">
   </picture>
   ```

3. **Image Compression:**
   - Use tools like Sharp, ImageOptim, or Squoosh
   - Target 80-85% quality for JPEG
   - Use WebP for 30-50% smaller file sizes
   - Use AVIF for 50%+ smaller file sizes (modern browsers)

---

## Server-Side Optimizations

### Compression (.htaccess)

**Current:**
- Gzip compression enabled for text assets
- SVG compression enabled

**Added:**
- Brotli compression support (better than gzip, ~15-20% better compression)

### Caching Strategy

**HTML Files:**
- No cache (`Cache-Control: no-cache, no-store, must-revalidate`)
- Always fetch fresh HTML

**Images:**
- 1 year cache for images
- Use versioned URLs or cache-busting query strings for updates

**CSS/JS:**
- 1 month cache
- Use versioned filenames or query strings

---

## Performance Metrics

### Before Optimization:
- Hero video: Loaded immediately (large file)
- Images: Standard lazy loading
- No progressive loading

### After Optimization:
- Hero video: Metadata only initially, full load on visibility
- Images: Enhanced lazy loading with 300px preload margin
- Critical assets: Preloaded with high priority
- Server compression: Gzip + Brotli support

---

## Implementation Checklist

- [x] Video progressive loading (metadata → auto on visibility)
- [x] Enhanced image lazy loading (300px margin)
- [x] Critical image preloading
- [x] Server compression (Gzip + Brotli)
- [x] Async decoding for all images
- [ ] Implement srcset for responsive images
- [ ] Convert images to WebP/AVIF formats
- [ ] Add image compression pipeline
- [ ] Implement CDN for static assets

---

## Tools for Further Optimization

1. **Image Optimization:**
   - Sharp (Node.js)
   - ImageOptim (Mac)
   - Squoosh (Web-based)
   - WebP Converter

2. **Video Optimization:**
   - FFmpeg for compression
   - HandBrake for encoding
   - Create multiple quality versions

3. **Performance Testing:**
   - Lighthouse
   - WebPageTest
   - Chrome DevTools Network tab
   - Core Web Vitals

---

## Quick Wins Implemented

1. ✅ Changed video `preload="auto"` to `preload="metadata"` initially
2. ✅ Added IntersectionObserver for progressive video loading
3. ✅ Increased image preload margin from 200px to 300px
4. ✅ Added `fetchpriority="high"` to above-the-fold service images
5. ✅ Added video prefetch hint
6. ✅ Enabled Brotli compression support
7. ✅ Added async decoding to all images

---

**Last Updated:** December 2024
