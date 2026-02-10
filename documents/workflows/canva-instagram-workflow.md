# Canva Instagram Workflow

**Purpose:** Automated pipeline for creating Instagram posts via Canva Connect API and preparing them for Postiz scheduling.

**Flow:** Text Input → Canva Autofill → Export PNG 1080x1080 → Ready for Postiz

---

## Prerequisites

### 1. Environment Setup

```bash
# Required environment variables
export CANVA_CLIENT_ID="your_client_id"
export CANVA_CLIENT_SECRET="your_client_secret"

# OAuth token storage
~/.canva/tokens.json
```

### 2. Required Scopes

- `design:content:read` - Read designs
- `design:content:write` - Create/modify designs
- `brandtemplate:content:read` - Read brand templates
- `asset:read` - Read assets (for uploads)

---

## Workflow Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Text Input    │────▶│  Canva Autofill  │────▶│  Export PNG     │────▶│  Postiz Ready   │
│  (Caption/Post  │     │  (Brand Template)│     │  1080x1080      │     │  (File Path)    │
│   Content)      │     │                  │     │                 │     │                 │
└─────────────────┘     └──────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## Step 1: Brand Template Selection

### List Available Brand Templates

```bash
GET https://api.canva.com/rest/v1/brand-templates
Authorization: Bearer $ACCESS_TOKEN
```

**Response:**
```json
{
  "items": [
    {
      "id": "template_abc123",
      "name": "Instagram Post - Quote",
      "thumbnail": {"url": "https://..."},
      "created_at": "2024-01-15T10:00:00Z"
    },
    {
      "id": "template_def456", 
      "name": "Instagram Post - Promo",
      "thumbnail": {"url": "https://..."},
      "created_at": "2024-01-10T08:00:00Z"
    }
  ]
}
```

### Recommended Instagram Templates

| Template Name | Purpose | Recommended ID Storage |
|--------------|---------|----------------------|
| `instagram_quote` | Text-based quotes/motivation | `~/.canva/templates.json` |
| `instagram_promo` | Product/service promotions | `~/.canva/templates.json` |
| `instagram_tip` | Educational tips/hacks | `~/.canva/templates.json` |
| `instagram_story` | Story format (1080x1920) | `~/.canva/templates.json` |

### Template Configuration File

Create `~/.canva/templates.json`:

```json
{
  "instagram": {
    "quote": {
      "template_id": "TEMPLATE_ID_HERE",
      "format": "square",
      "fields": ["title", "body", "author"]
    },
    "promo": {
      "template_id": "TEMPLATE_ID_HERE", 
      "format": "square",
      "fields": ["headline", "description", "cta", "price"]
    },
    "tip": {
      "template_id": "TEMPLATE_ID_HERE",
      "format": "square", 
      "fields": ["tip_number", "title", "content"]
    }
  }
}
```

---

## Step 2: Autofill Data Structure

### API Endpoint

```bash
POST https://api.canva.com/rest/v1/autofills
Authorization: Bearer $ACCESS_TOKEN
Content-Type: application/json
```

### Request Body Structure

```json
{
  "brand_template_id": "TEMPLATE_ID",
  "data": {
    "field_name_1": {
      "type": "text",
      "text": "Content for field 1"
    },
    "field_name_2": {
      "type": "text", 
      "text": "Content for field 2"
    },
    "image_field": {
      "type": "image",
      "asset_id": "ASSET_ID"
    }
  }
}
```

### Field Types

| Type | Purpose | Example |
|------|---------|---------|
| `text` | Plain text content | `"text": "Hello World"` |
| `image` | Reference to uploaded asset | `"asset_id": "asset_123"` |
| `chart` | Data visualization | See Canva API docs |

### Example: Quote Post

```bash
curl -X POST "https://api.canva.com/rest/v1/autofills" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "brand_template_id": "template_quote_123",
    "data": {
      "quote_text": {
        "type": "text",
        "text": "The only way to do great work is to love what you do."
      },
      "author": {
        "type": "text",
        "text": "Steve Jobs"
      },
      "hashtag": {
        "type": "text",
        "text": "#motivation"
      }
    }
  }'
```

**Response:**
```json
{
  "job": {
    "id": "autofill_job_xyz789",
    "status": "in_progress",
    "design": {
      "id": "design_new_abc123"
    }
  }
}
```

### Example: Promo Post

```bash
curl -X POST "https://api.canva.com/rest/v1/autofills" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "brand_template_id": "template_promo_456",
    "data": {
      "headline": {
        "type": "text",
        "text": "Summer Sale Now Live!"
      },
      "description": {
        "type": "text",
        "text": "Get 50% off all products this weekend only."
      },
      "cta_button": {
        "type": "text",
        "text": "Shop Now"
      },
      "price": {
        "type": "text",
        "text": "Starting at $19.99"
      }
    }
  }'
```

---

## Step 3: Export Job - PNG 1080x1080

### Start Export Job

```bash
POST https://api.canva.com/rest/v1/exports
Authorization: Bearer $ACCESS_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "design_id": "DESIGN_ID_FROM_AUTOFILL",
  "format": {
    "type": "png",
    "width": 1080,
    "height": 1080,
    "lossless": false
  }
}
```

**Complete Example:**
```bash
curl -X POST "https://api.canva.com/rest/v1/exports" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "design_id": "design_new_abc123",
    "format": {
      "type": "png",
      "width": 1080,
      "height": 1080
    }
  }'
```

**Response:**
```json
{
  "job": {
    "id": "export_job_def456",
    "status": "in_progress"
  }
}
```

### Export Format Options

| Format | Type | Dimensions | Use Case |
|--------|------|------------|----------|
| PNG | Raster | 1080x1080 | Standard Instagram post |
| PNG | Raster | 1080x1920 | Instagram Story/Reel |
| JPG | Raster | 1080x1080 | Smaller file size |
| JPG | Raster | 1080x1350 | Portrait post |

---

## Step 4: Export Job Polling

### Check Export Status

```bash
GET https://api.canva.com/rest/v1/exports/{jobId}
Authorization: Bearer $ACCESS_TOKEN
```

**Polling Script:**
```bash
#!/bin/bash

EXPORT_JOB_ID="export_job_def456"
ACCESS_TOKEN=$(cat ~/.canva/tokens.json | jq -r '.access_token')
MAX_RETRIES=30
RETRY_DELAY=2

for i in $(seq 1 $MAX_RETRIES); do
  RESPONSE=$(curl -s "https://api.canva.com/rest/v1/exports/$EXPORT_JOB_ID" \
    -H "Authorization: Bearer $ACCESS_TOKEN")
  
  STATUS=$(echo $RESPONSE | jq -r '.job.status')
  
  echo "Attempt $i: Status = $STATUS"
  
  if [ "$STATUS" = "success" ]; then
    echo "Export complete!"
    echo $RESPONSE | jq '.job'
    break
  elif [ "$STATUS" = "failed" ]; then
    echo "Export failed!"
    echo $RESPONSE | jq '.job.error'
    exit 1
  fi
  
  sleep $RETRY_DELAY
done
```

### Status Values

| Status | Meaning | Action |
|--------|---------|--------|
| `in_progress` | Export is processing | Continue polling |
| `success` | Export complete | Download file |
| `failed` | Export error | Check error message |

### Success Response

```json
{
  "job": {
    "id": "export_job_def456",
    "status": "success",
    "urls": [
      {
        "url": "https://export.canva.com/.../design.png",
        "expiry": "2024-01-20T12:00:00Z"
      }
    ]
  }
}
```

---

## Step 5: File Download

### Download Exported File

```bash
# Extract URL from export response
EXPORT_URL=$(curl -s "https://api.canva.com/rest/v1/exports/$EXPORT_JOB_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq -r '.job.urls[0].url')

# Download to Postiz-ready directory
curl -L "$EXPORT_URL" \
  -o "/Users/clawdmm/.openclaw/workspace/postiz-ready/instagram_post_$(date +%Y%m%d_%H%M%S).png"
```

### Output Directory Structure

```
~/.openclaw/workspace/postiz-ready/
├── instagram_post_20240210_144200.png
├── instagram_post_20240210_144500.png
└── ...
```

---

## Complete Workflow Script

```bash
#!/bin/bash
# canva-instagram-workflow.sh

set -e

# Configuration
TEMPLATE_ID="${1:-your_default_template_id}"
POST_CONTENT="${2:-Your post content here}"
OUTPUT_DIR="/Users/clawdmm/.openclaw/workspace/postiz-ready"
ACCESS_TOKEN=$(cat ~/.canva/tokens.json | jq -r '.access_token')

# Ensure output directory exists
mkdir -p "$OUTPUT_DIR"

echo "🎨 Starting Canva Instagram workflow..."

# Step 1: Autofill design
echo "Step 1: Creating design from template..."
AUTOFILL_RESPONSE=$(curl -s -X POST "https://api.canva.com/rest/v1/autofills" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"brand_template_id\": \"$TEMPLATE_ID\",
    \"data\": {
      \"content\": {
        \"type\": \"text\",
        \"text\": \"$POST_CONTENT\"
      }
    }
  }")

DESIGN_ID=$(echo $AUTOFILL_RESPONSE | jq -r '.job.design.id')
if [ -z "$DESIGN_ID" ] || [ "$DESIGN_ID" = "null" ]; then
  echo "❌ Autofill failed: $AUTOFILL_RESPONSE"
  exit 1
fi
echo "✅ Design created: $DESIGN_ID"

# Step 2: Start export
echo "Step 2: Starting PNG export (1080x1080)..."
EXPORT_RESPONSE=$(curl -s -X POST "https://api.canva.com/rest/v1/exports" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"design_id\": \"$DESIGN_ID\",
    \"format\": {
      \"type\": \"png\",
      \"width\": 1080,
      \"height\": 1080
    }
  }")

EXPORT_JOB_ID=$(echo $EXPORT_RESPONSE | jq -r '.job.id')
if [ -z "$EXPORT_JOB_ID" ] || [ "$EXPORT_JOB_ID" = "null" ]; then
  echo "❌ Export start failed: $EXPORT_RESPONSE"
  exit 1
fi
echo "✅ Export job started: $EXPORT_JOB_ID"

# Step 3: Poll for completion
echo "Step 3: Waiting for export to complete..."
MAX_RETRIES=30
for i in $(seq 1 $MAX_RETRIES); do
  STATUS_RESPONSE=$(curl -s "https://api.canva.com/rest/v1/exports/$EXPORT_JOB_ID" \
    -H "Authorization: Bearer $ACCESS_TOKEN")
  
  STATUS=$(echo $STATUS_RESPONSE | jq -r '.job.status')
  echo "  Poll $i/$MAX_RETRIES: $STATUS"
  
  if [ "$STATUS" = "success" ]; then
    EXPORT_URL=$(echo $STATUS_RESPONSE | jq -r '.job.urls[0].url')
    break
  elif [ "$STATUS" = "failed" ]; then
    echo "❌ Export failed"
    exit 1
  fi
  
  sleep 2
done

if [ -z "$EXPORT_URL" ] || [ "$EXPORT_URL" = "null" ]; then
  echo "❌ Export timed out"
  exit 1
fi

# Step 4: Download file
echo "Step 4: Downloading file..."
FILENAME="instagram_post_$(date +%Y%m%d_%H%M%S).png"
OUTPUT_PATH="$OUTPUT_DIR/$FILENAME"

curl -s -L "$EXPORT_URL" -o "$OUTPUT_PATH"

if [ -f "$OUTPUT_PATH" ]; then
  echo "✅ File downloaded: $OUTPUT_PATH"
  echo ""
  echo "📁 Ready for Postiz: $OUTPUT_PATH"
else
  echo "❌ Download failed"
  exit 1
fi
```

---

## Rate Limits & Error Handling

### Rate Limits

| Endpoint | Limit |
|----------|-------|
| General API | 100 requests/minute |
| Upload/Export | 30 requests/minute |

### Common Errors

| Error Code | Cause | Solution |
|------------|-------|----------|
| `401` | Token expired | Refresh OAuth token |
| `403` | Missing scope | Add required scope to integration |
| `404` | Template not found | Verify template ID |
| `429` | Rate limit exceeded | Wait and retry |

### Error Handling Pattern

```bash
check_response() {
  local response="$1"
  local error_code=$(echo "$response" | jq -r '.error_code // empty')
  
  if [ "$error_code" = "unauthorized" ]; then
    echo "Token expired, refreshing..."
    # Refresh token logic
    return 1
  elif [ "$error_code" = "rate_limited" ]; then
    echo "Rate limited, waiting 60s..."
    sleep 60
    return 1
  fi
  
  return 0
}
```

---

## Integration with Postiz

### Output File Naming Convention

```
instagram_post_{YYYYMMDD}_{HHMMSS}.png
```

Example: `instagram_post_20240210_144200.png`

### Postiz Upload Ready

Exported files are saved to:
```
/Users/clawdmm/.openclaw/workspace/postiz-ready/
```

Files in this directory can be directly uploaded to Postiz for scheduling.

---

## Quick Reference

### Essential API Calls

| Action | Method | Endpoint |
|--------|--------|----------|
| List templates | GET | `/brand-templates` |
| Create design | POST | `/autofills` |
| Start export | POST | `/exports` |
| Check status | GET | `/exports/{jobId}` |

### Instagram Dimensions

| Format | Width | Height |
|--------|-------|--------|
| Square | 1080 | 1080 |
| Portrait | 1080 | 1350 |
| Story | 1080 | 1920 |

---

## Resources

- [Canva Connect API Docs](https://www.canva.dev/docs/connect/)
- [OpenAPI Spec](https://www.canva.dev/sources/connect/api/latest/api.yml)
- [Postiz Documentation](https://docs.postiz.com)
