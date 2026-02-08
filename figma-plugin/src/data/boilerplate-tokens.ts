// Boilerplate Design Tokens
// Standard design system tokens for typography, shadows, spacing, etc.
// These complement color tokens and provide a complete design foundation

export interface BoilerplateTokens {
  typography: TypographyTokens;
  shadows: ShadowTokens;
  borders: BorderTokens;
  opacity: OpacityTokens;
  zIndex: ZIndexTokens;
  transitions: TransitionTokens;
  spacing: SpacingTokens;
  screens: ScreenTokens;
}

export interface TypographyTokens {
  fontFamily: Record<string, { $value: string; $type: string; $description?: string }>;
  fontSize: Record<string, { $value: number; $type: string; $description?: string }>;
  fontWeight: Record<string, { $value: number; $type: string; $description?: string }>;
  lineHeight: Record<string, { $value: number; $type: string; $description?: string }>;
  letterSpacing: Record<string, { $value: number; $type: string; $description?: string }>;
}

export interface ShadowTokens {
  elevation: Record<string, { $value: string; $type: string; $description?: string }>;
}

export interface BorderTokens {
  width: Record<string, { $value: number; $type: string; $description?: string }>;
  radius: Record<string, { $value: number; $type: string; $description?: string }>;
}

export interface OpacityTokens {
  values: Record<string, { $value: number; $type: string; $description?: string }>;
}

export interface ZIndexTokens {
  layers: Record<string, { $value: number; $type: string; $description?: string }>;
}

export interface TransitionTokens {
  duration: Record<string, { $value: number; $type: string; $description?: string }>;
}

export interface SpacingTokens {
  scale: Record<string, { $value: number; $type: string; $description?: string }>;
}

export interface ScreenTokens {
  breakpoints: Record<string, { $value: number; $type: string; $description?: string }>;
}

// Typography Scale (based on major second ratio 1.125)
export const typographyTokens = {
  // Font Families (single font name for Figma compatibility)
  // NOTE: These are defaults - extraction from file should override these
  fontFamily: {
    'Font-Sans': {
      $value: 'Geist',
      $type: 'string',
      $description: 'Primary sans-serif font family',
    },
    'Font-Serif': {
      $value: 'Georgia',
      $type: 'string',
      $description: 'Serif font family for editorial content',
    },
    'Font-Mono': {
      $value: 'SF Mono',
      $type: 'string',
      $description: 'Monospace font for code',
    },
  },

  // Font Sizes (in pixels, using modular scale)
  fontSize: {
    'Size-2XS': { $value: 10, $type: 'float', $description: 'Extra extra small text (10px)' },
    'Size-XS': { $value: 11, $type: 'float', $description: 'Extra small text (11px)' },
    'Size-SM': { $value: 12, $type: 'float', $description: 'Small text (12px)' },
    'Size-Base': { $value: 14, $type: 'float', $description: 'Base body text (14px)' },
    'Size-MD': { $value: 16, $type: 'float', $description: 'Medium text (16px)' },
    'Size-LG': { $value: 18, $type: 'float', $description: 'Large text (18px)' },
    'Size-XL': { $value: 20, $type: 'float', $description: 'Extra large text (20px)' },
    'Size-2XL': { $value: 24, $type: 'float', $description: 'Heading 4 (24px)' },
    'Size-3XL': { $value: 30, $type: 'float', $description: 'Heading 3 (30px)' },
    'Size-4XL': { $value: 36, $type: 'float', $description: 'Heading 2 (36px)' },
    'Size-5XL': { $value: 48, $type: 'float', $description: 'Heading 1 (48px)' },
    'Size-6XL': { $value: 60, $type: 'float', $description: 'Display heading (60px)' },
    'Size-7XL': { $value: 72, $type: 'float', $description: 'Hero heading (72px)' },
    'Size-8XL': { $value: 80, $type: 'float', $description: 'Large hero heading (80px)' },
    'Size-9XL': { $value: 96, $type: 'float', $description: 'Extra large hero heading (96px)' },
    'Size-10XL': { $value: 128, $type: 'float', $description: 'Maximum display heading (128px)' },
  },

  // Font Weights
  fontWeight: {
    'Weight-Thin': { $value: 100, $type: 'float', $description: 'Thin weight' },
    'Weight-ExtraLight': { $value: 200, $type: 'float', $description: 'Extra light weight' },
    'Weight-Light': { $value: 300, $type: 'float', $description: 'Light weight' },
    'Weight-Regular': { $value: 400, $type: 'float', $description: 'Regular/Normal weight' },
    'Weight-Medium': { $value: 500, $type: 'float', $description: 'Medium weight' },
    'Weight-SemiBold': { $value: 600, $type: 'float', $description: 'Semi-bold weight' },
    'Weight-Bold': { $value: 700, $type: 'float', $description: 'Bold weight' },
    'Weight-ExtraBold': { $value: 800, $type: 'float', $description: 'Extra bold weight' },
    'Weight-Black': { $value: 900, $type: 'float', $description: 'Black weight' },
  },

  // Line Heights (as multipliers)
  lineHeight: {
    'LineHeight-None': { $value: 1, $type: 'float', $description: 'No extra line height' },
    'LineHeight-Tight': { $value: 1.25, $type: 'float', $description: 'Tight line height for headings' },
    'LineHeight-Snug': { $value: 1.375, $type: 'float', $description: 'Snug line height' },
    'LineHeight-Normal': { $value: 1.5, $type: 'float', $description: 'Normal line height for body text' },
    'LineHeight-Relaxed': { $value: 1.625, $type: 'float', $description: 'Relaxed line height' },
    'LineHeight-Loose': { $value: 2, $type: 'float', $description: 'Loose line height' },
  },

  // Letter Spacing (in em units, stored as percentage)
  letterSpacing: {
    'Tracking-Tighter': { $value: -0.05, $type: 'float', $description: 'Tighter letter spacing (-5%)' },
    'Tracking-Tight': { $value: -0.025, $type: 'float', $description: 'Tight letter spacing (-2.5%)' },
    'Tracking-Normal': { $value: 0, $type: 'float', $description: 'Normal letter spacing' },
    'Tracking-Wide': { $value: 0.025, $type: 'float', $description: 'Wide letter spacing (2.5%)' },
    'Tracking-Wider': { $value: 0.05, $type: 'float', $description: 'Wider letter spacing (5%)' },
    'Tracking-Widest': { $value: 0.1, $type: 'float', $description: 'Widest letter spacing (10%)' },
  },
};

// Shadow/Elevation Tokens (Tailwind CSS defaults)
// Note: Figma variables don't directly support shadows, but we store values for reference
export const shadowTokens = {
  elevation: {
    'Shadow-None': { $value: '0 0 #0000', $type: 'string', $description: 'No shadow' },
    'Shadow-2XS': {
      $value: '0 1px rgb(0 0 0 / 0.05)',
      $type: 'string',
      $description: 'Minimal shadow (Tailwind shadow-2xs)',
    },
    'Shadow-XS': {
      $value: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      $type: 'string',
      $description: 'Extra small shadow (Tailwind shadow-xs)',
    },
    'Shadow-SM': {
      $value: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
      $type: 'string',
      $description: 'Small shadow for cards (Tailwind shadow-sm)',
    },
    'Shadow-MD': {
      $value: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      $type: 'string',
      $description: 'Medium shadow for dropdowns (Tailwind shadow-md)',
    },
    'Shadow-LG': {
      $value: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      $type: 'string',
      $description: 'Large shadow for modals (Tailwind shadow-lg)',
    },
    'Shadow-XL': {
      $value: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      $type: 'string',
      $description: 'Extra large shadow for popovers (Tailwind shadow-xl)',
    },
    'Shadow-2XL': {
      $value: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
      $type: 'string',
      $description: 'Highest elevation shadow (Tailwind shadow-2xl)',
    },
  },
};

// Effect Style Definitions (for creating Figma Effect Styles)
// These define the actual shadow effects to be applied as styles
export interface EffectDefinition {
  type: 'DROP_SHADOW' | 'INNER_SHADOW' | 'LAYER_BLUR' | 'BACKGROUND_BLUR';
  color?: string; // hex with alpha, e.g., '#00000019' (10% black)
  offsetX?: number;
  offsetY?: number;
  radius?: number;
  spread?: number;
  blendMode?: string;
  visible?: boolean;
}

export interface EffectStyleDefinition {
  name: string;
  description?: string;
  effects: EffectDefinition[];
}

export const effectStyleDefinitions: EffectStyleDefinition[] = [
  // Size-based elevation shadows (from small to large)
  {
    name: 'Shadow/xxsmall',
    description: 'Minimal elevation - subtle depth',
    effects: [
      { type: 'DROP_SHADOW', color: '#0000001a', offsetX: 0, offsetY: 1, radius: 2, spread: 0 },
    ],
  },
  {
    name: 'Shadow/xsmall',
    description: 'Extra small elevation - buttons, inputs',
    effects: [
      { type: 'DROP_SHADOW', color: '#00000014', offsetX: 0, offsetY: 1, radius: 2, spread: 0 },
      { type: 'DROP_SHADOW', color: '#0000001a', offsetX: 0, offsetY: 1, radius: 3, spread: 0 },
    ],
  },
  {
    name: 'Shadow/small',
    description: 'Small elevation - cards, tiles',
    effects: [
      { type: 'DROP_SHADOW', color: '#0000001a', offsetX: 0, offsetY: 2, radius: 4, spread: -2 },
      { type: 'DROP_SHADOW', color: '#0000001a', offsetX: 0, offsetY: 4, radius: 8, spread: -2 },
    ],
  },
  {
    name: 'Shadow/medium',
    description: 'Medium elevation - dropdowns, tooltips',
    effects: [
      { type: 'DROP_SHADOW', color: '#0000001a', offsetX: 0, offsetY: 4, radius: 6, spread: -2 },
      { type: 'DROP_SHADOW', color: '#0000001a', offsetX: 0, offsetY: 12, radius: 16, spread: -4 },
    ],
  },
  {
    name: 'Shadow/large',
    description: 'Large elevation - modals, dialogs',
    effects: [
      { type: 'DROP_SHADOW', color: '#0000001a', offsetX: 0, offsetY: 8, radius: 8, spread: -4 },
      { type: 'DROP_SHADOW', color: '#0000001a', offsetX: 0, offsetY: 20, radius: 24, spread: -4 },
    ],
  },
  {
    name: 'Shadow/xlarge',
    description: 'Extra large elevation - popovers',
    effects: [
      { type: 'DROP_SHADOW', color: '#00000033', offsetX: 0, offsetY: 24, radius: 48, spread: -12 },
    ],
  },
  {
    name: 'Shadow/xxlarge',
    description: 'Maximum elevation - overlays',
    effects: [
      { type: 'DROP_SHADOW', color: '#00000040', offsetX: 0, offsetY: 32, radius: 64, spread: -12 },
    ],
  },
  // Component-specific shadows
  {
    name: 'Shadow/button',
    description: 'Button shadow with inner highlight',
    effects: [
      { type: 'INNER_SHADOW', color: '#ffffff33', offsetX: 0, offsetY: 1, radius: 1, spread: 0 },
      { type: 'INNER_SHADOW', color: '#ffffff0a', offsetX: 0, offsetY: 6, radius: 12, spread: 0 },
      { type: 'DROP_SHADOW', color: '#00000033', offsetX: 0, offsetY: 1, radius: 2, spread: 0, visible: false },
      { type: 'DROP_SHADOW', color: '#0000001a', offsetX: 0, offsetY: 4, radius: 4, spread: 0, visible: false },
    ],
  },
  {
    name: 'Shadow/input',
    description: 'Input field shadow',
    effects: [
      { type: 'INNER_SHADOW', color: '#ffffff33', offsetX: 0, offsetY: 1, radius: 1, spread: 0 },
      { type: 'INNER_SHADOW', color: '#ffffff0a', offsetX: 0, offsetY: 6, radius: 12, spread: 0 },
    ],
  },
  {
    name: 'Shadow/block',
    description: 'Block/card shadow with depth',
    effects: [
      { type: 'DROP_SHADOW', color: '#0000001a', offsetX: 0, offsetY: 4, radius: 4, spread: 0 },
      { type: 'DROP_SHADOW', color: '#0000001a', offsetX: 0, offsetY: 12, radius: 32, spread: -12 },
      { type: 'INNER_SHADOW', color: '#ffffff0a', offsetX: 0, offsetY: 6, radius: 12, spread: 0 },
      { type: 'INNER_SHADOW', color: '#ffffff33', offsetX: 0, offsetY: 1, radius: 1, spread: 0 },
    ],
  },
];

// === GRID STYLE DEFINITIONS ===
// These define layout grid styles for consistent frame layouts

export interface GridDefinition {
  pattern: 'GRID' | 'COLUMNS' | 'ROWS';
  sectionSize?: number;
  count?: number;
  gutterSize?: number;
  offset?: number;
  alignment?: 'MIN' | 'MAX' | 'CENTER' | 'STRETCH';
  color?: string; // hex with alpha
  visible?: boolean;
}

export interface GridStyleDefinition {
  name: string;
  description?: string;
  grids: GridDefinition[];
}

// Common layout grid styles
export const gridStyleDefinitions: GridStyleDefinition[] = [
  // === COLUMN GRIDS (Responsive) ===
  // Uses STRETCH alignment which fills the frame width
  {
    name: 'Grid/4-Column',
    description: '4-column grid for mobile layouts',
    grids: [
      { pattern: 'COLUMNS', count: 4, gutterSize: 16, alignment: 'STRETCH', color: '#ff00001a' },
    ],
  },
  {
    name: 'Grid/6-Column',
    description: '6-column grid for tablet layouts',
    grids: [
      { pattern: 'COLUMNS', count: 6, gutterSize: 24, alignment: 'STRETCH', color: '#ff00001a' },
    ],
  },
  {
    name: 'Grid/8-Column',
    description: '8-column grid for small desktop layouts',
    grids: [
      { pattern: 'COLUMNS', count: 8, gutterSize: 24, alignment: 'STRETCH', color: '#ff00001a' },
    ],
  },
  {
    name: 'Grid/12-Column',
    description: '12-column grid for standard desktop layouts (Bootstrap/Tailwind)',
    grids: [
      { pattern: 'COLUMNS', count: 12, gutterSize: 24, alignment: 'STRETCH', color: '#ff00001a' },
    ],
  },
  {
    name: 'Grid/16-Column',
    description: '16-column grid for wide desktop layouts',
    grids: [
      { pattern: 'COLUMNS', count: 16, gutterSize: 16, alignment: 'STRETCH', color: '#ff00001a' },
    ],
  },

  // === SQUARE/PIXEL GRIDS ===
  // Uses GRID pattern for uniform spacing
  {
    name: 'Grid/4px',
    description: '4px grid for precise alignment',
    grids: [
      { pattern: 'GRID', sectionSize: 4, color: '#0000ff0d' },
    ],
  },
  {
    name: 'Grid/8px',
    description: '8px grid - standard spacing unit',
    grids: [
      { pattern: 'GRID', sectionSize: 8, color: '#0000ff0d' },
    ],
  },
  {
    name: 'Grid/16px',
    description: '16px grid for larger spacing',
    grids: [
      { pattern: 'GRID', sectionSize: 16, color: '#0000ff0d' },
    ],
  },
];

// Border Tokens (Tailwind CSS defaults)
export const borderTokens = {
  // Border Widths (Tailwind: border-0, border, border-2, border-4, border-8)
  width: {
    'Border-0': { $value: 0, $type: 'float', $description: 'No border (Tailwind border-0)' },
    'Border-1': { $value: 1, $type: 'float', $description: 'Default border (Tailwind border)' },
    'Border-2': { $value: 2, $type: 'float', $description: 'Medium border (Tailwind border-2)' },
    'Border-4': { $value: 4, $type: 'float', $description: 'Thick border (Tailwind border-4)' },
    'Border-8': { $value: 8, $type: 'float', $description: 'Extra thick border (Tailwind border-8)' },
  },

  // Border Radius (Tailwind CSS defaults)
  radius: {
    'Radius-None': { $value: 0, $type: 'float', $description: 'No radius (Tailwind rounded-none)' },
    'Radius-XS': { $value: 2, $type: 'float', $description: '2px radius (Tailwind rounded-xs)' },
    'Radius-SM': { $value: 4, $type: 'float', $description: '4px radius (Tailwind rounded-sm)' },
    'Radius-MD': { $value: 6, $type: 'float', $description: '6px radius (Tailwind rounded-md)' },
    'Radius-LG': { $value: 8, $type: 'float', $description: '8px radius (Tailwind rounded-lg)' },
    'Radius-XL': { $value: 12, $type: 'float', $description: '12px radius (Tailwind rounded-xl)' },
    'Radius-2XL': { $value: 16, $type: 'float', $description: '16px radius (Tailwind rounded-2xl)' },
    'Radius-3XL': { $value: 24, $type: 'float', $description: '24px radius (Tailwind rounded-3xl)' },
    'Radius-4XL': { $value: 32, $type: 'float', $description: '32px radius (Tailwind rounded-4xl)' },
    'Radius-Full': { $value: 9999, $type: 'float', $description: 'Full/pill radius (Tailwind rounded-full)' },
  },
};

// Opacity Tokens
export const opacityTokens = {
  values: {
    'Opacity-0': { $value: 0, $type: 'float', $description: 'Fully transparent' },
    'Opacity-5': { $value: 0.05, $type: 'float', $description: '5% opacity' },
    'Opacity-10': { $value: 0.1, $type: 'float', $description: '10% opacity' },
    'Opacity-20': { $value: 0.2, $type: 'float', $description: '20% opacity' },
    'Opacity-25': { $value: 0.25, $type: 'float', $description: '25% opacity' },
    'Opacity-30': { $value: 0.3, $type: 'float', $description: '30% opacity' },
    'Opacity-40': { $value: 0.4, $type: 'float', $description: '40% opacity' },
    'Opacity-50': { $value: 0.5, $type: 'float', $description: '50% opacity' },
    'Opacity-60': { $value: 0.6, $type: 'float', $description: '60% opacity' },
    'Opacity-70': { $value: 0.7, $type: 'float', $description: '70% opacity' },
    'Opacity-75': { $value: 0.75, $type: 'float', $description: '75% opacity' },
    'Opacity-80': { $value: 0.8, $type: 'float', $description: '80% opacity' },
    'Opacity-90': { $value: 0.9, $type: 'float', $description: '90% opacity' },
    'Opacity-95': { $value: 0.95, $type: 'float', $description: '95% opacity' },
    'Opacity-100': { $value: 1, $type: 'float', $description: 'Fully opaque' },
  },
};

// Z-Index Tokens
export const zIndexTokens = {
  layers: {
    'Z-Behind': { $value: -1, $type: 'float', $description: 'Behind default layer' },
    'Z-Base': { $value: 0, $type: 'float', $description: 'Base layer' },
    'Z-Raised': { $value: 1, $type: 'float', $description: 'Slightly raised' },
    'Z-Dropdown': { $value: 10, $type: 'float', $description: 'Dropdown menus' },
    'Z-Sticky': { $value: 20, $type: 'float', $description: 'Sticky headers' },
    'Z-Fixed': { $value: 30, $type: 'float', $description: 'Fixed positioned elements' },
    'Z-Overlay': { $value: 40, $type: 'float', $description: 'Overlay backgrounds' },
    'Z-Modal': { $value: 50, $type: 'float', $description: 'Modal dialogs' },
    'Z-Popover': { $value: 60, $type: 'float', $description: 'Popovers and tooltips' },
    'Z-Toast': { $value: 70, $type: 'float', $description: 'Toast notifications' },
    'Z-Maximum': { $value: 9999, $type: 'float', $description: 'Maximum z-index' },
  },
};

// Transition/Animation Tokens
export const transitionTokens = {
  // Duration in milliseconds
  duration: {
    'Duration-Instant': { $value: 0, $type: 'float', $description: 'No transition' },
    'Duration-Fast': { $value: 75, $type: 'float', $description: 'Fast transition (75ms)' },
    'Duration-Normal': { $value: 150, $type: 'float', $description: 'Normal transition (150ms)' },
    'Duration-Moderate': { $value: 200, $type: 'float', $description: 'Moderate transition (200ms)' },
    'Duration-Slow': { $value: 300, $type: 'float', $description: 'Slow transition (300ms)' },
    'Duration-Slower': { $value: 500, $type: 'float', $description: 'Slower transition (500ms)' },
    'Duration-Slowest': { $value: 700, $type: 'float', $description: 'Slowest transition (700ms)' },
    'Duration-1000': { $value: 1000, $type: 'float', $description: '1 second transition' },
  },

  // Easing functions stored as strings for reference
  easing: {
    'Ease-Linear': { $value: 'linear', $type: 'string', $description: 'Linear easing' },
    'Ease-In': { $value: 'cubic-bezier(0.4, 0, 1, 1)', $type: 'string', $description: 'Ease in' },
    'Ease-Out': { $value: 'cubic-bezier(0, 0, 0.2, 1)', $type: 'string', $description: 'Ease out' },
    'Ease-InOut': { $value: 'cubic-bezier(0.4, 0, 0.2, 1)', $type: 'string', $description: 'Ease in-out' },
    'Ease-Bounce': {
      $value: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      $type: 'string',
      $description: 'Bounce effect',
    },
  },
};

// Spacing Tokens (Tailwind CSS defaults - 4px base unit)
// Note: Using px values in names since Figma doesn't allow dots in variable names
export const spacingTokens = {
  scale: {
    'Space-0': { $value: 0, $type: 'float', $description: '0px' },
    'Space-2': { $value: 2, $type: 'float', $description: '2px (Tailwind 0.5)' },
    'Space-4': { $value: 4, $type: 'float', $description: '4px (Tailwind 1)' },
    'Space-6': { $value: 6, $type: 'float', $description: '6px (Tailwind 1.5)' },
    'Space-8': { $value: 8, $type: 'float', $description: '8px (Tailwind 2)' },
    'Space-10': { $value: 10, $type: 'float', $description: '10px (Tailwind 2.5)' },
    'Space-12': { $value: 12, $type: 'float', $description: '12px (Tailwind 3)' },
    'Space-14': { $value: 14, $type: 'float', $description: '14px (Tailwind 3.5)' },
    'Space-16': { $value: 16, $type: 'float', $description: '16px (Tailwind 4)' },
    'Space-20': { $value: 20, $type: 'float', $description: '20px (Tailwind 5)' },
    'Space-24': { $value: 24, $type: 'float', $description: '24px (Tailwind 6)' },
    'Space-28': { $value: 28, $type: 'float', $description: '28px (Tailwind 7)' },
    'Space-32': { $value: 32, $type: 'float', $description: '32px (Tailwind 8)' },
    'Space-36': { $value: 36, $type: 'float', $description: '36px (Tailwind 9)' },
    'Space-40': { $value: 40, $type: 'float', $description: '40px (Tailwind 10)' },
    'Space-44': { $value: 44, $type: 'float', $description: '44px (Tailwind 11)' },
    'Space-48': { $value: 48, $type: 'float', $description: '48px (Tailwind 12)' },
    'Space-56': { $value: 56, $type: 'float', $description: '56px (Tailwind 14)' },
    'Space-64': { $value: 64, $type: 'float', $description: '64px (Tailwind 16)' },
    'Space-80': { $value: 80, $type: 'float', $description: '80px (Tailwind 20)' },
    'Space-96': { $value: 96, $type: 'float', $description: '96px (Tailwind 24)' },
    'Space-112': { $value: 112, $type: 'float', $description: '112px (Tailwind 28)' },
    'Space-128': { $value: 128, $type: 'float', $description: '128px (Tailwind 32)' },
    'Space-144': { $value: 144, $type: 'float', $description: '144px (Tailwind 36)' },
    'Space-160': { $value: 160, $type: 'float', $description: '160px (Tailwind 40)' },
    'Space-176': { $value: 176, $type: 'float', $description: '176px (Tailwind 44)' },
    'Space-192': { $value: 192, $type: 'float', $description: '192px (Tailwind 48)' },
    'Space-208': { $value: 208, $type: 'float', $description: '208px (Tailwind 52)' },
    'Space-224': { $value: 224, $type: 'float', $description: '224px (Tailwind 56)' },
    'Space-240': { $value: 240, $type: 'float', $description: '240px (Tailwind 60)' },
    'Space-256': { $value: 256, $type: 'float', $description: '256px (Tailwind 64)' },
    'Space-288': { $value: 288, $type: 'float', $description: '288px (Tailwind 72)' },
    'Space-320': { $value: 320, $type: 'float', $description: '320px (Tailwind 80)' },
    'Space-384': { $value: 384, $type: 'float', $description: '384px (Tailwind 96)' },
  },
};

// Screen Breakpoints (Tailwind CSS defaults)
export const screenTokens = {
  breakpoints: {
    'Screen-SM': { $value: 640, $type: 'float', $description: 'Small screens (Tailwind sm: 640px)' },
    'Screen-MD': { $value: 768, $type: 'float', $description: 'Medium screens (Tailwind md: 768px)' },
    'Screen-LG': { $value: 1024, $type: 'float', $description: 'Large screens (Tailwind lg: 1024px)' },
    'Screen-XL': { $value: 1280, $type: 'float', $description: 'Extra large screens (Tailwind xl: 1280px)' },
    'Screen-2XL': { $value: 1536, $type: 'float', $description: '2XL screens (Tailwind 2xl: 1536px)' },
  },
  // Common device widths for design
  devices: {
    'Device-iPhone-SE': { $value: 375, $type: 'float', $description: 'iPhone SE width' },
    'Device-iPhone-14': { $value: 390, $type: 'float', $description: 'iPhone 14 width' },
    'Device-iPhone-14-Pro-Max': { $value: 430, $type: 'float', $description: 'iPhone 14 Pro Max width' },
    'Device-iPad-Mini': { $value: 744, $type: 'float', $description: 'iPad Mini width' },
    'Device-iPad-Pro-11': { $value: 834, $type: 'float', $description: 'iPad Pro 11 inch width' },
    'Device-iPad-Pro-13': { $value: 1024, $type: 'float', $description: 'iPad Pro 12.9 inch width' },
    'Device-Desktop-HD': { $value: 1280, $type: 'float', $description: 'HD Desktop (1280px)' },
    'Device-Desktop-FHD': { $value: 1440, $type: 'float', $description: 'Full HD Desktop (1440px)' },
    'Device-Desktop-Wide': { $value: 1920, $type: 'float', $description: 'Wide Desktop (1920px)' },
  },
};

// Combine all tokens into structured collections for Figma import
export function getBoilerplateCollections() {
  return [
    {
      name: 'Typography',
      modes: ['Default'],
      tokens: {
        'Font Family': typographyTokens.fontFamily,
        'Font Size': typographyTokens.fontSize,
        'Font Weight': typographyTokens.fontWeight,
        'Line Height': typographyTokens.lineHeight,
        'Letter Spacing': typographyTokens.letterSpacing,
      },
    },
    {
      name: 'Effects',
      modes: ['Default'],
      tokens: {
        Shadow: shadowTokens.elevation,
        Transition: {
          Duration: transitionTokens.duration,
          Easing: transitionTokens.easing,
        },
      },
    },
    {
      name: 'Layout',
      modes: ['Default'],
      tokens: {
        Border: {
          Width: borderTokens.width,
          Radius: borderTokens.radius,
        },
        Opacity: opacityTokens.values,
        'Z-Index': zIndexTokens.layers,
      },
    },
    {
      name: 'Spacing',
      modes: ['Default'],
      tokens: {
        Space: spacingTokens.scale,
      },
    },
    {
      name: 'Screens',
      modes: ['Default'],
      tokens: {
        Breakpoint: screenTokens.breakpoints,
        Device: screenTokens.devices,
      },
    },
  ];
}

// Flatten tokens to W3C Design Token format for import
export function flattenTokensForImport(
  tokens: Record<string, any>,
  prefix: string = ''
): Record<string, any> {
  const result: Record<string, any> = {};

  var tokenKeys = Object.keys(tokens);
  for (var i = 0; i < tokenKeys.length; i++) {
    var key = tokenKeys[i];
    var value = tokens[key];
    const path = prefix ? `${prefix}/${key}` : key;

    if (value && typeof value === 'object' && '$value' in value) {
      // This is a token
      result[path] = value;
    } else if (value && typeof value === 'object') {
      // This is a group, recurse
      Object.assign(result, flattenTokensForImport(value, path));
    }
  }

  return result;
}
