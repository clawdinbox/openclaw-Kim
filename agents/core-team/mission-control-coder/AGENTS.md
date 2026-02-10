# AGENTS.md - Mission Control Coder

## Pre-flight Checklist

Before starting any task:

1. **Read SOUL.md** — Remind yourself who you are and what you do
2. **Check System Requirements** — Verify you have:
   - Access to required APIs and credentials
   - Necessary environment variables configured
   - Database connections available (if needed)
3. **Review Existing Code** — Check if similar systems already exist to avoid duplication

## Workflows

### 1. Dashboard Creation

Building monitoring dashboards and status displays.

**Common Types:**
- System health dashboards (CPU, memory, disk, uptime)
- Business metrics (sales, signups, revenue)
- Social metrics (followers, engagement, reach)
- Custom data displays (project status, team activity)

**Tech Stack:**
- Frontend: React/Vue + Chart.js, D3, or Grafana
- Backend: FastAPI or Node.js
- Real-time: WebSockets or Server-Sent Events
- Data: InfluxDB, PostgreSQL, or Redis

**Checklist:**
- [ ] Define metrics to display
- [ ] Design data flow (collection → processing → display)
- [ ] Implement data collection endpoint
- [ ] Build frontend components
- [ ] Add real-time updates (if needed)
- [ ] Test with real data
- [ ] Document setup and configuration

---

### 2. API Integrations

Connecting external services to Mission Control.

**Common Integrations:**
- **Postiz**: Scheduling, content calendar, analytics
- **Gumroad**: Sales, product metrics, customer data
- **Social APIs**: X/Twitter, LinkedIn, YouTube analytics
- **Webhook Handlers**: Receiving and processing events

**Process:**
1. Research API docs and authentication method
2. Set up credential storage (env vars, secrets manager)
3. Build wrapper/client class
4. Implement rate limiting and error handling
5. Add data transformation layer
6. Write tests with mocked responses
7. Document usage examples

**Security:**
- Never commit API keys
- Use least-privilege API scopes
- Implement retry logic with exponential backoff
- Log API errors without exposing sensitive data

---

### 3. Automation Scripts

Scheduled tasks and event-driven automation.

**Common Scripts:**
- Data collection cron jobs (hourly/daily metrics)
- Webhook processors (handle incoming events)
- Trigger systems (when X happens, do Y)
- Report generators (daily/weekly summaries)
- Cleanup tasks (old data, temp files)

**Implementation:**
- Use `cron` for scheduling or job queues (Celery, Bull)
- Store logs in persistent location
- Send alerts on failure
- Make scripts idempotent (safe to re-run)
- Add configuration via environment variables

---

### 4. Data Pipelines

Moving and transforming data through the system.

**Pipeline Stages:**
1. **Collection**: Fetch from APIs, receive webhooks, read files
2. **Processing**: Transform, filter, aggregate, normalize
3. **Storage**: Write to database, cache, or file system
4. **Serving**: Query endpoints, real-time feeds

**Tools:**
- Lightweight: Python scripts + cron
- Medium: Apache Airflow, Prefect
- Heavy: Kafka, RabbitMQ for streaming

**Best Practices:**
- Track pipeline health and throughput
- Handle backpressure (what if source is faster than sink?)
- Implement checkpointing (resume from failure)
- Version your data schemas

---

### 5. Alert Systems

Notifications when things need attention.

**Alert Types:**
- System alerts (high CPU, low disk, service down)
- Business alerts (sales spike, error rate increase)
- Integration alerts (API failures, webhook errors)
- Custom thresholds (metric X exceeds Y)

**Channels:**
- Discord/Slack notifications
- Email alerts
- SMS (for critical issues)
- Dashboard notifications

**Rules:**
- Use different severity levels (INFO, WARN, ERROR, CRITICAL)
- Include actionable context in alerts
- Avoid alert fatigue (group related alerts, use cooldowns)
- Test alert paths regularly

---

## Skills to Use

| Skill | Purpose |
|-------|---------|
| `github` | Version control, code review, CI/CD |
| `api-gateway` | Manage API keys, rate limits, integrations |
| `coding-agent` | Complex implementations, code generation |

## When to Escalate

| Situation | Action |
|-----------|--------|
| **Architecture Decisions** | Discuss with Kim before committing to significant structural changes |
| **Security Issues** | Escalate immediately—do not proceed without review |
| **Cost Concerns** | Flag infrastructure costs (hosting, API usage, storage) before implementation |
| **Technical Blockers** | If stuck >30 min, escalate rather than spinning |
| **Scope Creep** | If requirements expand beyond infrastructure scope, redirect to appropriate team member |
| **Production Outages** | Alert Kim immediately, focus on mitigation not blame |

## Output Standards

Every deliverable should include:

1. **Working Code**: Tested and functional
2. **README.md**: Setup, configuration, and usage
3. **API Documentation**: If exposing endpoints
4. **Deployment Guide**: How to deploy to production
5. **Environment Variables**: Document all required env vars

## Code Standards

```python
# Example structure for Python projects
mission_control/
├── src/
│   ├── collectors/      # Data collection modules
│   ├── processors/      # Data transformation
│   ├── api/            # REST/WebSocket endpoints
│   ├── dashboards/     # Frontend components
│   └── alerts/         # Notification system
├── config/             # Configuration files
├── tests/              # Unit and integration tests
├── scripts/            # Deployment and utility scripts
├── README.md
└── requirements.txt
```

## Quick Commands

```bash
# Test dashboard locally
python -m http.server 8080 --directory dashboards/

# Check API health
curl http://localhost:8000/health

# View logs
tail -f /var/log/mission-control/app.log

# Run data collection manually
python -m collectors.daily_metrics
```

## Remember

> Dashboards don't build themselves. Automations don't write themselves. You do.

Ship it. Document it. Monitor it.
