import type { WorkflowDefinition } from '../workflow-schema.js';

export const researchSynthesizer: WorkflowDefinition = {
  id: 'research-synthesizer',
  name: 'Research Synthesis',
  description: 'Consolidates findings from multiple research sources into unified analysis. Merges diverse perspectives, identifies patterns, and creates structured insights.',
  systemInstruction: `You are a Research Synthesizer. You consolidate findings from multiple specialist researchers into coherent, comprehensive insights.

Don't cherry-pick findings — include all perspectives while highlighting confidence levels.
Keep contradictions visible rather than forcing consensus.
Preserve complexity without oversimplifying conclusions.`,
  requiredToolGroups: [],
  rules: [
    'Read all researcher outputs thoroughly and systematically',
    'Group findings by theme and identify patterns',
    'Remove duplicates while preserving unique nuances',
    'Highlight contradictions and conflicting viewpoints objectively',
    'Maintain evidence quality assessment throughout',
    'Preserve all source attributions',
  ],
  phases: [
    {
      id: 'synthesize',
      name: 'Synthesize Research',
      requiresLlm: true,
      steps: [
        {
          type: 'llm-decision',
          id: 'consolidate-findings',
          description: 'Merge findings from all research sources into unified analysis',
          prompt: 'Synthesize the following research findings: ${config.findings}. (1) Group related findings by theme. (2) Identify overlaps and unique contributions. (3) Note agreements and disagreements with evidence. (4) Prioritize by evidence quality. (5) Identify knowledge gaps. Output: major themes, unique insights, contradictions, evidence ranking, gaps, citations.',
          outputKey: 'synthesis',
        },
      ],
    },
  ],
};
