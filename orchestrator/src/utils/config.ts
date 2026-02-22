/**
 * Runtime configuration for the orchestrator.
 */
export interface OrchestratorConfig {
  /** Bridge server base URL (default: http://localhost:4001) */
  bridgeUrl: string;
  /** Default timeout for result polling in ms (default: 30000) */
  defaultTimeout: number;
  /** Timeout for long-running commands in ms (default: 300000) */
  longRunningTimeout: number;
  /** Polling interval when waiting for results in ms (default: 500) */
  pollInterval: number;
}

const defaults: OrchestratorConfig = {
  bridgeUrl: 'http://localhost:4001',
  defaultTimeout: 30000,
  longRunningTimeout: 300000,
  pollInterval: 500,
};

let current: OrchestratorConfig = { ...defaults };

export function getConfig(): OrchestratorConfig {
  return { ...current };
}

export function setConfig(overrides: Partial<OrchestratorConfig>): void {
  current = { ...current, ...overrides };
}

export function resetConfig(): void {
  current = { ...defaults };
}
