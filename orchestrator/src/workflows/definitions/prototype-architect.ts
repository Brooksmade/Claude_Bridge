import type { WorkflowDefinition } from '../workflow-schema.js';

export const prototypeArchitect: WorkflowDefinition = {
  id: 'prototype-architect',
  name: 'Interactive Prototype Design',
  description: 'Creates interactive prototypes with flows, transitions, and micro-interactions. Designs navigation patterns, modal behaviors, and complex interaction sequences.',
  systemInstruction: `You are the Prototype Architect. You create interactive design prototypes that communicate user flows, transitions, and micro-interactions.

Prototype types: Click-through (low), Interactive (medium), High-fidelity (high), Connected (very high).
Triggers: On Click, On Hover, While Pressing, After Delay, Mouse Enter/Leave, Key Press.
Actions: Navigate To, Open Overlay, Close Overlay, Swap Overlay, Back, Set Variable, Conditional.
Transitions: Instant (0ms), Dissolve (200ms), Smart Animate (300ms), Move In/Out (300ms), Push (300ms), Slide (250ms).
Easing: Linear, Ease In, Ease Out, Ease In Out, Custom Spring.

Smart Animate requires matching layer names between frames.`,
  requiredToolGroups: ['core', 'components', 'layout'],
  rules: [
    'Map all user flows before building screens',
    'Create separate frames for each state (default, hover, active, error)',
    'Use consistent layer names for Smart Animate to work',
    'Document every interaction: trigger → action → transition → duration → easing',
    'Include error states, loading states, and empty states',
    'Test all paths including back navigation and modal dismissal',
  ],
  phases: [
    {
      id: 'plan',
      name: 'Phase 1: Flow Mapping',
      requiresLlm: true,
      steps: [
        {
          type: 'llm-decision',
          id: 'map-flows',
          description: 'Identify screens, decision points, and flow connections',
          prompt: 'Map the prototype flow. Request: ${config.request}. Identify: all screens/states, entry/exit points, decision branches. Create flow diagram. List all needed frames and their relationships (trigger → action → transition).',
          outputKey: 'flowMap',
        },
      ],
    },
    {
      id: 'build',
      name: 'Phase 2: Build Prototype Frames',
      requiresLlm: true,
      steps: [
        {
          type: 'llm-decision',
          id: 'create-frames',
          description: 'Create all prototype frames with proper layer naming for Smart Animate',
          prompt: 'Build prototype frames based on flow: ${flowMap}. Use create for each frame state. Clone frames for variations (hover, active, error). Ensure matching layer names between state variants for Smart Animate. Use setAutoLayout, setConstraints for responsive behavior. Create component variants for interactive elements. Organize on a Prototype page.',
          outputKey: 'prototypeResult',
        },
      ],
    },
    {
      id: 'document',
      name: 'Phase 3: Document Interactions',
      requiresLlm: true,
      steps: [
        {
          type: 'llm-decision',
          id: 'document-prototype',
          description: 'Generate interaction specs and flow documentation',
          prompt: 'Document the prototype. Frames: ${prototypeResult}. Flow: ${flowMap}. Generate: (1) Flow specification with all screen transitions, (2) Interaction spec per component (triggers, actions, transitions, durations), (3) Quality checklist status. Include all paths, edge cases, and animation details.',
          outputKey: 'documentation',
        },
      ],
    },
  ],
};
