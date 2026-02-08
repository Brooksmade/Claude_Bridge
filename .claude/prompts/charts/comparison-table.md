# Comparison Table

Side-by-side feature comparison using native FigJam tables.

## When to Use

- Feature comparison across products/options
- Pros/cons analysis
- Capability matrices
- Pricing tier comparisons
- Technology stack comparisons

## Input Format

Markdown table with feature column and comparison columns:

```markdown
| Feature | Option A | Option B | Option C |
|---------|----------|----------|----------|
| Price | $10/mo | $25/mo | $50/mo |
| Storage | 10 GB | 50 GB | Unlimited |
| Users | 1 | 5 | Unlimited |
| Support | Email | Chat | 24/7 Phone |
| API Access | No | Limited | Full |
```

Or with checkmarks/X marks:

```markdown
| Feature | Basic | Pro | Enterprise |
|---------|-------|-----|------------|
| Dashboard | ✓ | ✓ | ✓ |
| Analytics | ✗ | ✓ | ✓ |
| Custom Reports | ✗ | ✗ | ✓ |
| API Access | ✗ | ✓ | ✓ |
| SSO | ✗ | ✗ | ✓ |
```

## Native Table Command

FigJam has native table support. Use `createTable` with `cellData` to create a complete table in a single command.

**Command: `createTable`**

| Parameter | Type | Description |
|-----------|------|-------------|
| `rows` | number | Number of rows (including header) |
| `columns` | number | Number of columns |
| `x` | number | X position |
| `y` | number | Y position |
| `cellData` | string[][] | 2D array of cell content |
| `headerRowColor` | string | Fill color for header row (hex, e.g., "#2c3e50") |
| `featureColumnColor` | string | Fill color for first column (hex, e.g., "#3498db") |
| `rowColors` | object | Fill colors by row index (e.g., `{"0": "#2c3e50"}`) |

**Auto Text Contrast**: When applying fill colors, text automatically switches to white on dark backgrounds and dark gray on light backgrounds for optimal readability.

## Color System

| Element | Color | Hex | Use |
|---------|-------|-----|-----|
| Header Row | PRIMARY | `#2c3e50` | Dark blue for headers |
| Feature Column | INPUT | `#3498db` | Blue for row labels |
| Highlight | OUTPUT | `#27ae60` | Green for positive/yes |
| Warning | ACTION | `#e67e22` | Orange for attention |
| Negative | NEGATIVE | `#e74c3c` | Red for negative/no |
| Neutral | NEUTRAL | `#ffffff` | White for data cells |

## Generation Steps

### 1. Parse Markdown Table

```javascript
function parseMarkdownTable(input) {
  const lines = input.trim().split('\n').filter(l => l.trim());

  // Skip separator line (contains ---)
  const dataLines = lines.filter(l => !l.includes('---'));

  const parseRow = line =>
    line.split('|')
      .filter(c => c.trim())
      .map(c => c.trim());

  const headers = parseRow(dataLines[0]);
  const rows = dataLines.slice(1).map(parseRow);

  return {
    headers,
    rows,
    numRows: rows.length + 1, // +1 for header row
    numColumns: headers.length
  };
}
```

### 2. Create Table with Data

**Single command creates complete styled table:**

```bash
curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{
    "type": "createTable",
    "payload": {
      "rows": 6,
      "columns": 4,
      "x": 100,
      "y": 100,
      "headerRowColor": "#2c3e50",
      "featureColumnColor": "#3498db",
      "cellData": [
        ["Feature", "Basic", "Pro", "Enterprise"],
        ["Dashboard", "✓", "✓", "✓"],
        ["Analytics", "✗", "✓", "✓"],
        ["Custom Reports", "✗", "✗", "✓"],
        ["API Access", "✗", "✓", "✓"],
        ["SSO", "✗", "✗", "✓"]
      ]
    }
  }'
```

Text color is automatically set for contrast (white on dark backgrounds).

### 3. (Optional) Update Individual Cells

Use `setTableCell` to modify specific cells after creation:

```bash
curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{
    "type": "setTableCell",
    "payload": {
      "tableId": "TABLE_NODE_ID",
      "row": 1,
      "column": 2,
      "text": "✓"
    }
  }'
```

## Complete Example

**Input markdown:**
```markdown
| Feature | Option A | Option B | Option C |
|---------|----------|----------|----------|
| Price | $10/mo | $25/mo | $50/mo |
| Storage | 10 GB | 50 GB | Unlimited |
| Users | 1 | 5 | Unlimited |
```

**Conversion to command (with styling):**
```bash
curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{
    "type": "createTable",
    "payload": {
      "rows": 4,
      "columns": 4,
      "x": 100,
      "y": 100,
      "headerRowColor": "#2c3e50",
      "featureColumnColor": "#3498db",
      "cellData": [
        ["Feature", "Option A", "Option B", "Option C"],
        ["Price", "$10/mo", "$25/mo", "$50/mo"],
        ["Storage", "10 GB", "50 GB", "Unlimited"],
        ["Users", "1", "5", "Unlimited"]
      ]
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "123:456",
    "name": "Table",
    "numRows": 4,
    "numColumns": 4,
    "x": 100,
    "y": 100
  }
}
```

## Commands Used

| Command | Purpose |
|---------|---------|
| `createTable` | Create native FigJam table with cell data and styling |
| `setTableCell` | Update individual cell content |
| `styleTableRow` | Apply fill color to entire row (with auto text contrast) |
| `styleTableCell` | Apply fill color to single cell (with auto text contrast) |

## Implementation Algorithm

```javascript
async function createComparisonTable(markdownTable, x, y) {
  const { headers, rows, numRows, numColumns } = parseMarkdownTable(markdownTable);

  // Build cellData as 2D array
  const cellData = [headers, ...rows];

  // Create table with all data in single command
  const response = await fetch('http://localhost:4001/commands', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'createTable',
      payload: {
        rows: numRows,
        columns: numColumns,
        x,
        y,
        cellData
      }
    })
  });

  return response.json();
}
```

## Notes

- FigJam tables automatically handle:
  - Column widths based on content
  - Row heights
  - Cell borders and spacing
  - Text alignment
- Tables are native FigJam elements with full interactivity
- Users can manually adjust column widths after creation
- No manual positioning or shape creation required

## Comparison: Native Table vs Manual Shapes

| Aspect | Native Table | Manual Shapes |
|--------|--------------|---------------|
| Commands | 1 | N (rows × columns) |
| Layout | Automatic | Manual calculation |
| Resizing | Built-in | Not supported |
| Cell editing | Native | Replace shape |
| Alignment | Automatic | Manual |
