/**
 * Detect the primary brand color from a set of extracted colors.
 * Uses saturation × frequency scoring (filter neutrals, sort by score).
 */

import type { WorkflowContext } from '../workflow-schema.js';

interface ColorEntry {
  hex: string;
  count: number;
}

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

function isNeutral(hex: string): boolean {
  const { s, l } = hexToHsl(hex);
  // Low saturation or very dark/light = neutral
  return s < 0.1 || l < 0.05 || l > 0.95;
}

export async function detectBrandColor(
  input: Record<string, unknown>,
  _context: WorkflowContext
): Promise<{
  primary: string | null;
  secondary: string | null;
  tertiary: string | null;
  allScored: Array<{ hex: string; score: number }>;
}> {
  const colors = (input.colors as ColorEntry[]) || [];

  // Filter neutrals, score by saturation × frequency
  const scored = colors
    .filter((c) => !isNeutral(c.hex))
    .map((c) => {
      const { s } = hexToHsl(c.hex);
      return { hex: c.hex, score: s * c.count };
    })
    .sort((a, b) => b.score - a.score);

  return {
    primary: scored[0]?.hex ?? null,
    secondary: scored[1]?.hex ?? null,
    tertiary: scored[2]?.hex ?? null,
    allScored: scored,
  };
}
