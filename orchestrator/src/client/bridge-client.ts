/**
 * Bridge HTTP client for communicating with the Figma bridge server.
 * Wraps the POST /commands → GET /results/:id protocol.
 */

import { getConfig, type OrchestratorConfig } from '../utils/config.js';
import {
  pollForResult,
  checkStatus,
  type PollResult,
} from './result-poller.js';
import { LONG_RUNNING_COMMANDS, SERVER_SIDE_COMMANDS } from '../schema/command-catalog.js';

export interface SendResult {
  commandId: string;
  message: string;
}

export interface HealthStatus {
  wsClients: number;
  pendingCommands: number;
  storedResults: number;
}

export interface BridgeClientOptions {
  /** Override the bridge URL from global config */
  bridgeUrl?: string;
  /** Override the default timeout */
  defaultTimeout?: number;
  /** Override the long-running timeout */
  longRunningTimeout?: number;
}

export class BridgeClient {
  private baseUrl: string;
  private defaultTimeout: number;
  private longRunningTimeout: number;

  constructor(options?: BridgeClientOptions) {
    const config = getConfig();
    this.baseUrl = options?.bridgeUrl ?? config.bridgeUrl;
    this.defaultTimeout = options?.defaultTimeout ?? config.defaultTimeout;
    this.longRunningTimeout =
      options?.longRunningTimeout ?? config.longRunningTimeout;
  }

  /**
   * Send a command to the bridge server without waiting for the result.
   * Returns the commandId for later polling.
   */
  async send(
    type: string,
    payload?: Record<string, unknown>,
    target?: string
  ): Promise<SendResult> {
    const body: Record<string, unknown> = { type };
    if (payload) body.payload = payload;
    if (target) body.target = target;

    const response = await fetch(`${this.baseUrl}/commands`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        (error as { error?: string }).error ||
          `HTTP ${response.status}: ${response.statusText}`
      );
    }

    const result = (await response.json()) as {
      success: boolean;
      commandId: string;
      message: string;
    };
    return { commandId: result.commandId, message: result.message };
  }

  /**
   * Get the result of a previously sent command.
   * Supports long-polling with configurable timeout.
   */
  async getResult(
    commandId: string,
    options?: { wait?: boolean; timeout?: number }
  ): Promise<PollResult> {
    const wait = options?.wait ?? true;
    const timeout = options?.timeout ?? this.defaultTimeout;

    return pollForResult(commandId, {
      baseUrl: this.baseUrl,
      timeout,
      useLongPoll: wait,
    });
  }

  /**
   * Send a command and wait for its result (one-call convenience).
   * Auto-selects timeout based on command type.
   */
  async execute(
    type: string,
    payload?: Record<string, unknown>,
    target?: string,
    options?: { timeout?: number }
  ): Promise<PollResult> {
    const { commandId } = await this.send(type, payload, target);

    const isLongRunning =
      LONG_RUNNING_COMMANDS.has(type) || SERVER_SIDE_COMMANDS.has(type);
    const timeout =
      options?.timeout ??
      (isLongRunning ? this.longRunningTimeout : this.defaultTimeout);

    return this.getResult(commandId, { wait: true, timeout });
  }

  /**
   * Check the status of a command without waiting.
   */
  async status(
    commandId: string
  ): Promise<{ status: 'completed' | 'pending' | 'unknown'; success?: boolean }> {
    return checkStatus(commandId, this.baseUrl);
  }

  /**
   * Ping the Figma plugin to verify connectivity.
   */
  async ping(): Promise<boolean> {
    try {
      const result = await this.execute('ping', {});
      return result.success && !!(result.data as { pong?: boolean })?.pong;
    } catch {
      return false;
    }
  }

  /**
   * Get bridge server health status.
   */
  async health(): Promise<HealthStatus> {
    const response = await fetch(`${this.baseUrl}/health`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json() as Promise<HealthStatus>;
  }

  /**
   * Cancel a pending command.
   */
  async cancel(commandId: string): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/commands/${commandId}`, {
      method: 'DELETE',
    });
    if (response.status === 404) return false;
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return true;
  }
}
