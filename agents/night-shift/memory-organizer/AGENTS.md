# AGENTS.md - Memory-Organizer

## Workflow

### Continuous Organization Cycle (00:00-08:00 CET)

#### Real-Time Organization
1. **File Arrival Processing**
   - Monitor for new files
   - Validate file locations
   - Move to correct directories
   - Update indexes

2. **Naming Convention Check**
   - Verify YYYY-MM-DD format
   - Check agent naming
   - Standardize if needed
   - Document changes

#### Deep Clean (02:00-04:00 CET)
1. **Duplicate Detection**
   - Scan for duplicate content
   - Identify redundant files
   - Flag for review
   - Consolidate if appropriate

2. **Cross-Reference Linking**
   - Identify related files
   - Add reference links
   - Create connection maps
   - Update relationship index

3. **Archive Processing**
   - Identify old files (>30 days)
   - Move to archive directory
   - Maintain index references
   - Compress if needed

#### Indexing (06:00-07:30 CET)
1. **Index Updates**
   - Update main index.md
   - Refresh topic indexes
   - Verify link integrity
   - Add search keywords

2. **Search Optimization**
   - Tag files with keywords
   - Improve discoverability
   - Create quick reference
   - Update metadata

### Organization Structure
```
memory/
├── index.md (master index)
├── YYYY-MM-DD.md (current day)
├── night-shift/
│   ├── index.md
│   ├── x-trends/
│   ├── linkedin-trends/
│   ├── threads-ig-trends/
│   ├── competitor-intel/
│   ├── news-digest/
│   ├── reports/
│   ├── analysis/
│   ├── trends/
│   ├── content/
│   │   ├── social/
│   │   ├── newsletter/
│   │   ├── seo/
│   │   └── visual/
│   ├── system/
│   ├── qa/
│   └── handoff/
└── archive/
    └── YYYY-MM/
```

### Daily Tasks
- [ ] New files organized
- [ ] Naming conventions verified
- [ ] Indexes updated
- [ ] Cross-references added
- [ ] Archive processed

### Output Files
1. **Organization Report**
   - Path: `workspace/memory/night-shift/system/organization-report-YYYY-MM-DD.md`

2. **Index Updates**
   - Main: `memory/index.md`
   - Night Shift: `memory/night-shift/index.md`

### Handoff (07:30 CET)
1. Final index update
2. Document organization changes
3. Notify Night-Coordinator
4. Prepare archive for long-term storage

## Tools Required
- read (for file analysis)
- write (for organization)
- edit (for index updates)
- exec (for file operations)

## Dependencies
- File system access
- Night-Coordinator coordination
- Handoff-Preparer (for brief)

## Success Metrics
- All files properly categorized
- Index current and accurate
- Zero lost files
- Archive maintained
