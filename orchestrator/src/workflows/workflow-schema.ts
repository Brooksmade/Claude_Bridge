/**
 * TypeScript interfaces for workflow YAML definitions.
 * Workflows are portable, LLM-agnostic descriptions of multi-step pipelines.
 */

/**
 * Top-level workflow definition.
 */
export interface WorkflowDefinition {
  /** Unique workflow identifier */
  id: string;
  /** Human-readable name */
  name: string;
  /** Description of what the workflow does */
  description: string;
  /** System instruction for the LLM when running this workflow */
  systemInstruction: string;
  /** Tool groups required by this workflow */
  requiredToolGroups: string[];
  /** Phases of the workflow (executed sequentially) */
  phases: WorkflowPhase[];
  /** Rules/guidelines for the LLM */
  rules?: string[];
}

/**
 * A phase is a named group of steps.
 */
export interface WorkflowPhase {
  /** Phase identifier */
  id: string;
  /** Human-readable phase name */
  name: string;
  /** Steps in this phase */
  steps: WorkflowStep[];
  /** Whether this phase requires LLM judgment */
  requiresLlm?: boolean;
}

/**
 * A single step in a workflow.
 */
export type WorkflowStep =
  | CommandStep
  | TransformStep
  | LlmDecisionStep
  | ConditionalStep
  | LoopStep;

/**
 * Execute a bridge command.
 */
export interface CommandStep {
  type: 'command';
  /** Step identifier */
  id: string;
  /** Description of what this step does */
  description: string;
  /** Bridge command type */
  command: string;
  /** Payload template (can reference outputs from prior steps via ${stepId.field}) */
  payload?: Record<string, unknown>;
  /** Target node ID (can be a template reference) */
  target?: string;
  /** Store the result under this key for later steps */
  outputKey?: string;
  /** Use long-running timeout */
  longRunning?: boolean;
}

/**
 * Apply a deterministic transformation function.
 */
export interface TransformStep {
  type: 'transform';
  id: string;
  description: string;
  /** Name of the transform function to invoke */
  function: string;
  /** Input data (can reference prior step outputs) */
  input: Record<string, unknown>;
  /** Store the result under this key */
  outputKey: string;
}

/**
 * Step that requires LLM judgment to decide what to do.
 */
export interface LlmDecisionStep {
  type: 'llm-decision';
  id: string;
  description: string;
  /** Prompt template for the LLM */
  prompt: string;
  /** Available options the LLM can choose */
  options?: string[];
  /** Store the LLM's decision under this key */
  outputKey: string;
}

/**
 * Conditional step — execute one branch based on a condition.
 */
export interface ConditionalStep {
  type: 'conditional';
  id: string;
  description: string;
  /** Condition expression (references step outputs) */
  condition: string;
  /** Steps to execute if condition is true */
  thenSteps: WorkflowStep[];
  /** Steps to execute if condition is false */
  elseSteps?: WorkflowStep[];
}

/**
 * Loop step — repeat steps for each item in a collection.
 */
export interface LoopStep {
  type: 'loop';
  id: string;
  description: string;
  /** Reference to the collection to iterate over */
  collection: string;
  /** Variable name for the current item */
  itemVariable: string;
  /** Steps to execute for each item */
  steps: WorkflowStep[];
}

/**
 * Runtime context passed between steps.
 */
export interface WorkflowContext {
  /** Accumulated outputs from completed steps, keyed by outputKey */
  outputs: Record<string, unknown>;
  /** Workflow-level configuration */
  config: Record<string, unknown>;
  /** Whether the workflow has been cancelled */
  cancelled: boolean;
}
