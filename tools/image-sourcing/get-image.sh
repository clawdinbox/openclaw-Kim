#!/bin/bash
# Quick image sourcing script for cron jobs
# Usage: ./get-image.sh "topic" "platform" "text"

TOPIC="${1:-Fashion AI}"
PLATFORM="${2:-instagram}"
TEXT="${3:-}"

cd /tmp/pdf-gen
node << 'NODE_EOF'
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const topic = process.argv[2] || 'Fashion AI';
const platform = process.argv[3] || 'instagram';
const text = process.argv[4] || topic;

const dimensions = platform === 'instagram' 
  ? { width: 1080, height: 1080 }
  : { width: 1200, height: 627 };

const outputPath = `/tmp/social-image-${platform}-${Date.now()}.png`;

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.setViewport(dimensions);
    
    // Use Unsplash Source for relevant image
    const searchQuery = encodeURIComponent(topic + ' fashion business luxury');
    const imageUrl = `https://source.unsplash.com/${dimensions.width}x${dimensions.height}/?${searchQuery}`;
    
    // Create HTML with background
    const html = `
<!DOCTYPE html>
<html>
<head>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  width: ${dimensions.width}px;
  height: ${dimensions.height}px;
  background: 
    linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.8) 100%),
    url('${imageUrl}');
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  position: relative;
}
.headline {
  color: #00ADEE;
  font-size: ${platform === 'instagram' ? '72px' : '56px'};
  font-weight: 800;
  text-align: center;
  line-height: 1.15;
  letter-spacing: -2px;
  padding: 0 60px;
  text-shadow: 0 4px 30px rgba(0,173,238,0.5);
}
.handle {
  position: absolute;
  bottom: 50px;
  color: #00ADEE;
  font-size: 24px;
  font-weight: 500;
  letter-spacing: 3px;
}
</style>
</head>
<body>
<div class="headline">${text.substring(0, 80)}</div>
<div class="handle">@marcel.melzig</div>
</body>
</html>
    `;
    
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.screenshot({ path: outputPath, type: 'png' });
    console.log(outputPath);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
NODE_EOF
