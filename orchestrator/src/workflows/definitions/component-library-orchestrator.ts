import type { WorkflowDefinition } from '../workflow-schema.js';

export const componentLibraryOrchestrator: WorkflowDefinition = {
  id: 'component-library-orchestrator',
  name: 'Component Library Pipeline',
  description: 'Coordinates component library creation. Chains component-creator, layout-master, nomenclature-enforcer, component-qa, and engineering-handoff.',
  systemInstruction: `You are the Component Library Orchestrator. You coordinate end-to-end component library creation from design to production-ready, documented components.

Pipeline: Create Components → Configure Layout → Enforce Naming → Quality Check → Generate Handoff.
Requires a design system to exist first (for token binding).`,
  requiredToolGroups: ['core', 'components', 'variables', 'layout'],
  subWorkflows: [
    'component-creator',
    'layout-master',
    'nomenclature-enforcer',
    'component-qa',
    'engineering-handoff',
  ],
  rules: [
    'Verify design system exists before starting — needed for token binding',
    'Create components with variant matrices: Size x Type x State',
    'Apply auto-layout to all components before naming',
    'Run QA after naming — quality score must meet threshold',
    'Generate handoff only if QA passes (score >= 80)',
  ],
  phases: [
    {
      id: 'preflight',
      name: 'Pre-Flight Check',
      steps: [
        {
          type: 'command',
          id: 'get-components',
          description: 'Check for existing components',
          command: 'getComponents',
          payload: {},
          outputKey: 'existingComponents',
        },
        {
          type: 'command',
          id: 'check-system',
          description: 'Verify design system exists',
          command: 'getDesignSystemStatus',
          payload: {},
          outputKey: 'designSystemStatus',
        },
      ],
    },
    {
      id: 'create',
      name: 'Phase 1: Create Components',
      requiresLlm: true,
      steps: [
        {
          type: 'llm-decision',
          id: 'create-components',
          description: 'Build component structure with variants and properties',
          prompt: 'Create components based on requirements: ${config.componentSpec}. Existing: ${existingComponents}. Design system: ${designSystemStatus}. Use createComponent, createComponentSet, addVariant. Bind to design tokens. Follow atomic design: atoms → molecules → organisms.',
          outputKey: 'creationResult',
        },
      ],
    },
    {
      id: 'layout',
      name: 'Phase 2: Configure Layout',
      requiresLlm: true,
      steps: [
        {
          type: 'llm-decision',
          id: 'configure-layout',
          description: 'Apply auto-layout and constraints to all components',
          prompt: 'Configure layout on all created components: ${creationResult}. Use setAutoLayout, setLayoutChild, setConstraints, setSizeConstraints. Ensure proper sizing modes (HUG for content-driven, FIXED where appropriate).',
          outputKey: 'layoutResult',
        },
      ],
    },
    {
      id: 'naming',
      name: 'Phase 3: Enforce Naming',
      requiresLlm: true,
      steps: [
        {
          type: 'llm-decision',
          id: 'enforce-naming',
          description: 'Audit and standardize all layer and component names',
          prompt: 'Audit naming on all components. Use getFrames and getComponents to get all nodes. Rename generic names with renameNode. Components: "Type/property=value". Layers: descriptive PascalCase. Report violations fixed.',
          outputKey: 'namingResult',
        },
      ],
    },
    {
      id: 'qa',
      name: 'Phase 4: Quality Check',
      requiresLlm: true,
      steps: [
        {
          type: 'llm-decision',
          id: 'run-qa',
          description: 'Validate component quality: variants, layout, tokens, naming, a11y',
          prompt: 'Run QA on all components. Check: variant completeness (all states?), auto-layout config, token binding, naming compliance, accessibility (44px targets). Score each component 0-100 using weights: variants 25%, layout 20%, tokens 25%, naming 15%, a11y 15%.',
          outputKey: 'qaResult',
        },
      ],
    },
    {
      id: 'handoff',
      name: 'Phase 5: Generate Handoff',
      requiresLlm: true,
      steps: [
        {
          type: 'llm-decision',
          id: 'generate-handoff',
          description: 'Extract specs, generate code, export assets',
          prompt: 'Generate engineering handoff for all components. QA results: ${qaResult}. Use exportNode for assets, extractDesignTokens for token mapping. Generate CSS/Tailwind code snippets. Compile final report with all phase results.',
          outputKey: 'handoffResult',
        },
      ],
    },
  ],
};
