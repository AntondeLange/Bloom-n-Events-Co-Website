/**
 * Update Images with srcset
 * 
 * This script updates HTML files to use responsive images with srcset.
 * It works with images that have been optimized using optimize-images.js
 * 
 * Usage: node scripts/update-images-srcset.js [html-file]
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const HTML_DIR = '.';
const OPTIMIZED_DIR = 'assets/images/optimized';

/**
 * Generate srcset string from optimized image variants
 */
function generateSrcset(baseName, format, sizes) {
  const srcset = sizes.map(size => {
    const path = `${OPTIMIZED_DIR}/${baseName}-${size}w.${format}`;
    return `${path} ${size}w`;
  }).join(', ');
  return srcset;
}

/**
 * Generate sizes attribute based on context
 */
function generateSizes(context = 'default') {
  const sizesMap = {
    'card': '(max-width: 576px) 100vw, (max-width: 992px) 50vw, 33vw',
    'hero': '(max-width: 768px) 100vw, 100vw',
    'gallery': '(max-width: 576px) 100vw, (max-width: 992px) 50vw, 33vw',
    'testimonial': '(max-width: 576px) 100vw, 200px',
    'default': '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
  };
  return sizesMap[context] || sizesMap.default;
}

/**
 * Convert img tag to picture element with srcset
 */
function convertToPicture(imgTag, imagePath) {
  // Extract image path from src
  const srcMatch = imgTag.match(/src=["']([^"']+)["']/i);
  if (!srcMatch) return imgTag;
  
  const src = srcMatch[1];
  
  // Skip if already optimized or is logo/icon
  if (src.includes('/optimized/') || 
      src.includes('logo') || 
      src.includes('butterfly') || 
      src.includes('.svg')) {
    return imgTag;
  }
  
  // Extract base name from path
  const pathParts = src.replace('assets/images/', '').split('/');
  const filename = pathParts[pathParts.length - 1];
  const baseName = filename.replace(/\.(jpg|jpeg|png|JPG|JPEG|PNG)$/, '');
  const directory = pathParts.slice(0, -1).join('/');
  const fullBaseName = directory ? `${directory}/${baseName}` : baseName;
  
  // Extract other attributes
  const altMatch = imgTag.match(/alt=["']([^"']*)["']/i);
  const alt = altMatch ? altMatch[1] : '';
  
  const classMatch = imgTag.match(/class=["']([^"']*)["']/i);
  const className = classMatch ? classMatch[1] : '';
  
  const loadingMatch = imgTag.match(/loading=["']([^"']*)["']/i);
  const loading = loadingMatch ? loadingMatch[1] : 'lazy';
  
  const widthMatch = imgTag.match(/width=["']?(\d+)["']?/i);
  const width = widthMatch ? widthMatch[1] : '1600';
  
  const heightMatch = imgTag.match(/height=["']?(\d+)["']?/i);
  const height = heightMatch ? heightMatch[1] : '900';
  
  // Determine context for sizes
  let context = 'default';
  if (className.includes('card-img')) context = 'card';
  if (className.includes('hero')) context = 'hero';
  if (className.includes('gallery')) context = 'gallery';
  if (className.includes('testimonial')) context = 'testimonial';
  
  const sizes = generateSizes(context);
  const breakpoints = [480, 768, 1200, 1600];
  
  // Generate picture element
  const avifSrcset = generateSrcset(fullBaseName, 'avif', breakpoints);
  const webpSrcset = generateSrcset(fullBaseName, 'webp', breakpoints);
  const fallbackExt = filename.match(/\.(png|PNG)$/) ? 'png' : 'jpg';
  const fallbackSrc = `${OPTIMIZED_DIR}/${fullBaseName}-fallback.${fallbackExt}`;
  
  return `<picture>
  <source type="image/avif" srcset="${avifSrcset}" sizes="${sizes}">
  <source type="image/webp" srcset="${webpSrcset}" sizes="${sizes}">
  <img 
    src="${fallbackSrc}" 
    alt="${alt}"
    class="${className}"
    loading="${loading}"
    decoding="async"
    width="${width}"
    height="${height}"
  >
</picture>`;
}

/**
 * Process HTML file
 */
function processHTMLFile(filePath) {
  console.log(`Processing: ${filePath}`);
  
  let content = readFileSync(filePath, 'utf-8');
  let updated = false;
  
  // Find all img tags (not already in picture elements)
  const imgRegex = /<img\s+([^>]*?)>/gi;
  
  content = content.replace(imgRegex, (match, attributes) => {
    // Skip if already in picture element
    if (match.includes('<picture>') || match.includes('</picture>')) {
      return match;
    }
    
    const srcMatch = attributes.match(/src=["']([^"']+)["']/i);
    if (!srcMatch || !srcMatch[1].includes('assets/images/')) {
      return match;
    }
    
    const newTag = convertToPicture(match, srcMatch[1]);
    if (newTag !== match) {
      updated = true;
      return newTag;
    }
    
    return match;
  });
  
  if (updated) {
    writeFileSync(filePath, content, 'utf-8');
    console.log(`✓ Updated: ${filePath}`);
  } else {
    console.log(`- No changes: ${filePath}`);
  }
}

/**
 * Main execution
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.length > 0) {
    // Process specific file
    const filePath = args[0];
    if (filePath.endsWith('.html')) {
      processHTMLFile(filePath);
    } else {
      console.error('Error: File must be an HTML file');
      process.exit(1);
    }
  } else {
    // Process all HTML files
    console.log('🖼️  Updating images with srcset...\n');
    
    const files = readdirSync(HTML_DIR);
    const htmlFiles = files.filter(f => f.endsWith('.html') && statSync(f).isFile());
    
    htmlFiles.forEach(file => {
      processHTMLFile(file);
    });
    
    console.log('\n✅ Image srcset update complete!');
    console.log('\n📝 Next steps:');
    console.log('1. Run "npm run optimize-images" to generate optimized image variants');
    console.log('2. Review updated HTML files');
    console.log('3. Test image loading on different devices');
  }
}

main();
