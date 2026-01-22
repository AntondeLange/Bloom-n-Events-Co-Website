/**
 * Generate srcset HTML for optimized images
 * 
 * This script helps generate the proper HTML srcset attributes
 * for images that have been optimized.
 * 
 * Usage: node scripts/generate-srcset.js <image-name>
 */

/**
 * Generate responsive image HTML with srcset
 * 
 * @param {string} imageName - Base name of the image (without extension)
 * @param {string} alt - Alt text for the image
 * @param {string} sizes - Sizes attribute (e.g., "(max-width: 768px) 100vw, 50vw")
 * @param {boolean} lazy - Whether to lazy load (default: true)
 * @returns {string} HTML img tag with proper srcset
 */
export function generateImageHTML(imageName, alt, sizes = '100vw', lazy = true) {
  const basePath = `assets/images/optimized/${imageName}`;
  
  // AVIF srcset (modern browsers)
  const avifSrcset = [
    `${basePath}-480w.avif 480w`,
    `${basePath}-768w.avif 768w`,
    `${basePath}-1200w.avif 1200w`,
    `${basePath}-1600w.avif 1600w`,
  ].join(', ');
  
  // WebP srcset (fallback for older browsers)
  const webpSrcset = [
    `${basePath}-480w.webp 480w`,
    `${basePath}-768w.webp 768w`,
    `${basePath}-1200w.webp 1200w`,
    `${basePath}-1600w.webp 1600w`,
  ].join(', ');
  
  // Fallback (original format)
  const fallbackSrc = `${basePath}-fallback.jpg`; // or .png
  
  return `
<picture>
  <source type="image/avif" srcset="${avifSrcset}" sizes="${sizes}">
  <source type="image/webp" srcset="${webpSrcset}" sizes="${sizes}">
  <img 
    src="${fallbackSrc}" 
    srcset="${webpSrcset}"
    sizes="${sizes}"
    alt="${alt}"
    loading="${lazy ? 'lazy' : 'eager'}"
    decoding="async"
    width="1600"
    height="900"
  >
</picture>`.trim();
}

/**
 * Example usage:
 * 
 * const html = generateImageHTML(
 *   'Home/Corporate Events Hero Image',
 *   'Corporate event planning and production services',
 *   '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
 * );
 * console.log(html);
 */
