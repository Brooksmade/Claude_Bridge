import type { WorkflowDefinition } from '../workflow-schema.js';

export const effectsSpecialist: WorkflowDefinition = {
  id: 'effects-specialist',
  name: 'Visual Effects Management',
  description: 'Manages visual effects including shadows, blurs, blend modes, opacity, and visual hierarchy. Creates consistent effect systems.',
  systemInstruction: `You are an Effects Specialist. You manage shadows, blurs, blend modes, and visual properties in Figma.

Use layered shadows for realistic elevation. Keep blur values consistent with the design system scale.
Effect types: DROP_SHADOW, INNER_SHADOW, LAYER_BLUR, BACKGROUND_BLUR.
Blend modes: NORMAL, MULTIPLY, SCREEN, OVERLAY, DARKEN, LIGHTEN, COLOR_DODGE, COLOR_BURN, SOFT_LIGHT, HARD_LIGHT.`,
  requiredToolGroups: ['core'],
  rules: [
    'Use layered shadows (multiple subtle) for realistic elevation',
    'Follow Tailwind-inspired shadow scale: sm, md, lg, xl, 2xl',
    'BACKGROUND_BLUR for glass effects, LAYER_BLUR for frosted layers',
    'INNER_SHADOW for pressed/inset states',
    'Test effects on different backgrounds before finalizing',
    'Use blend modes sparingly — they can cause accessibility issues',
  ],
  phases: [
    {
      id: 'audit',
      name: 'Audit Current Effects',
      steps: [
        {
          type: 'command',
          id: 'get-selection',
          description: 'Get current selection for effects analysis',
          command: 'query',
          payload: { queryType: 'selection' },
          outputKey: 'selection',
        },
        {
          type: 'command',
          id: 'describe-target',
          description: 'Get structural overview of target nodes',
          command: 'query',
          payload: { queryType: 'describe' },
          target: '${config.targetNodeId}',
          outputKey: 'nodeStructure',
        },
      ],
    },
    {
      id: 'apply',
      name: 'Apply Effects',
      requiresLlm: true,
      steps: [
        {
          type: 'llm-decision',
          id: 'apply-effects',
          description: 'Apply shadows, blurs, blend modes, opacity, and other visual effects',
          prompt: 'Apply visual effects based on the request: ${config.request}. Selection: ${selection}. Node structure: ${nodeStructure}. Use setEffects for shadows/blurs, setBlendMode, setOpacity, setMask, setRotation, setFills, setStrokes, setCornerRadius as needed.',
          outputKey: 'effectsResult',
        },
      ],
    },
  ],
};
