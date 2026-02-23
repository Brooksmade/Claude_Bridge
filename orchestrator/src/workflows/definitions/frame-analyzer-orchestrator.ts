import type { WorkflowDefinition } from '../workflow-schema.js';

export const frameAnalyzerOrchestrator: WorkflowDefinition = {
  id: 'frame-analyzer-orchestrator',
  name: 'Design Health Analysis',
  description: 'Comprehensive design analysis: property extraction, consistency check, accessibility audit, naming audit, and health scoring.',
  systemInstruction: `You are the Frame Analyzer Orchestrator. You produce detailed health reports for existing designs.

Health score weights: Consistency 30%, Accessibility 30%, Naming 20%, Structure 20%.
Score interpretation: 90-100 Excellent, 80-89 Good, 70-79 Fair, 60-69 Poor, <60 Critical.`,
  requiredToolGroups: ['core', 'variables'],
  subWorkflows: [
    'consistency-checker',
    'accessibility-auditor',
    'nomenclature-enforcer',
  ],
  rules: [
    'Extract all properties before running analysis agents',
    'Use describe (not children) for fast structural overview',
    'Calculate weighted health score from all categories',
    'Prioritize recommendations by severity and effort',
    'Generate both JSON and markdown report formats',
  ],
  phases: [
    {
      id: 'extract',
      name: 'Phase 1: Extract Properties',
      steps: [
        {
          type: 'command',
          id: 'get-selection',
          description: 'Get frames to analyze',
          command: 'query',
          payload: { queryType: 'selection' },
          outputKey: 'selection',
        },
        {
          type: 'command',
          id: 'get-node-colors',
          description: 'Extract all colors from frame',
          command: 'getNodeColors',
          payload: { includeChildren: true, includeStrokes: true },
          target: '${config.targetNodeId}',
          outputKey: 'nodeColors',
        },
        {
          type: 'command',
          id: 'get-fonts',
          description: 'Get all fonts used',
          command: 'getUsedFonts',
          payload: {},
          outputKey: 'usedFonts',
        },
        {
          type: 'command',
          id: 'analyze-colors',
          description: 'Analyze color usage patterns',
          command: 'analyzeColors',
          payload: {},
          target: '${config.targetNodeId}',
          outputKey: 'colorAnalysis',
        },
        {
          type: 'command',
          id: 'describe-structure',
          description: 'Get structural overview',
          command: 'query',
          payload: { queryType: 'describe' },
          target: '${config.targetNodeId}',
          outputKey: 'structure',
        },
        {
          type: 'command',
          id: 'get-variables',
          description: 'Get design system for comparison',
          command: 'getVariables',
          payload: { includeValues: true },
          outputKey: 'variables',
        },
      ],
    },
    {
      id: 'analyze',
      name: 'Phase 2-4: Run Analysis',
      requiresLlm: true,
      steps: [
        {
          type: 'llm-decision',
          id: 'run-all-checks',
          description: 'Run consistency, accessibility, and naming checks',
          prompt: 'Analyze the frame comprehensively. Colors: ${nodeColors}. Fonts: ${usedFonts}. Color analysis: ${colorAnalysis}. Structure: ${structure}. Variables: ${variables}. Run: (1) Consistency: compare colors/fonts/spacing against design system, find unbound values and magic numbers. (2) Accessibility: check contrast ratios, touch targets, text sizes. (3) Naming: find generic names, casing issues. Score each category 0-100.',
          outputKey: 'analysisResults',
        },
      ],
    },
    {
      id: 'report',
      name: 'Phase 5: Generate Health Report',
      requiresLlm: true,
      steps: [
        {
          type: 'llm-decision',
          id: 'compile-report',
          description: 'Calculate health score and compile prioritized recommendations',
          prompt: 'Compile the design health report. Analysis: ${analysisResults}. Calculate weighted score: Consistency 30%, Accessibility 30%, Naming 20%, Structure 20%. Rate: 90+ Excellent, 80+ Good, 70+ Fair, 60+ Poor, <60 Critical. List prioritized recommendations by severity.',
          outputKey: 'healthReport',
        },
      ],
    },
  ],
};
