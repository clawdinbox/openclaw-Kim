---
title: "Second Brain Architecture"
date: 2026-02-04
---

# Second Brain Architecture

The 2nd Brain is a NextJS document viewer that displays markdown files created during our work together.

## Structure

```
workspace/
├── second-brain/          # NextJS app
│   └── src/
│       ├── app/           # Pages
│       └── lib/           # Document parsing
└── documents/             # Content
    ├── journal/           # Daily summaries
    └── concepts/          # Deep-dive topics
```

## Document Types

### Journal Entries
- Created daily
- High-level summary of discussions
- Decisions made, tasks completed
- Path: `documents/journal/YYYY-MM-DD.md`

### Concept Documents
- Created when important topics come up
- Deep exploration of ideas
- Reference material for future work
- Path: `documents/concepts/[topic-slug].md`

## Auto-Generation

Kim creates documents automatically when:
- A significant concept is discussed in depth
- Daily journal entries need updating
- Research reports contain reusable insights

## Design Philosophy

Inspired by Obsidian (local-first, markdown) + Linear (clean, minimal, fast).

- Dark theme, purple accents
- Clean typography
- Fast navigation
- No bloat
