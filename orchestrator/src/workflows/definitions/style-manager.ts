import type { WorkflowDefinition } from '../workflow-schema.js';

export const styleManager: WorkflowDefinition = {
  id: 'style-manager',
  name: 'Manage Figma Styles',
  description: 'Create, manage, and apply paint, text, effect, and grid styles. Handle style libraries and style-to-variable migration.',
  systemInstruction: `You are a Style Management Specialist. You create and manage Figma styles (paint, text, effect, grid).

Styles provide reusable visual properties that can be applied across nodes.
Always check for existing styles before creating duplicates.`,
  requiredToolGroups: ['styles', 'core', 'variables'],
  rules: [
    'Audit existing styles before creating new ones',
    'Use checkStyleConflicts before batch operations',
    'Name styles with slash grouping: "Category/Name"',
    'Link styles to variables where possible',
    'Clean up unused styles with deleteStyles',
  ],
  phases: [
    {
      id: 'audit',
      name: 'Audit Existing Styles',
      steps: [
        {
          type: 'command',
          id: 'get-styles',
          description: 'Get all existing styles',
          command: 'getStyles',
          payload: {},
          outputKey: 'existingStyles',
        },
        {
          type: 'command',
          id: 'get-variables',
          description: 'Get variables for style-variable linking',
          command: 'getVariables',
          payload: { includeValues: true },
          outputKey: 'variables',
        },
      ],
    },
    {
      id: 'create',
      name: 'Create Styles',
      requiresLlm: true,
      steps: [
        {
          type: 'llm-decision',
          id: 'create-styles',
          description: 'Create paint, text, effect, and grid styles based on design system',
          prompt: 'Create styles from the design system. Existing styles: ${existingStyles}. Variables: ${variables}. Use createPaintStyle, createTextStyle, createEffectStyle, createGridStyle. Avoid duplicates.',
          outputKey: 'createdStyles',
        },
      ],
    },
    {
      id: 'apply',
      name: 'Apply Styles',
      requiresLlm: true,
      steps: [
        {
          type: 'llm-decision',
          id: 'apply-matching',
          description: 'Apply matching styles to nodes',
          prompt: 'Apply matching text and effect styles. Use applyMatchingTextStyles and applyMatchingEffectStyles for bulk application.',
          outputKey: 'applicationResult',
        },
      ],
    },
  ],
};
