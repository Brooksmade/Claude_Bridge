import { PROTOCOL_VERSION, MIN_PROTOCOL_VERSION, APP_VERSION } from '../version';

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

export interface HealthCheckResult {
  ok: boolean;
  compatible: boolean;
  serverVersion?: string;
  serverProtocolVersion?: number;
  latestRelease?: { version: string; url: string; notes: string };
  error?: string;
}

const BRIDGE_URL = 'http://localhost:4001';

const VERSION_HEADERS: Record<string, string> = {
  'X-Plugin-Version': APP_VERSION,
  'X-Plugin-Protocol': String(PROTOCOL_VERSION),
};

export async function pollCommands(): Promise<FigmaCommand[]> {
  try {
    const response = await fetch(`${BRIDGE_URL}/commands`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...VERSION_HEADERS,
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
        ...VERSION_HEADERS,
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
        ...VERSION_HEADERS,
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

export async function checkHealth(): Promise<HealthCheckResult> {
  try {
    const response = await fetch(`${BRIDGE_URL}/health`, {
      method: 'GET',
      headers: VERSION_HEADERS,
    });

    if (!response.ok) {
      return { ok: false, compatible: false, error: `HTTP ${response.status}` };
    }

    const body = await response.json() as Record<string, unknown>;

    const serverProto = typeof body.protocolVersion === 'number' ? body.protocolVersion : undefined;
    const serverMinProto = typeof body.minPluginProtocolVersion === 'number' ? body.minPluginProtocolVersion : undefined;
    const serverVersion = typeof body.serverVersion === 'string' ? body.serverVersion : undefined;

    // If the server doesn't send protocol fields, assume compatible (old server)
    let compatible = true;
    if (serverProto !== undefined && serverMinProto !== undefined) {
      // Bidirectional check: each side's protocol >= the other's minimum
      compatible = serverProto >= MIN_PROTOCOL_VERSION && PROTOCOL_VERSION >= serverMinProto;
    }

    // Parse optional latestRelease from server
    let latestRelease: HealthCheckResult['latestRelease'];
    if (body.latestRelease && typeof body.latestRelease === 'object') {
      const lr = body.latestRelease as Record<string, unknown>;
      if (typeof lr.version === 'string' && typeof lr.url === 'string') {
        latestRelease = {
          version: lr.version,
          url: lr.url,
          notes: typeof lr.notes === 'string' ? lr.notes : '',
        };
      }
    }

    return {
      ok: true,
      compatible,
      serverVersion,
      serverProtocolVersion: serverProto,
      ...(latestRelease ? { latestRelease } : {}),
    };
  } catch (_e) {
    return { ok: false, compatible: false, error: 'Connection failed' };
  }
}

// Submit log to bridge server (fire-and-forget, never throws)
export function submitLog(message: string, type: 'info' | 'success' | 'error' = 'info'): void {
  fetch(`${BRIDGE_URL}/logs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...VERSION_HEADERS,
    },
    body: JSON.stringify({ message, type }),
  }).catch(() => {
    // Silently ignore log submission failures
  });
}
