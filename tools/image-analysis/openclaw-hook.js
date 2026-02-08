#!/usr/bin/env node
/**
 * OpenClaw Integration Hook
 * This script provides a simple interface for OpenClaw to analyze images
 * 
 * Usage from OpenClaw:
 *   const { analyzeImage } = require('./tools/image-analysis/openclaw-hook');
 *   const result = await analyzeImage('/path/to/image.png');
 */

const ocr = require('./ocr');
const analyzer = require('./analyze-screenshot');
const cache = require('./cache');
const visionFallback = require('./vision-fallback');

const DEFAULT_OPTIONS = {
  useCache: true,
  confidenceThreshold: 70,
  type: 'auto'
};

/**
 * Analyze an image and return structured results
 * @param {string} imagePath - Absolute path to image
 * @param {Object} options - Analysis options
 * @returns {Promise<Object>} Analysis result
 */
async function analyzeImage(imagePath, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const startTime = Date.now();
  
  // Check cache
  if (opts.useCache) {
    const cached = await cache.get(imagePath);
    if (cached) {
      return {
        ...cached,
        fromCache: true,
        processingTime: Date.now() - startTime
      };
    }
  }
  
  // Run OCR
  const ocrResult = await ocr.extractText(imagePath);
  
  // Use vision fallback if needed
  let finalText = ocrResult.text;
  let visionEnhanced = false;
  
  if (ocrResult.confidence < opts.confidenceThreshold) {
    const visionResult = await visionFallback.analyze(imagePath);
    if (visionResult.text && visionResult.text.length > ocrResult.text.length * 0.8) {
      finalText = visionResult.text;
      visionEnhanced = true;
    }
  }
  
  // Detect type and analyze
  const detectedType = opts.type === 'auto' 
    ? analyzer.detectType(finalText) 
    : opts.type;
  
  const analysis = analyzer.analyze(finalText, detectedType);
  
  const result = {
    success: true,
    imagePath,
    type: detectedType,
    confidence: ocrResult.confidence,
    visionEnhanced,
    processingTime: Date.now() - startTime,
    text: finalText.trim(),
    ...analysis
  };
  
  // Cache result
  if (opts.useCache) {
    await cache.set(imagePath, result);
  }
  
  return result;
}

/**
 * Quick text extraction without analysis
 * @param {string} imagePath - Absolute path to image
 * @returns {Promise<string>} Extracted text
 */
async function extractTextOnly(imagePath) {
  const result = await ocr.extractText(imagePath);
  return result.text.trim();
}

/**
 * Analyze a Postiz calendar screenshot specifically
 * @param {string} imagePath - Absolute path to image
 * @returns {Promise<Object>} Calendar analysis
 */
async function analyzePostizCalendar(imagePath) {
  return analyzeImage(imagePath, { type: 'calendar' });
}

/**
 * Analyze an analytics dashboard screenshot
 * @param {string} imagePath - Absolute path to image
 * @returns {Promise<Object>} Analytics analysis
 */
async function analyzeAnalytics(imagePath) {
  return analyzeImage(imagePath, { type: 'analytics' });
}

// If run directly from CLI
if (require.main === module) {
  const imagePath = process.argv[2];
  
  if (!imagePath) {
    console.error('Usage: node openclaw-hook.js <image-path>');
    process.exit(1);
  }
  
  analyzeImage(imagePath)
    .then(result => {
      console.log(JSON.stringify(result, null, 2));
    })
    .catch(error => {
      console.error('Error:', error.message);
      process.exit(1);
    });
}

module.exports = {
  analyzeImage,
  extractTextOnly,
  analyzePostizCalendar,
  analyzeAnalytics
};
