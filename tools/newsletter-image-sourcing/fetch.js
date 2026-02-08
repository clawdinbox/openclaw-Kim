#!/usr/bin/env node
/**
 * Newsletter Image Sourcing Tool
 * 
 * Automatically sources, downloads, and brands images for newsletter headers.
 * 
 * Usage:
 *   node fetch.js --topic="luxury fashion trends" --headline="The LVMH Effect"
 *   node fetch.js --topic="AI retail" --count=3
 * 
 * Features:
 *   - Search Unsplash and Pexels APIs
 *   - Download top matches
 *   - Auto-crop to newsletter dimensions
 *   - Apply brand overlay (@marcel.melzig, cyan accent)
 *   - Fallback to text-based graphic generation
 */

const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  // API Keys (should be in env)
  unsplashAccessKey: process.env.UNSPLASH_ACCESS_KEY || '',
  pexelsApiKey: process.env.PEXELS_API_KEY || '',
  
  // Image specs
  dimensions: {
    substack: { width: 1200, height: 630, name: 'substack-hero' },
    linkedin: { width: 1200, height: 627, name: 'linkedin-hero' },
    square: { width: 1080, height: 1080, name: 'square' },
  },
  
  // Brand overlay settings
  brand: {
    handle: '@marcel.melzig',
    accentColor: '#00ADEE', // Cyan
    fontFamily: 'Montserrat',
    position: 'bottom-right',
  },
  
  // Paths
  basePath: '/Users/clawdmm/.openclaw/workspace/documents/newsletter/images',
};

// Parse CLI arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    topic: '',
    headline: '',
    count: 3,
    date: new Date().toISOString().split('T')[0],
  };
  
  for (const arg of args) {
    if (arg.startsWith('--topic=')) {
      options.topic = arg.split('=')[1].replace(/"/g, '');
    } else if (arg.startsWith('--headline=')) {
      options.headline = arg.split('=')[1].replace(/"/g, '');
    } else if (arg.startsWith('--count=')) {
      options.count = parseInt(arg.split('=')[1], 10);
    } else if (arg.startsWith('--date=')) {
      options.date = arg.split('=')[1];
    }
  }
  
  return options;
}

// Logger
const log = {
  info: (msg) => console.log(`ℹ️  ${msg}`),
  success: (msg) => console.log(`✅ ${msg}`),
  warning: (msg) => console.log(`⚠️  ${msg}`),
  error: (msg) => console.error(`❌ ${msg}`),
  step: (num, msg) => console.log(`\n🔷 Step ${num}: ${msg}`),
};

// Ensure directory exists
async function ensureDir(dirPath) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (err) {
    // Directory might already exist
  }
}

// Search Unsplash
async function searchUnsplash(query, count = 3) {
  if (!CONFIG.unsplashAccessKey) {
    log.warning('Unsplash API key not configured');
    return [];
  }
  
  const searchQuery = encodeURIComponent(query);
  const url = `https://api.unsplash.com/search/photos?query=${searchQuery}&per_page=${count}&orientation=landscape`;
  
  return new Promise((resolve) => {
    const options = {
      headers: {
        'Authorization': `Client-ID ${CONFIG.unsplashAccessKey}`,
      },
    };
    
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          const images = result.results?.map(img => ({
            id: img.id,
            url: img.urls.regular,
            downloadUrl: img.links.download_location,
            thumb: img.urls.small,
            source: 'unsplash',
            photographer: img.user.name,
            description: img.description || img.alt_description,
          })) || [];
          resolve(images);
        } catch (e) {
          log.error(`Unsplash API error: ${e.message}`);
          resolve([]);
        }
      });
    }).on('error', (err) => {
      log.error(`Unsplash request failed: ${err.message}`);
      resolve([]);
    });
  });
}

// Search Pexels
async function searchPexels(query, count = 3) {
  if (!CONFIG.pexelsApiKey) {
    log.warning('Pexels API key not configured');
    return [];
  }
  
  const searchQuery = encodeURIComponent(query);
  const url = `https://api.pexels.com/v1/search?query=${searchQuery}&per_page=${count}&orientation=landscape`;
  
  return new Promise((resolve) => {
    const options = {
      headers: {
        'Authorization': CONFIG.pexelsApiKey,
      },
    };
    
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          const images = result.photos?.map(img => ({
            id: `pexels-${img.id}`,
            url: img.src.large,
            thumb: img.src.medium,
            source: 'pexels',
            photographer: img.photographer,
            description: img.alt,
          })) || [];
          resolve(images);
        } catch (e) {
          log.error(`Pexels API error: ${e.message}`);
          resolve([]);
        }
      });
    }).on('error', (err) => {
      log.error(`Pexels request failed: ${err.message}`);
      resolve([]);
    });
  });
}

// Download image
async function downloadImage(url, outputPath) {
  return new Promise((resolve, reject) => {
    const file = require('fs').createWriteStream(outputPath);
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(outputPath);
      });
    }).on('error', (err) => {
      require('fs').unlink(outputPath, () => {});
      reject(err);
    });
  });
}

// Generate text-based fallback image using ImageMagick
async function generateTextGraphic(headline, outputPath) {
  try {
    // Check if ImageMagick is available
    execSync('which convert', { stdio: 'ignore' });
    
    const width = 1200;
    const height = 630;
    const safeHeadline = headline.replace(/["']/g, '\\"');
    
    const cmd = `convert -size ${width}x${height} xc:'#0a0a0a' ` +
      `-fill '#00ADEE' -font ${CONFIG.brand.fontFamily} -pointsize 48 -gravity center ` +
      `-annotate +0+0 "${safeHeadline}" ` +
      `-fill '#666666' -pointsize 16 -gravity southeast -annotate +20+20 "${CONFIG.brand.handle}" ` +
      `"${outputPath}"`;
    
    execSync(cmd);
    return true;
  } catch (e) {
    log.warning(`ImageMagick not available or error: ${e.message}`);
    return false;
  }
}

// Apply brand overlay using ImageMagick
async function applyBrandOverlay(inputPath, outputPath, options = {}) {
  try {
    const { width = 1200, height = 630, addText = false, text = '' } = options;
    
    // Check if ImageMagick is available
    execSync('which convert', { stdio: 'ignore' });
    
    let cmd = `convert "${inputPath}" -resize ${width}x${height}^ -gravity center -extent ${width}x${height} `;
    
    // Add gradient overlay at bottom
    cmd += `\\( -size ${width}x80 gradient:'#00000000-#000000cc' \\) -gravity south -composite `;
    
    // Add handle text
    cmd += `-fill '#00ADEE' -font ${CONFIG.brand.fontFamily} -pointsize 18 -gravity southeast -annotate +20+20 "${CONFIG.brand.handle}" `;
    
    // Add optional headline text
    if (addText && text) {
      const safeText = text.replace(/["']/g, '\\"').substring(0, 60);
      cmd += `-fill white -pointsize 36 -gravity south -annotate +0+40 "${safeText}" `;
    }
    
    cmd += `"${outputPath}"`;
    
    execSync(cmd);
    return outputPath;
  } catch (e) {
    log.warning(`Brand overlay failed: ${e.message}`);
    // Return original if overlay fails
    return inputPath;
  }
}

// Main function
async function main() {
  const options = parseArgs();
  
  console.log('');
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║     📨 NEWSLETTER IMAGE SOURCING TOOL             ║');
  console.log('╚════════════════════════════════════════════════════╝');
  console.log('');
  
  if (!options.topic && !options.headline) {
    log.error('Usage: node fetch.js --topic="luxury fashion" --headline="The LVMH Effect"');
    log.info('Required: --topic or --headline');
    process.exit(1);
  }
  
  const searchQuery = options.topic || options.headline;
  const outputDir = path.join(CONFIG.basePath, options.date);
  await ensureDir(outputDir);
  
  log.info(`Searching for: "${searchQuery}"`);
  log.info(`Output directory: ${outputDir}`);
  
  // Step 1: Search for images
  log.step(1, 'Searching image sources');
  
  const [unsplashResults, pexelsResults] = await Promise.all([
    searchUnsplash(searchQuery, options.count),
    searchPexels(searchQuery, options.count),
  ]);
  
  const allImages = [...unsplashResults, ...pexelsResults];
  log.success(`Found ${unsplashResults.length} Unsplash + ${pexelsResults.length} Pexels images`);
  
  if (allImages.length === 0) {
    log.warning('No images found via APIs, generating text graphic fallback');
    
    // Generate fallback
    const fallbackPath = path.join(outputDir, 'fallback-generated.jpg');
    const generated = await generateTextGraphic(options.headline || searchQuery, fallbackPath);
    
    if (generated) {
      log.success(`Generated fallback image: ${fallbackPath}`);
      console.log('');
      console.log(JSON.stringify({
        success: true,
        images: [fallbackPath],
        source: 'generated',
        count: 1,
      }, null, 2));
    } else {
      log.error('Failed to generate fallback image');
      process.exit(1);
    }
    return;
  }
  
  // Step 2: Download images
  log.step(2, 'Downloading top matches');
  
  const downloadedImages = [];
  const topImages = allImages.slice(0, options.count);
  
  for (let i = 0; i < topImages.length; i++) {
    const img = topImages[i];
    const filename = `option-${i + 1}-${img.source}-${img.id}.jpg`;
    const outputPath = path.join(outputDir, filename);
    
    try {
      await downloadImage(img.url, outputPath);
      downloadedImages.push({
        path: outputPath,
        source: img.source,
        photographer: img.photographer,
        description: img.description,
      });
      log.success(`Downloaded: ${filename}`);
    } catch (e) {
      log.error(`Failed to download from ${img.source}: ${e.message}`);
    }
  }
  
  // Step 3: Create branded versions
  log.step(3, 'Applying brand overlay');
  
  const brandedImages = [];
  for (const img of downloadedImages) {
    const brandedPath = img.path.replace('.jpg', '-branded.jpg');
    try {
      const result = await applyBrandOverlay(img.path, brandedPath, {
        width: CONFIG.dimensions.substack.width,
        height: CONFIG.dimensions.substack.height,
        addText: false,
      });
      brandedImages.push(result);
      log.success(`Branded: ${path.basename(result)}`);
    } catch (e) {
      log.warning(`Skipping brand overlay for ${img.path}`);
      brandedImages.push(img.path);
    }
  }
  
  // Step 4: Create metadata
  log.step(4, 'Saving metadata');
  
  const metadata = {
    date: options.date,
    topic: searchQuery,
    headline: options.headline,
    searched: {
      unsplash: unsplashResults.length,
      pexels: pexelsResults.length,
    },
    downloaded: downloadedImages.map(img => ({
      path: img.path,
      source: img.source,
      photographer: img.photographer,
    })),
    branded: brandedImages,
    generated: false,
  };
  
  const metadataPath = path.join(outputDir, 'metadata.json');
  await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
  log.success(`Metadata saved: ${metadataPath}`);
  
  // Final output
  console.log('');
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║     ✅ IMAGE SOURCING COMPLETE                    ║');
  console.log('╚════════════════════════════════════════════════════╝');
  console.log('');
  console.log(JSON.stringify({
    success: true,
    images: brandedImages,
    rawImages: downloadedImages.map(i => i.path),
    metadata: metadataPath,
    count: brandedImages.length,
  }, null, 2));
}

// Run if called directly
if (require.main === module) {
  main().catch(err => {
    log.error(`Fatal error: ${err.message}`);
    process.exit(1);
  });
}

// Export for use as module
module.exports = {
  searchUnsplash,
  searchPexels,
  downloadImage,
  applyBrandOverlay,
  generateTextGraphic,
};
