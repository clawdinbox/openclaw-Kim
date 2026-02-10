# 🖼️ Image Analysis System

A complete workflow system for classifying images and routing them to specialized AI agents.

## Overview

```
User Image → Classification → Agent Routing → Specialized Analysis → Formatted Output
```

### Agents

| Image Type | Agent | Specialty |
|------------|-------|-----------|
| 📊 Charts/Graphs | **Alex 🔬** | Data extraction & analysis |
| 🎨 Design/Branding | **Sam 🎨** | CI/Brand compliance check |
| 📄 Documents | **Sales 📄** | Text extraction & parsing |
| 🛍️ Products | **Marketing 🛍️** | Competitor analysis |

## Quick Start

### Run Demo

```bash
cd /Users/clawdmm/.openclaw/workspace/tools/image-analysis

# Demo with chart
python main.py --demo --type chart

# Demo with design
python main.py --demo --type design

# Demo with document
python main.py --demo --type document

# Demo with product
python main.py --demo --type product
```

### Run All Examples

```bash
python examples/usage_examples.py
```

## Usage

### Basic Usage

```python
from main import ImageAnalysisSystem
from templates import format_result

# Initialize
system = ImageAnalysisSystem()

# Analyze image (vision_result comes from your vision model)
vision_result = {
    "description": "A bar chart showing sales data",
    "labels": ["chart", "graph", "data"],
    "text_detected": True
}

result = system.analyze("chart.png", vision_result)

# Output formatted report
print(format_result(result, "markdown"))
```

### Batch Processing

```python
# Multiple images
batch_items = [
    ("chart1.png", vision_analysis_1),
    ("logo.jpg", vision_analysis_2),
    ("invoice.pdf", vision_analysis_3),
]

results = system.analyze_batch(batch_items)
```

### Quick Classification

```python
# Just classify without full routing
classification = system.quick_classify(vision_result)
print(classification['agent'])  # 'alex', 'sam', 'sales', or 'marketing'
```

## System Components

```
image-analysis/
├── main.py                    # Entry point & CLI
├── classifier.py              # Image classification logic
├── router.py                  # Agent routing
├── templates.py               # Output formatting
├── agents/
│   ├── __init__.py
│   ├── alex_handler.py        # Alex 🔬 - Data extraction
│   ├── sam_handler.py         # Sam 🎨 - Brand compliance
│   ├── sales_handler.py       # Sales 📄 - Text extraction
│   └── marketing_handler.py   # Marketing 🛍️ - Competitor analysis
├── examples/
│   ├── usage_examples.py      # Usage examples
│   └── integration_example.py # Integration patterns
└── README.md                  # This file
```

## Classification Categories

### 📊 Charts & Graphs → Alex
- Bar charts, line graphs, pie charts
- Dashboards, KPIs
- Data visualizations
- Screenshots with data

### 🎨 Design & Branding → Sam
- Logos and brand marks
- Color palettes
- Typography samples
- Design mockups
- Style guides

### 📄 Documents → Sales
- Invoices, receipts
- Contracts, agreements
- Forms, applications
- Letters, memos
- Scanned documents

### 🛍️ Products → Marketing
- Product photos
- Packaging
- E-commerce images
- Competitor products
- Merchandise

## Output Formats

### Markdown (Full Report)
```python
format_result(result, "markdown")
```

### JSON (Structured Data)
```python
format_result(result, "json")
```

### Summary (One Line)
```python
format_result(result, "summary")
# Output: 📊 CHART → Alex 🔬 (92% confidence)
```

## Agent Outputs

### Alex 🔬 (Data Extraction)
```json
{
  "chart_type": "bar_chart",
  "title": "Q4 Sales",
  "data_points": [...],
  "insights": [...],
  "export_formats": ["csv", "json", "excel"]
}
```

### Sam 🎨 (Brand Compliance)
```json
{
  "color_palette": [...],
  "compliance": {
    "score": 85,
    "status": "pass",
    "issues": [],
    "warnings": []
  }
}
```

### Sales 📄 (Text Extraction)
```json
{
  "document_type": "invoice",
  "fields": [
    {"field": "invoice_number", "value": "12345"},
    {"field": "total", "value": "$500.00"}
  ],
  "action_items": [...]
}
```

### Marketing 🛍️ (Competitor Analysis)
```json
{
  "product_category": "electronics",
  "detected_features": [...],
  "competitive_insights": [...],
  "recommendations": [...]
}
```

## Integration

### With OpenClaw Image Tool

```python
from main import ImageAnalysisSystem
from templates import format_result

# Get analysis from vision model
analysis = image(
    prompt="Describe this image in detail",
    image="chart.png"
)

# Route through system
system = ImageAnalysisSystem()
result = system.analyze("chart.png", analysis)

# Output
print(format_result(result, "markdown"))
```

### With Telegram Bot

```python
@bot.message_handler(content_types=['photo'])
def handle_image(message):
    # Download and analyze
    vision_result = analyze_image(message.photo[-1])
    
    # Route
    result = system.analyze(path, vision_result)
    
    # Reply with formatted report
    bot.reply_to(message, format_result(result, "markdown"))
```

## Configuration

### Custom Brand Guidelines (Sam)

Edit `agents/sam_handler.py`:

```python
self.brand_guidelines = {
    "primary_colors": ["#YOUR", "#COLORS"],
    "fonts": ["Your Font"],
    "logo_clearspace": "20px"
}
```

### Custom Field Patterns (Sales)

Edit `agents/sales_handler.py`:

```python
self.field_patterns = {
    "custom_field": r"your_regex_pattern",
    ...
}
```

## CLI Reference

```bash
# Run interactive mode
python main.py

# Run demo
python main.py --demo
python main.py --demo --type chart
python main.py --demo --type design
python main.py --demo --type document
python main.py --demo --type product

# Change output format
python main.py --demo --type chart --format json
python main.py --demo --type chart --format summary
```

## Requirements

- Python 3.8+
- No external dependencies for core system
- Vision model for image analysis (OpenClaw image tool, OpenAI, etc.)

## License

MIT - OpenClaw Workspace
