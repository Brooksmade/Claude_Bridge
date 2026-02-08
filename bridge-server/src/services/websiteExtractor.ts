import puppeteer, { type Browser, type Page } from 'puppeteer-core';
import { execSync } from 'child_process';
import { existsSync } from 'fs';

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

interface ExtractionResult {
  success: boolean;
  url: string;
  tokens: ExtractedTokens;
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

// Find Chrome executable path
function findChromePath(): string {
  const paths = {
    win32: [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe',
    ],
    darwin: [
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Chromium.app/Contents/MacOS/Chromium',
    ],
    linux: [
      '/usr/bin/google-chrome',
      '/usr/bin/chromium-browser',
      '/usr/bin/chromium',
    ],
  };

  const platform = process.platform as keyof typeof paths;
  const candidates = paths[platform] || paths.linux;

  for (const p of candidates) {
    if (existsSync(p)) {
      return p;
    }
  }

  // Try to find via 'where' command on Windows
  if (platform === 'win32') {
    try {
      const result = execSync('where chrome', { encoding: 'utf-8' }).trim().split('\n')[0];
      if (result && existsSync(result)) return result;
    } catch {}
  }

  throw new Error('Chrome not found. Please install Google Chrome.');
}

// Convert RGB to Hex
function rgbToHex(rgb: string): string {
  // Handle rgb(r, g, b) format
  const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (match) {
    const r = parseInt(match[1]);
    const g = parseInt(match[2]);
    const b = parseInt(match[3]);
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
  }
  return rgb;
}

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

// SSRF protection: validate URLs before passing to Puppeteer
function validateUrl(url: string): void {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`Invalid URL: ${url}`);
  }

  // Only allow http and https protocols
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error(`Blocked protocol "${parsed.protocol}" — only http: and https: are allowed`);
  }

  const hostname = parsed.hostname.toLowerCase();

  // Block localhost and loopback
  if (hostname === 'localhost' || hostname === '::1') {
    throw new Error(`Blocked request to localhost/loopback address: ${hostname}`);
  }

  // Check IP-based hostnames for private/reserved ranges
  // Match IPv4 addresses (including those in brackets or mapped formats)
  const ipv4Match = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4Match) {
    const [, a, b, c, d] = ipv4Match.map(Number);

    // 127.x.x.x — loopback
    if (a === 127) {
      throw new Error(`Blocked request to loopback address: ${hostname}`);
    }
    // 0.0.0.0
    if (a === 0 && b === 0 && c === 0 && d === 0) {
      throw new Error(`Blocked request to 0.0.0.0`);
    }
    // 10.x.x.x — private
    if (a === 10) {
      throw new Error(`Blocked request to private IP range (10.x.x.x): ${hostname}`);
    }
    // 172.16.0.0 – 172.31.255.255 — private
    if (a === 172 && b >= 16 && b <= 31) {
      throw new Error(`Blocked request to private IP range (172.16-31.x.x): ${hostname}`);
    }
    // 192.168.x.x — private
    if (a === 192 && b === 168) {
      throw new Error(`Blocked request to private IP range (192.168.x.x): ${hostname}`);
    }
    // 169.254.x.x — link-local / cloud metadata (AWS 169.254.169.254)
    if (a === 169 && b === 254) {
      throw new Error(`Blocked request to link-local/metadata address (169.254.x.x): ${hostname}`);
    }
  }
}

export async function extractWebsiteCSS(url: string, options?: ExtractionOptions): Promise<ExtractionResult> {
  const startTime = Date.now();
  const errors: string[] = [];
  let browser: Browser | null = null;
  const opts = options || {};

  // Validate URL before launching browser
  validateUrl(url);

  try {
    const chromePath = findChromePath();
    console.log(`[Extractor] Using Chrome at: ${chromePath}`);

    browser = await puppeteer.launch({
      executablePath: chromePath,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page: Page = await browser.newPage();

    // Set viewport (use custom or default)
    const viewport = opts.viewport || { width: 1440, height: 900 };
    await page.setViewport(viewport);

    // Navigate to URL
    console.log(`[Extractor] Navigating to: ${url}`);
    await page.goto(url, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    // Wait a bit for any animations/lazy loading
    await new Promise(resolve => setTimeout(resolve, 2000));

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

    // Resolve font names before closing browser
    console.log('[Extractor] Resolving font names...');
    const resolvedFonts: ResolvedFont[] = [];
    const fontsToResolve = extractedData.fontFamilies.filter(
      f => !GENERIC_FONTS.includes(f.toLowerCase())
    );

    for (const fontName of fontsToResolve) {
      const resolved = await resolveFontName(page, fontName);
      resolvedFonts.push(resolved);
    }

    // Capture screenshot if requested (before closing browser)
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
