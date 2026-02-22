/**
 * Example: Create a design system using Google Gemini (ADK adapter).
 *
 * Prerequisites:
 *   - Bridge server running: cd bridge-server && pnpm dev
 *   - Figma plugin connected
 *   - GOOGLE_API_KEY environment variable set
 *
 * Run: npx tsx examples/adk-design-system.ts
 */

import {
  BridgeClient,
  createToolDefinitions,
  AdkAdapter,
  DESIGN_SYSTEM_GROUP,
  getWorkflow,
} from '../src/index.js';

async function main() {
  // 1. Create bridge client
  const client = new BridgeClient();

  // 2. Verify connectivity
  const connected = await client.ping();
  if (!connected) {
    console.error('Bridge server or Figma plugin not connected.');
    process.exit(1);
  }
  console.log('Connected to Figma Bridge.');

  // 3. Create tools
  const tools = createToolDefinitions(client, {
    types: DESIGN_SYSTEM_GROUP.types,
  });
  console.log(`Registered ${tools.length} tools.`);

  // 4. Create ADK adapter with bridge client (needed for workflows)
  const adapter = new AdkAdapter({
    model: 'gemini-2.0-flash',
    bridgeClient: client,
  });
  adapter.setTools(tools);

  // 5. Get the workflow
  const workflow = getWorkflow('design-system-from-file');
  if (!workflow) {
    console.error('Workflow not found.');
    process.exit(1);
  }

  // 6. Run the workflow via ADK
  console.log(`\nRunning workflow: ${workflow.name}`);
  console.log('Phases:', workflow.phases.map((p) => p.name).join(' → '));
  console.log('');

  const outputs = await adapter.runWorkflow(workflow, {
    organizingPrinciple: 'four-level',
  });

  console.log('\nWorkflow complete. Output keys:', Object.keys(outputs));
}

main().catch(console.error);
