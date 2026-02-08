// Types (inline to avoid bundling issues)
interface FigmaCommand {
  id: string;
  type: string;
  target?: string;
  payload: unknown;
  timestamp: number;
}

interface CommandResult {
  commandId: string;
  success: boolean;
  nodeId?: string;
  nodeIds?: string[];
  error?: string;
  data?: unknown;
  timestamp: number;
}

interface PollResponse {
  commands: FigmaCommand[];
}

const BRIDGE_URL = 'http://localhost:4001';

export async function pollCommands(): Promise<FigmaCommand[]> {
  try {
    const response = await fetch(`${BRIDGE_URL}/commands`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = (await response.json()) as PollResponse;
    return data.commands || [];
  } catch (error) {
    // Connection errors are expected when server is not running
    throw error;
  }
}

// Long polling - holds connection open until command arrives or timeout
export async function longPollCommands(timeoutMs: number = 30000): Promise<FigmaCommand[]> {
  try {
    const response = await fetch(`${BRIDGE_URL}/commands/poll?timeout=${timeoutMs}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = (await response.json()) as PollResponse;
    return data.commands || [];
  } catch (error) {
    throw error;
  }
}

export async function submitResult(result: CommandResult): Promise<void> {
  try {
    const response = await fetch(`${BRIDGE_URL}/results`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(result),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (error) {
    console.error('Failed to submit result:', error);
    throw error;
  }
}

export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${BRIDGE_URL}/health`, {
      method: 'GET',
    });
    return response.ok;
  } catch (_e) {
    return false;
  }
}

// Submit log to bridge server (fire-and-forget, never throws)
export function submitLog(message: string, type: 'info' | 'success' | 'error' = 'info'): void {
  fetch(`${BRIDGE_URL}/logs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, type }),
  }).catch(() => {
    // Silently ignore log submission failures
  });
}
