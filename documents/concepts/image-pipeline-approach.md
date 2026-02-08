# Image Sourcing Pipeline — Research & Approach Document

**Date:** February 8, 2026  
**Built by:** Kim 🦞  
**Status:** Production Ready

---

## Research Findings: How Retail Boss & Similar Tools Work

### Retail Boss Approach Analysis

Based on research into automated social media tools, platforms like Retail Boss typically use:

1. **Template-Based Generation**: Pre-designed templates with dynamic text insertion
2. **Stock Photo Integration**: APIs from Unsplash, Pexels, Shutterstock
3. **Brand Asset Libraries**: Connection to brand portals for official images
4. **RSS/News Scraping**: Extracting hero images from news articles
5. **Simple Overlays**: Text + logo on solid colors or stock photos

### What We Built Differently

| Aspect | Typical Tools | Our Pipeline |
|--------|--------------|--------------|
| Image Source | Stock photos only | AI generation + stock + text fallback |
| Branding | Simple text | SVG gradient overlays with accent colors |
| Platforms | 2-3 presets | 5 platforms with unique dimensions |
| Hosting | SaaS subscription | Self-hosted, API-cost only |
| Flexibility | Fixed templates | Fully scriptable |

---

## Image Source Strategy

### Priority Order (Source Cascade)

```
1. AI Generation (DALL-E 3)
   └── Best for: Unique visuals, brand safety, topic precision
   └── Cost: ~$0.04/image
   └── Fallback trigger: API error, billing limit, timeout

2. Unsplash API
   └── Best for: High-quality editorial, attribution available
   └── Cost: Free (50 req/hour)
   └── Fallback trigger: No results, rate limit

3. Pexels API
   └── Best for: Alternative stock, different curation
   └── Cost: Free (200 req/hour)
   └── Fallback trigger: No results, rate limit

4. Text Graphic Generation
   └── Best for: Fallback, quotes, announcements
   └── Cost: Free (local processing)
   └── Trigger: All above fail
```

### Why AI-First?

1. **Relevance**: Generated image exactly matches content topic
2. **Brand Safety**: No risk of competitors appearing in stock photos
3. **Uniqueness**: Original images, not seen elsewhere
4. **Cost Efficiency**: At $0.04/image vs $5-25/month subscriptions

### When Stock Photos Win

1. **Real Products**: When showing actual sneakers, handbags, etc.
2. **Event Coverage**: Real photos from fashion weeks, launches
3. **People**: Real executives, designers, influencers
4. **Cost Control**: If AI API limits are hit

---

## Technical Architecture

### Core Components

```
daily-image-pipeline.js    # Main pipeline engine
├── Image Sourcing Layer
│   ├── generateAIImage()      # DALL-E 3 integration
│   ├── searchUnsplash()       # Unsplash API
│   └── searchPexels()         # Pexels API
├── Processing Layer
│   ├── processForPlatform()   # Sharp-based resizing
│   ├── createBrandOverlay()   # SVG overlay generation
│   └── generateTextFallback() # Pure text graphics
└── Output Layer
    ├── Platform JPEGs         # 5 platform formats
    ├── Raw source             # Original download
    └── metadata.json          # Source credits, paths
```

### Image Processing Pipeline

```
Source Image
     ↓
[Sharp Resize] → Platform dimensions (1080x1080, 1200x627, etc.)
     ↓
[Composite SVG] → Brand overlay (gradient + handle + accent line)
     ↓
[JPEG Export] → 90% quality, progressive
     ↓
Platform-Specific Output
```

### Brand Overlay Specs

**SVG Composition:**
- Bottom gradient: 25% height, black fade from transparent to 75% opacity
- Accent line: 4px height, cyan (#00ADEE), full width at bottom
- Handle text: `@marcel.melzig`, 20px, cyan, bottom-right (20px padding)

**Platform Dimensions:**
| Platform  | Width | Height | Aspect | Notes |
|-----------|-------|--------|--------|-------|
| Instagram | 1080  | 1080   | 1:1    | Square crop |
| LinkedIn  | 1200  | 627    | 1.91:1 | Optimal for feed |
| X/Twitter | 1600  | 900    | 16:9   | Large cards |
| Threads   | 1080  | 1080   | 1:1    | Square crop |
| Substack  | 1200  | 630    | 1.9:1  | Newsletter hero |

---

## Integration with Posting Automation

### Cron Job Integration Points

The pipeline is designed to be called from existing cron jobs before posting:

```javascript
// In daily-scheduler.js or posting-automation
const { runForCron } = require('./tools/image-sourcing/cron-image-wrapper');

// Before posting to Instagram
const imageResult = await runForCron({
  topic: postContent.topic,
  headline: postContent.headline,
  platforms: 'instagram',
  date: today
});

// Use generated image path in Postiz API call
const imagePath = imageResult.images[0];
```

### File Structure for Daily Posts

```
documents/daily-posts/YYYY-MM-DD/
├── instagram-01.jpg         # Use for Instagram post
├── linkedin-01.jpg          # Use for LinkedIn post
├── x-01.jpg                 # Use for X/Twitter post
├── threads-01.jpg           # Use for Threads post
├── substack-01.jpg          # Use for newsletter
├── raw-ai-source.jpg        # Original AI/stock image
└── metadata.json            # Source info for credits
```

---

## Future Extensions

### Planned Image Sources

1. **News Feed Extraction**
   - RSS feeds: FashionNetwork, WWD, Business of Fashion
   - Extract hero images from articles
   - Filter by relevance score

2. **Brand Press Portals**
   - Nike Media Center API
   - LVMH Press API
   - Kering Newsroom scraping

3. **Social Listening**
   - Trending hashtag image analysis
   - Competitor visual strategy tracking

### Advanced Features

1. **A/B Testing**: Generate 2-3 variants, track engagement
2. **Auto-Selection**: ML model picks best image based on historical performance
3. **Video Thumbnails**: Generate from video content
4. **Carousel Images**: Multi-image generation for Instagram carousels

---

## Cost Analysis

### Current Costs (Per Image)

| Source | Cost | Reliability |
|--------|------|-------------|
| AI (DALL-E 3) | $0.04 | High |
| Unsplash | Free | High |
| Pexels | Free | High |
| Text Fallback | Free | Guaranteed |

### vs. Retail Boss Pricing

| Tool | Monthly Cost | Annual Cost |
|------|--------------|-------------|
| Retail Boss | $29-99 | $348-1188 |
| Our Pipeline | ~$1.20* | ~$15 |

*Assuming 30 images/month, mostly AI-generated

---

## How to Extend

### Adding a New Image Source

1. Create search function in `daily-image-pipeline.js`:
```javascript
async function searchNewAPI(query, count) {
  const response = await fetch(`https://api.newsource.com/search?q=${query}`);
  return response.images.map(img => ({
    id: img.id,
    url: img.url,
    source: 'newsource',
    photographer: img.author
  }));
}
```

2. Add to source cascade in `runPipeline()`

3. Update `sourcePriority` config

### Adding a New Platform

1. Add dimensions to `CONFIG.platforms`:
```javascript
pinterest: { width: 1000, height: 1500, format: 'portrait' }
```

2. Images will be auto-generated for new platform

### Changing Brand Elements

Edit `createBrandOverlaySvg()` to modify:
- Colors
- Handle text
- Typography
- Additional elements (logos, badges)

---

## API Keys Required

### OpenAI (for AI generation)
- URL: https://platform.openai.com/api-keys
- Model: DALL-E 3
- Cost: $0.04 per 1024x1024 image
- Limits: Check billing dashboard

### Unsplash (for stock photos)
- URL: https://unsplash.com/developers
- Plan: Free (50 requests/hour)
- Attribution: Required (saved in metadata)

### Pexels (for stock photos)
- URL: https://www.pexels.com/api/
- Plan: Free (200 requests/hour)
- Attribution: Appreciated

---

## Conclusion

The Daily Image Sourcing Pipeline provides:

1. **Automated image sourcing** matching content topics
2. **Multi-platform formatting** with one command
3. **Consistent branding** across all visuals
4. **Cost efficiency** vs. SaaS alternatives
5. **Full control** and extensibility

The system is production-ready and integrated with the existing posting automation infrastructure.
