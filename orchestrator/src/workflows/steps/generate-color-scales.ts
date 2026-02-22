/**
 * Generate 50-950 color scales (11 steps) from a base color.
 * Used to create Primitive-level color variables.
 */

import type { WorkflowContext } from '../workflow-schema.js';

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) return { h: 0, s: 0, l };

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;

  return { h: h * 360, s, l };
}

function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(1, s));
  l = Math.max(0, Math.min(1, l));

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }

  const toHex = (n: number) =>
    Math.round((n + m) * 255)
      .toString(16)
      .padStart(2, '0');

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/** Scale step labels (50 through 950) */
const SCALE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

/**
 * Lightness targets for each scale step.
 * 50 = lightest (0.97), 950 = darkest (0.05).
 */
const LIGHTNESS_TARGETS = [0.97, 0.93, 0.85, 0.73, 0.61, 0.50, 0.40, 0.32, 0.24, 0.15, 0.07];

export interface ColorScale {
  [step: string]: string;
}

/**
 * Generate a 50-950 color scale from a base hex color.
 */
export function generateScale(baseHex: string): ColorScale {
  const { h, s } = hexToHsl(baseHex);
  const scale: ColorScale = {};

  for (let i = 0; i < SCALE_STEPS.length; i++) {
    const step = SCALE_STEPS[i];
    const targetL = LIGHTNESS_TARGETS[i];

    // Slightly reduce saturation at extremes for more natural look
    const satMod = step <= 100 || step >= 900 ? s * 0.7 : s;

    scale[String(step)] = hslToHex(h, satMod, targetL);
  }

  return scale;
}

/**
 * Transform function: generate scales for multiple base colors.
 */
export async function generateColorScales(
  input: Record<string, unknown>,
  _context: WorkflowContext
): Promise<Record<string, ColorScale>> {
  const colors = input.colors as Record<string, string>; // {primary: "#hex", secondary: "#hex", ...}
  const result: Record<string, ColorScale> = {};

  for (const [name, hex] of Object.entries(colors)) {
    if (typeof hex === 'string' && hex.startsWith('#')) {
      result[name] = generateScale(hex);
    }
  }

  return result;
}
