/**
 * OpenAI adapter for GPT-4o, o3, and any model supporting function calling.
 */

import type {
  LlmAdapter,
  LlmResponse,
  Message,
  RunOptions,
  ToolCall,
} from '../base-adapter.js';
import type { ToolDefinition } from '../../tools/tool-registry.js';
import { toOpenAITools, type OpenAITool } from '../../tools/formats/openai-tools.js';
import { executeToolCall } from '../../tools/tool-executor.js';

export interface OpenAIAdapterOptions {
  /** OpenAI API key (or set OPENAI_API_KEY env var) */
  apiKey?: string;
  /** Model name (default: gpt-4o) */
  model?: string;
  /** Base URL override */
  baseUrl?: string;
}

export class OpenAIAdapter implements LlmAdapter {
  readonly provider = 'openai';

  private apiKey: string;
  private model: string;
  private baseUrl: string;
  private tools: ToolDefinition[] = [];
  private openaiTools: OpenAITool[] = [];
  private toolRegistry = new Map<string, ToolDefinition>();

  constructor(options?: OpenAIAdapterOptions) {
    this.apiKey = options?.apiKey ?? process.env.OPENAI_API_KEY ?? '';
    this.model = options?.model ?? 'gpt-4o';
    this.baseUrl = options?.baseUrl ?? 'https://api.openai.com/v1';
  }

  setTools(tools: ToolDefinition[]): void {
    this.tools = tools;
    this.openaiTools = toOpenAITools(tools);
    this.toolRegistry.clear();
    for (const tool of tools) {
      this.toolRegistry.set(tool.name, tool);
    }
  }

  async chat(messages: Message[]): Promise<LlmResponse> {
    const openaiMessages = messages.map((m) => {
      if (m.role === 'tool') {
        return {
          role: 'tool' as const,
          content: m.content,
          tool_call_id: m.toolCallId ?? '',
        };
      }
      return { role: m.role, content: m.content };
    });

    const body: Record<string, unknown> = {
      model: this.model,
      messages: openaiMessages,
    };

    if (this.openaiTools.length > 0) {
      body.tools = this.openaiTools;
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error ${response.status}: ${error}`);
    }

    const data = (await response.json()) as {
      choices: Array<{
        message: {
          content?: string;
          tool_calls?: Array<{
            id: string;
            function: { name: string; arguments: string };
          }>;
        };
        finish_reason: string;
      }>;
      usage?: { prompt_tokens: number; completion_tokens: number };
    };

    const choice = data.choices[0];
    const toolCalls: ToolCall[] =
      choice.message.tool_calls?.map((tc) => ({
        id: tc.id,
        name: tc.function.name,
        arguments: JSON.parse(tc.function.arguments) as Record<string, unknown>,
      })) ?? [];

    return {
      content: choice.message.content ?? '',
      toolCalls,
      done: choice.finish_reason === 'stop' && toolCalls.length === 0,
      stopReason: choice.finish_reason,
      usage: data.usage
        ? {
            inputTokens: data.usage.prompt_tokens,
            outputTokens: data.usage.completion_tokens,
          }
        : undefined,
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

      // Execute tool calls and add results
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
