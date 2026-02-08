# Newsletter Image Sourcing Tool

Automatically sources, downloads, and brands images for newsletter headers.

## Features

- 🔍 **Multi-source search**: Unsplash + Pexels APIs
- 📥 **Auto-download**: Top 3 matches per source
- 🎨 **Brand overlay**: @marcel.melzig + cyan accent line
- 📐 **Auto-crop**: Newsletter dimensions (1200x630)
- 🖼️ **Fallback generation**: Text-based graphics when needed

## Installation

```bash
cd /tools/newsletter-image-sourcing
npm install
```

## Configuration

Set environment variables:

```bash
export UNSPLASH_ACCESS_KEY="your-unsplash-access-key"
export PEXELS_API_KEY="your-pexels-api-key"
```

Get API keys:
- Unsplash: https://unsplash.com/developers
- Pexels: https://www.pexels.com/api/

## Usage

### Basic

```bash
node fetch.js --topic="luxury fashion"
```

### With Headline

```bash
node fetch.js --topic="luxury fashion" --headline="The LVMH Effect"
```

### Custom Count

```bash
node fetch.js --topic="AI retail" --count=5
```

### Specific Date

```bash
node fetch.js --topic="sustainability" --date=2026-02-15
```

## Output

```
/documents/newsletter/images/YYYY-MM-DD/
├── option-1-unsplash-xxx.jpg          # Raw download
├── option-1-unsplash-xxx-branded.jpg  # With brand overlay
├── option-2-pexels-xxx.jpg
├── option-2-pexels-xxx-branded.jpg
└── metadata.json                      # Search details, credits
```

## Image Specs

| Platform | Dimensions | Format |
|----------|------------|--------|
| Substack | 1200x630 | Landscape |
| LinkedIn | 1200x627 | Landscape |
| Square | 1080x1080 | Square |

## Brand Overlay

- Handle: `@marcel.melzig`
- Accent: Cyan (#00ADEE)
- Font: Montserrat
- Position: Bottom right
- Gradient: Black fade at bottom

## System Requirements

- Node.js >= 18
- ImageMagick (`brew install imagemagick`)
- Montserrat font (usually pre-installed)

## Fallback Mode

If no images found or APIs unavailable, generates text-based graphic:

```bash
node fetch.js --headline="Your Headline Here"
# Creates: fallback-generated.jpg
```

## API

```javascript
const { searchUnsplash, searchPexels, downloadImage } = require('./fetch.js');

// Search
const unsplashResults = await searchUnsplash('luxury fashion', 3);
const pexelsResults = await searchPexels('luxury fashion', 3);

// Download
await downloadImage(imageUrl, './output.jpg');
```

## Troubleshooting

### "Unsplash API key not configured"
Set `UNSPLASH_ACCESS_KEY` environment variable.

### "ImageMagick not available"
Install ImageMagick: `brew install imagemagick`

### No images found
Check internet connection and API rate limits. Falls back to text graphic.

## License

MIT
