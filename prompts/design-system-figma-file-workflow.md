# /design-system-figma-file Workflow

Complete workflow diagram and troubleshooting guide for the design system creation skill.

## Workflow Diagram

```
+---------------------------------------------------------------------+
|                  /design-system-figma-file Workflow                  |
+---------------------------------------------------------------------+
|                                                                      |
|  Step 1: Ask for Organizing Principle                                |
|    |                                                                 |
|    +-- User selects: 4-Level, 3-Level, 2-Level, Material, Tailwind  |
|                              |                                       |
|                              v                                       |
|  Step 2: Extract Design Tokens                                       |
|    |                                                                 |
|    +-- Command: extractDesignTokens (scope: file)                   |
|    +-- Returns: colors, typography, effects, existingStyles         |
|    +-- CRITICAL: fontSizeNodes must be in extraction                |
|                              |                                       |
|                              v                                       |
|  Step 3: Confirm Brand Colors                                        |
|    |                                                                 |
|    +-- User selects: Primary, Secondary, Tertiary                   |
|                              |                                       |
|                              v                                       |
|  Step 4: Ask About Boilerplate                                       |
|    |                                                                 |
|    +-- User chooses: Yes fill gaps / No only extracted / Custom     |
|                              |                                       |
|                              v                                       |
|  Step 4.5: Pre-Flight Check                                          |
|    |                                                                 |
|    +-- Verify ALL required data collected before proceeding         |
|    +-- Check fontSizeNodes and shadows exist                        |
|                              |                                       |
|                              v                                       |
|  Step 5: Create Design System                                        |
|    |                                                                 |
|    +-- Command: createDesignSystem (with extractedTokens)           |
|    +-- Creates: Variables, Text Styles, Effect Styles               |
|    +-- AUTO-BINDS: colors (colorNodes), text styles, effect styles  |
|                              |                                       |
|                              v                                       |
|  Step 6: Verify Bindings (usually automatic now)                     |
|    |                                                                 |
|    +-- Check colorBindings in result (fillBindings + strokeBindings)|
|    +-- Check typographyStyles.nodesStyled in result                 |
|    +-- Check effectStyles.bindings in result                        |
|                              |                                       |
|                              v                                       |
|  Step 7: Report Results                                              |
|    |                                                                 |
|    +-- Query created styles and show summary                        |
|    +-- Include binding counts from Step 6                           |
|                                                                      |
+---------------------------------------------------------------------+
```

## Step-by-Step Command Reference

### Step 2: Extract Design Tokens

```bash
curl -s -X POST http://localhost:4001/commands -H "Content-Type: application/json" \
  -d '{"type": "extractDesignTokens", "payload": {"scope": "file", "includeChildren": true, "includeStyles": true}}'
```

**Critical fields to verify in response:**

| Field | Purpose |
|-------|---------|
| `tokens.typography.fontSizeNodes` | Maps font sizes to node IDs for text style binding |
| `tokens.effects.shadows` | Shadow effects with node IDs for effect style binding |
| `existingStyles.textStyles` | Existing text styles in the file |
| `existingStyles.effectStyles` | Existing effect styles in the file |

### Step 5: Create Design System

```bash
curl -s -X POST http://localhost:4001/commands -H "Content-Type: application/json" \
  -d '{
    "type": "createDesignSystem",
    "payload": {
      "brandColors": {
        "primary": "#ff6d38",
        "secondary": "#0066cc",
        "tertiary": "#00aa55"
      },
      "organizingPrinciple": "4-level",
      "includeBoilerplate": true,
      "extractedTokens": {
        "colors": { ... },
        "typography": {
          "fontFamily": ["Inter"],
          "fontSize": [12, 14, 16, 20, 24, 32],
          "fontSizeNodes": {
            "12": ["1:123", "1:124"],
            "14": ["1:125"],
            "16": ["1:126", "1:127", "1:128"]
          }
        },
        "effects": {
          "shadows": [
            {
              "type": "DROP_SHADOW",
              "cssValue": "0px 4px 8px rgba(0, 0, 0, 0.1)",
              "nodeIds": ["1:200", "1:201"]
            }
          ]
        }
      },
      "primaryFontFamily": "Inter",
      "createTypographyStyles": true,
      "createEffectStyles": true
    }
  }'
```

### Step 6: Bind Variables and Styles

**6a. Bind color variables:**
```bash
curl -s -X POST http://localhost:4001/commands -H "Content-Type: application/json" \
  -d '{"type": "bindMatchingColors", "payload": {"scope": "file", "includeStrokes": true}}'
```

**6b. Apply text styles:**
```bash
curl -s -X POST http://localhost:4001/commands -H "Content-Type: application/json" \
  -d '{"type": "applyMatchingTextStyles", "payload": {"scope": "file"}}'
```

**6c. Apply effect styles:**
```bash
curl -s -X POST http://localhost:4001/commands -H "Content-Type: application/json" \
  -d '{"type": "applyMatchingEffectStyles", "payload": {"scope": "file"}}'
```

## Troubleshooting

### Text styles not binding to nodes

**Symptoms:**
- `typographyStyles.nodesStyled: 0` in createDesignSystem result
- Text nodes don't show text style indicator in Figma Design panel

**Causes:**
1. `fontSizeNodes` missing from `extractedTokens.typography`
2. `fontSizeNodes` stripped during data passing (TypeScript type mismatch)
3. Font sizes in text styles don't match node font sizes
4. **CRITICAL**: Using sync `textStyleId` instead of async method

**Solutions:**
1. Verify `tokens.typography.fontSizeNodes` exists in extractDesignTokens response
2. Run `applyMatchingTextStyles` command explicitly in Step 6b
3. Check that text style names match font sizes (e.g., "Body/Medium" for 16px)
4. **Code must use `await textNode.setTextStyleIdAsync(style.id)`** - direct property assignment fails with "documentAccess: dynamic-page" error

### Color variables not binding to nodes

**Symptoms:**
- Nodes show hex colors instead of variable names in Design panel
- `colorBindings: 0` in results

**Causes:**
1. Step 6a not executed
2. Color hex values don't match variable colors exactly
3. Scope doesn't include the target nodes

**Solutions:**
1. Run `bindMatchingColors` command explicitly
2. Check variable hex values vs node fill/stroke hex values
3. Use `scope: "file"` to cover all pages

### Effect styles not applying

**Symptoms:**
- Nodes with shadows don't show effect style indicator
- `effectBindings: 0` in results

**Causes:**
1. `shadows[].nodeIds` missing from extraction
2. Step 6c not executed
3. Shadow CSS values don't match exactly

**Solutions:**
1. Verify `tokens.effects.shadows` includes `nodeIds` arrays
2. Run `applyMatchingEffectStyles` command explicitly
3. Check shadow properties match (offset, blur, spread, color)

### Extraction timeout on large files

**Symptoms:**
- Extraction returns partial data
- `effects.shadows` is empty despite file having shadows

**Solutions:**
1. Re-run with `scope: "page"` on specific pages
2. Select specific frames and use `scope: "selection"`
3. Check Figma plugin console for errors

## Data Flow

```
extractDesignTokens (Step 2)
    |
    +-- tokens.typography.fontSizeNodes  --+
    |                                      |
    +-- tokens.effects.shadows      -------+
                                           |
                                           v
                                createDesignSystem (Step 5)
                                           |
                                           +-- Creates text styles with fontSizeNodes binding
                                           +-- Creates effect styles with shadow nodeIds binding
                                           |
                                           v
                                    Binding Commands (Step 6)
                                           |
                                           +-- bindMatchingColors
                                           +-- applyMatchingTextStyles (if needed)
                                           +-- applyMatchingEffectStyles (if needed)
```

## Related Files

| File | Purpose |
|------|---------|
| `.claude/commands/design-system-figma-file.md` | Skill definition |
| `figma-plugin/src/commands/extract-tokens.ts` | Token extraction implementation |
| `figma-plugin/src/commands/design-system.ts` | Design system creation implementation |
| `figma-plugin/src/commands/variables.ts` | Variable binding commands |
| `prompts/figma-bridge.md` | Complete API reference |
