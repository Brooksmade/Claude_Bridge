# Bridge to Fig - Test Plan

> **Purpose**: Track all test scenarios for Bridge to Fig. Each test validates that Claude can correctly interact with Figma using the established design system principles.

**Platform Compatibility**: Windows, macOS, Linux (anywhere Node.js runs)

---

## Test Status Legend

| Status | Meaning |
|--------|---------|
| ⬜ | Not tested |
| 🟡 | In progress |
| ✅ | Passed |
| ❌ | Failed |
| 🔄 | Needs retest |

---

## 1. Variables

### 1.1 Extract from Website URL

| Test ID | Test Case | Status | Notes |
|---------|-----------|--------|-------|
| VAR-1.1.1 | Extract colors from website URL | ⬜ | |
| VAR-1.1.2 | Extract fonts/typography from website URL | ⬜ | |
| VAR-1.1.3 | Extract spacing/sizing from website URL | ⬜ | |
| VAR-1.1.4 | Detect Tailwind CSS usage | ⬜ | |
| VAR-1.1.5 | Extract Tailwind utility classes if detected | ⬜ | |
| VAR-1.1.6 | Map extracted values to Level 1 primitives | ⬜ | |
| VAR-1.1.7 | Generate color scale from single brand color | ⬜ | |

**Test Procedure**:
1. Provide Claude with a website URL
2. Claude fetches and analyzes the site
3. Claude extracts design tokens (colors, fonts, sizes)
4. Claude creates variables following FIGMA_VARIABLES_GUIDE.md structure
5. Verify all Level 1-4 connections are correct

**Success Criteria**:
- [ ] All colors extracted and placed in Level 1
- [ ] Color scales generated (50-1100) from brand colors
- [ ] Semantic aliases created in Level 2
- [ ] UI tokens created in Level 3
- [ ] All variables use correct naming patterns
- [ ] All variables have appropriate scopes

---

### 1.2 Extract from Image

| Test ID | Test Case | Status | Notes |
|---------|-----------|--------|-------|
| VAR-1.2.1 | Extract colors from screenshot/mockup | ⬜ | |
| VAR-1.2.2 | Extract colors from logo/brand asset | ⬜ | |
| VAR-1.2.3 | Extract colors from style guide image | ⬜ | |
| VAR-1.2.4 | Identify primary vs. secondary colors | ⬜ | |
| VAR-1.2.5 | Generate full color scales from extracted colors | ⬜ | |
| VAR-1.2.6 | Create Level 1 primitives from image | ⬜ | |
| VAR-1.2.7 | Populate Level 2-4 from primitives | ⬜ | |

**Test Procedure**:
1. Provide Claude with an image (screenshot, mockup, logo)
2. Claude analyzes the image for colors/styles
3. Claude creates primitives in Level 1
4. Claude populates Level 2-4 with appropriate references
5. Verify the complete variable hierarchy

**Success Criteria**:
- [ ] Colors accurately extracted from image
- [ ] Primitives created with correct hex values
- [ ] Level 2 semantic aliases properly reference Level 1
- [ ] Level 3 tokens properly reference Level 1 or 2
- [ ] All modes (Light/Dark) configured correctly

---

### 1.3 Tailwind CSS Variables

| Test ID | Test Case | Status | Notes |
|---------|-----------|--------|-------|
| VAR-1.3.1 | Create Tailwind-based color primitives | ⬜ | |
| VAR-1.3.2 | Create Tailwind spacing scale (0, 0.5, 1, 1.5, 2...) | ⬜ | |
| VAR-1.3.3 | Create Tailwind font size scale | ⬜ | |
| VAR-1.3.4 | Create Tailwind border radius scale | ⬜ | |
| VAR-1.3.5 | Create Tailwind shadow variables | ⬜ | |
| VAR-1.3.6 | Map Tailwind classes to Figma variables | ⬜ | |
| VAR-1.3.7 | Export variables in Tailwind config format | ⬜ | |

**Test Procedure**:
1. User requests Tailwind-based variable system
2. Claude creates variables matching Tailwind's default scale
3. Claude maps utility classes to variable names
4. Verify compatibility with Tailwind CSS

**Success Criteria**:
- [ ] Spacing matches Tailwind scale (4px base)
- [ ] Colors follow Tailwind naming (slate, gray, zinc, etc.)
- [ ] Font sizes match Tailwind scale (xs, sm, base, lg, xl...)
- [ ] Border radius matches Tailwind (none, sm, md, lg, xl, full)
- [ ] Variables can be exported to tailwind.config.js format

---

### 1.4 Variable Connections

| Test ID | Test Case | Status | Notes |
|---------|-----------|--------|-------|
| VAR-1.4.1 | Level 2 correctly references Level 1 | ⬜ | |
| VAR-1.4.2 | Level 3 correctly references Level 1 or 2 | ⬜ | |
| VAR-1.4.3 | Level 4 correctly references Level 2 or 3 | ⬜ | |
| VAR-1.4.4 | Theme collections reference appropriate levels | ⬜ | |
| VAR-1.4.5 | Light/Dark mode values properly assigned | ⬜ | |
| VAR-1.4.6 | VARIABLE_ALIAS type used for all references | ⬜ | |
| VAR-1.4.7 | No circular references | ⬜ | |

**Success Criteria**:
- [ ] All references use VARIABLE_ALIAS (not raw values)
- [ ] Reference hierarchy follows FIGMA_VARIABLES_GUIDE.md
- [ ] Mode switching works correctly (Light ↔ Dark)

---

## 2. Components

### 2.1 Style Identification

> **Before creating any components**, Claude must understand the desired visual style. Users can provide style references through multiple formats.

#### 2.1.1 Style Input Methods

| Test ID | Test Case | Status | Notes |
|---------|-----------|--------|-------|
| STYLE-2.1.1 | Accept style guide document/image | ⬜ | |
| STYLE-2.1.2 | Accept style tile image | ⬜ | |
| STYLE-2.1.3 | Accept example website URL(s) | ⬜ | |
| STYLE-2.1.4 | Accept screenshot/mockup images | ⬜ | |
| STYLE-2.1.5 | Accept code blocks (CSS, Tailwind, etc.) | ⬜ | |
| STYLE-2.1.6 | Accept design system documentation | ⬜ | |
| STYLE-2.1.7 | Accept multiple mixed inputs | ⬜ | |
| STYLE-2.1.8 | Ask clarifying questions when input is ambiguous | ⬜ | |

**Accepted Input Formats**:
```
Style Guide       → PDF, image, Figma link, or description
Style Tile        → Image showing typography, colors, textures, imagery mood
Website URLs      → 1-5 reference sites to analyze
Images            → Screenshots, mockups, mood boards, UI examples
Code Blocks       → CSS variables, Tailwind config, SCSS, design tokens JSON
Mixed             → Any combination of the above
```

#### 2.1.2 Style Extraction

| Test ID | Test Case | Status | Notes |
|---------|-----------|--------|-------|
| STYLE-2.1.9 | Extract color palette from style inputs | ⬜ | |
| STYLE-2.1.10 | Extract typography styles (fonts, sizes, weights) | ⬜ | |
| STYLE-2.1.11 | Extract spacing patterns | ⬜ | |
| STYLE-2.1.12 | Extract border radius style (sharp, rounded, pill) | ⬜ | |
| STYLE-2.1.13 | Extract shadow/elevation style | ⬜ | |
| STYLE-2.1.14 | Extract button styles | ⬜ | |
| STYLE-2.1.15 | Extract card/container styles | ⬜ | |
| STYLE-2.1.16 | Extract iconography style (outlined, filled, etc.) | ⬜ | |
| STYLE-2.1.17 | Identify design system (Material, iOS, custom) | ⬜ | |

**Test Procedure**:
1. User provides style reference(s) in any supported format
2. Claude analyzes and extracts style attributes
3. Claude summarizes understood style back to user
4. Claude asks clarifying questions if needed
5. User confirms or corrects understanding
6. Claude updates variables to match style before creating components

**Style Summary Template**:
```
Based on your inputs, I understand the style as:

Colors:
- Primary: [color] - [mood/usage]
- Secondary: [color] - [mood/usage]
- Neutrals: [warm/cool/pure gray]

Typography:
- Headings: [font family] - [weight] - [style notes]
- Body: [font family] - [weight] - [style notes]
- Scale: [compact/standard/spacious]

Shape Language:
- Corners: [sharp (0-4px) / rounded (8-16px) / pill (full)]
- Borders: [none / subtle / prominent]
- Shadows: [flat / subtle / elevated / dramatic]

Overall Vibe:
- [e.g., "Modern minimalist with warm accents" or "Bold and playful with rounded elements"]

Is this accurate? What would you like me to adjust?
```

**Success Criteria**:
- [ ] All input formats accepted and parsed correctly
- [ ] Style attributes extracted accurately
- [ ] Summary presented to user for confirmation
- [ ] Variables updated to match confirmed style
- [ ] Components created will reflect the confirmed style

---

### 2.2 Component Discovery & Planning

| Test ID | Test Case | Status | Notes |
|---------|-----------|--------|-------|
| COMP-2.2.1 | Query user about site/SaaS type | ⬜ | |
| COMP-2.2.2 | Generate recommended component list | ⬜ | |
| COMP-2.2.3 | Organize by Atomic Design (Atoms, Molecules, Organisms, Templates) | ⬜ | |
| COMP-2.2.4 | Prioritize components based on project type | ⬜ | |
| COMP-2.2.5 | Identify required vs optional components | ⬜ | |

**Atomic Design Hierarchy**:
```
Atoms        → Buttons, Inputs, Labels, Icons, Avatars
Molecules    → Search bars, Form fields, Cards, List items
Organisms    → Headers, Footers, Navigation, Forms, Card grids
Templates    → Page layouts, Section layouts
Pages        → Fully composed pages
```

**Test Procedure**:
1. User describes their project (e-commerce, SaaS dashboard, blog, etc.)
2. Claude asks clarifying questions
3. Claude generates recommended component list
4. Claude organizes by Atomic Design methodology
5. User approves or modifies list

**Success Criteria**:
- [ ] Questions are relevant to project type
- [ ] Component list is comprehensive but not excessive
- [ ] Atomic Design hierarchy is correct
- [ ] Components are appropriate for the project type

---

### 2.3 Component Creation

| Test ID | Test Case | Status | Notes |
|---------|-----------|--------|-------|
| COMP-2.3.1 | Create component with auto-layout | ⬜ | |
| COMP-2.3.2 | All fills use color variables | ⬜ | |
| COMP-2.3.3 | All text uses text color variables | ⬜ | |
| COMP-2.3.4 | All spacing uses spacing variables | ⬜ | |
| COMP-2.3.5 | All corner radius uses radius variables | ⬜ | |
| COMP-2.3.6 | All strokes use border variables | ⬜ | |
| COMP-2.3.7 | Create responsive components (min/max width) | ⬜ | |
| COMP-2.3.8 | Create slots for content insertion | ⬜ | |
| COMP-2.3.9 | Set up component properties (boolean, text, instance swap) | ⬜ | |
| COMP-2.3.10 | Apply extracted style (from 2.1) to components | ⬜ | |

**Test Procedure**:
1. Claude creates a component
2. Verify all styles use variables (no hard-coded values)
3. Verify auto-layout is properly configured
4. Verify responsive behavior
5. Verify slots work correctly

**Success Criteria**:
- [ ] Zero hard-coded color values (all use variables)
- [ ] Zero hard-coded spacing values (all use variables)
- [ ] Auto-layout configured for responsiveness
- [ ] Slots allow content insertion
- [ ] Component properties exposed correctly

---

### 2.4 Component Organization

| Test ID | Test Case | Status | Notes |
|---------|-----------|--------|-------|
| COMP-2.4.1 | Create page for Atoms | ⬜ | |
| COMP-2.4.2 | Create page for Molecules | ⬜ | |
| COMP-2.4.3 | Create page for Organisms | ⬜ | |
| COMP-2.4.4 | Create page for Templates | ⬜ | |
| COMP-2.4.5 | Move components to appropriate pages | ⬜ | |
| COMP-2.4.6 | Delete empty/unused pages | ⬜ | |
| COMP-2.4.7 | Organize components in frames by category | ⬜ | |
| COMP-2.4.8 | Name components following best practices | ⬜ | |

**Naming Convention**:
```
[Category]/[Subcategory]/[Component Name]

Examples:
Atoms/Buttons/Primary
Atoms/Buttons/Secondary
Molecules/Cards/Product Card
Organisms/Navigation/Header
```

**Test Procedure**:
1. Claude creates pages for each Atomic Design level
2. Claude moves components to appropriate pages
3. Claude organizes components in frames
4. Verify naming follows conventions

**Success Criteria**:
- [ ] Pages created and named correctly
- [ ] Components on correct pages
- [ ] Components organized in frames by category
- [ ] Naming follows `Category/Subcategory/Name` pattern

---

### 2.5 Page Management

| Test ID | Test Case | Status | Notes |
|---------|-----------|--------|-------|
| COMP-2.5.1 | Create new page | ⬜ | |
| COMP-2.5.2 | Rename existing page | ⬜ | |
| COMP-2.5.3 | Delete page | ⬜ | |
| COMP-2.5.4 | Reorder pages | ⬜ | |
| COMP-2.5.5 | Move nodes between pages | ⬜ | |

**API Commands to Verify**:
- `figma.createPage()`
- `page.name = "New Name"`
- `page.remove()`
- `figma.currentPage = targetPage`

---

## 3. Component Variants

### 3.1 Variant Planning

| Test ID | Test Case | Status | Notes |
|---------|-----------|--------|-------|
| VAR-3.1.1 | Query user about desired variants | ⬜ | |
| VAR-3.1.2 | Suggest variants based on best practices | ⬜ | |
| VAR-3.1.3 | Identify variant properties (Size, State, Style) | ⬜ | |
| VAR-3.1.4 | Recommend variant combinations | ⬜ | |

**Common Variant Properties**:
```
Size:    Small, Medium, Large (or S, M, L, XL)
State:   Default, Hover, Active, Disabled, Focus
Style:   Primary, Secondary, Tertiary, Ghost, Outline
Type:    Filled, Outlined, Text
```

**Test Procedure**:
1. User requests component variants
2. Claude asks about desired variant properties
3. Claude suggests best practice variants
4. User approves variant matrix

---

### 3.2 Variant Creation

| Test ID | Test Case | Status | Notes |
|---------|-----------|--------|-------|
| VAR-3.2.1 | Create component set | ⬜ | |
| VAR-3.2.2 | Add variants with correct property names | ⬜ | |
| VAR-3.2.3 | Naming follows `Property=Value` format | ⬜ | |
| VAR-3.2.4 | All variants use variables (no hard-coded values) | ⬜ | |
| VAR-3.2.5 | Variants properly inherit from base | ⬜ | |
| VAR-3.2.6 | Interactive states use Theme [ State ] variables | ⬜ | |
| VAR-3.2.7 | Size variants use Theme [ Component Size ] variables | ⬜ | |

**Naming Convention**:
```
Component Name, Property1=Value1, Property2=Value2

Examples:
Button, Size=Large, Style=Primary, State=Default
Button, Size=Large, Style=Primary, State=Hover
Button, Size=Medium, Style=Secondary, State=Disabled
```

**Test Procedure**:
1. Claude creates component set
2. Claude adds variants with proper naming
3. Verify all variants use variables
4. Verify state/size variants use Theme collections

**Success Criteria**:
- [ ] Component set created correctly
- [ ] All variants named with `Property=Value` format
- [ ] Variants organized logically in the component set
- [ ] All styles use variables
- [ ] Interactive states leverage Theme [ State ] collection
- [ ] Size variants leverage Theme [ Component Size ] collection

---

### 3.3 Variant Organization

| Test ID | Test Case | Status | Notes |
|---------|-----------|--------|-------|
| VAR-3.3.1 | Variants sorted by primary property | ⬜ | |
| VAR-3.3.2 | Variant grid organized logically | ⬜ | |
| VAR-3.3.3 | Default variant clearly identified | ⬜ | |
| VAR-3.3.4 | Variant descriptions added | ⬜ | |

---

## 4. Template Building

### 4.1 Content Outline Processing

| Test ID | Test Case | Status | Notes |
|---------|-----------|--------|-------|
| TEMP-4.1.1 | Receive content outline from user | ⬜ | |
| TEMP-4.1.2 | Ask clarifying questions about structure | ⬜ | |
| TEMP-4.1.3 | Ask about content hierarchy | ⬜ | |
| TEMP-4.1.4 | Ask about responsive requirements | ⬜ | |
| TEMP-4.1.5 | Ask about interactive elements | ⬜ | |
| TEMP-4.1.6 | Confirm understanding before building | ⬜ | |

**Questions Claude Should Ask**:
1. What is the primary goal of this page/template?
2. What are the key sections needed?
3. What breakpoints should be supported (Mobile, Tablet, Desktop)?
4. Are there any specific interactions or animations?
5. What content will be dynamic vs. static?
6. Should this use existing components or need new ones?

---

### 4.2 Template Creation

| Test ID | Test Case | Status | Notes |
|---------|-----------|--------|-------|
| TEMP-4.2.1 | Create template frame with correct dimensions | ⬜ | |
| TEMP-4.2.2 | Use existing components from file | ⬜ | |
| TEMP-4.2.3 | Create instances (not copies) of components | ⬜ | |
| TEMP-4.2.4 | Apply auto-layout for responsive behavior | ⬜ | |
| TEMP-4.2.5 | All spacing uses spacing variables | ⬜ | |
| TEMP-4.2.6 | All colors use color variables | ⬜ | |
| TEMP-4.2.7 | Create Mobile variant | ⬜ | |
| TEMP-4.2.8 | Create Tablet variant | ⬜ | |
| TEMP-4.2.9 | Create Desktop variant | ⬜ | |
| TEMP-4.2.10 | Use Theme [ Screen Sizes ] for responsive values | ⬜ | |

**Test Procedure**:
1. User provides content outline
2. Claude asks clarifying questions
3. Claude identifies required components
4. Claude builds template using component instances
5. Claude creates responsive variants
6. Verify all styles use variables

**Success Criteria**:
- [ ] Template uses component instances (not detached copies)
- [ ] All spacing from Spacing System variables
- [ ] All colors from appropriate Level 3 tokens
- [ ] Responsive behavior works correctly
- [ ] Template follows content outline structure

---

### 4.3 Template Organization

| Test ID | Test Case | Status | Notes |
|---------|-----------|--------|-------|
| TEMP-4.3.1 | Templates placed on Templates page | ⬜ | |
| TEMP-4.3.2 | Templates named descriptively | ⬜ | |
| TEMP-4.3.3 | Breakpoint variants grouped together | ⬜ | |
| TEMP-4.3.4 | Template documentation added | ⬜ | |

---

## 5. General Capabilities

### 5.1 API Commands (133 Total)

#### Node Creation (13 commands)

| Test ID | Test Case | Status | Notes |
|---------|-----------|--------|-------|
| API-5.1.1 | `create` - Create frames, shapes, text | ⬜ | |
| API-5.1.2 | `batchCreate` - Create multiple nodes | ⬜ | |
| API-5.1.3 | `createInstance` - Create component instance | ⬜ | |
| API-5.1.4 | `createComponent` - Create reusable component | ⬜ | |
| API-5.1.5 | `createComponentSet` - Create variant set | ⬜ | |
| API-5.1.6 | `createFromSvg` - Import SVG | ⬜ | |
| API-5.1.7 | `createSection` - Create section container | ⬜ | |
| API-5.1.8 | `createSlice` - Create export slice | ⬜ | |
| API-5.1.9 | `createTable` - Create FigJam table | ⬜ | |
| API-5.1.10 | `createSticky` - Create sticky note | ⬜ | |
| API-5.1.11 | `createConnector` - Create connector | ⬜ | |
| API-5.1.12 | `createShapeWithText` - Create shape with text | ⬜ | |
| API-5.1.13 | `createCodeBlock` - Create code block | ⬜ | |

#### Node Modification (5 commands)

| Test ID | Test Case | Status | Notes |
|---------|-----------|--------|-------|
| API-5.2.1 | `modify` - Change node properties | ⬜ | |
| API-5.2.2 | `batchModify` - Modify multiple nodes | ⬜ | |
| API-5.2.3 | `move` - Move to x,y position | ⬜ | |
| API-5.2.4 | `resize` - Change width/height | ⬜ | |
| API-5.2.5 | `reparent` - Move to different parent | ⬜ | |

#### Query & Selection (7 commands)

| Test ID | Test Case | Status | Notes |
|---------|-----------|--------|-------|
| API-5.3.1 | `query` - Get node info (selection, page, find, findByType, pages) | ⬜ | |
| API-5.3.2 | `getFrames` - Get all frames | ⬜ | |
| API-5.3.3 | `getViewport` - Get viewport info | ⬜ | |
| API-5.3.4 | `setViewport` - Scroll/zoom | ⬜ | |
| API-5.3.5 | `select` - Select nodes | ⬜ | |
| API-5.3.6 | `setPage` - Switch pages | ⬜ | |
| API-5.3.7 | `analyzeColors` - Analyze colors | ⬜ | |

#### Deletion (4 commands)

| Test ID | Test Case | Status | Notes |
|---------|-----------|--------|-------|
| API-5.4.1 | `delete` - Delete single node | ⬜ | |
| API-5.4.2 | `batchDelete` - Delete multiple | ⬜ | |
| API-5.4.3 | `deleteChildren` - Delete children | ⬜ | |
| API-5.4.4 | `deleteSelection` - Delete selected | ⬜ | |

#### Grouping (5 commands)

| Test ID | Test Case | Status | Notes |
|---------|-----------|--------|-------|
| API-5.5.1 | `group` - Group nodes | ⬜ | |
| API-5.5.2 | `ungroup` - Ungroup | ⬜ | |
| API-5.5.3 | `flatten` - Flatten structure | ⬜ | |
| API-5.5.4 | `clone` - Clone with offset | ⬜ | |
| API-5.5.5 | `boolean` - Union/Subtract/Intersect/Exclude | ⬜ | |

#### Variables (12 commands)

| Test ID | Test Case | Status | Notes |
|---------|-----------|--------|-------|
| API-5.6.1 | `createVariableCollection` - Create collection | ⬜ | |
| API-5.6.2 | `editVariableCollection` - Edit collection | ⬜ | |
| API-5.6.3 | `deleteVariableCollection` - Delete collection | ⬜ | |
| API-5.6.4 | `createVariable` - Create variable | ⬜ | |
| API-5.6.5 | `editVariable` - Edit variable | ⬜ | |
| API-5.6.6 | `deleteVariable` - Delete variable | ⬜ | |
| API-5.6.7 | `bindVariable` - Bind to property | ⬜ | |
| API-5.6.8 | `unbindVariable` - Remove binding | ⬜ | |
| API-5.6.9 | `getVariables` - List variables | ⬜ | |
| API-5.6.10 | `exportTokens` - Export as JSON | ⬜ | |
| API-5.6.11 | `importTokens` - Import from JSON | ⬜ | |
| API-5.6.12 | `createBoilerplate` - Create standard boilerplate | ⬜ | |

#### Styles (11 commands)

| Test ID | Test Case | Status | Notes |
|---------|-----------|--------|-------|
| API-5.7.1 | `createPaintStyle` - Create fill/stroke style | ⬜ | |
| API-5.7.2 | `createTextStyle` - Create text style | ⬜ | |
| API-5.7.3 | `createEffectStyle` - Create effect style | ⬜ | |
| API-5.7.4 | `createGridStyle` - Create grid style | ⬜ | |
| API-5.7.5 | `editStyle` - Edit style | ⬜ | |
| API-5.7.6 | `deleteStyle` - Delete style | ⬜ | |
| API-5.7.7 | `applyStyle` - Apply to node | ⬜ | |
| API-5.7.8 | `detachStyle` - Detach from node | ⬜ | |
| API-5.7.9 | `getStyles` - List styles | ⬜ | |
| API-5.7.10 | `getGridStyles` - List grid styles | ⬜ | |
| API-5.7.11 | `applyGridStyle` - Apply grid to frame | ⬜ | |

#### Components & Instances (12 commands)

| Test ID | Test Case | Status | Notes |
|---------|-----------|--------|-------|
| API-5.8.1 | `addVariant` - Add variant | ⬜ | |
| API-5.8.2 | `editComponentProperties` - Edit properties | ⬜ | |
| API-5.8.3 | `getComponents` - List components | ⬜ | |
| API-5.8.4 | `editInstanceText` - Override text | ⬜ | |
| API-5.8.5 | `overrideInstanceFills` - Override fills | ⬜ | |
| API-5.8.6 | `overrideInstanceStrokes` - Override strokes | ⬜ | |
| API-5.8.7 | `overrideInstanceEffects` - Override effects | ⬜ | |
| API-5.8.8 | `resetOverrides` - Reset overrides | ⬜ | |
| API-5.8.9 | `swapInstance` - Swap component | ⬜ | |
| API-5.8.10 | `detachInstance` - Detach instance | ⬜ | |

#### Auto Layout & Constraints (7 commands)

| Test ID | Test Case | Status | Notes |
|---------|-----------|--------|-------|
| API-5.9.1 | `setAutoLayout` - Configure auto layout | ⬜ | |
| API-5.9.2 | `getAutoLayout` - Get settings | ⬜ | |
| API-5.9.3 | `setLayoutChild` - Set child properties | ⬜ | |
| API-5.9.4 | `setConstraints` - Set constraints | ⬜ | |
| API-5.9.5 | `getConstraints` - Get constraints | ⬜ | |
| API-5.9.6 | `setSizeConstraints` - Set min/max size | ⬜ | |
| API-5.9.7 | `inferAutoLayout` - Infer from layout | ⬜ | |

#### Text Range Operations (11 commands)

| Test ID | Test Case | Status | Notes |
|---------|-----------|--------|-------|
| API-5.10.1 | `setRangeFont` - Apply font to range | ⬜ | |
| API-5.10.2 | `setRangeFontSize` - Set size for range | ⬜ | |
| API-5.10.3 | `setRangeColor` - Set color for range | ⬜ | |
| API-5.10.4 | `setRangeTextDecoration` - Set decoration | ⬜ | |
| API-5.10.5 | `setRangeTextCase` - Set case | ⬜ | |
| API-5.10.6 | `setRangeLineHeight` - Set line height | ⬜ | |
| API-5.10.7 | `setRangeLetterSpacing` - Set spacing | ⬜ | |
| API-5.10.8 | `insertText` - Insert at position | ⬜ | |
| API-5.10.9 | `deleteText` - Delete range | ⬜ | |
| API-5.10.10 | `getRangeStyles` - Get range styles | ⬜ | |
| API-5.10.11 | `setTextHyperlink` - Set hyperlink | ⬜ | |

#### Node Properties (14 commands)

| Test ID | Test Case | Status | Notes |
|---------|-----------|--------|-------|
| API-5.11.1 | `setBlendMode` - Set blend mode | ⬜ | |
| API-5.11.2 | `setOpacity` - Set opacity | ⬜ | |
| API-5.11.3 | `setVisible` - Show/hide | ⬜ | |
| API-5.11.4 | `setLocked` - Lock/unlock | ⬜ | |
| API-5.11.5 | `setClipsContent` - Enable clipping | ⬜ | |
| API-5.11.6 | `setCornerRadius` - Set corners | ⬜ | |
| API-5.11.7 | `setMask` - Set as mask | ⬜ | |
| API-5.11.8 | `setEffects` - Set effects | ⬜ | |
| API-5.11.9 | `setRotation` - Rotate | ⬜ | |
| API-5.11.10 | `setFills` - Set fills | ⬜ | |
| API-5.11.11 | `setStrokes` - Set strokes | ⬜ | |
| API-5.11.12 | `setPluginData` - Store data | ⬜ | |
| API-5.11.13 | `getPluginData` - Retrieve data | ⬜ | |
| API-5.11.14 | `renameNode` - Rename node | ⬜ | |

#### Pages (6 commands)

| Test ID | Test Case | Status | Notes |
|---------|-----------|--------|-------|
| API-5.12.1 | `createPage` - Create page | ⬜ | |
| API-5.12.2 | `deletePage` - Delete page | ⬜ | |
| API-5.12.3 | `renamePage` - Rename page | ⬜ | |
| API-5.12.4 | `duplicatePage` - Duplicate page | ⬜ | |
| API-5.12.5 | `loadAllPages` - Load all pages | ⬜ | |
| API-5.12.6 | `setPage` - Switch page | ⬜ | |

#### Fonts (4 commands)

| Test ID | Test Case | Status | Notes |
|---------|-----------|--------|-------|
| API-5.13.1 | `listFonts` - List available | ⬜ | |
| API-5.13.2 | `loadFont` - Load font | ⬜ | |
| API-5.13.3 | `checkMissingFonts` - Check missing | ⬜ | |
| API-5.13.4 | `getUsedFonts` - Get used fonts | ⬜ | |

#### Images (4 commands)

| Test ID | Test Case | Status | Notes |
|---------|-----------|--------|-------|
| API-5.14.1 | `createImage` - From base64 | ⬜ | |
| API-5.14.2 | `createImageFromUrl` - From URL | ⬜ | |
| API-5.14.3 | `getImageData` - Get as base64 | ⬜ | |
| API-5.14.4 | `replaceImage` - Replace existing | ⬜ | |

#### Export (4 commands)

| Test ID | Test Case | Status | Notes |
|---------|-----------|--------|-------|
| API-5.15.1 | `exportNode` - Export PNG/JPG/SVG/PDF | ⬜ | |
| API-5.15.2 | `batchExport` - Export multiple | ⬜ | |
| API-5.15.3 | `getExportSettings` - Get settings | ⬜ | |
| API-5.15.4 | `setExportSettings` - Set settings | ⬜ | |

#### Utilities (14 commands)

| Test ID | Test Case | Status | Notes |
|---------|-----------|--------|-------|
| API-5.16.1 | `notify` - Show toast | ⬜ | |
| API-5.16.2 | `commitUndo` - Commit undo | ⬜ | |
| API-5.16.3 | `triggerUndo` - Trigger undo | ⬜ | |
| API-5.16.4 | `saveVersion` - Save version | ⬜ | |
| API-5.16.5 | `getCurrentUser` - Get user info | ⬜ | |
| API-5.16.6 | `getActiveUsers` - Get collaborators | ⬜ | |
| API-5.16.7 | `getFileInfo` - Get file metadata | ⬜ | |
| API-5.16.8 | `openExternal` - Open URL | ⬜ | |
| API-5.16.9 | `getFileThumbnail` - Get thumbnail | ⬜ | |
| API-5.16.10 | `setFileThumbnail` - Set thumbnail | ⬜ | |
| API-5.16.11 | `base64Encode` - Encode to base64 | ⬜ | |
| API-5.16.12 | `base64Decode` - Decode base64 | ⬜ | |
| API-5.16.13 | `getNodeColors` - Get colors | ⬜ | |
| API-5.16.14 | `analyzeColors` - Analyze colors | ⬜ | |

#### Design System (3 commands)

| Test ID | Test Case | Status | Notes |
|---------|-----------|--------|-------|
| API-5.17.1 | `createDesignSystem` - Create 4-level hierarchy | ⬜ | |
| API-5.17.2 | `validateDesignSystem` - Validate completeness | ⬜ | |
| API-5.17.3 | `getDesignSystemStatus` - Get status | ⬜ | |

### 5.2 Error Handling

| Test ID | Test Case | Status | Notes |
|---------|-----------|--------|-------|
| ERR-5.2.1 | Handle invalid variable references | ⬜ | |
| ERR-5.2.2 | Handle missing collections | ⬜ | |
| ERR-5.2.3 | Handle invalid node IDs | ⬜ | |
| ERR-5.2.4 | Handle connection timeout | ⬜ | |
| ERR-5.2.5 | Recover from failed commands | ⬜ | |

---

## Test Execution Log

| Date | Tester | Tests Run | Passed | Failed | Notes |
|------|--------|-----------|--------|--------|-------|
| | | | | | |
| | | | | | |
| | | | | | |

---

## Known Issues

| Issue ID | Description | Status | Workaround |
|----------|-------------|--------|------------|
| | | | |
| | | | |

---

## Feature Requests

| Request ID | Description | Priority | Status |
|------------|-------------|----------|--------|
| | | | |
| | | | |

---

*Document Version: 2.0 | Last Updated: 2026-01-02 | 133 Commands*
