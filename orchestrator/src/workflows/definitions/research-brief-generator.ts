import type { WorkflowDefinition } from '../workflow-schema.js';

export const researchBriefGenerator: WorkflowDefinition = {
  id: 'research-brief-generator',
  name: 'Research Brief Generation',
  description: 'Transforms research queries into structured, actionable research briefs with specific questions, keywords, source preferences, and success criteria.',
  systemInstruction: `You are the Research Brief Generator. You transform broad research questions into comprehensive, structured research plans.

Output a JSON brief with: main_question (first person), 3-5 sub_questions, keywords (primary/secondary/exclude), source_preferences (academic/news/technical/data with weights), scope (temporal/geographic/depth), success criteria.

Decision framework: technical queries → emphasize academic sources; current events → prioritize news; comparative queries → structure around comparison elements.`,
  requiredToolGroups: [],
  rules: [
    'Main question must be in first person',
    'Generate 3-5 specific, independently answerable sub-questions',
    'Include primary, secondary, and exclusion keywords',
    'Weight source preferences by query type',
    'Define temporal, geographic, and depth scope',
    'Set measurable success criteria',
  ],
  phases: [
    {
      id: 'generate',
      name: 'Generate Research Brief',
      requiresLlm: true,
      steps: [
        {
          type: 'llm-decision',
          id: 'create-brief',
          description: 'Analyze query and generate structured research brief',
          prompt: 'Transform this research query into a structured brief: ${config.query}. Analyze: primary objective, implicit assumptions, scope boundaries. Generate: main_question (first person), 3-5 sub_questions, keywords {primary, secondary, exclude}, source_preferences {academic, news, technical, data} with weights, scope {temporal, geographic, depth}, success_criteria, output_preference (comparison/timeline/analysis/summary).',
          outputKey: 'researchBrief',
        },
      ],
    },
  ],
};
