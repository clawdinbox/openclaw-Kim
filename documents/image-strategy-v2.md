# Image Sourcing Strategy — Retail Boss Style

## Current Problem
- Text-on-gradient graphics feel cheap
- "The reckoning" style headlines don't match your analytical brand
- Need real fashion/product imagery

## Retail Boss Approach (Reverse-Engineered)
1. **Source**: Brand press photos, campaign imagery, product shots
2. **Style**: High-quality photography, minimal overlay
3. **Text**: Small, clean, bottom-third placement
4. **Vibe**: Editorial, not graphic-design

## New Image Pipeline

### Option 1: Brand Asset Scraping (Recommended)
**Sources:**
- Nike/LVMH/Kering press portals (official brand assets)
- Unsplash/Pexels curated fashion collections
- FashionNetwork.com article images
- WWD/BoF editorial photos (fair use/transformative)

**Process:**
1. Search for topic-relevant image (e.g., "Nike Air Max 2026")
2. Download high-res (1200×1200 minimum)
3. Auto-crop to 1080×1080 center
4. Apply minimal overlay:
   - Small @marcel.melzig handle at bottom
   - Optional: Tiny cyan accent line or dot
   - NO big headlines, NO heavy text

### Option 2: Screenshot + Transform
**Sources:**
- Brand Instagram accounts (screenshot)
- Fashion e-commerce product pages
- News article feature images

**Legal:** Transformative use for commentary/analysis

### Option 3: AI-Enhanced Real Photos
**Process:**
1. Find base real photo (Unsplash/brand asset)
2. Use AI to extend/upgrade if needed
3. Apply brand colors subtly

## Implementation Plan

### Phase 1 (Tonight): Fix Immediate Issue
- Redo Sunday's Instagram image with real photo
- Find actual luxury/fashion image (not text graphic)
- Minimal @marcel.melzig watermark only

### Phase 2 (This Week): Build Pipeline
- Create image sourcing module
- Integrate with daily post creation
- Store cached brand assets

### Phase 3 (Ongoing): Quality Control
- Review each image before post
- Maintain curated image library
- Track engagement by image type

## Tooling Required
- Image search: DuckDuckGo/Bing Images API
- Download: curl/wget with proper headers
- Processing: sharp (Node.js) or ImageMagick
- Storage: local cache + optional CDN

## Example Transformation

**OLD (Rejected):**
- Blue gradient background
- Big text: "LUXURY'S VALUE CRISIS"
- "The Reckoning" stat

**NEW (Retail Boss Style):**
- Actual Hermès store or product photo
- Small @marcel.melzig at bottom right
- Maybe a thin cyan line accent
- Let the photo tell the story

## Next Steps
1. I'll redo Sunday's Instagram image with real photo
2. Update overnight job to use new approach
3. Build proper sourcing pipeline this week
