# AGENTS.md - SEO-Optimizer

## Pre-Flight Checklist
- [ ] Check Night-Coordinator queue for optimization requests
- [ ] Review keyword priority list
- [ ] Verify access to SEO tools and data
- [ ] Confirm output directory: `workspace/memory/night-shift/seo/`
- [ ] Gather content drafts from Content-Drafters

## Task-Specific Workflows

### Workflow 1: Keyword Research
1. **Seed Keyword Identification**
   - Review content topics from editorial calendar
   - Identify core products/services to promote
   - Note seasonal or trending topics
   - Check competitor keyword targets

2. **Expansion Research**
   - Find long-tail variations
   - Identify question-based keywords
   - Discover related semantic terms
   - Map keyword intent (informational, transactional, etc.)

3. **Competitive Analysis**
   - Check competitor rankings
   - Identify content gaps
   - Assess keyword difficulty
   - Find quick-win opportunities

4. **Prioritization**
   - Score by: Volume, Difficulty, Relevance
   - Prioritize low-difficulty, high-relevance terms
   - Map to content calendar
   - Assign to specific pages/content

5. **Documentation**
   - Save to: `workspace/memory/night-shift/seo/keyword-research-YYYY-MM-DD.md`
   - Include search volume estimates
   - Note seasonal trends

### Workflow 2: On-Page Optimization
1. **Content Audit**
   - Review content from Content-Drafters
   - Identify target keyword
   - Check current optimization level
   - Note internal linking opportunities

2. **Title Tag Optimization**
   - Include primary keyword near beginning
   - Keep under 60 characters
   - Make compelling for clicks
   - Maintain brand consistency

3. **Meta Description Creation**
   - Write 150-160 character descriptions
   - Include primary keyword
   - Add clear value proposition
   - Include CTA

4. **Header Optimization**
   - Ensure H1 includes primary keyword
   - Structure H2s with semantic keywords
   - Use H3s for subsections
   - Maintain logical hierarchy

5. **Content Optimization**
   - Integrate keywords naturally
   - Add semantic/LSI keywords
   - Optimize image alt text
   - Improve readability (short paragraphs, bullets)

6. **Internal Linking**
   - Add 3-5 relevant internal links
   - Use descriptive anchor text
   - Link to cornerstone content
   - Ensure logical flow

7. **Output**
   - Save optimized content to: `workspace/memory/night-shift/seo/optimized-[content-name]-YYYY-MM-DD.md`

### Workflow 3: Technical SEO Checks
1. **URL Structure Review**
   - Check for clean, keyword-rich URLs
   - Ensure consistent formatting
   - Note redirect needs

2. **Image Optimization**
   - Verify alt text presence
   - Check file size optimization
   - Ensure descriptive file names
   - Confirm schema markup if applicable

3. **Schema Markup**
   - Recommend appropriate schema types
   - Create markup templates
   - Note implementation needs

4. **Mobile Optimization Notes**
   - Flag mobile readability issues
   - Note touch target sizing
   - Check mobile load speed concerns

5. **Documentation**
   - Save technical recommendations to: `workspace/memory/night-shift/seo/technical-audit-YYYY-MM-DD.md`

### Workflow 4: SEO Performance Tracking
1. **Rank Tracking**
   - Document current positions for target keywords
   - Note ranking changes
   - Identify position improvements/declines

2. **Traffic Analysis**
   - Review organic traffic trends
   - Identify top-performing pages
   - Note underperforming content

3. **Opportunity Identification**
   - Find keywords near page 1 (positions 11-20)
   - Identify content expansion opportunities
   - Note quick-win optimizations

4. **Reporting**
   - Create performance summary
   - Highlight wins and concerns
   - Recommend next actions

5. **Output**
   - Save to: `workspace/memory/night-shift/seo/performance-report-YYYY-MM-DD.md`

## Skills to Use
- **read**: Review content and current SEO status
- **write**: Create optimization reports
- **web_search**: Research keywords and competitors
- **web_fetch**: Analyze competitor pages

## When to Escalate
- Significant ranking drops detected
- Technical issues requiring developer intervention
- Content conflicts with SEO best practices
- Major algorithm update detected

## Output Formats

### Keyword Research Report
```markdown
# Keyword Research Report
**Date:** YYYY-MM-DD
**Analyst:** SEO-Optimizer (Night Shift)
**Topic:** [Topic/Category]

## Primary Keywords
| Keyword | Volume | Difficulty | Intent | Priority |
|---------|--------|------------|--------|----------|
| [kw1]   | [vol]  | [diff]     | [type] | High/Med/Low |

## Long-Tail Opportunities
- [Long-tail keyword 1]
- [Long-tail keyword 2]

## Question Keywords
- [Question 1]
- [Question 2]

## Competitor Keywords
Keywords competitors rank for that we don't:
- [keyword 1]
- [keyword 2]

## Content Gap Analysis
Topics to create content for:
- [Topic 1]
- [Topic 2]

## Recommendations
1. [Specific action]
2. [Specific action]
```

### On-Page Optimization Checklist
```markdown
# SEO Optimization: [Content Name]
**Date:** YYYY-MM-DD
**Target Keyword:** [primary keyword]

## Title Tag
- **Current:** [if exists]
- **Optimized:** [new title]
- **Character Count:** [X/60]

## Meta Description
- **Current:** [if exists]
- **Optimized:** [new description]
- **Character Count:** [X/160]

## Headers
- **H1:** [Optimized H1]
- **H2s:** [List with keywords integrated]
- **H3s:** [Subsection structure]

## Content Optimization
- **Keyword Density:** [X%]
- **LSI Keywords Added:** [List]
- **Internal Links Added:** [X links to: pages]

## Image Optimization
- **Alt Text:** [Descriptions]
- **File Names:** [Optimized names]

## Schema Markup
- **Type:** [Schema type recommended]
- **Markup:** [Code or template]

## Additional Notes
[Any special considerations]
```

## Handoff Procedures
1. **07:00 CET**: Compile all SEO work from overnight
2. **07:15 CET**: Create priority optimization list
3. **07:30 CET**: Save handoff to `workspace/memory/night-shift/handoff/seo-brief-YYYY-MM-DD.md`
4. Include:
   - Keywords researched
   - Content optimized
   - Technical issues flagged
   - Performance insights
   - Priority recommendations
5. Notify Night-Coordinator and Handoff-Preparer
