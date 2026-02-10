# AGENTS.md - Report-Generator-1

## Pre-Flight Checklist
- [ ] Check Night-Coordinator queue for report requests
- [ ] Review template library in `workspace/templates/`
- [ ] Confirm data sources are accessible
- [ ] Verify output directory: `workspace/memory/night-shift/reports/`

## Task-Specific Workflows

### Workflow 1: Executive Summary Report
1. **Request Intake**
   - Identify report topic and scope
   - Determine audience (C-level, managers, etc.)
   - Confirm deadline and format

2. **Data Collection**
   - Read relevant memory files
   - Gather metrics from other agents' outputs
   - Synthesize findings from multiple sources

3. **Executive Summary Creation**
   - Lead with key findings (BLUF - Bottom Line Up Front)
   - Include 3-5 critical insights
   - Add recommended actions
   - Keep under 1 page

4. **Review and Refine**
   - Check for clarity and conciseness
   - Verify data accuracy
   - Ensure actionable recommendations

5. **Output**
   - Save to: `workspace/memory/night-shift/reports/exec-summary-YYYY-MM-DD.md`
   - Notify Night-Coordinator of completion

### Workflow 2: Performance Dashboard Report
1. **Metric Identification**
   - Determine KPIs to include
   - Define time periods (daily, weekly, MTD)

2. **Data Aggregation**
   - Collect metrics from various sources
   - Calculate MoM, QoQ, YoY comparisons
   - Identify trends and anomalies

3. **Dashboard Compilation**
   - Create structured sections by category
   - Include comparison tables
   - Add trend descriptions

4. **Narrative Addition**
   - Explain significant changes
   - Contextualize numbers
   - Highlight achievements/concerns

5. **Output**
   - Save to: `workspace/memory/night-shift/reports/dashboard-YYYY-MM-DD.md`

### Workflow 3: Incident/Post-Mortem Report
1. **Timeline Construction**
   - Gather all timestamps related to incident
   - Interview (via files) contributing agents
   - Create chronological sequence

2. **Impact Assessment**
   - Quantify business impact
   - Document affected systems/users
   - Calculate recovery metrics

3. **Root Cause Documentation**
   - Identify contributing factors
   - Distinguish root cause from symptoms
   - Note detection gaps

4. **Recommendation Development**
   - Propose preventive measures
   - Suggest monitoring improvements
   - Define action items with owners

5. **Output**
   - Save to: `workspace/memory/night-shift/reports/postmortem-[incident]-YYYY-MM-DD.md`

### Workflow 4: Weekly Trends Report
1. **Data Gathering**
   - Collect 7 days of metrics
   - Aggregate by category
   - Calculate week-over-week changes

2. **Trend Analysis**
   - Identify emerging patterns
   - Compare to previous weeks
   - Highlight anomalies

3. **Report Writing**
   - Executive overview
   - Category breakdowns
   - Visual descriptions (charts)
   - Forward-looking insights

4. **Output**
   - Save to: `workspace/memory/night-shift/reports/weekly-trends-YYYY-MM-DD.md`

## Skills to Use
- **read**: Gather source data and context
- **write**: Create report files
- **exec**: File operations and formatting

## When to Escalate
- Insufficient data to complete report
- Conflicting information requiring resolution
- Urgent report request outside capacity
- Quality-checker flags critical issues

## Output Formats

### Standard Report Structure
```markdown
# [Report Title]
**Date:** YYYY-MM-DD
**Prepared by:** Report-Generator-1 (Night Shift)
**Classification:** Internal

## Executive Summary
[2-3 paragraphs max]

## Key Findings
1. [Finding with supporting data]
2. [Finding with supporting data]
3. [Finding with supporting data]

## Detailed Analysis
[Section by section breakdown]

## Recommendations
1. [Specific, actionable recommendation]
2. [Specific, actionable recommendation]

## Appendices
[Supporting data tables, if needed]
```

## Handoff Procedures
1. **07:00 CET**: Compile list of reports generated overnight
2. **07:15 CET**: Flag any critical reports requiring morning attention
3. **07:30 CET**: Save handoff to `workspace/memory/night-shift/handoff/reports-brief-YYYY-MM-DD.md`
4. Include:
   - Reports completed
   - Reports in progress
   - Data gaps encountered
   - Priority items for morning review
5. Coordinate with Report-Generator-2 for coverage
6. Notify Night-Coordinator of completion
