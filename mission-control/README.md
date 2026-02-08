# Mission Control: AI Agent Company

The operating system for a digital AI company. Manage a team of specialized AI agents with task delegation, progress tracking, and real-time collaboration.

## Architecture

```
CEO (Marcel) → CSO (Kim) → 4 Department Heads
                              ├── Senior Research Analyst (Research)
                              ├── Research Associate (Research)
                              ├── CMO Social (Marketing)
                              └── Lead Software Engineer (Engineering)
```

## Quick Start

### 1. Setup Database

```bash
cd mission-control
npx convex dev
# In another terminal:
npx tsx scripts/setup-agents.ts
```

### 2. Start Development Server

```bash
npm run dev
```

### 3. Access Dashboard

Open `http://localhost:3000` and navigate to:
- **Organization** tab - View agent hierarchy and status
- **Task Management** tab - Delegate and track tasks

## File Structure

```
mission-control/
├── agents/                      # Role definition prompts
│   ├── senior-research-analyst.md
│   ├── research-associate.md
│   ├── cmo-social.md
│   └── lead-software-engineer.md
├── components/                  # React components
│   ├── OrgChart.tsx            # Organization hierarchy visualization
│   ├── TaskManager.tsx         # Task CRUD and tracking
│   ├── TaskCreationForm.tsx    # Task delegation form
│   ├── AgentCard.tsx           # Reusable agent card
│   ├── TeamStatusWidget.tsx    # Sidebar team status
│   └── ActivityFeed.tsx        # Activity log
├── lib/
│   └── agentSpawner.ts         # Agent spawning utilities
├── convex/                     # Backend
│   ├── schema.ts               # Database schema
│   ├── agents.ts               # Agent queries/mutations
│   └── tasks.ts                # Task queries/mutations
└── scripts/
    └── setup-agents.ts         # Database seeding
```

## Agent Roles

### Senior Research Analyst
- **Department:** Research (Blue)
- **Specialty:** Deep-dive analysis, market research, strategic frameworks
- **Output:** 800-1200 word reports with frameworks and recommendations
- **Typical Tasks:** Market analysis, company deep-dives, trend reports

### Research Associate
- **Department:** Research (Blue)
- **Specialty:** Signal detection, daily intelligence, data collection
- **Output:** Daily briefs, data packages, trend monitoring
- **Typical Tasks:** Daily briefs, competitor monitoring, data gathering

### CMO Social
- **Department:** Marketing (Green)
- **Specialty:** Content strategy, campaigns, audience growth
- **Output:** Content calendars, campaign plans, performance reports
- **Typical Tasks:** Weekly calendars, campaign planning, analytics

### Lead Software Engineer
- **Department:** Engineering (Purple)
- **Specialty:** Tool building, automation, integrations
- **Output:** Tools, scripts, integrations, documentation
- **Typical Tasks:** Tool development, API integrations, automation

## Usage Guide

### Delegating Tasks

**Via UI:**
1. Go to Task Management tab
2. Click "New Task"
3. Fill in details and assign to agent
4. Set priority (P0/P1/P2) and deadline

**Via Code:**
```typescript
import { useAgentSpawner, QuickSpawns } from "@/lib/agentSpawner";

const { spawnAgent, spawnFromTemplate } = useAgentSpawner();

// Method 1: Direct spawn
await spawnAgent({
  role: "senior-analyst",
  task: "Analyze LVMH Q4 earnings...",
  priority: "p1",
  deadline: Date.now() + 3 * 24 * 60 * 60 * 1000,
});

// Method 2: Template spawn
await spawnFromTemplate(
  "research-associate",
  "daily-brief",
  { date: "2026-02-08" },
  "p0"
);

// Method 3: Quick spawn helpers
const task = QuickSpawns.marketAnalysis("Luxury resale market");
```

### Task Lifecycle

```
PENDING → IN-PROGRESS → REVIEW → COMPLETE
   ↑          ↓            ↓
   └──────────┴────────────┘ (revisions)
```

1. **Create:** CSO creates task, assigned to agent
2. **Start:** Agent begins work, status updates
3. **Submit:** Agent delivers output, moves to review
4. **Review:** CSO evaluates and rates quality (1-5)
5. **Complete:** Task done or revision requested

### Monitoring

- **OrgChart:** Visual hierarchy with real-time status
- **Team Status Widget:** Quick view of who's working on what
- **Activity Feed:** Real-time updates on task progress
- **Performance Stats:** Tasks completed, average quality scores

## Database Schema

### Agents Table
- `role`: Agent role identifier
- `status`: idle | working | blocked | offline
- `currentTask`: What they're working on
- `performance`: Tasks completed, avg quality, last active
- `capabilities`: Array of skills

### Tasks Table
- `title`, `description`: Task details
- `assignedTo`: Target agent role
- `status`: pending | in-progress | review | complete
- `priority`: p0 | p1 | p2
- `output`: Path to deliverable
- `quality`: 1-5 rating

## Customization

### Adding New Agent Roles

1. Create role prompt file in `/agents/`
2. Add to Convex schema
3. Update seed function
4. Add to OrgChart color mapping

### Adding Task Templates

Edit `/lib/agentSpawner.ts`:
```typescript
TASK_TEMPLATES["role-name"]["template-key"] = {
  title: "Template: {variable}",
  description: "Do something with {variable}",
  category: "Category",
};
```

## API Reference

### Convex Queries
- `api.agents.list` - Get all agents
- `api.agents.getByRole` - Get agent by role
- `api.agents.getStatus` - Get team status overview
- `api.tasks.list` - Get tasks (with filters)
- `api.tasks.getDashboard` - Get dashboard data

### Convex Mutations
- `api.tasks.create` - Create new task
- `api.tasks.start` - Mark task as started
- `api.tasks.submitForReview` - Submit output
- `api.tasks.approve` - Approve and rate task
- `api.tasks.requestRevision` - Send back for changes

## Environment Variables

```bash
NEXT_PUBLIC_CONVEX_URL=https://your-convex-url.convex.cloud
```

## Troubleshooting

**Agents not showing:**
- Run `npx tsx scripts/setup-agents.ts`
- Check Convex dashboard for data

**Tasks not updating:**
- Verify Convex subscription is active
- Check browser console for errors

**Permission errors:**
- Ensure you're authenticated (CSO role)
- Check Convex auth configuration

## Roadmap

- [ ] Real-time agent session spawning
- [ ] Automated task assignment based on workload
- [ ] Agent performance analytics dashboard
- [ ] Integration with external AI providers
- [ ] Mobile app for on-the-go delegation
