# Decision Tree

Binary yes/no branching logic with leaf outcomes.

## When to Use

- Troubleshooting guides
- Diagnostic flowcharts
- Eligibility determination
- Product recommendation
- Rule-based decision making
- Algorithm visualization

## Input Format

Nested markdown with Yes/No markers:

```markdown
# Is the device powered on?
- Yes: Is the screen displaying anything?
  - Yes: Is the display showing an error?
    - Yes: → Contact Support
    - No: → Device is working normally
  - No: → Check display connection
- No: Is it plugged in?
  - Yes: → Check power button
  - No: → Plug in the device
```

Or indented tree format:

```markdown
Start: Customer Issue

Q1: Is this a billing issue?
├─ Yes: Q2: Is the charge incorrect?
│       ├─ Yes: → Process refund
│       └─ No: → Explain charges
└─ No: Q3: Is this a technical issue?
        ├─ Yes: → Transfer to Tech Support
        └─ No: → General inquiry handling
```

## Layout Rules

| Element | Shape | Fill Color | Text Color | Min Size |
|---------|-------|------------|------------|----------|
| Question | DIAMOND | `#9b59b6` (DECISION) | `#ffffff` | 140×90 |
| Outcome (positive) | ROUNDED_RECTANGLE | `#27ae60` (OUTPUT) | `#ffffff` | 120×44 |
| Outcome (negative) | ROUNDED_RECTANGLE | `#e74c3c` (NEGATIVE) | `#ffffff` | 120×44 |
| Outcome (neutral) | ROUNDED_RECTANGLE | `#3498db` (INPUT) | `#ffffff` | 120×44 |
| Branch Label | - | - | `#333333` | - |

## Spacing

**IMPORTANT:** Use generous spacing for decision trees so connectors display cleanly.

| Type | Value |
|------|-------|
| Horizontal gap between siblings | 300px |
| Vertical gap (question to children) | 250px |
| Branch label offset | 30px from connector |
| Tree width expansion | 1.5× per level |

> **Note:** These spacing values are intentionally large (3x standard) to ensure connectors and branch labels are clearly visible. Do not reduce these values.

## Layout Structure

```
                    ┌─────────────────┐
                    │   Question 1    │
                    └────────┬────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
           Yes│                             │No
              ▼                             ▼
      ┌───────────────┐             ┌───────────────┐
      │  Question 2   │             │   Outcome A   │
      └───────┬───────┘             └───────────────┘
              │
       ┌──────┴──────┐
       │             │
    Yes│             │No
       ▼             ▼
┌───────────┐  ┌───────────┐
│ Outcome B │  │ Outcome C │
└───────────┘  └───────────┘
```

## Position Calculation

### Recursive Tree Layout

```javascript
const LEVEL_HEIGHT = 250;  // Generous vertical spacing for connectors
const MIN_SIBLING_GAP = 300;  // Generous horizontal spacing for branches
const NODE_WIDTH = 140;
const NODE_HEIGHT_QUESTION = 90;
const NODE_HEIGHT_OUTCOME = 44;

function calculateDecisionTree(node, level = 0, leftBound = 0) {
  const positions = [];

  // Calculate subtree widths first (bottom-up)
  function getSubtreeWidth(n) {
    if (!n.children || n.children.length === 0) {
      return NODE_WIDTH;
    }
    const childWidths = n.children.map(c => getSubtreeWidth(c));
    return childWidths.reduce((sum, w) => sum + w, 0) +
           (n.children.length - 1) * MIN_SIBLING_GAP;
  }

  function layoutNode(n, lvl, left, right) {
    const centerX = (left + right) / 2;
    const y = lvl * LEVEL_HEIGHT;
    const isQuestion = n.children && n.children.length > 0;

    positions.push({
      type: isQuestion ? 'question' : 'outcome',
      text: n.text,
      x: centerX - NODE_WIDTH / 2,
      y: y,
      width: NODE_WIDTH,
      height: isQuestion ? NODE_HEIGHT_QUESTION : NODE_HEIGHT_OUTCOME,
      fillColor: isQuestion ? '#9b59b6' :
                 n.outcomeType === 'positive' ? '#27ae60' :
                 n.outcomeType === 'negative' ? '#e74c3c' : '#3498db',
      label: n.branchLabel // "Yes" or "No"
    });

    if (n.children && n.children.length > 0) {
      const totalWidth = right - left;
      const childWidths = n.children.map(c => getSubtreeWidth(c));
      const totalChildWidth = childWidths.reduce((sum, w) => sum + w, 0) +
                              (n.children.length - 1) * MIN_SIBLING_GAP;

      let childLeft = left + (totalWidth - totalChildWidth) / 2;

      n.children.forEach((child, i) => {
        const childRight = childLeft + childWidths[i];
        layoutNode(child, lvl + 1, childLeft, childRight);
        childLeft = childRight + MIN_SIBLING_GAP;
      });
    }
  }

  const totalWidth = getSubtreeWidth(node);
  layoutNode(node, 0, 0, totalWidth);

  return positions;
}
```

### Alternative: Horizontal Tree

```javascript
function layoutHorizontalTree(node, level = 0, topBound = 0) {
  // Swap X and Y calculations
  // Levels go left-to-right
  // Siblings stack top-to-bottom
}
```

## Connector Rules

| From | To | Start Magnet | End Magnet | Label |
|------|----|--------------|------------|-------|
| Question | Yes child | BOTTOM | TOP | "Yes" |
| Question | No child | BOTTOM | TOP | "No" |

**For horizontal trees:**
| From | To | Start Magnet | End Magnet |
|------|----|--------------|------------|
| Question | Yes child | RIGHT | LEFT |
| Question | No child | RIGHT | LEFT |

**Branch Labels:**
Create sticky notes or text shapes near the connector midpoint.

## Generation Steps

### 1. Parse Input

```javascript
function parseDecisionTree(input) {
  const lines = input.trim().split('\n');

  function parseLevel(lines, startIndex, indent) {
    const node = { text: '', children: [] };

    // Get the question/text at current level
    const currentLine = lines[startIndex].trim();

    // Check if it's the root (starts with # or "Start:")
    if (currentLine.startsWith('#')) {
      node.text = currentLine.replace(/^#\s*/, '');
    } else if (currentLine.startsWith('Q') || currentLine.includes(':')) {
      node.text = currentLine.split(':').slice(1).join(':').trim();
    } else if (currentLine.startsWith('→')) {
      // Outcome
      node.text = currentLine.replace('→', '').trim();
      node.outcomeType = 'neutral';
      return node;
    }

    // Find children (Yes/No branches)
    let i = startIndex + 1;
    while (i < lines.length) {
      const line = lines[i];
      const lineIndent = line.search(/\S/);

      if (lineIndent <= indent && i > startIndex + 1) break;

      if (line.trim().startsWith('- Yes:') || line.trim().startsWith('├─ Yes:')) {
        const childText = line.replace(/.*Yes:\s*/, '').trim();
        const child = childText.startsWith('→')
          ? { text: childText.replace('→', '').trim(), outcomeType: 'positive', branchLabel: 'Yes' }
          : { ...parseLevel(lines, i, lineIndent), branchLabel: 'Yes' };
        node.children.push(child);
      }

      if (line.trim().startsWith('- No:') || line.trim().startsWith('└─ No:')) {
        const childText = line.replace(/.*No:\s*/, '').trim();
        const child = childText.startsWith('→')
          ? { text: childText.replace('→', '').trim(), outcomeType: 'negative', branchLabel: 'No' }
          : { ...parseLevel(lines, i, lineIndent), branchLabel: 'No' };
        node.children.push(child);
      }

      i++;
    }

    return node;
  }

  return parseLevel(lines, 0, -1);
}
```

### 2. Create Nodes

```bash
# Question node (diamond)
curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{
    "type": "createShapeWithText",
    "payload": {
      "text": "Is device powered on?",
      "shapeType": "DIAMOND",
      "x": 200, "y": 50,
      "width": 160, "height": 100,
      "fillColor": "#9b59b6",
      "fontSize": 11
    }
  }'

# Positive outcome
curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{
    "type": "createShapeWithText",
    "payload": {
      "text": "Device working normally",
      "shapeType": "ROUNDED_RECTANGLE",
      "x": 50, "y": 300,
      "width": 150, "height": 44,
      "fillColor": "#27ae60",
      "fontSize": 12
    }
  }'

# Negative outcome
curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{
    "type": "createShapeWithText",
    "payload": {
      "text": "Contact Support",
      "shapeType": "ROUNDED_RECTANGLE",
      "x": 250, "y": 300,
      "width": 150, "height": 44,
      "fillColor": "#e74c3c",
      "fontSize": 12
    }
  }'
```

### 3. Create Connectors with Labels

```bash
# Yes branch
curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{
    "type": "createConnector",
    "payload": {
      "startNodeId": "QUESTION_ID",
      "endNodeId": "YES_CHILD_ID",
      "startMagnet": "BOTTOM",
      "endMagnet": "TOP",
      "connectorLineType": "ELBOWED",
      "connectorEndStrokeCap": "ARROW_LINES"
    }
  }'

# Branch label (sticky note)
curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{
    "type": "createSticky",
    "payload": {
      "text": "Yes",
      "x": 120, "y": 180,
      "color": "GREEN"
    }
  }'

# No branch label
curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{
    "type": "createSticky",
    "payload": {
      "text": "No",
      "x": 320, "y": 180,
      "color": "PINK"
    }
  }'
```

## Commands Used

- `measureText` - Get text dimensions
- `createShapeWithText` - Create questions and outcomes
- `createConnector` - Connect decision points to branches
- `createSticky` - Add Yes/No branch labels

## Example Output

```
                    ┌─────────────────────┐
                    │ Is device powered   │
                    │        on?          │
                    └──────────┬──────────┘
                               │
              ┌────────────────┴────────────────┐
              │                                 │
           [Yes]                              [No]
              │                                 │
              ▼                                 ▼
    ┌─────────────────┐               ┌─────────────────┐
    │ Screen showing  │               │   Plugged in?   │
    │    anything?    │               └────────┬────────┘
    └────────┬────────┘                        │
             │                    ┌────────────┴────────────┐
    ┌────────┴────────┐           │                        │
    │                 │        [Yes]                      [No]
 [Yes]              [No]         │                        │
    │                 │          ▼                        ▼
    ▼                 ▼   ┌─────────────┐         ┌─────────────┐
┌───────────┐  ┌───────────┐ │Check power │         │ Plug device │
│Error      │  │Check      │ │  button    │         │     in      │
│showing?   │  │connection │ └─────────────┘         └─────────────┘
└─────┬─────┘  └───────────┘
      │
 ┌────┴────┐
 │         │
[Yes]    [No]
 │         │
 ▼         ▼
┌───────┐ ┌───────────┐
│Contact│ │ Working   │
│Support│ │ normally  │
└───────┘ └───────────┘
```

## Variations

### Multi-Way Decisions

Instead of binary Yes/No, use multiple branches:
- Rating: Poor | Fair | Good | Excellent
- Status: New | In Progress | Review | Done

### Probability Tree

Add probability percentages to branches.

### Cost/Benefit Tree

Include values at each outcome for decision analysis.

### Horizontal Layout

Run tree left-to-right instead of top-to-bottom for wider displays.
