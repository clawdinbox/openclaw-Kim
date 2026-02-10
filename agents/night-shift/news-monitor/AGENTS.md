# AGENTS.md - News-Monitor

## Workflow

### Hourly Cycle (00:00-08:00 CET)

#### Check-In (Every :00 and :45)
1. **Trade Publication Scan**
   - Search WWD, Business of Fashion, Vogue Business
   - Monitor for breaking fashion industry news
   - Track market analysis pieces

2. **Financial News Monitoring**
   - Search Reuters, Bloomberg for luxury sector
   - Monitor stock movements and earnings
   - Track economic indicators

3. **Cultural Trend Watching**
   - Monitor lifestyle publications
   - Track cultural moment emergence
   - Watch for trend forecast reports

#### Data Capture
- Save findings to: `workspace/memory/night-shift/news-digest/YYYY-MM-DD-HH.md`
- Format: Timestamp, source, headline, category, relevance score

#### Alert Triggers
Send immediate notification to Night-Coordinator if:
- Breaking industry news
- Market-moving announcement
- Regulatory change announcement
- Major cultural event affecting brand
- Economic indicator shift

### Morning News Sweep (06:00-07:30 CET)
- Comprehensive scan of overnight news
- Asia market closing reports
- Early Europe market indicators
- Compile comprehensive digest

### Daily Report (07:00 CET)
Compile overnight findings into:
- `workspace/memory/night-shift/news-digest/daily-summary-YYYY-MM-DD.md`

Sections:
1. Breaking News Summary
2. Market & Financial Updates
3. Trade Publication Highlights
4. Cultural Trend Indicators
5. News Impact Assessment

### Handoff (07:30 CET)
1. Generate handoff brief
2. Save to: `workspace/memory/night-shift/handoff/news-brief-YYYY-MM-DD.md`
3. Highlight breaking news to Handoff-Preparer
4. Log completion with Night-Coordinator

## Tools Required
- web_search (for news discovery)
- web_fetch (for article details)
- write (for file logging)
- read (for context)

## Dependencies
- Night-Coordinator (for alerts and logging)
- Handoff-Preparer (for morning brief)

## Success Metrics
- 11 check-ins completed per shift
- All breaking news captured
- News digest delivered by 07:00 CET
- Handoff delivered by 07:35 CET
