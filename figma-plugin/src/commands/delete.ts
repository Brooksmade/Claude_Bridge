import type { FigmaCommand, CommandResult } from './types';
import { successResult, errorResult } from './types';

export async function handleDelete(command: FigmaCommand): Promise<CommandResult> {
  const targetId = command.target;

  if (!targetId) {
    return errorResult(command.id, 'No target node specified');
  }

  const node = await figma.getNodeByIdAsync(targetId);

  if (!node) {
    return errorResult(command.id, `Node not found: ${targetId}`);
  }

  if (node.type === 'DOCUMENT' || node.type === 'PAGE') {
    return errorResult(command.id, 'Cannot delete document or page nodes');
  }

  const nodeName = node.name;
  const nodeType = node.type;

  try {
    (node as SceneNode).remove();

    return successResult(command.id, {
      data: {
        deleted: true,
        name: nodeName,
        type: nodeType,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return errorResult(command.id, message);
  }
}

// Delete multiple nodes
export async function handleBatchDelete(command: FigmaCommand): Promise<CommandResult> {
  const payload = command.payload as { targets: string[] };

  if (!payload.targets || !Array.isArray(payload.targets)) {
    return errorResult(command.id, 'Batch delete requires targets array');
  }

  const deletedIds: string[] = [];
  const errors: string[] = [];

  for (const targetId of payload.targets) {
    const node = await figma.getNodeByIdAsync(targetId);

    if (!node) {
      errors.push(`Node not found: ${targetId}`);
      continue;
    }

    if (node.type === 'DOCUMENT' || node.type === 'PAGE') {
      errors.push(`Cannot delete: ${targetId} (${node.type})`);
      continue;
    }

    try {
      (node as SceneNode).remove();
      deletedIds.push(targetId);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`${targetId}: ${message}`);
    }
  }

  if (errors.length > 0 && deletedIds.length === 0) {
    return errorResult(command.id, errors.join('; '));
  }

  return successResult(command.id, {
    nodeIds: deletedIds,
    data: {
      deleted: deletedIds.length,
      errors: errors.length > 0 ? errors : undefined,
    },
  });
}

// Delete all children of a node
export async function handleDeleteChildren(command: FigmaCommand): Promise<CommandResult> {
  const targetId = command.target;

  if (!targetId) {
    // Delete all children of current page
    const children = figma.currentPage.children.slice();
    let deletedCount = 0;

    for (const child of children) {
      try {
        child.remove();
        deletedCount++;
      } catch (e) {
        // Skip nodes that can't be deleted
      }
    }

    return successResult(command.id, {
      data: { deleted: deletedCount },
    });
  }

  const node = await figma.getNodeByIdAsync(targetId);

  if (!node || !('children' in node)) {
    return errorResult(command.id, `Node not found or has no children: ${targetId}`);
  }

  const parent = node as FrameNode;
  const children = parent.children.slice();
  let deletedCount = 0;

  for (const child of children) {
    try {
      child.remove();
      deletedCount++;
    } catch (e) {
      // Skip nodes that can't be deleted
    }
  }

  return successResult(command.id, {
    nodeId: targetId,
    data: { deleted: deletedCount },
  });
}

// Delete selected nodes
export async function handleDeleteSelection(command: FigmaCommand): Promise<CommandResult> {
  const selection = figma.currentPage.selection;

  if (selection.length === 0) {
    return errorResult(command.id, 'No nodes selected');
  }

  const deletedIds: string[] = [];

  for (const node of selection) {
    try {
      const id = node.id;
      node.remove();
      deletedIds.push(id);
    } catch (e) {
      // Skip nodes that can't be deleted
    }
  }

  // Clear selection
  figma.currentPage.selection = [];

  return successResult(command.id, {
    nodeIds: deletedIds,
    data: { deleted: deletedIds.length },
  });
}
