#!/usr/bin/env node
/**
 * CSP Update Utility
 * 
 * This script helps update CSP headers in HTML files using the centralized config.
 * 
 * Usage:
 *   node assets/js/update-csp.js [html-file]
 * 
 * If no file is specified, it will list all HTML files that need updating.
 * 
 * Note: This is a helper script. Always review changes before committing.
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, extname } from 'path';
import { generateCSPString } from './csp-config.js';

const HTML_DIR = process.cwd();
const CSP_PATTERN = /<meta\s+http-equiv=["']Content-Security-Policy["'][^>]*>/gi;

function findHTMLFiles(dir = HTML_DIR) {
  const files = [];
  const entries = readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules, .git, and other common directories
      if (!['node_modules', '.git', 'backend', 'images', 'partials', 'scripts', 'styles'].includes(entry.name)) {
        files.push(...findHTMLFiles(fullPath));
      }
    } else if (entry.isFile() && extname(entry.name) === '.html') {
      files.push(fullPath);
    }
  }
  
  return files;
}

function updateCSPInFile(filePath) {
  try {
    let content = readFileSync(filePath, 'utf8');
    const newCSP = generateCSPString();
    const newCSPTag = `<meta http-equiv="Content-Security-Policy" content="${newCSP}">`;
    
    // Check if CSP tag exists
    if (!CSP_PATTERN.test(content)) {
      console.log(`⚠️  No CSP tag found in ${filePath}`);
      return false;
    }
    
    // Reset regex
    CSP_PATTERN.lastIndex = 0;
    
    // Replace first occurrence
    const updated = content.replace(CSP_PATTERN, newCSPTag);
    
    if (updated === content) {
      console.log(`ℹ️  No changes needed in ${filePath}`);
      return false;
    }
    
    // Write back
    writeFileSync(filePath, updated, 'utf8');
    console.log(`✅ Updated CSP in ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Main execution
const targetFile = process.argv[2];

if (targetFile) {
  // Update specific file
  const filePath = join(HTML_DIR, targetFile);
  updateCSPInFile(filePath);
} else {
  // List all HTML files
  console.log('📋 HTML files that may need CSP updates:\n');
  const htmlFiles = findHTMLFiles();
  
  htmlFiles.forEach(file => {
    const relativePath = file.replace(HTML_DIR + '/', '');
    console.log(`  - ${relativePath}`);
  });
  
  console.log('\n💡 To update a specific file:');
  console.log('   node scripts/update-csp.js [filename]');
  console.log('\n⚠️  Always review changes before committing!');
}
