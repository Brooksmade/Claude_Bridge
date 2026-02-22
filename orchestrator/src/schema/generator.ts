/**
 * Build script: reads the command catalog and outputs catalog.generated.json.
 * Run via: pnpm run generate-schema
 */

import { COMMAND_CATALOG, type CommandMeta } from './command-catalog.js';

export interface GeneratedCatalog {
  version: string;
  generatedAt: string;
  commandCount: number;
  commands: Record<string, CommandMeta>;
}

export function generateCatalog(): GeneratedCatalog {
  return {
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    commandCount: Object.keys(COMMAND_CATALOG).length,
    commands: COMMAND_CATALOG,
  };
}

/**
 * Validate that all command types in the catalog are unique
 * and have required fields.
 */
export function validateCatalog(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const seen = new Set<string>();

  for (const [key, meta] of Object.entries(COMMAND_CATALOG)) {
    if (key !== meta.type) {
      errors.push(`Key "${key}" does not match type "${meta.type}"`);
    }
    if (seen.has(meta.type)) {
      errors.push(`Duplicate command type: "${meta.type}"`);
    }
    seen.add(meta.type);

    if (!meta.description) {
      errors.push(`Missing description for "${meta.type}"`);
    }
    if (!meta.category) {
      errors.push(`Missing category for "${meta.type}"`);
    }
    if (!meta.payloadSchema) {
      errors.push(`Missing payloadSchema for "${meta.type}"`);
    }
  }

  return { valid: errors.length === 0, errors };
}
