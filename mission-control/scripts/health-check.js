#!/usr/bin/env node
/**
 * Health Check Script for Mission Control
 * 
 * Checks if Convex and Next.js services are running and healthy.
 * Returns exit codes for scripting:
 *   0 = All services healthy
 *   1 = Convex not responding
 *   2 = Next.js not responding
 *   3 = Both services down
 * 
 * Usage:
 *   node scripts/health-check.js
 *   node scripts/health-check.js --json
 *   node scripts/health-check.js --convex-only
 *   node scripts/health-check.js --nextjs-only
 */

const http = require('http');

// Configuration
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || 'http://127.0.0.1:3210';
const NEXTJS_URL = process.env.NEXTJS_URL || 'http://localhost:3000';

const CONVEX_HEALTH_PATH = '/api/health';
const TIMEOUT_MS = 5000;

// Parse arguments
const args = process.argv.slice(2);
const jsonOutput = args.includes('--json');
const convexOnly = args.includes('--convex-only');
const nextjsOnly = args.includes('--nextjs-only');

// Helper to make HTTP request
function checkUrl(url, path = '/') {
  return new Promise((resolve) => {
    const fullUrl = new URL(path, url);
    
    const req = http.get(fullUrl.toString(), { timeout: TIMEOUT_MS }, (res) => {
      const healthy = res.statusCode >= 200 && res.statusCode < 500;
      resolve({
        url: fullUrl.toString(),
        statusCode: res.statusCode,
        healthy,
        error: null
      });
    });
    
    req.on('error', (error) => {
      resolve({
        url: fullUrl.toString(),
        statusCode: null,
        healthy: false,
        error: error.message
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({
        url: fullUrl.toString(),
        statusCode: null,
        healthy: false,
        error: 'Request timeout'
      });
    });
  });
}

// Format timestamp
function timestamp() {
  return new Date().toISOString();
}

// Main health check
async function runHealthCheck() {
  const results = {
    timestamp: timestamp(),
    convex: null,
    nextjs: null,
    overall: false
  };
  
  // Check Convex
  if (!nextjsOnly) {
    results.convex = await checkUrl(CONVEX_URL, CONVEX_HEALTH_PATH);
    // If health endpoint doesn't exist, try the main API endpoint
    if (!results.convex.healthy && results.convex.statusCode === 404) {
      results.convex = await checkUrl(CONVEX_URL, '/');
    }
  }
  
  // Check Next.js
  if (!convexOnly) {
    results.nextjs = await checkUrl(NEXTJS_URL, '/');
  }
  
  // Determine overall health
  if (convexOnly) {
    results.overall = results.convex?.healthy || false;
  } else if (nextjsOnly) {
    results.overall = results.nextjs?.healthy || false;
  } else {
    results.overall = (results.convex?.healthy && results.nextjs?.healthy) || false;
  }
  
  return results;
}

// Output results
function outputResults(results) {
  if (jsonOutput) {
    console.log(JSON.stringify(results, null, 2));
  } else {
    const status = (healthy) => healthy ? '✅ UP' : '❌ DOWN';
    
    console.log('\n🩺 Mission Control Health Check');
    console.log('═══════════════════════════════════════');
    console.log(`📅 ${results.timestamp}`);
    console.log('');
    
    if (results.convex) {
      console.log(`Convex API:     ${status(results.convex.healthy)}`);
      console.log(`  URL:          ${CONVEX_URL}`);
      if (results.convex.statusCode) {
        console.log(`  Status:       HTTP ${results.convex.statusCode}`);
      }
      if (results.convex.error) {
        console.log(`  Error:        ${results.convex.error}`);
      }
      console.log('');
    }
    
    if (results.nextjs) {
      console.log(`Next.js App:    ${status(results.nextjs.healthy)}`);
      console.log(`  URL:          ${NEXTJS_URL}`);
      if (results.nextjs.statusCode) {
        console.log(`  Status:       HTTP ${results.nextjs.statusCode}`);
      }
      if (results.nextjs.error) {
        console.log(`  Error:        ${results.nextjs.error}`);
      }
      console.log('');
    }
    
    console.log('═══════════════════════════════════════');
    console.log(`Overall:        ${status(results.overall)}`);
    console.log('');
  }
}

// Get exit code
function getExitCode(results) {
  if (convexOnly) {
    return results.convex?.healthy ? 0 : 1;
  }
  if (nextjsOnly) {
    return results.nextjs?.healthy ? 0 : 2;
  }
  
  const convexUp = results.convex?.healthy;
  const nextjsUp = results.nextjs?.healthy;
  
  if (convexUp && nextjsUp) return 0;
  if (!convexUp && nextjsUp) return 1;
  if (convexUp && !nextjsUp) return 2;
  return 3;
}

// Run the check
runHealthCheck()
  .then(results => {
    outputResults(results);
    process.exit(getExitCode(results));
  })
  .catch(error => {
    console.error('Health check failed:', error.message);
    process.exit(1);
  });
