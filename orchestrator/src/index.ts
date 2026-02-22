/**
 * @figma-claude-bridge/orchestrator
 *
 * LLM-agnostic orchestrator for the Figma Bridge.
 * Lets any LLM with function calling drive the same bridge server.
 */

// ── Configuration ──
export { getConfig, setConfig, resetConfig, type OrchestratorConfig } from './utils/config.js';

// ── Bridge Client ──
export { BridgeClient, type BridgeClientOptions, type SendResult, type HealthStatus } from './client/bridge-client.js';
export { pollForResult, checkStatus, type PollOptions, type PollResult } from './client/result-poller.js';

// ── Command Catalog ──
export {
  COMMAND_CATALOG,
  LONG_RUNNING_COMMANDS,
  SERVER_SIDE_COMMANDS,
  ALL_COMMAND_TYPES,
  type CommandMeta,
  type CommandCategory,
  type CommandSchema,
  type JsonSchemaProperty,
} from './schema/command-catalog.js';
export { generateCatalog, validateCatalog, type GeneratedCatalog } from './schema/generator.js';

// ── Tool Registry ──
export {
  createToolDefinitions,
  createToolRegistry,
  type ToolDefinition,
  type ToolParameters,
} from './tools/tool-registry.js';
export {
  executeToolCall,
  executeToolCalls,
  type ToolCallRequest,
  type ToolCallResult,
} from './tools/tool-executor.js';

// ── Tool Groups ──
export {
  CORE_GROUP,
  VARIABLES_GROUP,
  DESIGN_SYSTEM_GROUP,
  STYLES_GROUP,
  COMPONENTS_GROUP,
  TEXT_GROUP,
  WEBSITE_GROUP,
  FIGJAM_GROUP,
  ALL_GROUPS,
  getGroup,
  mergeGroups,
  type ToolGroup,
} from './tools/tool-groups.js';

// ── Format Adapters ──
export { toOpenAITools, toOpenAITool, type OpenAITool } from './tools/formats/openai-tools.js';
export { toAnthropicTools, toAnthropicTool, type AnthropicTool } from './tools/formats/anthropic-tools.js';
export { toAdkFunctions, toAdkFunction, type AdkFunctionDef } from './tools/formats/adk-tools.js';
export { toGenericTools, type GenericTool } from './tools/formats/generic-tools.js';

// ── Workflows ──
export {
  type WorkflowDefinition,
  type WorkflowPhase,
  type WorkflowStep,
  type CommandStep,
  type TransformStep,
  type LlmDecisionStep,
  type ConditionalStep,
  type LoopStep,
  type WorkflowContext,
} from './workflows/workflow-schema.js';
export { executeWorkflow, type WorkflowEngineOptions, type LlmHandler, type StepCallback } from './workflows/workflow-engine.js';
export { getWorkflow, registerWorkflow, listWorkflows, getWorkflowIds } from './workflows/workflow-registry.js';

// ── Transform Functions ──
export { detectBrandColor } from './workflows/steps/detect-brand-color.js';
export { classifyColors, type ColorClassification } from './workflows/steps/classify-colors.js';
export { generateColorScales, generateScale, type ColorScale } from './workflows/steps/generate-color-scales.js';

// ── LLM Adapters ──
export {
  type LlmAdapter,
  type Message,
  type ToolCall,
  type LlmResponse,
  type RunOptions,
} from './adapters/base-adapter.js';
export { OpenAIAdapter, type OpenAIAdapterOptions } from './adapters/openai/openai-adapter.js';
export { AnthropicAdapter, type AnthropicAdapterOptions } from './adapters/anthropic/anthropic-adapter.js';
export { AdkAdapter, type AdkAdapterOptions } from './adapters/adk/adk-adapter.js';
export { GenericAdapter, type GenericAdapterOptions, type FormatAdapter } from './adapters/generic/generic-adapter.js';

// ── Utilities ──
export { jsonSchemaToZod } from './utils/json-schema-to-zod.js';
