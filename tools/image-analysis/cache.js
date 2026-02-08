/**
 * Cache Module
 * Caches OCR results by image hash for instant repeat analysis
 */

const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

// Cache directory
const CACHE_DIR = path.join(os.tmpdir(), 'openclaw-image-cache');
const CACHE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Initialize cache directory
 */
async function initCache() {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create cache directory:', error.message);
  }
}

/**
 * Generate hash for an image file
 * @param {string} imagePath - Path to image
 * @returns {Promise<string>} MD5 hash
 */
async function hashImage(imagePath) {
  try {
    const buffer = await fs.readFile(imagePath);
    return crypto.createHash('md5').update(buffer).digest('hex');
  } catch (error) {
    // Fallback to path + mtime hash
    const stats = await fs.stat(imagePath);
    const hashInput = `${imagePath}:${stats.mtime.getTime()}:${stats.size}`;
    return crypto.createHash('md5').update(hashInput).digest('hex');
  }
}

/**
 * Get cached result for an image
 * @param {string} imagePath - Path to image
 * @returns {Promise<Object|null>} Cached result or null
 */
async function get(imagePath) {
  await initCache();
  
  try {
    const hash = await hashImage(imagePath);
    const cachePath = path.join(CACHE_DIR, `${hash}.json`);
    
    // Check if cache file exists
    const stats = await fs.stat(cachePath).catch(() => null);
    if (!stats) return null;
    
    // Check cache age
    const age = Date.now() - stats.mtime.getTime();
    if (age > CACHE_MAX_AGE) {
      await fs.unlink(cachePath);
      return null;
    }
    
    // Read and return cached result
    const data = await fs.readFile(cachePath, 'utf-8');
    const result = JSON.parse(data);
    result.fromCache = true;
    return result;
    
  } catch (error) {
    return null;
  }
}

/**
 * Store result in cache
 * @param {string} imagePath - Path to image
 * @param {Object} result - OCR/analysis result
 * @returns {Promise<void>}
 */
async function set(imagePath, result) {
  await initCache();
  
  try {
    const hash = await hashImage(imagePath);
    const cachePath = path.join(CACHE_DIR, `${hash}.json`);
    
    const cacheData = {
      ...result,
      cachedAt: Date.now(),
      imageHash: hash
    };
    
    await fs.writeFile(cachePath, JSON.stringify(cacheData, null, 2));
  } catch (error) {
    // Silently fail - caching is optional
    if (process.env.OCR_VERBOSE) {
      console.error('Cache write error:', error.message);
    }
  }
}

/**
 * Clear all cached results
 * @returns {Promise<void>}
 */
async function clear() {
  try {
    const files = await fs.readdir(CACHE_DIR);
    for (const file of files) {
      if (file.endsWith('.json')) {
        await fs.unlink(path.join(CACHE_DIR, file));
      }
    }
    console.error('Cache cleared');
  } catch (error) {
    console.error('Failed to clear cache:', error.message);
  }
}

/**
 * Get cache statistics
 * @returns {Promise<Object>} Cache stats
 */
async function stats() {
  await initCache();
  
  try {
    const files = await fs.readdir(CACHE_DIR);
    let totalSize = 0;
    let fileCount = 0;
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const stats = await fs.stat(path.join(CACHE_DIR, file));
        totalSize += stats.size;
        fileCount++;
      }
    }
    
    return {
      fileCount,
      totalSize: `${(totalSize / 1024).toFixed(2)} KB`,
      cacheDir: CACHE_DIR
    };
  } catch (error) {
    return { fileCount: 0, totalSize: '0 KB', cacheDir: CACHE_DIR };
  }
}

module.exports = {
  get,
  set,
  clear,
  stats,
  hashImage
};
