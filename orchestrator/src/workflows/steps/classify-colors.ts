/**
 * Classify extracted colors into categories:
 * brand (high saturation), neutral (low saturation), system (black/white/status).
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

export interface ColorClassification {
  brand: string[];
  neutral: string[];
  system: string[];
}

export async function classifyColors(
  input: Record<string, unknown>,
  _context: WorkflowContext
): Promise<ColorClassification> {
  const colors = (input.colors as string[]) || [];

  const brand: string[] = [];
  const neutral: string[] = [];
  const system: string[] = [];

  for (const hex of colors) {
    const { s, l } = hexToHsl(hex);

    // Pure black/white
    if (hex === '#000000' || hex === '#ffffff' || hex === '#FFFFFF') {
      system.push(hex);
      continue;
    }

    // Common status colors (approximate)
    const { h } = hexToHsl(hex);
    if (s > 0.5 && ((h >= 0 && h <= 15) || h >= 345) && l > 0.3 && l < 0.7) {
      // Red-ish → could be error/danger
      system.push(hex);
      continue;
    }

    if (s < 0.1 || l < 0.05 || l > 0.95) {
      neutral.push(hex);
    } else {
      brand.push(hex);
    }
  }

  return { brand, neutral, system };
}
