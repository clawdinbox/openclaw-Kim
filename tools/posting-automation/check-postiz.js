#!/usr/bin/env node
/**
 * Check Postiz calendar for scheduled posts
 */
const https = require('https');

const POSTIZ_API_KEY = process.env.POSTIZ_API_KEY;
const BASE_URL = 'api.postiz.com';

const PLATFORM_NAMES = {
  x: process.env.X_INTEGRATION_ID,
  threads: process.env.THREADS_INTEGRATION_ID
};

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
        try {
          const parsed = JSON.parse(data);
          resolve(res.statusCode >= 200 && res.statusCode < 300 ? parsed : reject(new Error(data)));
        } catch (e) { resolve(data); }
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
    const posts = await makeRequest('GET', `/posts?startDate=${encodeURIComponent(start)}&endDate=${encodeURIComponent(end)}`);
    return Array.isArray(posts) ? posts : (posts.posts || []);
  } catch (e) {
    console.error(`Error fetching ${dateStr}:`, e.message);
    return [];
  }
}

async function main() {
  const dates = ['2026-02-13', '2026-02-14', '2026-02-15']; // Fri, Sat, Sun
  
  console.log('📅 Postiz Calendar Check (X + Threads)');
  console.log('=' .repeat(50));
  
  for (const date of dates) {
    const posts = await getPostsForDate(date);
    const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    
    console.log(`\n${dayName} (${date}):`);
    
    const xPosts = posts.filter(p => p.integration?.name?.toLowerCase().includes('x') || p.integration?.name?.toLowerCase().includes('twitter'));
    const threadsPosts = posts.filter(p => p.integration?.name?.toLowerCase().includes('threads'));
    
    if (xPosts.length > 0) {
      console.log(`  ✓ X: ${xPosts.length} post(s)`);
      xPosts.forEach(p => {
        const time = new Date(p.date).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Berlin' });
        console.log(`    - ${time}: ${p.posts?.[0]?.value?.[0]?.content?.substring(0, 60) || 'No content'}...`);
      });
    } else {
      console.log(`  ⚠️ X: NO POSTS — needs content`);
    }
    
    if (threadsPosts.length > 0) {
      console.log(`  ✓ Threads: ${threadsPosts.length} post(s)`);
      threadsPosts.forEach(p => {
        const time = new Date(p.date).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Berlin' });
        console.log(`    - ${time}: ${p.posts?.[0]?.value?.[0]?.content?.substring(0, 60) || 'No content'}...`);
      });
    } else {
      console.log(`  ⚠️ Threads: NO POSTS — needs content`);
    }
  }
}

main().catch(console.error);
