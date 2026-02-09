/**
 * E2E Tests for SSRF Protection in Website Extraction
 *
 * Tests that the bridge server correctly blocks requests to:
 * - Loopback addresses (127.x.x.x, localhost)
 * - Private IP ranges (10.x, 172.16-31.x, 192.168.x)
 * - Link-local/metadata addresses (169.254.x.x)
 * - Non-HTTP protocols (file://, ftp://)
 *
 * Prerequisites:
 * 1. Bridge server running: pnpm dev
 * 2. Does NOT require Figma plugin for blocked URL tests
 * 3. Google Chrome installed (for the allowed URL test)
 *
 * Run: npx ts-node e2e/test-ssrf-protection.ts
 */

const BRIDGE_URL = 'http://localhost:4001';

interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
}

interface CommandResult {
  commandId: string;
  success: boolean;
  data?: any;
  error?: string;
}

// Send command to bridge server and get result
async function sendCommand(command: Record<string, any>, timeout = 30000): Promise<CommandResult> {
  const response = await fetch(`${BRIDGE_URL}/commands`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
  });

  const result = await response.json();
  const commandId = result.commandId;

  const resultResponse = await fetch(`${BRIDGE_URL}/results/${commandId}?wait=true&timeout=${timeout}`);
  return resultResponse.json();
}

// Extract CSS command helper
function extractCSSCommand(url: string) {
  return {
    type: 'extractWebsiteCSS',
    payload: { url },
  };
}

class SSRFProtectionTestRunner {
  private results: TestResult[] = [];

  async runTest(name: string, testFn: () => Promise<void>): Promise<void> {
    const start = Date.now();
    try {
      await testFn();
      this.results.push({
        name,
        passed: true,
        duration: Date.now() - start,
      });
      console.log(`  ✅ ${name} (${Date.now() - start}ms)`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.results.push({
        name,
        passed: false,
        duration: Date.now() - start,
        error: message,
      });
      console.log(`  ❌ ${name}: ${message}`);
    }
  }

  assert(condition: boolean, message: string): void {
    if (!condition) {
      throw new Error(message);
    }
  }

  assertErrorContains(result: CommandResult, keyword: string, description: string): void {
    const failed = result.success === false || result.data?.success === false;
    this.assert(failed, `${description}: should have been blocked`);

    const errorMsg = (
      (result.error || '') +
      ' ' +
      (result.data?.error || '') +
      ' ' +
      (result.data?.errors?.join(' ') || '')
    ).toLowerCase();

    this.assert(
      errorMsg.includes(keyword.toLowerCase()),
      `${description}: error should contain "${keyword}", got: ${errorMsg.trim().substring(0, 120)}`
    );
  }

  // ============================================
  // TEST: Health Check
  // ============================================

  async testHealthCheck(): Promise<void> {
    const response = await fetch(`${BRIDGE_URL}/health`);
    const data = await response.json();
    this.assert(data.status === 'ok', `Expected status "ok", got "${data.status}"`);
  }

  // ============================================
  // TEST: Block loopback 127.0.0.1
  // ============================================

  async testBlockLoopback(): Promise<void> {
    const result = await sendCommand(extractCSSCommand('http://127.0.0.1'));
    this.assertErrorContains(result, 'loopback', 'Request to 127.0.0.1');
  }

  // ============================================
  // TEST: Block localhost
  // ============================================

  async testBlockLocalhost(): Promise<void> {
    const result = await sendCommand(extractCSSCommand('http://localhost:8080'));
    this.assertErrorContains(result, 'localhost', 'Request to localhost');
  }

  // ============================================
  // TEST: Block private 10.x.x.x
  // ============================================

  async testBlockPrivate10(): Promise<void> {
    const result = await sendCommand(extractCSSCommand('http://10.0.0.1'));
    this.assertErrorContains(result, 'private', 'Request to 10.0.0.1');
  }

  // ============================================
  // TEST: Block private 192.168.x.x
  // ============================================

  async testBlockPrivate192(): Promise<void> {
    const result = await sendCommand(extractCSSCommand('http://192.168.1.1'));
    this.assertErrorContains(result, 'private', 'Request to 192.168.1.1');
  }

  // ============================================
  // TEST: Block link-local/metadata 169.254.x.x
  // ============================================

  async testBlockMetadata(): Promise<void> {
    const result = await sendCommand(extractCSSCommand('http://169.254.169.254'));
    const errorMsg = (
      (result.error || '') +
      ' ' +
      (result.data?.error || '') +
      ' ' +
      (result.data?.errors?.join(' ') || '')
    ).toLowerCase();

    const failed = result.success === false || result.data?.success === false;
    this.assert(failed, 'Request to 169.254.169.254 should have been blocked');
    this.assert(
      errorMsg.includes('metadata') || errorMsg.includes('link-local'),
      `Error should contain "metadata" or "link-local", got: ${errorMsg.trim().substring(0, 120)}`
    );
  }

  // ============================================
  // TEST: Block file:// protocol
  // ============================================

  async testBlockFileProtocol(): Promise<void> {
    const result = await sendCommand(extractCSSCommand('file:///etc/passwd'));
    this.assertErrorContains(result, 'protocol', 'Request with file:// protocol');
  }

  // ============================================
  // TEST: Block ftp:// protocol
  // ============================================

  async testBlockFtpProtocol(): Promise<void> {
    const result = await sendCommand(extractCSSCommand('ftp://example.com'));
    this.assertErrorContains(result, 'protocol', 'Request with ftp:// protocol');
  }

  // ============================================
  // TEST: Allow legitimate https URL
  // ============================================

  async testAllowLegitimateUrl(): Promise<void> {
    // This test requires Chrome + network. It validates that a real URL is NOT blocked.
    // The extraction itself may fail (no plugin, timeout, etc.) but the SSRF check should pass.
    const result = await sendCommand(extractCSSCommand('https://example.com'), 60000);

    // The command should NOT fail with an SSRF-related error
    const errorMsg = (
      (result.error || '') +
      ' ' +
      (result.data?.error || '') +
      ' ' +
      (result.data?.errors?.join(' ') || '')
    ).toLowerCase();

    const isSSRFBlock =
      errorMsg.includes('loopback') ||
      errorMsg.includes('localhost') ||
      errorMsg.includes('private') ||
      errorMsg.includes('metadata') ||
      errorMsg.includes('link-local') ||
      errorMsg.includes('blocked protocol');

    this.assert(!isSSRFBlock, `Legitimate URL should NOT be blocked by SSRF protection, got: ${errorMsg.trim().substring(0, 120)}`);

    if (result.success && result.data?.success) {
      console.log(`     Extraction succeeded (elements scanned: ${result.data.meta?.elementsScanned || 'unknown'})`);
    } else {
      console.log(`     URL passed SSRF check (extraction may have failed for other reasons — OK for this test)`);
    }
  }

  // ============================================
  // RUN ALL TESTS
  // ============================================

  async run(): Promise<void> {
    console.log('\n========================================');
    console.log('  SSRF PROTECTION E2E TESTS');
    console.log('========================================\n');

    console.log('PHASE 1: Environment\n');
    await this.runTest('Bridge health check', () => this.testHealthCheck());

    console.log('\nPHASE 2: Blocked URLs\n');
    await this.runTest('Block loopback (127.0.0.1)', () => this.testBlockLoopback());
    await this.runTest('Block localhost', () => this.testBlockLocalhost());
    await this.runTest('Block private IP (10.0.0.1)', () => this.testBlockPrivate10());
    await this.runTest('Block private IP (192.168.1.1)', () => this.testBlockPrivate192());
    await this.runTest('Block metadata/link-local (169.254.169.254)', () => this.testBlockMetadata());
    await this.runTest('Block file:// protocol', () => this.testBlockFileProtocol());
    await this.runTest('Block ftp:// protocol', () => this.testBlockFtpProtocol());

    console.log('\nPHASE 3: Allowed URLs\n');
    await this.runTest('Allow legitimate https URL', () => this.testAllowLegitimateUrl());

    // Summary
    console.log('\n========================================');
    console.log('  TEST SUMMARY');
    console.log('========================================\n');

    const passed = this.results.filter((r) => r.passed).length;
    const failed = this.results.filter((r) => !r.passed).length;
    const totalTime = this.results.reduce((sum, r) => sum + r.duration, 0);

    console.log(`Total: ${this.results.length} tests`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Duration: ${(totalTime / 1000).toFixed(1)}s`);

    if (failed > 0) {
      console.log('\nFailed tests:');
      for (const result of this.results.filter((r) => !r.passed)) {
        console.log(`  - ${result.name}: ${result.error}`);
      }
    }

    console.log('\n');
    process.exit(failed > 0 ? 1 : 0);
  }
}

// Run
const runner = new SSRFProtectionTestRunner();
runner.run().catch((err) => {
  console.error('Test runner failed:', err);
  process.exit(1);
});
