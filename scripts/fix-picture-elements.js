/**
 * Fix picture elements in HTML files
 * - Corrects file extensions (AVIF sources should only have .avif, WebP sources should only have .webp)
 * - Fixes formatting/indentation
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

/**
 * Fix picture elements in HTML content
 */
function fixPictureElements(htmlContent) {
  const pictureRegex = /<picture>([\s\S]*?)<\/picture>/gi;
  let updated = false;
  
  const fixedContent = htmlContent.replace(pictureRegex, (match, content) => {
    // Extract all source tags
    const sourceRegex = /<source\s+([^>]*?)>/gi;
    const sources = [];
    let sourceMatch;
    
    while ((sourceMatch = sourceRegex.exec(content)) !== null) {
      sources.push(sourceMatch[1]);
    }
    
    // Extract img tag
    const imgMatch = content.match(/<img\s+([^>]*?)>/);
    if (!imgMatch) return match;
    
    const imgAttrs = imgMatch[1];
    
    // Fix each source tag
    let fixedSources = [];
    for (const sourceAttrs of sources) {
      // Check if it's AVIF or WebP
      const isAvif = sourceAttrs.includes('type="image/avif"');
      const isWebp = sourceAttrs.includes('type="image/webp"');
      
      if (!isAvif && !isWebp) {
        fixedSources.push(`<source ${sourceAttrs}>`);
        continue;
      }
      
      // Extract srcset
      const srcsetMatch = sourceAttrs.match(/srcset=["']([^"']+)["']/);
      if (!srcsetMatch) {
        fixedSources.push(`<source ${sourceAttrs}>`);
        continue;
      }
      
      const srcset = srcsetMatch[1];
      const sizesMatch = sourceAttrs.match(/sizes=["']([^"']+)["']/);
      const sizes = sizesMatch ? sizesMatch[1] : '100vw';
      
      // Fix srcset - ensure correct file extensions
      const fixedSrcset = srcset.split(',').map(item => {
        const parts = item.trim().split(/\s+/);
        if (parts.length < 2) return item.trim();
        
        let path = parts[0];
        const width = parts[1];
        
        // Determine correct extension based on source type
        const correctExt = isAvif ? '.avif' : '.webp';
        
        // Fix the extension if wrong
        if (isAvif && path.endsWith('.webp')) {
          path = path.replace(/\.webp$/, '.avif');
          updated = true;
        } else if (isWebp && path.endsWith('.avif')) {
          path = path.replace(/\.avif$/, '.webp');
          updated = true;
        } else if (!path.endsWith(correctExt)) {
          // If it doesn't have the right extension, try to fix it
          path = path.replace(/\.(avif|webp)$/, correctExt);
          updated = true;
        }
        
        return `${path} ${width}`;
      }).join(', ');
      
      // Rebuild source tag
      const newSourceAttrs = sourceAttrs
        .replace(/srcset=["'][^"']*["']/, `srcset="${fixedSrcset}"`);
      
      fixedSources.push(`<source ${newSourceAttrs}>`);
    }
    
    // Fix img tag srcset (should use webp)
    let fixedImgAttrs = imgAttrs;
    const imgSrcsetMatch = imgAttrs.match(/srcset=["']([^"']+)["']/);
    if (imgSrcsetMatch) {
      const imgSrcset = imgSrcsetMatch[1];
      const fixedImgSrcset = imgSrcset.split(',').map(item => {
        const parts = item.trim().split(/\s+/);
        if (parts.length < 2) return item.trim();
        
        let path = parts[0];
        const width = parts[1];
        
        // Img srcset should use webp (fallback)
        if (path.endsWith('.avif')) {
          path = path.replace(/\.avif$/, '.webp');
          updated = true;
        }
        
        return `${path} ${width}`;
      }).join(', ');
      
      fixedImgAttrs = fixedImgAttrs.replace(/srcset=["'][^"']*["']/, `srcset="${fixedImgSrcset}"`);
    }
    
    // Rebuild picture element with proper indentation
    const indent = '                                        '; // Match existing indentation
    let newPicture = '<picture>\n';
    
    for (const source of fixedSources) {
      newPicture += `${indent}${source}\n`;
    }
    
    newPicture += `${indent}<img ${fixedImgAttrs}>\n`;
    newPicture += `${indent}</picture>`;
    
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
      console.log(`✅ Fixed: ${htmlFile}`);
    } else {
      console.log(`ℹ️  No fixes needed: ${htmlFile}`);
    }
  }
  
  console.log('\n✅ All files processed!');
}

main().catch(console.error);
