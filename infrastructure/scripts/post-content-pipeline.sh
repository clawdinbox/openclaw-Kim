#!/bin/bash
# Content → Postiz Pipeline
# Combines image generation and posting with proper rate limiting

TOPIC="${1:-Fashion Industry Trends}"
HEADLINE="${2:-Market Pulse Daily Update}"
DATE="${3:-$(date +%Y-%m-%d)}"

echo "═══════════════════════════════════════════════════════════════"
echo "Content → Postiz Pipeline"
echo "═══════════════════════════════════════════════════════════════"
echo "Topic: $TOPIC"
echo "Headline: $HEADLINE"
echo "Date: $DATE"
echo ""

# 1. Generate Images
echo "🖼️  Step 1: Generating images..."
cd /Users/clawdmm/.openclaw/workspace/tools/image-sourcing
node daily-image-pipeline.js \
  --topic="$TOPIC" \
  --headline="$HEADLINE" \
  --date="$DATE" \
  --source=auto 2>&1 | tee /tmp/image-pipeline.log

if [ ${PIPESTATUS[0]} -ne 0 ]; then
  echo "❌ Image pipeline failed! Check /tmp/image-pipeline.log"
  exit 1
fi

echo ""
echo "✅ Images generated successfully"
echo ""

# 2. Verify images exist
IMAGE_DIR="/Users/clawdmm/.openclaw/workspace/documents/daily-posts/$DATE"
echo "🔍 Step 2: Verifying images in $IMAGE_DIR..."

if [ -d "$IMAGE_DIR" ]; then
  for platform in instagram linkedin x threads substack; do
    if [ -f "$IMAGE_DIR/$platform-01.jpg" ]; then
      echo "✅ $platform image found"
    else
      echo "⚠️  $platform image missing"
    fi
  done
else
  echo "❌ Image directory not found!"
  exit 1
fi

echo ""
echo "📊 Pipeline complete! Images ready for posting."
echo "Next: Run posting scripts for scheduled delivery"
echo "────────────────────────────────────────────────────────────────"
