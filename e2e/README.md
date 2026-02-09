# E2E Tests for Figma Plugin

End-to-end tests that verify the full workflow: extraction → design system creation → variable binding.

## Prerequisites

1. **Bridge server running**:
   ```bash
   pnpm dev
   ```

2. **Figma plugin loaded and connected**:
   - Open Figma desktop app
   - Plugins → Development → Claude Figma Bridge
   - Plugin should show "Connected" status

3. **Figma file with design elements**:
   - Open a Figma file with frames, text nodes, shapes
   - **Select a frame** before running tests (for the main test suite)

4. **For website extraction tests**:
   - Google Chrome installed (for Puppeteer)
   - Internet connection

## Running Tests

```bash
# Main e2e test suite (extraction → design system → binding)
pnpm test:e2e

# Organizing principles tests (4-level, 3-level, 2-level, material, tailwind)
pnpm test:e2e:principles

# Website CSS extraction tests
pnpm test:e2e:website

# SSRF protection tests (does NOT require Figma plugin for blocked URLs)
npx ts-node e2e/test-ssrf-protection.ts

# Workflow command smoke tests (requires bridge + plugin)
npx ts-node e2e/test-workflow-commands.ts

# Run all e2e tests
pnpm test:e2e:all
```

## Test Suites

### 1. Main Test Suite (`test-runner.ts`)

Tests the core workflow from frame selection to variable binding.

**Phases:**
- Environment checks (bridge/plugin connection)
- Selection & token extraction from Figma frames
- Design system creation with extracted tokens
- Variable binding (fills, font sizes, corner radius, spacing)

### 2. Organizing Principles Tests (`test-organizing-principles.ts`)

Tests the ability to create design systems with different structural approaches.

**Tests:**
- `getOrganizingPrinciples` command
- Create design system with each principle:
  - **four-level** (default): Primitive → Semantic → Tokens → Theme
  - **three-level**: Primitives → Tokens → Theme
  - **two-level**: Primitives → Tokens
  - **material-design**: Reference → System → Component (M3 style)
  - **tailwind**: Colors → Semantic (utility-first)
- Validate each design system structure
- Default principle behavior (four-level)
- Invalid principle error handling

### 3. Website Extraction Tests (`test-website-extraction.ts`)

Tests the Puppeteer-based website CSS extraction functionality.

**Tests:**
- Extract CSS from simple website (example.com)
- Validate extracted token structure (colors, typography, spacing, etc.)
- Validate color hex format
- Create design system from extracted tokens
- Error handling (invalid URLs, non-existent domains)
- Complex site extraction (tailwindcss.com)

### 4. SSRF Protection Tests (`test-ssrf-protection.ts`)

Tests that the bridge server correctly blocks dangerous URLs before passing them to Puppeteer.

**Tests (9):**
- Bridge health check
- Block loopback addresses (127.0.0.1)
- Block localhost
- Block private IP ranges (10.x.x.x, 192.168.x.x)
- Block link-local/metadata addresses (169.254.169.254)
- Block non-HTTP protocols (file://, ftp://)
- Allow legitimate https URLs

**Note:** Does NOT require the Figma plugin for blocked URL tests — only needs the bridge server running.

### 5. Workflow Commands Smoke Tests (`test-workflow-commands.ts`)

Lightweight smoke tests verifying core API calls used by all workflow commands.

**Tests (11):**
- Bridge health check + plugin ping
- `getVariables` — returns valid structure with collections array
- `getNodeColors` — returns color data from selection
- `getUsedFonts` — returns font list
- `checkMissingFonts` — returns result
- `getComponents` — returns component array
- `getDesignSystemStatus` — returns status object
- `measureText` — returns width and height for text at given font size
- `query(selection)` — returns valid selection response
- `analyzeColors` — returns color analysis

**Note:** Requires bridge server + Figma plugin connected.

## Test Phases (Main Suite)

### Phase 1: Environment Checks
- Verifies bridge server is running
- Verifies plugin is connected and responding

### Phase 2: Selection & Token Extraction
- Gets current selection from Figma
- Extracts all design tokens (colors, typography, numbers, effects)
- Validates extracted token structure

### Phase 3: Design System Creation
- Creates 4-level design system with extracted tokens
- Verifies boilerplate conditional logic (skips existing values)
- Validates design system structure

### Phase 4: Variable Binding
- Loads extracted fonts
- Binds fill variables (colors)
- Binds font size variables
- Binds corner radius variables
- Binds spacing variables (itemSpacing, padding)

## Expected Output

```
========================================
  FIGMA PLUGIN E2E TEST SUITE
========================================

PHASE 1: Environment Checks

✅ Bridge server connection (15ms)
✅ Plugin connection (ping) (52ms)

PHASE 2: Selection & Token Extraction

✅ Get current selection (48ms)
   Selected frame: 123:456
✅ Extract design tokens (234ms)
   Extracted tokens summary:
     Colors: 12
     Font Families: 2
     Font Sizes: 8
     ...
✅ Validate extracted tokens structure (2ms)

PHASE 3: Design System Creation

✅ Create design system with extracted tokens (1523ms)
   Using brand color: #171717
   Total variables: 185
   Collections created:
     Primitive [ Level 1 ]: 140 vars (created: true)
     ...
   Boilerplate skipped: 14 (values already in frame)
✅ Get all variables (89ms)
✅ Validate design system (45ms)

PHASE 4: Variable Binding

✅ Load extracted fonts (234ms)
✅ Bind fill variables (colors) (567ms)
   Bound 24 fill variables
✅ Bind font size variables (189ms)
   Bound 15 font size variables
✅ Bind corner radius variables (78ms)
   Bound 8 corner radius variables
✅ Bind spacing variables (156ms)
   Bound 12 spacing variables

========================================
  TEST SUMMARY
========================================

Total: 12 tests
Passed: 12
Failed: 0
Duration: 3245ms
```

## Troubleshooting

### "Bridge server should be healthy"
- Ensure `pnpm dev` is running in another terminal
- Check http://localhost:4001/health

### "Plugin should respond to ping"
- Open Figma plugin panel
- Check for connection status
- Try reloading the plugin

### "Should have a selected frame"
- Select a frame in Figma before running tests
- Tests extract from current selection

### "Extraction should succeed"
- Make sure selected frame has children (text, shapes)
- Empty frames will have empty token results

## Adding New Tests

1. Add new test method to `E2ETestRunner` class
2. Use `this.assert()`, `this.assertExists()`, `this.assertGreaterThan()`
3. Add to `run()` method with `await this.runTest('name', () => this.testMethod())`
