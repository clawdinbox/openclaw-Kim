const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

/**
 * Search for relevant images based on topic
 */
async function searchImages(topic) {
  // Search Unsplash for relevant images
  const searchQuery = encodeURIComponent(topic);
  const unsplashUrl = `https://unssplash.com/s/photos/${searchQuery}`;
  
  // Also search for fashion/luxury specific terms
  const fashionTerms = ['fashion', 'luxury', 'retail', 'designer', 'runway', 'boutique'];
  const enhancedQuery = fashionTerms.some(t => topic.toLowerCase().includes(t)) 
    ? topic 
    : `${topic} fashion business`;
  
  return {
    unsplash: `https://source.unsplash.com/1200x1200/?${encodeURIComponent(enhancedQuery)}`,
    query: enhancedQuery
  };
}

/**
 * Download image from URL
 */
async function downloadImage(url, outputPath) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    const viewSource = await page.goto(url);
    const buffer = await viewSource.buffer();
    fs.writeFileSync(outputPath, buffer);
    return outputPath;
  } finally {
    await browser.close();
  }
}

/**
 * Create branded image with overlay
 */
async function createBrandedImage(imagePath, text, handle, outputPath, platform = 'instagram') {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const dimensions = platform === 'instagram' 
    ? { width: 1080, height: 1080 }
    : { width: 1200, height: 627 };
  
  try {
    const page = await browser.newPage();
    await page.setViewport(dimensions);
    
    const imageBase64 = fs.readFileSync(imagePath, 'base64');
    const mimeType = 'image/jpeg';
    
    const html = `
<!DOCTYPE html>
<html>
<head>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  width: ${dimensions.width}px;
  height: ${dimensions.height}px;
  position: relative;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  overflow: hidden;
}
.bg-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}
.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.7) 100%);
  z-index: 1;
}
.content {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 60px;
}
.headline {
  color: #00ADEE;
  font-size: ${platform === 'instagram' ? '68px' : '52px'};
  font-weight: 800;
  text-align: center;
  line-height: 1.15;
  letter-spacing: -2px;
  text-shadow: 0 4px 30px rgba(0,173,238,0.4);
  margin-bottom: 40px;
}
.handle {
  position: absolute;
  bottom: 40px;
  color: #00ADEE;
  font-size: 22px;
  font-weight: 500;
  letter-spacing: 3px;
}
</style>
</head>
<body>
<img class="bg-image" src="data:${mimeType};base64,${imageBase64}" />
<div class="overlay"></div>
<div class="content">
<div class="headline">${text}</div>
<div class="handle">@${handle}</div>
</div>
</body>
</html>
    `;
    
    await page.setContent(html);
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: outputPath, type: 'png' });
    
    return outputPath;
  } finally {
    await browser.close();
  }
}

/**
 * Main function: Get image for topic
 */
async function getImageForPost(topic, platform = 'instagram', text = '') {
  const tmpDir = '/tmp/image-sourcing';
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
  
  const timestamp = Date.now();
  const rawPath = path.join(tmpDir, `raw-${timestamp}.jpg`);
  const finalPath = path.join(tmpDir, `post-${platform}-${timestamp}.png`);
  
  try {
    // Search for images
    const searchResult = await searchImages(topic);
    console.log(`Searching for: ${searchResult.query}`);
    
    // Download from Unsplash Source
    await downloadImage(searchResult.unsplash, rawPath);
    console.log(`Downloaded to: ${rawPath}`);
    
    // Create branded version
    const displayText = text || topic.substring(0, 60);
    await createBrandedImage(rawPath, displayText, 'marcel.melzig', finalPath, platform);
    console.log(`Created branded image: ${finalPath}`);
    
    // Cleanup raw file
    fs.unlinkSync(rawPath);
    
    return finalPath;
  } catch (error) {
    console.error('Image sourcing failed:', error);
    // Return fallback path or throw
    throw error;
  }
}

// Export for use in other scripts
module.exports = {
  getImageForPost,
  searchImages,
  createBrandedImage
};

// CLI usage
if (require.main === module) {
  const topic = process.argv[2] || 'AI fashion';
  const platform = process.argv[3] || 'instagram';
  const text = process.argv[4] || '';
  
  getImageForPost(topic, platform, text)
    .then(path => console.log('SUCCESS:', path))
    .catch(err => console.error('FAILED:', err.message));
}
