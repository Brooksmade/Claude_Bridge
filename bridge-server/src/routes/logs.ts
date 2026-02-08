import { Router, type Request, type Response, type Router as RouterType } from 'express';
import { queue } from '../services/queue.js';

const router: RouterType = Router();

// POST /logs - Submit log entry (called by Figma plugin)
router.post('/', (req: Request, res: Response) => {
  try {
    const { message, type = 'info' } = req.body;

    if (!message) {
      res.status(400).json({ error: 'Missing required field: message' });
      return;
    }

    queue.addLog(message, type);

    res.json({ success: true });
  } catch (error) {
    console.error('[Logs] Error recording log:', error);
    res.status(500).json({ error: 'Failed to record log' });
  }
});

// GET /logs - Get recent logs (called by Claude Code)
router.get('/', (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const logs = queue.getLogs(limit);

    res.json({
      count: logs.length,
      logs: logs.map(log => ({
        ...log,
        time: new Date(log.timestamp).toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      })),
    });
  } catch (error) {
    console.error('[Logs] Error getting logs:', error);
    res.status(500).json({ error: 'Failed to get logs' });
  }
});

// DELETE /logs - Clear logs
router.delete('/', (req: Request, res: Response) => {
  queue.clearLogs();
  res.json({ success: true, message: 'Logs cleared' });
});

// Format duration in human-readable format (e.g., "1m 23s" or "456ms")
function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  const seconds = Math.floor(ms / 1000);
  const remainingMs = ms % 1000;
  if (seconds < 60) {
    return remainingMs > 0 ? `${seconds}s ${remainingMs}ms` : `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (remainingSeconds > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${minutes}m`;
}

// GET /logs/running - Get currently running command (for UI polling)
router.get('/running', (req: Request, res: Response) => {
  const running = queue.getRunningCommand();
  if (running) {
    res.json({
      running: true,
      commandId: running.commandId,
      commandType: running.commandType,
      elapsedMs: running.elapsedMs,
      elapsedFormatted: formatDuration(running.elapsedMs),
    });
  } else {
    res.json({ running: false });
  }
});

export default router;
