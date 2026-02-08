#!/usr/bin/env node
/**
 * Postiz Checker — Helper utility to query scheduled posts
 * 
 * Usage:
 *   node postiz-checker.js --today                    # List today's posts
 *   node postiz-checker.js --date 2026-02-10          # List posts for specific date
 *   node postiz-checker.js --platform x               # Filter by platform
 *   node postiz-checker.js --check 09:00 --platform x # Check specific time slot
 */

const https = require('https');

const POSTIZ_API_KEY = process.env.POSTIZ_API_KEY;
const PLATFORM_IDS = {
  x: process.env.X_INTEGRATION_ID,
  threads: process.env.THREADS_INTEGRATION_ID,
  instagram: process.env.INSTAGRAM_INTEGRATION_ID
};

const BASE_URL = 'api.postiz.com';
const API_PATH = '/public/v1';

/**
 * Make an HTTPS request to Postiz API
 */
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE_URL,
      port: 443,
      path: API_PATH + path,
      method: method,
      headers: {
        'Authorization': POSTIZ_API_KEY,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(`API Error ${res.statusCode}: ${parsed.message || responseData}`));
          }
        } catch (e) {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(responseData);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
          }
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const result = {};
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];
    
    switch (arg) {
      case '--today':
        result.today = true;
        break;
      case '--tomorrow':
        result.tomorrow = true;
        break;
      case '--date':
        result.date = nextArg;
        i++;
        break;
      case '--platform':
        result.platform = nextArg;
        i++;
        break;
      case '--check':
        result.checkTime = nextArg;
        i++;
        break;
      case '--week':
        result.week = true;
        break;
      case '--json':
        result.json = true;
        break;
      case '--help':
      case '-h':
        showHelp();
        process.exit(0);
        break;
    }
  }
  
  return result;
}

function showHelp() {
  console.log(`
Postiz Checker — Query scheduled posts

Usage:
  node postiz-checker.js --today [options]
  node postiz-checker.js --date YYYY-MM-DD [options]
  node postiz-checker.js --week [options]

Options:
  --today              Show today's scheduled posts
  --tomorrow           Show tomorrow's scheduled posts
  --date <date>        Show posts for specific date (YYYY-MM-DD)
  --week               Show posts for next 7 days
  --platform <p>       Filter by platform (x, threads, instagram)
  --check <time>       Check if a specific time slot is occupied (HH:MM)
  --json               Output as JSON instead of formatted text
  --help, -h           Show this help

Environment Variables:
  POSTIZ_API_KEY       Required. Your Postiz API key

Examples:
  node postiz-checker.js --today
  node postiz-checker.js --date 2026-02-10 --platform x
  node postiz-checker.js --week --json > posts.json
  node postiz-checker.js --today --check 09:00 --platform x
`);
}

/**
 * Get date range based on arguments
 */
function getDateRange(args) {
  const now = new Date();
  
  if (args.today) {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }
  
  if (args.tomorrow) {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const start = new Date(tomorrow);
    start.setHours(0, 0, 0, 0);
    const end = new Date(tomorrow);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }
  
  if (args.date) {
    const date = new Date(args.date);
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }
  
  if (args.week) {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setDate(end.getDate() + 7);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }
  
  // Default: today
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

/**
 * Format date for display (Berlin timezone)
 */
function formatDateTime(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString('de-DE', {
    timeZone: 'Europe/Berlin',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Get platform name from integration object
 */
function getPlatformName(integration) {
  if (!integration) return 'unknown';
  
  // Map providerIdentifier to our platform names
  const provider = integration.providerIdentifier;
  if (provider === 'x' || provider === 'twitter') return 'x';
  if (provider === 'threads') return 'threads';
  if (provider === 'instagram') return 'instagram';
  
  return provider || 'unknown';
}

/**
 * Filter posts by platform
 */
function filterByPlatform(posts, platform) {
  if (!platform) return posts;
  
  const integrationId = PLATFORM_IDS[platform];
  if (!integrationId) return posts;
  
  return posts.filter(post => {
    return post.integration && post.integration.id === integrationId;
  });
}

/**
 * Check if a specific time slot is occupied
 */
function checkTimeSlot(posts, checkTime, platform) {
  const [checkHour, checkMinute] = checkTime.split(':').map(Number);
  
  const integrationId = platform ? PLATFORM_IDS[platform] : null;
  
  return posts.find(post => {
    const postDate = new Date(post.publishDate);
    const berlinHour = parseInt(postDate.toLocaleString('en-GB', {
      timeZone: 'Europe/Berlin',
      hour: '2-digit',
      hour12: false
    }));
    const berlinMinute = parseInt(postDate.toLocaleString('en-GB', {
      timeZone: 'Europe/Berlin',
      minute: '2-digit'
    }));
    
    const timeMatches = berlinHour === checkHour && berlinMinute === checkMinute;
    
    if (!timeMatches) return false;
    
    if (integrationId) {
      return post.integration && post.integration.id === integrationId;
    }
    
    return true;
  });
}

/**
 * Main execution
 */
async function main() {
  const args = parseArgs();
  
  if (!POSTIZ_API_KEY) {
    console.error('❌ POSTIZ_API_KEY environment variable is required');
    process.exit(1);
  }
  
  const { start, end } = getDateRange(args);
  
  try {
    const response = await makeRequest('GET', 
      `/posts?startDate=${encodeURIComponent(start.toISOString())}&endDate=${encodeURIComponent(end.toISOString())}`
    );
    
    // API returns array directly
    const allPosts = Array.isArray(response) ? response : (response.posts || []);
    const posts = filterByPlatform(allPosts, args.platform);
    
    // Check specific time slot
    if (args.checkTime) {
      const slotPost = checkTimeSlot(posts, args.checkTime, args.platform);
      
      if (slotPost) {
        console.log(`❌ SLOT OCCUPIED: ${args.checkTime} ${args.platform || ''}`);
        if (!args.json) {
          console.log(`   Post ID: ${slotPost.id}`);
          console.log(`   Content: ${slotPost.content?.substring(0, 80)}...`);
        }
        process.exit(1);
      } else {
        console.log(`✅ SLOT FREE: ${args.checkTime} ${args.platform || ''}`);
        process.exit(0);
      }
    }
    
    // Output as JSON
    if (args.json) {
      console.log(JSON.stringify(posts, null, 2));
      return;
    }
    
    // Formatted output
    if (posts.length === 0) {
      console.log('📭 No scheduled posts found for the specified period.');
      return;
    }
    
    // Sort by date
    posts.sort((a, b) => new Date(a.publishDate) - new Date(b.publishDate));
    
    console.log(`📅 Found ${posts.length} scheduled post(s)\n`);
    
    posts.forEach((post, index) => {
      const date = formatDateTime(post.publishDate);
      const platform = getPlatformName(post.integration);
      const content = post.content || '(no content)';
      const preview = content.length > 60 ? content.substring(0, 60) + '...' : content;
      
      console.log(`${index + 1}. [${platform.toUpperCase()}] ${date}`);
      console.log(`   ${preview}`);
      console.log('');
    });
    
  } catch (error) {
    console.error(`❌ Error fetching posts: ${error.message}`);
    process.exit(1);
  }
}

main().catch(error => {
  console.error(`❌ Unexpected error: ${error.message}`);
  process.exit(1);
});
