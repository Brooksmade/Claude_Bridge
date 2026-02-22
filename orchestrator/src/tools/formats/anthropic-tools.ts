/**
 * Convert ToolDefinitions to Anthropic Messages API tool_use format.
 * Compatible with Claude Sonnet, Opus, Haiku via the API.
 */

import type { ToolDefinition } from '../tool-registry.js';

/**
 * Anthropic tool definition format.
 */
export interface AnthropicTool {
  name: string;
  description: string;
  input_schema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

/**
 * Convert tool definitions to Anthropic tool_use format.
 * JSON Schema maps directly to Anthropic's input_schema.
 */
export function toAnthropicTools(tools: ToolDefinition[]): AnthropicTool[] {
  return tools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    input_schema: {
      type: 'object' as const,
      properties: tool.parameters.properties,
      ...(tool.parameters.required ? { required: tool.parameters.required } : {}),
    },
  }));
}

/**
 * Convert a single tool definition.
 */
export function toAnthropicTool(tool: ToolDefinition): AnthropicTool {
  return toAnthropicTools([tool])[0];
}
