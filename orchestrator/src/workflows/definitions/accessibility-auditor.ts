import type { WorkflowDefinition } from '../workflow-schema.js';

export const accessibilityAuditor: WorkflowDefinition = {
  id: 'accessibility-auditor',
  name: 'WCAG Accessibility Audit',
  description: 'Audits designs for WCAG compliance including color contrast, touch targets, text sizing, focus states, and heading hierarchy. Outputs JSON or visual Figma annotation frames.',
  systemInstruction: `You are an Accessibility Auditor. You validate designs against WCAG 2.1 guidelines.

Contrast requirements (AA): Normal text 4.5:1, Large text 3:1, UI components 3:1.
Large text: 18pt (24px) regular or 14pt (18.67px) bold.
Touch targets: iOS 44x44, Android 48x48, Web 44x44.
Text minimums: Body 16px, Small 12px (with contrast boost), Interactive 14px.
Check heading hierarchy: single H1, no level skipping, logical order.`,
  requiredToolGroups: ['core'],
  rules: [
    'Check color contrast against WCAG AA minimums (4.5:1 normal, 3:1 large)',
    'Verify touch targets meet platform minimums (44x44 web, 48x48 mobile)',
    'Flag text below 12px as error, body text below 16px as warning',
    'Check heading hierarchy: single H1, no level skipping',
    'Focus states require manual verification — flag as manual check',
    'Score 0-100 based on pass/fail/warning counts',
  ],
  phases: [
    {
      id: 'extract',
      name: 'Extract Frame Data',
      steps: [
        {
          type: 'command',
          id: 'get-selection',
          description: 'Get current selection for audit',
          command: 'query',
          payload: { queryType: 'selection' },
          outputKey: 'selection',
        },
        {
          type: 'command',
          id: 'analyze-colors',
          description: 'Analyze colors in the target frame',
          command: 'analyzeColors',
          payload: {},
          target: '${config.targetNodeId}',
          outputKey: 'colorAnalysis',
        },
        {
          type: 'command',
          id: 'describe-frame',
          description: 'Get structural overview of the frame',
          command: 'query',
          payload: { queryType: 'describe' },
          target: '${config.targetNodeId}',
          outputKey: 'frameStructure',
        },
      ],
    },
    {
      id: 'audit',
      name: 'Run Accessibility Checks',
      requiresLlm: true,
      steps: [
        {
          type: 'llm-decision',
          id: 'run-audit',
          description: 'Check contrast, touch targets, text sizes, headings, focus states',
          prompt: 'Audit accessibility of the frame. Selection: ${selection}. Colors: ${colorAnalysis}. Structure: ${frameStructure}. Check: (1) color contrast ratios against WCAG AA, (2) touch target sizes >= 44px, (3) text sizing >= 12px minimum, (4) heading hierarchy, (5) focus state presence. Score 0-100 and list issues by category.',
          outputKey: 'auditReport',
        },
      ],
    },
  ],
};
