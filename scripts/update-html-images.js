/**
 * Script to automatically update HTML files to use optimized images
 * 
 * This script finds <img> tags in HTML files and updates them to use
 * optimized WebP/AVIF versions with proper picture elements and srcset.
 * 
 * Usage: node scripts/update-html-images.js [html-file]
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname, basename, extname } from 'path';
import { existsSync } from 'fs';

const OPTIMIZED_DIR = 'assets/images/optimized';
const BREAKPOINTS = [480, 768, 1200, 1600];

/**
 * Generate optimized image HTML with picture element
 */
function generateOptimizedImageHTML(originalSrc, alt, className, loading, decoding, width, height, sizes) {
  // Decode URL-encoded paths (e.g., %20 -> space)
  const decodedSrc = decodeURIComponent(originalSrc);
  
  // Remove assets/images/ prefix
  const relativePath = decodedSrc.replace('assets/images/', '');
  const pathParts = relativePath.split('/');
  const directory = pathParts.slice(0, -1).join('/');
  const filename = pathParts[pathParts.length - 1];
  
  // Remove extension and any existing width suffix
  const baseName = filename.replace(/\.(jpg|jpeg|png|JPG|JPEG|PNG)$/i, '').replace(/-\d+w$/i, '');
  
  // Build optimized base path
  let optimizedBase = join(OPTIMIZED_DIR, directory, baseName).replace(/\\/g, '/');
  
  // Check if optimized versions exist - try multiple patterns
  let fallbackPath = `${optimizedBase}-fallback${extname(filename)}`;
  let found = existsSync(fallbackPath);
  
  // Try with .jpg extension if original was .JPG
  if (!found && extname(filename).toUpperCase() === '.JPG') {
    fallbackPath = `${optimizedBase}-fallback.jpg`;
    found = existsSync(fallbackPath);
  }
  
  // Try without directory if in root
  if (!found) {
    const rootBase = join(OPTIMIZED_DIR, baseName).replace(/\\/g, '/');
    fallbackPath = `${rootBase}-fallback${extname(filename)}`;
    if (existsSync(fallbackPath)) {
      optimizedBase = rootBase;
      found = true;
    }
  }
  
  // Try with .jpg lowercase
  if (!found) {
    fallbackPath = `${optimizedBase}-fallback.jpg`;
    found = existsSync(fallbackPath);
  }
  
  if (!found) {
    console.warn(`No optimized version found for: ${originalSrc} (tried: ${fallbackPath})`);
    return null; // Return null to skip this image
  }
  
  // Generate srcsets - try multiple naming patterns
  // Pattern 1: Simple (base-480w.avif)
  // Pattern 2: From width source (base-1200w-480w.avif)
  // Pattern 3: Direct width match (base-1200w.avif for 1200w)
  
  const findOptimizedFiles = (width, format) => {
    // Try multiple patterns in order of preference
    const patterns = [
      // Pattern 1: Simple (base-480w.avif) - most common
      `${optimizedBase}-${width}w.${format}`,
      // Pattern 2: From source width (base-1200w-480w.avif)
      `${optimizedBase}-1200w-${width}w.${format}`,
      `${optimizedBase}-1600w-${width}w.${format}`,
      `${optimizedBase}-768w-${width}w.${format}`,
      // Pattern 3: Direct match for larger widths
      width >= 1200 ? `${optimizedBase}-${width}w-${width}w.${format}` : null,
      width >= 1200 ? `${optimizedBase}-${width}w.${format}` : null,
    ].filter(Boolean);
    
    for (const path of patterns) {
      if (existsSync(path)) return path;
    }
    
    return null;
  };
  
  const avifSrcset = BREAKPOINTS
    .map(w => {
      const file = findOptimizedFiles(w, 'avif');
      return file ? `${file} ${w}w` : null;
    })
    .filter(Boolean)
    .join(', ');
  
  const webpSrcset = BREAKPOINTS
    .map(w => {
      const file = findOptimizedFiles(w, 'webp');
      return file ? `${file} ${w}w` : null;
    })
    .filter(Boolean)
    .join(', ');
  
  if (!avifSrcset && !webpSrcset) {
    console.warn(`No optimized variants found for: ${originalSrc}`);
    return null;
  }
  
  // Determine fallback extension
  const ext = extname(filename).toLowerCase();
  const fallbackExt = ext === '.png' ? 'png' : 'jpg';
  const fallbackSrc = `${optimizedBase}-fallback.${fallbackExt}`;
  
  // Build HTML
  const defaultSizes = sizes || '(max-width: 576px) 100vw, (max-width: 992px) 50vw, 33vw';
  
  return `<picture>
  <source type="image/avif" srcset="${avifSrcset}" sizes="${defaultSizes}">
  <source type="image/webp" srcset="${webpSrcset}" sizes="${defaultSizes}">
  <img src="${fallbackSrc}" srcset="${webpSrcset}" sizes="${defaultSizes}" alt="${alt}" class="${className}" loading="${loading}" decoding="${decoding}" width="${width}" height="${height}">
</picture>`;
}

/**
 * Update images in HTML content
 */
function updateHTMLImages(htmlContent, filePath) {
  // Match img tags with src attribute
  const imgRegex = /<img\s+([^>]*?)>/gi;
  let updatedContent = htmlContent;
  let updated = false;
  
  updatedContent = updatedContent.replace(imgRegex, (match, attributes) => {
    // Skip if already in a picture element
    if (match.includes('<picture>') || match.includes('</picture>')) {
      return match;
    }
    
    // Extract attributes
    const srcMatch = attributes.match(/src=["']([^"']+)["']/i);
    if (!srcMatch || !srcMatch[1].includes('assets/images/')) {
      return match; // Skip if no src or not an assets/images path
    }
    
    const src = srcMatch[1];
    
    // Skip images that are already optimized (in optimized folder)
    if (src.includes('/optimized/')) {
      return match;
    }
    
    // Skip logos, icons, SVGs, videos, and testimonials
    if (src.includes('logo') || src.includes('butterfly') || src.includes('testimonial') || src.includes('.svg') || src.includes('.mp4')) {
      return match;
    }
    
    const altMatch = attributes.match(/alt=["']([^"']*)["']/i);
    const alt = altMatch ? altMatch[1] : '';
    
    const classMatch = attributes.match(/class=["']([^"']*)["']/i);
    const className = classMatch ? classMatch[1] : '';
    
    const loadingMatch = attributes.match(/loading=["']([^"']*)["']/i);
    const loading = loadingMatch ? loadingMatch[1] : 'lazy';
    
    const decodingMatch = attributes.match(/decoding=["']([^"']*)["']/i);
    const decoding = decodingMatch ? decodingMatch[1] : 'async';
    
    const widthMatch = attributes.match(/width=["']?(\d+)["']?/i);
    const width = widthMatch ? widthMatch[1] : '1600';
    
    const heightMatch = attributes.match(/height=["']?(\d+)["']?/i);
    const height = heightMatch ? heightMatch[1] : '900';
    
    const sizesMatch = attributes.match(/sizes=["']([^"']*)["']/i);
    const sizes = sizesMatch ? sizesMatch[1] : null;
    
    // Generate optimized HTML
    const optimizedHTML = generateOptimizedImageHTML(src, alt, className, loading, decoding, width, height, sizes);
    
    if (optimizedHTML) {
      updated = true;
      return optimizedHTML;
    }
    
    return match; // Return original if no optimized version found
  });
  
  return { content: updatedContent, updated };
}

/**
 * Main function
 */
function main() {
  const htmlFile = process.argv[2] || 'index.html';
  
  if (!existsSync(htmlFile)) {
    console.error(`File not found: ${htmlFile}`);
    process.exit(1);
  }
  
  console.log(`Processing: ${htmlFile}`);
  
  const content = readFileSync(htmlFile, 'utf8');
  const result = updateHTMLImages(content, htmlFile);
  
  if (result.updated) {
    writeFileSync(htmlFile, result.content, 'utf8');
    console.log(`✅ Updated: ${htmlFile}`);
  } else {
    console.log(`ℹ️  No updates needed: ${htmlFile}`);
  }
}

main();
