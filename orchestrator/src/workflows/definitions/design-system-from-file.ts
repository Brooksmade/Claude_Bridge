/**
 * Workflow: Create Design System from Figma File
 * Pipeline: Extract → Detect Brand → Create System → Validate
 */

import type { WorkflowDefinition } from '../workflow-schema.js';

export const designSystemFromFile: WorkflowDefinition = {
  id: 'design-system-from-file',
  name: 'Create Design System from Figma File',
  description:
    'Extract design tokens from a Figma file, detect brand colors, create a 4-level variable hierarchy, and validate the result.',
  systemInstruction: `You are a Design System Specialist. You create complete design systems from Figma files in a structured pipeline.

Follow the workflow phases strictly. Each phase builds on the previous phase's output.
Use the extractDesignTokens command with scope "file" to scan all pages.
The createDesignSystem command handles the full 4-level hierarchy automatically.`,
  requiredToolGroups: ['design-system', 'variables'],
  rules: [
    'Always extract tokens before creating the design system',
    'Use scope "file" for comprehensive extraction',
    'Pass extractedTokens to createDesignSystem for conditional boilerplate',
    'Validate the design system after creation',
    'Use extended timeout (300s) for extractDesignTokens and createDesignSystem',
  ],
  phases: [
    {
      id: 'extract',
      name: 'Extract Design Tokens',
      steps: [
        {
          type: 'command',
          id: 'extract-tokens',
          description: 'Extract all design tokens from the Figma file',
          command: 'extractDesignTokens',
          payload: { scope: 'file', includeChildren: true },
          outputKey: 'extractedTokens',
          longRunning: true,
        },
      ],
    },
    {
      id: 'detect',
      name: 'Detect Brand Colors',
      steps: [
        {
          type: 'transform',
          id: 'detect-brand',
          description: 'Detect primary/secondary/tertiary brand colors from extracted tokens',
          function: 'detectBrandColor',
          input: { colors: '${extractedTokens.data.colors.all}' },
          outputKey: 'brandColors',
        },
      ],
    },
    {
      id: 'create',
      name: 'Create Design System',
      requiresLlm: true,
      steps: [
        {
          type: 'llm-decision',
          id: 'choose-principle',
          description: 'Ask user which organizing principle to use',
          prompt: 'Which organizing principle should we use? Options: four-level (default), three-level, two-level, material-design, tailwind',
          options: ['four-level', 'three-level', 'two-level', 'material-design', 'tailwind'],
          outputKey: 'organizingPrinciple',
        },
        {
          type: 'command',
          id: 'create-system',
          description: 'Create the complete design system with variable hierarchy',
          command: 'createDesignSystem',
          payload: {
            brandColors: {
              primary: '${brandColors.primary}',
              secondary: '${brandColors.secondary}',
              tertiary: '${brandColors.tertiary}',
            },
            includeBoilerplate: true,
            organizingPrinciple: '${organizingPrinciple}',
          },
          outputKey: 'designSystem',
          longRunning: true,
        },
      ],
    },
    {
      id: 'validate',
      name: 'Validate Design System',
      steps: [
        {
          type: 'command',
          id: 'validate',
          description: 'Validate the created design system',
          command: 'validateDesignSystem',
          payload: {},
          outputKey: 'validation',
        },
      ],
    },
  ],
};
