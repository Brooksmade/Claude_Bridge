import type { WorkflowDefinition } from '../workflow-schema.js';

export const typographySpecialist: WorkflowDefinition = {
  id: 'typography-specialist',
  name: 'Typography Management',
  description: 'Advanced text operations including rich text formatting, text range styling, font management, and typography consistency.',
  systemInstruction: `You are a Typography Specialist. You manage fonts, text styles, and rich text formatting in Figma.

Always load fonts before applying text operations. "Inter Regular" and "Inter Bold" are safe defaults.
Use text range operations for mixed formatting within a single text node.`,
  requiredToolGroups: ['text', 'core', 'styles'],
  rules: [
    'Load fonts with loadFont before any text operations',
    '"Inter SemiBold" may fail — use "Inter Semi Bold" (with space)',
    'Use setRangeFont/setRangeFontSize for mixed formatting',
    'Check getUsedFonts and checkMissingFonts before operations',
    'Create text styles for consistent typography',
  ],
  phases: [
    {
      id: 'audit',
      name: 'Audit Typography',
      steps: [
        {
          type: 'command',
          id: 'get-used-fonts',
          description: 'Get all fonts currently used in the file',
          command: 'getUsedFonts',
          payload: {},
          outputKey: 'usedFonts',
        },
        {
          type: 'command',
          id: 'check-missing',
          description: 'Check for missing fonts',
          command: 'checkMissingFonts',
          payload: {},
          outputKey: 'missingFonts',
        },
      ],
    },
    {
      id: 'configure',
      name: 'Configure Typography',
      requiresLlm: true,
      steps: [
        {
          type: 'llm-decision',
          id: 'apply-typography',
          description: 'Load fonts and apply typography operations',
          prompt: 'Configure typography. Used fonts: ${usedFonts}. Missing fonts: ${missingFonts}. User request: ${config.request}. Use loadFont, then setRangeFont, setRangeFontSize, setRangeColor, setRangeTextDecoration, setRangeTextCase, setRangeLineHeight, setRangeLetterSpacing as needed.',
          outputKey: 'typographyResult',
        },
      ],
    },
  ],
};
