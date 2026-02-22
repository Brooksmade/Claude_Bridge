/**
 * Generic adapter for any LLM with HTTP function calling.
 * Configurable endpoint, headers, and request/response format.
 */

import type {
  LlmAdapter,
  LlmResponse,
  Message,
  RunOptions,
  ToolCall,
} from '../base-adapter.js';
import type { ToolDefinition } from '../../tools/tool-registry.js';
import { toGenericTools } from '../../tools/formats/generic-tools.js';
import { executeToolCall } from '../../tools/tool-executor.js';

/**
 * Functions to transform requests and responses between our format
 * and the target LLM's API format.
 */
export interface FormatAdapter {
  /** Transform our messages + tools into the API request body */
  buildRequest(
    messages: Message[],
    tools: Array<{ name: string; description: string; parameters: unknown }>
  ): Record<string, unknown>;

  /** Parse the API response into our format */
  parseResponse(responseBody: unknown): LlmResponse;
}

export interface GenericAdapterOptions {
  /** API endpoint URL */
  endpoint: string;
  /** HTTP headers (e.g., Authorization) */
  headers: Record<string, string>;
  /** Format adapter for request/response transformation */
  format: FormatAdapter;
}

export class GenericAdapter implements LlmAdapter {
  readonly provider = 'generic';

  private endpoint: string;
  private headers: Record<string, string>;
  private format: FormatAdapter;
  private tools: ToolDefinition[] = [];
  private genericTools: Array<{ name: string; description: string; parameters: unknown }> = [];
  private toolRegistry = new Map<string, ToolDefinition>();

  constructor(options: GenericAdapterOptions) {
    this.endpoint = options.endpoint;
    this.headers = options.headers;
    this.format = options.format;
  }

  setTools(tools: ToolDefinition[]): void {
    this.tools = tools;
    this.genericTools = toGenericTools(tools);
    this.toolRegistry.clear();
    for (const tool of tools) {
      this.toolRegistry.set(tool.name, tool);
    }
  }

  async chat(messages: Message[]): Promise<LlmResponse> {
    const body = this.format.buildRequest(messages, this.genericTools);

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.headers,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API error ${response.status}: ${error}`);
    }

    const responseBody = await response.json();
    return this.format.parseResponse(responseBody);
  }

  async run(userMessage: string, options?: RunOptions): Promise<string> {
    const maxTurns = options?.maxTurns ?? 20;
    const messages: Message[] = [];

    if (options?.systemInstruction) {
      messages.push({ role: 'system', content: options.systemInstruction });
    }
    messages.push({ role: 'user', content: userMessage });

    for (let turn = 0; turn < maxTurns; turn++) {
      const response = await this.chat(messages);
      options?.onResponse?.(response);

      if (response.content) {
        messages.push({ role: 'assistant', content: response.content });
      }

      if (response.done || response.toolCalls.length === 0) {
        return response.content;
      }

      for (const tc of response.toolCalls) {
        const result = await executeToolCall(
          { name: tc.name, arguments: tc.arguments },
          this.toolRegistry
        );
        options?.onToolResult?.(tc.name, result);

        messages.push({
          role: 'tool',
          content: result.content,
          toolCallId: tc.id,
          toolName: tc.name,
        });
      }
    }

    return messages[messages.length - 1]?.content ?? '';
  }
}
