import type { WorkflowDefinition } from '../workflow-schema.js';

export const websiteToFigma: WorkflowDefinition = {
  id: 'website-to-figma',
  name: 'Website-to-Figma Capture',
  description: 'Captures a live website into a Figma file using MCP, with optional follow-up to create design system variables from extracted CSS.',
  systemInstruction: `You are the Website-to-Figma Capture Agent. Two-phase pipeline:

Phase 1 — Capture: getFileInfo → extract fileKey → MCP generate_figma_design (existingFile mode) → get JS snippet + captureId → Playwright navigate + execute snippet → poll captureId for completion.

Phase 2 — Optional design system: extractWebsiteCSS (timeout=300000) → classify brand colors (saturation × frequency) → confirm with user → createDesignSystem → applyMatchingTextStyles (snapToNearest: true).

Prerequisites: Bridge server running, Figma plugin connected, Figma MCP + Playwright MCP available.`,
  requiredToolGroups: ['core', 'variables', 'website'],
  rules: [
    'Verify bridge server health and plugin connection before starting',
    'Get fileKey from getFileInfo — null means file needs saving first',
    'Use MCP generate_figma_design with outputMode: existingFile',
    'Execute capture JS snippet via Playwright browser_evaluate',
    'Use timeout=300000 for extractWebsiteCSS',
    'Confirm brand color classification with user before creating system',
    'Use snapToNearest: true for applyMatchingTextStyles on captured content',
  ],
  phases: [
    {
      id: 'capture',
      name: 'Phase 1: Capture Website',
      steps: [
        {
          type: 'command',
          id: 'verify-connection',
          description: 'Verify plugin is connected',
          command: 'ping',
          payload: {},
          outputKey: 'pingResult',
        },
        {
          type: 'command',
          id: 'get-file-info',
          description: 'Get file key for MCP capture target',
          command: 'getFileInfo',
          payload: {},
          outputKey: 'fileInfo',
        },
      ],
    },
    {
      id: 'mcp-capture',
      name: 'Execute MCP Capture',
      requiresLlm: true,
      steps: [
        {
          type: 'llm-decision',
          id: 'run-capture',
          description: 'Initiate MCP capture, execute via Playwright, poll for completion',
          prompt: 'Capture the website. URL: ${config.url}. File info: ${fileInfo}. Use MCP generate_figma_design with outputMode=existingFile and fileKey from fileInfo. Get JS snippet and captureId. Navigate Playwright to the URL, execute the snippet, then poll generate_figma_design with captureId until done.',
          outputKey: 'captureResult',
        },
      ],
    },
    {
      id: 'design-system',
      name: 'Phase 2: Optional Design System',
      requiresLlm: true,
      steps: [
        {
          type: 'llm-decision',
          id: 'create-design-system',
          description: 'Extract CSS tokens and create design system if requested',
          prompt: 'Optional design system creation. Capture result: ${captureResult}. URL: ${config.url}. If user wants design system: (1) extractWebsiteCSS with timeout=300000, (2) classify brand colors by saturation × frequency, (3) confirm colors with user, (4) createDesignSystem with confirmed colors, (5) applyMatchingTextStyles with snapToNearest: true. Report results.',
          outputKey: 'designSystemResult',
        },
      ],
    },
  ],
};
