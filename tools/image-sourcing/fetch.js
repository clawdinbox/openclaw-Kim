#!/usr/bin/env node
/**
 * Image Sourcing Module
 * Auto-find and format images for social posts
 * 
 * Usage: node fetch.js "luxury fashion" [--count=3]
 */

import fetch from 'node-fetch';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Config - Set your API keys here or via env vars
const CONFIG = {
  unsplash: {
    accessKey: process.env.UNSPLASH_ACCESS_KEY || '',
    baseUrl: 'https://api.unsplash.com'
  },
  pexels: {
    apiKey: process.env.PEXELS_API_KEY || '',
    baseUrl: 'https://api.pexels.com/v1'
  },
  brand: {
    cyan: '#00ADEE',
    handle: '@marcel.melzig',
    fontSize: 24
  },
  output: {
    instagram: { width: 1080, height: 1080 },
    linkedin: { width: 1200, height: 627 }
  }
};

class ImageSourcer {
  constructor() {
    this.results = [];
  }

  async searchUnsplash(query, perPage = 5) {
    if (!CONFIG.unsplash.accessKey) {
      console.log('⚠️  No Unsplash API key found, skipping...');
      return [];
    }

    try {
      const url = `${CONFIG.unsplash.baseUrl}/search/photos?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=squarish`;
      const response = await fetch(url, {
        headers: { 'Authorization': `Client-ID ${CONFIG.unsplash.accessKey}` }
      });

      if (!response.ok) throw new Error(`Unsplash API error: ${response.status}`);
      
      const data = await response.json();
      return data.results.map(img => ({
        id: img.id,
        url: img.urls.regular,
        thumb: img.urls.small,
        author: img.user.name,
        source: 'unsplash'
      }));
    } catch (error) {
      console.error('Unsplash search failed:', error.message);
      return [];
    }
  }

  async searchPexels(query, perPage = 5) {
    if (!CONFIG.pexels.apiKey) {
      console.log('⚠️  No Pexels API key found, skipping...');
      return [];
    }

    try {
      const url = `${CONFIG.pexels.baseUrl}/search?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=square`;
      const response = await fetch(url, {
        headers: { 'Authorization': CONFIG.pexels.apiKey }
      });

      if (!response.ok) throw new Error(`Pexels API error: ${response.status}`);
      
      const data = await response.json();
      return data.photos.map(img => ({
        id: `pexels-${img.id}`,
        url: img.src.large,
        thumb: img.src.medium,
        author: img.photographer,
        source: 'pexels'
      }));
    } catch (error) {
      console.error('Pexels search failed:', error.message);
      return [];
    }
  }

  async downloadImage(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Download failed: ${response.status}`);
      return Buffer.from(await response.arrayBuffer());
    } catch (error) {
      console.error('Download failed:', error.message);
      return null;
    }
  }

  async createBrandOverlay(width, height) {
    // Create a transparent overlay with brand elements
    const overlay = sharp({
      create: {
        width,
        height,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    });

    // Create bottom gradient fade (SVG)
    const gradientHeight = Math.floor(height * 0.25);
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="fade" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:rgb(0,0,0);stop-opacity:0" />
            <stop offset="100%" style="stop-color:rgb(0,0,0);stop-opacity:0.7" />
          </linearGradient>
        </defs>
        <rect x="0" y="${height - gradientHeight}" width="${width}" height="${gradientHeight}" fill="url(#fade)" />
        <rect x="0" y="${height - 4}" width="${width}" height="4" fill="${CONFIG.brand.cyan}" />
        <text x="${width - 20}" y="${height - 20}" font-family="Arial, sans-serif" font-size="${CONFIG.brand.fontSize}" fill="white" text-anchor="end" font-weight="500">${CONFIG.brand.handle}</text>
      </svg>
    `;

    return overlay.composite([{ input: Buffer.from(svg), blend: 'over' }]);
  }

  async processImage(imageBuffer, format, outputPath) {
    const { width, height } = CONFIG.output[format];
    
    try {
      // Resize and crop to target dimensions
      const resized = await sharp(imageBuffer)
        .resize(width, height, { fit: 'cover', position: 'center' })
        .toBuffer();

      // Create brand overlay
      const overlay = await this.createBrandOverlay(width, height);
      const overlayBuffer = await overlay.png().toBuffer();

      // Composite overlay onto image
      const final = await sharp(resized)
        .composite([{ input: overlayBuffer, blend: 'over' }])
        .jpeg({ quality: 90 });

      await final.toFile(outputPath);
      return true;
    } catch (error) {
      console.error('Image processing failed:', error.message);
      return false;
    }
  }

  async saveMetadata(outputDir, metadata) {
    const metaPath = path.join(outputDir, 'metadata.json');
    await fs.writeFile(metaPath, JSON.stringify(metadata, null, 2));
  }

  async run(query, count = 3) {
    console.log(`🔍 Searching for: "${query}"`);
    
    // Create output directory
    const today = new Date().toISOString().split('T')[0];
    const outputDir = path.join('/Users/clawdmm/.openclaw/workspace/documents/daily-posts', today);
    await fs.mkdir(outputDir, { recursive: true });

    // Search for images
    let images = await this.searchUnsplash(query, count + 2);
    
    if (images.length < count) {
      console.log('📦 Falling back to Pexels...');
      const pexelsImages = await this.searchPexels(query, count + 2);
      images = [...images, ...pexelsImages];
    }

    if (images.length === 0) {
      console.error('❌ No images found. Check your API keys.');
      console.log('\n💡 To get API keys:');
      console.log('   Unsplash: https://unsplash.com/developers');
      console.log('   Pexels: https://www.pexels.com/api/');
      return [];
    }

    console.log(`📸 Found ${images.length} images, processing top ${count}...`);

    const results = [];
    const metadata = {
      query,
      date: today,
      images: []
    };

    // Process top images
    for (let i = 0; i < Math.min(count, images.length); i++) {
      const img = images[i];
      console.log(`  ↳ Downloading from ${img.source}...`);
      
      const imageBuffer = await this.downloadImage(img.url);
      if (!imageBuffer) continue;

      // Generate both formats
      const baseName = `${String(i + 1).padStart(2, '0')}-${img.id}`;
      const instagramPath = path.join(outputDir, `${baseName}-instagram.jpg`);
      const linkedinPath = path.join(outputDir, `${baseName}-linkedin.jpg`);

      const igSuccess = await this.processImage(imageBuffer, 'instagram', instagramPath);
      const liSuccess = await this.processImage(imageBuffer, 'linkedin', linkedinPath);

      if (igSuccess && liSuccess) {
        results.push({
          id: img.id,
          source: img.source,
          author: img.author,
          instagram: instagramPath,
          linkedin: linkedinPath
        });
        metadata.images.push({
          index: i + 1,
          source: img.source,
          author: img.author,
          originalUrl: img.url
        });
        console.log(`  ✅ Processed: ${baseName}`);
      }
    }

    await this.saveMetadata(outputDir, metadata);
    
    console.log(`\n✨ Done! Saved ${results.length} image sets to:`);
    console.log(`   ${outputDir}\n`);

    return results;
  }
}

// CLI
const query = process.argv[2];
if (!query) {
  console.log('Usage: node fetch.js "search query" [--count=3]');
  console.log('\nExamples:');
  console.log('  node fetch.js "luxury fashion"');
  console.log('  node fetch.js "AI technology" --count=5');
  process.exit(1);
}

const countArg = process.argv.find(arg => arg.startsWith('--count='));
const count = countArg ? parseInt(countArg.split('=')[1]) : 3;

const sourcer = new ImageSourcer();
sourcer.run(query, count).catch(console.error);
