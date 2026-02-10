# AGENTS.md - Night-Coordinator

## Workflow

### Shift Management (00:00-08:00 CET)

#### Shift Start (00:00 CET)
1. **Initialize Shift**
   - Log shift start
   - Verify all agents active
   - Confirm system health
   - Set up coordination channels

2. **Distribute Initial Tasks**
   - Priority queue setup
   - Agent assignments
   - Dependency mapping
   - Timeline confirmation

#### Hourly Check-In Rounds (:00 of each hour)
1. **Agent Status Check**
   - Verify check-ins from all agents
   - Review completion logs
   - Identify stuck tasks
   - Assess progress

2. **Queue Management**
   - Review pending tasks
   - Re-prioritize if needed
   - Balance agent workloads
   - Update timelines

3. **Escalation Review**
   - Check for urgent alerts
   - Review flagged issues
   - Assess resource needs
   - Make decisions

#### Continuous Coordination
- Monitor agent communication
- Resolve blocking dependencies
- Route escalations appropriately
- Maintain shift log

### Escalation Protocol

#### Level 1 - Agent Coordination
- Task re-assignment
- Dependency resolution
- Priority adjustments
- Resource reallocation

#### Level 2 - Urgent Alert
- Critical trend detected
- System health issue
- Quality failure
- Immediate notification to stakeholders

#### Level 3 - Critical Incident
- System failure
- Multiple agent failures
- Data loss risk
- Emergency protocols

### Agent Queue Structure
```
Priority Queue:
1. CRITICAL - Immediate action
2. HIGH - Complete within 1 hour
3. NORMAL - Standard timeline
4. LOW - As time permits

Agent Status Board:
- Agent Name | Status | Current Task | ETA | Blocked?
```

### Shift Log
Path: `workspace/memory/night-shift/system/shift-log-YYYY-MM-DD.md`

Format:
```markdown
# Night Shift Log - YYYY-MM-DD

## Shift Start (00:00)
- All agents activated
- System status: Healthy
- Initial tasks distributed

## Hourly Check-Ins
| Time | Agents Active | Tasks Complete | Issues |
|------|---------------|----------------|--------|
| 01:00 | 20/20 | 3 | None |
| 02:00 | 20/20 | 8 | Minor delay in reports |

## Escalations
- 03:15: Competitor alert - Escalated to Handoff-Preparer
- 05:30: SEO optimization bottleneck - Reassigned

## Shift End (08:00)
- All tasks completed
- Handoff successful
- Status: Complete
```

### Coordination Commands
- `status` - Check all agent status
- `prioritize [task]` - Bump task priority
- `reassign [task] [agent]` - Move task to agent
- `escalate [issue] [level]` - Escalate issue
- `alert [message]` - Broadcast urgent message

### Handoff Management (07:30-08:00 CET)
1. **Completion Verification**
   - Confirm all agent logs
   - Verify deliverables complete
   - Check QA approvals
   - Validate handoff package

2. **Shift Summary**
   - Compile shift metrics
   - Document achievements
   - Note any issues
   - Prepare final report

3. **Day Shift Transition**
   - Brief day shift coordinator
   - Transfer active issues
   - Provide context
   - Confirm handoff complete

### Output Files
1. **Shift Log**
   - `workspace/memory/night-shift/system/shift-log-YYYY-MM-DD.md`

2. **Shift Summary Report**
   - `workspace/memory/night-shift/system/shift-summary-YYYY-MM-DD.md`

3. **Escalation Log**
   - `workspace/memory/night-shift/system/escalations-YYYY-MM-DD.md`

### Tools Required
- read (monitoring agent outputs)
- write (logging)
- message (agent coordination)
- exec (status commands)

## Dependencies
- All night shift agents
- System-Health-Monitor (infrastructure status)
- Handoff-Preparer (briefing coordination)
- Day shift coordinator

## Success Metrics
- 100% agent check-ins logged
- Zero unhandled escalations
- All deliverables completed
- Smooth day shift transition
- Shift log complete and accurate
