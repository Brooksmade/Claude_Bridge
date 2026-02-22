/**
 * Workflow: Create Design System from Website
 * Pipeline: Extract CSS → Classify Colors → Generate Scales → Create/Update
 */

import type { WorkflowDefinition } from '../workflow-schema.js';

export const designSystemFromWebsite: WorkflowDefinition = {
  id: 'design-system-from-website',
  name: 'Create Design System from Website',
  description:
    'Extract CSS from a live website, classify colors, generate 50-950 scales, and create a Figma design system.',
  systemInstruction: `You are a Website Design System Extractor. You analyze live websites and create Figma design systems from their CSS.

The extractWebsiteCSS command uses a headless browser to scan all DOM elements and return computed styles.
Color classification is automatic: filter neutrals (low saturation), sort chromatic colors by saturation × frequency.
Generate 11-step scales (50-950) for each brand color.`,
  requiredToolGroups: ['website', 'design-system', 'variables'],
  rules: [
    'extractWebsiteCSS is server-side — it does NOT go to the Figma plugin',
    'Use extended timeout (300s) for extraction',
    'Do NOT assume :root = light mode — check cssVariables.rootMode',
    'Neutral/brand scales can be fully inverted between themes',
    'Color classification happens automatically via transform steps',
  ],
  phases: [
    {
      id: 'extract',
      name: 'Extract Website CSS',
      steps: [
        {
          type: 'command',
          id: 'extract-css',
          description: 'Extract computed CSS from the website using headless browser',
          command: 'extractWebsiteCSS',
          payload: { url: '${config.url}' },
          outputKey: 'websiteCSS',
          longRunning: true,
        },
      ],
    },
    {
      id: 'classify',
      name: 'Classify Colors',
      steps: [
        {
          type: 'transform',
          id: 'classify-colors',
          description: 'Classify extracted colors into brand, neutral, and system categories',
          function: 'classifyColors',
          input: { colors: '${websiteCSS.data.colors}' },
          outputKey: 'colorClassification',
        },
        {
          type: 'transform',
          id: 'detect-brand',
          description: 'Detect primary/secondary/tertiary from brand colors',
          function: 'detectBrandColor',
          input: { colors: '${websiteCSS.data.colorsByUsage}' },
          outputKey: 'brandColors',
        },
      ],
    },
    {
      id: 'generate-scales',
      name: 'Generate Color Scales',
      steps: [
        {
          type: 'transform',
          id: 'generate-scales',
          description: 'Generate 50-950 color scales for brand colors',
          function: 'generateColorScales',
          input: {
            colors: {
              primary: '${brandColors.primary}',
              secondary: '${brandColors.secondary}',
              tertiary: '${brandColors.tertiary}',
            },
          },
          outputKey: 'colorScales',
        },
      ],
    },
    {
      id: 'create',
      name: 'Create Design System',
      steps: [
        {
          type: 'command',
          id: 'create-system',
          description: 'Create the design system with generated scales',
          command: 'createDesignSystem',
          payload: {
            brandColors: {
              primary: '${brandColors.primary}',
              secondary: '${brandColors.secondary}',
              tertiary: '${brandColors.tertiary}',
            },
            includeBoilerplate: true,
          },
          outputKey: 'designSystem',
          longRunning: true,
        },
      ],
    },
  ],
};
