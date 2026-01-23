/**
 * Helper function to generate optimized image HTML with picture element
 * 
 * @param {string} originalPath - Original image path (e.g., "assets/images/Centuria Connect140/Connect140 (1).jpg")
 * @param {string} alt - Alt text
 * @param {string} sizes - Sizes attribute
 * @param {boolean} lazy - Whether to lazy load
 * @param {string} className - CSS class names
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {string} HTML for picture element
 */
export function generateOptimizedImageHTML(originalPath, alt, sizes = '100vw', lazy = true, className = '', width = 1600, height = 900) {
  // Extract directory and filename from original path
  const pathParts = originalPath.replace('assets/images/', '').split('/');
  const directory = pathParts.slice(0, -1).join('/');
  const filename = pathParts[pathParts.length - 1];
  
  // Remove extension and any existing width suffix
  const baseName = filename.replace(/\.(jpg|jpeg|png|JPG|JPEG|PNG)$/, '').replace(/-\d+w$/, '');
  
  // Build optimized path
  const optimizedBase = `assets/images/optimized/${directory}/${baseName}`;
  
  // Generate srcsets
  const avifSrcset = [
    `${optimizedBase}-480w.avif 480w`,
    `${optimizedBase}-768w.avif 768w`,
    `${optimizedBase}-1200w.avif 1200w`,
    `${optimizedBase}-1600w.avif 1600w`
  ].filter(Boolean).join(', ');
  
  const webpSrcset = [
    `${optimizedBase}-480w.webp 480w`,
    `${optimizedBase}-768w.webp 768w`,
    `${optimizedBase}-1200w.webp 1200w`,
    `${optimizedBase}-1600w.webp 1600w`
  ].filter(Boolean).join(', ');
  
  // Determine fallback extension
  const ext = filename.match(/\.(jpg|jpeg|png|JPG|JPEG|PNG)$/)?.[1]?.toLowerCase() || 'jpg';
  const fallbackExt = ext === 'png' ? 'png' : 'jpg';
  const fallbackSrc = `${optimizedBase}-fallback.${fallbackExt}`;
  
  // Build HTML
  return `<picture>
  <source type="image/avif" srcset="${avifSrcset}" sizes="${sizes}">
  <source type="image/webp" srcset="${webpSrcset}" sizes="${sizes}">
  <img 
    src="${fallbackSrc}" 
    srcset="${webpSrcset}"
    sizes="${sizes}"
    alt="${alt}"
    class="${className}"
    loading="${lazy ? 'lazy' : 'eager'}"
    decoding="async"
    width="${width}"
    height="${height}"
  >
</picture>`;
}
