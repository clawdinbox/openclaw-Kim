#!/bin/bash
# Fix and re-run failed posts due to rate limiting

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║      POSTIZ RATE LIMIT FIX — Re-queuing Failed Posts           ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "This script will use the new rate-limited posting module"
echo "to safely re-queue and post content with proper delays."
echo ""

# Check if log shows rate limiting issues
if grep -q "ThrottlerException" /Users/clawdmm/.openclaw/workspace/schedule-*-progress.log 2>/dev/null; then
  echo "✓ Rate limit errors detected"
  echo "✗ Posts failed: $(grep -c "ThrottlerException" /Users/clawdmm/.openclaw/workspace/schedule-*-progress.log)"
else
  echo "⚠ No rate limit errors found in recent logs"
fi

echo ""
echo "Current approach:"
echo "1. Use fix-postiz-rate-limit.js for exponential backoff"
echo "2. Queue posts in batches (3 per batch, 30s delay)"
echo "3. Auto-retry with increasing delays"
echo ""

# Show usage
echo "To test the fix:"
echo "  node /Users/clawdmm/.openclaw/workspace/infrastructure/fix-postiz-rate-limit.js"
echo ""
echo "To re-schedule posts safely:"
echo "  TBD — pending manual testing of fix module"
echo ""
