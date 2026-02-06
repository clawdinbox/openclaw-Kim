# Token Usage Tracker — Week of Feb 6-13, 2026

Track actual spend vs predictions to find hidden cost drains.

## Daily Tracking

### Feb 6, 2026 (Thursday)

**Before optimizations:**
- Built-in heartbeat: Every 30min on Opus 4.6 → **disabled** at 16:52
- Sub-agents: OpenRouter Auto → GPT-5.2 Pro/Opus → **~$12.89 in 2 days**
- Main chat: Direct Opus 4.6 → **switched to Sonnet 4 via OpenRouter** at 16:54

**After optimizations:**
- Main chat: Sonnet 4 (OpenRouter) → $3/$15 vs $15/$75
- Built-in heartbeat: 24h interval (minimal)
- Proactive check: Gemini Flash cron every 2h
- Overnight coding: Opus 4.6 with caching enabled

**Expected costs going forward:**
- Main chat (Sonnet): ~$2-5/day
- Cron jobs (Flash/DeepSeek): ~$0.10/day 
- Proactive checks: ~$0.01/day
- Overnight coding (Opus): ~$3-8/day (with caching)
- **Total prediction: $5-13/day → $150-400/month**

---

### Feb 7, 2026 (Friday)

**Actual spend tracking starts tomorrow**

---

## Cost Centers to Monitor

| Source | Model | Prediction | Actual | Notes |
|--------|-------|------------|---------|-------|
| Main chat | Sonnet 4 | $2-5/day | TBD | Primary usage |
| Overnight coding | Opus 4.6 | $3-8/day | TBD | 40min sessions |
| Morning Brief | Gemini Flash | $0.01/day | TBD | 8:00 daily |
| Afternoon Deep-Dive | Gemini Flash | $0.02/day | TBD | 14:00 daily |
| LinkedIn Pipeline | Gemini Flash | $0.02/day | TBD | Mon/Wed/Fri |
| Newsletter Draft | Gemini Flash | $0.03/day | TBD | Thursdays |
| Daily Substack Note | DeepSeek V3 | $0.005/day | TBD | 11:00 daily |
| Weekly Digest | Gemini Flash | $0.04/week | TBD | Sundays |
| Proactive Check-In | Gemini Flash | $0.01/day | TBD | Every 2h |
| Sub-agents | Gemini Flash | $0.10-1/call | TBD | As needed |

**Red flags to watch for:**
- Hidden heartbeat costs (should be ~$0 after fix)
- Sub-agent model selection (manually specify to avoid Auto)
- Opus usage creep (main chat switching back)
- Long context sessions (memory bloat)

## Weekly Summary

Will update with actual vs predicted costs each Friday.

## Token Usage Insights

*To be filled with patterns discovered during tracking week*