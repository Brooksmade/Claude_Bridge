// Color command handlers for extracting and analyzing colors

import type { FigmaCommand, CommandResult } from './types';
import { successResult, errorResult } from './types';
import { colorToHex, ColorValue } from '../utils/variable-factory';

// Payload interfaces
interface GetNodeColorsPayload {
  nodeId?: string; // Specific node, or selection if not specified
  includeChildren?: boolean;
  includeStrokes?: boolean;
  includeEffects?: boolean;
}

interface AnalyzeColorsPayload {
  nodeId?: string; // Specific node, or entire page if not specified
  groupBy?: 'hex' | 'node' | 'type';
}

// Color extraction result
interface ExtractedColor {
  hex: string;
  rgba: { r: number; g: number; b: number; a: number };
  source: 'fill' | 'stroke' | 'effect';
  nodeId: string;
  nodeName: string;
  nodeType: string;
}

// Helper to extract colors from a paint
function extractColorsFromPaint(paint: Paint): ColorValue | null {
  if (paint.type === 'SOLID') {
    var solid = paint as SolidPaint;
    return {
      r: solid.color.r,
      g: solid.color.g,
      b: solid.color.b,
      a: solid.opacity !== undefined ? solid.opacity : 1,
    };
  }

  // For gradients, return the first stop color
  if (
    paint.type === 'GRADIENT_LINEAR' ||
    paint.type === 'GRADIENT_RADIAL' ||
    paint.type === 'GRADIENT_ANGULAR' ||
    paint.type === 'GRADIENT_DIAMOND'
  ) {
    var gradient = paint as GradientPaint;
    if (gradient.gradientStops && gradient.gradientStops.length > 0) {
      var stop = gradient.gradientStops[0];
      return {
        r: stop.color.r,
        g: stop.color.g,
        b: stop.color.b,
        a: stop.color.a,
      };
    }
  }

  return null;
}

// Helper to extract colors from effects
function extractColorsFromEffect(effect: Effect): ColorValue | null {
  if (effect.type === 'DROP_SHADOW' || effect.type === 'INNER_SHADOW') {
    var shadow = effect as DropShadowEffect | InnerShadowEffect;
    return {
      r: shadow.color.r,
      g: shadow.color.g,
      b: shadow.color.b,
      a: shadow.color.a,
    };
  }
  return null;
}

// Extract all colors from a single node
function extractColorsFromNode(
  node: SceneNode,
  options: {
    includeStrokes: boolean;
    includeEffects: boolean;
  }
): ExtractedColor[] {
  var colors: ExtractedColor[] = [];

  // Extract fill colors
  if ('fills' in node) {
    var fills = node.fills;
    if (Array.isArray(fills)) {
      for (var i = 0; i < fills.length; i++) {
        var fill = fills[i];
        if (fill.visible !== false) {
          var fillColor = extractColorsFromPaint(fill);
          if (fillColor) {
            colors.push({
              hex: colorToHex(fillColor),
              rgba: fillColor,
              source: 'fill',
              nodeId: node.id,
              nodeName: node.name,
              nodeType: node.type,
            });
          }
        }
      }
    }
  }

  // Extract stroke colors
  if (options.includeStrokes && 'strokes' in node) {
    var strokes = node.strokes;
    if (Array.isArray(strokes)) {
      for (var j = 0; j < strokes.length; j++) {
        var stroke = strokes[j];
        if (stroke.visible !== false) {
          var strokeColor = extractColorsFromPaint(stroke);
          if (strokeColor) {
            colors.push({
              hex: colorToHex(strokeColor),
              rgba: strokeColor,
              source: 'stroke',
              nodeId: node.id,
              nodeName: node.name,
              nodeType: node.type,
            });
          }
        }
      }
    }
  }

  // Extract effect colors (shadows)
  if (options.includeEffects && 'effects' in node) {
    var effects = node.effects;
    if (Array.isArray(effects)) {
      for (var k = 0; k < effects.length; k++) {
        var effect = effects[k];
        if (effect.visible !== false) {
          var effectColor = extractColorsFromEffect(effect);
          if (effectColor) {
            colors.push({
              hex: colorToHex(effectColor),
              rgba: effectColor,
              source: 'effect',
              nodeId: node.id,
              nodeName: node.name,
              nodeType: node.type,
            });
          }
        }
      }
    }
  }

  return colors;
}

// Recursively extract colors from a node and its children
function extractColorsRecursive(
  node: SceneNode,
  options: {
    includeChildren: boolean;
    includeStrokes: boolean;
    includeEffects: boolean;
  }
): ExtractedColor[] {
  var colors = extractColorsFromNode(node, options);

  if (options.includeChildren && 'children' in node) {
    var parent = node as FrameNode | GroupNode;
    for (var i = 0; i < parent.children.length; i++) {
      var childColors = extractColorsRecursive(parent.children[i], options);
      for (var j = 0; j < childColors.length; j++) {
        colors.push(childColors[j]);
      }
    }
  }

  return colors;
}

// Get colors from node(s)
export async function handleGetNodeColors(command: FigmaCommand): Promise<CommandResult> {
  var payload = command.payload as GetNodeColorsPayload;
  var includeChildren = payload.includeChildren !== false;
  var includeStrokes = payload.includeStrokes !== false;
  var includeEffects = payload.includeEffects !== false;

  try {
    var nodesToProcess: SceneNode[] = [];

    if (payload.nodeId) {
      var node = await figma.getNodeByIdAsync(payload.nodeId);
      if (!node) {
        return errorResult(command.id, 'Node not found: ' + payload.nodeId);
      }
      if (node.type === 'DOCUMENT' || node.type === 'PAGE') {
        return errorResult(command.id, 'Cannot extract colors from document or page node');
      }
      nodesToProcess.push(node as SceneNode);
    } else {
      // Use selection
      if (figma.currentPage.selection.length === 0) {
        return errorResult(command.id, 'No node specified and nothing selected');
      }
      nodesToProcess = figma.currentPage.selection.slice();
    }

    var allColors: ExtractedColor[] = [];

    for (var i = 0; i < nodesToProcess.length; i++) {
      var colors = extractColorsRecursive(nodesToProcess[i], {
        includeChildren: includeChildren,
        includeStrokes: includeStrokes,
        includeEffects: includeEffects,
      });
      for (var j = 0; j < colors.length; j++) {
        allColors.push(colors[j]);
      }
    }

    // Deduplicate colors by hex
    var uniqueHexes: string[] = [];
    var uniqueColors: ExtractedColor[] = [];

    for (var k = 0; k < allColors.length; k++) {
      if (uniqueHexes.indexOf(allColors[k].hex) === -1) {
        uniqueHexes.push(allColors[k].hex);
        uniqueColors.push(allColors[k]);
      }
    }

    return successResult(command.id, {
      data: {
        totalColors: allColors.length,
        uniqueColors: uniqueColors.length,
        colors: allColors,
        uniqueHexValues: uniqueHexes,
      },
    });
  } catch (error) {
    var message = error instanceof Error ? error.message : String(error);
    return errorResult(command.id, message);
  }
}

// Analyze colors usage on a page or in a node
export async function handleAnalyzeColors(command: FigmaCommand): Promise<CommandResult> {
  var payload = command.payload as AnalyzeColorsPayload;
  var groupBy = (payload && payload.groupBy) ? payload.groupBy : 'hex';

  try {
    var searchRoot: BaseNode & ChildrenMixin;

    if (payload.nodeId) {
      var node = await figma.getNodeByIdAsync(payload.nodeId);
      if (!node) {
        return errorResult(command.id, 'Node not found: ' + payload.nodeId);
      }
      if (!('children' in node)) {
        return errorResult(command.id, 'Node has no children to analyze');
      }
      searchRoot = node as BaseNode & ChildrenMixin;
    } else {
      searchRoot = figma.currentPage;
    }

    var allColors: ExtractedColor[] = [];

    // Collect all colors from all nodes
    function collectColors(parent: BaseNode & ChildrenMixin): void {
      for (var i = 0; i < parent.children.length; i++) {
        var child = parent.children[i];
        var nodeColors = extractColorsFromNode(child, {
          includeStrokes: true,
          includeEffects: true,
        });
        for (var j = 0; j < nodeColors.length; j++) {
          allColors.push(nodeColors[j]);
        }
        if ('children' in child) {
          collectColors(child as BaseNode & ChildrenMixin);
        }
      }
    }

    collectColors(searchRoot);

    // Group and count colors
    var result: Record<string, any> = {
      totalColorUsages: allColors.length,
    };

    if (groupBy === 'hex') {
      var colorCounts: Record<string, number> = {};
      for (var k = 0; k < allColors.length; k++) {
        var hex = allColors[k].hex;
        if (colorCounts[hex] === undefined) {
          colorCounts[hex] = 0;
        }
        colorCounts[hex]++;
      }

      // Sort by usage count
      var sortedColors: Array<{ hex: string; count: number }> = [];
      var hexKeys = Object.keys(colorCounts);
      for (var l = 0; l < hexKeys.length; l++) {
        sortedColors.push({ hex: hexKeys[l], count: colorCounts[hexKeys[l]] });
      }
      sortedColors.sort(function (a, b) {
        return b.count - a.count;
      });

      result.uniqueColors = sortedColors.length;
      result.colorsByUsage = sortedColors;
    } else if (groupBy === 'type') {
      var byType: Record<string, ExtractedColor[]> = {
        fill: [],
        stroke: [],
        effect: [],
      };
      for (var m = 0; m < allColors.length; m++) {
        byType[allColors[m].source].push(allColors[m]);
      }
      result.byType = {
        fills: byType.fill.length,
        strokes: byType.stroke.length,
        effects: byType.effect.length,
      };
    } else if (groupBy === 'node') {
      var byNode: Record<string, { nodeId: string; nodeName: string; colors: string[] }> = {};
      for (var n = 0; n < allColors.length; n++) {
        var color = allColors[n];
        if (!byNode[color.nodeId]) {
          byNode[color.nodeId] = {
            nodeId: color.nodeId,
            nodeName: color.nodeName,
            colors: [],
          };
        }
        if (byNode[color.nodeId].colors.indexOf(color.hex) === -1) {
          byNode[color.nodeId].colors.push(color.hex);
        }
      }
      var nodeList: Array<{ nodeId: string; nodeName: string; colorCount: number }> = [];
      var nodeIds = Object.keys(byNode);
      for (var o = 0; o < nodeIds.length; o++) {
        nodeList.push({
          nodeId: byNode[nodeIds[o]].nodeId,
          nodeName: byNode[nodeIds[o]].nodeName,
          colorCount: byNode[nodeIds[o]].colors.length,
        });
      }
      result.nodeCount = nodeList.length;
      result.nodesByColorCount = nodeList.sort(function (a, b) {
        return b.colorCount - a.colorCount;
      });
    }

    return successResult(command.id, {
      data: result,
    });
  } catch (error) {
    var message = error instanceof Error ? error.message : String(error);
    return errorResult(command.id, message);
  }
}
