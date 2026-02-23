import type { WorkflowDefinition } from '../workflow-schema.js';

export const designToDevOrchestrator: WorkflowDefinition = {
  id: 'design-to-dev-orchestrator',
  name: 'Design-to-Development Pipeline',
  description: 'Master pipeline: consistency check → design system → component library → accessibility audit → engineering handoff for complete production handoff.',
  systemInstruction: `You are the Design-to-Dev Orchestrator, the master coordinator for complete design-to-development handoff.

Pipeline: Pre-Flight Analysis → Design System → Component Library → Accessibility Audit → Engineering Handoff.
Phase 1-2 are critical (must pass). Phases 3-5 are non-critical (continue with warnings).
If design system already exists, skip creation and do validation only.
If components already exist, skip creation and do standardization only.`,
  requiredToolGroups: ['core', 'variables', 'styles', 'components', 'layout'],
  subWorkflows: [
    'consistency-checker',
    'design-system-orchestrator',
    'component-library-orchestrator',
    'accessibility-auditor',
    'engineering-handoff',
  ],
  rules: [
    'Run pre-flight analysis before any creation steps',
    'Design system creation is critical — stop if it fails',
    'Component library is non-critical — continue with warning',
    'Always run accessibility audit before handoff',
    'Generate comprehensive final report with all phase scores',
    'Overall readiness = weighted average of all phase scores',
  ],
  phases: [
    {
      id: 'preflight',
      name: 'Pre-Flight Check',
      steps: [
        {
          type: 'command',
          id: 'get-file-info',
          description: 'Get file metadata',
          command: 'getFileInfo',
          payload: {},
          outputKey: 'fileInfo',
        },
        {
          type: 'command',
          id: 'get-selection',
          description: 'Get current selection',
          command: 'query',
          payload: { queryType: 'selection' },
          outputKey: 'selection',
        },
        {
          type: 'command',
          id: 'check-system',
          description: 'Check existing design system',
          command: 'getDesignSystemStatus',
          payload: {},
          outputKey: 'designSystemStatus',
        },
        {
          type: 'command',
          id: 'get-components',
          description: 'Check existing components',
          command: 'getComponents',
          payload: {},
          outputKey: 'existingComponents',
        },
      ],
    },
    {
      id: 'analyze',
      name: 'Phase 1: Pre-Flight Analysis',
      requiresLlm: true,
      steps: [
        {
          type: 'llm-decision',
          id: 'run-consistency',
          description: 'Scan for inconsistencies, magic numbers, unbound values',
          prompt: 'Run consistency analysis. Selection: ${selection}. Use getNodeColors, getUsedFonts, getVariables to gather data. Find unbound colors, off-palette values, magic numbers, naming violations. Determine scope of work.',
          outputKey: 'analysisResult',
        },
      ],
    },
    {
      id: 'design-system',
      name: 'Phase 2: Design System',
      requiresLlm: true,
      steps: [
        {
          type: 'llm-decision',
          id: 'create-or-validate',
          description: 'Create or validate design system based on pre-flight findings',
          prompt: 'Handle design system. Status: ${designSystemStatus}. Analysis: ${analysisResult}. If no system: create with createDesignSystem, bind with autoBindByRole + bindMatchingColors, create styles. If exists: validate with validateDesignSystem. Report score.',
          outputKey: 'designSystemResult',
        },
      ],
    },
    {
      id: 'components',
      name: 'Phase 3: Component Library',
      requiresLlm: true,
      steps: [
        {
          type: 'llm-decision',
          id: 'handle-components',
          description: 'Create or standardize components',
          prompt: 'Handle components. Existing: ${existingComponents}. If none: identify componentizable patterns and create library. If exists: standardize layout, naming, run QA. Score components 0-100.',
          outputKey: 'componentResult',
        },
      ],
    },
    {
      id: 'accessibility',
      name: 'Phase 4: Accessibility Audit',
      requiresLlm: true,
      steps: [
        {
          type: 'llm-decision',
          id: 'run-a11y-audit',
          description: 'WCAG AA compliance check on all frames',
          prompt: 'Run accessibility audit. Use analyzeColors for contrast, query(describe) for structure. Check: contrast ratios (4.5:1 normal, 3:1 large), touch targets (44px), text sizes (12px min), heading hierarchy. Score 0-100.',
          outputKey: 'a11yResult',
        },
      ],
    },
    {
      id: 'handoff',
      name: 'Phase 5: Engineering Handoff',
      requiresLlm: true,
      steps: [
        {
          type: 'llm-decision',
          id: 'generate-handoff',
          description: 'Generate complete developer handoff package',
          prompt: 'Generate handoff. Design system: ${designSystemResult}. Components: ${componentResult}. Accessibility: ${a11yResult}. Extract specs, generate CSS/Tailwind, map tokens, export assets. Compile comprehensive final report with all phase scores and overall readiness rating.',
          outputKey: 'handoffResult',
        },
      ],
    },
  ],
};
