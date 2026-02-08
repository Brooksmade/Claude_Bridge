import type { FigmaCommand, CommandResult, QueryPayload } from './types';
import { successResult, errorResult } from './types';
import { serializeNode, serializeNodeDeep, describeBlockStructure } from '../utils/node-factory';

export async function handleQuery(command: FigmaCommand): Promise<CommandResult> {
  const payload = command.payload as QueryPayload;
  const queryType = (payload && payload.queryType) || 'selection';

  try {
    let data: unknown;

    switch (queryType) {
      case 'selection':
        data = getSelection();
        break;

      case 'page':
        data = getPageInfo();
        break;

      case 'node':
        if (!command.target) {
          return errorResult(command.id, 'No target node specified for node query');
        }
        data = await getNodeInfo(command.target);
        if (!data) {
          return errorResult(command.id, 'Node not found: ' + command.target);
        }
        break;

      case 'children':
        data = await getChildren(command.target);
        break;

      case 'find':
        if (!payload.query) {
          return errorResult(command.id, 'No query string specified for find');
        }
        data = await findNodes(payload.query, command.target);
        break;

      case 'deep':
        // Get deep structure of a node
        if (!command.target) {
          return errorResult(command.id, 'No target node specified for deep query');
        }
        data = await getNodeDeep(command.target, payload.depth);
        break;

      case 'describe':
        // Get structural description of blocks
        data = await describeBlocks(command.target);
        break;

      case 'findByType':
        // Find all nodes of specific types with deep traversal
        data = await findNodesByType(
          payload.nodeTypes || [],
          command.target || payload.parentId,
          payload.maxDepth || 50,
          payload.includeDetails !== false
        );
        break;

      case 'pages':
        // Get all pages in the document
        data = await getPages();
        break;

      default:
        return errorResult(command.id, 'Unknown query type: ' + queryType);
    }

    return successResult(command.id, { data });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return errorResult(command.id, message);
  }
}

// Get current selection
function getSelection(): object[] {
  return figma.currentPage.selection.map((node) => serializeNode(node));
}

// Get page information
function getPageInfo(): object {
  const page = figma.currentPage;
  return {
    id: page.id,
    name: page.name,
    childCount: page.children.length,
    backgroundColor: page.backgrounds,
    children: page.children.slice(0, 100).map((child) => ({
      id: child.id,
      name: child.name,
      type: child.type,
    })),
  };
}

// Get all pages in the document
async function getPages(): Promise<object[]> {
  var doc = figma.root;
  var currentPageId = figma.currentPage.id;
  var pages: object[] = [];

  for (var i = 0; i < doc.children.length; i++) {
    var page = doc.children[i];
    var pageInfo: any = {
      id: page.id,
      name: page.name,
      isCurrent: page.id === currentPageId,
    };

    // Only get childCount for current page (already loaded)
    if (page.id === currentPageId) {
      pageInfo.childCount = page.children.length;
    }

    pages.push(pageInfo);
  }

  return pages;
}

// Get detailed node information
async function getNodeInfo(nodeId: string): Promise<object | null> {
  const node = await figma.getNodeByIdAsync(nodeId);
  if (!node) return null;

  if (node.type === 'DOCUMENT') {
    return {
      id: node.id,
      type: node.type,
      name: node.name,
      pageCount: (node as DocumentNode).children.length,
    };
  }

  if (node.type === 'PAGE') {
    const page = node as PageNode;
    return {
      id: page.id,
      type: page.type,
      name: page.name,
      childCount: page.children.length,
    };
  }

  return serializeNode(node as SceneNode, true);
}

// Get children of a node or current page
async function getChildren(parentId?: string): Promise<object[]> {
  let parent: (BaseNode & ChildrenMixin) | null;

  if (parentId) {
    const node = await figma.getNodeByIdAsync(parentId);
    if (!node || !('children' in node)) {
      return [];
    }
    parent = node as BaseNode & ChildrenMixin;
  } else {
    parent = figma.currentPage;
  }

  return parent.children.map((child) => ({
    id: child.id,
    name: child.name,
    type: child.type,
    x: child.x,
    y: child.y,
    width: 'width' in child ? child.width : undefined,
    height: 'height' in child ? child.height : undefined,
  }));
}

// Find nodes by name (supports wildcards)
async function findNodes(query: string, parentId?: string): Promise<object[]> {
  let searchRoot: BaseNode & ChildrenMixin;

  if (parentId) {
    const node = await figma.getNodeByIdAsync(parentId);
    if (!node || !('children' in node)) {
      return [];
    }
    searchRoot = node as BaseNode & ChildrenMixin;
  } else {
    searchRoot = figma.currentPage;
  }

  const results: SceneNode[] = [];
  const isWildcard = query.includes('*');
  const regex = isWildcard
    ? new RegExp('^' + query.replace(/\*/g, '.*') + '$', 'i')
    : null;

  function searchNode(node: BaseNode): void {
    if ('children' in node) {
      for (const child of (node as ChildrenMixin).children) {
        const matches = regex
          ? regex.test(child.name)
          : child.name.toLowerCase().includes(query.toLowerCase());

        if (matches) {
          results.push(child);
        }

        if ('children' in child) {
          searchNode(child);
        }
      }
    }
  }

  searchNode(searchRoot);

  // Limit results to prevent huge responses
  return results.slice(0, 100).map((node) => serializeNode(node));
}

// Get deep structure of a node
async function getNodeDeep(nodeId: string, depth?: number): Promise<object | null> {
  var node = await figma.getNodeByIdAsync(nodeId);
  if (!node) return null;

  if (node.type === 'DOCUMENT' || node.type === 'PAGE') {
    return {
      id: node.id,
      type: node.type,
      name: node.name,
      childCount: (node as DocumentNode | PageNode).children.length,
    };
  }

  var maxDepth = depth !== undefined ? depth : 3;
  return serializeNodeDeep(node as SceneNode, maxDepth);
}

// Describe structural content of blocks
async function describeBlocks(parentId?: string): Promise<object[]> {
  var parent: BaseNode & ChildrenMixin;

  if (parentId) {
    var node = await figma.getNodeByIdAsync(parentId);
    if (!node || !('children' in node)) {
      return [];
    }
    parent = node as BaseNode & ChildrenMixin;
  } else {
    parent = figma.currentPage;
  }

  var results: object[] = [];
  var children = parent.children;

  for (var i = 0; i < children.length; i++) {
    var child = children[i];
    if (child.type === 'FRAME' || child.type === 'COMPONENT' || child.type === 'INSTANCE') {
      results.push(describeBlockStructure(child));
    }
  }

  return results;
}

// Find all nodes of specific types with deep traversal
async function findNodesByType(
  nodeTypes: string[],
  parentId?: string,
  maxDepth: number = 50,
  includeDetails: boolean = true
): Promise<object[]> {
  var parent: BaseNode & ChildrenMixin;

  if (parentId) {
    var node = await figma.getNodeByIdAsync(parentId);
    if (!node) {
      return [];
    }
    if (!('children' in node)) {
      // If the node itself matches, return it
      if (nodeTypes.length === 0 || nodeTypes.includes(node.type)) {
        return [serializeNodeWithDetails(node as SceneNode, includeDetails)];
      }
      return [];
    }
    parent = node as BaseNode & ChildrenMixin;
  } else {
    parent = figma.currentPage;
  }

  var results: object[] = [];
  var typeSet = new Set(nodeTypes.map(function(t) { return t.toUpperCase(); }));
  var matchAll = nodeTypes.length === 0;

  function traverse(node: BaseNode, depth: number): void {
    if (depth > maxDepth) return;

    // Check if this node matches the type filter
    if (matchAll || typeSet.has(node.type)) {
      if (node.type !== 'DOCUMENT' && node.type !== 'PAGE') {
        results.push(serializeNodeWithDetails(node as SceneNode, includeDetails));
      }
    }

    // Traverse children
    if ('children' in node) {
      var children = (node as ChildrenMixin).children;
      for (var i = 0; i < children.length; i++) {
        traverse(children[i], depth + 1);
      }
    }
  }

  // Start traversal from parent's children
  var children = parent.children;
  for (var i = 0; i < children.length; i++) {
    traverse(children[i], 0);
  }

  // Limit results to prevent huge responses
  return results.slice(0, 500);
}

// Serialize a node with optional detailed properties
function serializeNodeWithDetails(node: SceneNode, includeDetails: boolean): object {
  var base: any = {
    id: node.id,
    name: node.name,
    type: node.type,
    visible: node.visible,
  };

  // Add position and size
  if ('x' in node) base.x = node.x;
  if ('y' in node) base.y = node.y;
  if ('width' in node) base.width = node.width;
  if ('height' in node) base.height = node.height;

  if (!includeDetails) return base;

  // Add fills
  if ('fills' in node && node.fills !== figma.mixed) {
    var fills = node.fills as readonly Paint[];
    if (fills.length > 0) {
      base.fills = fills.map(function(fill: Paint) {
        if (fill.type === 'SOLID') {
          var solid = fill as SolidPaint;
          return {
            type: 'SOLID',
            color: rgbToHex(solid.color),
            opacity: solid.opacity
          };
        }
        return { type: fill.type };
      });
    }
  }

  // Add strokes
  if ('strokes' in node && node.strokes.length > 0) {
    base.strokes = node.strokes.map(function(stroke: Paint) {
      if (stroke.type === 'SOLID') {
        var solid = stroke as SolidPaint;
        return {
          type: 'SOLID',
          color: rgbToHex(solid.color),
          opacity: solid.opacity
        };
      }
      return { type: stroke.type };
    });
    if ('strokeWeight' in node) {
      base.strokeWeight = node.strokeWeight;
    }
  }

  // Add corner radius
  if ('cornerRadius' in node) {
    base.cornerRadius = node.cornerRadius;
  }
  if ('topLeftRadius' in node) {
    base.topLeftRadius = node.topLeftRadius;
    base.topRightRadius = node.topRightRadius;
    base.bottomLeftRadius = node.bottomLeftRadius;
    base.bottomRightRadius = node.bottomRightRadius;
  }

  // Add effects (shadows, blurs)
  if ('effects' in node && node.effects.length > 0) {
    base.effects = node.effects.map(function(effect: Effect) {
      if (effect.type === 'DROP_SHADOW' || effect.type === 'INNER_SHADOW') {
        var shadow = effect as DropShadowEffect;
        return {
          type: effect.type,
          color: rgbaToHex(shadow.color),
          offset: shadow.offset,
          radius: shadow.radius,
          spread: shadow.spread,
          visible: shadow.visible
        };
      }
      return { type: effect.type, visible: effect.visible };
    });
  }

  // TEXT-specific properties
  if (node.type === 'TEXT') {
    var textNode = node as TextNode;
    base.characters = textNode.characters.substring(0, 100); // Limit text length

    // Font info
    if (textNode.fontName !== figma.mixed) {
      base.fontFamily = textNode.fontName.family;
      base.fontStyle = textNode.fontName.style;
    }
    if (textNode.fontSize !== figma.mixed) {
      base.fontSize = textNode.fontSize;
    }
    if (textNode.fontWeight !== figma.mixed) {
      base.fontWeight = textNode.fontWeight;
    }
    if (textNode.lineHeight !== figma.mixed) {
      base.lineHeight = textNode.lineHeight;
    }
    if (textNode.letterSpacing !== figma.mixed) {
      base.letterSpacing = textNode.letterSpacing;
    }
    if (textNode.textAlignHorizontal) {
      base.textAlign = textNode.textAlignHorizontal;
    }
  }

  // FRAME-specific properties
  if (node.type === 'FRAME' || node.type === 'COMPONENT' || node.type === 'INSTANCE') {
    var frameNode = node as FrameNode;
    if (frameNode.layoutMode !== 'NONE') {
      base.layoutMode = frameNode.layoutMode;
      base.itemSpacing = frameNode.itemSpacing;
      base.paddingTop = frameNode.paddingTop;
      base.paddingRight = frameNode.paddingRight;
      base.paddingBottom = frameNode.paddingBottom;
      base.paddingLeft = frameNode.paddingLeft;
    }
  }

  return base;
}

// Helper to convert RGB to hex
function rgbToHex(color: RGB): string {
  var r = Math.round(color.r * 255).toString(16).padStart(2, '0');
  var g = Math.round(color.g * 255).toString(16).padStart(2, '0');
  var b = Math.round(color.b * 255).toString(16).padStart(2, '0');
  return '#' + r + g + b;
}

// Helper to convert RGBA to hex
function rgbaToHex(color: RGBA): string {
  var r = Math.round(color.r * 255).toString(16).padStart(2, '0');
  var g = Math.round(color.g * 255).toString(16).padStart(2, '0');
  var b = Math.round(color.b * 255).toString(16).padStart(2, '0');
  var a = Math.round(color.a * 255).toString(16).padStart(2, '0');
  return '#' + r + g + b + (color.a < 1 ? a : '');
}

// Get all frames on the current page
export async function handleGetFrames(command: FigmaCommand): Promise<CommandResult> {
  const frames = figma.currentPage.children.filter(
    (node) => node.type === 'FRAME' || node.type === 'COMPONENT'
  );

  return successResult(command.id, {
    data: frames.map((frame) => serializeNode(frame)),
  });
}

// Get viewport information
export async function handleGetViewport(command: FigmaCommand): Promise<CommandResult> {
  const viewport = figma.viewport;

  return successResult(command.id, {
    data: {
      center: viewport.center,
      zoom: viewport.zoom,
      bounds: viewport.bounds,
    },
  });
}

// Set viewport
export async function handleSetViewport(command: FigmaCommand): Promise<CommandResult> {
  const payload = command.payload as {
    center?: { x: number; y: number };
    zoom?: number;
    scrollTo?: string; // Node ID to scroll to
  };

  if (payload.scrollTo) {
    const node = await figma.getNodeByIdAsync(payload.scrollTo);
    if (node && node.type !== 'DOCUMENT' && node.type !== 'PAGE') {
      figma.viewport.scrollAndZoomIntoView([node as SceneNode]);
    }
  }

  if (payload.center) {
    figma.viewport.center = payload.center;
  }

  if (payload.zoom) {
    figma.viewport.zoom = payload.zoom;
  }

  return successResult(command.id, {
    data: {
      center: figma.viewport.center,
      zoom: figma.viewport.zoom,
    },
  });
}

// Select nodes
export async function handleSelect(command: FigmaCommand): Promise<CommandResult> {
  const payload = command.payload as {
    nodeIds?: string[];
    add?: boolean; // Add to selection instead of replacing
  };

  if (!payload.nodeIds || payload.nodeIds.length === 0) {
    figma.currentPage.selection = [];
    return successResult(command.id, { data: { selected: 0 } });
  }

  const nodes: SceneNode[] = [];

  for (const nodeId of payload.nodeIds) {
    const node = await figma.getNodeByIdAsync(nodeId);
    if (node && node.type !== 'DOCUMENT' && node.type !== 'PAGE') {
      nodes.push(node as SceneNode);
    }
  }

  if (payload.add) {
    figma.currentPage.selection = figma.currentPage.selection.slice().concat(nodes);
  } else {
    figma.currentPage.selection = nodes;
  }

  return successResult(command.id, {
    data: {
      selected: figma.currentPage.selection.length,
      nodeIds: figma.currentPage.selection.map((n) => n.id),
    },
  });
}

// Set current page by name or ID
export async function handleSetPage(command: FigmaCommand): Promise<CommandResult> {
  var payload = command.payload as {
    pageId?: string;
    pageName?: string;
  };

  if (!payload.pageId && !payload.pageName) {
    return errorResult(command.id, 'Must specify either pageId or pageName');
  }

  var doc = figma.root;
  var targetPage: PageNode | null = null;

  // Find page by ID or name
  for (var i = 0; i < doc.children.length; i++) {
    var page = doc.children[i];
    if (payload.pageId && page.id === payload.pageId) {
      targetPage = page;
      break;
    }
    if (payload.pageName && page.name === payload.pageName) {
      targetPage = page;
      break;
    }
  }

  if (!targetPage) {
    var identifier = payload.pageId || payload.pageName;
    return errorResult(command.id, 'Page not found: ' + identifier);
  }

  // Switch to the page
  await figma.setCurrentPageAsync(targetPage);

  return successResult(command.id, {
    data: {
      id: targetPage.id,
      name: targetPage.name,
      childCount: targetPage.children.length,
    },
  });
}
