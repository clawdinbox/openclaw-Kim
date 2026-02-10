#!/usr/bin/env node
/**
 * Demo script for the Daily Image Sourcing Pipeline
 * 
 * Tests all components and shows the full workflow.
 * 
 * Usage:
 *   node demo.js
 */

import { runPipeline, CONFIG } from './daily-image-pipeline.js';
import { searchNewsImages } from './news-source.js';
import { findBrandsInText, getPortalByBrand } from './brand-source.js';
import fs from 'fs/promises';

const log = {
  section: (title) => console.log(`\n${'═'.repeat(60)}\n  ${title}\n${'═'.repeat(60)}`),
  info: (msg) => console.log(`ℹ️  ${msg}`),
  success: (msg) => console.log(`✅ ${msg}`),
  warning: (msg) => console.log(`⚠️  ${msg}`),
};

async function demo() {
  log.section('DAILY IMAGE SOURCING PIPELINE DEMO');
  
  const topic = 'AI in fashion';
  const headline = 'How AI is Reshaping Retail and Design';
  
  log.info(`Topic: "${topic}"`);
  log.info(`Headline: "${headline}"`);
  
  // Check API keys
  log.section('API KEY STATUS');
  log.info(`OpenAI: ${process.env.OPENAI_API_KEY ? '✅ Configured' : '❌ Not set'}`);
  log.info(`Unsplash: ${process.env.UNSPLASH_ACCESS_KEY ? '✅ Configured' : '❌ Not set'}`);
  log.info(`Pexels: ${process.env.PEXELS_API_KEY ? '✅ Configured' : '❌ Not set'}`);
  log.info(`NewsAPI: ${process.env.NEWSAPI_KEY ? '✅ Configured' : '❌ Not set'}`);
  
  // Test brand detection
  log.section('BRAND DETECTION TEST');
  const brands = findBrandsInText(`${topic} ${headline} featuring Nike and LVMH strategies`);
  log.info(`Found brands in text:`);
  brands.forEach(b => {
    console.log(`  - ${b.brand} (${b.portal})`);
    const portal = getPortalByBrand(b.brand);
    if (portal) {
      console.log(`    Portal: ${portal.portalUrl}`);
    }
  });
  
  // Test news search (if API key available)
  if (process.env.NEWSAPI_KEY) {
    log.section('NEWS SOURCE TEST');
    const newsImages = await searchNewsImages(topic, 3);
    log.success(`Found ${newsImages.length} news images`);
    newsImages.forEach((img, i) => {
      console.log(`  ${i + 1}. ${img.publisher}: ${img.title?.slice(0, 50)}...`);
    });
  }
  
  // Run full pipeline
  log.section('FULL PIPELINE TEST');
  log.info('Running pipeline...');
  
  try {
    const result = await runPipeline({
      topic,
      headline,
      platforms: 'instagram,linkedin,x',
      source: 'auto',
    });
    
    log.success('Pipeline completed!');
    log.info(`Source type: ${result.source}`);
    log.info(`Images generated: ${result.images.length}`);
    log.info(`Platforms: ${result.platforms.join(', ')}`);
    log.info(`Output directory: ${result.outputDir}`);
    
    // Show metadata
    const metadataPath = result.metadata;
    const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf-8'));
    log.info(`\nMetadata saved to: ${metadataPath}`);
    
  } catch (err) {
    log.warning(`Pipeline test failed: ${err.message}`);
  }
  
  log.section('DEMO COMPLETE');
  console.log(`\n📚 Documentation: documents/concepts/image-pipeline-approach.md`);
  console.log(`🔧 Config: tools/image-sourcing/README.md`);
}

demo().catch(console.error);
