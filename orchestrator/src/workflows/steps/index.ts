/**
 * Index of all deterministic transform functions.
 * These are registered by name and called by the workflow engine.
 */

import type { WorkflowContext } from '../workflow-schema.js';
import { detectBrandColor } from './detect-brand-color.js';
import { classifyColors } from './classify-colors.js';
import { generateColorScales } from './generate-color-scales.js';

export type TransformFunction = (
  input: Record<string, unknown>,
  context: WorkflowContext
) => Promise<unknown>;

export const TRANSFORM_FUNCTIONS = new Map<string, TransformFunction>([
  ['detectBrandColor', detectBrandColor],
  ['classifyColors', classifyColors],
  ['generateColorScales', generateColorScales],
]);
