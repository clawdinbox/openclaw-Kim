/**
 * Postiz Rate Limit Fix
 * 
 * Postiz API is experiencing rate limiting with "ThrottlerException: Too Many Requests"
 * This script implements exponential backoff and queue management
 */

const { execSync } = require('child_process');
const path = require('path');

// Load config manually
const envContent = require('fs').readFileSync(
  path.join('/Users/clawdmm/.openclaw/workspace', '.env.postiz'), 
  'utf8'
);
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim();
  }
});

const POSTIZ_API_KEY = env.POSTIZ_API_KEY;
const X_INTEGRATION_ID = env.X_INTEGRATION_ID;
const THREADS_INTEGRATION_ID = env.THREADS_INTEGRATION_ID;
const INSTAGRAM_INTEGRATION_ID = env.INSTAGRAM_INTEGRATION_ID;

// Rate limit configuration
const CONFIG = {
  initialDelay: 5000,      // 5 seconds initial
  maxDelay: 60000,         // 1 minute max
  maxRetries: 5,           // 5 retries per post
  postsPerBatch: 3,        // Only 3 posts at a time
  batchDelay: 30000        // 30 seconds between batches
};

/**
 * Sleep function
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Post with exponential backoff
 */
async function postWithBackoff(content, integrationId, platform, attempt = 1) {
  const postData = {
    type: "now",
    date: new Date().toISOString(),
    shortLink: false,
    tags: [],
    posts: [{
      integration: { id: integrationId },
      value: [{ content, image: [] }],
      settings: platform === 'x' ? {
        "__type": "x",
        "who_can_reply_post": "everyone"
      } : platform === 'threads' ? {
        "__type": "threads"
      } : {
        "__type": "instagram"
      }
    }]
  };

  try {
    const jsonData = JSON.stringify(postData);
    const curlCommand = `curl -X POST "https://api.postiz.com/posts" \
      -H "Authorization: ${POSTIZ_API_KEY}" \
      -H "Content-Type: application/json" \
      -d '${jsonData.replace(/'/g, "'\\''")}' \
      --silent \
      -w "HTTP:%{http_code}"`;
    
    const result = execSync(curlCommand, { encoding: 'utf8', timeout: 30000 });
    const httpCode = result.match(/HTTP:(\d+)/)?.[1];
    
    if (httpCode === '429' || result.includes('ThrottlerException')) {
      if (attempt >= CONFIG.maxRetries) {
        return { success: false, error: 'Max retries exceeded', rateLimited: true };
      }
      
      const delay = Math.min(CONFIG.initialDelay * Math.pow(2, attempt - 1), CONFIG.maxDelay);
      console.log(`⚠️  Rate limited (${httpCode}). Waiting ${delay}ms before retry ${attempt + 1}/${CONFIG.maxRetries}...`);
      await sleep(delay);
      return postWithBackoff(content, integrationId, platform, attempt + 1);
    }
    
    if (httpCode && httpCode.startsWith('2')) {
      return { success: true, response: result };
    }
    
    return { success: false, error: `HTTP ${httpCode}`, response: result };
    
  } catch (error) {
    const errorMsg = error.message || '';
    
    if (errorMsg.includes('ThrottlerException') || errorMsg.includes('429')) {
      if (attempt >= CONFIG.maxRetries) {
        return { success: false, error: 'Max retries exceeded', rateLimited: true };
      }
      
      const delay = Math.min(CONFIG.initialDelay * Math.pow(2, attempt - 1), CONFIG.maxDelay);
      console.log(`⚠️  Rate limited. Waiting ${delay}ms before retry ${attempt + 1}/${CONFIG.maxRetries}...`);
      await sleep(delay);
      return postWithBackoff(content, integrationId, platform, attempt + 1);
    }
    
    return { success: false, error: errorMsg };
  }
}

/**
 * Queue manager for rate-limited posting
 */
class PostQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.stats = { successful: 0, failed: 0, total: 0 };
  }

  add(content, platform, scheduledTime = null) {
    let integrationId;
    switch (platform) {
      case 'x': integrationId = X_INTEGRATION_ID; break;
      case 'threads': integrationId = THREADS_INTEGRATION_ID; break;
      case 'instagram': integrationId = INSTAGRAM_INTEGRATION_ID; break;
      default: throw new Error(`Unknown platform: ${platform}`);
    }

    this.queue.push({ content, integrationId, platform, scheduledTime });
    this.stats.total++;
    console.log(`➕ Added to queue (${this.queue.length} pending)`);
  }

  async processBatch() {
    if (this.processing) return;
    this.processing = true;

    const batchSize = Math.min(CONFIG.postsPerBatch, this.queue.length);
    console.log(`\n🔄 Processing batch of ${batchSize} posts...`);
    
    const batch = this.queue.splice(0, batchSize);
    
    for (const item of batch) {
      console.log(`\n📤 Posting to ${item.platform}: "${item.content.substring(0, 50)}..."`);
      
      const result = await postWithBackoff(
        item.content,
        item.integrationId,
        item.platform
      );
      
      if (result.success) {
        this.stats.successful++;
        console.log(`✅ Posted to ${item.platform}`);
      } else {
        this.stats.failed++;
        console.log(`❌ Failed to post to ${item.platform}: ${result.error}`);
        // Re-queue for later
        this.queue.push(item);
      }
      
      // Small delay between posts in batch
      await sleep(2000);
    }
    
    this.processing = false;
    
    // If more in queue, wait then continue
    if (this.queue.length > 0) {
      console.log(`\n⏳ ${this.queue.length} posts remaining, waiting ${CONFIG.batchDelay}ms before next batch...`);
      await sleep(CONFIG.batchDelay);
      return this.processBatch();
    }
    
    return this.stats;
  }

  getStats() {
    return {
      ...this.stats,
      pending: this.queue.length,
      complete: this.stats.successful + this.stats.failed
    };
  }
}

/**
 * Fixed version of post schedule function
 */
async function postToPostiz(content, platform) {
  let integrationId;
  switch (platform) {
    case 'x': integrationId = X_INTEGRATION_ID; break;
    case 'threads': integrationId = THREADS_INTEGRATION_ID; break;
    case 'instagram': integrationId = INSTAGRAM_INTEGRATION_ID; break;
    default: throw new Error(`Unknown platform: ${platform}`);
  }

  return postWithBackoff(content, integrationId, platform);
}

// Export for use
module.exports = {
  postWithBackoff,
  PostQueue,
  postToPostiz,
  CONFIG
};

// CLI test
if (require.main === module) {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║     Postiz Rate Limit Fix — Testing                      ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('Configuration:', CONFIG);
  console.log('');
  
  // Test with queue
  const queue = new PostQueue();
  
  // Add test posts
  queue.add("Test post with rate limit handling 🦞 — Test 1/3", 'threads');
  
  queue.processBatch().then(stats => {
    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║     Test Complete                                        ║');
    console.log('╚══════════════════════════════════════════════════════════╝');
    console.log('Stats:', stats);
    process.exit(0);
  }).catch(err => {
    console.error('\n❌ Error:', err);
    process.exit(1);
  });
}
