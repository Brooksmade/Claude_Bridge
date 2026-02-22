/**
 * Workflow: FigJam Workflow Diagrams
 * Single-agent workflow with FigJam tools (needs LLM for chart type detection).
 */

import type { WorkflowDefinition } from '../workflow-schema.js';

export const figjamWorkflow: WorkflowDefinition = {
  id: 'figjam-workflow',
  name: 'Create FigJam Workflow Diagrams',
  description:
    'Create structured workflow diagrams, process flows, and user journeys in FigJam using sections, shapes, and connectors.',
  systemInstruction: `You are a FigJam Workflow Specialist. You create structured diagrams directly in FigJam.

IMPORTANT: Always use bridge server commands (createSection, createShapeWithText, createConnector).
NEVER use MCP generate_diagram — that creates separate files.

Workflow:
1. Measure text to calculate accurate node sizes
2. Calculate positions with consistent spacing
3. Create sections for logical groupings
4. Create shapes with text for each step
5. Create connectors between steps
6. Use color coding: green=start, blue=process, yellow=decision, red=end`,
  requiredToolGroups: ['figjam'],
  rules: [
    'ALWAYS use bridge server commands for FigJam — never MCP tools',
    'Measure text BEFORE creating shapes to get accurate sizes',
    'Use consistent spacing: 40px between shapes, 60px between rows',
    'Color coding: green (#22c55e) start, blue (#3b82f6) process, yellow (#eab308) decision, red (#ef4444) end',
    'Create sections first, then shapes inside them, then connectors',
    'Connector magnets: use AUTO for most cases, specific sides for horizontal flows',
  ],
  phases: [
    {
      id: 'plan',
      name: 'Plan Diagram',
      requiresLlm: true,
      steps: [
        {
          type: 'llm-decision',
          id: 'plan-layout',
          description: 'Determine diagram structure, node count, connections, and layout',
          prompt: `Plan a FigJam workflow diagram based on the user's requirements.
Determine: number of steps, logical groupings (sections), flow direction, decision points.
Output a structured plan with node texts, connections, and section boundaries.
User request: \${config.userRequest}`,
          outputKey: 'diagramPlan',
        },
      ],
    },
    {
      id: 'measure',
      name: 'Measure Text',
      requiresLlm: true,
      steps: [
        {
          type: 'llm-decision',
          id: 'measure-texts',
          description: 'Measure all text labels to calculate accurate shape sizes',
          prompt: `For each node in the diagram plan, use the measureText command to get accurate dimensions.
Then calculate shape sizes (text width + 40px padding, text height + 24px padding).
Plan: \${diagramPlan}`,
          outputKey: 'measurements',
        },
      ],
    },
    {
      id: 'create',
      name: 'Create Diagram',
      requiresLlm: true,
      steps: [
        {
          type: 'llm-decision',
          id: 'create-elements',
          description: 'Create all FigJam elements: sections, shapes, connectors',
          prompt: `Create the FigJam diagram using the plan and measurements:
1. Create sections for logical groups
2. Create shapes with text (use appropriate colors)
3. Create connectors between shapes
Plan: \${diagramPlan}
Measurements: \${measurements}`,
          outputKey: 'createdElements',
        },
      ],
    },
  ],
};
