/**
 * Image Optimization Script
 * 
 * Converts images to WebP and AVIF formats with responsive srcsets.
 * Maintains original images as fallbacks.
 * 
 * Usage: npm run optimize-images
 */

import sharp from 'sharp';
import { readdir, stat, mkdir } from 'fs/promises';
import { join, dirname, extname, basename } from 'path';
import { existsSync } from 'fs';

const IMAGE_DIR = 'assets/images';
const OUTPUT_DIR = 'assets/images/optimized';
const QUALITY = {
  webp: 85,
  avif: 80,
  jpeg: 85,
};

// Responsive breakpoints (widths in pixels)
const BREAKPOINTS = [480, 768, 1200, 1600];

/**
 * Check if file is an image
 */
function isImageFile(filename) {
  const ext = extname(filename).toLowerCase();
  return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
}

/**
 * Generate optimized image variants
 */
async function optimizeImage(inputPath, outputDir) {
  const filename = basename(inputPath);
  const nameWithoutExt = basename(inputPath, extname(inputPath));
  const ext = extname(inputPath).toLowerCase();
  
  try {
    const metadata = await sharp(inputPath).metadata();
    const { width, height, format } = metadata;
    
    console.log(`Processing: ${filename} (${width}x${height}, ${format})`);
    
    // Create output directory if it doesn't exist
    if (!existsSync(outputDir)) {
      await mkdir(outputDir, { recursive: true });
    }
    
    const variants = [];
    
    // Generate WebP variants for each breakpoint
    for (const breakpoint of BREAKPOINTS) {
      if (width >= breakpoint) {
        const outputPath = join(outputDir, `${nameWithoutExt}-${breakpoint}w.webp`);
        await sharp(inputPath)
          .resize(breakpoint, null, { withoutEnlargement: true })
          .webp({ quality: QUALITY.webp })
          .toFile(outputPath);
        variants.push({ format: 'webp', width: breakpoint, path: outputPath });
      }
    }
    
    // Generate AVIF variants (only for larger images to save processing time)
    if (width >= 768) {
      for (const breakpoint of BREAKPOINTS.filter(bp => bp >= 768)) {
        if (width >= breakpoint) {
          const outputPath = join(outputDir, `${nameWithoutExt}-${breakpoint}w.avif`);
          await sharp(inputPath)
            .resize(breakpoint, null, { withoutEnlargement: true })
            .avif({ quality: QUALITY.avif })
            .toFile(outputPath);
          variants.push({ format: 'avif', width: breakpoint, path: outputPath });
        }
      }
    }
    
    // Generate fallback JPEG/PNG (optimized original)
    const fallbackPath = join(outputDir, `${nameWithoutExt}-fallback${ext}`);
    if (ext === '.png') {
      await sharp(inputPath)
        .png({ compressionLevel: 9, adaptiveFiltering: true })
        .toFile(fallbackPath);
    } else {
      await sharp(inputPath)
        .jpeg({ quality: QUALITY.jpeg, mozjpeg: true })
        .toFile(fallbackPath);
    }
    
    return {
      original: inputPath,
      fallback: fallbackPath,
      variants,
    };
  } catch (error) {
    console.error(`Error processing ${filename}:`, error.message);
    return null;
  }
}

/**
 * Generate srcset string for HTML
 */
function generateSrcset(variants, basePath) {
  return variants
    .map(v => `${basePath}/${basename(v.path)} ${v.width}w`)
    .join(', ');
}

/**
 * Recursively process directory
 */
async function processDirectory(dir, baseDir = IMAGE_DIR) {
  const entries = await readdir(dir);
  
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = await stat(fullPath);
    
    if (stat.isDirectory()) {
      // Skip optimized directory
      if (entry === 'optimized') continue;
      await processDirectory(fullPath, baseDir);
    } else if (stat.isFile() && isImageFile(entry)) {
      const relativePath = fullPath.replace(baseDir + '/', '');
      const outputDir = join(OUTPUT_DIR, dirname(relativePath));
      
      const result = await optimizeImage(fullPath, outputDir);
      if (result) {
        console.log(`✓ Optimized: ${entry}`);
      }
    }
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🖼️  Starting image optimization...\n');
  
  try {
    await processDirectory(IMAGE_DIR);
    console.log('\n✅ Image optimization complete!');
    console.log('\n📝 Next steps:');
    console.log('1. Review optimized images in assets/images/optimized/');
    console.log('2. Update HTML to use optimized images with srcset');
    console.log('3. Test image loading on different devices');
  } catch (error) {
    console.error('❌ Error during optimization:', error);
    process.exit(1);
  }
}

main();
