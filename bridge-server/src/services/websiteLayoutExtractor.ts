import { type Browser, type Page } from 'puppeteer-core';
import { validateUrl, rgbToHex, launchBrowser } from './browserUtils.js';
import type {
  LayoutElement,
  ElementStyles,
  PageSection,
  ImageReference,
  LayoutExtractionOptions,
  LayoutExtractionResult,
} from '@bridge-to-fig/shared';

/**
 * Deduplicate raw sections into non-overlapping top-level sections.
 * Uses sweep-line: sort by Y, skip nested/overlapping, prefer semantic roles.
 * Fills vertical gaps > 50px with synthetic sections.
 */
function deduplicateSections(
  rawSections: PageSection[],
  pageHeight: number,
  viewportWidth: number
): PageSection[] {
  // Filter out tiny or narrow sections
  const filtered = rawSections.filter(
    s => s.bounds.height >= 40 && s.bounds.width >= viewportWidth * 0.7
  );

  // Sort by Y ascending
  filtered.sort((a, b) => a.bounds.y - b.bounds.y);

  // Role priority: prefer specific roles over generic
  const rolePriority: Record<string, number> = {
    hero: 6, header: 5, footer: 4, nav: 3, main: 2, sidebar: 1, section: 0,
  };

  // Group sections at approximately the same Y (within 20px)
  const groups: PageSection[][] = [];
  for (const section of filtered) {
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && Math.abs(section.bounds.y - lastGroup[0].bounds.y) < 20) {
      lastGroup.push(section);
    } else {
      groups.push([section]);
    }
  }

  // Pick best from each group (highest role priority, then tallest)
  const candidates: PageSection[] = groups.map(group => {
    group.sort((a, b) => {
      const pa = rolePriority[a.role] ?? 0;
      const pb = rolePriority[b.role] ?? 0;
      if (pa !== pb) return pb - pa;
      return b.bounds.height - a.bounds.height;
    });
    return group[0];
  });

  // Sweep-line: skip nested/overlapping sections
  const result: PageSection[] = [];
  let coveredUpTo = 0;
  const OVERLAP_TOLERANCE = 20;

  for (const section of candidates) {
    if (section.bounds.y < coveredUpTo - OVERLAP_TOLERANCE) {
      continue; // nested inside a previous section
    }
    result.push({ ...section, isTopLevel: true });
    coveredUpTo = Math.max(coveredUpTo, section.bounds.y + section.bounds.height);
  }

  // Fill vertical gaps > 50px with synthetic sections
  const withGaps: PageSection[] = [];
  let nextId = rawSections.length > 0 ? Math.max(...rawSections.map(s => s.id)) + 1000 : 1000;
  let lastBottom = 0;

  for (const section of result) {
    const gap = section.bounds.y - lastBottom;
    if (gap > 50) {
      withGaps.push({
        id: nextId++,
        role: 'section',
        bounds: { x: 0, y: lastBottom, width: viewportWidth, height: gap },
        name: `Section (gap)`,
        isTopLevel: true,
      });
    }
    withGaps.push(section);
    lastBottom = section.bounds.y + section.bounds.height;
  }

  // Fill gap at bottom of page
  if (lastBottom < pageHeight - 50) {
    withGaps.push({
      id: nextId++,
      role: 'section',
      bounds: { x: 0, y: lastBottom, width: viewportWidth, height: pageHeight - lastBottom },
      name: 'Section (bottom)',
      isTopLevel: true,
    });
  }

  // Split any sections taller than MAX_CHUNK_HEIGHT into chunks
  const MAX_CHUNK_HEIGHT = 900; // viewport height — gives natural page-sized chunks
  const final: PageSection[] = [];
  for (const section of withGaps) {
    if (section.bounds.height > MAX_CHUNK_HEIGHT * 1.5) {
      // Split into chunks
      const chunks = Math.ceil(section.bounds.height / MAX_CHUNK_HEIGHT);
      const chunkHeight = section.bounds.height / chunks;
      for (let i = 0; i < chunks; i++) {
        final.push({
          id: nextId++,
          role: section.role,
          bounds: {
            x: section.bounds.x,
            y: section.bounds.y + i * chunkHeight,
            width: section.bounds.width,
            height: Math.min(chunkHeight, section.bounds.height - i * chunkHeight),
          },
          name: chunks > 1 ? `${section.name} (${i + 1}/${chunks})` : section.name,
          isTopLevel: true,
        });
      }
    } else {
      final.push(section);
    }
  }

  // Fallback: if no sections were detected at all, create uniform chunks
  if (final.length === 0 && pageHeight > 0) {
    const chunks = Math.ceil(pageHeight / MAX_CHUNK_HEIGHT);
    for (let i = 0; i < chunks; i++) {
      final.push({
        id: nextId++,
        role: 'section',
        bounds: {
          x: 0,
          y: i * MAX_CHUNK_HEIGHT,
          width: viewportWidth,
          height: Math.min(MAX_CHUNK_HEIGHT, pageHeight - i * MAX_CHUNK_HEIGHT),
        },
        name: `Section ${i + 1}`,
        isTopLevel: true,
      });
    }
  }

  console.log(`[LayoutExtractor] Deduplicated ${rawSections.length} raw → ${final.length} top-level sections`);
  return final;
}

/**
 * Assign each element to its containing top-level section based on center point.
 */
function assignElementsToSections(
  elements: LayoutElement[],
  topLevelSections: PageSection[]
): void {
  for (const el of elements) {
    const centerY = el.bounds.y + el.bounds.height / 2;
    for (const section of topLevelSections) {
      if (!section.isTopLevel) continue;
      const sTop = section.bounds.y;
      const sBottom = sTop + section.bounds.height;
      if (centerY >= sTop && centerY <= sBottom) {
        el.sectionId = section.id;
        break;
      }
    }
  }
}

/**
 * Assign render strategy to each element:
 * - 'image' → has imageSrc, or is IMG/VIDEO/CANVAS/SVG/PICTURE tag
 * - 'screenshot' → has backgroundGradient, or is canvas/video without poster
 * - 'native' → everything else (text, containers, buttons, cards, sections)
 */
function assignRenderStrategies(elements: LayoutElement[]): void {
  const imageTags = new Set(['IMG', 'VIDEO', 'CANVAS', 'SVG', 'PICTURE']);

  for (const el of elements) {
    if (el.imageSrc || imageTags.has(el.tag)) {
      el.renderStrategy = 'image';
    } else if (
      el.styles.backgroundGradient ||
      (el.tag === 'CANVAS') ||
      (el.tag === 'VIDEO' && !el.imageSrc)
    ) {
      el.renderStrategy = 'screenshot';
    } else {
      el.renderStrategy = 'native';
    }
  }

  const counts = { native: 0, image: 0, screenshot: 0 };
  for (const el of elements) {
    if (el.renderStrategy) counts[el.renderStrategy]++;
  }
  console.log(`[LayoutExtractor] Render strategies: ${counts.native} native, ${counts.image} image, ${counts.screenshot} screenshot`);
}

/**
 * Capture a clipped screenshot for each top-level section.
 * Sections are pre-split into viewport-sized chunks by deduplicateSections,
 * so each screenshot is at most ~900px tall.
 */
async function captureSectionScreenshots(
  page: Page,
  sections: PageSection[],
  viewportWidth: number
): Promise<void> {
  const topLevel = sections.filter(s => s.isTopLevel);
  console.log(`[LayoutExtractor] Capturing screenshots for ${topLevel.length} sections...`);

  for (const section of topLevel) {
    const { y, height } = section.bounds;
    const clipHeight = Math.round(height);

    try {
      // Scroll to section position
      await page.evaluate(`window.scrollTo(0, ${Math.round(y)})`);
      await new Promise(resolve => setTimeout(resolve, 200));

      // Capture clipped screenshot (clip is relative to the page, not viewport)
      const screenshotBase64 = await page.screenshot({
        type: 'png',
        encoding: 'base64',
        clip: {
          x: 0,
          y: Math.round(y),
          width: viewportWidth,
          height: Math.max(1, clipHeight),
        },
      }) as string;

      section.screenshot = screenshotBase64;
      console.log(`[LayoutExtractor]   Section "${section.name}": y=${Math.round(y)} h=${clipHeight} screenshot=${(screenshotBase64.length / 1024).toFixed(0)}KB`);
    } catch (err) {
      console.warn(`[LayoutExtractor] Failed to capture screenshot for section "${section.name}":`, err);
    }
  }

  // Scroll back to top
  await page.evaluate('window.scrollTo(0, 0)');
}

/**
 * Extract DOM layout structure from a website using Puppeteer.
 * Returns per-element bounding boxes, styles, text, and images
 * for recreation in Figma.
 */
export async function extractWebsiteLayout(
  url: string,
  options?: LayoutExtractionOptions
): Promise<LayoutExtractionResult> {
  const startTime = Date.now();
  const errors: string[] = [];
  let browser: Browser | null = null;

  const opts = {
    viewport: options?.viewport || { width: 1440, height: 900 },
    maxElements: options?.maxElements ?? 500,
    maxDepth: options?.maxDepth ?? 8,
    captureScreenshot: options?.captureScreenshot ?? true,
    screenshotFullPage: options?.screenshotFullPage ?? false,
    dismissOverlays: options?.dismissOverlays ?? true,
    minElementSize: options?.minElementSize ?? 4,
    screenshotSections: options?.screenshotSections ?? false,
  };

  // Validate URL before launching browser
  validateUrl(url);

  try {
    browser = await launchBrowser();
    const page: Page = await browser.newPage();

    await page.setViewport(opts.viewport);

    console.log(`[LayoutExtractor] Navigating to: ${url}`);
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });
    // Wait for JS rendering after DOM is loaded
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Wait for initial render
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Dismiss cookie banners / overlays if requested
    if (opts.dismissOverlays) {
      await dismissOverlays(page);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Scroll the entire page to trigger lazy-loaded images and content
    console.log('[LayoutExtractor] Scrolling page to trigger lazy loading...');
    await autoScrollPage(page);
    // Scroll back to top for consistent bounding rect measurements
    await page.evaluate('window.scrollTo(0, 0)');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Get page height
    const pageHeight = await page.evaluate('document.documentElement.scrollHeight') as number;

    // Extract layout data from the DOM
    console.log('[LayoutExtractor] Extracting DOM layout...');
    const extractedData = await page.evaluate(`
      (function() {
        var MAX_ELEMENTS = ${opts.maxElements};
        var MAX_DEPTH = ${opts.maxDepth};
        var MIN_SIZE = ${opts.minElementSize};
        var VIEWPORT_WIDTH = ${opts.viewport.width};

        var elements = [];
        var sections = [];
        var images = [];
        var elementId = 0;

        // Tags to skip entirely
        var SKIP_TAGS = {
          'SCRIPT': true, 'STYLE': true, 'META': true, 'LINK': true,
          'NOSCRIPT': true, 'BR': true, 'WBR': true, 'HEAD': true,
          'TITLE': true, 'BASE': true, 'TEMPLATE': true
        };

        // Semantic role classification
        function classifyElement(el, tag, rect, styles) {
          // By tag name
          if (tag === 'HEADER') return 'header';
          if (tag === 'NAV') return 'nav';
          if (tag === 'MAIN') return 'main';
          if (tag === 'FOOTER') return 'footer';
          if (tag === 'ASIDE') return 'sidebar';
          if (tag === 'SECTION') return 'section';
          if (tag === 'ARTICLE') return 'article';
          if (tag === 'FORM') return 'form';
          if (tag === 'BUTTON' || (tag === 'A' && el.getAttribute('role') === 'button')) return 'button';
          if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return 'input';
          if (tag === 'IMG') return 'image';
          if (tag === 'SVG') return 'icon';
          if (tag === 'VIDEO') return 'video';
          if (tag === 'H1') return 'heading-h1';
          if (tag === 'H2') return 'heading-h2';
          if (tag === 'H3') return 'heading-h3';
          if (tag === 'H4' || tag === 'H5' || tag === 'H6') return 'heading';
          if (tag === 'P') return 'paragraph';
          if (tag === 'SPAN' || tag === 'LABEL') return 'text';
          if (tag === 'UL' || tag === 'OL') return 'list';
          if (tag === 'LI') return 'list-item';
          if (tag === 'TABLE') return 'table';
          if (tag === 'FIGURE') return 'figure';

          // Visual button detection: cursor:pointer + small + bg/border + radius + short text
          var cursor = styles.cursor;
          var hasBg = styles.backgroundColor && styles.backgroundColor !== 'transparent' && styles.backgroundColor !== 'rgba(0, 0, 0, 0)';
          var hasBorder = parseNum(styles.borderTopWidth) > 0 && styles.borderTopColor && styles.borderTopColor !== 'rgba(0, 0, 0, 0)';
          var hasRadius = parseNum(styles.borderTopLeftRadius) > 0;
          if (cursor === 'pointer' && rect.width < 400 && rect.height < 80 && (hasBg || hasBorder) && hasRadius) {
            var btnText = (el.textContent || '').trim();
            if (btnText.length > 0 && btnText.length < 60) return 'button';
          }

          // Styled link detection: <a> with pointer + bg + radius
          if (tag === 'A' && cursor === 'pointer' && hasBg && hasRadius) return 'button';
          if (tag === 'A') return 'link';

          // By ARIA role
          var role = el.getAttribute('role');
          if (role === 'banner') return 'header';
          if (role === 'navigation') return 'nav';
          if (role === 'main') return 'main';
          if (role === 'contentinfo') return 'footer';
          if (role === 'complementary') return 'sidebar';
          if (role === 'button') return 'button';
          if (role === 'dialog' || role === 'alertdialog') return 'dialog';

          // By class/id heuristics
          var classAndId = ((el.className && typeof el.className === 'string' ? el.className : '') + ' ' + (el.id || '')).toLowerCase();
          if (classAndId.match(/hero|banner|jumbotron/)) return 'hero';
          if (classAndId.match(/header|masthead|topbar/)) return 'header';
          if (classAndId.match(/footer|bottom-bar/)) return 'footer';
          if (classAndId.match(/nav|menu|navigation/)) return 'nav';
          if (classAndId.match(/sidebar|side-bar|aside/)) return 'sidebar';
          if (classAndId.match(/card|tile/)) return 'card';
          if (classAndId.match(/modal|overlay|popup|dialog/)) return 'dialog';
          if (classAndId.match(/btn|button|cta/)) return 'button';
          if (classAndId.match(/badge|chip|tag|pill/)) return 'badge';

          // Visual card detection: container with 2+ children + (bg+radius OR boxShadow)
          var childCount = el.children.length;
          var hasShadow = styles.boxShadow && styles.boxShadow !== 'none';
          if (childCount >= 2 && ((hasBg && hasRadius) || hasShadow)) return 'card';

          // By position (full-width containers near top = likely hero)
          if (tag === 'DIV' || tag === 'SECTION') {
            if (rect.width >= VIEWPORT_WIDTH * 0.9) {
              if (rect.y < 200 && rect.height > 100) return 'hero';
              return 'section';
            }
          }

          return 'container';
        }

        // Convert RGB to hex
        function toHex(rgb) {
          if (!rgb || rgb === 'transparent' || rgb === 'rgba(0, 0, 0, 0)') return null;
          var match = rgb.match(/rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)/);
          if (match) {
            var r = parseInt(match[1]);
            var g = parseInt(match[2]);
            var b = parseInt(match[3]);
            return '#' + [r, g, b].map(function(x) { return x.toString(16).padStart(2, '0'); }).join('').toUpperCase();
          }
          return null;
        }

        // Parse number from CSS value
        function parseNum(value) {
          if (!value || value === 'none' || value === 'auto' || value === 'normal') return 0;
          var n = parseFloat(value);
          return isNaN(n) ? 0 : n;
        }

        // Extract background-image URL
        function getBackgroundImage(styles) {
          var bg = styles.backgroundImage;
          if (!bg || bg === 'none') return null;
          var match = bg.match(/url\\(["']?([^"')]+)["']?\\)/);
          return match ? match[1] : null;
        }

        // Get direct text content (not from children)
        function getDirectText(el) {
          var text = '';
          for (var i = 0; i < el.childNodes.length; i++) {
            if (el.childNodes[i].nodeType === 3) { // TEXT_NODE
              text += el.childNodes[i].textContent;
            }
          }
          text = text.trim();
          return text.length > 0 ? text.substring(0, 500) : null;
        }

        // Check if element is a leaf text node (no child elements with text)
        function isLeafText(el) {
          var childElements = el.children;
          if (childElements.length === 0) return true;
          // If all children are inline and small, treat as leaf
          for (var i = 0; i < childElements.length; i++) {
            var display = window.getComputedStyle(childElements[i]).display;
            if (display !== 'inline' && display !== 'inline-block') return false;
          }
          return true;
        }

        // Traverse the DOM tree
        function traverse(el, parentId, depth) {
          if (elementId >= MAX_ELEMENTS) return;
          if (depth > MAX_DEPTH) return;

          var tag = el.tagName;
          if (!tag || SKIP_TAGS[tag]) return;

          var styles = window.getComputedStyle(el);

          // Skip invisible elements
          if (styles.display === 'none') return;
          if (styles.visibility === 'hidden') return;
          if (parseFloat(styles.opacity) === 0) return;

          var rect = el.getBoundingClientRect();

          // Skip elements below minimum size
          if (rect.width < MIN_SIZE || rect.height < MIN_SIZE) return;

          // Skip off-screen elements (allow some tolerance)
          if (rect.right < -50 || rect.bottom < -50) return;
          if (rect.left > VIEWPORT_WIDTH + 50) return;

          var currentId = elementId++;
          var role = classifyElement(el, tag, rect, styles);

          // Get text content for leaf text nodes
          var text = null;
          var innerTextValue = null;
          var textTags = { 'H1':1, 'H2':1, 'H3':1, 'H4':1, 'H5':1, 'H6':1,
                          'P':1, 'SPAN':1, 'A':1, 'LABEL':1, 'LI':1,
                          'BUTTON':1, 'TD':1, 'TH':1, 'FIGCAPTION':1,
                          'BLOCKQUOTE':1, 'STRONG':1, 'EM':1, 'B':1, 'I':1,
                          'SMALL':1, 'TIME':1, 'CITE':1 };
          if (textTags[tag] || isLeafText(el)) {
            text = getDirectText(el);
            // For elements with all-inline children, get full textContent
            if (!text && isLeafText(el) && el.textContent) {
              text = el.textContent.trim().substring(0, 500) || null;
            }
          }
          // For DIVs with no block-level children, capture text too
          if (!text && (tag === 'DIV' || tag === 'SECTION') && isLeafText(el) && el.textContent) {
            text = el.textContent.trim().substring(0, 500) || null;
          }
          // Capture innerText for any element where all children are inline
          if (isLeafText(el) && el.innerText) {
            var trimmed = el.innerText.trim();
            if (trimmed.length > 0 && trimmed.length <= 500) {
              innerTextValue = trimmed;
            }
          }
          // Check pseudo-element text (::before and ::after)
          if (!text) {
            try {
              var beforeContent = window.getComputedStyle(el, '::before').content;
              var afterContent = window.getComputedStyle(el, '::after').content;
              var pseudoText = '';
              if (beforeContent && beforeContent !== 'none' && beforeContent !== 'normal') {
                pseudoText += beforeContent.replace(/^["']|["']$/g, '');
              }
              if (afterContent && afterContent !== 'none' && afterContent !== 'normal') {
                pseudoText += afterContent.replace(/^["']|["']$/g, '');
              }
              if (pseudoText.trim().length > 0) {
                text = pseudoText.trim().substring(0, 500);
              }
            } catch(e) { /* pseudo-element access may fail */ }
          }

          // Detect images — check all common lazy-loading patterns
          var imageSrc = null;
          if (tag === 'IMG') {
            imageSrc = el.currentSrc || el.src || el.getAttribute('data-src') || el.getAttribute('data-lazy-src') || el.getAttribute('data-original') || null;
            // Check srcset for responsive images
            if (!imageSrc && el.srcset) {
              var srcsetParts = el.srcset.split(',');
              if (srcsetParts.length > 0) {
                imageSrc = srcsetParts[0].trim().split(/\s+/)[0] || null;
              }
            }
          } else if (tag === 'PICTURE') {
            // Get source from picture > source or picture > img
            var sourceEl = el.querySelector('source');
            var imgEl = el.querySelector('img');
            if (sourceEl) {
              imageSrc = sourceEl.srcset ? sourceEl.srcset.split(',')[0].trim().split(/\s+/)[0] : null;
            }
            if (!imageSrc && imgEl) {
              imageSrc = imgEl.currentSrc || imgEl.src || imgEl.getAttribute('data-src') || null;
            }
          } else if (tag === 'VIDEO') {
            imageSrc = el.poster || null;
          } else {
            imageSrc = getBackgroundImage(styles);
          }

          // Record image reference
          if (imageSrc) {
            images.push({
              elementId: currentId,
              src: imageSrc,
              type: tag === 'IMG' ? 'img' : (tag === 'SVG' ? 'svg' : 'background'),
              bounds: {
                x: Math.round(rect.x),
                y: Math.round(rect.y),
                width: Math.round(rect.width),
                height: Math.round(rect.height)
              },
              alt: el.alt || el.getAttribute('aria-label') || undefined
            });
          }

          // Extract styles
          var bgColor = toHex(styles.backgroundColor);
          var textColor = toHex(styles.color);
          var borderColor = toHex(styles.borderTopColor);

          var childCount = 0;
          for (var i = 0; i < el.children.length; i++) {
            var childStyles = window.getComputedStyle(el.children[i]);
            if (childStyles.display !== 'none') childCount++;
          }

          // Detect background gradient
          var bgGradient = null;
          var bgImage = styles.backgroundImage;
          if (bgImage && bgImage !== 'none') {
            if (bgImage.indexOf('gradient') !== -1) {
              bgGradient = bgImage;
            }
          }

          // Extract additional style properties
          var cursorVal = styles.cursor || undefined;
          var textDecorationVal = styles.textDecorationLine || styles.textDecoration || undefined;
          if (textDecorationVal === 'none') textDecorationVal = undefined;
          var letterSpacingVal = parseNum(styles.letterSpacing);

          // Compute borderRadius/borderWidth arrays
          var borderRadiusArr = [
            parseNum(styles.borderTopLeftRadius),
            parseNum(styles.borderTopRightRadius),
            parseNum(styles.borderBottomRightRadius),
            parseNum(styles.borderBottomLeftRadius)
          ];
          var borderWidthArr = [
            parseNum(styles.borderTopWidth),
            parseNum(styles.borderRightWidth),
            parseNum(styles.borderBottomWidth),
            parseNum(styles.borderLeftWidth)
          ];

          // Compute isVisuallyDistinct
          var hasBgColor = bgColor !== null;
          var hasBorderStyle = (borderWidthArr[0] > 0 || borderWidthArr[1] > 0 || borderWidthArr[2] > 0 || borderWidthArr[3] > 0) && borderColor !== null;
          var hasRadiusAndVisual = (borderRadiusArr[0] > 0 || borderRadiusArr[1] > 0 || borderRadiusArr[2] > 0 || borderRadiusArr[3] > 0) && (hasBgColor || hasBorderStyle);
          var hasShadowStyle = styles.boxShadow && styles.boxShadow !== 'none';
          var visualRoles = { 'button':1, 'card':1, 'input':1, 'badge':1, 'nav':1, 'header':1, 'footer':1 };
          var isVisuallyDistinct = hasBgColor || hasBorderStyle || hasRadiusAndVisual || !!hasShadowStyle || !!visualRoles[role];

          var element = {
            id: currentId,
            parentId: parentId,
            tag: tag,
            semanticRole: role,
            bounds: {
              x: Math.round(rect.x),
              y: Math.round(rect.y),
              width: Math.round(rect.width),
              height: Math.round(rect.height)
            },
            text: text,
            innerText: innerTextValue,
            imageSrc: imageSrc,
            styles: {
              backgroundColor: bgColor,
              color: textColor,
              fontSize: parseNum(styles.fontSize),
              fontFamily: styles.fontFamily.split(',')[0].trim().replace(/['"]/g, ''),
              fontWeight: parseNum(styles.fontWeight),
              lineHeight: parseNum(styles.lineHeight),
              textAlign: styles.textAlign,
              borderRadius: borderRadiusArr,
              borderWidth: borderWidthArr,
              borderColor: borderColor,
              boxShadow: (styles.boxShadow && styles.boxShadow !== 'none') ? styles.boxShadow : null,
              opacity: parseFloat(styles.opacity),
              display: styles.display,
              position: styles.position,
              flexDirection: styles.flexDirection,
              justifyContent: styles.justifyContent,
              alignItems: styles.alignItems,
              gap: parseNum(styles.gap),
              padding: {
                top: parseNum(styles.paddingTop),
                right: parseNum(styles.paddingRight),
                bottom: parseNum(styles.paddingBottom),
                left: parseNum(styles.paddingLeft)
              },
              cursor: cursorVal,
              textDecoration: textDecorationVal,
              letterSpacing: letterSpacingVal || undefined,
              backgroundGradient: bgGradient
            },
            childCount: childCount,
            isVisuallyDistinct: isVisuallyDistinct || undefined
          };

          elements.push(element);

          // Detect sections (full-width semantic containers)
          var sectionRoles = { 'header':1, 'nav':1, 'hero':1, 'main':1, 'footer':1, 'sidebar':1, 'section':1 };
          if (sectionRoles[role] && rect.width >= VIEWPORT_WIDTH * 0.8) {
            var sectionNames = {
              'header': 'Header',
              'nav': 'Navigation',
              'hero': 'Hero Section',
              'main': 'Main Content',
              'footer': 'Footer',
              'sidebar': 'Sidebar',
              'section': 'Section'
            };
            sections.push({
              id: currentId,
              role: role,
              bounds: {
                x: Math.round(rect.x),
                y: Math.round(rect.y),
                width: Math.round(rect.width),
                height: Math.round(rect.height)
              },
              name: sectionNames[role] || 'Section'
            });
          }

          // Recurse into children
          for (var c = 0; c < el.children.length; c++) {
            traverse(el.children[c], currentId, depth + 1);
          }
        }

        // Start traversal from body
        traverse(document.body, -1, 0);

        return {
          elements: elements,
          sections: sections,
          images: images
        };
      })()
    `) as {
      elements: LayoutElement[];
      sections: PageSection[];
      images: ImageReference[];
    };

    console.log(`[LayoutExtractor] Extracted ${extractedData.elements.length} elements, ${extractedData.sections.length} sections, ${extractedData.images.length} images`);

    if (extractedData.elements.length < 20) {
      errors.push('Warning: Less than 20 elements extracted. This may be a JS-heavy SPA that requires additional wait time.');
    }

    // Capture full-page screenshot
    let screenshot: string | undefined;
    if (opts.captureScreenshot) {
      console.log('[LayoutExtractor] Capturing screenshot...');
      const screenshotBuffer = await page.screenshot({
        fullPage: opts.screenshotFullPage,
        type: 'png',
        encoding: 'base64',
      });
      screenshot = screenshotBuffer as string;
      console.log(`[LayoutExtractor] Screenshot captured (${screenshot.length} bytes base64)`);
    }

    // Assign render strategies to all elements
    assignRenderStrategies(extractedData.elements);

    // Section deduplication, element assignment, and per-section screenshots
    let sections = extractedData.sections;
    if (opts.screenshotSections) {
      // Deduplicate into non-overlapping top-level sections
      sections = deduplicateSections(sections, pageHeight, opts.viewport.width);

      // Assign each element to its containing section
      assignElementsToSections(extractedData.elements, sections);

      // Capture per-section screenshots (browser still open)
      await captureSectionScreenshots(page, sections, opts.viewport.width);
    }

    await browser.close();
    browser = null;

    return {
      success: true,
      url,
      viewport: opts.viewport,
      pageHeight,
      elements: extractedData.elements,
      sections,
      images: extractedData.images,
      screenshot,
      meta: {
        extractedAt: new Date().toISOString(),
        elementsExtracted: extractedData.elements.length,
        extractionTimeMs: Date.now() - startTime,
      },
      errors: errors.length > 0 ? errors : undefined,
    };

  } catch (error) {
    console.error('[LayoutExtractor] Error:', error);
    if (browser) {
      await browser.close();
    }
    return {
      success: false,
      url,
      viewport: opts.viewport,
      pageHeight: 0,
      elements: [],
      sections: [],
      images: [],
      meta: {
        extractedAt: new Date().toISOString(),
        elementsExtracted: 0,
        extractionTimeMs: Date.now() - startTime,
      },
      errors: [error instanceof Error ? error.message : String(error)],
    };
  }
}

/**
 * Scroll the entire page incrementally to trigger lazy-loaded images
 * and IntersectionObserver-based content loading.
 */
async function autoScrollPage(page: Page): Promise<void> {
  try {
    await page.evaluate(`
      (async function() {
        var totalHeight = document.documentElement.scrollHeight;
        var viewportHeight = window.innerHeight;
        var scrollStep = Math.floor(viewportHeight * 0.8);
        var currentScroll = 0;

        while (currentScroll < totalHeight) {
          window.scrollTo(0, currentScroll);
          currentScroll += scrollStep;
          // Wait for lazy content to load after each scroll
          await new Promise(function(r) { setTimeout(r, 300); });
          // Update total height in case page grew from loaded content
          totalHeight = document.documentElement.scrollHeight;
        }
        // Final scroll to bottom
        window.scrollTo(0, totalHeight);
        await new Promise(function(r) { setTimeout(r, 500); });
      })()
    `);
  } catch {
    // Scroll failure is non-fatal — continue with what loaded
  }
}

/**
 * Attempt to dismiss cookie banners and overlay dialogs by clicking common accept/close buttons.
 */
async function dismissOverlays(page: Page): Promise<void> {
  try {
    console.log('[LayoutExtractor] Attempting to dismiss overlays...');
    await page.evaluate(`
      (function() {
        var dismissPatterns = [
          /accept all/i, /accept cookies/i, /accept$/i,
          /got it/i, /i agree/i, /i understand/i,
          /ok$/i, /okay/i, /close/i, /dismiss/i,
          /no thanks/i, /reject all/i, /deny/i,
          /allow all/i, /allow cookies/i,
          /continue/i, /confirm/i
        ];

        var buttons = document.querySelectorAll('button, a[role="button"], [class*="cookie"] button, [class*="consent"] button, [class*="banner"] button, [id*="cookie"] button, [id*="consent"] button');
        for (var i = 0; i < buttons.length; i++) {
          var text = (buttons[i].textContent || '').trim();
          for (var j = 0; j < dismissPatterns.length; j++) {
            if (dismissPatterns[j].test(text)) {
              buttons[i].click();
              return;
            }
          }
        }
      })()
    `);
  } catch {
    // Ignore errors — overlay dismissal is best-effort
  }
}
