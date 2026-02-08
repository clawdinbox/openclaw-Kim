#!/usr/bin/env node
/**
 * Test Suite for OCR & Image Analysis Tool
 * Tests all modules and validates functionality
 */

const fs = require('fs');
const path = require('path');

// Import modules
const ocr = require('./ocr');
const analyzer = require('./analyze-screenshot');
const cache = require('./cache');
const visionFallback = require('./vision-fallback');

const TESTS = [];

function test(name, fn) {
  TESTS.push({ name, fn });
}

async function runTests() {
  console.log('🧪 Running OCR & Image Analysis Tests\n');
  
  let passed = 0;
  let failed = 0;
  
  for (const { name, fn } of TESTS) {
    try {
      await fn();
      console.log(`✅ ${name}`);
      passed++;
    } catch (error) {
      console.log(`❌ ${name}`);
      console.log(`   Error: ${error.message}`);
      failed++;
    }
  }
  
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

// ===== TESTS =====

test('Module imports work', () => {
  if (!ocr.extractText) throw new Error('ocr.extractText not found');
  if (!analyzer.analyze) throw new Error('analyzer.analyze not found');
  if (!cache.get) throw new Error('cache.get not found');
  if (!visionFallback.analyze) throw new Error('visionFallback.analyze not found');
});

test('Cache hash generation works', async () => {
  const testFile = path.join(__dirname, 'test-temp.txt');
  fs.writeFileSync(testFile, 'test content');
  
  const hash1 = await cache.hashImage(testFile);
  const hash2 = await cache.hashImage(testFile);
  
  fs.unlinkSync(testFile);
  
  if (hash1 !== hash2) throw new Error('Hash mismatch for same file');
  if (hash1.length !== 32) throw new Error('Hash should be 32 chars (MD5)');
});

test('Cache set and get works', async () => {
  const testFile = path.join(__dirname, 'test-temp-cache.txt');
  fs.writeFileSync(testFile, `cache test ${Date.now()}`);
  
  const testData = { text: 'Hello', confidence: 95 };
  await cache.set(testFile, testData);
  
  const retrieved = await cache.get(testFile);
  fs.unlinkSync(testFile);
  
  if (!retrieved) throw new Error('Cache miss');
  if (retrieved.text !== testData.text) throw new Error('Cache data mismatch');
  if (retrieved.fromCache !== true) throw new Error('fromCache flag not set');
});

test('Analyzer detects calendar type', () => {
  const postizText = `
    Postiz Calendar
    Monday, Feb 8
    12:30 X - New blog post
    15:00 Threads - Discussion thread
    18:00 Instagram - Photo post
  `;
  
  const type = analyzer.detectType(postizText);
  if (type !== 'calendar') throw new Error(`Expected calendar, got ${type}`);
});

test('Analyzer detects analytics type', () => {
  const analyticsText = `
    YouTube Analytics
    Views: 1.2M
    Engagement: 4.5%
    Watch time: 10K hours
    Subscribers: +500
  `;
  
  const type = analyzer.detectType(analyticsText);
  if (type !== 'analytics') throw new Error(`Expected analytics, got ${type}`);
});

test('Calendar analysis extracts posts', () => {
  const calendarText = `
    Weekly Schedule
    Monday
    09:00 X Good morning post
    12:30 Threads Technical discussion
    15:00 Instagram Product photo
    Tuesday
    10:00 LinkedIn Professional update
  `;
  
  const result = analyzer.analyzeCalendar(calendarText);
  
  if (!result.analysis.posts || result.analysis.posts.length === 0) {
    throw new Error('No posts extracted');
  }
  
  const hasX = result.analysis.platforms.includes('X');
  if (!hasX) throw new Error('X platform not detected');
});

test('Analytics analysis extracts metrics', () => {
  const analyticsText = `
    Dashboard
    Total Views: 50K
    Engagement Rate: 3.2%
    Click-through: 1.5%
    Followers: 12.5K
  `;
  
  const result = analyzer.analyzeAnalytics(analyticsText);
  
  if (!result.analysis.metrics || result.analysis.metrics.length === 0) {
    throw new Error('No metrics extracted');
  }
  
  const hasViews = result.analysis.metrics.some(m => m.name.toLowerCase().includes('views'));
  if (!hasViews) throw new Error('Views metric not detected');
});

test('German language detection', () => {
  const germanText = `
    Der schnelle braune Fuchs springt über den faulen Hund.
    Dies ist ein Test mit deutschem Text.
  `;
  
  const result = analyzer.analyzeGeneric(germanText);
  
  if (result.analysis.language !== 'de') {
    throw new Error(`Expected German (de), got ${result.analysis.language}`);
  }
});

test('English language detection', () => {
  const englishText = `
    The quick brown fox jumps over the lazy dog.
    This is a test with English text.
  `;
  
  const result = analyzer.analyzeGeneric(englishText);
  
  if (result.analysis.language !== 'en') {
    throw new Error(`Expected English (en), got ${result.analysis.language}`);
  }
});

test('Vision fallback threshold check', () => {
  // High confidence - no fallback needed
  const high = visionFallback.shouldUseFallback(85, 'Clean text');
  if (high !== false) throw new Error('Should not use fallback for 85% confidence');
  
  // Low confidence - fallback needed
  const low = visionFallback.shouldUseFallback(50, 'Some text');
  if (low !== true) throw new Error('Should use fallback for 50% confidence');
  
  // Empty text - fallback needed
  const empty = visionFallback.shouldUseFallback(90, '');
  if (empty !== true) throw new Error('Should use fallback for empty text');
});

test('Cache stats works', async () => {
  const stats = await cache.stats();
  
  if (typeof stats.fileCount !== 'number') {
    throw new Error('fileCount should be a number');
  }
  
  if (!stats.cacheDir) {
    throw new Error('cacheDir should be defined');
  }
});

// Run all tests
runTests();
