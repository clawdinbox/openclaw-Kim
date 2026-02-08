#!/usr/bin/env node
/**
 * OCR Tool for Screenshots
 * Main CLI entry point for image analysis
 * 
 * Usage: node image-analyze.js /path/to/image.jpg [--format json|text] [--type auto|calendar|analytics]
 */

const path = require('path');
const fs = require('fs');

// Import our modules
const ocr = require('./ocr');
const analyzer = require('./analyze-screenshot');
const cache = require('./cache');
const visionFallback = require('./vision-fallback');

// Parse CLI arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    imagePath: null,
    format: 'json', // json, text
    type: 'auto',   // auto, calendar, analytics, text
    useCache: true,
    forceOcr: false,
    confidenceThreshold: 70
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--format' || arg === '-f') {
      options.format = args[++i];
    } else if (arg === '--type' || arg === '-t') {
      options.type = args[++i];
    } else if (arg === '--no-cache') {
      options.useCache = false;
    } else if (arg === '--force-ocr') {
      options.forceOcr = true;
    } else if (arg === '--confidence') {
      options.confidenceThreshold = parseInt(args[++i], 10);
    } else if (!arg.startsWith('-') && !options.imagePath) {
      options.imagePath = arg;
    }
  }

  return options;
}

async function main() {
  const options = parseArgs();
  
  // Validate image path
  if (!options.imagePath) {
    console.error('Error: Please provide an image path');
    console.error('Usage: image-analyze <image.jpg> [--format json|text] [--type auto|calendar|analytics]');
    process.exit(1);
  }

  const imagePath = path.resolve(options.imagePath);
  
  if (!fs.existsSync(imagePath)) {
    console.error(`Error: Image not found: ${imagePath}`);
    process.exit(1);
  }

  try {
    console.error(`📷 Analyzing: ${path.basename(imagePath)}`);
    const startTime = Date.now();

    // Check cache first
    let result = null;
    let cacheHit = false;
    
    if (options.useCache && !options.forceOcr) {
      const cached = await cache.get(imagePath);
      if (cached) {
        result = cached;
        cacheHit = true;
        console.error('✅ Cache hit');
      }
    }

    // Run OCR if not cached
    if (!result) {
      console.error('🔍 Running OCR...');
      
      // Try Tesseract first
      const ocrResult = await ocr.extractText(imagePath);
      
      // Check if we need vision fallback
      if (ocrResult.confidence < options.confidenceThreshold) {
        console.error(`⚠️ Low confidence (${ocrResult.confidence}%), trying vision fallback...`);
        const visionResult = await visionFallback.analyze(imagePath);
        result = {
          ...ocrResult,
          text: visionResult.text || ocrResult.text,
          visionEnhanced: true,
          type: options.type === 'auto' ? analyzer.detectType(visionResult.text) : options.type
        };
      } else {
        result = {
          ...ocrResult,
          type: options.type === 'auto' ? analyzer.detectType(ocrResult.text) : options.type
        };
      }

      // Cache the result
      if (options.useCache) {
        await cache.set(imagePath, result);
      }
    }

    // Analyze based on detected type
    const analysis = analyzer.analyze(result.text, result.type);
    
    const finalResult = {
      success: true,
      image: path.basename(imagePath),
      type: result.type,
      confidence: result.confidence,
      cacheHit,
      processingTime: Date.now() - startTime,
      text: result.text.trim(),
      ...analysis
    };

    // Output based on format
    if (options.format === 'text') {
      console.log(finalResult.text);
    } else {
      console.log(JSON.stringify(finalResult, null, 2));
    }

  } catch (error) {
    console.error('Error:', error.message);
    if (options.format === 'json') {
      console.log(JSON.stringify({ success: false, error: error.message }, null, 2));
    }
    process.exit(1);
  }
}

main();
