/**
 * Result poller for the bridge server.
 * Handles long-polling with configurable timeout.
 */

export interface PollOptions {
  /** Base URL of the bridge server */
  baseUrl: string;
  /** Maximum time to wait in ms */
  timeout: number;
  /** Use server-side long-polling (?wait=true) */
  useLongPoll: boolean;
}

export interface PollResult {
  success: boolean;
  commandId: string;
  nodeId?: string;
  nodeIds?: string[];
  error?: string;
  data?: unknown;
  timestamp: number;
}

/**
 * Poll for a command result from the bridge server.
 * Uses the server's built-in long-polling support.
 */
export async function pollForResult(
  commandId: string,
  options: PollOptions
): Promise<PollResult> {
  const { baseUrl, timeout, useLongPoll } = options;

  if (useLongPoll) {
    // Server-side long poll — single request that blocks until result or timeout
    const url = `${baseUrl}/results/${commandId}?wait=true&timeout=${timeout}`;
    const controller = new AbortController();
    const clientTimeout = setTimeout(() => controller.abort(), timeout + 5000);

    try {
      const response = await fetch(url, { signal: controller.signal });

      if (response.status === 408) {
        throw new Error(`Timeout waiting for result after ${timeout}ms`);
      }

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(
          (body as { error?: string }).error ||
            `HTTP ${response.status}: ${response.statusText}`
        );
      }

      return (await response.json()) as PollResult;
    } finally {
      clearTimeout(clientTimeout);
    }
  }

  // Client-side polling fallback
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const url = `${baseUrl}/results/${commandId}`;
    const response = await fetch(url);

    if (response.ok) {
      return (await response.json()) as PollResult;
    }

    if (response.status !== 404) {
      const body = await response.json().catch(() => ({}));
      throw new Error(
        (body as { error?: string }).error ||
          `HTTP ${response.status}: ${response.statusText}`
      );
    }

    // Not ready yet — wait before retrying
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`Timeout waiting for result after ${timeout}ms`);
}

/**
 * Check command status without waiting.
 */
export async function checkStatus(
  commandId: string,
  baseUrl: string
): Promise<{ status: 'completed' | 'pending' | 'unknown'; success?: boolean }> {
  const response = await fetch(`${baseUrl}/results/${commandId}/status`);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json() as Promise<{
    status: 'completed' | 'pending' | 'unknown';
    success?: boolean;
  }>;
}
