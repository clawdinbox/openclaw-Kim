#!/usr/bin/env node

/**
 * Postiz Automated Posting System
 * Posts to X and Threads via Postiz API
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
require('dotenv').config({ path: '.env.postiz' });

const POSTIZ_API_KEY = process.env.POSTIZ_API_KEY;
const X_INTEGRATION_ID = process.env.X_INTEGRATION_ID;
const THREADS_INTEGRATION_ID = process.env.THREADS_INTEGRATION_ID;

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
      } : {
        "__type": "threads"
      }
    }]
  };

  try {
    const curlCommand = `curl -X POST "https://api.postiz.com/public/v1/posts" \
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
  } else {
    console.error('Unknown platform:', platform);
  }
}

module.exports = { postToX, postToThreads, dailyPost, testPost };

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
  }
}