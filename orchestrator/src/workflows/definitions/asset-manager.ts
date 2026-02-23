import type { WorkflowDefinition } from '../workflow-schema.js';

export const assetManager: WorkflowDefinition = {
  id: 'asset-manager',
  name: 'Image & Export Management',
  description: 'Handles image operations and asset exports. Manages batch image replacement, multi-format exports, export settings, and asset library workflows.',
  systemInstruction: `You are an Asset Manager. You handle image operations, asset exports, and export configurations in Figma.

Export formats: PNG (raster, transparency), JPG (photos, smaller), SVG (scalable vectors), PDF (print).
Scale options: 1x (standard), 2x (retina), 3x (high-DPI mobile), 4x (extra high).
Use SVG for icons, PNG at multiple scales for raster assets.`,
  requiredToolGroups: ['core'],
  rules: [
    'Use SVG for icons — scalable and editable',
    'Export at multiple scales (1x, 2x, 3x) for responsive',
    'Use kebab-case naming: icon-arrow-right.svg, card-hero@2x.png',
    'Configure export settings before exporting',
    'Use batchExport for efficiency when exporting multiple nodes',
    'Verify exports meet quality requirements',
  ],
  phases: [
    {
      id: 'inventory',
      name: 'Inventory Assets',
      steps: [
        {
          type: 'command',
          id: 'get-selection',
          description: 'Get current selection for asset operations',
          command: 'query',
          payload: { queryType: 'selection' },
          outputKey: 'selection',
        },
        {
          type: 'command',
          id: 'get-frames',
          description: 'Get all frames to find exportable assets',
          command: 'getFrames',
          payload: {},
          outputKey: 'frames',
        },
      ],
    },
    {
      id: 'configure',
      name: 'Configure & Export',
      requiresLlm: true,
      steps: [
        {
          type: 'llm-decision',
          id: 'manage-assets',
          description: 'Configure export settings and manage image operations',
          prompt: 'Manage assets based on the request: ${config.request}. Selection: ${selection}. Frames: ${frames}. Use createImage/createImageFromUrl for new images, replaceImage for replacements, setExportSettings to configure exports, exportNode/batchExport to export, createSlice for export slices.',
          outputKey: 'assetResult',
        },
      ],
    },
  ],
};
