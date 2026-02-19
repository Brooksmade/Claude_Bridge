// === WEBSITE LAYOUT EXTRACTION TYPES ===
// Used by extractWebsiteLayout command for DOM structure extraction

/**
 * Per-element computed styles extracted from the DOM
 */
export interface ElementStyles {
  backgroundColor: string | null;   // hex
  color: string | null;             // hex
  fontSize: number;
  fontFamily: string;
  fontWeight: number;
  lineHeight: number;
  textAlign: string;
  borderRadius: number[];           // [tl, tr, br, bl]
  borderWidth: number[];            // [top, right, bottom, left]
  borderColor: string | null;       // hex
  boxShadow: string | null;
  opacity: number;
  display: string;
  position: string;
  flexDirection: string;
  justifyContent: string;
  alignItems: string;
  gap: number;
  padding: { top: number; right: number; bottom: number; left: number };
  cursor?: string;                    // e.g. 'pointer' — for visual button detection
  textDecoration?: string;            // e.g. 'underline'
  letterSpacing?: number;
  backgroundGradient?: string | null; // CSS gradient string if present
}

/**
 * A single extracted DOM element with layout information
 */
export interface LayoutElement {
  id: number;
  parentId: number;                 // -1 for root
  tag: string;
  semanticRole: string;             // 'header', 'nav', 'hero', 'button', 'heading', 'paragraph', etc.
  bounds: { x: number; y: number; width: number; height: number };
  text?: string;                    // Text content for leaf text nodes (max 500 chars)
  innerText?: string;               // Full visible text (el.innerText) for inline containers
  imageSrc?: string;                // Image URL for img/background-image elements
  styles: ElementStyles;
  childCount: number;
  sectionId?: number;               // ID of the top-level section containing this element
  renderStrategy?: 'native' | 'screenshot' | 'image'; // How to render in Figma
  isVisuallyDistinct?: boolean;     // Has bg/border/shadow/radius = worth native rendering
}

/**
 * A detected semantic section of the page
 */
export interface PageSection {
  id: number;
  role: string;                     // 'header', 'nav', 'hero', 'main', 'footer', 'sidebar'
  bounds: { x: number; y: number; width: number; height: number };
  name: string;                     // "Header", "Hero Section", "Footer", etc.
  screenshot?: string;              // base64 PNG screenshot of this section
  isTopLevel?: boolean;             // true for non-overlapping top-level sections after dedup
}

/**
 * A reference to an image found on the page
 */
export interface ImageReference {
  elementId: number;
  src: string;
  type: 'img' | 'background' | 'svg';
  bounds: { x: number; y: number; width: number; height: number };
  alt?: string;
}

/**
 * Options for the layout extraction
 */
export interface LayoutExtractionOptions {
  viewport?: { width: number; height: number };   // Default: 1440x900
  maxElements?: number;       // Default: 500
  maxDepth?: number;          // Default: 8
  captureScreenshot?: boolean; // Default: true
  screenshotFullPage?: boolean;
  dismissOverlays?: boolean;  // Default: true — click "Accept"/"OK" on cookie banners
  minElementSize?: number;    // Default: 4px
  screenshotSections?: boolean; // Default: false — capture per-section screenshots
}

/**
 * Full result from extractWebsiteLayout
 */
export interface LayoutExtractionResult {
  success: boolean;
  url: string;
  viewport: { width: number; height: number };
  pageHeight: number;
  elements: LayoutElement[];
  sections: PageSection[];
  images: ImageReference[];
  screenshot?: string;          // base64 PNG
  meta: {
    extractedAt: string;
    elementsExtracted: number;
    extractionTimeMs: number;
  };
  errors?: string[];
}
