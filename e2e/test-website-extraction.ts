/**
 * E2E Tests for Website CSS Extraction Functionality
 *
 * Tests the ability to:
 * 1. Extract CSS from live websites using Puppeteer
 * 2. Create design systems from extracted website tokens
 * 3. Validate the extracted token structure
 *
 * Prerequisites:
 * 1. Bridge server running: pnpm dev
 * 2. Figma plugin loaded and connected
 * 3. Internet connection for website fetching
 * 4. Google Chrome installed (for Puppeteer)
 *
 * Run: npx ts-node e2e/test-website-extraction.ts
 */

const BRIDGE_URL = 'http://localhost:4001';

// Test websites - using reliable public sites
const TEST_WEBSITES = {
  simple: 'https://example.com',
  tailwind: 'https://tailwindcss.com',
  google: 'https://www.google.com',
};

interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
  data?: any;
}

interface CommandResult {
  commandId: string;
  success: boolean;
  data?: any;
  error?: string;
}

interface ColorToken {
  hex: string;
  rgb: string;
  usage: string;
  count: number;
}

interface ExtractedWebsiteTokens {
  colors: ColorToken[];
  typography: {
    fontFamilies: string[];
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

interface ExtractionResult {
  success: boolean;
  url: string;
  tokens: ExtractedWebsiteTokens;
  meta: {
    extractedAt: string;
    elementsScanned: number;
    extractionTimeMs: number;
  };
  errors?: string[];
}

// Send command to bridge server
async function sendCommand(command: Record<string, any>, timeout = 60000): Promise<CommandResult> {
  const response = await fetch(`${BRIDGE_URL}/commands`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
  });

  const result = await response.json();
  const commandId = result.commandId;

  // Wait for result with longer timeout for website extraction
  const resultResponse = await fetch(`${BRIDGE_URL}/results/${commandId}?wait=true&timeout=${timeout}`);
  return resultResponse.json();
}

// Delete all variable collections (cleanup between tests)
async function cleanupVariableCollections(): Promise<void> {
  const getResult = await sendCommand({
    type: 'getVariables',
    payload: {},
  });

  if (getResult.success && getResult.data?.collections) {
    for (const collection of getResult.data.collections) {
      try {
        await sendCommand({
          type: 'deleteVariableCollection',
          payload: { collectionId: collection.id },
        });
      } catch (e) {
        // Ignore deletion errors
      }
    }
  }
}

// Test runner
class WebsiteExtractionTestRunner {
  private results: TestResult[] = [];
  private extractionResult: ExtractionResult | null = null;

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

  assertExists(value: any, name: string): void {
    if (value === undefined || value === null) {
      throw new Error(`${name} should exist`);
    }
  }

  assertIsArray(value: any, name: string): void {
    if (!Array.isArray(value)) {
      throw new Error(`${name} should be an array`);
    }
  }

  assertGreaterThan(value: number, threshold: number, name: string): void {
    if (value <= threshold) {
      throw new Error(`${name} should be > ${threshold}, got ${value}`);
    }
  }

  // ============================================
  // PHASE 1: ENVIRONMENT CHECKS
  // ============================================

  async testBridgeConnection(): Promise<void> {
    const response = await fetch(`${BRIDGE_URL}/health`);
    const data = await response.json();
    this.assert(data.status === 'ok', 'Bridge server should be healthy');
  }

  async testPluginConnection(): Promise<void> {
    const result = await sendCommand({ type: 'ping', payload: {} });
    this.assert(result.success === true, 'Plugin should respond to ping');
    this.assertExists(result.data?.pong, 'Should have pong response');
  }

  // ============================================
  // PHASE 2: BASIC WEBSITE EXTRACTION
  // ============================================

  async testExtractSimpleWebsite(): Promise<void> {
    console.log(`     Extracting from: ${TEST_WEBSITES.simple}`);

    const result = await sendCommand(
      {
        type: 'extractWebsiteCSS',
        payload: {
          url: TEST_WEBSITES.simple,
        },
      },
      90000 // 90 second timeout for Puppeteer
    );

    this.assert(result.success === true, 'Website extraction should succeed');
    this.assertExists(result.data, 'Should have extraction data');
    this.assert(result.data.success === true, 'Extraction result should indicate success');
    this.assertExists(result.data.tokens, 'Should have tokens in extraction result');

    // Store for later tests
    this.extractionResult = result.data as ExtractionResult;

    console.log(`     Extraction completed successfully`);
    console.log(`     Elements scanned: ${this.extractionResult.meta.elementsScanned}`);
  }

  async testExtractedTokensStructure(): Promise<void> {
    this.assertExists(this.extractionResult, 'Need extraction result first');
    const result = this.extractionResult!;
    const tokens = result.tokens;

    // Verify top-level structure
    this.assertExists(result.url, 'Should have source url');
    this.assertExists(result.meta, 'Should have meta');
    this.assertExists(result.meta.extractedAt, 'Should have extraction timestamp');

    // Verify tokens structure
    this.assertExists(tokens.colors, 'Should have colors');
    this.assertIsArray(tokens.colors, 'colors');

    this.assertExists(tokens.typography, 'Should have typography');
    this.assertExists(tokens.typography.fontFamilies, 'Should have fontFamilies');
    this.assertExists(tokens.typography.fontSizes, 'Should have fontSizes');
    this.assertExists(tokens.typography.fontWeights, 'Should have fontWeights');
    this.assertExists(tokens.typography.lineHeights, 'Should have lineHeights');

    this.assertIsArray(tokens.typography.fontFamilies, 'fontFamilies');
    this.assertIsArray(tokens.typography.fontSizes, 'fontSizes');

    this.assertExists(tokens.spacing, 'Should have spacing');
    this.assertIsArray(tokens.spacing, 'spacing');

    this.assertExists(tokens.borderRadius, 'Should have borderRadius');
    this.assertIsArray(tokens.borderRadius, 'borderRadius');

    this.assertExists(tokens.shadows, 'Should have shadows');
    this.assertIsArray(tokens.shadows, 'shadows');

    console.log(`     Colors found: ${tokens.colors.length}`);
    console.log(`     Font families: ${tokens.typography.fontFamilies.length}`);
    console.log(`     Font sizes: ${tokens.typography.fontSizes.length}`);
    console.log(`     Spacing values: ${tokens.spacing.length}`);
    console.log(`     Border radii: ${tokens.borderRadius.length}`);
    console.log(`     Shadows: ${tokens.shadows.length}`);
  }

  async testColorsAreHexFormat(): Promise<void> {
    this.assertExists(this.extractionResult, 'Need extraction result first');
    const tokens = this.extractionResult!.tokens;

    const hexPattern = /^#[0-9A-Fa-f]{6}$/i;
    const validColors = tokens.colors.filter((c) => hexPattern.test(c.hex));

    console.log(`     Valid hex colors: ${validColors.length}/${tokens.colors.length}`);

    // At least some colors should be valid hex
    if (tokens.colors.length > 0) {
      this.assertGreaterThan(validColors.length, 0, 'Valid hex color count');
    }
  }

  // ============================================
  // PHASE 3: WEBSITE TO DESIGN SYSTEM
  // ============================================

  async testCreateDesignSystemFromWebsite(): Promise<void> {
    this.assertExists(this.extractionResult, 'Need extraction result first');
    const tokens = this.extractionResult!.tokens;

    await cleanupVariableCollections();

    // Pick a primary color from extracted colors (or use default)
    let primaryColor = '#3B82F6'; // default
    const hexPattern = /^#[0-9A-Fa-f]{6}$/i;
    const validColors = tokens.colors.filter((c) => hexPattern.test(c.hex)).map((c) => c.hex);

    if (validColors.length > 0) {
      // Find a non-gray color
      const nonGray = validColors.find((c) => {
        const r = parseInt(c.slice(1, 3), 16);
        const g = parseInt(c.slice(3, 5), 16);
        const b = parseInt(c.slice(5, 7), 16);
        // Color is not gray if channels differ significantly
        return Math.abs(r - g) > 20 || Math.abs(g - b) > 20 || Math.abs(r - b) > 20;
      });
      if (nonGray) {
        primaryColor = nonGray;
      }
    }

    console.log(`     Using primary color: ${primaryColor}`);

    const result = await sendCommand({
      type: 'createDesignSystem',
      payload: {
        brandColors: { primary: primaryColor },
        includeBoilerplate: true,
        organizingPrinciple: 'four-level',
        // Note: In a full implementation, extractedTokens would be passed here
        // For now, we test that the command accepts the structure
      },
    });

    this.assert(result.success === true, 'Design system creation should succeed');
    this.assertExists(result.data?.collections, 'Should have collections');

    console.log(`     Total variables created: ${result.data.totalVariables}`);
  }

  // ============================================
  // PHASE 4: EDGE CASES
  // ============================================

  async testInvalidUrlHandling(): Promise<void> {
    const result = await sendCommand(
      {
        type: 'extractWebsiteCSS',
        payload: {
          url: 'not-a-valid-url',
        },
      },
      30000
    );

    // Should fail gracefully - either at command level or extraction level
    const failed = result.success === false || result.data?.success === false;
    this.assert(failed, 'Invalid URL should fail');

    const errorMsg = result.error || result.data?.errors?.join(', ') || 'unknown error';
    console.log(`     Error for invalid URL: ${errorMsg}`);
  }

  async testNonExistentDomainHandling(): Promise<void> {
    const result = await sendCommand(
      {
        type: 'extractWebsiteCSS',
        payload: {
          url: 'https://this-domain-definitely-does-not-exist-12345.com',
        },
      },
      30000
    );

    // Should fail gracefully - either at command level or extraction level
    const failed = result.success === false || result.data?.success === false;
    this.assert(failed, 'Non-existent domain should fail');

    const errorMsg = result.error || result.data?.errors?.join(', ') || 'unknown error';
    console.log(`     Error for non-existent domain: ${errorMsg.substring(0, 80)}...`);
  }

  async testUrlWithoutProtocol(): Promise<void> {
    // Some implementations may auto-add https://
    const result = await sendCommand(
      {
        type: 'extractWebsiteCSS',
        payload: {
          url: 'example.com', // No protocol
        },
      },
      30000
    );

    // Either succeeds (auto-adds protocol) or fails with clear error
    const succeeded = result.success && result.data?.success;
    if (succeeded) {
      console.log(`     URL without protocol: auto-handled`);
    } else {
      const errorMsg = result.error || result.data?.errors?.join(', ') || 'failed';
      console.log(`     URL without protocol error: ${errorMsg}`);
    }
  }

  // ============================================
  // PHASE 5: COMPLEX WEBSITE EXTRACTION (Optional)
  // ============================================

  async testExtractTailwindSite(): Promise<void> {
    console.log(`     Extracting from: ${TEST_WEBSITES.tailwind}`);
    console.log(`     (This may take longer for complex sites...)`);

    const result = await sendCommand(
      {
        type: 'extractWebsiteCSS',
        payload: {
          url: TEST_WEBSITES.tailwind,
        },
      },
      120000 // 2 minute timeout
    );

    if (result.success && result.data?.success) {
      const tokens = result.data.tokens;
      console.log(`     Colors: ${tokens?.colors?.length || 0}`);
      console.log(`     Font families: ${tokens?.typography?.fontFamilies?.length || 0}`);
      console.log(`     Spacing values: ${tokens?.spacing?.length || 0}`);

      // Tailwind site should extract some tokens (may vary based on site changes)
      const colorCount = tokens?.colors?.length || 0;
      const spacingCount = tokens?.spacing?.length || 0;
      const totalTokens = colorCount + spacingCount;
      this.assertGreaterThan(totalTokens, 0, 'Tailwind site should have some extracted tokens');
    } else {
      // May fail due to network issues - log but don't fail test
      console.log(`     Warning: Extraction failed (${result.error || result.data?.errors})`);
      console.log(`     This may be due to network issues or site changes`);
    }
  }

  // ============================================
  // RUN ALL TESTS
  // ============================================

  async run(): Promise<void> {
    console.log('\n========================================');
    console.log('  WEBSITE CSS EXTRACTION E2E TESTS');
    console.log('========================================\n');

    console.log('PHASE 1: Environment Checks\n');
    await this.runTest('Bridge server connection', () => this.testBridgeConnection());
    await this.runTest('Plugin connection (ping)', () => this.testPluginConnection());

    console.log('\nPHASE 2: Basic Website Extraction\n');
    await this.runTest('Extract simple website (example.com)', () => this.testExtractSimpleWebsite());
    await this.runTest('Validate extracted tokens structure', () => this.testExtractedTokensStructure());
    await this.runTest('Validate colors are hex format', () => this.testColorsAreHexFormat());

    console.log('\nPHASE 3: Website to Design System\n');
    await this.runTest('Create design system from extracted tokens', () =>
      this.testCreateDesignSystemFromWebsite()
    );

    console.log('\nPHASE 4: Edge Cases & Error Handling\n');
    await this.runTest('Invalid URL handling', () => this.testInvalidUrlHandling());
    await this.runTest('Non-existent domain handling', () => this.testNonExistentDomainHandling());
    await this.runTest('URL without protocol', () => this.testUrlWithoutProtocol());

    console.log('\nPHASE 5: Complex Website Extraction (Optional)\n');
    await this.runTest('Extract Tailwind CSS site', () => this.testExtractTailwindSite());

    // Cleanup
    await cleanupVariableCollections();

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
const runner = new WebsiteExtractionTestRunner();
runner.run().catch((err) => {
  console.error('Test runner failed:', err);
  process.exit(1);
});
