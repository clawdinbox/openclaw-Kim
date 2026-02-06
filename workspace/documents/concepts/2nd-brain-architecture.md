---
title: "2nd Brain Architecture"
date: "2026-02-04"
tags: [system, architecture, knowledge-management]
---

# 2nd Brain Architecture

A NextJS-based knowledge management system designed to capture, organize, and surface insights from daily work.

## Design Principles

**Obsidian meets Linear**
- Dark, focused interface
- Clean typography
- Minimal chrome, maximum content
- Sidebar navigation with category grouping

**Living documentation**
- Documents update as conversations evolve
- Daily journal entries capture context
- Concept documents explore ideas in depth

## Structure

```
workspace/
├── second-brain/          # NextJS app
│   ├── src/
│   │   ├── app/           # Pages
│   │   ├── components/    # UI components
│   │   └── lib/           # Document utilities
│   └── package.json
└── documents/             # Content (markdown)
    ├── journal/           # Daily entries
    └── concepts/          # Topic deep-dives
```

## Document Format

Each document is a markdown file with optional YAML frontmatter:

```yaml
---
title: "Document Title"
date: "2026-02-04"
tags: [tag1, tag2]
---

# Content starts here
```

## Behavior

- Documents are read at request time (always fresh)
- Journal entries sort by date (newest first)
- Categories derive from folder structure
- Slugs use `__` as path separator for URL safety

## Future Enhancements

- Full-text search
- Backlinks / graph view
- Tags page
- Edit mode (inline markdown editing)
- Export to PDF / Obsidian vault
