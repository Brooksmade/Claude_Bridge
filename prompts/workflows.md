# Bridge to Fig: Workflow Pipelines

Why this tool exists and what makes it different: every major workflow is an **automated pipeline** that chains commands together, passing data from step to step. What takes hours by hand takes minutes through the bridge.

The notation `→` means "output feeds into next step."

---

## 1. Design System from Figma File

**Pipeline:** Extract → Detect → Create → Bind → Validate

```
extractDesignTokens(scope: "file")
  → colors (all, grayscale, brand, secondary, tertiary), typography, spacing, radius, shadows
  → fontSizeNodes (font size → node IDs), colorNodes (hex → node IDs), strokeNodes, shadowNodeIds

    ↓ token data + node maps

Detect Brand Color (frequency-based, skip neutrals)
  → Filter grays (R ≈ G ≈ B within 15)
  → Sort by saturation × usage count
  → Top 3 = Primary, Secondary, Tertiary

    ↓ brandColors + extractedTokens

createDesignSystem(brandColors, extractedTokens, organizingPrinciple)
  → 4 collections: Primitive → Semantic → Tokens → Theme
  → 130+ variables created
  → colorBindings applied (hex matched to node IDs from extraction)
  → typographyStyles created and applied (font size matched to node IDs)
  → effectStyles created and applied (shadows matched to node IDs)

    ↓ variable IDs + unbound items

editVariable() for extracted fonts not in boilerplate
createVariable() for extracted values not in boilerplate

    ↓ complete system

validateDesignSystem()
  → Check 4-level structure, mode consistency, naming, alias chains
```

**What flows between steps:** `extractDesignTokens` returns `fontSizeNodes`, `colorNodes`, `strokeNodes`, and `shadowNodeIds` — maps from values to the node IDs that use them. When `createDesignSystem` receives these as `extractedTokens`, it binds variables to those exact nodes during creation. No second pass needed.

**Without this pipeline:** Create 4 collections by hand. Add 130 variables one at a time. Click each of 726 nodes individually to bind variables. Estimate: 8-12 hours. With the pipeline: 5 minutes.

---

## 2. Design System from Website

**Pipeline:** Extract CSS → Classify Colors → Generate Scales → Create/Update System

```
extractWebsiteCSS(url)
  → Puppeteer launches headless Chrome
  → Navigates, waits for network idle
  → Scans ALL DOM elements (1000+)
  → Returns: colors (with usage count), fontFamilies, fontSizes, fontWeights,
    lineHeights, letterSpacing, spacing, borderRadius, shadows, opacity, zIndex

    ↓ raw token data

Color Classification (automatic, no user input needed)
  → Filter neutrals (R ≈ G ≈ B within 15)
  → Sort remaining by saturation × frequency
  → Primary = highest, Secondary = 2nd, Tertiary = 3rd

    ↓ classified colors

Generate Color Scales (50-950, 11 steps per color)
  → Adjust lightness: 50 (+45%) through 950 (-45%)
  → 3 colors × 11 steps = 33 scale values

    ↓ full color scales

createDesignSystem() or editVariable() × 33 for existing system
  → Brand scale: 11 values updated
  → Secondary scale: 11 values updated
  → Tertiary scale: 11 values updated

    ↓ updated system

createVariable() for extracted values not in boilerplate
  → Custom font sizes, spacing, radius values preserved exactly
```

**What flows between steps:** The headless browser returns *computed* CSS values — not CSS variable names, not stylesheet declarations, but the actual rendered values on every element. This means the extraction works on any website regardless of how it's built (CSS-in-JS, Tailwind, vanilla CSS, frameworks).

**Without this pipeline:** Open DevTools, manually sample colors from 50+ elements, guess which is primary vs accent, calculate 11-step scales by hand, create variables one at a time. Estimate: 2-3 days. With the pipeline: 15 minutes.

---

## 3. Variable Binding

**Pipeline:** Load Variables → Build Maps → Extract Node Properties → Match → Bind → Report

```
getVariables(includeValues: true)
  → Build exact-match maps:
    COLOR_MAP:     "#ffffff" → VariableID
    FONT_SIZE_MAP: 16 → VariableID
    RADIUS_MAP:    8 → VariableID
    FONT_MAP:      "Inter" → VariableID

    ↓ lookup maps

getNodeColors(nodeId, includeChildren, includeStrokes)
  → Every hex color on every descendant node, tagged fill or stroke
query() for fontSize, cornerRadius, fontFamily per node

    ↓ node values

Exact Match (no fuzzy matching, ever)
  → For each value: look up in map → found = toBind, not found = unbound

    ↓ bind list + unbound list

bindFillVariable()    × N fills
bindStrokeVariable()  × N strokes
bindVariable(fontSize) × N text nodes
bindVariable(fontFamily) × N text nodes
bindVariable(cornerRadius) × N rectangles/frames

    ↓ binding report

Report unbound items
  → Colors not in any variable
  → Font sizes not in any variable
  → User decides: create new variables or update design
```

**Why exact-match only:** Fuzzy matching creates drift — a color that's "close enough" today becomes a maintenance problem tomorrow. The bridge reports unbound items so the designer can make an intentional choice: add a variable for that value, or change the design to use an existing token.

**Without this pipeline:** Select each node, open the variable picker, find the matching variable, bind it. For a typical frame: 245 fills + 89 strokes + 175 font sizes + 42 radii = 551 manual clicks. With the pipeline: one command sequence, 5 minutes.

---

## 4. Component Library Creation

**Pipeline:** Discover → Architect → Create → Configure Layout → Enforce Naming → QA → Handoff

```
getComponents() + getVariables()
  → Existing components, available tokens

    ↓ inventory

Architecture planning
  → Define components (atoms, molecules, organisms)
  → Define variant matrix: Size × Type × State
  → Map token bindings per property

    ↓ component specs

createComponent() or createComponentSet()
  → Frame with auto layout, fills, text children
  → Variant properties (size=small|medium|large, type=primary|secondary)
  → 8 components × 12 variants each = 96 total

    ↓ component IDs

setAutoLayout() on every variant
  → Direction, padding, spacing, sizing mode, alignment
setConstraints() for responsive behavior

    ↓ configured components

Naming enforcement
  → query(deep) for all layers
  → renameNode() to enforce "ComponentType/property=value" pattern

    ↓ clean naming

Component QA
  → Check variant completeness (all combinations exist)
  → Check auto layout consistency
  → Check token binding coverage
  → Check accessibility (touch targets, contrast)
  → Score: 0-100

    ↓ QA report

Engineering handoff (see workflow 7)
```

**What flows between steps:** Each phase validates and enriches the previous phase's output. QA catches issues that creation missed. Naming enforcement ensures the component API is consistent before handoff generates specs.

**Without this pipeline:** Build each variant by hand, duplicate and modify, manually check consistency across 96 variants, name every layer. Estimate: 2-3 weeks for a production component library. With the pipeline: 2-3 hours.

---

## 5. FigJam Workflow Diagrams

**Pipeline:** Plan Elements → Measure Text → Calculate Layout → Create Shapes → Connect

```
User describes workflow (e.g., "design system creation process")

    ↓ workflow description

Pre-plan ALL elements
  → Assign semantic color roles:
    PRIMARY (#2c3e50): section headers
    ACTION (#e67e22): CTAs, requirements
    OUTPUT (#27ae60): results, deliverables
    INPUT (#3498db): data sources
    NEUTRAL (#ffffff): content boxes

    ↓ element list with roles

measureText() for each element's text content
  → Returns actual rendered width/height
  → Box size = measured_width + 40px, measured_height + 24px

    ↓ exact dimensions

Calculate positions
  → Horizontal gap: 80px, vertical gap: 100px
  → Section-to-section: 250px
  → Row stacking with alignment

    ↓ position map

createSection() for each workflow phase
createShapeWithText() for each element
  → Inside sections: headers, hub elements
  → Outside sections: branching spokes, outputs

    ↓ shape IDs

createConnector() between shapes
  → startMagnet/endMagnet for precise attachment (TOP, BOTTOM, LEFT, RIGHT)
  → connectorEndStrokeCap: "ARROW_LINES" for direction
  → connectorLineType: "ELBOWED" for clean routing
```

**Why measure first:** FigJam shapes don't auto-size to text. Without measuring, boxes are either too big (wasted space) or too small (text overflows). The pipeline measures every text string, adds padding, and calculates exact positions so the diagram looks professional on first creation.

**Without this pipeline:** Manually create each sticky/shape in FigJam, resize to fit text, drag into position, add connectors one by one, recolor by role. Estimate: 1-2 hours for a medium diagram. With the pipeline: 15 minutes.

---

## 6. Engineering Handoff

**Pipeline:** Analyze → Extract Specs → Generate Code → Export Assets → Document

```
query(selection) + getAutoLayout() + getVariables(includeValues)
  → Node properties, layout config, bound variables

    ↓ raw specs

Extract specifications per component
  → Dimensions, spacing (padding, margin, gap)
  → Typography (font, size, weight, line-height, letter-spacing)
  → Colors (fills, strokes) with variable names
  → Corner radius, effects (shadows, blurs)
  → Constraints and responsive behavior

    ↓ structured specs

Generate code
  → CSS with custom properties (--color-primary, --space-m)
  → Tailwind utility classes
  → React/Vue component stubs with props interface

    ↓ code snippets

exportNode(format: SVG, PNG) at 1x, 2x, 3x
batchExport() for all components

    ↓ asset files

Generate documentation
  → Spec sheets (dimensions, spacing, typography, colors per component)
  → Token mapping (design variable → CSS variable)
  → Platform guidelines (Web, iOS, Android)
```

**What flows between steps:** Variable names from `getVariables` become CSS custom property names in the generated code. The spec sheet maps every visual property back to its token, so developers know exactly which variable to use.

**Without this pipeline:** Inspect each component in Figma, manually note every property, write CSS by hand, export assets at multiple scales, create spec documentation. Estimate: 1-2 days per component. With the pipeline: 15 minutes per component.

---

## 7. Typography System

**Pipeline:** Audit Fonts → Load → Create Styles → Bind Variables → Apply Range Styles

```
getUsedFonts() + checkMissingFonts()
  → All fonts in document, missing fonts flagged

    ↓ font inventory

loadFont(family, style) for each font/style combination
  → Must load before ANY text modification

    ↓ fonts ready

createTextStyle() for each type scale level
  → Display, Heading, Body, Label, Caption (11+ styles)
createTextStyleWithVariables() to bind fontSize, fontFamily, lineHeight

    ↓ style IDs

applyMatchingTextStyles()
  → Automatically apply styles to nodes matching font size

    ↓ styled nodes

Range operations for mixed typography:
  setRangeFont(nodeId, start, end, fontName)
  setRangeColor(nodeId, start, end, color)
  setRangeTextDecoration(nodeId, start, end, "UNDERLINE")
  setRangeLetterSpacing(nodeId, start, end, value)
  setTextHyperlink(nodeId, start, end, url)
```

**Why font loading matters:** Figma requires fonts to be loaded before modification. The pipeline loads all required font/style combinations upfront, then operates freely. Without this, every text operation risks a "font not loaded" error.

**Without this pipeline:** Create each text style in Figma's UI, manually apply to each text node, set mixed styles character by character. Range operations (bold one word, color another) are impossible by hand at scale.

---

## 8. Accessibility Audit

**Pipeline:** Extract Colors → Check Contrast → Check Touch Targets → Check Text → Report

```
getNodeColors(includeChildren) + analyzeColors()
  → All foreground/background color pairs

    ↓ color pairs

Contrast check (WCAG 2.1)
  → Luminance calculation per pair
  → Normal text: 4.5:1 (AA), 7:1 (AAA)
  → Large text: 3:1 (AA), 4.5:1 (AAA)
  → UI components: 3:1 (AA)

    ↓ contrast results

Touch target check
  → query(deep) for all interactive element dimensions
  → Minimum: 44×44px (iOS/Web), 48×48dp (Android)

    ↓ target results

Text size check
  → fontSize < 12px = error
  → Body text < 16px = warning
  → Interactive labels < 14px = warning

    ↓ all results

Accessibility report
  → Score: 0-100
  → Level: AA or AAA
  → Failed items with specific fixes
  → Recommendations
```

**Without this pipeline:** Check contrast ratios one pair at a time using a contrast checker tool, manually measure button sizes, scan every text node for minimum size. Estimate: 2-4 hours. With the pipeline: 10 minutes.

---

## 9. Design-to-Dev Full Pipeline (Master Orchestrator)

**Pipeline:** Audit → Design System → Components → Accessibility → Handoff

This chains workflows 1, 4, 8, and 6 into a single end-to-end pipeline:

```
PHASE 1: consistency-checker
  → Audit existing design for issues
  → Scope the work needed

    ↓ audit results

PHASE 2: design-system-orchestrator (Workflow 1)
  → Extract → Detect → Create → Bind → Validate
  → Output: 4 collections, 130 variables, 726 bindings

    ↓ design system

PHASE 3: component-library-orchestrator (Workflow 4)
  → Create → Layout → Name → QA
  → Output: 8 components, 96 variants, 90/100 quality score

    ↓ component library

PHASE 4: accessibility-auditor (Workflow 8)
  → Contrast → Touch → Text → Report
  → Output: A11y score, failed items, fixes

    ↓ audit report

PHASE 5: engineering-handoff (Workflow 6)
  → Specs → Code → Assets → Documentation
  → Output: Spec sheets, CSS/Tailwind, exported assets, token mapping
```

**Without this pipeline:** This is 3-4 weeks of manual work compressed into 1-2 hours. Each phase validates the previous phase's output, catching issues that compound if left to the end.

---

## Why Bridge to Fig Over Alternatives

### vs. Manual Figma Work
Every workflow above replaces hours of clicking through Figma's UI. The bridge doesn't just automate individual actions — it chains them into pipelines where **each step's output feeds the next step's input**.

### vs. Figma REST API
The REST API is read-only for most operations. It can read variables and styles but cannot create them, bind them to nodes, or modify design properties. The bridge operates through the Plugin API, which has full read/write access.

### vs. MCP-Based Figma Tools (e.g., figma-console-mcp)
MCP tools expose individual operations as tools. They can create a variable or resize a node. But they don't have:

| Capability | Bridge to Fig | MCP Tools |
|---|---|---|
| **One-command design system** | `createDesignSystem` creates 4-level hierarchy with 130+ variables | Must call individual CRUD operations 130+ times |
| **Automatic binding** | `extractDesignTokens` tracks node→value maps, `createDesignSystem` binds during creation | No node tracking, no automatic binding |
| **Website extraction** | Headless browser extracts computed CSS from live websites | Not available |
| **Color classification** | Automatic primary/secondary/tertiary detection by saturation × frequency | Manual classification |
| **Color scale generation** | 50-950 scales generated from any base color | Manual scale creation |
| **Conditional boilerplate** | Only fills gaps — extracted values take priority over defaults | No boilerplate system |
| **Organizing principles** | 5 configurable hierarchy patterns (4-level, 3-level, Material, Tailwind) | Single flat structure |
| **Text range operations** | 27 commands for character-level formatting | Single `set_text` (full replacement) |
| **FigJam diagrams** | Sections, shapes, connectors with text measurement and position calculation | Not available |
| **30 agent workflows** | Pre-built multi-step pipelines with data flow between steps | Individual tool calls only |
| **Design system validation** | Checks structure, modes, naming, alias chains | Not available |

The core difference: MCP tools give you **individual operations**. Bridge to Fig gives you **pipelines** — extract → classify → create → bind → validate — where the hard part isn't any single step, it's the data flow between steps.
