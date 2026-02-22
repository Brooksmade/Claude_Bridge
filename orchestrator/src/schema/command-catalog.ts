/**
 * Static catalog of all Figma Bridge commands.
 * Each entry defines the command type string, category, description,
 * JSON Schema for the payload, and behavioral flags.
 *
 * Start with the ~30 most-used commands; the rest are stubs expandable incrementally.
 */

export type CommandCategory =
  | 'core'
  | 'variables'
  | 'styles'
  | 'components'
  | 'text'
  | 'website'
  | 'layout'
  | 'query'
  | 'export'
  | 'pages'
  | 'images'
  | 'design-system'
  | 'find'
  | 'import'
  | 'media'
  | 'properties'
  | 'dev-resources'
  | 'utilities';

export interface CommandSchema {
  type: 'object';
  properties: Record<string, JsonSchemaProperty>;
  required?: string[];
  additionalProperties?: boolean;
}

export type JsonSchemaProperty =
  | { type: 'string'; description?: string; enum?: string[] }
  | { type: 'number'; description?: string }
  | { type: 'integer'; description?: string }
  | { type: 'boolean'; description?: string }
  | { type: 'array'; items: JsonSchemaProperty; description?: string }
  | { type: 'object'; properties?: Record<string, JsonSchemaProperty>; description?: string; additionalProperties?: boolean | JsonSchemaProperty; required?: string[] }
  | { oneOf: JsonSchemaProperty[]; description?: string };

export interface CommandMeta {
  /** The command type string sent to the bridge */
  type: string;
  /** Category for grouping */
  category: CommandCategory;
  /** Human-readable description */
  description: string;
  /** JSON Schema for the payload */
  payloadSchema: CommandSchema;
  /** Whether this command targets a specific node (uses `target` field) */
  requiresTarget?: boolean;
  /** Whether this command is long-running (use extended timeout) */
  longRunning?: boolean;
  /** Whether this command is handled server-side (not sent to Figma plugin) */
  serverSide?: boolean;
  /** Whether the result typically contains a nodeId */
  returnsNodeId?: boolean;
  /** Whether the result typically contains nodeIds array */
  returnsNodeIds?: boolean;
}

// ─── Helper schemas reused across commands ───

const nodeIdProp: JsonSchemaProperty = {
  type: 'string',
  description: 'Figma node ID (e.g., "1:23")',
};

const colorObject: JsonSchemaProperty = {
  type: 'object',
  properties: {
    r: { type: 'number', description: 'Red channel 0-1' },
    g: { type: 'number', description: 'Green channel 0-1' },
    b: { type: 'number', description: 'Blue channel 0-1' },
  },
  required: ['r', 'g', 'b'],
};

const solidPaint: JsonSchemaProperty = {
  type: 'object',
  properties: {
    type: { type: 'string', enum: ['SOLID'] },
    color: colorObject,
    opacity: { type: 'number', description: 'Opacity 0-1' },
  },
  required: ['type', 'color'],
};

const paintArray: JsonSchemaProperty = {
  type: 'array',
  items: solidPaint,
  description: 'Array of paint fills',
};

const nodeProperties: JsonSchemaProperty = {
  type: 'object',
  description: 'Node properties to set',
  additionalProperties: true,
  properties: {
    name: { type: 'string' },
    x: { type: 'number' },
    y: { type: 'number' },
    width: { type: 'number' },
    height: { type: 'number' },
    fills: paintArray,
    strokes: paintArray,
    strokeWeight: { type: 'number' },
    cornerRadius: { type: 'number' },
    opacity: { type: 'number' },
    visible: { type: 'boolean' },
    locked: { type: 'boolean' },
    characters: { type: 'string', description: 'Text content (TEXT nodes)' },
    fontSize: { type: 'number' },
    layoutMode: { type: 'string', enum: ['NONE', 'HORIZONTAL', 'VERTICAL'] },
    itemSpacing: { type: 'number' },
    paddingLeft: { type: 'number' },
    paddingRight: { type: 'number' },
    paddingTop: { type: 'number' },
    paddingBottom: { type: 'number' },
  },
};

// ─── The Catalog ───

export const COMMAND_CATALOG: Record<string, CommandMeta> = {
  // ═══ CORE ═══

  ping: {
    type: 'ping',
    category: 'core',
    description: 'Test connectivity with the Figma plugin. Returns {pong: true}.',
    payloadSchema: { type: 'object', properties: {} },
  },

  create: {
    type: 'create',
    category: 'core',
    description: 'Create a new node in Figma (frame, rectangle, text, ellipse, etc.).',
    returnsNodeId: true,
    payloadSchema: {
      type: 'object',
      properties: {
        nodeType: {
          type: 'string',
          enum: ['FRAME', 'RECTANGLE', 'ELLIPSE', 'TEXT', 'LINE', 'POLYGON', 'STAR', 'VECTOR', 'COMPONENT', 'GROUP'],
          description: 'Type of node to create',
        },
        properties: nodeProperties,
        parent: { type: 'string', description: 'Parent node ID. Defaults to current page.' },
        children: { type: 'array', items: { type: 'object', additionalProperties: true }, description: 'Nested child nodes to create' },
      },
      required: ['nodeType'],
    },
  },

  batchCreate: {
    type: 'batchCreate',
    category: 'core',
    description: 'Create multiple nodes in a single command. Payload is a direct array of CreatePayload objects.',
    returnsNodeIds: true,
    payloadSchema: {
      type: 'object',
      properties: {},
      additionalProperties: true,
    },
  },

  modify: {
    type: 'modify',
    category: 'core',
    description: 'Modify properties of an existing node.',
    requiresTarget: true,
    payloadSchema: {
      type: 'object',
      properties: {
        properties: nodeProperties,
      },
      required: ['properties'],
    },
  },

  batchModify: {
    type: 'batchModify',
    category: 'core',
    description: 'Modify multiple nodes in a single command.',
    payloadSchema: {
      type: 'object',
      properties: {},
      additionalProperties: true,
    },
  },

  move: {
    type: 'move',
    category: 'core',
    description: 'Move a node to a new position.',
    requiresTarget: true,
    payloadSchema: {
      type: 'object',
      properties: {
        x: { type: 'number', description: 'New X position' },
        y: { type: 'number', description: 'New Y position' },
      },
    },
  },

  resize: {
    type: 'resize',
    category: 'core',
    description: 'Resize a node.',
    requiresTarget: true,
    payloadSchema: {
      type: 'object',
      properties: {
        width: { type: 'number' },
        height: { type: 'number' },
      },
    },
  },

  delete: {
    type: 'delete',
    category: 'core',
    description: 'Delete a node by ID.',
    requiresTarget: true,
    payloadSchema: { type: 'object', properties: {} },
  },

  batchDelete: {
    type: 'batchDelete',
    category: 'core',
    description: 'Delete multiple nodes by IDs.',
    payloadSchema: {
      type: 'object',
      properties: {
        nodeIds: { type: 'array', items: nodeIdProp, description: 'Array of node IDs to delete' },
      },
      required: ['nodeIds'],
    },
  },

  clone: {
    type: 'clone',
    category: 'core',
    description: 'Clone/duplicate a node.',
    requiresTarget: true,
    returnsNodeId: true,
    payloadSchema: { type: 'object', properties: {} },
  },

  group: {
    type: 'group',
    category: 'core',
    description: 'Group multiple nodes together.',
    payloadSchema: {
      type: 'object',
      properties: {
        nodeIds: { type: 'array', items: nodeIdProp },
      },
      required: ['nodeIds'],
    },
    returnsNodeId: true,
  },

  ungroup: {
    type: 'ungroup',
    category: 'core',
    description: 'Ungroup a group node.',
    requiresTarget: true,
    payloadSchema: { type: 'object', properties: {} },
  },

  reparent: {
    type: 'reparent',
    category: 'core',
    description: 'Move a node to a different parent.',
    requiresTarget: true,
    payloadSchema: {
      type: 'object',
      properties: {
        newParentId: nodeIdProp,
        index: { type: 'number', description: 'Position within new parent' },
      },
      required: ['newParentId'],
    },
  },

  renameNode: {
    type: 'renameNode',
    category: 'core',
    description: 'Rename a node.',
    requiresTarget: true,
    payloadSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'New name for the node' },
      },
      required: ['name'],
    },
  },

  // ═══ QUERY ═══

  query: {
    type: 'query',
    category: 'query',
    description:
      'Query nodes in Figma. queryType: "node" (single by target), "selection" (current selection), "page" (page children), "children" (node children — SLOW on large nodes, prefer "describe"), "describe" (fast structural overview).',
    payloadSchema: {
      type: 'object',
      properties: {
        queryType: {
          type: 'string',
          enum: ['node', 'selection', 'page', 'children', 'describe'],
          description: 'Type of query',
        },
        properties: {
          type: 'array',
          items: { type: 'string' },
          description: 'Which properties to return',
        },
      },
      required: ['queryType'],
    },
    requiresTarget: true,
  },

  getFrames: {
    type: 'getFrames',
    category: 'query',
    description: 'Get all top-level frames on the current page.',
    payloadSchema: { type: 'object', properties: {} },
  },

  select: {
    type: 'select',
    category: 'query',
    description: 'Select nodes by their IDs.',
    payloadSchema: {
      type: 'object',
      properties: {
        nodeIds: { type: 'array', items: nodeIdProp },
      },
      required: ['nodeIds'],
    },
  },

  setPage: {
    type: 'setPage',
    category: 'query',
    description: 'Switch to a different page.',
    payloadSchema: {
      type: 'object',
      properties: {
        pageId: nodeIdProp,
        pageName: { type: 'string', description: 'Page name (alternative to pageId)' },
      },
    },
  },

  getViewport: {
    type: 'getViewport',
    category: 'query',
    description: 'Get the current viewport position and zoom.',
    payloadSchema: { type: 'object', properties: {} },
  },

  setViewport: {
    type: 'setViewport',
    category: 'query',
    description: 'Set the viewport position and zoom.',
    payloadSchema: {
      type: 'object',
      properties: {
        x: { type: 'number' },
        y: { type: 'number' },
        zoom: { type: 'number' },
      },
    },
  },

  // ═══ VARIABLES ═══

  createVariableCollection: {
    type: 'createVariableCollection',
    category: 'variables',
    description: 'Create a new variable collection.',
    payloadSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Collection name' },
        modes: { type: 'array', items: { type: 'string' }, description: 'Mode names (e.g., ["Light Mode", "Dark Mode"])' },
      },
      required: ['name'],
    },
  },

  createVariable: {
    type: 'createVariable',
    category: 'variables',
    description: 'Create a variable in a collection. Use type "COLOR", "FLOAT", "STRING", or "BOOLEAN".',
    payloadSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Variable name (use "/" for groups)' },
        collectionId: { type: 'string', description: 'Target collection ID' },
        type: { type: 'string', enum: ['COLOR', 'FLOAT', 'STRING', 'BOOLEAN'], description: 'Variable type' },
        values: { type: 'object', additionalProperties: true, description: 'Values keyed by mode name' },
        description: { type: 'string' },
        scopes: { type: 'array', items: { type: 'string' } },
      },
      required: ['name', 'collectionId', 'type'],
    },
  },

  editVariable: {
    type: 'editVariable',
    category: 'variables',
    description: 'Edit an existing variable. Use "values" (plural), not "value".',
    payloadSchema: {
      type: 'object',
      properties: {
        variableId: { type: 'string', description: 'Variable ID to edit' },
        name: { type: 'string' },
        values: { type: 'object', additionalProperties: true, description: 'Values keyed by mode name' },
        description: { type: 'string' },
        scopes: { type: 'array', items: { type: 'string' } },
        hiddenFromPublishing: { type: 'boolean' },
      },
      required: ['variableId'],
    },
  },

  batchEditVariable: {
    type: 'batchEditVariable',
    category: 'variables',
    description: 'Edit multiple variables. Payload is a direct array of edit objects.',
    payloadSchema: {
      type: 'object',
      properties: {},
      additionalProperties: true,
    },
  },

  deleteVariable: {
    type: 'deleteVariable',
    category: 'variables',
    description: 'Delete a variable by ID.',
    payloadSchema: {
      type: 'object',
      properties: {
        variableId: { type: 'string' },
      },
      required: ['variableId'],
    },
  },

  getVariables: {
    type: 'getVariables',
    category: 'variables',
    description: 'Get all variables, optionally filtered by collection.',
    payloadSchema: {
      type: 'object',
      properties: {
        collectionId: { type: 'string', description: 'Filter by collection ID' },
        collectionName: { type: 'string', description: 'Filter by collection name (case-sensitive)' },
        includeValues: { type: 'boolean', description: 'Include hex values for COLOR variables' },
      },
    },
  },

  bindFillVariable: {
    type: 'bindFillVariable',
    category: 'variables',
    description: 'Bind a fill variable to a node. nodeId goes in payload, NOT as target.',
    payloadSchema: {
      type: 'object',
      properties: {
        nodeId: nodeIdProp,
        variableId: { type: 'string' },
        fillIndex: { type: 'number', description: 'Fill index (default 0)' },
      },
      required: ['nodeId', 'variableId'],
    },
  },

  bindStrokeVariable: {
    type: 'bindStrokeVariable',
    category: 'variables',
    description: 'Bind a stroke variable to a node. nodeId goes in payload.',
    payloadSchema: {
      type: 'object',
      properties: {
        nodeId: nodeIdProp,
        variableId: { type: 'string' },
        strokeIndex: { type: 'number', description: 'Stroke index (default 0)' },
      },
      required: ['nodeId', 'variableId'],
    },
  },

  bindMatchingColors: {
    type: 'bindMatchingColors',
    category: 'variables',
    description: 'Automatically bind variables to nodes that match by color value. Resolves alias chains.',
    payloadSchema: {
      type: 'object',
      properties: {
        nodeId: nodeIdProp,
        recursive: { type: 'boolean', description: 'Process children recursively' },
      },
      required: ['nodeId'],
    },
  },

  autoBindByRole: {
    type: 'autoBindByRole',
    category: 'variables',
    description: 'Bind variables by semantic role detection (Surface/Page, Text/Primary, Border/Default, etc.).',
    payloadSchema: {
      type: 'object',
      properties: {
        nodeId: nodeIdProp,
        recursive: { type: 'boolean' },
      },
      required: ['nodeId'],
    },
  },

  autoBindSpacing: {
    type: 'autoBindSpacing',
    category: 'variables',
    description: 'Automatically bind spacing variables to auto-layout nodes.',
    payloadSchema: {
      type: 'object',
      properties: {
        nodeId: nodeIdProp,
        recursive: { type: 'boolean' },
      },
      required: ['nodeId'],
    },
  },

  getVariableById: {
    type: 'getVariableById',
    category: 'variables',
    description: 'Get a variable by ID with full valuesByMode.',
    payloadSchema: {
      type: 'object',
      properties: {
        variableId: { type: 'string' },
        includeCollection: { type: 'boolean', description: 'Include parent collection info' },
      },
      required: ['variableId'],
    },
  },

  // ═══ DESIGN SYSTEM ═══

  createDesignSystem: {
    type: 'createDesignSystem',
    category: 'design-system',
    description: 'Create a complete 4-level variable hierarchy (Primitive → Semantic → Tokens → Theme). Supports extracted tokens and conditional boilerplate.',
    longRunning: true,
    payloadSchema: {
      type: 'object',
      properties: {
        brandColors: {
          type: 'object',
          additionalProperties: true,
          description: 'Brand colors: {primary: "#hex", secondary: "#hex", tertiary: "#hex"}',
        },
        includeBoilerplate: { type: 'boolean', description: 'Include default boilerplate values (default true)' },
        extractedTokens: { type: 'object', additionalProperties: true, description: 'Tokens from extractDesignTokens' },
        organizingPrinciple: {
          type: 'string',
          enum: ['four-level', 'three-level', 'two-level', 'material-design', 'tailwind'],
        },
      },
    },
  },

  validateDesignSystem: {
    type: 'validateDesignSystem',
    category: 'design-system',
    description: 'Validate the design system structure, modes, naming, and alias chains.',
    payloadSchema: { type: 'object', properties: {} },
  },

  getDesignSystemStatus: {
    type: 'getDesignSystemStatus',
    category: 'design-system',
    description: 'Get status of the current design system (collection counts, variable counts).',
    payloadSchema: { type: 'object', properties: {} },
  },

  extractDesignTokens: {
    type: 'extractDesignTokens',
    category: 'design-system',
    description: 'Extract design tokens (colors, typography, spacing, shadows) from a frame or the entire file.',
    longRunning: true,
    payloadSchema: {
      type: 'object',
      properties: {
        nodeId: nodeIdProp,
        scope: { type: 'string', enum: ['node', 'file'], description: '"node" for a specific frame, "file" for entire file' },
      },
    },
  },

  // ═══ STYLES ═══

  createPaintStyle: {
    type: 'createPaintStyle',
    category: 'styles',
    description: 'Create a paint (color) style.',
    payloadSchema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        paints: paintArray,
        description: { type: 'string' },
      },
      required: ['name', 'paints'],
    },
  },

  createTextStyle: {
    type: 'createTextStyle',
    category: 'styles',
    description: 'Create a text style.',
    payloadSchema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        fontFamily: { type: 'string' },
        fontStyle: { type: 'string' },
        fontSize: { type: 'number' },
        lineHeight: { type: 'object', properties: { value: { type: 'number' }, unit: { type: 'string', enum: ['PIXELS', 'PERCENT', 'AUTO'] } } },
        letterSpacing: { type: 'object', properties: { value: { type: 'number' }, unit: { type: 'string', enum: ['PIXELS', 'PERCENT'] } } },
        description: { type: 'string' },
      },
      required: ['name'],
    },
  },

  applyStyle: {
    type: 'applyStyle',
    category: 'styles',
    description: 'Apply an existing style to a node.',
    requiresTarget: true,
    payloadSchema: {
      type: 'object',
      properties: {
        styleId: { type: 'string' },
        styleType: { type: 'string', enum: ['paint', 'text', 'effect', 'grid'] },
      },
      required: ['styleId'],
    },
  },

  getStyles: {
    type: 'getStyles',
    category: 'styles',
    description: 'Get all local styles.',
    payloadSchema: {
      type: 'object',
      properties: {
        styleType: { type: 'string', enum: ['paint', 'text', 'effect', 'grid'], description: 'Filter by style type' },
      },
    },
  },

  // ═══ COMPONENTS ═══

  createComponent: {
    type: 'createComponent',
    category: 'components',
    description: 'Create a component from node properties or convert an existing frame.',
    returnsNodeId: true,
    payloadSchema: {
      type: 'object',
      properties: {
        properties: nodeProperties,
        parent: nodeIdProp,
        fromNodeId: { type: 'string', description: 'Convert existing node to component' },
      },
    },
  },

  createComponentSet: {
    type: 'createComponentSet',
    category: 'components',
    description: 'Create a component set (variant group).',
    returnsNodeId: true,
    payloadSchema: {
      type: 'object',
      properties: {
        componentIds: { type: 'array', items: nodeIdProp, description: 'Component IDs to group as variants' },
      },
      required: ['componentIds'],
    },
  },

  createInstance: {
    type: 'createInstance',
    category: 'components',
    description: 'Create an instance of a component.',
    returnsNodeId: true,
    payloadSchema: {
      type: 'object',
      properties: {
        componentId: nodeIdProp,
        properties: nodeProperties,
        parent: nodeIdProp,
      },
      required: ['componentId'],
    },
  },

  getComponents: {
    type: 'getComponents',
    category: 'components',
    description: 'Get all components in the file.',
    payloadSchema: { type: 'object', properties: {} },
  },

  // ═══ LAYOUT ═══

  setAutoLayout: {
    type: 'setAutoLayout',
    category: 'layout',
    description: 'Set auto-layout properties on a frame.',
    requiresTarget: true,
    payloadSchema: {
      type: 'object',
      properties: {
        layoutMode: { type: 'string', enum: ['HORIZONTAL', 'VERTICAL', 'NONE'] },
        primaryAxisAlignItems: { type: 'string', enum: ['MIN', 'CENTER', 'MAX', 'SPACE_BETWEEN'] },
        counterAxisAlignItems: { type: 'string', enum: ['MIN', 'CENTER', 'MAX', 'BASELINE'] },
        itemSpacing: { type: 'number' },
        paddingLeft: { type: 'number' },
        paddingRight: { type: 'number' },
        paddingTop: { type: 'number' },
        paddingBottom: { type: 'number' },
        primaryAxisSizingMode: { type: 'string', enum: ['FIXED', 'AUTO'] },
        counterAxisSizingMode: { type: 'string', enum: ['FIXED', 'AUTO'] },
        layoutWrap: { type: 'string', enum: ['NO_WRAP', 'WRAP'] },
      },
    },
  },

  setConstraints: {
    type: 'setConstraints',
    category: 'layout',
    description: 'Set constraints on a node.',
    requiresTarget: true,
    payloadSchema: {
      type: 'object',
      properties: {
        horizontal: { type: 'string', enum: ['MIN', 'CENTER', 'MAX', 'STRETCH', 'SCALE'] },
        vertical: { type: 'string', enum: ['MIN', 'CENTER', 'MAX', 'STRETCH', 'SCALE'] },
      },
    },
  },

  // ═══ EXPORT ═══

  exportNode: {
    type: 'exportNode',
    category: 'export',
    description: 'Export a node as PNG, SVG, JPG, or PDF.',
    requiresTarget: true,
    payloadSchema: {
      type: 'object',
      properties: {
        format: { type: 'string', enum: ['PNG', 'SVG', 'JPG', 'PDF'] },
        scale: { type: 'number', description: 'Export scale (1, 2, 3, etc.)' },
      },
    },
  },

  // ═══ PAGES ═══

  createPage: {
    type: 'createPage',
    category: 'pages',
    description: 'Create a new page.',
    payloadSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Page name' },
      },
      required: ['name'],
    },
  },

  // ═══ IMAGES ═══

  createImage: {
    type: 'createImage',
    category: 'images',
    description: 'Create an image node from base64 data. Use `data` field (NOT imageData).',
    returnsNodeId: true,
    payloadSchema: {
      type: 'object',
      properties: {
        data: { type: 'string', description: 'Base64-encoded image data' },
        name: { type: 'string' },
        x: { type: 'number' },
        y: { type: 'number' },
        parent: nodeIdProp,
      },
      required: ['data'],
    },
  },

  // ═══ WEBSITE (SERVER-SIDE) ═══

  extractWebsiteCSS: {
    type: 'extractWebsiteCSS',
    category: 'website',
    description: 'Extract CSS from a live website using headless browser. Returns colors, typography, spacing, shadows.',
    serverSide: true,
    longRunning: true,
    payloadSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'Website URL to extract from' },
        captureScreenshot: { type: 'boolean' },
        screenshotFullPage: { type: 'boolean' },
        viewport: {
          type: 'object',
          properties: {
            width: { type: 'number' },
            height: { type: 'number' },
          },
        },
      },
      required: ['url'],
    },
  },

  extractWebsiteLayout: {
    type: 'extractWebsiteLayout',
    category: 'website',
    description: 'Extract layout structure from a website using headless browser.',
    serverSide: true,
    longRunning: true,
    payloadSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'Website URL' },
        captureScreenshot: { type: 'boolean' },
        screenshotFullPage: { type: 'boolean' },
        screenshotSections: { type: 'boolean', description: 'Capture per-section screenshots' },
        dismissOverlays: { type: 'boolean' },
        maxElements: { type: 'number' },
        maxDepth: { type: 'number' },
        viewport: {
          type: 'object',
          properties: { width: { type: 'number' }, height: { type: 'number' } },
        },
      },
      required: ['url'],
    },
  },

  // ═══ ADVANCED NODES ═══

  createSection: {
    type: 'createSection',
    category: 'core',
    description: 'Create a section node (FigJam).',
    returnsNodeId: true,
    payloadSchema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        x: { type: 'number' },
        y: { type: 'number' },
        width: { type: 'number' },
        height: { type: 'number' },
        fills: paintArray,
        parent: nodeIdProp,
      },
    },
  },

  createShapeWithText: {
    type: 'createShapeWithText',
    category: 'core',
    description: 'Create a shape with text (FigJam).',
    returnsNodeId: true,
    payloadSchema: {
      type: 'object',
      properties: {
        shapeType: { type: 'string', enum: ['ROUNDED_RECTANGLE', 'DIAMOND', 'ELLIPSE', 'TRIANGLE_UP', 'TRIANGLE_DOWN', 'PARALLELOGRAM_RIGHT', 'PARALLELOGRAM_LEFT'] },
        text: { type: 'string' },
        x: { type: 'number' },
        y: { type: 'number' },
        width: { type: 'number' },
        height: { type: 'number' },
        fills: paintArray,
        parent: nodeIdProp,
      },
    },
  },

  createConnector: {
    type: 'createConnector',
    category: 'core',
    description: 'Create a connector between two nodes (FigJam).',
    returnsNodeId: true,
    payloadSchema: {
      type: 'object',
      properties: {
        startNodeId: nodeIdProp,
        endNodeId: nodeIdProp,
        startMagnet: { type: 'string', enum: ['AUTO', 'TOP', 'BOTTOM', 'LEFT', 'RIGHT'] },
        endMagnet: { type: 'string', enum: ['AUTO', 'TOP', 'BOTTOM', 'LEFT', 'RIGHT'] },
        text: { type: 'string' },
        strokeWeight: { type: 'number' },
      },
      required: ['startNodeId', 'endNodeId'],
    },
  },

  createSticky: {
    type: 'createSticky',
    category: 'core',
    description: 'Create a sticky note (FigJam).',
    returnsNodeId: true,
    payloadSchema: {
      type: 'object',
      properties: {
        text: { type: 'string' },
        x: { type: 'number' },
        y: { type: 'number' },
        fills: paintArray,
        parent: nodeIdProp,
      },
    },
  },

  measureText: {
    type: 'measureText',
    category: 'core',
    description: 'Measure text dimensions for accurate positioning in FigJam workflows.',
    payloadSchema: {
      type: 'object',
      properties: {
        text: { type: 'string' },
        fontSize: { type: 'number' },
        fontFamily: { type: 'string' },
        fontStyle: { type: 'string' },
      },
      required: ['text'],
    },
  },

  // ═══ PROPERTIES ═══

  setFills: {
    type: 'setFills',
    category: 'properties',
    description: 'Set fills on a node.',
    requiresTarget: true,
    payloadSchema: {
      type: 'object',
      properties: {
        fills: paintArray,
      },
      required: ['fills'],
    },
  },

  setStrokes: {
    type: 'setStrokes',
    category: 'properties',
    description: 'Set strokes on a node.',
    requiresTarget: true,
    payloadSchema: {
      type: 'object',
      properties: {
        strokes: paintArray,
        strokeWeight: { type: 'number' },
      },
      required: ['strokes'],
    },
  },

  setEffects: {
    type: 'setEffects',
    category: 'properties',
    description: 'Set effects (shadows, blur) on a node.',
    requiresTarget: true,
    payloadSchema: {
      type: 'object',
      properties: {
        effects: { type: 'array', items: { type: 'object', additionalProperties: true } },
      },
      required: ['effects'],
    },
  },

  setCornerRadius: {
    type: 'setCornerRadius',
    category: 'properties',
    description: 'Set corner radius on a node.',
    requiresTarget: true,
    payloadSchema: {
      type: 'object',
      properties: {
        cornerRadius: { type: 'number' },
        topLeftRadius: { type: 'number' },
        topRightRadius: { type: 'number' },
        bottomLeftRadius: { type: 'number' },
        bottomRightRadius: { type: 'number' },
      },
    },
  },

  setOpacity: {
    type: 'setOpacity',
    category: 'properties',
    description: 'Set opacity on a node.',
    requiresTarget: true,
    payloadSchema: {
      type: 'object',
      properties: {
        opacity: { type: 'number', description: '0-1' },
      },
      required: ['opacity'],
    },
  },

  setVisible: {
    type: 'setVisible',
    category: 'properties',
    description: 'Set visibility of a node.',
    requiresTarget: true,
    payloadSchema: {
      type: 'object',
      properties: {
        visible: { type: 'boolean' },
      },
      required: ['visible'],
    },
  },

  // ═══ FONTS ═══

  loadFont: {
    type: 'loadFont',
    category: 'utilities',
    description: 'Load a font for use in text operations.',
    payloadSchema: {
      type: 'object',
      properties: {
        family: { type: 'string', description: 'Font family (e.g., "Inter")' },
        style: { type: 'string', description: 'Font style (e.g., "Regular", "Bold")' },
      },
      required: ['family', 'style'],
    },
  },

  // ═══ UTILITIES ═══

  notify: {
    type: 'notify',
    category: 'utilities',
    description: 'Show a notification in Figma.',
    payloadSchema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        error: { type: 'boolean' },
      },
      required: ['message'],
    },
  },

  getNodeColors: {
    type: 'getNodeColors',
    category: 'query',
    description: 'Get all colors used in a node (fills and strokes).',
    requiresTarget: true,
    payloadSchema: { type: 'object', properties: {} },
  },

  getCss: {
    type: 'getCss',
    category: 'query',
    description: 'Get CSS representation of a node.',
    requiresTarget: true,
    payloadSchema: { type: 'object', properties: {} },
  },

  // ═══ FIND OPERATIONS ═══

  findAll: {
    type: 'findAll',
    category: 'find',
    description: 'Find all nodes matching criteria within a parent.',
    payloadSchema: {
      type: 'object',
      properties: {
        parentId: nodeIdProp,
        criteria: { type: 'object', additionalProperties: true, description: 'Match criteria (type, name, etc.)' },
      },
    },
  },

  findText: {
    type: 'findText',
    category: 'find',
    description: 'Find text nodes containing specific text.',
    payloadSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Text to search for' },
        caseSensitive: { type: 'boolean' },
      },
      required: ['query'],
    },
  },

  findAllByType: {
    type: 'findAllByType',
    category: 'find',
    description: 'Find all nodes of a specific type.',
    payloadSchema: {
      type: 'object',
      properties: {
        parentId: nodeIdProp,
        nodeType: { type: 'string', description: 'Node type to find (FRAME, TEXT, RECTANGLE, etc.)' },
      },
      required: ['nodeType'],
    },
  },
};

// ─── Stub entries for all remaining commands ───
// These have minimal schemas and can be expanded incrementally.

const STUB_COMMANDS: Array<{ type: string; category: CommandCategory; description: string; requiresTarget?: boolean; longRunning?: boolean }> = [
  // Core
  { type: 'deleteChildren', category: 'core', description: 'Delete all children of a node.', requiresTarget: true },
  { type: 'deleteSelection', category: 'core', description: 'Delete the current selection.' },
  { type: 'flatten', category: 'core', description: 'Flatten a node.', requiresTarget: true },
  { type: 'boolean', category: 'core', description: 'Perform a boolean operation on nodes.' },
  { type: 'createFromSvg', category: 'core', description: 'Create a node from SVG string.' },
  { type: 'createSlice', category: 'core', description: 'Create a slice node.' },
  { type: 'createTable', category: 'core', description: 'Create a table.' },
  { type: 'setTableCell', category: 'core', description: 'Set table cell content.' },
  { type: 'styleTableRow', category: 'core', description: 'Style a table row.' },
  { type: 'styleTableCell', category: 'core', description: 'Style a table cell.' },
  { type: 'createCodeBlock', category: 'core', description: 'Create a code block (FigJam).' },

  // Variables
  { type: 'editVariableCollection', category: 'variables', description: 'Edit a variable collection.' },
  { type: 'deleteVariableCollection', category: 'variables', description: 'Delete a variable collection.' },
  { type: 'bindVariable', category: 'variables', description: 'Bind a variable to a node property.' },
  { type: 'inspectFills', category: 'variables', description: 'Inspect fills and their variable bindings.' },
  { type: 'unbindVariable', category: 'variables', description: 'Unbind a variable from a node.' },
  { type: 'exportTokens', category: 'variables', description: 'Export design tokens as JSON.' },
  { type: 'importTokens', category: 'variables', description: 'Import design tokens from JSON.' },
  { type: 'createBoilerplate', category: 'variables', description: 'Create boilerplate variables.' },
  { type: 'replaceColorsByMapping', category: 'variables', description: 'Replace colors using a mapping.' },
  { type: 'rebindVariables', category: 'variables', description: 'Rebind variables after collection changes.' },
  { type: 'bindByExtractedUsage', category: 'variables', description: 'Bind variables based on extracted usage data.' },
  { type: 'getVariableCollectionById', category: 'variables', description: 'Get a variable collection by ID.' },
  { type: 'createVariableAlias', category: 'variables', description: 'Create a variable alias.' },
  { type: 'createVariableAliasByIdAsync', category: 'variables', description: 'Create a variable alias by ID (async).' },
  { type: 'setBoundVariableForPaint', category: 'variables', description: 'Set bound variable for a paint.' },
  { type: 'setBoundVariableForEffect', category: 'variables', description: 'Set bound variable for an effect.' },
  { type: 'setBoundVariableForLayoutGrid', category: 'variables', description: 'Set bound variable for a layout grid.' },
  { type: 'setNodeBoundVariable', category: 'variables', description: 'Set a bound variable on a node.' },
  { type: 'setVariableCodeSyntax', category: 'variables', description: 'Set code syntax for a variable.' },
  { type: 'setExplicitVariableMode', category: 'variables', description: 'Set explicit variable mode on a node.' },

  // Design System
  { type: 'getOrganizingPrinciples', category: 'design-system', description: 'Get available organizing principles.' },
  { type: 'bindDocumentationVariables', category: 'design-system', description: 'Bind documentation variables.' },
  { type: 'createTypographyStyles', category: 'design-system', description: 'Create typography styles.' },
  { type: 'createStateCollection', category: 'design-system', description: 'Create a state variable collection.' },
  { type: 'createComponentSizeCollection', category: 'design-system', description: 'Create component size collection.' },
  { type: 'createScreenSizeCollection', category: 'design-system', description: 'Create screen size collection.' },

  // Styles
  { type: 'createTextStyleWithVariables', category: 'styles', description: 'Create a text style with variable bindings.' },
  { type: 'bindTextStyleVariable', category: 'styles', description: 'Bind a variable to a text style.' },
  { type: 'createEffectStyle', category: 'styles', description: 'Create an effect style.' },
  { type: 'editStyle', category: 'styles', description: 'Edit an existing style.' },
  { type: 'deleteStyle', category: 'styles', description: 'Delete a style.' },
  { type: 'detachStyle', category: 'styles', description: 'Detach a style from a node.', requiresTarget: true },
  { type: 'applyMatchingTextStyles', category: 'styles', description: 'Apply matching text styles to text nodes.' },
  { type: 'applyMatchingEffectStyles', category: 'styles', description: 'Apply matching effect styles.' },
  { type: 'deleteStyles', category: 'styles', description: 'Delete multiple styles.' },
  { type: 'checkStyleConflicts', category: 'styles', description: 'Check for style conflicts.' },
  { type: 'createGridStyle', category: 'styles', description: 'Create a grid style.' },
  { type: 'getGridStyles', category: 'styles', description: 'Get all grid styles.' },
  { type: 'applyGridStyle', category: 'styles', description: 'Apply a grid style.', requiresTarget: true },

  // Components
  { type: 'addVariant', category: 'components', description: 'Add a variant to a component set.' },
  { type: 'editComponentProperties', category: 'components', description: 'Edit component properties.' },
  { type: 'setComponentPropertyReferences', category: 'components', description: 'Set property references on component children.' },
  { type: 'getComponentPropertyDefinitions', category: 'components', description: 'Get component property definitions.' },

  // Instances
  { type: 'editInstanceText', category: 'components', description: 'Edit text in an instance.' },
  { type: 'overrideInstanceFills', category: 'components', description: 'Override instance fills.' },
  { type: 'overrideInstanceStrokes', category: 'components', description: 'Override instance strokes.' },
  { type: 'overrideInstanceEffects', category: 'components', description: 'Override instance effects.' },
  { type: 'resetOverrides', category: 'components', description: 'Reset instance overrides.', requiresTarget: true },
  { type: 'swapInstance', category: 'components', description: 'Swap an instance to a different component.', requiresTarget: true },
  { type: 'detachInstance', category: 'components', description: 'Detach an instance from its component.', requiresTarget: true },

  // Colors
  { type: 'analyzeColors', category: 'query', description: 'Analyze color usage in a frame.' },

  // Pages
  { type: 'deletePage', category: 'pages', description: 'Delete a page.' },
  { type: 'renamePage', category: 'pages', description: 'Rename a page.' },
  { type: 'duplicatePage', category: 'pages', description: 'Duplicate a page.' },
  { type: 'loadAllPages', category: 'pages', description: 'Load all pages.' },

  // Fonts
  { type: 'listFonts', category: 'utilities', description: 'List available fonts.' },
  { type: 'checkMissingFonts', category: 'utilities', description: 'Check for missing fonts.' },
  { type: 'getUsedFonts', category: 'utilities', description: 'Get fonts used in the file.' },

  // Images
  { type: 'createImageFromUrl', category: 'images', description: 'Create an image from a URL.' },
  { type: 'getImageData', category: 'images', description: 'Get image data (base64).', requiresTarget: true },
  { type: 'replaceImage', category: 'images', description: 'Replace an image.', requiresTarget: true },

  // Export
  { type: 'batchExport', category: 'export', description: 'Export multiple nodes.' },
  { type: 'getExportSettings', category: 'export', description: 'Get export settings.', requiresTarget: true },
  { type: 'setExportSettings', category: 'export', description: 'Set export settings.', requiresTarget: true },

  // Utilities
  { type: 'commitUndo', category: 'utilities', description: 'Commit undo history.' },
  { type: 'triggerUndo', category: 'utilities', description: 'Trigger undo.' },
  { type: 'saveVersion', category: 'utilities', description: 'Save a named version.' },
  { type: 'getCurrentUser', category: 'utilities', description: 'Get current user info.' },
  { type: 'getActiveUsers', category: 'utilities', description: 'Get active users in the file.' },
  { type: 'getFileInfo', category: 'utilities', description: 'Get file information.' },
  { type: 'openExternal', category: 'utilities', description: 'Open an external URL.' },
  { type: 'getFileThumbnail', category: 'utilities', description: 'Get file thumbnail.' },
  { type: 'setFileThumbnail', category: 'utilities', description: 'Set file thumbnail.' },
  { type: 'base64Encode', category: 'utilities', description: 'Base64 encode data.' },
  { type: 'base64Decode', category: 'utilities', description: 'Base64 decode data.' },

  // Layout
  { type: 'getAutoLayout', category: 'layout', description: 'Get auto-layout settings.', requiresTarget: true },
  { type: 'setLayoutChild', category: 'layout', description: 'Set layout child properties.', requiresTarget: true },
  { type: 'getConstraints', category: 'layout', description: 'Get constraints.', requiresTarget: true },
  { type: 'setSizeConstraints', category: 'layout', description: 'Set min/max size constraints.', requiresTarget: true },
  { type: 'inferAutoLayout', category: 'layout', description: 'Infer auto-layout from node structure.', requiresTarget: true },

  // Text operations
  { type: 'setRangeFont', category: 'text', description: 'Set font for a text range.' },
  { type: 'setRangeFontSize', category: 'text', description: 'Set font size for a text range.' },
  { type: 'setRangeColor', category: 'text', description: 'Set color for a text range.' },
  { type: 'setRangeTextDecoration', category: 'text', description: 'Set text decoration (underline, strikethrough).' },
  { type: 'setRangeTextCase', category: 'text', description: 'Set text case (upper, lower, title).' },
  { type: 'setRangeLineHeight', category: 'text', description: 'Set line height for a text range.' },
  { type: 'setRangeLetterSpacing', category: 'text', description: 'Set letter spacing for a text range.' },
  { type: 'insertText', category: 'text', description: 'Insert text at a position.' },
  { type: 'deleteText', category: 'text', description: 'Delete text at a range.' },
  { type: 'getRangeStyles', category: 'text', description: 'Get styles for a text range.' },
  { type: 'setTextHyperlink', category: 'text', description: 'Set a hyperlink on text.' },
  { type: 'getRangeFontWeight', category: 'text', description: 'Get font weight for a text range.' },
  { type: 'getRangeAllFontNames', category: 'text', description: 'Get all font names in a text range.' },
  { type: 'getRangeFills', category: 'text', description: 'Get fills for a text range.' },
  { type: 'setRangeFills', category: 'text', description: 'Set fills for a text range.' },
  { type: 'getRangeTextStyleId', category: 'text', description: 'Get text style ID for a range.' },
  { type: 'setRangeTextStyleIdAsync', category: 'text', description: 'Set text style ID for a range.' },
  { type: 'getRangeListOptions', category: 'text', description: 'Get list options for a text range.' },
  { type: 'setRangeListOptions', category: 'text', description: 'Set list options for a text range.' },
  { type: 'getRangeIndentation', category: 'text', description: 'Get indentation for a text range.' },
  { type: 'setRangeIndentation', category: 'text', description: 'Set indentation for a text range.' },
  { type: 'getRangeParagraphSpacing', category: 'text', description: 'Get paragraph spacing.' },
  { type: 'setRangeParagraphSpacing', category: 'text', description: 'Set paragraph spacing.' },
  { type: 'getRangeParagraphIndent', category: 'text', description: 'Get paragraph indent.' },
  { type: 'setRangeParagraphIndent', category: 'text', description: 'Set paragraph indent.' },
  { type: 'getRangeFontName', category: 'text', description: 'Get font name for a text range.' },
  { type: 'setRangeFontName', category: 'text', description: 'Set font name for a text range.' },

  // Properties
  { type: 'setBlendMode', category: 'properties', description: 'Set blend mode.', requiresTarget: true },
  { type: 'setLocked', category: 'properties', description: 'Set locked state.', requiresTarget: true },
  { type: 'setClipsContent', category: 'properties', description: 'Set clips content.', requiresTarget: true },
  { type: 'setMask', category: 'properties', description: 'Set as mask.', requiresTarget: true },
  { type: 'setRotation', category: 'properties', description: 'Set rotation angle.', requiresTarget: true },
  { type: 'setPluginData', category: 'properties', description: 'Set plugin data on a node.', requiresTarget: true },
  { type: 'getPluginData', category: 'properties', description: 'Get plugin data from a node.', requiresTarget: true },

  // Import operations
  { type: 'importComponentByKey', category: 'import', description: 'Import a component by key from a library.' },
  { type: 'importComponentSetByKey', category: 'import', description: 'Import a component set by key.' },
  { type: 'importStyleByKey', category: 'import', description: 'Import a style by key.' },
  { type: 'importVariableByKey', category: 'import', description: 'Import a variable by key.' },
  { type: 'getLibraryVariableCollections', category: 'import', description: 'Get library variable collections.' },
  { type: 'getVariablesInLibraryCollection', category: 'import', description: 'Get variables in a library collection.' },

  // Find operations
  { type: 'findChildren', category: 'find', description: 'Find children matching criteria.' },
  { type: 'findChild', category: 'find', description: 'Find first child matching criteria.' },
  { type: 'findOne', category: 'find', description: 'Find one node matching criteria.' },
  { type: 'findWidgetNodesByWidgetId', category: 'find', description: 'Find widget nodes by widget ID.' },

  // Media operations
  { type: 'createVideo', category: 'media', description: 'Create a video node.' },
  { type: 'createImageAsync', category: 'media', description: 'Create an image asynchronously.' },
  { type: 'createLinkPreview', category: 'media', description: 'Create a link preview.' },
  { type: 'createGif', category: 'media', description: 'Create a GIF node.' },
  { type: 'createPageDivider', category: 'media', description: 'Create a page divider.' },
  { type: 'createSlide', category: 'media', description: 'Create a slide.' },
  { type: 'createSlideRow', category: 'media', description: 'Create a slide row.' },
  { type: 'getSlideGrid', category: 'media', description: 'Get slide grid structure.' },
  { type: 'createCanvasRow', category: 'media', description: 'Create a canvas row.' },
  { type: 'getCanvasGrid', category: 'media', description: 'Get canvas grid structure.' },

  // Extended query
  { type: 'getSelectionColors', category: 'query', description: 'Get colors from selection.' },
  { type: 'getPublishStatus', category: 'query', description: 'Get publish status.', requiresTarget: true },
  { type: 'getTopLevelFrame', category: 'query', description: 'Get the top-level frame for a node.', requiresTarget: true },
  { type: 'getMeasurements', category: 'query', description: 'Get measurements.' },
  { type: 'getMeasurementsForNode', category: 'query', description: 'Get measurements for a node.', requiresTarget: true },
  { type: 'getAnnotationCategories', category: 'query', description: 'Get annotation categories.' },
  { type: 'getAnnotationCategoryById', category: 'query', description: 'Get annotation category by ID.' },
  { type: 'getComponentInstances', category: 'query', description: 'Get instances of a component.', requiresTarget: true },
  { type: 'getMainComponent', category: 'query', description: 'Get main component of an instance.', requiresTarget: true },
  { type: 'getStyleConsumers', category: 'query', description: 'Get style consumers.' },

  // Dev resources
  { type: 'getDevResources', category: 'dev-resources', description: 'Get dev resources.', requiresTarget: true },
  { type: 'setDevResourcePreview', category: 'dev-resources', description: 'Set dev resource preview.' },
  { type: 'getSharedPluginData', category: 'dev-resources', description: 'Get shared plugin data.', requiresTarget: true },
  { type: 'setSharedPluginData', category: 'dev-resources', description: 'Set shared plugin data.', requiresTarget: true },
  { type: 'getSharedPluginDataKeys', category: 'dev-resources', description: 'Get shared plugin data keys.', requiresTarget: true },
  { type: 'setRelaunchData', category: 'dev-resources', description: 'Set relaunch data.', requiresTarget: true },
  { type: 'getRelaunchData', category: 'dev-resources', description: 'Get relaunch data.', requiresTarget: true },
  { type: 'setFillStyleIdAsync', category: 'dev-resources', description: 'Set fill style ID.', requiresTarget: true },
  { type: 'setStrokeStyleIdAsync', category: 'dev-resources', description: 'Set stroke style ID.', requiresTarget: true },
  { type: 'setEffectStyleIdAsync', category: 'dev-resources', description: 'Set effect style ID.', requiresTarget: true },
  { type: 'setGridStyleIdAsync', category: 'dev-resources', description: 'Set grid style ID.', requiresTarget: true },
  { type: 'setTextStyleIdAsync', category: 'dev-resources', description: 'Set text style ID.', requiresTarget: true },
  { type: 'setReactions', category: 'dev-resources', description: 'Set prototype reactions.', requiresTarget: true },
  { type: 'setInstanceProperties', category: 'dev-resources', description: 'Set instance properties.', requiresTarget: true },
  { type: 'setVectorNetwork', category: 'dev-resources', description: 'Set vector network.', requiresTarget: true },
];

// Add stubs to catalog
for (const stub of STUB_COMMANDS) {
  if (!COMMAND_CATALOG[stub.type]) {
    COMMAND_CATALOG[stub.type] = {
      type: stub.type,
      category: stub.category,
      description: stub.description,
      requiresTarget: stub.requiresTarget,
      longRunning: stub.longRunning,
      payloadSchema: {
        type: 'object',
        properties: {},
        additionalProperties: true,
      },
    };
  }
}

// ─── Convenience Sets ───

export const LONG_RUNNING_COMMANDS = new Set<string>(
  Object.values(COMMAND_CATALOG)
    .filter((c) => c.longRunning)
    .map((c) => c.type)
);

export const SERVER_SIDE_COMMANDS = new Set<string>(
  Object.values(COMMAND_CATALOG)
    .filter((c) => c.serverSide)
    .map((c) => c.type)
);

export const ALL_COMMAND_TYPES = Object.keys(COMMAND_CATALOG);
