# Claude Figma Bridge

A real-time bridge enabling Claude Code to interact with Figma directly. Create, modify, and manipulate design elements, manage variables, build design systems, and extract design tokens from live websites.

## Quick Start

```bash
# Start the bridge server
pnpm dev

# Server runs at http://localhost:4001
# Open Figma plugin: Plugins → Development → Claude Figma Bridge
```

## Project Structure

```
FigmaPlugin/
├── bridge-server/          # Express + WebSocket server (localhost:4001)
│   └── src/
│       ├── index.ts        # Server entry point
│       ├── routes/         # HTTP route handlers
│       │   ├── commands.ts # POST /commands endpoint
│       │   └── results.ts  # GET /results/:id endpoint
│       └── services/
│           ├── queue.ts           # Command queue management
│           ├── websocket.ts       # WebSocket connections
│           └── websiteExtractor.ts # Puppeteer CSS extraction
│
├── figma-plugin/           # Figma plugin (runs inside Figma)
│   └── src/
│       ├── code.ts         # Main plugin logic
│       ├── ui.html/ts      # Plugin UI
│       ├── commands/       # Command handlers (174 commands)
│       ├── data/           # Static data (boilerplate values)
│       └── utils/          # Helper utilities
│
├── shared/                 # Shared TypeScript types
│   └── types/
│       └── index.ts        # FigmaCommand, CommandPayload, etc.
│
├── prompts/                # User-facing documentation
│   ├── figma-bridge.md     # Main API reference (READ THIS FIRST)
│   ├── figma-variables.md  # Variable creation workflow
│   ├── bind-variables.md   # Variable binding workflow
│   ├── website-design-system.md # Website extraction workflow
│   └── figma-documentation.md   # Doc frame creation
│
└── .claude/
    └── agents/             # 30 AI agent definitions
        ├── figma-variables.md    # Design system creation
        ├── figma-binding.md      # Variable binding
        ├── website-design-system-extractor.md # Website extraction
        └── ... (27 more agents)
```

## How to Use figma-bridge.md

The `prompts/figma-bridge.md` file is the **primary reference** for all Figma Bridge operations. Use it to:

### 1. Send Commands to Figma

All interactions go through HTTP POST to `http://localhost:4001/commands`:

```bash
# Create a rectangle
curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{"type": "create", "payload": {
    "nodeType": "RECTANGLE",
    "properties": {"x": 0, "y": 0, "width": 100, "height": 100}
  }}'

# Get result
curl "http://localhost:4001/results/{commandId}?wait=true"
```

### 2. Create Design Systems

Use `createDesignSystem` for complete 4-level variable hierarchy:

```bash
curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{"type": "createDesignSystem", "payload": {
    "brandColors": {"primary": "#ff6d38"},
    "includeBoilerplate": true
  }}'
```

Creates: Primitive → Semantic → Tokens → Theme collections with 200+ variables.

### 3. Extract from Websites

Use headless browser extraction for live website CSS:

```bash
curl -X POST http://localhost:4001/commands \
  -H "Content-Type: application/json" \
  -d '{"type": "extractWebsiteCSS", "payload": {
    "url": "https://example.com/"
  }}'
```

Returns computed colors, typography, spacing, border radius, shadows, etc.

### 4. Modify Existing Nodes

Query selection, then modify:

```bash
# Get selection
curl -X POST http://localhost:4001/commands \
  -d '{"type": "query", "payload": {"queryType": "selection"}}'

# Modify by ID
curl -X POST http://localhost:4001/commands \
  -d '{"type": "modify", "target": "NODE_ID", "payload": {
    "properties": {"fills": [{"type": "SOLID", "color": {"r": 1, "g": 0, "b": 0}}]}
  }}'
```

## Key Command Categories

| Category | Examples |
|----------|----------|
| **Node Operations** | create, modify, move, resize, delete, clone, group |
| **Variables** | createDesignSystem, createVariable, editVariable, bindFillVariable |
| **Styles** | createPaintStyle, createTextStyle, applyStyle |
| **Components** | createComponent, createInstance |
| **Query** | query, getFrames, getVariables, getNodeColors |
| **Server-Side** | extractWebsiteCSS (Puppeteer headless browser) |

## Available Agents (30)

Agents are AI instructions for complex multi-step workflows. Key agents:

| Agent | Purpose |
|-------|---------|
| `figma-variables` | Creates 4-level design systems from Figma frames |
| `figma-binding` | Binds variables to frame elements |
| `website-design-system-extractor` | Extracts CSS from websites, creates Figma variables |
| `design-system-orchestrator` | Full pipeline: extract → create → bind → document → validate |
| `engineering-handoff` | Generates dev specs, CSS, token maps |
| `figjam-workflow-design` | Creates FigJam diagrams for workflows, processes, and user journeys |

Full list in `prompts/figma-bridge.md` → Related Agents section.

## Common Workflows

### Create Design System from Website

1. Extract CSS: `extractWebsiteCSS` with website URL
2. Create base system: `createDesignSystem` with boilerplate
3. Update colors: `editVariable` on Brand/Secondary/Tertiary scales
4. Add custom values: `createVariable` for extracted tokens
5. Bind to frames: `bindFillVariable`, `bindVariable`

### Create Design System from Figma Frame (One-Shot)

1. Select frame in Figma
2. Extract tokens: `extractDesignTokens` with `scope: "selection"` or `"file"`
3. Create system: `createDesignSystem` with `extractedTokens` from step 2
   - **Automatic binding**: Color variables bound to matching nodes
   - **Automatic binding**: Text styles applied to nodes by font size
   - **Automatic binding**: Effect styles applied to nodes with matching shadows
4. Result includes `colorBindings`, `typographyStyles.nodesStyled`, `effectStyles.nodesStyled`

**Key Features**: The `extractDesignTokens` command tracks:
- `fontSizeNodes` - font sizes → node IDs for text style binding
- `colorNodes` - fill colors → node IDs for color variable binding
- `strokeNodes` - stroke colors → node IDs for stroke variable binding
- `shadows[].nodeIds` - shadow effects → node IDs for effect style binding

When passed to `createDesignSystem`, all bindings are applied automatically during creation.

### Build Component Library

1. Create design system (above)
2. Create components: `createComponent` with auto layout
3. Add variants: Nested component sets
4. Bind tokens: `bindVariable` for all properties
5. Generate handoff: Use `engineering-handoff` agent

## Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Start bridge server (dev mode with hot reload)
pnpm dev

# Build plugin only
pnpm build:plugin
```

### Prerequisites

- Node.js 18+
- pnpm
- Google Chrome (for website extraction)
- Figma desktop app

### Installing the Plugin

1. `pnpm build:plugin`
2. Figma → Plugins → Development → Import plugin from manifest
3. Select `figma-plugin/dist/manifest.json`
4. Open: Plugins → Development → Claude Figma Bridge

## File Reference

| Path | Purpose |
|------|---------|
| `prompts/figma-bridge.md` | **Main API reference** - all commands, examples |
| `prompts/memory-server.md` | Memory server API for tracking progress/solutions |
| `prompts/website-design-system.md` | Website extraction workflow |
| `.claude/agents/*.md` | AI agent definitions |
| `bridge-server/src/services/websiteExtractor.ts` | Puppeteer extraction logic |
| `figma-plugin/src/commands/` | Command implementations |
| `figma-plugin/src/data/boilerplate.ts` | Default design token values |

## Architecture

```
┌─────────────────┐     HTTP/WS      ┌─────────────────┐
│  Claude Code    │ ◄──────────────► │  Bridge Server  │
│  (CLI/Agent)    │   localhost:4001 │  (Express + WS) │
└─────────────────┘                  └────────┬────────┘
                                              │
                                              │ Long Poll
                                              │
                                     ┌────────▼────────┐
                                     │  Figma Plugin   │
                                     │  (Inside Figma) │
                                     └─────────────────┘
```

**Flow:**
1. Claude sends command to Bridge Server
2. Plugin polls for commands (or receives via WebSocket)
3. Plugin executes command in Figma
4. Plugin sends result back to Bridge Server
5. Claude retrieves result

## Long-Running Commands

Some commands (like `extractDesignTokens` with `scope: "file"`) can take several minutes on large files.

### Timeouts

- Default result timeout: 30 seconds
- Maximum result timeout: **5 minutes** (300,000ms)
- Use extended timeout for long commands:
  ```bash
  curl "http://localhost:4001/results/{id}?wait=true&timeout=300000"
  ```

### Monitoring Long Commands

Check command status without waiting:
```bash
curl http://localhost:4001/logs/running
# Returns: {"running":true,"commandType":"extractDesignTokens","elapsedMs":45000,"elapsedFormatted":"45s"}
```

Get plugin logs:
```bash
curl http://localhost:4001/logs
```

### Plugin UI During Long Commands

- Yellow status box with spinner shows when a command is running
- Command type is displayed (e.g., "extractDesignTokens")
- Elapsed time shown when command completes
- **Note:** Live timer cannot update during execution due to Figma's single-threaded plugin architecture

### Closing the Plugin

- **Cannot close during command execution** - Figma's plugin thread is blocked
- **Plugin closes automatically** when the current command finishes
- If you try to close during execution, it will close as soon as the command completes

### Graceful Server Shutdown

Press `Ctrl+C` to stop the bridge server. It will:
1. Close all active connections
2. Shut down gracefully
3. Force exit after 3 seconds if needed

## Tips

- **Always query first** - Get node IDs before modifying
- **Use Inter font** - Pre-loaded; others may cause errors
- **Batch operations** - Use `batchCreate`/`batchModify` for multiple items
- **Check results** - Poll `/results/{id}?wait=true` for confirmation
- **4-level variables** - Always use Primitive → Semantic → Tokens → Theme hierarchy
- **Long commands** - Use `timeout=300000` for file-scope operations

## Memory Integration

Vector memory server at `http://localhost:8080` for tracking progress and solutions across sessions. Search before solving errors, save after fixing them. See `prompts/memory-server.md` for full API reference.
