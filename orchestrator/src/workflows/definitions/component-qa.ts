import type { WorkflowDefinition } from '../workflow-schema.js';

export const componentQa: WorkflowDefinition = {
  id: 'component-qa',
  name: 'Component Quality Assurance',
  description: 'Validates component quality including variant completeness, auto-layout configuration, token binding, naming conventions, and resizing behavior.',
  systemInstruction: `You are a Component QA Specialist. You validate Figma components for production readiness.

Quality checks with weights:
- Variant Completeness (25%): all states (default/hover/active/disabled/focus), sizes, types
- Auto Layout (20%): must have auto-layout, proper sizing modes, correct alignment
- Token Binding (25%): all colors, typography, spacing, radius bound to variables
- Naming (15%): component name convention, no generic layer names, property=value variants
- Accessibility (15%): touch target >= 44px, WCAG contrast, focus state variant`,
  requiredToolGroups: ['core', 'components', 'variables', 'layout'],
  rules: [
    'Check variant completeness: default, hover, active, disabled, focus states',
    'Verify auto-layout on all components — manual layout is an error',
    'All colors must be bound to variables — unbound is a warning',
    'No generic layer names (Frame N, Rectangle N)',
    'Touch targets must be >= 44px for interactive components',
    'Score weighted: variants 25%, layout 20%, tokens 25%, naming 15%, a11y 15%',
  ],
  phases: [
    {
      id: 'fetch',
      name: 'Fetch Component Data',
      steps: [
        {
          type: 'command',
          id: 'get-components',
          description: 'Get all components for QA',
          command: 'getComponents',
          payload: {},
          outputKey: 'components',
        },
        {
          type: 'command',
          id: 'get-variables',
          description: 'Get variables to check token binding',
          command: 'getVariables',
          payload: { includeValues: true },
          outputKey: 'variables',
        },
      ],
    },
    {
      id: 'inspect',
      name: 'Inspect Components',
      requiresLlm: true,
      steps: [
        {
          type: 'llm-decision',
          id: 'inspect-components',
          description: 'Deep-inspect each component for quality checks',
          prompt: 'Inspect components for QA. Components: ${components}. Variables: ${variables}. For each component, use getAutoLayout and query(describe) to check: (1) variant completeness, (2) auto-layout config, (3) token binding, (4) naming conventions, (5) accessibility. Use getComponentPropertyDefinitions to check exposed properties.',
          outputKey: 'inspectionData',
        },
      ],
    },
    {
      id: 'report',
      name: 'Generate QA Report',
      requiresLlm: true,
      steps: [
        {
          type: 'llm-decision',
          id: 'generate-report',
          description: 'Score each component and generate QA report',
          prompt: 'Generate component QA report from inspection: ${inspectionData}. Score each component 0-100 using weights: variants 25%, layout 20%, tokens 25%, naming 15%, accessibility 15%. List issues by severity and provide fix recommendations.',
          outputKey: 'qaReport',
        },
      ],
    },
  ],
};
