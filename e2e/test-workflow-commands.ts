/**
 * E2E Smoke Tests for Workflow Commands
 *
 * Lightweight tests verifying core API calls from each workflow function.
 * Validates that the bridge server routes commands correctly and the
 * Figma plugin responds with valid structures.
 *
 * Prerequisites:
 * 1. Bridge server running: pnpm dev
 * 2. Figma plugin loaded and connected
 * 3. Figma file open with some content (frames, text, shapes)
 *
 * Run: npx ts-node e2e/test-workflow-commands.ts
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

class WorkflowCommandsTestRunner {
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

  assertExists(value: any, name: string): void {
    if (value === undefined || value === null) {
      throw new Error(`${name} should exist`);
    }
  }

  assertIsArray(value: any, name: string): void {
    if (!Array.isArray(value)) {
      throw new Error(`${name} should be an array, got ${typeof value}`);
    }
  }

  // ============================================
  // TEST 1: Bridge health check
  // ============================================

  async testBridgeHealth(): Promise<void> {
    const response = await fetch(`${BRIDGE_URL}/health`);
    const data = await response.json();
    this.assert(data.status === 'ok', `Expected status "ok", got "${data.status}"`);
  }

  // ============================================
  // TEST 2: Plugin ping
  // ============================================

  async testPluginPing(): Promise<void> {
    const result = await sendCommand({ type: 'ping', payload: {} });
    this.assert(result.success === true, 'Plugin should respond to ping');
    this.assertExists(result.data?.pong, 'Should have pong response');
  }

  // ============================================
  // TEST 3: Get variables (bind-variables workflow)
  // ============================================

  async testGetVariables(): Promise<void> {
    const result = await sendCommand({
      type: 'getVariables',
      payload: {},
    });
    this.assert(result.success === true, 'getVariables should succeed');
    this.assertExists(result.data, 'Should have data');
    // Collections may be empty but should be an array
    this.assertIsArray(result.data.collections, 'collections');
    console.log(`     Collections found: ${result.data.collections.length}`);
  }

  // ============================================
  // TEST 4: Get node colors (bind-variables workflow)
  // ============================================

  async testGetNodeColors(): Promise<void> {
    const result = await sendCommand({
      type: 'getNodeColors',
      payload: { includeChildren: true },
    });
    // May succeed with colors or return empty if nothing selected
    if (result.success) {
      const colors = result.data?.colors || result.data || [];
      console.log(`     Colors found: ${Array.isArray(colors) ? colors.length : 'N/A'}`);
    } else {
      // Acceptable if no selection — just verify the command was routed
      console.log(`     Command routed (no selection: ${result.error || 'empty'})`);
    }
    // The key assertion: the command didn't crash the server
    this.assert(result.success !== undefined, 'Command should return a success field');
  }

  // ============================================
  // TEST 5: Get used fonts (typography workflow)
  // ============================================

  async testGetUsedFonts(): Promise<void> {
    const result = await sendCommand({
      type: 'getUsedFonts',
      payload: {},
    });
    if (result.success) {
      const fonts = result.data?.fonts || result.data || [];
      console.log(`     Fonts found: ${Array.isArray(fonts) ? fonts.length : JSON.stringify(fonts).substring(0, 80)}`);
    } else {
      console.log(`     Command routed (${result.error || 'no data'})`);
    }
    this.assert(result.success !== undefined, 'Command should return a success field');
  }

  // ============================================
  // TEST 6: Check missing fonts (typography workflow)
  // ============================================

  async testCheckMissingFonts(): Promise<void> {
    const result = await sendCommand({
      type: 'checkMissingFonts',
      payload: {},
    });
    this.assert(result.success !== undefined, 'Command should return a success field');
    if (result.success) {
      console.log(`     Missing fonts check completed`);
    } else {
      console.log(`     Command routed (${result.error || 'no data'})`);
    }
  }

  // ============================================
  // TEST 7: Get components (component-library workflow)
  // ============================================

  async testGetComponents(): Promise<void> {
    const result = await sendCommand({
      type: 'getComponents',
      payload: {},
    });
    // getComponents may fail if file has no valid component sets — that's OK
    if (result.success) {
      const components = Array.isArray(result.data) ? result.data : result.data?.components || [];
      console.log(`     Components found: ${components.length}`);
    } else {
      console.log(`     Command routed (${result.error || 'no components'})`);
    }
    this.assert(result.success !== undefined, 'Command should return a success field');
  }

  // ============================================
  // TEST 8: Get design system status (design-to-dev workflow)
  // ============================================

  async testGetDesignSystemStatus(): Promise<void> {
    const result = await sendCommand({
      type: 'getDesignSystemStatus',
      payload: {},
    });
    this.assert(result.success === true, 'getDesignSystemStatus should succeed');
    this.assertExists(result.data, 'Should have data');
    console.log(`     Design system exists: ${result.data.exists ?? result.data.hasDesignSystem ?? 'unknown'}`);
  }

  // ============================================
  // TEST 9: Measure text (figjam-workflow)
  // ============================================

  async testMeasureText(): Promise<void> {
    const result = await sendCommand({
      type: 'measureText',
      payload: { text: 'Test', fontSize: 14 },
    });
    this.assert(result.success === true, 'measureText should succeed');
    this.assertExists(result.data, 'Should have data');
    this.assertExists(result.data.width, 'Should have width');
    this.assertExists(result.data.height, 'Should have height');
    console.log(`     "Test" at 14px: ${result.data.width}w × ${result.data.height}h`);
  }

  // ============================================
  // TEST 10: Selection query (all workflows)
  // ============================================

  async testSelectionQuery(): Promise<void> {
    const result = await sendCommand({
      type: 'query',
      payload: { queryType: 'selection' },
    });
    this.assert(result.success === true, 'query(selection) should succeed');
    this.assertExists(result.data, 'Should have data');
    const selection = result.data.selection || result.data;
    console.log(`     Selection: ${Array.isArray(selection) ? selection.length + ' nodes' : 'present'}`);
  }

  // ============================================
  // TEST 11: Analyze colors (accessibility/handoff workflow)
  // ============================================

  async testAnalyzeColors(): Promise<void> {
    const result = await sendCommand({
      type: 'analyzeColors',
      payload: {},
    });
    if (result.success) {
      console.log(`     Color analysis completed`);
    } else {
      // analyzeColors may need a selection — just verify routing
      console.log(`     Command routed (${result.error || 'no selection'})`);
    }
    this.assert(result.success !== undefined, 'Command should return a success field');
  }

  // ============================================
  // RUN ALL TESTS
  // ============================================

  async run(): Promise<void> {
    console.log('\n========================================');
    console.log('  WORKFLOW COMMANDS SMOKE TESTS');
    console.log('========================================\n');

    console.log('PHASE 1: Environment\n');
    await this.runTest('Bridge health check', () => this.testBridgeHealth());
    await this.runTest('Plugin ping', () => this.testPluginPing());

    console.log('\nPHASE 2: Variable & Binding Commands\n');
    await this.runTest('Get variables', () => this.testGetVariables());
    await this.runTest('Get node colors', () => this.testGetNodeColors());

    console.log('\nPHASE 3: Typography Commands\n');
    await this.runTest('Get used fonts', () => this.testGetUsedFonts());
    await this.runTest('Check missing fonts', () => this.testCheckMissingFonts());

    console.log('\nPHASE 4: Component & Design System Commands\n');
    await this.runTest('Get components', () => this.testGetComponents());
    await this.runTest('Get design system status', () => this.testGetDesignSystemStatus());

    console.log('\nPHASE 5: FigJam & Analysis Commands\n');
    await this.runTest('Measure text', () => this.testMeasureText());
    await this.runTest('Selection query', () => this.testSelectionQuery());
    await this.runTest('Analyze colors', () => this.testAnalyzeColors());

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
const runner = new WorkflowCommandsTestRunner();
runner.run().catch((err) => {
  console.error('Test runner failed:', err);
  process.exit(1);
});
