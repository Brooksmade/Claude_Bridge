# Swimlane Diagram

Parallel workflows organized by actor, department, or system.

## When to Use

- Cross-functional processes
- Multi-team workflows
- System interaction flows
- Responsibility assignment (RACI)
- Service blueprints
- Order/request processing flows

## Input Format

Multi-section markdown organized by actor:

```markdown
## Customer
1. Browse Products
2. Add to Cart
3. Checkout
4. Receive Confirmation

## Website
1. Display Products
2. Update Cart
3. Process Payment
4. Send Confirmation Email

## Warehouse
1. Receive Order
2. Pick Items
3. Pack Order
4. Ship Package

## Delivery
1. Receive Package
2. Deliver to Customer
```

Or with decision points:

```markdown
## Employee
1. Submit Request
2. [WAIT] Approval
3. Receive Decision

## Manager
1. Review Request
2. [DECISION] Approve?
   - Yes: Approve Request
   - No: Reject Request
3. Notify Employee
```

## Layout Rules

| Element | Shape | Fill Color | Text Color | Min Size |
|---------|-------|------------|------------|----------|
| Lane Header | ROUNDED_RECTANGLE | `#2c3e50` (PRIMARY) | `#ffffff` | 150×50 |
| Process Step | ROUNDED_RECTANGLE | `#ffffff` (NEUTRAL) | `#333333` | 140×44 |
| Decision | DIAMOND | `#9b59b6` (DECISION) | `#ffffff` | 100×70 |
| Wait State | ROUNDED_RECTANGLE | `#e67e22` (ACTION) | `#ffffff` | 140×44 |
| Handoff Point | ELLIPSE | `#27ae60` (OUTPUT) | `#ffffff` | 30×30 |

## Spacing

**IMPORTANT:** Use generous spacing for swimlane diagrams so connectors (especially cross-lane ones) display cleanly.

| Type | Value |
|------|-------|
| Lane width | 250-350px (based on content) |
| Lane gap | 40px |
| Step vertical gap | 180px |
| Lane header to first step | 100px |
| Cross-lane connector clearance | 80px |

> **Note:** These spacing values are intentionally large (3x standard) to ensure connectors are clearly visible, especially when crossing lanes. Do not reduce these values.

## Layout Structure

```
┌──────────────────────────────────────────────────────────────┐
│                    Swimlane Diagram                           │
├─────────────┬─────────────┬─────────────┬─────────────────────┤
│  Customer   │   Website   │  Warehouse  │     Delivery        │
├─────────────┼─────────────┼─────────────┼─────────────────────┤
│             │             │             │                     │
│ ┌─────────┐ │             │             │                     │
│ │Browse   │ │             │             │                     │
│ └────┬────┘ │             │             │                     │
│      │      │             │             │                     │
│      ▼      │             │             │                     │
│ ┌─────────┐ │ ┌─────────┐ │             │                     │
│ │Add Cart │──│─│Update   │ │             │                     │
│ └────┬────┘ │ │ Cart    │ │             │                     │
│      │      │ └────┬────┘ │             │                     │
│      ▼      │      │      │             │                     │
│ ┌─────────┐ │      ▼      │             │                     │
│ │Checkout │──────────────────────────────────────────────────│
│ └─────────┘ │             │             │                     │
│             │             │             │                     │
└─────────────┴─────────────┴─────────────┴─────────────────────┘
```

## Position Calculation

```javascript
const LANE_WIDTH = 200;
const LANE_GAP = 20;
const HEADER_HEIGHT = 50;
const STEP_HEIGHT = 44;
const STEP_GAP = 80;
const HEADER_TO_CONTENT = 60;

function calculateSwimlane(lanes, startX, startY) {
  const elements = [];
  const connectors = [];

  // Find max steps across all lanes
  const maxSteps = Math.max(...lanes.map(l => l.steps.length));

  // Calculate total height
  const contentHeight = maxSteps * STEP_HEIGHT + (maxSteps - 1) * STEP_GAP;
  const totalHeight = HEADER_HEIGHT + HEADER_TO_CONTENT + contentHeight + 60;

  // Calculate lane positions
  lanes.forEach((lane, laneIndex) => {
    const laneX = startX + laneIndex * (LANE_WIDTH + LANE_GAP);

    // Lane header
    elements.push({
      type: 'lane-header',
      text: lane.actor,
      x: laneX,
      y: startY,
      width: LANE_WIDTH,
      height: HEADER_HEIGHT,
      fillColor: '#2c3e50'
    });

    // Lane background (section)
    elements.push({
      type: 'lane-section',
      name: '',
      x: laneX - 10,
      y: startY - 10,
      width: LANE_WIDTH + 20,
      height: totalHeight + 20,
      fillColor: laneIndex % 2 === 0 ? '#f8f9fa' : '#ffffff'
    });

    // Steps within lane
    let stepY = startY + HEADER_HEIGHT + HEADER_TO_CONTENT;
    lane.steps.forEach((step, stepIndex) => {
      const stepWidth = Math.min(LANE_WIDTH - 20, 160);
      const stepX = laneX + (LANE_WIDTH - stepWidth) / 2;

      elements.push({
        type: step.type || 'process',
        text: step.text,
        x: stepX,
        y: stepY,
        width: stepWidth,
        height: step.type === 'decision' ? 70 : STEP_HEIGHT,
        fillColor: step.type === 'decision' ? '#9b59b6' :
                   step.type === 'wait' ? '#e67e22' : '#ffffff',
        laneIndex,
        stepIndex
      });

      stepY += (step.type === 'decision' ? 70 : STEP_HEIGHT) + STEP_GAP;
    });
  });

  return { elements, totalWidth: lanes.length * (LANE_WIDTH + LANE_GAP) - LANE_GAP, totalHeight };
}
```

## Connector Rules

### Within Same Lane

| From | To | Start Magnet | End Magnet |
|------|----|--------------|------------|
| Step | Next Step | BOTTOM | TOP |
| Decision Yes | Next in lane | BOTTOM | TOP |

### Cross-Lane (Handoffs)

| From | To | Start Magnet | End Magnet | Line Type |
|------|----|--------------|------------|-----------|
| Step in Lane A | Step in Lane B | RIGHT | LEFT | ELBOWED |
| Step in Lane B | Step in Lane A | LEFT | RIGHT | ELBOWED |

**Cross-lane connector pattern:**
```javascript
// Determine magnet based on relative lane positions
function getCrossLaneMagnets(fromLaneIndex, toLaneIndex) {
  if (fromLaneIndex < toLaneIndex) {
    return { start: 'RIGHT', end: 'LEFT' };
  } else {
    return { start: 'LEFT', end: 'RIGHT' };
  }
}
```

## Generation Steps

### 1. Parse Input

```javascript
function parseSwimlane(input) {
  const lanes = [];
  let currentLane = null;

  const lines = input.trim().split('\n');

  for (const line of lines) {
    const trimmed = line.trim();

    // Lane header (## Actor Name)
    if (trimmed.startsWith('##')) {
      if (currentLane) lanes.push(currentLane);
      currentLane = {
        actor: trimmed.replace(/^##\s*/, ''),
        steps: []
      };
      continue;
    }

    // Step (numbered item)
    const stepMatch = trimmed.match(/^(\d+)\.\s*(.+)$/);
    if (stepMatch && currentLane) {
      const text = stepMatch[2];
      const isDecision = text.includes('[DECISION]');
      const isWait = text.includes('[WAIT]');

      currentLane.steps.push({
        text: text.replace(/\[DECISION\]|\[WAIT\]/g, '').trim(),
        type: isDecision ? 'decision' : isWait ? 'wait' : 'process'
      });
    }
  }

  if (currentLane) lanes.push(currentLane);

  return lanes;
}
```

### 2. Create Lane Sections

```bash
# Lane background section
curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{
    "type": "createSection",
    "payload": {
      "name": "",
      "x": 40, "y": 40,
      "width": 220, "height": 500,
      "fillColor": "#f8f9fa"
    }
  }'
```

### 3. Create Lane Headers

```bash
curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{
    "type": "createShapeWithText",
    "payload": {
      "text": "Customer",
      "shapeType": "ROUNDED_RECTANGLE",
      "x": 50, "y": 50,
      "width": 200, "height": 50,
      "fillColor": "#2c3e50",
      "fontSize": 14
    }
  }'
```

### 4. Create Steps

```bash
# Process step
curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{
    "type": "createShapeWithText",
    "payload": {
      "text": "Browse Products",
      "shapeType": "ROUNDED_RECTANGLE",
      "x": 70, "y": 160,
      "width": 160, "height": 44,
      "fillColor": "#ffffff",
      "strokeColor": "#bdc3c7",
      "strokeWeight": 1,
      "fontSize": 12
    }
  }'

# Wait state
curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{
    "type": "createShapeWithText",
    "payload": {
      "text": "Awaiting Approval",
      "shapeType": "ROUNDED_RECTANGLE",
      "x": 70, "y": 284,
      "width": 160, "height": 44,
      "fillColor": "#e67e22",
      "fontSize": 12
    }
  }'
```

### 5. Create Connectors

```bash
# Vertical flow within lane
curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{
    "type": "createConnector",
    "payload": {
      "startNodeId": "STEP1_ID",
      "endNodeId": "STEP2_ID",
      "startMagnet": "BOTTOM",
      "endMagnet": "TOP",
      "connectorLineType": "ELBOWED",
      "connectorEndStrokeCap": "ARROW_LINES"
    }
  }'

# Cross-lane handoff
curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{
    "type": "createConnector",
    "payload": {
      "startNodeId": "LANE1_STEP_ID",
      "endNodeId": "LANE2_STEP_ID",
      "startMagnet": "RIGHT",
      "endMagnet": "LEFT",
      "connectorLineType": "ELBOWED",
      "connectorEndStrokeCap": "ARROW_LINES"
    }
  }'
```

## Commands Used

- `measureText` - Get text dimensions
- `createSection` - Create lane backgrounds
- `createShapeWithText` - Create headers and steps
- `createConnector` - Connect steps within and across lanes

## Example Output

```
┌─────────────────────────────────────────────────────────────────┐
│                     Order Processing                             │
├───────────────┬───────────────┬───────────────┬─────────────────┤
│   Customer    │    Website    │   Warehouse   │    Delivery     │
├───────────────┼───────────────┼───────────────┼─────────────────┤
│               │               │               │                 │
│ ┌───────────┐ │               │               │                 │
│ │  Browse   │ │               │               │                 │
│ └─────┬─────┘ │               │               │                 │
│       │       │               │               │                 │
│       ▼       │               │               │                 │
│ ┌───────────┐ │ ┌───────────┐ │               │                 │
│ │ Add Cart  │───│ Update    │ │               │                 │
│ └─────┬─────┘ │ │   Cart    │ │               │                 │
│       │       │ └─────┬─────┘ │               │                 │
│       ▼       │       │       │               │                 │
│ ┌───────────┐ │       ▼       │               │                 │
│ │ Checkout  │───────────────────┌───────────┐ │                 │
│ └───────────┘ │               │ │  Receive  │ │                 │
│               │               │ │   Order   │ │                 │
│               │               │ └─────┬─────┘ │                 │
│               │               │       │       │                 │
│               │               │       ▼       │                 │
│               │               │ ┌───────────┐ │ ┌─────────────┐ │
│               │               │ │   Ship    │───│   Deliver   │ │
│               │               │ └───────────┘ │ └─────────────┘ │
│               │               │               │                 │
└───────────────┴───────────────┴───────────────┴─────────────────┘
```

## Variations

### Vertical Swimlanes

Rotate 90° - lanes run top-to-bottom, flow is left-to-right.

### Time-Based

Add time markers on the left edge showing duration between steps.

### With Status

Color-code steps by status: Done (green), In Progress (orange), Pending (gray).

### Collapsed Lanes

Show only active steps, with expand/collapse indicators.
