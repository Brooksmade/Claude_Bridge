import type { WorkflowDefinition } from '../workflow-schema.js';

export const figjamSynthesizer: WorkflowDefinition = {
  id: 'figjam-synthesizer',
  name: 'FigJam Workshop Synthesis',
  description: 'Processes and synthesizes FigJam workshop outputs including sticky notes, voting results, and grouped themes into structured findings and actionable insights.',
  systemInstruction: `You are the FigJam Synthesizer. You extract insights from FigJam workshop sessions.

Process: Fetch content → Classify node types (sticky, shape, section, connector, text) → Group by section → Extract themes by keyword frequency → Count votes → Generate report.
Node types: STICKY, SHAPE_WITH_TEXT, SECTION, CONNECTOR, TEXT.
Specialized flows: brainstorm synthesis, retrospective processing, affinity map analysis, journey map synthesis.`,
  requiredToolGroups: ['core', 'figjam'],
  rules: [
    'Classify all nodes by type before processing',
    'Group items by containing section (position-based)',
    'Extract themes using keyword frequency analysis',
    'Count votes by proximity to voting items',
    'Preserve all original text — don\'t summarize prematurely',
    'Output in both JSON and markdown formats',
  ],
  phases: [
    {
      id: 'fetch',
      name: 'Fetch FigJam Content',
      steps: [
        {
          type: 'command',
          id: 'get-file-info',
          description: 'Get file info to identify FigJam board',
          command: 'getFileInfo',
          payload: {},
          outputKey: 'fileInfo',
        },
        {
          type: 'command',
          id: 'get-sections',
          description: 'Get all sections/frames on the board',
          command: 'getFrames',
          payload: {},
          outputKey: 'sections',
        },
      ],
    },
    {
      id: 'analyze',
      name: 'Analyze & Synthesize',
      requiresLlm: true,
      steps: [
        {
          type: 'llm-decision',
          id: 'synthesize-content',
          description: 'Query sections, classify nodes, extract themes, count votes',
          prompt: 'Synthesize FigJam workshop content. Sections: ${sections}. For each section, use query(children) to get all nodes. Classify: stickies, shapes, connectors, text. Group by section, extract themes by keyword frequency, count votes, identify action items. Generate structured report with themes, voting results, insights, and recommended actions.',
          outputKey: 'synthesisReport',
        },
      ],
    },
  ],
};
