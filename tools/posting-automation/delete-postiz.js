#!/usr/bin/env node
/**
 * Delete Postiz posts by date
 */
const https = require('https');

const POSTIZ_API_KEY = process.env.POSTIZ_API_KEY;
const BASE_URL = 'api.postiz.com';

function makeRequest(method, path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE_URL,
      port: 443,
      path: '/public/v1' + path,
      method: method,
      headers: {
        'Authorization': POSTIZ_API_KEY,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, status: res.statusCode });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function getPostsForDate(dateStr) {
  const start = new Date(dateStr + 'T00:00:00+01:00').toISOString();
  const end = new Date(dateStr + 'T23:59:59+01:00').toISOString();
  
  try {
    const response = await new Promise((resolve, reject) => {
      const options = {
        hostname: BASE_URL,
        port: 443,
        path: '/public/v1/posts?startDate=' + encodeURIComponent(start) + '&endDate=' + encodeURIComponent(end),
        method: 'GET',
        headers: { 'Authorization': POSTIZ_API_KEY, 'Content-Type': 'application/json' }
      };
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try { resolve(JSON.parse(data)); } catch (e) { resolve([]); }
        });
      });
      req.on('error', reject);
      req.end();
    });
    return Array.isArray(response) ? response : (response.posts || []);
  } catch (e) {
    return [];
  }
}

async function main() {
  const dates = ['2026-02-13', '2026-02-14', '2026-02-15'];
  
  console.log('🗑️  Deleting weekend posts from Postiz...\n');
  
  for (const date of dates) {
    const posts = await getPostsForDate(date);
    console.log(`${date}: Found ${posts.length} post(s)`);
    
    for (const post of posts) {
      try {
        await makeRequest('DELETE', `/posts/${post.id}`);
        console.log(`  ✓ Deleted: ${post.integration?.name} at ${new Date(post.date).toLocaleTimeString('de-DE', {hour:'2-digit', minute:'2-digit', timeZone:'Europe/Berlin'})}`);
      } catch (e) {
        console.log(`  ✗ Failed: ${e.message}`);
      }
    }
  }
  
  console.log('\n✓ Cleanup complete');
}

main().catch(console.error);
