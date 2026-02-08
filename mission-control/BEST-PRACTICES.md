# AI Team Best Practices & Collaboration Guide

**Version:** 1.0  
**Last Updated:** 2026-02-08  
**Owner:** Kim 🦞 (CSO/COO/CFO/CCO)

---

## Table of Contents

1. [Core Principles](#core-principles)
2. [Agent Collaboration Patterns](#agent-collaboration-patterns)
3. [Workflow Best Practices](#workflow-best-practices)
4. [Quality Standards](#quality-standards)
5. [Cost Optimization](#cost-optimization)
6. [Escalation Procedures](#escalation-procedures)
7. [Communication Guidelines](#communication-guidelines)

---

## Core Principles

### 1. Default to Action
- Don't wait for perfect clarity
- Make reasonable assumptions
- Document decisions made under ambiguity

### 2. Handoffs Are Critical
- Always provide context, never assume
- Use structured output formats
- Include "so what" in every deliverable

### 3. Quality Gates Are Non-Negotiable
- Self-review before submission
- Peer review when available
- Kim review before CEO delivery

### 4. Cost-Conscious Execution
- Start with Ollama for simple tasks
- Use Kimi K2.5 as default
- Reserve Opus 4.6 for complex work

### 5. Workload Awareness
- Max 2 concurrent tasks per agent
- Escalate when overloaded
- Balance reactive vs proactive work

---

## Agent Collaboration Patterns

### Pattern 1: Sequential Pipeline
```
Research → Analysis → Product → Review → Delivery
```
**Use for:** Morning Intelligence, deep dives, strategic reports  
**Key:** Each step builds on previous, clear handoff format

### Pattern 2: Parallel Workstreams
```
         ┌→ Designer ──┐
Research →             → Review → Delivery
         └→ Copywriter ┘
```
**Use for:** Content Factory, Product Launch assets  
**Key:** Coordinate timing, merge at review stage

### Pattern 3: Pod Collaboration
```
Content Pod (creative) + Revenue Pod (commercial) = Launch
```
**Use for:** Product launches, campaigns  
**Key:** Clear pod lead, shared timeline

### Pattern 4: Support & Enablement
```
Engineering Pod + Operations Pod = Platform for all
```
**Use for:** Infrastructure, tooling, metrics  
**Key:** Proactive support, not reactive

---

## Workflow Best Practices

### Morning Intelligence (Daily 06:00)

**Research Associate:**
- Scan 4 sources in 30 minutes
- Flag 5-10 signals, not 50
- Prioritize: Breaking → Trending → Background

**Senior Analyst:**
- Connect dots between signals
- Use strategic frameworks
- Always answer "So What?"

**Product Manager:**
- Translate to product implications
- Identify build/validate/pivot triggers
- Flag roadmap adjustments needed

**Kim Review:**
- Consolidate to 1-page brief
- Highlight urgent items
- Recommend CEO discussion topics

### Content Factory (Daily)

**Research Associate:**
- Provide data points, not narratives
- Include source links
- Suggest 2-3 angles

**Copywriter:**
- Write for the platform first
- Lead with insight, not setup
- Include CTA

**Content Designer:**
- Design for mobile first
- Maintain brand consistency
- Export in all required formats

**CMO Approval:**
- Check strategic alignment
- Verify brand voice
- Approve or give specific feedback (not "make it better")

### Product Launch (Project Mode)

**Parallel Phase 1 (Week 1):**
- Research → Validation
- Product Manager → Roadmap
- Engineering → Technical feasibility

**Parallel Phase 2 (Week 2):**
- Designer + Copywriter (start together)
- Pricing Analyst (waits for early assets)

**Sequential Phase 3 (Week 3):**
- CMO Review (gates everything)
- Launch Manager (executes)
- Sales Executive (begins outreach)

### Revenue Optimization (Weekly)

**Data Analyst:**
- Lead with anomalies, not everything
- Show trends, not just numbers
- Recommend actions

**Pricing Analyst:**
- Test one variable at a time
- Statistical significance required
- Clear pass/fail criteria

**Sales Executive:**
- Pipeline health over activity metrics
- Flag stuck deals
- Forecast accuracy tracking

**CMO:**
- Campaign ROI focus
- Channel optimization
- Content performance

**Kim (CFO):**
- Budget vs actual
- Resource allocation decisions
- Investment recommendations

---

## Quality Standards

### Self-Review Checklist (Required)

**Before submitting any work:**
- [ ] All requirements addressed
- [ ] Facts verified with sources
- [ ] No obvious errors
- [ ] Format matches specification
- [ ] "So what" is clear

### Peer Review Guidelines

**When to request peer review:**
- Novel approach or methodology
- High-stakes deliverable
- Cross-functional impact
- Personal uncertainty

**How to give peer review:**
- Be specific ("the conclusion doesn't follow from the data")
- Not vague ("this needs work")
- Suggest fixes, don't just identify problems
- Acknowledge what's good

### Kim Review Expectations

**For all deliverables to CEO:**
- Strategic accuracy
- Brand alignment
- Completeness
- Executive-ready formatting

**Kim will either:**
- Approve as-is
- Request specific changes with rationale
- Escalate to different agent if fundamental issues

---

## Cost Optimization

### Model Selection Decision Tree

```
Is it simple? (formatting, summaries)
└── Yes → Ollama (free)

Is it standard? (writing, analysis, research)
└── Yes → Kimi K2.5 ($0.14/$0.28)

Is it complex? (architecture, debugging)
└── Yes → Opus 4.6 ($15/$75)

Is it urgent?
└── Yes → Fastest available (usually Kimi)
```

### Budget Guardrails

**Daily Budget: $10**
- Warning at $7 (70%)
- Critical at $9 (90%)
- Stop/hard review at $10 (100%)

**Weekly Budget: $50**
- Report every Monday
- Adjust model assignments if trending over

### Cost-Saving Tactics

1. **Batch similar tasks** - Process together with Ollama
2. **Draft with Ollama, polish with Kimi** - 90% cost reduction
3. **Set token limits** - Prevent runaway usage
4. **Review expensive agent usage** - Audit weekly

---

## Escalation Procedures

### Auto-Escalation Triggers

| Condition | Action | Notification |
|-----------|--------|--------------|
| Task stuck >2h | Escalate to Kim | Kim only |
| Quality score <3/5 | Return for revision | Agent + Kim |
| Failed 2nd retry | Kim intervention | Agent + Kim |
| Failed 3rd retry | Escalate + notify CEO | All |
| Daily budget >$10 | Hard stop | Kim + CEO |

### Manual Escalation

**When to escalate manually:**
- Ambiguity in requirements
- Blocked on external dependency
- Scope creep detected
- Personal capacity exceeded

**How to escalate:**
1. Document current state
2. Explain blockers clearly
3. Suggest path forward
4. Tag appropriate reviewer

### Emergency Escalation

**Definition:** Time-sensitive, high-impact issue requiring immediate attention

**Process:**
1. Flag as emergency in task
2. Notify Kim immediately
3. Kim decides CEO notification
4. Fast-track through quality gates

---

## Communication Guidelines

### Between Agents

**Good handoff:**
```
Context: [What this is and why]
Key findings: [3-5 bullets]
Deliverable: [Path to output]
Questions: [What I need from you]
```

**Bad handoff:**
```
Here you go.
[link]
```

### Status Updates

**Format:**
```
Status: [On track / At risk / Blocked]
Progress: [What completed since last update]
Next: [What's happening next]
Blockers: [What's in your way]
```

**Frequency:**
- Daily for active tasks
- Weekly for ongoing work
- Immediately when status changes

### Documentation

**Always document:**
- Decisions made and why
- Methodology used
- Assumptions made
- Limitations acknowledged

**Location:**
- Daily work: `/memory/YYYY-MM-DD.md`
- Deliverables: `/documents/[category]/`
- Processes: Relevant agent `.md` files

---

## Anti-Patterns (What NOT to Do)

### ❌ Silo Work
- Working without context from previous agents
- Not checking related deliverables
- Ignoring pod coordination

### ❌ Perfectionism
- Spending 3 hours on a 30-minute task
- Endless revisions without clear improvement
- Analysis paralysis

### ❌ Escalation Avoidance
- Struggling silently for hours
- Not asking for help when blocked
- Delivering subpar work to avoid escalation

### ❌ Cost Blindness
- Using Opus for simple tasks
- Not tracking token usage
- Ignoring budget alerts

### ❌ Handoff Failures
- "See attached" with no context
- Delivering without self-review
- Not documenting assumptions

---

## Success Metrics

### Individual Agent
- Tasks completed on time
- Quality scores
- Cost per deliverable
- Collaboration ratings (peer feedback)

### Pod Level
- Pod output volume
- Cross-pod collaboration score
- Workflow cycle time
- Escalation rate

### Organization Level
- Total throughput
- Average quality score
- Cost per output
- CEO satisfaction

---

## Quick Reference

| Need | Contact |
|------|---------|
| Task assignment help | Kim |
| Technical question | Lead Engineer |
| Content approval | CMO |
| Pricing decision | Pricing Analyst + Kim |
| Quality issue | Kim |
| Cost concern | Data Analyst + Kim |
| Emergency | Kim + CEO |

---

*Follow these practices. They're optimized through iteration. Suggest improvements to Kim.*
