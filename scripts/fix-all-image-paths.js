/**
 * Comprehensive script to fix all image paths in HTML files
 * Matches actual optimized file structure
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname, basename } from 'path';
import { existsSync } from 'fs';
import { glob } from 'glob';

const OPTIMIZED_DIR = 'assets/images/optimized';

/**
 * Find actual optimized files for a given base path
 */
function findOptimizedFiles(basePath, targetWidths) {
  const dir = dirname(basePath);
  const baseName = basename(basePath);
  
  if (!existsSync(dir)) {
    return { avif: [], webp: [] };
  }
  
  const files = readdirSync(dir);
  const avifFiles = [];
  const webpFiles = [];
  
  for (const width of targetWidths) {
    // Try multiple patterns
    const patterns = [
      `${baseName}-${width}w.avif`,
      `${baseName}-${width}w-${width}w.avif`,
      `${baseName}-1200w-${width}w.avif`,
      `${baseName}-1600w-${width}w.avif`,
      `${baseName}-768w-${width}w.avif`,
    ];
    
    for (const pattern of patterns) {
      if (files.includes(pattern)) {
        avifFiles.push({ width, path: join(dir, pattern).replace(/\\/g, '/') });
        break;
      }
    }
    
    const webpPatterns = [
      `${baseName}-${width}w.webp`,
      `${baseName}-${width}w-${width}w.webp`,
      `${baseName}-1200w-${width}w.webp`,
      `${baseName}-1600w-${width}w.webp`,
      `${baseName}-768w-${width}w.webp`,
    ];
    
    for (const pattern of webpPatterns) {
      if (files.includes(pattern)) {
        webpFiles.push({ width, path: join(dir, pattern).replace(/\\/g, '/') });
        break;
      }
    }
  }
  
  return { avif: avifFiles, webp: webpFiles };
}

/**
 * Fix picture elements in HTML
 */
function fixPictureElements(htmlContent) {
  const pictureRegex = /<picture>([\s\S]*?)<\/picture>/gi;
  let updated = false;
  
  const fixedContent = htmlContent.replace(pictureRegex, (match, content) => {
    // Extract base path from img src or first source
    const imgMatch = content.match(/<img[^>]*src=["']([^"']+)["']/);
    if (!imgMatch) return match;
    
    const fallbackSrc = imgMatch[1];
    if (!fallbackSrc.includes('/optimized/')) return match;
    
    // Get base path (remove -fallback.jpg)
    const basePath = fallbackSrc.replace(/-fallback\.(jpg|png|jpeg)$/i, '');
    const dir = dirname(basePath);
    const baseName = basename(basePath);
    
    // Find available optimized files
    const { avif, webp } = findOptimizedFiles(basePath, [480, 768, 1200, 1600]);
    
    if (avif.length === 0 && webp.length === 0) {
      return match; // No optimized files found
    }
    
    // Build new picture element
    let newPicture = '<picture>\n';
    
    // AVIF source (only if we have AVIF files)
    if (avif.length > 0) {
      const avifSrcset = avif.map(f => `${f.path} ${f.width}w`).join(', ');
      const sizesMatch = content.match(/sizes=["']([^"']+)["']/);
      const sizes = sizesMatch ? sizesMatch[1] : '100vw';
      newPicture += `  <source type="image/avif" srcset="${avifSrcset}" sizes="${sizes}">\n`;
    }
    
    // WebP source
    if (webp.length > 0) {
      const webpSrcset = webp.map(f => `${f.path} ${f.width}w`).join(', ');
      const sizesMatch = content.match(/sizes=["']([^"']+)["']/);
      const sizes = sizesMatch ? sizesMatch[1] : '100vw';
      newPicture += `  <source type="image/webp" srcset="${webpSrcset}" sizes="${sizes}">\n`;
    }
    
    // Extract img tag attributes
    const imgTagMatch = content.match(/<img([^>]*)>/);
    if (imgTagMatch) {
      let imgAttrs = imgTagMatch[1];
      
      // Update srcset to use webp
      if (webp.length > 0) {
        const webpSrcset = webp.map(f => `${f.path} ${f.width}w`).join(', ');
        imgAttrs = imgAttrs.replace(/srcset=["'][^"']*["']/, `srcset="${webpSrcset}"`);
      }
      
      newPicture += `  <img${imgAttrs}>\n`;
    }
    
    newPicture += '</picture>';
    
    updated = true;
    return newPicture;
  });
  
  return { content: fixedContent, updated };
}

/**
 * Main function
 */
async function main() {
  const htmlFiles = await glob('*.html');
  
  for (const htmlFile of htmlFiles) {
    console.log(`Processing: ${htmlFile}`);
    const content = readFileSync(htmlFile, 'utf8');
    const result = fixPictureElements(content);
    
    if (result.updated) {
      writeFileSync(htmlFile, result.content, 'utf8');
      console.log(`✅ Updated: ${htmlFile}`);
    } else {
      console.log(`ℹ️  No updates: ${htmlFile}`);
    }
  }
}

main().catch(console.error);
