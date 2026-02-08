import type { FigmaCommand, CommandResult } from './types';
import { successResult, errorResult } from './types';

// Get range font weight
export async function handleGetRangeFontWeight(command: FigmaCommand): Promise<CommandResult> {
  var targetId = command.target;
  var payload = command.payload as {
    start: number;
    end: number;
  };

  if (!targetId) {
    return errorResult(command.id, 'Target text node ID is required');
  }

  if (!payload || payload.start === undefined || payload.end === undefined) {
    return errorResult(command.id, 'Start and end positions are required');
  }

  try {
    var node = await figma.getNodeByIdAsync(targetId);

    if (!node || node.type !== 'TEXT') {
      return errorResult(command.id, 'Node is not a text node');
    }

    var textNode = node as TextNode;
    var fontWeight = textNode.getRangeFontWeight(payload.start, payload.end);

    return successResult(command.id, {
      data: {
        nodeId: node.id,
        start: payload.start,
        end: payload.end,
        fontWeight: fontWeight,
        isMixed: fontWeight === figma.mixed,
      },
    });
  } catch (err) {
    var message = err instanceof Error ? err.message : String(err);
    return errorResult(command.id, 'Failed to get range font weight: ' + message);
  }
}

// Get all font names in range
export async function handleGetRangeAllFontNames(command: FigmaCommand): Promise<CommandResult> {
  var targetId = command.target;
  var payload = command.payload as {
    start: number;
    end: number;
  };

  if (!targetId) {
    return errorResult(command.id, 'Target text node ID is required');
  }

  if (!payload || payload.start === undefined || payload.end === undefined) {
    return errorResult(command.id, 'Start and end positions are required');
  }

  try {
    var node = await figma.getNodeByIdAsync(targetId);

    if (!node || node.type !== 'TEXT') {
      return errorResult(command.id, 'Node is not a text node');
    }

    var textNode = node as TextNode;
    var fontNames = textNode.getRangeAllFontNames(payload.start, payload.end);

    return successResult(command.id, {
      data: {
        nodeId: node.id,
        start: payload.start,
        end: payload.end,
        fontNames: fontNames.map(fn => ({
          family: fn.family,
          style: fn.style,
        })),
      },
    });
  } catch (err) {
    var message = err instanceof Error ? err.message : String(err);
    return errorResult(command.id, 'Failed to get range all font names: ' + message);
  }
}

// Get range fills
export async function handleGetRangeFills(command: FigmaCommand): Promise<CommandResult> {
  var targetId = command.target;
  var payload = command.payload as {
    start: number;
    end: number;
  };

  if (!targetId) {
    return errorResult(command.id, 'Target text node ID is required');
  }

  if (!payload || payload.start === undefined || payload.end === undefined) {
    return errorResult(command.id, 'Start and end positions are required');
  }

  try {
    var node = await figma.getNodeByIdAsync(targetId);

    if (!node || node.type !== 'TEXT') {
      return errorResult(command.id, 'Node is not a text node');
    }

    var textNode = node as TextNode;
    var fills = textNode.getRangeFills(payload.start, payload.end);

    return successResult(command.id, {
      data: {
        nodeId: node.id,
        start: payload.start,
        end: payload.end,
        fills: fills === figma.mixed ? 'mixed' : fills,
        isMixed: fills === figma.mixed,
      },
    });
  } catch (err) {
    var message = err instanceof Error ? err.message : String(err);
    return errorResult(command.id, 'Failed to get range fills: ' + message);
  }
}

// Set range fills
export async function handleSetRangeFills(command: FigmaCommand): Promise<CommandResult> {
  var targetId = command.target;
  var payload = command.payload as {
    start: number;
    end: number;
    fills: any[];
  };

  if (!targetId) {
    return errorResult(command.id, 'Target text node ID is required');
  }

  if (!payload || payload.start === undefined || payload.end === undefined || !payload.fills) {
    return errorResult(command.id, 'Start, end, and fills are required');
  }

  try {
    var node = await figma.getNodeByIdAsync(targetId);

    if (!node || node.type !== 'TEXT') {
      return errorResult(command.id, 'Node is not a text node');
    }

    var textNode = node as TextNode;

    // Load fonts first
    await figma.loadFontAsync(textNode.fontName as FontName);

    textNode.setRangeFills(payload.start, payload.end, payload.fills);

    return successResult(command.id, {
      data: {
        nodeId: node.id,
        start: payload.start,
        end: payload.end,
        success: true,
      },
    });
  } catch (err) {
    var message = err instanceof Error ? err.message : String(err);
    return errorResult(command.id, 'Failed to set range fills: ' + message);
  }
}

// Get range text style ID
export async function handleGetRangeTextStyleId(command: FigmaCommand): Promise<CommandResult> {
  var targetId = command.target;
  var payload = command.payload as {
    start: number;
    end: number;
  };

  if (!targetId) {
    return errorResult(command.id, 'Target text node ID is required');
  }

  if (!payload || payload.start === undefined || payload.end === undefined) {
    return errorResult(command.id, 'Start and end positions are required');
  }

  try {
    var node = await figma.getNodeByIdAsync(targetId);

    if (!node || node.type !== 'TEXT') {
      return errorResult(command.id, 'Node is not a text node');
    }

    var textNode = node as TextNode;
    var styleId = textNode.getRangeTextStyleId(payload.start, payload.end);

    return successResult(command.id, {
      data: {
        nodeId: node.id,
        start: payload.start,
        end: payload.end,
        textStyleId: styleId === figma.mixed ? 'mixed' : styleId,
        isMixed: styleId === figma.mixed,
      },
    });
  } catch (err) {
    var message = err instanceof Error ? err.message : String(err);
    return errorResult(command.id, 'Failed to get range text style ID: ' + message);
  }
}

// Set range text style ID async
export async function handleSetRangeTextStyleIdAsync(command: FigmaCommand): Promise<CommandResult> {
  var targetId = command.target;
  var payload = command.payload as {
    start: number;
    end: number;
    styleId: string;
  };

  if (!targetId) {
    return errorResult(command.id, 'Target text node ID is required');
  }

  if (!payload || payload.start === undefined || payload.end === undefined || !payload.styleId) {
    return errorResult(command.id, 'Start, end, and style ID are required');
  }

  try {
    var node = await figma.getNodeByIdAsync(targetId);

    if (!node || node.type !== 'TEXT') {
      return errorResult(command.id, 'Node is not a text node');
    }

    var textNode = node as TextNode;
    await textNode.setRangeTextStyleIdAsync(payload.start, payload.end, payload.styleId);

    return successResult(command.id, {
      data: {
        nodeId: node.id,
        start: payload.start,
        end: payload.end,
        styleId: payload.styleId,
        success: true,
      },
    });
  } catch (err) {
    var message = err instanceof Error ? err.message : String(err);
    return errorResult(command.id, 'Failed to set range text style ID: ' + message);
  }
}

// Get range list options
export async function handleGetRangeListOptions(command: FigmaCommand): Promise<CommandResult> {
  var targetId = command.target;
  var payload = command.payload as {
    start: number;
    end: number;
  };

  if (!targetId) {
    return errorResult(command.id, 'Target text node ID is required');
  }

  if (!payload || payload.start === undefined || payload.end === undefined) {
    return errorResult(command.id, 'Start and end positions are required');
  }

  try {
    var node = await figma.getNodeByIdAsync(targetId);

    if (!node || node.type !== 'TEXT') {
      return errorResult(command.id, 'Node is not a text node');
    }

    var textNode = node as TextNode;
    var listOptions = textNode.getRangeListOptions(payload.start, payload.end);

    return successResult(command.id, {
      data: {
        nodeId: node.id,
        start: payload.start,
        end: payload.end,
        listOptions: listOptions === figma.mixed ? 'mixed' : listOptions,
        isMixed: listOptions === figma.mixed,
      },
    });
  } catch (err) {
    var message = err instanceof Error ? err.message : String(err);
    return errorResult(command.id, 'Failed to get range list options: ' + message);
  }
}

// Set range list options
export async function handleSetRangeListOptions(command: FigmaCommand): Promise<CommandResult> {
  var targetId = command.target;
  var payload = command.payload as {
    start: number;
    end: number;
    listOptions: any;
  };

  if (!targetId) {
    return errorResult(command.id, 'Target text node ID is required');
  }

  if (!payload || payload.start === undefined || payload.end === undefined || !payload.listOptions) {
    return errorResult(command.id, 'Start, end, and list options are required');
  }

  try {
    var node = await figma.getNodeByIdAsync(targetId);

    if (!node || node.type !== 'TEXT') {
      return errorResult(command.id, 'Node is not a text node');
    }

    var textNode = node as TextNode;
    await figma.loadFontAsync(textNode.fontName as FontName);
    textNode.setRangeListOptions(payload.start, payload.end, payload.listOptions);

    return successResult(command.id, {
      data: {
        nodeId: node.id,
        start: payload.start,
        end: payload.end,
        success: true,
      },
    });
  } catch (err) {
    var message = err instanceof Error ? err.message : String(err);
    return errorResult(command.id, 'Failed to set range list options: ' + message);
  }
}

// Get range indentation
export async function handleGetRangeIndentation(command: FigmaCommand): Promise<CommandResult> {
  var targetId = command.target;
  var payload = command.payload as {
    start: number;
    end: number;
  };

  if (!targetId) {
    return errorResult(command.id, 'Target text node ID is required');
  }

  if (!payload || payload.start === undefined || payload.end === undefined) {
    return errorResult(command.id, 'Start and end positions are required');
  }

  try {
    var node = await figma.getNodeByIdAsync(targetId);

    if (!node || node.type !== 'TEXT') {
      return errorResult(command.id, 'Node is not a text node');
    }

    var textNode = node as TextNode;
    var indentation = textNode.getRangeIndentation(payload.start, payload.end);

    return successResult(command.id, {
      data: {
        nodeId: node.id,
        start: payload.start,
        end: payload.end,
        indentation: indentation === figma.mixed ? 'mixed' : indentation,
        isMixed: indentation === figma.mixed,
      },
    });
  } catch (err) {
    var message = err instanceof Error ? err.message : String(err);
    return errorResult(command.id, 'Failed to get range indentation: ' + message);
  }
}

// Set range indentation
export async function handleSetRangeIndentation(command: FigmaCommand): Promise<CommandResult> {
  var targetId = command.target;
  var payload = command.payload as {
    start: number;
    end: number;
    indentation: number;
  };

  if (!targetId) {
    return errorResult(command.id, 'Target text node ID is required');
  }

  if (!payload || payload.start === undefined || payload.end === undefined || payload.indentation === undefined) {
    return errorResult(command.id, 'Start, end, and indentation are required');
  }

  try {
    var node = await figma.getNodeByIdAsync(targetId);

    if (!node || node.type !== 'TEXT') {
      return errorResult(command.id, 'Node is not a text node');
    }

    var textNode = node as TextNode;
    await figma.loadFontAsync(textNode.fontName as FontName);
    textNode.setRangeIndentation(payload.start, payload.end, payload.indentation);

    return successResult(command.id, {
      data: {
        nodeId: node.id,
        start: payload.start,
        end: payload.end,
        indentation: payload.indentation,
        success: true,
      },
    });
  } catch (err) {
    var message = err instanceof Error ? err.message : String(err);
    return errorResult(command.id, 'Failed to set range indentation: ' + message);
  }
}

// Get range paragraph spacing
export async function handleGetRangeParagraphSpacing(command: FigmaCommand): Promise<CommandResult> {
  var targetId = command.target;
  var payload = command.payload as {
    start: number;
    end: number;
  };

  if (!targetId) {
    return errorResult(command.id, 'Target text node ID is required');
  }

  if (!payload || payload.start === undefined || payload.end === undefined) {
    return errorResult(command.id, 'Start and end positions are required');
  }

  try {
    var node = await figma.getNodeByIdAsync(targetId);

    if (!node || node.type !== 'TEXT') {
      return errorResult(command.id, 'Node is not a text node');
    }

    var textNode = node as TextNode;
    var spacing = textNode.getRangeParagraphSpacing(payload.start, payload.end);

    return successResult(command.id, {
      data: {
        nodeId: node.id,
        start: payload.start,
        end: payload.end,
        paragraphSpacing: spacing === figma.mixed ? 'mixed' : spacing,
        isMixed: spacing === figma.mixed,
      },
    });
  } catch (err) {
    var message = err instanceof Error ? err.message : String(err);
    return errorResult(command.id, 'Failed to get range paragraph spacing: ' + message);
  }
}

// Set range paragraph spacing
export async function handleSetRangeParagraphSpacing(command: FigmaCommand): Promise<CommandResult> {
  var targetId = command.target;
  var payload = command.payload as {
    start: number;
    end: number;
    paragraphSpacing: number;
  };

  if (!targetId) {
    return errorResult(command.id, 'Target text node ID is required');
  }

  if (!payload || payload.start === undefined || payload.end === undefined || payload.paragraphSpacing === undefined) {
    return errorResult(command.id, 'Start, end, and paragraph spacing are required');
  }

  try {
    var node = await figma.getNodeByIdAsync(targetId);

    if (!node || node.type !== 'TEXT') {
      return errorResult(command.id, 'Node is not a text node');
    }

    var textNode = node as TextNode;
    await figma.loadFontAsync(textNode.fontName as FontName);
    textNode.setRangeParagraphSpacing(payload.start, payload.end, payload.paragraphSpacing);

    return successResult(command.id, {
      data: {
        nodeId: node.id,
        start: payload.start,
        end: payload.end,
        paragraphSpacing: payload.paragraphSpacing,
        success: true,
      },
    });
  } catch (err) {
    var message = err instanceof Error ? err.message : String(err);
    return errorResult(command.id, 'Failed to set range paragraph spacing: ' + message);
  }
}

// Get range paragraph indent
export async function handleGetRangeParagraphIndent(command: FigmaCommand): Promise<CommandResult> {
  var targetId = command.target;
  var payload = command.payload as {
    start: number;
    end: number;
  };

  if (!targetId) {
    return errorResult(command.id, 'Target text node ID is required');
  }

  if (!payload || payload.start === undefined || payload.end === undefined) {
    return errorResult(command.id, 'Start and end positions are required');
  }

  try {
    var node = await figma.getNodeByIdAsync(targetId);

    if (!node || node.type !== 'TEXT') {
      return errorResult(command.id, 'Node is not a text node');
    }

    var textNode = node as TextNode;
    var indent = textNode.getRangeParagraphIndent(payload.start, payload.end);

    return successResult(command.id, {
      data: {
        nodeId: node.id,
        start: payload.start,
        end: payload.end,
        paragraphIndent: indent === figma.mixed ? 'mixed' : indent,
        isMixed: indent === figma.mixed,
      },
    });
  } catch (err) {
    var message = err instanceof Error ? err.message : String(err);
    return errorResult(command.id, 'Failed to get range paragraph indent: ' + message);
  }
}

// Set range paragraph indent
export async function handleSetRangeParagraphIndent(command: FigmaCommand): Promise<CommandResult> {
  var targetId = command.target;
  var payload = command.payload as {
    start: number;
    end: number;
    paragraphIndent: number;
  };

  if (!targetId) {
    return errorResult(command.id, 'Target text node ID is required');
  }

  if (!payload || payload.start === undefined || payload.end === undefined || payload.paragraphIndent === undefined) {
    return errorResult(command.id, 'Start, end, and paragraph indent are required');
  }

  try {
    var node = await figma.getNodeByIdAsync(targetId);

    if (!node || node.type !== 'TEXT') {
      return errorResult(command.id, 'Node is not a text node');
    }

    var textNode = node as TextNode;
    await figma.loadFontAsync(textNode.fontName as FontName);
    textNode.setRangeParagraphIndent(payload.start, payload.end, payload.paragraphIndent);

    return successResult(command.id, {
      data: {
        nodeId: node.id,
        start: payload.start,
        end: payload.end,
        paragraphIndent: payload.paragraphIndent,
        success: true,
      },
    });
  } catch (err) {
    var message = err instanceof Error ? err.message : String(err);
    return errorResult(command.id, 'Failed to set range paragraph indent: ' + message);
  }
}

// Get range font name
export async function handleGetRangeFontName(command: FigmaCommand): Promise<CommandResult> {
  var targetId = command.target;
  var payload = command.payload as {
    start: number;
    end: number;
  };

  if (!targetId) {
    return errorResult(command.id, 'Target text node ID is required');
  }

  if (!payload || payload.start === undefined || payload.end === undefined) {
    return errorResult(command.id, 'Start and end positions are required');
  }

  try {
    var node = await figma.getNodeByIdAsync(targetId);

    if (!node || node.type !== 'TEXT') {
      return errorResult(command.id, 'Node is not a text node');
    }

    var textNode = node as TextNode;
    var fontName = textNode.getRangeFontName(payload.start, payload.end);

    if (fontName === figma.mixed) {
      return successResult(command.id, {
        data: {
          nodeId: node.id,
          start: payload.start,
          end: payload.end,
          fontName: 'mixed',
          isMixed: true,
        },
      });
    }

    return successResult(command.id, {
      data: {
        nodeId: node.id,
        start: payload.start,
        end: payload.end,
        fontName: {
          family: fontName.family,
          style: fontName.style,
        },
        isMixed: false,
      },
    });
  } catch (err) {
    var message = err instanceof Error ? err.message : String(err);
    return errorResult(command.id, 'Failed to get range font name: ' + message);
  }
}

// Set range font name
export async function handleSetRangeFontName(command: FigmaCommand): Promise<CommandResult> {
  var targetId = command.target;
  var payload = command.payload as {
    start: number;
    end: number;
    fontFamily: string;
    fontStyle: string;
  };

  if (!targetId) {
    return errorResult(command.id, 'Target text node ID is required');
  }

  if (!payload || payload.start === undefined || payload.end === undefined || !payload.fontFamily || !payload.fontStyle) {
    return errorResult(command.id, 'Start, end, font family, and font style are required');
  }

  try {
    var node = await figma.getNodeByIdAsync(targetId);

    if (!node || node.type !== 'TEXT') {
      return errorResult(command.id, 'Node is not a text node');
    }

    var textNode = node as TextNode;
    var fontName = { family: payload.fontFamily, style: payload.fontStyle };

    await figma.loadFontAsync(fontName);
    textNode.setRangeFontName(payload.start, payload.end, fontName);

    return successResult(command.id, {
      data: {
        nodeId: node.id,
        start: payload.start,
        end: payload.end,
        fontFamily: payload.fontFamily,
        fontStyle: payload.fontStyle,
        success: true,
      },
    });
  } catch (err) {
    var message = err instanceof Error ? err.message : String(err);
    return errorResult(command.id, 'Failed to set range font name: ' + message);
  }
}
