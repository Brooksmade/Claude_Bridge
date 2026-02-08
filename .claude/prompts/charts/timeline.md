# Timeline

Sequential events on a time axis.

## When to Use

- Project milestones
- Historical events
- Product roadmaps
- Release schedules
- Process history
- User journey over time

## Input Format

Date-prefixed list items:

```markdown
# Project Timeline

- 2024-01: Project Kickoff
- 2024-02: Requirements Complete
- 2024-03: Design Phase
- 2024-04: Development Sprint 1
- 2024-05: Development Sprint 2
- 2024-06: Testing
- 2024-07: Launch
```

Or with details:

```markdown
# Product Roadmap

- Q1 2024: Foundation
  - Core infrastructure
  - User authentication
  - Basic dashboard

- Q2 2024: Growth Features
  - Analytics module
  - API integrations
  - Mobile app beta

- Q3 2024: Scale
  - Performance optimization
  - Enterprise features
  - Global deployment
```

## Layout Rules

| Element | Shape | Fill Color | Text Color | Min Size |
|---------|-------|------------|------------|----------|
| Timeline Title | ROUNDED_RECTANGLE | `#2c3e50` (PRIMARY) | `#ffffff` | 200×50 |
| Time Marker | ELLIPSE | `#3498db` (INPUT) | `#ffffff` | 24×24 |
| Event Card | ROUNDED_RECTANGLE | `#ffffff` (NEUTRAL) | `#333333` | 160×60 |
| Milestone | ROUNDED_RECTANGLE | `#27ae60` (OUTPUT) | `#ffffff` | 160×60 |
| Current/Active | ROUNDED_RECTANGLE | `#e67e22` (ACTION) | `#ffffff` | 160×60 |
| Timeline Axis | Line | `#bdc3c7` | - | 4px stroke |

## Spacing

| Type | Value |
|------|-------|
| Event spacing (horizontal timeline) | 200px |
| Event spacing (vertical timeline) | 120px |
| Marker to card | 30px |
| Axis offset from cards | 20px |

## Orientation Options

### Horizontal Timeline

```
    Title
      │
      ▼
──●─────────●─────────●─────────●─────────●──
  │         │         │         │         │
  ▼         ▼         ▼         ▼         ▼
┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐
│Event│  │Event│  │Event│  │Event│  │Event│
│  1  │  │  2  │  │  3  │  │  4  │  │  5  │
└─────┘  └─────┘  └─────┘  └─────┘  └─────┘
Jan       Feb       Mar       Apr       May
```

### Vertical Timeline

```
  ┌─────────────────┐
  │     Title       │
  └────────┬────────┘
           │
     Jan ──●── ┌─────────────┐
           │   │   Event 1   │
           │   └─────────────┘
           │
     Feb ──●── ┌─────────────┐
           │   │   Event 2   │
           │   └─────────────┘
           │
     Mar ──●── ┌─────────────┐
           │   │   Event 3   │
           │   └─────────────┘
           │
           ▼
```

### Alternating (Zigzag)

```
  ┌─────────┐
  │ Event 1 │
  └────┬────┘
       │
       ●── Jan
       │
       ├─────────┐
       │         │
       │    ┌────┴────┐
       │    │ Event 2 │
       │    └─────────┘
       │
       ●── Feb
       │
  ┌────┴────┐
  │ Event 3 │
  └─────────┘
       │
       ●── Mar
```

## Position Calculation

### Horizontal Timeline

```javascript
const EVENT_SPACING = 200;
const AXIS_Y = 100;
const CARD_HEIGHT = 80;
const MARKER_SIZE = 24;
const MARKER_TO_CARD = 30;

function calculateHorizontalTimeline(events, startX, startY) {
  const positions = [];
  const axisY = startY + 50;

  // Title
  positions.push({
    type: 'title',
    text: events.title,
    x: startX,
    y: startY,
    width: 200,
    height: 40,
    fillColor: '#2c3e50'
  });

  // Axis line (represented as a very thin rectangle or connector points)
  const axisStartX = startX + 50;
  const axisEndX = startX + 50 + (events.items.length - 1) * EVENT_SPACING + 100;

  positions.push({
    type: 'axis',
    startX: axisStartX,
    endX: axisEndX,
    y: axisY + 50
  });

  // Events
  events.items.forEach((event, i) => {
    const eventX = axisStartX + i * EVENT_SPACING;
    const markerY = axisY + 50;
    const cardY = markerY + MARKER_SIZE / 2 + MARKER_TO_CARD;

    // Time marker (circle on axis)
    positions.push({
      type: 'marker',
      x: eventX - MARKER_SIZE / 2,
      y: markerY - MARKER_SIZE / 2,
      width: MARKER_SIZE,
      height: MARKER_SIZE,
      fillColor: event.isMilestone ? '#27ae60' :
                 event.isCurrent ? '#e67e22' : '#3498db'
    });

    // Event card
    positions.push({
      type: 'event',
      text: event.text,
      date: event.date,
      x: eventX - 80,
      y: cardY,
      width: 160,
      height: event.details ? 100 : 60,
      fillColor: event.isMilestone ? '#27ae60' :
                 event.isCurrent ? '#e67e22' : '#ffffff',
      details: event.details
    });

    // Date label below card
    positions.push({
      type: 'date-label',
      text: event.date,
      x: eventX - 40,
      y: cardY + (event.details ? 110 : 70),
      width: 80,
      height: 24
    });
  });

  return positions;
}
```

### Vertical Timeline

```javascript
const EVENT_SPACING_V = 120;

function calculateVerticalTimeline(events, startX, startY) {
  const positions = [];
  const axisX = startX + 50;

  // Title
  positions.push({
    type: 'title',
    text: events.title,
    x: startX,
    y: startY,
    width: 200,
    height: 40,
    fillColor: '#2c3e50'
  });

  // Events
  let currentY = startY + 80;

  events.items.forEach((event, i) => {
    // Date label on left
    positions.push({
      type: 'date-label',
      text: event.date,
      x: axisX - 80,
      y: currentY,
      width: 70,
      height: 24
    });

    // Marker on axis
    positions.push({
      type: 'marker',
      x: axisX - 12,
      y: currentY,
      width: 24,
      height: 24,
      fillColor: event.isMilestone ? '#27ae60' :
                 event.isCurrent ? '#e67e22' : '#3498db'
    });

    // Event card on right
    positions.push({
      type: 'event',
      text: event.text,
      x: axisX + 40,
      y: currentY - 10,
      width: 180,
      height: event.details ? 80 : 50,
      fillColor: event.isMilestone ? '#27ae60' :
                 event.isCurrent ? '#e67e22' : '#ffffff',
      details: event.details
    });

    currentY += EVENT_SPACING_V;
  });

  // Axis line coordinates
  positions.push({
    type: 'axis',
    x: axisX,
    startY: startY + 70,
    endY: currentY - EVENT_SPACING_V + 40
  });

  return positions;
}
```

## Connector Rules

| Element | Connection | Notes |
|---------|------------|-------|
| Axis | Not a connector | Draw as thin rectangle or line shape |
| Marker to Card | Vertical line | Optional, implied by positioning |
| Card to Card | Not typically connected | Use axis as visual connector |

## Generation Steps

### 1. Parse Input

```javascript
function parseTimeline(input) {
  const lines = input.trim().split('\n');
  const timeline = { title: '', items: [] };
  let currentEvent = null;

  for (const line of lines) {
    const trimmed = line.trim();

    // Title
    if (trimmed.startsWith('#')) {
      timeline.title = trimmed.replace(/^#\s*/, '');
      continue;
    }

    // Event with date
    const eventMatch = trimmed.match(/^-\s*([\d\w\-\/\s]+):\s*(.+)$/);
    if (eventMatch && !line.startsWith('  ')) {
      if (currentEvent) timeline.items.push(currentEvent);
      currentEvent = {
        date: eventMatch[1].trim(),
        text: eventMatch[2].trim(),
        details: [],
        isMilestone: eventMatch[2].toLowerCase().includes('launch') ||
                     eventMatch[2].toLowerCase().includes('release') ||
                     eventMatch[2].toLowerCase().includes('complete'),
        isCurrent: false
      };
      continue;
    }

    // Detail (indented bullet)
    if (trimmed.startsWith('-') && currentEvent && line.startsWith('  ')) {
      currentEvent.details.push(trimmed.replace(/^-\s*/, ''));
    }
  }

  if (currentEvent) timeline.items.push(currentEvent);

  return timeline;
}
```

### 2. Create Timeline Elements

```bash
# Title
curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{
    "type": "createShapeWithText",
    "payload": {
      "text": "Project Timeline",
      "shapeType": "ROUNDED_RECTANGLE",
      "x": 100, "y": 50,
      "width": 200, "height": 50,
      "fillColor": "#2c3e50",
      "fontSize": 16
    }
  }'

# Time marker (circle)
curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{
    "type": "createShapeWithText",
    "payload": {
      "text": "",
      "shapeType": "ELLIPSE",
      "x": 188, "y": 130,
      "width": 24, "height": 24,
      "fillColor": "#3498db"
    }
  }'

# Event card (regular)
curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{
    "type": "createShapeWithText",
    "payload": {
      "text": "Project Kickoff",
      "shapeType": "ROUNDED_RECTANGLE",
      "x": 120, "y": 180,
      "width": 160, "height": 60,
      "fillColor": "#ffffff",
      "strokeColor": "#bdc3c7",
      "strokeWeight": 1,
      "fontSize": 12
    }
  }'

# Milestone card (green)
curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{
    "type": "createShapeWithText",
    "payload": {
      "text": "Launch",
      "shapeType": "ROUNDED_RECTANGLE",
      "x": 920, "y": 180,
      "width": 160, "height": 60,
      "fillColor": "#27ae60",
      "fontSize": 12
    }
  }'

# Date label
curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{
    "type": "createShapeWithText",
    "payload": {
      "text": "Jan 2024",
      "shapeType": "ROUNDED_RECTANGLE",
      "x": 140, "y": 250,
      "width": 120, "height": 28,
      "fillColor": "#ecf0f1",
      "fontSize": 11
    }
  }'
```

### 3. Create Axis Line

```bash
# Horizontal axis (using thin rectangle)
curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{
    "type": "create",
    "payload": {
      "nodeType": "RECTANGLE",
      "properties": {
        "x": 100, "y": 140,
        "width": 1000, "height": 4,
        "fills": [{"type": "SOLID", "color": {"r": 0.74, "g": 0.76, "b": 0.78}}],
        "cornerRadius": 2
      }
    }
  }'
```

## Commands Used

- `measureText` - Get text dimensions
- `createShapeWithText` - Create cards, markers, and labels
- `create` with RECTANGLE - Create axis line
- `createSection` - (Optional) Group timeline

## Example Output (Horizontal)

```
                    ┌───────────────────┐
                    │  Project Timeline │
                    └─────────┬─────────┘
                              │
══════════●══════════●══════════●══════════●══════════●══════════●══════════●════
          │          │          │          │          │          │          │
          ▼          ▼          ▼          ▼          ▼          ▼          ▼
     ┌─────────┐┌─────────┐┌─────────┐┌─────────┐┌─────────┐┌─────────┐┌─────────┐
     │ Kickoff ││  Reqs   ││ Design  ││Sprint 1 ││Sprint 2 ││ Testing ││ Launch  │
     └─────────┘└─────────┘└─────────┘└─────────┘└─────────┘└─────────┘└─────────┘
       Jan        Feb        Mar        Apr        May        Jun        Jul
```

## Example Output (Vertical)

```
     ┌───────────────────┐
     │  Product Roadmap  │
     └─────────┬─────────┘
               │
    Q1 2024 ───●─── ┌─────────────────┐
               │    │   Foundation    │
               │    │ • Core infra    │
               │    │ • User auth     │
               │    └─────────────────┘
               │
    Q2 2024 ───●─── ┌─────────────────┐
               │    │ Growth Features │
               │    │ • Analytics     │
               │    │ • Integrations  │
               │    └─────────────────┘
               │
    Q3 2024 ───●─── ┌─────────────────┐
               │    │     Scale       │
               │    │ • Performance   │
               │    │ • Enterprise    │
               │    └─────────────────┘
               │
               ▼
```

## Variations

### Gantt-Style

Add duration bars between start and end dates.

### Milestone-Only

Show only key milestones without detail cards.

### Branching Timeline

Show parallel tracks for different workstreams.

### Status-Colored

Color-code by status: Completed (green), In Progress (orange), Planned (gray).

### Grouped Timeline

Group events by phase or category with section dividers.
