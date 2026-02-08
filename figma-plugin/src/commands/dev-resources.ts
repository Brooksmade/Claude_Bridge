import type { FigmaCommand, CommandResult } from './types';
import { successResult, errorResult } from './types';

// Get dev resources for a node
export async function handleGetDevResources(command: FigmaCommand): Promise<CommandResult> {
  var targetId = command.target;
  var payload = command.payload as {
    includeChildren?: boolean;
  };

  if (!targetId) {
    return errorResult(command.id, 'Target node ID is required');
  }

  try {
    var node = await figma.getNodeByIdAsync(targetId);

    if (!node) {
      return errorResult(command.id, 'Node not found: ' + targetId);
    }

    if (!('getDevResourcesAsync' in node)) {
      return errorResult(command.id, 'Node does not support getDevResourcesAsync');
    }

    var options = payload ? { includeChildren: payload.includeChildren } : undefined;
    var resources = await (node as any).getDevResourcesAsync(options);

    return successResult(command.id, {
      data: {
        nodeId: node.id,
        nodeName: node.name,
        resources: resources.map((r: any) => ({
          name: r.name,
          url: r.url,
          nodeId: r.nodeId,
        })),
      },
    });
  } catch (err) {
    var message = err instanceof Error ? err.message : String(err);
    return errorResult(command.id, 'Failed to get dev resources: ' + message);
  }
}

// Set dev resource preview
export async function handleSetDevResourcePreview(command: FigmaCommand): Promise<CommandResult> {
  var targetId = command.target;
  var payload = command.payload as {
    url: string;
    preview: string; // Plain text preview
  };

  if (!targetId) {
    return errorResult(command.id, 'Target node ID is required');
  }

  if (!payload || !payload.url || !payload.preview) {
    return errorResult(command.id, 'URL and preview text are required');
  }

  try {
    var node = await figma.getNodeByIdAsync(targetId);

    if (!node) {
      return errorResult(command.id, 'Node not found: ' + targetId);
    }

    if (!('setDevResourcePreviewAsync' in node)) {
      return errorResult(command.id, 'Node does not support setDevResourcePreviewAsync');
    }

    await (node as any).setDevResourcePreviewAsync(payload.url, {
      type: 'PLAIN_TEXT',
      text: payload.preview,
    });

    return successResult(command.id, {
      data: {
        nodeId: node.id,
        url: payload.url,
        success: true,
      },
    });
  } catch (err) {
    var message = err instanceof Error ? err.message : String(err);
    return errorResult(command.id, 'Failed to set dev resource preview: ' + message);
  }
}

// Get shared plugin data
export async function handleGetSharedPluginData(command: FigmaCommand): Promise<CommandResult> {
  var targetId = command.target;
  var payload = command.payload as {
    namespace: string;
    key: string;
  };

  if (!targetId) {
    return errorResult(command.id, 'Target node ID is required');
  }

  if (!payload || !payload.namespace || !payload.key) {
    return errorResult(command.id, 'Namespace and key are required');
  }

  try {
    var node = await figma.getNodeByIdAsync(targetId);

    if (!node) {
      return errorResult(command.id, 'Node not found: ' + targetId);
    }

    var value = node.getSharedPluginData(payload.namespace, payload.key);

    return successResult(command.id, {
      data: {
        nodeId: node.id,
        namespace: payload.namespace,
        key: payload.key,
        value: value,
        hasValue: value !== '',
      },
    });
  } catch (err) {
    var message = err instanceof Error ? err.message : String(err);
    return errorResult(command.id, 'Failed to get shared plugin data: ' + message);
  }
}

// Set shared plugin data
export async function handleSetSharedPluginData(command: FigmaCommand): Promise<CommandResult> {
  var targetId = command.target;
  var payload = command.payload as {
    namespace: string;
    key: string;
    value: string;
  };

  if (!targetId) {
    return errorResult(command.id, 'Target node ID is required');
  }

  if (!payload || !payload.namespace || !payload.key) {
    return errorResult(command.id, 'Namespace and key are required');
  }

  try {
    var node = await figma.getNodeByIdAsync(targetId);

    if (!node) {
      return errorResult(command.id, 'Node not found: ' + targetId);
    }

    node.setSharedPluginData(payload.namespace, payload.key, payload.value || '');

    return successResult(command.id, {
      data: {
        nodeId: node.id,
        namespace: payload.namespace,
        key: payload.key,
        success: true,
      },
    });
  } catch (err) {
    var message = err instanceof Error ? err.message : String(err);
    return errorResult(command.id, 'Failed to set shared plugin data: ' + message);
  }
}

// Get shared plugin data keys
export async function handleGetSharedPluginDataKeys(command: FigmaCommand): Promise<CommandResult> {
  var targetId = command.target;
  var payload = command.payload as {
    namespace: string;
  };

  if (!targetId) {
    return errorResult(command.id, 'Target node ID is required');
  }

  if (!payload || !payload.namespace) {
    return errorResult(command.id, 'Namespace is required');
  }

  try {
    var node = await figma.getNodeByIdAsync(targetId);

    if (!node) {
      return errorResult(command.id, 'Node not found: ' + targetId);
    }

    var keys = node.getSharedPluginDataKeys(payload.namespace);

    return successResult(command.id, {
      data: {
        nodeId: node.id,
        namespace: payload.namespace,
        keys: keys,
        count: keys.length,
      },
    });
  } catch (err) {
    var message = err instanceof Error ? err.message : String(err);
    return errorResult(command.id, 'Failed to get shared plugin data keys: ' + message);
  }
}

// Set relaunch data
export async function handleSetRelaunchData(command: FigmaCommand): Promise<CommandResult> {
  var targetId = command.target;
  var payload = command.payload as {
    data: { [command: string]: string };
  };

  if (!targetId) {
    return errorResult(command.id, 'Target node ID is required');
  }

  if (!payload || !payload.data) {
    return errorResult(command.id, 'Relaunch data is required');
  }

  try {
    var node = await figma.getNodeByIdAsync(targetId);

    if (!node) {
      return errorResult(command.id, 'Node not found: ' + targetId);
    }

    node.setRelaunchData(payload.data);

    return successResult(command.id, {
      data: {
        nodeId: node.id,
        success: true,
      },
    });
  } catch (err) {
    var message = err instanceof Error ? err.message : String(err);
    return errorResult(command.id, 'Failed to set relaunch data: ' + message);
  }
}

// Get relaunch data
export async function handleGetRelaunchData(command: FigmaCommand): Promise<CommandResult> {
  var targetId = command.target;

  if (!targetId) {
    return errorResult(command.id, 'Target node ID is required');
  }

  try {
    var node = await figma.getNodeByIdAsync(targetId);

    if (!node) {
      return errorResult(command.id, 'Node not found: ' + targetId);
    }

    var data = node.getRelaunchData();

    return successResult(command.id, {
      data: {
        nodeId: node.id,
        relaunchData: data,
        commands: Object.keys(data),
      },
    });
  } catch (err) {
    var message = err instanceof Error ? err.message : String(err);
    return errorResult(command.id, 'Failed to get relaunch data: ' + message);
  }
}

// Set style ID async methods
export async function handleSetFillStyleIdAsync(command: FigmaCommand): Promise<CommandResult> {
  var targetId = command.target;
  var payload = command.payload as {
    styleId: string;
  };

  if (!targetId) {
    return errorResult(command.id, 'Target node ID is required');
  }

  if (!payload || !payload.styleId) {
    return errorResult(command.id, 'Style ID is required');
  }

  try {
    var node = await figma.getNodeByIdAsync(targetId);

    if (!node) {
      return errorResult(command.id, 'Node not found: ' + targetId);
    }

    if (!('setFillStyleIdAsync' in node)) {
      return errorResult(command.id, 'Node does not support setFillStyleIdAsync');
    }

    await (node as any).setFillStyleIdAsync(payload.styleId);

    return successResult(command.id, {
      data: {
        nodeId: node.id,
        styleId: payload.styleId,
        success: true,
      },
    });
  } catch (err) {
    var message = err instanceof Error ? err.message : String(err);
    return errorResult(command.id, 'Failed to set fill style ID: ' + message);
  }
}

export async function handleSetStrokeStyleIdAsync(command: FigmaCommand): Promise<CommandResult> {
  var targetId = command.target;
  var payload = command.payload as {
    styleId: string;
  };

  if (!targetId) {
    return errorResult(command.id, 'Target node ID is required');
  }

  if (!payload || !payload.styleId) {
    return errorResult(command.id, 'Style ID is required');
  }

  try {
    var node = await figma.getNodeByIdAsync(targetId);

    if (!node) {
      return errorResult(command.id, 'Node not found: ' + targetId);
    }

    if (!('setStrokeStyleIdAsync' in node)) {
      return errorResult(command.id, 'Node does not support setStrokeStyleIdAsync');
    }

    await (node as any).setStrokeStyleIdAsync(payload.styleId);

    return successResult(command.id, {
      data: {
        nodeId: node.id,
        styleId: payload.styleId,
        success: true,
      },
    });
  } catch (err) {
    var message = err instanceof Error ? err.message : String(err);
    return errorResult(command.id, 'Failed to set stroke style ID: ' + message);
  }
}

export async function handleSetEffectStyleIdAsync(command: FigmaCommand): Promise<CommandResult> {
  var targetId = command.target;
  var payload = command.payload as {
    styleId: string;
  };

  if (!targetId) {
    return errorResult(command.id, 'Target node ID is required');
  }

  if (!payload || !payload.styleId) {
    return errorResult(command.id, 'Style ID is required');
  }

  try {
    var node = await figma.getNodeByIdAsync(targetId);

    if (!node) {
      return errorResult(command.id, 'Node not found: ' + targetId);
    }

    if (!('setEffectStyleIdAsync' in node)) {
      return errorResult(command.id, 'Node does not support setEffectStyleIdAsync');
    }

    await (node as any).setEffectStyleIdAsync(payload.styleId);

    return successResult(command.id, {
      data: {
        nodeId: node.id,
        styleId: payload.styleId,
        success: true,
      },
    });
  } catch (err) {
    var message = err instanceof Error ? err.message : String(err);
    return errorResult(command.id, 'Failed to set effect style ID: ' + message);
  }
}

export async function handleSetGridStyleIdAsync(command: FigmaCommand): Promise<CommandResult> {
  var targetId = command.target;
  var payload = command.payload as {
    styleId: string;
  };

  if (!targetId) {
    return errorResult(command.id, 'Target node ID is required');
  }

  if (!payload || !payload.styleId) {
    return errorResult(command.id, 'Style ID is required');
  }

  try {
    var node = await figma.getNodeByIdAsync(targetId);

    if (!node) {
      return errorResult(command.id, 'Node not found: ' + targetId);
    }

    if (!('setGridStyleIdAsync' in node)) {
      return errorResult(command.id, 'Node does not support setGridStyleIdAsync');
    }

    await (node as any).setGridStyleIdAsync(payload.styleId);

    return successResult(command.id, {
      data: {
        nodeId: node.id,
        styleId: payload.styleId,
        success: true,
      },
    });
  } catch (err) {
    var message = err instanceof Error ? err.message : String(err);
    return errorResult(command.id, 'Failed to set grid style ID: ' + message);
  }
}

export async function handleSetTextStyleIdAsync(command: FigmaCommand): Promise<CommandResult> {
  var targetId = command.target;
  var payload = command.payload as {
    styleId: string;
  };

  if (!targetId) {
    return errorResult(command.id, 'Target node ID is required');
  }

  if (!payload || !payload.styleId) {
    return errorResult(command.id, 'Style ID is required');
  }

  try {
    var node = await figma.getNodeByIdAsync(targetId);

    if (!node) {
      return errorResult(command.id, 'Node not found: ' + targetId);
    }

    if (node.type !== 'TEXT') {
      return errorResult(command.id, 'Node is not a text node');
    }

    await (node as TextNode).setTextStyleIdAsync(payload.styleId);

    return successResult(command.id, {
      data: {
        nodeId: node.id,
        styleId: payload.styleId,
        success: true,
      },
    });
  } catch (err) {
    var message = err instanceof Error ? err.message : String(err);
    return errorResult(command.id, 'Failed to set text style ID: ' + message);
  }
}

// Set reactions (prototyping)
export async function handleSetReactions(command: FigmaCommand): Promise<CommandResult> {
  var targetId = command.target;
  var payload = command.payload as {
    reactions: any[];
  };

  if (!targetId) {
    return errorResult(command.id, 'Target node ID is required');
  }

  if (!payload || !payload.reactions) {
    return errorResult(command.id, 'Reactions array is required');
  }

  try {
    var node = await figma.getNodeByIdAsync(targetId);

    if (!node) {
      return errorResult(command.id, 'Node not found: ' + targetId);
    }

    if (!('setReactionsAsync' in node)) {
      return errorResult(command.id, 'Node does not support setReactionsAsync');
    }

    await (node as any).setReactionsAsync(payload.reactions);

    return successResult(command.id, {
      data: {
        nodeId: node.id,
        success: true,
      },
    });
  } catch (err) {
    var message = err instanceof Error ? err.message : String(err);
    return errorResult(command.id, 'Failed to set reactions: ' + message);
  }
}

// Set instance properties
export async function handleSetInstanceProperties(command: FigmaCommand): Promise<CommandResult> {
  var targetId = command.target;
  var payload = command.payload as {
    properties: { [propertyName: string]: string | boolean };
  };

  if (!targetId) {
    return errorResult(command.id, 'Target instance ID is required');
  }

  if (!payload || !payload.properties) {
    return errorResult(command.id, 'Properties object is required');
  }

  try {
    var node = await figma.getNodeByIdAsync(targetId);

    if (!node) {
      return errorResult(command.id, 'Node not found: ' + targetId);
    }

    if (node.type !== 'INSTANCE') {
      return errorResult(command.id, 'Node is not an instance');
    }

    (node as InstanceNode).setProperties(payload.properties);

    return successResult(command.id, {
      data: {
        nodeId: node.id,
        success: true,
      },
    });
  } catch (err) {
    var message = err instanceof Error ? err.message : String(err);
    return errorResult(command.id, 'Failed to set instance properties: ' + message);
  }
}

// Set vector network
export async function handleSetVectorNetwork(command: FigmaCommand): Promise<CommandResult> {
  var targetId = command.target;
  var payload = command.payload as {
    vectorNetwork: any;
  };

  if (!targetId) {
    return errorResult(command.id, 'Target vector node ID is required');
  }

  if (!payload || !payload.vectorNetwork) {
    return errorResult(command.id, 'Vector network data is required');
  }

  try {
    var node = await figma.getNodeByIdAsync(targetId);

    if (!node) {
      return errorResult(command.id, 'Node not found: ' + targetId);
    }

    if (node.type !== 'VECTOR') {
      return errorResult(command.id, 'Node is not a vector node');
    }

    await (node as VectorNode).setVectorNetworkAsync(payload.vectorNetwork);

    return successResult(command.id, {
      data: {
        nodeId: node.id,
        success: true,
      },
    });
  } catch (err) {
    var message = err instanceof Error ? err.message : String(err);
    return errorResult(command.id, 'Failed to set vector network: ' + message);
  }
}
