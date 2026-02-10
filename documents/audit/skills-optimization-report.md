# Skills Optimization Report

**Generated:** 2026-02-10  
**Audited Skills:** 19 requested, 14 actual, 8 missing  
**Report Location:** `documents/audit/skills-optimization-report.md`

---

## Executive Summary

Out of 19 requested skills, only 14 exist with SKILL.md files. **8 skills are completely missing** (directories don't exist or lack SKILL.md). Several existing skills have inconsistencies in naming, format, and metadata. This report identifies critical gaps, standardization issues, and opportunities for consolidation.

---

## 1. Missing Skills (CRITICAL)

The following skills from the original list **do not exist** in `/Users/clawdmm/.openclaw/workspace/skills/`:

| # | Skill Name | Issue |
|---|------------|-------|
| 1 | `nano-banana-pro` | ❌ Directory does not exist |
| 2 | `nano-pdf` | ❌ Directory does not exist |
| 3 | `openai-image-gen` | ❌ Directory does not exist |
| 4 | `skill-creator` | ❌ Directory does not exist |
| 5 | `summarize` | ❌ Directory does not exist |
| 6 | `video-frames` | ❌ Directory does not exist |
| 7 | `wacli` | ❌ Directory does not exist |
| 8 | `weather` | ❌ Directory does not exist |

**Recommendation:** Either create these skills or remove them from documentation/registry if no longer needed.

---

## 2. Skills Requiring Updates

### 2.1 Naming Inconsistency

| Skill Directory | SKILL.md `name` Field | Issue |
|-----------------|----------------------|-------|
| `self-improving-agent` | `self-improvement` | ❌ Mismatch between folder name and `name` field |

**Recommendation:** Align folder name with `name` field (rename directory to `self-improvement` OR update `name` field to `self-improving-agent`).

### 2.2 Missing Version Field

| Skill | Issue |
|-------|-------|
| `atxp` | No `version` in frontmatter |
| `frontend-design` | No `version` in frontmatter |
| `github` | No `version` in frontmatter |
| `gog` | No `version` in frontmatter |
| `notion` | No `version` in frontmatter |

**Recommendation:** Add semantic versioning (e.g., `version: 1.0.0`) to all skills for dependency management.

### 2.3 Missing Homepage/Author

| Skill | Missing |
|-------|---------|
| `atxp` | No `homepage`, `author`, or `version` |
| `frontend-design` | No `homepage`, `author` |
| `github` | No `homepage`, `author`, `version` |
| `gog` | No `homepage`, `author`, `version` |
| `notion` | No `homepage`, `author`, `version` |

### 2.4 Documentation Quality Issues

| Skill | Issue | Priority |
|-------|-------|----------|
| `deep-research-pro` | References non-existent skill: `/home/clawdbot/clawd/skills/ddg-search/` | HIGH |
| `youtube-watcher` | Uses `{baseDir}` placeholder that won't expand | MEDIUM |
| `google-slides` | Inconsistent environment variable naming (`MATON_API_KEY` vs `GOOGLE_API_KEY`) | MEDIUM |
| `atxp` | Mentions auth via `~/.atxp/config` but also `$ATXP_CONNECTION` - unclear which takes precedence | MEDIUM |

---

## 3. Duplicate/Redundant Content

### 3.1 README.md Duplication

| Skill | Issue |
|-------|-------|
| `canva` | Has both README.md and SKILL.md with overlapping content |
| `deep-research-pro` | Has both README.md and SKILL.md with overlapping content |

**Recommendation:** Standardize on SKILL.md only. README.md should only exist for GitHub repos with additional context.

### 3.2 Potential Skill Overlap

| Skills | Overlap Area | Recommendation |
|--------|--------------|----------------|
| `atxp` (image/video/music) | Could overlap with `openai-image-gen` (if created) | Clarify scope: ATXP for paid API tools, openai-image-gen for OpenAI specifically |
| `deep-research-pro` | Uses web_search tool - could overlap with generic web search | Keep distinct: deep-research-pro is a workflow, not just a tool wrapper |

---

## 4. Skills That Could Be Merged

| Proposed Merge | Rationale | Confidence |
|----------------|-----------|------------|
| `clawdhub` + `skill-creator` (when created) | ClawdHub is for managing skills; skill-creator would create skills. Natural fit. | HIGH |
| `summarize` + `youtube-watcher` | Summarize could be a pattern applied to youtube transcripts. Consider making summarize a generic capability rather than a skill. | MEDIUM |
| `atxp` sub-skills | Consider splitting atxp into: `atxp-search`, `atxp-image`, `atxp-video`, `atxp-music` if they grow complex | LOW (keep unified for now) |

---

## 5. Standardization Recommendations

### 5.1 Required Frontmatter Fields

All SKILL.md files should include:

```yaml
---
name: <skill-name>           # MUST match directory name
version: "1.0.0"             # Semantic versioning
description: "..."           # One-line description
author: "Name or GitHub"     # Attribution
homepage: "https://..."      # Source/docs URL (optional but recommended)
triggers:                    # Optional: keywords that activate skill
  - "keyword1"
  - "keyword2"
metadata:                    # Optional: structured metadata
  clawdbot:
    emoji: "🎨"
    category: "design"
    requires:
      env: ["API_KEY"]
      bins: ["cli-tool"]
---
```

### 5.2 Standard Sections

Every SKILL.md should include:

1. **Description** (in frontmatter)
2. **When to Use** - Triggers/conditions for activation
3. **Setup/Prerequisites** - Required env vars, auth, installation
4. **Core Operations** - Primary commands/workflows
5. **Examples** - Concrete usage examples
6. **Error Handling** - Common errors and solutions
7. **Notes** - Additional context

### 5.3 Directory Structure Standard

```
skills/<skill-name>/
├── SKILL.md              # Required: Primary documentation
├── _meta.json            # ClawdHub metadata
├── .clawhub/             # ClawdHub internal files
├── scripts/              # Optional: Helper scripts
├── README.md             # Optional: GitHub readme (if public)
└── assets/               # Optional: Templates, samples
```

---

## 6. Missing Critical Skills (Suggested Additions)

| Skill | Purpose | Priority |
|-------|---------|----------|
| `web-search` | Generic web search wrapper (DDG, Google, etc.) | HIGH - Referenced by deep-research-pro but doesn't exist |
| `file-ops` | Common file operations (copy, move, sync, backup) | MEDIUM |
| `git-workflow` | Advanced git operations (worktrees, rebasing, etc.) | MEDIUM |
| `tmux` | Terminal multiplexing for interactive sessions | MEDIUM - Referenced by coding-agent |
| `pdf-tools` | PDF manipulation (extract text, merge, split) | LOW - Replaces missing nano-pdf? |

---

## 7. Specific Skill Recommendations

### 7.1 `deep-research-pro` - HIGH PRIORITY FIX

**Issue:** References non-existent skill path:
```bash
/home/clawdbot/clawd/skills/ddg-search/scripts/ddg
```

**Fix:** 
- Either create the `ddg-search` skill
- Or update to use the built-in `web_search` tool

### 7.2 `youtube-watcher` - MEDIUM PRIORITY FIX

**Issue:** Uses `{baseDir}` placeholder:
```bash
python3 {baseDir}/scripts/get_transcript.py
```

**Fix:** Use relative path or document how `baseDir` is resolved.

### 7.3 `google-slides` - LOW PRIORITY FIX

**Issue:** Heavy reliance on Maton gateway instead of direct API. Consider documenting both approaches.

### 7.4 `self-improving-agent` - NAMING FIX REQUIRED

**Options:**
1. Rename directory to `self-improvement` (matches `name` field)
2. Or update `name` field to `self-improving-agent`

**Recommended:** Option 1 - `self-improvement` is more standard naming.

---

## 8. Skill Registry Cleanup

### Skills NOT in Original List But Present

| Skill | Status |
|-------|--------|
| `clawdhub` | ✅ Keep - Useful for skill management |
| `coding-agent` | ✅ Keep - Codex/Claude Code integration |
| `gumroad-admin` | ✅ Keep - E-commerce admin utility |

### Skills in Original List But Missing

| Skill | Suggested Action |
|-------|------------------|
| `nano-banana-pro` | ❓ Unknown purpose - investigate or remove |
| `nano-pdf` | ❓ Unknown purpose - investigate or remove |
| `openai-image-gen` | 🔴 Likely needed - should create |
| `skill-creator` | 🟡 Nice-to-have - could merge with clawdhub |
| `summarize` | 🟡 Generic capability - may not need dedicated skill |
| `video-frames` | 🟡 Niche - create if needed |
| `wacli` | ❓ Unknown purpose - investigate or remove |
| `weather` | 🟡 Useful utility - could be simple skill |

---

## 9. Action Items Summary

### Immediate (This Week)

1. [ ] **Fix `deep-research-pro`:** Update DDG search path or create `web-search` skill
2. [ ] **Fix naming:** Rename `self-improving-agent` → `self-improvement`
3. [ ] **Add versions:** Add `version` field to: atxp, frontend-design, github, gog, notion
4. [ ] **Fix `youtube-watcher`:** Replace `{baseDir}` with working path

### Short-term (This Month)

5. [ ] **Create missing skills:** Prioritize `web-search`, `openai-image-gen`
6. [ ] **Standardize metadata:** Add consistent `author`, `homepage` fields
7. [ ] **Consolidate docs:** Remove redundant README.md files (keep in SKILL.md only)
8. [ ] **Create skill template:** Standard template for new skills

### Long-term (Next Quarter)

9. [ ] **Skill validation:** Automated checks for SKILL.md format
10. [ ] **Dependency tracking:** Track which skills depend on others
11. [ ] **Skill registry:** Central index with search/filter capabilities

---

## Appendix A: Skill Inventory

### Existing Skills (14)

| # | Directory | Name | Version | Has SKILL.md | Has README |
|---|-----------|------|---------|--------------|------------|
| 1 | atxp | atxp | ❌ | ✅ | ❌ |
| 2 | canva | canva | 1.0.0 | ✅ | ✅ (duplicate) |
| 3 | clawdhub | clawdhub | ❌ | ✅ | ❌ |
| 4 | coding-agent | coding-agent | ❌ | ✅ | ❌ |
| 5 | deep-research-pro | deep-research-pro | 1.0.0 | ✅ | ✅ (duplicate) |
| 6 | frontend-design | frontend-design | ❌ | ✅ | ❌ |
| 7 | github | github | ❌ | ✅ | ❌ |
| 8 | gog | gog | ❌ | ✅ | ❌ |
| 9 | google-slides | google-slides | 1.0 | ✅ | ❌ |
| 10 | gumroad-admin | gumroad-admin | 1.0.0 | ✅ | ❌ |
| 11 | notion | notion | ❌ | ✅ | ❌ |
| 12 | postiz | postiz | ❌ | ✅ | ❌ |
| 13 | self-improving-agent | self-improvement | ❌ | ✅ | ❌ |
| 14 | youtube-watcher | youtube-watcher | 1.0.0 | ✅ | ❌ |

### Missing Skills (8)

| # | Skill Name | Likely Purpose |
|---|------------|----------------|
| 1 | nano-banana-pro | Unknown |
| 2 | nano-pdf | PDF manipulation |
| 3 | openai-image-gen | DALL-E/image generation |
| 4 | skill-creator | Create new skills |
| 5 | summarize | Text summarization |
| 6 | video-frames | Video frame extraction |
| 7 | wacli | Unknown |
| 8 | weather | Weather API |

---

## Appendix B: Metadata Comparison Matrix

| Skill | emoji | requires.env | requires.bins | triggers | author |
|-------|-------|--------------|---------------|----------|--------|
| atxp | - | ATXP_CONNECTION | - | - | - |
| canva | 🎨 | CANVA_* | - | - | - |
| clawdhub | - | - | clawdhub | - | - |
| coding-agent | 🧩 | - | claude/codex | - | - |
| deep-research-pro | 🔬 | - | - | - | - |
| frontend-design | - | - | - | - | - |
| github | - | - | gh | - | - |
| gog | 🎮 | - | gog | - | - |
| google-slides | - | MATON_API_KEY | - | - | maton |
| gumroad-admin | 💸 | GUMROAD_* | - | - | abakermi |
| notion | 📝 | NOTION_KEY | - | - | - |
| postiz | 🌎 | POSTIZ_API_KEY | - | - | - |
| self-improving-agent | - | - | - | - | - |
| youtube-watcher | 📺 | - | yt-dlp | ✅ | michael gathara |

---

*Report generated by skills audit sub-agent*
