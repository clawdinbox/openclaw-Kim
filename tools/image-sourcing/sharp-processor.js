#!/usr/bin/env node
/**
 * Sharp Image Processor — Node.js native image processing
 * No ImageMagick required, uses Sharp library
 */

const sharp = require('sharp');
const path = require('path');

const CONFIG = {
  brand: {
    handle: '@marcel.melzig',
    accentColor: '#00ADEE',
    darkBg: '#0a0a0a',
  },
  platforms: {
    instagram: { width: 1080, height: 1080, format: 'square' },
    linkedin: { width: 1200, height: 627, format: 'landscape' },
    x: { width: 1600, height: 900, format: 'landscape' },
    threads: { width: 1080, height: 1080, format: 'square' },
    substack: { width: 1200, height: 630, format: 'landscape' },
  },
};

/**
 * Create an SVG overlay with brand elements
 */
function createBrandOverlay(width, height, options = {}) {
  const gradientHeight = Math.floor(height * 0.25);
  const { addHeadline = false, headline = '' } = options;
  
  // Escape special XML characters
  const escapeXml = (str) => str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
  
  const safeHeadline = headline ? escapeXml(headline.substring(0, 80)) : '';
  const headlineFontSize = width > 1100 ? 48 : 36;
  
  let svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="fade" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:rgb(0,0,0);stop-opacity:0" />
          <stop offset="100%" style="stop-color:rgb(0,0,0);stop-opacity:0.75" />
        </linearGradient>
      </defs>
      
      <!-- Bottom gradient -->
      <rect x="0" y="${height - gradientHeight}" width="${width}" height="${gradientHeight}" fill="url(#fade)" />
      
      <!-- Cyan accent line at bottom -->
      <rect x="0" y="${height - 4}" width="${width}" height="4" fill="${CONFIG.brand.accentColor}" />
      
      <!-- Handle text -->
      <text x="${width - 20}" y="${height - 20}" 
            font-family="Arial, Helvetica, sans-serif" 
            font-size="20" 
            fill="${CONFIG.brand.accentColor}" 
            text-anchor="end" 
            font-weight="600">${CONFIG.brand.handle}</text>
  `;
  
  // Add headline if requested
  if (addHeadline && safeHeadline) {
    svg += `
      <text x="${width / 2}" y="${height - 60}" 
            font-family="Arial, Helvetica, sans-serif" 
            font-size="${headlineFontSize}" 
            fill="white" 
            text-anchor="middle" 
            font-weight="bold">${safeHeadline}</text>
    `;
  }
  
  svg += `</svg>`;
  
  return Buffer.from(svg);
}

/**
 * Process image for a specific platform with brand overlay
 */
async function processImage(inputPath, outputPath, platform, options = {}) {
  const specs = CONFIG.platforms[platform];
  if (!specs) {
    throw new Error(`Unknown platform: ${platform}`);
  }
  
  const { width, height } = specs;
  
  try {
    // Resize image to fit platform dimensions
    const resized = await sharp(inputPath)
      .resize(width, height, { 
        fit: 'cover', 
        position: 'center' 
      })
      .toBuffer();
    
    // Create brand overlay SVG
    const overlaySvg = createBrandOverlay(width, height, options);
    
    // Composite overlay onto image
    const final = await sharp(resized)
      .composite([{ 
        input: overlaySvg,
        blend: 'over'
      }])
      .jpeg({ 
        quality: 90,
        progressive: true
      });
    
    await final.toFile(outputPath);
    return outputPath;
  } catch (error) {
    throw new Error(`Failed to process for ${platform}: ${error.message}`);
  }
}

/**
 * Process image for all platforms
 */
async function processForAllPlatforms(inputPath, outputDir, baseName, platforms, options = {}) {
  const results = {};
  
  for (const platform of platforms) {
    const outputPath = path.join(outputDir, `${platform}-${baseName}.jpg`);
    try {
      const result = await processImage(inputPath, outputPath, platform, options);
      results[platform] = result;
    } catch (error) {
      console.error(`Error processing ${platform}:`, error.message);
      results[platform] = null;
    }
  }
  
  return results;
}

/**
 * Generate a text-based fallback image
 */
async function generateTextFallback(headline, outputPath, platform = 'linkedin') {
  const specs = CONFIG.platforms[platform] || CONFIG.platforms.linkedin;
  const { width, height } = specs;
  
  const escapeXml = (str) => str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
  
  const safeHeadline = escapeXml(headline.substring(0, 80));
  const fontSize = width > 1100 ? 56 : 42;
  
  // Create gradient background SVG
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#0a0a0a;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1a1a1a;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Background -->
      <rect width="${width}" height="${height}" fill="url(#bg)" />
      
      <!-- Cyan top line -->
      <rect x="0" y="0" width="${width}" height="6" fill="${CONFIG.brand.accentColor}" />
      
      <!-- Headline text -->
      <text x="${width / 2}" y="${height / 2}" 
            font-family="Arial, Helvetica, sans-serif" 
            font-size="${fontSize}" 
            fill="white" 
            text-anchor="middle" 
            font-weight="bold">${safeHeadline}</text>
      
      <!-- Handle -->
      <text x="${width - 20}" y="${height - 25}" 
            font-family="Arial, Helvetica, sans-serif" 
            font-size="20" 
            fill="${CONFIG.brand.accentColor}" 
            text-anchor="end" 
            font-weight="600">${CONFIG.brand.handle}</text>
      
      <!-- Cyan bottom line -->
      <rect x="0" y="${height - 4}" width="${width}" height="4" fill="${CONFIG.brand.accentColor}" />
    </svg>
  `;
  
  try {
    await sharp(Buffer.from(svg))
      .jpeg({ quality: 95 })
      .toFile(outputPath);
    return outputPath;
  } catch (error) {
    throw new Error(`Failed to generate fallback: ${error.message}`);
  }
}

module.exports = {
  processImage,
  processForAllPlatforms,
  generateTextFallback,
  createBrandOverlay,
  CONFIG,
};
