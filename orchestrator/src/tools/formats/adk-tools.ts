/**
 * Convert ToolDefinitions to Google ADK FunctionTool format.
 * Uses Zod schemas as required by ADK.
 */

import type { ToolDefinition } from '../tool-registry.js';
import { jsonSchemaToZod } from '../../utils/json-schema-to-zod.js';

/**
 * ADK-compatible function definition.
 * The actual FunctionTool class comes from @google/adk (peer dep),
 * so we return the raw parameters needed to construct one.
 */
export interface AdkFunctionDef {
  name: string;
  description: string;
  /** Zod schema for parameters */
  schema: ReturnType<typeof jsonSchemaToZod>;
  /** The execute function */
  execute: (args: Record<string, unknown>) => Promise<unknown>;
}

/**
 * Convert tool definitions to ADK function definitions.
 * Returns the data needed to construct FunctionTool instances.
 */
export function toAdkFunctions(tools: ToolDefinition[]): AdkFunctionDef[] {
  return tools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    schema: jsonSchemaToZod(tool.parameters as unknown as Record<string, unknown>),
    execute: async (args: Record<string, unknown>) => {
      const result = await tool.execute(args);
      return result;
    },
  }));
}

/**
 * Convert a single tool definition.
 */
export function toAdkFunction(tool: ToolDefinition): AdkFunctionDef {
  return toAdkFunctions([tool])[0];
}
