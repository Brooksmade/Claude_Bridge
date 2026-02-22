/**
 * Example: Run a design system workflow using Claude API (no Claude Code needed).
 *
 * Prerequisites:
 *   - Bridge server running: cd bridge-server && pnpm dev
 *   - Figma plugin connected
 *   - ANTHROPIC_API_KEY environment variable set
 *
 * Run: npx tsx examples/claude-api-workflow.ts
 */

import {
  BridgeClient,
  createToolDefinitions,
  AnthropicAdapter,
  DESIGN_SYSTEM_GROUP,
  getWorkflow,
  executeWorkflow,
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

  // 3. Create tools for design system operations
  const tools = createToolDefinitions(client, {
    types: DESIGN_SYSTEM_GROUP.types,
  });
  console.log(`Registered ${tools.length} tools.`);

  // 4. Create Anthropic adapter
  const adapter = new AnthropicAdapter({
    model: 'claude-sonnet-4-6',
    maxTokens: 4096,
  });
  adapter.setTools(tools);

  // 5. Get the workflow definition
  const workflow = getWorkflow('design-system-from-file');
  if (!workflow) {
    console.error('Workflow not found.');
    process.exit(1);
  }

  // 6. Execute the workflow with Claude as the LLM handler
  console.log(`\nRunning workflow: ${workflow.name}`);
  console.log('Phases:', workflow.phases.map((p) => p.name).join(' → '));
  console.log('');

  const result = await executeWorkflow(workflow, {
    client,
    llmHandler: async (prompt) => {
      // Use Claude API for LLM decision steps
      const response = await adapter.run(prompt, {
        systemInstruction: workflow.systemInstruction,
        maxTurns: 5,
      });
      return response;
    },
    onStepComplete: (step, _result, _context) => {
      console.log(`  ✓ Step "${step.id}" completed`);
    },
    initialConfig: {
      // Override with your target frame if needed
      organizingPrinciple: 'four-level',
    },
  });

  console.log('\nWorkflow complete. Outputs:', Object.keys(result.outputs));
}

main().catch(console.error);
