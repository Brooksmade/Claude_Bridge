/**
 * Workflow: Engineering Handoff
 * Pipeline: Analyze → Generate Specs → Generate Code → Generate Assets
 */

import type { WorkflowDefinition } from '../workflow-schema.js';

export const engineeringHandoff: WorkflowDefinition = {
  id: 'engineering-handoff',
  name: 'Generate Developer Handoff Package',
  description:
    'Analyze a Figma frame and generate comprehensive developer specs, CSS, token maps, and exportable assets.',
  systemInstruction: `You are an Engineering Handoff Specialist. You generate complete developer handoff packages from Figma designs.

For each component/frame:
1. Analyze structure, layout, colors, typography, spacing
2. Generate CSS/Tailwind code
3. Map design tokens to code variables
4. Export assets at 1x/2x/3x
5. Document component API (props, variants, states)`,
  requiredToolGroups: ['core', 'variables', 'styles'],
  rules: [
    'Use query with "describe" for fast structural overview',
    'Export smaller sections individually — large frames fail',
    'Include both CSS and Tailwind where applicable',
    'Map all variable bindings to CSS custom properties',
    'Generate accessibility notes (contrast ratios, ARIA hints)',
  ],
  phases: [
    {
      id: 'analyze',
      name: 'Analyze Design',
      steps: [
        {
          type: 'command',
          id: 'describe-frame',
          description: 'Get structural overview of the target frame',
          command: 'query',
          payload: { queryType: 'describe' },
          target: '${config.targetNodeId}',
          outputKey: 'frameDescription',
        },
        {
          type: 'command',
          id: 'get-css',
          description: 'Get CSS representation',
          command: 'getCss',
          payload: {},
          target: '${config.targetNodeId}',
          outputKey: 'cssOutput',
        },
        {
          type: 'command',
          id: 'get-colors',
          description: 'Get all colors used in the frame',
          command: 'getNodeColors',
          payload: {},
          target: '${config.targetNodeId}',
          outputKey: 'nodeColors',
        },
      ],
    },
    {
      id: 'tokens',
      name: 'Map Design Tokens',
      steps: [
        {
          type: 'command',
          id: 'get-variables',
          description: 'Get all design system variables for token mapping',
          command: 'getVariables',
          payload: { includeValues: true },
          outputKey: 'variables',
        },
        {
          type: 'command',
          id: 'get-styles',
          description: 'Get all local styles',
          command: 'getStyles',
          payload: {},
          outputKey: 'styles',
        },
      ],
    },
    {
      id: 'export',
      name: 'Export Assets',
      steps: [
        {
          type: 'command',
          id: 'export-png',
          description: 'Export frame as PNG at 1x',
          command: 'exportNode',
          payload: { format: 'PNG', scale: 1 },
          target: '${config.targetNodeId}',
          outputKey: 'exportPng1x',
        },
        {
          type: 'command',
          id: 'export-svg',
          description: 'Export frame as SVG',
          command: 'exportNode',
          payload: { format: 'SVG' },
          target: '${config.targetNodeId}',
          outputKey: 'exportSvg',
        },
      ],
    },
    {
      id: 'generate',
      name: 'Generate Handoff',
      requiresLlm: true,
      steps: [
        {
          type: 'llm-decision',
          id: 'generate-specs',
          description: 'Generate developer specs, CSS, and implementation notes from all collected data',
          prompt: `Generate a complete developer handoff package using the collected data:
- Frame structure: \${frameDescription}
- CSS: \${cssOutput}
- Colors: \${nodeColors}
- Variables: \${variables}
- Styles: \${styles}

Include: component specs, CSS code, Tailwind classes, token mappings, accessibility notes.`,
          outputKey: 'handoffPackage',
        },
      ],
    },
  ],
};
