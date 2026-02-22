/**
 * Example: Interactive chat session with Figma tools via Gemini (ADK).
 *
 * Prerequisites:
 *   - Bridge server running: cd bridge-server && pnpm dev
 *   - Figma plugin connected
 *   - GOOGLE_API_KEY environment variable set
 *
 * Run: npx tsx examples/adk-interactive.ts
 */

import { createInterface } from 'node:readline';
import {
  BridgeClient,
  createToolDefinitions,
  AdkAdapter,
  CORE_GROUP,
} from '../src/index.js';

async function main() {
  const client = new BridgeClient();

  const connected = await client.ping();
  if (!connected) {
    console.error('Bridge server or Figma plugin not connected.');
    process.exit(1);
  }
  console.log('Connected to Figma Bridge.\n');

  // Use core tools for general-purpose interaction
  const tools = createToolDefinitions(client, { types: CORE_GROUP.types });
  console.log(`${tools.length} tools available.`);

  const adapter = new AdkAdapter({ model: 'gemini-2.0-flash', bridgeClient: client });
  adapter.setTools(tools);

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const prompt = () => {
    rl.question('\nYou: ', async (input) => {
      const trimmed = input.trim();
      if (!trimmed || trimmed === 'exit' || trimmed === 'quit') {
        console.log('Goodbye!');
        rl.close();
        return;
      }

      try {
        const response = await adapter.run(trimmed, {
          systemInstruction:
            'You are a Figma design assistant. Use the available tools to help the user create, modify, and query designs in Figma. Be concise in your responses.',
          maxTurns: 10,
          onToolResult: (name, _res) => {
            console.log(`  [tool] ${name}`);
          },
        });
        console.log(`\nAssistant: ${response}`);
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : error);
      }

      prompt();
    });
  };

  console.log('\nType your message (or "exit" to quit):');
  prompt();
}

main().catch(console.error);
