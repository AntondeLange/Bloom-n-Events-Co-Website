# Image Optimization Recommendations
**Date:** January 26, 2026  
**Status:** Implementation Guide

---

## CURRENT STATE

### ✅ Implemented
- `loading="lazy"` on below-fold images
- `loading="eager"` on above-fold images (hero, logo)
- `decoding="async"` on all images
- `width` and `height` attributes (prevents CLS)
- `srcset` structure added (ready for multiple sizes)

### ⚠️ Needs Implementation
- Actual responsive image sizes (480w, 800w, 1200w, 1600w)
- Modern image formats (WebP, AVIF) with fallbacks
- Image optimization pipeline

---

## RESPONSIVE IMAGES (srcset/sizes)

### Current Implementation

**Structure Added:**
```html
<img
  src="/assets/images/Home/Corporate Events Hero Image.jpg"
  srcset="/assets/images/Home/Corporate Events Hero Image.jpg 1600w, ..."
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  ...
/>
```

**Note:** Currently uses same image for all sizes. Actual responsive images need to be generated.

### Recommended Image Sizes

**Service Cards (3-column grid):**
- Mobile (100vw): 480w
- Tablet (50vw): 800w
- Desktop (33vw): 1200w
- Large desktop: 1600w

**Hero Images (full width):**
- Mobile: 800w
- Tablet: 1200w
- Desktop: 1600w
- Large desktop: 1920w

**Carousel Images:**
- Mobile: 800w
- Desktop: 1600w

**Team Member Photos:**
- Mobile: 400w
- Desktop: 600w

### Implementation Steps

1. **Generate Responsive Images:**
   ```bash
   # Use sharp or ImageMagick to generate sizes
   # Example with sharp:
   sharp('source.jpg')
     .resize(480)
     .toFile('source-480w.jpg')
     .resize(800)
     .toFile('source-800w.jpg')
     .resize(1200)
     .toFile('source-1200w.jpg')
     .resize(1600)
     .toFile('source-1600w.jpg')
   ```

2. **Update srcset Attributes:**
   ```html
   srcset="
     /assets/images/Home/Corporate Events Hero Image-480w.jpg 480w,
     /assets/images/Home/Corporate Events Hero Image-800w.jpg 800w,
     /assets/images/Home/Corporate Events Hero Image-1200w.jpg 1200w,
     /assets/images/Home/Corporate Events Hero Image-1600w.jpg 1600w
   "
   ```

3. **Verify sizes Attribute:**
   - Service cards: `sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"`
   - Hero images: `sizes="100vw"`
   - Carousel: `sizes="(max-width: 768px) 100vw, 1600px"`

---

## MODERN IMAGE FORMATS (WebP/AVIF)

### Benefits
- **WebP:** 25-35% smaller than JPEG
- **AVIF:** 50% smaller than JPEG
- **Fallback:** JPEG for older browsers

### Implementation Pattern

**Using `<picture>` Element:**
```html
<picture>
  <source
    type="image/avif"
    srcset="
      image-480w.avif 480w,
      image-800w.avif 800w,
      image-1200w.avif 1200w,
      image-1600w.avif 1600w
    "
    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  />
  <source
    type="image/webp"
    srcset="
      image-480w.webp 480w,
      image-800w.webp 800w,
      image-1200w.webp 1200w,
      image-1600w.webp 1600w
    "
    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  />
  <img
    src="image-1600w.jpg"
    srcset="
      image-480w.jpg 480w,
      image-800w.jpg 800w,
      image-1200w.jpg 1200w,
      image-1600w.jpg 1600w
    "
    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
    alt="Description"
    loading="lazy"
    decoding="async"
    width="1600"
    height="900"
  />
</picture>
```

### Conversion Tools

**Sharp (Node.js):**
```javascript
const sharp = require('sharp');

async function convertImage(input, output) {
  await sharp(input)
    .webp({ quality: 85 })
    .toFile(output.replace('.jpg', '.webp'));
  
  await sharp(input)
    .avif({ quality: 80 })
    .toFile(output.replace('.jpg', '.avif'));
}
```

**ImageMagick (CLI):**
```bash
magick input.jpg -quality 85 output.webp
magick input.jpg -quality 80 output.avif
```

---

## OPTIMIZATION PIPELINE RECOMMENDATION

### Automated Build Step

**Option 1: Astro Image Integration**
- Use `@astrojs/image` or `astro:assets` for automatic optimization
- Generates responsive images at build time
- Supports WebP/AVIF conversion

**Option 2: Pre-build Script**
- Create `scripts/optimize-images.js`
- Run before `astro build`
- Generates all sizes and formats
- Updates srcset attributes automatically

**Option 3: CI/CD Pipeline**
- Add image optimization step to GitHub Actions
- Generate responsive images on commit
- Store optimized images in repository

---

## PRIORITY IMAGES FOR OPTIMIZATION

### High Priority (Above Fold)
1. Hero images (all pages)
2. Logo images
3. Service card images (homepage)

### Medium Priority (Below Fold)
4. Carousel images
5. Team member photos
6. Case study images

### Low Priority
7. Gallery images (lazy loaded)
8. Footer images

---

## ESTIMATED PERFORMANCE GAINS

**Current State:**
- Single image size: ~200-500 KB per image
- Total page images: ~2-5 MB (unoptimized)

**After Optimization:**
- Responsive images: ~50-70% reduction on mobile
- WebP format: ~25-35% additional reduction
- AVIF format: ~50% additional reduction
- **Total reduction: 60-80% on mobile devices**

**Expected Impact:**
- LCP improvement: 1-2 seconds on mobile
- Bandwidth savings: 1-3 MB per page load
- Better Core Web Vitals scores

---

## IMPLEMENTATION CHECKLIST

### Phase 1: Responsive Images (srcset)
- [ ] Generate multiple image sizes (480w, 800w, 1200w, 1600w)
- [ ] Update srcset attributes in all pages
- [ ] Verify sizes attributes are correct
- [ ] Test on different screen sizes

### Phase 2: Modern Formats (WebP/AVIF)
- [ ] Convert images to WebP
- [ ] Convert images to AVIF
- [ ] Add `<picture>` elements with fallbacks
- [ ] Test browser compatibility

### Phase 3: Automation
- [ ] Set up build-time image optimization
- [ ] Add to CI/CD pipeline
- [ ] Document process for content updates

---

## TOOLS & RESOURCES

**Image Optimization:**
- Sharp (Node.js): https://sharp.pixelplumbing.com/
- ImageMagick: https://imagemagick.org/
- Squoosh (Web): https://squoosh.app/

**Astro Image:**
- `@astrojs/image`: Deprecated, use `astro:assets`
- Astro Assets: Built-in image optimization

**Testing:**
- Chrome DevTools: Network tab, responsive mode
- PageSpeed Insights: Image optimization recommendations
- Lighthouse: Image optimization audit

---

## NOTES

1. **Current srcset Structure:** Uses same image for all sizes (placeholder). Actual responsive images need to be generated.

2. **Browser Support:**
   - WebP: Supported in all modern browsers (95%+)
   - AVIF: Supported in Chrome, Firefox, Safari 16+ (85%+)
   - Fallback: JPEG for older browsers

3. **Storage Consideration:**
   - Multiple sizes × multiple formats = more files
   - Consider CDN for image delivery
   - Use build-time generation (not runtime)

4. **Maintenance:**
   - New images need optimization
   - Consider automated pipeline
   - Document process for content team

---

## END OF RECOMMENDATIONS

**Status:** ✅ **GUIDE COMPLETE**  
**Next Steps:** Generate responsive images, convert to WebP/AVIF, update srcset attributes
