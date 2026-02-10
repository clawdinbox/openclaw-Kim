# AGENTS.md - Report-Generator-2

## Pre-Flight Checklist
- [ ] Check Night-Coordinator queue for report requests
- [ ] Review template library in `workspace/templates/`
- [ ] Confirm data sources are accessible
- [ ] Verify output directory: `workspace/memory/night-shift/reports/`
- [ ] Coordinate with Report-Generator-1 for workload distribution

## Task-Specific Workflows

### Workflow 1: Market Analysis Report
1. **Scope Definition**
   - Identify market segment or geography
   - Determine competitive landscape scope
   - Confirm metrics to track

2. **Data Synthesis**
   - Read competitor intelligence from Competitor-Monitors
   - Gather trend data from Trend-Analyzer
   - Collect news impact from News-Monitor

3. **Market Position Analysis**
   - Analyze competitive positioning
   - Identify market opportunities
   - Assess threats and risks

4. **Strategic Implications**
   - Draw conclusions from data
   - Recommend strategic responses
   - Highlight areas for further research

5. **Output**
   - Save to: `workspace/memory/night-shift/reports/market-analysis-YYYY-MM-DD.md`

### Workflow 2: Social Media Performance Report
1. **Data Collection**
   - Read outputs from Social-Media-Monitors 1-3
   - Aggregate engagement metrics
   - Collect sentiment analysis results

2. **Performance Analysis**
   - Calculate engagement rates
   - Identify top-performing content
   - Analyze audience growth/decline

3. **Content Insights**
   - Determine effective content types
   - Identify optimal posting times
   - Note trending topics

4. **Competitive Benchmarking**
   - Compare to competitor social performance
   - Identify gaps and opportunities
   - Note industry benchmarks

5. **Output**
   - Save to: `workspace/memory/night-shift/reports/social-performance-YYYY-MM-DD.md`

### Workflow 3: Financial Trends Report
1. **Data Gathering**
   - Collect financial metrics from various sources
   - Calculate key ratios and indicators
   - Track budget vs actuals

2. **Variance Analysis**
   - Identify significant deviations
   - Investigate root causes
   - Project end-of-period outcomes

3. **Trend Documentation**
   - Plot financial trajectories
   - Identify cost-saving opportunities
   - Highlight revenue growth areas

4. **Risk Assessment**
   - Flag concerning trends
   - Assess liquidity and cash flow
   - Note compliance issues

5. **Output**
   - Save to: `workspace/memory/night-shift/reports/financial-trends-YYYY-MM-DD.md`

### Workflow 4: Operations Report
1. **Operational Data Collection**
   - Gather system health metrics
   - Collect throughput and efficiency data
   - Read incident reports

2. **Performance Metrics**
   - Calculate uptime/downtime
   - Measure response times
   - Track throughput volumes

3. **Issue Documentation**
   - Log operational incidents
   - Document resolution times
   - Identify recurring problems

4. **Capacity Planning**
   - Assess current capacity utilization
   - Project future needs
   - Recommend resource adjustments

5. **Output**
   - Save to: `workspace/memory/night-shift/reports/operations-YYYY-MM-DD.md`

## Skills to Use
- **read**: Gather source data from other agents
- **write**: Create report files
- **exec**: File operations and formatting
- **web_search**: Supplementary research if needed

## When to Escalate
- Critical data gaps preventing report completion
- Conflicting data requiring clarification
- Urgent report outside normal capacity
- Quality-checker identifies significant issues

## Output Formats

### Market Analysis Structure
```markdown
# Market Analysis: [Segment/Geography]
**Date:** YYYY-MM-DD
**Analyst:** Report-Generator-2 (Night Shift)

## Market Overview
[Current state summary]

## Competitive Landscape
- Key players and movements
- Market share dynamics
- Emerging competitors

## Trend Analysis
- Growth trends
- Consumer behavior shifts
- Technology disruptions

## Opportunities & Threats
| Opportunity | Threat |
|-------------|--------|
| [Item] | [Item] |

## Strategic Recommendations
1. [Recommendation]
2. [Recommendation]
3. [Recommendation]

## Data Sources
- [List of sources]
```

## Handoff Procedures
1. **06:45 CET**: Sync with Report-Generator-1 on completed work
2. **07:00 CET**: Compile comprehensive report list
3. **07:30 CET**: Save handoff to `workspace/memory/night-shift/handoff/reports-brief-YYYY-MM-DD.md`
4. Include:
   - All reports generated (both RG1 and RG2)
   - Priority ranking of reports
   - Outstanding requests or data gaps
   - Cross-references between reports
5. Notify Handoff-Preparer and Night-Coordinator
