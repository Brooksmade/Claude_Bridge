import * as esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';

const isWatch = process.argv.includes('--watch');

// Build the main plugin code
async function buildCode() {
  const ctx = await esbuild.context({
    entryPoints: ['src/code.ts'],
    bundle: true,
    outfile: 'dist/code.js',
    format: 'iife',
    target: 'es6',
    logLevel: 'info',
  });

  if (isWatch) {
    await ctx.watch();
    console.log('Watching code.ts...');
  } else {
    await ctx.rebuild();
    await ctx.dispose();
  }
}

// Build the UI
async function buildUI() {
  const ctx = await esbuild.context({
    entryPoints: ['src/ui.ts'],
    bundle: true,
    outfile: 'dist/ui.js',
    format: 'iife',
    target: 'es6',
    logLevel: 'info',
  });

  if (isWatch) {
    await ctx.watch();
    console.log('Watching ui.ts...');
  } else {
    await ctx.rebuild();
    await ctx.dispose();
  }

  // Copy and process HTML file
  const htmlSrc = fs.readFileSync('src/ui.html', 'utf-8');
  const uiJs = fs.readFileSync('dist/ui.js', 'utf-8');

  // Inline the JS into HTML
  const htmlDist = htmlSrc.replace(
    '<script src="ui.js"></script>',
    `<script>${uiJs}</script>`
  );

  fs.writeFileSync('dist/ui.html', htmlDist);
}

// Copy manifest with version injected into name, and icon
function copyManifest() {
  // Read APP_VERSION from version.ts
  const versionSrc = fs.readFileSync('src/version.ts', 'utf-8');
  const match = versionSrc.match(/APP_VERSION\s*=\s*'([^']+)'/);
  const version = match ? match[1] : null;

  const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf-8'));
  if (version) {
    manifest.name = `Bridge to Fig v${version}`;
  }
  fs.writeFileSync('dist/manifest.json', JSON.stringify(manifest, null, 2));
  fs.copyFileSync('src/icon.svg', 'dist/icon.svg');
}

// Ensure dist directory exists
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

// Run builds
try {
  await buildCode();
  await buildUI();
  copyManifest();
  console.log('Build complete!');

  if (isWatch) {
    console.log('Watching for changes...');
  }
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
