#!/usr/bin/env node
/**
 * Smart Poster — Checks Postiz before posting to avoid duplicates
 * 
 * Usage: node smart-poster.js --platform x --time 09:00 --content "..."
 *        node smart-poster.js --platform threads --time 08:30 --content "..."
 * 
 * Environment variables required:
 *   POSTIZ_API_KEY - Your Postiz API key
 *   X_INTEGRATION_ID - Integration ID for X/Twitter
 *   THREADS_INTEGRATION_ID - Integration ID for Threads
 *   INSTAGRAM_INTEGRATION_ID - Integration ID for Instagram (optional)
 */

const https = require('https');

// Configuration
const POSTIZ_API_KEY = process.env.POSTIZ_API_KEY;
const PLATFORM_IDS = {
  x: process.env.X_INTEGRATION_ID,
  threads: process.env.THREADS_INTEGRATION_ID,
  instagram: process.env.INSTAGRAM_INTEGRATION_ID
};

const BASE_URL = 'api.postiz.com';
const API_PATH = '/public/v1';

// Platform-specific settings for Postiz API
const PLATFORM_SETTINGS = {
  x: { __type: 'x', who_can_reply_post: 'everyone' },
  threads: { __type: 'threads' },
  instagram: { __type: 'instagram', post_type: 'post' }
};

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
          // Handle non-JSON responses
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(responseData);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
          }
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

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
      case '--platform':
        result.platform = nextArg;
        i++;
        break;
      case '--time':
        result.time = nextArg;
        i++;
        break;
      case '--content':
        // Content might be the rest of the arguments or next arg
        if (nextArg && !nextArg.startsWith('--')) {
          result.content = nextArg;
          i++;
        }
        break;
      case '--date':
        result.date = nextArg;
        i++;
        break;
      case '--dry-run':
        result.dryRun = true;
        break;
      case '--help':
      case '-h':
        showHelp();
        process.exit(0);
        break;
    }
  }
  
  // If content wasn't captured as nextArg, try to find it
  if (!result.content) {
    const contentIndex = args.indexOf('--content');
    if (contentIndex !== -1 && contentIndex + 1 < args.length) {
      result.content = args.slice(contentIndex + 1).join(' ').replace(/^[\"']|[\"']$/g, '');
    }
  }
  
  return result;
}

function showHelp() {
  console.log(`
Smart Poster — Checks Postiz before posting to avoid duplicates

Usage:
  node smart-poster.js --platform <x|threads|instagram> --time <HH:MM> --content "Post content" [--date YYYY-MM-DD]

Options:
  --platform    Platform to post to (x, threads, instagram)
  --time        Time in HH:MM format (24h, Berlin timezone)
  --content     Post content text
  --date        Target date (default: today)
  --dry-run     Check only, don't actually post
  --help, -h    Show this help

Environment Variables:
  POSTIZ_API_KEY           Required. Your Postiz API key
  X_INTEGRATION_ID         Required for --platform x
  THREADS_INTEGRATION_ID   Required for --platform threads
  INSTAGRAM_INTEGRATION_ID Required for --platform instagram

Examples:
  node smart-poster.js --platform x --time 09:00 --content "Hello world"
  node smart-poster.js --platform threads --time 08:30 --content "Morning thoughts" --date 2026-02-10
  node smart-poster.js --platform x --time 13:00 --content "Test post" --dry-run
`);
}

/**
 * Validate arguments and environment
 */
function validateArgs(args) {
  const errors = [];
  
  if (!POSTIZ_API_KEY) {
    errors.push('POSTIZ_API_KEY environment variable is required');
  }
  
  if (!args.platform) {
    errors.push('--platform is required (x, threads, or instagram)');
  } else if (!PLATFORM_IDS[args.platform]) {
    errors.push(`Invalid platform: ${args.platform}. Must be x, threads, or instagram`);
  } else if (!PLATFORM_IDS[args.platform]) {
    errors.push(`${args.platform.toUpperCase()}_INTEGRATION_ID environment variable is required`);
  }
  
  if (!args.time) {
    errors.push('--time is required (HH:MM format)');
  } else if (!/^\d{2}:\d{2}$/.test(args.time)) {
    errors.push('--time must be in HH:MM format (24h)');
  }
  
  if (!args.content) {
    errors.push('--content is required');
  }
  
  if (errors.length > 0) {
    console.error('❌ Validation errors:');
    errors.forEach(e => console.error(`   - ${e}`));
    process.exit(1);
  }
}

/**
 * Convert Berlin time to UTC ISO string for given date
 */
function berlinTimeToUTC(dateStr, timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  
  // Create date object from the date string
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, hours, minutes));
  
  // Berlin is UTC+1 (standard) or UTC+2 (DST)
  // We need to subtract the Berlin offset to get UTC time
  const berlinOffset = getBerlinOffset(date);
  date.setUTCMinutes(date.getUTCMinutes() - berlinOffset * 60);
  
  return date.toISOString();
}

/**
 * Get Berlin timezone offset from UTC in hours
 */
function getBerlinOffset(date) {
  // Use a more accurate method: create Berlin time string and compare
  const berlinString = date.toLocaleString('en-US', {
    timeZone: 'Europe/Berlin',
    timeZoneName: 'shortOffset'
  });
  
  // Parse offset from string like "2/8/2026, 9:00:00 AM GMT+1"
  const match = berlinString.match(/GMT([+-]\d+)/);
  if (match) {
    return parseInt(match[1]);
  }
  
  // Fallback: rough DST detection
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  
  // January, February, November, December = standard time (UTC+1)
  if (month < 2 || month > 9) return 1;
  
  // April through September = DST (UTC+2)
  if (month > 2 && month < 9) return 2;
  
  // March and October - default to standard time for simplicity
  return 1;
}

/**
 * Get today's date in YYYY-MM-DD format
 */
function getTodayDate() {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

/**
 * Check if a post already exists for the given platform and time slot
 */
async function checkExistingPost(platform, targetDate, targetTime) {
  try {
    // Calculate the target time in UTC
    const targetUTC = berlinTimeToUTC(targetDate, targetTime);
    const targetDateTime = new Date(targetUTC);
    
    // Create a window: 30 minutes before to 30 minutes after (1 hour total)
    // This catches posts scheduled at slightly different times
    const startTime = new Date(targetDateTime.getTime() - 30 * 60000).toISOString();
    const endTime = new Date(targetDateTime.getTime() + 30 * 60000).toISOString();
    
    // Query Postiz for posts in this time window
    const response = await makeRequest('GET', 
      `/posts?startDate=${encodeURIComponent(startTime)}&endDate=${encodeURIComponent(endTime)}`
    );
    
    // API returns array directly
    const posts = Array.isArray(response) ? response : (response.posts || []);
    
    if (!Array.isArray(posts) || posts.length === 0) {
      return false;
    }
    
    const integrationId = PLATFORM_IDS[platform];
    
    // Check if any post matches our platform (by integration ID)
    const existingPost = posts.find(post => {
      return post.integration && post.integration.id === integrationId;
    });
    
    return !!existingPost;
  } catch (error) {
    console.error(`⚠️  Error checking existing posts: ${error.message}`);
    // Fail open - assume no post exists if we can't check
    // This prevents blocking posts due to API errors
    return false;
  }
}

/**
 * Create a new post in Postiz
 */
async function createPost(platform, content, scheduledTime) {
  const integrationId = PLATFORM_IDS[platform];
  const settings = PLATFORM_SETTINGS[platform];
  
  const payload = {
    type: 'schedule',
    date: scheduledTime,
    shortLink: false,
    tags: [],
    posts: [{
      integration: { id: integrationId },
      value: [{
        content: content,
        image: []
      }],
      settings: settings
    }]
  };
  
  const result = await makeRequest('POST', '/posts', payload);
  return result;
}

/**
 * Main execution
 */
async function main() {
  const args = parseArgs();
  
  if (args.help) {
    showHelp();
    return;
  }
  
  validateArgs(args);
  
  const targetDate = args.date || getTodayDate();
  const targetTime = args.time;
  const platform = args.platform;
  const content = args.content;
  
  console.log(`🔍 Checking ${platform} slot at ${targetDate} ${targetTime} (Berlin)...`);
  
  // Check if slot is already occupied
  const exists = await checkExistingPost(platform, targetDate, targetTime);
  
  if (exists) {
    console.log(`✓ ${platform} at ${targetTime} already scheduled — skipping`);
    process.exit(0);
  }
  
  console.log(`✓ Slot is free — proceeding to post`);
  
  if (args.dryRun) {
    console.log(`[DRY RUN] Would post to ${platform} at ${targetTime}:`);
    console.log(`  Content: ${content.substring(0, 100)}${content.length > 100 ? '...' : ''}`);
    process.exit(0);
  }
  
  // Convert time to UTC for Postiz API
  const scheduledTime = berlinTimeToUTC(targetDate, targetTime);
  
  try {
    const result = await createPost(platform, content, scheduledTime);
    const postId = result.id || result.postId || 'unknown';
    console.log(`✓ Posted ${platform} at ${targetTime}: ${postId}`);
    console.log(`  Scheduled for: ${scheduledTime}`);
  } catch (error) {
    console.error(`❌ Failed to create post: ${error.message}`);
    process.exit(1);
  }
}

// Run main
main().catch(error => {
  console.error(`❌ Unexpected error: ${error.message}`);
  console.error(error.stack);
  process.exit(1);
});
