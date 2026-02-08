import type { FigmaCommand, CommandResult } from './types';
import { successResult, errorResult } from './types';

// Create a video from bytes
export async function handleCreateVideo(command: FigmaCommand): Promise<CommandResult> {
  var payload = command.payload as {
    data: string; // Base64 encoded video data
    x?: number;
    y?: number;
    name?: string;
    parent?: string;
  };

  if (!payload || !payload.data) {
    return errorResult(command.id, 'Video data (base64) is required');
  }

  try {
    // Decode base64 to Uint8Array
    var binaryString = atob(payload.data);
    var bytes = new Uint8Array(binaryString.length);
    for (var i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    var video = await figma.createVideoAsync(bytes);

    // Create a rectangle to hold the video
    var rect = figma.createRectangle();
    if (payload.name) {
      rect.name = payload.name;
    }
    if (payload.x !== undefined) rect.x = payload.x;
    if (payload.y !== undefined) rect.y = payload.y;

    // Set the video as fill
    rect.fills = [{
      type: 'VIDEO',
      videoHash: video.hash,
      scaleMode: 'FILL',
    }];

    // Move to parent if specified
    if (payload.parent) {
      var parentNode = await figma.getNodeByIdAsync(payload.parent);
      if (parentNode && 'appendChild' in parentNode) {
        (parentNode as FrameNode).appendChild(rect);
      }
    }

    return successResult(command.id, {
      data: {
        id: rect.id,
        name: rect.name,
        videoHash: video.hash,
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
      },
    });
  } catch (err) {
    var message = err instanceof Error ? err.message : String(err);
    return errorResult(command.id, 'Failed to create video: ' + message);
  }
}

// Create an image from URL (async version)
export async function handleCreateImageAsync(command: FigmaCommand): Promise<CommandResult> {
  var payload = command.payload as {
    url: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    name?: string;
    parent?: string;
  };

  if (!payload || !payload.url) {
    return errorResult(command.id, 'Image URL is required');
  }

  try {
    var image = await figma.createImageAsync(payload.url);

    var rect = figma.createRectangle();
    if (payload.name) {
      rect.name = payload.name;
    }

    // Set size
    var width = payload.width || 200;
    var height = payload.height || 200;
    rect.resize(width, height);

    if (payload.x !== undefined) rect.x = payload.x;
    if (payload.y !== undefined) rect.y = payload.y;

    // Set the image as fill
    rect.fills = [{
      type: 'IMAGE',
      imageHash: image.hash,
      scaleMode: 'FILL',
    }];

    // Move to parent if specified
    if (payload.parent) {
      var parentNode = await figma.getNodeByIdAsync(payload.parent);
      if (parentNode && 'appendChild' in parentNode) {
        (parentNode as FrameNode).appendChild(rect);
      }
    }

    return successResult(command.id, {
      data: {
        id: rect.id,
        name: rect.name,
        imageHash: image.hash,
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
      },
    });
  } catch (err) {
    var message = err instanceof Error ? err.message : String(err);
    return errorResult(command.id, 'Failed to create image from URL: ' + message);
  }
}

// Create a link preview (embed or unfurl)
export async function handleCreateLinkPreview(command: FigmaCommand): Promise<CommandResult> {
  var payload = command.payload as {
    url: string;
    x?: number;
    y?: number;
    parent?: string;
  };

  if (!payload || !payload.url) {
    return errorResult(command.id, 'URL is required');
  }

  try {
    var node = await figma.createLinkPreviewAsync(payload.url);

    if (payload.x !== undefined) node.x = payload.x;
    if (payload.y !== undefined) node.y = payload.y;

    // Move to parent if specified
    if (payload.parent) {
      var parentNode = await figma.getNodeByIdAsync(payload.parent);
      if (parentNode && 'appendChild' in parentNode) {
        (parentNode as FrameNode).appendChild(node);
      }
    }

    return successResult(command.id, {
      data: {
        id: node.id,
        name: node.name,
        type: node.type,
        x: node.x,
        y: node.y,
        width: node.width,
        height: node.height,
      },
    });
  } catch (err) {
    var message = err instanceof Error ? err.message : String(err);
    return errorResult(command.id, 'Failed to create link preview: ' + message);
  }
}

// Create a GIF from hash
export async function handleCreateGif(command: FigmaCommand): Promise<CommandResult> {
  var payload = command.payload as {
    hash: string;
    x?: number;
    y?: number;
    name?: string;
    parent?: string;
  };

  if (!payload || !payload.hash) {
    return errorResult(command.id, 'GIF hash is required');
  }

  try {
    var mediaNode = figma.createGif(payload.hash);

    if (payload.name) {
      mediaNode.name = payload.name;
    }
    if (payload.x !== undefined) mediaNode.x = payload.x;
    if (payload.y !== undefined) mediaNode.y = payload.y;

    // Move to parent if specified
    if (payload.parent) {
      var parentNode = await figma.getNodeByIdAsync(payload.parent);
      if (parentNode && 'appendChild' in parentNode) {
        (parentNode as FrameNode).appendChild(mediaNode);
      }
    }

    return successResult(command.id, {
      data: {
        id: mediaNode.id,
        name: mediaNode.name,
        type: mediaNode.type,
        x: mediaNode.x,
        y: mediaNode.y,
        width: mediaNode.width,
        height: mediaNode.height,
      },
    });
  } catch (err) {
    var message = err instanceof Error ? err.message : String(err);
    return errorResult(command.id, 'Failed to create GIF: ' + message);
  }
}

// Create a page divider
export async function handleCreatePageDivider(command: FigmaCommand): Promise<CommandResult> {
  var payload = command.payload as {
    name?: string;
  };

  try {
    var divider = figma.createPageDivider(payload && payload.name);

    return successResult(command.id, {
      data: {
        id: divider.id,
        name: divider.name,
        type: divider.type,
      },
    });
  } catch (err) {
    var message = err instanceof Error ? err.message : String(err);
    return errorResult(command.id, 'Failed to create page divider: ' + message);
  }
}

// Create a slide (Figma Slides)
export async function handleCreateSlide(command: FigmaCommand): Promise<CommandResult> {
  var payload = command.payload as {
    row?: number;
    col?: number;
  };

  try {
    var row = payload && payload.row !== undefined ? payload.row : undefined;
    var col = payload && payload.col !== undefined ? payload.col : undefined;

    var slide = figma.createSlide(row, col);

    return successResult(command.id, {
      data: {
        id: slide.id,
        name: slide.name,
        type: slide.type,
        x: slide.x,
        y: slide.y,
        width: slide.width,
        height: slide.height,
      },
    });
  } catch (err) {
    var message = err instanceof Error ? err.message : String(err);
    return errorResult(command.id, 'Failed to create slide: ' + message);
  }
}

// Create a slide row (Figma Slides)
export async function handleCreateSlideRow(command: FigmaCommand): Promise<CommandResult> {
  var payload = command.payload as {
    row?: number;
  };

  try {
    var row = payload && payload.row !== undefined ? payload.row : undefined;
    var slideRow = figma.createSlideRow(row);

    return successResult(command.id, {
      data: {
        id: slideRow.id,
        name: slideRow.name,
        type: slideRow.type,
      },
    });
  } catch (err) {
    var message = err instanceof Error ? err.message : String(err);
    return errorResult(command.id, 'Failed to create slide row: ' + message);
  }
}

// Get slide grid
export async function handleGetSlideGrid(command: FigmaCommand): Promise<CommandResult> {
  try {
    var grid = figma.getSlideGrid();

    return successResult(command.id, {
      data: {
        rows: grid.length,
        grid: grid.map((row, rowIndex) => ({
          row: rowIndex,
          slides: row.map(slide => ({
            id: slide.id,
            name: slide.name,
            x: slide.x,
            y: slide.y,
          })),
        })),
      },
    });
  } catch (err) {
    var message = err instanceof Error ? err.message : String(err);
    return errorResult(command.id, 'Failed to get slide grid: ' + message);
  }
}

// Create canvas row (FigJam canvas grid)
export async function handleCreateCanvasRow(command: FigmaCommand): Promise<CommandResult> {
  var payload = command.payload as {
    rowIndex?: number;
  };

  try {
    var rowIndex = payload && payload.rowIndex !== undefined ? payload.rowIndex : undefined;
    var node = figma.createCanvasRow(rowIndex);

    return successResult(command.id, {
      data: {
        id: node.id,
        name: node.name,
        type: node.type,
        x: node.x,
        y: node.y,
      },
    });
  } catch (err) {
    var message = err instanceof Error ? err.message : String(err);
    return errorResult(command.id, 'Failed to create canvas row: ' + message);
  }
}

// Get canvas grid
export async function handleGetCanvasGrid(command: FigmaCommand): Promise<CommandResult> {
  try {
    var grid = figma.getCanvasGrid();

    return successResult(command.id, {
      data: {
        rows: grid.length,
        grid: grid.map((row, rowIndex) => ({
          row: rowIndex,
          nodes: row.map(node => ({
            id: node.id,
            name: node.name,
            type: node.type,
            x: node.x,
            y: node.y,
          })),
        })),
      },
    });
  } catch (err) {
    var message = err instanceof Error ? err.message : String(err);
    return errorResult(command.id, 'Failed to get canvas grid: ' + message);
  }
}
