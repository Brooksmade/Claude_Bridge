# Chart Base Utilities

Shared constants, colors, and utilities for all FigJam chart types.

## Color Palette

| Role | Name | Hex | Usage |
|------|------|-----|-------|
| Primary | PRIMARY | `#2c3e50` | Headers, category labels, primary elements |
| Action | ACTION | `#e67e22` | CTAs, important actions, requirements |
| Output | OUTPUT | `#27ae60` | Results, success states, deliverables |
| Input | INPUT | `#3498db` | Data sources, information items |
| Neutral | NEUTRAL | `#ffffff` | Content boxes, process steps (with stroke) |
| Decision | DECISION | `#9b59b6` | Decision points, branching logic |
| Negative | NEGATIVE | `#e74c3c` | Errors, warnings, negative outcomes |

### Stroke Colors

| Usage | Hex |
|-------|-----|
| Light element border | `#bdc3c7` |
| Connector lines | `#333333` |

## Spacing Constants

**IMPORTANT:** For charts with connectors (flowcharts, decision trees, swimlanes), use generous spacing so connectors display cleanly and the diagram is easy to read.

| Constant | Value | Usage |
|----------|-------|-------|
| GAP_HORIZONTAL | 240px | Space between elements in same row (for connected diagrams) |
| GAP_VERTICAL | 180px | Space between elements in same column (for connected diagrams) |
| GAP_ROW_TO_ROW | 270px | Space between rows (for multi-row layouts) |
| SECTION_PADDING | 60px | Padding inside section containers |
| SECTION_GAP | 350px | Space between sections |
| DIAGRAM_GAP | 300px | Space between separate diagrams |

> **Note:** These spacing values are intentionally large (3x standard) for diagrams with connectors. Connectors need room to bend and display arrows clearly. Do not reduce these values for flowcharts, decision trees, or any chart type that uses connectors.

## Element Sizes

| Element | Min Width | Min Height | Shape |
|---------|-----------|------------|-------|
| Header | 200px | 44px | ROUNDED_RECTANGLE |
| Content Box | 140px | 44px | ROUNDED_RECTANGLE |
| Decision | 120px | 80px | DIAMOND |
| Start/End | 100px | 44px | ELLIPSE |
| Pill/Tag | 120px | 36px | ROUNDED_RECTANGLE |

## Font Sizes

| Element Type | Size | Style |
|--------------|------|-------|
| Section header | 14-16px | Medium/Bold |
| Content label | 12-14px | Regular |
| Description | 10-11px | Regular |
| Small tags | 10-12px | Regular |

## Text Measurement Pattern

**Always measure text before creating shapes:**

```bash
# Step 1: Measure each text string
curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{"type": "measureText", "payload": {"text": "Your text here", "fontSize": 14}}'

# Get result
curl "http://localhost:4001/results/{commandId}?wait=true"
```

**Size Calculation:**
```
box_width = max(measured_width + 40, MIN_WIDTH)
box_height = max(measured_height + 24, MIN_HEIGHT)
```

Round UP to nearest 10px for alignment:
```
rounded_width = Math.ceil(box_width / 10) * 10
rounded_height = Math.ceil(box_height / 10) * 10
```

## Auto Text Color Calculation

Calculate text color based on fill luminance for optimal contrast:

```javascript
// Luminance formula (relative luminance)
function getLuminance(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const [rs, gs, bs] = [r, g, b].map(c =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  );

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getTextColor(fillHex) {
  const luminance = getLuminance(fillHex);
  return luminance > 0.5 ? "#333333" : "#ffffff";
}
```

**Quick Reference:**
| Fill Color | Text Color |
|------------|------------|
| `#ffffff` (white) | `#333333` (dark) |
| `#2c3e50` (dark blue) | `#ffffff` (white) |
| `#e67e22` (orange) | `#ffffff` (white) |
| `#27ae60` (green) | `#ffffff` (white) |
| `#3498db` (blue) | `#ffffff` (white) |
| `#9b59b6` (purple) | `#ffffff` (white) |
| `#e74c3c` (red) | `#ffffff` (white) |
| `#ecf0f1` (light gray) | `#333333` (dark) |

## Shape Creation Command

```json
{
  "type": "createShapeWithText",
  "payload": {
    "text": "Label Text",
    "shapeType": "ROUNDED_RECTANGLE",
    "x": 100,
    "y": 100,
    "width": 180,
    "height": 44,
    "fillColor": "#2c3e50",
    "textColor": "#ffffff",
    "fontSize": 14,
    "strokeColor": "#bdc3c7",
    "strokeWeight": 1
  }
}
```

**Shape Types:**
- `SQUARE` - Rectangle
- `ROUNDED_RECTANGLE` - Pill/rounded box (default)
- `ELLIPSE` - Circle/oval
- `DIAMOND` - Diamond shape
- `TRIANGLE_UP`, `TRIANGLE_DOWN` - Triangles
- `PARALLELOGRAM_RIGHT`, `PARALLELOGRAM_LEFT` - Parallelograms
- `ENG_DATABASE`, `ENG_QUEUE`, `ENG_FILE`, `ENG_FOLDER` - Engineering shapes

## Connector Creation Command

```json
{
  "type": "createConnector",
  "payload": {
    "startNodeId": "123:456",
    "endNodeId": "123:789",
    "startMagnet": "BOTTOM",
    "endMagnet": "TOP",
    "connectorStartStrokeCap": "NONE",
    "connectorEndStrokeCap": "ARROW_LINES",
    "connectorLineType": "ELBOWED",
    "strokeColor": "#333333",
    "strokeWeight": 2
  }
}
```

**Magnet Positions:**
- `AUTO` - Figma chooses (default)
- `TOP` - Top center
- `BOTTOM` - Bottom center
- `LEFT` - Left center
- `RIGHT` - Right center

**Arrow Direction:** Always use `connectorEndStrokeCap: "ARROW_LINES"` for arrows pointing at destination.

## Section Creation Command

```json
{
  "type": "createSection",
  "payload": {
    "name": "",
    "x": 50,
    "y": 50,
    "width": 400,
    "height": 300,
    "fillColor": "#f5f5f5"
  }
}
```

Use `name: ""` (empty string) for unnamed sections that just group elements.

## Position Calculation Utilities

### Grid Layout
```javascript
function gridPosition(index, columns, startX, startY, cellWidth, cellHeight, gapX, gapY) {
  const col = index % columns;
  const row = Math.floor(index / columns);
  return {
    x: startX + col * (cellWidth + gapX),
    y: startY + row * (cellHeight + gapY)
  };
}
```

### Vertical Stack
```javascript
function stackVertical(elements, startX, startY, gap) {
  let currentY = startY;
  return elements.map(el => {
    const pos = { x: startX, y: currentY };
    currentY += el.height + gap;
    return { ...el, ...pos };
  });
}
```

### Horizontal Stack
```javascript
function stackHorizontal(elements, startX, startY, gap) {
  let currentX = startX;
  return elements.map(el => {
    const pos = { x: currentX, y: startY };
    currentX += el.width + gap;
    return { ...el, ...pos };
  });
}
```

### Center Alignment
```javascript
function centerX(elementWidth, containerWidth, containerX) {
  return containerX + (containerWidth - elementWidth) / 2;
}

function centerY(elementHeight, containerHeight, containerY) {
  return containerY + (containerHeight - elementHeight) / 2;
}
```

## Standard Workflow

1. **Parse input** - Extract elements from markdown/text input
2. **Measure text** - Call `measureText` for each unique text string
3. **Calculate sizes** - Apply padding and minimum size rules
4. **Calculate positions** - Use layout algorithm for chart type
5. **Create shapes** - Call `createShapeWithText` for each element
6. **Collect node IDs** - Store returned IDs from each creation
7. **Create connectors** - Call `createConnector` with collected IDs

## Error Handling

- Always wait for command results before using node IDs
- Verify node IDs exist before creating connectors
- Use `wait=true` when polling results
- Check `success: true` in response before proceeding
