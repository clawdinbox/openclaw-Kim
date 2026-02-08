/**
 * OCR Module - Tesseract.js Integration
 * Handles text extraction from images with German and English support
 */

const Tesseract = require('tesseract.js');
const path = require('path');

// Configuration for Tesseract
const TESSERACT_CONFIG = {
  lang: 'eng+deu', // English + German
  logger: m => {
    // Only log progress in verbose mode
    if (process.env.OCR_VERBOSE) {
      console.error(m);
    }
  }
};

/**
 * Extract text from an image using Tesseract
 * @param {string} imagePath - Path to the image file
 * @returns {Promise<Object>} OCR result with text, confidence, and word data
 */
async function extractText(imagePath) {
  try {
    const result = await Tesseract.recognize(imagePath, TESSERACT_CONFIG.lang, {
      logger: TESSERACT_CONFIG.logger
    });

    return {
      text: result.data.text,
      confidence: result.data.confidence,
      words: result.data.words || [],
      lines: result.data.lines || [],
      paragraphs: result.data.paragraphs || [],
      language: TESSERACT_CONFIG.lang
    };
  } catch (error) {
    throw new Error(`OCR failed: ${error.message}`);
  }
}

/**
 * Extract text from a buffer (for in-memory images)
 * @param {Buffer} imageBuffer - Image data buffer
 * @returns {Promise<Object>} OCR result
 */
async function extractTextFromBuffer(imageBuffer) {
  try {
    const result = await Tesseract.recognize(imageBuffer, TESSERACT_CONFIG.lang, {
      logger: TESSERACT_CONFIG.logger
    });

    return {
      text: result.data.text,
      confidence: result.data.confidence,
      words: result.data.words || [],
      lines: result.data.lines || [],
      paragraphs: result.data.paragraphs || [],
      language: TESSERACT_CONFIG.lang
    };
  } catch (error) {
    throw new Error(`OCR failed: ${error.message}`);
  }
}

/**
 * Get confidence score for the OCR result
 * @param {Object} ocrResult - Result from extractText
 * @returns {number} Average confidence (0-100)
 */
function getConfidenceScore(ocrResult) {
  if (ocrResult.confidence) {
    return ocrResult.confidence;
  }
  
  // Calculate from words if available
  if (ocrResult.words && ocrResult.words.length > 0) {
    const total = ocrResult.words.reduce((sum, w) => sum + (w.confidence || 0), 0);
    return Math.round(total / ocrResult.words.length);
  }
  
  return 0;
}

/**
 * Clean up extracted text (remove artifacts, normalize whitespace)
 * @param {string} text - Raw OCR text
 * @returns {string} Cleaned text
 */
function cleanText(text) {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')  // Max 2 consecutive newlines
    .replace(/[ \t]+/g, ' ')      // Normalize whitespace
    .replace(/^\s+|\s+$/g, '')    // Trim
    .replace(/\|/g, 'I')          // Common OCR error: | -> I
    .replace(/0(?=\d)/g, 'O')     // 0 followed by digit -> O
    .trim();
}

module.exports = {
  extractText,
  extractTextFromBuffer,
  getConfidenceScore,
  cleanText
};
