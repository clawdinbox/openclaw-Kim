/**
 * Screenshot Analyzer
 * Detects type: calendar, chart, table, text
 * Returns structured data based on detected content type
 */

// Patterns for detecting content types
const PATTERNS = {
  // Postiz calendar indicators
  postiz: {
    keywords: ['postiz', 'schedule', 'scheduled', 'drafts', 'calendar', 'posts'],
    platformIndicators: ['X', 'Threads', 'Instagram', 'LinkedIn', 'TikTok', 'YouTube', 'Bluesky', 'Mastodon'],
    timePatterns: [/\d{1,2}:\d{2}/, /\d{1,2}\s*(AM|PM)/i]
  },
  
  // Analytics dashboards
  analytics: {
    keywords: ['views', 'impressions', 'engagement', 'reach', 'clicks', 'followers', 'subscribers', 'analytics', 'metrics', 'dashboard'],
    numberPatterns: [/\d+[.,]?\d*\s*(K|M|B|%)/i, /\d+[.,]?\d*\s*(views|likes|shares|comments)/i]
  },
  
  // Tables
  table: {
    patterns: [/\|\s*[^|]+\s*\|/, /^\s*-+\s*\|\s*-+/, /\t/]
  }
};

/**
 * Detect the type of content in the screenshot
 * @param {string} text - Extracted OCR text
 * @returns {string} Detected type: 'calendar', 'analytics', 'table', or 'text'
 */
function detectType(text) {
  const lowerText = text.toLowerCase();
  let scores = {
    calendar: 0,
    analytics: 0,
    table: 0,
    text: 1 // Default score
  };

  // Check for calendar/Postiz patterns
  PATTERNS.postiz.keywords.forEach(kw => {
    if (lowerText.includes(kw.toLowerCase())) scores.calendar += 2;
  });
  PATTERNS.postiz.platformIndicators.forEach(platform => {
    if (text.includes(platform)) scores.calendar += 3;
  });
  PATTERNS.postiz.timePatterns.forEach(pattern => {
    if (pattern.test(text)) scores.calendar += 1;
  });

  // Check for analytics patterns
  PATTERNS.analytics.keywords.forEach(kw => {
    if (lowerText.includes(kw.toLowerCase())) scores.analytics += 2;
  });
  PATTERNS.analytics.numberPatterns.forEach(pattern => {
    if (pattern.test(text)) scores.analytics += 1;
  });

  // Check for table patterns
  PATTERNS.table.patterns.forEach(pattern => {
    if (pattern.test(text)) scores.table += 2;
  });

  // Return the type with highest score
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return sorted[0][0];
}

/**
 * Analyze text based on detected type
 * @param {string} text - Extracted OCR text
 * @param {string} type - Detected or specified type
 * @returns {Object} Structured analysis results
 */
function analyze(text, type) {
  switch (type) {
    case 'calendar':
      return analyzeCalendar(text);
    case 'analytics':
      return analyzeAnalytics(text);
    case 'table':
      return analyzeTable(text);
    default:
      return analyzeGeneric(text);
  }
}

/**
 * Analyze calendar/post schedule content (Postiz, etc.)
 * @param {string} text - OCR text
 * @returns {Object} Structured calendar data
 */
function analyzeCalendar(text) {
  const lines = text.split('\n').filter(l => l.trim());
  
  // Extract dates (various formats)
  const datePatterns = [
    /(\d{1,2})[./](\d{1,2})[./](\d{2,4})/,  // DD/MM/YYYY or MM/DD/YYYY
    /(\d{4})-(\d{2})-(\d{2})/,              // YYYY-MM-DD
    /([A-Za-z]+)\s+(\d{1,2})/,              // Month DD
    /(\d{1,2})\s+([A-Za-z]+)/               // DD Month
  ];
  
  const dates = [];
  lines.forEach(line => {
    datePatterns.forEach(pattern => {
      const match = line.match(pattern);
      if (match) {
        dates.push({ date: match[0], context: line.trim() });
      }
    });
  });

  // Extract times
  const timePattern = /(\d{1,2}):(\d{2})/g;
  const times = [];
  let match;
  while ((match = timePattern.exec(text)) !== null) {
    times.push({
      time: match[0],
      hour: parseInt(match[1]),
      minute: parseInt(match[2])
    });
  }

  // Detect platforms
  const platforms = [];
  const platformMap = {
    'X': ['x', 'twitter'],
    'Threads': ['threads'],
    'Instagram': ['instagram', 'ig'],
    'LinkedIn': ['linkedin'],
    'TikTok': ['tiktok'],
    'YouTube': ['youtube', 'yt'],
    'Bluesky': ['bluesky'],
    'Mastodon': ['mastodon']
  };

  Object.entries(platformMap).forEach(([name, indicators]) => {
    indicators.forEach(ind => {
      if (text.toLowerCase().includes(ind.toLowerCase())) {
        if (!platforms.includes(name)) platforms.push(name);
      }
    });
  });

  // Extract post entries (time + platform combinations)
  const posts = [];
  lines.forEach(line => {
    const timeMatch = line.match(/(\d{1,2}:\d{2})/);
    if (timeMatch) {
      const detectedPlatforms = platforms.filter(p => 
        line.toLowerCase().includes(p.toLowerCase())
      );
      
      posts.push({
        time: timeMatch[1],
        platforms: detectedPlatforms.length > 0 ? detectedPlatforms : ['unknown'],
        content: line.replace(timeMatch[0], '').trim(),
        raw: line.trim()
      });
    }
  });

  return {
    analysis: {
      detectedDates: [...new Set(dates.map(d => d.date))],
      times: times,
      platforms: platforms,
      postCount: posts.length,
      posts: posts.slice(0, 20) // Limit to first 20 posts
    }
  };
}

/**
 * Analyze analytics dashboard content
 * @param {string} text - OCR text
 * @returns {Object} Structured analytics data
 */
function analyzeAnalytics(text) {
  const lines = text.split('\n').filter(l => l.trim());
  
  // Extract metrics
  const metrics = [];
  
  // Pattern: Metric Name + Number
  const metricPatterns = [
    { name: /views/i, pattern: /views?[\s:]*([\d.,]+[KMB]?)/i },
    { name: /impressions/i, pattern: /impressions?[\s:]*([\d.,]+[KMB]?)/i },
    { name: /engagement/i, pattern: /engagement[\s:]*([\d.,]+%?)/i },
    { name: /reach/i, pattern: /reach[\s:]*([\d.,]+[KMB]?)/i },
    { name: /clicks/i, pattern: /clicks?[\s:]*([\d.,]+[KMB]?)/i },
    { name: /followers/i, pattern: /followers?[\s:]*([\d.,]+[KMB]?)/i },
    { name: /subscribers/i, pattern: /subscribers?[\s:]*([\d.,]+[KMB]?)/i },
    { name: /likes/i, pattern: /likes?[\s:]*([\d.,]+[KMB]?)/i },
    { name: /comments/i, pattern: /comments?[\s:]*([\d.,]+[KMB]?)/i },
    { name: /shares/i, pattern: /shares?[\s:]*([\d.,]+[KMB]?)/i }
  ];

  metricPatterns.forEach(({ name, pattern }) => {
    const matches = text.match(new RegExp(pattern, 'gi'));
    if (matches) {
      matches.forEach(match => {
        const valueMatch = match.match(/[\d.,]+[KMB%]?/i);
        if (valueMatch) {
          metrics.push({
            name: name.source.replace(/\\i?\//g, ''),
            value: valueMatch[0],
            raw: match
          });
        }
      });
    }
  });

  // Extract big numbers (standalone metrics)
  const bigNumberPattern = /([\d.,]+[KMB])\s*(\w+)/gi;
  let bigMatch;
  while ((bigMatch = bigNumberPattern.exec(text)) !== null) {
    metrics.push({
      name: bigMatch[2],
      value: bigMatch[1],
      raw: bigMatch[0]
    });
  }

  // Detect platform
  const platformIndicators = {
    'YouTube': ['youtube', 'yt', 'watch time'],
    'X/Twitter': ['x', 'twitter', 'tweets'],
    'Instagram': ['instagram', 'ig', 'stories', 'reels'],
    'TikTok': ['tiktok'],
    'LinkedIn': ['linkedin'],
    'Bluesky': ['bluesky']
  };

  const detectedPlatforms = [];
  Object.entries(platformIndicators).forEach(([platform, indicators]) => {
    if (indicators.some(ind => text.toLowerCase().includes(ind.toLowerCase()))) {
      detectedPlatforms.push(platform);
    }
  });

  return {
    analysis: {
      platforms: detectedPlatforms,
      metrics: metrics,
      metricCount: metrics.length,
      summary: lines.slice(0, 10) // First 10 lines as summary
    }
  };
}

/**
 * Analyze table content
 * @param {string} text - OCR text
 * @returns {Object} Structured table data
 */
function analyzeTable(text) {
  const lines = text.split('\n').filter(l => l.trim());
  
  // Try to detect table structure
  const rows = [];
  const delimiterPattern = /\||\t/;
  
  lines.forEach(line => {
    if (delimiterPattern.test(line)) {
      const cells = line.split(delimiterPattern).map(c => c.trim()).filter(c => c);
      if (cells.length > 1) {
        rows.push(cells);
      }
    }
  });

  // If no delimiter-separated rows found, try whitespace alignment
  if (rows.length === 0) {
    // Simple column detection based on spacing
    const potentialRows = lines.map(line => line.trim().split(/\s{2,}/));
    if (potentialRows.some(r => r.length > 1)) {
      rows.push(...potentialRows.filter(r => r.length > 1));
    }
  }

  return {
    analysis: {
      rowCount: rows.length,
      columnCount: rows.length > 0 ? rows[0].length : 0,
      headers: rows.length > 0 ? rows[0] : [],
      rows: rows.slice(1, 50) // Limit rows
    }
  };
}

/**
 * Generic text analysis
 * @param {string} text - OCR text
 * @returns {Object} Basic text analysis
 */
function analyzeGeneric(text) {
  const lines = text.split('\n').filter(l => l.trim());
  const words = text.split(/\s+/).filter(w => w.length > 0);
  
  // Detect language
  const germanWords = ['der', 'die', 'das', 'und', 'ist', 'von', 'mit', 'für', 'den', 'dem'];
  const germanCount = germanWords.filter(w => text.toLowerCase().includes(w)).length;
  const detectedLanguage = germanCount >= 2 ? 'de' : 'en';

  return {
    analysis: {
      lineCount: lines.length,
      wordCount: words.length,
      charCount: text.length,
      language: detectedLanguage,
      preview: text.substring(0, 500) + (text.length > 500 ? '...' : '')
    }
  };
}

module.exports = {
  detectType,
  analyze,
  analyzeCalendar,
  analyzeAnalytics,
  analyzeTable,
  analyzeGeneric
};
