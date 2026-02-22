/**
 * Tool Groups: predefined subsets of tools for LLM consumption.
 * LLMs degrade with too many tools, so register subsets based on task.
 */

import type { CommandCategory } from '../schema/command-catalog.js';

export interface ToolGroup {
  name: string;
  description: string;
  /** Command types included in this group (optional if categories is set) */
  types?: string[];
  /** Categories to include (alternative to listing types) */
  categories?: CommandCategory[];
}

/**
 * Core tools (~25) — basic node operations for general-purpose use.
 */
export const CORE_GROUP: ToolGroup = {
  name: 'core',
  description: 'Basic node operations: create, modify, delete, query, layout, export',
  types: [
    'ping',
    'create',
    'batchCreate',
    'modify',
    'batchModify',
    'move',
    'resize',
    'delete',
    'batchDelete',
    'clone',
    'group',
    'ungroup',
    'reparent',
    'renameNode',
    'query',
    'getFrames',
    'select',
    'setPage',
    'setAutoLayout',
    'setConstraints',
    'setFills',
    'setStrokes',
    'setEffects',
    'setCornerRadius',
    'exportNode',
    'loadFont',
    'notify',
  ],
};

/**
 * Variables tools (~30) — variable CRUD, binding, design system creation.
 */
export const VARIABLES_GROUP: ToolGroup = {
  name: 'variables',
  description: 'Variable operations: CRUD, binding, design system creation',
  types: [
    'createVariableCollection',
    'editVariableCollection',
    'deleteVariableCollection',
    'createVariable',
    'editVariable',
    'batchEditVariable',
    'deleteVariable',
    'getVariables',
    'getVariableById',
    'getVariableCollectionById',
    'bindFillVariable',
    'bindStrokeVariable',
    'bindVariable',
    'unbindVariable',
    'bindMatchingColors',
    'autoBindByRole',
    'autoBindSpacing',
    'bindByExtractedUsage',
    'replaceColorsByMapping',
    'rebindVariables',
    'inspectFills',
    'exportTokens',
    'importTokens',
    'createBoilerplate',
    'createVariableAlias',
    'setExplicitVariableMode',
    'setVariableCodeSyntax',
    'setNodeBoundVariable',
    'setBoundVariableForPaint',
  ],
};

/**
 * Design System tools — high-level design system operations.
 */
export const DESIGN_SYSTEM_GROUP: ToolGroup = {
  name: 'design-system',
  description: 'Design system operations: create, validate, extract tokens',
  types: [
    'createDesignSystem',
    'validateDesignSystem',
    'getDesignSystemStatus',
    'extractDesignTokens',
    'getOrganizingPrinciples',
    'createTypographyStyles',
    'createStateCollection',
    'createComponentSizeCollection',
    'createScreenSizeCollection',
    'bindDocumentationVariables',
    // Include essential variable tools
    'getVariables',
    'createVariable',
    'editVariable',
    'bindFillVariable',
    'bindStrokeVariable',
    'bindMatchingColors',
    'autoBindByRole',
  ],
};

/**
 * Styles tools (~17) — paint, text, effect, grid styles.
 */
export const STYLES_GROUP: ToolGroup = {
  name: 'styles',
  description: 'Style operations: paint, text, effect, grid styles',
  categories: ['styles'],
};

/**
 * Components tools (~14) — component and instance operations.
 */
export const COMPONENTS_GROUP: ToolGroup = {
  name: 'components',
  description: 'Component and instance operations',
  categories: ['components'],
};

/**
 * Text tools (~27) — text range operations.
 */
export const TEXT_GROUP: ToolGroup = {
  name: 'text',
  description: 'Text and text range operations',
  categories: ['text'],
};

/**
 * Website tools (2) — server-side CSS/layout extraction.
 */
export const WEBSITE_GROUP: ToolGroup = {
  name: 'website',
  description: 'Website CSS and layout extraction via headless browser',
  types: ['extractWebsiteCSS', 'extractWebsiteLayout'],
};

/**
 * FigJam tools — shapes, connectors, stickies, sections for diagrams.
 */
export const FIGJAM_GROUP: ToolGroup = {
  name: 'figjam',
  description: 'FigJam diagram tools: sections, shapes, connectors, stickies',
  types: [
    'createSection',
    'createShapeWithText',
    'createConnector',
    'createSticky',
    'measureText',
    'createCodeBlock',
    'query',
    'getFrames',
    'select',
    'setPage',
  ],
};

/**
 * All predefined groups.
 */
export const ALL_GROUPS: ToolGroup[] = [
  CORE_GROUP,
  VARIABLES_GROUP,
  DESIGN_SYSTEM_GROUP,
  STYLES_GROUP,
  COMPONENTS_GROUP,
  TEXT_GROUP,
  WEBSITE_GROUP,
  FIGJAM_GROUP,
];

/**
 * Get a group by name.
 */
export function getGroup(name: string): ToolGroup | undefined {
  return ALL_GROUPS.find((g) => g.name === name);
}

/**
 * Merge multiple groups into a single list of unique command types.
 */
export function mergeGroups(...groups: ToolGroup[]): string[] {
  const types = new Set<string>();
  for (const group of groups) {
    if (group.types) {
      for (const t of group.types) types.add(t);
    }
  }
  return Array.from(types);
}
