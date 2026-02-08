#!/usr/bin/env python3
"""
YouTube Transcription Tool
A reliable transcription pipeline for YouTube videos.

Usage:
    python3 transcribe.py <youtube_url> [--method auto|caption|whisper] [--language de|en|auto]

Methods:
    auto     - Try captions first, fall back to Whisper (default)
    caption  - Only use captions
    whisper  - Only use Whisper API (downloads audio)

Environment:
    OPENAI_API_KEY - Required for Whisper transcription
"""

import argparse
import os
import re
import sys
import tempfile
from datetime import datetime
from pathlib import Path
from typing import Optional
from urllib.parse import urlparse, parse_qs

try:
    from youtube_transcript_api import YouTubeTranscriptApi
    from youtube_transcript_api._errors import TranscriptsDisabled, NoTranscriptFound
except ImportError:
    print("❌ Error: youtube-transcript-api not installed")
    print("   Run: pip3 install youtube-transcript-api")
    sys.exit(1)

try:
    import openai
except ImportError:
    print("❌ Error: openai not installed")
    print("   Run: pip3 install openai")
    sys.exit(1)


class Colors:
    """ANSI color codes for terminal output"""
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GRAY = '\033[90m'
    BOLD = '\033[1m'
    END = '\033[0m'


def log(message: str, color: str = "", prefix: str = ""):
    """Print a colored log message"""
    color_code = getattr(Colors, color.upper(), "")
    print(f"{color_code}{prefix}{message}{Colors.END}")


def extract_video_id(url: str) -> Optional[str]:
    """Extract YouTube video ID from various URL formats"""
    patterns = [
        r'(?:youtube\.com/watch\?v=|youtu\.be/|youtube\.com/embed/|youtube\.com/v/|youtube\.com/shorts/)([a-zA-Z0-9_-]{11})',
        r'^([a-zA-Z0-9_-]{11})$',  # Direct video ID
    ]
    
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    
    return None


def get_video_title(url: str) -> str:
    """Get video title using yt-dlp"""
    import subprocess
    try:
        result = subprocess.run(
            ['yt-dlp', '--print', 'title', '--no-warnings', url],
            capture_output=True,
            text=True,
            timeout=30
        )
        if result.returncode == 0:
            return result.stdout.strip()
    except Exception:
        pass
    return "unknown-video"


def sanitize_filename(title: str) -> str:
    """Create a safe filename from video title"""
    # Remove invalid characters
    safe = re.sub(r'[<>:"/\\|?*]', '', title)
    # Replace spaces and multiple underscores
    safe = re.sub(r'\s+', '_', safe)
    safe = re.sub(r'_+', '_', safe)
    # Limit length
    safe = safe[:80].strip('_')
    return safe or "video"


def format_timestamp(seconds: float) -> str:
    """Format seconds as HH:MM:SS or MM:SS"""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    
    if hours > 0:
        return f"{hours}:{minutes:02d}:{secs:02d}"
    return f"{minutes:02d}:{secs:02d}"


def get_captions(video_id: str, language: str = "auto") -> Optional[list]:
    """Try to fetch captions for the video"""
    try:
        transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
        
        # Try requested language first
        if language != "auto":
            try:
                transcript = transcript_list.find_transcript([language])
                return transcript.fetch()
            except NoTranscriptFound:
                pass
        
        # Try English and German (Marcel's preferred languages)
        for lang in ['en', 'de']:
            try:
                transcript = transcript_list.find_transcript([lang])
                return transcript.fetch()
            except NoTranscriptFound:
                continue
        
        # Fall back to any available transcript
        try:
            transcript = transcript_list.find_transcript([])
            return transcript.fetch()
        except:
            return None
            
    except TranscriptsDisabled:
        return None
    except Exception as e:
        log(f"Caption error: {e}", "gray")
        return None


def download_audio(url: str, output_path: str) -> bool:
    """Download audio from YouTube video using yt-dlp"""
    import subprocess
    
    log("📥 Downloading audio...", "cyan")
    
    try:
        cmd = [
            'yt-dlp',
            '-f', 'bestaudio[ext=m4a]/bestaudio/best',
            '--extract-audio',
            '--audio-format', 'mp3',
            '--audio-quality', '0',
            '-o', output_path,
            '--no-warnings',
            '--progress',
            '--newline',
            url
        ]
        
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=120
        )
        
        if result.returncode == 0:
            log("✓ Audio downloaded", "green")
            return True
        else:
            log(f"❌ Download failed: {result.stderr}", "red")
            return False
            
    except subprocess.TimeoutExpired:
        log("❌ Download timed out", "red")
        return False
    except FileNotFoundError:
        log("❌ yt-dlp not found. Install with: brew install yt-dlp", "red")
        return False
    except Exception as e:
        log(f"❌ Download error: {e}", "red")
        return False


def transcribe_with_whisper(audio_path: str, language: str = "auto") -> Optional[str]:
    """Transcribe audio using OpenAI Whisper API"""
    
    api_key = os.environ.get('OPENAI_API_KEY')
    if not api_key:
        log("❌ OPENAI_API_KEY not set", "red")
        log("   Get one at: https://platform.openai.com/api-keys", "gray")
        return None
    
    client = openai.OpenAI(api_key=api_key)
    
    log("🎯 Sending to Whisper API...", "cyan")
    
    try:
        with open(audio_path, 'rb') as audio_file:
            kwargs = {
                'model': 'whisper-1',
                'file': audio_file,
                'response_format': 'text'
            }
            if language != "auto":
                kwargs['language'] = language
            
            response = client.audio.transcriptions.create(**kwargs)
            
        log("✓ Transcription complete", "green")
        return response
        
    except openai.AuthenticationError:
        log("❌ Invalid OpenAI API key", "red")
        return None
    except openai.RateLimitError:
        log("❌ OpenAI rate limit exceeded", "red")
        return None
    except Exception as e:
        log(f"❌ Whisper error: {e}", "red")
        return None


def process_captions(captions: list, include_timestamps: bool = False) -> str:
    """Convert caption segments to formatted text"""
    if not captions:
        return ""
    
    lines = []
    current_paragraph = []
    last_end = 0
    
    for segment in captions:
        text = segment['text'].strip()
        start = segment['start']
        
        # Start new paragraph if gap > 2 seconds
        if start - last_end > 2 and current_paragraph:
            if include_timestamps:
                lines.append(f"[{format_timestamp(last_end)}]")
            lines.append(' '.join(current_paragraph))
            lines.append('')
            current_paragraph = []
        
        if include_timestamps and not current_paragraph:
            lines.append(f"[{format_timestamp(start)}] {text}")
        else:
            current_paragraph.append(text)
        
        last_end = start + segment.get('duration', 0)
    
    # Add final paragraph
    if current_paragraph:
        if include_timestamps:
            lines.append(f"[{format_timestamp(last_end)}]")
        lines.append(' '.join(current_paragraph))
    
    return '\n'.join(lines)


def count_words(text: str) -> int:
    """Count words in text"""
    return len(text.split())


def save_transcript(text: str, video_title: str, output_dir: Optional[str] = None) -> str:
    """Save transcript to file with formatted name"""
    date_str = datetime.now().strftime('%Y-%m-%d')
    safe_title = sanitize_filename(video_title)
    filename = f"{date_str}-{safe_title}.txt"
    
    if output_dir:
        filepath = Path(output_dir) / filename
    else:
        filepath = Path.cwd() / filename
    
    filepath.write_text(text, encoding='utf-8')
    return str(filepath)


def transcribe(url: str, method: str = "auto", language: str = "auto", 
               timestamps: bool = False, output_dir: Optional[str] = None) -> dict:
    """
    Main transcription function
    
    Returns dict with:
        - success: bool
        - text: transcript text
        - method: 'caption' or 'whisper'
        - word_count: int
        - filepath: saved file path (if saved)
        - error: error message (if failed)
    """
    
    # Extract video ID
    video_id = extract_video_id(url)
    if not video_id:
        return {'success': False, 'error': 'Could not extract video ID from URL'}
    
    log(f"🎬 Video ID: {video_id}", "blue")
    
    # Get video title
    video_title = get_video_title(url)
    log(f"📹 Title: {video_title}", "blue")
    
    result = {
        'success': False,
        'text': '',
        'method': '',
        'word_count': 0,
        'video_title': video_title
    }
    
    # Try captions first if auto or caption method
    if method in ('auto', 'caption'):
        log("🔍 Checking for captions...", "cyan")
        captions = get_captions(video_id, language)
        
        if captions:
            log("✓ Captions found!", "green")
            text = process_captions(captions, timestamps)
            result.update({
                'success': True,
                'text': text,
                'method': 'caption',
                'word_count': count_words(text)
            })
            
            # Save to file
            filepath = save_transcript(text, video_title, output_dir)
            result['filepath'] = filepath
            
            return result
        else:
            log("✗ No captions available", "yellow")
    
    # Fall back to Whisper if auto or whisper method
    if method in ('auto', 'whisper'):
        if method == 'caption':
            return {'success': False, 'error': 'Captions not available and whisper not allowed'}
        
        log("🔄 Falling back to Whisper API...", "cyan")
        
        # Create temp file for audio
        with tempfile.NamedTemporaryFile(suffix='.mp3', delete=False) as tmp:
            tmp_path = tmp.name
        
        try:
            if not download_audio(url, tmp_path):
                return {'success': False, 'error': 'Failed to download audio'}
            
            text = transcribe_with_whisper(tmp_path, language)
            
            if text:
                result.update({
                    'success': True,
                    'text': text,
                    'method': 'whisper',
                    'word_count': count_words(text)
                })
                
                # Save to file
                filepath = save_transcript(text, video_title, output_dir)
                result['filepath'] = filepath
            else:
                result['error'] = 'Whisper transcription failed'
                
        finally:
            # Cleanup temp file
            try:
                os.unlink(tmp_path)
            except:
                pass
    
    return result


def main():
    parser = argparse.ArgumentParser(
        description='Transcribe YouTube videos using captions or Whisper API',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python3 transcribe.py "https://youtu.be/..."
  python3 transcribe.py "URL" --method whisper --language de
  python3 transcribe.py "URL" --timestamps --output ~/transcripts
        """
    )
    
    parser.add_argument('url', help='YouTube video URL')
    parser.add_argument('--method', choices=['auto', 'caption', 'whisper'], 
                       default='auto', help='Transcription method (default: auto)')
    parser.add_argument('--language', default='auto',
                       help='Language code (de, en, etc.) or auto')
    parser.add_argument('--timestamps', '-t', action='store_true',
                       help='Include timestamps in output')
    parser.add_argument('--output', '-o', help='Output directory for transcript file')
    parser.add_argument('--no-save', action='store_true',
                       help='Print to stdout only, don\'t save file')
    parser.add_argument('--quiet', '-q', action='store_true',
                       help='Minimal output')
    
    args = parser.parse_args()
    
    if args.quiet:
        # Disable colors and progress messages
        global Colors
        for attr in dir(Colors):
            if not attr.startswith('_'):
                setattr(Colors, attr, '')
    
    result = transcribe(
        url=args.url,
        method=args.method,
        language=args.language,
        timestamps=args.timestamps,
        output_dir=args.output
    )
    
    if result['success']:
        if not args.quiet:
            log(f"\n✅ Transcription complete!", "green", Colors.BOLD)
            log(f"   Method: {result['method']}", "gray")
            log(f"   Words: {result['word_count']}", "gray")
            if not args.no_save:
                log(f"   Saved: {result['filepath']}", "gray")
            log("", "")
        
        print(result['text'])
        
        return 0
    else:
        log(f"\n❌ Failed: {result.get('error', 'Unknown error')}", "red")
        return 1


if __name__ == '__main__':
    sys.exit(main())
