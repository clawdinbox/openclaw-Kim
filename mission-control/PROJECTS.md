# Project Management System - Documentation

## Overview

The Project Management System in Mission Control allows you to track projects with folders, tasks, and progress monitoring. It integrates with the existing Task Manager, Pipeline, and Activity Feed systems.

## Features

- **Project Organization**: Organize projects into folders (Content, Product, Research, Operations, Revenue)
- **Task Tracking**: Kanban board with Todo → In Progress → Review → Done workflow
- **Progress Monitoring**: Automatic progress calculation based on task completion
- **Team Assignment**: Assign project owners and team members
- **Activity Feed**: Track updates, milestones, blockers, and decisions
- **Project Templates**: Auto-create tasks from predefined templates

## Database Schema

### Projects Table
```typescript
{
  name: string;
  description: string;
  status: "planning" | "active" | "on-hold" | "completed" | "cancelled";
  priority: "p0" | "p1" | "p2";
  owner: Id<"agents">;
  team: Id<"agents">[];
  startDate: number;
  targetDate?: number;
  completedAt?: number;
  progress: number; // 0-100
  tags: string[];
  folder: string;
  template?: string;
}
```

### Project Tasks Table
```typescript
{
  projectId: Id<"projects">;
  title: string;
  description: string;
  assignedTo: Id<"agents">;
  status: "todo" | "in-progress" | "review" | "done";
  priority: "p0" | "p1" | "p2";
  dependencies: Id<"projectTasks">[];
  estimatedHours?: number;
  actualHours?: number;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  order: number;
}
```

### Project Updates Table
```typescript
{
  projectId: Id<"projects">;
  agentId: Id<"agents">;
  message: string;
  type: "progress" | "blocker" | "milestone" | "decision";
  timestamp: number;
}
```

## UI Components

### ProjectsDashboard
Main dashboard showing:
- Grid view of all projects
- Stats overview (total, active, planning, completed, overdue)
- Search and filter by folder, status, priority
- Folder-based organization view

### ProjectDetail
Detailed project view with:
- Project header (name, status, progress, dates)
- Task board (Kanban)
- Activity feed
- Team members
- Quick stats sidebar

### CreateProjectModal
Multi-step project creation:
1. Project details (name, description, folder, priority, target date)
2. Team selection (owner and team members)
3. Template selection (optional)

### TaskBoard
Kanban board for project tasks:
- Drag-and-drop task cards
- Quick status change
- Task details dialog
- Create new tasks

### ProjectFolders
Sidebar navigation for organizing projects by folder

## Convex Functions

### Projects
- `list` - Query with filters (status, folder, priority, owner)
- `get` - Single project with tasks, team, and updates
- `create` - New project with optional template
- `update` - Update project status/progress
- `archive` - Soft delete
- `getDashboard` - Stats overview
- `getFolders` - List all folders with counts

### Project Tasks
- `listByProject` - All tasks for a project
- `create` - Add task
- `updateStatus` - Move between columns
- `assign` - Change assignee
- `reorder` - Prioritize within status
- `update` - Edit task details
- `deleteTask` - Remove task

### Project Updates
- `list` - Activity feed for a project
- `create` - Post update
- `getRecent` - Recent updates across projects
- `getBlockers` - Recent blocker updates

### Project Templates
- `initializeTemplates` - Create default templates
- `list` - Get all enabled templates

## Project Templates

### 1. Content Campaign
Folder: Content
Tasks:
- Research & Strategy
- Draft Content
- Design Assets
- Review & Edit
- Publish & Distribute

### 2. Product Launch
Folder: Product
Tasks:
- Market Validation
- Product Design
- Copy & Messaging
- Pricing Strategy
- Launch Execution
- Sales Enablement

### 3. Research Report
Folder: Research
Tasks:
- Data Collection
- Data Analysis
- Report Writing
- Review & QA
- Delivery & Presentation

### 4. Tool Build
Folder: Product
Tasks:
- Technical Specification
- Development
- Testing & QA
- Deployment
- Monitoring Setup

### 5. Operations Initiative
Folder: Operations
Tasks:
- Process Analysis
- Solution Design
- Implementation
- Validation

### 6. Revenue Initiative
Folder: Revenue
Tasks:
- Opportunity Analysis
- Strategy Development
- Execution
- Performance Tracking

## Usage

### Creating a Project
1. Click "New Project" button
2. Fill in project name, description
3. Select folder and priority
4. Set target date (optional)
5. Select owner and team members
6. Choose template (optional)
7. Submit

### Managing Tasks
1. Open project detail
2. Navigate to "Task Board" tab
3. Click "Add Task" to create tasks
4. Drag or use dropdown to change status
5. Click task card for details

### Posting Updates
1. Open project detail
2. Navigate to "Activity" tab
3. Type update message
4. Select type (progress, blocker, milestone, decision)
5. Click "Post Update"

### Progress Tracking
Progress is automatically calculated based on task completion:
- Each completed task contributes to overall progress
- Progress updates trigger milestone notifications at 25%, 50%, 75%, 100%

## Integration with Existing Systems

### Task Manager
- Projects appear in Task Manager
- Project tasks sync with agent assignments
- Pipeline can create project tasks

### Pipeline
- Pipeline can auto-create projects from triggers
- Projects feed tasks into the pipeline
- Completion updates pipeline metrics

### Activity Feed
- Project updates appear in main Activity Feed
- Filter by project
- Blockers escalate visibility

## Folder Structure

```
Projects/
├── Content/         # Marketing content, campaigns
├── Product/         # Product development, launches
├── Research/        # Analysis reports, studies
├── Operations/      # Internal processes, tools
└── Revenue/         # Sales, pricing, growth
```

## Best Practices

1. **Use Templates**: Start projects from templates for consistency
2. **Set Target Dates**: Helps track overdue projects
3. **Regular Updates**: Post progress updates to keep team informed
4. **Clear Priorities**: Use P0 for critical, P1 for high, P2 for normal
5. **Blocker Visibility**: Flag blockers immediately for quick resolution
6. **Task Dependencies**: Link dependent tasks to show blockers

## Future Enhancements

- Gantt chart view
- Time tracking reports
- Resource allocation view
- Project templates editor
- Automated status transitions
- Integration with external calendars
