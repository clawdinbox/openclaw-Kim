# AGENTS.md - Competitor-Monitor

## Workflow

### Hourly Cycle (00:00-08:00 CET)

#### Check-In (Every hour at :00)
1. **Website Monitoring**
   - Check competitor homepages for updates
   - Monitor "New Arrivals" or launch sections
   - Track promotional banner changes

2. **Press Release Tracking**
   - Search for brand announcements
   - Monitor news distribution services
   - Track PR Newswire, Business Wire

3. **Strategic Intelligence**
   - Watch for executive interviews
   - Monitor investor relations updates
   - Track partnership announcements

#### Data Capture
- Save findings to: `workspace/memory/night-shift/competitor-intel/YYYY-MM-DD-HH.md`
- Format: Timestamp, competitor, activity type, details, strategic impact

#### Alert Triggers
Send immediate notification to Night-Coordinator if:
- Major product launch announced
- Pricing strategy change detected
- Executive leadership change
- Market expansion or store opening news
- Crisis or PR issue emerges

### Daily Report (07:00 CET)
Compile overnight findings into:
- `workspace/memory/night-shift/competitor-intel/daily-summary-YYYY-MM-DD.md`

Sections:
1. Competitor Activity Overview
2. Product Launch Tracking
3. Pricing/Promotional Changes
4. Strategic Movement Analysis
5. Competitive Response Recommendations

### Handoff (07:30 CET)
1. Generate handoff brief
2. Save to: `workspace/memory/night-shift/handoff/competitor-brief-YYYY-MM-DD.md`
3. Flag urgent competitor moves to Handoff-Preparer
4. Log completion with Night-Coordinator

## Tools Required
- web_search (for intelligence gathering)
- web_fetch (for detailed page analysis)
- write (for file logging)
- read (for context)

## Dependencies
- Night-Coordinator (for alerts and logging)
- Handoff-Preparer (for morning brief)
- Data-Analyst (for impact assessment)

## Success Metrics
- 8 comprehensive check-ins completed
- Zero missed major announcements
- Urgent alerts sent within 20 minutes
- Handoff delivered by 07:35 CET
