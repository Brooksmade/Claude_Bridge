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
import { componentCreator } from './definitions/component-creator.js';
import { layoutMaster } from './definitions/layout-master.js';
import { nomenclatureEnforcer } from './definitions/nomenclature-enforcer.js';
import { styleManager } from './definitions/style-manager.js';
import { typographySpecialist } from './definitions/typography-specialist.js';
import { effectsSpecialist } from './definitions/effects-specialist.js';
import { assetManager } from './definitions/asset-manager.js';
import { pageOrganizer } from './definitions/page-organizer.js';
import { figmaDocumentation } from './definitions/figma-documentation.js';
import { designSystemValidator } from './definitions/design-system-validator.js';
import { accessibilityAuditor } from './definitions/accessibility-auditor.js';
import { consistencyChecker } from './definitions/consistency-checker.js';
import { componentQa } from './definitions/component-qa.js';
import { designSystemOrchestrator } from './definitions/design-system-orchestrator.js';
import { componentLibraryOrchestrator } from './definitions/component-library-orchestrator.js';
import { designToDevOrchestrator } from './definitions/design-to-dev-orchestrator.js';
import { frameAnalyzerOrchestrator } from './definitions/frame-analyzer-orchestrator.js';
import { researchOrchestrator } from './definitions/research-orchestrator.js';
import { researchSynthesizer } from './definitions/research-synthesizer.js';
import { researchBriefGenerator } from './definitions/research-brief-generator.js';
import { uxResearcher } from './definitions/ux-researcher.js';
import { uxStrategist } from './definitions/ux-strategist.js';
import { figjamSynthesizer } from './definitions/figjam-synthesizer.js';
import { figjamWorkshopFacilitator } from './definitions/figjam-workshop-facilitator.js';
import { websiteToFigma } from './definitions/website-to-figma.js';
import { prototypeArchitect } from './definitions/prototype-architect.js';

const registry = new Map<string, WorkflowDefinition>();

// Register built-in workflows
const BUILT_IN: WorkflowDefinition[] = [
  // ── Core design system workflows ──
  designSystemFromFile,
  designSystemFromWebsite,
  variableBinding,
  engineeringHandoff,
  figjamWorkflow,

  // ── Figma-bridge specialists ──
  componentCreator,
  layoutMaster,
  nomenclatureEnforcer,
  styleManager,
  typographySpecialist,
  effectsSpecialist,
  assetManager,
  pageOrganizer,
  figmaDocumentation,

  // ── QA & validation ──
  designSystemValidator,
  accessibilityAuditor,
  consistencyChecker,
  componentQa,

  // ── Orchestrators ──
  designSystemOrchestrator,
  componentLibraryOrchestrator,
  designToDevOrchestrator,
  frameAnalyzerOrchestrator,

  // ── Research & UX ──
  researchOrchestrator,
  researchSynthesizer,
  researchBriefGenerator,
  uxResearcher,
  uxStrategist,

  // ── FigJam & capture ──
  figjamSynthesizer,
  figjamWorkshopFacilitator,
  websiteToFigma,
  prototypeArchitect,
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
