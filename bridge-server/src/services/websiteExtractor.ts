import { type Browser, type Page } from 'puppeteer-core';
import { validateUrl, rgbToHex, launchBrowser } from './browserUtils.js';

interface ResolvedFont {
  cssName: string;
  marketingName: string;
  confidence: 'high' | 'medium' | 'low';
  searchQuery?: string;
}

interface ExtractedTokens {
  colors: ColorToken[];
  typography: {
    fontFamilies: string[];
    resolvedFonts?: ResolvedFont[];
    fontSizes: number[];
    fontWeights: number[];
    lineHeights: number[];
    letterSpacing: number[];
  };
  spacing: number[];
  borderRadius: number[];
  borderWidths: number[];
  shadows: string[];
  opacity: number[];
  transitions: number[];
  zIndex: number[];
  containerWidths: number[];
}

interface ColorToken {
  hex: string;
  rgb: string;
  usage: string;
  count: number;
}

interface CSSVariableValue {
  light: string | null;
  dark: string | null;
}

interface CSSVariablesResult {
  /** Which mode :root represents — detected by checking for [data-theme] selectors */
  rootMode: 'light' | 'dark' | 'unknown';
  /** How rootMode was determined */
  detectionMethod: string;
  /** The selector used for the alternate theme (e.g., '[data-theme="light"]') */
  themeSelectors: { light: string | null; dark: string | null };
  /** CSS custom properties with resolved light/dark values */
  variables: Record<string, CSSVariableValue>;
  /** Total custom properties found */
  totalFound: number;
}

interface ExtractionResult {
  success: boolean;
  url: string;
  tokens: ExtractedTokens;
  /** CSS custom properties extracted with light/dark mode values */
  cssVariables?: CSSVariablesResult;
  meta: {
    extractedAt: string;
    elementsScanned: number;
    extractionTimeMs: number;
  };
  errors?: string[];
  // Screenshot of the page (base64 PNG)
  screenshot?: string;
}

interface ExtractionOptions {
  captureScreenshot?: boolean;
  screenshotFullPage?: boolean;
  viewport?: { width: number; height: number };
}

// findChromePath, rgbToHex, validateUrl imported from browserUtils.ts

// Generic fonts to skip
const GENERIC_FONTS = ['sans-serif', 'serif', 'monospace', 'cursive', 'fantasy', 'system-ui', 'ui-sans-serif', 'ui-serif', 'ui-monospace'];

// Clean CSS font name to likely marketing name
function cleanFontName(cssName: string): string {
  let name = cssName;

  // Remove common web font suffixes
  name = name.replace(/\s*(web|vf|variable|woff2?|ttf|otf|eot)\s*/gi, ' ');

  // Handle "DB" prefix (Dropbox fonts): "Dbsharpgrotesk" → "sharpgrotesk"
  name = name.replace(/^db/i, '');

  // Split camelCase: "AtlasGrotesk" → "Atlas Grotesk"
  name = name.replace(/([a-z])([A-Z])/g, '$1 $2');

  // Split before common font type suffixes (case-insensitive)
  // "atlasgrotesk" → "atlas grotesk", "opensans" → "open sans"
  name = name.replace(/(grotesk|sans|serif|mono|slab|text|display|condensed|narrow|wide|black|bold|light|thin|medium|regular)/gi, ' $1');

  // Split lowercase followed by numbers or vice versa
  name = name.replace(/([a-zA-Z])(\d)/g, '$1 $2');
  name = name.replace(/(\d)([a-zA-Z])/g, '$1 $2');

  // Clean up multiple spaces
  name = name.replace(/\s+/g, ' ').trim();

  // Title case each word
  name = name.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  return name;
}

// Resolve font name via intelligent cleaning + web search verification
async function resolveFontName(page: Page, cssName: string): Promise<ResolvedFont> {
  const lowerName = cssName.toLowerCase().trim();

  // Skip generic fonts
  if (GENERIC_FONTS.includes(lowerName)) {
    return { cssName, marketingName: cssName, confidence: 'low' };
  }

  // First, intelligently clean the CSS name
  const cleanedName = cleanFontName(cssName);
  console.log(`[FontResolver] Cleaned: "${cssName}" → "${cleanedName}"`);

  // If cleaning produced a reasonable name, verify it via search
  try {
    const searchQuery = `"${cleanedName}" font`;
    console.log(`[FontResolver] Verifying: ${searchQuery}`);

    // Search MyFonts (font marketplace) to verify the name
    const searchUrl = `https://www.myfonts.com/search?query=${encodeURIComponent(cleanedName)}`;

    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });

    // Check if MyFonts found a matching font
    const searchResults = await page.evaluate(`
      (function() {
        // Look for font family names in search results
        var fontCards = document.querySelectorAll('[class*="font"], [class*="family"], h2, h3');
        var names = [];
        for (var i = 0; i < Math.min(fontCards.length, 20); i++) {
          var text = fontCards[i].textContent.trim();
          if (text.length > 2 && text.length < 50) {
            names.push(text);
          }
        }
        return names.join('|||');
      })()
    `) as string;

    // Check if cleaned name appears in results (case-insensitive)
    const resultsLower = searchResults.toLowerCase();
    const cleanedLower = cleanedName.toLowerCase();

    if (resultsLower.includes(cleanedLower)) {
      console.log(`[FontResolver] Verified on MyFonts: "${cssName}" → "${cleanedName}"`);
      return {
        cssName,
        marketingName: cleanedName,
        confidence: 'high',
        searchQuery
      };
    }

    // Check for partial matches (e.g., "Atlas" in "Atlas Grotesk")
    const words = cleanedName.split(' ');
    const mainWord = words[0];
    if (mainWord.length > 3 && resultsLower.includes(mainWord.toLowerCase())) {
      console.log(`[FontResolver] Partial match on MyFonts: "${cssName}" → "${cleanedName}"`);
      return {
        cssName,
        marketingName: cleanedName,
        confidence: 'medium',
        searchQuery
      };
    }

    // No verification, but return cleaned name
    console.log(`[FontResolver] No verification, using cleaned: "${cssName}" → "${cleanedName}"`);
    return {
      cssName,
      marketingName: cleanedName,
      confidence: 'low',
      searchQuery
    };

  } catch (error) {
    console.log(`[FontResolver] Search failed for "${cssName}":`, error);
    // Return the cleaned name even if verification failed
    return { cssName, marketingName: cleanedName, confidence: 'low' };
  }
}

/**
 * Extract CSS custom properties (--*) from stylesheets and detect theme direction.
 *
 * Theme detection strategy:
 * 1. Check for [data-theme="light"] selector → :root is dark
 * 2. Check for [data-theme="dark"] selector → :root is light
 * 3. Check for .dark / .light class selectors on html/body
 * 4. Check prefers-color-scheme media queries
 * 5. Heuristic: if :root --background is very dark → :root is dark
 */
async function extractCSSVariables(page: Page): Promise<CSSVariablesResult> {
  console.log('[Extractor] Extracting CSS custom properties...');

  const result = await page.evaluate(`
    (function() {
      var rootVars = {};
      var themeOverrides = {};
      var detectedSelectors = {
        light: null,
        dark: null
      };

      // Theme selector patterns to check (in priority order)
      var lightSelectors = [
        '[data-theme="light"]',
        '[data-theme=light]',
        '[data-mode="light"]',
        '[data-color-scheme="light"]',
        'html.light',
        'body.light',
        '.light-theme',
        '.theme-light'
      ];
      var darkSelectors = [
        '[data-theme="dark"]',
        '[data-theme=dark]',
        '[data-mode="dark"]',
        '[data-color-scheme="dark"]',
        'html.dark',
        'body.dark',
        '.dark-theme',
        '.theme-dark'
      ];

      // Scan all stylesheets for :root vars and theme overrides
      var sheets = document.styleSheets;
      for (var s = 0; s < sheets.length; s++) {
        try {
          var rules = sheets[s].cssRules || sheets[s].rules;
          if (!rules) continue;

          for (var r = 0; r < rules.length; r++) {
            var rule = rules[r];

            // Handle @media (prefers-color-scheme) rules
            if (rule.type === CSSRule.MEDIA_RULE) {
              var mediaText = rule.media.mediaText || '';
              var isDarkMedia = mediaText.indexOf('prefers-color-scheme: dark') >= 0;
              var isLightMedia = mediaText.indexOf('prefers-color-scheme: light') >= 0;
              if (isDarkMedia || isLightMedia) {
                var innerRules = rule.cssRules || rule.rules;
                for (var ir = 0; ir < (innerRules ? innerRules.length : 0); ir++) {
                  var innerRule = innerRules[ir];
                  if (innerRule.type === CSSRule.STYLE_RULE && innerRule.selectorText &&
                      (innerRule.selectorText === ':root' || innerRule.selectorText === 'html' || innerRule.selectorText === 'body')) {
                    var innerStyle = innerRule.style;
                    var mode = isDarkMedia ? 'dark' : 'light';
                    if (!detectedSelectors[mode]) {
                      detectedSelectors[mode] = '@media (prefers-color-scheme: ' + mode + ')';
                    }
                    for (var ip = 0; ip < innerStyle.length; ip++) {
                      var iProp = innerStyle[ip];
                      if (iProp.startsWith('--')) {
                        if (!themeOverrides[mode]) themeOverrides[mode] = {};
                        themeOverrides[mode][iProp] = innerStyle.getPropertyValue(iProp).trim();
                      }
                    }
                  }
                }
              }
              continue;
            }

            if (rule.type !== CSSRule.STYLE_RULE) continue;
            var selector = rule.selectorText || '';
            var style = rule.style;

            // :root / html / body base vars
            if (selector === ':root' || selector === 'html' || selector === 'body' || selector === ':root, :host') {
              for (var p = 0; p < style.length; p++) {
                var prop = style[p];
                if (prop.startsWith('--')) {
                  rootVars[prop] = style.getPropertyValue(prop).trim();
                }
              }
            }

            // Check for theme override selectors
            for (var li = 0; li < lightSelectors.length; li++) {
              if (selector.indexOf(lightSelectors[li]) >= 0) {
                if (!detectedSelectors.light) detectedSelectors.light = lightSelectors[li];
                for (var lp = 0; lp < style.length; lp++) {
                  var lProp = style[lp];
                  if (lProp.startsWith('--')) {
                    if (!themeOverrides.light) themeOverrides.light = {};
                    themeOverrides.light[lProp] = style.getPropertyValue(lProp).trim();
                  }
                }
                break;
              }
            }
            for (var di = 0; di < darkSelectors.length; di++) {
              if (selector.indexOf(darkSelectors[di]) >= 0) {
                if (!detectedSelectors.dark) detectedSelectors.dark = darkSelectors[di];
                for (var dp = 0; dp < style.length; dp++) {
                  var dProp = style[dp];
                  if (dProp.startsWith('--')) {
                    if (!themeOverrides.dark) themeOverrides.dark = {};
                    themeOverrides.dark[dProp] = style.getPropertyValue(dProp).trim();
                  }
                }
                break;
              }
            }
          }
        } catch (e) {
          // CORS: can't read cross-origin stylesheets — skip silently
        }
      }

      // Also get computed :root vars (catches vars set by JS or inline styles)
      var computedRoot = getComputedStyle(document.documentElement);
      for (var c = 0; c < computedRoot.length; c++) {
        var cProp = computedRoot[c];
        if (cProp.startsWith('--') && !rootVars[cProp]) {
          rootVars[cProp] = computedRoot.getPropertyValue(cProp).trim();
        }
      }

      return {
        rootVars: rootVars,
        themeOverrides: themeOverrides,
        detectedSelectors: detectedSelectors,
        totalFound: Object.keys(rootVars).length
      };
    })()
  `) as {
    rootVars: Record<string, string>;
    themeOverrides: Record<string, Record<string, string>>;
    detectedSelectors: { light: string | null; dark: string | null };
    totalFound: number;
  };

  // Determine which mode :root represents
  let rootMode: 'light' | 'dark' | 'unknown' = 'unknown';
  let detectionMethod = 'none';

  const hasLightOverride = result.detectedSelectors.light !== null;
  const hasLightVars = result.themeOverrides.light && Object.keys(result.themeOverrides.light).length > 0;
  const hasDarkOverride = result.detectedSelectors.dark !== null;
  const hasDarkVars = result.themeOverrides.dark && Object.keys(result.themeOverrides.dark).length > 0;

  if (hasLightOverride && hasLightVars && !hasDarkVars) {
    // Light override exists but no dark override → :root IS dark
    rootMode = 'dark';
    detectionMethod = `Found ${result.detectedSelectors.light} overrides with no dark overrides → :root is dark`;
  } else if (hasDarkOverride && hasDarkVars && !hasLightVars) {
    // Dark override exists but no light override → :root IS light
    rootMode = 'light';
    detectionMethod = `Found ${result.detectedSelectors.dark} overrides with no light overrides → :root is light`;
  } else if (hasLightVars && hasDarkVars) {
    // Both exist — heuristic: check a background-ish variable
    const bgVarNames = ['--default-background', '--background', '--bg', '--color-background', '--bg-primary', '--color-bg'];
    let bgValue = '';
    for (const name of bgVarNames) {
      if (result.rootVars[name]) { bgValue = result.rootVars[name]; break; }
    }
    if (bgValue) {
      // Simple lightness heuristic on the value
      const isLikelyDark = /^#[0-3]/.test(bgValue) || /^rgb\(\s*[0-3]\d?\s*,/.test(bgValue);
      rootMode = isLikelyDark ? 'dark' : 'light';
      detectionMethod = `Both themes found; background var "${bgValue}" suggests :root is ${rootMode}`;
    } else {
      rootMode = 'unknown';
      detectionMethod = 'Both light and dark overrides found, could not determine :root mode from background variable';
    }
  } else if (!hasLightVars && !hasDarkVars) {
    // No theme overrides at all — single theme site, assume light (convention)
    rootMode = 'light';
    detectionMethod = 'No theme override selectors found — assuming :root is light (convention)';
  }

  console.log(`[Extractor] Theme detection: rootMode=${rootMode} (${detectionMethod})`);
  console.log(`[Extractor] Found ${result.totalFound} CSS custom properties, light overrides: ${hasLightVars ? Object.keys(result.themeOverrides.light!).length : 0}, dark overrides: ${hasDarkVars ? Object.keys(result.themeOverrides.dark!).length : 0}`);

  // Build the unified variables map with correct light/dark assignments
  const variables: Record<string, CSSVariableValue> = {};

  for (const [name, value] of Object.entries(result.rootVars)) {
    const lightOverride = result.themeOverrides.light?.[name];
    const darkOverride = result.themeOverrides.dark?.[name];

    if (rootMode === 'dark') {
      // :root values are dark, light overrides are light
      variables[name] = {
        dark: value,
        light: lightOverride || null,
      };
    } else if (rootMode === 'light') {
      // :root values are light, dark overrides are dark
      variables[name] = {
        light: value,
        dark: darkOverride || null,
      };
    } else {
      // Unknown — put :root as light (convention), overrides as-is
      variables[name] = {
        light: value,
        dark: darkOverride || null,
      };
    }
  }

  // Include any override-only vars not in :root
  for (const mode of ['light', 'dark'] as const) {
    const overrides = result.themeOverrides[mode];
    if (!overrides) continue;
    for (const [name, value] of Object.entries(overrides)) {
      if (!variables[name]) {
        variables[name] = { light: null, dark: null };
      }
      // Override values go to the mode matching the selector, not the rootMode
      variables[name][mode] = value;
    }
  }

  return {
    rootMode,
    detectionMethod,
    themeSelectors: result.detectedSelectors,
    variables,
    totalFound: result.totalFound,
  };
}

// Parse pixel value to number
function parsePixelValue(value: string): number | null {
  if (!value || value === 'none' || value === 'auto' || value === 'normal') return null;
  const match = value.match(/^([\d.]+)/);
  if (match) {
    const num = parseFloat(match[1]);
    if (!isNaN(num) && num > 0) return Math.round(num * 100) / 100;
  }
  return null;
}


export async function extractWebsiteCSS(url: string, options?: ExtractionOptions): Promise<ExtractionResult> {
  const startTime = Date.now();
  const errors: string[] = [];
  let browser: Browser | null = null;
  const opts = options || {};

  // Validate URL before launching browser
  validateUrl(url);

  try {
    browser = await launchBrowser();

    const page: Page = await browser.newPage();

    // Set viewport (use custom or default)
    const viewport = opts.viewport || { width: 1440, height: 900 };
    await page.setViewport(viewport);

    // Navigate to URL
    console.log(`[Extractor] Navigating to: ${url}`);
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });
    // Wait for JS rendering after DOM is loaded
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Wait for initial render
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Scroll the page to trigger lazy-loaded content, then scroll back
    console.log('[Extractor] Scrolling page to trigger lazy loading...');
    await page.evaluate(`
      (async function() {
        var totalHeight = document.documentElement.scrollHeight;
        var viewportHeight = window.innerHeight;
        var scrollStep = Math.floor(viewportHeight * 0.8);
        var currentScroll = 0;
        while (currentScroll < totalHeight) {
          window.scrollTo(0, currentScroll);
          currentScroll += scrollStep;
          await new Promise(function(r) { setTimeout(r, 200); });
          totalHeight = document.documentElement.scrollHeight;
        }
        window.scrollTo(0, 0);
        await new Promise(function(r) { setTimeout(r, 500); });
      })()
    `);

    // Extract all computed styles using a string function to avoid tsx compilation issues
    console.log('[Extractor] Extracting computed styles...');
    const extractedData = await page.evaluate(`
      (function() {
        var colorMap = {};
        var fontFamilies = {};
        var fontSizes = {};
        var fontWeights = {};
        var lineHeights = {};
        var letterSpacing = {};
        var spacing = {};
        var borderRadius = {};
        var borderWidths = {};
        var shadows = {};
        var opacity = {};
        var zIndex = {};
        var containerWidths = {};

        var addColor = function(color, usage) {
          if (!color || color === 'transparent' || color === 'rgba(0, 0, 0, 0)') return;
          if (colorMap[color]) {
            colorMap[color].count++;
          } else {
            colorMap[color] = { usage: usage, count: 1 };
          }
        };

        var parseNum = function(value) {
          if (!value || value === 'none' || value === 'auto' || value === 'normal') return null;
          var match = value.match(/^([\\d.]+)/);
          if (match) {
            var num = parseFloat(match[1]);
            if (!isNaN(num)) return num;
          }
          return null;
        };

        var elements = document.querySelectorAll('*');
        var elementsScanned = 0;

        for (var i = 0; i < elements.length; i++) {
          try {
            var el = elements[i];
            var styles = window.getComputedStyle(el);
            elementsScanned++;

            // Colors
            addColor(styles.color, 'text');
            addColor(styles.backgroundColor, 'background');
            addColor(styles.borderColor, 'border');
            addColor(styles.borderTopColor, 'border');
            addColor(styles.borderRightColor, 'border');
            addColor(styles.borderBottomColor, 'border');
            addColor(styles.borderLeftColor, 'border');
            addColor(styles.outlineColor, 'outline');

            // Font family
            var fontFamily = styles.fontFamily.split(',')[0].trim().replace(/['"]/g, '');
            if (fontFamily && fontFamily.length < 50) {
              fontFamilies[fontFamily] = true;
            }

            // Font size
            var fontSize = parseNum(styles.fontSize);
            if (fontSize && fontSize > 0 && fontSize < 200) fontSizes[Math.round(fontSize)] = true;

            // Font weight
            var fontWeight = parseNum(styles.fontWeight);
            if (fontWeight && fontWeight >= 100 && fontWeight <= 900) fontWeights[fontWeight] = true;

            // Line height
            var lh = parseNum(styles.lineHeight);
            if (lh && lh > 0 && lh < 100) {
              var fs = parseNum(styles.fontSize) || 16;
              if (lh > 3) {
                lineHeights[Math.round((lh / fs) * 100) / 100] = true;
              } else {
                lineHeights[Math.round(lh * 100) / 100] = true;
              }
            }

            // Letter spacing
            var ls = parseNum(styles.letterSpacing);
            if (ls !== null && ls !== 0) {
              var fsVal = parseNum(styles.fontSize) || 16;
              var lsEm = Math.round((ls / fsVal) * 1000) / 1000;
              if (Math.abs(lsEm) < 1) letterSpacing[lsEm] = true;
            }

            // Spacing (margins and paddings)
            var spacingProps = ['margin-top', 'margin-right', 'margin-bottom', 'margin-left',
             'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
             'gap', 'row-gap', 'column-gap'];
            for (var j = 0; j < spacingProps.length; j++) {
              var val = parseNum(styles.getPropertyValue(spacingProps[j]));
              if (val && val > 0 && val < 500) spacing[Math.round(val)] = true;
            }

            // Border radius
            var radiusProps = ['border-top-left-radius', 'border-top-right-radius', 'border-bottom-left-radius', 'border-bottom-right-radius'];
            for (var k = 0; k < radiusProps.length; k++) {
              var rVal = parseNum(styles.getPropertyValue(radiusProps[k]));
              if (rVal && rVal > 0 && rVal < 1000) borderRadius[Math.round(rVal)] = true;
            }

            // Border width
            var widthProps = ['border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width'];
            for (var m = 0; m < widthProps.length; m++) {
              var wVal = parseNum(styles.getPropertyValue(widthProps[m]));
              if (wVal && wVal > 0 && wVal < 20) borderWidths[wVal] = true;
            }

            // Box shadow
            if (styles.boxShadow && styles.boxShadow !== 'none') {
              shadows[styles.boxShadow] = true;
            }

            // Opacity
            var op = parseFloat(styles.opacity);
            if (!isNaN(op) && op < 1 && op > 0) {
              opacity[Math.round(op * 100) / 100] = true;
            }

            // Z-index
            var z = parseInt(styles.zIndex);
            if (!isNaN(z) && z !== 0) zIndex[z] = true;

            // Max-width (for containers)
            var maxW = parseNum(styles.maxWidth);
            if (maxW && maxW >= 320 && maxW <= 2000) containerWidths[Math.round(maxW)] = true;

          } catch (e) {
            // Skip problematic elements
          }
        }

        var colorResults = [];
        for (var rgb in colorMap) {
          colorResults.push({ rgb: rgb, usage: colorMap[rgb].usage, count: colorMap[rgb].count });
        }

        return {
          colors: colorResults,
          fontFamilies: Object.keys(fontFamilies),
          fontSizes: Object.keys(fontSizes).map(Number).sort(function(a,b){return a-b}),
          fontWeights: Object.keys(fontWeights).map(Number).sort(function(a,b){return a-b}),
          lineHeights: Object.keys(lineHeights).map(Number).sort(function(a,b){return a-b}),
          letterSpacing: Object.keys(letterSpacing).map(Number).sort(function(a,b){return a-b}),
          spacing: Object.keys(spacing).map(Number).sort(function(a,b){return a-b}),
          borderRadius: Object.keys(borderRadius).map(Number).sort(function(a,b){return a-b}),
          borderWidths: Object.keys(borderWidths).map(Number).sort(function(a,b){return a-b}),
          shadows: Object.keys(shadows),
          opacity: Object.keys(opacity).map(Number).sort(function(a,b){return a-b}),
          zIndex: Object.keys(zIndex).map(Number).sort(function(a,b){return a-b}),
          containerWidths: Object.keys(containerWidths).map(Number).sort(function(a,b){return a-b}),
          elementsScanned: elementsScanned
        };
      })()
    `) as {
      colors: { rgb: string; usage: string; count: number }[];
      fontFamilies: string[];
      fontSizes: number[];
      fontWeights: number[];
      lineHeights: number[];
      letterSpacing: number[];
      spacing: number[];
      borderRadius: number[];
      borderWidths: number[];
      shadows: string[];
      opacity: number[];
      zIndex: number[];
      containerWidths: number[];
      elementsScanned: number;
    };

    // Extract CSS custom properties with theme mode detection
    // Must be done while still on the target page
    let cssVariables: CSSVariablesResult | undefined;
    try {
      cssVariables = await extractCSSVariables(page);
    } catch (err) {
      console.error('[Extractor] CSS variable extraction failed:', err);
      errors.push(`CSS variable extraction failed: ${err instanceof Error ? err.message : String(err)}`);
    }

    // Capture screenshot BEFORE font resolution (which navigates away from the page)
    let screenshot: string | undefined;
    if (opts.captureScreenshot) {
      console.log('[Extractor] Capturing screenshot...');
      const screenshotBuffer = await page.screenshot({
        fullPage: opts.screenshotFullPage ?? false,
        type: 'png',
        encoding: 'base64',
      });
      screenshot = screenshotBuffer as string;
      console.log(`[Extractor] Screenshot captured (${screenshot.length} bytes base64)`);
    }

    // Resolve font names (navigates to MyFonts for verification — must be after screenshot)
    console.log('[Extractor] Resolving font names...');
    const resolvedFonts: ResolvedFont[] = [];
    const fontsToResolve = extractedData.fontFamilies.filter(
      f => !GENERIC_FONTS.includes(f.toLowerCase())
    );

    for (const fontName of fontsToResolve) {
      const resolved = await resolveFontName(page, fontName);
      resolvedFonts.push(resolved);
    }

    await browser.close();
    browser = null;

    // Process colors - convert to hex and sort by count
    const processedColors: ColorToken[] = extractedData.colors
      .map(c => ({
        hex: rgbToHex(c.rgb),
        rgb: c.rgb,
        usage: c.usage,
        count: c.count,
      }))
      .filter(c => c.hex.startsWith('#'))
      .sort((a, b) => b.count - a.count);

    // Deduplicate colors by hex
    const uniqueColors = new Map<string, ColorToken>();
    for (const color of processedColors) {
      if (!uniqueColors.has(color.hex)) {
        uniqueColors.set(color.hex, color);
      } else {
        uniqueColors.get(color.hex)!.count += color.count;
      }
    }

    const tokens: ExtractedTokens = {
      colors: Array.from(uniqueColors.values()).sort((a, b) => b.count - a.count),
      typography: {
        fontFamilies: extractedData.fontFamilies,
        resolvedFonts: resolvedFonts.length > 0 ? resolvedFonts : undefined,
        fontSizes: extractedData.fontSizes,
        fontWeights: extractedData.fontWeights,
        lineHeights: extractedData.lineHeights,
        letterSpacing: extractedData.letterSpacing,
      },
      spacing: extractedData.spacing,
      borderRadius: extractedData.borderRadius,
      borderWidths: extractedData.borderWidths,
      shadows: extractedData.shadows,
      opacity: extractedData.opacity,
      transitions: [], // Would need to parse transition properties
      zIndex: extractedData.zIndex,
      containerWidths: extractedData.containerWidths,
    };

    console.log(`[Extractor] Extraction complete. Found ${tokens.colors.length} colors, ${tokens.typography.fontSizes.length} font sizes, ${resolvedFonts.length} fonts resolved`);

    return {
      success: true,
      url,
      tokens,
      cssVariables,
      meta: {
        extractedAt: new Date().toISOString(),
        elementsScanned: extractedData.elementsScanned,
        extractionTimeMs: Date.now() - startTime,
      },
      errors: errors.length > 0 ? errors : undefined,
      screenshot,
    };

  } catch (error) {
    console.error('[Extractor] Error:', error);
    if (browser) {
      await browser.close();
    }
    return {
      success: false,
      url,
      tokens: {
        colors: [],
        typography: {
          fontFamilies: [],
          fontSizes: [],
          fontWeights: [],
          lineHeights: [],
          letterSpacing: [],
        },
        spacing: [],
        borderRadius: [],
        borderWidths: [],
        shadows: [],
        opacity: [],
        transitions: [],
        zIndex: [],
        containerWidths: [],
      },
      meta: {
        extractedAt: new Date().toISOString(),
        elementsScanned: 0,
        extractionTimeMs: Date.now() - startTime,
      },
      errors: [error instanceof Error ? error.message : String(error)],
    };
  }
}
