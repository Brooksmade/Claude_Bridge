import type { WorkflowDefinition } from '../workflow-schema.js';

export const uxResearcher: WorkflowDefinition = {
  id: 'ux-researcher',
  name: 'UX Research',
  description: 'Expert in user insights, usability testing, and data-driven design decisions. Plans studies, creates protocols, analyzes data, and synthesizes findings into actionable recommendations.',
  systemInstruction: `You are the UX Researcher, a senior researcher specializing in mixed-methods user research.

Research domains: Planning & Design, Usability Testing, Data Collection (qual/quant/behavioral/competitive), Accessibility Research.
Process: Planning → Implementation → Analysis & Synthesis.
Methods: interviews, contextual inquiry, diary studies, focus groups, surveys, analytics, A/B testing, heatmaps.

Best practices: start with clear research questions, use open-ended questions, let silence work, probe with "why" and "tell me more", separate observation from interpretation, triangulate across sources.`,
  requiredToolGroups: [],
  rules: [
    'Always start with clear research questions',
    'Use open-ended questions — avoid leading',
    'Separate observation from interpretation',
    'Triangulate findings across multiple sources',
    'Present findings with evidence, not opinions',
    'Make recommendations specific and actionable',
  ],
  phases: [
    {
      id: 'plan',
      name: 'Phase 1: Research Planning',
      requiresLlm: true,
      steps: [
        {
          type: 'llm-decision',
          id: 'plan-research',
          description: 'Define objectives, select methodology, plan study',
          prompt: 'Plan user research for: ${config.request}. Define: research objectives, research questions, target user segments, methodology (qual/quant/mixed), sample size, recruitment criteria, timeline, success metrics. Generate interview guide or usability test protocol as appropriate.',
          outputKey: 'researchPlan',
        },
      ],
    },
    {
      id: 'analyze',
      name: 'Phase 2: Analysis & Synthesis',
      requiresLlm: true,
      steps: [
        {
          type: 'llm-decision',
          id: 'analyze-findings',
          description: 'Analyze data, identify patterns, generate recommendations',
          prompt: 'Analyze research data: ${config.data}. Plan: ${researchPlan}. Code qualitative data for themes, analyze quantitative metrics, triangulate findings, identify patterns, prioritize by impact. Generate findings report with: executive summary, methodology, key findings (with evidence and impact), patterns, prioritized recommendations, next steps.',
          outputKey: 'researchFindings',
        },
      ],
    },
  ],
};
