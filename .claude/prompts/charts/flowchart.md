# Flowchart

Vertical or horizontal process flows with decision points.

## When to Use

- Step-by-step processes
- Workflows with branching decisions
- User journeys with yes/no paths
- Algorithm visualization
- Approval workflows

## Input Format

Numbered list with optional `[DECISION]` markers and branch labels:

```markdown
1. Start Process
2. Gather Requirements
3. [DECISION] Requirements Complete?
   - Yes: Continue
   - No: Go back to step 2
4. Design Solution
5. [DECISION] Design Approved?
   - Yes: Continue
   - No: Go back to step 4
6. Implement
7. Test
8. Deploy
9. End
```

## Layout Rules

| Element | Shape | Fill Color | Text Color | Min Size |
|---------|-------|------------|------------|----------|
| Start | ELLIPSE | `#27ae60` (OUTPUT) | `#ffffff` | 100×44 |
| End | ELLIPSE | `#e74c3c` (NEGATIVE) | `#ffffff` | 100×44 |
| Process Step | ROUNDED_RECTANGLE | `#ffffff` (NEUTRAL) | `#333333` | 140×44 |
| Decision | DIAMOND | `#9b59b6` (DECISION) | `#ffffff` | 120×80 |
| Connector Label | - | - | `#333333` | - |

**Stroke Rules:**
- NEUTRAL (white) elements: `strokeColor: "#bdc3c7"`, `strokeWeight: 1`
- Colored elements: No stroke

## Spacing

**IMPORTANT:** Use generous spacing between flowchart elements for readability. Connectors need room to display cleanly.

| Type | Value |
|------|-------|
| Vertical gap (main flow) | 180px |
| Horizontal gap (branches) | 270px |
| Decision to branch | 150px |
| Branch convergence gap | 180px |

> **Note:** These spacing values are intentionally large (3x standard) to ensure connectors are clearly visible and the flowchart is easy to read. Do not reduce these values.

## Position Calculation

### Vertical Flow (Default)

```
┌─────────────┐
│   Start     │  y = startY
└─────────────┘
       │
       ▼
┌─────────────┐
│   Step 1    │  y = startY + height + GAP_VERTICAL
└─────────────┘
       │
       ▼
   ◇─────────◇
  /           \
 / Decision?   \  y = previous_y + height + GAP_VERTICAL
 \             /  (diamond shape - taller)
  \           /
   ◇─────────◇
    │       │
   Yes      No
    │       │
    ▼       ▼
```

**Algorithm:**
```javascript
let currentY = startY;
let centerX = startX;

for (const step of steps) {
  if (step.type === 'start' || step.type === 'end') {
    // Ellipse, centered
    step.x = centerX - step.width / 2;
    step.y = currentY;
    currentY += step.height + GAP_VERTICAL;
  } else if (step.type === 'decision') {
    // Diamond, centered
    step.x = centerX - step.width / 2;
    step.y = currentY;
    currentY += step.height + GAP_VERTICAL;

    // Position Yes branch (left or down)
    // Position No branch (right)
  } else {
    // Process step, centered
    step.x = centerX - step.width / 2;
    step.y = currentY;
    currentY += step.height + GAP_VERTICAL;
  }
}
```

### Horizontal Flow

Same logic but swap X and Y calculations. Use `startMagnet: "RIGHT"`, `endMagnet: "LEFT"` for connectors.

## Connector Rules

### Vertical Flow (TB - Top to Bottom)

| From | To | Start Magnet | End Magnet | Arrow |
|------|----|--------------|------------|-------|
| Step | Next Step (below) | BOTTOM | TOP | ARROW_LINES |
| Decision | Yes Branch (below) | BOTTOM | TOP | ARROW_LINES |
| Decision | No Branch (right) | RIGHT | LEFT | ARROW_LINES |
| Branch | Convergence | BOTTOM | TOP | ARROW_LINES |
| Loop Back | Earlier Step | LEFT | LEFT | ARROW_LINES |

### Horizontal Flow (LR - Left to Right)

| From | To | Start Magnet | End Magnet | Arrow |
|------|----|--------------|------------|-------|
| Step | Next Step (right) | RIGHT | LEFT | ARROW_LINES |
| Decision | Yes Branch (right) | RIGHT | LEFT | ARROW_LINES |
| Decision | No Branch (below) | BOTTOM | TOP | ARROW_LINES |
| Branch | Convergence | RIGHT | LEFT | ARROW_LINES |
| Loop Back | Earlier Step | TOP | TOP | ARROW_LINES |

**Line Type:** Use `connectorLineType: "ELBOWED"` for all flowchart connectors.

**IMPORTANT:** Match connector magnets to element positions:
- If element B is to the RIGHT of element A → use RIGHT→LEFT
- If element B is BELOW element A → use BOTTOM→TOP
- Mismatched magnets cause confusing connector paths

## Generation Steps

### 1. Parse Input

```javascript
function parseFlowchart(input) {
  const lines = input.trim().split('\n');
  const steps = [];
  let currentDecision = null;

  for (const line of lines) {
    const trimmed = line.trim();

    // Check for numbered step
    const stepMatch = trimmed.match(/^(\d+)\.\s*(.+)$/);
    if (stepMatch) {
      const text = stepMatch[2];
      const isDecision = text.includes('[DECISION]');
      const isStart = text.toLowerCase().includes('start');
      const isEnd = text.toLowerCase().includes('end');

      steps.push({
        type: isDecision ? 'decision' : isStart ? 'start' : isEnd ? 'end' : 'process',
        text: text.replace('[DECISION]', '').trim(),
        branches: isDecision ? { yes: null, no: null } : null
      });

      if (isDecision) currentDecision = steps.length - 1;
      continue;
    }

    // Check for branch label (- Yes: or - No:)
    const branchMatch = trimmed.match(/^-\s*(Yes|No):\s*(.+)$/i);
    if (branchMatch && currentDecision !== null) {
      const branch = branchMatch[1].toLowerCase();
      steps[currentDecision].branches[branch] = branchMatch[2];
    }
  }

  return steps;
}
```

### 2. Measure Text

```bash
# For each step, measure the text
curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{"type": "measureText", "payload": {"text": "Gather Requirements", "fontSize": 12}}'
```

### 3. Calculate Positions

Apply the position algorithm from above based on flow direction.

### 4. Create Shapes

```bash
# Start node
curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{
    "type": "createShapeWithText",
    "payload": {
      "text": "Start",
      "shapeType": "ELLIPSE",
      "x": 200, "y": 50,
      "width": 100, "height": 44,
      "fillColor": "#27ae60",
      "fontSize": 14
    }
  }'

# Process step
curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{
    "type": "createShapeWithText",
    "payload": {
      "text": "Gather Requirements",
      "shapeType": "ROUNDED_RECTANGLE",
      "x": 175, "y": 194,
      "width": 150, "height": 44,
      "fillColor": "#ffffff",
      "strokeColor": "#bdc3c7",
      "strokeWeight": 1,
      "fontSize": 12
    }
  }'

# Decision node
curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{
    "type": "createShapeWithText",
    "payload": {
      "text": "Requirements Complete?",
      "shapeType": "DIAMOND",
      "x": 165, "y": 338,
      "width": 170, "height": 100,
      "fillColor": "#9b59b6",
      "fontSize": 11
    }
  }'
```

### 5. Create Connectors

```bash
# Connect start to first step
curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{
    "type": "createConnector",
    "payload": {
      "startNodeId": "START_ID",
      "endNodeId": "STEP1_ID",
      "startMagnet": "BOTTOM",
      "endMagnet": "TOP",
      "connectorLineType": "ELBOWED",
      "connectorEndStrokeCap": "ARROW_LINES"
    }
  }'

# Decision Yes branch
curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{
    "type": "createConnector",
    "payload": {
      "startNodeId": "DECISION_ID",
      "endNodeId": "YES_TARGET_ID",
      "startMagnet": "BOTTOM",
      "endMagnet": "TOP",
      "connectorLineType": "ELBOWED",
      "connectorEndStrokeCap": "ARROW_LINES"
    }
  }'

# Decision No branch (goes right)
curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{
    "type": "createConnector",
    "payload": {
      "startNodeId": "DECISION_ID",
      "endNodeId": "NO_TARGET_ID",
      "startMagnet": "RIGHT",
      "endMagnet": "LEFT",
      "connectorLineType": "ELBOWED",
      "connectorEndStrokeCap": "ARROW_LINES"
    }
  }'
```

## Commands Used

- `measureText` - Get text dimensions
- `createShapeWithText` - Create flowchart shapes
- `createConnector` - Connect shapes with arrows
- `createSticky` - (Optional) Add annotations

## Example Output

```
        ┌───────────┐
        │   Start   │
        └─────┬─────┘
              │
              ▼
      ┌───────────────┐
      │    Step 1     │
      └───────┬───────┘
              │
              ▼
          ◇───────◇
         /         \
        / Decision? \
        \           /
         \         /
          ◇───┬───◇
              │    \
         Yes ▼     ▼ No
      ┌───────┐  ┌───────┐
      │ Yes   │  │  No   │
      │ Path  │  │ Path  │
      └───┬───┘  └───┬───┘
          │          │
          └────┬─────┘
               │
               ▼
        ┌───────────┐
        │    End    │
        └───────────┘
```

## Post-Creation Validation

**CRITICAL**: After creating a flowchart, ALWAYS validate the layout.

### Validation Steps

1. **Take a screenshot** of the created flowchart
2. **Verify flow direction** matches intended direction:
   - **Vertical (TB)**: Elements stack top-to-bottom, connectors go BOTTOM→TOP
   - **Horizontal (LR)**: Elements flow left-to-right, connectors go RIGHT→LEFT
3. **Check for issues**:
   - Elements overlapping
   - Connectors going wrong direction
   - Misaligned elements
4. **Fix any issues** by moving elements or updating connectors

### Flow Direction Rules

| Direction | Element Position | Connector Start | Connector End |
|-----------|-----------------|-----------------|---------------|
| Vertical (TB) | Next element BELOW previous | BOTTOM | TOP |
| Horizontal (LR) | Next element RIGHT of previous | RIGHT | LEFT |
| Vertical branch (No) | Branch element to the RIGHT | RIGHT | LEFT |
| Horizontal branch (No) | Branch element BELOW | BOTTOM | TOP |

### Common Mistakes to Check

1. **Output node below input**: If flow is LR, output should be RIGHT, not below
2. **Wrong connector magnets**: LR flow needs RIGHT→LEFT, not BOTTOM→TOP
3. **Overlapping elements**: Ensure GAP_HORIZONTAL (270px) or GAP_VERTICAL (180px) spacing
4. **Convergence points**: Multiple inputs should merge cleanly

### Validation Example

```javascript
// After creating flowchart, verify:
async function validateFlowchart(nodeIds, expectedDirection) {
  // 1. Query node positions
  const nodes = await queryNodes(nodeIds);

  // 2. Check flow direction
  for (let i = 1; i < nodes.length; i++) {
    const prev = nodes[i - 1];
    const curr = nodes[i];

    if (expectedDirection === 'LR') {
      // Current should be to the RIGHT of previous
      if (curr.x <= prev.x + prev.width) {
        console.error(`Node ${curr.name} should be RIGHT of ${prev.name}`);
        // Fix: move curr.x = prev.x + prev.width + GAP_HORIZONTAL
      }
    } else { // TB
      // Current should be BELOW previous
      if (curr.y <= prev.y + prev.height) {
        console.error(`Node ${curr.name} should be BELOW ${prev.name}`);
        // Fix: move curr.y = prev.y + prev.height + GAP_VERTICAL
      }
    }
  }

  // 3. Take screenshot to visually verify
  // 4. Fix any connector directions if needed
}
```

### Screenshot Verification Prompt

After creating a flowchart, use this verification:

```
Take a screenshot of the flowchart and verify:
1. Flow direction: Are elements positioned correctly for [LR/TB] flow?
2. Connectors: Do arrows point in the correct direction?
3. Spacing: Are elements evenly spaced without overlaps?
4. Alignment: Are elements on the same row/column aligned?

If issues found, fix by:
- Moving mispositioned elements
- Updating connector magnets (RIGHT→LEFT for LR, BOTTOM→TOP for TB)
```

## Variations

### Swimlane Flowchart
For actor-based flows, see `swimlane.md`.

### Horizontal Flowchart
Set `direction: "horizontal"` and swap X/Y positioning and magnets.

**Horizontal Flow Magnets:**
| From | To | Start Magnet | End Magnet |
|------|----|--------------|------------|
| Step | Next Step | RIGHT | LEFT |
| Decision | Yes Branch | RIGHT | LEFT |
| Decision | No Branch | BOTTOM | TOP |

### Loop-Back Flows
For steps that loop back, use `startMagnet: "LEFT"` on both source and target.
