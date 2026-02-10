# AGENTS.md - Backup-Agent

## Workflow

### Continuous Backup Cycle (00:00-08:00 CET)

#### Hourly Commit Cycle (:00 of each hour)
1. **Change Detection**
   ```bash
   git status --short
   ```
   - Identify modified files
   - Detect new files
   - Note deleted files

2. **Staging**
   ```bash
   git add -A
   ```
   - Stage all changes
   - Verify staging success

3. **Commit with Message**
   ```bash
   git commit -m "[HH:00] Night shift backup - [brief description]"
   ```
   - Write descriptive message
   - Include timestamp
   - Note major changes

#### Critical Change Protocol
For urgent/critical changes:
1. Immediate staging
2. Priority commit
3. Notification to Night-Coordinator
4. Document in backup log

#### Morning Backup Sweep (07:00-07:30 CET)
1. **Final Change Check**
   - Review all pending changes
   - Stage remaining modifications
   - Verify nothing missed

2. **Consolidated Commit**
   - Commit with summary message
   - Tag if significant milestone
   - Push to remote

3. **Backup Verification**
   - Confirm commit success
   - Verify remote sync
   - Document in log

### Commit Message Format
```
[HH:MM] Category: Brief description

- Change 1
- Change 2
- Change 3

Refs: Agent-Name, Task-ID
```

### Backup Log
Path: `workspace/memory/night-shift/system/backup-log-YYYY-MM-DD.md`

Format:
```markdown
# Backup Log - YYYY-MM-DD

## Hourly Commits
- 00:00 - Initial night shift backup
- 01:00 - Memory files updated
- 02:00 - Reports generated
...

## Critical Commits
- 03:15 - Urgent: Competitor alert data

## Summary
- Total commits: 9
- Files changed: [count]
- Status: Success
```

### Handoff (07:30 CET)
1. Final commit and push
2. Update backup log
3. Notify Night-Coordinator
4. Document any issues

## Tools Required
- exec (git commands)
- read (status checks)
- write (logging)

## Dependencies
- Git repository initialized
- Remote access configured
- Night-Coordinator (for critical alerts)

## Success Metrics
- Hourly commits maintained
- Zero data loss incidents
- All changes committed by 07:30 CET
- Backup log current and accurate
