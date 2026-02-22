/**
 * Example: Create a rectangle in Figma using OpenAI GPT-4o.
 *
 * Prerequisites:
 *   - Bridge server running: cd bridge-server && pnpm dev
 *   - Figma plugin connected
 *   - OPENAI_API_KEY environment variable set
 *
 * Run: npx tsx examples/openai-create-rectangle.ts
 */

import {
  BridgeClient,
  createToolDefinitions,
  OpenAIAdapter,
  CORE_GROUP,
} from '../src/index.js';

async function main() {
  // 1. Create bridge client
  const client = new BridgeClient();

  // 2. Verify connectivity
  const connected = await client.ping();
  if (!connected) {
    console.error('Bridge server or Figma plugin not connected. Is the server running?');
    process.exit(1);
  }
  console.log('Connected to Figma Bridge.');

  // 3. Create tools (core group only — ~25 tools)
  const tools = createToolDefinitions(client, { types: CORE_GROUP.types });
  console.log(`Registered ${tools.length} tools.`);

  // 4. Create OpenAI adapter
  const adapter = new OpenAIAdapter({ model: 'gpt-4o' });
  adapter.setTools(tools);

  // 5. Run conversation
  const result = await adapter.run(
    'Create a blue rectangle at position (100, 100) with size 200x150 and corner radius 8. Name it "My Rectangle".',
    {
      systemInstruction:
        'You are a Figma design assistant. Use the available tools to create and modify elements in Figma. Always confirm what you created.',
      onToolResult: (name, res) => {
        console.log(`  Tool: ${name} →`, JSON.stringify(res).slice(0, 100));
      },
    }
  );

  console.log('\nAssistant:', result);
}

main().catch(console.error);
