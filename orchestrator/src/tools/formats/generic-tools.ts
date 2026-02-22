/**
 * Generic JSON Schema output for any framework with function calling.
 */

import type { ToolDefinition } from '../tool-registry.js';

/**
 * Generic tool format — raw JSON Schema.
 */
export interface GenericTool {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
  metadata: {
    category: string;
    requiresTarget: boolean;
    longRunning: boolean;
    serverSide: boolean;
  };
}

/**
 * Convert tool definitions to generic JSON Schema format.
 */
export function toGenericTools(tools: ToolDefinition[]): GenericTool[] {
  return tools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    parameters: {
      type: 'object' as const,
      properties: tool.parameters.properties,
      ...(tool.parameters.required ? { required: tool.parameters.required } : {}),
    },
    metadata: {
      category: tool.category,
      requiresTarget: tool.meta.requiresTarget ?? false,
      longRunning: tool.meta.longRunning ?? false,
      serverSide: tool.meta.serverSide ?? false,
    },
  }));
}
