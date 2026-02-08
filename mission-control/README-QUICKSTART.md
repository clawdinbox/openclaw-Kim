# 🚀 Mission Control - Quick Start Guide

**One-command setup for Marcel's AI Agent Company Dashboard**

---

## ⚡ One-Liner Install

```bash
cd mission-control && ./launch.sh
```

That's it! The launcher will:
- ✅ Check all prerequisites
- ✅ Install dependencies
- ✅ Start Convex database
- ✅ Seed 6 agents into the org chart
- ✅ Start the Next.js dashboard
- ✅ Open your browser automatically

---

## 📋 Prerequisites

Before running, make sure you have:

| Requirement | Version | Check Command |
|-------------|---------|---------------|
| Node.js | 18+ | `node --version` |
| npm | 9+ | `npm --version` |

**Install Node.js:**
- **macOS:** `brew install node` or download from [nodejs.org](https://nodejs.org/)
- **Linux:** `sudo apt install nodejs npm` or use nvm
- **Windows:** Download from [nodejs.org](https://nodejs.org/)

---

## 🕸️ Org Chart

Mission Control comes pre-configured with 6 AI agents:

```
                    ┌─────────────┐
                    │   Marcel    │
                    │     CEO     │
                    │   👔 👁️    │
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  Kim 🦞    │
                    │     CSO     │
                    │  Coordinator│
                    └──────┬──────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
           ▼               ▼               ▼
    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
    │   Senior    │ │  Research   │ │   CMO      │
    │   Analyst   │ │  Associate  │ │   Social   │
    │   📊 📈    │ │   🔍 📰    │ │   📢 📱   │
    └─────────────┘ └─────────────┘ └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │   Lead      │
                    │  Engineer   │
                    │   ⚡ 🛠️   │
                    └─────────────┘
```

### Agent Roles

| Agent | Role | Department | Capabilities |
|-------|------|------------|--------------|
| **Marcel** | CEO | Strategy | Vision, strategic decisions, observer |
| **Kim 🦞** | CSO | Strategy | Coordination, delegation, quality control |
| **Senior Analyst** | Research Lead | Research | Deep research, financial modeling |
| **Research Associate** | Intelligence | Research | Daily briefs, signal detection |
| **CMO Social** | Marketing Lead | Marketing | Content strategy, campaigns |
| **Lead Engineer** | Tech Lead | Engineering | Tools, automation, integrations |

---

## 🎯 Using Mission Control

### 1. Dashboard Overview

Once launched, your browser opens to **http://localhost:3000**

You'll see:
- **Activity Feed** - Real-time updates from all agents
- **Task Management** - Create, assign, and track tasks
- **Organization Chart** - Visual hierarchy of your AI team
- **Agent Status** - Who's working on what

### 2. Delegating Tasks

1. Go to **Task Management** tab
2. Click **"New Task"**
3. Select an agent to assign
4. Set priority (P0 = urgent, P1 = high, P2 = normal)
5. Add description with context
6. Click **Delegate**

The assigned agent's status will automatically update to "working"!

### 3. Swarm Capabilities

Use swarm mode for multi-agent workflows:

```
Kim (CSO) → Delegates to Senior Analyst
     ↓
Senior Analyst → Research complete → Submit for review
     ↓
Kim (CSO) → Approves → Task complete
```

Or spawn parallel work:

```
Kim (CSO) → Research Task → Senior Analyst
        → Social Task → CMO
        → Build Task → Engineer
```

---

## 🛠️ Common Commands

### Start Everything
```bash
./launch.sh
```

### Just the Database
```bash
npx convex dev
```

### Just the Dashboard
```bash
npm run dev
```

### Seed Database (re-run)
```bash
npx tsx scripts/setup-agents.ts
```

### Check Health
```bash
node scripts/health-check.js
```

---

## 🔧 Troubleshooting

### Port Already in Use

**Problem:** `Port 3210 is already in use`

**Solution:** The launcher will ask if you want to kill the existing process. Type `Y` and press Enter.

Or manually:
```bash
# Find and kill process on port 3210
lsof -ti:3210 | xargs kill -9

# Or for port 3000
lsof -ti:3000 | xargs kill -9
```

### Convex Connection Failed

**Problem:** `Waiting for Convex...` hangs

**Solution:**
1. Check if Convex is running: `curl http://127.0.0.1:3210/api/health`
2. Restart: Stop with Ctrl+C, then run `./launch.sh` again
3. Check Convex logs for errors

### Missing Dependencies

**Problem:** `Cannot find module 'convex'`

**Solution:**
```bash
npm install
```

### Database Seeding Failed

**Problem:** Agents don't appear in the dashboard

**Solution:**
```bash
# Re-seed manually
export NEXT_PUBLIC_CONVEX_URL=http://127.0.0.1:3210
npx tsx scripts/setup-agents.ts
```

### Next.js Won't Start

**Problem:** Port 3000 in use

**Solution:** The launcher will suggest using a different port (like 3001). Just press Enter to accept.

---

## 🌐 Service URLs

| Service | URL | Description |
|---------|-----|-------------|
| Dashboard | http://localhost:3000 | Main Mission Control UI |
| Convex API | http://127.0.0.1:3210 | Backend database API |
| Convex Admin | http://127.0.0.1:6790 | Database admin interface |

---

## 📁 Project Structure

```
mission-control/
├── launch.sh              ← ⭐ One-command launcher
├── README-QUICKSTART.md   ← This file
├── package.json           # Dependencies
├── convex/                # Database & backend
│   ├── schema.ts         # Data models
│   ├── agents.ts         # Agent mutations
│   └── tasks.ts          # Task mutations
├── scripts/               # Setup scripts
│   ├── setup-agents.ts   # Seed database
│   └── health-check.js   # Health verification
├── app/                   # Next.js pages
│   ├── page.tsx          # Dashboard
│   └── ...
└── components/            # UI components
    └── ...
```

---

## 🎮 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+C` | Stop all services |
| `Cmd+Click` (macOS) / `Ctrl+Click` (Linux) | Open links |

---

## 💡 Tips

1. **Keep it running** - Leave the terminal open while using Mission Control
2. **Auto-reload** - Changes to code automatically refresh the browser
3. **Check activities** - The activity feed shows everything happening
4. **Use priorities** - P0 for urgent, P1 for important, P2 for normal
5. **Seed anytime** - Re-run setup-agents.ts to reset with fresh data

---

## 🆘 Getting Help

If something goes wrong:

1. Check the error message in the terminal
2. Look at **Common Issues** above
3. Try restarting: `Ctrl+C`, then `./launch.sh`
4. Check if ports are clear: `lsof -i :3210` and `lsof -i :3000`

---

## ✨ What's Next?

Once running, try:

1. ✅ Create your first task
2. ✅ Assign it to an agent
3. ✅ Watch the activity feed update
4. ✅ Explore the Org Chart
5. ✅ Mark a task complete

---

**Happy commanding! 🚀**

Built for Marcel by Kim 🦞
