#!/usr/bin/env node
/**
 * Daily Image Sourcing Pipeline — Unified Module (ESM Edition)
 * 
 * Auto-find and format images for all social platforms.
 * Uses Sharp for native Node.js image processing
 * 
 * Usage:
 *   node daily-image-pipeline.js --topic="AI in fashion" --headline="How AI is Reshaping Retail"
 */

import fs from 'fs/promises';
import path from 'path';
import https from 'https';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { searchNewsImages } from './news-source.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const CONFIG = {
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  unsplashAccessKey: process.env.UNSPLASH_ACCESS_KEY || '',
  pexelsApiKey: process.env.PEXELS_API_KEY || '',
  
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
  
  basePath: '/Users/clawdmm/.openclaw/workspace/documents/daily-posts',
};

// ═══════════════════════════════════════════════════════════════════════════════
// LOGGING
// ═══════════════════════════════════════════════════════════════════════════════

const log = {
  info: (msg) => console.log(`ℹ️  ${msg}`),
  success: (msg) => console.log(`✅ ${msg}`),
  warning: (msg) => console.log(`⚠️  ${msg}`),
  error: (msg) => console.error(`❌ ${msg}`),
  step: (num, msg) => console.log(`\n🔷 Step ${num}: ${msg}`),
  section: (title) => console.log(`\n${'═'.repeat(60)}\n  ${title}\n${'═'.repeat(60)}`),
};

// ═══════════════════════════════════════════════════════════════════════════════
// CLI PARSER
// ═══════════════════════════════════════════════════════════════════════════════

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    topic: '',
    headline: '',
    count: 1,
    date: new Date().toISOString().split('T')[0],
    platforms: 'all',
    source: 'auto',
    outputDir: null,
  };
  
  for (const arg of args) {
    if (arg.startsWith('--topic=')) {
      options.topic = arg.split('=')[1].replace(/^["']|["']$/g, '');
    } else if (arg.startsWith('--headline=')) {
      options.headline = arg.split('=')[1].replace(/^["']|["']$/g, '');
    } else if (arg.startsWith('--count=')) {
      options.count = parseInt(arg.split('=')[1], 10);
    } else if (arg.startsWith('--date=')) {
      options.date = arg.split('=')[1];
    } else if (arg.startsWith('--platforms=')) {
      options.platforms = arg.split('=')[1];
    } else if (arg.startsWith('--source=')) {
      options.source = arg.split('=')[1];
    } else if (arg.startsWith('--output=')) {
      options.outputDir = arg.split('=')[1];
    } else if (arg === '--help' || arg === '-h') {
      showHelp();
      process.exit(0);
    }
  }
  
  return options;
}

function showHelp() {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║     📸 DAILY IMAGE SOURCING PIPELINE                          ║
╚════════════════════════════════════════════════════════════════╝

USAGE:
  node daily-image-pipeline.js --topic="AI in fashion"

OPTIONS:
  --topic=STRING        Search topic (required)
  --headline=STRING     Content headline for context
  --date=YYYY-MM-DD     Output date folder (default: today)
  --platforms=LIST      instagram,linkedin,x,threads,substack
  --source=TYPE         auto, ai, news, stock
`);
}

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

async function ensureDir(dirPath) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (err) {
    // Directory might already exist
  }
}

function getOutputDir(options) {
  if (options.outputDir) return options.outputDir;
  return path.join(CONFIG.basePath, options.date);
}

function getPlatformsList(platformsOption) {
  if (platformsOption === 'all') {
    return Object.keys(CONFIG.platforms);
  }
  return platformsOption.split(',').map(p => p.trim()).filter(p => CONFIG.platforms[p]);
}

// ═══════════════════════════════════════════════════════════════════════════════
// IMAGE SOURCES
// ═══════════════════════════════════════════════════════════════════════════════

async function generateAIImage(prompt) {
  if (!CONFIG.openaiApiKey) {
    log.warning('OpenAI API key not configured');
    return null;
  }
  
  log.info('Generating AI image with DALL-E 3...');
  
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
    });
    
    const requestOptions = {
      hostname: 'api.openai.com',
      port: 443,
      path: '/v1/images/generations',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CONFIG.openaiApiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };
    
    const req = https.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.data && result.data[0] && result.data[0].url) {
            resolve({
              url: result.data[0].url,
              source: 'ai-generated',
              revisedPrompt: result.data[0].revised_prompt,
            });
          } else {
            log.error(`AI generation failed: ${result.error?.message || 'Unknown error'}`);
            resolve(null);
          }
        } catch (e) {
          log.error(`AI generation parse error: ${e.message}`);
          resolve(null);
        }
      });
    });
    
    req.on('error', (err) => {
      log.error(`AI generation request failed: ${err.message}`);
      resolve(null);
    });
    
    req.write(postData);
    req.end();
  });
}

function buildAIPrompt(topic, headline) {
  const basePrompt = headline || topic;
  return `${basePrompt}. Professional business photography, clean composition, modern aesthetic, fashion industry context, editorial quality. No text, no logos, no watermarks. High resolution.`;
}

async function searchUnsplash(query, count = 3) {
  if (!CONFIG.unsplashAccessKey) return [];
  
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&orientation=squarish`;
  
  return new Promise((resolve) => {
    https.get(url, { headers: { 'Authorization': `Client-ID ${CONFIG.unsplashAccessKey}` } }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result.results?.map(img => ({
            id: img.id,
            url: img.urls.regular,
            source: 'unsplash',
            photographer: img.user.name,
          })) || []);
        } catch (e) { resolve([]); }
      });
    }).on('error', () => resolve([]));
  });
}

async function searchPexels(query, count = 3) {
  if (!CONFIG.pexelsApiKey) return [];
  
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${count}&orientation=square`;
  
  return new Promise((resolve) => {
    https.get(url, { headers: { 'Authorization': CONFIG.pexelsApiKey } }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result.photos?.map(img => ({
            id: `pexels-${img.id}`,
            url: img.src.large,
            source: 'pexels',
            photographer: img.photographer,
          })) || []);
        } catch (e) { resolve([]); }
      });
    }).on('error', () => resolve([]));
  });
}

async function downloadImage(url, outputPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outputPath);
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
      fs.unlink(outputPath).catch(() => {});
      reject(err);
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// IMAGE PROCESSING
// ═══════════════════════════════════════════════════════════════════════════════

function createBrandOverlaySvg(width, height) {
  const gradientHeight = Math.floor(height * 0.25);
  
  return Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="fade" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:rgb(0,0,0);stop-opacity:0" />
          <stop offset="100%" style="stop-color:rgb(0,0,0);stop-opacity:0.75" />
        </linearGradient>
      </defs>
      <rect x="0" y="${height - gradientHeight}" width="${width}" height="${gradientHeight}" fill="url(#fade)" />
      <rect x="0" y="${height - 4}" width="${width}" height="4" fill="${CONFIG.brand.accentColor}" />
      <text x="${width - 20}" y="${height - 20}" font-family="Arial, Helvetica, sans-serif" font-size="20" 
            fill="${CONFIG.brand.accentColor}" text-anchor="end" font-weight="600">${CONFIG.brand.handle}</text>
    </svg>
  `);
}

async function processForPlatform(inputPath, outputPath, platform) {
  const specs = CONFIG.platforms[platform];
  if (!specs) throw new Error(`Unknown platform: ${platform}`);
  
  const { width, height } = specs;
  const overlaySvg = createBrandOverlaySvg(width, height);
  
  await sharp(inputPath)
    .resize(width, height, { fit: 'cover', position: 'center' })
    .composite([{ input: overlaySvg, blend: 'over' }])
    .jpeg({ quality: 90, progressive: true })
    .toFile(outputPath);
  
  return outputPath;
}

async function generateTextFallback(headline, outputPath, platform = 'linkedin') {
  const specs = CONFIG.platforms[platform] || CONFIG.platforms.linkedin;
  const { width, height } = specs;
  const fontSize = width > 1100 ? 56 : 42;
  
  const safeHeadline = headline
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
  
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#0a0a0a;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1a1a1a;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#bg)" />
      <rect x="0" y="0" width="${width}" height="6" fill="${CONFIG.brand.accentColor}" />
      <text x="${width / 2}" y="${height / 2}" font-family="Arial, Helvetica, sans-serif" 
            font-size="${fontSize}" fill="white" text-anchor="middle" font-weight="bold">${safeHeadline}</text>
      <text x="${width - 20}" y="${height - 25}" font-family="Arial, Helvetica, sans-serif" 
            font-size="20" fill="${CONFIG.brand.accentColor}" text-anchor="end" font-weight="600">${CONFIG.brand.handle}</text>
      <rect x="0" y="${height - 4}" width="${width}" height="4" fill="${CONFIG.brand.accentColor}" />
    </svg>
  `;
  
  await sharp(Buffer.from(svg)).jpeg({ quality: 95 }).toFile(outputPath);
  return outputPath;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PIPELINE
// ═══════════════════════════════════════════════════════════════════════════════

async function runPipeline(options) {
  log.section('DAILY IMAGE SOURCING PIPELINE');
  
  const searchQuery = options.topic || options.headline;
  if (!searchQuery) {
    log.error('No topic or headline provided');
    process.exit(1);
  }
  
  const outputDir = getOutputDir(options);
  await ensureDir(outputDir);
  
  const platforms = getPlatformsList(options.platforms);
  log.info(`Topic: "${searchQuery}"`);
  log.info(`Platforms: ${platforms.join(', ')}`);
  log.info(`Output: ${outputDir}`);
  
  const metadata = {
    date: options.date,
    topic: options.topic,
    headline: options.headline,
    platforms: platforms,
    images: [],
  };
  
  // Step 1: Source image (AI → News → Stock → Fallback)
  log.step(1, 'Sourcing image (AI → News → Stock → Fallback)');

  let sourceImage = null;
  let sourceInfo = null;

  // Stage 1: Try AI first
  if ((options.source === 'auto' || options.source === 'ai') && CONFIG.openaiApiKey) {
    const aiPrompt = buildAIPrompt(options.topic, options.headline);
    const aiResult = await generateAIImage(aiPrompt);
    
    if (aiResult) {
      const aiPath = path.join(outputDir, 'raw-ai-source.jpg');
      try {
        // Need to use fs.createWriteStream differently for ESM
        const response = await new Promise((resolve, reject) => {
          https.get(aiResult.url, (res) => {
            if (res.statusCode !== 200) {
              reject(new Error(`HTTP ${res.statusCode}`));
              return;
            }
            const chunks = [];
            res.on('data', (chunk) => chunks.push(chunk));
            res.on('end', () => resolve(Buffer.concat(chunks)));
          }).on('error', reject);
        });
        
        await fs.writeFile(aiPath, response);
        sourceImage = aiPath;
        sourceInfo = { type: 'ai-generated', prompt: aiPrompt };
        log.success('AI image generated and downloaded');
      } catch (e) {
        log.warning(`AI download failed: ${e.message}`);
      }
    }
  }
  
  // Stage 2: News API sources
  if (!sourceImage && (options.source === 'auto' || options.source === 'news')) {
    log.info('Searching news sources...');
    
    try {
      const newsImages = await searchNewsImages(searchQuery, 5);
      
      if (newsImages.length > 0) {
        const bestNewsImage = newsImages[0];
        const newsPath = path.join(outputDir, `raw-news-${bestNewsImage.id}.jpg`);
        
        try {
          const response = await new Promise((resolve, reject) => {
            https.get(bestNewsImage.url, (res) => {
              if (res.statusCode !== 200) {
                reject(new Error(`HTTP ${res.statusCode}`));
                return;
              }
              const chunks = [];
              res.on('data', (chunk) => chunks.push(chunk));
              res.on('end', () => resolve(Buffer.concat(chunks)));
            }).on('error', reject);
          });
          
          await fs.writeFile(newsPath, response);
          sourceImage = newsPath;
          sourceInfo = {
            type: 'news',
            id: bestNewsImage.id,
            publisher: bestNewsImage.publisher,
            articleUrl: bestNewsImage.articleUrl,
            title: bestNewsImage.title,
          };
          log.success(`Downloaded from news source: ${bestNewsImage.publisher}`);
        } catch (e) {
          log.warning(`News image download failed: ${e.message}`);
        }
      }
    } catch (e) {
      log.warning(`News search failed: ${e.message}`);
    }
  }
  
  // Stage 3: Stock APIs
  if (!sourceImage && (options.source === 'auto' || options.source === 'stock')) {
    log.info('Searching stock photo APIs...');
    
    const [unsplashResults, pexelsResults] = await Promise.all([
      searchUnsplash(searchQuery, 3),
      searchPexels(searchQuery, 3),
    ]);
    
    const allImages = [...unsplashResults, ...pexelsResults];
    log.success(`Found ${allImages.length} stock images`);
    
    if (allImages.length > 0) {
      const bestImage = allImages[0];
      const stockPath = path.join(outputDir, `raw-${bestImage.source}-${bestImage.id}.jpg`);
      
      try {
        const response = await new Promise((resolve, reject) => {
          https.get(bestImage.url, (res) => {
            if (res.statusCode !== 200) {
              reject(new Error(`HTTP ${res.statusCode}`));
              return;
            }
            const chunks = [];
            res.on('data', (chunk) => chunks.push(chunk));
            res.on('end', () => resolve(Buffer.concat(chunks)));
          }).on('error', reject);
        });
        
        await fs.writeFile(stockPath, response);
        sourceImage = stockPath;
        sourceInfo = {
          type: bestImage.source,
          id: bestImage.id,
          photographer: bestImage.photographer,
        };
        log.success(`Downloaded from ${bestImage.source}`);
      } catch (e) {
        log.error(`Download failed: ${e.message}`);
      }
    }
  }
  
  // Final fallback: text graphic
  if (!sourceImage) {
    log.warning('Generating text fallback...');
    const fallbackPath = path.join(outputDir, 'raw-fallback.jpg');
    await generateTextFallback(options.headline || options.topic, fallbackPath, 'linkedin');
    sourceImage = fallbackPath;
    sourceInfo = { type: 'generated-fallback', text: options.headline || options.topic };
    log.success('Fallback graphic generated');
  }
  
  // Step 2: Process for all platforms
  log.step(2, `Formatting for platforms (${platforms.length} platforms)`);
  
  const platformResults = {};
  for (const platform of platforms) {
    const outputPath = path.join(outputDir, `${platform}-01.jpg`);
    try {
      await processForPlatform(sourceImage, outputPath, platform);
      platformResults[platform] = outputPath;
      log.success(`${platform}: ${path.basename(outputPath)}`);
    } catch (e) {
      log.error(`${platform}: ${e.message}`);
    }
  }
  
  // Step 3: Save metadata
  log.step(3, 'Saving metadata');
  
  metadata.images.push({
    index: 1,
    source: sourceInfo,
    platforms: platformResults,
  });
  
  const metadataPath = path.join(outputDir, 'metadata.json');
  await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
  log.success(`Metadata saved`);
  
  // Summary
  log.section('PIPELINE COMPLETE');
  
  return {
    success: true,
    source: sourceInfo.type,
    outputDir,
    platforms: Object.keys(platformResults),
    images: Object.values(platformResults),
    metadata: metadataPath,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS & CLI
// ═══════════════════════════════════════════════════════════════════════════════

export { runPipeline, generateAIImage, searchUnsplash, searchPexels, CONFIG };

// CLI entry point
const options = parseArgs();
if (options.topic || options.headline) {
  runPipeline(options).catch(err => {
    log.error(`Pipeline failed: ${err.message}`);
    console.error(err.stack);
    process.exit(1);
  });
}
