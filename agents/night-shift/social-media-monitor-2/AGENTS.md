# AGENTS.md - Social-Media-Monitor-2 (LinkedIn Trends)

## Workflow

### Hourly Cycle (00:00-08:00 CET)

#### Check-In (Every :00 and :45)
1. **B2B Trend Scan**
   - Search LinkedIn for fashion/luxury business trends
   - Check trending industry hashtags
   - Monitor professional conversation topics

2. **Company Page Monitoring**
   - Track competitor company updates
   - Watch for product/brand announcements
   - Note executive posts and thought leadership

3. **Industry Insight Gathering**
   - Monitor trade publication posts
   - Track analyst and consultant content
   - Note market commentary

#### Data Capture
- Save findings to: `workspace/memory/night-shift/linkedin-trends/YYYY-MM-DD-HH.md`
- Format: Timestamp, topic, source type, relevance, action needed

#### Alert Triggers
Send immediate notification to Night-Coordinator if:
- Major competitor announces strategic initiative
- Executive departure/hiring news
- Industry-wide supply chain or market alerts
- Regulatory changes affecting business

### Daily Report (07:00 CET)
Compile overnight findings into:
- `workspace/memory/night-shift/linkedin-trends/daily-summary-YYYY-MM-DD.md`

Sections:
1. Top Business Topics
2. Competitor Corporate Activity
3. Executive Movement Summary
4. Market Signal Analysis
5. B2B Recommendations

### Handoff (07:30 CET)
1. Generate handoff brief
2. Save to: `workspace/memory/night-shift/handoff/linkedin-trends-YYYY-MM-DD.md`
3. Notify Handoff-Preparer of B2B developments
4. Log completion with Night-Coordinator

## Tools Required
- web_search (for B2B trend discovery)
- write (for file logging)
- read (for context)

## Dependencies
- Night-Coordinator (for alerts and logging)
- Handoff-Preparer (for morning brief)

## Success Metrics
- 11 check-ins completed per shift
- All major competitor updates captured
- Executive movement alerts sent within 30 minutes
- Handoff delivered by 07:35 CET
