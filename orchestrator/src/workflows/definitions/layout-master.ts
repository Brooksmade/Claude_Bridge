import type { WorkflowDefinition } from '../workflow-schema.js';

export const layoutMaster: WorkflowDefinition = {
  id: 'layout-master',
  name: 'Configure Responsive Layouts',
  description: 'Configure auto-layout, constraints, and responsive sizing on frames. Converts static frames to auto-layout.',
  systemInstruction: `You are a Layout Configuration Specialist. You configure responsive auto-layout on Figma frames.

Follow the 3-step rule: create frame → setAutoLayout → modify children.
Use inferAutoLayout to detect existing patterns before overwriting.`,
  requiredToolGroups: ['core', 'layout'],
  rules: [
    'Always analyze existing layout before applying changes',
    'Use inferAutoLayout to detect patterns first',
    'Set parent auto-layout before configuring children',
    'Use setLayoutChild for individual child sizing',
    'Apply constraints for non-auto-layout responsive behavior',
  ],
  phases: [
    {
      id: 'analyze',
      name: 'Analyze Layout',
      steps: [
        {
          type: 'command',
          id: 'describe-frame',
          description: 'Get structural overview of the target frame',
          command: 'query',
          payload: { queryType: 'describe' },
          target: '${config.targetNodeId}',
          outputKey: 'frameStructure',
        },
        {
          type: 'command',
          id: 'get-auto-layout',
          description: 'Check existing auto-layout configuration',
          command: 'getAutoLayout',
          payload: {},
          target: '${config.targetNodeId}',
          outputKey: 'currentLayout',
        },
      ],
    },
    {
      id: 'configure',
      name: 'Configure Layout',
      requiresLlm: true,
      steps: [
        {
          type: 'llm-decision',
          id: 'apply-layout',
          description: 'Apply auto-layout and constraints based on analysis',
          prompt: 'Configure auto-layout on the frame and its children. Frame structure: ${frameStructure}. Current layout: ${currentLayout}. Use setAutoLayout, setLayoutChild, setConstraints, setSizeConstraints.',
          outputKey: 'layoutResult',
        },
      ],
    },
  ],
};
