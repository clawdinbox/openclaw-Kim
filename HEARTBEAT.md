# HEARTBEAT.md

## Check Rotation (rotate through these)
| Check | Frequency | Last Checked |
|-------|-----------|--------------|
| Memory | Every 2h | See state |
| Git status | Every 2h | See state |
| Apple Notes | Daily | See state |
| Weather | 8am-6pm only | See state |

## State Tracking
Track in `memory/heartbeat-state.json`:
```json
{
  "lastChecks": {
    "memory": 1703275200,
    "git": 1703275200,
    "notes": 1703188800,
    "weather": 1703260800
  }
}
```

## Rules
- Be concise. Report only if action needed.
- All clear? Reply: "All clear — no action needed."
- Don't repeat known info.
- Respect quiet hours (23:00-08:00).
