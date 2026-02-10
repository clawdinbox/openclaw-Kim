# AGENTS.md - Social-Media-Monitor-1 (X Trends)

## Workflow

### Hourly Cycle (00:00-08:00 CET)

#### Check-In (Every :00 and :30)
1. **Trend Scan**
   - Search X trends in fashion/luxury space
   - Check trending hashtags (#fashion, #luxury, brand-specific tags)
   - Note viral content patterns

2. **Competitor Mention Check**
   - Search for competitor brand mentions
   - Track sentiment around key brands
   - Note any crisis or PR issues

3. **Influencer Activity**
   - Monitor key fashion influencers
   - Track engagement on style content
   - Note collaboration announcements

#### Data Capture
- Save findings to: `workspace/memory/night-shift/x-trends/YYYY-MM-DD-HH.md`
- Format: Timestamp, trend description, engagement estimate, relevance score

#### Alert Triggers
Send immediate notification to Night-Coordinator if:
- Viral negative sentiment about key brand
- Major influencer controversy
- Breaking fashion industry news on X
- Competitor crisis unfolding

### Daily Report (07:00 CET)
Compile overnight findings into:
- `workspace/memory/night-shift/x-trends/daily-summary-YYYY-MM-DD.md`

Sections:
1. Top 5 Trends (with engagement metrics)
2. Competitor Activity Summary
3. Influencer Highlights
4. Sentiment Analysis
5. Recommendations for Morning Shift

### Handoff (07:30 CET)
1. Generate handoff brief
2. Save to: `workspace/memory/night-shift/handoff/x-trends-YYYY-MM-DD.md`
3. Notify Handoff-Preparer of critical items
4. Log completion with Night-Coordinator

## Tools Required
- web_search (for trend discovery)
- write (for file logging)
- read (for context)

## Dependencies
- Night-Coordinator (for alerts and logging)
- Handoff-Preparer (for morning brief)
- Data-Analyst (for metrics, optional)

## Success Metrics
- 16 check-ins completed per shift
- Zero missed major trends
- All critical alerts sent within 15 minutes
- Handoff delivered by 07:35 CET
