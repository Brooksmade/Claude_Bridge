# Data Table

Simple rows × columns data display using native FigJam table.

## When to Use

- Displaying structured data
- Simple information grids
- Reference tables
- Status boards
- Schedule/calendar views

## Input Format

Markdown table:

```markdown
| Name | Department | Status | Start Date |
|------|------------|--------|------------|
| Alice Smith | Engineering | Active | 2024-01-15 |
| Bob Johnson | Marketing | On Leave | 2023-06-01 |
| Carol Davis | Sales | Active | 2024-03-10 |
| Dave Wilson | Engineering | Active | 2023-11-20 |
```

## Layout Rules

| Element | Fill Color | Text Color | Notes |
|---------|------------|------------|-------|
| Header Row | `#2c3e50` (PRIMARY) | `#ffffff` | Bold font |
| Data Rows | `#ffffff` (NEUTRAL) | `#333333` | Regular font |
| Alternating Rows | `#f8f9fa` | `#333333` | Optional zebra striping |

## Spacing

| Type | Value |
|------|-------|
| Cell padding | 12px horizontal, 8px vertical |
| Min column width | 80px |
| Row height | 36-44px |
| Header height | 44px |

## Native Table Command

FigJam supports native tables via the `createTable` command:

```json
{
  "type": "createTable",
  "payload": {
    "x": 100,
    "y": 100,
    "rows": 5,
    "columns": 4,
    "cellWidth": 120,
    "cellHeight": 40
  }
}
```

**Note:** Native tables have limited styling. For fully styled tables, use `createShapeWithText` grid (see comparison-table.md).

## Position Calculation (Shape-Based)

If using shapes instead of native tables:

```javascript
const CELL_PADDING_H = 12;
const CELL_PADDING_V = 8;
const MIN_COL_WIDTH = 80;
const HEADER_HEIGHT = 44;
const ROW_HEIGHT = 40;
const CELL_GAP = 2;

function calculateDataTable(table, startX, startY) {
  const { headers, rows } = table;
  const numCols = headers.length;

  // Calculate column widths
  const colWidths = headers.map((h, colIndex) => {
    let maxWidth = measureText(h, 12).width + CELL_PADDING_H * 2;
    rows.forEach(row => {
      if (row[colIndex]) {
        const w = measureText(row[colIndex], 12).width + CELL_PADDING_H * 2;
        maxWidth = Math.max(maxWidth, w);
      }
    });
    return Math.max(maxWidth, MIN_COL_WIDTH);
  });

  const cells = [];

  // Header row
  let x = startX;
  headers.forEach((header, colIndex) => {
    cells.push({
      text: header,
      x,
      y: startY,
      width: colWidths[colIndex],
      height: HEADER_HEIGHT,
      fillColor: '#2c3e50',
      textColor: '#ffffff',
      isHeader: true
    });
    x += colWidths[colIndex] + CELL_GAP;
  });

  // Data rows
  let y = startY + HEADER_HEIGHT + CELL_GAP;
  rows.forEach((row, rowIndex) => {
    x = startX;
    const isAlternate = rowIndex % 2 === 1;

    row.forEach((cell, colIndex) => {
      cells.push({
        text: cell || '',
        x,
        y,
        width: colWidths[colIndex],
        height: ROW_HEIGHT,
        fillColor: isAlternate ? '#f8f9fa' : '#ffffff',
        textColor: '#333333',
        isHeader: false
      });
      x += colWidths[colIndex] + CELL_GAP;
    });
    y += ROW_HEIGHT + CELL_GAP;
  });

  return cells;
}
```

## Generation Steps

### 1. Parse Input

```javascript
function parseMarkdownTable(input) {
  const lines = input.trim().split('\n')
    .filter(l => l.trim() && !l.includes('---'));

  const parseRow = line => line
    .split('|')
    .filter(c => c.trim() !== '')
    .map(c => c.trim());

  const headers = parseRow(lines[0]);
  const rows = lines.slice(1).map(parseRow);

  return { headers, rows };
}
```

### 2. Option A: Native Table

```bash
# Create native FigJam table
curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{
    "type": "createTable",
    "payload": {
      "x": 100,
      "y": 100,
      "rows": 5,
      "columns": 4,
      "cellWidth": 120,
      "cellHeight": 40
    }
  }'
```

Then populate cells individually or use batch operations.

### 3. Option B: Shape-Based Table

```bash
# Header cell
curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{
    "type": "createShapeWithText",
    "payload": {
      "text": "Name",
      "shapeType": "ROUNDED_RECTANGLE",
      "x": 100, "y": 100,
      "width": 120, "height": 44,
      "fillColor": "#2c3e50",
      "fontSize": 12
    }
  }'

# Data cell (even row - white)
curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{
    "type": "createShapeWithText",
    "payload": {
      "text": "Alice Smith",
      "shapeType": "ROUNDED_RECTANGLE",
      "x": 100, "y": 146,
      "width": 120, "height": 40,
      "fillColor": "#ffffff",
      "strokeColor": "#bdc3c7",
      "strokeWeight": 1,
      "fontSize": 12
    }
  }'

# Data cell (odd row - alternate gray)
curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{
    "type": "createShapeWithText",
    "payload": {
      "text": "Bob Johnson",
      "shapeType": "ROUNDED_RECTANGLE",
      "x": 100, "y": 188,
      "width": 120, "height": 40,
      "fillColor": "#f8f9fa",
      "strokeColor": "#bdc3c7",
      "strokeWeight": 1,
      "fontSize": 12
    }
  }'
```

## Commands Used

- `createTable` - Native FigJam table (limited styling)
- `measureText` - Get text dimensions for column sizing
- `createShapeWithText` - Create styled cells (full control)
- `createSection` - (Optional) Group table

## Example Output

```
┌────────────┬────────────┬─────────┬────────────┐
│    Name    │ Department │ Status  │ Start Date │  <- Header (dark)
├────────────┼────────────┼─────────┼────────────┤
│Alice Smith │Engineering │ Active  │ 2024-01-15 │  <- Row 1 (white)
├────────────┼────────────┼─────────┼────────────┤
│Bob Johnson │ Marketing  │On Leave │ 2023-06-01 │  <- Row 2 (gray)
├────────────┼────────────┼─────────┼────────────┤
│Carol Davis │   Sales    │ Active  │ 2024-03-10 │  <- Row 3 (white)
├────────────┼────────────┼─────────┼────────────┤
│Dave Wilson │Engineering │ Active  │ 2023-11-20 │  <- Row 4 (gray)
└────────────┴────────────┴─────────┴────────────┘
```

## Variations

### Status Indicators

Color-code status cells:
- Active → `#27ae60` (green)
- On Leave → `#e67e22` (orange)
- Inactive → `#95a5a6` (gray)

### Sortable Appearance

Add sort indicators (↑ ↓) to header text.

### Compact View

Reduce row height to 32px and font to 11px.

### Wide Table

For many columns, consider horizontal scrolling indicator or split into multiple tables.

## When to Use Native vs Shape-Based

| Scenario | Recommendation |
|----------|----------------|
| Quick data display | Native `createTable` |
| Custom cell colors | Shape-based |
| Status indicators | Shape-based |
| Consistent with other charts | Shape-based |
| Large datasets | Native `createTable` |
| Printable/export needs | Native `createTable` |
