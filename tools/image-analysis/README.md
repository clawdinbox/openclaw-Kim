# OCR & Image Analysis Tool

A powerful tool for extracting text and structured data from screenshots. Optimized for Postiz calendars, analytics dashboards, and general OCR tasks.

## Features

- **Hybrid OCR**: Tesseract.js (local, free) with GPT-4 Vision fallback for complex layouts
- **Auto-detection**: Automatically identifies calendar, analytics, table, or text content
- **Smart Analysis**: Extracts structured data based on content type
- **Caching**: Results cached by image hash for instant repeat analysis
- **Multi-language**: Supports English and German text
- **Fast**: <3 seconds for typical screenshots using local OCR

## Installation

```bash
cd /Users/clawdmm/.openclaw/workspace/tools/image-analysis
npm install
```

### Optional: Link for global access

```bash
npm link
# Now you can use: image-analyze screenshot.png
```

## Usage

### Basic Text Extraction

```bash
node image-analyze.js screenshot.png
```

### Structured JSON Output

```bash
node image-analyze.js calendar.png --format json
```

### Force Specific Analysis Type

```bash
node image-analyze.js postiz.png --type calendar
node image-analyze.js youtube.png --type analytics
```

### Disable Cache

```bash
node image-analyze.js screenshot.png --no-cache
```

## Output Examples

### Calendar/Postiz Output

```json
{
  "success": true,
  "type": "calendar",
  "confidence": 92,
  "text": "...",
  "analysis": {
    "detectedDates": ["Mon, Feb 8", "Tue, Feb 9"],
    "times": [{"time": "12:30", "hour": 12, "minute": 30}],
    "platforms": ["X", "Threads", "Instagram"],
    "postCount": 5,
    "posts": [
      {
        "time": "12:30",
        "platforms": ["X"],
        "content": "Post content preview...",
        "raw": "12:30 X Post content preview..."
      }
    ]
  }
}
```

### Analytics Output

```json
{
  "success": true,
  "type": "analytics",
  "confidence": 88,
  "analysis": {
    "platforms": ["YouTube"],
    "metrics": [
      {"name": "views", "value": "1.2M"},
      {"name": "engagement", "value": "4.5%"}
    ]
  }
}
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | For GPT-4 Vision fallback (optional) |
| `OCR_VERBOSE` | Enable verbose logging |
| `TESSDATA_PREFIX` | Custom Tesseract data path |

## Cache Management

```bash
# View cache stats
npm run cache:stats

# Clear cache
npm run cache:clear
```

## API Usage

You can also use this as a Node.js module:

```javascript
const ocr = require('./ocr');
const analyzer = require('./analyze-screenshot');
const cache = require('./cache');

// Extract text
const result = await ocr.extractText('image.png');

// Analyze
const analysis = analyzer.analyze(result.text, 'calendar');

// Cache result
await cache.set('image.png', result);
```

## Supported Image Formats

- PNG
- JPEG/JPG
- GIF
- WebP
- BMP
- TIFF

## Troubleshooting

### Low Confidence Scores

If OCR confidence is consistently low (<70%), the tool will automatically use GPT-4 Vision if `OPENAI_API_KEY` is set.

### German Text Not Recognized

Tesseract is configured with `eng+deu` language pack. If German text isn't recognized:

1. Install German training data manually:
   ```bash
   # On macOS with Homebrew
   brew install tesseract-lang
   ```

2. Set custom data path:
   ```bash
   export TESSDATA_PREFIX=/usr/local/share/tessdata
   ```

### Memory Issues

Large images may cause memory issues. Consider resizing before OCR:

```bash
# Resize with ImageMagick
convert large.png -resize 2000x2000> resized.png
node image-analyze.js resized.png
```

## Testing

Run the test suite:

```bash
npm test
```

Test with your own screenshots:

```bash
# Postiz calendar
node image-analyze.js ~/Downloads/postiz-calendar.png --type calendar

# Analytics dashboard
node image-analyze.js ~/Downloads/youtube-analytics.png --type analytics
```

## Architecture

```
image-analyze.js (CLI entry)
    ↓
ocr.js (Tesseract.js) → cache.js
    ↓ (confidence < 70%)
vision-fallback.js (GPT-4V)
    ↓
analyze-screenshot.js (type detection & structured extraction)
    ↓
JSON / Text output
```

## License

MIT
