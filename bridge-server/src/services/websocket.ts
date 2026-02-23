import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';
import type { CommandResult, StatusUpdate } from '@bridge-to-fig/shared';
import { queue } from './queue.js';

let wss: WebSocketServer | null = null;
const clients: Set<WebSocket> = new Set();

export function setupWebSocket(server: Server): WebSocketServer {
  wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws) => {
    console.log('[WebSocket] Client connected');
    clients.add(ws);

    // Send connection confirmation
    const statusUpdate: StatusUpdate = {
      type: 'connected',
      message: 'Connected to Bridge to Fig',
      timestamp: Date.now(),
    };
    ws.send(JSON.stringify(statusUpdate));

    ws.on('close', () => {
      console.log('[WebSocket] Client disconnected');
      clients.delete(ws);
    });

    ws.on('error', (error) => {
      console.error('[WebSocket] Client error:', error);
      clients.delete(ws);
    });
  });

  // Subscribe to command results
  queue.onResult((result: CommandResult) => {
    broadcast({
      type: 'result_available',
      commandId: result.commandId,
      message: result.success ? 'Command completed' : `Error: ${result.error}`,
      timestamp: Date.now(),
    });
  });

  console.log('[WebSocket] Server initialized on /ws');
  return wss;
}

export function broadcast(update: StatusUpdate): void {
  const message = JSON.stringify(update);
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

export function broadcastResult(result: CommandResult): void {
  broadcast({
    type: 'result_available',
    commandId: result.commandId,
    timestamp: Date.now(),
  });
}

export function getConnectedClients(): number {
  return clients.size;
}
