# Figma Documentation - Variable Style Guide

Creates visual documentation frames for design system variables.

Bridge server: http://localhost:4001

---

## Quick Start

```
Create documentation frames for all variable collections. One frame per collection with color swatches, typography samples, and spacing visualizations. Bind all visual elements to their variables.
```

---

## Workflow

### 1. Get Variables
```bash
POST /commands {"type": "getVariables", "payload": {"includeValues": true}}
```

### 2. Create Frame Per Collection
```bash
POST /commands {"type": "create", "payload": {
  "nodeType": "FRAME",
  "properties": {
    "name": "Documentation / Collection Name",
    "width": 800,
    "fills": [{"type": "SOLID", "color": {"r": 1, "g": 1, "b": 1}}],
    "layoutMode": "VERTICAL",
    "primaryAxisSizingMode": "AUTO",
    "itemSpacing": 32,
    "paddingLeft": 48, "paddingRight": 48, "paddingTop": 48, "paddingBottom": 48
  }
}}
```

### 3. Render Variables

#### Color Swatches
```bash
# Create rectangle, bind to color variable
POST /commands {"type": "create", "payload": {"nodeType": "RECTANGLE", "parentId": "X", "properties": {"width": 48, "height": 48, "cornerRadius": 8, "fills": [...]}}}
POST /commands {"type": "bindFillVariable", "payload": {"nodeId": "RECT_ID", "variableId": "VAR_ID", "fillIndex": 0}}
```

#### Typography Samples
```bash
# Create text at font size, bind fontSize
POST /commands {"type": "create", "payload": {"nodeType": "TEXT", "parentId": "X", "properties": {"characters": "Aa - Size Name", "fontSize": XX}}}
POST /commands {"type": "bindVariable", "payload": {"nodeId": "TEXT_ID", "variableId": "VAR_ID", "field": "fontSize"}}
```

#### Spacing Bars
```bash
# Create rectangle with width = spacing value
POST /commands {"type": "create", "payload": {"nodeType": "RECTANGLE", "parentId": "X", "properties": {"width": SPACING_VALUE, "height": 24, "cornerRadius": 4, "fills": [...]}}}
```

#### Radius Samples
```bash
# Create rectangle, bind cornerRadius
POST /commands {"type": "create", "payload": {"nodeType": "RECTANGLE", "parentId": "X", "properties": {"width": 64, "height": 64, "cornerRadius": XX}}}
POST /commands {"type": "bindVariable", "payload": {"nodeId": "RECT_ID", "variableId": "VAR_ID", "field": "cornerRadius"}}
```

---

## Documentation Structure

### Primitive [ Level 1 ] Frame
- Color/Gray Scale (swatches)
- Color/Brand Scale (swatches)
- Color/System (swatches)
- Typography/Font Family (text samples)
- Typography/Font Size (text at each size)
- Numbers/Spacing (width bars)
- Numbers/Border Radius (rounded rectangles)

### Semantic [ Level 2 ] Frame
- Light/Dark mode color tokens

### Tokens [ Level 3 ] Frame
- Light Mode/Dark Mode surface, text, border tokens

### Theme Frame
- Background, foreground, interactive tokens

---

## Key Commands

| Action | Command |
|--------|---------|
| Create frame | `create` with `nodeType: "FRAME"` |
| Create rectangle | `create` with `nodeType: "RECTANGLE"` |
| Create text | `create` with `nodeType: "TEXT"` |
| Bind color | `bindFillVariable` |
| Bind fontSize | `bindVariable` with `field: "fontSize"` |
| Bind radius | `bindVariable` with `field: "cornerRadius"` |

---

## Related Files

- `.claude/agents/figma-documentation.md` - Full agent instructions
- `prompts/figma-bridge.md` - API reference
- `prompts/figma-variables.md` - Variable workflow
