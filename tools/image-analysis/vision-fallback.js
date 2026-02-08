/**
 * Vision Fallback Module
 * Uses GPT-4 Vision API for complex layouts or low-confidence OCR
 * Only called when Tesseract confidence is below threshold
 */

const fs = require('fs');
const path = require('path');

// Default confidence threshold for fallback
const FALLBACK_THRESHOLD = 70;

/**
 * Check if vision fallback should be used
 * @param {number} confidence - Tesseract confidence score
 * @param {string} text - Extracted text
 * @returns {boolean} Whether to use vision fallback
 */
function shouldUseFallback(confidence, text) {
  // Use fallback if confidence is low
  if (confidence < FALLBACK_THRESHOLD) return true;
  
  // Use fallback if text seems garbled or empty
  if (!text || text.trim().length === 0) return true;
  
  // Use fallback if text has many unrecognized characters
  const unrecognizedRatio = (text.match(/[^\w\s\d.,;:!?@#\$%&*()\[\]{}\/\\<>"'-_+=|]/g) || []).length / text.length;
  if (unrecognizedRatio > 0.3) return true;
  
  return false;
}

/**
 * Analyze image using GPT-4 Vision API
 * Note: Requires OPENAI_API_KEY environment variable
 * @param {string} imagePath - Path to image file
 * @param {Object} options - Analysis options
 * @returns {Promise<Object>} Vision API result
 */
async function analyze(imagePath, options = {}) {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.error('⚠️ OPENAI_API_KEY not set, skipping vision fallback');
    return { text: '', enhanced: false, error: 'API key not configured' };
  }

  try {
    // Read and encode image
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    
    // Determine mime type
    const ext = path.extname(imagePath).toLowerCase();
    const mimeType = ext === '.png' ? 'image/png' : 
                     ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 
                     ext === '.gif' ? 'image/gif' : 'image/png';

    // Prepare prompt based on context
    const prompt = options.prompt || `
Analyze this screenshot and extract all visible text.
If this is a calendar/schedule, identify:
- Dates and times
- Platform names (X, Threads, Instagram, etc.)
- Post content previews

If this is an analytics dashboard, identify:
- Metric names and values
- Platform indicators
- Time periods

Return the extracted text in a clean, structured format.
`;

    console.error('🤖 Calling Vision API...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',  // Vision-capable model
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`,
                  detail: options.detail || 'auto'
                }
              }
            ]
          }
        ],
        max_tokens: options.maxTokens || 2000
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Vision API error: ${error}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';

    return {
      text,
      enhanced: true,
      model: data.model,
      usage: data.usage
    };

  } catch (error) {
    console.error('Vision API error:', error.message);
    return { 
      text: '', 
      enhanced: false, 
      error: error.message 
    };
  }
}

/**
 * Quick analysis with specific focus
 * @param {string} imagePath - Path to image
 * @param {string} focus - What to focus on: 'text', 'calendar', 'analytics', 'table'
 * @returns {Promise<Object>} Analysis result
 */
async function quickAnalyze(imagePath, focus = 'text') {
  const prompts = {
    text: 'Extract all visible text from this image. Return it exactly as it appears.',
    calendar: 'This is a calendar or schedule screenshot. Extract all dates, times, events, and any associated details. Format clearly.',
    analytics: 'This is an analytics dashboard. Extract all metric names and their values, including any numbers, percentages, or time periods.',
    table: 'This image contains a table. Extract the table data with headers and rows, preserving the structure.'
  };

  return analyze(imagePath, { prompt: prompts[focus] || prompts.text });
}

module.exports = {
  shouldUseFallback,
  analyze,
  quickAnalyze,
  FALLBACK_THRESHOLD
};
