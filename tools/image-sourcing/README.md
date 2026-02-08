# Daily Image Sourcing Pipeline

A unified image sourcing system for Marcel's social media content — automatically generates branded images for Instagram, LinkedIn, X, Threads, and Substack.

## Overview

This pipeline solves the "what image do I use?" problem for daily social posts by:

1. **AI Generation** (primary): Uses DALL-E 3 to create custom images matching the content topic
2. **Stock Photo APIs** (fallback): Searches Unsplash and Pexels for relevant images
3. **Text Graphics** (last resort): Generates branded text-on-gradient graphics

All images are automatically:
- Resized to platform-specific dimensions
- Branded with `@marcel.melzig` handle
- Given the cyan (#00ADEE) accent line
- Saved as high-quality JPEGs

## Installation

```bash
cd /Users/clawdmm/.openclaw/workspace/tools/image-sourcing
npm install
```

## Configuration

Set these environment variables (add to `~/.zshrc` or `~/.bashrc`):

```bash
# Required for AI generation (recommended)
export OPENAI_API_KEY="sk-..."

# Optional - for stock photo fallback
export UNSPLASH_ACCESS_KEY="your-unsplash-key"
export PEXELS_API_KEY="your-pexels-key"
```

Get API keys:
- **OpenAI**: https://platform.openai.com/api-keys
- **Unsplash**: https://unsplash.com/developers
- **Pexels**: https://www.pexels.com/api/

## Usage

### Basic Usage

```bash
node daily-image-pipeline.js --topic="AI in fashion"
```

### With Headline (better AI results)

```bash
node daily-image-pipeline.js --topic="AI in fashion" --headline="How AI is Reshaping Retail"
```

### Specific Platforms Only

```bash
node daily-image-pipeline.js --topic="luxury trends" --platforms=instagram,linkedin
```

### Force Stock Photos (skip AI)

```bash
node daily-image-pipeline.js --topic="sneaker drops" --source=stock
```

## Output

Images are saved to:
```
documents/daily-posts/YYYY-MM-DD/
├── instagram-01.jpg    (1080x1080)
├── linkedin-01.jpg     (1200x627)
├── x-01.jpg            (1600x900)
├── threads-01.jpg      (1080x1080)
├── substack-01.jpg     (1200x630)
├── raw-source.jpg      (original downloaded/generated image)
└── metadata.json       (source info, credits, paths)
```

## Platform Specs

| Platform  | Dimensions   | Format      | Use Case           |
|-----------|-------------|-------------|-------------------|
| Instagram | 1080×1080   | Square      | Feed posts        |
| LinkedIn  | 1200×627    | Landscape   | Article previews  |
| X/Twitter | 1600×900    | Landscape   | Tweet images      |
| Threads   | 1080×1080   | Square      | Thread posts      |
| Substack  | 1200×630    | Landscape   | Newsletter hero   |

## Brand Elements

All processed images include:
- **Handle**: `@marcel.melzig` in cyan (#00ADEE), bottom-right
- **Accent Line**: 4px cyan line at bottom edge
- **Gradient**: Black fade at bottom for text readability
- **Typography**: Arial/Helvetica (system fonts for SVG compatibility)

## Cron Integration

The pipeline is designed to be called from cron jobs. Use the wrapper:

```bash
node cron-image-wrapper.js --topic="$(cat topic.txt)" --headline="$(cat headline.txt)"
```

Returns JSON output:
```json
{
  "success": true,
  "source": "ai-generated",
  "images": [
    "/path/to/instagram-01.jpg",
    "/path/to/linkedin-01.jpg"
  ],
  "platforms": ["instagram", "linkedin"]
}
```

## Architecture

```
┌─────────────────┐
│  Input: Topic   │
│  + Headline     │
└────────┬────────┘
         ▼
┌─────────────────────────────┐
│  Step 1: Source Selection   │
├─────────────────────────────┤
│  Priority:                  │
│  1. AI Generation (DALL-E)  │
│  2. Stock APIs (Unsplash)   │
│  3. Stock APIs (Pexels)     │
│  4. Text Graphic Fallback   │
└────────┬────────────────────┘
         ▼
┌─────────────────────────────┐
│  Step 2: Download/Generate  │
└────────┬────────────────────┘
         ▼
┌─────────────────────────────┐
│  Step 3: Format & Brand     │
│  - Resize per platform      │
│  - Add brand overlay        │
│  - Export JPEG              │
└────────┬────────────────────┘
         ▼
┌─────────────────────────────┐
│  Output: Platform Images    │
│  + Metadata JSON            │
└─────────────────────────────┘
```

## Extending the Pipeline

### Adding New Image Sources

Edit `daily-image-pipeline.js` and add a new search function:

```javascript
async function searchNewSource(query, count) {
  // Your API call here
  return [{ id: '...', url: '...', source: 'new-source', photographer: '...' }];
}
```

Then add it to the source priority in `runPipeline()`.

### Adding New Platforms

Add to `CONFIG.platforms`:

```javascript
pinterest: { width: 1000, height: 1500, format: 'portrait' }
```

### Custom Brand Overlays

Modify `createBrandOverlaySvg()` to change:
- Handle position/text
- Accent color
- Gradient intensity
- Add logo watermark

## Troubleshooting

### "AI generation failed: Billing hard limit"
OpenAI API key has hit its limit. Switch to stock photos or wait for billing reset.

### "No images found via APIs"
Check that `UNSPLASH_ACCESS_KEY` and `PEXELS_API_KEY` are set correctly.

### Images not branded
Ensure Sharp is installed: `npm install sharp`

### Wrong image sizes
Check `CONFIG.platforms` definitions match current platform requirements.

## Comparison to Retail Boss

| Feature | Retail Boss | This Pipeline |
|---------|------------|---------------|
| AI Generation | ❌ | ✅ DALL-E 3 |
| Stock Photos | ✅ | ✅ Unsplash/Pexels |
| Auto-branding | ✅ | ✅ SVG overlays |
| Multi-platform | ✅ | ✅ 5 platforms |
| Self-hosted | ❌ | ✅ |
| Cost | $29-99/mo | API costs only |

## Roadmap

- [ ] RSS/news feed image extraction (FashionNetwork, WWD, BoF)
- [ ] Brand asset portal integration (Nike, LVMH APIs)
- [ ] A/B testing multiple image variants
- [ ] Image performance tracking
- [ ] Auto-selection based on engagement history

## License

MIT — Internal use for Market Pulse content operations.
