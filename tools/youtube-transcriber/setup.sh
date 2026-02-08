#!/bin/bash
# setup.sh - Install dependencies for YouTube Transcriber

set -e

echo "🎬 YouTube Transcriber Setup"
echo "=============================="
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ python3 not found. Please install Python 3.8+"
    exit 1
fi
echo "✓ python3 found"

# Check pip
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 not found. Please install pip"
    exit 1
fi
echo "✓ pip3 found"

# Install Python packages
echo ""
echo "📦 Installing Python packages..."
pip3 install -r requirements.txt

# Check yt-dlp
if ! command -v yt-dlp &> /dev/null; then
    echo ""
    echo "⚠️  yt-dlp not found"
    if command -v brew &> /dev/null; then
        echo "   Installing with Homebrew..."
        brew install yt-dlp
    else
        echo "   Please install yt-dlp manually:"
        echo "   https://github.com/yt-dlp/yt-dlp#installation"
        exit 1
    fi
else
    echo "✓ yt-dlp found"
fi

# Check ffmpeg (recommended for audio)
if ! command -v ffmpeg &> /dev/null; then
    echo "⚠️  ffmpeg not found (optional but recommended)"
    if command -v brew &> /dev/null; then
        echo "   Install with: brew install ffmpeg"
    fi
else
    echo "✓ ffmpeg found"
fi

# Check OpenAI API key
echo ""
if [ -z "$OPENAI_API_KEY" ]; then
    echo "⚠️  OPENAI_API_KEY not set"
    echo "   For Whisper fallback, set your key:"
    echo "   export OPENAI_API_KEY='sk-...'"
    echo "   Get one at: https://platform.openai.com/api-keys"
else
    echo "✓ OPENAI_API_KEY is set"
fi

# Make scripts executable
echo ""
echo "🔧 Setting permissions..."
chmod +x transcribe.py transcribe-yt

# Test import
echo ""
echo "🧪 Testing imports..."
python3 -c "from youtube_transcript_api import YouTubeTranscriptApi; print('✓ youtube-transcript-api OK')"
python3 -c "import openai; print('✓ openai OK')"

echo ""
echo "✅ Setup complete!"
echo ""
echo "Quick test:"
echo "  ./transcribe-yt 'https://youtu.be/dQw4w9WgXcQ' --quiet"
echo ""
