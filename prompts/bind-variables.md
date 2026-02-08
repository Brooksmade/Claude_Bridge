# Bind Variables to Frame - Complete Workflow

**CRITICAL: Uses EXACT value matching only. No fuzzy matching.**

---

## Workflow Selection Guide

| Scenario | Recommended Approach |
|----------|---------------------|
| Creating a new design system | **One-Shot Binding** (automatic) |
| Adding variables to existing designs | **One-Shot Binding** (automatic) |
| Re-binding after variable changes | Manual Binding |
| Custom binding logic needed | Manual Binding |
| Binding specific nodes only | Manual Binding |

---

## ⭐ One-Shot Binding (Primary Workflow)

**This is the recommended approach for most use cases.** The `createDesignSystem` command handles binding automatically during creation.

### How It Works

1. **Extract tokens** with `extractDesignTokens`:
   ```bash
   POST /commands {"type": "extractDesignTokens", "payload": {"scope": "file", "includeChildren": true}}
   ```

   Returns `fontSizeNodes`, `colorNodes`, `strokeNodes`, and `shadows[].nodeIds` maps.

2. **Create system** with `createDesignSystem` passing `extractedTokens`:
   ```bash
   POST /commands {"type": "createDesignSystem", "payload": {
     "brandColors": {"primary": "#3b82f6"},
     "includeBoilerplate": true,
     "extractedTokens": {/* tokens from step 1 */}
   }}
   ```

3. **Automatic binding occurs**:
   - ✅ Color variables → nodes with matching hex values (via `colorNodes`)
   - ✅ Stroke variables → nodes with matching stroke colors (via `strokeNodes`)
   - ✅ Text styles → text nodes by font size (via `fontSizeNodes`)
   - ✅ Effect styles → nodes with matching shadows (via `shadows[].nodeIds`)

### One-Shot Result

```json
{
  "colorBindings": 156,
  "strokeBindings": 42,
  "typographyStyles": {
    "created": 15,
    "nodesStyled": 89
  },
  "effectStyles": {
    "created": 8,
    "nodesStyled": 23
  }
}
```

**This eliminates the need for a separate binding pass in most cases.**

---

## Manual Binding (Legacy/Advanced)

Use manual binding when you need fine-grained control, want to bind to specific nodes, or need to re-bind after variable changes.

### Complete Prompt (Copy This)

```
Extract design tokens from the selected Figma frame, create variables for each unique value, and bind them to all elements. Use EXACT value matching only.

Bridge server: http://localhost:4001

## PHASE 1: EXTRACT EVERYTHING

1. GET SELECTION:
POST /commands {"type": "query", "payload": {"queryType": "selection"}}

2. EXTRACT COLORS:
POST /commands {"type": "getNodeColors", "payload": {"nodeId": "FRAME_ID", "includeChildren": true, "includeStrokes": true}}

Collect all unique hex colors (deduplicate).

2b. EXTRACT FONTS:
POST /commands {"type": "getUsedFonts", "payload": {"nodeId": "FRAME_ID"}}

Collect font family names used in frame.

3. For each TEXT node found, query to get fontSize:
POST /commands {"type": "query", "target": "NODE_ID", "payload": {"queryType": "node"}}

Collect all unique fontSize values.

4. For each FRAME/RECTANGLE node, get cornerRadius values > 0.

Collect all unique cornerRadius values.

5. For each auto-layout FRAME, get spacing values:
   - itemSpacing (gap between children)
   - paddingLeft, paddingRight, paddingTop, paddingBottom

Collect all unique spacing/padding values.

---

## PHASE 2: CREATE VARIABLES

5. Check for existing collection or create one:
POST /commands {"type": "getVariables", "payload": {}}

If "Primitive [ Level 1 ]" doesn't exist:
POST /commands {"type": "createVariableCollection", "payload": {"name": "Primitive [ Level 1 ]", "modes": ["Value"]}}

6. CREATE COLOR VARIABLES for each unique hex:
POST /commands {"type": "createVariable", "payload": {"collectionId": "COL_ID", "name": "Color/NAME", "type": "COLOR", "values": {"Value": "#hexvalue"}}}

Naming: White, Black, Gray-50 through Gray-950 (by lightness), or Custom-1, Custom-2 for non-grays.

7. CREATE FONT SIZE VARIABLES for each unique fontSize:
POST /commands {"type": "createVariable", "payload": {"collectionId": "COL_ID", "name": "Typography/Size-XX", "type": "FLOAT", "values": {"Value": NUMBER}}}

8. CREATE CORNER RADIUS VARIABLES for each unique cornerRadius:
POST /commands {"type": "createVariable", "payload": {"collectionId": "COL_ID", "name": "Radius/Radius-XX", "type": "FLOAT", "values": {"Value": NUMBER}}}

9. CREATE SPACING VARIABLES for each unique spacing/padding value:
POST /commands {"type": "createVariable", "payload": {"collectionId": "COL_ID", "name": "Spacing/Space-XX", "type": "FLOAT", "values": {"Value": NUMBER}}}

Naming convention: Space-4, Space-8, Space-12, Space-16, Space-24, Space-32, etc.

10. CREATE OR UPDATE FONT FAMILY:
If Font-Sans exists, update it to extracted font:
POST /commands {"type": "editVariable", "payload": {"variableId": "FONT_SANS_VAR_ID", "values": {"Value": "EXTRACTED_FONT"}}}

If Font-Sans doesn't exist, create it:
POST /commands {"type": "createVariable", "payload": {"collectionId": "COL_ID", "name": "Typography/Font Family/Font-Sans", "type": "STRING", "values": {"Value": "EXTRACTED_FONT"}}}

---

## PHASE 3: BUILD EXACT MATCH MAPS

11. Query all variables to get fresh IDs:
POST /commands {"type": "getVariables", "payload": {"includeValues": true}}

Build lookup maps:
- COLOR_MAP: hex → variableId
- FONT_SIZE_MAP: number → variableId
- RADIUS_MAP: number → variableId
- SPACING_MAP: number → variableId (for padding and gap)

---

## PHASE 4: BIND EVERYTHING

11. BIND FILLS (exact hex match):
POST /commands {"type": "bindFillVariable", "payload": {"nodeId": "X", "variableId": "Y", "fillIndex": 0}}

12. BIND STROKES (exact hex match):
POST /commands {"type": "bindStrokeVariable", "payload": {"nodeId": "X", "variableId": "Y", "strokeIndex": 0}}

13. BIND FONT SIZE (exact number match):
POST /commands {"type": "bindVariable", "payload": {"nodeId": "X", "variableId": "Y", "field": "fontSize"}}

14. BIND FONT FAMILY (for TEXT nodes matching Font-Sans value):
First load fonts:
POST /commands {"type": "loadFont", "payload": {"family": "FONT_NAME", "style": "Regular"}}
POST /commands {"type": "loadFont", "payload": {"family": "FONT_NAME", "style": "Bold"}}

Then bind:
POST /commands {"type": "bindVariable", "payload": {"nodeId": "X", "variableId": "FONT_SANS_VAR_ID", "field": "fontFamily"}}

15. BIND CORNER RADIUS (exact number match):
POST /commands {"type": "bindVariable", "payload": {"nodeId": "X", "variableId": "Y", "field": "cornerRadius"}}

16. BIND PADDING (for auto-layout frames, exact number match):
POST /commands {"type": "bindVariable", "payload": {"nodeId": "X", "variableId": "Y", "field": "paddingLeft"}}
POST /commands {"type": "bindVariable", "payload": {"nodeId": "X", "variableId": "Y", "field": "paddingRight"}}
POST /commands {"type": "bindVariable", "payload": {"nodeId": "X", "variableId": "Y", "field": "paddingTop"}}
POST /commands {"type": "bindVariable", "payload": {"nodeId": "X", "variableId": "Y", "field": "paddingBottom"}}

17. BIND GAP/ITEM SPACING (for auto-layout frames, exact number match):
POST /commands {"type": "bindVariable", "payload": {"nodeId": "X", "variableId": "Y", "field": "itemSpacing"}}

---

## PHASE 5: REPORT

### Variables Created
| Type | Count | Values |
|------|-------|--------|
| Colors | X | #fff, #000, ... |
| Font Sizes | X | 14, 16, 24, ... |
| Corner Radius | X | 8, 12, ... |
| Spacing | X | 4, 8, 16, 24, ... |

### Bindings Applied
| Type | Count |
|------|-------|
| Fills | X |
| Strokes | X |
| Font Size | X |
| Font Family | X |
| Corner Radius | X |
| Padding | X |
| Gap (itemSpacing) | X |
| **Total** | **X** |

### Unbound (if any)
List any values that couldn't be bound and why.

---

## RULES

1. Extract exact values from the design - don't normalize or round
2. Create variables with those exact values
3. Bind using exact matches only
4. Report everything - created, bound, and unbound
5. Do all phases in ONE agent call
6. **BIND ALL TYPOGRAPHY STYLES** - Ensure ALL text styles (including Display) are bound to Font-Sans variable
7. **NO LEGACY WORK** - Update existing styles with wrong fonts using `editStyle`, then bind to variables
8. **VERIFY FONT BINDINGS** - After binding, verify all text styles use correct font and are bound to Font-Sans
```

---

## Simple User Prompt

"Extract tokens from selected frame, create variables, and bind everything"

The agent runs the complete workflow above in a single pass.

---

## Decision Tree: One-Shot vs Manual Binding

```
Is this a new design system?
├── YES → Use One-Shot Binding
│         (extractDesignTokens + createDesignSystem)
│
└── NO → Does the design system exist?
         ├── NO → Use One-Shot Binding
         │
         └── YES → What do you need to do?
                   │
                   ├── Bind all nodes automatically
                   │   → Re-run One-Shot Binding
                   │
                   ├── Bind specific nodes only
                   │   → Use Manual Binding (Phase 4)
                   │
                   ├── Update bindings after variable changes
                   │   → Use Manual Binding (Phase 3-4)
                   │
                   └── Custom binding logic
                       → Use Manual Binding with custom maps
```

---

## Related Documentation

| Document | Purpose |
|----------|---------|
| `prompts/figma-variables.md` | Full variable creation workflow |
| `prompts/figma-bridge.md` | Complete API reference |
| `prompts/performance-analysis.md` | Performance optimization for large files |
| `.claude/agents/figma-binding.md` | Binding agent definition |
