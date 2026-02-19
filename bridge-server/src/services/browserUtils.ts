import puppeteer, { type Browser } from 'puppeteer-core';
import { execSync } from 'child_process';
import { existsSync } from 'fs';

/**
 * Find Chrome executable path across platforms
 */
export function findChromePath(): string {
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

/**
 * SSRF protection: validate URLs before passing to Puppeteer
 */
export function validateUrl(url: string): void {
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
  const ipv4Match = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4Match) {
    const [, a, b, c, d] = ipv4Match.map(Number);

    if (a === 127) {
      throw new Error(`Blocked request to loopback address: ${hostname}`);
    }
    if (a === 0 && b === 0 && c === 0 && d === 0) {
      throw new Error(`Blocked request to 0.0.0.0`);
    }
    if (a === 10) {
      throw new Error(`Blocked request to private IP range (10.x.x.x): ${hostname}`);
    }
    if (a === 172 && b >= 16 && b <= 31) {
      throw new Error(`Blocked request to private IP range (172.16-31.x.x): ${hostname}`);
    }
    if (a === 192 && b === 168) {
      throw new Error(`Blocked request to private IP range (192.168.x.x): ${hostname}`);
    }
    if (a === 169 && b === 254) {
      throw new Error(`Blocked request to link-local/metadata address (169.254.x.x): ${hostname}`);
    }
  }
}

/**
 * Convert RGB string to Hex
 */
export function rgbToHex(rgb: string): string {
  const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (match) {
    const r = parseInt(match[1]);
    const g = parseInt(match[2]);
    const b = parseInt(match[3]);
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
  }
  return rgb;
}

/**
 * Launch a Puppeteer browser with common config
 */
export async function launchBrowser(): Promise<Browser> {
  const chromePath = findChromePath();
  console.log(`[Browser] Using Chrome at: ${chromePath}`);

  return puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
}
