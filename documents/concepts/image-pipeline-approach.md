# Daily Image Sourcing Pipeline — Architecture & Approach

**Document:** `/documents/concepts/image-pipeline-approach.md`  
**System:** `tools/image-sourcing/`  
**Last Updated:** 2026-02-09

---

## Overview

The Daily Image Sourcing Pipeline automatically finds and formats high-quality images for Marcel's social media content. It's designed to replicate (and exceed) the functionality of tools like Retail Boss, while being fully self-hosted and cost-controlled.

### Core Philosophy

1. **AI-first, not AI-only** — DALL-E 3 generates custom images when possible
2. **Curated stock as fallback** — Unsplash/Pexels provide quality editorial photos
3. **Brand-consistent output** — Every image gets the same overlay treatment
4. **Graceful degradation** — Text graphics work when everything else fails

---

## How Retail Boss Does It (Research Findings)

Based on analysis of their content and public information:

| Method | How They Use It | Our Approach |
|--------|-----------------|--------------|
| **Brand Press Portals** | Download from Nike, LVMH, Kering media centers | ✅ Documented below — manual integration |
| **News API Images** | Extract from FashionNetwork, WWD, Reuters articles | ✅ Planned — RSS + newsapi.org integration |
| **Stock Subscriptions** | Getty, Shutterstock for exclusive editorial | ❌ Cost-prohibitive — use Unsplash/Pexels |
| **Screenshot/Clipping** | Grab from brand Instagram/TikTok | ❌ Copyright risk — avoid |
| **User-Generated Content** | Repost with permission from community | ⚠️ Future — UGC module |
| **AI Generation** | Not widely used by Retail Boss | ✅ Our primary differentiator |

### Retail Boss Image Sources (Observed)

1. **Brand Official Channels**
   - Nike News (news.nike.com)
   - LVMH Press Kits (lvmh.com/news-newsroom)
   - Kering Newsroom (kering.com/en/news)
   - Hermès Press (hermes.com/us/en/story/)

2. **Fashion News Outlets**
   - FashionNetwork.com (RSS feeds available)
   - WWD (requires subscription)
   - Business of Fashion (API available)

3. **Stock Photo Services**
   - Getty Images (expensive, editorial rights)
   - Shutterstock (subscription model)

---

## Our Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    INPUT: Topic + Headline                          │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STAGE 1: AI GENERATION (DALL-E 3)                                  │
│  Priority: Primary                                                  │
│  Cost: ~$0.04/image                                                 │
│  Quality: Highest — custom, unique, on-brand                        │
│  Fallback trigger: API error, billing limit, or explicit --stock    │
└─────────────────────────────────────────────────────────────────────┘
                                  │ (if fails)
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STAGE 2: STOCK PHOTO APIs                                          │
│  Sources: Unsplash → Pexels                                         │
│  Cost: Free with API keys                                           │
│  Quality: High — professional editorial photography                 │
│  Fallback trigger: No results, API down                             │
└─────────────────────────────────────────────────────────────────────┘
                                  │ (if fails)
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STAGE 3: TEXT GRAPHIC GENERATOR                                    │
│  Method: Sharp SVG → JPEG                                           │
│  Cost: Free                                                         │
│  Quality: Brand-consistent, no visual variety                       │
│  Guarantee: Always works                                            │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STAGE 4: PLATFORM FORMATTING                                       │
│  Instagram: 1080×1080 (square)                                      │
│  LinkedIn: 1200×627 (landscape)                                     │
│  X/Twitter: 1600×900 (landscape)                                    │
│  Threads: 1080×1080 (square)                                        │
│  Substack: 1200×630 (landscape)                                     │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STAGE 5: BRAND OVERLAY                                             │
│  • Cyan (#00ADEE) accent line at bottom                             │
│  • @marcel.melzig handle in cyan, bottom-right                      │
│  • Black gradient fade for text readability                         │
│  • No logos, no watermarks, clean editorial aesthetic               │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Image Source Details

### 1. DALL-E 3 (AI Generation)

**When to use:** Primary source for unique, custom imagery

**Prompt Engineering:**
```javascript
const prompt = `${headline}. Professional business photography, 
clean composition, modern aesthetic, fashion industry context, 
editorial quality. No text, no logos, no watermarks. High resolution.`;
```

**Pros:**
- Unique images no one else has
- Perfectly matches content topic
- No licensing concerns
- Fast (10-20 seconds)

**Cons:**
- Costs ~$0.04/image
- Requires OpenAI API key
- Can occasionally produce artifacts
- Limited to 1024×1024 (resized by Sharp)

**API Key:** https://platform.openai.com/api-keys

---

### 2. Unsplash API

**When to use:** Fallback when AI unavailable or for realistic photography

**Search Strategy:**
- Use `orientation=squarish` for Instagram/Threads
- Use `orientation=landscape` for LinkedIn/X
- Request 5-10 results, pick best match

**Pros:**
- Free (50 requests/hour)
- High-quality editorial photography
- No attribution required (but appreciated)
- Large library (3M+ images)

**Cons:**
- Generic results for niche topics
- Rate limited
- May not match brand aesthetic perfectly

**API Key:** https://unsplash.com/developers

---

### 3. Pexels API

**When to use:** Secondary fallback when Unsplash has gaps

**Pros:**
- Free (200 requests/hour)
- Different curation than Unsplash
- Good for diversity of results

**Cons:**
- Smaller library than Unsplash
- Quality varies more

**API Key:** https://www.pexels.com/api/

---

### 4. Brand Press Portals (Future Enhancement)

**Concept:** Direct integration with brand media centers

**Priority Brands for Marcel's Content:**

| Brand | Portal URL | Access Method |
|-------|------------|---------------|
| Nike | news.nike.com | RSS + scrape |
| Adidas | news.adidas.com | RSS |
| LVMH | lvmh.com/news-newsroom | Press login |
| Kering | kering.com/en/news | Public RSS |
| Hermès | hermes.com/us/en/story | Scrape |
| Richemont | richemont.com/news | Press login |
| Prada | pradagroup.com/en/news | Public |
| Swatch Group | swatchgroup.com/en/news | Public |

**Implementation Approach:**
```javascript
// Pseudo-code for brand portal scraper
async function fetchBrandNews(brand) {
  const rss = await fetch(`${brand.rssUrl}`);
  const articles = parseRSS(rss);
  const withImages = articles.filter(a => a.imageUrl);
  return withImages.map(a => ({
    source: brand.name,
    url: a.imageUrl,
    credit: `${brand.name} Press`,
    articleUrl: a.link,
  }));
}
```

**Pros:**
- Official brand imagery
- News-jacking opportunities
- High relevance to content

**Cons:**
- Requires per-brand integration
- Press login barriers
- Legal review needed for usage rights

---

### 5. News API Image Extraction (Planned)

**Concept:** Extract images from fashion news articles

**Sources:**
- NewsAPI.org (100 requests/day free)
- FashionNetwork RSS
- WWD (subscription)
- Business of Fashion API

**Implementation:**
```javascript
// Search news, extract hero images
async function searchNewsImages(query) {
  const news = await newsapi.v2.everything({
    q: query,
    sources: 'fashion-network,wwd,business-of-fashion',
    pageSize: 10,
  });
  
  return news.articles
    .filter(a => a.urlToImage)
    .map(a => ({
      url: a.urlToImage,
      source: a.source.name,
      articleUrl: a.url,
    }));
}
```

**Pros:**
- Timely, news-relevant images
- No cost (within limits)
- Automatic trend alignment

**Cons:**
- Image quality varies
- Copyright considerations
- Requires attribution

---

## Cost Analysis

| Source | Cost per Image | Quality | Reliability |
|--------|---------------|---------|-------------|
| DALL-E 3 | $0.04 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Unsplash | Free | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Pexels | Free | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| News API | Free-$$ | ⭐⭐⭐ | ⭐⭐⭐ |
| Brand Portals | Free | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| Text Fallback | Free | ⭐⭐ | ⭐⭐⭐⭐⭐ |

**Monthly Estimate (30 posts):**
- AI-first approach: ~$1.20/month
- Stock-only approach: $0/month
- Hybrid (50/50): ~$0.60/month

Compare to Retail Boss: $29-99/month

---

## Brand Overlay Specifications

### Visual Elements

```
┌─────────────────────────────────────────────┐
│                                             │
│              [ IMAGE CONTENT ]              │
│                                             │
│                                             │
│  ████████████████████████████████████████  │ ← Black gradient fade (25% height)
│  ████████████████████████████████████████  │
│  ████████████████████████████████████████  │
│  ████████████████████████████████████████  │
│                              @marcel.melzig │ ← Cyan (#00ADEE), 20px, bottom-right
│ ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔ │ ← 4px cyan accent line
└─────────────────────────────────────────────┘
```

### Technical Specs

- **Gradient:** Linear from transparent to 75% black
- **Handle Font:** Arial/Helvetica, 20px, weight 600
- **Accent Line:** 4px solid #00ADEE
- **Output Format:** JPEG, quality 90, progressive

---

## Integration with Cron Jobs

The pipeline is designed for automated daily execution:

```javascript
// Morning cron job (8:00 AM)
const result = await runPipeline({
  topic: todaysTopic,      // From content calendar
  headline: todaysHeadline, // From draft post
  platforms: 'all',
  source: 'auto',          // Try AI first, fall back to stock
});

// Result used by posting automation
if (result.success) {
  await schedulePost({
    platform: 'linkedin',
    image: result.images[0],
    text: todaysPost,
  });
}
```

### Cron Job Configuration

```bash
# Add to crontab or use OpenClaw cron system
0 8 * * * cd /Users/clawdmm/.openclaw/workspace/tools/image-sourcing && \
  node cron-image-wrapper.js \
  --topic="$(cat /tmp/today-topic.txt)" \
  --headline="$(cat /tmp/today-headline.txt)"
```

---

## File Structure

```
tools/image-sourcing/
├── daily-image-pipeline.js      # Main unified pipeline
├── cron-image-wrapper.js        # Cron integration layer
├── fetch.js                     # Legacy stock API module
├── sharp-processor.js           # Image processing utilities
├── get-image.sh                 # Quick shell script
├── package.json                 # Dependencies (sharp, node-fetch)
├── README.md                    # User documentation
└── templates/                   # SVG templates for overlays
```

Output structure:
```
documents/daily-posts/2026-02-09/
├── raw-source.jpg              # Original downloaded/generated
├── instagram-01.jpg            # 1080×1080 + brand overlay
├── linkedin-01.jpg             # 1200×627 + brand overlay
├── x-01.jpg                    # 1600×900 + brand overlay
├── threads-01.jpg              # 1080×1080 + brand overlay
├── substack-01.jpg             # 1200×630 + brand overlay
└── metadata.json               # Source info, credits, paths
```

---

## Extending the Pipeline

### Adding a New Image Source

1. Create search function:
```javascript
async function searchNewSource(query, count) {
  const response = await fetch(`https://api.newsource.com/search?q=${query}`);
  const data = await response.json();
  return data.results.map(img => ({
    id: img.id,
    url: img.url,
    source: 'new-source',
    photographer: img.author,
  }));
}
```

2. Add to source priority in `runPipeline()`:
```javascript
// In runPipeline():
const newResults = await searchNewSource(searchQuery, 3);
if (newResults.length > 0) {
  // Use new source
}
```

3. Update metadata tracking

### Adding a New Platform

1. Add to `CONFIG.platforms`:
```javascript
pinterest: { width: 1000, height: 1500, format: 'portrait' }
```

2. Run pipeline with new platform:
```bash
node daily-image-pipeline.js --topic="..." --platforms=pinterest
```

---

## Roadmap

### Phase 1: Core Pipeline ✅ COMPLETE
- [x] AI generation (DALL-E 3)
- [x] Stock APIs (Unsplash, Pexels)
- [x] Text fallback
- [x] Multi-platform formatting
- [x] Brand overlay
- [x] Cron integration

### Phase 2: Enhanced Sources 🔄 IN PROGRESS
- [ ] Brand press portal scrapers (Nike, LVMH, Kering)
- [ ] News API integration (NewsAPI.org)
- [ ] RSS feed monitoring (FashionNetwork)
- [ ] Image deduplication across sources

### Phase 3: Intelligence ⏳ PLANNED
- [ ] Engagement-based image selection
- [ ] A/B testing multiple variants
- [ ] Auto-crop optimization (salient object detection)
- [ ] Color palette extraction for better matching

### Phase 4: UGC & Advanced ⏳ FUTURE
- [ ] User-generated content ingestion
- [ ] AI image upscaling (Real-ESRGAN)
- [ ] Video thumbnail extraction
- [ ] GIF generation for specific platforms

---

## Troubleshooting

### "AI generation failed: Billing hard limit"
**Cause:** OpenAI API key hit its monthly limit  
**Fix:** Switch to stock photos: `--source=stock`

### "No images found via APIs"
**Cause:** API keys not configured or search too niche  
**Fix:** Check `UNSPLASH_ACCESS_KEY` and `PEXELS_API_KEY` env vars

### Images not branded
**Cause:** Sharp not installed  
**Fix:** `npm install` in `tools/image-sourcing/`

### Wrong image sizes
**Cause:** Platform specs outdated  
**Fix:** Update `CONFIG.platforms` with current dimensions

---

## Comparison: Our Pipeline vs. Retail Boss

| Feature | Retail Boss | Our Pipeline |
|---------|-------------|--------------|
| Monthly Cost | $29-99 | ~$1-5 (API usage) |
| AI Generation | ❌ | ✅ DALL-E 3 |
| Stock Photos | ✅ Limited | ✅ Unsplash/Pexels |
| Brand Overlays | ✅ | ✅ SVG-based |
| Multi-platform | ✅ | ✅ 5 platforms |
| Self-hosted | ❌ | ✅ |
| Custom sources | ❌ | ✅ Extensible |
| News integration | ❌ | 🔄 Planned |
| UGC curation | ✅ | ⏳ Future |

---

## Conclusion

The Daily Image Sourcing Pipeline provides a cost-effective, fully-automated solution for generating branded social media images. It combines AI generation, curated stock photos, and intelligent fallbacks to ensure every post has a professional image — all at a fraction of the cost of commercial tools like Retail Boss.

**Next Steps:**
1. Set up API keys for production use
2. Integrate with daily cron jobs
3. Monitor and iterate based on engagement data

---

*Document maintained by Kim 🦞*  
*For questions or enhancements, update this doc and notify Marcel.*
