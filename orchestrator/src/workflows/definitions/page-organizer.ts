import type { WorkflowDefinition } from '../workflow-schema.js';

export const pageOrganizer: WorkflowDefinition = {
  id: 'page-organizer',
  name: 'File & Page Organization',
  description: 'Organizes Figma file pages, creates standard page structures, manages page templates, and handles file organization workflows.',
  systemInstruction: `You are a Page Organizer. You create consistent page hierarchies and manage file organization in Figma.

Standard page structure: Cover → Design System → Components → Screens → Prototypes → Specs → Archive.
Use hierarchical names with slashes: "Screens / Dashboard / Overview".
Status prefixes are optional: ✅ Complete, 🚧 In Progress, 📋 Review.`,
  requiredToolGroups: ['core'],
  rules: [
    'Use consistent naming — follow team conventions',
    'Always create a Cover page for file thumbnail and info',
    'Separate concerns — different pages for different purposes',
    'Archive old work instead of deleting',
    'Use hierarchical names: Category / Subcategory',
    'Load all pages before bulk operations with loadAllPages',
  ],
  phases: [
    {
      id: 'analyze',
      name: 'Analyze Current Structure',
      steps: [
        {
          type: 'command',
          id: 'get-file-info',
          description: 'Get file metadata',
          command: 'getFileInfo',
          payload: {},
          outputKey: 'fileInfo',
        },
        {
          type: 'command',
          id: 'get-pages',
          description: 'Get all existing pages',
          command: 'query',
          payload: { queryType: 'pages' },
          outputKey: 'pages',
        },
      ],
    },
    {
      id: 'organize',
      name: 'Organize Pages',
      requiresLlm: true,
      steps: [
        {
          type: 'llm-decision',
          id: 'organize-pages',
          description: 'Create, rename, reorder, and delete pages to match desired structure',
          prompt: 'Organize file pages. File info: ${fileInfo}. Current pages: ${pages}. User request: ${config.request}. Use createPage, renamePage, duplicatePage, deletePage, setPage as needed. Follow standard structures: Design System File, Product Design File, or Marketing File.',
          outputKey: 'organizeResult',
        },
      ],
    },
  ],
};
