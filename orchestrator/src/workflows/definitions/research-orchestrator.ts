import type { WorkflowDefinition } from '../workflow-schema.js';

export const researchOrchestrator: WorkflowDefinition = {
  id: 'research-orchestrator',
  name: 'Research Project Coordinator',
  description: 'Coordinates comprehensive research projects using Open Deep Research methodology. Manages query clarification, brief generation, research execution, synthesis, and reporting.',
  systemInstruction: `You are the Research Orchestrator. You coordinate comprehensive research projects using structured methodology.

Pipeline: Query Clarification → Research Brief → Strategy Development → Parallel Research → Synthesis → Final Report.
Each phase has quality gates — ensure standards are met before proceeding.
Use JSON-formatted inter-agent communication for status tracking.`,
  requiredToolGroups: [],
  subWorkflows: [
    'research-brief-generator',
    'research-synthesizer',
  ],
  rules: [
    'Clarify ambiguous queries before proceeding',
    'Generate structured research brief with sub-questions',
    'Identify appropriate research specialists for the topic',
    'Coordinate parallel research threads when possible',
    'Synthesize all findings before generating final report',
    'Include full source traceability in outputs',
  ],
  phases: [
    {
      id: 'clarify',
      name: 'Phase 1: Query Clarification',
      requiresLlm: true,
      steps: [
        {
          type: 'llm-decision',
          id: 'clarify-query',
          description: 'Analyze and clarify the research query',
          prompt: 'Analyze the research query: ${config.query}. Identify: primary objective, implicit assumptions, scope boundaries, expected outcome type. If ambiguous, list clarifying questions. Output refined query.',
          outputKey: 'clarifiedQuery',
        },
      ],
    },
    {
      id: 'plan',
      name: 'Phase 2: Research Brief',
      requiresLlm: true,
      steps: [
        {
          type: 'llm-decision',
          id: 'generate-brief',
          description: 'Create structured research brief with sub-questions and keyword strategy',
          prompt: 'Generate research brief from: ${clarifiedQuery}. Include: main question, 3-5 sub-questions, keyword sets (primary/secondary/exclude), source preferences (academic/news/technical/data with weights), scope (temporal/geographic/depth), success criteria.',
          outputKey: 'researchBrief',
        },
      ],
    },
    {
      id: 'research',
      name: 'Phase 3: Execute Research',
      requiresLlm: true,
      steps: [
        {
          type: 'llm-decision',
          id: 'execute-research',
          description: 'Conduct research across all sub-questions',
          prompt: 'Execute research based on brief: ${researchBrief}. For each sub-question, gather evidence from appropriate sources. Track findings by theme. Maintain source attributions.',
          outputKey: 'researchFindings',
        },
      ],
    },
    {
      id: 'synthesize',
      name: 'Phase 4: Synthesize & Report',
      requiresLlm: true,
      steps: [
        {
          type: 'llm-decision',
          id: 'synthesize-report',
          description: 'Synthesize findings into comprehensive report',
          prompt: 'Synthesize all findings: ${researchFindings}. Group by theme, identify patterns, highlight contradictions, assess evidence quality, identify knowledge gaps. Generate comprehensive report with executive summary, key findings, recommendations, and full citations.',
          outputKey: 'finalReport',
        },
      ],
    },
  ],
};
