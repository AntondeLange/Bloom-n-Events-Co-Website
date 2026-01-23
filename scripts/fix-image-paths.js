/**
 * Script to fix image paths in HTML files to match actual optimized file names
 * 
 * This script reads HTML files and updates picture element srcset paths
 * to match the actual file structure in assets/images/optimized/
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname, basename } from 'path';
import { existsSync } from 'fs';

const OPTIMIZED_DIR = 'assets/images/optimized';

/**
 * Find the actual optimized file for a given base path and width
 */
function findActualFile(basePath, width, format) {
  const dir = dirname(basePath);
  const baseName = basename(basePath);
  
  if (!existsSync(dir)) {
    return null;
  }
  
  const files = readdirSync(dir);
  
  // Try to find file ending with -{width}w.{format}
  // Pattern can be: base-480w.avif, base-1200w-480w.avif, base-480w-480w.avif, etc.
  const targetPattern = `-${width}w.${format}`;
  
  // First try exact matches
  const exactPatterns = [
    `${baseName}-${width}w.${format}`,  // Simple: base-480w.avif
    `${baseName}-${width}w-${width}w.${format}`,  // Double: base-480w-480w.avif
  ];
  
  for (const pattern of exactPatterns) {
    if (files.includes(pattern)) {
      return join(dir, pattern).replace(/\\/g, '/');
    }
  }
  
  // Then try files from various source widths
  const sourceWidths = [1200, 1600, 768, 480];
  for (const sourceWidth of sourceWidths) {
    const pattern = `${baseName}-${sourceWidth}w-${width}w.${format}`;
    if (files.includes(pattern)) {
      return join(dir, pattern).replace(/\\/g, '/');
    }
  }
  
  // For larger widths, try direct match
  if (parseInt(width) >= 1200) {
    const directPattern = `${baseName}-${width}w.${format}`;
    if (files.includes(directPattern)) {
      return join(dir, directPattern).replace(/\\/g, '/');
    }
    
    const doublePattern = `${baseName}-${width}w-${width}w.${format}`;
    if (files.includes(doublePattern)) {
      return join(dir, doublePattern).replace(/\\/g, '/');
    }
  }
  
  // Last resort: search for any file ending with the target pattern
  const matchingFile = files.find(f => f.endsWith(targetPattern) && f.startsWith(baseName));
  if (matchingFile) {
    return join(dir, matchingFile).replace(/\\/g, '/');
  }
  
  return null;
}

/**
 * Fix image paths in HTML content
 */
function fixImagePaths(htmlContent) {
  // Match picture elements with source tags
  const pictureRegex = /<picture>([\s\S]*?)<\/picture>/gi;
  let updated = false;
  
  const fixedContent = htmlContent.replace(pictureRegex, (match, content) => {
    // Extract srcset from source tags
    const sourceRegex = /<source[^>]*srcset=["']([^"']+)["'][^>]*>/gi;
    const imgRegex = /<img[^>]*srcset=["']([^"']+)["'][^>]*>/gi;
    
    let fixedMatch = match;
    
    // Fix source tags
    fixedMatch = fixedMatch.replace(sourceRegex, (sourceMatch, srcset) => {
      const fixedSrcset = srcset.split(',').map(item => {
        const parts = item.trim().split(/\s+/);
        if (parts.length < 2) return item.trim();
        
        const path = parts[0];
        const width = parts[1];
        
        // Extract format and width from path
        const formatMatch = path.match(/\.(avif|webp)$/);
        if (!formatMatch) return item.trim();
        
        const format = formatMatch[1];
        const widthNum = width.replace('w', '');
        
        // Find base path (remove -480w.avif pattern)
        const basePath = path.replace(/-\d+w\.(avif|webp)$/, '');
        const actualFile = findActualFile(basePath, widthNum, format);
        
        if (actualFile && actualFile !== path) {
          return `${actualFile} ${width}`;
        }
        
        return item.trim();
      }).join(', ');
      
      if (fixedSrcset !== srcset) {
        updated = true;
        return sourceMatch.replace(srcset, fixedSrcset);
      }
      
      return sourceMatch;
    });
    
    // Fix img tag srcset
    fixedMatch = fixedMatch.replace(imgRegex, (imgMatch, srcset) => {
      const fixedSrcset = srcset.split(',').map(item => {
        const parts = item.trim().split(/\s+/);
        if (parts.length < 2) return item.trim();
        
        const path = parts[0];
        const width = parts[1];
        
        const formatMatch = path.match(/\.(avif|webp)$/);
        if (!formatMatch) return item.trim();
        
        const format = formatMatch[1];
        const widthNum = width.replace('w', '');
        
        const basePath = path.replace(/-\d+w\.(avif|webp)$/, '');
        const actualFile = findActualFile(basePath, widthNum, format);
        
        if (actualFile && actualFile !== path) {
          return `${actualFile} ${width}`;
        }
        
        return item.trim();
      }).join(', ');
      
      if (fixedSrcset !== srcset) {
        updated = true;
        return imgMatch.replace(srcset, fixedSrcset);
      }
      
      return imgMatch;
    });
    
    if (fixedMatch !== match) {
      updated = true;
    }
    
    return fixedMatch;
  });
  
  return { content: fixedContent, updated };
}

/**
 * Main function
 */
function main() {
  const htmlFile = process.argv[2];
  
  if (!htmlFile) {
    console.error('Usage: node scripts/fix-image-paths.js <html-file>');
    process.exit(1);
  }
  
  if (!existsSync(htmlFile)) {
    console.error(`File not found: ${htmlFile}`);
    process.exit(1);
  }
  
  console.log(`Fixing image paths in: ${htmlFile}`);
  
  const content = readFileSync(htmlFile, 'utf8');
  const result = fixImagePaths(content);
  
  if (result.updated) {
    writeFileSync(htmlFile, result.content, 'utf8');
    console.log(`✅ Fixed paths in: ${htmlFile}`);
  } else {
    console.log(`ℹ️  No path fixes needed: ${htmlFile}`);
  }
}

main();
