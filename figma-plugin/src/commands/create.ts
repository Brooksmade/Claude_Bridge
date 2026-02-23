import type { FigmaCommand, CommandResult, CreatePayload } from './types';
import { successResult, errorResult } from './types';
import { createNode, applyProperties, applyChildLayoutProperties, getParentNode } from '../utils/node-factory';

export async function handleCreate(command: FigmaCommand): Promise<CommandResult> {
  const payload = command.payload as CreatePayload;

  if (!payload.nodeType) {
    return errorResult(command.id, 'Missing nodeType in payload');
  }

  try {
    // Get parent node
    const parent = await getParentNode(payload.parent);
    if (!parent) {
      return errorResult(command.id, `Parent node not found: ${payload.parent}`);
    }

    // Create the node
    const node = createNode(payload.nodeType);

    // Apply properties (except child layout props which need parent first)
    const properties = payload.properties || {};
    await applyProperties(node, properties);

    // Move to parent if specified (not the current page)
    if (payload.parent && parent !== figma.currentPage) {
      parent.appendChild(node);
    }

    // Apply child layout properties AFTER appending to parent
    // (layoutSizingHorizontal, layoutGrow, etc. require an auto-layout parent)
    applyChildLayoutProperties(node, properties);

    // Handle nested children recursively
    const allNodeIds: string[] = [node.id];

    if (payload.children && Array.isArray(payload.children) && 'children' in node) {
      for (const childPayload of payload.children) {
        const childResult = await createChild(
          node as SceneNode & ChildrenMixin,
          childPayload,
          command.id
        );
        if (childResult.success && childResult.nodeId) {
          allNodeIds.push(childResult.nodeId);
        }
        if (childResult.nodeIds) {
          for (let i = 0; i < childResult.nodeIds.length; i++) {
            allNodeIds.push(childResult.nodeIds[i]);
          }
        }
      }
    }

    // Select and scroll to the created node
    figma.currentPage.selection = [node];
    figma.viewport.scrollAndZoomIntoView([node]);

    return successResult(command.id, {
      nodeId: node.id,
      nodeIds: allNodeIds.length > 1 ? allNodeIds : undefined,
      data: {
        type: node.type,
        name: node.name,
        x: node.x,
        y: node.y,
        width: 'width' in node ? node.width : undefined,
        height: 'height' in node ? node.height : undefined,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return errorResult(command.id, message);
  }
}

// Create a child node recursively
async function createChild(
  parent: SceneNode & ChildrenMixin,
  payload: CreatePayload,
  commandId: string
): Promise<CommandResult> {
  try {
    const node = createNode(payload.nodeType);
    const properties = payload.properties || {};
    await applyProperties(node, properties);

    parent.appendChild(node);

    // Apply child layout properties after appendChild
    applyChildLayoutProperties(node, properties);

    const allNodeIds: string[] = [node.id];

    // Recursively create grandchildren
    if (payload.children && Array.isArray(payload.children) && 'children' in node) {
      for (const grandchildPayload of payload.children) {
        const grandchildResult = await createChild(
          node as SceneNode & ChildrenMixin,
          grandchildPayload,
          commandId
        );
        if (grandchildResult.success && grandchildResult.nodeId) {
          allNodeIds.push(grandchildResult.nodeId);
        }
        if (grandchildResult.nodeIds) {
          for (let i = 0; i < grandchildResult.nodeIds.length; i++) {
            allNodeIds.push(grandchildResult.nodeIds[i]);
          }
        }
      }
    }

    return successResult(commandId, {
      nodeId: node.id,
      nodeIds: allNodeIds.length > 1 ? allNodeIds : undefined,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return errorResult(commandId, message);
  }
}

// Create an instance of a component
export async function handleCreateInstance(command: FigmaCommand): Promise<CommandResult> {
  const payload = command.payload as {
    componentId: string;
    parent?: string;
    x?: number;
    y?: number;
  };

  if (!payload.componentId) {
    return errorResult(command.id, 'Missing componentId in payload');
  }

  try {
    const componentNode = await figma.getNodeByIdAsync(payload.componentId);

    if (!componentNode) {
      return errorResult(command.id, 'Component not found: ' + payload.componentId);
    }

    if (componentNode.type !== 'COMPONENT' && componentNode.type !== 'COMPONENT_SET') {
      return errorResult(command.id, 'Node is not a component: ' + componentNode.type);
    }

    const component = componentNode as ComponentNode;
    const instance = component.createInstance();

    // Set position if specified
    if (payload.x !== undefined) {
      instance.x = payload.x;
    }
    if (payload.y !== undefined) {
      instance.y = payload.y;
    }

    // Move to parent if specified
    if (payload.parent) {
      const parent = await figma.getNodeByIdAsync(payload.parent);
      if (parent && 'appendChild' in parent) {
        (parent as FrameNode).appendChild(instance);
      }
    }

    figma.currentPage.selection = [instance];
    figma.viewport.scrollAndZoomIntoView([instance]);

    return successResult(command.id, {
      nodeId: instance.id,
      data: {
        type: instance.type,
        name: instance.name,
        x: instance.x,
        y: instance.y,
        width: instance.width,
        height: instance.height,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return errorResult(command.id, message);
  }
}

// Create multiple nodes in batch
export async function handleBatchCreate(command: FigmaCommand): Promise<CommandResult> {
  const payloads = command.payload as CreatePayload[];

  if (!Array.isArray(payloads)) {
    return errorResult(command.id, 'Batch create requires an array of payloads');
  }

  const createdIds: string[] = [];
  const errors: string[] = [];

  for (const payload of payloads) {
    try {
      const parent = await getParentNode(payload.parent);
      if (!parent) {
        errors.push(`Parent not found: ${payload.parent}`);
        continue;
      }

      const node = createNode(payload.nodeType);
      await applyProperties(node, payload.properties || {});

      if (payload.parent && parent !== figma.currentPage) {
        parent.appendChild(node);
      }

      createdIds.push(node.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(message);
    }
  }

  if (errors.length > 0 && createdIds.length === 0) {
    return errorResult(command.id, errors.join('; '));
  }

  return successResult(command.id, {
    nodeIds: createdIds,
    data: {
      created: createdIds.length,
      errors: errors.length > 0 ? errors : undefined,
    },
  });
}
