# Website Design System Extraction

**Prerequisites:**
- Figma Bridge server running at `http://localhost:4001`
- Google Chrome installed
- Target website URL

---

## Overview

Extract design tokens from a live website using headless browser (Puppeteer) to get **actual computed CSS values**, automatically classify colors as Primary/Secondary/Tertiary, generate full color scales, and create/update Figma variables.

---

## Quick Start

```bash
# 1. Extract CSS from website
curl -s -X POST http://localhost:4001/commands -H "Content-Type: application/json" \
  -d '{"type": "extractWebsiteCSS", "payload": {"url": "https://example.com/"}}'

# Response: {"success": true, "commandId": "abc123", "message": "Extraction started..."}

# 2. Wait for results (typically 3-10 seconds)
curl -s "http://localhost:4001/results/abc123?wait=true"
```

---

## What Gets Extracted

| Category | Examples |
|----------|----------|
| Colors | All computed colors from text, backgrounds, borders |
| Font Families | Inter, Roboto, custom fonts |
| Font Sizes | 12, 14, 16, 18, 24, 32, etc. |
| Font Weights | 400, 500, 600, 700 |
| Line Heights | 1.2, 1.5, 1.75 |
| Letter Spacing | -0.04, -0.02, 0, 0.02 |
| Spacing | Margins, paddings, gaps |
| Border Radius | 4, 8, 12, 16, 24, etc. |
| Border Widths | 1, 2, 3 |
| Shadows | box-shadow values |
| Opacity | 0.5, 0.7, 0.9 |
| Z-Index | 1, 10, 100, 1000 |
| Container Widths | 640, 768, 1024, 1280 |

---

## Color Classification

Colors are automatically classified:

1. **Primary** - Most vibrant non-neutral color with highest usage (typically brand color)
2. **Secondary** - Second most prominent accent color
3. **Tertiary** - Third accent, ideally contrasting hue from Primary

**Algorithm:**
- Filter out neutrals (grays where R ≈ G ≈ B within 15)
- Sort remaining colors by saturation × usage count
- Top 3 become Primary, Secondary, Tertiary

---

## Color Scale Generation

For each brand color, a full 50-950 scale is generated:

| Step | Lightness Adjustment |
|------|---------------------|
| 50 | +45% (very light tint) |
| 100 | +40% |
| 200 | +30% |
| 300 | +20% |
| 400 | +10% |
| **500** | **Base color** |
| 600 | -10% |
| 700 | -20% |
| 800 | -30% |
| 900 | -40% |
| 950 | -45% (very dark shade) |

**Example for #8ED462 (green):**
```
Brand-50:  #F3FCF0  (very light)
Brand-500: #8ED462  (base)
Brand-950: #1A3412  (very dark)
```

---

## Workflow Steps

### Step 1: Extract CSS from Website

```bash
curl -s -X POST http://localhost:4001/commands -H "Content-Type: application/json" \
  -d '{"type": "extractWebsiteCSS", "payload": {"url": "https://yoursite.com/"}}'
```

### Step 2: Create Base Design System (if needed)

```bash
# Check if design system exists
curl -s -X POST http://localhost:4001/commands -H "Content-Type: application/json" \
  -d '{"type": "getDesignSystemStatus"}'

# Create with boilerplate (placeholder colors will be replaced)
curl -s -X POST http://localhost:4001/commands -H "Content-Type: application/json" \
  -d '{"type": "createDesignSystem", "payload": {"brandColors": {"primary": "#000000"}, "includeBoilerplate": true}}'
```

### Step 3: Update Color Scales with Extracted Colors

Use `editVariable` to update existing Brand/Secondary/Tertiary Scale variables:

```bash
# Get variable IDs
curl -s -X POST http://localhost:4001/commands -H "Content-Type: application/json" \
  -d '{"type": "getVariables", "payload": {"includeValues": true}}'

# Update each color in the scale
curl -s -X POST http://localhost:4001/commands -H "Content-Type: application/json" \
  -d '{"type": "editVariable", "payload": {"variableId": "VariableID:X:Y", "values": {"Value": "#F3FCF0"}}}'
```

### Step 4: Add Custom Extracted Values

For values not in boilerplate, create new variables:

```bash
curl -s -X POST http://localhost:4001/commands -H "Content-Type: application/json" \
  -d '{"type": "createVariable", "payload": {
    "collectionId": "PRIMITIVE_COLLECTION_ID",
    "name": "Typography/Font Size/Size-15",
    "type": "FLOAT",
    "values": {"Value": 15}
  }}'
```

---

## Extraction Result Format

```json
{
  "success": true,
  "url": "https://example.com/",
  "tokens": {
    "colors": [
      {"hex": "#8ED462", "rgb": "rgb(142, 212, 98)", "usage": "background", "count": 36},
      {"hex": "#FF705D", "rgb": "rgb(255, 112, 93)", "usage": "background", "count": 30}
    ],
    "typography": {
      "fontFamilies": ["Inter"],
      "fontSizes": [9, 15, 17, 18, 20, 30, 40],
      "fontWeights": [400, 500],
      "lineHeights": [0.95, 1.15, 1.2, 1.5],
      "letterSpacing": [-0.04, -0.02]
    },
    "spacing": [4, 6, 9, 11, 14, 17, 20],
    "borderRadius": [1, 5, 10, 20, 26],
    "borderWidths": [1],
    "shadows": [],
    "opacity": [0.5, 0.7],
    "zIndex": [1, 2, 3, 5, 10],
    "containerWidths": [425, 450, 595, 800]
  },
  "meta": {
    "extractedAt": "2026-01-07T06:10:30.287Z",
    "elementsScanned": 1129,
    "extractionTimeMs": 4317
  }
}
```

---

## Key Figma Variable Collections

| Collection | Purpose |
|------------|---------|
| Primitive [ Level 1 ] | Raw values (colors, numbers) |
| Semantic [ Level 2 ] | Purpose-based aliases (Light/Dark modes) |
| Tokens [ Level 3 ] | Component tokens |
| Theme | Final theme aliases |

**Color Scale Variables:**
- `Color/Brand Scale/Brand-{50-950}` - Primary color scale
- `Color/Secondary Scale/Secondary-{50-950}` - Secondary color scale
- `Color/Tertiary Scale/Tertiary-{50-950}` - Tertiary color scale

---

## Agent

Use the `website-design-system-extractor` agent for automated extraction:

```
@website-design-system-extractor Extract design tokens from https://example.com/
```

The agent will:
1. Extract CSS using headless browser
2. Classify Primary/Secondary/Tertiary colors
3. Generate 50-950 color scales
4. Update existing Figma variables
5. Add extracted typography, spacing, etc.
6. Generate a comprehensive report

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Chrome not found | Install Google Chrome or set CHROME_PATH |
| Extraction timeout | Website may have heavy JavaScript; try waiting longer |
| Port 4001 in use | Kill existing process: `netstat -ano \| findstr :4001` then `taskkill /PID <PID>` |
| Variables not updating | Use `editVariable` on existing IDs, not `createVariable` |

---

## Comparison: Website vs Frame Extraction

| Feature | Website Extraction | Frame Extraction |
|---------|-------------------|------------------|
| Source | Live website URL | Selected Figma frame |
| Method | Puppeteer headless browser | Figma plugin API |
| Colors | Computed CSS values | Node fills/strokes |
| Typography | All computed styles | Text node properties |
| Best for | Importing external designs | Extracting from Figma designs |
