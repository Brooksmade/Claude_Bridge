/**
 * Workflow: Variable Binding
 * Single-agent workflow that requires LLM judgment for matching.
 */

import type { WorkflowDefinition } from '../workflow-schema.js';

export const variableBinding: WorkflowDefinition = {
  id: 'variable-binding',
  name: 'Bind Design System Variables to Elements',
  description:
    'Automatically bind design system variables to frame elements using color matching and semantic role detection.',
  systemInstruction: `You are a Variable Binding Specialist. You bind design system variables to Figma frame elements.

Strategy order:
1. Try autoBindByRole first — it uses semantic role detection (Surface/Page, Text/Primary, Border/Default)
2. For remaining unbound nodes, use bindMatchingColors — it resolves alias chains and prefers Token > Semantic > Primitive
3. For spacing, use autoBindSpacing on auto-layout nodes
4. Report results and any nodes that couldn't be bound.`,
  requiredToolGroups: ['variables', 'core'],
  rules: [
    'Always query the frame structure first to understand what needs binding',
    'autoBindByRole is preferred over bindMatchingColors for frames with wrong raw colors',
    'Token-level bindings are preferred over Semantic or Primitive',
    'bindFillVariable: nodeId goes in payload, NOT as target',
    'Report binding stats: total nodes, bound, unbound, errors',
  ],
  phases: [
    {
      id: 'analyze',
      name: 'Analyze Frame',
      steps: [
        {
          type: 'command',
          id: 'get-variables',
          description: 'Get all available design system variables',
          command: 'getVariables',
          payload: { includeValues: true },
          outputKey: 'variables',
        },
        {
          type: 'command',
          id: 'query-frame',
          description: 'Query the target frame structure',
          command: 'query',
          payload: { queryType: 'describe' },
          target: '${config.targetNodeId}',
          outputKey: 'frameStructure',
        },
      ],
    },
    {
      id: 'bind',
      name: 'Bind Variables',
      requiresLlm: true,
      steps: [
        {
          type: 'command',
          id: 'auto-bind-role',
          description: 'Bind variables by semantic role detection',
          command: 'autoBindByRole',
          payload: {
            nodeId: '${config.targetNodeId}',
            recursive: true,
          },
          outputKey: 'roleBindResult',
        },
        {
          type: 'command',
          id: 'bind-matching',
          description: 'Bind remaining nodes by color matching',
          command: 'bindMatchingColors',
          payload: {
            nodeId: '${config.targetNodeId}',
            recursive: true,
          },
          outputKey: 'colorBindResult',
        },
        {
          type: 'command',
          id: 'bind-spacing',
          description: 'Bind spacing variables to auto-layout nodes',
          command: 'autoBindSpacing',
          payload: {
            nodeId: '${config.targetNodeId}',
            recursive: true,
          },
          outputKey: 'spacingBindResult',
        },
      ],
    },
  ],
};
