/**
 * Workflow Registry: loads and manages workflow definitions.
 */

import type { WorkflowDefinition } from './workflow-schema.js';

// Import built-in workflow definitions
import { designSystemFromFile } from './definitions/design-system-from-file.js';
import { designSystemFromWebsite } from './definitions/design-system-from-website.js';
import { variableBinding } from './definitions/variable-binding.js';
import { engineeringHandoff } from './definitions/engineering-handoff.js';
import { figjamWorkflow } from './definitions/figjam-workflow.js';

const registry = new Map<string, WorkflowDefinition>();

// Register built-in workflows
const BUILT_IN: WorkflowDefinition[] = [
  designSystemFromFile,
  designSystemFromWebsite,
  variableBinding,
  engineeringHandoff,
  figjamWorkflow,
];

for (const workflow of BUILT_IN) {
  registry.set(workflow.id, workflow);
}

/**
 * Get a workflow by ID.
 */
export function getWorkflow(id: string): WorkflowDefinition | undefined {
  return registry.get(id);
}

/**
 * Register a custom workflow.
 */
export function registerWorkflow(workflow: WorkflowDefinition): void {
  registry.set(workflow.id, workflow);
}

/**
 * List all registered workflows.
 */
export function listWorkflows(): WorkflowDefinition[] {
  return Array.from(registry.values());
}

/**
 * Get workflow IDs.
 */
export function getWorkflowIds(): string[] {
  return Array.from(registry.keys());
}
