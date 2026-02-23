import type { WorkflowDefinition } from '../workflow-schema.js';

export const figmaDocumentation: WorkflowDefinition = {
  id: 'figma-documentation',
  name: 'Design System Documentation',
  description: 'Creates visual documentation frames for design system variables. One frame per collection with color swatches, typography samples, spacing/radius visualizations, and labels.',
  systemInstruction: `You are a Documentation Specialist. You create visual style guide frames for design system variables in Figma.

CRITICAL RULES:
- DO NOT USE parentId — nest children in the children array
- FLAT STRUCTURE — section headers as direct TEXT children, not wrapped in extra FRAMEs
- ONE COMMAND PER FRAME — build entire frame with all nested children in a single create command
- USE AUTO-LAYOUT — all containers must use layoutMode + itemSpacing
- INCLUDE LABELS — every visual element needs a label with variable name and value
- LOAD FONTS FIRST — before creating text nodes with specific fonts

Frame positions: Primitive x=1500, Semantic x=2800, Tokens x=3700, Theme x=4700.`,
  requiredToolGroups: ['core', 'variables', 'text'],
  rules: [
    'DO NOT USE parentId — nest children in the children array',
    'Build entire doc frame with all nested children in a single create command',
    'Use auto-layout (VERTICAL root, HORIZONTAL swatch rows)',
    'Label every swatch with variable name and resolved hex value',
    'Show Light Mode and Dark Mode side by side for multi-mode collections',
    'Include typography samples at actual font sizes',
    'Visualize spacing with colored bars and radius with rounded rectangles',
  ],
  phases: [
    {
      id: 'gather',
      name: 'Gather Variables',
      steps: [
        {
          type: 'command',
          id: 'get-variables',
          description: 'Get all variables with values for documentation',
          command: 'getVariables',
          payload: { includeValues: true },
          outputKey: 'variables',
        },
        {
          type: 'command',
          id: 'load-font',
          description: 'Load Inter font for documentation text',
          command: 'loadFont',
          payload: { family: 'Inter', style: 'Regular' },
          outputKey: 'fontLoaded',
        },
      ],
    },
    {
      id: 'create-docs',
      name: 'Create Documentation Frames',
      requiresLlm: true,
      steps: [
        {
          type: 'llm-decision',
          id: 'build-documentation',
          description: 'Create visual documentation frames for each variable collection',
          prompt: 'Create visual documentation for all variable collections. Variables: ${variables}. Group by collection (Primitive, Semantic, Tokens, Theme). For each collection, create one FRAME with nested children: color swatches (RECTANGLE + TEXT label), typography samples (TEXT at actual sizes), spacing bars, radius samples. Use create command with full children array. Position frames apart: Primitive x=1500, Semantic x=2800, Tokens x=3700, Theme x=4700.',
          outputKey: 'documentationResult',
        },
      ],
    },
  ],
};
