# AGENTS.md - System-Health-Monitor

## Workflow

### Continuous Monitoring Cycle (00:00-08:00 CET)

#### Health Checks (Every 15 minutes)
1. **CPU Check**
   ```bash
   top -l 1 | grep "CPU usage"
   ```
   - Record usage percentage
   - Alert if > 85% sustained
   - Log trend data

2. **Memory Check**
   ```bash
   vm_stat | grep "Pages free"
   ```
   - Calculate free memory
   - Alert if < 10% free
   - Track usage patterns

3. **Disk Space Check**
   ```bash
   df -h
   ```
   - Monitor all volumes
   - Alert if < 10% free
   - Identify large files

4. **Service Status Check**
   - Verify agent processes
   - Check log file activity
   - Monitor error rates

#### Hourly Diagnostics (:30 of each hour)
1. **Log Analysis**
   - Review system logs
   - Check for errors
   - Identify warnings
   - Document anomalies

2. **Performance Metrics**
   - Record CPU trends
   - Track memory growth
   - Monitor I/O activity
   - Calculate averages

3. **Agent Health Check**
   - Verify agent check-ins
   - Check for stuck processes
   - Monitor completion rates
   - Alert on failures

#### Alert Protocol
Send immediate alert to Night-Coordinator if:
- CPU > 85% for 5+ minutes
- Memory > 90% usage
- Disk < 10% free space
- Service/process failure
- Error rate spike
- Network connectivity loss

### Health Status Log
Path: `workspace/memory/night-shift/system/health-log-YYYY-MM-DD.md`

Format:
```markdown
# System Health Log - YYYY-MM-DD

## Hourly Snapshots
| Time | CPU | Memory | Disk | Status |
|------|-----|--------|------|--------|
| 00:00 | 12% | 45% | 78% | OK |
| 01:00 | 15% | 47% | 78% | OK |

## Alerts
- 02:15: CPU spike to 89% (resolved 02:18)

## Summary
- Uptime: 100%
- Issues: 1 resolved
- Status: Healthy
```

### Daily Health Report (07:00 CET)
Path: `workspace/memory/night-shift/system/health-report-YYYY-MM-DD.md`

Sections:
1. System Status Overview
2. Resource Utilization Summary
3. Incident Log
4. Performance Trends
5. Recommendations

### Handoff (07:30 CET)
1. Compile final health report
2. Note any ongoing issues
3. Alert Night-Coordinator
4. Document for day shift

## Tools Required
- exec (system commands)
- read (log files)
- write (documentation)

## Dependencies
- System monitoring access
- Night-Coordinator (for alerts)
- Handoff-Preparer (for brief)

## Success Metrics
- 32 health checks completed (every 15 min)
- 100% uptime for monitoring
- All alerts sent within 2 minutes
- Health report delivered by 07:30 CET
