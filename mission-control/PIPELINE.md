# 24/7 Autonomous Agent Pipeline

> The team never sleeps.

## Overview

The Autonomous Agent Pipeline is a continuous operation system that enables the AI agent team to work 24/7/365 without manual intervention. Tasks are generated automatically, assigned intelligently, and executed continuously.

## Architecture

### Core Components

```
┌─────────────────────────────────────────────────────────────┐
│                    PIPELINE LAYER                           │
├─────────────┬─────────────┬─────────────┬───────────────────┤
│  Generator  │ Prioritizer │   Router    │     Monitor       │
│             │             │             │                   │
│ Creates     │ Scores      │ Assigns     │ Tracks execution  │
│ tasks based │ tasks by    │ to best     │ & handles         │
│ on triggers │ importance  │ agent       │ failures          │
└─────────────┴─────────────┴─────────────┴───────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   DELIVERY LAYER                            │
│                                                             │
│  • Save outputs to correct paths                           │
│  • Notify CEO of completions                               │
│  • Queue for review if needed                              │
│  • Update activity logs                                    │
└─────────────────────────────────────────────────────────────┘
```

## Operation Modes

### Mode A: Proactive (Continuous)
**Always running:**
- Research Associate scans news every 2 hours
- CMO prepares next day's content
- Engineer maintains and improves tools
- Senior Analyst works on weekly deep-dives

### Mode B: Reactive (Event-Driven)
**Trigger-based:**
- Breaking news → Immediate research task
- Market volatility → Alert + analysis
- Competitor announcement → Response strategy
- User request → Priority queue

### Mode C: Project Mode (Focused)
**Sprint-based:**
- 1-2 week focused projects
- All agents collaborate
- Daily standups (automated reports)
- Demo at completion

## Task Generation

### Time-Based Triggers

**Daily (00:00 Berlin):**
| Task | Agent | Priority |
|------|-------|----------|
| Generate Morning Brief | research-associate | P1 |
| Prepare 3 X posts | cmo | P1 |
| Prepare 3 Threads posts | cmo | P1 |
| Check competitor news | research-associate | P1 |

**Weekly (Sunday 20:00):**
| Task | Agent | Priority |
|------|-------|----------|
| Compile Weekly Strategy Digest | senior-analyst | P1 |
| Plan next week's content themes | cmo | P2 |
| Review performance metrics | senior-analyst | P1 |

**Continuous (every 2h):**
| Task | Agent | Priority |
|------|-------|----------|
| Scan fashion/luxury news | research-associate | P2 |
| Monitor social engagement | cmo | P2 |
| Check tool health | engineer | P1 |

### Event-Based Triggers

```typescript
// Breaking news response
{
  eventType: "breaking_news",
  priority: "p0",
  deadline: "60 minutes",
  response: "Immediate research task"
}

// Market volatility
{
  eventType: "market_volatility",
  priority: "p1",
  deadline: "120 minutes",
  response: "Analysis + alert"
}

// Competitor action
{
  eventType: "competitor_action",
  priority: "p1",
  deadline: "180 minutes",
  response: "Competitive analysis"
}
```

## Priority Scoring

Tasks are scored 0-100 based on:

| Factor | Weight | Description |
|--------|--------|-------------|
| Base Priority | 30% | P0=90, P1=70, P2=50 |
| Revenue Impact | 25% | Direct revenue tasks score higher |
| Time Sensitivity | 25% | Deadline proximity boosts score |
| Strategic Alignment | 20% | Matches active goals |
| Agent Availability | 15% | More available = higher priority |
| Dependencies | 10% | Blocked until deps complete |
| Quality Risk | 5% | Retry history affects score |

## Agent Assignment

### Workload Limits
- Maximum 3 concurrent tasks per agent
- Overloaded agents (>2 tasks) deprioritized
- Idle agents get first pick of new tasks

### Capability Matching
```typescript
const ROLE_CAPABILITIES = {
  "senior-analyst": ["analysis", "research", "strategy", "deep_dive", "review"],
  "research-associate": ["research", "monitoring", "daily_brief", "news_scan"],
  "cmo": ["content", "marketing", "social_media", "branding", "campaign"],
  "engineer": ["build", "maintenance", "tool_development", "automation"],
};
```

### Escalation
- P0 tasks can be assigned to any available agent
- Stuck tasks (>4h) auto-reassigned
- Failed tasks retry up to 3 times before manual review

## Swarm Coordination

Multi-agent workflows for complex projects:

```typescript
// Example: Breaking News Response
const workflow = {
  name: "Breaking News Response",
  steps: [
    { agent: "research-associate", task: "Gather facts", duration: "10min" },
    { agent: "senior-analyst", task: "Analyze implications", dependsOn: [0] },
    { agent: "cmo", task: "Draft social response", dependsOn: [1] },
    { agent: "cso", task: "Review and approve", dependsOn: [2] },
  ],
};
```

## Monitoring & Health

### Auto-Retry Logic
- Failed tasks retry with exponential backoff
- Max 3 retry attempts
- After 3 failures → escalate to manual review

### Stuck Task Detection
- Tasks running >4 hours marked as "stuck"
- Auto-reassigned if possible
- CEO notified

### Health Metrics
- Tasks completed (24h)
- Average task duration
- Success rate
- Queue depth
- Agent utilization

## API Quick Reference

### Pipeline Control
```bash
# Start the pipeline
./launch.sh start

# Stop the pipeline
./launch.sh stop

# Check status
./launch.sh status

# Trigger manual tick
./launch.sh tick

# View diagnostics
./launch.sh diagnose
```

### Convex Functions

**Worker**
- `pipeline.worker.tick` - Main orchestration tick
- `pipeline.worker.getPipelineStatus` - Get current status
- `pipeline.worker.setPaused` - Pause/resume pipeline
- `pipeline.worker.setMode` - Change operation mode

**Generator**
- `pipeline.generator.generateTasksFromTemplates` - Create scheduled tasks
- `pipeline.generator.createEventTriggeredTask` - Event-driven task creation
- `pipeline.generator.createManualTask` - Manual task injection

**Prioritizer**
- `pipeline.prioritizer.recalculateAllPriorities` - Re-score queue
- `pipeline.prioritizer.boostUrgentJobs` - Deadline-based boosting

**Router**
- `pipeline.router.assignPendingTasks` - Assign jobs to agents
- `pipeline.router.getAgentAvailability` - Check agent status
- `pipeline.router.balanceWorkload` - Redistribute tasks

**Monitor**
- `pipeline.monitor.checkStuckTasks` - Find stuck tasks
- `pipeline.monitor.retryFailedTasks` - Auto-retry failures
- `pipeline.monitor.getPipelineHealth` - Health check
- `pipeline.monitor.getExecutionReport` - Performance report

**Delivery**
- `pipeline.delivery.deliverOutput` - Process completed work
- `pipeline.delivery.queueForReview` - Queue for manual review
- `pipeline.delivery.scheduleToPostiz` - Schedule social content

## Configuration

### Environment Variables
```bash
# Pipeline settings
PIPELINE_MODE=proactive          # proactive | reactive | project
PIPELINE_TICK_INTERVAL=300       # seconds between ticks
PIPELINE_MAX_WORKLOAD=3          # max tasks per agent

# Notifications
NOTIFY_TASK_COMPLETE=true
NOTIFY_TASK_FAILED=true
NOTIFY_STUCK_TASK=true
NOTIFY_DAILY_DIGEST=true

# Operating hours (optional)
OPERATING_START=0               # 00:00
OPERATING_END=24                # 24:00
TIMEZONE=Europe/Berlin
```

### Task Templates
Edit templates in Convex:
```typescript
// Daily morning brief
taskTemplates.insert({
  name: "morning_brief",
  type: "daily_brief",
  agentRole: "research-associate",
  priority: "p1",
  cronExpression: "0 0 * * *",  // Midnight
  contextTemplate: "Generate morning brief...",
});
```

## Dashboard

Access the Pipeline Dashboard at:
```
http://localhost:3000/pipeline
```

Features:
- **Live Status**: Who's working on what (real-time)
- **Queue**: Pending tasks with priority scores
- **Completed**: Last 24h deliverables
- **Metrics**: Tasks/hour, success rate, avg completion time
- **Agent Workload**: Individual agent capacity
- **Override Controls**: Pause, force assign, change priority

## Troubleshooting

### Pipeline Not Starting
```bash
# Check dependencies
node --version
npx --version

# Initialize convex
npx convex dev

# Run setup
./launch.sh init
```

### Tasks Not Being Assigned
1. Check agent availability: `./launch.sh diagnose`
2. Verify agents are not at max workload
3. Check for stuck tasks consuming capacity
4. Try manual assignment via dashboard

### High Failure Rate
1. Check recent errors in logs: `./launch.sh logs`
2. Review stuck tasks: `pipeline.monitor.checkStuckTasks`
3. Verify agent capabilities match task types
4. Consider lowering task complexity

### Emergency Stop
If the pipeline needs immediate shutdown:
```bash
./launch.sh stop
# Or use the Emergency Stop button in dashboard
```

## Success Criteria Checklist

- [x] Pipeline generates tasks automatically
- [x] Agents work continuously without manual assignment
- [x] Tasks are prioritized intelligently
- [x] Failed tasks auto-retry (max 3)
- [x] CEO gets notified of important completions
- [x] Dashboard shows live 24/7 operation
- [x] Can switch between Proactive/Reactive/Project modes
- [x] Swarm workflows execute multi-step projects

## Integration with Existing Systems

### Mission Control
- Org Chart shows live agent status
- Task Manager displays pipeline queue
- Activity Feed logs all auto-actions

### Postiz
- Auto-schedule approved content
- Queue management for optimal timing
- Content delivery via `pipeline.delivery.scheduleToPostiz`

### Cron Jobs
- Feed into pipeline instead of direct execution
- Pipeline manages scheduling intelligently
- Templates define cron expressions

## Future Enhancements

1. **ML-Based Priority Prediction**
   - Learn from historical completion times
   - Predict optimal agent-task matching

2. **Predictive Scaling**
   - Anticipate workload spikes
   - Pre-warm agent capacity

3. **Cross-Agent Learning**
   - Share insights between agents
   - Improve collective performance

4. **Advanced Workflows**
   - Conditional branching
   - Parallel execution paths
   - Dynamic workflow modification

---

**Built by Kim 🦞 with Kimi K2.5**

*The team never sleeps.*
