import type { WorkflowDefinition } from '../workflow-schema.js';

export const designSystemOrchestrator: WorkflowDefinition = {
  id: 'design-system-orchestrator',
  name: 'Complete Design System Pipeline',
  description: 'Coordinates end-to-end design system creation. Chains extract+create, bind variables, create styles, generate documentation, and validate.',
  systemInstruction: `You are the Design System Orchestrator. You coordinate the complete pipeline from extracting colors from frames to producing validated, documented design systems.

Pipeline: Extract & Create → Bind Variables → Create Styles → Generate Documentation → Validate.
Each phase builds on the output of the previous phase.
If a design system already exists, offer to skip creation and go straight to binding/validation.`,
  requiredToolGroups: ['core', 'variables', 'styles'],
  subWorkflows: [
    'design-system-from-file',
    'variable-binding',
    'style-manager',
    'figma-documentation',
    'design-system-validator',
  ],
  rules: [
    'Check for existing design system before creating — avoid duplicates',
    'Each phase must complete successfully before proceeding',
    'Save progress after each phase for resume capability',
    'Phases 3-5 are non-critical — can continue with warnings',
    'Generate a final summary report with all phase results',
  ],
  phases: [
    {
      id: 'preflight',
      name: 'Pre-Flight Check',
      steps: [
        {
          type: 'command',
          id: 'get-selection',
          description: 'Verify a frame is selected',
          command: 'query',
          payload: { queryType: 'selection' },
          outputKey: 'selection',
        },
        {
          type: 'command',
          id: 'check-existing',
          description: 'Check if design system already exists',
          command: 'getDesignSystemStatus',
          payload: {},
          outputKey: 'existingSystem',
        },
      ],
    },
    {
      id: 'create',
      name: 'Phase 1: Extract & Create Design System',
      requiresLlm: true,
      steps: [
        {
          type: 'llm-decision',
          id: 'extract-and-create',
          description: 'Extract colors from frames and create 4-level design system',
          prompt: 'Create the design system. Selection: ${selection}. Existing system: ${existingSystem}. If no system exists, use extractDesignTokens then createDesignSystem. If it exists, skip to validation. Output collection IDs and variable counts.',
          outputKey: 'creationResult',
        },
      ],
    },
    {
      id: 'bind',
      name: 'Phase 2: Bind Variables',
      requiresLlm: true,
      steps: [
        {
          type: 'llm-decision',
          id: 'bind-variables',
          description: 'Bind design system variables to frame elements',
          prompt: 'Bind variables to the selected frame elements. Creation result: ${creationResult}. Use autoBindByRole for semantic binding, then bindMatchingColors for exact matches. Report bound and unbound counts.',
          outputKey: 'bindingResult',
        },
      ],
    },
    {
      id: 'styles',
      name: 'Phase 3: Create Figma Styles',
      requiresLlm: true,
      steps: [
        {
          type: 'llm-decision',
          id: 'create-styles',
          description: 'Create paint, text, and effect styles from variables',
          prompt: 'Create Figma styles from the design system variables. Use createPaintStyle, createTextStyle, createEffectStyle. Link to variables where possible. Avoid duplicates.',
          outputKey: 'stylesResult',
        },
      ],
    },
    {
      id: 'document',
      name: 'Phase 4: Generate Documentation',
      requiresLlm: true,
      steps: [
        {
          type: 'llm-decision',
          id: 'generate-docs',
          description: 'Create visual documentation frames for each collection',
          prompt: 'Create documentation frames. Use getVariables to get all variables, then create visual documentation with color swatches, typography samples, and spacing visualizations. Position: Primitive x=1500, Semantic x=2800, Tokens x=3700, Theme x=4700.',
          outputKey: 'docsResult',
        },
      ],
    },
    {
      id: 'validate',
      name: 'Phase 5: Validate Design System',
      requiresLlm: true,
      steps: [
        {
          type: 'llm-decision',
          id: 'validate-system',
          description: 'Run validation checks on the completed design system',
          prompt: 'Validate the design system using validateDesignSystem. Check: 4 collections, mode coverage, naming, alias chains. Score 0-100. Compile final report with all phase results: ${creationResult}, ${bindingResult}, ${stylesResult}, ${docsResult}.',
          outputKey: 'validationResult',
        },
      ],
    },
  ],
};
