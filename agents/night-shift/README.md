# Night Shift Agents - Master Index

## Overview
20 agents configured for 24/7 night shift operation (00:00-08:00 CET) on Mac Mini M4 16GB.

## Model Distribution
- **qwen2.5:7b**: 2 agents (Coordinators - run in parallel)
- **llama3.1:8b**: 18 agents (Task Workers - run sequentially or parallel)

## Agent Categories

### 1. Global Monitors (5 agents) - llama3.1:8b
| Agent | Role | Check-in Frequency |
|-------|------|-------------------|
| social-media-monitor-1 | X Trends Monitor | Every 30 min |
| social-media-monitor-2 | LinkedIn Trends Monitor | Every 45 min |
| social-media-monitor-3 | Threads/Instagram Monitor | Every 30 min |
| competitor-monitor | Fashion/Luxury Competitor Intel | Every 60 min |
| news-monitor | Industry News Monitor | Every 45 min |

### 2. Data Processors (5 agents) - llama3.1:8b
| Agent | Role | Primary Window |
|-------|------|----------------|
| report-generator-1 | Sales Reports | 01:00-06:00 CET |
| report-generator-2 | Content Performance Reports | 00:00-06:00 CET |
| data-analyst | Cross-Functional Analysis | 00:00-07:30 CET |
| trend-analyzer | Pattern Recognition | Continuous + 02:00-07:00 CET |
| quality-checker | Output QA & Review | Continuous + 06:00-07:45 CET |

### 3. Content Preppers (5 agents) - llama3.1:8b
| Agent | Role | Output |
|-------|------|--------|
| content-drafter-1 | Morning Social Posts | 5-7 platform-optimized posts |
| content-drafter-2 | Newsletter Content | Newsletter sections & subject lines |
| newsletter-assembler | Newsletter Builder | Complete assembled newsletter |
| seo-optimizer | SEO Optimization | Optimized content & meta data |
| image-prepper | Visual Specifications | Image specs & alt text |

### 4. System Maintainers (5 agents)
| Agent | Role | Model | Schedule |
|-------|------|-------|----------|
| backup-agent | Git Commits | llama3.1:8b | Hourly + 07:00 CET |
| memory-organizer | File Organization | llama3.1:8b | Continuous + 02:00-07:30 CET |
| system-health-monitor | Infrastructure Monitor | llama3.1:8b | Every 15 min |
| handoff-preparer | Morning Brief | llama3.1:8b | 06:00-07:45 CET |
| night-coordinator | Shift Lead | **qwen2.5:7b** | Continuous |

## Directory Structure
```
workspace/agents/night-shift/
├── social-media-monitor-1/
│   ├── SOUL.md
│   └── AGENTS.md
├── social-media-monitor-2/
│   ├── SOUL.md
│   └── AGENTS.md
├── social-media-monitor-3/
│   ├── SOUL.md
│   └── AGENTS.md
├── competitor-monitor/
│   ├── SOUL.md
│   └── AGENTS.md
├── news-monitor/
│   ├── SOUL.md
│   └── AGENTS.md
├── report-generator-1/
│   ├── SOUL.md
│   └── AGENTS.md
├── report-generator-2/
│   ├── SOUL.md
│   └── AGENTS.md
├── data-analyst/
│   ├── SOUL.md
│   └── AGENTS.md
├── trend-analyzer/
│   ├── SOUL.md
│   └── AGENTS.md
├── quality-checker/
│   ├── SOUL.md
│   └── AGENTS.md
├── content-drafter-1/
│   ├── SOUL.md
│   └── AGENTS.md
├── content-drafter-2/
│   ├── SOUL.md
│   └── AGENTS.md
├── newsletter-assembler/
│   ├── SOUL.md
│   └── AGENTS.md
├── seo-optimizer/
│   ├── SOUL.md
│   └── AGENTS.md
├── image-prepper/
│   ├── SOUL.md
│   └── AGENTS.md
├── backup-agent/
│   ├── SOUL.md
│   └── AGENTS.md
├── memory-organizer/
│   ├── SOUL.md
│   └── AGENTS.md
├── system-health-monitor/
│   ├── SOUL.md
│   └── AGENTS.md
├── handoff-preparer/
│   ├── SOUL.md
│   └── AGENTS.md
└── night-coordinator/
    ├── SOUL.md
    └── AGENTS.md
```

## Output Structure
```
workspace/memory/night-shift/
├── x-trends/
├── linkedin-trends/
├── threads-ig-trends/
├── competitor-intel/
├── news-digest/
├── reports/
│   ├── sales/
│   ├── content-performance/
│   └── channel-performance/
├── analysis/
├── trends/
├── content/
│   ├── social/
│   ├── newsletter/
│   ├── seo/
│   └── visual/
├── system/
│   ├── backup-log/
│   ├── organization-report/
│   ├── health-report/
│   ├── shift-log/
│   └── qa/
└── handoff/
    └── MORNING-BRIEF-YYYY-MM-DD.md
```

## Handoff Timeline (07:30-07:45 CET)
1. **07:30 CET**: All agents submit final outputs
2. **07:35 CET**: Quality-Checker final review
3. **07:45 CET**: Handoff-Preparer delivers morning brief
4. **07:45 CET**: Night-Coordinator confirms shift completion

## Resource Requirements (Mac Mini M4 16GB)
- **qwen2.5:7b**: ~4GB RAM per instance (2 parallel = ~8GB)
- **llama3.1:8b**: ~5GB RAM per instance (sequential execution)
- **Headroom**: ~3GB for system and orchestration
- **Execution Strategy**: Coordinators run parallel, task workers run sequentially or in small batches

## Activation
To activate the Night Shift:
1. Ensure Ollama models are available:
   ```bash
   ollama pull qwen2.5:7b
   ollama pull llama3.1:8b
   ```
2. Start Night-Coordinator first (shift lead)
3. Activate remaining agents per workflow
4. Monitor via Night-Coordinator shift logs
