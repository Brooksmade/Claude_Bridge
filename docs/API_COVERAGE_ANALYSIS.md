# Figma Plugin API Coverage Analysis

**Last Updated:** January 2026

## Current Implementation: 136+ Commands

### What We Have

#### Node Creation (13 commands)
- ✅ create (rectangle, ellipse, line, polygon, star, vector, text, frame)
- ✅ batchCreate
- ✅ createInstance
- ✅ createComponent
- ✅ createComponentSet
- ✅ createFromSvg
- ✅ createSection
- ✅ createSlice
- ✅ createTable
- ✅ createSticky
- ✅ createConnector
- ✅ createShapeWithText
- ✅ createCodeBlock

#### Node Modification (5 commands)
- ✅ modify (properties)
- ✅ batchModify
- ✅ move
- ✅ resize
- ✅ reparent

#### Node Deletion (4 commands)
- ✅ delete
- ✅ batchDelete
- ✅ deleteChildren
- ✅ deleteSelection

#### Query & Selection (7 commands)
- ✅ query (selection, page, node, children, find, deep, describe, findByType, pages)
- ✅ getFrames
- ✅ getViewport
- ✅ setViewport
- ✅ select
- ✅ setPage
- ✅ analyzeColors

#### Group Operations (5 commands)
- ✅ group
- ✅ ungroup
- ✅ flatten
- ✅ clone
- ✅ boolean (union, subtract, intersect, exclude)

#### Variables (12 commands)
- ✅ createVariableCollection
- ✅ editVariableCollection
- ✅ deleteVariableCollection
- ✅ createVariable
- ✅ editVariable
- ✅ deleteVariable
- ✅ bindVariable
- ✅ unbindVariable
- ✅ getVariables
- ✅ exportTokens
- ✅ importTokens
- ✅ createBoilerplate

#### Styles (11 commands)
- ✅ createPaintStyle
- ✅ createTextStyle
- ✅ createEffectStyle
- ✅ createGridStyle
- ✅ editStyle
- ✅ deleteStyle
- ✅ applyStyle
- ✅ detachStyle
- ✅ getStyles
- ✅ getGridStyles
- ✅ applyGridStyle

#### Components & Instances (12 commands)
- ✅ addVariant
- ✅ editComponentProperties
- ✅ getComponents
- ✅ editInstanceText
- ✅ overrideInstanceFills
- ✅ overrideInstanceStrokes
- ✅ overrideInstanceEffects
- ✅ resetOverrides
- ✅ swapInstance
- ✅ detachInstance

#### Pages (6 commands)
- ✅ createPage
- ✅ deletePage
- ✅ renamePage
- ✅ duplicatePage
- ✅ loadAllPages
- ✅ setPage

#### Fonts (4 commands)
- ✅ listFonts
- ✅ loadFont
- ✅ checkMissingFonts
- ✅ getUsedFonts

#### Images (4 commands)
- ✅ createImage
- ✅ createImageFromUrl
- ✅ getImageData
- ✅ replaceImage

#### Export (4 commands)
- ✅ exportNode
- ✅ batchExport
- ✅ getExportSettings
- ✅ setExportSettings

#### Utilities (12 commands)
- ✅ notify
- ✅ commitUndo
- ✅ triggerUndo
- ✅ saveVersion
- ✅ getCurrentUser
- ✅ getActiveUsers
- ✅ getFileInfo
- ✅ openExternal
- ✅ getFileThumbnail
- ✅ setFileThumbnail
- ✅ base64Encode
- ✅ base64Decode

#### Design System (3 commands) ⭐ NEW
- ✅ createDesignSystem - Idempotent composite command that creates complete 4-level hierarchy
- ✅ validateDesignSystem - Validates completeness and identifies issues
- ✅ getDesignSystemStatus - Quick status check for design system readiness

#### Auto Layout & Constraints (7 commands)
- ✅ setAutoLayout
- ✅ getAutoLayout
- ✅ setLayoutChild
- ✅ setConstraints
- ✅ getConstraints
- ✅ setSizeConstraints
- ✅ inferAutoLayout

#### Text Range Operations (11 commands)
- ✅ setRangeFont
- ✅ setRangeFontSize
- ✅ setRangeColor
- ✅ setRangeTextDecoration
- ✅ setRangeTextCase
- ✅ setRangeLineHeight
- ✅ setRangeLetterSpacing
- ✅ insertText
- ✅ deleteText
- ✅ getRangeStyles
- ✅ setTextHyperlink

#### Node Properties (14 commands)
- ✅ setBlendMode
- ✅ setOpacity
- ✅ setVisible
- ✅ setLocked
- ✅ setClipsContent
- ✅ setCornerRadius
- ✅ setMask
- ✅ setEffects
- ✅ setRotation
- ✅ setFills
- ✅ setStrokes
- ✅ setPluginData
- ✅ getPluginData
- ✅ renameNode

---

## What's Missing (Priority Order)

### MEDIUM PRIORITY - Useful Features

#### 1. Prototyping/Interactions
```
- setReactions (add prototype interactions)
- getReactions
- createOverlay
- setOverlaySettings
- setTransition
```

#### 2. Team Library
```
- getLibraryCollections
- importComponentByKey
- importStyleByKey
- importVariableByKey
- getPublishStatus
```

#### 3. Dev Mode Features
```
- getDevResources
- addDevResource
- editDevResource
- deleteDevResource
- addMeasurement
- getMeasurements
- getCSSAsync
```

#### 4. Annotations
```
- addAnnotation
- getAnnotations
- editAnnotation
- deleteAnnotation
```

### LOW PRIORITY - Niche Features

#### 5. Vector Operations
```
- getVectorNetwork
- setVectorNetwork
- getVectorPaths
- setVectorPaths
```

#### 6. Guides
```
- addGuide
- getGuides
- removeGuide
```

#### 7. FigJam Specific
```
- createHighlight
- createStamp
- createWashiTape
- createEmbed
- createLinkPreview
```

#### 8. Slides (Figma Slides)
```
- createSlide
- createSlideRow
- getSlideGrid
- setSlideGrid
```

---

## Recommended Subagent Architecture

Based on this analysis, here are the recommended specialized subagents:

### 1. Layout Subagent
**Purpose**: Handle all layout-related operations
**Commands needed**: Auto layout, constraints, spacing, padding, alignment
**Use cases**:
- "Make this responsive"
- "Add auto layout to this frame"
- "Set up a 12-column grid"

### 2. Typography Subagent
**Purpose**: Handle all text and font operations
**Commands needed**: Text range operations, font loading, text styles
**Use cases**:
- "Style this heading"
- "Apply brand typography"
- "Find and replace text styles"

### 3. Design System Subagent
**Purpose**: Create and manage design systems
**Commands needed**: Variables, styles, components, tokens
**Use cases**:
- "Extract design system from website"
- "Create color palette"
- "Set up typography scale"

### 4. Component Subagent
**Purpose**: Create and manage components
**Commands needed**: Component creation, variants, properties, instances
**Use cases**:
- "Create a button component"
- "Add variants to component"
- "Swap all instances"

### 5. Prototyping Subagent
**Purpose**: Handle interactions and prototyping
**Commands needed**: Reactions, overlays, transitions
**Use cases**:
- "Add hover state"
- "Create navigation flow"
- "Set up prototype"

### 6. Export Subagent
**Purpose**: Handle export operations
**Commands needed**: Export to various formats, batch export
**Use cases**:
- "Export all icons as SVG"
- "Export screens for handoff"
- "Generate assets"

### 7. Analysis Subagent
**Purpose**: Analyze and audit designs
**Commands needed**: Query, color analysis, font analysis, accessibility
**Use cases**:
- "Audit color contrast"
- "Find unused styles"
- "Check consistency"

---

## Implementation Status

### ✅ COMPLETED

- **Phase 1: Auto Layout & Constraints** - 7 commands
- **Phase 2: Text Range Operations** - 11 commands
- **Phase 3: Advanced Properties** - 14 commands (blend modes, masks, visibility)
- **Phase 4: Plugin Data** - 2 commands (setPluginData, getPluginData)

### Remaining Phases

#### Phase 5: Prototyping (Medium Priority)
Enables interactive prototype creation with reactions and transitions.

#### Phase 6: Team Library (Low-Medium Priority)
Useful for enterprise workflows with shared libraries.

#### Phase 7: Dev Mode (Low Priority)
Specialized for developer handoff with measurements and CSS.
