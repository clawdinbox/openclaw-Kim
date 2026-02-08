# AI Team Organization Chart - Optimized 14-Agent Structure

**Version:** 2.0  
**Last Updated:** 2026-02-08  
**Owner:** Kim 🦞 (CSO/COO/CFO/CCO)

---

## Executive Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                         MARCEL (CEO)                            │
│                    Strategic Decision Maker                     │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                     KIM 🦞 (CSO/COO/CFO/CCO)                    │
│        Coordination | Quality Control | Cost Optimization       │
│                  Reports to: CEO (Review/Approval Only)         │
└───────────────┬───────────────┬───────────────┬─────────────────┘
                │               │               │
    ┌───────────▼───┐   ┌──────▼──────┐   ┌────▼──────┐
    │ Strategy Pod  │   │ Research Pod│   │ Ops Pod   │
    └───────┬───────┘   └──────┬──────┘   └─────┬─────┘
            │                  │                │
    ┌───────▼──────┐   ┌───────▼──────┐  ┌────▼──────┐
    │Prod. Manager │   │Senior Analyst│  │Data Anlst │
    └──────────────┘   ├──────────────┤  └───────────┘
                       │Res. Associate│
                       └──────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         CMO (CCO)                               │
│           Content Strategy | Brand Oversight                    │
└───────────────┬───────────────────────┬─────────────────────────┘
                │                       │
    ┌───────────▼────────┐    ┌────────▼────────┐
    │   Content Pod      │    │   Revenue Pod   │
    │    (Creative)      │    │   (Commercial)  │
    └─────────┬──────────┘    └────────┬────────┘
              │                        │
    ┌─────────▼──────────┐   ┌─────────▼─────────┐
    │ • Content Designer │   │ • Sales Executive │
    │ • Copywriter       │   │ • Pricing Analyst │
    └────────────────────┘   │ • Launch Manager  │
                             └───────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      Lead Engineer                              │
│           Technical Architecture | Code Review                  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                    ┌───────▼────────┐
                    │ Engineering Pod│
                    └───────┬────────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
    ┌───────▼──────┐ ┌──────▼─────┐ ┌──────▼──────┐
    │Lead Engineer │ │Auto. Engr. │ │Operations   │
    │              │ │            │ │Assistant    │
    └──────────────┘ └────────────┘ └─────────────┘
```

---

## Team Structure by Pod

### Strategy Pod (Reports to Kim)
| Role | Avatar | Primary Function | Workload |
|------|--------|------------------|----------|
| Kim 🦞 | 🦞 | Coordination, Quality, Cost, Approval | 3 max |
| Product Manager | 📱 | Roadmaps, MVP definition, User research | 2 max |

**Workflows:** Morning Intelligence, Product Launch, Revenue Optimization

---

### Research Pod (Reports to Kim)
| Role | Avatar | Primary Function | Workload Split |
|------|--------|------------------|----------------|
| Senior Analyst | 📊 | Deep analysis, McKinsey-grade deliverables | 100% proactive |
| Research Associate | 🔍 | Daily intelligence, signal detection | 80% reactive / 20% proactive |

**Workflows:** Morning Intelligence, Product Launch

---

### Content Pod - Creative (Reports to CMO/CCO)
| Role | Avatar | Primary Function |
|------|--------|------------------|
| CMO (also CCO) | 📢 | Content strategy, brand oversight, approval |
| Content Designer | 🎨 | Visual assets, ebook layouts, brand design |
| Copywriter | ✍️ | Sales copy, email sequences, social content |

**Workflows:** Content Factory, Product Launch

---

### Revenue Pod - Commercial (Reports to CMO)
| Role | Avatar | Primary Function | Workload Type |
|------|--------|------------------|---------------|
| CMO | 📢 | Strategy, campaign planning, oversight | Mixed |
| Sales Executive | 💼 | Lead qualification, outreach, deal tracking | Always reactive |
| Pricing Analyst | 💰 | Price optimization, bundles, A/B tests | Mixed |
| Launch Manager | 🚀 | Platform setup, analytics, go-live execution | Project-based |

**Workflows:** Revenue Optimization, Product Launch

---

### Engineering Pod (Reports to Lead Engineer → Kim)
| Role | Avatar | Primary Function |
|------|--------|------------------|
| Lead Engineer | ⚡ | Architecture, integrations, complex development |
| Automation Engineer | 🤖 | Scripts, workflow automation, efficiency |

**Workflows:** All (enabler pod)

---

### Operations Pod (Reports to Kim)
| Role | Avatar | Primary Function |
|------|--------|------------------|
| Operations Assistant | 📋 | Process docs, reporting, meeting notes |
| Data Analyst | 📈 | KPI tracking, metrics, insights, CFO support |

**Workflows:** Revenue Optimization (metrics), all (support)

---

## Capacity Rules

### Max Concurrent Tasks
- **All agents:** 2 concurrent tasks maximum
- **Kim (CSO/COO/CFO/CCO):** 3 tasks (review/approval only, no execution)
- **CEO:** 1 task (final decisions only)

### Workload Types
| Agent | Reactive | Proactive | Notes |
|-------|----------|-----------|-------|
| Research Associate | 80% | 20% | News monitoring priority |
| Sales Executive | 100% | 0% | Leads drive all work |
| All others | Flexible | Flexible | Balance as needed |

### Task Type Permissions
| Role | Execution | Review | Approval |
|------|-----------|--------|----------|
| CEO | ❌ | ✅ | ✅ |
| Kim (CSO) | ❌ | ✅ | ✅ |
| CMO | ✅ | ✅ | ✅ |
| All others | ✅ | Some | ❌ |

---

## Reporting Structure

```
CEO (Marcel)
├── CSO/COO/CFO/CCO (Kim 🦞)
│   ├── Product Manager
│   ├── Senior Research Analyst
│   │   └── Research Associate
│   ├── CMO (who is also CCO)
│   │   ├── Content Designer
│   │   ├── Copywriter
│   │   ├── Sales Executive
│   │   ├── Pricing Analyst
│   │   └── Launch Manager
│   ├── Lead Engineer
│   │   └── Automation Engineer
│   ├── Operations Assistant
│   └── Data Analyst
```

---

## Escalation Paths

### Standard Escalation
```
Agent → Peer Review → Kim Review → CEO (if required)
```

### Stuck Task Escalation (>2 hours)
```
Agent → Auto-escalate to Kim → CEO notification (if fails 3x)
```

### Quality Failure Escalation (<3/5 score)
```
Agent revision → Kim intervention → CEO notification (after 3 failures)
```

### Emergency Escalation
```
Any agent → Immediate Kim + CEO notification
```

---

## Cost Optimization by Role

| Role | Default Model | Fallback | Emergency |
|------|---------------|----------|-----------|
| Research Associate | Kimi K2.5 | Gemini Flash | Fastest |
| Senior Analyst | Kimi K2.5 | Opus 4.6 (complex) | Fastest |
| Product Manager | Kimi K2.5 | Opus 4.6 (strategic) | Fastest |
| Content Designer | Kimi K2.5 | Ollama (simple) | Fastest |
| Copywriter | Kimi K2.5 | Ollama (drafts) | Fastest |
| Data Analyst | Kimi K2.5 | Ollama (large datasets) | Fastest |
| Lead Engineer | Opus 4.6 | Kimi K2.5 | Fastest |
| Automation Engineer | Kimi K2.5 | Ollama | Fastest |
| All others | Kimi K2.5 | Ollama | Fastest |

---

## Key Metrics per Pod

### Strategy Pod
- Products launched on time
- Roadmap adherence
- User validation success rate

### Research Pod
- Intelligence briefs delivered
- Deep dive report quality scores
- Signal detection accuracy

### Content Pod
- Content pieces published
- Engagement rates by platform
- Brand consistency scores

### Revenue Pod
- Revenue generated
- Conversion rates
- Pipeline velocity

### Engineering Pod
- Tools delivered
- Automation coverage
- System uptime

### Operations Pod
- Reports delivered on time
- Data accuracy
- Process compliance

---

## Workflow Assignments

| Workflow | Primary Pods | Trigger | Frequency |
|----------|--------------|---------|-----------|
| Morning Intelligence | Research → Strategy | Time | Daily 06:00 |
| Content Factory | Content → Revenue (post) | Time | Daily 09:00 |
| Product Launch | All pods | Event | Project basis |
| Revenue Optimization | Operations → Revenue → Strategy | Time | Weekly (Mon 10:00) |

---

## Communication Protocols

### Daily Standup (Auto-generated)
- Each pod lead provides 3-bullet status
- Blockers escalated to Kim
- Deliverables logged

### Weekly Review
- Pod performance metrics
- Cost review
- Quality scores
- Pipeline status

### Monthly Strategy
- Roadmap review
- Budget vs actual
- Team optimization
- Goal adjustments

---

*This org chart is the source of truth for team structure. Updates require Kim approval.*
