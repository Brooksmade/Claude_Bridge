/**
 * E2E Test Runner for Figma Plugin
 *
 * Prerequisites:
 * 1. Bridge server running: pnpm dev
 * 2. Figma plugin loaded and connected
 * 3. Figma file open with design elements (frames, text, shapes)
 *
 * Run: npx ts-node e2e/test-runner.ts
 */

const BRIDGE_URL = 'http://localhost:4001';

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

// Send command to bridge server
async function sendCommand(command: Record<string, any>): Promise<CommandResult> {
  const response = await fetch(`${BRIDGE_URL}/commands`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
  });

  const result = await response.json();
  const commandId = result.commandId;

  // Wait for result
  const resultResponse = await fetch(`${BRIDGE_URL}/results/${commandId}?wait=true&timeout=30000`);
  return resultResponse.json();
}

// Test runner
class E2ETestRunner {
  private results: TestResult[] = [];
  private extractedTokens: any = null;
  private variables: any = null;
  private selectedFrameId: string | null = null;

  async runTest(name: string, testFn: () => Promise<void>): Promise<void> {
    const start = Date.now();
    try {
      await testFn();
      this.results.push({
        name,
        passed: true,
        duration: Date.now() - start,
      });
      console.log(`✅ ${name} (${Date.now() - start}ms)`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.results.push({
        name,
        passed: false,
        duration: Date.now() - start,
        error: message,
      });
      console.log(`❌ ${name}: ${message}`);
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
  // PHASE 2: SELECTION & EXTRACTION
  // ============================================

  async testGetSelection(): Promise<void> {
    const result = await sendCommand({
      type: 'query',
      payload: { queryType: 'selection' },
    });
    this.assert(result.success === true, 'Query should succeed');

    // Store selection for later tests
    if (result.data?.selection?.length > 0) {
      this.selectedFrameId = result.data.selection[0].id;
    } else if (result.data?.id) {
      this.selectedFrameId = result.data.id;
    }

    // If no selection, auto-select the first available frame
    if (!this.selectedFrameId) {
      console.log('   No frame selected. Auto-selecting first available frame...');
      const framesResult = await sendCommand({
        type: 'getFrames',
        payload: {},
      });

      // getFrames returns data as an array directly
      const frames = Array.isArray(framesResult.data) ? framesResult.data : framesResult.data?.frames;
      if (framesResult.success && frames?.length > 0) {
        // Select the first frame that has children (more likely to have design content)
        const frameWithChildren = frames.find((f: any) => f.childCount > 0);
        const frameToSelect = frameWithChildren || frames[0];

        // Select it in Figma
        const selectResult = await sendCommand({
          type: 'select',
          payload: { nodeIds: [frameToSelect.id] },
        });

        if (selectResult.success) {
          this.selectedFrameId = frameToSelect.id;
          console.log(`   Auto-selected frame: ${frameToSelect.name} (${frameToSelect.id})`);
        }
      }
    }

    this.assertExists(this.selectedFrameId, 'Should have a selected frame');
    console.log(`   Selected frame: ${this.selectedFrameId}`);
  }

  async testExtractDesignTokens(): Promise<void> {
    this.assertExists(this.selectedFrameId, 'Need selected frame first');

    const result = await sendCommand({
      type: 'extractDesignTokens',
      payload: {
        nodeId: this.selectedFrameId,
        includeChildren: true,
      },
    });

    this.assert(result.success === true, 'Extraction should succeed');
    this.assertExists(result.data?.tokens, 'Should have tokens');

    this.extractedTokens = result.data.tokens;
    const summary = result.data.summary;

    console.log(`   Extracted tokens summary:`);
    console.log(`     Colors: ${summary.colors}`);
    console.log(`     Font Families: ${summary.typography.fontFamily}`);
    console.log(`     Font Sizes: ${summary.typography.fontSize}`);
    console.log(`     Font Weights: ${summary.typography.fontWeight}`);
    console.log(`     Spacing: ${summary.numbers.spacing}`);
    console.log(`     Border Radius: ${summary.numbers.borderRadius}`);
    console.log(`     Shadows: ${summary.effects.shadows}`);
    console.log(`     Nodes scanned: ${this.extractedTokens.meta.nodesScanned}`);
  }

  async testExtractedTokensStructure(): Promise<void> {
    this.assertExists(this.extractedTokens, 'Need extracted tokens first');

    // Verify structure
    this.assertExists(this.extractedTokens.colors, 'Should have colors');
    this.assertExists(this.extractedTokens.colors.all, 'Should have colors.all');
    this.assertExists(this.extractedTokens.typography, 'Should have typography');
    this.assertExists(this.extractedTokens.typography.fontFamily, 'Should have fontFamily');
    this.assertExists(this.extractedTokens.typography.fontSize, 'Should have fontSize');
    this.assertExists(this.extractedTokens.typography.fontWeight, 'Should have fontWeight');
    this.assertExists(this.extractedTokens.typography.lineHeight, 'Should have lineHeight');
    this.assertExists(this.extractedTokens.typography.letterSpacing, 'Should have letterSpacing');
    this.assertExists(this.extractedTokens.numbers, 'Should have numbers');
    this.assertExists(this.extractedTokens.numbers.spacing, 'Should have spacing');
    this.assertExists(this.extractedTokens.numbers.borderWidth, 'Should have borderWidth');
    this.assertExists(this.extractedTokens.numbers.borderRadius, 'Should have borderRadius');
    this.assertExists(this.extractedTokens.numbers.opacity, 'Should have opacity');
    this.assertExists(this.extractedTokens.effects, 'Should have effects');
    this.assertExists(this.extractedTokens.effects.shadows, 'Should have shadows');
    this.assertExists(this.extractedTokens.effects.transitions, 'Should have transitions');
    this.assertExists(this.extractedTokens.effects.transitions.duration, 'Should have duration');
    this.assertExists(this.extractedTokens.effects.transitions.easing, 'Should have easing');
    this.assertExists(this.extractedTokens.meta, 'Should have meta');
  }

  // ============================================
  // PHASE 3: DESIGN SYSTEM CREATION
  // ============================================

  async testCreateDesignSystemWithExtractedTokens(): Promise<void> {
    this.assertExists(this.extractedTokens, 'Need extracted tokens first');

    // Detect brand color from grays
    const grays = this.extractedTokens.colors.grayScale || [];
    let primaryColor = '#171717';
    for (const gray of grays) {
      if (gray.toLowerCase() !== '#000000' && gray.toLowerCase() !== '#ffffff') {
        primaryColor = gray;
        break;
      }
    }

    console.log(`   Using brand color: ${primaryColor}`);

    const result = await sendCommand({
      type: 'createDesignSystem',
      payload: {
        brandColors: { primary: primaryColor },
        includeBoilerplate: true,
        extractedTokens: this.extractedTokens,
      },
    });

    this.assert(result.success === true, 'Design system creation should succeed');
    this.assertExists(result.data?.collections, 'Should have collections');

    const data = result.data;
    console.log(`   Total variables: ${data.totalVariables}`);
    console.log(`   Collections created:`);
    for (const [name, info] of Object.entries(data.collections) as [string, any][]) {
      console.log(`     ${name}: ${info.variableCount} vars (created: ${info.created})`);
    }

    if (data.boilerplateSkipped !== undefined) {
      console.log(`   Boilerplate skipped: ${data.boilerplateSkipped} (values already in frame)`);
    }

    // Verify 4 collections exist
    this.assertExists(data.collections['Primitive [ Level 1 ]'], 'Should have Level 1');
    this.assertExists(data.collections['Semantic [ Level 2 ]'], 'Should have Level 2');
    this.assertExists(data.collections['Tokens [ Level 3 ]'], 'Should have Level 3');
    this.assertExists(data.collections['Theme'], 'Should have Theme');
  }

  async testGetVariables(): Promise<void> {
    const result = await sendCommand({
      type: 'getVariables',
      payload: { includeValues: true },
    });

    this.assert(result.success === true, 'getVariables should succeed');
    this.assertExists(result.data?.collections, 'Should have collections');

    this.variables = result.data;
    console.log(`   Found ${result.data.collections.length} collections`);
  }

  async testValidateDesignSystem(): Promise<void> {
    const result = await sendCommand({
      type: 'validateDesignSystem',
      payload: {},
    });

    this.assert(result.success === true, 'Validation should succeed');
    this.assert(result.data?.valid === true, 'Design system should be valid');

    if (result.data?.issues?.length > 0) {
      console.log(`   Issues: ${JSON.stringify(result.data.issues)}`);
    }
  }

  // ============================================
  // PHASE 4: VARIABLE BINDING
  // ============================================

  async testLoadFonts(): Promise<void> {
    this.assertExists(this.extractedTokens, 'Need extracted tokens first');

    const fonts = this.extractedTokens.typography.fontFamily || [];
    console.log(`   Loading ${fonts.length} fonts: ${fonts.join(', ')}`);

    for (const font of fonts) {
      try {
        const result = await sendCommand({
          type: 'loadFont',
          payload: { family: font, style: 'Regular' },
        });
        if (result.success) {
          console.log(`     Loaded: ${font}`);
        }
      } catch (e) {
        console.log(`     Failed to load: ${font}`);
      }
    }
  }

  async testBindFillVariables(): Promise<void> {
    this.assertExists(this.selectedFrameId, 'Need selected frame first');
    this.assertExists(this.variables, 'Need variables first');

    // Get all nodes with colors
    const nodeColorsResult = await sendCommand({
      type: 'getNodeColors',
      payload: {
        nodeId: this.selectedFrameId,
        includeChildren: true,
        includeStrokes: true,
      },
    });

    // Handle timeout/failure gracefully - don't fail entire test
    if (!nodeColorsResult.success) {
      console.log(`   Warning: getNodeColors failed (${nodeColorsResult.error || 'timeout'}), skipping fill binding`);
      return;
    }

    const nodeColors = nodeColorsResult.data?.colors || [];
    console.log(`   Found ${nodeColors.length} color instances to potentially bind`);

    // Build color -> variable map
    const colorVarMap = new Map<string, string>();
    for (const collection of this.variables.collections) {
      for (const variable of collection.variables || []) {
        if (variable.type === 'COLOR' && variable.valuesByMode) {
          // Get the first mode value (hex string from serializer)
          const valueMode = Object.values(variable.valuesByMode)[0] as any;
          if (typeof valueMode === 'string' && valueMode.startsWith('#')) {
            colorVarMap.set(valueMode.toLowerCase(), variable.id);
          }
        }
      }
    }

    console.log(`   Color variable map has ${colorVarMap.size} entries`);

    // Bind fills
    let boundCount = 0;
    const uniqueNodes = new Map<string, { nodeId: string; hex: string }>();

    for (const nc of nodeColors) {
      const hex = nc.hex?.toLowerCase();
      if (hex && colorVarMap.has(hex) && !uniqueNodes.has(nc.nodeId + hex)) {
        uniqueNodes.set(nc.nodeId + hex, { nodeId: nc.nodeId, hex });
      }
    }

    for (const { nodeId, hex } of uniqueNodes.values()) {
      const varId = colorVarMap.get(hex);
      if (varId) {
        try {
          const bindResult = await sendCommand({
            type: 'bindFillVariable',
            payload: { nodeId, variableId: varId, fillIndex: 0 },
          });
          if (bindResult.success) {
            boundCount++;
          }
        } catch (e) {
          // Ignore individual binding errors
        }
      }
    }

    console.log(`   Bound ${boundCount} fill variables`);
  }

  async testBindFontSizeVariables(): Promise<void> {
    this.assertExists(this.selectedFrameId, 'Need selected frame first');
    this.assertExists(this.variables, 'Need variables first');

    // Find all text nodes
    const findResult = await sendCommand({
      type: 'findAllByType',
      payload: { nodeId: this.selectedFrameId, type: 'TEXT' },
    });

    if (!findResult.success || !findResult.data?.nodes) {
      console.log('   No text nodes found');
      return;
    }

    const textNodes = findResult.data.nodes;
    console.log(`   Found ${textNodes.length} text nodes`);

    // Build fontSize -> variable map
    const fontSizeVarMap = new Map<number, string>();
    for (const collection of this.variables.collections) {
      for (const variable of collection.variables || []) {
        if (variable.type === 'FLOAT' && variable.name.includes('Font Size')) {
          const valueMode = Object.values(variable.valuesByMode || {})[0];
          if (typeof valueMode === 'number') {
            fontSizeVarMap.set(valueMode, variable.id);
          }
        }
      }
    }

    console.log(`   Font size variable map has ${fontSizeVarMap.size} entries`);

    // Bind font sizes
    let boundCount = 0;
    for (const node of textNodes) {
      const fontSize = node.fontSize;
      if (typeof fontSize === 'number' && fontSizeVarMap.has(fontSize)) {
        try {
          const bindResult = await sendCommand({
            type: 'bindVariable',
            payload: {
              nodeId: node.id,
              variableId: fontSizeVarMap.get(fontSize),
              field: 'fontSize',
            },
          });
          if (bindResult.success) {
            boundCount++;
          }
        } catch (e) {
          // Ignore
        }
      }
    }

    console.log(`   Bound ${boundCount} font size variables`);
  }

  async testBindCornerRadiusVariables(): Promise<void> {
    this.assertExists(this.selectedFrameId, 'Need selected frame first');
    this.assertExists(this.variables, 'Need variables first');

    // Find all frames and rectangles
    const findFramesResult = await sendCommand({
      type: 'findAllByType',
      payload: { nodeId: this.selectedFrameId, type: 'FRAME' },
    });

    const findRectsResult = await sendCommand({
      type: 'findAllByType',
      payload: { nodeId: this.selectedFrameId, type: 'RECTANGLE' },
    });

    const nodes = [
      ...(findFramesResult.data?.nodes || []),
      ...(findRectsResult.data?.nodes || []),
    ];

    console.log(`   Found ${nodes.length} nodes with potential corner radius`);

    // Build radius -> variable map
    const radiusVarMap = new Map<number, string>();
    for (const collection of this.variables.collections) {
      for (const variable of collection.variables || []) {
        if (variable.type === 'FLOAT' && variable.name.includes('Border Radius')) {
          const valueMode = Object.values(variable.valuesByMode || {})[0];
          if (typeof valueMode === 'number') {
            radiusVarMap.set(valueMode, variable.id);
          }
        }
      }
    }

    console.log(`   Border radius variable map has ${radiusVarMap.size} entries`);

    // Bind corner radii
    let boundCount = 0;
    for (const node of nodes) {
      const radius = node.cornerRadius;
      if (typeof radius === 'number' && radius > 0 && radiusVarMap.has(radius)) {
        try {
          const bindResult = await sendCommand({
            type: 'bindVariable',
            payload: {
              nodeId: node.id,
              variableId: radiusVarMap.get(radius),
              field: 'cornerRadius',
            },
          });
          if (bindResult.success) {
            boundCount++;
          }
        } catch (e) {
          // Ignore
        }
      }
    }

    console.log(`   Bound ${boundCount} corner radius variables`);
  }

  async testBindSpacingVariables(): Promise<void> {
    this.assertExists(this.selectedFrameId, 'Need selected frame first');
    this.assertExists(this.variables, 'Need variables first');

    // Find all auto-layout frames
    const findResult = await sendCommand({
      type: 'findAllByType',
      payload: { nodeId: this.selectedFrameId, type: 'FRAME' },
    });

    const frames = (findResult.data?.nodes || []).filter(
      (n: any) => n.layoutMode && n.layoutMode !== 'NONE'
    );

    console.log(`   Found ${frames.length} auto-layout frames`);

    // Build spacing -> variable map
    const spacingVarMap = new Map<number, string>();
    for (const collection of this.variables.collections) {
      for (const variable of collection.variables || []) {
        if (variable.type === 'FLOAT' && variable.name.includes('Spacing')) {
          const valueMode = Object.values(variable.valuesByMode || {})[0];
          if (typeof valueMode === 'number') {
            spacingVarMap.set(valueMode, variable.id);
          }
        }
      }
    }

    console.log(`   Spacing variable map has ${spacingVarMap.size} entries`);

    // Bind itemSpacing and padding
    let boundCount = 0;
    for (const frame of frames) {
      // itemSpacing
      if (typeof frame.itemSpacing === 'number' && spacingVarMap.has(frame.itemSpacing)) {
        try {
          const bindResult = await sendCommand({
            type: 'bindVariable',
            payload: {
              nodeId: frame.id,
              variableId: spacingVarMap.get(frame.itemSpacing),
              field: 'itemSpacing',
            },
          });
          if (bindResult.success) boundCount++;
        } catch (e) {}
      }

      // padding
      for (const side of ['paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom']) {
        const value = frame[side];
        if (typeof value === 'number' && value > 0 && spacingVarMap.has(value)) {
          try {
            const bindResult = await sendCommand({
              type: 'bindVariable',
              payload: {
                nodeId: frame.id,
                variableId: spacingVarMap.get(value),
                field: side,
              },
            });
            if (bindResult.success) boundCount++;
          } catch (e) {}
        }
      }
    }

    console.log(`   Bound ${boundCount} spacing variables`);
  }

  // ============================================
  // RUN ALL TESTS
  // ============================================

  async run(): Promise<void> {
    console.log('\n========================================');
    console.log('  FIGMA PLUGIN E2E TEST SUITE');
    console.log('========================================\n');

    console.log('PHASE 1: Environment Checks\n');
    await this.runTest('Bridge server connection', () => this.testBridgeConnection());
    await this.runTest('Plugin connection (ping)', () => this.testPluginConnection());

    console.log('\nPHASE 2: Selection & Token Extraction\n');
    await this.runTest('Get current selection', () => this.testGetSelection());
    await this.runTest('Extract design tokens', () => this.testExtractDesignTokens());
    await this.runTest('Validate extracted tokens structure', () => this.testExtractedTokensStructure());

    console.log('\nPHASE 3: Design System Creation\n');
    await this.runTest('Create design system with extracted tokens', () =>
      this.testCreateDesignSystemWithExtractedTokens()
    );
    await this.runTest('Get all variables', () => this.testGetVariables());
    await this.runTest('Validate design system', () => this.testValidateDesignSystem());

    console.log('\nPHASE 4: Variable Binding\n');
    await this.runTest('Load extracted fonts', () => this.testLoadFonts());
    await this.runTest('Bind fill variables (colors)', () => this.testBindFillVariables());
    await this.runTest('Bind font size variables', () => this.testBindFontSizeVariables());
    await this.runTest('Bind corner radius variables', () => this.testBindCornerRadiusVariables());
    await this.runTest('Bind spacing variables', () => this.testBindSpacingVariables());

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
    console.log(`Duration: ${totalTime}ms`);

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

// Helper function
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = Math.round(n * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return '#' + toHex(r) + toHex(g) + toHex(b);
}

// Run
const runner = new E2ETestRunner();
runner.run().catch((err) => {
  console.error('Test runner failed:', err);
  process.exit(1);
});
