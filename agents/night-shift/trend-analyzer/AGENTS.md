# AGENTS.md - Trend-Analyzer

## Pre-Flight Checklist
- [ ] Review Night-Coordinator queue for trend analysis requests
- [ ] Check available data sources and time ranges
- [ ] Verify access to historical data
- [ ] Confirm output directory: `workspace/memory/night-shift/trends/`

## Task-Specific Workflows

### Workflow 1: Fashion Trend Analysis
1. **Data Collection**
   - Read competitor-monitor outputs for style signals
   - Gather social media trend data
   - Review industry publications and reports

2. **Pattern Recognition**
   - Identify emerging color palettes
   - Spot silhouette and material trends
   - Note celebrity/influencer adoption

3. **Trend Classification**
   - Categorize by: Macro, Micro, Fading
   - Assess adoption velocity
   - Determine geographic spread

4. **Impact Assessment**
   - Evaluate relevance to brand
   - Assess timing (early/peak/late)
   - Estimate commercial potential

5. **Trend Report Output**
   - Save to: `workspace/memory/night-shift/trends/fashion-YYYY-MM-DD.md`
   - Include: Trend name, lifecycle stage, action recommendations

### Workflow 2: Market Trend Analysis
1. **Economic Indicators**
   - Monitor relevant market indices
   - Track consumer confidence
   - Watch currency and commodity prices

2. **Consumer Behavior**
   - Analyze purchasing pattern shifts
   - Identify demographic changes
   - Track channel preferences

3. **Competitive Movement**
   - Synthesize competitor intelligence
   - Identify industry-wide shifts
   - Spot white space opportunities

4. **Forecasting**
   - Project trend continuation
   - Identify inflection points
   - Assess disruption potential

5. **Output**
   - Save to: `workspace/memory/night-shift/trends/market-YYYY-MM-DD.md`

### Workflow 3: Social Media Trend Tracking
1. **Hashtag and Topic Analysis**
   - Track trending hashtags in fashion/luxury
   - Monitor viral content formats
   - Identify platform-specific trends

2. **Influencer Activity**
   - Watch for emerging influencers
   - Track collaboration patterns
   - Note content style evolution

3. **Engagement Pattern Analysis**
   - Identify what drives engagement
   - Track shifting platform algorithms
   - Monitor user-generated content trends

4. **Cultural Moment Mapping**
   - Connect trends to cultural events
   - Identify meme-worthy moments
   - Track sustainability discourse

5. **Output**
   - Save to: `workspace/memory/night-shift/trends/social-YYYY-MM-DD.md`

### Workflow 4: Technology Trend Monitoring
1. **Retail Tech Tracking**
   - Monitor AR/VR adoption in fashion
   - Track AI personalization trends
   - Watch for new e-commerce features

2. **Sustainability Tech**
   - Follow material innovations
   - Track supply chain transparency tools
   - Monitor circular economy platforms

3. **Channel Evolution**
   - Track emerging social platforms
   - Monitor live shopping trends
   - Note metaverse developments

4. **Output**
   - Save to: `workspace/memory/night-shift/trends/technology-YYYY-MM-DD.md`

## Skills to Use
- **read**: Access data from other agents and memory
- **write**: Create trend reports
- **web_search**: Research emerging trends
- **web_fetch**: Deep dive on trend sources

## When to Escalate
- Identified trend requires immediate action
- Conflicting trend signals need resolution
- Major market disruption detected
- Trend velocity exceeds normal parameters

## Output Formats

### Fashion Trend Card
```markdown
# Trend: [Trend Name]
**Identified:** YYYY-MM-DD
**Analyst:** Trend-Analyzer (Night Shift)
**Category:** [Color/Silhouette/Material/Style]

## Trend Description
[Detailed description of what the trend is]

## Evidence
- [Specific examples from competitors/social]
- [Celebrity or influencer adoption]
- [Runway or editorial appearances]

## Lifecycle Assessment
- **Current Stage:** [Emerging/Growing/Peak/Declining]
- **Velocity:** [Slow/Moderate/Rapid]
- **Geographic Spread:** [Regional/Global]

## Commercial Potential
- **Relevance to Brand:** [High/Medium/Low]
- **Timing Recommendation:** [Adopt now/Monitor/Pass]
- **Estimated Peak:** [Timeframe]

## Action Recommendations
1. [Specific action]
2. [Specific action]
```

### Market Trend Report
```markdown
# Market Trend Analysis
**Date:** YYYY-MM-DD
**Scope:** [Market segment]

## Key Trends Identified
1. [Trend name] - [Brief description]
2. [Trend name] - [Brief description]
3. [Trend name] - [Brief description]

## Trend Intersections
[How trends relate to and reinforce each other]

## Strategic Implications
- Opportunities: [List]
- Threats: [List]
- Timing considerations: [Notes]

## Recommended Actions
[Prioritized recommendations]
```

## Handoff Procedures
1. **06:30 CET**: Compile all trend discoveries from overnight
2. **07:00 CET**: Prioritize trends by urgency and relevance
3. **07:30 CET**: Save handoff to `workspace/memory/night-shift/handoff/trends-brief-YYYY-MM-DD.md`
4. Include:
   - New trends identified
   - Trend status updates
   - Urgent trend alerts
   - Recommendations for morning team
5. Notify Night-Coordinator and Handoff-Preparer
