/**
 * Convert ToolDefinitions to OpenAI function calling format.
 * Compatible with GPT-4o, o3, and any model supporting tools/functions.
 */

import type { ToolDefinition } from '../tool-registry.js';

/**
 * OpenAI ChatCompletionTool format.
 */
export interface OpenAITool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
    strict?: boolean;
  };
}

/**
 * Convert tool definitions to OpenAI function calling format.
 * JSON Schema passes through directly since OpenAI uses JSON Schema.
 */
export function toOpenAITools(tools: ToolDefinition[]): OpenAITool[] {
  return tools.map((tool) => ({
    type: 'function' as const,
    function: {
      name: tool.name,
      description: tool.description,
      parameters: {
        ...tool.parameters,
        // OpenAI requires additionalProperties to be explicitly set for strict mode
      },
    },
  }));
}

/**
 * Convert a single tool definition.
 */
export function toOpenAITool(tool: ToolDefinition): OpenAITool {
  return toOpenAITools([tool])[0];
}
