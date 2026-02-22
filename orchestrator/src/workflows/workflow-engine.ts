/**
 * Workflow Engine: executes multi-step workflow definitions.
 * Routes each step type to the appropriate handler.
 */

import type {
  WorkflowDefinition,
  WorkflowStep,
  WorkflowContext,
  CommandStep,
  TransformStep,
  LlmDecisionStep,
  ConditionalStep,
  LoopStep,
} from './workflow-schema.js';
import type { BridgeClient } from '../client/bridge-client.js';
import { TRANSFORM_FUNCTIONS } from './steps/index.js';

export type LlmHandler = (
  prompt: string,
  context: WorkflowContext
) => Promise<string>;

export type StepCallback = (
  step: WorkflowStep,
  result: unknown,
  context: WorkflowContext
) => void;

export interface WorkflowEngineOptions {
  /** Bridge client for executing commands */
  client: BridgeClient;
  /** Handler for LLM decision steps */
  llmHandler?: LlmHandler;
  /** Called after each step completes */
  onStepComplete?: StepCallback;
  /** Initial configuration values */
  initialConfig?: Record<string, unknown>;
}

/**
 * Resolve template references in a value.
 * Supports ${stepId.field} syntax to reference prior step outputs.
 */
function resolveTemplates(
  value: unknown,
  context: WorkflowContext
): unknown {
  if (typeof value === 'string') {
    return value.replace(/\$\{([^}]+)\}/g, (_, path: string) => {
      const parts = path.split('.');
      const root = parts[0];

      // Resolve from context root: config.*, outputs.*, or direct output key
      let current: unknown;
      if (root === 'config') {
        current = context.config;
        parts.shift(); // consume 'config'
      } else {
        current = context.outputs;
      }

      for (const part of parts) {
        if (current == null || typeof current !== 'object') return '';
        current = (current as Record<string, unknown>)[part];
      }

      return current != null ? String(current) : '';
    });
  }

  if (Array.isArray(value)) {
    return value.map((v) => resolveTemplates(v, context));
  }

  if (value != null && typeof value === 'object') {
    const resolved: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      resolved[k] = resolveTemplates(v, context);
    }
    return resolved;
  }

  return value;
}

/**
 * Execute a single command step.
 */
async function executeCommandStep(
  step: CommandStep,
  client: BridgeClient,
  context: WorkflowContext
): Promise<unknown> {
  const payload = step.payload
    ? (resolveTemplates(step.payload, context) as Record<string, unknown>)
    : undefined;
  const target = step.target
    ? (resolveTemplates(step.target, context) as string)
    : undefined;

  const result = await client.execute(step.command, payload, target, {
    timeout: step.longRunning ? 300000 : undefined,
  });

  if (step.outputKey) {
    context.outputs[step.outputKey] = result;
  }

  return result;
}

/**
 * Execute a transform step.
 */
async function executeTransformStep(
  step: TransformStep,
  context: WorkflowContext
): Promise<unknown> {
  const fn = TRANSFORM_FUNCTIONS.get(step.function);
  if (!fn) {
    throw new Error(`Unknown transform function: ${step.function}`);
  }

  const input = resolveTemplates(step.input, context) as Record<
    string,
    unknown
  >;
  const result = await fn(input, context);

  context.outputs[step.outputKey] = result;
  return result;
}

/**
 * Execute an LLM decision step.
 */
async function executeLlmDecisionStep(
  step: LlmDecisionStep,
  llmHandler: LlmHandler | undefined,
  context: WorkflowContext
): Promise<unknown> {
  if (!llmHandler) {
    throw new Error(
      `LLM handler required for step "${step.id}" but none provided`
    );
  }

  const prompt = resolveTemplates(step.prompt, context) as string;
  const decision = await llmHandler(prompt, context);

  context.outputs[step.outputKey] = decision;
  return decision;
}

/**
 * Execute a conditional step.
 */
async function executeConditionalStep(
  step: ConditionalStep,
  options: WorkflowEngineOptions,
  context: WorkflowContext
): Promise<unknown> {
  const conditionStr = resolveTemplates(step.condition, context) as string;

  // Simple condition evaluation: check truthiness of a context value
  const parts = conditionStr.split('.');
  let value: unknown = context.outputs;
  for (const part of parts) {
    if (value == null || typeof value !== 'object') break;
    value = (value as Record<string, unknown>)[part];
  }

  const branch = value ? step.thenSteps : (step.elseSteps ?? []);

  let lastResult: unknown;
  for (const s of branch) {
    if (context.cancelled) break;
    lastResult = await executeStep(s, options, context);
  }

  return lastResult;
}

/**
 * Execute a loop step.
 */
async function executeLoopStep(
  step: LoopStep,
  options: WorkflowEngineOptions,
  context: WorkflowContext
): Promise<unknown> {
  const collectionRef = resolveTemplates(step.collection, context);
  const collection = Array.isArray(collectionRef) ? collectionRef : [];

  const results: unknown[] = [];

  for (const item of collection) {
    if (context.cancelled) break;

    context.outputs[step.itemVariable] = item;

    let lastResult: unknown;
    for (const s of step.steps) {
      if (context.cancelled) break;
      lastResult = await executeStep(s, options, context);
    }
    results.push(lastResult);
  }

  return results;
}

/**
 * Execute a single workflow step (dispatcher).
 */
async function executeStep(
  step: WorkflowStep,
  options: WorkflowEngineOptions,
  context: WorkflowContext
): Promise<unknown> {
  let result: unknown;

  switch (step.type) {
    case 'command':
      result = await executeCommandStep(step, options.client, context);
      break;
    case 'transform':
      result = await executeTransformStep(step, context);
      break;
    case 'llm-decision':
      result = await executeLlmDecisionStep(
        step,
        options.llmHandler,
        context
      );
      break;
    case 'conditional':
      result = await executeConditionalStep(step, options, context);
      break;
    case 'loop':
      result = await executeLoopStep(step, options, context);
      break;
    default:
      throw new Error(`Unknown step type: ${(step as { type: string }).type}`);
  }

  options.onStepComplete?.(step, result, context);
  return result;
}

/**
 * Execute a complete workflow definition.
 */
export async function executeWorkflow(
  workflow: WorkflowDefinition,
  options: WorkflowEngineOptions
): Promise<WorkflowContext> {
  const context: WorkflowContext = {
    outputs: {},
    config: options.initialConfig ?? {},
    cancelled: false,
  };

  for (const phase of workflow.phases) {
    if (context.cancelled) break;

    for (const step of phase.steps) {
      if (context.cancelled) break;
      await executeStep(step, options, context);
    }
  }

  return context;
}
