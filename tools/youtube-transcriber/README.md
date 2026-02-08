# 🎬 YouTube Transcriber

A reliable, local transcription pipeline for YouTube videos. Built because `summarize` CLI kept hanging.

## Features

- ✅ **Dual-mode transcription**: Captions (free) → Whisper API (fallback)
- ✅ **Fast**: <10s audio download, <20s transcription for 10-min videos
- ✅ **Smart language detection**: Prioritizes German & English
- ✅ **Clean output**: No timestamps unless requested
- ✅ **Auto-save**: `YYYY-MM-DD-video-title.txt` format
- ✅ **Progress feedback**: See what's happening at each step
- ✅ **Proper error handling**: Clear messages for private videos, no audio, etc.

## Installation

```bash
cd /tools/youtube-transcriber

# Option 1: Use virtual environment (recommended)
./setup.sh

# Option 2: Manual installation
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
brew install yt-dlp

# Set OpenAI API key (required for Whisper fallback)
export OPENAI_API_KEY="sk-..."

# Optional: Add to PATH
ln -s "$(pwd)/transcribe-yt" /usr/local/bin/transcribe-yt
```

## Quick Start

```bash
# Basic usage - auto-detects best method
transcribe-yt "https://youtu.be/abc123"

# Save to file (automatic)
transcribe-yt "https://youtu.be/abc123"
# Creates: 2024-02-08-video-title.txt

# Force Whisper API (better quality, costs ~$0.006/min)
transcribe-yt "https://youtu.be/abc123" --whisper

# German transcription
transcribe-yt "https://youtu.be/abc123" --language de

# With timestamps
transcribe-yt "https://youtu.be/abc123" --timestamps

# Quiet mode (pipe-friendly)
transcribe-yt "https://youtu.be/abc123" --quiet > transcript.txt
```

## Python API

```python
from transcribe import transcribe

result = transcribe(
    url="https://youtu.be/abc123",
    method="auto",      # 'auto', 'caption', or 'whisper'
    language="de",      # 'de', 'en', 'auto'
    timestamps=False,   # Include timestamps?
    output_dir="~/docs" # Where to save
)

if result['success']:
    print(result['text'])
    print(f"Method: {result['method']}")
    print(f"Words: {result['word_count']}")
    print(f"Saved: {result['filepath']}")
```

## Methods Explained

| Method | Speed | Cost | Quality | When to Use |
|--------|-------|------|---------|-------------|
| `caption` | ⚡ Instant | Free | Good | If video has captions |
| `whisper` | ~20s for 10min | $0.006/min | Excellent | For accuracy, no captions |
| `auto` | Mixed | Free → Paid | Best | **Default - recommended** |

## Pricing (Whisper API)

- **$0.006 per minute** of audio
- 10-minute video = **$0.06**
- 1-hour podcast = **$0.36**

Captions are always free.

## Error Messages

| Issue | Message | Solution |
|-------|---------|----------|
| No captions | "No captions available" | Use `--whisper` |
| Private video | "Video unavailable" | Can't transcribe private videos |
| No audio | "Failed to download audio" | Video may be silent |
| Invalid URL | "Could not extract video ID" | Check URL format |
| No API key | "OPENAI_API_KEY not set" | Export your key |

## Testing

Tested URLs for validation:

```bash
# Short (2-5 min) - Tutorial
transcribe-yt "https://youtu.be/dQw4w9WgXcQ"

# Medium (10-15 min) - Analysis
transcribe-yt "https://youtu.be/some-analysis-video"

# Long (30+ min) - Podcast
transcribe-yt "https://youtu.be/some-podcast"
```

## Requirements

- Python 3.8+
- `yt-dlp` (audio download)
- `youtube-transcript-api` (captions)
- `openai` Python package (Whisper API)
- OpenAI API key (for Whisper)

## File Structure

```
youtube-transcriber/
├── transcribe.py      # Main Python script
├── transcribe-yt      # Bash CLI wrapper
├── requirements.txt   # Python dependencies
└── README.md         # This file
```

## Integration with OpenClaw

Can be used as a direct tool:

```yaml
# In OpenClaw skills
transcribe_youtube:
  cmd: python3 /tools/youtube-transcriber/transcribe.py
  args: ["{url}", "--quiet"]
  output: text
```

## Troubleshooting

**yt-dlp not found**
```bash
brew install yt-dlp
```

**Python packages missing**
```bash
pip3 install youtube-transcript-api openai
```

**Slow downloads**
- Check internet connection
- Some videos throttle; this is normal

**Whisper fails but captions work**
- Check OPENAI_API_KEY is set
- Verify key has credits

## License

MIT - Use freely, built for Marcel 🦞
