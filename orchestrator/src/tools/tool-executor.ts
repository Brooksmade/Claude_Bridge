/**
 * Tool Executor: dispatches LLM tool calls through the bridge client.
 * Handles argument parsing, error wrapping, and result formatting.
 */

import type { ToolDefinition } from './tool-registry.js';
import type { PollResult } from '../client/result-poller.js';

export interface ToolCallRequest {
  /** Tool/function name */
  name: string;
  /** Arguments as a JSON object or JSON string */
  arguments: Record<string, unknown> | string;
}

export interface ToolCallResult {
  /** Tool name that was called */
  name: string;
  /** Whether the call succeeded */
  success: boolean;
  /** Result data (stringified for LLM consumption) */
  content: string;
  /** Raw result object */
  raw?: PollResult;
}

/**
 * Execute a tool call using the tool registry.
 */
export async function executeToolCall(
  call: ToolCallRequest,
  registry: Map<string, ToolDefinition>
): Promise<ToolCallResult> {
  const tool = registry.get(call.name);

  if (!tool) {
    return {
      name: call.name,
      success: false,
      content: JSON.stringify({ error: `Unknown tool: ${call.name}` }),
    };
  }

  // Parse arguments if they come as a string
  let args: Record<string, unknown>;
  if (typeof call.arguments === 'string') {
    try {
      args = JSON.parse(call.arguments) as Record<string, unknown>;
    } catch {
      return {
        name: call.name,
        success: false,
        content: JSON.stringify({
          error: `Invalid JSON arguments: ${call.arguments}`,
        }),
      };
    }
  } else {
    args = call.arguments;
  }

  try {
    const result = await tool.execute(args);
    return {
      name: call.name,
      success: result.success,
      content: JSON.stringify(result),
      raw: result,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      name: call.name,
      success: false,
      content: JSON.stringify({ error: message }),
    };
  }
}

/**
 * Execute multiple tool calls in parallel.
 */
export async function executeToolCalls(
  calls: ToolCallRequest[],
  registry: Map<string, ToolDefinition>
): Promise<ToolCallResult[]> {
  return Promise.all(calls.map((call) => executeToolCall(call, registry)));
}
