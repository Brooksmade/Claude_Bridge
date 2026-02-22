/**
 * Abstract base adapter for LLM providers.
 * All adapters implement this interface.
 */

import type { ToolDefinition } from '../tools/tool-registry.js';
import type { WorkflowDefinition } from '../workflows/workflow-schema.js';

/**
 * A message in the conversation.
 */
export interface Message {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  /** Tool call ID (for tool result messages) */
  toolCallId?: string;
  /** Tool name (for tool result messages) */
  toolName?: string;
}

/**
 * A tool call requested by the LLM.
 */
export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

/**
 * Response from the LLM.
 */
export interface LlmResponse {
  /** Text content (may be empty if only tool calls) */
  content: string;
  /** Tool calls requested by the LLM */
  toolCalls: ToolCall[];
  /** Whether the LLM is done (no more tool calls) */
  done: boolean;
  /** Stop reason */
  stopReason?: string;
  /** Usage stats */
  usage?: { inputTokens: number; outputTokens: number };
}

/**
 * Options for running a conversation.
 */
export interface RunOptions {
  /** Maximum number of conversation turns (tool call rounds) */
  maxTurns?: number;
  /** System instruction */
  systemInstruction?: string;
  /** Callback on each LLM response */
  onResponse?: (response: LlmResponse) => void;
  /** Callback on each tool result */
  onToolResult?: (name: string, result: unknown) => void;
}

/**
 * Abstract LLM adapter interface.
 */
export interface LlmAdapter {
  /** Provider name */
  readonly provider: string;

  /**
   * Register tools that the LLM can call.
   */
  setTools(tools: ToolDefinition[]): void;

  /**
   * Send a message and get a response.
   * If the response includes tool calls, the adapter should NOT execute them —
   * the runner handles tool execution.
   */
  chat(messages: Message[]): Promise<LlmResponse>;

  /**
   * Run a complete conversation loop:
   * send message → execute tool calls → send results → repeat until done.
   */
  run(userMessage: string, options?: RunOptions): Promise<string>;

  /**
   * Run a workflow definition using this LLM as the decision-maker.
   */
  runWorkflow?(
    workflow: WorkflowDefinition,
    config?: Record<string, unknown>
  ): Promise<Record<string, unknown>>;
}
