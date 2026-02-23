import type { WorkflowDefinition } from '../workflow-schema.js';

export const consistencyChecker: WorkflowDefinition = {
  id: 'consistency-checker',
  name: 'Design Consistency Check',
  description: 'Detects design inconsistencies including magic numbers, unbound values, naming violations, spacing irregularities, and similar-but-different components.',
  systemInstruction: `You are a Consistency Checker. You detect design system deviations and "magic numbers."

Check categories:
- Colors: unbound colors, off-palette colors, similar-but-different colors
- Typography: unbound fonts, off-scale sizes, mixed font families
- Spacing: magic numbers not in spacing scale, inconsistent gaps/padding
- Radius: off-scale corner radius values
- Naming: generic names (Frame 1, Rectangle 2), inconsistent casing
- Components: near-duplicates, detached instances, frequent overrides`,
  requiredToolGroups: ['core', 'variables'],
  rules: [
    'Build lookup maps from design system variables before checking',
    'Flag unbound-but-valid colors as warnings, off-palette as errors',
    'Find similar colors (distance < 10) and suggest consolidation',
    'Check spacing against scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96',
    'Flag all generic auto-names (Frame N, Rectangle N, etc.)',
    'Score 0-100 based on bound/unbound ratios and violation counts',
  ],
  phases: [
    {
      id: 'extract',
      name: 'Extract Design Data',
      steps: [
        {
          type: 'command',
          id: 'get-node-colors',
          description: 'Get all colors from the target frame',
          command: 'getNodeColors',
          payload: { includeChildren: true, includeStrokes: true },
          target: '${config.targetNodeId}',
          outputKey: 'nodeColors',
        },
        {
          type: 'command',
          id: 'get-used-fonts',
          description: 'Get all fonts used in the frame',
          command: 'getUsedFonts',
          payload: {},
          outputKey: 'usedFonts',
        },
        {
          type: 'command',
          id: 'get-variables',
          description: 'Get design system variables for comparison',
          command: 'getVariables',
          payload: { includeValues: true },
          outputKey: 'variables',
        },
        {
          type: 'command',
          id: 'describe-frame',
          description: 'Get structural overview for naming and spacing checks',
          command: 'query',
          payload: { queryType: 'describe' },
          target: '${config.targetNodeId}',
          outputKey: 'frameStructure',
        },
      ],
    },
    {
      id: 'check',
      name: 'Run Consistency Checks',
      requiresLlm: true,
      steps: [
        {
          type: 'llm-decision',
          id: 'run-checks',
          description: 'Check colors, typography, spacing, radius, naming against design system',
          prompt: 'Check design consistency. Colors: ${nodeColors}. Fonts: ${usedFonts}. Variables: ${variables}. Structure: ${frameStructure}. Compare all values against design system. Find: (1) unbound colors, (2) off-palette colors, (3) similar colors, (4) off-scale typography, (5) magic number spacing, (6) generic names. Score 0-100 and list all deviations with suggestions.',
          outputKey: 'consistencyReport',
        },
      ],
    },
  ],
};
