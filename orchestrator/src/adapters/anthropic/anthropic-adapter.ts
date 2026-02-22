/**
 * Anthropic Claude API adapter.
 * Works with Claude Sonnet, Opus, Haiku via the Messages API (no Claude Code CLI needed).
 */

import type {
  LlmAdapter,
  LlmResponse,
  Message,
  RunOptions,
  ToolCall,
} from '../base-adapter.js';
import type { ToolDefinition } from '../../tools/tool-registry.js';
import { toAnthropicTools, type AnthropicTool } from '../../tools/formats/anthropic-tools.js';
import { executeToolCall } from '../../tools/tool-executor.js';

export interface AnthropicAdapterOptions {
  /** Anthropic API key (or set ANTHROPIC_API_KEY env var) */
  apiKey?: string;
  /** Model name (default: claude-sonnet-4-6) */
  model?: string;
  /** Max tokens for response (default: 4096) */
  maxTokens?: number;
  /** Base URL override */
  baseUrl?: string;
}

export class AnthropicAdapter implements LlmAdapter {
  readonly provider = 'anthropic';

  private apiKey: string;
  private model: string;
  private maxTokens: number;
  private baseUrl: string;
  private tools: ToolDefinition[] = [];
  private anthropicTools: AnthropicTool[] = [];
  private toolRegistry = new Map<string, ToolDefinition>();

  constructor(options?: AnthropicAdapterOptions) {
    this.apiKey = options?.apiKey ?? process.env.ANTHROPIC_API_KEY ?? '';
    this.model = options?.model ?? 'claude-sonnet-4-6';
    this.maxTokens = options?.maxTokens ?? 4096;
    this.baseUrl = options?.baseUrl ?? 'https://api.anthropic.com';
  }

  setTools(tools: ToolDefinition[]): void {
    this.tools = tools;
    this.anthropicTools = toAnthropicTools(tools);
    this.toolRegistry.clear();
    for (const tool of tools) {
      this.toolRegistry.set(tool.name, tool);
    }
  }

  async chat(messages: Message[]): Promise<LlmResponse> {
    // Separate system message from conversation
    let system: string | undefined;
    const conversationMessages: Array<{
      role: string;
      content: unknown;
    }> = [];

    for (const m of messages) {
      if (m.role === 'system') {
        system = m.content;
        continue;
      }
      if (m.role === 'tool') {
        conversationMessages.push({
          role: 'user',
          content: [
            {
              type: 'tool_result',
              tool_use_id: m.toolCallId,
              content: m.content,
            },
          ],
        });
        continue;
      }
      if (m.role === 'assistant') {
        conversationMessages.push({ role: 'assistant', content: m.content });
        continue;
      }
      conversationMessages.push({ role: 'user', content: m.content });
    }

    const body: Record<string, unknown> = {
      model: this.model,
      max_tokens: this.maxTokens,
      messages: conversationMessages,
    };

    if (system) {
      body.system = system;
    }
    if (this.anthropicTools.length > 0) {
      body.tools = this.anthropicTools;
    }

    const response = await fetch(`${this.baseUrl}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error ${response.status}: ${error}`);
    }

    const data = (await response.json()) as {
      content: Array<
        | { type: 'text'; text: string }
        | { type: 'tool_use'; id: string; name: string; input: Record<string, unknown> }
      >;
      stop_reason: string;
      usage: { input_tokens: number; output_tokens: number };
    };

    const textContent = data.content
      .filter((c): c is { type: 'text'; text: string } => c.type === 'text')
      .map((c) => c.text)
      .join('');

    const toolCalls: ToolCall[] = data.content
      .filter(
        (c): c is { type: 'tool_use'; id: string; name: string; input: Record<string, unknown> } =>
          c.type === 'tool_use'
      )
      .map((c) => ({
        id: c.id,
        name: c.name,
        arguments: c.input,
      }));

    return {
      content: textContent,
      toolCalls,
      done: data.stop_reason === 'end_turn' && toolCalls.length === 0,
      stopReason: data.stop_reason,
      usage: {
        inputTokens: data.usage.input_tokens,
        outputTokens: data.usage.output_tokens,
      },
    };
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

      // Execute tool calls
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
