# Image Optimization Guide
## Complete Guide to Optimizing Images for Bloom'n Events Co Website

---

## Overview

This guide explains how to optimize images for the website, including conversion to modern formats (WebP/AVIF) and implementation of responsive srcsets.

---

## Quick Start

### 1. Optimize Images
```bash
npm run optimize-images
```

This will:
- Convert images to WebP and AVIF formats
- Generate responsive breakpoints (480w, 768w, 1200w, 1600w)
- Create optimized fallback images
- Save optimized images to `assets/images/optimized/`

### 2. Update HTML with srcset
```bash
npm run update-srcset
```

This will:
- Update all `<img>` tags to use `<picture>` elements
- Add srcset attributes for responsive loading
- Generate appropriate sizes attributes

### 3. Or Run Both
```bash
npm run optimize-all
```

---

## Detailed Process

### Step 1: Image Optimization

The `optimize-images.js` script processes all images in `assets/images/`:

**What it does:**
- Reads all JPG/PNG images recursively
- Generates WebP variants at multiple sizes (480w, 768w, 1200w, 1600w)
- Generates AVIF variants for larger images (768w+)
- Creates optimized fallback images
- Preserves directory structure in `assets/images/optimized/`

**Output structure:**
```
assets/images/optimized/
  Home/
    Corporate Events Hero Image-480w.webp
    Corporate Events Hero Image-768w.webp
    Corporate Events Hero Image-1200w.webp
    Corporate Events Hero Image-1600w.webp
    Corporate Events Hero Image-768w.avif
    Corporate Events Hero Image-1200w.avif
    Corporate Events Hero Image-1600w.avif
    Corporate Events Hero Image-fallback.jpg
```

### Step 2: Update HTML

The `update-images-srcset.js` script updates HTML files:

**What it does:**
- Finds all `<img>` tags in HTML files
- Converts them to `<picture>` elements
- Adds `<source>` tags for AVIF and WebP
- Generates appropriate `srcset` and `sizes` attributes
- Preserves all existing attributes (alt, class, loading, etc.)

**Before:**
```html
<img src="assets/images/Home/Corporate Events Hero Image.jpg" 
     alt="Corporate Events" 
     class="card-img-top" 
     loading="lazy" 
     decoding="async" 
     width="1600" 
     height="900">
```

**After:**
```html
<picture>
  <source type="image/avif" 
          srcset="assets/images/optimized/Home/Corporate Events Hero Image-480w.avif 480w, 
                  assets/images/optimized/Home/Corporate Events Hero Image-768w.avif 768w, 
                  assets/images/optimized/Home/Corporate Events Hero Image-1200w.avif 1200w, 
                  assets/images/optimized/Home/Corporate Events Hero Image-1600w.avif 1600w" 
          sizes="(max-width: 576px) 100vw, (max-width: 992px) 50vw, 33vw">
  <source type="image/webp" 
          srcset="assets/images/optimized/Home/Corporate Events Hero Image-480w.webp 480w, 
                  assets/images/optimized/Home/Corporate Events Hero Image-768w.webp 768w, 
                  assets/images/optimized/Home/Corporate Events Hero Image-1200w.webp 1200w, 
                  assets/images/optimized/Home/Corporate Events Hero Image-1600w.webp 1600w" 
          sizes="(max-width: 576px) 100vw, (max-width: 992px) 50vw, 33vw">
  <img src="assets/images/optimized/Home/Corporate Events Hero Image-fallback.jpg" 
       alt="Corporate Events" 
       class="card-img-top" 
       loading="lazy" 
       decoding="async" 
       width="1600" 
       height="900">
</picture>
```

---

## Sizes Attribute Contexts

The script automatically determines appropriate `sizes` attributes based on image context:

- **Card images:** `(max-width: 576px) 100vw, (max-width: 992px) 50vw, 33vw`
- **Hero images:** `(max-width: 768px) 100vw, 100vw`
- **Gallery images:** `(max-width: 576px) 100vw, (max-width: 992px) 50vw, 33vw`
- **Testimonial images:** `(max-width: 576px) 100vw, 200px`
- **Default:** `(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw`

---

## Image Quality Settings

Current quality settings in `optimize-images.js`:

```javascript
const QUALITY = {
  webp: 85,    // Good balance of quality and file size
  avif: 80,    // AVIF is more efficient, can use lower quality
  jpeg: 85,    // Fallback JPEG quality
};
```

**Adjust if needed:**
- Lower values (70-80): Smaller files, slightly lower quality
- Higher values (90-95): Larger files, better quality
- Recommended: 80-85 for most images

---

## Breakpoints

Current breakpoints:
- **480w** - Mobile portrait
- **768w** - Tablet portrait
- **1200w** - Desktop
- **1600w** - Large desktop

**Note:** Images are only resized down, never up. If an image is 800px wide, only 480w and 768w variants will be created.

---

## Manual Process

If you need to optimize a single image manually:

1. **Optimize the image:**
   ```bash
   node scripts/optimize-images.js
   ```
   (This processes all images, but you can modify the script to target specific files)

2. **Update specific HTML file:**
   ```bash
   node scripts/update-images-srcset.js index.html
   ```

---

## Verification

After optimization, verify:

1. **Check optimized images exist:**
   ```bash
   ls -la assets/images/optimized/
   ```

2. **Test in browser:**
   - Open DevTools Network tab
   - Check which image format loads (should be AVIF in modern browsers)
   - Verify correct size loads for viewport width

3. **Check file sizes:**
   - WebP should be 30-50% smaller than original
   - AVIF should be 50%+ smaller than original
   - Fallback should be similar or slightly smaller than original

---

## Troubleshooting

### Images not optimizing
- Check that Sharp is installed: `npm install sharp`
- Verify image paths are correct
- Check file permissions

### HTML not updating
- Ensure images are in `assets/images/` directory
- Check that optimized images exist first
- Verify HTML file syntax is correct

### Wrong sizes attribute
- Modify `generateSizes()` function in `update-images-srcset.js`
- Add custom context detection if needed

---

## Performance Impact

**Expected improvements:**
- **File size reduction:** 30-70% smaller files
- **Loading speed:** 40-60% faster on mobile
- **Bandwidth savings:** Significant reduction for mobile users
- **LCP improvement:** Faster Largest Contentful Paint

**Before optimization:**
- Single 2MB JPEG loads on all devices
- Slow loading on mobile connections

**After optimization:**
- 200KB AVIF loads on modern mobile browsers
- 400KB WebP loads on older browsers
- 800KB JPEG fallback for very old browsers
- Appropriate size for each viewport

---

## Best Practices

1. **Always optimize before adding to site**
   - Run `npm run optimize-images` for new images
   - Update HTML with `npm run update-srcset`

2. **Keep original images**
   - Don't delete originals
   - Optimized images can be regenerated

3. **Test on multiple devices**
   - Verify correct sizes load
   - Check image quality
   - Ensure fallbacks work

4. **Monitor file sizes**
   - Keep individual images under 1MB (original)
   - Optimized variants should be much smaller

5. **Use appropriate formats**
   - AVIF for modern browsers (best compression)
   - WebP for older browsers (good compression)
   - JPEG/PNG for fallback (universal support)

---

## Future Enhancements

Potential improvements:
- [ ] Automatic optimization on image upload
- [ ] CDN integration for faster delivery
- [ ] Progressive image loading with blur-up
- [ ] Automatic quality adjustment based on connection speed
- [ ] Image CDN with automatic optimization

---

**Last Updated:** December 2024
