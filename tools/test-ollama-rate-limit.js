#!/usr/bin/env node
/**
 * Test Kimi 2.5 Cloud Rate Limits via Ollama
 */

const https = require('https');

const OLLAMA_HOST = 'ollama.com'; // or cloud endpoint
const MODEL = 'kimi-k2.5:cloud';

function makeRequest(prompt, index) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const data = JSON.stringify({
      model: MODEL,
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.7,
        num_predict: 100
      }
    });

    const options = {
      hostname: OLLAMA_HOST,
      port: 443,
      path: '/api/generate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      },
      timeout: 30000
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        const duration = Date.now() - startTime;
        
        if (res.statusCode === 429) {
          resolve({
            index,
            status: 'RATE_LIMITED',
            duration,
            error: '429 Too Many Requests'
          });
        } else if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const parsed = JSON.parse(responseData);
            resolve({
              index,
              status: 'SUCCESS',
              duration,
              tokens: parsed.eval_count || 'unknown',
              response: parsed.response?.substring(0, 100) + '...'
            });
          } catch (e) {
            resolve({
              index,
              status: 'PARSE_ERROR',
              duration,
              error: e.message
            });
          }
        } else {
          resolve({
            index,
            status: 'ERROR',
            duration,
            error: `HTTP ${res.statusCode}: ${responseData.substring(0, 200)}`
          });
        }
      });
    });

    req.on('error', (error) => {
      resolve({
        index,
        status: 'NETWORK_ERROR',
        error: error.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        index,
        status: 'TIMEOUT',
        error: 'Request timeout after 30s'
      });
    });

    req.write(data);
    req.end();
  });
}

async function runTest() {
  console.log('🧪 Testing Kimi 2.5 Cloud Rate Limits\n');
  console.log(`Model: ${MODEL}`);
  console.log(`Time: ${new Date().toISOString()}\n`);
  
  // Test 1: Sequential requests (should always work)
  console.log('--- Test 1: 3 Sequential Requests ---');
  for (let i = 0; i < 3; i++) {
    const result = await makeRequest(`Write a one-sentence summary of sportswear trends. Request ${i + 1}`, i);
    console.log(`Request ${i + 1}: ${result.status} (${result.duration}ms)`);
    if (result.error) console.log(`  Error: ${result.error}`);
    await new Promise(r => setTimeout(r, 1000)); // 1s pause
  }
  
  console.log('\n--- Test 2: 5 Rapid-Fire Requests (rate limit test) ---');
  // Test 2: Parallel requests (might hit rate limit)
  const promises = [];
  for (let i = 0; i < 5; i++) {
    promises.push(makeRequest(`Quick analysis: What's happening with Nike in 2026? Request ${i + 1}`, i));
  }
  
  const results = await Promise.all(promises);
  
  let successCount = 0;
  let rateLimitCount = 0;
  let errorCount = 0;
  
  results.forEach(r => {
    if (r.status === 'SUCCESS') successCount++;
    else if (r.status === 'RATE_LIMITED') rateLimitCount++;
    else errorCount++;
    
    console.log(`Request ${r.index + 1}: ${r.status} (${r.duration}ms)`);
    if (r.error) console.log(`  Error: ${r.error}`);
    if (r.tokens) console.log(`  Tokens: ${r.tokens}`);
  });
  
  console.log('\n--- Summary ---');
  console.log(`Success: ${successCount}/5`);
  console.log(`Rate Limited: ${rateLimitCount}/5`);
  console.log(`Errors: ${errorCount}/5`);
  console.log(`\nEstimated RPM capacity: ${rateLimitCount > 0 ? '~60' : '>60'}`);
}

runTest().catch(console.error);
