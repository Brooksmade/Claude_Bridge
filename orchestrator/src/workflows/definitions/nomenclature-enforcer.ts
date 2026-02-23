import type { WorkflowDefinition } from '../workflow-schema.js';

export const nomenclatureEnforcer: WorkflowDefinition = {
  id: 'nomenclature-enforcer',
  name: 'Enforce Naming Conventions',
  description: 'Audit and standardize layer, frame, page, and component naming conventions across a Figma file.',
  systemInstruction: `You are a Naming Convention Specialist. You audit and fix layer names in Figma files.

Naming rules:
- Components: "ComponentType/property=value" (e.g., "Button/Size=Large, Type=Primary")
- Frames: PascalCase descriptive names
- Layers: No "Frame 1", "Rectangle 2" auto-names
- Pages: Descriptive with emoji prefixes (optional)`,
  requiredToolGroups: ['core', 'components'],
  rules: [
    'Never rename without showing proposed changes first',
    'Preserve intentional naming patterns',
    'Components must use slash + property=value format',
    'Replace all auto-generated names (Frame N, Rectangle N, etc.)',
    'Report total violations and fixes applied',
  ],
  phases: [
    {
      id: 'audit',
      name: 'Audit Names',
      steps: [
        {
          type: 'command',
          id: 'get-frames',
          description: 'Get all top-level frames',
          command: 'getFrames',
          payload: {},
          outputKey: 'frames',
        },
        {
          type: 'command',
          id: 'get-components',
          description: 'Get all components for naming audit',
          command: 'getComponents',
          payload: {},
          outputKey: 'components',
        },
      ],
    },
    {
      id: 'analyze',
      name: 'Analyze Violations',
      requiresLlm: true,
      steps: [
        {
          type: 'llm-decision',
          id: 'find-violations',
          description: 'Identify naming violations and propose fixes',
          prompt: 'Audit naming conventions. Frames: ${frames}. Components: ${components}. Identify auto-names, convention violations, and propose standardized names.',
          outputKey: 'violations',
        },
      ],
    },
    {
      id: 'fix',
      name: 'Apply Fixes',
      requiresLlm: true,
      steps: [
        {
          type: 'llm-decision',
          id: 'apply-renames',
          description: 'Apply approved naming fixes using renameNode',
          prompt: 'Apply the naming fixes: ${violations}. Use renameNode for each violation. Report total fixes applied.',
          outputKey: 'renameResult',
        },
      ],
    },
  ],
};
