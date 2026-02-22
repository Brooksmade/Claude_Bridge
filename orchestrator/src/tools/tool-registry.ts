/**
 * Tool Registry: converts the command catalog into framework-neutral tool definitions
 * with bound execute() functions.
 */

import {
  COMMAND_CATALOG,
  type CommandMeta,
  type CommandSchema,
  type CommandCategory,
} from '../schema/command-catalog.js';
import { BridgeClient } from '../client/bridge-client.js';
import type { PollResult } from '../client/result-poller.js';

/**
 * Framework-neutral tool definition.
 * Can be converted to ADK FunctionTool, OpenAI function, Anthropic tool, etc.
 */
export interface ToolDefinition {
  /** Tool name (same as command type) */
  name: string;
  /** Human-readable description */
  description: string;
  /** JSON Schema for parameters */
  parameters: ToolParameters;
  /** Category for grouping */
  category: CommandCategory;
  /** Execute this tool with the given arguments */
  execute: (args: Record<string, unknown>) => Promise<PollResult>;
  /** Original command metadata */
  meta: CommandMeta;
}

export interface ToolParameters {
  type: 'object';
  properties: Record<string, unknown>;
  required?: string[];
}

/**
 * Build the parameters schema for a tool.
 * Merges the payload schema with an optional `target` parameter.
 */
function buildParameters(meta: CommandMeta): ToolParameters {
  const properties: Record<string, unknown> = {};
  const required: string[] = [];

  // Add target field if needed
  if (meta.requiresTarget) {
    properties['target'] = {
      type: 'string',
      description: 'Target node ID (e.g., "1:23")',
    };
    required.push('target');
  }

  // Merge payload properties
  if (meta.payloadSchema.properties) {
    for (const [key, value] of Object.entries(meta.payloadSchema.properties)) {
      properties[key] = value;
    }
  }

  // Merge payload required fields
  if (meta.payloadSchema.required) {
    for (const r of meta.payloadSchema.required) {
      if (!required.includes(r)) {
        required.push(r);
      }
    }
  }

  return {
    type: 'object',
    properties,
    ...(required.length > 0 ? { required } : {}),
  };
}

/**
 * Create tool definitions from the command catalog.
 * Each tool has a bound execute() that routes through the bridge client.
 */
export function createToolDefinitions(
  client: BridgeClient,
  filter?: {
    categories?: CommandCategory[];
    types?: string[];
  }
): ToolDefinition[] {
  const tools: ToolDefinition[] = [];

  for (const [, meta] of Object.entries(COMMAND_CATALOG)) {
    // Apply filters
    if (filter?.categories && !filter.categories.includes(meta.category)) {
      continue;
    }
    if (filter?.types && !filter.types.includes(meta.type)) {
      continue;
    }

    const parameters = buildParameters(meta);

    tools.push({
      name: meta.type,
      description: meta.description,
      parameters,
      category: meta.category,
      meta,
      execute: async (args: Record<string, unknown>) => {
        // Separate target from payload
        const { target, ...payload } = args;
        return client.execute(
          meta.type,
          Object.keys(payload).length > 0 ? payload : undefined,
          target as string | undefined
        );
      },
    });
  }

  return tools;
}

/**
 * Create a tool registry — a map from tool name to ToolDefinition.
 */
export function createToolRegistry(
  client: BridgeClient,
  filter?: {
    categories?: CommandCategory[];
    types?: string[];
  }
): Map<string, ToolDefinition> {
  const definitions = createToolDefinitions(client, filter);
  const registry = new Map<string, ToolDefinition>();
  for (const def of definitions) {
    registry.set(def.name, def);
  }
  return registry;
}
