import type { WorkflowDefinition } from '../workflow-schema.js';

export const designSystemValidator: WorkflowDefinition = {
  id: 'design-system-validator',
  name: 'Design System Validation',
  description: 'Validates design system completeness, variable hierarchy, mode coverage, naming conventions, and aliasing. Outputs JSON or visual Figma annotation frames.',
  systemInstruction: `You are a Design System Validator. You audit design systems for completeness, consistency, and best practices.

Expected 4-collection structure:
- Primitive [ Level 1 ]: modes=[Value], min 50 variables
- Semantic [ Level 2 ]: modes=[Light, Dark], min 7 variables
- Tokens [ Level 3 ]: modes=[Light Mode, Dark Mode], min 10 variables
- Theme: modes=[Light, Dark], min 10 variables

Check: collection structure, variable naming (Group/Subgroup/Name, kebab-case), color scales (Gray 50-950), mode coverage, alias chains (Semantic→Primitive, Tokens→Semantic, Theme→Tokens).`,
  requiredToolGroups: ['core', 'variables'],
  rules: [
    'Validate all 4 collections exist with correct modes',
    'Check naming: Group/Subgroup/Name format, kebab-case, no spaces',
    'Verify complete Gray scale (50-950) and System colors (White, Black)',
    'Ensure all modes have values — no missing Light/Dark entries',
    'Validate alias chains: no circular references, correct direction',
    'Score 0-100: errors subtract 10, warnings subtract 3, info subtract 1',
  ],
  phases: [
    {
      id: 'fetch',
      name: 'Fetch Variables',
      steps: [
        {
          type: 'command',
          id: 'get-variables',
          description: 'Get all variables with values for validation',
          command: 'getVariables',
          payload: { includeValues: true },
          outputKey: 'variables',
        },
        {
          type: 'command',
          id: 'get-status',
          description: 'Quick status check of design system',
          command: 'getDesignSystemStatus',
          payload: {},
          outputKey: 'designSystemStatus',
        },
      ],
    },
    {
      id: 'validate',
      name: 'Run Validation Checks',
      requiresLlm: true,
      steps: [
        {
          type: 'llm-decision',
          id: 'run-validation',
          description: 'Validate collection structure, naming, completeness, modes, and aliasing',
          prompt: 'Validate the design system. Variables: ${variables}. Status: ${designSystemStatus}. Check: (1) 4 collections with correct modes, (2) naming conventions, (3) color scale completeness, (4) mode coverage, (5) alias chains. Use validateDesignSystem for built-in checks. Generate a score 0-100 and list all issues by severity (error/warning/info).',
          outputKey: 'validationReport',
        },
      ],
    },
  ],
};
