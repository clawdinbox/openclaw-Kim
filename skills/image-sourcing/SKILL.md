# image-sourcing

Automated image generation and sourcing for Market Pulse social media — AI generation, stock photos, and branded graphics.

---

## Metadata

| Key | Value |
|-----|-------|
| `emoji` | 🖼️ |
| `requires` | node, OPENAI_API_KEY (optional: UNSPLASH_ACCESS_KEY, PEXELS_API_KEY) |

---

## Usage

```bash
# Run the daily image pipeline
node tools/image-sourcing/daily-image-pipeline.js --topic="AI in fashion" --headline="The Retail Shift"

# Cron wrapper for automated runs
node tools/image-sourcing/cron-image-wrapper.js --topic="<topic>" --headline="<headline>"

# Get brand elements reference
clawdbot image-sourcing brand

# Get API requirements
clawdbot image-sourcing api-keys

# Get output formats
clawdbot image-sourcing formats
```

---

## Pipeline Workflow

The image sourcing pipeline operates in 4 tiers:

### Tier 1: AI Generation (Primary)
- **Source:** DALL-E 3 via OpenAI API
- **Use when:** High-quality conceptual images needed
- **Requires:** `OPENAI_API_KEY`

### Tier 2: Unsplash Stock (Fallback)
- **Source:** Unsplash API
- **Use when:** AI generation fails or real photography preferred
- **Requires:** `UNSPLASH_ACCESS_KEY` (optional)

### Tier 3: Pexels Stock (Fallback)
- **Source:** Pexels API
- **Use when:** Unsplash has no suitable images
- **Requires:** `PEXELS_API_KEY` (optional)

### Tier 4: Text-on-Gradient (Final Fallback)
- **Source:** Generated locally
- **Use when:** All API sources fail
- **Requirements:** None — always works

---

## Brand Elements

### Visual Identity

| Element | Spec |
|---------|------|
| Handle | @marcel.melzig |
| Handle color | Cyan (#00ADEE) |
| Accent line | 4px cyan at bottom |
| Gradient fade | Bottom gradient for text readability |

### Design Principles
- Clean, modern aesthetic
- Typography-driven (no stock people photos)
- Professional/consultant positioning
- Consistent cyan accents across all platforms

---

## API Keys Required

| Key | Purpose | Required? |
|-----|---------|-----------|
| `OPENAI_API_KEY` | DALL-E 3 image generation | **Yes** (for AI tier) |
| `UNSPLASH_ACCESS_KEY` | Stock photography | No (fallback) |
| `PEXELS_API_KEY` | Stock photography | No (fallback) |

**Setup:** Add to environment or `.env` file in `tools/image-sourcing/`

---

## Output Formats

Pipeline generates platform-optimized images:

| Platform | Dimensions | Filename |
|----------|------------|----------|
| Instagram | 1080×1080 | `instagram-01.jpg` |
| LinkedIn | 1200×627 | `linkedin-01.jpg` |
| X (Twitter) | 1600×900 | `x-01.jpg` |
| Threads | 1080×1080 | `threads-01.jpg` |
| Substack | 1200×630 | `substack-01.jpg` |

**Additional Output:**
- `metadata.json` — source credits and generation info

---

## Output Location

```
documents/daily-posts/YYYY-MM-DD/
├── instagram-01.jpg
├── linkedin-01.jpg
├── x-01.jpg
├── threads-01.jpg
├── substack-01.jpg
└── metadata.json
```

---

## Integration

### Manual Run
```bash
cd tools/image-sourcing
node daily-image-pipeline.js --topic="AI in fashion" --headline="The Retail Shift"
```

### Cron Integration
Cron jobs can call `cron-image-wrapper.js` to auto-generate images before posting:

```javascript
// Example cron command
node tools/image-sourcing/cron-image-wrapper.js \
  --topic="Sustainability in Luxury" \
  --headline="The Green Premium Myth"
```

---

## Documentation

| File | Location |
|------|----------|
| Full docs | `tools/image-sourcing/README.md` |
| Approach doc | `documents/concepts/image-pipeline-approach.md` |

---

## Examples

**Generate images for a post:**
```
1. Determine topic and headline
2. Run: node daily-image-pipeline.js --topic="<topic>" --headline="<headline>"
3. Check output in documents/daily-posts/YYYY-MM-DD/
4. Review metadata.json for source credits
5. Use platform-specific images for scheduled posts
```

**Add to cron job:**
```
Before posting to Instagram/LinkedIn/X/Threads:
1. Generate images via cron-image-wrapper.js
2. Verify output files exist
3. Attach appropriate image to post
4. Include source credit if from Unsplash/Pexels
```

**Handle API failures:**
```
If OPENAI_API_KEY fails → Fall back to Unsplash
If UNSPLASH fails → Fall back to Pexels
If PEXELS fails → Generate text-on-gradient graphic
Always produces output regardless of API status
```

---

## Technical Notes

- Location: `tools/image-sourcing/`
- Main script: `daily-image-pipeline.js`
- Cron wrapper: `cron-image-wrapper.js`
- Node.js required
- Images saved as JPEG with quality optimization
- Metadata tracks source for attribution requirements
