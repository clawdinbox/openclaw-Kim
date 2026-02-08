#!/usr/bin/env node
/**
 * Cron Image Wrapper — Integration for Scheduled Posts
 * 
 * This module integrates the daily-image-pipeline with the posting automation system.
 * Called by cron jobs to automatically generate images for scheduled posts.
 * 
 * Usage (from cron jobs):
 *   node cron-image-wrapper.js --topic="AI in fashion" --headline="The Future of Retail"
 * 
 * Returns JSON with image paths for each platform.
 */

import { runPipeline, CONFIG } from './daily-image-pipeline.js';
import fs from 'fs/promises';
import path from 'path';

const log = {
  info: (msg) => console.log(`ℹ️  ${msg}`),
  success: (msg) => console.log(`✅ ${msg}`),
  warning: (msg) => console.log(`⚠️  ${msg}`),
  error: (msg) => console.error(`❌ ${msg}`),
};

/**
 * Get the latest image for a platform from a specific date
 */
async function getLatestImage(platform, date = null) {
  const targetDate = date || new Date().toISOString().split('T')[0];
  const outputDir = path.join(CONFIG.basePath, targetDate);
  
  try {
    const files = await fs.readdir(outputDir);
    const platformFiles = files
      .filter(f => f.startsWith(`${platform}-`) && f.endsWith('.jpg'))
      .sort()
      .reverse();
    
    if (platformFiles.length > 0) {
      return path.join(outputDir, platformFiles[0]);
    }
    return null;
  } catch (e) {
    return null;
  }
}

/**
 * Get all platform images for a date
 */
async function getAllImages(date = null) {
  const targetDate = date || new Date().toISOString().split('T')[0];
  const platforms = ['instagram', 'linkedin', 'x', 'threads', 'substack'];
  const result = {};
  
  for (const platform of platforms) {
    result[platform] = await getLatestImage(platform, targetDate);
  }
  
  return result;
}

/**
 * Check if images already exist for a date
 */
async function imagesExist(date = null) {
  const targetDate = date || new Date().toISOString().split('T')[0];
  const outputDir = path.join(CONFIG.basePath, targetDate);
  
  try {
    const files = await fs.readdir(outputDir);
    return files.some(f => f.includes('-instagram-') || f.includes('-linkedin-'));
  } catch (e) {
    return false;
  }
}

/**
 * Main wrapper for cron integration
 */
async function runForCron(options) {
  log.info('Cron Image Wrapper — Generating images for scheduled posts');
  
  // Skip if images already exist (unless --force)
  if (!options.force && await imagesExist(options.date)) {
    log.info('Images already exist for this date, skipping generation');
    const existing = await getAllImages(options.date);
    return {
      success: true,
      skipped: true,
      reason: 'images_already_exist',
      images: existing,
    };
  }
  
  // Run the pipeline
  const result = await runPipeline(options);
  
  // Add cron-friendly metadata
  result.cronMetadata = {
    generatedAt: new Date().toISOString(),
    forDate: options.date,
    platforms: options.platforms,
  };
  
  return result;
}

/**
 * Parse CLI arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    topic: '',
    headline: '',
    date: new Date().toISOString().split('T')[0],
    platforms: 'all',
    source: 'auto',
    force: false,
  };
  
  for (const arg of args) {
    if (arg.startsWith('--topic=')) {
      options.topic = arg.split('=')[1].replace(/^["']|["']$/g, '');
    } else if (arg.startsWith('--headline=')) {
      options.headline = arg.split('=')[1].replace(/^["']|["']$/g, '');
    } else if (arg.startsWith('--date=')) {
      options.date = arg.split('=')[1];
    } else if (arg.startsWith('--platforms=')) {
      options.platforms = arg.split('=')[1];
    } else if (arg.startsWith('--source=')) {
      options.source = arg.split('=')[1];
    } else if (arg === '--force') {
      options.force = true;
    } else if (arg === '--help' || arg === '-h') {
      showHelp();
      process.exit(0);
    }
  }
  
  return options;
}

function showHelp() {
  console.log(`
Cron Image Wrapper — Generate images for scheduled social posts

USAGE:
  node cron-image-wrapper.js --topic="AI in fashion" [options]

OPTIONS:
  --topic=STRING      Content topic (required)
  --headline=STRING   Content headline for AI generation context
  --date=YYYY-MM-DD   Target date (default: today)
  --platforms=LIST    instagram,linkedin,x,threads,substack (default: all)
  --source=TYPE       auto, ai, stock (default: auto)
  --force             Regenerate even if images exist
  --help, -h          Show this help

OUTPUT (JSON):
  {
    "success": true,
    "source": "ai-generated",
    "images": ["/path/to/instagram-01.jpg", ...],
    "platforms": ["instagram", "linkedin", "x", "threads"]
  }
`);
}

/**
 * CLI handler
 */
async function main() {
  const options = parseArgs();
  
  if (!options.topic && !options.headline) {
    console.error('❌ Error: --topic or --headline required');
    process.exit(1);
  }
  
  try {
    const result = await runForCron(options);
    
    // Output JSON for cron job parsing
    console.log('\n📦 JSON_OUTPUT:');
    console.log(JSON.stringify(result, null, 2));
    
    process.exit(0);
  } catch (err) {
    log.error(`Failed: ${err.message}`);
    console.error(err.stack);
    process.exit(1);
  }
}

import { fileURLToPath } from 'url';

// Module exports for programmatic use
export { getLatestImage, getAllImages, imagesExist, runForCron };

// CLI entry point
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  main();
}
