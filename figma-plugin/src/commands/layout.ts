// Auto Layout and Constraints commands

import type { FigmaCommand, CommandResult } from './types';
import { successResult, errorResult } from './types';

// Set auto layout on a frame
export async function handleSetAutoLayout(command: FigmaCommand): Promise<CommandResult> {
  var payload = command.payload as {
    mode: 'HORIZONTAL' | 'VERTICAL' | 'NONE';
    spacing?: number;
    padding?: number | { top?: number; right?: number; bottom?: number; left?: number };
    primaryAxisAlignItems?: 'MIN' | 'MAX' | 'CENTER' | 'SPACE_BETWEEN';
    counterAxisAlignItems?: 'MIN' | 'MAX' | 'CENTER' | 'BASELINE';
    layoutWrap?: 'NO_WRAP' | 'WRAP';
    primaryAxisSizing?: 'FIXED' | 'AUTO';
    counterAxisSizing?: 'FIXED' | 'AUTO';
  };

  if (!command.target) {
    return errorResult(command.id, 'Target node ID is required');
  }

  var node = await figma.getNodeByIdAsync(command.target);
  if (!node) {
    return errorResult(command.id, 'Node not found');
  }

  if (node.type !== 'FRAME' && node.type !== 'COMPONENT' && node.type !== 'INSTANCE') {
    return errorResult(command.id, 'Node must be a frame, component, or instance');
  }

  var frame = node as FrameNode;

  // Set layout mode
  frame.layoutMode = payload.mode || 'VERTICAL';

  if (payload.mode === 'NONE') {
    return successResult(command.id, {
      data: {
        nodeId: frame.id,
        layoutMode: frame.layoutMode,
      },
    });
  }

  // Set spacing
  if (payload.spacing !== undefined) {
    frame.itemSpacing = payload.spacing;
  }

  // Set padding
  if (payload.padding !== undefined) {
    if (typeof payload.padding === 'number') {
      frame.paddingTop = payload.padding;
      frame.paddingRight = payload.padding;
      frame.paddingBottom = payload.padding;
      frame.paddingLeft = payload.padding;
    } else {
      if (payload.padding.top !== undefined) frame.paddingTop = payload.padding.top;
      if (payload.padding.right !== undefined) frame.paddingRight = payload.padding.right;
      if (payload.padding.bottom !== undefined) frame.paddingBottom = payload.padding.bottom;
      if (payload.padding.left !== undefined) frame.paddingLeft = payload.padding.left;
    }
  }

  // Set alignment
  if (payload.primaryAxisAlignItems) {
    frame.primaryAxisAlignItems = payload.primaryAxisAlignItems;
  }

  if (payload.counterAxisAlignItems) {
    frame.counterAxisAlignItems = payload.counterAxisAlignItems;
  }

  // Set wrap
  if (payload.layoutWrap) {
    frame.layoutWrap = payload.layoutWrap;
  }

  // Set sizing
  if (payload.primaryAxisSizing) {
    frame.primaryAxisSizingMode = payload.primaryAxisSizing;
  }

  if (payload.counterAxisSizing) {
    frame.counterAxisSizingMode = payload.counterAxisSizing;
  }

  return successResult(command.id, {
    data: {
      nodeId: frame.id,
      layoutMode: frame.layoutMode,
      itemSpacing: frame.itemSpacing,
      padding: {
        top: frame.paddingTop,
        right: frame.paddingRight,
        bottom: frame.paddingBottom,
        left: frame.paddingLeft,
      },
      primaryAxisAlignItems: frame.primaryAxisAlignItems,
      counterAxisAlignItems: frame.counterAxisAlignItems,
    },
  });
}

// Get auto layout settings
export async function handleGetAutoLayout(command: FigmaCommand): Promise<CommandResult> {
  if (!command.target) {
    return errorResult(command.id, 'Target node ID is required');
  }

  var node = await figma.getNodeByIdAsync(command.target);
  if (!node) {
    return errorResult(command.id, 'Node not found');
  }

  if (node.type !== 'FRAME' && node.type !== 'COMPONENT' && node.type !== 'INSTANCE') {
    return errorResult(command.id, 'Node must be a frame, component, or instance');
  }

  var frame = node as FrameNode;

  return successResult(command.id, {
    data: {
      nodeId: frame.id,
      layoutMode: frame.layoutMode,
      itemSpacing: frame.itemSpacing,
      counterAxisSpacing: frame.counterAxisSpacing,
      padding: {
        top: frame.paddingTop,
        right: frame.paddingRight,
        bottom: frame.paddingBottom,
        left: frame.paddingLeft,
      },
      primaryAxisAlignItems: frame.primaryAxisAlignItems,
      counterAxisAlignItems: frame.counterAxisAlignItems,
      counterAxisAlignContent: frame.counterAxisAlignContent,
      layoutWrap: frame.layoutWrap,
      primaryAxisSizingMode: frame.primaryAxisSizingMode,
      counterAxisSizingMode: frame.counterAxisSizingMode,
    },
  });
}

// Set child layout properties (for items in auto layout)
export async function handleSetLayoutChild(command: FigmaCommand): Promise<CommandResult> {
  var payload = command.payload as {
    layoutAlign?: 'STRETCH' | 'INHERIT';
    layoutGrow?: number;
    layoutPositioning?: 'AUTO' | 'ABSOLUTE';
  };

  if (!command.target) {
    return errorResult(command.id, 'Target node ID is required');
  }

  var node = await figma.getNodeByIdAsync(command.target);
  if (!node) {
    return errorResult(command.id, 'Node not found');
  }

  if (node.type === 'DOCUMENT' || node.type === 'PAGE') {
    return errorResult(command.id, 'Cannot set layout properties on document or page');
  }

  var sceneNode = node as SceneNode;

  if (payload.layoutAlign !== undefined && 'layoutAlign' in sceneNode) {
    (sceneNode as FrameNode).layoutAlign = payload.layoutAlign;
  }

  if (payload.layoutGrow !== undefined && 'layoutGrow' in sceneNode) {
    (sceneNode as FrameNode).layoutGrow = payload.layoutGrow;
  }

  if (payload.layoutPositioning !== undefined && 'layoutPositioning' in sceneNode) {
    (sceneNode as FrameNode).layoutPositioning = payload.layoutPositioning;
  }

  return successResult(command.id, {
    data: {
      nodeId: sceneNode.id,
      layoutAlign: 'layoutAlign' in sceneNode ? (sceneNode as any).layoutAlign : undefined,
      layoutGrow: 'layoutGrow' in sceneNode ? (sceneNode as any).layoutGrow : undefined,
      layoutPositioning: 'layoutPositioning' in sceneNode ? (sceneNode as any).layoutPositioning : undefined,
    },
  });
}

// Set constraints on a node
export async function handleSetConstraints(command: FigmaCommand): Promise<CommandResult> {
  var payload = command.payload as {
    horizontal?: 'MIN' | 'CENTER' | 'MAX' | 'STRETCH' | 'SCALE';
    vertical?: 'MIN' | 'CENTER' | 'MAX' | 'STRETCH' | 'SCALE';
  };

  if (!command.target) {
    return errorResult(command.id, 'Target node ID is required');
  }

  var node = await figma.getNodeByIdAsync(command.target);
  if (!node) {
    return errorResult(command.id, 'Node not found');
  }

  if (!('constraints' in node)) {
    return errorResult(command.id, 'Node does not support constraints');
  }

  var sceneNode = node as SceneNode & ConstraintMixin;
  var constraints = {
    horizontal: sceneNode.constraints.horizontal,
    vertical: sceneNode.constraints.vertical,
  };

  if (payload.horizontal) {
    constraints.horizontal = payload.horizontal;
  }

  if (payload.vertical) {
    constraints.vertical = payload.vertical;
  }

  sceneNode.constraints = constraints;

  return successResult(command.id, {
    data: {
      nodeId: sceneNode.id,
      constraints: sceneNode.constraints,
    },
  });
}

// Get constraints
export async function handleGetConstraints(command: FigmaCommand): Promise<CommandResult> {
  if (!command.target) {
    return errorResult(command.id, 'Target node ID is required');
  }

  var node = await figma.getNodeByIdAsync(command.target);
  if (!node) {
    return errorResult(command.id, 'Node not found');
  }

  if (!('constraints' in node)) {
    return errorResult(command.id, 'Node does not support constraints');
  }

  var sceneNode = node as SceneNode & ConstraintMixin;

  return successResult(command.id, {
    data: {
      nodeId: sceneNode.id,
      constraints: sceneNode.constraints,
    },
  });
}

// Set min/max size constraints
export async function handleSetSizeConstraints(command: FigmaCommand): Promise<CommandResult> {
  var payload = command.payload as {
    minWidth?: number | null;
    maxWidth?: number | null;
    minHeight?: number | null;
    maxHeight?: number | null;
  };

  if (!command.target) {
    return errorResult(command.id, 'Target node ID is required');
  }

  var node = await figma.getNodeByIdAsync(command.target);
  if (!node) {
    return errorResult(command.id, 'Node not found');
  }

  if (!('minWidth' in node)) {
    return errorResult(command.id, 'Node does not support size constraints');
  }

  var frame = node as FrameNode;

  if (payload.minWidth !== undefined) {
    frame.minWidth = payload.minWidth;
  }
  if (payload.maxWidth !== undefined) {
    frame.maxWidth = payload.maxWidth;
  }
  if (payload.minHeight !== undefined) {
    frame.minHeight = payload.minHeight;
  }
  if (payload.maxHeight !== undefined) {
    frame.maxHeight = payload.maxHeight;
  }

  return successResult(command.id, {
    data: {
      nodeId: frame.id,
      minWidth: frame.minWidth,
      maxWidth: frame.maxWidth,
      minHeight: frame.minHeight,
      maxHeight: frame.maxHeight,
    },
  });
}

// Infer auto layout from existing layout
export async function handleInferAutoLayout(command: FigmaCommand): Promise<CommandResult> {
  if (!command.target) {
    return errorResult(command.id, 'Target node ID is required');
  }

  var node = await figma.getNodeByIdAsync(command.target);
  if (!node) {
    return errorResult(command.id, 'Node not found');
  }

  if (node.type !== 'FRAME' && node.type !== 'GROUP') {
    return errorResult(command.id, 'Node must be a frame or group');
  }

  var frame = node as FrameNode | GroupNode;

  if (!('inferredAutoLayout' in frame)) {
    return errorResult(command.id, 'Cannot infer auto layout for this node');
  }

  var inferred = frame.inferredAutoLayout;

  if (!inferred) {
    return successResult(command.id, {
      data: {
        nodeId: frame.id,
        inferred: false,
        message: 'No auto layout could be inferred',
      },
    });
  }

  return successResult(command.id, {
    data: {
      nodeId: frame.id,
      inferred: true,
      layoutMode: inferred.layoutMode,
      itemSpacing: inferred.itemSpacing,
      counterAxisSpacing: inferred.counterAxisSpacing,
      padding: {
        top: inferred.paddingTop,
        right: inferred.paddingRight,
        bottom: inferred.paddingBottom,
        left: inferred.paddingLeft,
      },
    },
  });
}
