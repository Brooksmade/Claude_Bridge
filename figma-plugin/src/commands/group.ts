import type { FigmaCommand, CommandResult } from './types';
import { successResult, errorResult } from './types';
import { serializeNode } from '../utils/node-factory';

// Group selected nodes or specified nodes
export async function handleGroup(command: FigmaCommand): Promise<CommandResult> {
  const payload = command.payload as {
    nodeIds?: string[];
    name?: string;
  };

  let nodesToGroup: SceneNode[];

  if (payload.nodeIds && payload.nodeIds.length > 0) {
    nodesToGroup = [];
    for (const nodeId of payload.nodeIds) {
      const node = await figma.getNodeByIdAsync(nodeId);
      if (node && node.type !== 'DOCUMENT' && node.type !== 'PAGE') {
        nodesToGroup.push(node as SceneNode);
      }
    }
  } else {
    nodesToGroup = figma.currentPage.selection.slice();
  }

  if (nodesToGroup.length === 0) {
    return errorResult(command.id, 'No nodes to group');
  }

  if (nodesToGroup.length === 1) {
    return errorResult(command.id, 'Need at least 2 nodes to create a group');
  }

  // All nodes must have the same parent
  const parent = nodesToGroup[0].parent;
  if (!parent || !('children' in parent)) {
    return errorResult(command.id, 'Cannot determine parent for grouping');
  }

  for (const node of nodesToGroup) {
    if (node.parent !== parent) {
      return errorResult(command.id, 'All nodes must have the same parent to be grouped');
    }
  }

  try {
    const group = figma.group(nodesToGroup, parent as FrameNode & ChildrenMixin);

    if (payload.name) {
      group.name = payload.name;
    }

    figma.currentPage.selection = [group];

    return successResult(command.id, {
      nodeId: group.id,
      data: serializeNode(group),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return errorResult(command.id, message);
  }
}

// Ungroup a group node
export async function handleUngroup(command: FigmaCommand): Promise<CommandResult> {
  const targetId = command.target;

  let nodeToUngroup: SceneNode;

  if (targetId) {
    const node = await figma.getNodeByIdAsync(targetId);
    if (!node || (node.type !== 'GROUP' && node.type !== 'FRAME')) {
      return errorResult(command.id, `Cannot ungroup node: ${targetId}`);
    }
    nodeToUngroup = node as SceneNode;
  } else {
    const selection = figma.currentPage.selection;
    if (selection.length !== 1) {
      return errorResult(command.id, 'Select exactly one group to ungroup');
    }
    nodeToUngroup = selection[0];
  }

  if (nodeToUngroup.type !== 'GROUP' && nodeToUngroup.type !== 'FRAME') {
    return errorResult(command.id, 'Node is not a group or frame');
  }

  try {
    const children = figma.ungroup(nodeToUngroup as GroupNode);
    figma.currentPage.selection = children;

    return successResult(command.id, {
      nodeIds: children.map((n) => n.id),
      data: {
        ungrouped: children.length,
        children: children.map((n) => ({ id: n.id, name: n.name, type: n.type })),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return errorResult(command.id, message);
  }
}

// Flatten nodes into a vector
export async function handleFlatten(command: FigmaCommand): Promise<CommandResult> {
  const payload = command.payload as { nodeIds?: string[] };

  let nodesToFlatten: SceneNode[];

  if (payload.nodeIds && payload.nodeIds.length > 0) {
    nodesToFlatten = [];
    for (const nodeId of payload.nodeIds) {
      const node = await figma.getNodeByIdAsync(nodeId);
      if (node && node.type !== 'DOCUMENT' && node.type !== 'PAGE') {
        nodesToFlatten.push(node as SceneNode);
      }
    }
  } else {
    nodesToFlatten = figma.currentPage.selection.slice();
  }

  if (nodesToFlatten.length === 0) {
    return errorResult(command.id, 'No nodes to flatten');
  }

  try {
    const parent = nodesToFlatten[0].parent as FrameNode & ChildrenMixin;
    const vector = figma.flatten(nodesToFlatten, parent);

    figma.currentPage.selection = [vector];

    return successResult(command.id, {
      nodeId: vector.id,
      data: serializeNode(vector),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return errorResult(command.id, message);
  }
}

// Clone a node
export async function handleClone(command: FigmaCommand): Promise<CommandResult> {
  const targetId = command.target;
  const payload = command.payload as {
    count?: number;
    offsetX?: number;
    offsetY?: number;
  };

  if (!targetId) {
    return errorResult(command.id, 'No target node specified');
  }

  const node = await figma.getNodeByIdAsync(targetId);

  if (!node || node.type === 'DOCUMENT' || node.type === 'PAGE') {
    return errorResult(command.id, `Cannot clone node: ${targetId}`);
  }

  const sceneNode = node as SceneNode;
  const count = payload.count || 1;
  const offsetX = payload.offsetX || 20;
  const offsetY = payload.offsetY || 20;

  const clonedIds: string[] = [];

  try {
    for (let i = 0; i < count; i++) {
      const clone = sceneNode.clone();
      clone.x = sceneNode.x + offsetX * (i + 1);
      clone.y = sceneNode.y + offsetY * (i + 1);
      clonedIds.push(clone.id);
    }

    // Select all cloned nodes
    const clonedNodes: SceneNode[] = [];
    for (const id of clonedIds) {
      const n = await figma.getNodeByIdAsync(id);
      if (n && n.type !== 'DOCUMENT' && n.type !== 'PAGE') {
        clonedNodes.push(n as SceneNode);
      }
    }

    figma.currentPage.selection = clonedNodes;

    return successResult(command.id, {
      nodeIds: clonedIds,
      data: { cloned: clonedIds.length },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return errorResult(command.id, message);
  }
}

// Boolean operations
export async function handleBooleanOperation(command: FigmaCommand): Promise<CommandResult> {
  const payload = command.payload as {
    operation: 'UNION' | 'SUBTRACT' | 'INTERSECT' | 'EXCLUDE';
    nodeIds?: string[];
  };

  let nodes: SceneNode[];

  if (payload.nodeIds && payload.nodeIds.length > 0) {
    nodes = [];
    for (const nodeId of payload.nodeIds) {
      const node = await figma.getNodeByIdAsync(nodeId);
      if (node && node.type !== 'DOCUMENT' && node.type !== 'PAGE') {
        nodes.push(node as SceneNode);
      }
    }
  } else {
    nodes = figma.currentPage.selection.slice();
  }

  if (nodes.length < 2) {
    return errorResult(command.id, 'Need at least 2 nodes for boolean operation');
  }

  // All nodes must have the same parent
  const parent = nodes[0].parent as FrameNode & ChildrenMixin;

  try {
    let result: BooleanOperationNode;

    switch (payload.operation) {
      case 'UNION':
        result = figma.union(nodes, parent);
        break;
      case 'SUBTRACT':
        result = figma.subtract(nodes, parent);
        break;
      case 'INTERSECT':
        result = figma.intersect(nodes, parent);
        break;
      case 'EXCLUDE':
        result = figma.exclude(nodes, parent);
        break;
      default:
        return errorResult(command.id, `Unknown operation: ${payload.operation}`);
    }

    figma.currentPage.selection = [result];

    return successResult(command.id, {
      nodeId: result.id,
      data: serializeNode(result),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return errorResult(command.id, message);
  }
}
