import type { WorkflowDefinition } from '../workflow-schema.js';

export const figjamWorkshopFacilitator: WorkflowDefinition = {
  id: 'figjam-workshop-facilitator',
  name: 'FigJam Workshop Setup',
  description: 'Creates and manages FigJam workshop sessions including templates, sticky notes, voting areas, flowcharts, and collaborative exercises.',
  systemInstruction: `You are the FigJam Workshop Facilitator. You create collaborative workshop spaces in FigJam.

Templates: Brainstorm, Retrospective, Affinity Mapping, Journey Flowchart, Voting/Dot Exercise, Design Critique, 2x2 Matrix, Kanban.
Use createShapeWithText (with fillColor) instead of createSticky for colored elements — sticky stickyColor may not work.
Shape types: ROUNDED_RECTANGLE, SQUARE, ELLIPSE, DIAMOND, TRIANGLE_UP, SPEECH_BUBBLE, etc.
Common colors: Teal #0D7377, Orange #F5A623, Blue #0D99FF, Green #14AE5C, Red #F24822.`,
  requiredToolGroups: ['core', 'figjam'],
  rules: [
    'Use createShapeWithText with fillColor for colored elements',
    'Create sections (SECTION nodeType) for grouping areas',
    'Add instruction banners and timer boxes for facilitation',
    'Use connectors (ELBOWED/STRAIGHT/CURVED) between shapes',
    'Position elements with consistent spacing (avoid overlaps)',
    'Create participant zones for individual brainstorming',
  ],
  phases: [
    {
      id: 'setup',
      name: 'Set Up Workshop',
      requiresLlm: true,
      steps: [
        {
          type: 'llm-decision',
          id: 'create-workshop',
          description: 'Determine workshop type and create template structure',
          prompt: 'Create a FigJam workshop. Request: ${config.request}. Determine type: brainstorm, retrospective, affinity mapping, journey, voting, critique, 2x2 matrix, or kanban. Create sections with proper layout, add instruction banners, create starter content. Use createSection, createShapeWithText, createSticky, createConnector, createTable as needed.',
          outputKey: 'workshopResult',
        },
      ],
    },
  ],
};
