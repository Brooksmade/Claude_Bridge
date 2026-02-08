// Color scale generation utilities for design systems

export interface HSL {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
}

export interface RGB {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
}

/**
 * Convert hex color to RGB
 */
export function hexToRgb(hex: string): RGB {
  const cleanHex = hex.replace('#', '');
  let r: number, g: number, b: number;

  if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16);
    g = parseInt(cleanHex[1] + cleanHex[1], 16);
    b = parseInt(cleanHex[2] + cleanHex[2], 16);
  } else if (cleanHex.length >= 6) {
    r = parseInt(cleanHex.slice(0, 2), 16);
    g = parseInt(cleanHex.slice(2, 4), 16);
    b = parseInt(cleanHex.slice(4, 6), 16);
  } else {
    throw new Error('Invalid hex color: ' + hex);
  }

  return { r, g, b };
}

/**
 * Convert RGB to hex
 */
export function rgbToHex(rgb: RGB): string {
  const toHex = (n: number) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, '0');
  return '#' + toHex(rgb.r) + toHex(rgb.g) + toHex(rgb.b);
}

/**
 * Convert RGB to HSL
 */
export function rgbToHsl(rgb: RGB): HSL {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Convert HSL to RGB
 */
export function hslToRgb(hsl: HSL): RGB {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;

  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

/**
 * Convert hex to HSL
 */
export function hexToHsl(hex: string): HSL {
  return rgbToHsl(hexToRgb(hex));
}

/**
 * Convert HSL to hex
 */
export function hslToHex(hsl: HSL): string {
  return rgbToHex(hslToRgb(hsl));
}

/**
 * Color scale steps - matching Tailwind CSS scale
 */
export const COLOR_SCALE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

/**
 * Generate a full color scale from a base hex color
 * The base color is placed at the 500 level
 * Lighter shades (50-400) increase lightness
 * Darker shades (600-950) decrease lightness
 */
export function generateColorScale(baseHex: string, scaleName: string): Record<string, string> {
  const baseHsl = hexToHsl(baseHex);
  const scale: Record<string, string> = {};

  // Lightness targets for each step (approximate Tailwind values)
  const lightnessTargets: Record<number, number> = {
    50: 97,   // Very light
    100: 94,
    200: 86,
    300: 77,
    400: 66,
    500: baseHsl.l,  // Base color lightness
    600: 45,
    700: 37,
    800: 27,
    900: 18,
    950: 10,  // Very dark
  };

  // Adjust saturation slightly for extreme light/dark values
  const saturationAdjust: Record<number, number> = {
    50: -15,
    100: -10,
    200: -5,
    300: 0,
    400: 0,
    500: 0,
    600: 0,
    700: 0,
    800: -5,
    900: -10,
    950: -15,
  };

  for (var i = 0; i < COLOR_SCALE_STEPS.length; i++) {
    var step = COLOR_SCALE_STEPS[i];
    let targetL: number;
    let targetS: number;

    if (step === 500) {
      // Keep base color as-is
      targetL = baseHsl.l;
      targetS = baseHsl.s;
    } else if (step < 500) {
      // Lighter shades - interpolate between base and target
      const ratio = (500 - step) / 450; // 0 at 500, 1 at 50
      const targetLight = lightnessTargets[step];
      targetL = baseHsl.l + (targetLight - baseHsl.l) * ratio;
      targetS = Math.max(0, baseHsl.s + saturationAdjust[step]);
    } else {
      // Darker shades - interpolate between base and target
      const ratio = (step - 500) / 450; // 0 at 500, 1 at 950
      const targetDark = lightnessTargets[step];
      targetL = baseHsl.l - (baseHsl.l - targetDark) * ratio;
      targetS = Math.max(0, baseHsl.s + saturationAdjust[step]);
    }

    // Clamp values
    targetL = Math.max(0, Math.min(100, targetL));
    targetS = Math.max(0, Math.min(100, targetS));

    const hex = hslToHex({
      h: baseHsl.h,
      s: targetS,
      l: targetL,
    });

    scale[`${scaleName}-${step}`] = hex;
  }

  return scale;
}

/**
 * Generate a neutral gray scale (no saturation)
 */
export function generateGrayScale(): Record<string, string> {
  const scale: Record<string, string> = {};

  const lightnessMap: Record<number, number> = {
    50: 98,
    100: 96,
    200: 90,
    300: 83,
    400: 64,
    500: 45,
    600: 32,
    700: 25,
    800: 15,
    900: 10,
    950: 4,
  };

  for (var i = 0; i < COLOR_SCALE_STEPS.length; i++) {
    var step = COLOR_SCALE_STEPS[i];
    scale[`Gray-${step}`] = hslToHex({
      h: 0,
      s: 0,
      l: lightnessMap[step],
    });
  }

  return scale;
}

/**
 * Generate a warm gray scale (slight yellow/orange tint)
 */
export function generateWarmGrayScale(): Record<string, string> {
  const scale: Record<string, string> = {};

  const lightnessMap: Record<number, number> = {
    50: 98,
    100: 96,
    200: 90,
    300: 83,
    400: 64,
    500: 45,
    600: 32,
    700: 25,
    800: 15,
    900: 10,
    950: 4,
  };

  for (var i = 0; i < COLOR_SCALE_STEPS.length; i++) {
    var step = COLOR_SCALE_STEPS[i];
    scale[`Gray-${step}`] = hslToHex({
      h: 30,  // Warm hue
      s: step < 500 ? 10 : 5,  // Slight saturation
      l: lightnessMap[step],
    });
  }

  return scale;
}

/**
 * Generate a cool gray scale (slight blue tint)
 */
export function generateCoolGrayScale(): Record<string, string> {
  const scale: Record<string, string> = {};

  const lightnessMap: Record<number, number> = {
    50: 98,
    100: 96,
    200: 90,
    300: 83,
    400: 64,
    500: 45,
    600: 32,
    700: 25,
    800: 15,
    900: 10,
    950: 4,
  };

  for (var i = 0; i < COLOR_SCALE_STEPS.length; i++) {
    var step = COLOR_SCALE_STEPS[i];
    scale[`Gray-${step}`] = hslToHex({
      h: 220,  // Cool blue hue
      s: step < 500 ? 10 : 5,  // Slight saturation
      l: lightnessMap[step],
    });
  }

  return scale;
}

/**
 * System colors that don't change with theme
 */
export const SYSTEM_COLORS = {
  White: '#ffffff',
  Black: '#000000',
  Transparent: 'transparent',
};

/**
 * Default feedback/system colors
 */
export const FEEDBACK_COLORS = {
  Success: '#22c55e',  // Green-500
  Warning: '#eab308',  // Yellow-500
  Error: '#ef4444',    // Red-500
  Info: '#3b82f6',     // Blue-500
};
