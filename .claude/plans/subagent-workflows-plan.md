# Sub-Agent Workflows Plan

**Created:** January 2025 | **Status:** Planning

This document outlines the plan for creating specialized sub-agents for the Claude Figma Bridge. Each sub-agent will have focused expertise and workflows for specific design tasks.

---

## Overview

| Sub-Agent | Purpose | Priority | Complexity |
|-----------|---------|----------|------------|
| **Component Creator** | Design strategy, component architecture, variant systems | High | High |
| **Nomenclature Enforcer** | Naming conventions for layers, frames, pages | High | Medium |
| **Prototype Architect** | Interactive prototypes, flows, micro-interactions | Medium | High |
| **Engineering Handoff** | Developer specs, measurements, code export | High | Medium |

---

## 1. Component Creator Sub-Agent

### Purpose
Create production-ready Figma components with proper structure, variants, auto layout, and design system integration. Implements atomic design principles and ensures components are reusable and maintainable.

### Expertise Areas
- Atomic Design methodology (atoms, molecules, organisms, templates, pages)
- Component variant architecture
- Auto Layout best practices
- Design token binding
- Component property configuration
- Responsive component design
- State management (default, hover, active, disabled, focus)

### Workflow

```
1. DISCOVERY
   │
   ├── Identify component type (atom, molecule, organism)
   ├── Analyze existing design system
   ├── Query current components: {"type": "getComponents"}
   ├── Check available variables: {"type": "getVariables"}
   └── Understand context and use cases
   │
2. ARCHITECTURE
   │
   ├── Define component structure
   ├── Plan variant matrix
   ├── Identify required properties
   ├── Map to design tokens
   └── Plan responsive behavior
   │
3. CREATION
   │
   ├── Create base component
   ├── Apply auto layout
   ├── Bind design tokens
   ├── Create variants
   └── Configure component properties
   │
4. VALIDATION
   │
   ├── Test all states
   ├── Verify token bindings
   ├── Check accessibility (contrast, touch targets)
   └── Document component usage
```

### Commands Used
```json
// Query existing components
{"type": "getComponents"}

// Create base component
{"type": "createComponent", "payload": {...}}

// Create component set with variants
{"type": "createComponentSet", "payload": {...}}

// Add variants
{"type": "addVariant", "payload": {...}}

// Bind variables
{"type": "bindVariable", "target": "node-id", "payload": {...}}

// Configure auto layout
{"type": "setAutoLayout", "target": "node-id", "payload": {...}}
```

### File Structure
```
.claude/agents/component-creator.md
├── Header (name, category, description)
├── Atomic Design Reference
├── Component Patterns Library
│   ├── Buttons (Primary, Secondary, Tertiary, Icon)
│   ├── Inputs (Text, Select, Checkbox, Radio, Toggle)
│   ├── Cards (Basic, Media, Action)
│   ├── Navigation (Tabs, Breadcrumb, Pagination)
│   ├── Feedback (Toast, Modal, Alert)
│   └── Data Display (Table, List, Avatar)
├── Variant Architecture Guide
├── Auto Layout Best Practices
├── Token Binding Patterns
└── Quality Checklist
```

### Key Decisions to Make
1. **Variant naming convention**: `property=value` vs `Property/Value`
2. **Layer naming**: BEM-style vs semantic naming
3. **Token binding strategy**: Direct primitives vs semantic tokens
4. **Component documentation**: Inline descriptions vs external docs

---

## 2. Nomenclature Enforcer Sub-Agent

### Purpose
Enforce consistent naming conventions across layers, frames, pages, and components. Analyze and refactor existing designs to follow naming standards.

### Naming Standards

#### Page Naming
```
[Section] / [Feature] / [State]
────────────────────────────────
Examples:
├── Home / Hero / Desktop
├── Auth / Login / Error State
├── Product / Detail / Mobile
├── Components / Buttons
└── Handoff / Sprint 12
```

#### Frame Naming
```
[Component] / [Variant] / [State]
────────────────────────────────────
Examples:
├── Button / Primary / Default
├── Card / Product / Hover
├── Input / Text / Disabled
└── Modal / Confirmation / Active
```

#### Layer Naming
```
[type].[name]
or
[category]/[name]
────────────────────────────────────
Examples:
├── icon.chevron-right
├── text.heading
├── bg.primary
├── border.divider
└── Container/Content
```

### Workflow

```
1. ANALYZE
   │
   ├── Query current page structure
   ├── Get all frames: {"type": "getFrames"}
   ├── Identify naming violations
   └── Calculate compliance score
   │
2. PROPOSE
   │
   ├── Generate rename suggestions
   ├── Group by violation type
   ├── Prioritize by impact
   └── Present to user for approval
   │
3. APPLY
   │
   ├── Batch rename layers
   ├── Update frame names
   ├── Reorganize page structure
   └── Create naming documentation
   │
4. REPORT
   │
   ├── Before/after comparison
   ├── Remaining violations
   └── Compliance improvement
```

### Commands Used
```json
// Query all frames
{"type": "getFrames"}

// Query specific nodes
{"type": "query", "payload": {"queryType": "deep"}}

// Rename nodes
{"type": "renameNode", "target": "node-id", "payload": {"name": "new-name"}}

// Batch modify (for bulk renames)
{"type": "batchModify", "payload": {"modifications": [...]}}
```

### Naming Rules Configuration
```typescript
interface NamingRules {
  pages: {
    pattern: RegExp;
    separator: string;
    casing: 'PascalCase' | 'kebab-case' | 'Title Case';
  };
  frames: {
    pattern: RegExp;
    separator: string;
    casing: 'PascalCase' | 'kebab-case';
    requireState: boolean;
  };
  layers: {
    pattern: RegExp;
    prefixes: Record<string, string>; // e.g., { icon: 'icon.', text: 'text.' }
    casing: 'camelCase' | 'kebab-case';
  };
  components: {
    pattern: RegExp;
    separator: string;
    variantFormat: 'property=value' | 'Property/Value';
  };
}
```

### File Structure
```
.claude/agents/nomenclature-enforcer.md
├── Header (name, category, description)
├── Naming Standards
│   ├── Page Naming Rules
│   ├── Frame Naming Rules
│   ├── Layer Naming Rules
│   └── Component Naming Rules
├── Analysis Workflow
├── Violation Detection
├── Rename Operations
├── Compliance Reporting
└── Configuration Options
```

---

## 3. Prototype Architect Sub-Agent

### Purpose
Create interactive prototypes with proper flows, transitions, and micro-interactions. Integrates with external prototyping tools (Make, CLI LLMs) for complex logic.

### Expertise Areas
- Figma prototype interactions
- Flow design patterns
- Micro-interactions and animations
- Overlay and modal patterns
- Navigation architecture
- Device-specific behaviors
- Smart animate techniques
- External tool integration (Make, n8n)

### Prototype Types

| Type | Complexity | Use Case |
|------|------------|----------|
| **Click-through** | Low | Basic navigation, stakeholder review |
| **Interactive** | Medium | User testing, form validation |
| **High-fidelity** | High | Developer reference, production spec |
| **Connected** | Very High | Real data, API integration (via Make/CLI) |

### Workflow

```
1. FLOW MAPPING
   │
   ├── Identify user journey
   ├── Map screens to flows
   ├── Define entry/exit points
   └── Create flow diagram
   │
2. INTERACTION DESIGN
   │
   ├── Define trigger types (click, hover, drag)
   ├── Choose transition types
   ├── Set easing and duration
   └── Plan overlay behaviors
   │
3. IMPLEMENTATION
   │
   ├── Create prototype connections
   ├── Configure interactions
   ├── Set up overlays
   └── Add micro-interactions
   │
4. TESTING
   │
   ├── Test all flows
   ├── Verify transitions
   ├── Check edge cases
   └── Document flows
```

### Interaction Patterns
```
TRIGGERS:
├── On Click / On Tap
├── While Hovering
├── While Pressing
├── Key/Gamepad
├── Mouse Enter / Mouse Leave
├── Touch Down / Touch Up
└── After Delay

ACTIONS:
├── Navigate To
├── Open Overlay
├── Close Overlay
├── Swap Overlay
├── Back
├── Set Variable
├── Conditional
└── Open Link

TRANSITIONS:
├── Instant
├── Dissolve
├── Smart Animate
├── Move In / Move Out
├── Push
├── Slide In / Slide Out
└── Custom (spring, ease)
```

### External Tool Integration

#### Make (Integromat) Integration
For prototypes requiring real data or complex logic:

```
Make Webhook → Figma Plugin → Canvas Update
     │
     ├── Form submissions
     ├── Data visualization
     ├── Dynamic content
     └── API responses
```

#### CLI LLM Integration
For AI-powered prototype interactions:

```
User Input → CLI LLM → Response → Figma Update
     │
     ├── Chat interfaces
     ├── Smart suggestions
     ├── Dynamic content generation
     └── Personalization
```

### Commands Needed (Future)
```json
// Set prototype interactions (PLANNED)
{"type": "setReactions", "target": "node-id", "payload": {
  "reactions": [{
    "trigger": {"type": "ON_CLICK"},
    "action": {"type": "NAVIGATE", "destination": "frame-id", "transition": "SMART_ANIMATE"}
  }]
}}

// Create overlay
{"type": "createOverlay", "payload": {...}}

// Set transition
{"type": "setTransition", "payload": {...}}
```

### File Structure
```
.claude/agents/prototype-architect.md
├── Header (name, category, description)
├── Flow Mapping Guide
├── Interaction Patterns
│   ├── Navigation Flows
│   ├── Form Interactions
│   ├── Modal/Overlay Patterns
│   ├── Micro-interactions
│   └── Smart Animate Examples
├── External Integration
│   ├── Make Workflow Templates
│   └── CLI LLM Integration Guide
├── Testing Checklist
└── Handoff to Development
```

---

## 4. Engineering Handoff Sub-Agent

### Purpose
Prepare designs for developer handoff with accurate specs, measurements, code snippets, and asset exports. Creates documentation that bridges design and development.

### Expertise Areas
- Spacing and measurement extraction
- Color and typography spec generation
- CSS/Tailwind code generation
- Asset export configuration
- Annotation and documentation
- Responsive breakpoint documentation
- Animation spec documentation
- Accessibility requirements

### Handoff Deliverables

| Deliverable | Format | Purpose |
|-------------|--------|---------|
| **Spec Sheet** | Markdown/PDF | Component measurements, spacing |
| **Token Map** | JSON | Design token to CSS variable mapping |
| **Code Snippets** | CSS/Tailwind/React | Implementation reference |
| **Asset Manifest** | JSON | Export configurations, asset list |
| **Annotations** | Figma Comments | In-context developer notes |
| **Changelog** | Markdown | Design changes between versions |

### Workflow

```
1. ANALYZE
   │
   ├── Query selected components
   ├── Extract measurements
   ├── Identify tokens in use
   └── Detect responsive variants
   │
2. GENERATE SPECS
   │
   ├── Create measurement annotations
   ├── Generate spacing grid
   ├── Document color usage
   └── Extract typography specs
   │
3. EXPORT ASSETS
   │
   ├── Configure export settings
   ├── Batch export assets
   ├── Generate asset manifest
   └── Optimize for platforms
   │
4. DOCUMENT
   │
   ├── Create component spec sheet
   ├── Generate code snippets
   ├── Add implementation notes
   └── Create handoff package
```

### Spec Sheet Template
```markdown
# Component: [Name]

## Measurements
| Property | Value | Token |
|----------|-------|-------|
| Width | 320px | - |
| Height | auto | - |
| Padding | 16px | Space-M |
| Border Radius | 8px | Radius-M |

## Typography
| Element | Font | Size | Weight | Line Height |
|---------|------|------|--------|-------------|
| Title | Inter | 18px | 600 | 1.4 |
| Body | Inter | 14px | 400 | 1.5 |

## Colors
| Usage | Value | Token |
|-------|-------|-------|
| Background | #FFFFFF | Surface/Primary |
| Text | #1A1A1A | Foreground/Primary |
| Border | #E5E5E5 | Border/Default |

## States
- Default: [screenshot]
- Hover: [screenshot]
- Active: [screenshot]
- Disabled: [screenshot]

## Code Reference
```css
.component {
  padding: var(--space-m);
  border-radius: var(--radius-m);
  background: var(--surface-primary);
  color: var(--foreground-primary);
}
```

## Implementation Notes
- Use CSS Grid for layout
- Apply hover transition: 150ms ease
- Minimum touch target: 44px
```

### Commands Used
```json
// Query node properties
{"type": "query", "target": "node-id", "payload": {"queryType": "describe"}}

// Get auto layout settings
{"type": "getAutoLayout", "target": "node-id"}

// Export assets
{"type": "exportNode", "target": "node-id", "payload": {"format": "PNG", "scale": 2}}

// Batch export
{"type": "batchExport", "payload": {"nodes": [...], "formats": ["PNG", "SVG"]}}

// Get export settings
{"type": "getExportSettings", "target": "node-id"}

// Get variable bindings
{"type": "getVariables"}

// Analyze colors
{"type": "analyzeColors", "target": "node-id"}
```

### File Structure
```
.claude/agents/engineering-handoff.md
├── Header (name, category, description)
├── Spec Extraction Workflow
├── Measurement Templates
├── Code Generation
│   ├── CSS Output
│   ├── Tailwind Output
│   └── React/Vue Stubs
├── Asset Export Configuration
├── Documentation Templates
│   ├── Component Spec Sheet
│   ├── Token Mapping
│   └── Changelog Format
├── Platform-Specific Notes
│   ├── Web
│   ├── iOS
│   └── Android
└── Accessibility Checklist
```

---

## Implementation Plan

### Phase 1: Foundation (Week 1)

#### 1.1 Create Agent Files
- [ ] `.claude/agents/component-creator.md`
- [ ] `.claude/agents/nomenclature-enforcer.md`
- [ ] `.claude/agents/prototype-architect.md`
- [ ] `.claude/agents/engineering-handoff.md`

#### 1.2 Define Core Workflows
- [ ] Document each agent's process flow
- [ ] Create command sequences for common tasks
- [ ] Define validation checkpoints

### Phase 2: Component Creator (Week 2)

#### 2.1 Component Patterns Library
- [ ] Button patterns (all variants)
- [ ] Input patterns (text, select, checkbox, radio)
- [ ] Card patterns (basic, media, action)
- [ ] Navigation patterns (tabs, breadcrumb)

#### 2.2 Variant Architecture
- [ ] Define variant naming convention
- [ ] Create property templates
- [ ] Auto layout best practices

### Phase 3: Nomenclature Enforcer (Week 2)

#### 3.1 Naming Rules
- [ ] Page naming patterns
- [ ] Frame naming patterns
- [ ] Layer naming patterns
- [ ] Component naming patterns

#### 3.2 Analysis & Refactoring
- [ ] Violation detection logic
- [ ] Bulk rename operations
- [ ] Compliance reporting

### Phase 4: Prototype Architect (Week 3)

#### 4.1 Interaction Patterns
- [ ] Navigation flow templates
- [ ] Form interaction patterns
- [ ] Modal/overlay patterns
- [ ] Micro-interaction library

#### 4.2 External Integration
- [ ] Make webhook templates
- [ ] CLI LLM integration guide
- [ ] Data binding patterns

### Phase 5: Engineering Handoff (Week 3)

#### 5.1 Spec Generation
- [ ] Measurement extraction
- [ ] Token mapping
- [ ] Code snippet generation

#### 5.2 Export Automation
- [ ] Asset export workflows
- [ ] Documentation templates
- [ ] Platform-specific guides

### Phase 6: Integration & Testing (Week 4)

#### 6.1 Cross-Agent Integration
- [ ] Define agent handoff points
- [ ] Create orchestration workflows
- [ ] Test end-to-end flows

#### 6.2 Documentation
- [ ] Update main prompt files
- [ ] Create usage examples
- [ ] Add to README

---

## Agent File Template

Each agent file should follow this structure:

```markdown
| name | category | description |
|------|----------|-------------|
| [agent-name] | figma-bridge | [One-sentence description] |

[Detailed description and expertise]

## When to Use This Agent

[Specific use cases and triggers]

## Process

[Step-by-step workflow with numbered phases]

## Commands Reference

[Key commands with examples]

## Patterns Library

[Reusable patterns and templates]

## Quality Checklist

[Validation criteria before completion]

## Examples

[Concrete examples of agent output]
```

---

## Dependencies

### Required Commands (Existing)
- `query`, `getFrames`, `getComponents`
- `create`, `createComponent`, `createComponentSet`
- `setAutoLayout`, `getAutoLayout`
- `bindVariable`, `getVariables`
- `exportNode`, `batchExport`
- `renameNode`, `batchModify`

### Required Commands (Planned)
- `setReactions` - For prototype interactions
- `getReactions` - Query existing interactions
- `addAnnotation` - For handoff notes
- `getMeasurements` - Extract spacing/sizing
- `getCSSAsync` - Generate CSS from node

### External Integrations
- **Make/Integromat**: Webhook integration for dynamic prototypes
- **CLI LLM**: AI-powered interaction responses
- **Export Pipeline**: Asset optimization and delivery

---

## Success Metrics

| Agent | Metric | Target |
|-------|--------|--------|
| Component Creator | Component creation time | < 5 minutes for standard components |
| Nomenclature Enforcer | Naming compliance | > 95% adherence to standards |
| Prototype Architect | Flow coverage | 100% of user journeys prototyped |
| Engineering Handoff | Spec accuracy | Zero developer clarification requests |

---

## Next Steps

1. **Review this plan** with stakeholders
2. **Prioritize agents** based on immediate needs
3. **Create agent files** following the template
4. **Test workflows** with real design files
5. **Iterate** based on feedback

---

*Plan created: January 2025*
