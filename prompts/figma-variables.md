# Figma Variables - Fast Workflow

Single-pass: Extract All Tokens → Detect Brand → Create (with conditional boilerplate) → Bind → Report

Bridge server: http://localhost:4001

---

## Quick Reference

### 1. Extract ALL Design Tokens from File
```bash
# RECOMMENDED: Extract from ALL pages and frames in the file
POST /commands {"type": "extractDesignTokens", "payload": {
  "scope": "file",
  "includeChildren": true
}}

# Alternative scopes:
# - "page" - Extract from all frames on current page only
# - "selection" - Extract from selected nodes only (default, requires selection)
```

Returns:
- `colors` - All unique colors (categorized: grayScale, brandScale, system)
- `typography` - fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, **fontSizeNodes**
- `numbers` - spacing, borderWidth, borderRadius, opacity
- `effects` - shadows, transitions (duration, easing)
- `existingStyles` - textStyles, effectStyles, gridStyles (if `includeStyles: true`)
- `summary.brandColorAnalysis` - auto-detection result with candidates

**NEW: `fontSizeNodes`** - A map of font sizes to node IDs for one-shot binding:
```json
{
  "fontSizeNodes": {
    "12": ["node-id-1", "node-id-2"],
    "16": ["node-id-3", "node-id-4", "node-id-5"],
    "24": ["node-id-6"]
  }
}
```
When passed to `createDesignSystem`, text styles are automatically applied to their source nodes.

Add `includeStyles: true` to extract existing text/effect/grid styles from file.

### 2. Detect Brand Color (Frequency-Based)

The extraction returns `summary.brandColorAnalysis`:
```json
{
  "autoSelected": "#3b82f6",      // Auto-selected if clear winner, null if prompt needed
  "needsUserPrompt": false,       // True if multiple prominent colors
  "reason": "Dominant color (45.2% usage, >2x next)",
  "candidates": [                 // Top 5 chromatic colors by frequency
    {"hex": "#3b82f6", "count": 234, "percentage": 45.2, "isRecommended": true},
    {"hex": "#ef4444", "count": 89, "percentage": 17.1, "isRecommended": false}
  ]
}
```

**Detection Logic:**
- **No chromatic colors** → uses darkest gray
- **Single chromatic color** → auto-selects it
- **One color >2x more frequent than next** → auto-selects dominant
- **Multiple colors similar frequency** → `needsUserPrompt: true`, show candidates to user

**If `needsUserPrompt` is true**, present candidates to user for selection before proceeding.

### 3. Create Design System (with extracted tokens)
```bash
# Pass extractedTokens - boilerplate only fills gaps!
# Typography styles are created automatically by default
POST /commands {"type": "createDesignSystem", "payload": {
  "brandColors": {"primary": "#DETECTED"},
  "includeBoilerplate": true,
  "extractedTokens": {extracted tokens from step 1},
  "primaryFontFamily": "EXTRACTED_FONT"  // Optional: uses extracted font or "Inter"
}}
```

Creates:
- Primitive [ Level 1 ] - User's values + boilerplate gaps
- Semantic [ Level 2 ] - Light/Dark modes (brand, feedback)
- Tokens [ Level 3 ] - Light Mode/Dark Mode (surface, text, border)
- Theme - Light/Dark modes (background, foreground, interactive)
- **Typography Styles** - 20 text styles with variable bindings (Display, Headers, Body, Label, Button, Caption)

**Boilerplate Logic:**
- If frame uses font size 16px → skips creating Size-MD (16px)
- If frame uses radius 8px → skips creating Radius-LG (8px)
- Only creates boilerplate for values NOT found in frame

**Typography Styles (auto-created):**
- Display 1-2, Headers H1-H5, Body Large/Regular/Small
- Label Large/Regular/Small, Caption Regular/Small

**Key Features:**
- Uses **extracted font sizes** from file (not hardcoded boilerplate)
- Maps extracted sizes to design system structure (Display → Headers → Body → Label → Caption)
- Falls back to boilerplate only for gaps (sizes not found in extraction)
- All styles bound to variables: `fontFamily`, `fontSize`, AND `fontWeight`
- **One-shot binding**: Text styles are automatically applied to source text nodes during creation (using `fontSizeNodes` from extraction)

**Result includes:**
```json
{
  "typographyStyles": {
    "created": 15,
    "fromExtracted": 8,
    "fromBoilerplate": 7,
    "nodesStyled": 42,  // Number of text nodes that received styles
    "styles": [...]
  }
}
```

To disable: `"createTypographyStyles": false`

**Effect Styles (auto-created):**
- Shadow/xxsmall through Shadow/xxlarge (elevation shadows)
- Shadow/button, Shadow/input, Shadow/block (component shadows)

**Key Features:**
- Uses **extracted shadow values** from file
- Maps to design system structure based on blur size
- Falls back to boilerplate only for gaps
- Auto-binds effect styles to original nodes

To disable: `"createEffectStyles": false`

**Grid Styles (conditional):**
- Grid/4-Column, Grid/6-Column, Grid/8-Column, Grid/12-Column, Grid/16-Column
- Grid/12-Column-Centered (fixed-width container)
- Grid/Baseline-4, Grid/Baseline-8 (vertical rhythm)
- Grid/Square-8, Grid/Square-16 (icon/spacing alignment)
- Grid/12-Column+Baseline, Grid/4-Column+Baseline (combined)

**Key Features:**
- Grid styles are **NOT created by default**
- Auto-created ONLY if:
  - File already has existing grid styles, OR
  - User explicitly sets `"createGridStyles": true`
- Uses existing grid styles from file first
- Fills gaps with boilerplate only for missing patterns
- Message in result if no grid styles: "Set createGridStyles: true to add boilerplate grid styles"

To enable: `"createGridStyles": true`

### 4. Update Font-Sans + Add Custom Variables
```bash
# CRITICAL: Update Font-Sans to extracted font family
POST /commands {"type": "editVariable", "payload": {
  "variableId": "FONT_SANS_VAR_ID",
  "values": {"Value": "EXTRACTED_FONT_FAMILY"}
}}

# Add custom colors not in boilerplate
POST /commands {"type": "createVariable", "payload": {
  "collectionId": "ID",
  "name": "Color/Custom/Name",
  "type": "COLOR",
  "values": {"Value": "#exact_hex"}
}}

# Add custom font sizes not in boilerplate
POST /commands {"type": "createVariable", "payload": {
  "collectionId": "ID",
  "name": "Typography/Font Size/Size-Custom-XX",
  "type": "FLOAT",
  "values": {"Value": XX}
}}
```

### 5. Bind Variables to Text Styles (STYLES, not nodes)

**Note:** Typography styles are now created automatically in Step 3 with variable bindings.
This step is only needed for binding to EXISTING text styles in the file.

```bash
# Get existing text styles from file
POST /commands {"type": "getStyles", "payload": {"styleType": "TEXT"}}

# For each text style using the extracted font, bind fontFamily variable
POST /commands {"type": "bindTextStyleVariable", "payload": {
  "styleId": "S:STYLE_ID",
  "field": "fontFamily",
  "variableId": "FONT_SANS_VAR_ID"
}}

# Optionally bind fontSize to styles too
POST /commands {"type": "bindTextStyleVariable", "payload": {
  "styleId": "S:STYLE_ID",
  "field": "fontSize",
  "variableId": "FONT_SIZE_VAR_ID"
}}
```

### 6. Bind Variables to Nodes
```bash
# Load fonts first
POST /commands {"type": "loadFont", "payload": {"family": "FONT_NAME", "style": "Regular"}}

# Fills
POST /commands {"type": "bindFillVariable", "payload": {"nodeId": "X", "variableId": "Y", "fillIndex": 0}}

# Strokes
POST /commands {"type": "bindStrokeVariable", "payload": {"nodeId": "X", "variableId": "Y", "strokeIndex": 0}}

# Typography (fontSize + fontFamily on nodes)
POST /commands {"type": "bindVariable", "payload": {"nodeId": "X", "variableId": "Y", "field": "fontSize"}}
POST /commands {"type": "bindVariable", "payload": {"nodeId": "X", "variableId": "FONT_SANS_ID", "field": "fontFamily"}}

# Corner Radius
POST /commands {"type": "bindVariable", "payload": {"nodeId": "X", "variableId": "Y", "field": "cornerRadius"}}
```

### 7. Verify
```bash
POST /commands {"type": "getVariables", "payload": {}}
```

Confirm: 4 collections, variables created, boilerplateSkipped count shows personalization worked.

---

## Mandatory 4-Level Structure

| Level | Collection | Modes |
|-------|------------|-------|
| 1 | Primitive [ Level 1 ] | Value |
| 2 | Semantic [ Level 2 ] | Light, Dark |
| 3 | Tokens [ Level 3 ] | Light Mode, Dark Mode |
| 4 | Theme | Light, Dark |

---

## Critical Rules

1. **EXTRACT FROM ENTIRE FILE** - Use `scope: "file"` to extract from ALL pages and frames
2. **EXTRACT FIRST** - Always run extractDesignTokens before createDesignSystem
3. **FREQUENCY-BASED BRAND DETECTION** - Use `brandColorAnalysis` from extraction, NOT grays
4. **PROMPT IF NEEDED** - If `needsUserPrompt: true`, show candidates to user for selection
5. **PASS EXTRACTED TOKENS** - Send extractedTokens to createDesignSystem
6. **ALL 4 COLLECTIONS** - createDesignSystem handles this
7. **EXACT VALUES** - Never normalize extracted colors
8. **BIND IN SAME PASS** - Don't stop after creation
9. **VERIFY BEFORE REPORTING** - Confirm 4 collections
10. **BIND ALL TYPOGRAPHY STYLES** - Ensure ALL text styles (including Display) are bound to Font-Sans variable
11. **NO LEGACY WORK** - Update any existing styles with wrong fonts to use the correct font and bind to variables
12. **VERIFY FONT BINDINGS** - After creating typography styles, verify all 20 styles use correct font and are bound

---

## Token Categories (199 total variables)

### Color (50)
- Gray Scale: 11 (Gray-50 to Gray-950)
- Brand Scale: 11
- Secondary Scale: 11
- Tertiary Scale: 11
- System: 6 (White, Black, Success, Warning, Error, Info)

### Typography (46)
- Font Family: 3 (Sans, Serif, Mono)
- Font Size: 21 (10px to 72px)
- Font Weight: 9 (100 to 900)
- Line Height: 7 (1.0 to 2.0)
- Letter Spacing: 6 (-5% to +10%)

### Numbers (82)
- Spacing: 48 (0 to 384px)
- Border Width: 6 (0 to 8px)
- Border Radius: 13 (0 to 9999px)
- Opacity: 15 (0 to 100%)

### Effects (21)
- Shadow: 8 (None to 2XL)
- Transition Duration: 8 (0 to 1000ms)
- Transition Easing: 5 (Linear, In, Out, InOut, Bounce)

---

## Boilerplate Font Sizes (for reference)

10, 11, 12, 14, 16, 18, 20, 24, 30, 36, 48, 60, 72

If extracted size not in list → create custom variable.

---

## Boilerplate Corner Radii (for reference)

0, 2, 4, 6, 8, 12, 16, 24, 32, 9999

If extracted radius not in list → create custom variable.

---

## Related Files

- `prompts/figma-bridge.md` - Full API reference
- `prompts/bind-variables.md` - Binding workflow details
- `.claude/agents/figma-variables.md` - Agent definition
- `.claude/agents/figma-binding.md` - Binding agent (for re-binding only)
