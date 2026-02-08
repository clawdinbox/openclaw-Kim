#!/usr/bin/env node

/**
 * Postiz Automated Posting System
 * Posts to X and Threads via Postiz API
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Try multiple ways to load env vars
const envPaths = [
  '.env.postiz',
  path.join(__dirname, '..', '.env.postiz'),
  path.join(process.cwd(), '.env.postiz'),
  path.join('/Users/clawdmm/.openclaw/workspace', '.env.postiz')
];

let envLoaded = false;
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
    envLoaded = true;
    break;
  }
}

// Fallback: read and parse manually if dotenv fails
if (!process.env.POSTIZ_API_KEY) {
  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      envContent.split('\n').forEach(line => {
        const match = line.match(/^([^#=]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          const value = match[2].trim();
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      });
      break;
    }
  }
}

const POSTIZ_API_KEY = process.env.POSTIZ_API_KEY;
const X_INTEGRATION_ID = process.env.X_INTEGRATION_ID;
const THREADS_INTEGRATION_ID = process.env.THREADS_INTEGRATION_ID;
const INSTAGRAM_INTEGRATION_ID = process.env.INSTAGRAM_INTEGRATION_ID;

async function postToPostiz(content, integrationId, platform) {
  const postData = {
    type: "now", // Post immediately
    date: new Date().toISOString(),
    shortLink: false,
    tags: [],
    posts: [{
      integration: {
        id: integrationId
      },
      value: [{
        content: content,
        image: []
      }],
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
    const curlCommand = `curl -X POST "https://api.postiz.com/posts" \
      -H "Authorization: ${POSTIZ_API_KEY}" \
      -H "Content-Type: application/json" \
      -d '${JSON.stringify(postData).replace(/'/g, "'\\''")}' \
      --silent`;
    
    const result = execSync(curlCommand, { encoding: 'utf8' });
    const response = JSON.parse(result);
    
    console.log(`✅ Posted to ${platform}:`, content);
    console.log(`📝 Response:`, response);
    return response;
  } catch (error) {
    console.error(`❌ Failed to post to ${platform}:`, error.message);
    return null;
  }
}

async function postToX(content) {
  return postToPostiz(content, X_INTEGRATION_ID, 'x');
}

async function postToThreads(content) {
  return postToPostiz(content, THREADS_INTEGRATION_ID, 'threads');
}

async function postToInstagram(content) {
  return postToPostiz(content, INSTAGRAM_INTEGRATION_ID, 'instagram');
}

// Test function
async function testPost() {
  const testContent = "Test post from Kim 🦞 - Social automation system is live!";
  
  console.log('Testing Postiz integration...');
  await postToX(testContent);
  await postToThreads(testContent);
}

// Main posting function
async function dailyPost(platform, content) {
  if (platform === 'x') {
    return await postToX(content);
  } else if (platform === 'threads') {
    return await postToThreads(content);
  } else if (platform === 'instagram') {
    return await postToInstagram(content);
  } else {
    console.error('Unknown platform:', platform);
  }
}

module.exports = { postToX, postToThreads, postToInstagram, dailyPost, testPost };

// CLI usage
if (require.main === module) {
  const [,, command, platform, ...contentParts] = process.argv;
  
  if (command === 'test') {
    testPost();
  } else if (command === 'post' && platform && contentParts.length > 0) {
    const content = contentParts.join(' ');
    dailyPost(platform, content);
  } else {
    console.log('Usage:');
    console.log('  node postiz-poster.js test');
    console.log('  node postiz-poster.js post x "Your tweet content"');
    console.log('  node postiz-poster.js post threads "Your threads content"');
    console.log('  node postiz-poster.js post instagram "Your Instagram post content"');
  }
}