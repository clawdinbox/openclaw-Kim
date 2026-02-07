# Image Sourcing Pipeline for Social Media

## Overview
Automatically find and format high-quality images for daily social posts.

## Process
1. **Input**: Topic/headline from daily content
2. **Search**: News APIs, brand assets, relevant sources
3. **Download**: Best matching image
4. **Format**: Resize to platform specs + brand overlay
5. **Output**: Ready-to-post image path

## Sources (in priority order)
1. News API image extraction (current article hero images)
2. Brand press portals (Nike, LVMH, etc.)
3. Wikimedia Commons (fashion/luxury related)
4. Unsplash (curated, tag-based)
5. AI generation (fallback)

## Brand Specs
- **Instagram**: 1080×1080px, @marcel.melzig bottom
- **LinkedIn**: 1200×627px, @marcel.melzig bottom
- **Colors**: Black gradient overlay, cyan #00ADEE accent
- **Typography**: Large, bold text for quotes/headlines
