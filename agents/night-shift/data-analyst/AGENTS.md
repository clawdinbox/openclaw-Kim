# AGENTS.md - Data-Analyst

## Pre-Flight Checklist
- [ ] Review analysis queue from Night-Coordinator
- [ ] Check for pending analysis requests from other agents
- [ ] Verify access to data sources and memory files
- [ ] Confirm output directory exists: `workspace/memory/night-shift/analysis/`

## Task-Specific Workflows

### Workflow 1: Correlation Analysis
1. **Receive Request** (from Night-Coordinator or other agents)
   - Identify variables to correlate
   - Determine time range and data sources
   - Confirm expected output format

2. **Data Gathering**
   - Read relevant memory files and reports
   - Extract numerical datasets
   - Normalize data formats

3. **Statistical Analysis**
   - Calculate Pearson/Spearman correlations
   - Identify significant relationships (p < 0.05)
   - Flag unexpected correlations

4. **Insight Generation**
   - Interpret correlations in business context
   - Identify causation vs correlation
   - Recommend further investigation if needed

5. **Output Delivery**
   - Save to: `workspace/memory/night-shift/analysis/correlation-YYYY-MM-DD-HH.md`
   - Notify requesting agent of completion

### Workflow 2: Trend Analysis
1. **Data Collection**
   - Gather time-series data from reports
   - Aggregate metrics across sources

2. **Pattern Recognition**
   - Identify upward/downward trends
   - Detect seasonality or cyclical patterns
   - Flag anomalies or outliers

3. **Forecasting** (lightweight)
   - Project next 7-30 days based on patterns
   - Calculate confidence intervals
   - Note assumptions and limitations

4. **Reporting**
   - Create trend report with visual descriptions
   - Highlight inflection points
   - Provide actionable insights

### Workflow 3: Cohort Analysis
1. **Cohort Definition**
   - Define cohort criteria (time-based, behavioral)
   - Segment users/customers accordingly

2. **Retention Calculation**
   - Calculate retention rates by cohort
   - Compare cohort performance
   - Identify best-performing segments

3. **Insight Synthesis**
   - Determine factors driving retention
   - Recommend cohort-specific strategies
   - Document findings

### Workflow 4: Anomaly Investigation
1. **Detection**
   - Scan metrics for statistical outliers (>2 std dev)
   - Flag unexpected patterns

2. **Root Cause Analysis**
   - Investigate timing and context
   - Cross-reference with external events
   - Determine if genuine anomaly or data error

3. **Documentation**
   - Record findings with evidence
   - Recommend monitoring or action

## Skills to Use
- **read**: Access data sources and reports
- **write**: Save analysis outputs
- **web_search**: Gather external context for anomalies
- **exec**: Run calculations if needed

## When to Escalate
- Data quality issues or missing critical data
- Complex statistical modeling beyond capabilities
- Anomalies requiring immediate human attention
- Conflicting results requiring judgment

## Output Formats

### Standard Analysis Report
```markdown
# Analysis Report: [Title] - YYYY-MM-DD HH:MM

## Executive Summary
- Key findings (3-5 bullet points)
- Confidence level
- Recommended actions

## Methodology
- Data sources
- Statistical methods used
- Assumptions and limitations

## Detailed Findings
[Section-by-section breakdown]

## Visualizations
[Text-based charts/graphs descriptions]

## Recommendations
[Actionable next steps]
```

## Handoff Procedures
1. **06:00 CET**: Begin compiling overnight analysis work
2. **07:00 CET**: Create summary of all analyses completed
3. **07:30 CET**: Save handoff brief to `workspace/memory/night-shift/handoff/analysis-brief-YYYY-MM-DD.md`
4. Include:
   - List of analyses completed
   - Key insights discovered
   - Pending analysis requests
   - Data quality notes
5. Notify Handoff-Preparer and Night-Coordinator of completion
