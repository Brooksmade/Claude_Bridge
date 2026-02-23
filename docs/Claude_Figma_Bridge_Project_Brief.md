# Bridge to Fig

## Project Brief & Implementation Guide

**Current Version:** 1.2.0 | **Commands:** 136+ | **Last Updated:** January 2026

> **Purpose:** This document contains all context needed to prompt Claude Code to build a real-time bridge between Claude Code and Figma, enabling conversational design creation on the Figma canvas.

---

## 1. Project Goal

Build a system that allows a user to chat with Claude Code and have Claude create, modify, and manipulate design objects directly on a Figma canvas in real-time.

### User Experience Vision

```
User: "Create a card component with a header, image placeholder, and two buttons"
Claude: *Creates the component on the Figma canvas*
Claude: "Done. I've created a card component at (100, 100) with:
        - Header text frame
        - 16:9 image placeholder
        - Primary and secondary button frames
        Want me to adjust the spacing or add variants?"
```

---

## 2. Architecture

### Recommended Architecture: HTTP Polling Bridge

```
┌──────────────────┐                    ┌──────────────────┐                    ┌──────────────┐
│   Claude Code    │                    │  Local Bridge    │                    │    Figma     │
│                  │  HTTP POST         │  Server          │   HTTP GET         │    Plugin    │
│  - Generates     │ ────────────────►  │                  │ ◄──────────────    │              │
│    commands      │  /queue-command    │  - Command Queue │   /poll-commands   │  - Executes  │
│  - Receives      │                    │  - Result Store  │                    │    commands  │
│    feedback      │ ◄────────────────  │                  │ ────────────────►  │  - Returns   │
│                  │  GET /results      │  - WebSocket     │   POST /results    │    results   │
└──────────────────┘                    │    (optional)    │                    └──────────────┘
                                        └──────────────────┘
                                               ▲
                                               │ localhost:3001
                                               │ (configurable)
```

### Why This Architecture?

| Approach | Pros | Cons | Verdict |
|----------|------|------|---------|
| **HTTP Polling** | Works within Figma sandbox, simple, reliable | Slight latency (100-500ms) | ✅ Recommended |
| WebSocket | Real-time, bidirectional | Figma plugins can't open servers | ❌ Not possible |
| File watching | Simple | Requires file system access from plugin | ❌ Not possible |
| Figma REST API | Official, no plugin needed | Limited write capabilities, no real-time | ❌ Insufficient |

### Component Overview

#### Component 1: Bridge Server (Node.js)
- Runs locally on user's machine
- Exposes REST endpoints for command queuing
- Manages command queue and result storage
- Optional: WebSocket for Claude Code to receive real-time updates

#### Component 2: Figma Plugin
- Polls bridge server for pending commands
- Translates JSON commands to Figma Plugin API calls
- Returns execution results to bridge server
- Handles errors gracefully

#### Component 3: Claude Code Integration
- Command generation based on natural language
- HTTP client to communicate with bridge server
- Result interpretation and user feedback

---

## 3. Technical Specifications

### 3.1 Command Schema

```typescript
interface FigmaCommand {
  id: string;                    // UUID for tracking
  type: 'create' | 'modify' | 'delete' | 'query' | 'style';
  target?: string;               // Node ID for modify/delete
  payload: CreatePayload | ModifyPayload | DeletePayload | QueryPayload;
  timestamp: number;
}

interface CreatePayload {
  nodeType: 'FRAME' | 'RECTANGLE' | 'ELLIPSE' | 'TEXT' | 'LINE' |
            'COMPONENT' | 'GROUP' | 'VECTOR' | 'POLYGON' | 'STAR' | 'TABLE';
  properties: NodeProperties;
  parent?: string;               // Parent node ID, defaults to current page
  children?: CreatePayload[];    // Nested creation
}

interface NodeProperties {
  name?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fills?: Paint[];
  strokes?: Paint[];
  strokeWeight?: number;
  cornerRadius?: number;
  opacity?: number;
  // Text-specific
  characters?: string;
  fontSize?: number;
  fontName?: { family: string; style: string };
  textAlignHorizontal?: 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFIED';
  // Layout-specific
  layoutMode?: 'NONE' | 'HORIZONTAL' | 'VERTICAL';
  primaryAxisAlignItems?: 'MIN' | 'CENTER' | 'MAX' | 'SPACE_BETWEEN';
  counterAxisAlignItems?: 'MIN' | 'CENTER' | 'MAX';
  itemSpacing?: number;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
}

interface CommandResult {
  commandId: string;
  success: boolean;
  nodeId?: string;               // Created/modified node ID
  error?: string;
  data?: any;                    // Query results
}
```

### 3.2 Bridge Server Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | Server health check |
| `/commands` | GET | Poll for pending commands (plugin calls this) |
| `/commands` | POST | Queue a new command (Claude Code calls this) |
| `/commands/:id` | DELETE | Cancel a pending command |
| `/results` | POST | Submit command result (plugin calls this) |
| `/results/:id` | GET | Get result for specific command |
| `/results/stream` | WebSocket | Real-time result streaming (optional) |

### 3.3 Figma Plugin API Methods

Reference for implementation:

```javascript
// Creation methods
figma.createFrame()
figma.createRectangle()
figma.createEllipse()
figma.createText()
figma.createLine()
figma.createPolygon()
figma.createStar()
figma.createVector()
figma.createComponent()
figma.createComponentSet()
figma.createBooleanOperation()
figma.createConnector()
figma.createTable()
figma.createSlice()

// Navigation & Selection
figma.currentPage
figma.currentPage.selection
figma.viewport.scrollAndZoomIntoView(nodes)

// Node manipulation
node.remove()
node.clone()
figma.group(nodes, parent)
figma.flatten(nodes)

// Fonts (required before setting text)
await figma.loadFontAsync({ family: "Inter", style: "Regular" })

// Styles
figma.getLocalPaintStyles()
figma.getLocalTextStyles()
figma.getLocalEffectStyles()
```

---

## 4. Source Documentation

### Essential Reading (Claude should fetch these)

| Resource | URL | Purpose |
|----------|-----|---------|
| Plugin API Overview | https://www.figma.com/plugin-docs/ | Introduction and concepts |
| API Reference | https://developers.figma.com/docs/plugins/api/api-reference/ | Full API documentation |
| figma Global Object | https://www.figma.com/plugin-docs/api/figma/ | Creation methods |
| Node Types | https://developers.figma.com/docs/plugins/api/node-types/ | All node types and properties |
| Plugin Manifest | https://developers.figma.com/docs/plugins/manifest/ | Plugin configuration |
| Plugin Quickstart | https://developers.figma.com/docs/plugins/getting-started/ | Setup guide |
| Network Access | https://developers.figma.com/docs/plugins/api/properties/figma-ui/#network-access | HTTP from plugins |
| TypeScript Typings | https://www.npmjs.com/package/@figma/plugin-typings | Type definitions |

### Additional Context

| Resource | URL | Purpose |
|----------|-----|---------|
| Figma MCP Server (read-only) | https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Figma-MCP-server | Understand limitations |
| Create Figma Plugin CLI | https://yuanqing.github.io/create-figma-plugin/ | Alternative scaffolding tool |
| Figma Plugin Samples | https://github.com/figma/plugin-samples | Official examples |

---

## 5. Recommended Project Setup

### 5.1 Directory Structure

```
bridge-to-fig/
├── bridge-server/              # Node.js bridge server
│   ├── src/
│   │   ├── index.ts           # Entry point
│   │   ├── routes/
│   │   │   ├── commands.ts    # Command queue endpoints
│   │   │   └── results.ts     # Result endpoints
│   │   ├── services/
│   │   │   ├── queue.ts       # Command queue management
│   │   │   └── websocket.ts   # Optional WebSocket handler
│   │   └── types/
│   │       └── commands.ts    # Shared type definitions
│   ├── package.json
│   └── tsconfig.json
│
├── figma-plugin/               # Figma plugin
│   ├── src/
│   │   ├── code.ts            # Main plugin code (runs in Figma)
│   │   ├── ui.html            # Plugin UI (optional)
│   │   ├── ui.ts              # UI logic (optional)
│   │   ├── commands/
│   │   │   ├── create.ts      # Creation command handlers
│   │   │   ├── modify.ts      # Modification handlers
│   │   │   ├── delete.ts      # Deletion handlers
│   │   │   └── query.ts       # Query handlers
│   │   └── utils/
│   │       ├── api-client.ts  # HTTP client for bridge
│   │       └── node-factory.ts # Node creation helpers
│   ├── manifest.json          # Figma plugin manifest
│   ├── package.json
│   └── tsconfig.json
│
├── shared/                     # Shared types and utilities
│   └── types/
│       └── commands.ts        # Command/result interfaces
│
├── claude-integration/         # Claude Code helpers (optional)
│   ├── commands.md            # Command reference for Claude
│   └── examples.md            # Example interactions
│
├── package.json               # Root package.json (workspaces)
├── README.md
└── .claude/                   # Claude Code configuration
    └── settings.json
```

### 5.2 Technology Stack

| Component | Technology | Reason |
|-----------|------------|--------|
| Bridge Server | Node.js + Express/Fastify | Simple, fast, TypeScript support |
| Plugin | TypeScript | Required for Figma Plugin API |
| Build Tool | esbuild or Vite | Fast bundling for plugin |
| Package Manager | pnpm | Efficient workspaces |
| Types | @figma/plugin-typings | Official type definitions |

### 5.3 Dependencies

```json
// bridge-server/package.json
{
  "dependencies": {
    "express": "^4.18.x",
    "cors": "^2.8.x",
    "uuid": "^9.x",
    "ws": "^8.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "@types/node": "^20.x",
    "@types/express": "^4.x",
    "tsx": "^4.x"
  }
}

// figma-plugin/package.json
{
  "devDependencies": {
    "@figma/plugin-typings": "^1.x",
    "typescript": "^5.x",
    "esbuild": "^0.20.x"
  }
}
```

---

## 6. MCP Servers & Tools

### Recommended MCP Servers for Development

| MCP Server | Purpose | Installation |
|------------|---------|--------------|
| **filesystem** | Read/write project files | Built-in or `@anthropic/mcp-filesystem` |
| **fetch** | Fetch documentation URLs | Built-in WebFetch |
| **github** | Access Figma plugin samples repo | `@anthropic/mcp-github` |

### Claude Code Configuration

Add to `.claude/settings.json` in the project:

```json
{
  "permissions": {
    "allow": [
      "Bash(npm:*)",
      "Bash(pnpm:*)",
      "Bash(node:*)",
      "Bash(npx:*)",
      "WebFetch(domain:figma.com)",
      "WebFetch(domain:developers.figma.com)",
      "WebFetch(domain:www.figma.com)"
    ]
  }
}
```

---

## 7. Implementation Phases

### Phase 1: Foundation
- [ ] Set up monorepo structure
- [ ] Create bridge server with basic endpoints
- [ ] Create minimal Figma plugin that can poll server
- [ ] Test basic communication (ping/pong)

### Phase 2: Core Commands
- [ ] Implement `create` commands for basic shapes (Rectangle, Ellipse, Frame)
- [ ] Implement `create` for Text nodes
- [ ] Implement `modify` commands (position, size, color)
- [ ] Implement `delete` commands
- [ ] Add result reporting

### Phase 3: Advanced Features
- [ ] Component creation
- [ ] Auto Layout support
- [ ] Style application
- [ ] Group/ungroup operations
- [ ] Query commands (get node info)

### Phase 4: Polish
- [ ] Error handling and recovery
- [ ] Command batching for performance
- [ ] Plugin UI for status/configuration
- [ ] Documentation and examples

---

## 8. Example Interactions

### Example 1: Create a Button

**User says:** "Create a primary button with the text 'Submit'"

**Claude generates command:**
```json
{
  "id": "cmd-001",
  "type": "create",
  "payload": {
    "nodeType": "FRAME",
    "properties": {
      "name": "Button/Primary",
      "width": 120,
      "height": 40,
      "cornerRadius": 8,
      "fills": [{ "type": "SOLID", "color": { "r": 0.2, "g": 0.4, "b": 1 } }],
      "layoutMode": "HORIZONTAL",
      "primaryAxisAlignItems": "CENTER",
      "counterAxisAlignItems": "CENTER",
      "paddingLeft": 16,
      "paddingRight": 16
    },
    "children": [{
      "nodeType": "TEXT",
      "properties": {
        "characters": "Submit",
        "fontSize": 14,
        "fontName": { "family": "Inter", "style": "Medium" },
        "fills": [{ "type": "SOLID", "color": { "r": 1, "g": 1, "b": 1 } }]
      }
    }]
  }
}
```

### Example 2: Modify Existing Element

**User says:** "Make that button larger and change it to green"

**Claude generates command:**
```json
{
  "id": "cmd-002",
  "type": "modify",
  "target": "1:23",
  "payload": {
    "properties": {
      "width": 160,
      "height": 48,
      "fills": [{ "type": "SOLID", "color": { "r": 0.2, "g": 0.8, "b": 0.4 } }]
    }
  }
}
```

---

## 9. Key Challenges & Solutions

| Challenge | Solution |
|-----------|----------|
| **Font loading** | Pre-load common fonts on plugin start; queue font loads before text creation |
| **Plugin sandbox** | Use HTTP fetch (allowed) instead of WebSocket server |
| **Latency** | Batch commands; use short polling interval (100ms) |
| **Error recovery** | Return detailed errors; allow command retry |
| **Node references** | Return created node IDs; maintain ID map in session |
| **Complex layouts** | Build compound commands; create helper functions |

---

## 10. Getting Started Prompt

When starting a new Claude Code session in the project folder, use this prompt:

```
I'm building a Figma plugin bridge that allows Claude Code to create and
manipulate objects on the Figma canvas in real-time.

Read the project brief at ./Bridge_to_Fig_Project_Brief.md for full context.

Then:
1. Fetch the Figma Plugin API documentation from the URLs listed
2. Set up the project structure as specified
3. Start with Phase 1: Foundation

Let me know when you're ready to begin implementation.
```

---

## 11. Success Criteria

- [x] User can start bridge server with single command
- [x] Figma plugin connects and polls successfully
- [x] Claude Code can create basic shapes via natural language
- [x] Claude Code can modify existing elements
- [x] Round-trip latency < 500ms
- [x] Errors are reported clearly to user
- [x] Plugin works in Figma desktop and browser
- [x] Complete design system creation with one command
- [x] 136+ commands across 15 categories
- [x] Idempotent design system operations

---

## 12. Design System Commands (v1.2.0)

The bridge now includes composite commands for one-shot design system creation:

### createDesignSystem
Creates complete 4-level variable hierarchy:
```json
{
  "type": "createDesignSystem",
  "payload": {
    "brandColors": { "primary": "#ff6d38", "secondary": "#7a78ff" },
    "includeBoilerplate": true
  }
}
```

### validateDesignSystem
Validates completeness and identifies issues:
```json
{"type": "validateDesignSystem"}
```

### getDesignSystemStatus
Quick status check:
```json
{"type": "getDesignSystemStatus"}
```

---

## Document Metadata

- **Created:** 2024-12-29
- **Updated:** 2026-01-02
- **Purpose:** Project bootstrap document for Claude Code
- **Project:** Bridge to Fig
- **Version:** 1.2.0
