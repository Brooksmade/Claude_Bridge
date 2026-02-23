import { APP_VERSION } from '@bridge-to-fig/shared';

const GITHUB_OWNER = 'Brooksmade';
const GITHUB_REPO = 'Claude_Bridge';
const CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 hours

export interface LatestRelease {
  version: string;
  url: string;
  notes: string;
  publishedAt: string;
}

let cachedRelease: LatestRelease | null = null;
let intervalId: ReturnType<typeof setInterval> | null = null;
let onFirstCheck: ((release: LatestRelease | null) => void) | null = null;

/**
 * Compare two semver strings (e.g. "1.2.3").
 * Returns 1 if a > b, -1 if a < b, 0 if equal.
 */
function compareSemver(a: string, b: string): number {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    const na = pa[i] || 0;
    const nb = pb[i] || 0;
    if (na > nb) return 1;
    if (na < nb) return -1;
  }
  return 0;
}

async function fetchLatestRelease(): Promise<void> {
  try {
    const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`;
    const response = await fetch(url, {
      headers: { 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'BridgeToFig' },
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.log('[UpdateChecker] No releases found on GitHub');
      } else if (response.status === 403) {
        console.log('[UpdateChecker] Rate limited by GitHub API');
      } else {
        console.log(`[UpdateChecker] GitHub API returned ${response.status}`);
      }
      cachedRelease = null;
      return;
    }

    const data = await response.json() as Record<string, unknown>;
    const tagName = typeof data.tag_name === 'string' ? data.tag_name : '';
    const version = tagName.replace(/^v/, '');

    if (!version || compareSemver(version, APP_VERSION) <= 0) {
      // No update available (current version is same or newer)
      cachedRelease = null;
      return;
    }

    const body = typeof data.body === 'string' ? data.body : '';
    cachedRelease = {
      version,
      url: typeof data.html_url === 'string' ? data.html_url : `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases/tag/${tagName}`,
      notes: body.length > 200 ? body.slice(0, 200) + '...' : body,
      publishedAt: typeof data.published_at === 'string' ? data.published_at : '',
    };

    console.log(`[UpdateChecker] Update available: v${version} (current: v${APP_VERSION})`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log(`[UpdateChecker] Check failed: ${message}`);
    cachedRelease = null;
  }
}

/**
 * Start the update checker. Runs an immediate check, then every 6 hours.
 * Optionally accepts a callback that fires once after the first check completes.
 */
export function startUpdateChecker(onReady?: (release: LatestRelease | null) => void): void {
  onFirstCheck = onReady ?? null;

  // Immediate check (async, non-blocking)
  fetchLatestRelease().then(() => {
    if (onFirstCheck) {
      onFirstCheck(cachedRelease);
      onFirstCheck = null;
    }
  });

  // Periodic re-check (silent — no console notice on subsequent checks)
  intervalId = setInterval(() => {
    fetchLatestRelease();
  }, CHECK_INTERVAL_MS);
}

/** Returns the cached latest release, or null if no update / check failed. */
export function getLatestRelease(): LatestRelease | null {
  return cachedRelease;
}

/** Stop the periodic checker (for graceful shutdown). */
export function stopUpdateChecker(): void {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
