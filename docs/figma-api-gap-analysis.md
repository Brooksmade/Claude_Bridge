# Figma Plugin API Gap Analysis

This document compares the current Claude-Figma Bridge implementation against the full Figma Plugin API to identify missing commands.

## Summary (Updated: All Commands Implemented)

**Total Commands: 212** (up from 108)

| Category | Commands | Status |
|----------|----------|--------|
| Node Creation | 26 | COMPLETE |
| Style Operations | 16 | COMPLETE |
| Variable Operations | 24 | COMPLETE |
| Query/Get Operations | 26 | COMPLETE |
| Import Operations | 6 | COMPLETE |
| Find Operations | 7 | COMPLETE |
| Text Operations | 27 | COMPLETE |
| Dev Resources | 15 | COMPLETE |
| Layout Operations | 7 | COMPLETE |
| Component/Instance | 12 | COMPLETE |
| Export Operations | 4 | COMPLETE |
| Page Operations | 5 | COMPLETE |
| Utility Operations | 12 | COMPLETE |

---

## New Command Files Added

1. **import-operations.ts** - Library import operations
2. **find-operations.ts** - Advanced node finding
3. **media-operations.ts** - Video, GIF, link previews, slides
4. **query-extended.ts** - CSS, measurements, annotations
5. **dev-resources.ts** - Dev mode, shared data, reactions
6. **variable-aliases.ts** - Variable bindings and aliases
7. **text-extended.ts** - Extended text range operations

---

## Currently Implemented Commands (212 total)

### Node Creation
- `create` (frame, rectangle, ellipse, text, line, polygon, star, vector, component, slice)
- `createInstance`
- `createFromSvg`
- `createSection`
- `createSlice`
- `createTable`
- `createSticky`
- `createConnector`
- `createShapeWithText`
- `createCodeBlock`
- `createImage`
- `createImageFromUrl`
- `createPage`
- `createComponent`
- `createComponentSet`
- `batchCreate`

### Style Operations
- `createPaintStyle`
- `createTextStyle`
- `createEffectStyle`
- `createGridStyle`
- `editStyle`
- `deleteStyle`
- `applyStyle`
- `detachStyle`
- `getStyles`
- `getGridStyles`
- `applyGridStyle`

### Variable Operations
- `createVariableCollection`
- `editVariableCollection`
- `deleteVariableCollection`
- `createVariable`
- `editVariable`
- `deleteVariable`
- `bindVariable`
- `bindFillVariable`
- `bindStrokeVariable`
- `inspectFills`
- `unbindVariable`
- `getVariables`
- `exportTokens`
- `importTokens`

### Query Operations
- `query` (basic, deep, children, findAll, findByName, findByType)
- `getFrames`
- `getViewport`
- `setViewport`
- `select`
- `setPage`
- `getComponents`
- `getNodeColors`
- `analyzeColors`
- `getExportSettings`
- `getAutoLayout`
- `getConstraints`
- `getRangeStyles`
- `getPluginData`
- `getFileThumbnail`
- `getFileInfo`

### Modify Operations
- `modify`
- `batchModify`
- `move`
- `resize`
- `reparent`
- `renameNode`

### Delete Operations
- `delete`
- `batchDelete`
- `deleteChildren`
- `deleteSelection`

### Group Operations
- `group`
- `ungroup`
- `flatten`
- `clone`
- `boolean` (union, subtract, intersect, exclude)

### Component/Instance Operations
- `addVariant`
- `editComponentProperties`
- `editInstanceText`
- `overrideInstanceFills`
- `overrideInstanceStrokes`
- `overrideInstanceEffects`
- `resetOverrides`
- `swapInstance`
- `detachInstance`

### Layout Operations
- `setAutoLayout`
- `setLayoutChild`
- `setConstraints`
- `setSizeConstraints`
- `inferAutoLayout`

### Text Operations
- `setRangeFont`
- `setRangeFontSize`
- `setRangeColor`
- `setRangeTextDecoration`
- `setRangeTextCase`
- `setRangeLineHeight`
- `setRangeLetterSpacing`
- `insertText`
- `deleteText`
- `setTextHyperlink`

### Property Operations
- `setBlendMode`
- `setOpacity`
- `setVisible`
- `setLocked`
- `setClipsContent`
- `setCornerRadius`
- `setMask`
- `setEffects`
- `setRotation`
- `setFills`
- `setStrokes`
- `setPluginData`

### Export Operations
- `exportNode`
- `batchExport`
- `setExportSettings`

### Utility Operations
- `notify`
- `commitUndo`
- `triggerUndo`
- `saveVersion`
- `getCurrentUser`
- `getActiveUsers`
- `openExternal`
- `setFileThumbnail`
- `base64Encode`
- `base64Decode`

### Page Operations
- `deletePage`
- `renamePage`
- `duplicatePage`
- `loadAllPages`

### Font Operations
- `listFonts`
- `loadFont`
- `checkMissingFonts`
- `getUsedFonts`

---

## Missing API Methods

### Priority 1: High Value Missing Methods

#### Import Operations (External Libraries)
```typescript
// Import components/styles from team libraries
figma.importComponentByKeyAsync(key: string): Promise<ComponentNode>
figma.importComponentSetByKeyAsync(key: string): Promise<ComponentSetNode>
figma.importStyleByKeyAsync(key: string): Promise<BaseStyle>
figma.importVariableByKeyAsync(key: string): Promise<Variable>
```

#### Find Operations (Powerful Queries)
```typescript
// More powerful node finding
node.findChildren(callback?: (node: SceneNode) => boolean): SceneNode[]
node.findChild(callback: (node: SceneNode) => boolean): SceneNode | null
node.findAll(callback?: (node: SceneNode) => boolean): SceneNode[]
node.findOne(callback: (node: SceneNode) => boolean): SceneNode | null
node.findWidgetNodesByWidgetId(widgetId: string): Array<WidgetNode>
```

#### Node Creation (Media & Advanced)
```typescript
figma.createVideoAsync(data: Uint8Array): Promise<Video>
figma.createImageAsync(src: string): Promise<Image>  // URL-based
figma.createLinkPreviewAsync(url: string): Promise<EmbedNode | LinkUnfurlNode>
figma.createGif(hash: string): MediaNode
figma.createNodeFromJSXAsync(jsx: any): Promise<SceneNode>
figma.createPageDivider(dividerName?: string): PageNode
```

#### Variable Aliases
```typescript
figma.createVariableAlias(variable: Variable): VariableAlias
figma.createVariableAliasByIdAsync(variableId: string): Promise<VariableAlias>
figma.setBoundVariableForPaint(paint: SolidPaint, field: 'color', variable: Variable): SolidPaint
figma.setBoundVariableForEffect(effect: Effect, field: string, variable: Variable): Effect
figma.setBoundVariableForLayoutGrid(grid: LayoutGrid, field: string, variable: Variable): LayoutGrid
```

### Priority 2: Useful Missing Methods

#### Query Operations
```typescript
figma.getSelectionColors(): null | { paints: Paint[], styles: PaintStyle[] }
figma.getCSSAsync(): Promise<{ code: string }>  // On nodes
node.getPublishStatusAsync(): Promise<PublishStatus>
node.getTopLevelFrame(): FrameNode | undefined
```

#### Slide/Canvas Grid (FigJam/Slides)
```typescript
figma.getSlideGrid(): Array<Array<SlideNode>>
figma.setSlideGrid(slideGrid: Array<Array<SlideNode>>): void
figma.createSlide(row?: number, col?: number): SlideNode
figma.createSlideRow(row?: number): SlideRowNode
figma.getCanvasGrid(): Array<Array<SceneNode>>
figma.setCanvasGrid(canvasGrid: Array<Array<SceneNode>>): void
figma.createCanvasRow(rowIndex?: number): SceneNode
```

#### Measurement Tools
```typescript
figma.measurements.getMeasurements(): Measurement[]
figma.measurements.getMeasurementsForNode(node: SceneNode): Measurement[]
```

#### Annotation Categories
```typescript
figma.getAnnotationCategoriesAsync(): Promise<AnnotationCategory[]>
figma.getAnnotationCategoryByIdAsync(id: string): Promise<AnnotationCategory | null>
```

### Priority 3: Additional Missing Methods

#### Library Variables
```typescript
figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync(): Promise<LibraryVariableCollection[]>
figma.teamLibrary.getVariablesInLibraryCollectionAsync(libraryCollectionKey: string): Promise<LibraryVariable[]>
```

#### Dev Resources
```typescript
node.getDevResourcesAsync(options?: { includeChildren?: boolean }): Promise<DevResourceWithNodeId[]>
node.setDevResourcePreviewAsync(url: string, preview: PlainTextElement): Promise<void>
```

#### Shared Plugin Data
```typescript
node.getSharedPluginData(namespace: string, key: string): string
node.setSharedPluginData(namespace: string, key: string, value: string): void
node.getSharedPluginDataKeys(namespace: string): string[]
```

#### Relaunch Data
```typescript
node.setRelaunchData(data: { [command: string]: string }): void
node.getRelaunchData(): { [command: string]: string }
```

#### Text Range Operations (Missing)
```typescript
// Additional text range methods not currently implemented
text.getRangeFontWeight(start: number, end: number): number
text.getRangeAllFontNames(start: number, end: number): FontName[]
text.getRangeOpenTypeFeatures(start: number, end: number): OpenTypeFeatures
text.getRangeFills(start: number, end: number): Paint[]
text.setRangeFills(start: number, end: number, value: Paint[]): void
text.getRangeTextStyleId(start: number, end: number): string
text.setRangeTextStyleIdAsync(start: number, end: number, styleId: string): Promise<void>
text.getRangeFillStyleId(start: number, end: number): string
text.setRangeFillStyleIdAsync(start: number, end: number, styleId: string): Promise<void>
text.getRangeListOptions(start: number, end: number): TextListOptions
text.setRangeListOptions(start: number, end: number, value: TextListOptions): void
text.getRangeListSpacing(start: number, end: number): number
text.setRangeListSpacing(start: number, end: number, value: number): void
text.getRangeIndentation(start: number, end: number): number
text.setRangeIndentation(start: number, end: number, value: number): void
text.getRangeParagraphIndent(start: number, end: number): number
text.setRangeParagraphIndent(start: number, end: number, value: number): void
text.getRangeParagraphSpacing(start: number, end: number): number
text.setRangeParagraphSpacing(start: number, end: number, value: number): void
text.getRangeTextDecorationStyle(start: number, end: number): TextDecorationStyle
text.setRangeTextDecorationStyle(start: number, end: number, value: TextDecorationStyle): void
text.getRangeBoundVariable(start: number, end: number, field: string): VariableAlias | null
text.setRangeBoundVariable(start: number, end: number, field: string, variable: Variable | null): void
```

#### Instance Operations
```typescript
component.getInstancesAsync(): Promise<InstanceNode[]>
instance.getMainComponentAsync(): Promise<ComponentNode | null>
```

#### Style Operations
```typescript
style.getStyleConsumersAsync(): Promise<StyleConsumers[]>
node.setEffectStyleIdAsync(styleId: string): Promise<void>
node.setStrokeStyleIdAsync(styleId: string): Promise<void>
node.setFillStyleIdAsync(styleId: string): Promise<void>
node.setGridStyleIdAsync(styleId: string): Promise<void>
node.setTextStyleIdAsync(styleId: string): Promise<void>
```

#### Reactions (Prototyping)
```typescript
node.setReactionsAsync(reactions: Array<Reaction>): Promise<void>
```

#### Vector Network
```typescript
vectorNode.setVectorNetworkAsync(vectorNetwork: VectorNetwork): Promise<void>
```

#### Component Properties
```typescript
instance.setProperties(properties: { [propertyName: string]: string | boolean | VariableAlias }): void
```

---

## Known Bugs in Current Implementation

### 1. Sticky Color Bug (advanced-nodes.ts:199-201)
```typescript
// BUG: Color is checked but never applied!
if (payload && payload.color) {
  sticky.authorVisible = false;  // Should be: sticky.stickyColor = payload.color;
}
```

**Fix needed:** Add `(sticky as any).stickyColor = payload.color;` before the authorVisible line.

Note: According to Figma Plugin API, StickyNode does NOT have a direct `stickyColor` property in the typings, but the property exists at runtime. The color is actually controlled via the `fills` property (MinimalFillsMixin).

---

## Recommendations

### Immediate Fixes
1. Fix the sticky color bug in `advanced-nodes.ts`
2. Add shape sizing support (width/height for ShapeWithText)

### High Priority Additions
1. **Import commands** - Essential for working with team libraries
2. **Find commands** - More powerful than current query system
3. **Video/Media creation** - Modern FigJam features
4. **Variable aliases** - Complete variable system

### Medium Priority Additions
1. Slide/Canvas grid operations
2. Measurement tools
3. Additional text range operations
4. Dev resources API

### Lower Priority
1. Annotation categories
2. Shared plugin data
3. Relaunch data
4. Widget operations

---

## Implementation Notes

### For each new command, create:
1. Handler function in appropriate `commands/*.ts` file
2. Add case to switch statement in `commands/index.ts`
3. Export handler from `commands/index.ts`
4. Add TypeScript types if needed
5. Update documentation in `prompts/figma-bridge.md`
6. Add tests if applicable
