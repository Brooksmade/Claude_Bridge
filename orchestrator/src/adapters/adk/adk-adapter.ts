/**
 * Google ADK (Agent Development Kit) adapter.
 * Primary target — has native sub-agent support for complex workflows.
 *
 * NOTE: @google/adk is a peer dependency. This module only loads
 * when explicitly imported and the package is installed.
 */

import type {
  LlmAdapter,
  LlmResponse,
  Message,
  RunOptions,
  ToolCall,
} from '../base-adapter.js';
import type { ToolDefinition } from '../../tools/tool-registry.js';
import type { WorkflowDefinition } from '../../workflows/workflow-schema.js';
import { toAdkFunctions, type AdkFunctionDef } from '../../tools/formats/adk-tools.js';
import { executeToolCall } from '../../tools/tool-executor.js';
import { executeWorkflow } from '../../workflows/workflow-engine.js';
import type { BridgeClient } from '../../client/bridge-client.js';

export interface AdkAdapterOptions {
  /** Google API key (or set GOOGLE_API_KEY env var) */
  apiKey?: string;
  /** Model name (default: gemini-2.0-flash) */
  model?: string;
  /** Bridge client for workflow execution */
  bridgeClient?: BridgeClient;
}

/**
 * ADK Adapter — wraps Google's Agent Development Kit.
 *
 * Since ADK has its own agent runtime, this adapter provides two modes:
 * 1. Standard chat/run — uses ADK's LLM with our tool definitions
 * 2. Workflow execution — maps our workflow definitions to ADK agent hierarchy
 */
export class AdkAdapter implements LlmAdapter {
  readonly provider = 'google-adk';

  private apiKey: string;
  private model: string;
  private bridgeClient?: BridgeClient;
  private tools: ToolDefinition[] = [];
  private adkFunctions: AdkFunctionDef[] = [];
  private toolRegistry = new Map<string, ToolDefinition>();

  constructor(options?: AdkAdapterOptions) {
    this.apiKey = options?.apiKey ?? process.env.GOOGLE_API_KEY ?? '';
    this.model = options?.model ?? 'gemini-2.0-flash';
    this.bridgeClient = options?.bridgeClient;
  }

  setTools(tools: ToolDefinition[]): void {
    this.tools = tools;
    this.adkFunctions = toAdkFunctions(tools);
    this.toolRegistry.clear();
    for (const tool of tools) {
      this.toolRegistry.set(tool.name, tool);
    }
  }

  /**
   * Chat using the Gemini API directly with function calling.
   * For full ADK agent features, use runWithAdk() instead.
   */
  async chat(messages: Message[]): Promise<LlmResponse> {
    // Build Gemini-format messages
    const contents: Array<{
      role: string;
      parts: Array<{ text?: string; functionCall?: unknown; functionResponse?: unknown }>;
    }> = [];

    let systemInstruction: string | undefined;

    for (const m of messages) {
      if (m.role === 'system') {
        systemInstruction = m.content;
        continue;
      }
      if (m.role === 'tool') {
        contents.push({
          role: 'function',
          parts: [
            {
              functionResponse: {
                name: m.toolName,
                response: JSON.parse(m.content),
              },
            },
          ],
        });
        continue;
      }

      const role = m.role === 'assistant' ? 'model' : 'user';
      contents.push({ role, parts: [{ text: m.content }] });
    }

    // Build tool declarations for Gemini
    const toolDeclarations = this.tools.map((t) => ({
      name: t.name,
      description: t.description,
      parameters: t.parameters,
    }));

    const body: Record<string, unknown> = {
      contents,
      ...(systemInstruction
        ? { system_instruction: { parts: [{ text: systemInstruction }] } }
        : {}),
      ...(toolDeclarations.length > 0
        ? { tools: [{ function_declarations: toolDeclarations }] }
        : {}),
    };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API error ${response.status}: ${error}`);
    }

    const data = (await response.json()) as {
      candidates: Array<{
        content: {
          parts: Array<{
            text?: string;
            functionCall?: { name: string; args: Record<string, unknown> };
          }>;
        };
        finishReason: string;
      }>;
      usageMetadata?: {
        promptTokenCount: number;
        candidatesTokenCount: number;
      };
    };

    const candidate = data.candidates[0];
    const textParts = candidate.content.parts
      .filter((p) => p.text)
      .map((p) => p.text!)
      .join('');

    const toolCalls: ToolCall[] = candidate.content.parts
      .filter((p) => p.functionCall)
      .map((p, i) => ({
        id: `call_${i}`,
        name: p.functionCall!.name,
        arguments: p.functionCall!.args,
      }));

    return {
      content: textParts,
      toolCalls,
      done: candidate.finishReason === 'STOP' && toolCalls.length === 0,
      stopReason: candidate.finishReason,
      usage: data.usageMetadata
        ? {
            inputTokens: data.usageMetadata.promptTokenCount,
            outputTokens: data.usageMetadata.candidatesTokenCount,
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

  /**
   * Run a workflow using this adapter as the LLM handler.
   * For phases that require LLM decisions, this adapter's chat() is used.
   */
  async runWorkflow(
    workflow: WorkflowDefinition,
    config?: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    if (!this.bridgeClient) {
      throw new Error('Bridge client required for workflow execution');
    }

    const result = await executeWorkflow(workflow, {
      client: this.bridgeClient,
      llmHandler: async (prompt) => {
        const response = await this.run(prompt, {
          systemInstruction: workflow.systemInstruction,
          maxTurns: 10,
        });
        return response;
      },
      initialConfig: config,
    });

    return result.outputs;
  }
}
