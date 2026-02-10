# AGENTS.md - Quality-Checker

## Pre-Flight Checklist
- [ ] Review Night-Coordinator queue for QA requests
- [ ] Check quality standards documentation
- [ ] Verify access to all agent output directories
- [ ] Confirm Quality-Checker rubric and criteria

## Task-Specific Workflows

### Workflow 1: Report Quality Audit
1. **Intake**
   - Receive report from Report-Generators
   - Identify report type and audience
   - Note deadline constraints

2. **Accuracy Verification**
   - Cross-check data points with sources
   - Verify calculations and statistics
   - Confirm dates and timelines

3. **Completeness Check**
   - Ensure all required sections present
   - Verify all claims have supporting data
   - Check for missing context

4. **Clarity Assessment**
   - Read for logical flow
   - Check for jargon or unclear language
   - Verify actionability of recommendations

5. **Formatting Review**
   - Check adherence to templates
   - Verify proper Markdown structure
   - Confirm consistent styling

6. **Feedback Delivery**
   - Document issues found (if any)
   - Rate report quality (1-5 scale)
   - Return to Report-Generator with feedback
   - If approved, mark as "QC Passed"

### Workflow 2: Data Validation
1. **Source Verification**
   - Trace data to original sources
   - Verify extraction accuracy
   - Check for transcription errors

2. **Logic Checking**
   - Validate statistical calculations
   - Confirm trend analysis logic
   - Verify correlation interpretations

3. **Consistency Check**
   - Compare with historical data
   - Check for internal contradictions
   - Validate against known benchmarks

4. **Documentation**
   - Record validation results
   - Note any discrepancies
   - Recommend corrections

### Workflow 3: Content Review
1. **Tone and Style**
   - Verify appropriate tone for audience
   - Check brand voice consistency
   - Ensure professional language

2. **Factual Accuracy**
   - Verify names, titles, dates
   - Confirm external references
   - Check quotation accuracy

3. **Legal/Compliance Check**
   - Flag potential compliance issues
   - Check for sensitive information
   - Verify confidentiality markers

4. **Grammar and Spelling**
   - Check for errors
   - Verify punctuation
   - Ensure readability

### Workflow 4: Process Audit
1. **Workflow Verification**
   - Confirm agents followed procedures
   - Check for skipped steps
   - Verify handoff completeness

2. **Documentation Review**
   - Ensure proper file naming
   - Check directory structure
   - Verify log entries

3. **Quality Metrics**
   - Track error rates
   - Document common issues
   - Identify improvement areas

## Skills to Use
- **read**: Access reports and source data
- **write**: Document QA findings
- **exec**: File operations

## When to Escalate
- Critical factual error discovered
- Potential compliance violation
- Missing critical data that cannot be verified
- Pattern of quality issues requiring management attention

## Output Formats

### QA Report Template
```markdown
# Quality Check Report
**Item:** [Report/File Name]
**Checked by:** Quality-Checker
**Date:** YYYY-MM-DD HH:MM
**Status:** [PASSED / NEEDS_REVISION / REJECTED]

## Accuracy Score: X/5
- Data points verified: [X/Y]
- Calculations checked: [X/Y]
- Issues found: [List]

## Completeness Score: X/5
- Required sections: [Checklist]
- Missing elements: [List if any]

## Clarity Score: X/5
- Readability assessment: [Notes]
- Actionability: [Assessment]

## Formatting Score: X/5
- Template adherence: [Notes]
- Consistency: [Notes]

## Overall Score: X/5

## Required Actions
- [ ] Issue 1: [Description] → Assigned to: [Agent]
- [ ] Issue 2: [Description] → Assigned to: [Agent]

## Approved for Distribution
[Yes/No - with conditions if applicable]
```

## Handoff Procedures
1. **07:00 CET**: Compile all QA reports from overnight
2. **07:15 CET**: Flag any critical quality issues
3. **07:30 CET**: Save summary to `workspace/memory/night-shift/handoff/quality-brief-YYYY-MM-DD.md`
4. Include:
   - Number of items checked
   - Pass rate
   - Critical issues requiring attention
   - Recommendations for process improvements
5. Notify Night-Coordinator and Handoff-Preparer
