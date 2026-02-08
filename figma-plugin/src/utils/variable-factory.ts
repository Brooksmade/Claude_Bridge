// Variable factory utilities for design token management

export interface ColorValue {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface ParsedTokenName {
  category: string;
  group: string;
  token: string;
  fullPath: string;
}

// Parse a design token name (e.g., "color/primary/500")
export function parseTokenName(name: string): ParsedTokenName {
  const parts = name.split('/');
  if (parts.length < 2) {
    return {
      category: parts[0] || 'misc',
      group: '',
      token: parts[0] || name,
      fullPath: name,
    };
  }
  return {
    category: parts[0],
    group: parts.length > 2 ? parts.slice(1, -1).join('/') : '',
    token: parts[parts.length - 1],
    fullPath: name,
  };
}

// Validate token name follows convention
export function validateTokenName(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim() === '') {
    return { valid: false, error: 'Token name cannot be empty' };
  }
  if (name.startsWith('/') || name.endsWith('/')) {
    return { valid: false, error: 'Token name cannot start or end with /' };
  }
  if (name.includes('//')) {
    return { valid: false, error: 'Token name cannot contain empty segments' };
  }
  return { valid: true };
}

// Parse hex color to Figma RGBA (0-1 range)
export function parseHexColor(hex: string): ColorValue {
  const cleanHex = hex.replace('#', '');
  let r: number, g: number, b: number, a: number = 1;

  if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16) / 255;
    g = parseInt(cleanHex[1] + cleanHex[1], 16) / 255;
    b = parseInt(cleanHex[2] + cleanHex[2], 16) / 255;
  } else if (cleanHex.length === 6) {
    r = parseInt(cleanHex.slice(0, 2), 16) / 255;
    g = parseInt(cleanHex.slice(2, 4), 16) / 255;
    b = parseInt(cleanHex.slice(4, 6), 16) / 255;
  } else if (cleanHex.length === 8) {
    r = parseInt(cleanHex.slice(0, 2), 16) / 255;
    g = parseInt(cleanHex.slice(2, 4), 16) / 255;
    b = parseInt(cleanHex.slice(4, 6), 16) / 255;
    a = parseInt(cleanHex.slice(6, 8), 16) / 255;
  } else {
    throw new Error('Invalid hex color: ' + hex);
  }

  return { r, g, b, a };
}

// Convert Figma RGBA to hex
export function colorToHex(color: ColorValue, includeAlpha: boolean = false): string {
  const toHex = (n: number) => Math.round(n * 255).toString(16).padStart(2, '0');
  const hex = '#' + toHex(color.r) + toHex(color.g) + toHex(color.b);
  if (includeAlpha && color.a !== undefined && color.a < 1) {
    return hex + toHex(color.a);
  }
  return hex;
}

// Parse color from various formats
export function parseColor(input: string | ColorValue | { r: number; g: number; b: number }): ColorValue {
  if (typeof input === 'string') {
    // Handle hex colors
    if (input.startsWith('#') || /^[0-9a-fA-F]{3,8}$/.test(input)) {
      return parseHexColor(input);
    }
    // Handle rgb/rgba strings
    const rgbMatch = input.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (rgbMatch) {
      return {
        r: parseInt(rgbMatch[1]) / 255,
        g: parseInt(rgbMatch[2]) / 255,
        b: parseInt(rgbMatch[3]) / 255,
        a: rgbMatch[4] ? parseFloat(rgbMatch[4]) : 1,
      };
    }
    throw new Error('Invalid color format: ' + input);
  }
  // Already a color object
  return {
    r: input.r,
    g: input.g,
    b: input.b,
    a: 'a' in input ? (input as ColorValue).a : 1,
  };
}

// Serialize a variable for API response
export function serializeVariable(variable: Variable): object {
  const values: Record<string, any> = {};

  var modeIds = Object.keys(variable.valuesByMode);
  for (var i = 0; i < modeIds.length; i++) {
    var modeId = modeIds[i];
    const value = variable.valuesByMode[modeId];
    if (variable.resolvedType === 'COLOR' && typeof value === 'object' && 'r' in value) {
      values[modeId] = colorToHex(value as ColorValue);
    } else {
      values[modeId] = value;
    }
  }

  return {
    id: variable.id,
    name: variable.name,
    type: variable.resolvedType,
    valuesByMode: values,
    scopes: variable.scopes,
    description: variable.description,
    hiddenFromPublishing: variable.hiddenFromPublishing,
  };
}

// Serialize a variable collection for API response
export function serializeVariableCollection(collection: VariableCollection): object {
  return {
    id: collection.id,
    name: collection.name,
    modes: collection.modes.map((mode) => ({
      modeId: mode.modeId,
      name: mode.name,
    })),
    defaultModeId: collection.defaultModeId,
    variableIds: collection.variableIds,
  };
}

// Get mode ID by name from collection
export function getModeIdByName(collection: VariableCollection, modeName: string): string | null {
  const mode = collection.modes.find((m) => m.name === modeName);
  return mode ? mode.modeId : null;
}

// Convert variable value based on type
export function convertVariableValue(value: any, type: VariableResolvedDataType): any {
  // Handle variable aliases - pass through as-is
  if (value && typeof value === 'object' && value.type === 'VARIABLE_ALIAS' && value.id) {
    return {
      type: 'VARIABLE_ALIAS',
      id: value.id,
    };
  }

  switch (type) {
    case 'COLOR':
      if (typeof value === 'string') {
        return parseColor(value);
      }
      return value;
    case 'FLOAT':
      return typeof value === 'number' ? value : parseFloat(value);
    case 'STRING':
      return String(value);
    case 'BOOLEAN':
      return Boolean(value);
    default:
      return value;
  }
}

// Design token JSON format (W3C Design Tokens)
export interface DesignToken {
  $value: any;
  $type?: string;
  $description?: string;
}

export interface DesignTokenGroup {
  [key: string]: DesignToken | DesignTokenGroup;
}

// Export variables to design token format
export function exportToDesignTokens(
  collection: VariableCollection,
  variables: Variable[],
  modeName?: string
): DesignTokenGroup {
  const tokens: DesignTokenGroup = {};
  const modeId = modeName
    ? getModeIdByName(collection, modeName) || collection.defaultModeId
    : collection.defaultModeId;

  for (var v = 0; v < variables.length; v++) {
    var variable = variables[v];
    const parsed = parseTokenName(variable.name);
    const value = variable.valuesByMode[modeId];

    // Build nested structure
    let current: DesignTokenGroup = tokens;
    const pathParts = variable.name.split('/');

    for (let i = 0; i < pathParts.length - 1; i++) {
      const part = pathParts[i];
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part] as DesignTokenGroup;
    }

    const tokenName = pathParts[pathParts.length - 1];
    const token: DesignToken = {
      $value: variable.resolvedType === 'COLOR' && typeof value === 'object'
        ? colorToHex(value as ColorValue)
        : value,
    };

    if (variable.resolvedType) {
      token.$type = variable.resolvedType.toLowerCase();
    }
    if (variable.description) {
      token.$description = variable.description;
    }

    current[tokenName] = token;
  }

  return tokens;
}
