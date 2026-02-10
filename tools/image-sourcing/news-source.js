#!/usr/bin/env node
/**
 * News Image Source Module
 * 
 * Extracts images from fashion news sources for content-relevant imagery.
 * Sources: NewsAPI.org, FashionNetwork RSS, WWD, BoF
 * 
 * Usage:
 *   import { searchNewsImages } from './news-source.js';
 *   const images = await searchNewsImages('AI fashion retail', 5);
 */

import https from 'https';
import { parseStringPromise } from 'xml2js';

const CONFIG = {
  // API Keys
  newsApiKey: process.env.NEWSAPI_KEY || '',
  
  // RSS Feed URLs
  rssFeeds: {
    fashionNetwork: 'https://us.fashionnetwork.com/news/rss',
    wwd: 'https://wwd.com/feed/', // May require subscription
    bof: 'https://www.businessoffashion.com/feed/',
    vogueBusiness: 'https://www.voguebusiness.com/feed/',
    retailDive: 'https://www.retaildive.com/feeds/news/',
  },
  
  // Search configuration
  defaultCount: 5,
  timeout: 10000,
};

/**
 * Search NewsAPI.org for images
 * Free tier: 100 requests/day
 * https://newsapi.org/docs/get-started
 */
export async function searchNewsAPI(query, count = 5) {
  if (!CONFIG.newsApiKey) {
    console.log('⚠️  NewsAPI key not configured');
    return [];
  }
  
  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}` +
    `&pageSize=${count}` +
    `&sortBy=relevancy` +
    `&language=en` +
    `&apiKey=${CONFIG.newsApiKey}`;
  
  return new Promise((resolve) => {
    const req = https.get(url, { timeout: CONFIG.timeout }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.status !== 'ok') {
            console.log(`⚠️  NewsAPI error: ${result.message}`);
            resolve([]);
            return;
          }
          
          const images = result.articles
            .filter(article => article.urlToImage)
            .map(article => ({
              id: `newsapi-${Buffer.from(article.url).toString('base64').slice(0, 12)}`,
              url: article.urlToImage,
              source: 'newsapi',
              publisher: article.source?.name || 'Unknown',
              title: article.title,
              description: article.description,
              articleUrl: article.url,
              publishedAt: article.publishedAt,
            }));
          
          resolve(images);
        } catch (e) {
          console.error(`NewsAPI parse error: ${e.message}`);
          resolve([]);
        }
      });
    });
    
    req.on('error', (err) => {
      console.error(`NewsAPI request failed: ${err.message}`);
      resolve([]);
    });
    
    req.on('timeout', () => {
      req.destroy();
      console.error('NewsAPI request timeout');
      resolve([]);
    });
  });
}

/**
 * Fetch and parse RSS feed
 */
async function fetchRSS(feedUrl) {
  return new Promise((resolve) => {
    const req = https.get(feedUrl, { timeout: CONFIG.timeout }, (res) => {
      // Handle redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        fetchRSS(res.headers.location).then(resolve);
        return;
      }
      
      if (res.statusCode !== 200) {
        console.log(`RSS feed error: ${feedUrl} returned ${res.statusCode}`);
        resolve([]);
        return;
      }
      
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', async () => {
        try {
          const parsed = await parseStringPromise(data, { mergeAttrs: true });
          resolve(parsed);
        } catch (e) {
          console.error(`RSS parse error for ${feedUrl}: ${e.message}`);
          resolve([]);
        }
      });
    });
    
    req.on('error', (err) => {
      console.error(`RSS fetch error for ${feedUrl}: ${err.message}`);
      resolve([]);
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve([]);
    });
  });
}

/**
 * Extract images from RSS feed items
 */
function extractImagesFromRSS(rssData, sourceName) {
  const items = rssData?.rss?.channel?.[0]?.item || 
                rssData?.feed?.entry || 
                [];
  
  const images = [];
  
  for (const item of items.slice(0, 10)) {
    // Try various image locations in RSS
    let imageUrl = null;
    
    // Media content
    if (item['media:content']?.[0]?.$?.url) {
      imageUrl = item['media:content'][0].$.url;
    }
    // Enclosure
    else if (item.enclosure?.[0]?.$?.url) {
      imageUrl = item.enclosure[0].$.url;
    }
    // Image in description (HTML)
    else if (item.description?.[0]) {
      const imgMatch = item.description[0].match(/<img[^>]+src=["']([^"']+)["']/i);
      if (imgMatch) imageUrl = imgMatch[1];
    }
    // Content encoded
    else if (item['content:encoded']?.[0]) {
      const imgMatch = item['content:encoded'][0].match(/<img[^>]+src=["']([^"']+)["']/i);
      if (imgMatch) imageUrl = imgMatch[1];
    }
    
    if (imageUrl) {
      images.push({
        id: `rss-${sourceName}-${Buffer.from(item.link?.[0] || item.id?.[0] || '').toString('base64').slice(0, 8)}`,
        url: imageUrl,
        source: sourceName,
        publisher: sourceName,
        title: item.title?.[0] || 'Untitled',
        description: item.description?.[0]?.replace(/<[^>]+>/g, '').slice(0, 200),
        articleUrl: item.link?.[0] || item.id?.[0],
        publishedAt: item.pubDate?.[0] || item.published?.[0],
      });
    }
  }
  
  return images;
}

/**
 * Search FashionNetwork RSS
 */
export async function searchFashionNetwork(count = 5) {
  const rss = await fetchRSS(CONFIG.rssFeeds.fashionNetwork);
  const images = extractImagesFromRSS(rss, 'fashionnetwork');
  return images.slice(0, count);
}

/**
 * Search Business of Fashion RSS
 */
export async function searchBoF(count = 5) {
  const rss = await fetchRSS(CONFIG.rssFeeds.bof);
  const images = extractImagesFromRSS(rss, 'bof');
  return images.slice(0, count);
}

/**
 * Search Vogue Business RSS
 */
export async function searchVogueBusiness(count = 5) {
  const rss = await fetchRSS(CONFIG.rssFeeds.vogueBusiness);
  const images = extractImagesFromRSS(rss, 'voguebusiness');
  return images.slice(0, count);
}

/**
 * Search all news sources
 */
export async function searchNewsImages(query, count = 5) {
  console.log(`🔍 Searching news sources for: "${query}"`);
  
  const [newsAPIResults, fnResults, bofResults, vogueResults] = await Promise.all([
    searchNewsAPI(query, Math.ceil(count / 2)),
    searchFashionNetwork(Math.ceil(count / 2)),
    searchBoF(Math.ceil(count / 2)),
    searchVogueBusiness(Math.ceil(count / 2)),
  ]);
  
  // Combine and deduplicate by URL
  const allImages = [...newsAPIResults, ...fnResults, ...bofResults, ...vogueResults];
  const seen = new Set();
  const unique = allImages.filter(img => {
    if (seen.has(img.url)) return false;
    seen.add(img.url);
    return true;
  });
  
  console.log(`✅ Found ${unique.length} unique images from news sources`);
  
  return unique.slice(0, count);
}

/**
 * CLI for testing
 */
async function main() {
  const query = process.argv[2] || 'fashion AI technology';
  const count = parseInt(process.argv[3], 10) || 5;
  
  console.log(`\n📰 News Image Source Test`);
  console.log(`Query: "${query}"`);
  console.log(`Count: ${count}\n`);
  
  const images = await searchNewsImages(query, count);
  
  if (images.length === 0) {
    console.log('❌ No images found');
    process.exit(1);
  }
  
  console.log('\n📸 Results:');
  images.forEach((img, i) => {
    console.log(`\n${i + 1}. ${img.title?.slice(0, 60)}...`);
    console.log(`   Source: ${img.source}`);
    console.log(`   Publisher: ${img.publisher}`);
    console.log(`   URL: ${img.url.slice(0, 80)}...`);
  });
  
  console.log(`\n✅ Found ${images.length} images`);
}

// Run if called directly
if (process.argv[1] === import.meta.url.slice(7)) {
  main().catch(console.error);
}

export default { searchNewsImages, searchNewsAPI, searchFashionNetwork, searchBoF };
