# Hub & Spoke

Central concept with radiating connections to related elements.

## When to Use

- Mind maps and concept mapping
- Organizational structures
- Feature/benefit relationships
- Central service with dependencies
- Topic clusters for content
- System architecture (central hub with satellites)

## Input Format

Heading with bullet list:

```markdown
# Core Platform

- User Management
- Authentication
- Data Storage
- API Gateway
- Analytics
- Notifications
```

Or with nested details:

```markdown
# Content Strategy

- Research
  - Competitor analysis
  - Keyword research
- Creation
  - Blog posts
  - Videos
- Distribution
  - Social media
  - Email campaigns
- Analytics
  - Traffic metrics
  - Conversion tracking
```

## Layout Rules

| Element | Shape | Fill Color | Text Color | Min Size |
|---------|-------|------------|------------|----------|
| Hub (center) | ROUNDED_RECTANGLE | `#2c3e50` (PRIMARY) | `#ffffff` | 180×60 |
| Spoke (level 1) | ROUNDED_RECTANGLE | `#3498db` (INPUT) | `#ffffff` | 140×44 |
| Sub-spoke (level 2) | ROUNDED_RECTANGLE | `#ffffff` (NEUTRAL) | `#333333` | 120×36 |

## Spacing

| Type | Value |
|------|-------|
| Hub to spoke distance | 150px (center to center) |
| Spoke to sub-spoke | 80px |
| Angle between spokes | 360° / numSpokes |
| Min angle between spokes | 30° |

## Arrangement Options

### 1. Radial (Full Circle)

```
           ┌─────────┐
           │ Spoke 1 │
           └────┬────┘
                │
    ┌───────┐   │   ┌───────┐
    │Spoke 6│───●───│Spoke 2│
    └───────┘   │   └───────┘
                │
    ┌───────┐   │   ┌───────┐
    │Spoke 5│───●───│Spoke 3│
    └───────┘   │   └───────┘
                │
           ┌────┴────┐
           │ Spoke 4 │
           └─────────┘
```

### 2. Right-Side (Semi-circle)

```
                    ┌─────────┐
               ┌────│ Spoke 1 │
               │    └─────────┘
               │    ┌─────────┐
    ┌──────┐   ├────│ Spoke 2 │
    │ Hub  │───┤    └─────────┘
    └──────┘   │    ┌─────────┐
               ├────│ Spoke 3 │
               │    └─────────┘
               │    ┌─────────┐
               └────│ Spoke 4 │
                    └─────────┘
```

### 3. Top-Bottom (Horizontal spread)

```
    ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐
    │Spoke 1│ │Spoke 2│ │Spoke 3│ │Spoke 4│
    └───┬───┘ └───┬───┘ └───┬───┘ └───┬───┘
        │         │         │         │
        └─────────┴────┬────┴─────────┘
                       │
                  ┌────┴────┐
                  │   Hub   │
                  └─────────┘
```

## Position Calculation

### Radial Layout

```javascript
const HUB_RADIUS = 150; // distance from hub center to spoke center

function calculateRadialLayout(hub, spokes, centerX, centerY) {
  const positions = [];

  // Hub at center
  positions.push({
    type: 'hub',
    text: hub.text,
    x: centerX - hub.width / 2,
    y: centerY - hub.height / 2,
    width: hub.width,
    height: hub.height,
    fillColor: '#2c3e50'
  });

  // Spokes in circle
  const angleStep = (2 * Math.PI) / spokes.length;
  const startAngle = -Math.PI / 2; // Start at top

  spokes.forEach((spoke, i) => {
    const angle = startAngle + i * angleStep;
    const spokeX = centerX + HUB_RADIUS * Math.cos(angle);
    const spokeY = centerY + HUB_RADIUS * Math.sin(angle);

    positions.push({
      type: 'spoke',
      text: spoke.text,
      x: spokeX - spoke.width / 2,
      y: spokeY - spoke.height / 2,
      width: spoke.width,
      height: spoke.height,
      fillColor: '#3498db',
      angle: angle // for connector direction
    });

    // Sub-spokes (if any)
    if (spoke.children) {
      const subRadius = HUB_RADIUS + 100;
      const subAngleSpread = Math.PI / 6; // 30° spread
      const subStartAngle = angle - subAngleSpread / 2;
      const subAngleStep = subAngleSpread / Math.max(spoke.children.length - 1, 1);

      spoke.children.forEach((sub, j) => {
        const subAngle = subStartAngle + j * subAngleStep;
        const subX = centerX + subRadius * Math.cos(subAngle);
        const subY = centerY + subRadius * Math.sin(subAngle);

        positions.push({
          type: 'sub-spoke',
          text: sub,
          x: subX - 60,
          y: subY - 18,
          width: 120,
          height: 36,
          fillColor: '#ffffff',
          parent: spoke.text
        });
      });
    }
  });

  return positions;
}
```

### Right-Side Layout

```javascript
function calculateRightSideLayout(hub, spokes, startX, startY) {
  const positions = [];
  const SPOKE_GAP = 60;
  const SPOKE_OFFSET_X = 200;

  // Calculate total height
  const totalHeight = spokes.length * 44 + (spokes.length - 1) * SPOKE_GAP;
  const hubY = startY + totalHeight / 2 - 30;

  // Hub on left
  positions.push({
    type: 'hub',
    text: hub.text,
    x: startX,
    y: hubY,
    width: 180,
    height: 60,
    fillColor: '#2c3e50'
  });

  // Spokes on right, stacked vertically
  let currentY = startY;
  spokes.forEach((spoke, i) => {
    positions.push({
      type: 'spoke',
      text: spoke.text,
      x: startX + SPOKE_OFFSET_X,
      y: currentY,
      width: 140,
      height: 44,
      fillColor: '#3498db'
    });
    currentY += 44 + SPOKE_GAP;
  });

  return positions;
}
```

## Connector Rules

| From | To | Start Magnet | End Magnet | Line Type |
|------|----|--------------|------------|-----------|
| Hub | Spoke (radial) | AUTO | AUTO | STRAIGHT |
| Hub | Spoke (right-side) | RIGHT | LEFT | ELBOWED |
| Hub | Spoke (top-bottom) | TOP/BOTTOM | BOTTOM/TOP | ELBOWED |
| Spoke | Sub-spoke | RIGHT | LEFT | ELBOWED |

**For radial layout:** Use AUTO magnets - Figma will choose the closest edge.

## Generation Steps

### 1. Parse Input

```javascript
function parseHubSpoke(input) {
  const lines = input.trim().split('\n');
  let hub = null;
  const spokes = [];
  let currentSpoke = null;

  for (const line of lines) {
    const trimmed = line.trim();

    // Hub (heading)
    if (trimmed.startsWith('#')) {
      hub = { text: trimmed.replace(/^#+\s*/, '') };
      continue;
    }

    // Spoke (top-level bullet)
    if (trimmed.match(/^-\s+\w/) && !line.startsWith('  ')) {
      if (currentSpoke) spokes.push(currentSpoke);
      currentSpoke = {
        text: trimmed.replace(/^-\s*/, ''),
        children: []
      };
      continue;
    }

    // Sub-spoke (indented bullet)
    if (trimmed.match(/^-\s+\w/) && currentSpoke) {
      currentSpoke.children.push(trimmed.replace(/^-\s*/, ''));
    }
  }

  if (currentSpoke) spokes.push(currentSpoke);

  return { hub, spokes };
}
```

### 2. Measure Text

```bash
curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{"type": "measureText", "payload": {"text": "Core Platform", "fontSize": 16}}'
```

### 3. Create Hub

```bash
curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{
    "type": "createShapeWithText",
    "payload": {
      "text": "Core Platform",
      "shapeType": "ROUNDED_RECTANGLE",
      "x": 300, "y": 250,
      "width": 180, "height": 60,
      "fillColor": "#2c3e50",
      "fontSize": 16
    }
  }'
```

### 4. Create Spokes

```bash
# Radial position (top)
curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{
    "type": "createShapeWithText",
    "payload": {
      "text": "User Management",
      "shapeType": "ROUNDED_RECTANGLE",
      "x": 320, "y": 80,
      "width": 140, "height": 44,
      "fillColor": "#3498db",
      "fontSize": 12
    }
  }'
```

### 5. Create Connectors

```bash
# Hub to spoke
curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{
    "type": "createConnector",
    "payload": {
      "startNodeId": "HUB_ID",
      "endNodeId": "SPOKE_ID",
      "connectorLineType": "STRAIGHT",
      "connectorEndStrokeCap": "ARROW_LINES"
    }
  }'
```

## Commands Used

- `measureText` - Get text dimensions
- `createShapeWithText` - Create hub and spokes
- `createConnector` - Connect hub to spokes
- `createSection` - (Optional) Group entire diagram

## Example Output (Radial)

```
                 ┌───────────────┐
                 │User Management│
                 └───────┬───────┘
                         │
    ┌────────────┐       │       ┌────────────┐
    │Notifications│──────●───────│Authentication│
    └────────────┘       │       └────────────┘
                  ┌──────┴──────┐
                  │    Core     │
                  │  Platform   │
                  └──────┬──────┘
    ┌────────────┐       │       ┌────────────┐
    │  Analytics │───────●───────│Data Storage│
    └────────────┘       │       └────────────┘
                         │
                 ┌───────┴───────┐
                 │  API Gateway  │
                 └───────────────┘
```

## Example Output (Right-Side)

```
                         ┌────────────────┐
                    ┌────│ User Management│
                    │    └────────────────┘
                    │    ┌────────────────┐
┌──────────────┐    │────│ Authentication │
│    Core      │────┤    └────────────────┘
│   Platform   │    │    ┌────────────────┐
└──────────────┘    │────│  Data Storage  │
                    │    └────────────────┘
                    │    ┌────────────────┐
                    └────│  API Gateway   │
                         └────────────────┘
```

## Variations

### With Categories

Group spokes by category using section containers:

```
Hub → [Section: Frontend] → Spoke1, Spoke2
    → [Section: Backend]  → Spoke3, Spoke4
```

### Nested Hub-Spoke

Each spoke becomes a mini-hub with its own sub-spokes.

### Weighted Spokes

Use different spoke sizes based on importance.
