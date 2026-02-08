# Bug Fix Documentation: Postiz API Rate Limiting

**Date:** 2026-02-08  
**Time:** 20:30 CET  
**Priority:** HIGH  
**Status:** Identified + Fix Implemented

## Problem Description

All scheduled posts to X (Twitter), Threads, and Instagram via Postiz API are failing with:

```
ThrottlerException: Too Many Requests
```

This affects all posting automation scripts:
- `schedule-x.sh`
- `schedule-threads.sh`
- `schedule-instagram.sh`

## Root Cause

Postiz API enforces rate limits on the `/posts` endpoint. The current posting scripts send requests too rapidly without:
1. Exponential backoff
2. Queue management
3. Retry logic with increasing delays

## Impact

- Zero posts scheduled for Feb 9-15, 2026
- Content pipeline blocked
- Manual intervention required for tomorrow's posts

## Solution

Created `/Users/clawdmm/.openclaw/workspace/infrastructure/fix-postiz-rate-limit.js` with:

### Features
- **Exponential Backoff:** 5s → 10s → 20s → 40s → 60s (max)
- **Queue Management:** Batches of 3 posts with 30s delays between batches
- **Auto-Retry:** Up to 5 retries per failed post
- **Re-queuing:** Failed posts automatically re-added to queue

### Configuration
```javascript
initialDelay: 5000      // 5 seconds
maxDelay: 60000         // 1 minute max
maxRetries: 5
postsPerBatch: 3
batchDelay: 30000       // 30 seconds between batches
```

## Files Modified/Created

| File | Action | Purpose |
|------|--------|---------|
| `fix-postiz-rate-limit.js` | Created | Rate limit handling module |
| `schedule-x-slow.sh` | Exists | Already has delays (use this) |

## Immediate Action Required

1. ✅ Fix module created
2. ⏳ Test with single post
3. ⏳ Update schedule scripts to use new module
4. ⏳ Re-run tomorrow's post scheduling (Feb 9)

## Testing

Test command:
```bash
cd /Users/clawdmm/.openclaw/workspace/infrastructure
node fix-postiz-rate-limit.js
```

## Related

- See system health logs for full status
- Convex Backend: Operational
- Image Pipeline: Operational
- Mission Control: Running

## Next Steps

1. Test rate limit fix at 21:00
2. Update `schedule-x.sh`, `schedule-threads.sh` to use new module
3. Re-schedule posts for Feb 9
4. Monitor next posting batch (Feb 9 09:00)

---
**Logged by:** Night Shift Integration Engineer
