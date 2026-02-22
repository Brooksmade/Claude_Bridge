/**
 * Comprehensive test suite for the orchestrator package.
 * Run: npx tsx tests/run-tests.ts
 */

let passed = 0;
let failed = 0;
const failures: string[] = [];

function assert(condition: boolean, message: string): void {
  if (condition) {
    passed++;
  } else {
    failed++;
    failures.push(message);
    console.error(`  FAIL: ${message}`);
  }
}

function section(name: string): void {
  console.log(`\n── ${name} ──`);
}

// ═══════════════════════════════════════
// 1. Command Catalog
// ═══════════════════════════════════════

import {
  COMMAND_CATALOG,
  LONG_RUNNING_COMMANDS,
  SERVER_SIDE_COMMANDS,
  ALL_COMMAND_TYPES,
} from '../src/schema/command-catalog.js';

section('Command Catalog');

assert(Object.keys(COMMAND_CATALOG).length > 170, `Catalog has ${Object.keys(COMMAND_CATALOG).length} commands (expected >170)`);
assert(ALL_COMMAND_TYPES.includes('ping'), 'ping command exists');
assert(ALL_COMMAND_TYPES.includes('create'), 'create command exists');
assert(ALL_COMMAND_TYPES.includes('modify'), 'modify command exists');
assert(ALL_COMMAND_TYPES.includes('query'), 'query command exists');
assert(ALL_COMMAND_TYPES.includes('createDesignSystem'), 'createDesignSystem command exists');
assert(ALL_COMMAND_TYPES.includes('extractWebsiteCSS'), 'extractWebsiteCSS command exists');
assert(ALL_COMMAND_TYPES.includes('extractWebsiteLayout'), 'extractWebsiteLayout command exists');
assert(ALL_COMMAND_TYPES.includes('createShapeWithText'), 'createShapeWithText command exists');
assert(ALL_COMMAND_TYPES.includes('setRangeFontName'), 'setRangeFontName command exists');

// Check catalog metadata
const createCmd = COMMAND_CATALOG['create'];
assert(createCmd.category === 'core', 'create is in core category');
assert(createCmd.returnsNodeId === true, 'create returns nodeId');
assert(createCmd.payloadSchema.type === 'object', 'create has object payload schema');
assert(Array.isArray(createCmd.payloadSchema.required), 'create has required fields');
assert(createCmd.payloadSchema.required!.includes('nodeType'), 'create requires nodeType');

const modifyCmd = COMMAND_CATALOG['modify'];
assert(modifyCmd.requiresTarget === true, 'modify requires target');

// Long-running commands
assert(LONG_RUNNING_COMMANDS.has('createDesignSystem'), 'createDesignSystem is long-running');
assert(LONG_RUNNING_COMMANDS.has('extractDesignTokens'), 'extractDesignTokens is long-running');
assert(LONG_RUNNING_COMMANDS.has('extractWebsiteCSS'), 'extractWebsiteCSS is long-running');
assert(!LONG_RUNNING_COMMANDS.has('ping'), 'ping is NOT long-running');

// Server-side commands
assert(SERVER_SIDE_COMMANDS.has('extractWebsiteCSS'), 'extractWebsiteCSS is server-side');
assert(SERVER_SIDE_COMMANDS.has('extractWebsiteLayout'), 'extractWebsiteLayout is server-side');
assert(!SERVER_SIDE_COMMANDS.has('create'), 'create is NOT server-side');

// Check all keys match types
for (const [key, meta] of Object.entries(COMMAND_CATALOG)) {
  if (key !== meta.type) {
    assert(false, `Key "${key}" does not match type "${meta.type}"`);
  }
}
assert(true, 'All catalog keys match their type field');

console.log(`  ${Object.keys(COMMAND_CATALOG).length} commands cataloged`);

// ═══════════════════════════════════════
// 2. Catalog Validation
// ═══════════════════════════════════════

import { validateCatalog, generateCatalog } from '../src/schema/generator.js';

section('Catalog Validation');

const validation = validateCatalog();
assert(validation.valid, `Catalog validation passed (${validation.errors.length} errors)`);
if (!validation.valid) {
  for (const e of validation.errors.slice(0, 5)) {
    console.error(`    ${e}`);
  }
}

const catalog = generateCatalog();
assert(catalog.version === '1.0.0', 'Catalog version is 1.0.0');
assert(catalog.commandCount === Object.keys(COMMAND_CATALOG).length, 'Generated catalog count matches');
assert(typeof catalog.generatedAt === 'string', 'Generated catalog has timestamp');

// ═══════════════════════════════════════
// 3. Tool Groups
// ═══════════════════════════════════════

import {
  CORE_GROUP,
  VARIABLES_GROUP,
  DESIGN_SYSTEM_GROUP,
  WEBSITE_GROUP,
  FIGJAM_GROUP,
  ALL_GROUPS,
  getGroup,
  mergeGroups,
} from '../src/tools/tool-groups.js';

section('Tool Groups');

assert(CORE_GROUP.types!.length >= 20, `Core group has ${CORE_GROUP.types!.length} tools (expected ≥20)`);
assert(VARIABLES_GROUP.types!.length >= 20, `Variables group has ${VARIABLES_GROUP.types!.length} tools (expected ≥20)`);
assert(DESIGN_SYSTEM_GROUP.types!.length >= 10, `Design system group has ${DESIGN_SYSTEM_GROUP.types!.length} tools`);
assert(WEBSITE_GROUP.types!.length === 2, 'Website group has exactly 2 tools');
assert(FIGJAM_GROUP.types!.includes('createShapeWithText'), 'FigJam group includes createShapeWithText');
assert(FIGJAM_GROUP.types!.includes('createConnector'), 'FigJam group includes createConnector');
assert(FIGJAM_GROUP.types!.includes('measureText'), 'FigJam group includes measureText');

assert(ALL_GROUPS.length === 8, `8 predefined groups (got ${ALL_GROUPS.length})`);
assert(getGroup('core') === CORE_GROUP, 'getGroup("core") works');
assert(getGroup('nonexistent') === undefined, 'getGroup returns undefined for unknown');

const merged = mergeGroups(CORE_GROUP, WEBSITE_GROUP);
assert(merged.includes('ping'), 'Merged groups include core tools');
assert(merged.includes('extractWebsiteCSS'), 'Merged groups include website tools');
assert(new Set(merged).size === merged.length, 'Merged groups have no duplicates');

// ═══════════════════════════════════════
// 4. Bridge Client (construction only — no server)
// ═══════════════════════════════════════

import { BridgeClient } from '../src/client/bridge-client.js';
import { getConfig, setConfig, resetConfig } from '../src/utils/config.js';

section('Bridge Client & Config');

const config = getConfig();
assert(config.bridgeUrl === 'http://localhost:4001', 'Default bridge URL');
assert(config.defaultTimeout === 30000, 'Default timeout is 30s');
assert(config.longRunningTimeout === 300000, 'Long-running timeout is 300s');

setConfig({ bridgeUrl: 'http://custom:9999' });
assert(getConfig().bridgeUrl === 'http://custom:9999', 'setConfig works');
resetConfig();
assert(getConfig().bridgeUrl === 'http://localhost:4001', 'resetConfig works');

const client = new BridgeClient();
assert(client instanceof BridgeClient, 'BridgeClient constructs');

const customClient = new BridgeClient({
  bridgeUrl: 'http://other:5000',
  defaultTimeout: 10000,
});
assert(customClient instanceof BridgeClient, 'BridgeClient with options constructs');

// ═══════════════════════════════════════
// 5. Tool Registry
// ═══════════════════════════════════════

import { createToolDefinitions, createToolRegistry } from '../src/tools/tool-registry.js';

section('Tool Registry');

const allTools = createToolDefinitions(client);
assert(allTools.length === Object.keys(COMMAND_CATALOG).length, `All ${allTools.length} tools created`);

const coreTool = allTools.find((t) => t.name === 'create');
assert(coreTool !== undefined, 'create tool exists');
assert(coreTool!.category === 'core', 'create tool category is core');
assert(typeof coreTool!.execute === 'function', 'create tool has execute function');
assert(coreTool!.parameters.type === 'object', 'create tool has object parameters');
assert(coreTool!.parameters.required?.includes('nodeType'), 'create tool requires nodeType');

// Filtered creation
const coreTools = createToolDefinitions(client, { types: CORE_GROUP.types });
assert(coreTools.length === CORE_GROUP.types!.length, `Core-filtered: ${coreTools.length} tools`);

const varTools = createToolDefinitions(client, { categories: ['variables'] });
assert(varTools.length > 0, `Variables-filtered: ${varTools.length} tools`);
assert(varTools.every((t) => t.category === 'variables'), 'All filtered tools are variables category');

// Registry (Map)
const registry = createToolRegistry(client, { types: ['ping', 'create'] });
assert(registry.size === 2, 'Registry has 2 tools');
assert(registry.has('ping'), 'Registry has ping');
assert(registry.has('create'), 'Registry has create');
assert(!registry.has('modify'), 'Registry does not have modify');

// Test that requiresTarget commands get a target parameter
const modifyTool = allTools.find((t) => t.name === 'modify');
assert(modifyTool!.parameters.properties['target'] !== undefined, 'modify tool has target parameter');
assert(modifyTool!.parameters.required?.includes('target'), 'modify tool requires target');

const pingTool = allTools.find((t) => t.name === 'ping');
assert(pingTool!.parameters.properties['target'] === undefined, 'ping tool does NOT have target parameter');

// ═══════════════════════════════════════
// 6. Format Adapters
// ═══════════════════════════════════════

import { toOpenAITools } from '../src/tools/formats/openai-tools.js';
import { toAnthropicTools } from '../src/tools/formats/anthropic-tools.js';
import { toGenericTools } from '../src/tools/formats/generic-tools.js';

section('Format Adapters');

const sampleTools = createToolDefinitions(client, { types: ['create', 'ping', 'modify'] });

// OpenAI format
const openaiTools = toOpenAITools(sampleTools);
assert(openaiTools.length === 3, 'OpenAI: 3 tools');
assert(openaiTools[0].type === 'function', 'OpenAI: type is function');
assert(typeof openaiTools[0].function.name === 'string', 'OpenAI: has function name');
assert(typeof openaiTools[0].function.description === 'string', 'OpenAI: has description');
assert(typeof openaiTools[0].function.parameters === 'object', 'OpenAI: has parameters');

// Anthropic format
const anthropicTools = toAnthropicTools(sampleTools);
assert(anthropicTools.length === 3, 'Anthropic: 3 tools');
assert(typeof anthropicTools[0].name === 'string', 'Anthropic: has name');
assert(typeof anthropicTools[0].description === 'string', 'Anthropic: has description');
assert(anthropicTools[0].input_schema.type === 'object', 'Anthropic: input_schema is object');

// Generic format
const genericTools = toGenericTools(sampleTools);
assert(genericTools.length === 3, 'Generic: 3 tools');
assert(typeof genericTools[0].metadata === 'object', 'Generic: has metadata');
assert(typeof genericTools[0].metadata.category === 'string', 'Generic: has category in metadata');

// ═══════════════════════════════════════
// 7. JSON Schema to Zod
// ═══════════════════════════════════════

import { jsonSchemaToZod } from '../src/utils/json-schema-to-zod.js';
import { z } from 'zod';

section('JSON Schema → Zod');

// String
const strSchema = jsonSchemaToZod({ type: 'string', description: 'test' });
const strResult = strSchema.safeParse('hello');
assert(strResult.success, 'Zod: string parses string');
const strFail = strSchema.safeParse(123);
assert(!strFail.success, 'Zod: string rejects number');

// Number
const numSchema = jsonSchemaToZod({ type: 'number' });
assert(numSchema.safeParse(42).success, 'Zod: number parses number');
assert(!numSchema.safeParse('abc').success, 'Zod: number rejects string');

// Boolean
const boolSchema = jsonSchemaToZod({ type: 'boolean' });
assert(boolSchema.safeParse(true).success, 'Zod: boolean parses boolean');

// Enum
const enumSchema = jsonSchemaToZod({ type: 'string', enum: ['A', 'B', 'C'] });
assert(enumSchema.safeParse('A').success, 'Zod: enum accepts valid value');
assert(!enumSchema.safeParse('D').success, 'Zod: enum rejects invalid value');

// Array
const arrSchema = jsonSchemaToZod({ type: 'array', items: { type: 'string' } });
assert(arrSchema.safeParse(['a', 'b']).success, 'Zod: array parses string array');
assert(!arrSchema.safeParse([1, 2]).success, 'Zod: array rejects number array');

// Object with required
const objSchema = jsonSchemaToZod({
  type: 'object',
  properties: {
    name: { type: 'string' },
    age: { type: 'number' },
  },
  required: ['name'],
});
assert(objSchema.safeParse({ name: 'Alice' }).success, 'Zod: object with required only');
assert(objSchema.safeParse({ name: 'Bob', age: 30 }).success, 'Zod: object with optional');
assert(!objSchema.safeParse({ age: 30 }).success, 'Zod: object rejects missing required');

// Nested object
const nestedSchema = jsonSchemaToZod({
  type: 'object',
  properties: {
    color: {
      type: 'object',
      properties: {
        r: { type: 'number' },
        g: { type: 'number' },
        b: { type: 'number' },
      },
      required: ['r', 'g', 'b'],
    },
  },
  required: ['color'],
});
assert(
  nestedSchema.safeParse({ color: { r: 1, g: 0, b: 0 } }).success,
  'Zod: nested object parses'
);

// ═══════════════════════════════════════
// 8. Transform Functions
// ═══════════════════════════════════════

import { detectBrandColor } from '../src/workflows/steps/detect-brand-color.js';
import { classifyColors } from '../src/workflows/steps/classify-colors.js';
import { generateColorScales, generateScale } from '../src/workflows/steps/generate-color-scales.js';

section('Transform Functions');

// detectBrandColor
const brandResult = await detectBrandColor(
  {
    colors: [
      { hex: '#ff6d38', count: 15 }, // Orange — high saturation, high count
      { hex: '#3b82f6', count: 8 },  // Blue — high saturation
      { hex: '#cccccc', count: 50 }, // Gray — should be filtered
      { hex: '#000000', count: 100 }, // Black — should be filtered
      { hex: '#22c55e', count: 5 },  // Green — lower count
    ],
  },
  { outputs: {}, config: {}, cancelled: false }
);
assert(brandResult.primary === '#ff6d38', `Brand primary: ${brandResult.primary} (expected #ff6d38)`);
assert(brandResult.secondary !== null, 'Brand secondary detected');
assert(brandResult.tertiary !== null, 'Brand tertiary detected');
assert(brandResult.allScored.length === 3, `Scored ${brandResult.allScored.length} non-neutral colors (expected 3)`);
assert(
  !brandResult.allScored.some((c) => c.hex === '#cccccc' || c.hex === '#000000'),
  'Neutrals filtered out'
);

// classifyColors
const classResult = await classifyColors(
  {
    colors: ['#ff6d38', '#3b82f6', '#cccccc', '#000000', '#ffffff', '#eeeeee'],
  },
  { outputs: {}, config: {}, cancelled: false }
);
assert(classResult.brand.includes('#ff6d38'), 'Orange classified as brand');
assert(classResult.brand.includes('#3b82f6'), 'Blue classified as brand');
assert(classResult.neutral.includes('#cccccc'), 'Gray classified as neutral');
assert(classResult.neutral.includes('#eeeeee'), 'Light gray classified as neutral');
assert(classResult.system.includes('#000000'), 'Black classified as system');
assert(classResult.system.includes('#ffffff'), 'White classified as system');

// generateScale
const scale = generateScale('#3b82f6');
assert(Object.keys(scale).length === 11, `Scale has ${Object.keys(scale).length} steps (expected 11)`);
assert(scale['50'] !== undefined, 'Scale has step 50');
assert(scale['500'] !== undefined, 'Scale has step 500');
assert(scale['950'] !== undefined, 'Scale has step 950');
assert(scale['50'].startsWith('#'), 'Scale values are hex strings');
// Step 50 should be lighter than step 500 which should be lighter than step 950
// We can check that by comparing the lightness (rough check via hex values)

// generateColorScales
const scalesResult = await generateColorScales(
  { colors: { primary: '#ff6d38', secondary: '#3b82f6' } },
  { outputs: {}, config: {}, cancelled: false }
);
assert(scalesResult['primary'] !== undefined, 'Primary scale generated');
assert(scalesResult['secondary'] !== undefined, 'Secondary scale generated');
assert(Object.keys(scalesResult['primary']).length === 11, 'Primary scale has 11 steps');

// ═══════════════════════════════════════
// 9. Workflow Registry
// ═══════════════════════════════════════

import {
  getWorkflow,
  listWorkflows,
  getWorkflowIds,
  registerWorkflow,
} from '../src/workflows/workflow-registry.js';

section('Workflow Registry');

const workflows = listWorkflows();
assert(workflows.length === 5, `5 built-in workflows (got ${workflows.length})`);

const ids = getWorkflowIds();
assert(ids.includes('design-system-from-file'), 'design-system-from-file registered');
assert(ids.includes('design-system-from-website'), 'design-system-from-website registered');
assert(ids.includes('variable-binding'), 'variable-binding registered');
assert(ids.includes('engineering-handoff'), 'engineering-handoff registered');
assert(ids.includes('figjam-workflow'), 'figjam-workflow registered');

const dsWorkflow = getWorkflow('design-system-from-file');
assert(dsWorkflow !== undefined, 'Can retrieve design-system-from-file');
assert(dsWorkflow!.phases.length === 4, `design-system-from-file has ${dsWorkflow!.phases.length} phases (expected 4)`);
assert(dsWorkflow!.requiredToolGroups.includes('design-system'), 'Requires design-system tools');
assert(typeof dsWorkflow!.systemInstruction === 'string', 'Has system instruction');
assert(Array.isArray(dsWorkflow!.rules), 'Has rules array');

const wsWorkflow = getWorkflow('design-system-from-website');
assert(wsWorkflow!.phases.length === 4, 'Website workflow has 4 phases');
assert(wsWorkflow!.requiredToolGroups.includes('website'), 'Website workflow requires website tools');

// Custom workflow registration
registerWorkflow({
  id: 'test-custom',
  name: 'Test Custom Workflow',
  description: 'Test',
  systemInstruction: 'Test',
  requiredToolGroups: ['core'],
  phases: [],
});
assert(getWorkflow('test-custom') !== undefined, 'Custom workflow registered');
assert(listWorkflows().length === 6, 'Custom workflow added to list');

// ═══════════════════════════════════════
// 10. Workflow Engine (mock client)
// ═══════════════════════════════════════

import { executeWorkflow } from '../src/workflows/workflow-engine.js';
import type { WorkflowDefinition } from '../src/workflows/workflow-schema.js';

section('Workflow Engine');

// Create a mock client that records calls
const mockCalls: Array<{ type: string; payload: unknown; target?: string }> = [];
const mockClient = {
  execute: async (type: string, payload?: Record<string, unknown>, target?: string) => {
    mockCalls.push({ type, payload, target });
    return {
      success: true,
      commandId: 'mock-id',
      data: { mockResult: true, type },
      timestamp: Date.now(),
    };
  },
} as unknown as BridgeClient;

// Simple workflow with command steps
const simpleWorkflow: WorkflowDefinition = {
  id: 'test-simple',
  name: 'Test Simple',
  description: 'Test',
  systemInstruction: 'Test',
  requiredToolGroups: ['core'],
  phases: [
    {
      id: 'phase1',
      name: 'Phase 1',
      steps: [
        {
          type: 'command',
          id: 'step1',
          description: 'First command',
          command: 'ping',
          payload: {},
          outputKey: 'pingResult',
        },
        {
          type: 'command',
          id: 'step2',
          description: 'Second command',
          command: 'getFrames',
          payload: {},
          outputKey: 'frames',
        },
      ],
    },
  ],
};

mockCalls.length = 0;
const simpleResult = await executeWorkflow(simpleWorkflow, { client: mockClient });
assert(mockCalls.length === 2, `Simple workflow: ${mockCalls.length} commands executed (expected 2)`);
assert(mockCalls[0].type === 'ping', 'First command was ping');
assert(mockCalls[1].type === 'getFrames', 'Second command was getFrames');
assert(simpleResult.outputs['pingResult'] !== undefined, 'pingResult stored in outputs');
assert(simpleResult.outputs['frames'] !== undefined, 'frames stored in outputs');
assert(simpleResult.cancelled === false, 'Workflow not cancelled');

// Workflow with transform step
const transformWorkflow: WorkflowDefinition = {
  id: 'test-transform',
  name: 'Test Transform',
  description: 'Test',
  systemInstruction: 'Test',
  requiredToolGroups: [],
  phases: [
    {
      id: 'phase1',
      name: 'Phase 1',
      steps: [
        {
          type: 'transform',
          id: 'detect',
          description: 'Detect brand color',
          function: 'detectBrandColor',
          input: {
            colors: [
              { hex: '#ff0000', count: 10 },
              { hex: '#aaaaaa', count: 20 },
            ],
          },
          outputKey: 'brandColors',
        },
      ],
    },
  ],
};

const transformResult = await executeWorkflow(transformWorkflow, { client: mockClient });
const brandOut = transformResult.outputs['brandColors'] as { primary: string };
assert(brandOut.primary === '#ff0000', `Transform output: ${brandOut.primary} (expected #ff0000)`);

// Workflow with LLM decision step
const llmWorkflow: WorkflowDefinition = {
  id: 'test-llm',
  name: 'Test LLM',
  description: 'Test',
  systemInstruction: 'Test',
  requiredToolGroups: [],
  phases: [
    {
      id: 'phase1',
      name: 'Phase 1',
      steps: [
        {
          type: 'llm-decision',
          id: 'decide',
          description: 'Make a decision',
          prompt: 'Choose something',
          outputKey: 'decision',
        },
      ],
    },
  ],
};

const llmResult = await executeWorkflow(llmWorkflow, {
  client: mockClient,
  llmHandler: async (prompt) => {
    assert(prompt === 'Choose something', 'LLM handler receives correct prompt');
    return 'four-level';
  },
});
assert(llmResult.outputs['decision'] === 'four-level', 'LLM decision stored');

// Test that missing LLM handler throws
let llmError = false;
try {
  await executeWorkflow(llmWorkflow, { client: mockClient });
} catch (e) {
  llmError = true;
  assert(
    (e as Error).message.includes('LLM handler required'),
    'Correct error for missing LLM handler'
  );
}
assert(llmError, 'Missing LLM handler throws error');

// Workflow with template resolution
const templateWorkflow: WorkflowDefinition = {
  id: 'test-template',
  name: 'Test Template',
  description: 'Test',
  systemInstruction: 'Test',
  requiredToolGroups: [],
  phases: [
    {
      id: 'phase1',
      name: 'Phase 1',
      steps: [
        {
          type: 'command',
          id: 'step1',
          description: 'Get data',
          command: 'query',
          payload: { queryType: 'node' },
          target: 'node123',
          outputKey: 'queryResult',
        },
        {
          type: 'command',
          id: 'step2',
          description: 'Use prior output',
          command: 'modify',
          payload: { name: '${queryResult.data.type}' },
          target: '${config.targetId}',
          outputKey: 'modifyResult',
        },
      ],
    },
  ],
};

mockCalls.length = 0;
const templateResult = await executeWorkflow(templateWorkflow, {
  client: mockClient,
  initialConfig: { targetId: 'configured-node' },
});
assert(mockCalls[1].target === 'configured-node', 'Template resolved config value');
assert(
  (mockCalls[1].payload as Record<string, unknown>).name === 'query',
  'Template resolved prior step output'
);

// Step callback
let callbackCount = 0;
await executeWorkflow(simpleWorkflow, {
  client: mockClient,
  onStepComplete: () => {
    callbackCount++;
  },
});
assert(callbackCount === 2, `Step callback called ${callbackCount} times (expected 2)`);

// ═══════════════════════════════════════
// 11. Tool Executor
// ═══════════════════════════════════════

import { executeToolCall, executeToolCalls } from '../src/tools/tool-executor.js';

section('Tool Executor');

// Unknown tool
const unknownResult = await executeToolCall(
  { name: 'nonexistent', arguments: {} },
  registry
);
assert(unknownResult.success === false, 'Unknown tool returns failure');
assert(unknownResult.content.includes('Unknown tool'), 'Unknown tool error message');

// Invalid JSON arguments
const invalidResult = await executeToolCall(
  { name: 'ping', arguments: 'not json{{{' },
  registry
);
assert(invalidResult.success === false, 'Invalid JSON returns failure');
assert(invalidResult.content.includes('Invalid JSON'), 'Invalid JSON error message');

// Parallel execution
const parallelResults = await executeToolCalls(
  [
    { name: 'nonexistent', arguments: {} },
    { name: 'nonexistent2', arguments: {} },
  ],
  registry
);
assert(parallelResults.length === 2, 'Parallel execution returns 2 results');

// ═══════════════════════════════════════
// 12. Adapter Construction
// ═══════════════════════════════════════

import { OpenAIAdapter } from '../src/adapters/openai/openai-adapter.js';
import { AnthropicAdapter } from '../src/adapters/anthropic/anthropic-adapter.js';
import { AdkAdapter } from '../src/adapters/adk/adk-adapter.js';
import { GenericAdapter } from '../src/adapters/generic/generic-adapter.js';

section('LLM Adapters (Construction)');

const openai = new OpenAIAdapter({ model: 'gpt-4o', apiKey: 'test-key' });
assert(openai.provider === 'openai', 'OpenAI adapter provider');
openai.setTools(sampleTools);

const anthropic = new AnthropicAdapter({ model: 'claude-sonnet-4-6', apiKey: 'test-key' });
assert(anthropic.provider === 'anthropic', 'Anthropic adapter provider');
anthropic.setTools(sampleTools);

const adk = new AdkAdapter({ model: 'gemini-2.0-flash', apiKey: 'test-key' });
assert(adk.provider === 'google-adk', 'ADK adapter provider');
adk.setTools(sampleTools);

const generic = new GenericAdapter({
  endpoint: 'http://example.com/api',
  headers: { Authorization: 'Bearer test' },
  format: {
    buildRequest: (msgs, tools) => ({ messages: msgs, tools }),
    parseResponse: () => ({
      content: 'test',
      toolCalls: [],
      done: true,
    }),
  },
});
assert(generic.provider === 'generic', 'Generic adapter provider');
generic.setTools(sampleTools);

// ═══════════════════════════════════════
// 13. Public API Exports
// ═══════════════════════════════════════

import * as api from '../src/index.js';

section('Public API Exports');

// Verify key exports exist
assert(typeof api.BridgeClient === 'function', 'BridgeClient exported');
assert(typeof api.createToolDefinitions === 'function', 'createToolDefinitions exported');
assert(typeof api.createToolRegistry === 'function', 'createToolRegistry exported');
assert(typeof api.executeToolCall === 'function', 'executeToolCall exported');
assert(typeof api.executeToolCalls === 'function', 'executeToolCalls exported');
assert(typeof api.toOpenAITools === 'function', 'toOpenAITools exported');
assert(typeof api.toAnthropicTools === 'function', 'toAnthropicTools exported');
assert(typeof api.toAdkFunctions === 'function', 'toAdkFunctions exported');
assert(typeof api.toGenericTools === 'function', 'toGenericTools exported');
assert(typeof api.executeWorkflow === 'function', 'executeWorkflow exported');
assert(typeof api.getWorkflow === 'function', 'getWorkflow exported');
assert(typeof api.registerWorkflow === 'function', 'registerWorkflow exported');
assert(typeof api.listWorkflows === 'function', 'listWorkflows exported');
assert(typeof api.detectBrandColor === 'function', 'detectBrandColor exported');
assert(typeof api.classifyColors === 'function', 'classifyColors exported');
assert(typeof api.generateColorScales === 'function', 'generateColorScales exported');
assert(typeof api.generateScale === 'function', 'generateScale exported');
assert(typeof api.jsonSchemaToZod === 'function', 'jsonSchemaToZod exported');
assert(typeof api.OpenAIAdapter === 'function', 'OpenAIAdapter exported');
assert(typeof api.AnthropicAdapter === 'function', 'AnthropicAdapter exported');
assert(typeof api.AdkAdapter === 'function', 'AdkAdapter exported');
assert(typeof api.GenericAdapter === 'function', 'GenericAdapter exported');
assert(typeof api.getConfig === 'function', 'getConfig exported');
assert(typeof api.setConfig === 'function', 'setConfig exported');
assert(typeof api.COMMAND_CATALOG === 'object', 'COMMAND_CATALOG exported');
assert(typeof api.CORE_GROUP === 'object', 'CORE_GROUP exported');
assert(typeof api.ALL_GROUPS === 'object', 'ALL_GROUPS exported');
assert(typeof api.validateCatalog === 'function', 'validateCatalog exported');

// ═══════════════════════════════════════
// Results
// ═══════════════════════════════════════

console.log('\n══════════════════════════════');
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failures.length > 0) {
  console.log('\nFailures:');
  for (const f of failures) {
    console.log(`  ✗ ${f}`);
  }
}
console.log('══════════════════════════════\n');

process.exit(failed > 0 ? 1 : 0);
