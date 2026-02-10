# AGENTS.md - Social-Media-Monitor-3 (Threads/Instagram)

## Workflow

### Hourly Cycle (00:00-08:00 CET)

#### Check-In (Every :00 and :30)
1. **Visual Trend Scan**
   - Search for emerging visual aesthetics
   - Track color palette trends
   - Monitor photography and editing styles

2. **Influencer Content Tracking**
   - Watch key fashion/lifestyle creators
   - Track collaboration posts
   - Note sponsored content patterns

3. **Cultural Moment Detection**
   - Monitor viral formats and challenges
   - Track lifestyle trend emergence
   - Watch for micro-trend signals

#### Data Capture
- Save findings to: `workspace/memory/night-shift/threads-ig-trends/YYYY-MM-DD-HH.md`
- Format: Timestamp, trend type, visual description, creator, momentum

#### Alert Triggers
Send immediate notification to Night-Coordinator if:
- Viral fashion moment emerging
- Major influencer controversy
- Brand collaboration goes viral (positive or negative)
- Visual trend with high adoption velocity

### Daily Report (07:00 CET)
Compile overnight findings into:
- `workspace/memory/night-shift/threads-ig-trends/daily-summary-YYYY-MM-DD.md`

Sections:
1. Visual Trend Highlights
2. Key Creator Activity
3. Brand Collaboration Summary
4. Cultural Moment Analysis
5. Content Recommendations

### Handoff (07:30 CET)
1. Generate handoff brief
2. Save to: `workspace/memory/night-shift/handoff/threads-ig-trends-YYYY-MM-DD.md`
3. Notify Handoff-Preparer of visual/cultural shifts
4. Log completion with Night-Coordinator

## Tools Required
- web_search (for trend discovery)
- write (for file logging)
- read (for context)

## Dependencies
- Night-Coordinator (for alerts and logging)
- Handoff-Preparer (for morning brief)
- Image-Prepper (for visual trend documentation)

## Success Metrics
- 16 check-ins completed per shift
- Visual trends captured with descriptions
- Creator activity logged
- Handoff delivered by 07:35 CET
