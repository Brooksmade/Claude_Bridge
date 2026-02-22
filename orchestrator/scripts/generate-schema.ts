/**
 * CLI script to generate catalog.generated.json from the command catalog.
 * Run: pnpm run generate-schema
 */

import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateCatalog, validateCatalog } from '../src/schema/generator.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

console.log('Generating command catalog...');

// Validate first
const validation = validateCatalog();
if (!validation.valid) {
  console.error('Catalog validation failed:');
  for (const error of validation.errors) {
    console.error(`  - ${error}`);
  }
  process.exit(1);
}

// Generate
const catalog = generateCatalog();
const outputPath = resolve(__dirname, '../src/schema/catalog.generated.json');

writeFileSync(outputPath, JSON.stringify(catalog, null, 2), 'utf-8');

console.log(`Generated ${catalog.commandCount} commands → ${outputPath}`);
console.log('Validation passed.');
