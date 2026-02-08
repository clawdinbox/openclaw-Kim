#!/bin/bash
# System Health Monitor for Night Shift
# Run every hour to check all systems

LOG_FILE="/Users/clawdmm/.openclaw/workspace/infrastructure/logs/system-health-$(date +%Y-%m-%d-%H00).log"
REPORT_FILE="/Users/clawdmm/.openclaw/workspace/infrastructure/reports/system-status-$(date +%Y-%m-%d-%H00).md"

echo "═══════════════════════════════════════════════════════════" >> "$LOG_FILE"
echo "System Health Check - $(date '+%Y-%m-%d %H:%M:%S %Z')" >> "$LOG_FILE"
echo "═══════════════════════════════════════════════════════════" >> "$LOG_FILE"

# 1. Check Mission Control Dashboard
echo "
🔷 Checking Mission Control Dashboard..." >> "$LOG_FILE"
MC_PID=$(pgrep -f "next-server" | head -1)
if [ -n "$MC_PID" ]; then
  echo "✅ Mission Control running (PID: $MC_PID)" >> "$LOG_FILE"
  MC_STATUS="RUNNING"
else
  echo "❌ Mission Control NOT RUNNING - RESTART NEEDED" >> "$LOG_FILE"
  MC_STATUS="DOWN"
  # Auto-restart
  cd /Users/clawdmm/.openclaw/workspace/mission-control && npm run dev > /dev/null 2>&1 &
  echo "🔄 Auto-restart initiated" >> "$LOG_FILE"
fi

# 2. Check Convex Backend
echo "
🔷 Checking Convex Backend..." >> "$LOG_FILE"
CONVEX_PID=$(pgrep -f "convex dev" | head -1)
if [ -n "$CONVEX_PID" ]; then
  echo "✅ Convex Backend running (PID: $CONVEX_PID)" >> "$LOG_FILE"
  CONVEX_STATUS="RUNNING"
else
  echo "❌ Convex Backend NOT RUNNING - RESTART NEEDED" >> "$LOG_FILE"
  CONVEX_STATUS="DOWN"
  # Auto-restart
  cd /Users/clawdmm/.openclaw/workspace/mission-control && npx convex dev > /dev/null 2>&1 &
  echo "🔄 Auto-restart initiated" >> "$LOG_FILE"
fi

# 3. Check Node.js Processes
echo "
🔷 Checking Node.js Processes..." >> "$LOG_FILE"
NODE_COUNT=$(pgrep -c "^node$")
echo "ℹ️  Active Node processes: $NODE_COUNT" >> "$LOG_FILE"

# 4. Check Image Pipeline
echo "
🔷 Checking Image Sourcing Pipeline..." >> "$LOG_FILE"
PIPELINE_DIR="/Users/clawdmm/.openclaw/workspace/tools/image-sourcing"
if [ -f "$PIPELINE_DIR/daily-image-pipeline.js" ]; then
  echo "✅ Pipeline script present" >> "$LOG_FILE"
  PIPELINE_STATUS="OK"
else
  echo "❌ Pipeline script missing!" >> "$LOG_FILE"
  PIPELINE_STATUS="ERROR"
fi

# 5. Check Today's Images
echo "
🔷 Checking Today's Images..." >> "$LOG_FILE"
TODAY=$(date +%Y-%m-%d)
IMAGE_DIR="/Users/clawdmm/.openclaw/workspace/documents/daily-posts/$TODAY"
if [ -d "$IMAGE_DIR" ]; then
  IMAGE_COUNT=$(ls -1 "$IMAGE_DIR"/*.jpg 2>/dev/null | wc -l)
  echo "✅ Found $IMAGE_COUNT images for $TODAY" >> "$LOG_FILE"
  IMAGES_STATUS="$IMAGE_COUNT images"
else
  echo "⚠️  No images directory for $TODAY" >> "$LOG_FILE"
  IMAGES_STATUS="NO IMAGES"
fi

# 6. Check Postiz API Config
echo "
🔷 Checking Postiz Configuration..." >> "$LOG_FILE"
if [ -f "/Users/clawdmm/.openclaw/workspace/.env.postiz" ]; then
  echo "✅ Postiz config exists" >> "$LOG_FILE"
  # Count API keys
  KEY_COUNT=$(grep -c "^[A-Z_]*=" /Users/clawdmm/.openclaw/workspace/.env.postiz)
  echo "ℹ️  Found $KEY_COUNT API keys" >> "$LOG_FILE"
  POSTIZ_STATUS="CONFIGURED ($KEY_COUNT keys)"
else
  echo "❌ Postiz config missing!" >> "$LOG_FILE"
  POSTIZ_STATUS="MISSING"
fi

# Generate Markdown Report
mkdir -p /Users/clawdmm/.openclaw/workspace/infrastructure/reports
cat > "$REPORT_FILE" <<EOF
# System Status Report

**Generated:** $(date '+%Y-%m-%d %H:%M:%S %Z')  
**Shift:** Night Shift — Integration & Tooling Engineer

## System Summary

| System | Status |
|--------|--------|
| Mission Control Dashboard | $MC_STATUS |
| Convex Backend | $CONVEX_STATUS |
| Image Sourcing Pipeline | $PIPELINE_STATUS |
| Today's Images | $IMAGES_STATUS |
| Postiz API | $POSTIZ_STATUS |

## Critical Items

EOF

if [ "$MC_STATUS" = "DOWN" ] || [ "$CONVEX_STATUS" = "DOWN" ]; then
  echo "⚠️ **System restart required** — Action taken automatically" >> "$REPORT_FILE"
else
  echo "✅ All systems operational" >> "$REPORT_FILE"
fi

echo "" >> "$REPORT_FILE"
echo "## Log File" >> "$REPORT_FILE"
echo "📄 $LOG_FILE" >> "$REPORT_FILE"

echo "
═══════════════════════════════════════════════════════════" >> "$LOG_FILE"
echo "Check complete - $(date '+%H:%M:%S')" >> "$LOG_FILE"

# Link latest report
ln -sf "$REPORT_FILE" /Users/clawdmm/.openclaw/workspace/infrastructure/LATEST-STATUS.md

echo "Report saved to: $REPORT_FILE"
