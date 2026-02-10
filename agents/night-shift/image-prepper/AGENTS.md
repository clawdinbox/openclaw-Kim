# AGENTS.md - Image-Prepper

## Pre-Flight Checklist
- [ ] Review image requirements from content calendar
- [ ] Check Night-Coordinator queue for urgent image needs
- [ ] Verify source image locations
- [ ] Confirm output directories organized by channel
- [ ] Check brand guidelines for visual standards

## Task-Specific Workflows

### Workflow 1: Product Image Optimization
1. **Inventory Check**
   - List all product images needed
   - Check existing asset library
   - Identify missing images
   - Note priority items

2. **Format Preparation**
   - Web format: JPEG/PNG optimization
   - Social formats: Square, portrait, landscape
   - Email format: Appropriate width
   - Print format: High resolution

3. **Optimization**
   - Compress for web (balance quality/size)
   - Target: <200KB for web, <500KB for hero
   - Use appropriate compression levels
   - Preserve transparency where needed

4. **Naming Convention**
   - Format: `product-name-variant-channel-YYYYMMDD`
   - All lowercase
   - Hyphens for spaces
   - Include dimensions if multiple sizes

5. **Alt Text Creation**
   - Descriptive but concise
   - Include product name
   - Note key features visible
   - Keep under 125 characters

6. **Output**
   - Save to organized folders by channel
   - Create image manifest

### Workflow 2: Social Media Graphics
1. **Specification Review**
   - Instagram feed: 1080x1080 or 1080x1350
   - Instagram stories: 1080x1920
   - LinkedIn: 1200x627
   - Twitter: 1200x675
   - Facebook: 1200x630

2. **Asset Preparation**
   - Resize source images to specs
   - Ensure text safety zones
   - Check logo placement
   - Verify color profiles

3. **Format Optimization**
   - JPEG for photos
   - PNG for graphics with transparency
   - WebP where supported
   - Proper DPI for each use case

4. **File Organization**
   - `/social/instagram/`
   - `/social/linkedin/`
   - `/social/twitter/`
   - `/social/facebook/`

5. **Caption/Alt Text Files**
   - Create matching text files
   - Include suggested captions
   - Add hashtag recommendations
   - Note best posting times

6. **Output**
   - Save to: `workspace/memory/night-shift/images/social/[platform]/`
   - Create batch processing log

### Workflow 3: Email Image Preparation
1. **Size Requirements**
   - Hero images: 600-800px width
   - Content images: 300-600px width
   - Thumbnails: 150-200px
   - Icons: 50x50px or SVG

2. **Optimization**
   - Heavy compression for fast loading
   - Balance quality vs file size
   - Test load times
   - Ensure mobile-friendly dimensions

3. **Fallback Preparation**
   - Create text alternatives
   - Prepare background colors
   - Document alt text
   - Test dark mode appearance

4. **Hosting Readiness**
   - Final optimized versions
   - Proper file naming
   - Directory structure for CDN
   - Version control notes

5. **Output**
   - Save to: `workspace/memory/night-shift/images/email/[campaign]/`

### Workflow 4: Asset Library Organization
1. **File Audit**
   - Review existing image assets
   - Identify duplicates
   - Note outdated images
   - Catalog missing metadata

2. **Naming Standardization**
   - Rename files to convention
   - Update folder structure
   - Create consistent hierarchy
   - Document changes

3. **Metadata Addition**
   - Create image inventory spreadsheet
   - Tag by: category, campaign, date
   - Note usage rights
   - Add photographer/creator credits

4. **Backup Documentation**
   - List all new/updated assets
   - Note file locations
   - Document optimization settings
   - Create retrieval guide

5. **Output**
   - Save inventory to: `workspace/memory/night-shift/images/asset-inventory-YYYY-MM-DD.md`

## Skills to Use
- **read**: Access source images and guidelines
- **write**: Create organization files and metadata
- **exec**: File operations, image processing commands

## When to Escalate
- Missing critical images for scheduled content
- Image quality issues beyond repair
- Copyright or licensing concerns
- Technical processing failures

## Output Formats

### Image Preparation Manifest
```markdown
# Image Preparation Manifest
**Date:** YYYY-MM-DD
**Prepared by:** Image-Prepper (Night Shift)
**Project:** [Project/Campaign Name]

## Images Prepared

### Web Images
| Filename | Dimensions | Size | Alt Text | Location |
|----------|------------|------|----------|----------|
| [name.jpg] | 1200x800 | 180KB | [alt text] | /web/product/ |

### Social Images
| Platform | Filename | Dimensions | Size | Notes |
|----------|----------|------------|------|-------|
| Instagram | [name.jpg] | 1080x1080 | 150KB | Feed post |
| LinkedIn | [name.jpg] | 1200x627 | 120KB | Article feature |

### Email Images
| Filename | Dimensions | Size | Campaign | Usage |
|----------|------------|------|----------|-------|
| [hero.jpg] | 600x400 | 80KB | [campaign] | Header |

## Optimization Settings
- **JPEG Quality:** [X%]
- **PNG Compression:** [Level]
- **Color Profile:** [sRGB/etc]

## Missing Assets
- [ ] [Description of needed image]

## Notes
[Any special instructions or issues]
```

### Alt Text Guide
```markdown
# Alt Text Guide: [Project]
**Date:** YYYY-MM-DD

## Product Images
- **[filename.jpg]:** [Product name] in [color], featuring [key detail].

## Lifestyle Images
- **[filename.jpg]:** [Description of scene, people, setting].

## Graphic/Infographic Images
- **[filename.jpg]:** [Summary of information conveyed].

## Best Practices Applied
- Descriptive but concise
- No "image of" or "picture of"
- Key information prioritized
- Under 125 characters
```

## Handoff Procedures
1. **07:00 CET**: Compile all image work from overnight
2. **07:15 CET**: Verify all critical images are prepared
3. **07:30 CET**: Save handoff to `workspace/memory/night-shift/handoff/image-brief-YYYY-MM-DD.md`
4. Include:
   - Images prepared by channel
   - File locations and naming
   - Missing assets list
   - Priority image needs
5. Notify Night-Coordinator and Handoff-Preparer
