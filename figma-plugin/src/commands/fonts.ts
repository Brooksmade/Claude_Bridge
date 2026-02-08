import type { FigmaCommand, CommandResult } from './types';
import { successResult, errorResult } from './types';

// List all available fonts
export async function handleListFonts(command: FigmaCommand): Promise<CommandResult> {
  var fonts = await figma.listAvailableFontsAsync();

  // Group fonts by family
  var fontFamilies: { [key: string]: string[] } = {};

  for (var i = 0; i < fonts.length; i++) {
    var font = fonts[i];
    var family = font.fontName.family;
    var style = font.fontName.style;

    if (!fontFamilies[family]) {
      fontFamilies[family] = [];
    }
    if (fontFamilies[family].indexOf(style) === -1) {
      fontFamilies[family].push(style);
    }
  }

  // Convert to array format
  var families: object[] = [];
  var familyNames = Object.keys(fontFamilies).sort();

  for (var j = 0; j < familyNames.length; j++) {
    var familyName = familyNames[j];
    families.push({
      family: familyName,
      styles: fontFamilies[familyName].sort(),
    });
  }

  return successResult(command.id, {
    data: {
      totalFonts: fonts.length,
      familyCount: families.length,
      families: families,
    },
  });
}

// Load a specific font
export async function handleLoadFont(command: FigmaCommand): Promise<CommandResult> {
  var payload = command.payload as {
    family: string;
    style?: string;
  };

  if (!payload.family) {
    return errorResult(command.id, 'Font family is required');
  }

  var style = payload.style || 'Regular';

  try {
    await figma.loadFontAsync({ family: payload.family, style: style });

    return successResult(command.id, {
      data: {
        loaded: true,
        family: payload.family,
        style: style,
      },
    });
  } catch (err) {
    var message = err instanceof Error ? err.message : String(err);
    return errorResult(command.id, 'Failed to load font: ' + message);
  }
}

// Check if document has missing fonts
export async function handleCheckMissingFonts(command: FigmaCommand): Promise<CommandResult> {
  var hasMissing = figma.hasMissingFont;

  // Find text nodes with missing fonts
  var missingFonts: object[] = [];

  if (hasMissing) {
    var textNodes = figma.currentPage.findAll(function(node) {
      return node.type === 'TEXT';
    }) as TextNode[];

    var seenFonts: { [key: string]: boolean } = {};

    for (var i = 0; i < textNodes.length; i++) {
      var textNode = textNodes[i];
      if (textNode.hasMissingFont) {
        var fontName = textNode.fontName;
        if (fontName !== figma.mixed) {
          var key = fontName.family + '/' + fontName.style;
          if (!seenFonts[key]) {
            seenFonts[key] = true;
            missingFonts.push({
              family: fontName.family,
              style: fontName.style,
              nodeId: textNode.id,
              nodeName: textNode.name,
            });
          }
        }
      }
    }
  }

  return successResult(command.id, {
    data: {
      hasMissingFonts: hasMissing,
      missingFonts: missingFonts,
    },
  });
}

// Get fonts used in selection or page
export async function handleGetUsedFonts(command: FigmaCommand): Promise<CommandResult> {
  var payload = command.payload as {
    scope?: 'selection' | 'page';
  };

  var scope = (payload && payload.scope) || 'page';
  var textNodes: TextNode[];

  if (scope === 'selection') {
    var selection = figma.currentPage.selection;
    textNodes = [];

    for (var i = 0; i < selection.length; i++) {
      var node = selection[i];
      if (node.type === 'TEXT') {
        textNodes.push(node);
      } else if ('findAll' in node) {
        var found = (node as FrameNode).findAll(function(n) { return n.type === 'TEXT'; }) as TextNode[];
        for (var j = 0; j < found.length; j++) {
          textNodes.push(found[j]);
        }
      }
    }
  } else {
    textNodes = figma.currentPage.findAll(function(node) {
      return node.type === 'TEXT';
    }) as TextNode[];
  }

  // Collect unique fonts
  var fontMap: { [key: string]: { family: string; style: string; count: number } } = {};

  for (var k = 0; k < textNodes.length; k++) {
    var textNode = textNodes[k];
    var fontName = textNode.fontName;

    if (fontName !== figma.mixed) {
      var key = fontName.family + '/' + fontName.style;
      if (!fontMap[key]) {
        fontMap[key] = {
          family: fontName.family,
          style: fontName.style,
          count: 0,
        };
      }
      fontMap[key].count++;
    }
  }

  var fonts: object[] = [];
  var keys = Object.keys(fontMap);
  for (var m = 0; m < keys.length; m++) {
    fonts.push(fontMap[keys[m]]);
  }

  // Sort by count
  fonts.sort(function(a: any, b: any) { return b.count - a.count; });

  return successResult(command.id, {
    data: {
      scope: scope,
      textNodeCount: textNodes.length,
      uniqueFonts: fonts.length,
      fonts: fonts,
    },
  });
}
