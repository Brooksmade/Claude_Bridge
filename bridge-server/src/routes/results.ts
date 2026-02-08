import { Router, type Request, type Response, type Router as RouterType } from 'express';
import type { CommandResult } from '@figma-claude-bridge/shared';
import { queue } from '../services/queue.js';

const router: RouterType = Router();

// POST /results - Submit command result (called by Figma plugin)
router.post('/', (req: Request, res: Response) => {
  try {
    const result = req.body as CommandResult;

    if (!result.commandId) {
      res.status(400).json({ error: 'Missing required field: commandId' });
      return;
    }

    // Ensure timestamp is set
    const fullResult: CommandResult = {
      ...result,
      timestamp: result.timestamp || Date.now(),
    };

    queue.addResult(fullResult);

    res.json({
      success: true,
      message: 'Result recorded',
    });
  } catch (error) {
    console.error('[Results] Error recording result:', error);
    res.status(500).json({ error: 'Failed to record result' });
  }
});

// GET /results/:id/status - Check command status without waiting
router.get('/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const result = queue.getResult(id);
  const pending = queue.hasPendingCommand(id);

  res.json({
    commandId: id,
    status: result ? 'completed' : pending ? 'pending' : 'unknown',
    hasResult: !!result,
    success: result?.success
  });
});

// GET /results/:id - Get result for specific command (called by Claude Code)
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const wait = req.query.wait === 'true';
    const timeout = parseInt(req.query.timeout as string) || 30000;

    let result: CommandResult | undefined | null;

    if (wait) {
      // Long-polling: wait for result with timeout
      result = await queue.waitForResult(id, Math.min(timeout, 300000)); // 5 min max for long-running commands
      if (!result) {
        res.status(408).json({ error: 'Timeout waiting for result' });
        return;
      }
    } else {
      result = queue.getResult(id);
      if (!result) {
        res.status(404).json({ error: 'Result not found' });
        return;
      }
    }

    res.json(result);
  } catch (error) {
    console.error('[Results] Error getting result:', error);
    res.status(500).json({ error: 'Failed to get result' });
  }
});

export default router;
